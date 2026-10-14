// First-run hints. Each id is shown once, then remembered in the save file.
export const HINT_IDS = ['move', 'kill', 'coin'];

export const COIN_HINT = 'Collect credits to unlock\nnew weapons in the ARMORY';
export const ZONE_NOTE = '(Your ship operates in the lower sector)';

export function moveHint(isTouch, mode) {
  if (!isTouch) return 'Arrow keys or WASD to move\n(or hold mouse in lower sector)';
  if (mode === 'fixed') return 'Use the stick at bottom-left\nto move your ship';
  if (mode === 'drag') return 'Slide finger on lower sector\nand the ship follows';
  return 'Hold lower sector and slide\nto move your ship';
}