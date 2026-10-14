import { W } from '../config/constants.js';
import { getWeapon } from '../config/weapons.js';
import { Save } from '../systems/SaveManager.js';
import Background from '../systems/Background.js';
import Button from '../ui/Button.js';
import { textStyle } from '../ui/style.js';

export default class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create() {
    this.background = new Background(this);

    this.add.text(W / 2, 80, 'GALACTIC', textStyle({ fontSize: '48px', color: '#00ffff', align: 'center', stroke: '#000044', strokeThickness: 4 })).setOrigin(0.5);
    this.add.text(W / 2, 130, 'DEFENDER', textStyle({ fontSize: '48px', color: '#ff44aa', align: 'center', stroke: '#440022', strokeThickness: 4 })).setOrigin(0.5);

    this.add.image(W / 2 - 100, 200, 'alienC').setScale(2.2);
    this.add.image(W / 2, 200, 'alienB').setScale(2.2);
    this.add.image(W / 2 + 100, 200, 'alienA').setScale(2.2);
    this.add.image(W / 2, 280, 'player').setScale(2.5);

    const d = Save.data;
    this.add.text(W / 2, 360,
      `BEST ${d.highScore.toLocaleString()}   WAVE ${d.bestWave}\nCOINS ${d.coins.toLocaleString()}\nWEAPON ${getWeapon(d.equipped).name.toUpperCase()}`,
      textStyle({ align: 'center', color: '#9fe8ff', lineSpacing: 8, fontSize: '16px' })).setOrigin(0.5);

    this.play = new Button(this, W / 2, 440, 'START GAME', () => this.scene.start('GameScene'), { color: 0x00ff88, fontSize: '28px', height: 68, width: 300 });
    this.armory = new Button(this, W / 2, 515, 'ARMORY', () => this.scene.start('ArmoryScene'), { color: 0xffaa00, width: 260 });
    this.settings = new Button(this, W / 2, 580, 'SETTINGS', () => this.scene.start('SettingsScene'), { width: 260 });

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));

    this.time.addEvent({ delay: 2000, callback: this.animateTitle, callbackScope: this, loop: true });
  }

  animateTitle() {
    const title = this.children.list.find(c => c.text === 'GALACTIC');
    if (title) {
      this.tweens.add({ targets: title, color: { value: '#ff44aa' }, duration: 1000, yoyo: true, ease: 'Sine.easeInOut' });
    }
  }

  update(time, delta) {
    this.background.update(Math.min(delta, 50));
  }
}