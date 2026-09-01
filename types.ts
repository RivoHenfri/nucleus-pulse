export type ItemKind = 'mail' | 'chat' | 'calendar' | 'report';

export interface FeedItem {
  id: string;
  icon: string;
  /** Small caps source label, e.g. "URGENT", "PROJECT GROUP" */
  source: string;
  /** The headline the user sees in the feed */
  headline: string;
  /** Round-1 loudness: red badge, vibration, big presence */
  loud: boolean;
  /** True signal — a decision actually lives here */
  signal: boolean;
  /** What is revealed when the user peels this card in Scene 04 */
  reveal: string[];
  /** Shown for buried signals the user ignored */
  consequence?: string;

  // ---- Mailbox presentation (Scene 02 / 06) ----
  /** Which surface this arrived on — drives the row chrome */
  kind: ItemKind;
  /** Display name of the sender, as a real client would show it */
  sender: string;
  /** Two-letter avatar initials */
  initials: string;
  /** Tailwind background class for the avatar disc */
  avatarColor: string;
  /** The greyed second line under the subject */
  preview: string;
  /** Minutes ago it landed — timestamps tick live from here */
  minsAgo: number;
  /** Paperclip on the row */
  attachment?: boolean;
  /** Red "!" high-importance flag (Outlook style) */
  important?: boolean;
  /** Unread count pill, for chat-kind rows */
  unread?: number;
}

export type SceneId =
  | 'enter'
  | 'pulse1'
  | 'lock'
  | 'peel'
  | 'gravity'
  | 'pulse2'
  | 'reveal'
  | 'human'
  | 'pulseback';
