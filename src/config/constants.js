// Central tuning knobs. Change numbers here, not in game code.

// Dev tools (switch weapons by tapping the weapon name or pressing 1-3). Set to false for release.
export const DEV = true;

export const W = 480;
export const H = 640;

export const GAME = {
  STARTING_LIVES: 3,
  MAX_DELTA_MS: 50,
  AUTO_FIRE: true,
  INVULN_MS: 1500,
  INTRO_MS: 1400,
  CLEAR_DELAY_MS: 1300,
  DEATH_DELAY_MS: 600,
  KEY_GUARD_MS: 250,
  WAVE_CLEAR_BONUS: 100,
  BOSS_EVERY: 5,
  ALIEN_BULLET_SPEED_MULT: 0.85,
  POWERUP_DROP_CHANCE: 0.08,
  POWERUP_DURATION: 10000,
};

export const PLAYER = {
  SPEED: 260,
  START_Y: H - 40,
  MARGIN: 16,
  MIN_Y: Math.round((H * 2) / 3),
  MAX_Y: H - 24,
};

export const CONTROL_MODES = ['floating', 'fixed', 'drag'];
export const TOUCH = {
  STICK_RADIUS: 54,
  THUMB_RADIUS: 22,
  DEADZONE: 0.12,
  ZONE_TOP: H / 2,
  FIXED_X: 84,
  FIXED_Y: H - 96,
  DRAG_GAIN: 1.0,
};

export const FORMATION = {
  COLS: 10,
  CELL_W: 40,
  CELL_H: 40,
  START_Y: 80,
  STEP_DX: 14,
  STEP_DY: 20,
  WALL_MARGIN: 20,
  LOSE_Y: H - 60,
  MIN_SPEED_RATIO: 0.15,
};

export const POOL = { PLAYER_BULLETS: 60, ALIEN_BULLETS: 40, PICKUPS: 40 };
export const PICKUP = { MAGNET_RADIUS: 100, MAGNET_SPEED: 350 };
export const ALIEN_BULLET_TINT = 0xff4444;
export const BULLET_BLINK = { COLORS: [0xff3333, 0xffee77], PERIOD_MS: 100 };

export const POWERUPS = {
  shield: { texture: 'powerup_shield', color: 0x00aaff, duration: 10000 },
  rapid: { texture: 'powerup_rapid', color: 0xffaa00, duration: 8000, fireRateMult: 0.5 },
  spread: { texture: 'powerup_spread', color: 0x00ff88, duration: 10000 },
  life: { texture: 'powerup_life', color: 0xff4488, heal: 1 },
};

export const PARTICLES = {
  EXPLOSION_COUNT: 20,
  SPARK_LIFESPAN: 500,
  TRAIL_LENGTH: 8,
};