import { W } from '../config/constants.js';
import { moveHint, COIN_HINT, ZONE_NOTE } from '../config/hints.js';
import { isTouchDevice } from './device.js';
import { Save } from './SaveManager.js';
import { textStyle } from '../ui/style.js';

const SHOW_AFTER_MS = 500;       // the "how to move" hint appears this long after wave 1 starts
const NUDGE_AFTER_MS = 3000;     // ...and starts pulsing if the player still hasn't moved
const MOVE_THRESHOLD = 0.2;

// Short one-time hints during the very first run. Each hint is shown once and remembered in the save.
//   move: wave 1, until the player moves   kill: first enemy destroyed   coin: first coin collected
export default class Hints {
  constructor(scene, hud) {
    this.scene = scene;
    this.hud = hud;
    this.moveVisible = false;
    this.hasMoved = false;
    this.tweens = [];
    this.timer = null;

    this.text = scene.add.text(W / 2, 360, '', textStyle({
      fontSize: '16px', align: 'center', stroke: '#000000', strokeThickness: 4,
      wordWrap: { width: 400 }, lineSpacing: 4,
    })).setOrigin(0.5).setDepth(22).setVisible(false);
    this.arrow = scene.add.triangle(W / 2, 420, 0, 0, 26, 0, 13, 18, 0xffffff, 0.85)
      .setDepth(22).setVisible(false);
  }

  onWaveStart(level) {
    if (level !== 1 || Save.hasSeenHint('move')) return;
    this.scene.time.delayedCall(SHOW_AFTER_MS, () => this.showMove());
  }

  showMove() {
    if (Save.hasSeenHint('move') || this.moveVisible) return;
    if (this.hasMoved) { // the player already moved on their own before the hint was due
      Save.markHint('move');
      return;
    }
    this.moveVisible = true;
    this.text.setText(`${moveHint(isTouchDevice(), Save.data.settings.controls)}\n${ZONE_NOTE}`).setAlpha(1).setVisible(true);
    this.arrow.setVisible(true);
    this.tweens.push(this.scene.tweens.add({ targets: this.arrow, y: this.arrow.y + 8, duration: 450, yoyo: true, repeat: -1 }));
    this.timer = this.scene.time.delayedCall(NUDGE_AFTER_MS, () => {
      if (this.moveVisible) {
        this.tweens.push(this.scene.tweens.add({ targets: this.text, alpha: 0.35, duration: 350, yoyo: true, repeat: -1 }));
      }
    });
  }

  // Called every frame with the movement request from Controls.read().
  onInput(input) {
    if (this.hasMoved) return;
    if (Math.abs(input.x) + Math.abs(input.y) > MOVE_THRESHOLD || Math.abs(input.moveX) + Math.abs(input.moveY) > 2) {
      this.hasMoved = true;
      if (this.moveVisible) this.hideMove();
    }
  }

  hideMove() {
    this.moveVisible = false;
    Save.markHint('move');
    for (const t of this.tweens) t.stop();
    this.tweens.length = 0;
    if (this.timer) this.timer.remove(false);
    this.text.setVisible(false).setAlpha(1);
    this.arrow.setVisible(false);
  }

  onKill(x, y, points) {
    if (Save.hasSeenHint('kill')) return;
    Save.markHint('kill');
    this.hud.pop(x, y - 12, `NICE! +${points}`, '#66ff99');
  }

  onPickup(kind) {
    if (kind !== 'coin' || Save.hasSeenHint('coin') || this.moveVisible) return;
    Save.markHint('coin');
    this.text.setText(COIN_HINT).setAlpha(1).setVisible(true);
    this.scene.tweens.add({
      targets: this.text, alpha: 0, delay: 3200, duration: 400,
      onComplete: () => { if (!this.moveVisible) this.text.setVisible(false).setAlpha(1); },
    });
  }
}
