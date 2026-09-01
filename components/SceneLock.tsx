import React, { useEffect, useState } from 'react';
import { lockThunk } from '../utils/sound';
import { hush, narrateSequence } from '../utils/narration';
import { COPY, type Lang } from '../i18n';

interface SceneLockProps {
  lang: Lang;
  onContinue: () => void;
}

const SceneLock: React.FC<SceneLockProps> = ({ lang, onContinue }) => {
  const c = COPY[lang].lock;
  const [step, setStep] = useState(0);

  useEffect(() => {
    lockThunk();
    narrateSequence([
      { id: 'lock-1', delay: 400 },
      { id: 'lock-2', delay: 1900 },
      { id: 'lock-3', delay: 4200 },
    ]);
    const timers = [
      setTimeout(() => setStep(1), 1600),
      setTimeout(() => setStep(2), 3400),
      setTimeout(() => setStep(3), 5600),
    ];
    return () => { timers.forEach(clearTimeout); hush(); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
      <h2 className="font-cinzel text-4xl md:text-5xl font-bold text-red-400 tracking-[0.2em] animate-fadeIn">
        {c.locked}
      </h2>

      <p className={`mt-14 text-xl text-gray-300 transition-opacity duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        {c.chose}
      </p>
      <p className={`mt-4 text-2xl font-semibold text-amber-200 transition-opacity duration-1000 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        {c.butWhat}
      </p>

      <button
        onClick={onContinue}
        className={`mt-16 px-10 py-3 border border-gray-600 text-gray-300 rounded-full tracking-widest text-sm hover:border-amber-300 hover:text-amber-200 transition-all duration-700 ${step >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {c.cta}
      </button>
    </div>
  );
};

export default SceneLock;
