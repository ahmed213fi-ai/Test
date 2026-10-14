import { W, PLAYER } from '../config/constants.js';

// Pure helpers for movement. No Phaser here, so they are unit-tested in Node.

const DIAGONAL = Math.SQRT1_2;

export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Stick offset (dx, dy from the stick centre) → intent vector with |v| <= 1.
// Inside the deadzone → 0; outside it the range is rescaled so there is no jump at the edge.
export function stickVector(dx, dy, radius, deadzone, out) {
  const len = Math.hypot(dx, dy);
  const m = radius > 0 ? Math.min(len / radius, 1) : 0;
  if (len === 0 || m < deadzone) {
    out.x = 0;
    out.y = 0;
    return out;
  }
  const scaled = (m - deadzone) / (1 - deadzone);
  out.x = (dx / len) * scaled;
  out.y = (dy / len) * scaled;
  return out;
}

// Where to draw the thumb: the finger offset limited to the stick radius.
export function clampToRadius(dx, dy, radius, out) {
  const len = Math.hypot(dx, dy);
  if (len <= radius) {
    out.x = dx;
    out.y = dy;
  } else {
    out.x = (dx / len) * radius;
    out.y = (dy / len) * radius;
  }
  return out;
}

// Arrow keys / WASD → vector. Diagonals are normalised so they are not faster.
export function keyboardVector(left, right, up, down, out) {
  let x = (right ? 1 : 0) - (left ? 1 : 0);
  let y = (down ? 1 : 0) - (up ? 1 : 0);
  if (x && y) {
    x *= DIAGONAL;
    y *= DIAGONAL;
  }
  out.x = x;
  out.y = y;
  return out;
}

// New ship position. input = { x, y (−1..1), moveX, moveY (pixel deltas from drag mode) }.
export function stepPosition(x, y, input, dtMs, out) {
  const s = dtMs / 1000;
  out.x = clamp(x + input.x * PLAYER.SPEED * s + input.moveX, PLAYER.MARGIN, W - PLAYER.MARGIN);
  out.y = clamp(y + input.y * PLAYER.SPEED * s + input.moveY, PLAYER.MIN_Y, PLAYER.MAX_Y);
  return out;
}
