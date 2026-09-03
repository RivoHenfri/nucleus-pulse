// END / NEXT PULSE
//
// PULSE 01 closes on the word it opened with, now with a meaning attached.
//
// That word used to fade out a few seconds after arriving, on the idea that
// letting it go made the line underneath land harder. On a phone it did the
// opposite: the definition was gone before it could be read, and what was left
// was a screen with a hole in the middle of it. It stays up now. That
// sentence is the hinge into PULSE 02, and nothing more of PULSE 02 is built
// or promised here.
//
// The mark that ignited on the first screen lights again on the last one, so
// the run is bracketed by the same image. Nothing between them ever shows it.

import React, { useEffect } from 'react';
import { COPY, SHORT_NAME, type Lang } from '../i18n';
import type { SituationId } from '../types';
import { hush, narrate } from '../utils/narration';
import { shimmer } from '../utils/sound';
import { Beat, Stage, beats, cue, useBeats } from './atoms';
import NucleusLogo from './NucleusLogo';
import WhatsAppMark from './WhatsAppMark';
import { roomCode } from '../utils/room';

interface Props {
  lang: Lang;
  first: SituationId[];
  second: SituationId[];
  onRestart: () => void;
}

// complete · SIGNAL · share · but · the mark · next pulse · TRUTH · question ·
// the logo closing the loop
const GAPS = beats(1200, 1900, 3600, 4200, 2200, 1800, 1600, 2400, 1350);

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
  ) +
    window.location.origin +
    window.location.pathname +
    // The room travels with the challenge. A friend who joins from this
    // message must land in the same room, or the facilitator's count and
    // the group's share drift apart.
    (roomCode() ? `?room=${roomCode()}` : '');
  const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const shown = useBeats(GAPS);

  useEffect(() => {
    const s = setTimeout(shimmer, 600);
    narrate('end', cue(1300));
    narrate('end-next', cue(12000));
    return () => {
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

      {/* SIGNAL, with a meaning attached. SIGNALFALL is not repeated here —
          PULSEBACK just showed it happening to this participant's own morning,
          and a definition after that would only flatten it back into a slide. */}
      <Beat show={shown >= 2} className="mt-8">
        <p className="font-display text-[16px] tracking-[0.36em] text-[#EDE7DA]">{c.signal}</p>
        <p className="mx-auto mt-3 max-w-[21rem] text-[15px] leading-relaxed text-gray-400">
          {c.signalLine}
        </p>
      </Beat>

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
          <WhatsAppMark size={17} />
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

      {/* The word "experiment", said once, at the end, small — a reveal rather
          than a disclaimer. It used to close the scene before this one; that
          scene is gone, and this was the only line in it worth keeping. */}
      <Beat show={shown >= 9} className="mt-10">
        <p className="font-display text-[12px] tracking-[0.3em] text-gray-500">{c.nucleus}</p>
        <p className="mx-auto mt-2 max-w-[20rem] text-[12px] leading-relaxed text-gray-600">
          {c.experiment}
        </p>
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
