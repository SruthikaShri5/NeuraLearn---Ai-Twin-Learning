/**
 * NeuraLearn Haptic Feedback - Vibration API patterns
 */

const PATTERNS = {
  correct: [50, 30, 100],        // short-pause-long = success
  wrong: [200, 100, 200],        // two long pulses = error
  complete: [50, 50, 50, 50, 200], // rapid then long = celebration
  click: [20],                   // tiny tap
  warning: [100, 50, 100, 50, 100], // triple pulse = warning
  breathe_in: [3000],            // long continuous = inhale
  breathe_out: [100, 50, 100],   // gentle = exhale
};

let intensity = 'medium'; // off | medium | full

export function setHapticIntensity(level) {
  intensity = level;
}

export function vibrate(patternName = 'click') {
  if (intensity === 'off') return;
  if (!('vibrate' in navigator)) return;

  const pattern = PATTERNS[patternName] || PATTERNS.click;

  // Scale pattern duration based on intensity
  const scaled = intensity === 'full'
    ? pattern.map((v, i) => i % 2 === 0 ? Math.min(v * 1.5, 500) : v)
    : pattern;

  try {
    navigator.vibrate(scaled);
  } catch {}
}

export function stopVibration() {
  try { navigator.vibrate(0); } catch {}
}

export function isHapticSupported() {
  return 'vibrate' in navigator;
}
