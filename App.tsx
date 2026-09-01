import React, { useEffect, useState } from 'react';
import type { SceneId } from './types';
import { setAmbienceEnabled, stopFocusBed } from './utils/ambience';
import { setVoiceEnabled, silence } from './utils/voice';
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [scene]);

  // One switch for the room: kills the voice and the bed together.
  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setVoiceEnabled(next);
    setAmbienceEnabled(next);
  };

  useEffect(() => () => { silence(); stopFocusBed(); }, []);

  const restart = () => {
    silence();
    stopFocusBed();
    setRound1Picks([]);
    setRound2Picks([]);
    setScene('enter');
  };

  return (
    <main className="min-h-screen bg-[#05080a] text-gray-200 select-none">
      {/* The Pulse speaks. Some rooms need it not to. */}
      <button
        onClick={toggleSound}
        aria-label={sound ? 'Mute the Pulse' : 'Unmute the Pulse'}
        className="fixed top-3 right-3 z-50 w-9 h-9 rounded-full bg-black/40 backdrop-blur border border-white/10 text-sm text-gray-400 hover:text-amber-200 hover:border-amber-300/40 transition-colors"
      >
        {sound ? '🔊' : '🔇'}
      </button>
      {scene === 'enter' && (
        <SceneEnter onEnter={() => setScene('pulse1')} />
      )}
      {scene === 'pulse1' && (
        <ScenePulse
          mode="loud"
          seconds={30}
          onComplete={(picks) => { setRound1Picks(picks); setScene('lock'); }}
        />
      )}
      {scene === 'lock' && (
        <SceneLock onContinue={() => setScene('peel')} />
      )}
      {scene === 'peel' && (
        <ScenePeel picks={round1Picks} onContinue={() => setScene('gravity')} />
      )}
      {scene === 'gravity' && (
        <SceneGravity onContinue={() => setScene('pulse2')} />
      )}
      {scene === 'pulse2' && (
        <ScenePulse
          mode="clear"
          seconds={15}
          onComplete={(picks) => { setRound2Picks(picks); setScene('reveal'); }}
        />
      )}
      {scene === 'reveal' && (
        <SceneReveal round1={round1Picks} round2={round2Picks} onContinue={() => setScene('human')} />
      )}
      {scene === 'human' && (
        <SceneHuman onContinue={() => setScene('pulseback')} />
      )}
      {scene === 'pulseback' && (
        <ScenePulseback round1={round1Picks} round2={round2Picks} onRestart={restart} />
      )}
    </main>
  );
};

export default App;
