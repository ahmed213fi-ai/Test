// Pure-logic tests: no Phaser, no browser. Run with `npm test`.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { getWave, isBossWave } from '../src/config/waves.js';
import { ENEMIES } from '../src/config/enemies.js';
import { WEAPONS, WEAPON_ORDER, getWeapon, DEFAULT_WEAPON } from '../src/config/weapons.js';
import { GAME, FORMATION, PLAYER, W, H, CONTROL_MODES } from '../src/config/constants.js';
import { stickVector, clampToRadius, keyboardVector, stepPosition, clamp } from '../src/systems/joystickMath.js';
import { Save } from '../src/systems/SaveManager.js';
import { HINT_IDS, moveHint } from '../src/config/hints.js';
import { cardState, statLine } from '../src/systems/Shop.js';
import { steerToward, nearestActive, normalizeAngle } from '../src/systems/homing.js';

// In-memory localStorage
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const saveKey = () => [...store.keys()][0];

beforeEach(() => {
  store.clear();
  Save.load();
});

// ── waves ──────────────────────────────────────────────────────────────────

test('every wave has a valid layout with the strongest enemies on top', () => {
  for (let level = 1; level <= 40; level++) {
    const w = getWave(level);
    assert.equal(w.layout.length, w.rows, `level ${level}: layout length`);
    const hps = w.layout.map((t) => {
      assert.ok(ENEMIES[t], `level ${level}: unknown enemy ${t}`);
      return ENEMIES[t].hp;
    });
    for (let i = 1; i < hps.length; i++) assert.ok(hps[i] <= hps[i - 1], `level ${level}: row ${i} stronger than row ${i - 1}`);
    assert.ok(w.layout.includes('drone'), `level ${level}: no drone row`);
  }
});

test('difficulty never gets easier as levels rise', () => {
  let prev = getWave(1);
  for (let level = 2; level <= 40; level++) {
    const w = getWave(level);
    assert.ok(w.stepInterval <= prev.stepInterval);
    assert.ok(w.fireInterval <= prev.fireInterval);
    assert.ok(w.alienBulletSpeed >= prev.alienBulletSpeed);
    assert.ok(w.volley >= prev.volley && w.volley <= 3);
    prev = w;
  }
});

test('the formation always has room to descend before the lose line', () => {
  for (let level = 1; level <= 40; level++) {
    const w = getWave(level);
    const lastRowY = w.startY + (w.rows - 1) * FORMATION.CELL_H;
    assert.ok((FORMATION.LOSE_Y - lastRowY) / FORMATION.STEP_DY > 5, `level ${level}`);
  }
});

test('boss waves follow GAME.BOSS_EVERY', () => {
  assert.equal(isBossWave(GAME.BOSS_EVERY), true);
  assert.equal(isBossWave(GAME.BOSS_EVERY - 1), false);
  assert.equal(isBossWave(GAME.BOSS_EVERY * 2), true);
  assert.equal(getWave(GAME.BOSS_EVERY).boss, true);
});

// ── weapons ────────────────────────────────────────────────────────────────

test('weapon definitions are complete and consistent', () => {
  for (const [key, w] of Object.entries(WEAPONS)) {
    assert.equal(w.id, key);
    for (const f of ['cooldown', 'damage', 'speed', 'count']) assert.ok(w[f] > 0, `${key}.${f}`);
    assert.ok(w.pierce >= 0 && w.spreadDeg >= 0 && w.price >= 0, key);
    assert.ok(w.count === 1 || w.spreadDeg > 0, `${key}: multi-shot needs spread`);
    assert.ok(w.homing >= 0 && w.lifetime >= 0, `${key}: homing/lifetime`);
    assert.ok(w.homing === 0 || w.lifetime > 0, `${key}: a homing weapon needs a lifetime so it can't orbit forever`);
    assert.ok(typeof w.description === 'string' && w.description.length > 0 && w.description.length <= 32, `${key}: description fits the card`);
    assert.ok(w.name.length <= 16, `${key}: name fits the card`);
  }
  assert.equal(WEAPONS[DEFAULT_WEAPON].price, 0);
});

test('getWeapon falls back to the default for unknown or inherited keys', () => {
  assert.equal(getWeapon('nope').id, DEFAULT_WEAPON);
  assert.equal(getWeapon('toString').id, DEFAULT_WEAPON);
  assert.equal(getWeapon('laser').id, 'laser');
});

// ── save ───────────────────────────────────────────────────────────────────

test('fresh save has sane defaults', () => {
  assert.deepEqual(Save.data, {
    coins: 0, highScore: 0, bestWave: 0, unlocked: [DEFAULT_WEAPON], equipped: DEFAULT_WEAPON,
    settings: { controls: 'floating', flash: true },
    seenHints: [],
  });
});

