// THE PULSE'S RECORDED VOICE.
//
// Every fixed line in the experience was rendered once by openai/gpt-audio-mini
// (see narration/generate.py) and lives in public/narration/*.wav. Playing a
// file costs nothing, starts instantly, and sounds like a person — none of
// which is true of generating it live or of the browser's own speech engine.
//
// The browser engine stays as the fallback: if a file is missing or blocked,
// the line is still spoken, just less beautifully. Nobody hits silence.

import { speak, silence as silenceSynth } from './voice';
import type { Lang } from '../i18n';
import LINES from '../narration/lines.json';

type LineId = keyof (typeof LINES.languages)['en'];

const TEXT = LINES.languages as Record<string, Record<string, string>>;

let enabled = true;
let lang: Lang = 'en';
let current: HTMLAudioElement | null = null;
let pending: ReturnType<typeof setTimeout>[] = [];

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
  const text = TEXT[lang]?.[id];
  if (!enabled) return;

  try {
    stopCurrent();
    const audio = new Audio(url(id));
    audio.volume = 1;
    current = audio;
    audio.play().catch(() => {
      // Autoplay refused, or the file is missing — say it the plain way.
      if (text) speak(text);
    });
    audio.addEventListener('error', () => {
      if (text) speak(text);
    });
  } catch {
    if (text) speak(text);
  }
};

const stopCurrent = () => {
  if (!current) return;
  try {
    current.pause();
    current.currentTime = 0;
  } catch {
    // ignore
  }
  current = null;
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

/** Schedule a run of lines for one scene. */
export const narrateSequence = (lines: { id: LineId | string; delay: number }[]): void => {
  lines.forEach(({ id, delay }) => narrate(id, delay));
};

/** Cut the narration off — call when leaving a scene. */
export const hush = (): void => {
  pending.forEach(clearTimeout);
  pending = [];
  stopCurrent();
  silenceSynth();
};

export const setNarrationEnabled = (on: boolean): void => {
  enabled = on;
  if (!on) hush();
};

/**
 * Play a line the Worker just spoke for this participant alone.
 *
 * It arrives as base64 PCM16 because that is the only format OpenRouter streams;
 * we put a WAV header in front of it and hand it to an <audio> element.
 * Falls back to the browser's own voice if anything about that fails.
 */
export const playSpokenReply = (pcm: Uint8Array, sampleRate = 24000, fallbackText = ''): void => {
  if (!enabled) return;
  try {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    const ascii = (offset: number, text: string) => {
      for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
    };
    ascii(0, 'RIFF');
    view.setUint32(4, 36 + pcm.length, true);
    ascii(8, 'WAVE');
    ascii(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);          // PCM
    view.setUint16(22, 1, true);          // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    ascii(36, 'data');
    view.setUint32(40, pcm.length, true);

    const blob = new Blob([header, pcm], { type: 'audio/wav' });
    stopCurrent();
    const audio = new Audio(URL.createObjectURL(blob));
    current = audio;
    audio.play().catch(() => {
      if (fallbackText) speak(fallbackText);
    });
  } catch {
    if (fallbackText) speak(fallbackText);
  }
};

/**
 * Warm the audio pipeline on the first tap. Mobile browsers only allow sound
 * that a gesture asked for, so we play a silent moment while we have permission.
 */
export const unlockAudio = (): void => {
  try {
    const a = new Audio(url('lock-1'));
    a.volume = 0;
    a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
  } catch {
    // ignore
  }
};
