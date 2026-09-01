// Local pulse ledger — honest, device-scoped statistics.
// No backend: every run done on THIS device is tallied here, so a facilitator
// passing one phone around a room builds a real "noise vs signal" picture.

import { FEED_ITEMS, itemById } from '../data';

const KEY = 'nucleus.pulse01.runs';

export const TOTAL_SIGNALS = FEED_ITEMS.filter(i => i.signal).length;

export interface RunRecord {
  /** epoch ms */
  at: number;
  r1Signals: number;
  r1Noise: number;
  r2Signals: number;
  r2Noise: number;
}

export interface Split {
  signals: number;
  noise: number;
  /** ids of signal items the user never picked in this round */
  missed: string[];
}

export const splitPicks = (picks: string[]): Split => {
  const signals = picks.filter(id => itemById(id).signal);
  const missed = FEED_ITEMS.filter(i => i.signal && !picks.includes(i.id)).map(i => i.id);
  return { signals: signals.length, noise: picks.length - signals.length, missed };
};

export const recordRun = (round1: string[], round2: string[]): RunRecord => {
  const a = splitPicks(round1);
  const b = splitPicks(round2);
  const record: RunRecord = {
    at: Date.now(),
    r1Signals: a.signals,
    r1Noise: a.noise,
    r2Signals: b.signals,
    r2Noise: b.noise,
  };
  try {
    const all = loadRuns();
    all.push(record);
    localStorage.setItem(KEY, JSON.stringify(all.slice(-500)));
  } catch {
    /* private mode / storage blocked — the run still shows its own numbers */
  }
  return record;
};

export const loadRuns = (): RunRecord[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as RunRecord[]) : [];
  } catch {
    return [];
  }
};

export interface Cohort {
  runs: number;
  /** % of round-1 picks across all runs on this device that were noise */
  noiseSharePct: number;
  /** % of runs where round 1 caught zero buried signals */
  zeroSignalPct: number;
  /** average signals caught in round 1 → round 2 */
  avgR1: number;
  avgR2: number;
}

export const cohortStats = (runs: RunRecord[]): Cohort | null => {
  if (runs.length === 0) return null;
  const picks = runs.reduce((n, r) => n + r.r1Signals + r.r1Noise, 0);
  const noise = runs.reduce((n, r) => n + r.r1Noise, 0);
  const zero = runs.filter(r => r.r1Signals === 0).length;
  return {
    runs: runs.length,
    noiseSharePct: picks ? Math.round((noise / picks) * 100) : 0,
    zeroSignalPct: Math.round((zero / runs.length) * 100),
    avgR1: Math.round((runs.reduce((n, r) => n + r.r1Signals, 0) / runs.length) * 10) / 10,
    avgR2: Math.round((runs.reduce((n, r) => n + r.r2Signals, 0) / runs.length) * 10) / 10,
  };
};
