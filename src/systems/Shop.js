import { WEAPONS } from '../config/weapons.js';

// What an ARMORY card should show for a weapon, given the save data. Pure → unit-tested.
//   kind: 'equipped' | 'owned' | 'buy' (affordable) | 'locked' (can't afford yet)
export function cardState(id, data) {
  const w = WEAPONS[id];
  if (data.equipped === id) return { kind: 'equipped', label: 'EQUIPPED', enabled: true };
  if (data.unlocked.includes(id)) return { kind: 'owned', label: 'EQUIP', enabled: true };
  const affordable = data.coins >= w.price;
  return { kind: affordable ? 'buy' : 'locked', label: `BUY ${w.price}`, enabled: affordable };
}

export function statLine(w) {
  const parts = [`DMG ${w.damage}${w.count > 1 ? ` x${w.count}` : ''}`, `RATE ${(1000 / w.cooldown).toFixed(1)}/s`];
  if (w.pierce) parts.push(`PIERCE ${w.pierce}`);
  if (w.homing) parts.push('HOMING');
  return parts.join('  ');
}
