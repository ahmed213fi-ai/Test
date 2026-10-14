import { POWERUPS } from './constants.js';

export const PICKUPS = {
  coin: {
    texture: 'coin',
    fall: 90,
    magnet: true,
    color: '#ffd23f',
    collect: (scene, value) => scene.addCoins(value),
  },
  shield: {
    texture: 'powerup_shield',
    fall: 60,
    magnet: true,
    color: '#00aaff',
    collect: (scene) => scene.activatePowerup('shield'),
  },
  rapid: {
    texture: 'powerup_rapid',
    fall: 60,
    magnet: true,
    color: '#ffaa00',
    collect: (scene) => scene.activatePowerup('rapid'),
  },
  spread: {
    texture: 'powerup_spread',
    fall: 60,
    magnet: true,
    color: '#00ff88',
    collect: (scene) => scene.activatePowerup('spread'),
  },
  life: {
    texture: 'powerup_life',
    fall: 50,
    magnet: true,
    color: '#ff4488',
    collect: (scene) => scene.activatePowerup('life'),
  },
};