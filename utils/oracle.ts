// The Pulse's voice. Both lines are written by Gemini 2.5 Flash, but the call
// goes through our own Cloudflare Worker — the API key never reaches the browser.
// If the oracle is unreachable (offline room, cold Worker), the experience still
// completes on the fallback lines.

import type { Lang } from '../i18n';

const ORACLE_URL = process.env.ORACLE_URL || '';

const FALLBACK_COMMENTS: Record<Lang, string[]> = {
  en: [
    'You already knew this signal mattered — you just proved the noise was louder. What changes tomorrow morning?',
    'The signal was never missing. It was waiting for you to stop scrolling past it.',
    'Naming it is the easy part. The Pulse is watching what you do with it on Monday.',
  ],
  id: [
    'Kamu sudah tahu sinyal ini penting — kamu baru saja membuktikan noise-nya lebih keras. Besok pagi, apa yang berubah?',
    'Sinyalnya tidak pernah hilang. Ia menunggu kamu berhenti melewatinya.',
    'Menyebutkannya bagian yang gampang. The Pulse menunggu apa yang kamu lakukan hari Senin.',
  ],
};

const FALLBACK_SUMMONS = [
  'Kalian kira kalian yang pilih apa yang dilihat? Buktikan 6 menit. / You think you choose what you look at? Prove it in 6 minutes.',
  'Jangan balas di grup. Masuk, lalu lapor angkanya. / Do not reply here. Enter, then report your number.',
  'Satu ruangan, delapan sinyal, tiga puluh detik. Berani? / One room, eight signals, thirty seconds. Dare?',
];

const pick = (list: string[]): string => list[Math.floor(Math.random() * list.length)];

export interface OracleReply {
  text: string;
  /** Raw PCM16 mono at `sampleRate`, when the Pulse also spoke the line. */
  audio?: Uint8Array;
  sampleRate?: number;
}

/** The spoken answer arrives as audio bytes with the text in a header. */
const decodeHeaderText = (encoded: string): string => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

const ask = async (payload: Record<string, unknown>): Promise<OracleReply> => {
  if (!ORACLE_URL) throw new Error('ORACLE_URL not configured');
  const res = await fetch(ORACLE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Oracle ${res.status}`);

  const spoken = res.headers.get('X-Pulse-Text');
  if (spoken) {
    const text = decodeHeaderText(spoken).trim();
    if (!text) throw new Error('Empty response');
    const audio = new Uint8Array(await res.arrayBuffer());
    return {
      text,
      audio: audio.length ? audio : undefined,
      sampleRate: Number(res.headers.get('X-Pulse-Rate')) || 24000,
    };
  }

  const data = (await res.json()) as { text?: string };
  const text = (data.text ?? '').trim();
  if (!text) throw new Error('Empty response');
  return { text };
};

/**
 * A short, piercing "tough comment" on the signal the participant named —
 * and, when the oracle is reachable, the Pulse speaking it aloud.
 */
export const generateToughComment = async (signal: string, lang: Lang = 'en'): Promise<OracleReply> => {
  try {
    return await ask({ kind: 'comment', signal, lang });
  } catch (e) {
    console.warn('Tough comment unavailable, using fallback:', e);
    return { text: pick(FALLBACK_COMMENTS[lang]) };
  }
};

/** The bilingual dare that summons the next people into the experience. */
export const generateSummons = async (
  who: string,
  caught: number,
  total: number,
  lang: Lang = 'en',
): Promise<string> => {
  try {
    return (await ask({ kind: 'summons', who, caught, total, lang })).text;
  } catch (e) {
    console.warn('Summons unavailable, using fallback:', e);
    return pick(FALLBACK_SUMMONS);
  }
};
