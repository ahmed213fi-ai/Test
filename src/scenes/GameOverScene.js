import { W, GAME } from '../config/constants.js';
import Background from '../systems/Background.js';
import Button from '../ui/Button.js';
import { textStyle } from '../ui/style.js';

const CAUSE_TEXT = {
  bullet: 'Destroyed by enemy fire',
  collision: 'Collided with enemy vessel',
  invaded: 'Defense line breached',
};

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create(data) {
    this.background = new Background(this);
    const { score = 0, wave = 1, coins = 0, newHigh = false, cause = null } = data;

    this.add.text(W / 2, 100, 'MISSION', textStyle({ fontSize: '36px', color: '#ff4466', stroke: '#440011', strokeThickness: 4 })).setOrigin(0.5);
    this.add.text(W / 2, 140, 'FAILED', textStyle({ fontSize: '36px', color: '#ff4466', stroke: '#440011', strokeThickness: 4 })).setOrigin(0.5);

    if (CAUSE_TEXT[cause]) {
      this.add.text(W / 2, 190, CAUSE_TEXT[cause], textStyle({ fontSize: '16px', color: '#ff8899' })).setOrigin(0.5);
    }
    if (newHigh) {
      const newBest = this.add.text(W / 2, 225, 'NEW HIGH SCORE!', textStyle({ fontSize: '24px', color: '#ffdd00', stroke: '#443300', strokeThickness: 3 })).setOrigin(0.5);
      this.tweens.add({ targets: newBest, scale: { from: 1, to: 1.1 }, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    this.add.text(W / 2, 280, `FINAL SCORE`, textStyle({ fontSize: '18px', color: '#88aaff' })).setOrigin(0.5);
    this.add.text(W / 2, 305, `${score.toLocaleString()}`, textStyle({ fontSize: '36px', color: '#ffffff', stroke: '#000044', strokeThickness: 3 })).setOrigin(0.5);

    this.add.text(W / 2, 360, `WAVE REACHED: ${wave}`, textStyle({ fontSize: '18px', color: '#9fe8ff' })).setOrigin(0.5);
    this.add.text(W / 2, 385, `COINS EARNED: +${coins}`, textStyle({ fontSize: '18px', color: '#ffdd00' })).setOrigin(0.5);

    this.again = new Button(this, W / 2, 455, 'RETRY MISSION', () => this.scene.start('GameScene'), { color: 0x00ff88, fontSize: '22px', height: 58, width: 280 });
    this.menu = new Button(this, W / 2, 525, 'MAIN MENU', () => this.scene.start('MainMenuScene'), { color: 0x00aaff, width: 260 });

    this.time.delayedCall(GAME.KEY_GUARD_MS, () => {
      this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
      this.input.keyboard.once('keydown-ESC', () => this.scene.start('MainMenuScene'));
    });
  }

  update(time, delta) {
    this.background.update(Math.min(delta, 50));
  }
}