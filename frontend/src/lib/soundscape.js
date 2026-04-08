/**
 * NeuraLearn Soundscape - Web Audio API ambient sound engine
 * Generates procedural ambient sounds without external files
 */

let audioCtx = null;
let masterGain = null;
let activeNodes = [];
let isPlaying = false;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    masterGain.gain.value = 0.3;
  }
  return audioCtx;
}

function createOscillator(freq, type = 'sine', gainVal = 0.05) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = gainVal;
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  return { osc, gain };
}

function createBrownNoise(gainVal = 0.02) {
  const ctx = getCtx();
  const bufferSize = 4096;
  let lastOut = 0;
  const node = ctx.createScriptProcessor(bufferSize, 1, 1);
  node.onaudioprocess = (e) => {
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
  };
  const gain = ctx.createGain();
  gain.gain.value = gainVal;
  node.connect(gain);
  gain.connect(masterGain);
  return { node, gain };
}

// Soundscape presets
const PRESETS = {
  focus: {
    label: 'Focus Flow',
    description: 'Binaural-style tones for deep concentration',
    build: () => {
      // Base drone + slight detuned second for binaural effect
      const n1 = createOscillator(200, 'sine', 0.04);
      const n2 = createOscillator(204, 'sine', 0.04); // 4Hz binaural beat
      const n3 = createOscillator(100, 'sine', 0.02);
      // Brown noise for background
      const noise = createBrownNoise(0.015);
      return [n1, n2, n3, noise];
    },
  },
  calm: {
    label: 'Calm Waters',
    description: 'Gentle waves and soft tones',
    build: () => {
      const ctx = getCtx();
      // Slow LFO modulated tone
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 180;
      lfo.type = 'sine';
      lfo.frequency.value = 0.1; // very slow modulation
      lfoGain.gain.value = 20;
      gain.gain.value = 0.05;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      lfo.start();
      const noise = createBrownNoise(0.02);
      return [{ osc, gain }, { osc: lfo, gain: lfoGain }, noise];
    },
  },
  energize: {
    label: 'Energize',
    description: 'Uplifting tones to boost motivation',
    build: () => {
      const n1 = createOscillator(261.63, 'triangle', 0.03); // C4
      const n2 = createOscillator(329.63, 'triangle', 0.025); // E4
      const n3 = createOscillator(392.00, 'triangle', 0.02); // G4
      return [n1, n2, n3];
    },
  },
  nature: {
    label: 'Nature',
    description: 'Forest ambience with gentle wind',
    build: () => {
      const noise = createBrownNoise(0.03);
      const n1 = createOscillator(440, 'sine', 0.01);
      const n2 = createOscillator(880, 'sine', 0.005);
      return [noise, n1, n2];
    },
  },
};

export function getSoundscapePresets() {
  return Object.entries(PRESETS).map(([id, p]) => ({ id, label: p.label, description: p.description }));
}

export function playSoundscape(presetId = 'focus', volume = 50) {
  stopSoundscape();
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const preset = PRESETS[presetId] || PRESETS.focus;
    activeNodes = preset.build();
    masterGain.gain.value = (volume / 100) * 0.4;
    isPlaying = true;
  } catch (e) {
    console.warn('Soundscape error:', e);
  }
}

export function stopSoundscape() {
  activeNodes.forEach(({ osc, node }) => {
    try { (osc || node)?.stop?.(); } catch {}
    try { (osc || node)?.disconnect?.(); } catch {}
  });
  activeNodes = [];
  isPlaying = false;
}

export function setSoundscapeVolume(volume) {
  if (masterGain) {
    masterGain.gain.value = (volume / 100) * 0.4;
  }
}

export function isSoundscapePlaying() {
  return isPlaying;
}

// Play a short feedback sound
export function playFeedback(type = 'correct') {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'complete') {
      // Victory fanfare
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = f;
        g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        o.start(ctx.currentTime + i * 0.1);
        o.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    console.warn('Feedback sound error:', e);
  }
}
