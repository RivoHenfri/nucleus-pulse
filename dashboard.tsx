// THE ROOM — the facilitator's screen.
//
// Forty phones each finish a private run. This is the moment the room finds
// out it was not one run: the same eight situations, the same thirty seconds,
// and the attention went everywhere. Shown in stages, on a big screen, by
// someone who decides when the next stage appears.
//
// Everything here is an aggregate. There is no view of a person, because the
// API has no endpoint that returns one — the spec's "never expose individual
// choices" is a property of the data, not a promise of the UI.
//
//   ?room=RRX7&key=…&lang=id     the screen for a room you opened
//   (nothing)                    opens a new room and shows its code

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { INFLUENCES, SITUATION_IDS } from './data';
import { COPY, SHORT_NAME, type Lang } from './i18n';
import type { InfluenceId, SituationId } from './types';
import { fetchSummary, openRoom, type RoomSummary } from './utils/room';

// Validated for the dark surface (OKLCH L 0.48–0.67, CVD ΔE 26.8): orange for
// the first look — the pull — and blue for the look with context.
const FIRST = '#d95926';
const SECOND = '#3987e5';

const T = {
  en: {
    waiting: 'Scan, or open',
    joined: (n: number) => `${n} in the room`,
    stage: ['', 'FIRST LOOK', 'WITH MORE CONTEXT', 'WHERE ATTENTION MOVED', 'WHAT MATTERED', ''],
    first: 'First look',
    second: 'With more context',
    both: 'Both changed',
    one: 'One changed',
    none: 'Neither changed',
    close: "We don't all notice the same things.",
    closeB: 'That is not the problem.',
    next: 'next  →',
    open: 'Open a room',
    opening: 'Opening…',
    unreachable: 'The room server cannot be reached.',
    unreachableWhy: 'nucleus-api.rivohenfri.cloud is not answering — usually the VPS ports 80/443 are still closed in the Tencent Cloud security group.',
    people: 'people',
  },
  id: {
    waiting: 'Scan, atau buka',
    joined: (n: number) => `${n} orang di ruangan`,
    stage: ['', 'PILIHAN PERTAMA', 'SETELAH ADA KONTEKS', 'KE MANA PERHATIAN PINDAH', 'YANG DIPERTIMBANGKAN', ''],
    first: 'Pilihan pertama',
    second: 'Setelah ada konteks',
    both: 'Dua-duanya berubah',
    one: 'Satu berubah',
    none: 'Tidak ada yang berubah',
    close: 'Kita memang tidak selalu memperhatikan hal yang sama.',
    closeB: 'Dan itu bukan masalahnya.',
    next: 'lanjut  →',
    open: 'Buka ruang',
    opening: 'Membuka…',
    unreachable: 'Server ruangan tidak bisa dihubungi.',
    unreachableWhy: 'nucleus-api.rivohenfri.cloud tidak menjawab — biasanya port 80/443 VPS masih tertutup di Security Group Tencent Cloud.',
    people: 'orang',
  },
};

const APP_URL = `${window.location.origin}${window.location.pathname.replace(/dashboard\.html$/, '')}`;

// ---------------------------------------------------------------------------
// marks
// ---------------------------------------------------------------------------

