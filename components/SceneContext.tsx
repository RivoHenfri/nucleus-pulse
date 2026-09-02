// SCENE 06 — CONTEXT REVEAL
//
// The same eight situations, re-set as a flat list: owner, decision or status,
// deadline, consequence. The red badge is gone, so is the unread count, so is
// the order things happened to arrive in.
//
// The cards peel open one after another rather than appearing already open.
// Watching the context arrive is the moment the scene exists for — a static
// wall of detail would be read as a summary and scrolled past.
//
// Nothing here says which one was right. Some things that shouted turn out to
// need nothing; some things that whispered turn out to move a delivery date.
// The participant is allowed to notice that on their own, or not.

import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { SITUATION_IDS } from '../data';
import { COPY, type Lang } from '../i18n';
import { hush, narrate } from '../utils/narration';
import { ping } from '../utils/sound';
import { Continue, Eyebrow, cue } from './atoms';
import { ContextCard } from './SituationCard';

interface Props {
  lang: Lang;
  onContinue: () => void;
}

// All eight, AI last: Scene 07 expands this card, so it has to have been on
// screen here first. Its sources line is withheld until then.
const IDS = [...SITUATION_IDS.filter(id => id !== 'ai'), 'ai' as const];
const FIRST_PEEL = cue(1400);
const PEEL_GAP = cue(900);

const SceneContext: React.FC<Props> = ({ lang, onContinue }) => {
  const c = COPY[lang].context;
  const [opened, setOpened] = useState(0);

  useEffect(() => {
    narrate('context', cue(900));
    const timers = IDS.map((_, i) =>
      setTimeout(() => {
        setOpened(i + 1);
        // A soft, single tone per card: the same blip the ordinary situations
        // used in Round 1, so the room is recognisably the same room.
        ping();
      }, FIRST_PEEL + i * PEEL_GAP),
    );
    return () => {
      timers.forEach(clearTimeout);
      hush();
    };
  }, []);

  const allOpen = opened >= IDS.length;

  return (
    <div className="min-h-[100dvh] px-4 pt-14 pb-16">
      <div className="mx-auto w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4 }}
          className="text-center"
        >
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <p className="mt-4 text-[16px] leading-relaxed text-gray-300">{c.title}</p>
        </motion.div>

        <div className="mt-10 space-y-3">
          {IDS.map((id, i) => (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 + i * 0.12 }}
            >
              {/* Read-only here: Scene 06 is for looking, not choosing. The
                  same card becomes selectable again in Scene 08. */}
              <ContextCard
                id={id}
                lang={lang}
                selected={false}
                open={i < opened}
                hideNote={id === 'ai'}
              />
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Continue show={allOpen} label={c.cta} onClick={onContinue} />
        </div>
      </div>
    </div>
  );
};

export default SceneContext;
