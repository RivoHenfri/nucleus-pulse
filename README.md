# ⚛️ NUCLEUS — PULSE 01: SIGNAL

> What gets your attention?

A three-to-four minute, mobile-first workplace experience. Eight things land on
one morning, you get thirty seconds and two choices, and then you are shown what
was underneath them. Built to the spec in `../spec pulse 01- signal.txt`.

It is a behavioural experiment, and the participant is not told that until the
last screen. Everything before it is a normal, slightly pressured morning.

## The arc

    normal → pressure → choice → curiosity → context →
    reconsideration → recognition → surprise → reflection

The reaction it is built for is **"Oh… I actually did that."** — never
"the app analysed me."

## The scenes

| # | Scene | What happens |
|---|-------|--------------|
| 01 | ENTER | The mark ignites. Language, five quiet lines, a way in. |
| 02 | THE MORNING | 09:07. Eight situations arrive unevenly over 30s. Choose 2. |
| 03 | FREEZE | Sound stops, movement stops, two seconds of nothing. *Where did your attention go?* |
| 04 | REFLECTION | *What mattered to you here?* Up to two, self-reported. |
| 05 | TRANSITION | *Now let's add what you couldn't see.* |
| 06 | CONTEXT REVEAL | The same eight, flattened, peeling open one at a time. |
| 07 | AI CONTEXT | 94% confidence, computed over 6 of 8 sources. |
| 08 | SECOND LOOK | Same morning, more context, 15s. Choose 2 again. |
| 09 | THE MIRROR | First look vs. with more context. Three branches, all valid. |
| 10 | SIGNAL | The word is finally defined. |
| 11 | SIGNAL / NOISE | High activity ≠ high signal. Never a personal ratio. |
| 12 | LENS | Their own answers come back. Then LENS LOCK. |
| 13 | THE SYSTEM REVEAL | The replay, and *THIS SCREEN.* |
| 14 | PHENOMENA | NOISE GRAVITY. SIGNALFALL. Every system has gravity. |
| 15 | PULSEBACK | A personal mirror. No score, no analysis. |
| — | FINAL | *Reality is larger than any one lens.* The experiment is named here, once. |
| — | END | PULSE 01 complete, and a teaser for PULSE 02 — TRUTH. |

## What it will not do

No score. No signal ratio. No personality or attention profile. No right answer,
no wrong answer, no ranking of people or departments. It never infers a trait
from a click, never stores individual performance, and never tells one
participant what another chose. The three Mirror outcomes are written so that
none of them reads as the good one.

## The eight situations

Client · Finance · People · Engineering · Operations · Hospitality · Governance ·
AI. Every participant gets the same eight, with the same owners, deadlines and
consequences; only arrival order and timing move.

Loudness is deliberately uncorrelated with consequence — Hospitality is loud
**and** consequential, Engineering is quiet **and** consequential, the URGENT
client item is already handled. Nobody can beat this by learning "the quiet ones
matter".

## Animation

Native, not video, so every timing can follow the participant.

- **Motion for React** — scene changes, card arrival, the freeze, the peel, the
  replay, text beats.
- **CSS keyframes** — the ⚛️ breath and the ring. Nothing that needs to know
  what the participant is doing.
- **Web Audio** — struck-bell notifications, the focus bed under both rounds.
- **Vibration API** — a short haptic on loud arrivals, where supported.
- **Timers** — controlled random arrival, 0.5–2.5s apart.

### Tempo

Every pause in the app is written at its natural length and multiplied by `PACE`
in `components/atoms.tsx`. One number moves the whole run: 1 is longhand (~5
minutes), 0.8 is what ships (~3:45). Change that, not the individual numbers.

### The mark

`public/brand/nucleus-logo.webp`, with alpha baked in so it sits on the page
rather than in a black square. It ignites via a radial mask driven by a
MotionValue — the nucleus lights first, then the orbits, then the ring, then the
wordmark. It appears exactly twice: the first screen and the last.

## The voice

Both languages are spoken. Every fixed line is pre-rendered by
`openai/gpt-audio-mini` into `public/narration/<lang>/<id>.wav` — instant at
runtime, free, and it works offline.

The generator does not "call a TTS API", it **auditions takes**:

    render one → score it → keep it or try again

A take is rejected unless the transcript matches the script word for word, the
pace sits in a believable range for that language, the level is healthy, and
there is no long silence buried inside it. Every scene carries a delivery
direction (`direction` in `lines.json`) so the morning has forward push and the
system reveal sounds like a confession. Accepted audio is trimmed, faded, and
**RMS-levelled against every other line**, which is what stops 72 separate API
calls from sounding like 72 separate API calls.

```bash
python narration/generate.py                  # only what is missing
python narration/generate.py --force          # everything
python narration/generate.py --lang id        # one language
python narration/generate.py --only enter-1 morning
python narration/generate.py --attempts 10    # audition harder
python narration/generate.py --level-only     # just re-level what exists
```

Re-level after any partial re-render: a line recorded on its own is levelled
against itself, and the point is that they are levelled against each other.

The key comes from the environment, so `bws run -- python
narration/generate.py` works; `narration/.env` is the local fallback and is
gitignored.

## Run it

```bash
npm install
npm run dev      # http://localhost:3001
npm run build    # dist/, base /nucleus-pulse/ for GitHub Pages
npm run preview
```

In dev only, `?scene=lens` opens straight into a scene with stand-in choices,
for re-timing without playing four minutes to reach it. It is stripped from
production builds.

## Tech

React 19 · TypeScript · Vite · Motion for React · Tailwind (CDN) · Web Audio.

No login, no identity, no backend, no analytics, no leaderboard. Session state
is `localStorage` and nothing leaves the device.
