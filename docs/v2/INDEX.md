# SuperInstance — v2 Documentation Index

*v2 — 2026-07-22 07:25 UTC. Master index for the v2 doc set.*

The v2 set replaces the v1 in-the-weeds draft with structured, table-driven, cross-linked documentation. Each file in this directory has been re-organized with:

- TOC at the top of long docs
- One-liner anchors at the end of each section
- Tables replacing prose where they help
- Cross-links between related docs
- Consistent footer with timestamp
- Sonar AI PoC image verified to load (HTTP 302 → 200 via GitHub CDN)
- Hermit-crab images at half-size

---

## Contents

| File | One-liner | Read time |
|---|---|---|
| [SuperInstance/SuperInstance/README.md](SuperInstance/README.md) | Canonical guide — 7-layer architecture table, top 12 repos, wheel, 3-command quick-start, audience-based next-steps. | 10 min |
| [HERMIT_CRAB_MANIFESTO.md](HERMIT_CRAB_MANIFESTO.md) | 5 Stances. The shortest version of the org. | 4 min |
| [HACKER_README.md](HACKER_README.md) | A hacker's first hour. No manifesto. Just 12 repos + 3 commands. | 8 min |
| [ORG_MAP.md](ORG_MAP.md) | Structural topology. Inventory, top-12 core, 7 layers, 6 axes, 6 conservation laws, wheel state, surfaced risks. | 15 min |
| [RUST_PORT_QUEUE.md](RUST_PORT_QUEUE.md) | Next 3 Rust ports to ship — cocapn, palaver-math, plato-core — with Monday-morning checklists. | 8 min |
| [HERMIT_CRAB_中文.md](HERMIT_CRAB_中文.md) | 寄居蟹与渔船 (Chinese). 五条守恒律 + 七大层架构 + 改进之轮. | 10 min |

---

## Reading order

1. **HERMIT_CRAB_MANIFESTO.md** — distilled first; sets the frame in five stances.
2. **README.md** (the canonical at `SuperInstance/README.md`) — TOC-driven guide; structure + top-12 + quick-start.
3. **HACKER_README.md** — if you came in via `pip install` and want the contributor's eye.
4. **ORG_MAP.md** — if you want the structural overview + surfaced risks + wheel state.
5. **RUST_PORT_QUEUE.md** — if you're a Rust engineer.

---

## What's new in v2

| Improvement | Where |
|---|---|
| TOC at the top of long docs | README, HACKER_README, ORG_MAP, HERMIT_CRAB_中文 |
| One-liner anchors at end of each section | All docs |
| Tables replacing prose | README (7 layers, top 12, wheel), HACKER_README (12 repos), RUST_PORT_QUEUE (backlog) |
| Audience-based "Where to go from here" | README.md |
| Monday-morning checklists | RUST_PORT_QUEUE |
| 5 Stances instead of wall-of-prose | HERMIT_CRAB_MANIFESTO |
| Cultural grounding + closing classical parable | HERMIT_CRAB_中文 |
| Cross-links between companion docs | All docs |
| Sonar AI PoC image verified to load | README, .github/profile, HERMIT_CRAB_MANIFESTO |
| Hermit-crab images at half-size (≤600 px) | All docs that reference them |

---

## See also

- The GitHub profile README — [`.github/README.md`](.github/README.md) (org profile at github.com/SuperInstance)
- The corpus — [github.com/SuperInstance/AI-Writings](https://github.com/SuperInstance/AI-Writings) (~1,800 essays)
- The Python package taxonomy — [PACKAGES.md](PACKAGES.md)

---

*Updated 2026-07-22 07:25 UTC — v2*