test('corrupted JSON falls back to defaults instead of crashing', () => {
  store.set('space-invaders-pro:save:v1', '{not json');
  assert.equal(Save.load().coins, 0);
});

test('tampered or invalid data is sanitised', () => {
  store.set('space-invaders-pro:save:v1', JSON.stringify({
    coins: -50, highScore: 'lots', bestWave: 7.9,
    unlocked: ['spread', 'rocket-launcher', 'toString'], equipped: 'rocket-launcher',
  }));
  const d = Save.load();
  assert.equal(d.coins, 0);
  assert.equal(d.highScore, 0);
  assert.equal(d.bestWave, 7);
  assert.deepEqual(d.unlocked, [DEFAULT_WEAPON, 'spread']);
  assert.equal(d.equipped, DEFAULT_WEAPON);
});

test('equipped weapon is kept only when it is unlocked', () => {
  store.set('space-invaders-pro:save:v1', JSON.stringify({ unlocked: ['spread'], equipped: 'spread' }));
  assert.equal(Save.load().equipped, 'spread');
  store.set('space-invaders-pro:save:v1', JSON.stringify({ unlocked: [], equipped: 'laser' }));
  assert.equal(Save.load().equipped, DEFAULT_WEAPON);
});

test('progress survives a save → load round trip', () => {
  Save.addCoins(12);
  Save.recordProgress({ score: 500, wave: 3 });
  const key = saveKey();
  assert.ok(key, 'something was written');
  Save.data = { coins: 0, highScore: 0, bestWave: 0, unlocked: [], equipped: 'x', settings: {}, seenHints: ['x'] }; // wipe memory
  Save.load();
  assert.equal(Save.data.coins, 12);
  assert.equal(Save.data.highScore, 500);
  assert.equal(Save.data.bestWave, 3);
});

test('recordProgress raises records, never lowers them, and saves immediately', () => {
  assert.equal(Save.recordProgress({ score: 0, wave: 0 }), false, 'nothing to record');
  assert.equal(Save.recordProgress({ score: 300, wave: 2 }), true);
  assert.equal(Save.recordProgress({ score: 300, wave: 2 }), false, 'same values: no change');
  assert.equal(Save.recordProgress({ score: 100, wave: 1 }), false, 'lower values are ignored');
  assert.equal(Save.recordProgress({ score: 50, wave: 5 }), true, 'wave and score are independent');
  assert.equal(Save.data.highScore, 300);
  assert.equal(Save.data.bestWave, 5);
  const stored = JSON.parse(store.get('space-invaders-pro:save:v1'));
  assert.equal(stored.highScore, 300, 'written to storage right away, not only at game over');
  assert.equal(stored.bestWave, 5);
});

test('save() does not throw when storage is unavailable', () => {
  const real = globalThis.localStorage;
  globalThis.localStorage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); } };
  assert.doesNotThrow(() => { Save.load(); Save.save(); });
  globalThis.localStorage = real;
});

// ── alien bullet speed (15% slower) ────────────────────────────────────────

test('alien bullets are 15% slower than the base curve and still ramp up', () => {
  assert.equal(GAME.ALIEN_BULLET_SPEED_MULT, 0.85);
  assert.equal(getWave(1).alienBulletSpeed, Math.round(180 * 0.85));      // 153
  assert.equal(getWave(40).alienBulletSpeed, Math.round(320 * 0.85));     // 272 (cap)
  assert.ok(getWave(10).alienBulletSpeed > getWave(1).alienBulletSpeed);
});

// ── settings ───────────────────────────────────────────────────────────────

test('settings: invalid values fall back to defaults, valid ones are kept', () => {
  store.set('space-invaders-pro:save:v1', JSON.stringify({ settings: { controls: 'telepathy', flash: 'yes' } }));
  assert.deepEqual(Save.load().settings, { controls: 'floating', flash: true });
  store.set('space-invaders-pro:save:v1', JSON.stringify({ settings: { controls: 'drag', flash: false } }));
  assert.deepEqual(Save.load().settings, { controls: 'drag', flash: false });
  store.set('space-invaders-pro:save:v1', JSON.stringify({ settings: 'garbage' }));
  assert.deepEqual(Save.load().settings, { controls: 'floating', flash: true });
});

test('a v2 save without settings still loads', () => {
  store.set('space-invaders-pro:save:v1', JSON.stringify({ coins: 40, highScore: 900, bestWave: 4, unlocked: ['blaster'], equipped: 'blaster' }));
  const d = Save.load();
  assert.equal(d.coins, 40);
  assert.deepEqual(d.settings, { controls: 'floating', flash: true });
});

