# CANON.md — the fleet canon schema (Layer C)

**CANON.md is a 20-line stub, not a document.** Every canon system dies the
same death: the file becomes a second README, then a stale README, then a
lie. The fleet already has a story layer (AI-Writings, the fiction, the
Tap, the quilt WAL). Canon's only job is the **typed handle** — mission,
state, edges, lineage — small enough to update in one breath, linted hard
enough that staleness is a build failure.

Three layers, one writer per field:

| Layer | What | Where | Writer |
|---|---|---|---|
| G | what is true NOW | `fleet-canon/graph.json` (generated) | CI over the GitHub API |
| C | what it MEANS | `CANON.md` in Tier-1 repos (this schema) | agents / humans |
| H | what HAPPENED | hermit's quilt WAL (`canon/*` packets, v2) | event stream |

## The file

Repo-root `CANON.md`, YAML front-matter only, **≤ 20 lines, nothing else.
No prose sections. No badges. No history.**

```yaml
---
canon: 1                            # schema version (this doc)
name: hermit                        # MUST equal the repo name
mission: <one honest sentence>      # WHAT it is, not what it dreams
state: experimental|active|stable|sunset
family: applications                # from the generated taxonomy
vessel: CCC                         # owner-agent / crew
born_from: []                       # lineage: repos this spawned/budded/fissioned from
feeds: []                           # repos that consume this (semantic out-edges)
owed_by: []                         # repos this consumes (semantic in-edges)
canonical_docs: []                  # the 1-3 docs that ARE the repo
ledger: none|quilt-wal|git-log      # where its HISTORY lives
verified: 2026-09-17                # last curation pass — staleness clock starts here
---
```

## Field rules

- `mission`: one honest sentence. If you can't say it in one sentence, you
  don't know what the repo is.
- `state: sunset` requires a `canon/repo.sunset` WAL event (Layer H) — the
  rationale lives in the stream, not the file.
- `feeds` / `owed_by` are SEMANTIC edges (who depends on whom and why), not
  package-manager edges — those are generated into graph.json. Every edge
  must be acknowledged on both sides: `A.feeds ∋ B` ⇒ `B.owed_by ∋ A`, or
  canon-lint fails. An edge to a repo without CANON.md is reported until
  that repo joins Tier-1.
- `born_from`: judgment half curated here, mechanical half generated from
  fork lineage + WAL `canon/repo.born` events. Renames set `born_from` on
  the child — this is how `ccc-os` → `cocapn-health` and the
  constraint-theory renames stay traversable.
- `canonical_docs`: paths or URLs. The schema + the write path ARE the
  canonical docs for ledger-bearing repos (e.g. hermit's
  `drizzle/0013_quilt_kernel_wal.sql` + `src/quilt/commit.ts`).
- `verified`: the staleness clock. `> 30 days` + pushes since = lint
  warning; `> 90 days` on Tier-1 = lint failure.

## What is NOT here

Description, language, push recency, archive flag, dependency edges from
manifests — all generated (Layer G). History — the WAL (Layer H). Story —
AI-Writings and the fiction. This file is the handle, not the door.

## Naming

This is **fleet canon** (`fleet-canon/`). The existing `canon-*` npm
family (canon-claim/graph/suite/paper/recs, live-canon-*) is the **Live
Canon** — the AI-Writings citation graph. Different layers, different
jobs; see INDEX.md for the disambiguation line. Long-term, the Live Canon
becomes a Tier-1 repo with its own CANON.md like everyone else.
