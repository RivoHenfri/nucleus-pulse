// SCENE 11 — SIGNAL / NOISE
//
// Signal-to-noise is shown as a property of the room, never as a number
// attached to a person. Forty pieces of information fill the field, all of them
// real, all of them competing — and the field thins out not because most of
// them stopped mattering, but because attention only holds a few.
//
// There is deliberately no "your ratio was X%" anywhere in this scene.

import React, { useEffect, useMemo } from 'react';
import { COPY, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import { Beat, Continue, Stage, beats, cue, useBeats } from './atoms';

interface Props {
  lang: Lang;
  onContinue: () => void;
}

// the field · the line · the hero · out
const GAPS = beats(700, 4200, 3000, 1170);

const COUNT = 44;

const SceneNoise: React.FC<Props> = ({ lang, onContinue }) => {
  const c = COPY[lang].noise;
  const shown = useBeats(GAPS);

  const marks = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        left: Math.random() * 92 + 4,
        top: Math.random() * 88 + 6,
        size: Math.random() < 0.16 ? 5 : Math.random() * 2.4 + 1.6,
        delay: Math.random() * 2600,
        // Only a handful survive the thinning. Which ones is arbitrary — that
        // is the honest version of what attention does under pressure.
        holds: i % 13 === 0,
      })),
    [],
  );

  useEffect(() => {
    narrate('noise', cue(5200));
    narrate('noise-hero', cue(8400));
    return () => hush();
  }, []);

  return (
    <Stage glow>
      <div className="relative mx-auto h-56 w-full max-w-[320px]">
        {marks.map((m, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#EDE7DA] transition-opacity ease-out"
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: m.size,
              height: m.size,
              transitionDuration: '3200ms',
              transitionDelay: `${m.delay}ms`,
              opacity: shown === 0 ? 0 : shown >= 2 && !m.holds ? 0.06 : m.holds ? 0.95 : 0.42,
            }}
          />
        ))}
      </div>

      <Beat show={shown >= 2} className="mt-8">
        <p className="text-[17px] leading-relaxed text-gray-300">{c.line}</p>
      </Beat>

      <Beat show={shown >= 3} lift={false} className="mt-14">
        <h2 className="font-cinzel text-[20px] leading-[1.5] tracking-[0.16em] text-[#EDE7DA]">
          {c.hero}
        </h2>
      </Beat>

      <Continue show={shown >= 4} label={c.cta} onClick={onContinue} />
    </Stage>
  );
};

export default SceneNoise;
