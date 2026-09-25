# ORG FRONT DOOR — round 2 plan (2026-09-25)

Mandate (Casey 11:10): superinstance.github.io/SuperInstance is "very stale…
the introduction to all of superinstance… a survey of everything with
demonstrations and images."

## Round-1 reconciliation (this branch continues 9756dbc, does NOT restart)

Round 1 (lane `org-front-door`, garbled finish 11:28, zero-token "success")
actually landed more than the autopsy found. Verified on remote
`front-door-2026-09-25`:

- ✅ Self-hosted demos under `demos/`: quilt-show episodes 1–3 (inline
  canvas + `voice/s*.mp3` relative audio, all mp3s present), quilt-studio
  Penrose floor (`main.mjs` + 11 modules, import paths rewritten to
  `./modules/`), pong-quilt coevolution (core/qa/checkpoints), twist-engine
  drum toy. All JS passes `node --check`.
- ✅ 3 SDXL assets via CF Workers AI (`tools/gen-images.sh`, idempotent):
  hero-constellation (1024², mean-luma 36.5), receipt-ledger (768², 99.6),
  waveform-cells (640², 45.3 — the "pure black" one WAS regenerated before
  the lane died; near-black fraction <0.3% on all three).
- ✅ Pages concurrency guard: `deploy-docs.yml` now shares `group: "pages"`
  with `pages.yml` — the two deploy workflows serialize (today's
  wedged-deployment 400 fix).
- ❌ **index.html was never touched.** The page IS the deliverable. This
  round writes it.

Design constitution (from memory, Casey 11:11 brief + fleet taste):
- Abyssal, Rams-meets-Moebius: deep near-black ocean, bioluminescent teal
  (#00E6D6) + amber (#FFB454) accents, JetBrains Mono, generous negative
  space. NO blue-purple gradient slop, NO marketing words.
- Verifiable claims only. Every number must be checkable (repo counts from
  the GitHub API, test counts from CI, quotes attributed).
- Self-hosted demos beat CDN iframes: same-origin, no CORS, they ship in
  the same Pages artifact. quilt-show episode-1 is the primary embed.

## Section plan

1. Hero — generated constellation asset + Casey's line: "We give computes
   rooms so AI has a home." + honest stats (public repos from API).
2. Live demos — episode-1 primary (iframe), floor, pong-quilt, twist-engine
   as secondary cards, each with a one-line true description.
3. The survey — ~30 repos in 6 named groups (Quilt core / Polyformalism &
   sims / Oracles: JEV·MOTH·JEPA / Canon & writings / Fleet & edge /
   Foundations), one verifiable line each, links to GitHub.
4. Coming soon — Super Z's quilt-arcade card (NOT embedded: unplaytested,
   deploy+playtest is a queued lane).
5. The conservation law — γ + η = C with receipt-ledger + waveform-cells
   assets, kept from the old page (it was the one good part).
6. Footer.

## Cut list (explicit)

- No raw.githack/jsDelivr CDN embeds (self-hosted wins; rule 5 satisfied by
  testing same-origin serving instead — verified 200s via file presence).
- No quilt-arcade iframe.
- No new repos beyond the survey's 30; the org has 4,799 public repos, the
  door surveys, it cannot catalog.
- Old marketing copy (unverifiable latency claims, "sub-10ms") dropped.
