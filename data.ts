import type { InfluenceId, Loudness, Situation, SituationId } from './types';

/**
 * The eight situations.
 *
 * Every participant gets the same eight, with the same owners, deadlines and
 * consequences. Only arrival order and arrival timing move — enough for the
 * morning to feel alive, not enough to make two participants incomparable.
 *
 * Loudness is deliberately uncorrelated with consequence. Hospitality is loud
 * AND consequential; engineering is quiet AND consequential; client is loud and
 * already handled; governance is quiet and already handled. Nobody can win this
 * by learning "the quiet ones matter".
 */
export const SITUATIONS: Situation[] = [
  // Ages are as deliberate as the loudness: the things nobody shouted about
  // have been sitting there for the better part of an hour.
  { id: 'client', glyph: '🔴', contextGlyph: '🤝', loudness: 'loud', unread: 4,
    app: 'mail', initials: 'DP', avatar: 'bg-rose-600', minsAgo: 2, important: true },
  { id: 'ai', glyph: '✦', loudness: 'loud',
    app: 'assistant', initials: '✦', avatar: 'bg-sky-600', minsAgo: 0 },
  { id: 'hospitality', glyph: '🛎️', loudness: 'loud', unread: 2,
    app: 'chat', initials: 'FO', avatar: 'bg-amber-600', minsAgo: 4, important: true },
  { id: 'finance', glyph: '💳', loudness: 'medium',
    app: 'mail', initials: 'FA', avatar: 'bg-emerald-700', minsAgo: 11, attachment: true },
  { id: 'people', glyph: '👥', loudness: 'medium', unread: 1,
    app: 'chat', initials: 'PT', avatar: 'bg-violet-600', minsAgo: 6 },
  { id: 'operations', glyph: '🏗️', loudness: 'medium', unread: 6,
    app: 'chat', initials: 'ZB', avatar: 'bg-teal-600', minsAgo: 1 },
  { id: 'engineering', glyph: '📐', loudness: 'quiet',
    app: 'mail', initials: 'AW', avatar: 'bg-slate-600', minsAgo: 38, attachment: true },
  { id: 'governance', glyph: '⚖️', loudness: 'quiet',
    app: 'mail', initials: 'CA', avatar: 'bg-slate-600', minsAgo: 52, attachment: true },
];

export const SITUATION_IDS: SituationId[] = SITUATIONS.map(s => s.id);

export const situationById = (id: SituationId): Situation => {
  const found = SITUATIONS.find(s => s.id === id);
  if (!found) throw new Error(`Unknown situation: ${id}`);
  return found;
};

export const INFLUENCES: InfluenceId[] = [
  'role',
  'experience',
  'urgency',
  'impact',
  'needed',
  'information',
  'instinct',
];

/** Round-1 chrome per loudness level. Kept in one place so the replay in
 *  Scene 13 can quote the exact same treatment back at the participant.
 *
 *  The AI card is loud in a different key — confident rather than alarmed —
 *  and SurfaceCard swaps in AI_STYLE for it. Red would have made the AI look
 *  like an emergency, which is the one thing it is not. */
export const LOUD_STYLE: Record<Loudness, { row: string; label: string }> = {
  loud: {
    row: 'border-rose-400/40 bg-rose-500/[0.07] shadow-[0_0_40px_-12px_rgba(244,63,94,0.45)]',
    label: 'text-rose-300',
  },
  medium: {
    row: 'border-white/12 bg-white/[0.04]',
    label: 'text-amber-200/80',
  },
  quiet: {
    row: 'border-white/[0.06] bg-white/[0.015]',
    label: 'text-gray-500',
  },
};

export const AI_STYLE = {
  row: 'border-sky-300/35 bg-sky-400/[0.05] shadow-[0_0_40px_-14px_rgba(56,189,248,0.45)]',
  label: 'text-sky-200/85',
};

export interface Arrival {
  id: SituationId;
  /** ms after the round starts */
  at: number;
}

/** Uneven on purpose: two arriving almost together, then nothing for a beat. */
const MIN_GAP = 500;
const MAX_GAP = 2500;

/**
 * Controlled randomisation.
 *
 * Three situations are already on screen when the morning opens — a morning
 * that starts empty does not feel like a morning. The other five land at
 * uneven intervals, half a second to two and a half apart, in a shuffled
 * order.
 *
 * The order and the timing move. The facts, the owner, the deadline and the
 * consequence never do, or two participants could not be compared at all.
 */
export const arrivalPlan = (): Arrival[] => {
  const shuffled = [...SITUATION_IDS].sort(() => Math.random() - 0.5);
  let clock = 0;
  return shuffled.map((id, i) => {
    if (i < 3) return { id, at: 0 };
    clock += MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
    return { id, at: Math.round(clock) };
  });
};

/** Round 2 is calm: everything is already there, in a stable, quiet order. */
export const contextOrder = (): SituationId[] =>
  [...SITUATION_IDS].sort(() => Math.random() - 0.5);


/**
 * The two senders who are people rather than departments.
 *
 * A villa owner and a consultant are individuals, and seeing the same two
 * names every run makes the morning read as a script — especially to a
 * facilitator who has watched it a dozen times. The pool is drawn once per
 * run and held for the whole of it, so the inbox is consistent within a
 * session and different between them.
 *
 * These are names only. The facts behind each situation — the owner
 * department, the decision, the deadline, the consequence — never move,
 * because those are what make two participants comparable at all.
 */
const OWNER_NAMES = [
  'Mr. Whitfield — Villa 12',
  'Ms. Lindqvist — Villa 07',
  'Mr. Tanaka — Villa 21',
  'Mrs. Ashworth — Villa 04',
  'Mr. Bouchard — Villa 16',
  'Ms. Petrova — Villa 09',
];

const STUDIO_NAMES = [
  'Ari — Studio',
  'Rangga — Studio',
  'Dimas — Studio',
  'Yuni — Studio',
  'Bagus — Studio',
];

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

/** Chosen once per run, so the inbox stays consistent while someone is in it. */
export const RUN_SENDERS: Partial<Record<SituationId, string>> = {
  client: pick(OWNER_NAMES),
  engineering: pick(STUDIO_NAMES),
};
