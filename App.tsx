import React, { useEffect, useState } from 'react';
import type { SceneId } from './types';
import { LANGUAGES, type Lang } from './i18n';
import { setAmbienceEnabled, stopFocusBed } from './utils/ambience';
import { setVoiceEnabled, silence } from './utils/voice';
import { hush, setNarrationEnabled, setNarrationLang } from './utils/narration';
import SceneEnter from './components/SceneEnter';
import ScenePulse from './components/ScenePulse';
import SceneLock from './components/SceneLock';
import ScenePeel from './components/ScenePeel';
import SceneGravity from './components/SceneGravity';
import SceneReveal from './components/SceneReveal';
import SceneHuman from './components/SceneHuman';
import ScenePulseback from './components/ScenePulseback';

const App: React.FC = () => {
  const [scene, setScene] = useState<SceneId>('enter');
  const [round1Picks, setRound1Picks] = useState<string[]>([]);
  const [round2Picks, setRound2Picks] = useState<string[]>([]);
  const [sound, setSound] = useState(true);
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [scene]);

  // One switch for the room: kills the voice and the bed together.
  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setVoiceEnabled(next);
    setNarrationEnabled(next);
    setAmbienceEnabled(next);
  };

  // The language is chosen before anything is spoken, and holds to the end.
  const chooseLang = (next: Lang) => {
    hush();
    setLang(next);
    setNarrationLang(next);
  };

  useEffect(() => () => { hush(); silence(); stopFocusBed(); }, []);

  const restart = () => {
    hush();
    silence();
    stopFocusBed();
    setRound1Picks([]);
    setRound2Picks([]);
    setScene('enter');
  };

  return (
    <main className="min-h-screen bg-[#05080a] text-gray-200 select-none">
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        {/* Language is only switchable before the experience starts — mid-run it
            would swap the voice under someone who is already inside it. */}
        {scene === 'enter' && (
          <div className="flex rounded-full bg-black/40 backdrop-blur border border-white/10 overflow-hidden">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => chooseLang(l.code)}
                aria-label={l.label}
                className={`px-3 py-1.5 text-[11px] font-bold tracking-widest transition-colors ${
                  lang === l.code ? 'bg-amber-400 text-gray-900' : 'text-gray-400 hover:text-amber-200'
                }`}
              >
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* The Pulse speaks. Some rooms need it not to. */}
        <button
          onClick={toggleSound}
          aria-label={sound ? 'Mute the Pulse' : 'Unmute the Pulse'}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur border border-white/10 text-sm text-gray-400 hover:text-amber-200 hover:border-amber-300/40 transition-colors"
        >
          {sound ? '🔊' : '🔇'}
        </button>
      </div>

      {scene === 'enter' && (
        <SceneEnter lang={lang} onEnter={() => setScene('pulse1')} />
      )}
      {scene === 'pulse1' && (
        <ScenePulse
          lang={lang}
          mode="loud"
          seconds={30}
          onComplete={(picks) => { setRound1Picks(picks); setScene('lock'); }}
        />
      )}
      {scene === 'lock' && (
        <SceneLock lang={lang} onContinue={() => setScene('peel')} />
      )}
      {scene === 'peel' && (
        <ScenePeel lang={lang} picks={round1Picks} onContinue={() => setScene('gravity')} />
      )}
      {scene === 'gravity' && (
        <SceneGravity lang={lang} onContinue={() => setScene('pulse2')} />
      )}
      {scene === 'pulse2' && (
        <ScenePulse
          lang={lang}
          mode="clear"
          seconds={15}
          onComplete={(picks) => { setRound2Picks(picks); setScene('reveal'); }}
        />
      )}
      {scene === 'reveal' && (
        <SceneReveal lang={lang} round1={round1Picks} round2={round2Picks} onContinue={() => setScene('human')} />
      )}
      {scene === 'human' && (
        <SceneHuman lang={lang} onContinue={() => setScene('pulseback')} />
      )}
      {scene === 'pulseback' && (
        <ScenePulseback lang={lang} round1={round1Picks} round2={round2Picks} onRestart={restart} />
      )}
    </main>
  );
};

export default App;
