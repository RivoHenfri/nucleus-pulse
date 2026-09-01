import React, { useState } from 'react';
import { FEED_ITEMS, itemById } from '../data';
import { tap, shimmer } from '../utils/sound';

interface ScenePeelProps {
  picks: string[];
  onContinue: () => void;
}

const ScenePeel: React.FC<ScenePeelProps> = ({ picks, onContinue }) => {
  const [peeled, setPeeled] = useState<string[]>([]);
  const chosen = picks.map(itemById);
  const buried = FEED_ITEMS.filter(i => i.signal && !picks.includes(i.id));
  const allPeeled = chosen.length === 0 || peeled.length >= chosen.length;

  const peel = (id: string) => {
    if (peeled.includes(id)) return;
    shimmer();
    setPeeled(prev => [...prev, id]);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 pt-10 pb-10 max-w-md mx-auto w-full animate-fadeIn">
      <h2 className="font-cinzel text-2xl text-amber-200 text-center mb-2">PEEL THE NOISE</h2>
      <p className="text-center text-gray-500 text-sm mb-8">Tap what you chose. Look underneath.</p>

      <div className="space-y-4">
        {chosen.length === 0 && (
          <p className="text-center text-gray-400 italic py-6">
            You chose nothing. The noise won by default.
          </p>
        )}
        {chosen.map(item => {
          const isPeeled = peeled.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => peel(item.id)}
              className={`w-full text-left rounded-xl border px-4 py-4 transition-all duration-500 active:scale-[0.98] ${
                isPeeled
                  ? item.signal
                    ? 'border-amber-400/50 bg-[#141007]'
                    : 'border-gray-700 bg-[#0d1117]'
                  : 'border-gray-600 bg-[#12161d] hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <span className="text-[10px] font-extrabold tracking-widest text-gray-500">{item.source}</span>
                  <p className="text-gray-100 font-semibold text-sm">{item.headline}</p>
                </div>
                {!isPeeled && <span className="text-gray-500 text-xs tracking-widest">TAP</span>}
              </div>
              {isPeeled && (
                <div className="mt-3 pt-3 border-t border-gray-700/60 space-y-1 animate-fadeInUp">
                  {item.reveal.map(line => (
                    <p key={line} className="text-sm text-gray-300">{line}</p>
                  ))}
                  {item.consequence && (
                    <p className="text-sm text-amber-300 font-semibold mt-2">{item.consequence}</p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {allPeeled && buried.length > 0 && (
        <div className="mt-10 animate-fadeIn">
          <p className="text-center text-gray-500 text-xs tracking-widest mb-4">MEANWHILE, BURIED IN THE FEED —</p>
          <div className="space-y-3">
            {buried.map(item => (
              <div key={item.id} className="rounded-xl border border-amber-400/30 bg-[#100c06] px-4 py-3 opacity-90">
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-amber-300/80">{item.source}</span>
                    <p className="text-gray-200 text-sm">{item.headline}</p>
                  </div>
                </div>
                <p className="text-sm text-amber-300 mt-2 pl-8">{item.consequence}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6 italic">
            No alarms. No red badges. Just consequences.
          </p>
        </div>
      )}

      <div className={`mt-10 text-center transition-opacity duration-700 ${allPeeled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => { tap(); onContinue(); }}
          className="px-10 py-3 border border-gray-600 text-gray-300 rounded-full tracking-widest text-sm hover:border-amber-300 hover:text-amber-200 transition-all"
        >
          WHY DID THIS HAPPEN?
        </button>
      </div>
    </div>
  );
};

export default ScenePeel;
