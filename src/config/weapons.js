export const WEAPONS = {
  blaster: {
    id: 'blaster', name: 'Blaster', description: 'Reliable single shot', price: 0,
    cooldown: 350, damage: 1, speed: 500, count: 1, spreadDeg: 0, pierce: 0, homing: 0, lifetime: 0,
    texture: 'bullet', tint: 0x00ffff,
  },
  twin: {
    id: 'twin', name: 'Twin Cannon', description: 'Two parallel shots', price: 100,
    cooldown: 300, damage: 1, speed: 480, count: 2, spreadDeg: 0, pierce: 0, homing: 0, lifetime: 0,
    texture: 'bullet', tint: 0x44ffff,
  },
  spread: {
    id: 'spread', name: 'Spread Shot', description: 'Three shots in a fan', price: 200,
    cooldown: 400, damage: 1, speed: 450, count: 3, spreadDeg: 15, pierce: 0, homing: 0, lifetime: 0,
    texture: 'bullet', tint: 0x66ff99,
  },
  rapid: {
    id: 'rapid', name: 'Rapid Blaster', description: 'Fast fire rate', price: 300,
    cooldown: 150, damage: 1, speed: 550, count: 1, spreadDeg: 0, pierce: 0, homing: 0, lifetime: 0,
    texture: 'bullet', tint: 0xffff44,
  },
  laser: {
    id: 'laser', name: 'Piercing Laser', description: 'Pierces up to 4 enemies', price: 400,
    cooldown: 500, damage: 2, speed: 700, count: 1, spreadDeg: 0, pierce: 3, homing: 0, lifetime: 0,
    texture: 'laser', tint: 0xff66ff,
  },
  missile: {
    id: 'missile', name: 'Homing Missile', description: 'Seeks nearest enemy', price: 600,
    cooldown: 800, damage: 3, speed: 350, count: 1, spreadDeg: 0, pierce: 0, homing: 5, lifetime: 4000,
    texture: 'missile', tint: 0xffaa33,
  },
  plasma: {
    id: 'plasma', name: 'Plasma Cannon', description: 'Heavy damage, slow fire', price: 800,
    cooldown: 1000, damage: 5, speed: 400, count: 1, spreadDeg: 0, pierce: 2, homing: 0, lifetime: 0,
    texture: 'laser', tint: 0xff0088,
  },
};

export const DEFAULT_WEAPON = 'blaster';
export const WEAPON_ORDER = Object.keys(WEAPONS);

export function getWeapon(id) {
  return Object.hasOwn(WEAPONS, id) ? WEAPONS[id] : WEAPONS[DEFAULT_WEAPON];
}