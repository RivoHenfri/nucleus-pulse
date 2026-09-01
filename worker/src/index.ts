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
const MAX_TOKENS = 120;
/** Hard ceiling on what a caller may send us — a signal is one sentence. */
const MAX_INPUT_CHARS = 400;

type Body =
  | { kind: 'comment'; signal: string }
  | { kind: 'summons'; who: string; caught: number; total: number };

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
- Write in the SAME language they used (Indonesian if Indonesian, English if English).
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
- Bilingual in ONE line: Indonesian first, then " / ", then English.
- No greeting, no names, no hashtags, no emoji.

Reply with the dare line only.
  `.trim();
};

const parseBody = (raw: unknown): Body | null => {
  if (typeof raw !== 'object' || raw === null) return null;
  const b = raw as Record<string, unknown>;

  if (b.kind === 'comment') {
    const signal = typeof b.signal === 'string' ? b.signal.trim().slice(0, MAX_INPUT_CHARS) : '';
    return signal ? { kind: 'comment', signal } : null;
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
    };
  }

  return null;
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
