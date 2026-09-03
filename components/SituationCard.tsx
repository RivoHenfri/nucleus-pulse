// One situation, on two surfaces.
//
// SURFACE is how it arrives in Round 1: a badge, a headline, a quoted fragment,
// and whatever visual weight the system decided to give it. CONTEXT is the same
// situation after Scene 06 flattens it — same words, same facts, no hierarchy,
// with the owner, the decision and the consequence written out plainly.
//
// The two variants deliberately share their copy. Nothing is added between the
// rounds; what changes is how much of it you can see.

import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { LOUD_STYLE, RUN_SENDERS, situationById } from '../data';
import { COPY, SITUATION_COPY, type Lang } from '../i18n';
import type { SituationId } from '../types';

interface Props {
  id: SituationId;
  lang: Lang;
  selected: boolean;
  /** Locked out because the two choices are already spent. */
  muted?: boolean;
  onSelect?: () => void;
}

/**
 * How a situation looks when it lands in Round 1: a row in a mail client, on a
 * phone, on a Tuesday.
 *
 * All of this chrome — the avatar, the sender, the red importance flag, the
 * unread pill, the ageing timestamp, the paperclip, the typing dots — is the
 * room, not the experiment. Stripped back to plain cards the seven situations
 * read as a quiz, and a participant who feels quizzed starts looking for the
 * right answer instead of behaving like themselves.
 *
 * The loud ones get the full treatment. The quiet ones get a smaller avatar
 * and greyer type, exactly the way a real client de-emphasises anything it has
 * decided is not urgent.
 */
const Field: React.FC<{ label: string; value: string; strong?: boolean }> = ({
  label,
  value,
  strong,
}) => (
  <span className="flex gap-3">
    <span className="w-[92px] shrink-0 pt-[3px] text-[9px] font-semibold tracking-[0.2em] text-gray-600 uppercase">
      {label}
    </span>
    <span className={`text-[13px] leading-snug ${strong ? 'text-gray-200' : 'text-gray-400'}`}>
      {value}
    </span>
  </span>
);

