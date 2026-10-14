import { ENEMIES } from '../config/enemies.js';

const FLASH_MS = 70;

export default class Alien extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture || 'alienA');
    this.flashUntil = 0;
    this.col = 0;
    this.type = 'drone';
    this.def = ENEMIES.drone;
    this.hp = 1;
    this.maxHp = 1;
    this.isBoss = false;
    this.bossPhase = 0;
    this.bossTimer = 0;
    this.healthBar = null;
  }

  spawn(x, y, typeKey, col) {
    const def = ENEMIES[typeKey];
    this.type = typeKey;
    this.def = def;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.col = col;
    this.flashUntil = 0;
    this.isBoss = def.isBoss || false;
    this.bossPhase = 0;
    this.bossTimer = 0;
    this.setTexture(def.texture);
    this.setAlpha(1);
    this.setScale(1);
    if (def.tint) this.setTint(def.tint);
    else this.clearTint();
    if (this.isBoss) {
      this.setScale(1.5);
      this.body.setSize(50, 50, true);
      this.createHealthBar();
    } else {
      this.body.setSize(22, 18, true);
      if (this.healthBar) {
        this.healthBar.destroy();
        this.healthBar = null;
      }
    }
    this.enableBody(true, x, y, true, true);
    return this;
  }

  createHealthBar() {
    if (!this.healthBar) {
      this.healthBar = this.scene.add.graphics().setDepth(20);
    }
    this.updateHealthBar();
  }

  updateHealthBar() {
    if (!this.healthBar) return;
    this.healthBar.clear();
    const w = 50;
    const h = 6;
    const x = this.x - w / 2;
    const y = this.y - 40;
    this.healthBar.fillStyle(0x330000, 0.8);
    this.healthBar.fillRoundedRect(x, y, w, h, 3);
    const pct = this.hp / this.maxHp;
    const color = pct > 0.5 ? 0x00ff00 : pct > 0.25 ? 0xffaa00 : 0xff0000;
    this.healthBar.fillStyle(color, 0.9);
    this.healthBar.fillRoundedRect(x, y, w * pct, h, 3);
    this.healthBar.lineStyle(1, 0xffffff, 0.5);
    this.healthBar.strokeRoundedRect(x, y, w, h, 3);
  }

  takeHit(damage, now) {
    this.hp -= damage;
    if (this.hp <= 0) return true;
    this.setAlpha(0.35);
    this.flashUntil = now + FLASH_MS;
    if (this.isBoss) this.updateHealthBar();
    return false;
  }

  kill() {
    this.flashUntil = 0;
    this.setAlpha(1);
    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }
    this.disableBody(true, true);
  }

  update(time, delta) {
    if (this.flashUntil && time >= this.flashUntil) {
      this.setAlpha(1);
      this.flashUntil = 0;
    }
    if (this.isBoss) {
      this.bossTimer += delta;
      if (this.healthBar) {
        this.healthBar.setPosition(this.x - 25, this.y - 40);
      }
    }
  }
}