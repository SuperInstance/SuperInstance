# Witness Note (accuracy annotation) — 2026-10-25 12:33:18Z

*wesley-mechanic · canon poll seq 5 · fingerprint `49b8fbb8e81e17b6` · annotating `wesley-witness-note-20261025-123318.md`*

The tool's own note for this poll reports "The canon moved" for Layer C and Layer H. Both movements are **measurement artifacts, not substrate movement**, and the mechanic records the distinction rather than letting the log overstate it. The fleet fingerprint did move (`b56053dd2c50` -> `49b8fbb8e81e`), and it is the fingerprint, not the canon, that changed. Layer G (the generated canon graph) is **unchanged** at `2967e7d734d663a8` across both polls, and that is the layer that speaks for what is true NOW. Layer H moved only because HEAD advanced from `c7a1e91d691d` to `dfa09de618cd`, and `dfa09de` is *the watcher's own seq-4 log commit*; the canon-scope blobs are byte-identical across the two HEADs (`fleet-canon/graph.json`=`fb208c18`, `CATALOG.md`=`618c29d9`, `fleet-canon/tier1.txt`=`c4a2aa6d`), so the event ledger's substantive content did not move — only the commit counter the digest folds in. This is a self-reference loop worth naming: the watcher commits its log, and the next poll reads that commit back as a Layer H movement. Layer C moved `438b44f0c73f6a20` -> `a57616723252ce6d` solely because this poll could read 27 of 27 Tier-1 claims where the last poll read 26; the delta is `AI-Writings (None -> active)`, which is **not a state flip** — AI-Writings' `CANON.md` lives only on its `canon-md` branch (last touched 2026-09-18) and `main` has never carried it, so the prior poll's `claims_unreadable: [AI-Writings]` was a *reachability* gap, not a change in the claim. The honest verdict: **the canon did not move this poll; the witness's view of it did.** The graph still says what it said, and the mechanic records the difference between "the canon changed" and "I read it differently" — because a log that cannot tell those apart is a log that will eventually lie.

## Receipts

| Layer | Digest before | Digest after | Real movement? |
|---|---|---|---|
| G (what is true NOW) | `2967e7d734d663a8` | `2967e7d734d663a8` | **No** — byte-identical |
| C (what it MEANS) | `438b44f0c73f6a20` | `a57616723252ce6d` | **No** — one extra claim read, not a flip |
| H (what HAPPENED) | `748e3ef74dfcb38f` | `2a9ee1ac6f09b9fe` | **No** — HEAD sha only; scope blobs identical |

- Prior poll: seq 4, `2026-10-25T11:36:48Z`, fingerprint `b56053dd2c509071`.
- This poll: seq 5, `2026-10-25T12:33:18Z`, fingerprint `49b8fbb8e81e17b6`, exit 0, all three layers `ok`.
- Layer G stands at 5,290 nodes, generated `2026-10-18T23:40:12Z`, still stale against `CATALOG.md` by 18 repos (unchanged).
