// SCENE 05 — TRANSITION
//
// Two sentences and the pause between them. No button: the participant has just
// answered something about themselves, and being asked to press CONTINUE here
// would turn a breath into a task. LENS LOCK is not mentioned yet.

import React, { useEffect } from 'react';
import { COPY, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import { Beat, Stage, beats, cue, useBeats } from './atoms';

interface Props {
  lang: Lang;
  onDone: () => void;
}

const GAPS = beats(1600, 4200);
const HOLD_AFTER = cue(4600);

const SceneTransition: React.FC<Props> = ({ lang, onDone }) => {
  const c = COPY[lang].transition;
  const shown = useBeats(GAPS);

  useEffect(() => {
    narrate('transition-1', cue(1300));
    narrate('transition-2', cue(6000));
    const timer = setTimeout(onDone, GAPS[0] + GAPS[1] + HOLD_AFTER);
    return () => {
      clearTimeout(timer);
      hush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stage>
      <div className="space-y-10">
        <Beat show={shown >= 1}>
          <p className="text-[18px] leading-relaxed text-gray-300">{c.first}</p>
        </Beat>
        <Beat show={shown >= 2}>
          <p className="text-[18px] leading-relaxed text-[#EDE7DA]">{c.second}</p>
        </Beat>
      </div>
    </Stage>
  );
};

export default SceneTransition;
