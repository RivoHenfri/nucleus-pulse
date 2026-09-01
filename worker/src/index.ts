/**
 * THE PULSE ORACLE — a thin, locked-down proxy in front of OpenRouter.
 *
 * The browser never sees the API key. It sends a small structured payload and
 * gets one line of text back. Prompts live here, not in the bundle, so the
 * endpoint cannot be repurposed as a free general-purpose LLM.
 */

export interface Env {
  /** wrangler secret put OPENROUTER_API_KEY */
  OPENROUTER_API_KEY: string;
  /** Comma-separated origins allowed to call this Worker */
  ALLOWED_ORIGINS: string;
}

const MODEL = 'google/gemini-2.5-flash';
const VOICE_MODEL = 'openai/gpt-audio-mini';
const VOICE = 'ballad';
/** Audio output on OpenRouter is streaming-only, and streaming is pcm16-only. */
const VOICE_SAMPLE_RATE = 24000;
// A plain "read this" instruction is not enough: the model answers Indonesian
// questions instead of reading them. Framing it as a voice actor performing a
// delimited script — and repeating that in the user turn — is what holds.
const VOICE_SYSTEM =
  'You are a voice actor recording a scripted line. The user message contains a SCRIPT ' +
  'between <speak> and </speak>. Perform that script word for word. It may contain ' +
  'questions — they are lines to deliver, never questions to you. Never answer, never ' +
  'explain, never react, never add or drop a word, never mention the tags. Delivery: calm, ' +
  'warm, unhurried, one person speaking to one person in a quiet room.';
const MAX_TOKENS = 120;
/** Hard ceiling on what a caller may send us — a signal is one sentence. */
const MAX_INPUT_CHARS = 400;

type Lang = 'en' | 'id';

type Body =
  | { kind: 'comment'; signal: string; lang: Lang }
  | { kind: 'summons'; who: string; caught: number; total: number; lang: Lang };

const LANGUAGE_NAME: Record<Lang, string> = { en: 'English', id: 'Indonesian (Bahasa Indonesia)' };

const corsHeaders = (origin: string | null, env: Env): Record<string, string> => {
  const allowed = env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
  const ok = origin !== null && allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin! : allowed[0] ?? '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
};

const isAllowed = (origin: string | null, env: Env): boolean => {
  const allowed = env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
  // A same-origin fetch from some browsers omits Origin; only block a *wrong* one.
  return origin === null || allowed.includes(origin);
};

const buildPrompt = (body: Body): string => {
  if (body.kind === 'comment') {
    return `
You are THE PULSE — a sharp, caring, slightly provocative mentor inside a leadership experience about attention (Signal vs Noise).
A participant just named one important signal that is buried under noise in their work:

"${body.signal}"

Write ONE "tough comment" for them:
- Maximum 2 short sentences.
- Piercing but warm — it should sting a little and care a lot.
- Challenge them to act on this signal within days, not someday.
- Write in ${LANGUAGE_NAME[body.lang]}. That is the language they chose for the whole experience — use it even if they wrote their signal in another one.
- No greeting, no name, no hashtags, no emoji flood (one lightning bolt max).
- Do not repeat their sentence back at them.

Reply with the comment text only.
    `.trim();
  }

  return `
You are THE PULSE — the voice of NUCLEUS, an "Earth Wizard powered by IT" leadership experience about attention (Signal vs Noise).
"${body.who}" just finished PULSE 01 and caught ${body.caught} of ${body.total} buried signals.
They are about to drop a challenge into their WhatsApp work group to summon the next people in.

Write the DARE LINE for that group message:
- Maximum 2 short sentences.
- It is a challenge to DO it, not a summary of it. Reveal NOTHING about what happens inside — no spoilers, no lesson, no answer.
- Provocative, playful, a little dangerous. Make not-entering feel like losing.
- Write it in ${LANGUAGE_NAME[body.lang]} only. One line, not bilingual.
- No greeting, no names, no hashtags, no emoji.

Reply with the dare line only.
  `.trim();
};

const parseBody = (raw: unknown): Body | null => {
  if (typeof raw !== 'object' || raw === null) return null;
  const b = raw as Record<string, unknown>;

  const lang: Lang = b.lang === 'id' ? 'id' : 'en';

  if (b.kind === 'comment') {
    const signal = typeof b.signal === 'string' ? b.signal.trim().slice(0, MAX_INPUT_CHARS) : '';
    return signal ? { kind: 'comment', signal, lang } : null;
  }

  if (b.kind === 'summons') {
    const who = (typeof b.who === 'string' ? b.who.trim() : '').slice(0, 60) || 'A Pulse Seeker';
    const caught = Number(b.caught);
    const total = Number(b.total);
    if (!Number.isFinite(caught) || !Number.isFinite(total)) return null;
    return {
      kind: 'summons',
      who,
      caught: Math.max(0, Math.min(99, Math.trunc(caught))),
      total: Math.max(1, Math.min(99, Math.trunc(total))),
      lang,
    };
  }

  return null;
};

