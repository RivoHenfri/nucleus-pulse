// THE FOCUS BED — the sound under the two choosing rounds.
//
// A low drone, a pair of oscillators detuned into a slow beat, filtered room
// noise, and a heartbeat that quickens as the timer drains. It is a mood
// device, not a medical one: it narrows the room and raises the stakes, which
// is exactly what Signal vs Noise needs while someone is deciding.
//
// Built live with Web Audio — no files, no loading, works offline.

import { audioContext } from './sound';

interface Bed {
  master: GainNode;
  nodes: { stop: () => void }[];
  heartbeat: ReturnType<typeof setInterval> | null;
  urgency: number;
}

let bed: Bed | null = null;
let enabled = true;

const BASE_VOLUME = 0.16;

/** Brown-ish noise: softer and rounder than white, reads as "room". */
const noiseBuffer = (ac: AudioContext): AudioBuffer => {
  const len = ac.sampleRate * 2;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buf;
};

const thump = (ac: AudioContext, out: GainNode, at: number, strength: number) => {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(64, at);
  osc.frequency.exponentialRampToValueAtTime(38, at + 0.16);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(strength, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
  osc.connect(gain);
  gain.connect(out);
  osc.start(at);
  osc.stop(at + 0.32);
};

/** Start the bed. Safe to call twice — the second call is ignored. */
export const startFocusBed = (): void => {
  if (bed || !enabled) return;
  const ac = audioContext();
  if (!ac) return;

  try {
    const master = ac.createGain();
    master.gain.setValueAtTime(0.0001, ac.currentTime);
    master.gain.exponentialRampToValueAtTime(BASE_VOLUME, ac.currentTime + 2.5);
    master.connect(ac.destination);

    const nodes: { stop: () => void }[] = [];

    // Sub drone — felt more than heard.
    const sub = ac.createOscillator();
    const subGain = ac.createGain();
    sub.type = 'sine';
    sub.frequency.value = 42;
    subGain.gain.value = 0.5;
    sub.connect(subGain).connect(master);
    sub.start();
    nodes.push({ stop: () => sub.stop() });

    // Two tones, eight cycles apart. The ear hears one tone that breathes.
    const pair: [number, number][] = [[104, -1], [112, 1]];
    pair.forEach(([freq, pan]) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.16;
      if (typeof ac.createStereoPanner === 'function') {
        const panner = ac.createStereoPanner();
        panner.pan.value = pan;
        osc.connect(gain).connect(panner).connect(master);
      } else {
        osc.connect(gain).connect(master);
      }
      osc.start();
      nodes.push({ stop: () => osc.stop() });
    });

    // Room tone, rolled right off so it never hisses.
    const noise = ac.createBufferSource();
    noise.buffer = noiseBuffer(ac);
    noise.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    const noiseGain = ac.createGain();
    noiseGain.gain.value = 0.35;
    noise.connect(filter).connect(noiseGain).connect(master);
    noise.start();
    nodes.push({ stop: () => noise.stop() });

    bed = { master, nodes, heartbeat: null, urgency: 0 };

    // Heartbeat — 52 bpm at rest, 108 bpm when the clock is nearly out.
    const beat = () => {
      const b = bed;
      if (!b) return;
      const ctxNow = ac.currentTime;
      const strength = 0.22 + b.urgency * 0.5;
      thump(ac, b.master, ctxNow, strength);
      thump(ac, b.master, ctxNow + 0.19, strength * 0.55);
    };
    const schedule = () => {
      const b = bed;
      if (!b) return;
      const bpm = 52 + b.urgency * 56;
      b.heartbeat = setTimeout(() => {
        beat();
        schedule();
      }, (60 / bpm) * 1000) as unknown as ReturnType<typeof setInterval>;
    };
    beat();
    schedule();
  } catch {
    bed = null;
  }
};

/** 0 = calm, 1 = the clock is about to run out. */
export const setUrgency = (value: number): void => {
  if (!bed) return;
  bed.urgency = Math.max(0, Math.min(1, value));
  const ac = audioContext();
  if (!ac) return;
  try {
    // The room closes in a little as time runs out.
    bed.master.gain.linearRampToValueAtTime(BASE_VOLUME * (1 + bed.urgency * 0.5), ac.currentTime + 0.6);
  } catch {
    // ignore
  }
};

/** Fade out and tear down. Safe to call when nothing is playing. */
export const stopFocusBed = (): void => {
  const b = bed;
  if (!b) return;
  bed = null;
  const ac = audioContext();
  try {
    if (b.heartbeat) clearTimeout(b.heartbeat as unknown as ReturnType<typeof setTimeout>);
    if (ac) {
      b.master.gain.cancelScheduledValues(ac.currentTime);
      b.master.gain.setValueAtTime(Math.max(b.master.gain.value, 0.0001), ac.currentTime);
      b.master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 1.2);
    }
    setTimeout(() => {
      b.nodes.forEach(n => {
        try {
          n.stop();
        } catch {
          // already stopped
        }
      });
      try {
        b.master.disconnect();
      } catch {
        // ignore
      }
    }, 1400);
  } catch {
    // ignore
  }
};

export const setAmbienceEnabled = (on: boolean): void => {
  enabled = on;
  if (!on) stopFocusBed();
};
