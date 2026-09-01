// The Pulse's voice. Both lines are written by Gemini 2.5 Flash, but the call
// goes through our own Cloudflare Worker — the API key never reaches the browser.
// If the oracle is unreachable (offline room, cold Worker), the experience still
// completes on the fallback lines.

const ORACLE_URL = process.env.ORACLE_URL || '';

const FALLBACK_COMMENTS = [
  'You already knew this signal mattered — you just proved the noise was louder. What changes tomorrow morning?',
  'The signal was never missing. It was waiting for you to stop scrolling past it.',
  'Naming it is the easy part. The Pulse is watching what you do with it on Monday.',
];

const FALLBACK_SUMMONS = [
  'Kalian kira kalian yang pilih apa yang dilihat? Buktikan 6 menit. / You think you choose what you look at? Prove it in 6 minutes.',
  'Jangan balas di grup. Masuk, lalu lapor angkanya. / Do not reply here. Enter, then report your number.',
  'Satu ruangan, delapan sinyal, tiga puluh detik. Berani? / One room, eight signals, thirty seconds. Dare?',
];

const pick = (list: string[]): string => list[Math.floor(Math.random() * list.length)];

const ask = async (payload: Record<string, unknown>): Promise<string> => {
  if (!ORACLE_URL) throw new Error('ORACLE_URL not configured');
  const res = await fetch(ORACLE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Oracle ${res.status}`);
  const data = (await res.json()) as { text?: string };
  const text = (data.text ?? '').trim();
  if (!text) throw new Error('Empty response');
  return text;
};

/** A short, piercing "tough comment" on the signal the participant named. */
export const generateToughComment = async (signal: string): Promise<string> => {
  try {
    return await ask({ kind: 'comment', signal });
  } catch (e) {
    console.warn('Tough comment unavailable, using fallback:', e);
    return pick(FALLBACK_COMMENTS);
  }
};

/** The bilingual dare that summons the next people into the experience. */
export const generateSummons = async (
  who: string,
  caught: number,
  total: number,
): Promise<string> => {
  try {
    return await ask({ kind: 'summons', who, caught, total });
  } catch (e) {
    console.warn('Summons unavailable, using fallback:', e);
    return pick(FALLBACK_SUMMONS);
  }
};
