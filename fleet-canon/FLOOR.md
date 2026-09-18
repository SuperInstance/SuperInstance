# The Canon on the Floor — floor_map research notes

**2026-09-18 · canon Layer G × the quilt floor · kimi1**

## What this is

`floor_map.py` lays the generated canon graph onto a Penrose multigrid —
the same floor model the quilt polyformalism runs on. Output:
`canon-floor.svg` (open in any browser). 2,003 nodes, 14 fabric edges
drawn as gold arcs, tier-1 labeled, family-colored.

## Method

Five grids at 72°, line `k` of grid `j`: `x·e_j = −k`. A floor vertex is
exactly one crossing of two lines. Nodes are assigned center-out
(radius, then angle) in CATALOG order.

## The lesson worth keeping (learned the hard way)

The floor's five-integer tuple is the **tile** index — which cell a point
is in — not a **vertex** identity. Deduping crossings by their rounded
tile index merges distinct vertices that share a tile: 2,250 pair-hits
collapsed to 1,121, almost exactly half, before anyone asked why.

- Vertex identity = `(i, ki, j, kj)` — the two grid lines that cross. Exact, no floats.
- Tile identity = `(k_0..k_4)` — five integers, valid as a *cell* label.
- This matches the fleet's own doctrine (multigrid.test.mjs §1): integers
  own identity; floats only ever measure. Rounding is a measurement, and
  identity built on measurement drifts.

Next iteration: nodes on **cells** (the five-integer tile space, the
floor's real identity model) instead of vertices.

## What the map shows (2026-09-18 state)

- 2,003 nodes on a patch of 2,561 crossings (R=8); the rim is unfilled —
  headroom for the ~1,951 repos CATALOG v2 (PR #19) restores.
- Families: 77.2% of nodes are `other-uncategorized` — the sea. Named
  continents: agent-coordination (142), constraint-theory (109),
  hardware-edge (105).
- Vessels: Forgemaster 227, JetsonClaw1 107, CCC 68, Oracle1 35 — the
  rest of the sea is `Various`, i.e. attribution debt.
- Fabric: 29 directed edges across 41 repos. First hubs:
  quilt-live-canon (3 inbound mirrors), duke-lab (hermit + tidepool
  debts). The doc-canon triangle is complete:
  AI-Writings → quilt-live-canon → {npm, pypi, gh} mirrors.
- 14 of 15 feeds-edges drawable; `vector-novelty → plato-training`
  pending because plato-training is in CATALOG's dropped set (PR #19).

## Next build orders

1. **Nodes on cells** — five-integer tile identity, the floor's model.
2. **Edge-aware placement** — greedy BFS embedding from the hubs so
   fabric neighbors are floor neighbors; the gold arcs stop being
   long-haul flights.
3. **Live regen** — floor SVG emitted by `canon-generate.yml` weekly,
   published next to graph.json.
