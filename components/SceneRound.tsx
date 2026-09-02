// SCENE 02 — THE MORNING   /   SCENE 08 — SECOND LOOK
//
// The same room, twice — and the two rounds do not look like the same app.
//
// SURFACE is a mail client on a phone at 09:07. Status bar, unread counter,
// sync spinner, search box, Focused/Other, banners dropping from the top as
// things land, timestamps ageing while you read, someone typing in a group.
// None of that is the experiment; it is the room the experiment happens in.
// Stripped back to plain cards, the eight situations read as a quiz — and a
// participant who feels quizzed starts hunting for the right answer instead of
// behaving like themselves.
//
// CONTEXT is the same eight situations fifteen seconds later with the client
// taken away: no status bar, no banners, no unread counts, no typing, nothing
// arriving mid-thought. The absence of all that chrome is the point.
//
// Nothing is added between the two. Nothing is taken away.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { arrivalPlan, contextOrder, situationById } from '../data';
import { COPY, SITUATION_COPY, type Lang } from '../i18n';
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

/**
 * The spec's three opening lines are spoken and shown together, and the clock
 * does not start until both are done. Putting them in the mail client's own
 * chrome was the wrong call: it buried the only instruction the participant
 * gets, and left the narrator saying "you have thirty seconds" over a screen
 * that showed neither the sentence nor an honest countdown.
 */
const BRIEFING_MS = cue(4200);

/** The morning starts at 09:07 and the clock actually runs. */
const CLOCK_START_MIN = 9 * 60 + 7;