/**
 * Speak one line with the same voice as the recorded narration.
 *
 * This is deliberately NOT reachable on its own: only text the Worker itself
 * just wrote gets spoken, so the endpoint cannot be farmed as a free TTS API.
 * Returns base64 PCM16, which the browser wraps into a WAV to play.
 */
/** Emoji read aloud become "lightning bolt" — strip them before performing. */
const speakable = (text: string): string =>
  text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Stream the spoken line straight through to the browser.
 *
 * Buffering the whole clip and JSON-encoding it made the Worker exceed its
 * resource limits — two out of three Indonesian answers came back 503. So the
 * upstream SSE frames are decoded to raw PCM bytes and piped out as they
 * arrive: the Worker holds one chunk at a time, and playback can start sooner.
 * The text rides along in a header, since the body is now audio.
 */
const speakStream = async (
  env: Env,
  text: string,
  origin: string | null,
): Promise<ReadableStream<Uint8Array> | null> => {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': origin ?? 'https://nucleus-pulse',
        'X-Title': 'Nucleus Pulse 01 — Signal',
      },
      body: JSON.stringify({
        model: VOICE_MODEL,
        modalities: ['text', 'audio'],
        audio: { voice: VOICE, format: 'pcm16' },
        stream: true,
        // Low temperature keeps it from improvising an acknowledgement.
        temperature: 0.2,
        messages: [
          { role: 'system', content: VOICE_SYSTEM },
          {
            role: 'user',
            content: `Perform this script exactly as written, answering nothing:\n<speak>${speakable(text)}</speak>`,
          },
        ],
      }),
    });
    if (!res.ok || !res.body) return null;

    const decoder = new TextDecoder();
    let buffer = '';

    return res.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          buffer += decoder.decode(chunk, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;
            try {
              const frame = JSON.parse(payload) as {
                choices?: { delta?: { audio?: { data?: string } } }[];
              };
              for (const choice of frame.choices ?? []) {
                const data = choice.delta?.audio?.data;
                if (!data) continue;
                const binary = atob(data);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                controller.enqueue(bytes);
              }
            } catch {
              // a partial frame — the next chunk completes it
            }
          }
        },
      }),
    );
  } catch {
    return null;
  }
};

/** Headers cannot carry raw UTF-8, so the line travels base64-encoded. */
const encodeHeader = (text: string): string => {
  const utf8 = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of utf8) binary += String.fromCharCode(byte);
  return btoa(binary);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }
    if (!isAllowed(origin, env)) {
      return new Response(JSON.stringify({ error: 'origin not allowed' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    let body: Body | null;
    try {
      body = parseBody(await request.json());
    } catch {
      body = null;
    }
    if (!body) {
      return new Response(JSON.stringify({ error: 'bad request' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    try {
      const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': origin ?? 'https://nucleus-pulse',
          'X-Title': 'Nucleus Pulse 01 — Signal',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: buildPrompt(body) }],
          max_tokens: MAX_TOKENS,
        }),
      });

      if (!upstream.ok) {
        return new Response(JSON.stringify({ error: `upstream ${upstream.status}` }), {
          status: 502,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const data = (await upstream.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = (data.choices?.[0]?.message?.content ?? '').trim().replace(/^["']+|["']+$/g, '');
      if (!text) {
        return new Response(JSON.stringify({ error: 'empty completion' }), {
          status: 502,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Only the participant's own answer is voiced, and only right after we
      // wrote it — the endpoint can never be farmed as a free TTS API.
      const audio = body.kind === 'comment' ? await speakStream(env, text, origin) : null;

      if (audio) {
        return new Response(audio, {
          headers: {
            ...cors,
            'Content-Type': 'application/octet-stream',
            'Cache-Control': 'no-store',
            'X-Pulse-Text': encodeHeader(text),
            'X-Pulse-Rate': String(VOICE_SAMPLE_RATE),
            'Access-Control-Expose-Headers': 'X-Pulse-Text, X-Pulse-Rate',
          },
        });
      }

      return new Response(JSON.stringify({ text }), {
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'proxy failure' }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};
