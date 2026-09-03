// NUCLEUS — PULSE 01: SIGNAL
//
// One participant, one morning, seventeen screens, three to four minutes.
//
// The arc the scenes are cut to:
//   normal → pressure → choice → curiosity → context → reconsideration →
//   recognition → surprise → reflection
//
// Everything the run remembers lives in this component and, for a refresh, in
// localStorage: two sets of choices and up to two self-reported influences.
// There is no login, no identity, no backend and nothing leaves the device.

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { COPY, type Lang } from './i18n';
import type { InfluenceId, SceneId, SituationId } from './types';
import {
  setAmbienceEnabled,
  startCalmBed,
  stopCalmBed,
  stopFocusBed,
} from './utils/ambience';
import {
  hush,
  onAudioTrouble,
  setNarrationEnabled,
  setNarrationLang,
} from './utils/narration';
import { setVoiceEnabled, silence } from './utils/voice';
import { unlockWebAudio } from './utils/sound';
import { joinRoom, submitToRoom } from './utils/room';

import SceneEnter from './components/SceneEnter';
import SceneRound from './components/SceneRound';
import SceneFreeze from './components/SceneFreeze';
import SceneReflection from './components/SceneReflection';
import SceneTransition from './components/SceneTransition';
import SceneContext from './components/SceneContext';
import SceneAI from './components/SceneAI';
import SceneMirror from './components/SceneMirror';
import SceneSignal from './components/SceneSignal';
import SceneNoise from './components/SceneNoise';
import SceneLens from './components/SceneLens';
import SceneSystem from './components/SceneSystem';
import ScenePhenomena from './components/ScenePhenomena';
import ScenePulseback from './components/ScenePulseback';
import SceneFinal from './components/SceneFinal';
import SceneEnd from './components/SceneEnd';

const STORE_KEY = 'nucleus.pulse01';

interface Saved {
  lang: Lang;
  firstLook: SituationId[];
  influences: InfluenceId[];
  secondLook: SituationId[];
}

const load = (): Partial<Saved> => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

const save = (state: Saved) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // A private window is not a reason to lose the experience.
  }
};

/**
 * Rehearsal only: `?scene=lens` opens straight into a scene with stand-in
 * choices, so a scene can be re-timed without playing four minutes to reach
 * it. Gated on import.meta.env.DEV, which is a compile-time false in a
 * production build, so the parameter does nothing on the deployed app — a
 * participant who found it could otherwise skip the first round entirely and
 * the rest of the experience would mean nothing.
 */
const dev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV ?? false;
const rehearsal = (): { scene?: SceneId; picks?: SituationId[] } => {
  if (!dev) return {};
  const wanted = new URLSearchParams(window.location.search).get('scene');
  if (!wanted) return {};
  return { scene: wanted as SceneId, picks: ['client', 'people'] };
};

