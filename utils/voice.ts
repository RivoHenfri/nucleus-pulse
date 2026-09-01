// THE PULSE SPEAKS — narration through the browser's own speech engine.
// No audio files, no TTS bill, works offline. Pitched down and slowed so the
// voice sits somewhere between a mentor and something older than the room.

let enabled = true;
let cachedVoices: SpeechSynthesisVoice[] = [];

const synth = (): SpeechSynthesis | null => {
  try {
    return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  } catch {
    return null;
  }
};

// Voices load asynchronously in most browsers — warm the list up early.
const warm = () => {
  const s = synth();
  if (!s) return;
  const load = () => {
    cachedVoices = s.getVoices();
  };
  load();
  s.addEventListener?.('voiceschanged', load);
};
warm();

/** Rough language guess so an Indonesian answer is not read with an English mouth. */
export const guessLang = (text: string): 'id-ID' | 'en-US' => {
  const t = ` ${text.toLowerCase()} `;
  const markers = [
    ' yang ', ' tidak ', ' saya ', ' kamu ', ' dan ', ' untuk ', ' dengan ', ' karena ',
    ' sudah ', ' belum ', ' bukan ', ' apa ', ' ini ', ' itu ', ' kerja', ' waktu ',
    ' nggak ', ' gak ', ' bikin ', ' harus ', ' sekarang ', ' besok ', ' jangan ',
  ];
  return markers.some(m => t.includes(m)) ? 'id-ID' : 'en-US';
};

/** Prefer a deep voice; fall back to whatever the device has for that language. */
const voiceFor = (lang: string): SpeechSynthesisVoice | null => {
  const s = synth();
  if (!s) return null;
  if (cachedVoices.length === 0) cachedVoices = s.getVoices();
  const forLang = cachedVoices.filter(v => v.lang?.toLowerCase().startsWith(lang.slice(0, 2)));
  const pool = forLang.length ? forLang : cachedVoices;
  const deep = pool.find(v => /male|david|daniel|arthur|google.*(uk|us)/i.test(v.name));
  return deep ?? pool[0] ?? null;
};

export interface SpeakOptions {
  /** Stop whatever is being said first. Default true — scenes should not overlap. */
  interrupt?: boolean;
  /** Slower than life. Default 0.78. */
  rate?: number;
  /** Below natural. Default 0.7. */
  pitch?: number;
  /** Override the language guess. */
  lang?: string;
  /** Wait this many ms before speaking, so the line lands with its animation. */
  delay?: number;
}

let pending: ReturnType<typeof setTimeout>[] = [];

/** Say one line in the Pulse's voice. Silently does nothing where unsupported. */
export const speak = (text: string, opts: SpeakOptions = {}): void => {
  const s = synth();
  if (!s || !enabled || !text.trim()) return;

  const run = () => {
    try {
      if (opts.interrupt !== false) s.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = opts.lang ?? guessLang(text);
      const v = voiceFor(u.lang);
      if (v) u.voice = v;
      u.rate = opts.rate ?? 0.78;
      u.pitch = opts.pitch ?? 0.7;
      u.volume = 1;
      s.speak(u);
    } catch {
      // narration is decorative — never break the experience
    }
  };

  if (opts.delay) {
    pending.push(setTimeout(run, opts.delay));
  } else {
    run();
  }
};

/** Speak several lines in sequence, each after its own delay. */
export const speakSequence = (lines: { text: string; delay: number }[]): void => {
  lines.forEach(({ text, delay }, i) => speak(text, { delay, interrupt: i === 0 }));
};

/** Cut the voice off — call when leaving a scene. */
export const silence = (): void => {
  pending.forEach(clearTimeout);
  pending = [];
  try {
    synth()?.cancel();
  } catch {
    // ignore
  }
};

export const setVoiceEnabled = (on: boolean): void => {
  enabled = on;
  if (!on) silence();
};

export const isVoiceSupported = (): boolean => synth() !== null;
