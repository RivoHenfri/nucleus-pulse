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

import { speak, silence as silenceSynth } from './voice';
import type { Lang } from '../i18n';
import LINES from '../narration/lines.json';

type LineId = keyof (typeof LINES.languages)['en'];

const TEXT = LINES.languages as Record<string, Record<string, string>>;

let enabled = true;
let lang: Lang = 'en';
let pending: ReturnType<typeof setTimeout>[] = [];

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

const play = (id: string) => {
  if (!enabled) return;
  const text = TEXT[lang]?.[id];
  const audio = element();
  if (!audio) {
    if (text) speak(text);
    return;
  }

  try {
    audio.pause();
    audio.src = url(id);
    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().catch(() => {
      // Autoplay refused, or the file is missing — say it the plain way.
      if (text) speak(text);
    });
  } catch {
    if (text) speak(text);
  }
};

/** Speak one recorded line, optionally after a delay so it lands with its animation. */
export const narrate = (id: LineId | string, delay = 0): void => {
  if (!enabled) return;
  if (delay > 0) {
    pending.push(setTimeout(() => play(id), delay));
  } else {
    play(id);
  }
};

/** Cut the narration off — call when leaving a scene. */
export const hush = (): void => {
  pending.forEach(clearTimeout);
  pending = [];
  if (voice) {
    try {
      voice.pause();
      voice.currentTime = 0;
    } catch {
      // ignore
    }
  }
  silenceSynth();
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
