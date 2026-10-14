import { textStyle } from './style.js';

export default class Button {
  constructor(scene, x, y, label, onClick, { width = 260, height = 56, color = 0x00aaff, fontSize = '20px' } = {}) {
    this.onClick = onClick;
    this.enabled = true;
    this.armed = false;

    this.bg = scene.add.rectangle(x, y, width, height, 0x0a1628, 0.95)
      .setStrokeStyle(3, color)
      .setDepth(30)
      .setInteractive({ useHandCursor: true });

    this.glow = scene.add.rectangle(x, y, width + 6, height + 6, color, 0)
      .setDepth(29);

    this.text = scene.add.text(x, y, label, textStyle({ fontSize, align: 'center', stroke: '#000000', strokeThickness: 2 }))
      .setOrigin(0.5)
      .setDepth(31);

    this.bg.on('pointerover', () => {
      if (this.enabled) {
        this.bg.setFillStyle(0x16345f, 0.95);
        this.glow.setFillStyle(color, 0.3);
        this.scene.tweens.add({ targets: this.glow, alpha: 0.3, duration: 100 });
      }
    });
    this.bg.on('pointerout', (pointer) => {
      this.bg.setFillStyle(0x0a1628, 0.95);
      this.glow.setAlpha(0);
      this.press(false);
      if (pointer && pointer.isDown) this.armed = false;
    });
    this.bg.on('pointerdown', () => {
      if (!this.enabled) return;
      this.armed = true;
      this.press(true);
    });
    this.bg.on('pointerup', () => {
      const fire = this.armed && this.enabled;
      this.armed = false;
      this.press(false);
      if (fire) this.onClick();
    });
  }

  press(on) {
    const s = on ? 0.95 : 1;
    this.bg.setScale(s);
    this.text.setScale(s);
    this.glow.setScale(s);
  }

  setColor(color) {
    this.bg.setStrokeStyle(3, color);
  }

  setLabel(label) {
    this.text.setText(label);
  }

  setEnabled(on) {
    this.enabled = on;
    if (!on) this.armed = false;
    this.bg.setAlpha(on ? 1 : 0.5);
    this.text.setAlpha(on ? 1 : 0.4);
    if (on) this.bg.setInteractive({ useHandCursor: true });
    else this.bg.disableInteractive();
  }
}