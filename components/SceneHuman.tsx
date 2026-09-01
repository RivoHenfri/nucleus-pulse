import React, { useEffect, useState } from 'react';
import { hush, narrateSequence } from '../utils/narration';
import { COPY, type Lang } from '../i18n';

interface SceneHumanProps {
  lang: Lang;
  onContinue: () => void;
}

const SOURCES = ['WhatsApp', 'Email', 'Meetings', 'Dashboards', 'Reports', 'People', 'AI'];
const PAUSE_SECONDS = 5;

const SceneHuman: React.FC<SceneHumanProps> = ({ lang, onContinue }) => {
  const c = COPY[lang].human;
  const [step, setStep] = useState(0);
  const [pauseLeft, setPauseLeft] = useState(PAUSE_SECONDS);

  useEffect(() => {
    // Nothing is spoken over the five seconds of silence. That is the point.
    narrateSequence([
      { id: 'human-1', delay: 4200 },
      { id: 'human-2', delay: 9600 },
    ]);
    const timers = [
      setTimeout(() => setStep(1), 600),   // sources appear
      setTimeout(() => setStep(2), 2200),  // converge to YOU
      setTimeout(() => setStep(3), 4000),  // line 1
      setTimeout(() => setStep(4), 6000),  // line 2
      setTimeout(() => setStep(5), 8000),  // the question + pause starts
    ];
    return () => { timers.forEach(clearTimeout); hush(); };
  }, []);

  // 5 seconds of deliberate silence after the question
  useEffect(() => {
    if (step < 5) return;
    const interval = setInterval(() => {
      setPauseLeft(p => {
        if (p <= 1) {
          clearInterval(interval);
          setStep(6);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      {/* Converging sources */}
      <div className="relative w-72 h-56 mb-10">
        {SOURCES.map((label, i) => {
          const angle = (i / SOURCES.length) * 2 * Math.PI - Math.PI / 2;
          const r = 100;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r * 0.7;
          const converged = step >= 2;
          return (
            <span
              key={label}
              className="absolute text-xs text-gray-400 tracking-wide whitespace-nowrap transition-all duration-[1800ms] ease-in-out"
              style={{
                top: '50%',
                left: '50%',
                transform: converged
                  ? 'translate(-50%, -50%) scale(0.2)'
                  : `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`,
                opacity: step >= 1 ? (converged ? 0 : 1) : 0,
              }}
            >
              {label}
            </span>
          );
        })}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center font-cinzel font-bold text-gray-900 text-sm transition-all duration-1000 animate-nucleusPulse ${step >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        >
          {c.you}
        </div>
      </div>

      <p className={`max-w-md text-gray-300 leading-relaxed transition-opacity duration-1000 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
        {c.compete}
      </p>
      <p className={`mt-3 max-w-md text-gray-300 leading-relaxed transition-opacity duration-1000 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
        {c.notEqual}
      </p>

      <p className={`mt-10 max-w-md text-xl text-amber-200 font-semibold leading-relaxed transition-opacity duration-1000 ${step >= 5 ? 'opacity-100' : 'opacity-0'}`}>
        {c.question[0]}<span className="italic">{c.question[1]}</span>{c.question[2]}
      </p>

      {step === 5 && (
        <div className="mt-8 flex gap-1.5">
          {Array.from({ length: PAUSE_SECONDS }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${i < PAUSE_SECONDS - pauseLeft ? 'bg-amber-400' : 'bg-gray-700'}`}
            ></span>
          ))}
        </div>
      )}

      <button
        onClick={onContinue}
        className={`mt-10 px-10 py-3 border border-gray-600 text-gray-300 rounded-full tracking-widest text-sm hover:border-amber-300 hover:text-amber-200 transition-all duration-700 ${step >= 6 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {c.cta}
      </button>
    </div>
  );
};

export default SceneHuman;