test('setSetting validates input and persists', () => {
  for (const mode of CONTROL_MODES) {
    Save.setSetting('controls', mode);
    assert.equal(Save.data.settings.controls, mode);
  }
  Save.setSetting('controls', 'nope');
  assert.equal(Save.data.settings.controls, CONTROL_MODES.at(-1), 'invalid mode ignored');
  Save.setSetting('flash', 'maybe');
  assert.equal(Save.data.settings.flash, true, 'non-boolean ignored');
  Save.setSetting('hacked', 1);
  assert.equal(Object.hasOwn(Save.data.settings, 'hacked'), false, 'unknown key ignored');
  Save.setSetting('flash', false);
  Save.load();
  assert.equal(Save.data.settings.flash, false, 'survives reload');
});

// ── movement & joystick math ───────────────────────────────────────────────

test('stick: deadzone, full deflection, direction and magnitude cap', () => {
  const o = { x: 9, y: 9 };
  assert.deepEqual(stickVector(0, 0, 54, 0.12, o), { x: 0, y: 0 });
  assert.deepEqual(stickVector(3, 3, 54, 0.12, o), { x: 0, y: 0 }, 'inside deadzone');
  stickVector(54, 0, 54, 0.12, o);
  assert.ok(Math.abs(o.x - 1) < 1e-9 && o.y === 0, 'full right');
  stickVector(500, 0, 54, 0.12, o);
  assert.ok(Math.abs(o.x - 1) < 1e-9, 'pushing past the radius is capped at 1');
  stickVector(-30, -40, 100, 0.12, o);
  assert.ok(o.x < 0 && o.y < 0 && Math.abs(o.x / o.y - 0.75) < 1e-9, 'direction preserved');
  assert.ok(Math.hypot(o.x, o.y) <= 1);
  // continuity at the deadzone edge: no jump from 0 to a large value
  stickVector(54 * 0.12 + 0.001, 0, 54, 0.12, o);
  assert.ok(o.x < 0.01);
});

test('thumb position is limited to the stick radius', () => {
  const o = { x: 0, y: 0 };
  clampToRadius(30, 40, 100, o);
  assert.deepEqual(o, { x: 30, y: 40 });
  clampToRadius(300, 400, 100, o);
  assert.ok(Math.abs(Math.hypot(o.x, o.y) - 100) < 1e-9);
});

test('keyboard diagonals are not faster than straight lines', () => {
  const o = { x: 0, y: 0 };
  keyboardVector(false, true, false, false, o);
  assert.equal(Math.hypot(o.x, o.y), 1);
  keyboardVector(false, true, true, false, o);
  assert.ok(Math.abs(Math.hypot(o.x, o.y) - 1) < 1e-9);
  keyboardVector(true, true, false, false, o);
  assert.deepEqual(o, { x: 0, y: 0 }, 'opposite keys cancel');
});

test('ship stays inside the screen and inside the bottom third', () => {
  const out = { x: 0, y: 0 };
  const none = { x: 0, y: 0, moveX: 0, moveY: 0 };
  assert.equal(PLAYER.MIN_Y, Math.round((H * 2) / 3));

  stepPosition(W / 2, PLAYER.MIN_Y, { ...none, y: -1 }, 1000, out);
  assert.equal(out.y, PLAYER.MIN_Y, 'cannot go above the bottom third');
  stepPosition(W / 2, PLAYER.MAX_Y, { ...none, y: 1 }, 1000, out);
  assert.equal(out.y, PLAYER.MAX_Y, 'cannot leave the bottom');
  stepPosition(PLAYER.MARGIN, 500, { ...none, x: -1 }, 1000, out);
  assert.equal(out.x, PLAYER.MARGIN);
  stepPosition(W - PLAYER.MARGIN, 500, { ...none, x: 1 }, 1000, out);
  assert.equal(out.x, W - PLAYER.MARGIN);

  stepPosition(200, 500, { ...none, x: 1 }, 100, out);
  assert.ok(Math.abs(out.x - (200 + PLAYER.SPEED * 0.1)) < 1e-9, 'speed = SPEED px/s');
  stepPosition(200, 500, { ...none, moveX: 25, moveY: -30 }, 16, out);
  assert.deepEqual(out, { x: 225, y: 470 }, 'drag deltas apply 1:1');
  stepPosition(200, 500, { ...none, moveY: -9999 }, 16, out);
  assert.equal(out.y, PLAYER.MIN_Y, 'drag is clamped too');
});