export const SurfaceCard: React.FC<Props & { stamp: string; withContext?: boolean }> = ({
  id,
  lang,
  selected,
  muted,
  onSelect,
  stamp,
  withContext,
}) => {
  const s = situationById(id);
  const c = SITUATION_COPY[lang][id];
  const m = COPY[lang].morning;
  const f = COPY[lang].context;
  const loud = s.loudness === 'loud';
  const quiet = s.loudness === 'quiet';

  return (
    <motion.button
      onClick={onSelect}
      disabled={muted && !selected}
      whileTap={{ scale: 0.99 }}
      animate={{ opacity: muted && !selected ? 0.35 : 1 }}
      transition={{ duration: 0.4 }}
      className={`flex w-full items-start gap-3 border-b border-white/[0.04] px-4 py-3 text-left transition-colors duration-300 ${
        selected ? 'bg-[#EDE7DA]/[0.07]' : loud ? 'bg-white/[0.02]' : ''
      }`}
    >
      {/* Unread bar, the way Outlook marks a row you have not opened */}
      <span
        className={`mt-1 h-9 w-[3px] shrink-0 rounded-full ${
          selected ? 'bg-[#EDE7DA]' : loud ? 'bg-sky-400' : quiet ? 'bg-transparent' : 'bg-sky-400/40'
        }`}
      />

      <span
        className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${
          quiet ? 'h-8 w-8 text-[10px] opacity-60' : 'h-10 w-10 text-[11px]'
        } ${selected ? 'bg-[#EDE7DA] text-[#07090C]' : s.avatar}`}
      >
        {selected ? '✓' : s.initials}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className={`truncate ${
              quiet ? 'text-[12px] font-normal text-gray-500' : 'text-[13px] font-bold text-gray-100'
            }`}
          >
            {RUN_SENDERS[id] ?? c.sender}
          </span>
          {s.important && <span className="shrink-0 text-[11px] font-black text-rose-500">!</span>}
          {!!s.unread && (
            <span className="shrink-0 rounded-full bg-rose-500 px-1.5 py-px text-[10px] font-bold text-white">
              {s.unread}
            </span>
          )}
          <span className="ml-auto shrink-0 text-[10px] text-gray-500">{stamp}</span>
        </span>

        <span
          className={`block truncate ${
            quiet ? 'text-[12px] text-gray-500' : 'text-[13px] font-semibold text-gray-100'
          }`}
        >
          {c.headline}
        </span>

        <span className="mt-0.5 flex items-center gap-1.5">
          {s.attachment && <span className="shrink-0 text-[10px] text-gray-600">📎</span>}
          <span className="truncate text-[11px] text-gray-500">{c.preview}</span>
        </span>

        {/* Someone is typing in the group, right now. Nothing is being said. */}
        {loud && s.app === 'chat' && (
          <span className="mt-1.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-typing1" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-typing2" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-typing3" />
            <span className="ml-1 text-[10px] text-gray-500">{m.typing}</span>
          </span>
        )}

        {/* Round 2 is this same row with what sat underneath it opened up.
            The badge, the red, the unread count, the position: all unchanged,
            so the only thing that differs between the rounds is what the
            participant knows. */}
        {withContext && (
          <span className="mt-3 block space-y-1.5 border-t border-white/[0.06] pt-3">
            <Field label={f.owner} value={c.owner} />
            {c.decision ? (
              <Field label={f.decision} value={c.decision} strong />
            ) : (
              <Field label={f.status} value={c.status ?? ''} />
            )}
            {c.by && <Field label={f.by} value={c.by} strong />}
            {c.consequence && <Field label={f.consequence} value={c.consequence} />}
            {c.note && (
              <span className="block pt-1 text-[12px] leading-snug text-gray-500">{c.note}</span>
            )}
          </span>
        )}
      </span>
    </motion.button>
  );
};

interface ContextProps extends Props {
  /**
   * Whether the context underneath has been peeled open yet. Scene 06 opens the
   * cards one at a time so the participant watches the extra context arrive
   * rather than finding a wall of it already there. Round 2 passes true.
   */
  open?: boolean;
  /**
   * Hold back the last line of context.
   *
   * Only Scene 06 uses this, and only for the AI card: its note is the 6/8
   * sources, and that is Scene 07's reveal. The card still has to appear in
   * Scene 06 — the spec says Scene 07 *expands* it, which it cannot do if the
   * participant has never seen it sitting there.
   */
  hideNote?: boolean;
}

export const ContextCard: React.FC<ContextProps> = ({
  id,
  lang,
  selected,
  muted,
  onSelect,
  open = true,
  hideNote,
}) => {
  const s = situationById(id);
  const c = SITUATION_COPY[lang][id];
  const f = COPY[lang].context;
  const interactive = Boolean(onSelect);

  return (
    <motion.button
      onClick={onSelect}
      disabled={!interactive || (muted && !selected)}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      animate={{ opacity: muted && !selected ? 0.4 : 1 }}
      transition={{ duration: 0.4 }}
      className={`w-full text-left rounded-2xl border px-4 py-4 transition-colors duration-300 ${
        selected
          ? 'border-[#EDE7DA]/60 bg-[#EDE7DA]/[0.06]'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
      } ${interactive ? '' : 'cursor-default'}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[12px] leading-none opacity-60">
          {s.contextGlyph ?? s.glyph}
        </span>
        <span className="text-[10px] font-semibold tracking-[0.22em] text-gray-500">
          {c.contextLabel ?? c.label}
        </span>
        {selected && <span className="ml-auto text-[11px] text-[#EDE7DA]">✓</span>}
      </div>

      <p className="mt-2 text-[15px] leading-snug text-gray-200">{c.headline}</p>

      {/* The peel. Height animates from nothing, so the card visibly opens. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-3">
              <Field label={f.owner} value={c.owner} />
              {c.decision ? (
                <Field label={f.decision} value={c.decision} strong />
              ) : (
                <Field label={f.status} value={c.status ?? ''} />
              )}
              {c.by && <Field label={f.by} value={c.by} strong />}
              {c.consequence && <Field label={f.consequence} value={c.consequence} />}
              {c.note && !hideNote && (
                <p className="pt-1 text-[12px] leading-snug text-gray-500">{c.note}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
