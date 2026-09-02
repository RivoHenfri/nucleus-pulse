// SCENE 05 — TRANSITION
//
// Two sentences and the pause between them.
//
// This used to advance itself, on the argument that a button here turns a
// breath into a task. In a room that is wrong: it is the one screen where a
// facilitator cannot hold the group, and a participant who looks up from their
// phone finds the moment already gone. Every scene now waits to be told to
// move on. LENS LOCK is still not mentioned yet.

import React, { useEffect } from 'react';
import { COPY, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import {Beat, Stage, beats, cue, useAutoAdvance, useBeats} from './atoms';

interface Props {
  lang: Lang;
  onDone: () => void;
}

// two lines, then the way on
const GAPS = beats(1600, 4200, 1440);

const SceneTransition: React.FC<Props> = ({ lang, onDone }) => {
  const c = COPY[lang].transition;
  const shown = useBeats(GAPS);
  // Nothing to decide here — the screen says its piece and moves on.
  useAutoAdvance(shown >= 3, cue(2600), onDone);

  useEffect(() => {
    narrate('transition-1', cue(1300));
    narrate('transition-2', cue(6000));
    return () => hush();
  }, []);

  return (
    <Stage glow>
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
