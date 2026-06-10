/**
 * NeuraLearn TTS (Text-to-Speech) utility
 * Adaptive voice speed based on detected emotion state.
 *
 * Speed mapping:
 *   frustrated / confused → 0.8x  (slow down, be patient)
 *   bored                 → 1.2x  (speed up, re-engage)
 *   happy / excited       → 1.0x  (normal, energetic)
 *   tired                 → 0.85x (gentle, calm)
 *   neutral / focused     → 0.9x  (clear, steady)
 */

import { useAppStore } from "./store";

const EMOTION_RATE = {
  frustrated: 0.8,
  confused:   0.8,
  tired:      0.85,
  neutral:    0.9,
  focused:    0.9,
  happy:      1.0,
  excited:    1.0,
  bored:      1.2,
};

/**
 * Get the adaptive TTS rate based on current emotion state.
 */
export function getAdaptiveRate() {
  const emotion = useAppStore.getState().emotionState || "neutral";
  return EMOTION_RATE[emotion] ?? 0.9;
}

/**
 * Speak text with adaptive rate.
 * @param {string} text
 * @param {object} options - override { rate, pitch, volume }
 */
export function speak(text, options = {}) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(text);
  utt.rate   = options.rate   ?? getAdaptiveRate();
  utt.pitch  = options.pitch  ?? 1;
  utt.volume = options.volume ?? 1;

  window.speechSynthesis.speak(utt);
}

/**
 * Stop any ongoing speech.
 */
export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

/**
 * Check if TTS is supported.
 */
export function isTTSSupported() {
  return "speechSynthesis" in window;
}
