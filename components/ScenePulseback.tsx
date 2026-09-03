// SCENE 15 — PULSEBACK
//
// A personal mirror and nothing else: what they noticed, what they said
// mattered, what they chose once they could see more. Three rows of their own
// words, handed back without a single adjective attached.
//
// Then one fact about the morning rather than about them: the thing carrying a
// decision that neither round ever opened, how long it had been sitting there,
// and what it was waiting on. That is SIGNALFALL happening to their own
// morning, which is worth more than SIGNALFALL defined on a slide — and it is
// said as a fact, with "not a mistake" attached, because it is not one.
//
// No score, no ratio, no profile, no comparison to anyone else — and the scene
// ends by saying out loud that a different person could have chosen otherwise
// and been right.

import React, { useEffect } from 'react';
import { SITUATION_IDS, situationById } from '../data';
import { COPY, SHORT_NAME, SITUATION_COPY, type Lang } from '../i18n';
import type { InfluenceId, SituationId } from '../types';
import { hush, narrate } from '../utils/narration';
import { pulseConfirm } from '../utils/sound';
import { Beat, Continue, Eyebrow, Stage, beats, cue, useBeats } from './atoms';

interface Props {
  lang: Lang;
  first: SituationId[];
  influences: InfluenceId[];
  second: SituationId[];
  onContinue: () => void;
}

// title · noticed · mattered · with context · the quiet one · its name ·
// the two closing lines · out
const GAPS = beats(900, 1800, 2000, 2000, 3400, 3000, 2600, 2000, 1170);

const Row: React.FC<{ show: boolean; label: string; values: string[]; strong?: boolean }> = ({
  show,
  label,
  values,
  strong,
}) => (
  <Beat show={show}>
    <Eyebrow>{label}</Eyebrow>
    <p className={`mt-2 text-[17px] ${strong ? 'text-[#EDE7DA]' : 'text-gray-300'}`}>
      {values.length ? values.join(' · ') : '—'}
    </p>
  </Beat>
);

const ScenePulseback: React.FC<Props> = ({ lang, first, influences, second, onContinue }) => {
  const c = COPY[lang].pulseback;
  const o = COPY[lang].reflection.options;
  const shown = useBeats(GAPS);

  /* The one thing that was waiting on a decision and never got opened, in
     either round. Where several were missed the oldest one is shown: it is the
     one that had been there longest with nobody saying anything about it. */
  const touched = new Set([...first, ...second]);
  const missed = SITUATION_IDS
    .filter(id => {
      const copy = SITUATION_COPY[lang][id];
      return Boolean(copy.decision && copy.consequence) && !touched.has(id);
    })
    .sort((a, b) => situationById(b).minsAgo - situationById(a).minsAgo);
  const quiet = missed[0];
  const quietCopy = quiet ? SITUATION_COPY[lang][quiet] : null;

  useEffect(() => {
    const chime = setTimeout(pulseConfirm, 600);
    // Their own three rows, spoken back in the order they appear on screen.
    // Each cue gets its own moment. Two narrate() calls sharing a delay is a
    // coin toss over which one survives, and the queue can only order what it
    // is actually handed.
    narrate('you-chose', cue(1600));
    first.forEach((id, i) => narrate(`name-${id}`, cue(1800 + i * 200)));
    narrate('you-context', cue(2400));
    second.forEach((id, i) => narrate(`name-${id}`, cue(2600 + i * 200)));
    narrate('pulseback', cue(15800));
    return () => {
      clearTimeout(chime);
      hush();
    };
  }, []);

  return (
    <Stage>
      <Beat show={shown >= 1} lift={false}>
        <p className="font-display text-[22px] tracking-[0.28em] text-[#EDE7DA]">
          ⚡ {c.title}
        </p>
      </Beat>

      <div className="mt-16 space-y-11">
        <Row show={shown >= 2} label={c.noticed} values={first.map(id => SHORT_NAME[id])} />
        <Row show={shown >= 3} label={c.mattered} values={influences.map(id => o[id])} />
        <Row
          show={shown >= 4}
          label={c.withContext}
          values={second.map(id => SHORT_NAME[id])}
          strong
        />
      </div>

      {/* One fact about the morning. Never a verdict on the person. */}
      <div className="mt-20">
        {quiet && quietCopy ? (
          <>
            <Beat show={shown >= 5}>
              <Eyebrow>{c.quietLabel}</Eyebrow>
              <p className="mt-3 text-[17px] leading-snug text-[#EDE7DA]">
                {c.quietLead(SHORT_NAME[quiet], situationById(quiet).minsAgo)}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-400">
                {quietCopy.consequence}
              </p>
            </Beat>

            <Beat show={shown >= 6} className="mt-7">
              <p className="font-display text-[14px] tracking-[0.28em] text-gray-400">
                {c.quietName}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-gray-500">{c.quietNote}</p>
            </Beat>
          </>
        ) : (
          <Beat show={shown >= 5}>
            <Eyebrow>{c.quietLabel}</Eyebrow>
            <p className="mt-3 text-[16px] leading-relaxed text-gray-300">{c.quietNone}</p>
          </Beat>
        )}
      </div>

      <div className="mt-16 space-y-2">
        <Beat show={shown >= 7}>
          <p className="text-[15px] leading-relaxed text-gray-400">{c.closingA}</p>
        </Beat>
        <Beat show={shown >= 8}>
          <p className="text-[15px] leading-relaxed text-gray-400">{c.closingB}</p>
        </Beat>
      </div>

      <Continue show={shown >= 9} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default ScenePulseback;
