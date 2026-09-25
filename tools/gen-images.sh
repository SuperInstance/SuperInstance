#!/usr/bin/env bash
# gen-images.sh — idempotent front-door asset generation via CF Workers AI (SDXL).
# Usage: CF_API_TOKEN=... tools/gen-images.sh   (re-runs skip files that already exist)
set -euo pipefail
ACCOUNT="049ff5e84ecf636b53b162cbb580aae6"
MODEL="@cf/stabilityai/stable-diffusion-xl-base-1.0"
OUT="$(cd "$(dirname "$0")/.." && pwd)/assets"
mkdir -p "$OUT"

gen() { # $1=file $2=prompt
  local f="$OUT/$1"
  if [ -s "$f" ]; then echo "SKIP $1 (exists, $(wc -c <"$f") bytes)"; return 0; fi
  echo "GEN  $1 ..."
  curl -sS -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/ai/run/$MODEL" \
    -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
    -d "$(python3 -c 'import json,sys; print(json.dumps({"prompt": sys.argv[1], "num_inference_steps": 25}))' "$2")" \
    -o "$f"
  # CF returns raw PNG on 200; JSON error body on failure — validate magic bytes
  if [ "$(head -c4 "$f" | od -An -tx1 | tr -d ' \n')" != "89504e47" ]; then
    echo "FAIL $1:"; head -c 400 "$f"; echo; rm -f "$f"; return 1
  fi
  echo "OK   $1 ($(wc -c <"$f") bytes)"
}

gen hero-constellation.png "Abyssal deep-sea bioluminescent constellation: a sparse field of small glowing cellular nodes connected by thin luminous filaments, deep teal and warm amber points of light on near-black dark ocean floor, minimal, elegant, scientific illustration mood, Dieter Rams simplicity meets Moebius linework, generous negative space, no text, no letters, no blue-purple gradient"

gen receipt-ledger.png "A long paper receipt unrolling across a dark surface, its printed lines turning into glowing circuitry traces and tiny ledger entries, warm amber ink on deep teal-black paper, minimal flat illustration with fine line detail, Dieter Rams simplicity, Moebius contour elegance, no readable text, no letters, no words"

gen waveform-cells.png "Minimal waveform made of small rounded cells and dots, like a tide-pool oscilloscope: teal and amber dots forming a gentle standing wave on a near-black background, sparse, scientific beauty, flat vector style, Dieter Rams restraint, Moebius line quality, no text, no letters"

echo "DONE. Assets:"; ls -la "$OUT"
