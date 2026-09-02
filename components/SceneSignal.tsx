// SCENE 10 — SIGNAL
//
// The word has been the title of the whole thing since the first screen and
// this is the first time it is defined. By now the participant has already
// lived the definition twice, so it lands as a name for something they know
// rather than a lesson they are being taught.

import React, { useEffect } from 'react';
import { COPY, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import { Beat, Continue, Stage, beats, cue, useBeats } from './atoms';

interface Props {
  lang: Lang;
  onContinue: () => void;
}

// the word · the definition · four supports · the last line · out
const GAPS = beats(1200, 2600, 2400, 3400, 1170);

const SceneSignal: React.FC<Props> = ({ lang, onContinue }) => {
  const c = COPY[lang].signal;
  const shown = useBeats(GAPS);

  useEffect(() => {
    narrate('signal-1', cue(1400));
    narrate('signal-2', cue(10200));
    return () => hush();
  }, []);

  return (
    <Stage glow>
      <Beat show={shown >= 1} lift={false}>
        <h2 className="font-cinzel text-[38px] tracking-[0.3em] text-[#EDE7DA]">{c.word}</h2>
      </Beat>

      <Beat show={shown >= 2} className="mt-8">
        <p className="text-[17px] leading-relaxed text-gray-300">{c.definition}</p>
      </Beat>

      <Beat show={shown >= 3} className="mt-12">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-3">
          {c.concepts.map(word => (
            <span
              key={word}
              className="text-[10px] font-semibold tracking-[0.28em] text-gray-600"
            >
              {word}
            </span>
          ))}
        </div>
      </Beat>

      <Beat show={shown >= 4} className="mt-16">
        <p className="text-[16px] leading-relaxed text-[#EDE7DA]">{c.closing}</p>
      </Beat>

      <Continue show={shown >= 5} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default SceneSignal;
