import { W, FORMATION, ALIEN_BULLET_TINT } from '../config/constants.js';

export default class Formation {
  constructor(group, { blink = true } = {}) {
    this.group = group;
    this.blink = blink;
    this.alive = 0;
    this.total = 0;
    this.reachedBottom = false;
    this.shooters = [];
    this.isBossWave = false;
    this.boss = null;
    this.bossPhase = 0;
    this.bossTimer = 0;
  }

  spawn(wave) {
    this.wave = wave;
    this.dir = 1;
    this.stepTimer = 0;
    this.fireTimer = 0;
    this.reachedBottom = false;
    this.isBossWave = wave.boss || false;
    this.boss = null;
    this.bossPhase = 0;
    this.bossTimer = 0;
    this.total = wave.rows * wave.cols;
    this.alive = this.total;
    this.stepInterval = wave.stepInterval;
    this.bottoms = new Array(wave.cols).fill(null);

    if (this.isBossWave) {
      const alien = this.group.get(0, 0, 'boss');
      alien.spawn(W / 2, wave.startY, 'boss', 0);
      this.boss = alien;
      this.total = 1;
      this.alive = 1;
    } else {
      const startX = (W - (wave.cols - 1) * FORMATION.CELL_W) / 2;
      for (let r = 0; r < wave.rows; r++) {
        for (let c = 0; c < wave.cols; c++) {
          const alien = this.group.get(0, 0, 'alienA');
          alien.spawn(startX + c * FORMATION.CELL_W, wave.startY + r * FORMATION.CELL_H, wave.layout[r], c);
        }
      }
    }
  }

  onAlienRemoved() {
    this.alive--;
  }

  update(dtMs, alienBullets) {
    if (this.isBossWave && this.boss && this.boss.active) {
      this.updateBoss(dtMs, alienBullets);
    } else {
      this.stepTimer += dtMs;
      if (this.stepTimer >= this.stepInterval) {
        this.stepTimer = 0;
        this.step();
      }
    }
    this.fireTimer += dtMs;
    if (this.fireTimer >= this.wave.fireInterval) {
      this.fireTimer = 0;
      this.volley(alienBullets);
    }
  }

  updateBoss(dtMs, alienBullets) {
    this.bossTimer += dtMs;
    const phaseDuration = 3000;
    const phase = Math.floor(this.bossTimer / phaseDuration) % 4;

    if (phase !== this.bossPhase) {
      this.bossPhase = phase;
    }

    const amplitude = 80;
    const speed = 0.0015;
    this.boss.x = W / 2 + Math.sin(this.bossTimer * speed) * amplitude;

    if (this.boss.y < 150) {
      this.boss.y += 0.3 * dtMs;
    }

    if (this.boss.y > FORMATION.LOSE_Y) this.reachedBottom = true;
  }

  step() {
    if (this.isBossWave) return;

    const aliens = this.group.getChildren();
    const dx = FORMATION.STEP_DX * this.dir;

    let hitWall = false;
    for (const a of aliens) {
      if (!a.active) continue;
      const nx = a.x + dx;
      if (nx < FORMATION.WALL_MARGIN || nx > W - FORMATION.WALL_MARGIN) { hitWall = true; break; }
    }

    for (const a of aliens) {
      if (!a.active) continue;
      if (hitWall) a.y += FORMATION.STEP_DY;
      else a.x += dx;
      if (a.y > FORMATION.LOSE_Y) this.reachedBottom = true;
    }
    if (hitWall) this.dir *= -1;

    const ratio = this.alive / this.total;
    this.stepInterval = this.wave.stepInterval * Math.max(FORMATION.MIN_SPEED_RATIO, ratio);
  }

  volley(alienBullets) {
    if (this.isBossWave && this.boss && this.boss.active) {
      this.bossVolley(alienBullets);
      return;
    }

    const bottoms = this.bottoms;
    bottoms.fill(null);
    for (const a of this.group.getChildren()) {
      if (!a.active) continue;
      const cur = bottoms[a.col];
      if (!cur || a.y > cur.y) bottoms[a.col] = a;
    }

    const shooters = this.shooters;
    shooters.length = 0;
    for (const b of bottoms) if (b) shooters.push(b);
    Phaser.Utils.Array.Shuffle(shooters);

    const n = Math.min(this.wave.volley, shooters.length);
    for (let i = 0; i < n; i++) {
      const s = shooters[i];
      const bullet = alienBullets.get(s.x, s.y + 16);
      if (!bullet) return;
      bullet.fire(s.x, s.y + 16, 0, this.wave.alienBulletSpeed, { texture: 'alienBullet', tint: ALIEN_BULLET_TINT, blink: this.blink });
    }
  }

  bossVolley(alienBullets) {
    const patterns = [
      () => this.bossCircle(alienBullets, 8),
      () => this.bossSpread(alienBullets, 5),
      () => this.bossTargeted(alienBullets, 3),
      () => this.bossRapid(alienBullets, 6),
    ];
    patterns[this.bossPhase](alienBullets);
  }

  bossCircle(alienBullets, count) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const bullet = alienBullets.get(this.boss.x, this.boss.y + 20);
      if (!bullet) return;
      bullet.fire(this.boss.x, this.boss.y + 20, Math.sin(angle) * 180, Math.cos(angle) * 180, { texture: 'alienBullet', tint: 0xff0088, blink: this.blink });
    }
  }

  bossSpread(alienBullets, count) {
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.DegToRad(-90 + (i - (count - 1) / 2) * 20);
      const bullet = alienBullets.get(this.boss.x, this.boss.y + 20);
      if (!bullet) return;
      bullet.fire(this.boss.x, this.boss.y + 20, Math.sin(angle) * 200, Math.cos(angle) * 200, { texture: 'alienBullet', tint: 0xff4444, blink: this.blink });
    }
  }

  bossTargeted(alienBullets, count) {
    const player = this.group.scene.player;
    if (!player || !player.active) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(player.x - this.boss.x, player.y - this.boss.y) + Phaser.Math.DegToRad((i - (count - 1) / 2) * 10);
      const bullet = alienBullets.get(this.boss.x, this.boss.y + 20);
      if (!bullet) return;
      bullet.fire(this.boss.x, this.boss.y + 20, Math.sin(angle) * 220, Math.cos(angle) * 220, { texture: 'alienBullet', tint: 0xff6600, homing: 2, blink: this.blink });
    }
  }

  bossRapid(alienBullets, count) {
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.DegToRad(-90 + (i - (count - 1) / 2) * 5);
      const bullet = alienBullets.get(this.boss.x, this.boss.y + 20);
      if (!bullet) return;
      bullet.fire(this.boss.x, this.boss.y + 20, Math.sin(angle) * 250, Math.cos(angle) * 250, { texture: 'alienBullet', tint: 0xffff00, blink: this.blink });
    }
  }
}