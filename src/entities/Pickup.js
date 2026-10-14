import { PICKUP } from '../config/constants.js';

export default class Pickup extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture || 'coin');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(5);
    this.body.setSize(14, 14).setOffset(1, 1);
    this.kind = 'coin';
    this.def = null;
    this.value = 1;
    this.fallSpeed = 90;
    this.magnet = false;
    this.forceMagnet = false;
    this.target = null;
    this.bobTime = 0;
    this.bobOffset = 0;
    this.glowGraphic = null;
  }

  spawn(x, y, kind, value, player) {
    const def = PICKUPS[kind];
    this.kind = kind;
    this.def = def;
    this.value = value;
    this.fallSpeed = def.fall;
    this.magnet = def.magnet;
    this.forceMagnet = false;
    this.target = player;
    this.setTexture(def.texture);
    this.setAlpha(1);
    this.setScale(1);
    this.clearTint();
    this.bobTime = Math.random() * Math.PI * 2;
    this.bobOffset = Phaser.Math.Between(0, 100);
    this.enableBody(true, x, y, true, true);
    this.createGlow(def.color);
    return this;
  }

  createGlow(color) {
    if (this.glowGraphic) this.glowGraphic.destroy();
    this.glowGraphic = this.scene.add.graphics().setDepth(4);
    const c = Phaser.Display.Color.HexStringToColor(color);
    this.glowGraphic.fillStyle(c.color, 0.3);
    this.glowGraphic.fillCircle(0, 0, 16);
  }

  kill() {
    this.setAlpha(1);
    this.disableBody(true, true);
    if (this.glowGraphic) {
      this.glowGraphic.destroy();
      this.glowGraphic = null;
    }
  }

  update(time, delta) {
    if (!this.active) return;
    const dt = delta / 1000;
    this.bobTime += dt * 3;
    this.y += this.fallSpeed * dt;
    const bob = Math.sin(this.bobTime + this.bobOffset) * 3;
    this.y += bob * dt * 10;
    if (this.glowGraphic) {
      this.glowGraphic.setPosition(this.x, this.y);
      const pulse = 0.2 + Math.sin(time * 0.005) * 0.15;
      this.glowGraphic.clear();
      const c = Phaser.Display.Color.HexStringToColor(this.def.color);
      this.glowGraphic.fillStyle(c.color, pulse);
      this.glowGraphic.fillCircle(0, 0, 16 + Math.sin(this.bobTime) * 2);
    }
    const magnetActive = this.magnet && (this.forceMagnet || (this.target && Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < PICKUP.MAGNET_RADIUS));
    if (magnetActive && this.target && this.target.active) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0) {
        this.x += (dx / dist) * PICKUP.MAGNET_SPEED * dt;
        this.y += (dy / dist) * PICKUP.MAGNET_SPEED * dt;
      }
    }
    if (this.y > this.scene.scale.height + 30) this.kill();
  }
}