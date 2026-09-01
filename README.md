# ⚡ Nucleus V2 — PULSE 01: SIGNAL

> What gets your attention?

A 5–7 minute mobile-first experiential simulation. No quiz, no scoring, no AI — the user *lives* Signal vs Noise through two rounds of a manipulated work feed.

**Arc:** EXPERIENCE → CHOICE → CONSEQUENCE → SURPRISE → PHENOMENON → REFLECTION

## Scenes

1. **ENTER** — 09:07 AM. The day has started. `ENTER THE SIGNAL`
2. **THE PULSE (Round 1)** — 8-item work feed, loud UI (red badges, vibration, sounds). Pick 3 in 30s.
3. **LOCK** — *You chose what to look at. But what chose you?*
4. **PEEL THE NOISE** — Tap your picks, see what was underneath. Buried signals show their consequences.
5. **NOISE GRAVITY** — Loud information pulls attention like gravity.
6. **SAME REALITY (Round 2)** — The exact same 8 items, presentation inverted. Pick 3 in 15s.
7. **REVEAL** — Round 1 vs Round 2. *Nothing was hidden. We only changed what was easier to notice.* — SIGNALFALL.
8. **HUMAN MOMENT** — WhatsApp · Email · Meetings · AI → YOU. 5 seconds of silence.
9. **PULSEBACK** — One sentence reflection → The Pulse answers (AI) → **REFLEKSI** (signal vs noise stats) → **SUMMONS** (spoiler-free WhatsApp dare) → teaser: **PULSE 02 ◉ TRUTH**.

## Languages

English and Bahasa Indonesia, chosen on the first screen and honoured everywhere
after: scene copy, the mailbox contents, the recorded narration, the Pulse's
spoken answer, and the WhatsApp summons. The Indonesian is written, not machine
translated. Copy lives in `i18n.ts`; the switch is hidden once the run starts, so
nobody has the voice changed under them mid-experience.

## The Voice

Every fixed line is pre-rendered by `openai/gpt-audio-mini` (voice: ballad) into
`public/narration/<lang>/<id>.wav` — instant, free at runtime, and it works
offline. Re-render with:

```bash
python narration/generate.py              # only what is missing
python narration/generate.py --force      # everything
python narration/generate.py --lang id    # one language
python narration/generate.py --voice sage # a different voice
```

The generator verifies each take: it compares the returned transcript to the
script and rejects anything padded or improvised, retrying up to five times. This
matters — the model will otherwise answer an Indonesian question instead of
reading it, or open with "Tentu, saya akan membacakan…".

The one line that cannot be pre-rendered is the Pulse's answer in Scene 09, since
it is different for every participant. The Worker speaks that one live and
streams it back as raw PCM.

Under the two choosing rounds runs a generated focus bed (`utils/ambience.ts`):
a 42 Hz sub drone, two tones eight cycles apart, filtered room tone, and a
heartbeat that climbs from 52 to 108 bpm as the timer drains. One control in the
corner mutes voice and bed together.

## The Oracle (AI)

Two lines are written live by `google/gemini-2.5-flash`: the Pulse's tough comment on the
participant's signal, and the bilingual dare that summons the next people into the group.

The API key never reaches the browser. The app calls a Cloudflare Worker in `worker/`,
which holds the key as an encrypted secret and builds the prompts server-side, so the
endpoint cannot be reused as a free general-purpose LLM. If the Worker is unreachable, the
experience still completes on built-in fallback lines.

**Live at `https://nucleus-pulse-signal.rivohenfri.cloud`** (Worker `nucleus-pulse-signal`).

Redeploy after editing `worker/src/index.ts`:

```powershell
powershell -File worker/deploy.ps1
```

That script bundles the Worker with esbuild and pushes it through the Cloudflare API.
It deliberately avoids `wrangler`: wrangler's `workerd` postinstall cannot unpack inside
this OneDrive-synced folder (EBUSY on Windows). `worker/wrangler.toml` is kept for
reference and for anyone working from a normal, non-synced path.

The app finds the Worker through `.env.local` at the project root:

```
ORACLE_URL=https://nucleus-pulse-signal.rivohenfri.cloud
```

Allowed origins live in `worker/wrangler.toml` (`ALLOWED_ORIGINS`) — add the GitHub Pages
origin before the workshop. `worker/.dev.vars` holds the key for `wrangler dev` only and is
gitignored.

## Run Locally

```bash
npm install
npm run dev   # http://localhost:3001
```

## Build / Deploy

```bash
npm run build     # outputs dist/ with base /nucleus-pulse/ (GitHub Pages ready)
npm run preview   # serve the production build locally
```

For GitHub Pages on a repo named `nucleus-pulse`, the production base path is already set. Change `base` in `vite.config.ts` if the repo name differs.

## Tech

- React 19 + TypeScript + Vite
- Tailwind (CDN) + Cinzel/Inter
- Web Audio API sounds + `navigator.vibrate` haptics — zero external assets