const clockLabel = (minsFromMidnight: number): string => {
  const m = ((minsFromMidnight % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${h24 < 12 ? 'AM' : 'PM'}`;
};

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
  /** Seconds since the round opened — real clients age their rows as you read. */
  const [elapsed, setElapsed] = useState(0);
  /** The banner that drops from the top when something lands. */
  const [toast, setToast] = useState<SituationId | null>(null);
  const [syncing, setSyncing] = useState(true);
  const [briefing, setBriefing] = useState(true);

  /** A timestamp that gets older while you look at it. */
  const stampFor = (id: SituationId): string => {
    const total = situationById(id).minsAgo * 60 + elapsed;
    if (total < 45) return c.morning.justNow;
    const mins = Math.floor(total / 60);
    return mins < 60 ? c.morning.minAgo(mins) : clockLabel(CLOCK_START_MIN - mins);
  };

  const done = useRef(false);

  // ---- the round ends exactly once, whichever way it ends ------------------
  const finish = (chosen: SituationId[]) => {
    if (done.current) return;
    done.current = true;
    setFrozen(true);
    setToast(null);
    stopFocusBed();
    hush();
    setTimeout(() => onComplete(chosen), FREEZE_MS);
  };

  // ---- arrivals -----------------------------------------------------------
  useEffect(() => {
    const t = setTimeout(() => setBriefing(false), BRIEFING_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!surface || briefing) return;
    const timers = plan
      .filter(a => a.at > 0)
      .map(a =>
        setTimeout(() => {
          if (done.current) return;
          setVisible(v => (v.includes(a.id) ? v : [a.id, ...v]));
          setToast(a.id);
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
  }, [surface, plan, briefing]);

  // ---- the clock ----------------------------------------------------------
  useEffect(() => {
    if (briefing) return;
    startFocusBed();
    const settle = setTimeout(() => setSyncing(false), 2600);
    const started = Date.now();
    const tick = setInterval(() => {
      const since = Math.floor((Date.now() - started) / 1000);
      const remaining = Math.max(0, seconds - since);
      setElapsed(since);
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
      clearTimeout(settle);
      stopFocusBed();
      hush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefing]);

  // The voice speaks over the briefing, not over the round.
  useEffect(() => {
    narrate(surface ? 'morning' : 'second', 400);
    return () => hush();
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
  const unreadCount = visible.reduce((n, id) => n + (situationById(id).unread ?? 0), 0);
  const toastSit = toast ? situationById(toast) : null;
  const toastCopy = toast ? SITUATION_COPY[lang][toast] : null;

  const Countdown = (
    <motion.span
      className={`font-mono text-base font-bold tabular-nums ${
        urgent ? 'text-rose-400' : 'text-gray-300'
      }`}
      animate={urgent ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
      transition={urgent ? { duration: 1, repeat: Infinity } : { duration: 0.3 }}
    >
      00:{String(left).padStart(2, '0')}
    </motion.span>
  );

  return (
    <motion.div
      className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col"
      animate={frozen ? { filter: 'saturate(0) brightness(0.55)' } : { filter: 'none' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* ---- the briefing ----
           The spec's three lines, on screen while the voice says them, with
           the clock held until both are finished. Then it lifts and the
           morning floods in all at once. */}
      <AnimatePresence>
        {briefing && (
          <motion.div
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#06080B] px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <motion.p
              className="font-cinzel text-[22px] tracking-[0.14em] text-[#EDE7DA]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              {surface ? c.morning.clock : c.second.same}
            </motion.p>

            <motion.p
              className="mt-6 text-[18px] leading-relaxed text-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              {surface ? c.morning.title : c.second.more}
            </motion.p>

            <motion.p
              className="mt-8 text-[15px] text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              {c.morning.seconds(seconds)}
            </motion.p>

            <motion.p
              className="mt-3 text-[17px] font-semibold text-[#EDE7DA]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
            >
              {surface ? c.morning.instruction : c.second.instruction}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {surface ? (
        <>
          {/* ---- phone status bar ---- */}
          <div className="flex items-center justify-between px-5 pb-1 pt-3 text-[11px] font-semibold text-gray-400">
            <span>{clockLabel(CLOCK_START_MIN + Math.floor(elapsed / 60))}</span>
            <span className="flex items-center gap-1.5 pr-9 text-gray-500 sm:pr-0">
              <span>▮▮▮▯</span>
              <span>WiFi</span>
              <span className="rounded-[3px] border border-gray-600 px-1 text-[9px]">78</span>
            </span>
          </div>

          {/* ---- the banner that drops when something lands ---- */}
          <AnimatePresence>
            {toastSit && toastCopy && (
              <motion.div
                key={toast}
                className="absolute left-3 right-14 top-9 z-30 sm:right-3"
                initial={{ opacity: 0, y: -70, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -70, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                onAnimationComplete={() => setTimeout(() => setToast(null), 2200)}
              >
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#12171d] px-4 py-3 shadow-2xl shadow-black/80">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${toastSit.avatar}`}
                  >
                    {toastSit.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {toastSit.app === 'chat'
                          ? c.morning.message
                          : toastSit.app === 'assistant'
                            ? c.morning.assistant
                            : c.morning.mail}
                      </span>
                      {toastSit.important && (
                        <span className="text-[11px] font-black text-rose-500">!</span>
                      )}
                      <span className="ml-auto text-[10px] text-gray-500">{c.morning.now}</span>
                    </span>
                    <span className="block truncate text-[12px] font-semibold text-gray-100">
                      {toastCopy.headline}
                    </span>
                    <span className="block truncate text-[11px] text-gray-500">
                      {toastCopy.preview}
                    </span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- mail app header ---- */}
          <div className="border-b border-white/5 px-4 pb-3 pt-2">
            {/* pr-9 keeps the account avatar clear of the sound toggle, which
                is pinned to this same corner on a phone. */}
            <div className="flex items-center gap-3 pr-9 sm:pr-0">
              <span className="text-lg leading-none text-gray-400">☰</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[15px] font-bold leading-tight text-gray-100">
                  {c.morning.inbox}
                  {unreadCount > 0 && (
                    <span
                      key={unreadCount}
                      className="animate-countPop text-[11px] font-bold text-rose-400"
                    >
                      {unreadCount}
                    </span>
                  )}
                  {syncing && (
                    <span className="inline-block h-3 w-3 animate-syncSpin rounded-full border-2 border-gray-600 border-t-sky-400" />
                  )}
                </p>
                <p className="truncate text-[10px] text-gray-600">
                  {syncing ? c.morning.updating : c.morning.updated} · {c.morning.account}
                </p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[11px] font-bold text-gray-200">
                ME
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-[12px] text-gray-600">
              <span>🔍</span>
              <span>{c.morning.search}</span>
            </div>

            <div className="mt-3 flex gap-6 text-[12px]">
              <span className="border-b-2 border-sky-400 pb-1.5 font-semibold text-gray-100">
                {c.morning.focused}
              </span>
              <span className="pb-1.5 text-gray-600">{c.morning.other}</span>
            </div>
          </div>

          {/* ---- the list ---- */}
          <div className="flex-1">
            <AnimatePresence initial={false}>
              {visible.map(id => (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: -18, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}
                >
                  <SurfaceCard
                    id={id}
                    lang={lang}
                    stamp={stampFor(id)}
                    selected={picks.includes(id)}
                    muted={full}
                    onSelect={() => choose(id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* The rows that have not arrived yet, still loading. */}
            {visible.length < 8 && !frozen && (
              <div className="flex items-center gap-3 px-4 py-3 opacity-30">
                <span className="h-10 w-10 rounded-full bg-white/5" />
                <span className="flex-1">
                  <span className="mb-1.5 block h-2.5 w-1/3 rounded bg-white/5" />
                  <span className="block h-2.5 w-2/3 rounded bg-white/5" />
                </span>
              </div>
            )}
          </div>

          {/* ---- the task bar: the only thing here that is not a mail client ---- */}
          <div className="sticky bottom-0 border-t border-white/10 bg-[#06080B]/95 px-4 pb-5 pt-3 backdrop-blur">
            <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className={`h-full rounded-full ${urgent ? 'bg-rose-500' : 'bg-[#EDE7DA]/60'}`}
                animate={{ width: `${(left / seconds) * 100}%` }}
                transition={{ duration: 0.3, ease: 'linear' }}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] leading-snug text-gray-300">{c.morning.instruction}</p>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-[11px] text-gray-500">
                  {frozen ? c.morning.locked : c.morning.selected(picks.length)}
                </span>
                {Countdown}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="px-4 pb-16 pt-5">
          <div className="flex items-baseline justify-between pr-11 sm:pr-0">
            <span className="font-cinzel text-[19px] tracking-[0.12em] text-[#EDE7DA]">
              {c.morning.clock}
            </span>
            {Countdown}
          </div>

          <div className="mr-11 mt-1.5 h-px bg-white/10 sm:mr-0">
            <motion.div
              className={`h-px ${urgent ? 'bg-rose-400/70' : 'bg-[#EDE7DA]/40'}`}
              animate={{ width: `${(left / seconds) * 100}%` }}
              transition={{ duration: 0.3, ease: 'linear' }}
            />
          </div>

          <div className="mb-5 mt-5">
            <p className="text-[16px] text-gray-200">
              {c.second.same} <span className="text-gray-500">{c.second.more}</span>
            </p>
            <p className="mt-1 text-[13px] text-gray-500">{c.morning.seconds(seconds)}</p>
            <p className="mt-2.5 text-[14px] text-[#EDE7DA]">{c.second.instruction}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-gray-600">
              {frozen ? c.morning.locked : c.morning.selected(picks.length)}
            </p>
          </div>

          <div className="space-y-3">
            {visible.map(id => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <ContextCard
                  id={id}
                  lang={lang}
                  selected={picks.includes(id)}
                  muted={full}
                  onSelect={() => choose(id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SceneRound;