test('clamp helper', () => {
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp(-5, 0, 3), 0);
  assert.equal(clamp(2, 0, 3), 2);
});

// ── shop ───────────────────────────────────────────────────────────────────

test('there are four weapons with strictly increasing prices (the first is free)', () => {
  assert.equal(WEAPON_ORDER.length, 4);
  assert.equal(WEAPONS[WEAPON_ORDER[0]].price, 0);
  for (let i = 1; i < WEAPON_ORDER.length; i++) {
    assert.ok(WEAPONS[WEAPON_ORDER[i]].price > WEAPONS[WEAPON_ORDER[i - 1]].price, WEAPON_ORDER[i]);
  }
});

test('buying: not enough coins, success, double purchase, unknown id', () => {
  const price = WEAPONS.spread.price;
  Save.data.coins = price - 1;
  assert.deepEqual(Save.buyWeapon('spread'), { ok: false, reason: 'poor' });
  assert.equal(Save.data.coins, price - 1, 'nothing was charged');
  assert.equal(Save.data.unlocked.includes('spread'), false);

  Save.data.coins = price + 25;
  assert.deepEqual(Save.buyWeapon('spread'), { ok: true });
  assert.equal(Save.data.coins, 25, 'exact price charged');
  assert.ok(Save.data.unlocked.includes('spread'));
  assert.equal(Save.data.equipped, 'spread', 'buying equips');

  assert.deepEqual(Save.buyWeapon('spread'), { ok: false, reason: 'owned' });
  assert.equal(Save.data.coins, 25, 'no double charge');
  assert.deepEqual(Save.buyWeapon('rocket-launcher'), { ok: false, reason: 'unknown' });
  assert.deepEqual(Save.buyWeapon('toString'), { ok: false, reason: 'unknown' });
});

test('equipping works only for owned weapons', () => {
  assert.equal(Save.equipWeapon('laser'), false);
  assert.equal(Save.data.equipped, DEFAULT_WEAPON);
  Save.data.coins = 5000;
  Save.buyWeapon('laser');
  assert.equal(Save.equipWeapon(DEFAULT_WEAPON), true);
  assert.equal(Save.data.equipped, DEFAULT_WEAPON);
  assert.equal(Save.equipWeapon('laser'), true);
  assert.equal(Save.data.equipped, 'laser');
});

test('purchases survive a reload and coins never go negative', () => {
  Save.data.coins = WEAPONS.laser.price;
  Save.buyWeapon('laser');
  Save.load();
  assert.ok(Save.data.unlocked.includes('laser'));
  assert.equal(Save.data.equipped, 'laser');
  assert.equal(Save.data.coins, 0);
  for (const id of WEAPON_ORDER) { Save.buyWeapon(id); assert.ok(Save.data.coins >= 0); }
});

test('armory card state follows ownership and funds', () => {
  const data = { coins: 0, unlocked: ['blaster'], equipped: 'blaster' };
  assert.deepEqual(cardState('blaster', data), { kind: 'equipped', label: 'EQUIPPED', enabled: true });
  assert.deepEqual(cardState('spread', data), { kind: 'locked', label: `BUY ${WEAPONS.spread.price}`, enabled: false });
  data.coins = WEAPONS.spread.price;
  assert.deepEqual(cardState('spread', data), { kind: 'buy', label: `BUY ${WEAPONS.spread.price}`, enabled: true });
  data.unlocked.push('spread');
  assert.deepEqual(cardState('spread', data), { kind: 'owned', label: 'EQUIP', enabled: true });
  data.equipped = 'spread';
  assert.equal(cardState('spread', data).kind, 'equipped');
  assert.equal(cardState('blaster', data).kind, 'owned');
});

test('stat lines describe each weapon', () => {
  assert.equal(statLine(WEAPONS.blaster), 'DMG 1  RATE 2.5/s');
  assert.equal(statLine(WEAPONS.spread), 'DMG 1 x3  RATE 1.9/s');
  assert.equal(statLine(WEAPONS.laser), 'DMG 2  RATE 1.5/s  PIERCE 3');
  assert.equal(statLine(WEAPONS.missile), 'DMG 3  RATE 1.1/s  HOMING');
  for (const id of WEAPON_ORDER) assert.ok(statLine(WEAPONS[id]).length <= 34, `${id} stat line fits the card`);
});

// ── homing ─────────────────────────────────────────────────────────────────

test('angles wrap to the shortest turn', () => {
  assert.ok(Math.abs(normalizeAngle(3 * Math.PI) - Math.PI) < 1e-9);
  assert.ok(Math.abs(normalizeAngle(-3 * Math.PI) + Math.PI) < 1e-9);
  assert.equal(normalizeAngle(0.5), 0.5);
});

