import { W, H, BULLET_BLINK } from '../config/constants.js';
import { steerToward, nearestActive } from '../systems/homing.js';

export default class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture || 'bullet');
    this.damage = 1;
    this.pierceLeft = 0;
    this.blink = false;
    this.blinkPhase = -1;
    this.homing = 0;
    this.lifetime = 0;
    this.age = 0;
    this.target = null;
    this.dirX = 0;
    this.dirY = 0;
    this.speed = 0;
    this.steer = { vx: 0, vy: 0 };
    this.hitSet = new Set();
    this.trail = null;
    this.isPlayerBullet = false;
  }

  fire(x, y, vx, vy, { texture = 'bullet', tint = 0xffffff, damage = 1, pierce = 0, blink = false, homing = 0, lifetime = 0, isPlayerBullet = false } = {}) {
    this.setTexture(texture);
    this.body.setSize(4, this.height - 2, true);
    this.enableBody(true, x, y, true, true);
    this.blink = blink;
    this.blinkPhase = -1;
    this.setTint(blink ? BULLET_BLINK.COLORS[0] : tint);
    this.setVelocity(vx, vy);
    this.setRotation(Math.atan2(vx, -vy));
    this.damage = damage;
    this.pierceLeft = pierce;
    this.homing = homing;
    this.lifetime = lifetime;
    this.age = 0;
    this.target = null;
    this.dirX = vx;
    this.dirY = vy;
    this.speed = Math.hypot(vx, vy);
    this.hitSet.clear();
    this.isPlayerBullet = isPlayerBullet;
    if (isPlayerBullet && texture === 'bullet') {
      this.createTrail();
    }
    return this;
  }

  createTrail() {
    this.trail = this.scene.add.particles(0, 0, 'spark', {
      lifespan: 150,
      speed: 0,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      emitting: false,
      blendMode: 'ADD',
    }).setDepth(this.depth - 1);
  }

  kill() {
    if (this.trail) {
      this.trail.destroy();
      this.trail = null;
    }
    this.disableBody(true, true);
  }

  update(time, delta) {
    if (this.x < -20 || this.x > W + 20 || this.y < -30 || this.y > H + 30) {
      this.kill();
      return;
    }
    if (this.lifetime > 0) {
      this.age += Math.min(delta || 0, 50);
      if (this.age >= this.lifetime) {
        this.kill();
        return;
      }
    }
    if (this.homing > 0) this.seek(delta);
    if (this.trail) {
      this.trail.setPosition(this.x, this.y);
      this.trail.emitParticle(2);
    }
    if (this.blink) {
      const phase = Math.floor(time / BULLET_BLINK.PERIOD_MS) % 2;
      if (phase !== this.blinkPhase) {
        this.blinkPhase = phase;
        this.setTint(BULLET_BLINK.COLORS[phase]);
      }
    }
  }

  seek(delta) {
    const aliens = this.scene.aliens;
    if (!aliens) return;
    if (!this.target || !this.target.active) this.target = nearestActive(aliens.getChildren(), this.x, this.y);
    if (!this.target) return;

    const maxTurn = this.homing * (Math.min(delta || 16, 50) / 1000);
    steerToward(this.dirX, this.dirY, this.x, this.y, this.target.x, this.target.y, maxTurn, this.speed, this.steer);
    this.dirX = this.steer.vx;
    this.dirY = this.steer.vy;
    this.setVelocity(this.dirX, this.dirY);
    this.setRotation(Math.atan2(this.dirX, -this.dirY));
  }
}