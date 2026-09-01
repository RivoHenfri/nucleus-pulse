import React, { useEffect, useRef, useState } from 'react';
import { FEED_ITEMS, localized } from '../data';
import { COPY, type Lang } from '../i18n';
import type { FeedItem } from '../types';
import { ping, pingLoud, tap, buzz } from '../utils/sound';
import { setUrgency, startFocusBed, stopFocusBed } from '../utils/ambience';
import { hush, narrate } from '../utils/narration';

export type PulseMode = 'loud' | 'clear';

interface ScenePulseProps {
  lang: Lang;
  mode: PulseMode;
  seconds: number;
  onComplete: (picks: string[]) => void;
}

const MAX_PICKS = 3;
const STAGGER_MS = 620;
/** Wall-clock start of the simulated morning */
const CLOCK_START_MIN = 9 * 60 + 7; // 09:07

const clockLabel = (minsFromMidnight: number): string => {
  const m = ((minsFromMidnight % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${ampm}`;
};

/** Real mail clients age their timestamps while you look at them. */
const stampFor = (item: FeedItem, elapsedSec: number, lang: Lang): string => {
  const c = COPY[lang].pulse;
  const totalSec = item.minsAgo * 60 + elapsedSec;
  if (totalSec < 45) return c.justNow;
  const mins = Math.floor(totalSec / 60);
  if (mins < 60) return c.minAgo(mins);
  return clockLabel(CLOCK_START_MIN - mins);
};

const ScenePulse: React.FC<ScenePulseProps> = ({ lang, mode, seconds, onComplete }) => {
  const c = COPY[lang].pulse;
  const [entered, setEntered] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState<FeedItem | null>(null);
  const [syncing, setSyncing] = useState(true);
  const doneRef = useRef(false);
  const picksRef = useRef<string[]>([]);
  picksRef.current = picks;

  const loud = mode === 'loud';

  const finish = (finalPicks: string[]) => {
    if (doneRef.current) return;
    doneRef.current = true;
    stopFocusBed();
    hush();
    onComplete(finalPicks);
  };

  // The focus bed runs for the whole round and dies with it.
  useEffect(() => {
    startFocusBed();
    narrate(loud ? 'round1' : 'round2', 900);
    return () => {
      stopFocusBed();
      hush();
    };
  }, [loud]);

  // Mail lands one message at a time — banner, sound, buzz, then the row.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    FEED_ITEMS.forEach((item, i) => {
      timers.push(setTimeout(() => {
        setEntered(i + 1);
        if (loud && item.loud) {
          pingLoud();
          buzz([35, 40, 35]);
          setToast(item);
        } else {
          ping();
        }
      }, 500 + i * STAGGER_MS));
    });
    timers.push(setTimeout(() => setSyncing(false), 500 + FEED_ITEMS.length * STAGGER_MS + 400));
    return () => timers.forEach(clearTimeout);
  }, [loud]);

  // One clock for the countdown and for ageing the timestamps.
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(e => e + 1);
      setTimeLeft(t => {
        setUrgency(1 - (t - 1) / seconds);
        if (t <= 1) {
          clearInterval(interval);
          finish(picksRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const togglePick = (id: string) => {
    if (doneRef.current) return;
    tap();
    buzz(15);
    setPicks(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= MAX_PICKS) return prev;
      const next = [...prev, id];
      if (next.length === MAX_PICKS) {
        setTimeout(() => finish(next), 650);
      }
      return next;
    });
  };

  const shown = FEED_ITEMS.slice(0, entered).map(i => localized(i, lang));
  /** Presented loudly this round: the noise in R1, the signals in R2 */
  const isPromoted = (item: FeedItem) => (loud ? item.loud : item.signal);
  const unreadCount = shown.reduce((n, i) => n + (isPromoted(i) ? (i.unread ?? 1) : 0), 0);
  const timerPct = (timeLeft / seconds) * 100;

  const Row: React.FC<{ item: FeedItem }> = ({ item }) => {
    const selected = picks.includes(item.id);
    const promoted = isPromoted(item);

    return (
      <button
        onClick={() => togglePick(item.id)}
        className={`w-full text-left flex gap-3 px-4 ${promoted ? 'py-3.5' : 'py-2.5'} border-b border-white/5 overflow-hidden animate-rowIn transition-colors active:bg-white/5 ${
          selected ? 'bg-amber-400/10' : promoted ? 'bg-transparent' : 'bg-black/20'
        }`}
      >
        {/* Unread rail — the blue bar every mail client uses */}
        <span
          className={`w-[3px] -my-3.5 rounded-full shrink-0 ${
            selected ? 'bg-amber-300' : promoted && loud ? 'bg-sky-500' : promoted ? 'bg-amber-400' : 'bg-transparent'
          }`}
        />

        {/* Avatar — flips to a check when picked, exactly like Outlook */}
        <span
          className={`shrink-0 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${
            promoted ? 'w-10 h-10 text-xs' : 'w-7 h-7 text-[10px]'
          } ${selected ? 'bg-amber-300 text-gray-900' : `${item.avatarColor} text-white ${promoted ? '' : 'opacity-50'}`}`}
        >
          {selected ? '✓' : item.initials}
        </span>

        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-1.5">
            <span
              className={`truncate ${
                promoted ? 'text-[13px] text-gray-100 font-bold' : 'text-[11px] text-gray-500 font-normal'
              }`}
            >
              {item.sender}
            </span>
            {loud && item.important && <span className="text-red-500 font-black text-xs shrink-0">!</span>}
            {loud && !!item.unread && (
              <span className="shrink-0 text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-px animate-badgeBlink">
                {item.unread}
              </span>
            )}
            {!loud && item.signal && (
              <span className="shrink-0 text-[9px] font-bold bg-amber-400 text-gray-900 rounded px-1.5 py-px tracking-wide">
                {c.decisionChip}
              </span>
            )}
            <span className={`ml-auto shrink-0 text-[10px] ${promoted ? 'text-gray-400' : 'text-gray-600'}`}>
              {stampFor(item, elapsed, lang)}
            </span>
          </span>

          <span
            className={`block truncate ${
              promoted ? 'text-[13px] text-gray-100 font-semibold' : 'text-[11px] text-gray-500'
            }`}
          >
            {item.headline}
          </span>

          {/* Preview line — real clients only give it room when it "matters" */}
          {promoted && (
            <span className="flex items-center gap-1.5 mt-0.5">
              {item.attachment && <span className="text-gray-500 text-[10px] shrink-0">📎</span>}
              <span className="text-[11px] text-gray-500 truncate">{item.preview}</span>
            </span>
          )}

          {/* Someone is typing in the group, right now */}
          {loud && item.kind === 'chat' && (
            <span className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-typing1" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-typing2" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-typing3" />
              <span className="text-[10px] text-gray-500 ml-1">{c.typing}</span>
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto w-full bg-[#070b10] relative">
      {/* ---- Phone status bar ---- */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px] text-gray-400 font-semibold">
        <span>{clockLabel(CLOCK_START_MIN + Math.floor(elapsed / 60))}</span>
        <span className="flex items-center gap-1.5 text-gray-500">
          <span>▮▮▮▯</span>
          <span>WiFi</span>
          <span className="border border-gray-600 rounded-[3px] px-1 text-[9px]">78</span>
        </span>
      </div>

      {/* ---- Arrival banner ---- */}
      {toast && (
        <div
          key={toast.id}
          className="absolute top-8 left-3 right-3 z-30 animate-toastIn"
          onAnimationEnd={() => setToast(null)}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-[#161b22]/95 backdrop-blur border border-white/10 shadow-2xl shadow-black/60 px-4 py-3">
            <span className={`w-9 h-9 rounded-full ${toast.avatarColor} text-white flex items-center justify-center text-[11px] font-bold shrink-0`}>
              {toast.initials}
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  {toast.kind === 'chat' ? c.message : toast.kind === 'calendar' ? c.reminder : c.mail}
                </span>
                {toast.important && <span className="text-red-500 font-black text-[11px]">!</span>}
                <span className="ml-auto text-[10px] text-gray-500">{c.now}</span>
              </span>
              <span className="block text-[12px] text-gray-100 font-semibold truncate">{toast.headline}</span>
              <span className="block text-[11px] text-gray-500 truncate">{toast.preview}</span>
            </span>
          </div>
        </div>
      )}

      {/* ---- Mail app header ---- */}
      <div className="px-4 pt-2 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-lg leading-none">☰</span>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-gray-100 leading-tight flex items-center gap-2">
              {c.inbox}
              {loud && unreadCount > 0 && (
                <span key={unreadCount} className="text-[11px] font-bold text-red-400 animate-countPop">
                  {unreadCount}
                </span>
              )}
              {syncing && (
                <span className="inline-block w-3 h-3 border-2 border-gray-600 border-t-sky-400 rounded-full animate-syncSpin" />
              )}
            </p>
            <p className="text-[10px] text-gray-600 truncate">
              {syncing ? c.updating : c.updated} · you@company.co.id
            </p>
          </div>
          <span className="w-8 h-8 rounded-full bg-slate-700 text-gray-200 text-[11px] font-bold flex items-center justify-center">
            ME
          </span>
        </div>

        {/* Search field */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-gray-600 text-[12px]">
          <span>🔍</span>
          <span>{c.search}</span>
        </div>

        {/* Focused / Other pivot */}
        <div className="mt-3 flex gap-6 text-[12px]">
          <span className="pb-1.5 border-b-2 border-sky-400 text-gray-100 font-semibold">
            {loud ? c.focused : c.allMail}
          </span>
          <span className="pb-1.5 text-gray-600">{loud ? c.other : c.archive}</span>
          {!loud && (
            <span className="ml-auto text-[10px] text-gray-600 self-center">{c.sortedBy}</span>
          )}
        </div>
      </div>

      {/* ---- The list ---- */}
      <div className="flex-1 overflow-hidden">
        {shown.map(item => (
          <Row key={item.id} item={item} />
        ))}
        {entered < FEED_ITEMS.length && (
          <div className="px-4 py-3 flex items-center gap-3 opacity-40">
            <span className="w-10 h-10 rounded-full bg-white/5" />
            <span className="flex-1">
              <span className="block h-2.5 w-1/3 bg-white/5 rounded mb-1.5" />
              <span className="block h-2.5 w-2/3 bg-white/5 rounded" />
            </span>
          </div>
        )}
      </div>

      {/* ---- Task bar: the only thing that is not a mail client ---- */}
      <div className="sticky bottom-0 bg-[#070b10]/95 backdrop-blur border-t border-white/10 px-4 pt-3 pb-5">
        <div className="h-1 w-full bg-gray-800 rounded-full mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              timeLeft <= 10 ? 'bg-red-500' : 'bg-amber-400'
            }`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-gray-300 leading-snug">
            {c.instruction[0]}<span className="text-amber-300 font-bold">{c.instruction[1]}</span>{c.instruction[2]}
          </p>
          <span className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-gray-500">{c.selected(picks.length, MAX_PICKS)}</span>
            <span
              className={`font-mono text-base font-bold ${
                timeLeft <= 10 ? 'text-red-400 animate-badgeBlink' : 'text-gray-300'
              }`}
            >
              00:{String(timeLeft).padStart(2, '0')}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScenePulse;
