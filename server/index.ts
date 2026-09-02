// NUCLEUS PULSE — the room.
//
// A phone finishes a run and posts what happened. A facilitator's screen asks
// for the room and gets the shape of everyone in it. That is the whole API.
//
// What it will never hold: a name, an email, a device id, an IP. A response is
// two pairs of situation ids and up to two self-reported influences, tagged
// with a room code. The facilitator view aggregates; nothing individual is
// ever returned, which is the spec's guardrail — "never expose individual
// choices to other participants" — enforced by there being no endpoint that
// could.
//
// Bun + bun:sqlite: one process, one file on disk, no native modules to build.

import { Database } from 'bun:sqlite';

const PORT = Number(process.env.PORT ?? 3000);
const DB_PATH = process.env.DB_PATH ?? '/data/nucleus.sqlite';

/** Origins allowed to post responses. The app lives on GitHub Pages. */
const ORIGINS = new Set([
  'https://rivohenfri.github.io',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:4173',
]);

const SITUATIONS = new Set([
  'client', 'finance', 'people', 'engineering',
  'operations', 'hospitality', 'governance', 'ai',
]);
const INFLUENCES = new Set([
  'role', 'experience', 'urgency', 'impact', 'needed', 'information', 'instinct',
]);

// ---------------------------------------------------------------------------
// storage
// ---------------------------------------------------------------------------

