// SCENE 09 — THE MIRROR
//
// Two columns, four names, no numbers. Whether the participant changed both
// choices, one, or none, the line that follows is written to be equally true —
// none of the three is the good outcome.
//
// Then the sentence the whole scene exists for: what changed was not them.

import React, { useEffect, useMemo } from 'react';
import { COPY, SHORT_NAME, type Lang } from '../i18n';
import type { SituationId } from '../types';
import { hush, narrate } from '../utils/narration';
import { Beat, Continue, Eyebrow, Stage, beats, cue, useBeats } from './atoms';

interface Props {
  lang: Lang;
  first: SituationId[];
  second: SituationId[];
  onContinue: () => void;
}

// columns · the branch line · the two closing lines · out
const GAPS = beats(1000, 2600, 3000, 2200, 1080);

const Column: React.FC<{ label: string; picks: SituationId[]; strong?: boolean }> = ({
  label,
  picks,
  strong,
}) => (
  <div className="flex-1">
    {/* Fixed height: "WITH MORE CONTEXT" wraps to two lines and the two
        columns have to start their lists on the same line to be comparable. */}
    <div className="h-8">
      <Eyebrow className={strong ? 'text-gray-400' : ''}>{label}</Eyebrow>
    </div>
    <div className="mt-4 space-y-2">
      {picks.length === 0 && <p className="text-[13px] text-gray-600">—</p>}
      {picks.map(id => (
        <p
          key={id}
          className={`text-[14px] ${strong ? 'text-[#EDE7DA]' : 'text-gray-400'}`}
        >
          {SHORT_NAME[id]}
        </p>
      ))}
    </div>
  </div>
);

const SceneMirror: React.FC<Props> = ({ lang, first, second, onContinue }) => {
  const c = COPY[lang].mirror;
  const shown = useBeats(GAPS);

  // How many of the first two are no longer there. All three answers are valid;
  // the copy is branched so that none of them reads as the better result.
  const changed = useMemo(
    () => first.filter(id => !second.includes(id)).length,
    [first, second],
  );
  const branch = changed >= 2 ? c.both : changed === 1 ? c.one : c.none;

  useEffect(() => {
    // Which of the three is true is the whole point of the scene, and it was
    // the one line left on screen in silence.
    narrate(changed >= 2 ? 'mirror-both' : changed === 1 ? 'mirror-one' : 'mirror-none', cue(2800));
    narrate('mirror', cue(7600));
    return () => hush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stage>
      <Beat show={shown >= 1} lift={false}>
        <div className="flex gap-5 text-left">
          <Column label={c.first} picks={first} />
          <div className="w-px self-stretch bg-white/10" />
          <Column label={c.withContext} picks={second} strong />
        </div>
      </Beat>

      <Beat show={shown >= 2} className="mt-16">
        <p className="text-[17px] leading-relaxed text-gray-300">{branch}</p>
      </Beat>

      <div className="mt-16 space-y-2">
        <Beat show={shown >= 3} lift={false}>
          <p className="font-display text-[17px] tracking-[0.14em] text-gray-500">{c.closingA}</p>
        </Beat>
        <Beat show={shown >= 4} lift={false}>
          <p className="font-display text-[17px] tracking-[0.14em] text-[#EDE7DA]">{c.closingB}</p>
        </Beat>
      </div>

      <Continue show={shown >= 5} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default SceneMirror;
