// SCENE 14 — NUCLEUS PHENOMENA
//
// Two names for what the participant has now felt twice: NOISE GRAVITY and
// SIGNALFALL. Pulse 01 introduces no others — the rest of the vocabulary
// belongs to Pulses that have not happened yet.
//
// The closing pair is the ethical spine of the whole thing: the system shapes
// what is easy to see, and the human still decides what deserves attention.
// Neither sentence is allowed to sit alone.

import { motion } from 'motion/react';
import React, { useEffect } from 'react';
import { COPY, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import { drone } from '../utils/sound';
import {Beat, Stage, beats, cue, useAutoAdvance, useBeats} from './atoms';

interface Props {
  lang: Lang;
  onContinue: () => void;
}

// gravity · signalfall · the hero · design · judgment · out
const GAPS = beats(1200, 4400, 4200, 2600, 2400, 1170);

const Phenomenon: React.FC<{
  show: boolean;
  title: string;
  line: string;
  children: React.ReactNode;
}> = ({ show, title, line, children }) => (
  <Beat show={show}>
    <div className="flex items-center gap-4 text-left">
      <div className="grid h-14 w-14 shrink-0 place-items-center">{children}</div>
      <div>
        <p className="font-display text-[15px] tracking-[0.2em] text-[#EDE7DA]">{title}</p>
        <p className="mt-1 text-[14px] leading-snug text-gray-400">{line}</p>
      </div>
    </div>
  </Beat>
);

const ScenePhenomena: React.FC<Props> = ({ lang, onContinue }) => {
  const c = COPY[lang].phenomena;
  const shown = useBeats(GAPS);
  // Nothing to decide here — the screen says its piece and moves on.
  useAutoAdvance(shown >= 6, cue(2600), onContinue);

  useEffect(() => {
    narrate('phenomena-1', cue(1100));
    narrate('phenomena-2', cue(5600));
    narrate('phenomena-3', cue(10000));
    const boom = setTimeout(drone, GAPS[0] + GAPS[1] + GAPS[2] - 300);
    return () => {
      clearTimeout(boom);
      hush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stage glow>
      <div className="space-y-12">
        {/* Small marks pulled off course by a heavy one. */}
        <Phenomenon show={shown >= 1} title={c.gravityTitle} line={c.gravityLine}>
          <div className="relative h-14 w-14">
            <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400/70 blur-[1px]" />
            <span className="absolute inset-0 rounded-full border border-rose-300/25 animate-ping-ring" />
            <span className="absolute left-1 top-2 h-1.5 w-1.5 rounded-full bg-[#EDE7DA]/60" />
            <span className="absolute bottom-2 right-1 h-1.5 w-1.5 rounded-full bg-[#EDE7DA]/60" />
          </div>
        </Phenomenon>

        {/* One bright mark sinking under the weight of the ordinary ones. */}
        <Phenomenon show={shown >= 2} title={c.fallTitle} line={c.fallLine}>
          {/* The one that matters sinks through the ordinary traffic and dims
              as it goes. An earlier version drew it brighter than its
              neighbours, which said the opposite of "buried". */}
          <div className="relative flex h-14 flex-col justify-center gap-[5px]">
            {[0, 1, 2, 3, 4].map(i => (
              <span key={i} className="h-1 w-14 rounded bg-white/25" />
            ))}
            <motion.span
              className="absolute left-0 h-1 w-9 rounded bg-amber-200"
              animate={{ top: ['16%', '78%'], opacity: [0.95, 0.15] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeIn' }}
            />
          </div>
        </Phenomenon>
      </div>

      <Beat show={shown >= 3} lift={false} className="mt-20">
        <h2 className="font-display text-[21px] leading-[1.5] tracking-[0.18em] text-[#EDE7DA]">
          {c.hero}
        </h2>
      </Beat>

      <div className="mt-14 space-y-3">
        <Beat show={shown >= 4}>
          <p className="text-[15px] leading-relaxed text-gray-400">{c.closingA}</p>
        </Beat>
        <Beat show={shown >= 5}>
          <p className="text-[15px] leading-relaxed text-[#EDE7DA]">{c.closingB}</p>
        </Beat>
      </div>

    </Stage>
  );
};

export default ScenePhenomena;
