import { W, H } from '../config/constants.js';

export default class Background {
  constructor(scene) {
    this.scene = scene;
    this.nebula = scene.add.tileSprite(W / 2, H / 2, W, H, 'nebula').setDepth(-20);
    this.far = scene.add.tileSprite(W / 2, H / 2, W, H, 'stars_far').setDepth(-15);
    this.mid = scene.add.tileSprite(W / 2, H / 2, W, H, 'stars_mid').setDepth(-10);
    this.near = scene.add.tileSprite(W / 2, H / 2, W, H, 'stars_near').setDepth(-5);
    this.time = 0;
  }

  update(dtMs) {
    const s = dtMs / 1000;
    this.time += dtMs;
    this.nebula.tilePositionY -= 2 * s;
    this.nebula.tilePositionX -= 0.5 * s;
    this.far.tilePositionY -= 10 * s;
    this.mid.tilePositionY -= 25 * s;
    this.mid.tilePositionX -= 5 * s;
    this.near.tilePositionY -= 50 * s;
    this.near.tilePositionX -= 15 * s;
    this.nebula.setAlpha(0.3 + Math.sin(this.time * 0.0005) * 0.1);
  }
}