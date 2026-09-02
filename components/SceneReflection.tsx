// SCENE 04 — REFLECTION
//
// Not "why did you choose this" — that question makes people defend themselves.
// "What mattered to you here?" lets them describe the moment instead.
//
// These answers are self-reported and stay self-reported. They come back once,
// in Scene 12 and in PULSEBACK, quoted exactly as chosen. Nothing is inferred
// from them, ever.

import React, { useEffect, useState } from 'react';
import { INFLUENCES } from '../data';
import { COPY, type Lang } from '../i18n';
import type { InfluenceId } from '../types';
import { hush, narrate } from '../utils/narration';
import { buzz, tap } from '../utils/sound';
import { Beat, Continue, Hero, Stage, beats, cue, useBeats } from './atoms';

interface Props {
  lang: Lang;
  onContinue: (influences: InfluenceId[]) => void;
}

const MAX = 2;
const GAPS = beats(1200, 700);

const SceneReflection: React.FC<Props> = ({ lang, onContinue }) => {
  const c = COPY[lang].reflection;
  const shown = useBeats(GAPS);
  const [chosen, setChosen] = useState<InfluenceId[]>([]);

  useEffect(() => {
    narrate('reflection', cue(900));
    narrate('ready', cue(3600));
    return () => hush();
  }, []);

  const toggle = (id: InfluenceId) => {
    setChosen(current => {
      if (current.includes(id)) return current.filter(x => x !== id);
      if (current.length >= MAX) return current;
      tap();
      buzz(18);
      return [...current, id];
    });
  };

  return (
    <Stage>
      <Hero show={shown >= 1}>{c.title}</Hero>

      <Beat show={shown >= 2} className="mt-4">
        <p className="text-[13px] text-gray-500">{c.hint}</p>

        <div className="mt-10 space-y-2.5">
          {INFLUENCES.map(id => {
            const on = chosen.includes(id);
            const blocked = !on && chosen.length >= MAX;
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={`w-full rounded-full border px-6 py-3.5 text-[14px] transition-all duration-300 ${
                  on
                    ? 'border-[#EDE7DA]/70 bg-[#EDE7DA]/[0.08] text-[#EDE7DA]'
                    : 'border-white/10 text-gray-400 hover:border-white/25'
                } ${blocked ? 'opacity-35' : ''}`}
              >
                {c.options[id]}
              </button>
            );
          })}
        </div>
      </Beat>

      <Continue
        show={chosen.length > 0}
        label={c.cta}
        onClick={() => {
          hush();
          onContinue(chosen);
        }}
      />
    </Stage>
  );
};

export default SceneReflection;
