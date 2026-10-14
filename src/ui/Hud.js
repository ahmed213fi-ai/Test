import { W, H } from '../config/constants.js';
import { textStyle } from './style.js';

export default class Hud {
  constructor(scene) {
    this.scene = scene;
    this.pops = [];
    this.powerupIndicators = {};
    const text = (x, y, s, o = {}) => scene.add.text(x, y, s, textStyle(o)).setDepth(20);

    this.scoreText = text(10, 8, 'SCORE 0');
    this.waveText = text(W / 2, 8, 'WAVE 1').setOrigin(0.5, 0);
    this.livesText = text(W - 10, 8, 'LIVES 3').setOrigin(1, 0);
    this.coinText = text(10, 28, 'COINS 0', { color: '#ffd23f' });
    this.weaponText = text(W - 10, 28, '', { color: '#9fe8ff' }).setOrigin(1, 0);
    this.bannerText = text(W / 2, H / 2 - 40, '', { fontSize: '32px', align: 'center', color: '#ffffff', stroke: '#000000', strokeThickness: 4 })
      .setOrigin(0.5)
      .setAlpha(0);

    this.createPowerupSlots();
  }

  createPowerupSlots() {
    const types = ['shield', 'rapid', 'spread', 'life'];
    types.forEach((type, i) => {
      const x = 10 + i * 40;
      const y = H - 30;
      const bg = this.scene.add.rectangle(x, y, 32, 32, 0x000000, 0.5).setDepth(19).setStrokeStyle(2, 0x444444).setVisible(false);
      const icon = this.scene.add.image(x, y, `powerup_${type}`).setScale(0.8).setDepth(20).setVisible(false);
      const timer = this.scene.add.graphics().setDepth(21).setVisible(false);
      this.powerupIndicators[type] = { bg, icon, timer, x, y };
    });
  }

  setScore(v) { this.scoreText.setText(`SCORE ${v.toLocaleString()}`); }
  setWave(v) { this.waveText.setText(`WAVE ${v}`); }
  setLives(v) { this.livesText.setText(`LIVES ${v}`); }
  setCoins(v) { this.coinText.setText(`COINS ${v.toLocaleString()}`); }
  setWeapon(name) { this.weaponText.setText(name.toUpperCase()); }

  showBanner(message, holdMs = 1000) {
    const s = this.scene;
    s.tweens.killTweensOf(this.bannerText);
    this.bannerText.setText(message).setAlpha(1).setScale(1);
    s.tweens.add({ targets: this.bannerText, alpha: 0, delay: holdMs, duration: 400 });
    s.tweens.add({ targets: this.bannerText, scale: { from: 1.2, to: 1 }, duration: 200, ease: 'Back.easeOut' });
  }

  pop(x, y, message, color = '#ffffff') {
    let t = this.pops.find((p) => !p.active);
    if (!t) {
      t = this.scene.add.text(0, 0, '', textStyle({ fontSize: '16px', stroke: '#000000', strokeThickness: 3 })).setOrigin(0.5).setDepth(25);
      this.pops.push(t);
    }
    t.setText(message).setColor(color).setPosition(x, y).setAlpha(1).setScale(1).setActive(true).setVisible(true);
    this.scene.tweens.add({
      targets: t,
      y: y - 30,
      alpha: 0,
      scale: 1.3,
      duration: 800,
      ease: 'Power2',
      onComplete: () => t.setActive(false).setVisible(false),
    });
  }

  updatePowerups(player) {
    if (!player) return;
    const now = this.scene.time.now;
    for (const [type, indicator] of Object.entries(this.powerupIndicators)) {
      if (type === 'life') continue;
      const active = player.hasPowerup(type);
      indicator.bg.setVisible(active);
      indicator.icon.setVisible(active);
      indicator.timer.setVisible(active);
      if (active && player.powerups[`${type}Until`]) {
        const pct = 1 - (player.powerups[`${type}Until`] - now) / 10000;
        indicator.timer.clear();
        indicator.timer.fillStyle(0x00ffff, 0.8);
        indicator.timer.fillCircle(indicator.x, indicator.y - 18, 16 * pct);
      }
    }
    if (player.shieldActive) {
      const ind = this.powerupIndicators.shield;
      ind.bg.setVisible(true);
      ind.icon.setVisible(true);
      ind.timer.setVisible(true);
    }
  }

  update(time, delta, player) {
    this.updatePowerups(player);
  }
}