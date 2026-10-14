import { W, CONTROL_MODES } from '../config/constants.js';
import { Save } from '../systems/SaveManager.js';
import Background from '../systems/Background.js';
import Button from '../ui/Button.js';
import { textStyle } from '../ui/style.js';

const MODE_LABEL = { floating: 'FLOATING STICK', fixed: 'FIXED STICK', drag: 'DRAG' };
const MODE_HINT = {
  floating: 'Touch lower screen: stick appears under thumb.',
  fixed: 'Stick fixed at bottom-left. Best for left thumb.',
  drag: 'Slide finger on lower half: ship follows.',
};
const FLASH_HINT = 'Enemy bullets blink for visibility. Disable if distracting.';

export default class SettingsScene extends Phaser.Scene {
  constructor() { super('SettingsScene'); }

  create() {
    this.background = new Background(this);
    this.add.text(W / 2, 60, 'SETTINGS', textStyle({ fontSize: '36px', color: '#00ffff', stroke: '#000044', strokeThickness: 4 })).setOrigin(0.5);

    const hint = (y) => this.add.text(W / 2, y, '', textStyle({
      fontSize: '13px', color: '#88ccff', align: 'center', wordWrap: { width: 400 },
    })).setOrigin(0.5, 0);

    this.controlsBtn = new Button(this, W / 2, 150, '', () => this.cycleControls(), { width: 420, height: 56, color: 0x00aaff });
    this.controlsHint = hint(200);

    this.flashBtn = new Button(this, W / 2, 260, '', () => this.toggleFlash(), { width: 420, height: 56, color: 0xff8800 });
    this.flashHint = hint(310);

    this.hintsBtn = new Button(this, W / 2, 380, 'REPLAY TUTORIAL HINTS', () => {
      Save.resetHints();
      this.hintsBtn.setLabel('HINTS RESET - WILL SHOW AGAIN');
      this.time.delayedCall(1500, () => this.refresh());
    }, { width: 420, height: 56, color: 0x8844ff });

    new Button(this, W / 2, 480, 'BACK TO MENU', () => this.scene.start('MainMenuScene'), { color: 0x666688, width: 280 });
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MainMenuScene'));

    this.refresh();
  }

  cycleControls() {
    const i = CONTROL_MODES.indexOf(Save.data.settings.controls);
    Save.setSetting('controls', CONTROL_MODES[(i + 1) % CONTROL_MODES.length]);
    this.refresh();
  }

  toggleFlash() {
    Save.setSetting('flash', !Save.data.settings.flash);
    this.refresh();
  }

  refresh() {
    const s = Save.data.settings;
    this.controlsBtn.setLabel(`CONTROLS: ${MODE_LABEL[s.controls]}`);
    this.controlsHint.setText(MODE_HINT[s.controls]);
    this.flashBtn.setLabel(`ENEMY BULLET FLASH: ${s.flash ? 'ON' : 'OFF'}`);
    this.flashHint.setText(FLASH_HINT);
  }

  update(time, delta) {
    this.background.update(Math.min(delta, 50));
  }
}