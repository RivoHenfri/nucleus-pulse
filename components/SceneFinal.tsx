// FINAL REVEAL
//
// Black, one nucleus, and the distance between the question the participant was
// asked on the first screen and the sentence they end on.
//
// The word "experiment" appears here for the first and only time, in the
// smallest type in the app. Put at the beginning it would be a disclaimer and
// everyone would have played the game differently; put here it is simply what
// the last few minutes turn out to have been.

import React, { useEffect } from 'react';
import { COPY, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import { Beat, Continue, NucleusMark, Stage, beats, cue, useBeats } from './atoms';

interface Props {
  lang: Lang;
  onContinue: () => void;
}

// not about · was about · four forces · not the same · not a problem ·
// the problem · the hero · the question · the small print · out
const GAPS = beats(1600, 3400, 3000, 1300, 1300, 1300, 3000, 2600, 3400, 3800, 3000, 2600, 1170);

const SceneFinal: React.FC<Props> = ({ lang, onContinue }) => {
  const c = COPY[lang].final;
  const shown = useBeats(GAPS);

  useEffect(() => {
    narrate('final-1', cue(1700));
    narrate('final-2', cue(5200));
    narrate('final-3', cue(15000));
    narrate('final-4', cue(21000));
    narrate('final-5', cue(27000));
    narrate('final-6', cue(32000));
    return () => hush();
  }, []);

  return (
    <Stage glow>
      <NucleusMark size={40} dim />

      <div className="mt-14 space-y-8">
        <Beat show={shown >= 1}>
          <p className="text-[17px] leading-relaxed text-gray-400">{c.notAbout}</p>
        </Beat>
        <Beat show={shown >= 2}>
          <p className="text-[17px] leading-relaxed text-[#EDE7DA]">{c.wasAbout}</p>
        </Beat>
      </div>

      <div className="mt-16 space-y-2">
        {c.forces.map((force, i) => (
          <Beat key={force} show={shown >= 3 + i}>
            <p className="text-[15px] text-gray-500">{force}</p>
          </Beat>
        ))}
      </div>

      <div className="mt-16 space-y-3">
        <Beat show={shown >= 7}>
          <p className="text-[16px] text-gray-300">{c.notSame}</p>
        </Beat>
        <Beat show={shown >= 8}>
          <p className="text-[16px] text-gray-500">{c.notProblem}</p>
        </Beat>
        <Beat show={shown >= 9} className="pt-6">
          <p className="text-[16px] leading-relaxed text-[#EDE7DA]">{c.problem}</p>
        </Beat>
      </div>

      <Beat show={shown >= 10} lift={false} className="mt-20">
        <h2 className="font-display text-[22px] leading-[1.55] tracking-[0.18em] text-[#EDE7DA]">
          {c.hero}
        </h2>
      </Beat>

      <Beat show={shown >= 11} className="mt-16">
        <p className="text-[16px] italic leading-relaxed text-gray-400">{c.reflection}</p>
        <p className="mt-5 text-[12px] text-gray-600">{c.small}</p>
      </Beat>

      {/* The reveal, understated on purpose. */}
      <Beat show={shown >= 12} className="mt-24">
        <p className="text-[11px] font-semibold tracking-[0.34em] text-gray-500">{c.nucleus}</p>
        <p className="mx-auto mt-3 max-w-xs text-[12px] italic leading-relaxed text-gray-600">
          {c.experiment}
        </p>
      </Beat>

      <Continue show={shown >= 13} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default SceneFinal;