/** One thin horizontal bar with a direct label. Text wears text tokens. */
const Bar: React.FC<{ label: string; value: number; max: number; color: string; dim?: boolean }> = ({
  label,
  value,
  max,
  color,
  dim,
}) => (
  <div className="group flex items-center gap-4" title={`${label}: ${value}`}>
    <span className={`w-28 shrink-0 text-right text-[13px] ${dim ? 'text-gray-600' : 'text-gray-300'}`}>
      {label}
    </span>
    <div className="relative h-3 flex-1 rounded-[4px] bg-white/[0.04]">
      <motion.div
        className="absolute left-0 top-0 h-3 rounded-[4px] group-hover:brightness-125"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${max ? (value / max) * 100 : 0}%` }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      />
    </div>
    <span className="w-8 text-[13px] tabular-nums text-gray-400">{value || ''}</span>
  </div>
);

/** Two series on one axis, one row per situation, ordered by the first look. */
const Compare: React.FC<{ s: RoomSummary; lang: Lang; showSecond: boolean }> = ({ s, lang, showSecond }) => {
  const t = T[lang];
  const order = useMemo(
    () => [...SITUATION_IDS].sort((a, b) => (s.first[b] ?? 0) - (s.first[a] ?? 0)),
    [s.first],
  );
  const max = Math.max(1, ...SITUATION_IDS.map(id => Math.max(s.first[id] ?? 0, s.second[id] ?? 0)));
  return (
    <div className="space-y-3">
      {order.map(id => (
        <div key={id} className="space-y-1">
          <Bar label={SHORT_NAME[id]} value={s.first[id] ?? 0} max={max} color={FIRST} dim={showSecond} />
          {showSecond && <Bar label="" value={s.second[id] ?? 0} max={max} color={SECOND} />}
        </div>
      ))}
      <div className="flex gap-6 pl-32 pt-2 text-[11px] text-gray-500">
        <span className="flex items-center gap-2">
          <i className="inline-block h-2 w-4 rounded-[2px]" style={{ background: FIRST }} /> {t.first}
        </span>
        {showSecond && (
          <span className="flex items-center gap-2">
            <i className="inline-block h-2 w-4 rounded-[2px]" style={{ background: SECOND }} /> {t.second}
          </span>
        )}
      </div>
    </div>
  );
};

/** The strongest movements, first look → with context, as counted pairs. */
const Flows: React.FC<{ s: RoomSummary }> = ({ s }) => {
  const top = Object.entries(s.flows)
    .filter(([k]) => k.split('>')[0] !== k.split('>')[1])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const max = Math.max(1, ...top.map(([, v]) => v));
  return (
    <div className="space-y-3">
      {top.map(([k, v]) => {
        const [a, b] = k.split('>') as [SituationId, SituationId];
        return (
          <div key={k} className="flex items-center gap-4" title={`${SHORT_NAME[a]} → ${SHORT_NAME[b]}: ${v}`}>
            <span className="w-28 shrink-0 text-right text-[13px] text-gray-400">{SHORT_NAME[a]}</span>
            <div className="relative h-3 flex-1 rounded-[4px] bg-white/[0.04]">
              <motion.div
                className="absolute left-0 top-0 h-3 rounded-[4px]"
                style={{ background: `linear-gradient(90deg, ${FIRST}, ${SECOND})` }}
                initial={{ width: 0 }}
                animate={{ width: `${(v / max) * 100}%` }}
                transition={{ duration: 0.9 }}
              />
            </div>
            <span className="w-28 shrink-0 text-[13px] text-gray-200">→ {SHORT_NAME[b]}</span>
            <span className="w-8 text-[13px] tabular-nums text-gray-400">{v}</span>
          </div>
        );
      })}
    </div>
  );
};

const Tile: React.FC<{ n: number; label: string; total: number }> = ({ n, label, total }) => (
  <div className="rounded-2xl border border-white/10 px-6 py-5 text-center">
    <p className="font-display text-[44px] leading-none text-[#EDE7DA]">{n}</p>
    <p className="mt-2 text-[12px] text-gray-500">{label}</p>
    <p className="text-[11px] text-gray-600">{total ? Math.round((n / total) * 100) : 0}%</p>
  </div>
);

// ---------------------------------------------------------------------------
// the screen
// ---------------------------------------------------------------------------

const Room: React.FC = () => {
  const q = new URLSearchParams(window.location.search);
  const lang: Lang = q.get('lang') === 'en' ? 'en' : 'id';
  const t = T[lang];
  const o = COPY[lang].reflection.options;

  const [code, setCode] = useState(q.get('room')?.toUpperCase() ?? '');
  const [key, setKey] = useState(q.get('key') ?? '');
  const [s, setS] = useState<RoomSummary | null>(null);
  const [stage, setStage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // The room is polled, not pushed: forty phones over an evening is nothing,
  // and a screen that refreshes every few seconds is one fewer thing to break.
  useEffect(() => {
    if (!code || !key) return;
    let live = true;
    const tick = async () => {
      const next = await fetchSummary(code, key);
      if (live && next) setS(next);
    };
    void tick();
    const id = setInterval(tick, 3000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, [code, key]);

  // Arrow keys and space move the reveal, so the facilitator can hold a
  // clicker and never touch the laptop.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') setStage(v => Math.min(5, v + 1));
      if (e.key === 'ArrowLeft') setStage(v => Math.max(0, v - 1));
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const open = async () => {
    setBusy(true);
    setFailed(false);
    const r = await openRoom();
    setBusy(false);
    // A button that does nothing is the worst kind of failure — the person
    // standing at the front of a room needs to know *why* nothing happened.
    if (!r) {
      setFailed(true);
      return;
    }
    setCode(r.code);
    setKey(r.key);
    const u = new URL(window.location.href);
    u.searchParams.set('room', r.code);
    u.searchParams.set('key', r.key);
    window.history.replaceState(null, '', u.toString());
  };

  if (!code || !key) {
    return (
      <main className="grid min-h-[100dvh] place-items-center px-8 text-center">
        <div>
          <button
            onClick={open}
            disabled={busy}
            className="rounded-full bg-[#EDE7DA] px-10 py-4 text-[12px] font-bold tracking-[0.28em] text-[#07090C] disabled:opacity-50"
          >
            {busy ? t.opening : t.open}
          </button>
          {failed && (
            <div className="mx-auto mt-8 max-w-md rounded-xl border border-amber-300/25 bg-[#12171d] px-5 py-4 text-left">
              <p className="text-[14px] text-amber-100">{t.unreachable}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-gray-400">{t.unreachableWhy}</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  const link = `${APP_URL}?room=${code}`;
  const n = s?.n ?? 0;
  const changed = (k: string) => s?.changed[k] ?? 0;

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col px-10 py-12">
      <header className="flex items-baseline justify-between">
        <span className="font-display text-[18px] tracking-[0.2em] text-[#EDE7DA]">NUCLEUS PULSE</span>
        <span className="text-[12px] tracking-[0.3em] text-gray-500">
          {code} · {t.joined(n)}
        </span>
      </header>

      <section className="flex flex-1 flex-col justify-center py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {stage === 0 && (
              <div className="text-center">
                <p className="text-[12px] tracking-[0.3em] text-gray-500">{t.waiting}</p>
                <p className="font-display mt-6 text-[120px] leading-none tracking-[0.2em] text-[#EDE7DA]">
                  {code}
                </p>
                <p className="mt-8 text-[14px] text-gray-400">{link}</p>
                <img
                  alt="QR"
                  className="mx-auto mt-6 h-44 w-44 rounded-xl bg-white p-2"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=352x352&data=${encodeURIComponent(link)}`}
                />
                <p className="font-display mt-10 text-[40px] text-[#EDE7DA]">
                  {n} <span className="text-[18px] text-gray-500">{t.people}</span>
                </p>
              </div>
            )}

            {(stage === 1 || stage === 2) && s && (
              <>
                <p className="mb-8 text-[12px] tracking-[0.3em] text-gray-500">{t.stage[stage]}</p>
                <Compare s={s} lang={lang} showSecond={stage === 2} />
              </>
            )}

            {stage === 3 && s && (
              <>
                <p className="mb-8 text-[12px] tracking-[0.3em] text-gray-500">{t.stage[3]}</p>
                <Flows s={s} />
              </>
            )}

            {stage === 4 && s && (
              <>
                <p className="mb-8 text-[12px] tracking-[0.3em] text-gray-500">{t.stage[4]}</p>
                <div className="mb-10 grid grid-cols-3 gap-4">
                  <Tile n={changed('2')} label={t.both} total={n} />
                  <Tile n={changed('1')} label={t.one} total={n} />
                  <Tile n={changed('0')} label={t.none} total={n} />
                </div>
                <div className="space-y-2">
                  {[...INFLUENCES]
                    .sort((a, b) => (s.influences[b] ?? 0) - (s.influences[a] ?? 0))
                    .map(id => (
                      <Bar
                        key={id}
                        label={o[id as InfluenceId]}
                        value={s.influences[id] ?? 0}
                        max={Math.max(1, ...INFLUENCES.map(i => s.influences[i] ?? 0))}
                        color="#EDE7DA"
                      />
                    ))}
                </div>
              </>
            )}

            {stage === 5 && (
              <div className="text-center">
                <p className="font-display text-[40px] leading-tight text-[#EDE7DA]">{t.close}</p>
                <p className="mt-4 text-[18px] text-gray-500">{t.closeB}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <footer className="flex justify-between text-[11px] tracking-[0.24em] text-gray-600">
        <span>{stage} / 5</span>
        <button onClick={() => setStage(v => Math.min(5, v + 1))} className="hover:text-gray-300">
          {t.next}
        </button>
      </footer>
    </main>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Room />);
