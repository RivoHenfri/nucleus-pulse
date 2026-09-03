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
| 02 | THE MORNING | 09:07. Seven situations arrive unevenly over 30s. Choose 2. |
| 03 | FREEZE | Sound stops, movement stops, two seconds of nothing. *Where did your attention go?* |
| 04 | REFLECTION | *What mattered to you here?* Up to two, self-reported. |
| 05 | TRANSITION | *Now let's add what you couldn't see.* |
| 06 | CONTEXT REVEAL | The same seven, flattened, peeling open one at a time. |
| 07 | SECOND LOOK | The same inbox, the same rows, the same order, the same 30s — with the context opened under each row. Choose 2 again. |
| 08 | THE MIRROR | First look vs. with more context. Three branches, all valid. *Your experience didn't change. The information available to you did.* |
| 09 | PULSEBACK | A personal mirror: what they noticed, what mattered to them, what they chose with context — then the one thing that needed a decision and never became one of their two, how long it had been waiting, and what it was waiting on. Named SIGNALFALL, with *not a mistake* attached. No score, no analysis. |
| — | END | PULSE 01 complete. SIGNAL, with a meaning attached. The experiment named once and quietly, and a teaser for PULSE 02 — TRUTH. |

Six screens were cut on the way here. Four taught vocabulary the morning had
already taught (SIGNAL, SIGNAL / NOISE, LENS, PHENOMENA) and ended on maxims
that would have been just as true if nobody had played. FINAL was one long
maxim. THE SYSTEM REVEAL — the *one more thing* replay — went last: the run
still read as too long, and the Mirror is the strongest thing the experience
has to say. It now goes Mirror, PULSEBACK, and then the two names on the way
out.

The AI PRIORITY card went with them — a confident recommendation built from six
of eight sources, then a screen unpacking what it could not see. It was the one
part of the morning nobody could place: too clever to read under pressure, and
the point it made was about machines rather than about the room.

## One variable

The second look used to be a calmer screen on a shorter clock: no chrome, no
red, no unread counts, cards reshuffled, fifteen seconds. Three things moved at
once — the information, the way it was dressed, and how long there was to read
it — so nothing about a changed choice could be read back. It is now the same
client, the same rows, the same badges, the same order and the same thirty
seconds, with the context opened underneath. What the participant knows is the
only thing that differs between the rounds.

## What it will not do

No score. No signal ratio. No personality or attention profile. No right answer,
no wrong answer, no ranking of people or departments. No aphorisms: nothing on
screen is allowed to be a sentence that would still be true if this morning had
never happened. It never infers a trait
from a click, never stores individual performance, and never tells one
participant what another chose. The three Mirror outcomes are written so that
none of them reads as the good one.

## The seven situations

Client · Finance · People · Engineering · Operations · Hospitality ·
Governance. Every participant gets the same seven, with the same owners,
deadlines and consequences; only arrival order and timing move.

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
for re-timing without playing four minutes to reach it. It is gated on
`import.meta.env.DEV`, so the parameter does nothing on a production build.

## Tech

React 19 · TypeScript · Vite · Motion for React · Tailwind (CDN) · Web Audio.

No login, no identity, no backend, no analytics, no leaderboard. Session state
is `localStorage` and nothing leaves the device.
