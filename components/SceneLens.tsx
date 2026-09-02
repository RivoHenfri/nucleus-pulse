// SCENE 12 — LENS
//
// Their own words come back first — the influences they chose in Scene 04,
// quoted, not interpreted. Only then does the scene name the thing.
//
// LENS LOCK is stated as a condition, not an accusation: the lens is useful,
// and the sentence that closes the scene tells them to keep it.

import React, { useEffect } from 'react';
import { COPY, type Lang } from '../i18n';
import type { InfluenceId } from '../types';
import { hush, narrate } from '../utils/narration';
import { Beat, Continue, Eyebrow, Stage, beats, cue, useBeats } from './atoms';

interface Props {
  lang: Lang;
  influences: InfluenceId[];
  onContinue: () => void;
}

// their words · a lens helps · but a boundary · the four lenses · LENS LOCK
// · the definition · the hero · out
const GAPS = beats(1100, 3000, 3200, 2400, 2600, 2000, 2800, 2600);

const SceneLens: React.FC<Props> = ({ lang, influences, onContinue }) => {
  const c = COPY[lang].lens;
  const o = COPY[lang].reflection.options;
  const shown = useBeats(GAPS);

  useEffect(() => {
    narrate('lens-1', cue(1300));
    narrate('lens-2', cue(4600));
    narrate('lens-3', cue(12000));
    return () => hush();
  }, []);

  return (
    <Stage>
      <Beat show={shown >= 1}>
        <Eyebrow>{c.yours}</Eyebrow>
        <div className="mt-4 space-y-1.5">
          {influences.length === 0 && <p className="text-[14px] text-gray-600">—</p>}
          {influences.map(id => (
            <p key={id} className="text-[16px] text-[#EDE7DA]">
              {o[id]}
            </p>
          ))}
        </div>
      </Beat>

      <div className="mt-16 space-y-8">
        <Beat show={shown >= 2}>
          <p className="text-[17px] text-gray-300">{c.helps}</p>
        </Beat>
        <Beat show={shown >= 3}>
          <p className="text-[17px] text-gray-400">{c.boundary}</p>
        </Beat>
      </div>

      <Beat show={shown >= 4} className="mt-14">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-3">
          {c.lenses.map(l => (
            <span key={l} className="text-[10px] font-semibold tracking-[0.28em] text-gray-600">
              {l}
            </span>
          ))}
        </div>
      </Beat>

      <div className="mt-16">
        <Beat show={shown >= 5} lift={false}>
          <h2 className="font-cinzel text-[26px] tracking-[0.26em] text-[#EDE7DA]">
            {c.lockTitle}
          </h2>
        </Beat>
        <Beat show={shown >= 6} className="mt-5">
          <p className="text-[15px] leading-relaxed text-gray-400">{c.lockLine}</p>
        </Beat>
      </div>

      <Beat show={shown >= 7} lift={false} className="mt-16 space-y-1.5">
        <p className="font-cinzel text-[17px] tracking-[0.16em] text-[#EDE7DA]">{c.heroA}</p>
        <p className="font-cinzel text-[17px] leading-[1.5] tracking-[0.16em] text-gray-500">
          {c.heroB}
        </p>
      </Beat>

      <Continue show={shown >= 8} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default SceneLens;
