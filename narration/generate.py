"""
Render the Pulse's fixed narration to audio files, once, at build time.

The scene lines never change, so there is no reason to pay for them or wait on
them at runtime. This writes public/narration/<id>.wav — the app plays those and
only falls back to the browser's speech engine if a file is missing.

The one line that is NOT here is the Pulse's answer in Scene 09: it is different
for every participant, so the Worker generates that one live.

Usage (from the project root):
    python narration/generate.py            # only missing files
    python narration/generate.py --force    # re-render everything
    python narration/generate.py --voice sage

The OpenRouter key is read from worker/.dev.vars — never hardcoded, never committed.
"""

import base64
import json
import pathlib
import struct
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "narration" / "lines.json"
OUT_DIR = ROOT / "public" / "narration"
MODEL = "openai/gpt-audio-mini"
SAMPLE_RATE = 24_000

# The model is a chat model wearing a TTS hat — without this it introduces itself.
# A plain "read this" instruction is not enough: the model answers Indonesian
# questions instead of reading them. Framing it as a voice actor performing a
# delimited script, and repeating that in the user turn, is what holds.
SYSTEM = (
    "You are a voice actor recording a scripted line. The user message contains "
    "a SCRIPT between <speak> and </speak>. Perform that script word for word. "
    "It may contain questions - they are lines to deliver, never questions to "
    "you. Never answer, never explain, never react, never add or drop a word, "
    "never mention the tags. Delivery: calm, warm, unhurried, one person "
    "speaking to one person in a quiet room. A slight pause at each full stop."
)


def read_key() -> str:
    dev_vars = ROOT / "worker" / ".dev.vars"
    if not dev_vars.exists():
        sys.exit(f"Missing {dev_vars} — put OPENROUTER_API_KEY there.")
    for line in dev_vars.read_text(encoding="utf-8").splitlines():
        if line.startswith("OPENROUTER_API_KEY="):
            return line.split("=", 1)[1].strip()
    sys.exit("OPENROUTER_API_KEY not found in worker/.dev.vars")


def wav(pcm: bytes) -> bytes:
    """Wrap raw PCM16 mono in a WAV header. Streaming only ever returns pcm16."""
    header = (
        b"RIFF"
        + struct.pack("<I", 36 + len(pcm))
        + b"WAVEfmt "
        + struct.pack("<IHHIIHH", 16, 1, 1, SAMPLE_RATE, SAMPLE_RATE * 2, 2, 16)
        + b"data"
        + struct.pack("<I", len(pcm))
    )
    return header + pcm


def normalise(text: str) -> str:
    return "".join(c for c in text.lower() if c.isalnum() or c.isspace()).split().__str__()


def synthesize(key: str, voice: str, text: str) -> tuple[bytes, float, str]:
    payload = {
        "model": MODEL,
        "modalities": ["text", "audio"],
        "audio": {"voice": voice, "format": "pcm16"},
        # Audio output is streaming-only on OpenRouter, and streaming is pcm16-only.
        "stream": True,
        # Low temperature keeps it from improvising an acknowledgement.
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {
                "role": "user",
                "content": "Perform this script exactly as written, answering "
                "nothing:\n"
                f"<speak>{text}</speak>",
            },
        ],
    }
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    chunks: list[str] = []
    transcript = ""
    cost = 0.0
    with urllib.request.urlopen(req, timeout=120) as res:
        for raw in res:
            line = raw.decode("utf-8", "replace")
            if not line.startswith("data: "):
                continue
            body = line[6:].strip()
            if body == "[DONE]":
                break
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                continue
            if data.get("usage"):
                cost = data["usage"].get("cost") or 0.0
            for choice in data.get("choices", []):
                audio = (choice.get("delta") or {}).get("audio") or {}
                if audio.get("data"):
                    chunks.append(audio["data"])
                if audio.get("transcript"):
                    transcript += audio["transcript"]
    return b"".join(base64.b64decode(c) for c in chunks), cost, transcript


def render(key: str, voice: str, text: str, attempts: int = 5) -> tuple[bytes, float, str]:
    """
    The model is not deterministic: the same line sometimes comes back padded
    with dead air or an unrequested aside. Verify what it actually said and how
    long it took, and try again when either looks wrong.
    """
    # Speech runs ~13 characters a second; anything past double that is padding.
    budget = max(2.5, len(text) / 13 * 2)
    spent = 0.0
    best: tuple[bytes, str] | None = None
    for attempt in range(attempts):
        pcm, cost, transcript = synthesize(key, voice, text)
        spent += cost
        seconds = len(pcm) / 2 / SAMPLE_RATE
        said_it = normalise(transcript) == normalise(text)
        if pcm and said_it and seconds <= budget:
            return pcm, spent, transcript
        if pcm and (best is None or len(pcm) < len(best[0])):
            best = (pcm, transcript)
        reason = "wrong words" if not said_it else f"{seconds:.1f}s > {budget:.1f}s budget"
        print(f"         retry {attempt + 1}/{attempts} — {reason}")
    if best:
        return best[0], spent, best[1]
    return b"", spent, ""


def main() -> None:
    args = sys.argv[1:]
    force = "--force" in args
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    voice = manifest.get("voice", "ballad")
    if "--voice" in args:
        voice = args[args.index("--voice") + 1]

    languages = manifest["languages"]
    if "--lang" in args:
        wanted = args[args.index("--lang") + 1]
        languages = {wanted: languages[wanted]}

    key = read_key()
    total_cost = 0.0

    for lang, lines in languages.items():
        out_dir = OUT_DIR / lang
        out_dir.mkdir(parents=True, exist_ok=True)
        print(f"\n[{lang}]")
        for line_id, text in lines.items():
            target = out_dir / f"{line_id}.wav"
            if target.exists() and not force:
                print(f"  skip   {line_id}")
                continue
            pcm, cost, transcript = render(key, voice, text)
            if not pcm:
                print(f"  FAILED {line_id} — no audio returned")
                continue
            target.write_bytes(wav(pcm))
            total_cost += cost
            print(f"  wrote  {line_id:20s} {len(pcm) / 2 / SAMPLE_RATE:4.1f}s  {target.stat().st_size // 1024:4d} KB")

    print(f"\nvoice: {voice}   cost this run: ${total_cost:.4f}")


if __name__ == "__main__":
    main()