const App: React.FC = () => {
  const rehearse = rehearsal();
  const [scene, setScene] = useState<SceneId>(rehearse.scene ?? 'enter');
  const [lang, setLang] = useState<Lang>(() => (load().lang as Lang) ?? 'en');
  const [firstLook, setFirstLook] = useState<SituationId[]>(rehearse.picks ?? []);
  const [influences, setInfluences] = useState<InfluenceId[]>(
    rehearse.scene ? ['experience', 'impact'] : [],
  );
  const [secondLook, setSecondLook] = useState<SituationId[]>(
    rehearse.scene ? ['engineering', 'finance'] : [],
  );
  const [sound, setSound] = useState(true);
  /**
   * Whether the voice is actually reaching the participant.
   *
   * The timing of most of these screens is built around a line being spoken.
   * A run where the audio silently failed is not a quieter version of the
   * experience, it is a broken one — the pauses become dead air and the whole
   * thing goes flat. So the app now notices, and says so, rather than letting
   * someone sit through it wondering why nothing is happening.
   */
  const [trouble, setTrouble] = useState<'blocked' | 'silent' | null>(null);

  useEffect(() => {
    onAudioTrouble(why => setTrouble(current => current ?? why));
  }, []);

  useEffect(() => {
    setNarrationLang(lang);
  }, [lang]);

  // If this phone came in through a room link, the room hears it arrived.
  useEffect(() => {
    joinRoom();
  }, []);

  // Every scene begins at the top of itself.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [scene]);

  /**
   * One room, one sound.
   *
   * The calm bed runs under everything except the two choosing rounds, which
   * bring their own: a bed that narrows the room while someone decides. Held
   * here rather than inside the scenes so it never restarts between them —
   * the point of it is that the quiet is continuous, and a bed that faded out
   * and back in at every cut would announce each screen instead of joining
   * them.
   */
  const inRound = scene === 'morning' || scene === 'second';
  useEffect(() => {
    if (inRound) stopCalmBed();
    else startCalmBed();
  }, [inRound]);

  useEffect(() => {
    save({ lang, firstLook, influences, secondLook });
  }, [lang, firstLook, influences, secondLook]);

  useEffect(
    () => () => {
      hush();
      silence();
      stopFocusBed();
      stopCalmBed();
    },
    [],
  );

  // One switch for the room: the voice and the bed go together.
  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setVoiceEnabled(next);
    setNarrationEnabled(next);
    setAmbienceEnabled(next);
    if (next && !inRound) startCalmBed();
  };

  const restart = () => {
    hush();
    silence();
    stopFocusBed();
    stopCalmBed();
    setFirstLook([]);
    setInfluences([]);
    setSecondLook([]);
    setScene('enter');
  };

  const go = (next: SceneId) => () => {
    hush();
    setScene(next);
  };

  useEffect(() => {
    if (scene !== 'pulseback') return;
    void submitToRoom({ lang, first: firstLook, second: secondLook, influences });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return (
    <main className="min-h-[100dvh] bg-[#06080B] text-gray-200 select-none">
      {/* The one control on screen, and it stays out of the way. Sound is part
          of the experience, so it is never hidden — but it is never loud
          either, and it does not follow the participant into a decision. */}
      <button
        onClick={toggleSound}
        aria-label={
          sound ? COPY[lang].common.soundOn : COPY[lang].common.soundOff
        }
        className="fixed right-3 top-3 z-50 grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-black/30 text-[13px] text-gray-600 backdrop-blur transition-colors hover:text-gray-300"
      >
        {sound ? '🔊' : '🔇'}
      </button>

      {/* Sound failed, and the participant is owed an explanation and a way
          out of it — not a silent run they assume is working. */}
      {trouble && sound && (
        <button
          onClick={() => {
            unlockWebAudio();
            startCalmBed();
            setTrouble(null);
          }}
          className="fixed inset-x-3 top-3 z-40 rounded-xl border border-amber-300/25 bg-[#12171d] px-4 py-3 text-left text-[12px] leading-snug text-amber-100/90 shadow-lg shadow-black/60"
        >
          {trouble === 'blocked'
            ? COPY[lang].common.soundBlocked
            : COPY[lang].common.soundSilent}
        </button>
      )}

      {/* One scene at a time, and the old one is fully gone before the new one
          starts. The gap between them is part of the pacing: an overlap would
          let the pressure of a round bleed into the silence after it. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
        >
          {scene === 'enter' && (
            <SceneEnter
              lang={lang}
              onChooseLang={setLang}
              onEnter={go('morning')}
            />
          )}

          {scene === 'morning' && (
            <SceneRound
              key="round-1"
              lang={lang}
              mode="surface"
              seconds={30}
              onComplete={(picks) => {
                setFirstLook(picks);
                setScene('freeze');
              }}
            />
          )}

          {scene === 'freeze' && (
            <SceneFreeze
              lang={lang}
              picks={firstLook}
              onContinue={go('reflection')}
            />
          )}

          {scene === 'reflection' && (
            <SceneReflection
              lang={lang}
              onContinue={(chosen) => {
                setInfluences(chosen);
                setScene('transition');
              }}
            />
          )}

          {scene === 'transition' && (
            <SceneTransition lang={lang} onDone={go('context')} />
          )}

          {scene === 'context' && (
            <SceneContext lang={lang} onContinue={go('aiContext')} />
          )}

          {scene === 'aiContext' && (
            <SceneAI lang={lang} onContinue={go('second')} />
          )}

          {scene === 'second' && (
            <SceneRound
              key="round-2"
              lang={lang}
              mode="context"
              seconds={15}
              onComplete={(picks) => {
                setSecondLook(picks);
                setScene('mirror');
              }}
            />
          )}

          {scene === 'mirror' && (
            <SceneMirror
              lang={lang}
              first={firstLook}
              second={secondLook}
              onContinue={go('signal')}
            />
          )}

          {scene === 'signal' && (
            <SceneSignal lang={lang} onContinue={go('noise')} />
          )}

          {scene === 'noise' && (
            <SceneNoise lang={lang} onContinue={go('lens')} />
          )}

          {scene === 'lens' && (
            <SceneLens
              lang={lang}
              influences={influences}
              onContinue={go('system')}
            />
          )}

          {scene === 'system' && (
            <SceneSystem lang={lang} onContinue={go('phenomena')} />
          )}

          {scene === 'phenomena' && (
            <ScenePhenomena lang={lang} onContinue={go('pulseback')} />
          )}

          {/* Everything the run will ever know is known by now. If this
              phone is in a room, the room hears about it here — once, in the
              background, and without any effect on what the participant sees. */}
          {scene === 'pulseback' && (
            <ScenePulseback
              lang={lang}
              first={firstLook}
              influences={influences}
              second={secondLook}
              onContinue={go('final')}
            />
          )}

          {scene === 'final' && (
            <SceneFinal lang={lang} onContinue={go('end')} />
          )}

          {scene === 'end' && <SceneEnd
              lang={lang}
              first={firstLook}
              second={secondLook}
              onRestart={restart}
            />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default App;
