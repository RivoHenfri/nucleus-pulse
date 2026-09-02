// SCENE 15 — PULSEBACK
//
// A personal mirror and nothing else: what they noticed, what they said
// mattered, what they chose once they could see more. Three rows of their own
// words, handed back without a single adjective attached.
//
// No score, no ratio, no profile, no comparison to anyone else — and the scene
// ends by saying out loud that a different person could have chosen otherwise
// and been right.

import React, { useEffect } from 'react';
import { COPY, SHORT_NAME, type Lang } from '../i18n';
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

// title · noticed · mattered · with context · the two closing lines · out
const GAPS = beats(900, 1800, 2000, 2000, 3000, 2000, 2600);

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

  useEffect(() => {
    const chime = setTimeout(pulseConfirm, 600);
    narrate('pulseback', cue(10200));
    return () => {
      clearTimeout(chime);
      hush();
    };
  }, []);

  return (
    <Stage>
      <Beat show={shown >= 1} lift={false}>
        <p className="font-cinzel text-[22px] tracking-[0.28em] text-[#EDE7DA]">
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

      <div className="mt-20 space-y-2">
        <Beat show={shown >= 5}>
          <p className="text-[15px] leading-relaxed text-gray-400">{c.closingA}</p>
        </Beat>
        <Beat show={shown >= 6}>
          <p className="text-[15px] leading-relaxed text-gray-400">{c.closingB}</p>
        </Beat>
      </div>

      <Continue show={shown >= 7} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default ScenePulseback;
