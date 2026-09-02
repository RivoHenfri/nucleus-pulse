// SCENE 07 — AI CONTEXT REVEAL
//
// The card that was most certain about the morning opens up, and the certainty
// turns out to have been computed over six of eight sources.
//
// The AI is not wrong and it is not stupid. It reasoned well over what reached
// it. That is the whole point, and the scene stops there — no lecture, no
// verdict on AI, no suggestion that the participant should have known better.

import React, { useEffect } from 'react';
import { COPY, MISSING_SOURCE, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import {Beat, Stage, beats, cue, useAutoAdvance, useBeats} from './atoms';

interface Props {
  lang: Lang;
  onContinue: () => void;
}

// the card · sources · missing · the two lines · the quote · out
const GAPS = beats(900, 1800, 2000, 2600, 2600, 1170);

const SceneAI: React.FC<Props> = ({ lang, onContinue }) => {
  const c = COPY[lang].ai;
  const shown = useBeats(GAPS);
  // Nothing to decide here — the screen says its piece and moves on.
  useAutoAdvance(shown >= 6, cue(2600), onContinue);

  useEffect(() => {
    narrate('ai-1', cue(7500));
    narrate('ai-2', cue(11500));
    return () => hush();
  }, []);

  return (
    <Stage>
      <Beat show={shown >= 1} lift={false}>
        <div className="rounded-2xl border border-sky-300/20 bg-sky-400/[0.04] px-5 py-5 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-sky-200">✦</span>
            <span className="text-[10px] font-bold tracking-[0.24em] text-sky-200/80">
              {c.eyebrow}
            </span>
          </div>

          <p className="mt-3 text-[10px] tracking-[0.2em] text-gray-500 uppercase">
            {c.recommended}
          </p>
          <p className="mt-1 text-[16px] text-gray-100">{c.candidate}</p>
          <p className="mt-1 text-[13px] text-sky-200/70">{c.confidence}</p>

          <div className="mt-5 space-y-3 border-t border-white/[0.07] pt-4">
            <Beat show={shown >= 2}>
              <p className="text-[9px] font-semibold tracking-[0.22em] text-gray-600 uppercase">
                {c.sources}
              </p>
              <p className="mt-1 text-[15px] tabular-nums text-gray-300">{c.sourcesValue}</p>
            </Beat>

            <Beat show={shown >= 3}>
              <p className="text-[9px] font-semibold tracking-[0.22em] text-gray-600 uppercase">
                {c.missing}
              </p>
              <p className="mt-1 text-[14px] text-gray-400">{MISSING_SOURCE}</p>
            </Beat>
          </div>
        </div>
      </Beat>

      <div className="mt-14 space-y-2">
        <Beat show={shown >= 4} lift={false}>
          <p className="font-display text-[18px] tracking-[0.14em] text-[#EDE7DA]">{c.high}</p>
        </Beat>
        <Beat show={shown >= 5} lift={false}>
          <p className="font-display text-[18px] tracking-[0.14em] text-gray-500">{c.incomplete}</p>
        </Beat>
      </div>

      <Beat show={shown >= 6} className="mt-10">
        <p className="text-[15px] italic leading-relaxed text-gray-400">{c.quote}</p>
      </Beat>

    </Stage>
  );
};

export default SceneAI;
