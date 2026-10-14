import { W, PLAYER, PARTICLES } from '../config/constants.js';
import { stepPosition } from '../systems/joystickMath.js';

export default class Player extends Phaser.Physics.Arcade.Image {
  constructor(scene) {
    super(scene, W / 2, PLAYER.START_Y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(10);
    this.body.setSize(28, 30).setOffset(10, 10);
    this.invulnUntil = 0;
    this.pos = { x: 0, y: 0 };
    this.shieldActive = false;
    this.shieldGraphic = null;
    this.engineParticles = null;
    this.powerups = {
      rapid: false,
      spread: false,
      shield: false,
      spreadUntil: 0,
      rapidUntil: 0,
    };
    this.createEngineParticles();
  }

  createEngineParticles() {
    this.engineParticles = this.scene.add.particles(0, 0, 'spark', {
      lifespan: { min: 100, max: 300 },
      speed: { min: 20, max: 60 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.8, end: 0 },
      angle: { min: 80, max: 100 },
      emitting: false,
      blendMode: 'ADD',
    }).setDepth(9);
  }

  steer(dtMs, input) {
    const p = stepPosition(this.x, this.y, input, dtMs, this.pos);
    this.x = p.x;
    this.y = p.y;
    this.engineParticles.setPosition(this.x, this.y + 20);
    if (input.dx !== 0 || input.dy !== 0) {
      this.engineParticles.emitParticle(3);
    }
    if (this.shieldGraphic) {
      this.shieldGraphic.setPosition(this.x, this.y);
    }
  }

  isInvulnerable(now) {
    return now < this.invulnUntil || this.shieldActive;
  }

  activateShield(duration) {
    this.shieldActive = true;
    if (!this.shieldGraphic) {
      this.shieldGraphic = this.scene.add.graphics().setDepth(11);
      this.shieldGraphic.lineStyle(3, 0x00ffff, 0.6);
      this.shieldGraphic.strokeCircle(0, 0, 28);
      this.shieldGraphic.fillStyle(0x00ffff, 0.1);
      this.shieldGraphic.fillCircle(0, 0, 28);
    }
    this.shieldGraphic.setPosition(this.x, this.y);
    this.shieldGraphic.setVisible(true);
    this.scene.time.delayedCall(duration, () => {
      this.shieldActive = false;
      if (this.shieldGraphic) this.shieldGraphic.setVisible(false);
    });
  }

  activatePowerup(type, duration) {
    this.powerups[type] = true;
    this.powerups[`${type}Until`] = this.scene.time.now + duration;
  }

  hasPowerup(type) {
    return this.powerups[type] && this.scene.time.now < this.powerups[`${type}Until`];
  }

  tick(now) {
    this.setAlpha(this.isInvulnerable(now) && Math.floor(now / 90) % 2 ? 0.3 : 1);
    if (this.shieldGraphic && this.shieldGraphic.visible) {
      this.shieldGraphic.clear();
      const pulse = 0.4 + Math.sin(now * 0.01) * 0.2;
      this.shieldGraphic.lineStyle(3, 0x00ffff, pulse);
      this.shieldGraphic.strokeCircle(0, 0, 28);
      this.shieldGraphic.fillStyle(0x00ffff, 0.05 + pulse * 0.1);
      this.shieldGraphic.fillCircle(0, 0, 28);
    }
    for (const type of ['rapid', 'spread']) {
      if (this.powerups[type] && now >= this.powerups[`${type}Until`]) {
        this.powerups[type] = false;
      }
    }
  }

  destroy() {
    if (this.engineParticles) this.engineParticles.destroy();
    if (this.shieldGraphic) this.shieldGraphic.destroy();
    super.destroy();
  }
}