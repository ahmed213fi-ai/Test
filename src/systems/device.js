// True when the main pointer is a finger (phones, tablets), false for mouse/keyboard machines.
export function isTouchDevice() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer: coarse)').matches;
}
