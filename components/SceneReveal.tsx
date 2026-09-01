import React, { useEffect, useState } from 'react';
import { itemById } from '../data';

interface SceneRevealProps {
  round1: string[];
  round2: string[];
  onContinue: () => void;
}

const RoundList: React.FC<{ title: string; picks: string[]; highlight: boolean }> = ({ title, picks, highlight }) => (
  <div className={`flex-1 rounded-xl border p-4 ${highlight ? 'border-amber-400/50 bg-[#141007]' : 'border-gray-700 bg-[#0d1117]'}`}>
    <p className={`text-[10px] font-extrabold tracking-widest mb-3 ${highlight ? 'text-amber-300' : 'text-gray-500'}`}>{title}</p>
    <div className="space-y-2">
      {picks.length === 0 && <p className="text-gray-500 text-sm italic">— nothing —</p>}
      {picks.map(id => {
        const item = itemById(id);
        return (
          <div key={id} className="flex items-center gap-2 text-sm">
            <span>{item.icon}</span>
            <span className={highlight ? 'text-gray-100' : 'text-gray-300'}>{item.source}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const SceneReveal: React.FC<SceneRevealProps> = ({ round1, round2, onContinue }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),   // Something changed.
      setTimeout(() => setStep(2), 2400),  // But it wasn't the information.
      setTimeout(() => setStep(3), 4600),  // It was the way the information reached you.
      setTimeout(() => setStep(4), 6400),  // rounds comparison
      setTimeout(() => setStep(5), 8600),  // SIGNALFALL
      setTimeout(() => setStep(6), 11000), // the twist
      setTimeout(() => setStep(7), 13000), // button
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 max-w-md mx-auto w-full">
      <p className={`text-2xl text-gray-200 font-semibold transition-opacity duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        Something changed.
      </p>
      <p className={`mt-3 text-xl text-gray-400 transition-opacity duration-1000 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        But it wasn't the information.
      </p>
      <p className={`mt-8 text-2xl text-amber-200 font-semibold transition-opacity duration-1000 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
        It was the way the information <span className="italic">reached</span> you.
      </p>

      <div className={`w-full mt-10 flex gap-3 transition-opacity duration-1000 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
        <RoundList title="ROUND 01" picks={round1} highlight={false} />
        <RoundList title="ROUND 02" picks={round2} highlight={true} />
      </div>

      <div className={`mt-12 transition-opacity duration-1000 ${step >= 5 ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="font-cinzel text-2xl text-amber-200 tracking-[0.25em] mb-4">SIGNALFALL</h3>
        <p className="text-gray-300">Important information doesn't have to disappear.</p>
        <p className="text-gray-300 mt-1">Sometimes it simply gets <span className="text-amber-200 font-semibold">buried</span>.</p>
      </div>

      <div className={`mt-12 transition-opacity duration-1000 ${step >= 6 ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-gray-400 text-sm">Nothing was hidden from you.</p>
        <p className="text-gray-200 mt-1 font-semibold">We only changed what was easier to notice.</p>
      </div>

      <button
        onClick={onContinue}
        className={`mt-12 px-10 py-3 border border-gray-600 text-gray-300 rounded-full tracking-widest text-sm hover:border-amber-300 hover:text-amber-200 transition-all duration-700 ${step >= 7 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        ONE LAST THING
      </button>
    </div>
  );
};

export default SceneReveal;
