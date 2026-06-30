#!/usr/bin/env bash
# Fetch Voice-Zero CC0 prompts and convert to 24 kHz mono float32le for Pocket TTS.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/pocket-tts/voices"
BASE="https://github.com/OwenTyme/voice-zero/raw/main/voices"

mkdir -p "$OUT"

fetch_voice() {
  local name="$1"
  local tmp
  tmp="$(mktemp -t "${name}.XXXXXX.flac")"
  curl -fsSL "$BASE/${name}.flac" -o "$tmp"
  ffmpeg -y -i "$tmp" -ar 24000 -ac 1 -f f32le "$OUT/${name}.f32" >/dev/null 2>&1
  rm -f "$tmp"
  echo "Wrote $OUT/${name}.f32"
}

fetch_voice a_janelle_risa
fetch_voice alan_davis_drake
fetch_voice amy_koenig
