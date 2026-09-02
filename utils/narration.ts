// THE PULSE'S RECORDED VOICE.
//
// Every fixed line in the experience was rendered once by openai/gpt-audio-mini
// (see narration/generate.py) and lives in public/narration/<lang>/*.wav.
// Playing a file costs nothing, starts instantly, and sounds like a person —
// none of which is true of generating it live or of the browser's own speech
// engine. The browser engine stays as the fallback: if a file is missing or
// blocked, the line is still spoken, just less beautifully. Nobody hits
// silence.
//
// ONE ELEMENT, REUSED.
//
// This used to do `new Audio(url)` per line, which works on a desktop and is
// silent on a phone. iOS grants playback permission to the specific media
// element that a user gesture touched, not to the page — so the first line
// might play and every element created afterwards is refused. Since almost all
// of the narration is created on timers rather than on taps, that meant the
// voice disappeared from the first round onward, on the platform this thing is
// built for.
//
// So there is exactly one element for the whole run. The language choice on
// the first screen unlocks it, and every line after that swaps its `src`.
//
// AND IT IS A QUEUE.
//
// Scene beats are scaled by PACE; the audio files are not, and cannot be. Cue
// a line while the previous one is still speaking and the element simply cuts
// the first one off mid-sentence — which is what "the voice doesn't match the
// screen" actually sounds like, and it gets worse every time the tempo is
// tightened. So a cue does not play a line, it joins a queue: whatever is
// speaking finishes, then the next line starts. The visuals keep their own
// timing, and the voice stays a voice.

import { speak, silence as silenceSynth } from './voice';
import type { Lang } from '../i18n';
import LINES from '../narration/lines.json';

type LineId = keyof (typeof LINES.languages)['en'];

const TEXT = LINES.languages as Record<string, Record<string, string>>;

let enabled = true;
let lang: Lang = 'en';
let pending: ReturnType<typeof setTimeout>[] = [];

/** Lines cued but not yet spoken, in the order they were asked for. */
let queue: string[] = [];
let speaking = false;
/** Callers waiting for the voice to finish everything it was given. */
let waiting: (() => void)[] = [];
/** A breath between one line and the next, so they do not run together. */
const GAP_MS = 220;

/** The single element the whole run speaks through. */
let voice: HTMLAudioElement | null = null;

const element = (): HTMLAudioElement | null => {
  if (voice) return voice;
  try {
    voice = new Audio();
    voice.preload = 'auto';
    return voice;
  } catch {
    return null;
  }
};

const url = (id: string): string => {
  // Vite rewrites BASE_URL to /nucleus-pulse/ in production.
  const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  return `${base}narration/${lang}/${id}.wav`;
};

/** Everything spoken from here on is in this language. */
export const setNarrationLang = (next: Lang): void => {
  lang = next;
};

/** Take the next line off the queue, or fall idle. */
const pump = () => {
  if (!enabled || speaking) return;
  const id = queue.shift();
  if (!id) {
    // Nothing left to say. Anyone gated on the voice can move.
    const due = waiting;
    waiting = [];
    due.forEach(cb => cb());
    return;
  }

  const text = TEXT[lang]?.[id];
  const audio = element();
  if (!audio) {
    if (text) speak(text);
    return;
  }

  const next = () => {
    speaking = false;
    pending.push(setTimeout(pump, GAP_MS));
  };

  try {
    speaking = true;
    audio.onended = next;
    audio.src = url(id);
    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().catch(() => {
      // Autoplay refused, or the file is missing — say it the plain way and
      // keep the queue moving rather than stalling every line behind it.
      if (text) speak(text);
      next();
    });
  } catch {
    if (text) speak(text);
    next();
  }
};

const enqueue = (id: string) => {
  if (!enabled) return;
  queue.push(id);
  pump();
};

/** Speak one recorded line, optionally after a delay so it lands with its animation. */
export const narrate = (id: LineId | string, delay = 0): void => {
  if (!enabled) return;
  if (delay > 0) {
    pending.push(setTimeout(() => enqueue(id), delay));
  } else {
    enqueue(id);
  }
};

/** Cut the narration off — call when leaving a scene. */
export const hush = (): void => {
  pending.forEach(clearTimeout);
  pending = [];
  queue = [];
  speaking = false;
  waiting = [];
  if (voice) {
    try {
      voice.onended = null;
      voice.pause();
      voice.currentTime = 0;
    } catch {
      // ignore
    }
  }
  silenceSynth();
};

/**
 * Run something once the voice has said everything cued so far.
 *
 * A scene's beats are scaled by PACE and its narration is not, so at a tight
 * tempo the way out of a scene can appear while the voice is still three lines
 * from finishing — and taking it cuts the Pulse off mid-sentence. Scenes that
 * end on a spoken line wait for this instead of for a timer.
 *
 * Fires immediately when nothing is speaking, and is dropped by hush().
 */
export const whenQuiet = (cb: () => void): void => {
  if (!enabled || (!speaking && queue.length === 0)) {
    cb();
    return;
  }
  waiting.push(cb);
};

export const setNarrationEnabled = (on: boolean): void => {
  enabled = on;
  if (!on) hush();
};

/**
 * Claim playback permission while a gesture is still in hand.
 *
 * Called from the language choice on the first screen — the only tap that
 * happens before the experience starts speaking on its own schedule. Playing a
 * real, muted line is what marks the element as user-activated; a src-less
 * element is not enough on iOS.
 *
 * An earlier version pointed this at a line id that no longer exists after the
 * rebuild, so it 404'd and unlocked nothing at all. It now uses the first line
 * the participant is actually about to hear, which is also warm in the cache
 * by the time it is wanted.
 */
export const unlockAudio = (): void => {
  const audio = element();
  if (!audio) return;
  try {
    audio.src = url('enter-1');
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
      })
      .catch(() => {
        audio.volume = 1;
      });
  } catch {
    // Audio is part of the experience, never a precondition for it.
  }
};
