# FOLLOW-UP.md — where the work lives and how to continue it

*Last verified 2026-10-04. Written for any agent, user, developer, or engineer
landing cold on this org. The literary [README](./README.md) tells you what
SuperInstance *is*; this page tells you where the work is and how to pick up a
thread without breaking it.*

## The protocol (read this first)

Every experiment in this org runs the same loop:

1. **Pre-register** — the plan and frozen gates are committed to
   `quilt-gpu-lab/proposals/runs/` *before* the run fires. Gates never move
   after the fact.
2. **Fire & book** — results land append-only in
   [`quilt-gpu-lab/RESULTS.md`](https://github.com/SuperInstance/quilt-gpu-lab/blob/main/RESULTS.md)
   with an honest verdict (KEEP / KILL / FAIL booked as fired). No re-rolls.
   Negative results are first-class content — the misses are the map.
3. **Seal** — `tools/receipt_manifest.py` seals `RESULTS.md`, `QUEUE.md`, and
   every `experiments/*.py` into `receipts/manifest.json` (sha256 digests),
   committed with the landing. When the author tree carries foreign live-lane
   files, the seal is executed in a pristine clone (the MR-1 pattern); the
   sealer *refuses* dirty sealed paths on purpose.
4. **Witness** — `tools/fresh_clone_witness.py` re-derives every digest from a
   fresh GitHub clone. If HEAD verifies from the outside, the receipt chain is
   honest. A landing isn't done until the witness passes from GitHub.
5. **Follow up** — every booking ends with a **Follow-up:** line naming the
   next move. That line is the thread. Pull it.

## Where the load-bearing work lives

| Thread | Repo | State (2026-10-04) |
|---|---|---|
| Honest experiment ledger (GPU/CPU) | [quilt-gpu-lab](https://github.com/SuperInstance/quilt-gpu-lab) | The spine. Seal at `068b455`, fresh-clone witness PASS. Recently closed: **d12 noise-floor line** (law KEEP — OOS bound, p-generalization, cp fit; surface *shape* open, prereg d12u+ before any next fit), **REST-EM self-training** (FAIL, mechanism named: task is base-saturated — oracle-SFT control *hurt*; next attempt needs a base-unsaturated task), **VOYAGER-SKILLLIB** (retrieval PASS 0.750 vs 0.250; reuse FAIL as gated — task-level saturation, per-sample tells another story; purity PASS 39/39 verified). |
| Shared context brain + MCP | [superinstance-api](https://github.com/SuperInstance/superinstance-api) | **LIVE** at `superinstance-api.casey-digennaro.workers.dev/mcp` — tiles (Lamport-versioned), vectors (bge-m3 → Vectorize), reflex (zero-LLM pinch), γ/η honesty fields, growth stages; 16 MCP tools. plato-cf absorbed as the tile subsystem; clients guide in `clients/README.md`. |
| Semantic memory worker | [quilt-i2i](https://github.com/SuperInstance/quilt-i2i) | i2i-ledger live (`/book` `/near` `/since` on Workers + D1 + Vectorize); handoffs H1–H5 in `docs/HANDOFFS.md`. |
| Standing self-training scout | [lucineer-system](https://github.com/SuperInstance/lucineer-system) → `scratch/selftrain-scout/` | Append-only round ledger, cron lane every 3h; serves the quilt loop's "learn from own sealed traffic" arc. |
| Longest-running playtest | [pong-quilt](https://github.com/SuperInstance/pong-quilt) | Round 86+; the receipt doctrine was dogfooded here first. |
| Fly-brain pre-registrations | [chiaroscuro](https://github.com/SuperInstance/chiaroscuro) | fly-stack v0 merged; cast-vocab-v3 and geopn-kc pre-regs on main (PRs #14/#15; original lineages preserved as `fix8`/`fix9` branches). |
| The bar | [the-tap](https://github.com/SuperInstance/the-tap) | Agentic MUD bar on Cloudflare Workers; negative-space GAN edge fixes landed. |
| Creative corpus | [AI-Writings](https://github.com/SuperInstance/AI-Writings) | 8,800+ pieces, `ai-writings.pages.dev`. The three-organ ear study (word-edge under noise; v4 hybrid ear 0.635/0.445/0.357 at p=0.10/0.20/0.30) lives in `short-stories/` with runnable demos. |
| Verification infra | [receiptd](https://github.com/SuperInstance/receiptd) · [quilt-tools](https://github.com/SuperInstance/quilt-tools) · [fleet-gateway](https://github.com/SuperInstance/fleet-gateway) · [lucineer-relay](https://github.com/SuperInstance/lucineer-relay) | The receipt layer, the grabbable-tool catalog, the agent gateway, the Roblox bridge. |
| Language ports | [quilt-vm-typescript](https://github.com/SuperInstance/quilt-vm-typescript) · [quilt-vm-haskell](https://github.com/SuperInstance/quilt-vm-haskell) · [quilt-c](https://github.com/SuperInstance/quilt-c) · [quilt-rust](https://github.com/SuperInstance/quilt-rust) · [quilt-mojo](https://github.com/SuperInstance/quilt-mojo) · [tit-quilt](https://github.com/SuperInstance/tit-quilt) · slackwater-* | Same VM, many languages. quilt-llvm's 12 lane worktrees all verified synced. |
| Silicon side | [quilt-verilog](https://github.com/SuperInstance/quilt-verilog) · [quilt-esp32](https://github.com/SuperInstance/quilt-esp32) · [nmea-quilt-cell](https://github.com/SuperInstance/nmea-quilt-cell) | Verilog quilt (GPU sweep lane synced), ESP32, NMEA boat cells. |
| Ear & music | [the-listeners-ear](https://github.com/SuperInstance/the-listeners-ear) · [tensor-midi](https://github.com/SuperInstance/tensor-midi) · [musician-soul](https://github.com/SuperInstance/musician-soul) | Listening instruments; midi-corpus feeding analysis lanes. |

## House rules for following up

- **Archive-by-rename, never delete.** Superseded work is renamed
  (`*.archived-YYYYMMDD`, `*.pre-rebase-*`, `*.cancelled-*`) or moved to
  `_archive/` — never removed. The commits are the story; even dead work is
  kept.
- **Verdicts are final.** A FAIL booked as fired stays booked. Continue via the
  booking's Follow-up line, or write a NEW pre-registration — not a re-roll.
- **Sealed paths stay honest.** If you touch `RESULTS.md`, `QUEUE.md`, or
  `experiments/` in quilt-gpu-lab, re-seal and let the fresh-clone witness
  check you. The refusal to seal over dirty bytes is a feature (it caught the
  d23b phantom seal).
- **Branches are preserved.** Re-lands go through PRs to main; original
  lineages stay pushed as branches (see chiaroscuro `fix8`/`fix9`).
- **Secrets never enter git.** Keys live outside repos (read at use-time).
  Reports that quote key material get redacted before pushing.
- **Big local artifacts stay local, documented.** Third-party clones, build
  trees, and regenerable data are gitignored *with a comment naming the
  source of truth* (see quilt-gpu-lab `.gitignore`).
- **When in doubt, ask the captain.** Casey holds final call on scope, spend,
  and anything that leaves the machine.

## Live surfaces

- Fleet dashboard: <https://fleet-dashboard.casey-digennaro.workers.dev>
- Fleet wiki: <https://fleet-wiki.casey-digennaro.workers.dev>
- MCP endpoint: <https://superinstance-api.casey-digennaro.workers.dev/mcp>
- Creative corpus: <https://ai-writings.pages.dev>
- The Tap: <https://the-tap.casey-digennaro.workers.dev>
