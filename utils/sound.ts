
import { Temperature } from '../types';

// Simple synth wrapper using Web Audio API
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;
let isMuted = false;

export const setGlobalMute = (muted: boolean) => {
  isMuted = muted;
};

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

const playTone = (freq: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
  if (isMuted) return;
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context might be blocked or not supported
  }
};

export const playGuessSound = (temp: Temperature) => {
  if (isMuted) return;
  switch (temp) {
    case Temperature.BURNING:
      playTone(600, 'sine', 0.1);
      setTimeout(() => playTone(800, 'sine', 0.2), 50);
      setTimeout(() => playTone(1200, 'square', 0.3), 100);
      break;
    case Temperature.HOT:
      playTone(500, 'sine', 0.15);
      setTimeout(() => playTone(700, 'sine', 0.2), 100);
      break;
    case Temperature.WARM:
      playTone(400, 'triangle', 0.2);
      break;
    case Temperature.COLD:
      playTone(200, 'sine', 0.3);
      break;
    case Temperature.FREEZING:
      playTone(100, 'sawtooth', 0.3, 0.05);
      break;
    case Temperature.SOLVED:
      // Fanfare handled in playWinSound
      break;
  }
};

export const playWinSound = () => {
  if (isMuted) return;
  const now = getContext().currentTime;
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 'triangle', 0.4, 0.2), i * 100);
  });
};