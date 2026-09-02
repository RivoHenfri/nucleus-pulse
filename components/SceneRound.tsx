// SCENE 02 — THE MORNING   /   SCENE 08 — SECOND LOOK
//
// The same room, twice.
//
// SURFACE is 09:07 and thirty seconds: things arrive while you are reading,
// unevenly, some of them loudly, and you get two choices. CONTEXT is the same
// eight situations fifteen seconds later, already on screen, already flattened,
// with nothing arriving mid-thought.
//
// Nothing is added between the two. Nothing is taken away.
//
// The arrival is a spring that pushes the list down, because that is what a
// real client does and it is physically impossible to ignore. The freeze is
// the opposite: everything stops at once, the sound goes, and the screen holds
// still for two full seconds before the next scene is allowed to exist.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { arrivalPlan, contextOrder, situationById } from '../data';
import { COPY, type Lang } from '../i18n';
import type { SituationId } from '../types';
import { setUrgency, startFocusBed, stopFocusBed } from '../utils/ambience';
import { hush, narrate } from '../utils/narration';
import { buzz, ping, pingLoud, tap } from '../utils/sound';
import { cue } from './atoms';
import { ContextCard, SurfaceCard } from './SituationCard';

interface Props {
  lang: Lang;
  mode: 'surface' | 'context';
  seconds: number;
  onComplete: (picks: SituationId[]) => void;
}

const MAX_PICKS = 2;
/** Spec: freeze the moment the choice is made, and hold the silence. */
const FREEZE_MS = cue(2000);

const SceneRound: React.FC<Props> = ({ lang, mode, seconds, onComplete }) => {
  const c = COPY[lang];
  const surface = mode === 'surface';

  const plan = useMemo(() => (surface ? arrivalPlan() : []), [surface]);
  const calmOrder = useMemo(() => (surface ? [] : contextOrder()), [surface]);

  const [visible, setVisible] = useState<SituationId[]>(() =>
    surface ? plan.filter(a => a.at === 0).map(a => a.id) : calmOrder,
  );
  const [picks, setPicks] = useState<SituationId[]>([]);
  const [left, setLeft] = useState(seconds);
  const [frozen, setFrozen] = useState(false);

  const done = useRef(false);

  // ---- the round ends exactly once, whichever way it ends ------------------
  const finish = (chosen: SituationId[]) => {
    if (done.current) return;
    done.current = true;
    setFrozen(true);
    stopFocusBed();
    hush();
    setTimeout(() => onComplete(chosen), FREEZE_MS);
  };

  // ---- arrivals -----------------------------------------------------------
  useEffect(() => {
    if (!surface) return;
    const timers = plan
      .filter(a => a.at > 0)
      .map(a =>
        setTimeout(() => {
          if (done.current) return;
          setVisible(v => (v.includes(a.id) ? v : [a.id, ...v]));
          const loudness = situationById(a.id).loudness;
          if (loudness === 'loud') {
            pingLoud();
            buzz([25, 45, 25]);
          } else if (loudness === 'medium') {
            ping();
          }
          // The quiet ones make no sound at all. That is the experiment.
        }, a.at),
      );
    return () => timers.forEach(clearTimeout);
  }, [surface, plan]);

  // ---- the clock ----------------------------------------------------------
  useEffect(() => {
    startFocusBed();
    narrate(surface ? 'morning' : 'second', 400);
    const started = Date.now();
    const tick = setInterval(() => {
      const remaining = Math.max(0, seconds - Math.floor((Date.now() - started) / 1000));
      setLeft(remaining);
      setUrgency(1 - remaining / seconds);
      if (remaining === 0) {
        clearInterval(tick);
        // Time is up. Whatever was chosen, was chosen.
        setPicks(current => {
          finish(current);
          return current;
        });
      }
    }, 250);
    return () => {
      clearInterval(tick);
      stopFocusBed();
      hush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (id: SituationId) => {
    if (frozen || done.current) return;
    setPicks(current => {
      if (current.includes(id)) return current.filter(p => p !== id);
      if (current.length >= MAX_PICKS) return current;
      tap();
      buzz(18);
      const next = [...current, id];
      // Two chosen — the selection locks itself and the room goes quiet.
      if (next.length === MAX_PICKS) setTimeout(() => finish(next), 420);
      return next;
    });
  };

  const full = picks.length >= MAX_PICKS;
  const urgent = left <= 5 && !frozen;

  return (
    <motion.div
      className="min-h-[100dvh] px-4 pt-5 pb-16"
      animate={frozen ? { filter: 'saturate(0) brightness(0.55)' } : { filter: 'none' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="mx-auto w-full max-w-md">
        {/* ---- the morning, stated plainly ----
             On a phone the sound toggle is pinned over this corner, so the
             countdown reserves room for it. On a wider screen the toggle sits
             out at the window edge, well clear of the column, and reserving
             the same space just knocks the header out of line with the cards
             below it. */}
        <div className="flex items-baseline justify-between pr-11 sm:pr-0">
          <span className="font-cinzel text-[19px] tracking-[0.12em] text-[#EDE7DA]">
            {c.morning.clock}
          </span>
          <motion.span
            className={`text-[12px] font-semibold tabular-nums tracking-[0.18em] ${
              urgent ? 'text-rose-300' : 'text-gray-500'
            }`}
            animate={urgent ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
            transition={urgent ? { duration: 1, repeat: Infinity } : { duration: 0.3 }}
          >
            00:{String(left).padStart(2, '0')}
          </motion.span>
        </div>

        <div className="mt-1.5 mr-11 h-px bg-white/10 sm:mr-0">
          <motion.div
            className={`h-px ${urgent ? 'bg-rose-400/70' : 'bg-[#EDE7DA]/40'}`}
            animate={{ width: `${(left / seconds) * 100}%` }}
            transition={{ duration: 0.3, ease: 'linear' }}
          />
        </div>

        <div className="mt-5 mb-5">
          {surface ? (
            <>
              <p className="text-[16px] text-gray-200">{c.morning.title}</p>
              <p className="mt-1 text-[13px] text-gray-500">{c.morning.seconds(seconds)}</p>
              <p className="mt-2.5 text-[14px] text-[#EDE7DA]">{c.morning.instruction}</p>
            </>
          ) : (
            <>
              <p className="text-[16px] text-gray-200">
                {c.second.same} <span className="text-gray-500">{c.second.more}</span>
              </p>
              <p className="mt-1 text-[13px] text-gray-500">{c.morning.seconds(seconds)}</p>
              <p className="mt-2.5 text-[14px] text-[#EDE7DA]">{c.second.instruction}</p>
            </>
          )}
          <p className="mt-3 text-[10px] tracking-[0.24em] text-gray-600 uppercase">
            {frozen ? c.morning.locked : c.morning.selected(picks.length)}
          </p>
        </div>

        {/* ---- the eight ---- */}
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {visible.map(id => (
              <motion.div
                key={id}
                layout
                initial={surface ? { opacity: 0, y: -18, height: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                transition={
                  surface
                    ? { type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }
                    : { duration: 0.6, ease: 'easeOut' }
                }
              >
                {surface ? (
                  <SurfaceCard
                    id={id}
                    lang={lang}
                    selected={picks.includes(id)}
                    muted={full}
                    onSelect={() => choose(id)}
                  />
                ) : (
                  <ContextCard
                    id={id}
                    lang={lang}
                    selected={picks.includes(id)}
                    muted={full}
                    onSelect={() => choose(id)}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SceneRound;
