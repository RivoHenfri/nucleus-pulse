// PULSE 01 — SIGNAL
//
// Eight situations, one morning, two rounds. The same underlying facts reach
// every participant; only the order and timing of arrival move. What changes
// between the rounds is not the information — it is how much of it is visible.

export type SituationId =
  | 'client'
  | 'finance'
  | 'people'
  | 'engineering'
  | 'operations'
  | 'hospitality'
  | 'governance'
  | 'ai';

/** How loudly a situation announces itself in Round 1. Deliberately mixed:
 *  loud does not mean important, quiet does not mean safe. */
export type Loudness = 'loud' | 'medium' | 'quiet';

export interface Situation {
  id: SituationId;
  /** The mark on the surface card — emoji, kept small and flat. */
  glyph: string;
  /** The mark once the hierarchy is stripped. A red dot is a volume setting,
   *  not a subject, so the client situation trades it for a neutral one. */
  contextGlyph?: string;
  /** Round-1 chrome. */
  loudness: Loudness;
  /** Round 1 shows this as an unread count; part of the replay in Scene 13. */
  unread?: number;
}

/** Everything a situation says, in one language. */
export interface SituationCopy {
  /** Small caps label on the surface card: URGENT, PAYMENT, ENGINEERING… */
  label: string;
  /**
   * The label once the hierarchy is stripped in Scene 06. Only the two
   * situations whose surface label was a volume setting rather than a name
   * need one — "URGENT" and "AI PRIORITY" would smuggle the old ranking into
   * the calm view. Everything else keeps its label, because a department name
   * is not a claim about importance.
   */
  contextLabel?: string;
  /** The headline the participant reads under pressure. */
  headline: string;
  /** The quoted fragment underneath it. */
  line: string;
  /** The calm structure revealed in Scene 06. */
  owner: string;
  /** A situation carries a DECISION or a STATUS — never both. */
  decision?: string;
  status?: string;
  by?: string;
  consequence?: string;
  /** One extra line of context where the situation genuinely has one. */
  note?: string;
}

/** What the participant says mattered to them. Self-reported, never inferred. */
export type InfluenceId =
  | 'role'
  | 'experience'
  | 'urgency'
  | 'impact'
  | 'needed'
  | 'information'
  | 'instinct';

export type SceneId =
  | 'enter'
  | 'morning'
  | 'freeze'
  | 'reflection'
  | 'transition'
  | 'context'
  | 'aiContext'
  | 'second'
  | 'mirror'
  | 'signal'
  | 'noise'
  | 'lens'
  | 'system'
  | 'phenomena'
  | 'pulseback'
  | 'final'
  | 'end';

/** Everything the session remembers. Local only — no login, no identity. */
export interface Session {
  lang: 'en' | 'id';
  firstLook: SituationId[];
  influences: InfluenceId[];
  secondLook: SituationId[];
}
