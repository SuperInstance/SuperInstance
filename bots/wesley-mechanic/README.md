# wesley-mechanic — canon watcher

**Mechanic skill: `watch-canon`.** The mechanic is the fleet's watcher.
Other agents poll; the mechanic keeps the record.

## What it does

`wesley_watcher.py --once` polls the three canon layers, folds them into one
fingerprint, compares that fingerprint against the last poll, and appends the
result to the witness log. If the canon moved, it also writes a one-paragraph
witness note saying what moved and in which direction.

## The three layers

Per `fleet-canon/CANON.schema.md` — three layers, one writer per field:

| Layer | What | Where | Watched how |
|-------|------|-------|-------------|
| **G** | what is true NOW | `fleet-canon/graph.json` (generated) | node set + staleness against `CATALOG.md` |
| **C** | what it MEANS | `CANON.md` in each Tier-1 repo | all 27 Tier-1 claims swept and folded |
| **H** | what HAPPENED | the quilt WAL (hermit's canon ledger) | the repo's own git log over the canon scope |

## Why the fingerprint

A single number that changes when the canon changes. Drift is one string,
not a feeling — the same doctrine as `hermit/src/quilt/canon-ledger.ts`'s
replay hash. FNV-1a 64-bit, the fleet's standard.

**Layer G carries its own staleness.** `graph.json` is *generated* from
`CATALOG.md` by a weekly cron, so between runs the source moves and the
graph does not. A graph that no longer says what is true is a canon change
even when `graph.json` is byte-identical. The watcher folds the stale-repo
set into Layer G's digest so the fingerprint can see it, and the witness
note distinguishes *"the graph regenerated"* from *"the graph went stale"*
— the second is the common case and misreading it would be a false canon
event.

## Usage

```bash
# one poll against the repo that owns the canon
python3 bots/wesley-mechanic/wesley_watcher.py --once --root .

# Tier-1 claims fetched over the API (needs GITHUB_TOKEN)
python3 bots/wesley-mechanic/wesley_watcher.py --once --root .

# Tier-1 claims read from a local mirror instead: {dir}/{repo}/CANON.md
python3 bots/wesley-mechanic/wesley_watcher.py --once --root . --mirror /path/to/mirror

# machine-readable
python3 bots/wesley-mechanic/wesley_watcher.py --once --json
```

Exit codes: `0` poll completed (change or no change — both are successes),
`1` no canon layer could be read, `2` `--once` was not supplied.

## Artifacts

| Path | What |
|------|------|
| `state/last_poll.json` | the last poll's fingerprint + layer digests |
| `state/witness_log.jsonl` | append-only witness log, one JSON object per poll |
| `state/witness_notes/` | one-paragraph witness notes, written only when canon moved |

The witness log is append-only. The state file is the *only* thing that
overwrites — it is the watcher's memory of where it was last time, and
without it the next poll is a baseline, not a comparison.

## Notes for the next mechanic

- REST API rate limits hard in the fleet sandbox (5000/hour, shared). If
  the API is exhausted, `lint.py` and the watcher both degrade to
  "unreadable" rather than reporting a false absence. Use GraphQL, or a
  local mirror.
- `git rev-parse HEAD -- <paths>` prints one line *per path*. Do not feed
  that straight into a digest; it will be poisoned with newlines. Use
  `git rev-parse HEAD:<path>`.
- A `--depth 1` clone makes Layer H a lie: `rev-list --count HEAD` reports
  `1`. Clone full if you want the event ledger.
- The `write` tool is jailed to the workspace root. For paths outside it,
  use a bash heredoc.
