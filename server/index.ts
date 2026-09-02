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

    return json({ error: 'not found' }, 404, origin);
  },
});

console.log(`nucleus room api on :${PORT}, db at ${DB_PATH}`);
