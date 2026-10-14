import { W, DEV } from '../config/constants.js';
import { WEAPONS, WEAPON_ORDER } from '../config/weapons.js';
import { Save } from '../systems/SaveManager.js';
import { cardState, statLine } from '../systems/Shop.js';
import Background from '../systems/Background.js';
import Button from '../ui/Button.js';
import { textStyle } from '../ui/style.js';

const CARD = { TOP: 140, STEP: 110, WIDTH: 420, HEIGHT: 98 };
const KIND_COLOR = { equipped: 0x00ff88, owned: 0x00aaff, buy: 0xffaa00, locked: 0x556677 };

export default class ArmoryScene extends Phaser.Scene {
  constructor() { super('ArmoryScene'); }

  create() {
    this.background = new Background(this);
    this.add.text(W / 2, 35, 'ARMORY', textStyle({ fontSize: '36px', color: '#00ffff', stroke: '#000044', strokeThickness: 4 })).setOrigin(0.5);
    this.add.text(W / 2, 72, 'SELECT YOUR WEAPON', textStyle({ fontSize: '16px', color: '#88ccff' })).setOrigin(0.5);

    this.coinText = this.add.text(W / 2, 98, '', textStyle({ fontSize: '20px', color: '#ffdd00', stroke: '#443300', strokeThickness: 2 })).setOrigin(0.5);
    this.msgText = this.add.text(W / 2, 120, '', textStyle({ fontSize: '15px', color: '#00ff88' })).setOrigin(0.5).setAlpha(0);

    this.cards = WEAPON_ORDER.map((id, i) => {
      const w = WEAPONS[id];
      const y = CARD.TOP + i * CARD.STEP;
      const left = W / 2 - CARD.WIDTH / 2 + 20;

      const frame = this.add.rectangle(W / 2, y, CARD.WIDTH, CARD.HEIGHT, 0x0a1628, 0.9)
        .setStrokeStyle(2, KIND_COLOR.locked)
        .setDepth(10);

      this.add.image(left - 10, y, w.texture).setScale(w.texture === 'missile' ? 1.2 : 1.5).setTint(w.tint).setDepth(11);
      this.add.text(left + 30, y - 36, w.name.toUpperCase(), textStyle({ fontSize: '18px', fontWeight: 'bold' })).setDepth(11);
      this.add.text(left + 30, y - 12, statLine(w), textStyle({ fontSize: '12px', color: '#9fe8ff' })).setDepth(11);
      this.add.text(left + 30, y + 12, w.description, textStyle({ fontSize: '12px', color: '#aab4c0', wordWrap: { width: 280 } })).setDepth(11);

      const button = new Button(this, W / 2 + CARD.WIDTH / 2 - 75, y, '', () => this.onAction(id),
        { width: 120, height: 44, fontSize: '14px' });
      return { id, frame, button };
    });

    new Button(this, W / 2, 590, 'BACK TO MENU', () => this.scene.start('MainMenuScene'), { color: 0x555588, width: 280, height: 52 });
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MainMenuScene'));

    if (DEV) {
      new Button(this, W - 50, 35, '+500', () => {
        Save.addCoins(500);
        Save.save();
        this.refresh();
      }, { width: 80, height: 32, fontSize: '13px', color: 0xff66ff });
    }

    this.refresh();
  }

  onAction(id) {
    const state = cardState(id, Save.data);
    const name = WEAPONS[id].name;
    if (state.kind === 'owned') {
      Save.equipWeapon(id);
      this.say(`${name.toUpperCase()} EQUIPPED`);
    } else if (state.kind === 'buy') {
      if (Save.buyWeapon(id).ok) this.say(`${name.toUpperCase()} UNLOCKED!`);
    }
    this.refresh();
  }

  say(message) {
    this.tweens.killTweensOf(this.msgText);
    this.msgText.setText(message).setAlpha(1).setScale(1);
    this.tweens.add({ targets: this.msgText, alpha: 0, scale: 1.1, delay: 1000, duration: 400, ease: 'Power2' });
  }

  refresh() {
    const data = Save.data;
    this.coinText.setText(`CREDITS: ${data.coins.toLocaleString()}`);
    for (const { id, frame, button } of this.cards) {
      const state = cardState(id, data);
      const color = KIND_COLOR[state.kind];
      frame.setStrokeStyle(2, color);
      button.setLabel(state.label);
      button.setColor(color);
      button.setEnabled(state.enabled);
    }
  }

  update(time, delta) {
    this.background.update(Math.min(delta, 50));
  }
}