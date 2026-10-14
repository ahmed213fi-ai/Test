import { W, H, GAME, POOL, DEV, PARTICLES, POWERUPS } from '../config/constants.js';
import { getWave, getBossWave } from '../config/waves.js';
import { WEAPON_ORDER } from '../config/weapons.js';
import { PICKUPS } from '../config/pickups.js';
import { Save } from '../systems/SaveManager.js';
import Background from '../systems/Background.js';
import Controls from '../systems/Controls.js';
import Formation from '../systems/Formation.js';
import Hints from '../systems/Hints.js';
import WeaponSystem from '../systems/WeaponSystem.js';
import Player from '../entities/Player.js';
import Alien from '../entities/Alien.js';
import Bullet from '../entities/Bullet.js';
import Pickup from '../entities/Pickup.js';
import Hud from '../ui/Hud.js';
import Button from '../ui/Button.js';

const DEV_WEAPON_KEYS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'];

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.state = 'intro';
    this.paused = false;
    this.score = 0;
    this.lives = GAME.STARTING_LIVES;
    this.wave = 1;
    this.runCoins = 0;
    this.startHigh = Save.data.highScore;
    this.bossActive = false;
    this.bossDefeated = false;

    this.background = new Background(this);
    this.createParticleSystems();
    this.player = new Player(this);
    this.createGroups();
    this.formation = new Formation(this.aliens, { blink: Save.data.settings.flash });
    this.weapons = new WeaponSystem(this.playerBullets);

    this.hud = new Hud(this);
    this.hud.setLives(this.lives);
    this.hud.setCoins(Save.data.coins);
    this.hud.setWeapon(this.weapons.weapon.name);
    this.hints = new Hints(this, this.hud);

    this.createInput();
    this.createCollisions();
    this.startWave(1);
  }

  update(time, delta) {
    const dt = Math.min(delta, GAME.MAX_DELTA_MS);
    this.background.update(dt);
    if (this.state === 'dying') return;

    const input = this.controls.read();
    this.player.steer(dt, input);
    this.player.tick(time);
    this.hints.onInput(input);
    this.hud.update(time, delta, this.player);
    if (this.state !== 'playing') return;

    this.weapons.update(dt, this.player, GAME.AUTO_FIRE || this.controls.fireHeld);
    this.formation.update(dt, this.alienBullets);

    if (this.formation.reachedBottom) {
      this.lives = 0;
      this.hud.setLives(0);
      this.createExplosion(this.player.x, this.player.y, PARTICLES.EXPLOSION_COUNT * 2);
      this.gameOver('invaded');
    }
  }

  createParticleSystems() {
    this.explosionParticles = this.add.particles(0, 0, 'explosion', {
      lifespan: 500,
      speed: { min: 50, max: 200 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
      blendMode: 'ADD',
    }).setDepth(15);

    this.sparkParticles = this.add.particles(0, 0, 'spark', {
      lifespan: { min: 200, max: 500 },
      speed: { min: 30, max: 150 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
      blendMode: 'ADD',
    }).setDepth(12);

    this.hitParticles = this.add.particles(0, 0, 'spark', {
      lifespan: 150,
      speed: { min: 20, max: 80 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.8, end: 0 },
      emitting: false,
      blendMode: 'ADD',
    }).setDepth(11);
  }

  createGroups() {
    this.playerBullets = this.physics.add.group({ classType: Bullet, maxSize: POOL.PLAYER_BULLETS, runChildUpdate: true });
    this.alienBullets = this.physics.add.group({ classType: Bullet, maxSize: POOL.ALIEN_BULLETS, runChildUpdate: true });
    this.pickups = this.physics.add.group({ classType: Pickup, maxSize: POOL.PICKUPS, runChildUpdate: true });
    this.aliens = this.physics.add.group({ classType: Alien, runChildUpdate: true });
  }

  createInput() {
    this.controls = new Controls(this, Save.data.settings.controls);
    const kb = this.input.keyboard;

    new Button(this, W / 2, 42, '||', () => this.pauseGame(), { width: 64, height: 36, fontSize: '18px', color: 0x9fe8ff });
    kb.on('keydown-P', () => this.pauseGame());
    kb.on('keydown-ESC', () => this.pauseGame());

    const autoPause = () => this.pauseGame();
    this.game.events.on('hidden', autoPause);
    this.game.events.on('blur', autoPause);
    this.events.once('shutdown', () => {
      this.game.events.off('hidden', autoPause);
      this.game.events.off('blur', autoPause);
    });
    this.events.on('resume', () => {
      this.paused = false;
      this.controls.release();
    });

    if (DEV) {
      WEAPON_ORDER.forEach((id, i) => {
        if (DEV_WEAPON_KEYS[i]) kb.on(`keydown-${DEV_WEAPON_KEYS[i]}`, () => this.equip(id));
      });
      this.hud.weaponText.setInteractive().on('pointerdown', () => this.cycleWeapon());
    }
  }

  createCollisions() {
    this.physics.add.overlap(this.playerBullets, this.aliens, this.onBulletHitAlien, null, this);
    this.physics.add.overlap(this.player, this.alienBullets, this.onAlienBulletHitPlayer, this.canHurtPlayer, this);
    this.physics.add.overlap(this.player, this.aliens, this.onAlienTouchPlayer, this.canHurtPlayer, this);
    this.physics.add.overlap(this.player, this.pickups, this.onPickup, null, this);
  }

  pauseGame() {
    if (this.paused || this.state === 'dying') return;
    this.paused = true;
    this.recordProgress();
    this.scene.launch('PauseScene', { score: this.score, wave: this.wave });
    this.scene.pause();
  }

  startWave(level) {
    this.wave = level;
    this.state = 'intro';
    this.bossActive = false;
    this.bossDefeated = false;
    this.recordProgress();

    let waveData;
    if (level % GAME.BOSS_EVERY === 0) {
      waveData = getBossWave(level);
      this.bossActive = true;
    } else {
      waveData = getWave(level);
    }

    this.formation.spawn(waveData);
    this.hud.setWave(level);
    this.hud.showBanner(this.bossActive ? `BOSS WAVE ${level}` : `WAVE ${level}`, GAME.INTRO_MS - 300);
    this.hints.onWaveStart(level);
    this.time.delayedCall(GAME.INTRO_MS, () => {
      if (this.state === 'intro') this.state = 'playing';
    });
  }

  onWaveCleared() {
    this.state = 'cleared';
    const bonus = GAME.WAVE_CLEAR_BONUS * this.wave;
    this.addScore(bonus);
    this.recordProgress();
    this.hud.showBanner(`${this.bossActive ? 'BOSS ' : ''}WAVE ${this.wave} CLEARED\n+${bonus}`, GAME.CLEAR_DELAY_MS - 300);

    this.alienBullets.getChildren().forEach((b) => { if (b.active) b.kill(); });
    this.pickups.getChildren().forEach((p) => { if (p.active) p.forceMagnet = true; });

    this.time.delayedCall(GAME.CLEAR_DELAY_MS, () => {
      if (this.state === 'cleared') this.startWave(this.wave + 1);
    });
  }

  onBulletHitAlien(bullet, alien) {
    if (!bullet.active || !alien.active || bullet.hitSet.has(alien)) return;
    bullet.hitSet.add(alien);

    const killed = alien.takeHit(bullet.damage, this.time.now);
    if (bullet.pierceLeft > 0) bullet.pierceLeft--;
    else bullet.kill();

    this.createHitEffect(alien.x, alien.y, bullet.isPlayerBullet ? 0x00ffff : 0xff4444);

    if (killed) this.killAlien(alien);
  }

  killAlien(alien) {
    const def = alien.def;
    this.addScore(def.points);
    this.hints.onKill(alien.x, alien.y, def.points);
    this.createExplosion(alien.x, alien.y, PARTICLES.EXPLOSION_COUNT);

    const dropChance = def.coinChance + (this.bossActive ? 0.5 : 0);
    if (Math.random() < dropChance) this.dropPickup(alien.x, alien.y, 'coin', def.coinValue);

    if (Math.random() < GAME.POWERUP_DROP_CHANCE && !this.bossActive) {
      const powerupTypes = ['shield', 'rapid', 'spread', 'life'];
      const type = Phaser.Math.RND.pick(powerupTypes);
      this.dropPickup(alien.x, alien.y, type, 0);
    }

    if (this.bossActive && alien.isBoss) {
      this.bossDefeated = true;
      for (let i = 0; i < 5; i++) {
        this.dropPickup(alien.x + Phaser.Math.Between(-30, 30), alien.y + Phaser.Math.Between(-20, 20), 'coin', 10);
      }
      this.dropPickup(alien.x, alien.y, 'life', 0);
    }

    alien.kill();
    this.formation.onAlienRemoved();
    if (this.formation.alive === 0) this.onWaveCleared();
  }

  canHurtPlayer() {
    return this.state !== 'dying' && !this.player.isInvulnerable(this.time.now);
  }

  onAlienBulletHitPlayer(player, bullet) {
    bullet.kill();
    this.damagePlayer('bullet');
  }

  onAlienTouchPlayer() {
    this.damagePlayer('collision');
  }

  damagePlayer(cause) {
    if (this.player.shieldActive) return;
    this.lives--;
    this.hud.setLives(Math.max(this.lives, 0));
    this.cameras.main.shake(200, 0.015);

    if (this.lives <= 0) {
      this.createExplosion(this.player.x, this.player.y, PARTICLES.EXPLOSION_COUNT * 3);
      this.gameOver(cause);
    } else {
      this.createExplosion(this.player.x, this.player.y, 14);
      this.player.invulnUntil = this.time.now + GAME.INVULN_MS;
    }
  }

  onPickup(player, pickup) {
    if (!pickup.active) return;
    pickup.def.collect(this, pickup.value);
    this.hints.onPickup(pickup.kind);
    this.hud.pop(pickup.x, pickup.y - 10, this.getPickupLabel(pickup.kind), pickup.def.color);
    this.createPickupEffect(pickup.x, pickup.y, pickup.def.color);
    pickup.kill();
  }

  getPickupLabel(kind) {
    const labels = { coin: '+1', shield: 'SHIELD', rapid: 'RAPID', spread: 'SPREAD', life: '+1 LIFE' };
    return labels[kind] || '+1';
  }

  activatePowerup(type) {
    const def = POWERUPS[type];
    if (!def) return;
    switch (type) {
      case 'shield':
        this.player.activateShield(def.duration);
        break;
      case 'rapid':
        this.player.activatePowerup('rapid', def.duration);
        break;
      case 'spread':
        this.player.activatePowerup('spread', def.duration);
        break;
      case 'life':
        if (this.lives < 5) {
          this.lives++;
          this.hud.setLives(this.lives);
        }
        break;
    }
  }

  dropPickup(x, y, kind, value) {
    if (!Object.hasOwn(PICKUPS, kind)) return;
    const p = this.pickups.get(x, y);
    if (p) p.spawn(x, y, kind, value, this.player);
  }

  createExplosion(x, y, count) {
    this.explosionParticles.explode(Math.min(count, 8), x, y);
    this.sparkParticles.explode(count, x, y);
    this.cameras.main.shake(100, 0.008);
  }

  createHitEffect(x, y, color) {
    this.hitParticles.setTint(color);
    this.hitParticles.explode(6, x, y);
  }

  createPickupEffect(x, y, color) {
    const particles = this.add.particles(0, 0, 'spark', {
      lifespan: 400,
      speed: { min: 20, max: 60 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: color,
      emitting: false,
      blendMode: 'ADD',
    }).setDepth(15);
    particles.explode(12, x, y);
    this.time.delayedCall(500, () => particles.destroy());
  }

  addCoins(n) {
    this.runCoins += n;
    Save.addCoins(n);
    this.hud.setCoins(Save.data.coins);
  }

  addScore(n) {
    this.score += n;
    this.hud.setScore(this.score);
  }

  recordProgress() {
    Save.recordProgress({ score: this.score, wave: this.wave });
  }

  cycleWeapon() {
    const i = WEAPON_ORDER.indexOf(this.weapons.weapon.id);
    this.equip(WEAPON_ORDER[(i + 1) % WEAPON_ORDER.length]);
  }

  equip(id) {
    this.weapons.setWeapon(id);
    this.hud.setWeapon(this.weapons.weapon.name);
  }

  gameOver(cause) {
    if (this.state === 'dying') return;
    this.state = 'dying';
    this.player.disableBody(true, true);
    this.recordProgress();
    const newHigh = this.score > this.startHigh;
    this.time.delayedCall(GAME.DEATH_DELAY_MS, () => {
      this.scene.start('GameOverScene', { score: this.score, wave: this.wave, coins: this.runCoins, newHigh, cause });
    });
  }
}