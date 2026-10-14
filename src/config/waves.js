import { GAME, FORMATION } from './constants.js';
import { ENEMIES } from './enemies.js';

export function isBossWave(level) {
  return level % GAME.BOSS_EVERY === 0;
}

export function getWave(level) {
  const rows = Math.min(5 + Math.floor(level / 3), 7);
  const tankRows = Math.min(1 + Math.floor((level - 1) / 3), 2);
  const soldierRows = Math.min(1 + Math.floor((level - 1) / 2), 3);
  const eliteRows = level >= 8 ? Math.min(Math.floor((level - 8) / 4) + 1, 2) : 0;

  const layout = [];
  for (let r = 0; r < rows; r++) {
    if (r < tankRows) {
      layout.push('tank');
    } else if (r < tankRows + soldierRows) {
      layout.push('soldier');
    } else if (r < tankRows + soldierRows + eliteRows) {
      layout.push('elite');
    } else {
      layout.push('drone');
    }
  }

  return {
    level,
    rows,
    cols: FORMATION.COLS,
    layout,
    startY: FORMATION.START_Y + Math.min(level - 1, 5) * 6,
    stepInterval: Math.max(250, 750 - (level - 1) * 35),
    fireInterval: Math.max(350, 1100 - (level - 1) * 50),
    alienBulletSpeed: Math.round(Math.min(380, 160 + (level - 1) * 12) * GAME.ALIEN_BULLET_SPEED_MULT),
    volley: Math.min(4, 1 + Math.floor((level - 1) / 3)),
    boss: isBossWave(level),
  };
}

export function getBossWave(level) {
  return {
    level,
    rows: 1,
    cols: 1,
    layout: ['boss'],
    startY: 100,
    stepInterval: 1000,
    fireInterval: 800,
    alienBulletSpeed: 200,
    volley: 3,
    boss: true,
  };
}