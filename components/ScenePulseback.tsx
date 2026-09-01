import React, { useMemo, useState } from 'react';
import { itemById, localized } from '../data';
import { COPY, type Lang } from '../i18n';
import { generateSummons, generateToughComment } from '../utils/oracle';
import { pulseConfirm, shimmer, tap } from '../utils/sound';
import { guessLang, speak } from '../utils/voice';
import { hush, narrate, playSpokenReply } from '../utils/narration';
import { TOTAL_SIGNALS, cohortStats, loadRuns, recordRun, splitPicks } from '../utils/stats';

interface ScenePulsebackProps {
  lang: Lang;
  round1: string[];
  round2: string[];
  onRestart: () => void;
}

type Phase = 'input' | 'loading' | 'received' | 'reflect' | 'share' | 'teaser';

const APP_LINK = 'https://rivohenfri.github.io/nucleus-pulse/';

const ScenePulseback: React.FC<ScenePulsebackProps> = ({ lang, round1, round2, onRestart }) => {
  const c = COPY[lang].pulseback;
  const [signal, setSignal] = useState('');
  const [comment, setComment] = useState('');
  const [summons, setSummons] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [copied, setCopied] = useState(false);

  const r1 = useMemo(() => splitPicks(round1), [round1]);
  const r2 = useMemo(() => splitPicks(round2), [round2]);
  // The ledger is written once, when the pulse is sent back.
  const cohort = useMemo(() => (phase === 'input' ? null : cohortStats(loadRuns())), [phase]);

  const submit = async () => {
    if (!signal.trim()) return;
    shimmer();
    hush();
    setPhase('loading');
    narrate('pulseback-reading');
    recordRun(round1, round2);
    const reply = await generateToughComment(signal.trim(), lang);
    setComment(reply.text);
    pulseConfirm();
    setPhase('received');
    // The answer is spoken back in whatever language they wrote in.
    setTimeout(() => {
      if (reply.audio) {
        playSpokenReply(reply.audio, reply.sampleRate, reply.text);
      } else {
        speak(reply.text, { lang: guessLang(reply.text) });
      }
    }, 1200);
    setTimeout(() => setPhase('reflect'), 4200);
  };

  const goShare = async () => {
    tap();
    hush();
    setPhase('share');
    if (!summons) {
      const line = await generateSummons(name.trim() || 'A Pulse Seeker', r1.signals, TOTAL_SIGNALS, lang);
      setSummons(line);
    }
  };

  // The group message is a SUMMONS, not a summary — zero spoilers, one task.
  const shareText = () => {
    const who = name.trim() || (lang === 'id' ? 'Seseorang' : 'Someone');
    const tagged = tags.trim() ? `@${tags.trim().replace(/, ?/g, ' @')}` : '@everyone';
    const dare = summons || (lang === 'id'
      ? 'Jangan balas di grup. Masuk dulu.'
      : 'Do not reply here. Enter first.');

    if (lang === 'id') {
      return (
        `⚡ *NUCLEUS · PULSE 01 — SIGNAL*
` +
        `_Earth Wizard, powered by IT_

` +
        `${who} baru saja masuk. Hasil: *${r1.signals}/${TOTAL_SIGNALS}* sinyal ketemu, ` +
        `*${r1.noise}* pilihan kena noise.

` +
        `${dare}

` +
        `🔻 *${tagged}* — giliran kalian.
` +
        `Aturannya:
` +
        `1. 6 menit, sendirian, suara nyala.
` +
        `2. Jangan spoiler apa pun di grup.
` +
        `3. Balik lapor 1 baris: "SIGNAL _/3 — sinyalku yang kekubur: ___".

` +
        `👉 ${APP_LINK}`
      );
    }
    return (
      `⚡ *NUCLEUS · PULSE 01 — SIGNAL*
` +
      `_Earth Wizard, powered by IT_

` +
      `${who} just walked in. Score: *${r1.signals}/${TOTAL_SIGNALS}* signals, ` +
      `*${r1.noise}* caught by noise.

` +
      `${dare}

` +
      `🔻 *${tagged}* — your turn.
` +
      `The rules:
` +
      `1. 6 minutes, alone, sound on.
` +
      `2. Spoil nothing in this group.
` +
      `3. Report back one line: "SIGNAL _/3 — my buried signal: ___".

` +
      `👉 ${APP_LINK}`
    );
  };

  const handleCopy = () => {
    tap();
    navigator.clipboard.writeText(shareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------- INPUT ----------
  if (phase === 'input') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 max-w-md mx-auto w-full animate-fadeIn">
        <h2 className="font-cinzel text-2xl text-amber-200 tracking-[0.2em] mb-10">{c.title}</h2>
        <p className="text-gray-300 leading-relaxed">{c.think}</p>
        <p className="mt-3 text-xl text-gray-100 font-semibold leading-relaxed">
          {c.question[0]}<span className="text-amber-200">{c.question[1]}</span>{c.question[2]}
        </p>

        <textarea
          value={signal}
          onChange={e => setSignal(e.target.value)}
          rows={3}
          placeholder={c.placeholder}
          className="mt-8 w-full bg-[#0d1117] border border-gray-700 rounded-xl p-4 text-gray-100 placeholder-gray-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition resize-none"
        />

        <button
          onClick={submit}
          disabled={!signal.trim()}
          className="mt-8 px-12 py-4 bg-amber-400 text-gray-900 font-extrabold tracking-widest rounded-full shadow-lg shadow-amber-400/30 hover:bg-amber-300 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none disabled:scale-100"
        >
          {c.send}
        </button>
      </div>
    );
  }

  // ---------- LOADING ----------
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="relative mb-10">
          <div className="absolute inset-0 rounded-full animate-ping-ring bg-amber-400/30"></div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 animate-nucleusPulse"></div>
        </div>
        <p className="font-cinzel text-amber-200 tracking-[0.25em] text-sm animate-badgeBlink">
          {c.reading}
        </p>
      </div>
    );
  }

  const Bar: React.FC<{ label: string; signals: number; noise: number }> = ({ label, signals, noise }) => {
    const total = Math.max(signals + noise, 1);
    return (
      <div>
        <div className="flex justify-between text-[10px] tracking-widest text-gray-500 mb-1.5">
          <span>{label}</span>
          <span className="text-gray-400">
            <span className="text-amber-300">{signals} {c.signalWord}</span> · <span className="text-red-400">{noise} {c.noiseWord}</span>
          </span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-[#0d1117]">
          <div className="bg-amber-400 transition-all duration-1000" style={{ width: `${(signals / total) * 100}%` }} />
          <div className="bg-red-500/70 transition-all duration-1000" style={{ width: `${(noise / total) * 100}%` }} />
        </div>
      </div>
    );
  };

  // ---------- RECEIVED / REFLECT / SHARE / TEASER ----------
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 max-w-md mx-auto w-full">
      <div className="relative mb-10">
        {phase === 'received' && (
          <>
            <div className="absolute inset-0 rounded-full animate-pulseOut bg-amber-400/40"></div>
            <div className="absolute inset-0 rounded-full animate-pulseOut bg-amber-400/30" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute inset-0 rounded-full animate-pulseOut bg-amber-400/20" style={{ animationDelay: '0.8s' }}></div>
          </>
        )}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 animate-nucleusPulse"></div>
      </div>

      {phase !== 'teaser' && (
        <div className="animate-fadeInUp w-full">
          <p className="font-cinzel text-2xl text-amber-200 tracking-[0.2em]">{c.received}</p>
          <p className="mt-3 text-gray-300 text-lg">{c.signalFound}</p>

          <div className="mt-8 rounded-xl border border-amber-400/40 bg-[#141007] p-5 text-left animate-fadeIn">
            <p className="text-[10px] font-extrabold tracking-widest text-amber-300/80 mb-2">{c.answers}</p>
            <p className="text-gray-100 leading-relaxed italic">"{comment}"</p>
          </div>
        </div>
      )}

      {/* ---------- REFLECTION ---------- */}
      {(phase === 'reflect' || phase === 'share') && (
        <div className="w-full mt-10 animate-fadeIn text-left">
          <p className="font-cinzel text-sm text-gray-400 tracking-[0.3em] mb-1 text-center">{c.reflection}</p>
          <p className="text-[11px] text-gray-600 tracking-widest mb-6 text-center">{c.lived}</p>

          <div className="space-y-5 rounded-xl border border-gray-800 bg-[#0a0e13] p-5">
            <Bar label={c.round1Bar} signals={r1.signals} noise={r1.noise} />
            <Bar label={c.round2Bar} signals={r2.signals} noise={r2.noise} />

            <p className="text-sm text-gray-300 leading-relaxed pt-1">
              {r2.signals > r1.signals
                ? c.better(r2.signals - r1.signals)
                : r1.signals === 0
                  ? c.zero
                  : c.steady(r1.signals, r2.signals)}
            </p>

            {r1.missed.length > 0 && (
              <div className="pt-2 border-t border-gray-800">
                <p className="text-[10px] tracking-widest text-red-400/80 mb-2">{c.buriedTitle}</p>
                <ul className="space-y-2">
                  {r1.missed.map(id => {
                    const item = localized(itemById(id), lang);
                    return (
                      <li key={id} className="text-xs text-gray-400 leading-relaxed">
                        <span className="text-gray-200 font-semibold">{item.source}</span> — {item.headline}
                        {item.consequence && <span className="block text-red-400/80 mt-0.5">↳ {item.consequence}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {cohort && cohort.runs > 1 && (
              <div className="pt-3 border-t border-gray-800">
                <p className="text-[10px] tracking-widest text-gray-500 mb-2">{c.cohortRuns(cohort.runs)}</p>
                <p className="text-3xl font-extrabold text-red-400 leading-none">{cohort.noiseSharePct}%</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {c.cohortBody(cohort.noiseSharePct, cohort.zeroSignalPct, cohort.avgR1, cohort.avgR2)}
                </p>
              </div>
            )}
          </div>

          {phase === 'reflect' && (
            <button
              onClick={goShare}
              className="mt-8 w-full px-8 py-4 bg-amber-400 text-gray-900 font-extrabold tracking-widest rounded-full shadow-lg shadow-amber-400/30 hover:bg-amber-300 transition-all active:scale-95"
            >
              {c.summonCta}
            </button>
          )}
        </div>
      )}

      {/* ---------- SHARE / SUMMONS ---------- */}
      {phase === 'share' && (
        <div className="w-full mt-10 animate-fadeIn">
          <p className="text-gray-300 text-sm mb-1 leading-relaxed">{c.shareLead}</p>
          <p className="text-gray-500 text-xs mb-5 leading-relaxed">{c.shareSub}</p>
          <div className="space-y-4 text-left">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={c.namePlaceholder}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-full p-3 px-5 text-gray-100 placeholder-gray-600 focus:border-amber-400 outline-none transition"
            />
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder={c.tagPlaceholder}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-full p-3 px-5 text-gray-100 placeholder-gray-600 focus:border-amber-400 outline-none transition"
            />
          </div>

          <div className="mt-5 rounded-xl border border-gray-800 bg-[#0a0e13] p-4 text-left max-h-52 overflow-y-auto">
            <p className="text-[10px] tracking-widest text-gray-500 mb-2">{c.preview}</p>
            <pre className="text-[11px] text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
              {summons ? shareText() : c.writing}
            </pre>
          </div>

          <div className="flex gap-3 mt-6">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText())}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => tap()}
              className="flex-1 text-center px-4 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg shadow-green-500/30 hover:bg-green-400 transition-all active:scale-95"
            >
              {c.shareWa}
            </a>
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-3 bg-[#1a2230] border border-gray-600 text-gray-200 font-bold rounded-full hover:border-amber-300 transition-all active:scale-95"
            >
              {copied ? c.copied : c.copy}
            </button>
          </div>
          <button
            onClick={() => { tap(); setPhase('teaser'); }}
            className="mt-6 text-gray-500 text-xs tracking-widest hover:text-gray-300 transition-colors"
          >
            {c.skip}
          </button>
        </div>
      )}

      {phase === 'teaser' && (
        <div className="animate-fadeIn flex flex-col items-center">
          <p className="font-cinzel text-2xl text-amber-200 tracking-[0.2em] mb-2">{c.found}</p>
          <div className="mt-14 pt-10 border-t border-gray-800">
            <p className="text-gray-600 text-xs tracking-[0.3em] mb-4">{c.nextPulse}</p>
            <p className="font-cinzel text-3xl text-gray-200 tracking-[0.15em]">
              <span className="text-red-400">◉</span> {c.truth}
            </p>
            <p className="mt-3 text-gray-400 italic">{c.trust}</p>
          </div>
          <button
            onClick={() => { tap(); onRestart(); }}
            className="mt-14 px-8 py-2.5 border border-gray-700 text-gray-500 rounded-full tracking-widest text-xs hover:border-gray-500 hover:text-gray-300 transition-all"
          >
            {c.again}
          </button>
        </div>
      )}
    </div>
  );
};

export default ScenePulseback;
