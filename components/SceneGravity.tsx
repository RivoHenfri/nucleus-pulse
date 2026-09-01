import React, { useEffect, useState } from 'react';
import { drone } from '../utils/sound';

interface SceneGravityProps {
  onContinue: () => void;
}

const ORBITERS = ['💬', '📅', '👤', '📊', '📧'];

const SceneGravity: React.FC<SceneGravityProps> = ({ onContinue }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    drone();
    const timers = [
      setTimeout(() => setStep(1), 1200),  // big red notification
      setTimeout(() => setStep(2), 2600),  // title
      setTimeout(() => setStep(3), 3400),  // gravity pull
      setTimeout(() => setStep(4), 5600),  // line 1
      setTimeout(() => setStep(5), 7600),  // line 2
      setTimeout(() => setStep(6), 9400),  // YOUR ATTENTION
      setTimeout(() => setStep(7), 11000), // button
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Gravity field */}
      <div className="relative w-72 h-72 mb-8">
        {/* Orbiting cards pulled toward center */}
        {step >= 1 && ORBITERS.map((icon, i) => {
          const angle = (i / ORBITERS.length) * 2 * Math.PI - Math.PI / 2;
          const r = 118;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          const pulled = step >= 3;
          return (
            <div
              key={icon}
              className="absolute w-12 h-12 rounded-xl bg-[#12161d] border border-gray-700 flex items-center justify-center text-lg"
              style={{
                top: '50%',
                left: '50%',
                transform: pulled
                  ? `translate(-50%, -50%) translate(0px, 0px) scale(0.15)`
                  : `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`,
                opacity: pulled ? 0 : 1,
                transition: 'transform 2.2s cubic-bezier(0.5, 0, 0.9, 0.4), opacity 2.2s ease-in',
              }}
            >
              {icon}
            </div>
          );
        })}

        {/* The big loud notification */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-2xl bg-red-500/90 flex items-center justify-center text-4xl shadow-2xl shadow-red-500/50 transition-all duration-1000 ${step >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        >
          🔔
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-red-600 text-xs font-black rounded-full flex items-center justify-center animate-badgeBlink">!</span>
        </div>
      </div>

      <h2 className={`font-cinzel text-3xl md:text-4xl font-bold text-red-400 tracking-[0.15em] transition-opacity duration-1000 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        NOISE GRAVITY
      </h2>

      <p className={`mt-8 max-w-md text-gray-300 leading-relaxed transition-opacity duration-1000 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
        Some information pulls attention because it is <span className="text-red-300 font-semibold">loud</span>, not because it is <span className="text-amber-200 font-semibold">important</span>.
      </p>
      <p className={`mt-6 text-gray-400 transition-opacity duration-1000 ${step >= 5 ? 'opacity-100' : 'opacity-0'}`}>
        Urgency. Volume. Position. People.
      </p>
      <p className={`mt-2 text-gray-400 transition-opacity duration-1000 ${step >= 5 ? 'opacity-100' : 'opacity-0'}`}>
        They all compete for the same thing:
      </p>
      <p className={`mt-4 font-cinzel text-2xl text-amber-200 tracking-[0.2em] transition-opacity duration-1000 animate-slowGlow ${step >= 6 ? 'opacity-100' : 'opacity-0'}`}>
        YOUR ATTENTION.
      </p>

      <button
        onClick={onContinue}
        className={`mt-12 px-10 py-3 border border-gray-600 text-gray-300 rounded-full tracking-widest text-sm hover:border-amber-300 hover:text-amber-200 transition-all duration-700 ${step >= 7 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        AGAIN?
      </button>
    </div>
  );
};

export default SceneGravity;
