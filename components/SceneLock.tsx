import React, { useEffect, useState } from 'react';
import { lockThunk } from '../utils/sound';
import { speakSequence, silence } from '../utils/voice';

interface SceneLockProps {
  onContinue: () => void;
}

const SceneLock: React.FC<SceneLockProps> = ({ onContinue }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    lockThunk();
    speakSequence([
      { text: 'Locked.', delay: 400 },
      { text: 'You chose what to look at.', delay: 2000 },
      { text: 'But what chose you?', delay: 4000 },
    ]);
    const timers = [
      setTimeout(() => setStep(1), 1600),
      setTimeout(() => setStep(2), 3400),
      setTimeout(() => setStep(3), 5600),
    ];
    return () => { timers.forEach(clearTimeout); silence(); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
      <h2 className="font-cinzel text-4xl md:text-5xl font-bold text-red-400 tracking-[0.2em] animate-fadeIn">
        LOCKED.
      </h2>

      <p className={`mt-14 text-xl text-gray-300 transition-opacity duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        You chose what to look at.
      </p>
      <p className={`mt-4 text-2xl font-semibold text-amber-200 transition-opacity duration-1000 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        But what chose <span className="italic">you</span>?
      </p>

      <button
        onClick={onContinue}
        className={`mt-16 px-10 py-3 border border-gray-600 text-gray-300 rounded-full tracking-widest text-sm hover:border-amber-300 hover:text-amber-200 transition-all duration-700 ${step >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        LOOK BENEATH
      </button>
    </div>
  );
};

export default SceneLock;
