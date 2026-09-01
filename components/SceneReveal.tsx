import React, { useEffect, useState } from 'react';
import { itemById, localized } from '../data';
import { COPY, type Lang } from '../i18n';
import { hush, narrateSequence } from '../utils/narration';

interface SceneRevealProps {
  lang: Lang;
  round1: string[];
  round2: string[];
  onContinue: () => void;
}

const RoundList: React.FC<{ title: string; picks: string[]; highlight: boolean; lang: Lang; empty: string }> = ({ title, picks, highlight, lang, empty }) => (
  <div className={`flex-1 rounded-xl border p-4 ${highlight ? 'border-amber-400/50 bg-[#141007]' : 'border-gray-700 bg-[#0d1117]'}`}>
    <p className={`text-[10px] font-extrabold tracking-widest mb-3 ${highlight ? 'text-amber-300' : 'text-gray-500'}`}>{title}</p>
    <div className="space-y-2">
      {picks.length === 0 && <p className="text-gray-500 text-sm italic">{empty}</p>}
      {picks.map(id => {
        const item = localized(itemById(id), lang);
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

const SceneReveal: React.FC<SceneRevealProps> = ({ lang, round1, round2, onContinue }) => {
  const c = COPY[lang].reveal;
  const [step, setStep] = useState(0);

  useEffect(() => {
    narrateSequence([
      { id: 'reveal-1', delay: 900 },
      { id: 'reveal-2', delay: 4600 },
      { id: 'reveal-3', delay: 11200 },
      { id: 'reveal-4', delay: 14200 },
    ]);
    const timers = [
      setTimeout(() => setStep(1), 800),   // Something changed.
      setTimeout(() => setStep(2), 2400),  // But it wasn't the information.
      setTimeout(() => setStep(3), 4600),  // It was the way the information reached you.
      setTimeout(() => setStep(4), 6400),  // rounds comparison
      setTimeout(() => setStep(5), 8600),  // SIGNALFALL
      setTimeout(() => setStep(6), 11000), // the twist
      setTimeout(() => setStep(7), 13000), // button
    ];
    return () => { timers.forEach(clearTimeout); hush(); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 max-w-md mx-auto w-full">
      <p className={`text-2xl text-gray-200 font-semibold transition-opacity duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        {c.changed}
      </p>
      <p className={`mt-3 text-xl text-gray-400 transition-opacity duration-1000 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        {c.notInfo}
      </p>
      <p className={`mt-8 text-2xl text-amber-200 font-semibold transition-opacity duration-1000 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
        {c.theWay[0]}<span className="italic">{c.theWay[1]}</span>{c.theWay[2]}
      </p>

      <div className={`w-full mt-10 flex gap-3 transition-opacity duration-1000 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
        <RoundList title={c.round1} picks={round1} highlight={false} lang={lang} empty={c.nothing} />
        <RoundList title={c.round2} picks={round2} highlight={true} lang={lang} empty={c.nothing} />
      </div>

      <div className={`mt-12 transition-opacity duration-1000 ${step >= 5 ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="font-cinzel text-2xl text-amber-200 tracking-[0.25em] mb-4">{c.signalfall}</h3>
        <p className="text-gray-300">{c.notDisappear}</p>
        <p className="text-gray-300 mt-1">{c.buried[0]}<span className="text-amber-200 font-semibold">{c.buried[1]}</span></p>
      </div>

      <div className={`mt-12 transition-opacity duration-1000 ${step >= 6 ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-gray-400 text-sm">{c.notHidden}</p>
        <p className="text-gray-200 mt-1 font-semibold">{c.onlyChanged}</p>
      </div>

      <button
        onClick={onContinue}
        className={`mt-12 px-10 py-3 border border-gray-600 text-gray-300 rounded-full tracking-widest text-sm hover:border-amber-300 hover:text-amber-200 transition-all duration-700 ${step >= 7 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {c.cta}
      </button>
    </div>
  );
};

export default SceneReveal;
