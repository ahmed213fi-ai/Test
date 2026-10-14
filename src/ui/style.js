// Shared text style. `resolution: 2` keeps text crisp when the canvas is scaled up.
export const textStyle = (overrides = {}) => ({
  fontFamily: '"Orbitron", "Press Start 2P", monospace',
  fontSize: '16px',
  color: '#ffffff',
  resolution: 2,
  ...overrides,
});