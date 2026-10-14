import { WEAPONS, DEFAULT_WEAPON } from '../config/weapons.js';
import { CONTROL_MODES } from '../config/constants.js';
import { HINT_IDS } from '../config/hints.js';

const KEY = 'space-invaders-pro:save:v1';

const defaults = () => ({
  coins: 0,
  highScore: 0,
  bestWave: 0,
  unlocked: [DEFAULT_WEAPON],
  equipped: DEFAULT_WEAPON,
  settings: { controls: CONTROL_MODES[0], flash: true },
  seenHints: [],
});

class SaveManager {
  constructor() {
    this.data = defaults();
    this._timer = null;
  }

  load() {
    let raw = null;
    try {
      raw = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? 'null');
    } catch {
      raw = null; // corrupted save → start fresh
    }
    this.data = this.sanitize(raw);
    return this.data;
  }

  // Never trust stored data: unknown weapons, negative numbers, wrong types.
  sanitize(raw) {
    const d = defaults();
    if (!raw || typeof raw !== 'object') return d;
    const num = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
    d.coins = num(raw.coins);
    d.highScore = num(raw.highScore);
    d.bestWave = num(raw.bestWave);
    const unlocked = Array.isArray(raw.unlocked) ? raw.unlocked.filter((id) => Object.hasOwn(WEAPONS, id)) : [];
    d.unlocked = [...new Set([DEFAULT_WEAPON, ...unlocked])];
    d.equipped = d.unlocked.includes(raw.equipped) ? raw.equipped : DEFAULT_WEAPON;
    const st = raw.settings && typeof raw.settings === 'object' ? raw.settings : {};
    if (CONTROL_MODES.includes(st.controls)) d.settings.controls = st.controls;
    if (typeof st.flash === 'boolean') d.settings.flash = st.flash;
    const hints = Array.isArray(raw.seenHints) ? raw.seenHints.filter((id) => HINT_IDS.includes(id)) : [];
    d.seenHints = [...new Set(hints)];
    return d;
  }

  save() {
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify(this.data));
    } catch {
      /* private mode or quota exceeded: the game still works, progress just isn't kept */
    }
  }

  // Debounced write so collecting many coins doesn't hammer localStorage.
  scheduleSave() {
    if (this._timer) return;
    this._timer = setTimeout(() => {
      this._timer = null;
      this.save();
    }, 400);
    this._timer.unref?.();
  }

  addCoins(n) {
    this.data.coins += n;
    this.scheduleSave();
  }

  // Weapons are permanent unlocks. Buying also equips the new weapon.
  buyWeapon(id) {
    if (!Object.hasOwn(WEAPONS, id)) return { ok: false, reason: 'unknown' };
    if (this.data.unlocked.includes(id)) return { ok: false, reason: 'owned' };
    const price = WEAPONS[id].price;
    if (this.data.coins < price) return { ok: false, reason: 'poor' };
    this.data.coins -= price;
    this.data.unlocked.push(id);
    this.data.equipped = id;
    this.save();
    return { ok: true };
  }

  equipWeapon(id) {
    if (!this.data.unlocked.includes(id)) return false;
    this.data.equipped = id;
    this.save();
    return true;
  }

  setSetting(key, value) {
    if (!Object.hasOwn(this.data.settings, key)) return;
    if (key === 'controls' && !CONTROL_MODES.includes(value)) return;
    if (key === 'flash' && typeof value !== 'boolean') return;
    this.data.settings[key] = value;
    this.save();
  }

  // Called at every checkpoint (wave start, wave clear, pause, game over) so progress is never
  // lost if the tab is closed mid-run. Returns true when a record was raised.
  recordProgress({ score, wave }) {
    let raised = false;
    if (score > this.data.highScore) {
      this.data.highScore = score;
      raised = true;
    }
    if (wave > this.data.bestWave) {
      this.data.bestWave = wave;
      raised = true;
    }
    if (raised) this.save();
    return raised;
  }

  hasSeenHint(id) {
    return this.data.seenHints.includes(id);
  }

  markHint(id) {
    if (!HINT_IDS.includes(id) || this.hasSeenHint(id)) return;
    this.data.seenHints.push(id);
    this.save();
  }

  resetHints() {
    this.data.seenHints = [];
    this.save();
  }
}

export const Save = new SaveManager();
