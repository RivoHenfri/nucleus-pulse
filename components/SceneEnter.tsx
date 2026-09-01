import React, { useEffect, useState } from 'react';
import { pingLoud, shimmer } from '../utils/sound';
import { speak, speakSequence, silence } from '../utils/voice';

interface SceneEnterProps {
  onEnter: () => void;
}

const LINES = ['09:07 AM', 'Your day has started.', 'Things are already moving.', 'You have limited attention.'];

const SceneEnter: React.FC<SceneEnterProps> = ({ onEnter }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 1400 + i * 1600));
    });
    timers.push(setTimeout(() => {
      setShowButton(true);
      shimmer();
    }, 1400 + LINES.length * 1600 + 600));
    return () => { timers.forEach(clearTimeout); silence(); };
  }, []);

  // The Pulse introduces itself over the materializing nucleus.
  useEffect(() => {
    speakSequence([
      { text: 'Nine oh seven. Your day has already started without you.', delay: 1600 },
      { text: 'Things are moving.', delay: 4600 },
      { text: 'And you have only so much attention to give.', delay: 6400 },
    ]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      {/* Nucleus slowly materializing */}
      <div className="relative mb-14 animate-fadeIn" style={{ animationDuration: '3s' }}>
        <div className="absolute inset-0 rounded-full animate-ping-ring bg-amber-400/30"></div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 animate-nucleusPulse"></div>
      </div>

      <div className="space-y-4 min-h-44">
        {LINES.map((line, i) => (
          <p
            key={line}
            className={`transition-opacity duration-1000 ${i === 0 ? 'font-cinzel text-amber-200 tracking-[0.3em] text-sm' : 'text-gray-300 text-lg'} ${i < visibleLines ? 'opacity-100' : 'opacity-0'}`}
          >
            {line}
          </p>
        ))}
      </div>

      <div className={`mt-10 transition-all duration-1000 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-gray-500 text-sm mb-6 tracking-widest">Ready?</p>
        <button
          onClick={() => { silence(); pingLoud(); onEnter(); }}
          className="px-12 py-4 bg-amber-400 text-gray-900 font-extrabold tracking-widest rounded-full shadow-lg shadow-amber-400/30 hover:bg-amber-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          ENTER THE SIGNAL
        </button>
      </div>
    </div>
  );
};

export default SceneEnter;
