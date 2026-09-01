// Tiny Web-Audio sound kit — no external assets, works offline.

let audioCtx: AudioContext | null = null;

/** One shared context for blips, the focus bed, everything. */
export const audioContext = (): AudioContext | null => ctx();

const ctx = (): AudioContext | null => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
};

const tone = (freq: number, duration: number, volume = 0.2, type: OscillatorType = 'sine', when = 0) => {
  const ac = ctx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.value = freq;
    const t = ac.currentTime + when;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration);
  } catch {
    // audio is decorative — never break the experience
  }
};

/** Soft notification blip (ordinary cards) */
export const ping = () => tone(880, 0.12, 0.12);

/** Sharp attention-grabbing notification (loud cards) */
export const pingLoud = () => {
  tone(1240, 0.1, 0.18, 'square');
  tone(1240, 0.1, 0.14, 'square', 0.14);
};

/** Selection tap */
export const tap = () => tone(660, 0.08, 0.15, 'triangle');

/** Heavy LOCK thunk */
export const lockThunk = () => {
  tone(110, 0.5, 0.35, 'sawtooth');
  tone(55, 0.7, 0.3, 'sine', 0.05);
};

/** Rising reveal shimmer */
export const shimmer = () => {
  tone(520, 0.3, 0.12);
  tone(780, 0.3, 0.12, 'sine', 0.12);
  tone(1040, 0.45, 0.12, 'sine', 0.24);
};

/** Deep gravity drone */
export const drone = () => tone(70, 1.8, 0.25, 'sawtooth');

/** Final pulseback confirmation */
export const pulseConfirm = () => {
  tone(392, 0.25, 0.15);
  tone(523, 0.25, 0.15, 'sine', 0.18);
  tone(784, 0.6, 0.18, 'sine', 0.36);
};

/** Haptic nudge — silently ignored where unsupported */
export const buzz = (pattern: number | number[] = 30) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // ignore
  }
};
