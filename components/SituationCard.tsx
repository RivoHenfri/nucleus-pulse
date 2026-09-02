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
import { AI_STYLE, LOUD_STYLE, situationById } from '../data';
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

export const SurfaceCard: React.FC<Props> = ({ id, lang, selected, muted, onSelect }) => {
  const s = situationById(id);
  const c = SITUATION_COPY[lang][id];
  const isAI = id === 'ai';
  const style = isAI ? AI_STYLE : LOUD_STYLE[s.loudness];
  const loud = s.loudness === 'loud' && !selected;

  return (
    <motion.button
      onClick={onSelect}
      disabled={muted && !selected}
      whileTap={{ scale: 0.985 }}
      // The loud ones do not sit still. Nothing else on the card moves.
      animate={loud ? { opacity: [1, 0.82, 1] } : { opacity: muted && !selected ? 0.35 : 1 }}
      transition={loud ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
      className={`w-full text-left rounded-2xl border px-4 py-3.5 transition-colors duration-300 ${
        selected
          ? 'border-[#EDE7DA]/70 bg-[#EDE7DA]/[0.08] shadow-[0_0_30px_-14px_rgba(237,231,218,0.7)]'
          : style.row
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[13px] leading-none">{s.glyph}</span>
        <span
          className={`text-[10px] font-bold tracking-[0.22em] ${
            selected ? 'text-[#EDE7DA]' : style.label
          }`}
        >
          {c.label}
        </span>
        {s.unread && !selected ? (
          <motion.span
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-rose-500/85 px-1.5 text-[10px] font-bold text-white"
          >
            {s.unread}
          </motion.span>
        ) : null}
        {selected && <span className="ml-auto text-[11px] text-[#EDE7DA]">✓</span>}
      </div>

      <p
        className={`mt-2 text-[15px] leading-snug ${
          selected ? 'text-[#EDE7DA]' : s.loudness === 'quiet' ? 'text-gray-400' : 'text-gray-200'
        } ${isAI ? 'font-semibold' : ''}`}
      >
        {c.headline}
      </p>
      <p className={`mt-1 text-[13px] ${isAI ? 'text-sky-200/70' : 'text-gray-500'}`}>{c.line}</p>
    </motion.button>
  );
};

const Field: React.FC<{ label: string; value: string; strong?: boolean }> = ({
  label,
  value,
  strong,
}) => (
  <div className="flex gap-3">
    <span className="w-[92px] shrink-0 pt-[3px] text-[9px] font-semibold tracking-[0.2em] text-gray-600 uppercase">
      {label}
    </span>
    <span className={`text-[13px] leading-snug ${strong ? 'text-gray-200' : 'text-gray-400'}`}>
      {value}
    </span>
  </div>
);

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
