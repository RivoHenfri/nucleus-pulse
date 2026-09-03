// THE SYSTEM REVEAL
//
// The turn — and the only place in Pulse 01 where anything gets a name.
//
// Everything until now has been about the information and about the person
// reading it. This scene puts up the third thing that was in the room: the
// badge, the sound, the unread count, the countdown, the arrival order, the
// confident number, the position on the page. Each fragment is replayed in the
// exact chrome it wore in Round 1 — including the sound, played again for real.
//
// The word "manipulated" does not appear, because it would make the
// participant the object of something instead of the noticer of it.
//
// Two names close it, and only two: SIGNAL, for the thing that changes what
// happens next, and SIGNALFALL, for what the last three minutes did to it.
// NOISE GRAVITY and LENS LOCK used to have scenes of their own after this
// one. Four coined terms in a sitting is a vocabulary nobody carries out of
// the room; two they might.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { COPY, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import { startCalmBed, stopCalmBed } from '../utils/ambience';
import { buzz, lockThunk, pingLoud } from '../utils/sound';
import { Beat, Continue, Stage, beats, cue, useBeats } from './atoms';

interface Props {
  lang: Lang;
  onContinue: () => void;
}

const OPENING = cue(2600);
const FRAGMENT_MS = cue(1050);
const FRAGMENTS = 7;

const SceneSystem: React.FC<Props> = ({ lang, onContinue }) => {
  const c = COPY[lang].system;
  const f = c.fragments;

  // -1 = the black screen and "One more thing." 0..6 = the replay.
  const [frame, setFrame] = useState(-1);
  const replayOver = frame >= FRAGMENTS;

  useEffect(() => {
    narrate('system-1', cue(900));
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i <= FRAGMENTS; i++) {
      timers.push(setTimeout(() => setFrame(i), OPENING + i * FRAGMENT_MS));
    }
    return () => {
      timers.forEach(clearTimeout);
      hush();
    };
  }, []);

  // The sound fragment is not a picture of a sound. It is the sound.
  useEffect(() => {
    if (frame === 1) {
      pingLoud();
      buzz([25, 45, 25]);
    }
  }, [frame]);

  // after the replay: the influence · THIS SCREEN · three lines · two closings
  // …the influence · THIS SCREEN · three lines · two closings · SIGNAL ·
  // SIGNALFALL · out
  const shown = useBeats(
    replayOver
      ? beats(900, 2600, 2600, 1500, 1500, 2600, 2200, 3000, 3400, 2600)
      : [],
  );

  useEffect(() => {
    if (!replayOver) return;
    // The turn. Everything under the room drops out, there is a moment of
    // nothing at all, then one low hit lands with "THIS SCREEN." and the room
    // comes back underneath it. Until now this was the loudest idea in the
    // experience delivered at exactly the same level as everything around it.
    stopCalmBed();
    const hit = setTimeout(() => {
      lockThunk();
      buzz([60, 40, 60]);
    }, cue(3400));
    const back = setTimeout(startCalmBed, cue(6000));
    narrate('system-2', cue(1000));
    narrate('system-3', cue(4000));
    narrate('system-4', cue(12500));
    narrate('signal-1', cue(17000));
    narrate('phenomena-2', cue(20400));
    return () => {
      clearTimeout(hit);
      clearTimeout(back);
    };
  }, [replayOver]);

  if (!replayOver) {
    return (
      <Stage>
        <p
          className={`font-display text-[20px] tracking-[0.2em] text-[#EDE7DA] transition-opacity duration-[1200ms] ${
            frame >= 0 ? 'opacity-30' : 'opacity-100'
          }`}
        >
          {c.oneMore}
        </p>

        {/* Hard cuts, not crossfades: the replay should feel like being shown
            the evidence, one frame at a time. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={frame}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mt-20 grid h-24 place-items-center"
          >
            {frame === 0 && (
              <span className="animate-badgeBlink rounded px-2.5 py-1 text-[11px] font-bold tracking-[0.22em] text-rose-300 ring-1 ring-rose-400/50">
                {f.urgent}
              </span>
            )}
            {frame === 1 && (
              <div className="flex items-center gap-3 text-gray-400">
                <span className="text-[22px]">🔊</span>
                <span className="text-[13px] tracking-[0.12em]">{f.sound}</span>
              </div>
            )}
            {frame === 2 && (
              <span className="grid h-7 min-w-7 place-items-center rounded-full bg-rose-500/85 px-2 text-[12px] font-bold text-white animate-countPop">
                {f.unread}
              </span>
            )}
            {frame === 3 && (
              <span className="text-[22px] font-semibold tabular-nums tracking-[0.18em] text-rose-300">
                {f.countdown}
              </span>
            )}
            {frame === 4 && (
              <div className="w-56 animate-rowIn rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-left">
                <span className="text-[11px] tracking-[0.14em] text-gray-400">{f.order}</span>
              </div>
            )}
            {frame === 5 && (
              <span className="text-[15px] tracking-[0.1em] text-sky-200/80">
                ✦ {f.confidence}
              </span>
            )}
            {frame === 6 && (
              <div className="w-56 space-y-1.5">
                <div className="h-6 rounded border border-white/25 bg-white/[0.08]" />
                <div className="h-6 rounded border border-white/[0.06] bg-white/[0.015]" />
                <div className="h-6 rounded border border-white/[0.06] bg-white/[0.015]" />
                <p className="pt-1 text-[10px] tracking-[0.18em] text-gray-500">{f.position}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Stage>
    );
  }

  return (
    <Stage>
      <Beat show={shown >= 1}>
        <p className="text-[17px] text-gray-300">{c.influence}</p>
      </Beat>

      <Beat show={shown >= 2} lift={false} className="mt-16">
        <h2 className="font-display text-[34px] tracking-[0.24em] text-[#EDE7DA]">
          {c.thisScreen}
        </h2>
      </Beat>

      <div className="mt-16 space-y-3">
        {c.lines.map((line, i) => (
          <Beat key={line} show={shown >= 3 + i}>
            <p className="text-[15px] text-gray-400">{line}</p>
          </Beat>
        ))}
      </div>

      <div className="mt-16 space-y-2">
        <Beat show={shown >= 6} lift={false}>
          <p className="font-display text-[16px] leading-[1.5] tracking-[0.14em] text-gray-500">
            {c.closingA}
          </p>
        </Beat>
        <Beat show={shown >= 7} lift={false}>
          <p className="font-display text-[16px] leading-[1.5] tracking-[0.14em] text-[#EDE7DA]">
            {c.closingB}
          </p>
        </Beat>
      </div>

      {/* The names, last, once the thing each one points at has already been
          felt twice. A definition offered any earlier is just vocabulary. */}
      <div className="mt-24 space-y-12 text-left">
        <Beat show={shown >= 8}>
          <p className="font-display text-[15px] tracking-[0.24em] text-[#EDE7DA]">
            {c.signalWord}
          </p>
          <p className="mt-2 text-[14px] leading-snug text-gray-400">{c.signalLine}</p>
        </Beat>

        <Beat show={shown >= 9}>
          <p className="font-display text-[15px] tracking-[0.24em] text-[#EDE7DA]">
            {c.fallTitle}
          </p>
          <p className="mt-2 text-[14px] leading-snug text-gray-400">{c.fallLine}</p>
        </Beat>
      </div>

      <Continue show={shown >= 10} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default SceneSystem;
