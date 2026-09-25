# SuperInstance brand kit

**The mark — "the watching cell."** A quilt of four cells. Three are quiet.
One is lit and pulsing, because in a SuperInstance sheet, a cell is not just a
number — it can watch, decide, and act. The mark is the smallest honest
diagram of the whole idea.

## Files

| file | use |
|------|-----|
| `mark.svg` | the mark alone (avatars, favicons at large sizes, stickers) |
| `logo.svg` | horizontal lockup, mark + wordmark (headers, README banners) |
| `favicon.svg` | 64px simplified tile for browser tabs |

The wordmark is intentionally set in a **system font stack** — the brand must
render correctly offline, inside a single self-contained HTML file, with zero
font downloads. That constraint is a feature: everything SuperInstance ships
is self-contained by design.

## Palette — "deep tide"

Dark premium base (the terminal inherits), with four semantic accents. Each
accent is *bound to a meaning*, never decoration:

| token | hex | role |
|-------|-----|------|
| `ink` | `#070B14` | page background |
| `surface` | `#0D1524` | cards, panels |
| `line` | `rgba(255,255,255,.08)` | hairlines, grid |
| `text` | `#E8EDF7` | primary text |
| `muted` | `#8A96AD` | secondary text |
| `tide` | `#3FE0C5` | **life**: active cells, propagation, learning (aqua) |
| `signal` | `#FF7A6B` | **events**: listeners firing, alarms, flips (coral) |
| `budget` | `#FFC46B` | **economy**: MOTH-call meters, costs (amber) |
| `quantum` | `#9D8CFF` | **the quantum layer**: entanglement, waveform reads (violet) |
| `paper` | `#F2EEE3` | light-mode alternative background |

Accent discipline: aqua leads; coral/amber/violet appear only where their
meaning applies. One glow per element, never rainbow.

## Typography

- Display/UI: system stack `-apple-system, "Segoe UI", Inter, Roboto, Arial`
  — 800 for headlines, 300/400 for the quiet half of the wordmark and body.
- Cell IDs, formulas, receipts: monospace stack (`"SF Mono", Consolas,
  "DejaVu Sans Mono"`) — cell language is code-adjacent and must look it.
- Numerals in meters: `font-variant-numeric: tabular-nums`.

## Motion

- `pulse` 2.4s ease-in-out — the watching cell, budget meters.
- `cascade` 600ms — cell flash when a value propagates (coral flash, like a
  listener firing).
- Nothing bounces. The tide moves; it does not jiggle.