test('steering turns toward the target at a limited rate and keeps its speed', () => {
  const out = { vx: 0, vy: 0 };
  // flying up (vy<0), target to the right: must turn clockwise (toward +x) but by at most maxTurn
  steerToward(0, -300, 100, 100, 300, 100, 0.1, 300, out);
  assert.ok(out.vx > 0, 'turned toward the target');
  assert.ok(Math.abs(Math.hypot(out.vx, out.vy) - 300) < 1e-9, 'speed unchanged');
  const turned = Math.abs(Math.atan2(out.vy, out.vx) - Math.atan2(-300, 0));
  assert.ok(Math.abs(turned - 0.1) < 1e-9, 'turned exactly maxTurn');
  // target dead ahead: no turn
  steerToward(0, -300, 100, 100, 100, 0, 0.5, 300, out);
  assert.ok(Math.abs(out.vx) < 1e-9 && out.vy < 0);
  // target behind (crossing ±π): still takes the short way, no spin
  steerToward(-300, 0.0001, 100, 100, 200, 100.0001, 0.2, 300, out);
  assert.ok(Math.hypot(out.vx, out.vy) > 299);
});

test('a missile homing on a stationary target reaches it', () => {
  let x = 240, y = 600, vx = 0, vy = -300;
  const out = { vx: 0, vy: 0 };
  let hit = false;
  for (let i = 0; i < 300 && !hit; i++) {            // 300 frames @60fps = 5s
    steerToward(vx, vy, x, y, 400, 150, 4 / 60, 300, out);
    vx = out.vx; vy = out.vy; x += vx / 60; y += vy / 60;
    hit = Math.hypot(400 - x, 150 - y) < 12;
  }
  assert.ok(hit, 'missile reached an off-axis target within its lifetime');
});

test('nearestActive ignores inactive entries and handles empty lists', () => {
  const list = [{ x: 10, y: 10, active: false }, { x: 100, y: 100, active: true }, { x: 300, y: 50, active: true }];
  assert.equal(nearestActive(list, 0, 0), list[1]);
  assert.equal(nearestActive(list, 290, 60), list[2]);
  assert.equal(nearestActive([], 0, 0), null);
  assert.equal(nearestActive([{ x: 1, y: 1, active: false }], 0, 0), null);
});

// ── first-run hints ────────────────────────────────────────────────────────

test('hints: mark once, validate ids, persist, reset', () => {
  assert.equal(Save.hasSeenHint('move'), false);
  Save.markHint('move');
  Save.markHint('move');
  assert.deepEqual(Save.data.seenHints, ['move'], 'no duplicates');
  Save.markHint('not-a-hint');
  Save.markHint('toString');
  assert.deepEqual(Save.data.seenHints, ['move'], 'unknown ids are ignored');
  Save.load();
  assert.equal(Save.hasSeenHint('move'), true, 'survives reload');
  Save.resetHints();
  Save.load();
  assert.deepEqual(Save.data.seenHints, []);
});

test('hints: tampered save data is cleaned', () => {
  store.set('space-invaders-pro:save:v1', JSON.stringify({ seenHints: ['kill', 'kill', 'bogus', 42, null, 'coin'] }));
  assert.deepEqual(Save.load().seenHints, ['kill', 'coin']);
  store.set('space-invaders-pro:save:v1', JSON.stringify({ seenHints: 'move' }));
  assert.deepEqual(Save.load().seenHints, []);
  store.set('space-invaders-pro:save:v1', JSON.stringify({ coins: 5 }));
  assert.deepEqual(Save.load().seenHints, [], 'older saves without hints still load');
});

test('the movement hint matches the device and the control mode', () => {
  assert.match(moveHint(false, 'floating'), /Arrow keys or WASD/);
  assert.match(moveHint(false, 'drag'), /Arrow keys or WASD/, 'a mouse/keyboard machine always gets the keyboard hint');
  assert.match(moveHint(true, 'floating'), /Hold the lower half/);
  assert.match(moveHint(true, 'fixed'), /bottom-left/);
  assert.match(moveHint(true, 'drag'), /Slide your finger/);
  for (const t of [true, false]) for (const m of CONTROL_MODES) {
    const lines = moveHint(t, m).split('\n');
    assert.ok(lines.length <= 2 && lines.every((l) => l.length <= 40), `${t}/${m}: fits on the screen`);
  }
  assert.deepEqual(HINT_IDS, ['move', 'kill', 'coin']);
});

test('death → game over is fast', () => {
  assert.ok(GAME.DEATH_DELAY_MS <= 700);
});
