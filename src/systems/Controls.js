import { W, H, TOUCH } from '../config/constants.js';
import { clamp, stickVector, clampToRadius, keyboardVector } from './joystickMath.js';

// One object that turns keyboard + touch/mouse into a movement request each frame.
//   mode 'floating': stick appears under the thumb anywhere in the lower half
//   mode 'fixed'   : stick stays at the bottom-left corner
//   mode 'drag'    : the ship moves by the same amount as the finger
export default class Controls {
  constructor(scene, mode) {
    this.mode = mode;
    const kb = scene.input.keyboard;
    this.cursors = kb.createCursorKeys();
    this.keys = kb.addKeys({ w: 'W', a: 'A', s: 'S', d: 'D', fire: 'SPACE' });

    // reused every frame: no allocation in the hot path
    this.out = { x: 0, y: 0, moveX: 0, moveY: 0 };
    this.keyVec = { x: 0, y: 0 };
    this.stickVec = { x: 0, y: 0 };
    this.thumbOffset = { x: 0, y: 0 };

    this.pointer = null;
    this.baseX = 0;
    this.baseY = 0;
    this.lastX = 0;
    this.lastY = 0;

    this.baseCircle = scene.add.circle(0, 0, TOUCH.STICK_RADIUS, 0xffffff, 0.06)
      .setStrokeStyle(3, 0xffffff, 0.4).setDepth(25).setVisible(false);
    this.thumbCircle = scene.add.circle(0, 0, TOUCH.THUMB_RADIUS, 0xffffff, 0.35)
      .setDepth(26).setVisible(false);
    if (mode === 'fixed') this.showStickAt(TOUCH.FIXED_X, TOUCH.FIXED_Y, 0.5);

    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointerup', this.onUp, this);
    scene.input.on('pointerupoutside', this.onUp, this);
  }

  get fireHeld() {
    return this.keys.fire.isDown;
  }

  showStickAt(x, y, alpha) {
    this.baseCircle.setPosition(x, y).setAlpha(alpha).setVisible(true);
    this.thumbCircle.setPosition(x, y).setAlpha(alpha).setVisible(true);
  }

  onDown(pointer) {
    if (this.pointer) return; // one finger drives the ship; extra fingers are ignored
    const R = TOUCH.STICK_RADIUS;

    if (this.mode === 'fixed') {
      if (Math.hypot(pointer.x - TOUCH.FIXED_X, pointer.y - TOUCH.FIXED_Y) > R * 1.7) return;
      this.baseX = TOUCH.FIXED_X;
      this.baseY = TOUCH.FIXED_Y;
      this.showStickAt(this.baseX, this.baseY, 1);
    } else {
      if (pointer.y < TOUCH.ZONE_TOP) return; // upper half is reserved for the HUD
      if (this.mode === 'floating') {
        this.baseX = clamp(pointer.x, R + 8, W - R - 8);
        this.baseY = clamp(pointer.y, TOUCH.ZONE_TOP, H - R - 8);
        this.showStickAt(this.baseX, this.baseY, 1);
      }
    }
    this.pointer = pointer;
    this.lastX = pointer.x;
    this.lastY = pointer.y;
  }

  onUp(pointer) {
    if (pointer === this.pointer) this.release();
  }

  release() {
    this.pointer = null;
    if (this.mode === 'fixed') {
      this.showStickAt(TOUCH.FIXED_X, TOUCH.FIXED_Y, 0.5);
    } else {
      this.baseCircle.setVisible(false);
      this.thumbCircle.setVisible(false);
    }
  }

  // Call once per frame. Returns a shared object: { x, y, moveX, moveY }.
  read() {
    const o = this.out;
    const c = this.cursors;
    const k = this.keys;
    keyboardVector(
      c.left.isDown || k.a.isDown,
      c.right.isDown || k.d.isDown,
      c.up.isDown || k.w.isDown,
      c.down.isDown || k.s.isDown,
      this.keyVec,
    );
    o.x = this.keyVec.x;
    o.y = this.keyVec.y;
    o.moveX = 0;
    o.moveY = 0;

    const p = this.pointer;
    if (p && !p.isDown) this.release(); // safety net if a pointerup was missed

    if (this.pointer) {
      if (this.mode === 'drag') {
        o.moveX = (p.x - this.lastX) * TOUCH.DRAG_GAIN;
        o.moveY = (p.y - this.lastY) * TOUCH.DRAG_GAIN;
        this.lastX = p.x;
        this.lastY = p.y;
      } else {
        const dx = p.x - this.baseX;
        const dy = p.y - this.baseY;
        stickVector(dx, dy, TOUCH.STICK_RADIUS, TOUCH.DEADZONE, this.stickVec);
        o.x += this.stickVec.x;
        o.y += this.stickVec.y;
        clampToRadius(dx, dy, TOUCH.STICK_RADIUS, this.thumbOffset);
        this.thumbCircle.setPosition(this.baseX + this.thumbOffset.x, this.baseY + this.thumbOffset.y);
      }
    }

    o.x = clamp(o.x, -1, 1);
    o.y = clamp(o.y, -1, 1);
    return o;
  }
}
