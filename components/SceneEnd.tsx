// END / NEXT PULSE
//
// PULSE 01 closes on the word it opened with, then lets that word fade before
// undercutting it — noticing something is not the same as it being true. That
// sentence is the hinge into PULSE 02, and nothing more of PULSE 02 is built
// or promised here.
//
// The mark that ignited on the first screen lights again on the last one, so
// the run is bracketed by the same image. Nothing between them ever shows it.

import React, { useEffect, useState } from 'react';
import { COPY, SHORT_NAME, type Lang } from '../i18n';
import type { SituationId } from '../types';
import { hush, narrate } from '../utils/narration';
import { shimmer } from '../utils/sound';
import { Beat, Stage, beats, cue, useBeats } from './atoms';
import NucleusLogo from './NucleusLogo';

interface Props {
  lang: Lang;
  first: SituationId[];
  second: SituationId[];
  onRestart: () => void;
}

// complete · SIGNAL · (fade) · but · the mark · next pulse · TRUTH · question
// · the logo closing the loop
const GAPS = beats(1200, 1400, 3400, 4200, 2200, 1800, 1600, 2400, 1350);

const SceneEnd: React.FC<Props> = ({ lang, first, second, onRestart }) => {
  const c = COPY[lang].end;
  const m = COPY[lang].mirror;

  // The share is the PULSEBACK mirror, verbatim: what they noticed, what they
  // chose with context, and which of the three mirror lines was true for
  // them. Their own words, voluntarily sent. The app itself exposes nothing.
  const changed = first.filter(id => !second.includes(id)).length;
  const line = changed >= 2 ? m.both : changed === 1 ? m.one : m.none;
  const text = c.shareText(
    first.map(id => SHORT_NAME[id]).join(' · ') || '—',
    second.map(id => SHORT_NAME[id]).join(' · ') || '—',
    line,
  ) + window.location.origin + window.location.pathname;
  const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const shown = useBeats(GAPS);
  const [fadeSignal, setFadeSignal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFadeSignal(true), GAPS[0] + GAPS[1] + GAPS[2]);
    const s = setTimeout(shimmer, 600);
    narrate('end', cue(1300));
    narrate('end-next', cue(12000));
    return () => {
      clearTimeout(t);
      clearTimeout(s);
      hush();
    };
  }, []);

  return (
    <Stage glow>
      <Beat show={shown >= 1} lift={false}>
        <p className="text-[22px]">⚡</p>
        <h2 className="mt-6 font-display text-[19px] tracking-[0.26em] text-[#EDE7DA]">
          {c.complete}
        </h2>
      </Beat>

      <div
        className={`mt-6 transition-opacity duration-[2600ms] ${
          shown >= 2 && !fadeSignal ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="font-display text-[15px] tracking-[0.36em] text-gray-400">{c.signal}</p>
      </div>


      {/* The challenge, while they are still standing on "PULSE 01 COMPLETE".
          It used to sit under the TRUTH teaser, which meant the moment to
          hand the question on arrived after the story had already moved to
          the next one. Share first; then the hinge into Pulse 02. */}
      <Beat show={shown >= 3} className="mt-10">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/90 px-7 py-3.5 text-[12px] font-bold tracking-[0.2em] text-[#062b15] transition-transform duration-300 active:scale-95"
        >
          <span className="text-[15px]">💬</span>
          {c.share}
        </a>
      </Beat>

      <Beat show={shown >= 4} className="mt-16">
        <p className="text-[16px] leading-relaxed text-gray-300">{c.but}</p>
      </Beat>

      <Beat show={shown >= 5} lift={false} className="mt-20">
        <p className="text-[18px] text-gray-600">◉</p>
      </Beat>

      <Beat show={shown >= 6} className="mt-8">
        <p className="text-[10px] font-semibold tracking-[0.34em] text-gray-500">{c.next}</p>
      </Beat>

      <Beat show={shown >= 7} lift={false} className="mt-4">
        <h2 className="font-display text-[36px] tracking-[0.3em] text-[#EDE7DA]">{c.truth}</h2>
      </Beat>

      <Beat show={shown >= 8} className="mt-6">
        <p className="text-[16px] italic text-gray-400">{c.question}</p>
      </Beat>

      {/* Where it started. */}
      <Beat show={shown >= 9} lift={false} className="mt-20">
        <NucleusLogo size={190} ignite={shown >= 9} />
      </Beat>

      <div
        className={`transition-opacity duration-1000 ${shown >= 9 ? 'opacity-100' : 'opacity-0'}`}
      >
        <button
          onClick={() => {
            hush();
            onRestart();
          }}
          className="mt-14 text-[11px] tracking-[0.24em] text-gray-700 hover:text-gray-400 transition-colors duration-500"
        >
          {c.restart}
        </button>
      </div>
    </Stage>
  );
};

export default SceneEnd;
