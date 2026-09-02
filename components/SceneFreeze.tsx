// SCENE 03 — FREEZE
//
// The sound stops, the movement stops, and for two seconds nothing happens at
// all. Then three numbers, the question, and the two things they chose — shown
// back exactly as they were, with no verdict attached to either.
//
// And read back aloud. The scene was showing the participant their own choices
// in silence, which made the screen feel like a receipt; hearing "you chose"
// and then your own two names said out loud is what turns it into a mirror.
// The read-back is assembled from fixed clips through the narration queue —
// the carrier line, then one clip per situation — so nothing has to be
// synthesised live and it sounds like the same person throughout.

import React, { useEffect } from 'react';
import { COPY, SHORT_NAME, SITUATION_COPY, type Lang } from '../i18n';
import type { SituationId } from '../types';
import { hush, narrate } from '../utils/narration';
import { Beat, Continue, Eyebrow, Hero, Stage, beats, cue, useBeats } from './atoms';

interface Props {
  lang: Lang;
  picks: SituationId[];
  onContinue: () => void;
}

// three numbers · the question · what they chose · the way out
const GAPS = beats(1400, 900, 900, 2400, 2000, 2600);

const SceneFreeze: React.FC<Props> = ({ lang, picks, onContinue }) => {
  const c = COPY[lang].freeze;
  const shown = useBeats(GAPS);

  useEffect(() => {
    narrate('freeze', cue(4200));
    // The queue holds each line until the one before it has finished, so these
    // land as one spoken sentence however tight the tempo is set.
    narrate('you-chose', cue(6400));
    picks.forEach((id, i) => narrate(`name-${id}`, cue(6600 + i * 200)));
    narrate('ready', cue(7600));
    return () => hush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stage>
      <div className="space-y-3">
        {c.stats.map((stat, i) => (
          <Beat key={stat} show={shown >= i + 1}>
            <p className="text-[15px] tracking-[0.06em] text-gray-500">{stat}</p>
          </Beat>
        ))}
      </div>

      <div className="mt-16">
        <Hero show={shown >= 4}>{c.question}</Hero>
      </div>

      <Beat show={shown >= 5} className="mt-14">
        <Eyebrow>{c.yours}</Eyebrow>
        <div className="mt-4 space-y-2.5">
          {picks.map(id => (
            <div
              key={id}
              className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 text-left"
            >
              <p className="text-[10px] font-semibold tracking-[0.22em] text-gray-500">
                {SHORT_NAME[id]}
              </p>
              <p className="mt-1 text-[14px] leading-snug text-gray-300">
                {SITUATION_COPY[lang][id].headline}
              </p>
            </div>
          ))}
          {picks.length === 0 && (
            <p className="text-[13px] text-gray-600">—</p>
          )}
        </div>
      </Beat>

      <Continue show={shown >= 6} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default SceneFreeze;