const db = new Database(DB_PATH, { create: true });
db.exec('PRAGMA journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    code        TEXT PRIMARY KEY,
    key         TEXT NOT NULL,
    title       TEXT,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE TABLE IF NOT EXISTS responses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    room        TEXT NOT NULL REFERENCES rooms(code),
    lang        TEXT NOT NULL,
    first       TEXT NOT NULL,   -- JSON array of situation ids
    second      TEXT NOT NULL,
    influences  TEXT NOT NULL,   -- JSON array of influence ids
    changed     INTEGER NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX IF NOT EXISTS responses_room ON responses(room);
`);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Room codes avoid the letters people misread across a room. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const randomCode = (n = 4) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)), b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
const randomKey = () => crypto.randomUUID().replace(/-/g, '');

const json = (body: unknown, status = 200, origin = '') =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...cors(origin),
    },
  });

const cors = (origin: string) =>
  ORIGINS.has(origin)
    ? {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type,x-facilitator-key',
        'access-control-max-age': '86400',
        vary: 'origin',
      }
    : {};

const ids = (v: unknown, allowed: Set<string>, max: number): string[] | null => {
  if (!Array.isArray(v) || v.length > max) return null;
  const out = v.filter((x): x is string => typeof x === 'string' && allowed.has(x));
  return out.length === v.length ? Array.from(new Set(out)) : null;
};

/**
 * A little back-pressure per address, in memory. A room of forty people posts
 * forty times in an evening; anything pounding the endpoint is not a room.
 */
const buckets = new Map<string, { n: number; at: number }>();
const allow = (ip: string, limit = 30, windowMs = 60_000) => {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.at > windowMs) {
    buckets.set(ip, { n: 1, at: now });
    return true;
  }
  b.n += 1;
  return b.n <= limit;
};

// ---------------------------------------------------------------------------
// aggregation — the only thing a facilitator ever sees
// ---------------------------------------------------------------------------

const summarise = (code: string) => {
  const rows = db
    .query<{ lang: string; first: string; second: string; influences: string; changed: number }, [string]>(
      'SELECT lang, first, second, influences, changed FROM responses WHERE room = ?',
    )
    .all(code);

  const count = (k: Iterable<string>) => {
    const m: Record<string, number> = {};
    for (const x of k) m[x] = (m[x] ?? 0) + 1;
    return m;
  };

  const first = count(rows.flatMap(r => JSON.parse(r.first) as string[]));
  const second = count(rows.flatMap(r => JSON.parse(r.second) as string[]));
  const influences = count(rows.flatMap(r => JSON.parse(r.influences) as string[]));
  const changed = count(rows.map(r => String(r.changed)));
  const langs = count(rows.map(r => r.lang));

  // Where attention went, as pairs — anonymous by construction: a flow is a
  // count of (first-look id → with-context id) across the room, never a row.
  const flows: Record<string, number> = {};
  for (const r of rows) {
    const a = JSON.parse(r.first) as string[];
    const b = JSON.parse(r.second) as string[];
    for (const x of a) for (const y of b) flows[`${x}>${y}`] = (flows[`${x}>${y}`] ?? 0) + 1;
  }

  return { n: rows.length, first, second, influences, changed, langs, flows };
};

// ---------------------------------------------------------------------------
// routes
// ---------------------------------------------------------------------------

Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url);
    const origin = req.headers.get('origin') ?? '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || server.requestIP(req)?.address || '?';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });

    if (url.pathname === '/health') return json({ ok: true, at: new Date().toISOString() }, 200, origin);

    // -- a facilitator opens a room --------------------------------------
    if (url.pathname === '/rooms' && req.method === 'POST') {
      if (!allow(ip, 10)) return json({ error: 'slow down' }, 429, origin);
      const body = (await req.json().catch(() => ({}))) as { title?: unknown };
      const title = typeof body.title === 'string' ? body.title.slice(0, 80) : null;
      let code = randomCode();
      while (db.query('SELECT 1 FROM rooms WHERE code = ?').get(code)) code = randomCode();
      const key = randomKey();
      db.query('INSERT INTO rooms (code, key, title) VALUES (?, ?, ?)').run(code, key, title);
      return json({ code, key, title }, 201, origin);
    }

    // -- a phone finishes a run --------------------------------------------
    if (url.pathname === '/responses' && req.method === 'POST') {
      if (!allow(ip)) return json({ error: 'slow down' }, 429, origin);
      const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
      if (!body) return json({ error: 'bad json' }, 400, origin);

      const room = typeof body.room === 'string' ? body.room.toUpperCase().trim() : '';
      if (!db.query('SELECT 1 FROM rooms WHERE code = ?').get(room)) {
        return json({ error: 'no such room' }, 404, origin);
      }
      const lang = body.lang === 'id' ? 'id' : 'en';
      const first = ids(body.first, SITUATIONS, 2);
      const second = ids(body.second, SITUATIONS, 2);
      const influences = ids(body.influences, INFLUENCES, 2);
      if (!first || !second || !influences) return json({ error: 'bad payload' }, 400, origin);

      const changed = first.filter(x => !second.includes(x)).length;
      db.query(
        'INSERT INTO responses (room, lang, first, second, influences, changed) VALUES (?, ?, ?, ?, ?, ?)',
      ).run(room, lang, JSON.stringify(first), JSON.stringify(second), JSON.stringify(influences), changed);
      return json({ ok: true }, 201, origin);
    }

    // -- the facilitator's screen asks for the room -------------------------
    const m = url.pathname.match(/^\/rooms\/([A-Z0-9]{4,8})\/summary$/i);
    if (m && req.method === 'GET') {
      const code = m[1].toUpperCase();
      const room = db.query<{ key: string; title: string | null; created_at: string }, [string]>(
        'SELECT key, title, created_at FROM rooms WHERE code = ?',
      ).get(code);
      if (!room) return json({ error: 'no such room' }, 404, origin);
      if (req.headers.get('x-facilitator-key') !== room.key) return json({ error: 'not yours' }, 403, origin);
      return json({ code, title: room.title, created_at: room.created_at, ...summarise(code) }, 200, origin);
    }

    // -- the AI reads the room -------------------------------------------------
    //
    // Facilitator-only, aggregate-only. The model sees counts, never a row, and
    // it is briefed to notice rather than to judge: nobody in the room was
    // right or wrong, and the reading must not imply otherwise. Cached per
    // (room, n, lang) so the screen can poll without paying twice for the
    // same room.
    const r = url.pathname.match(/^\/rooms\/([A-Z0-9]{4,8})\/reading$/i);
    if (r && req.method === 'GET') {
      const code = r[1].toUpperCase();
      const room = db.query<{ key: string }, [string]>('SELECT key FROM rooms WHERE code = ?').get(code);
      if (!room) return json({ error: 'no such room' }, 404, origin);
      if (req.headers.get('x-facilitator-key') !== room.key) return json({ error: 'not yours' }, 403, origin);
      const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'id';
      const summary = summarise(code);
      if (summary.n === 0) return json({ text: null }, 200, origin);
      const cacheKey = `${code}:${summary.n}:${lang}`;
      const hit = readings.get(cacheKey);
      if (hit) return json({ text: hit }, 200, origin);
      const text = await readRoom(summary, lang);
      if (text) readings.set(cacheKey, text);
      return json({ text }, 200, origin);
    }

    return json({ error: 'not found' }, 404, origin);
  },
});

// ---------------------------------------------------------------------------
// the reading
// ---------------------------------------------------------------------------

const readings = new Map<string, string>();
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? '';
const READING_MODEL = process.env.READING_MODEL ?? 'anthropic/claude-sonnet-4.5';

const NAMES: Record<string, string> = {
  client: 'Client (villa owner, URGENT, already acknowledged)',
  finance: 'Payment (contractor batch, approval needed by 14:00)',
  people: 'Candidate (final candidate, People team coordinating)',
  engineering: 'Engineering (MEP Rev.07, confirmation needed today)',
  operations: 'Operations (site access issue, already handled)',
  hospitality: 'Hospitality (guest arrival tonight, action needed)',
  governance: 'Governance (permit renewal, already underway)',
  ai: 'AI (assistant recommendation, made from 6 of 8 sources)',
};

/**
 * The brief is the facilitator's own framing, given to the model as the
 * lens it must read through. It is asked for one short paragraph and three
 * lessons, in the room's language, and told what it may not do.
 */
const BRIEF = `You are writing a short, mindful reading of a workplace experiment called NUCLEUS PULSE 01 — SIGNAL, for a facilitator to show a room of colleagues.

What happened: everyone saw the same eight workplace messages arriving over thirty seconds and chose two to deal with first. Then they saw the same eight with the hidden context (owner, decision, deadline, consequence) and chose two again. Some messages were loud but already handled; some were quiet but carried a real deadline. An AI card recommended one item with high confidence, having read six of eight sources.

The facilitator's framing, which you must read through:
- Same information does not create the same experience. Nobody enters a morning as a blank slate: attention is shaped by role, past experience, responsibility, familiarity, perceived risk, current context, assumptions, and the information environment — including how fast information arrives and how little time there is to judge it.
- This matters in a growing organisation where processes are still forming, new joiners bring useful but different habits from previous companies, and AI can raise confidence faster than organisational context is acquired.
- Noise never goes away; the question is how much of it we can filter. One person's signal today may be tomorrow's noise. There is no single right signal, only the one each person could see from where they stood.
- Bring your experience. Do not mistake it for the whole picture. Confidence is not context. Reality is always larger than the lens we use to see it.

Rules you must follow:
- You are given aggregate counts only. Never invent individuals, quotes, names, departments, or percentages that are not derivable from the numbers.
- Do not say anyone was right, wrong, correct, biased, or should have chosen differently. Do not score, rank, or diagnose. Every choice in the room was a valid choice from where that person stood.
- Notice, do not lecture. Warm, plain, unhurried. No jargon, no bullet-point corporate tone in the paragraph.
- Output exactly this shape, nothing else:
  One paragraph of 60–90 words reading what this particular room did.
  A blank line.
  Three lines, each starting with "• ", each one lesson this room can take from its own numbers, at most 18 words each.`;

const readRoom = async (s: ReturnType<typeof summarise>, lang: 'en' | 'id'): Promise<string | null> => {
  if (!OPENROUTER_KEY) return null;
  const list = (m: Record<string, number>) =>
    Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${NAMES[k] ?? k}: ${v}`)
      .join('\n');
  const flows = Object.entries(s.flows)
    .filter(([k]) => k.split('>')[0] !== k.split('>')[1])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => {
      const [a, b] = k.split('>');
      return `${a} → ${b}: ${v}`;
    })
    .join('\n');
  const data = `Room size: ${s.n} people.

First look (chosen in the first 30 seconds, with only the surface visible):
${list(s.first)}

With more context (chosen again once owner, deadline and consequence were visible):
${list(s.second)}

Strongest movements, first look → with context:
${flows || '(none)'}

How many of each person's two choices changed: both=${s.changed['2'] ?? 0}, one=${s.changed['1'] ?? 0}, none=${s.changed['0'] ?? 0}.

What people said mattered to them (self-reported, up to two each):
${list(s.influences)}

Write in ${lang === 'id' ? 'Bahasa Indonesia, conversational and warm, the way a thoughtful colleague speaks — not formal register' : 'English'}.`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${OPENROUTER_KEY}`,
        'content-type': 'application/json',
        'http-referer': 'https://rivohenfri.github.io/nucleus-pulse/',
        'x-title': 'Nucleus Pulse room reading',
      },
      body: JSON.stringify({
        model: READING_MODEL,
        temperature: 0.6,
        max_tokens: 500,
        messages: [
          { role: 'system', content: BRIEF },
          { role: 'user', content: data },
        ],
      }),
    });
    if (!res.ok) {
      console.error('reading failed', res.status, await res.text().catch(() => ''));
      return null;
    }
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (e) {
    console.error('reading error', e);
    return null;
  }
};

console.log(`nucleus room api on :${PORT}, db at ${DB_PATH}`);
