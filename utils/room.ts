// THE ROOM — the one thing that leaves the phone.
//
// A facilitator opens a room and hands out a link with `?room=RRX7` on it (a
// QR code on the screen, in practice). When a run finishes, the phone posts
// what happened — two pairs of situation ids and up to two influences — and
// that is all. No name, no email, no device id: there is nothing in the
// payload that could point back at a person, and the API has no endpoint that
// returns an individual response.
//
// Nothing here is allowed to affect the experience. If there is no room, or
// the network is down, or the server is gone, the run is exactly the same run
// — the submission just quietly does not happen.

import type { InfluenceId, SituationId } from '../types';

export const ROOM_API = 'https://nucleus-api.rivohenfri.cloud';

const KEY = 'nucleus.room';

/**
 * The room this phone is in, if any.
 *
 * Read from the URL first, so a link from the facilitator wins; then from
 * storage, so a participant who reloads mid-run stays in the same room.
 */
export const roomCode = (): string | null => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('room');
    if (fromUrl && /^[A-Za-z0-9]{4,8}$/.test(fromUrl)) {
      const code = fromUrl.toUpperCase();
      localStorage.setItem(KEY, code);
      return code;
    }
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export interface RoomResponse {
  lang: 'en' | 'id';
  first: SituationId[];
  second: SituationId[];
  influences: InfluenceId[];
}

/** Post one finished run to the room. Never throws, never blocks. */
export const submitToRoom = async (r: RoomResponse): Promise<boolean> => {
  const room = roomCode();
  if (!room) return false;
  try {
    const res = await fetch(`${ROOM_API}/responses`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ room, ...r }),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
};

export interface RoomSummary {
  code: string;
  title: string | null;
  n: number;
  first: Record<string, number>;
  second: Record<string, number>;
  influences: Record<string, number>;
  changed: Record<string, number>;
  langs: Record<string, number>;
  flows: Record<string, number>;
}

/** The facilitator's view. Needs the key that came back when the room was opened. */
export const fetchSummary = async (code: string, key: string): Promise<RoomSummary | null> => {
  try {
    const res = await fetch(`${ROOM_API}/rooms/${encodeURIComponent(code)}/summary`, {
      headers: { 'x-facilitator-key': key },
    });
    return res.ok ? ((await res.json()) as RoomSummary) : null;
  } catch {
    return null;
  }
};

export const openRoom = async (title?: string): Promise<{ code: string; key: string } | null> => {
  try {
    const res = await fetch(`${ROOM_API}/rooms`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return res.ok ? ((await res.json()) as { code: string; key: string }) : null;
  } catch {
    return null;
  }
};

/**
 * The AI's reading of a room: a short, mindful paragraph and three lessons,
 * written from the aggregate and nothing else. Generated on the server, where
 * the model key lives; the browser only ever sees the text. Null if the room
 * is empty or the model is unavailable, and the screen copes with either.
 */
export const fetchReading = async (code: string, key: string, lang: 'en' | 'id'): Promise<string | null> => {
  try {
    const res = await fetch(`${ROOM_API}/rooms/${encodeURIComponent(code)}/reading?lang=${lang}`, {
      headers: { 'x-facilitator-key': key },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { text?: string };
    return body.text ?? null;
  } catch {
    return null;
  }
};
