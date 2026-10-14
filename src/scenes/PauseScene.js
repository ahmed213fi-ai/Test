import { W, H, GAME } from '../config/constants.js';
import Button from '../ui/Button.js';
import { textStyle } from '../ui/style.js';

export default class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  create(data) {
    this.scene.bringToTop();
    const { score = 0, wave = 1 } = data;

    this.add.rectangle(W / 2, H / 2, W, H, 0x000022, 0.85);
    this.add.rectangle(W / 2, H / 2, W - 40, H - 40, 0x001133, 0.3).setStrokeStyle(2, 0x00ffff, 0.5);

    this.add.text(W / 2, 140, 'PAUSED', textStyle({ fontSize: '44px', color: '#00ffff', stroke: '#000044', strokeThickness: 4 })).setOrigin(0.5);
    this.add.text(W / 2, 195, `WAVE ${wave}   |   SCORE ${score.toLocaleString()}`, textStyle({ fontSize: '18px', color: '#9fe8ff' })).setOrigin(0.5);

    new Button(this, W / 2, 280, 'RESUME', () => this.resume(), { color: 0x00ff88, fontSize: '26px', height: 62, width: 280 });
    new Button(this, W / 2, 355, 'RESTART MISSION', () => this.restart(), { color: 0xffaa00, width: 280 });
    new Button(this, W / 2, 430, 'EXIT TO MENU', () => this.quit(), { color: 0xff4466, width: 280 });

    this.time.delayedCall(GAME.KEY_GUARD_MS, () => {
      this.input.keyboard.once('keydown-ESC', () => this.resume());
      this.input.keyboard.once('keydown-P', () => this.resume());
    });
  }

  resume() {
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  restart() {
    this.scene.start('GameScene');
  }

  quit() {
    this.scene.stop('GameScene');
    this.scene.start('MainMenuScene');
  }
}