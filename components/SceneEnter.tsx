// SCENE 01 — ENTER
//
// Black. The Nucleus mark ignites from its own centre. Then, and only then, a
// language, five quiet sentences, and a way in.
//
// No mention of an experiment, no explanation of Signal or Noise, no
// instruction beyond "choose what makes sense to you".
//
// The language is chosen before the first word is spoken and holds for the
// rest of the run — the alternative is swapping the voice under someone who is
// already inside the experience. Choosing is also the gesture that buys the
// right to play audio at all on mobile, so it is spent there deliberately.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { COPY, LANGUAGES, type Lang } from '../i18n';
import { hush, narrate, setNarrationLang, unlockAudio, whenQuiet } from '../utils/narration';
import { buzz, unlockWebAudio } from '../utils/sound';
import { Beat, Continue, Stage, beats, cue, useBeats } from './atoms';
import NucleusLogo from './NucleusLogo';

interface Props {
  lang: Lang;
  onChooseLang: (lang: Lang) => void;
  onEnter: () => void;
}

/** The mark takes this long to light before anything is asked of anyone. */
const IGNITION_MS = cue(4200);

// pulse line · question · button
const GAPS = beats(1800, 2200, 1350);

const SceneEnter: React.FC<Props> = ({ lang, onChooseLang, onEnter }) => {
  const c = COPY[lang].enter;
  const [lit, setLit] = useState(false);
  const [started, setStarted] = useState(false);
  /** The five opening lines have all been spoken. */
  const [spoken, setSpoken] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLit(true), IGNITION_MS);
    return () => clearTimeout(t);
  }, []);

  const choose = (next: Lang) => {
    // Mobile browsers only open the audio pipeline for a gesture, and this is
    // the only one before Round 1 starts making noise on its own timers. Both
    // pipelines have to be opened here: the <audio> element that plays the
    // narration, and the Web Audio context behind the notifications and the
    // focus bed.
    setNarrationLang(next);
    unlockAudio();
    unlockWebAudio();
    buzz(18);
    onChooseLang(next);
    setStarted(true);
  };

  useEffect(() => {
    if (!started) return;
    // Five sentences, spoken with room between them. The last one names the
    // Pulse just as the way in becomes available.
    const lines: [string, number][] = [
      ['enter-1', cue(1200)],
      ['enter-2', cue(4000)],
      ['enter-3', cue(6800)],
      ['enter-4', cue(10000)],
      ['enter-5', cue(13600)],
    ];
    lines.forEach(([id, delay]) => narrate(id, delay));
    // "Pulse One. Signal." is the last thing said and the whole scene turns on
    // it, so the way in does not appear until it has actually been said.
    whenQuiet(() => setSpoken(true));
    return () => hush();
  }, [started]);

  const shown = useBeats(started ? GAPS : []);

  return (
    <Stage>
      {/* One mark, two sizes. It shrinks out of the way rather than being
          replaced, so the thing that lit up is the thing you carry in. */}
      <motion.div
        animate={{ scale: started ? 0.62 : 1, y: started ? -8 : 0 }}
        transition={{ duration: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <NucleusLogo size={280} />
      </motion.div>

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="choose"
            initial={{ opacity: 0 }}
            animate={{ opacity: lit ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="mt-10 flex flex-col gap-3"
          >
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => choose(l.code)}
                disabled={!lit}
                className="mx-auto w-56 rounded-full border border-white/12 py-3.5 text-[12px] tracking-[0.24em] text-gray-400 transition-colors duration-500 hover:border-white/35 hover:text-[#EDE7DA]"
              >
                {l.label}
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="mt-6"
          >
            <div className="space-y-4">
              {/* The whole name, spelled out. The mark alone says NUCLEUS, and
                  that is the name of the WhatsApp group these people are
                  already in — so on its own it reads as a message from the
                  group rather than as something to walk into. */}
              <Beat show={shown >= 1} lift={false}>
                <p className="font-display text-[17px] tracking-[0.3em] text-[#EDE7DA]">
                  {c.brand}
                </p>
              </Beat>
              <Beat show={shown >= 1}>
                <p className="text-[11px] font-semibold tracking-[0.34em] text-gray-500">
                  {c.pulse}
                </p>
              </Beat>
              <Beat show={shown >= 2}>
                <p className="pt-4 text-[17px] italic text-gray-400">{c.question}</p>
              </Beat>
            </div>

            <Continue
              show={shown >= 3 && spoken}
              label={c.cta}
              tone="solid"
              onClick={() => {
                hush();
                onEnter();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
};

export default SceneEnter;
