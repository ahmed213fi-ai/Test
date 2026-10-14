// Enemy types. hp = hits to kill. coinChance = probability of dropping a coin pickup.
export const ENEMIES = {
  drone:   { texture: 'alienA', hp: 1, points: 10, coinChance: 0.10, coinValue: 1, speed: 1.0 },
  soldier: { texture: 'alienB', hp: 2, points: 20, coinChance: 0.18, coinValue: 2, speed: 0.9 },
  tank:    { texture: 'alienC', hp: 3, points: 30, coinChance: 0.30, coinValue: 3, speed: 0.7 },
  elite:   { texture: 'alienC', hp: 4, points: 50, coinChance: 0.40, coinValue: 5, speed: 0.8, tint: 0xff88ff },
  boss:    { texture: 'boss', hp: 20, points: 500, coinChance: 1.0, coinValue: 20, speed: 0.3, isBoss: true },
};

export const ENEMY_ORDER = ['drone', 'soldier', 'tank', 'elite', 'boss'];