// Pure steering helpers for homing missiles (no Phaser → unit-tested in Node).

export function normalizeAngle(a) {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

// Rotate the heading (vx, vy) toward (tx, ty) by at most `maxTurn` radians, keeping `speed`.
export function steerToward(vx, vy, px, py, tx, ty, maxTurn, speed, out) {
  const current = Math.atan2(vy, vx);
  const wanted = Math.atan2(ty - py, tx - px);
  const turn = Math.max(-maxTurn, Math.min(maxTurn, normalizeAngle(wanted - current)));
  out.vx = Math.cos(current + turn) * speed;
  out.vy = Math.sin(current + turn) * speed;
  return out;
}

// Closest active object of `list` to (x, y), or null.
export function nearestActive(list, x, y) {
  let best = null;
  let bestD = Infinity;
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    if (!t.active) continue;
    const dx = t.x - x;
    const dy = t.y - y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}
