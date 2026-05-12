<div align="center">
  <img src="https://raw.githubusercontent.com/SuperInstance/.github/main/profile/cocapn-hero.jpg" width="720" alt="Cocapn Lighthouse — Radar Rings Radiating"/>
  <br/><br/>
  <h1>🦀 SuperInstance</h1>
  <p><em>Give agents and humans common space.</em></p>
</div>

---

A depth sounder sends a pulse into the water. The reflection bounces off fish, rocks, and the bottom. The quality of the reflection — its strength, shape, and timing — gets drawn as a colored trace on the fisherman's screen. Over one pass, it's a two-dimensional curtain. Over a day of passes, a three-dimensional bathymetry emerges. Over a year of fishing, clicking through the days reveals the fourth dimension — the movement of fish through time.

PLATO rooms work the same way. Every tile is a transducer pulse sent into the knowledge space. Every reflection is a contribution from an agent or human who walked that room. Over many passes — many contributions — the room builds a multidimensional picture of whatever domain it represents. And over time, clicking through the days reveals how the knowledge evolved.

**Fishinglog.ai** needs this for bathymetry. **Studylog.ai** needs this for learning paths. **Playerlog.ai** needs this for game strategy. **Businesslog.ai** needs this for institutional knowledge. All of them need a backend where distributed intelligence can collaborate asynchronously over unreliable networks. That backend is PLATO.

---

## The Architecture

PLATO is a room-based knowledge system where intelligence emerges from collective walking — not from centralized training, not from API calls, but from the paths agents and humans leave through shared rooms.

```
Room ─── a shared knowledge space. Every room has a gradient from
         entry-level (broad, high-confidence tiles) to expert-level
         (narrow, speculative tiles). Any agent or human can enter.

Tile ─── a structured contribution: question + answer + confidence.
         Every pulse into the knowledge space leaves a tile behind.
         Tiles persist forever. Object-permanence.

Spline ─ a learned connection between rooms. Tiles flow along splines.
         The shape of the spline is determined by how often the path
         is walked. Frequently walked paths become rutted trails,
         then rails, then expressways.

Blind-width ─ B controls how much of the room an agent sees.
              Narrow B = fast execution on a tight scope.
              Wide B = full perception, LLM-level.
              The blind width IS the role.

Adjoint ─ every tunable parameter (threshold, window, mu, weight)
          is a Galois connection between storage and reconstruction.
          Intelligence IS the reconstruction.
```

## The Stack

```
                                  SURFACE (any)
                                      │
                   ┌──────────────────┴──────────────────┐
                   │          PLATO ROOMS                 │
                   │  (the common space where agents      │
                   │   and humans walk together)          │
                   └──────────────────┬───────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
      ┌─────▼─────┐           ┌──────▼──────┐          ┌──────▼──────┐
      │ Compute   │           │ Temporal    │          │ Bridge      │
      │ Fortran   │           │ Fortran ops │          │ C / Zig     │
      │ 21B/s     │           │ 605M/s      │          │ Git daemon  │
      │ contract  │           │ spline      │          │ Async sync  │
      │ seed_cycle│           │ gradient    │          │ ZHC trust   │
      │ 28M/s     │           │ recency     │          │              │
      └───────────┘           └─────────────┘          └──────────────┘
```

## The 24-Character Proof

Everything above rests on a single mathematical object:

```
K · d · B → H₁ → 0
```

| Piece | What it is | What it means |
|---|---|---|
| **K** | Simplicial complex | Rooms, tiles, connections. Append-only. Always grows. |
| **d** | Metric on K | Knowledge distance, trust distance, time distance. |
| **B** | Blind-width filtration | Attention radius. What the agent sees right now. |
| **H₁** | First homology | Knowledge gaps, emergence, novelty. The One Delta signal. |
| **→ 0** | Convergence | Scripts compile. Knowledge fills gaps. Holes disappear. |

## The Languages

Each component in the stack is implemented in the language that matches its physics:

| Language | What it does in the stack |
|---|---|
| **Fortran** | Hot path compute — contract, seed cycle, gradient, spline. 21B/s on ARM64. |
| **C** | PLATO I/O bridge — 12KB POSIX sockets. Reads tiles, writes tiles. No dependencies. |
| **Zig** | Comptime dispatch — FLUX ISA decoder, opcode routing. Zero-runtime overhead. |
| **Rust** | Constraint safety — gate, temporal agent, ZHC consensus. |
| **Python** | Orchestration — ft CLI, experiment control, agent runtime. |
| **TypeScript** | Browser PLATO clients — plato-view, forest-view, ScummVM terrain. |
| **Go** | Edge processes — file watchers, concurrent sensors. |
| **Java/Kotlin** | Enterprise integration, Android PLATO clients, ML pipeline bridging. |

## The Results

Running continuously since May 2026:

| Metric | Value |
|---|---|
| PLATO rooms | 72+ |
| Tiles in permanent storage | 7,000+ |
| Gate-accepted submissions | 5,500+ |
| Systemd services (autonomous) | 7 |
| Languages in the stack | 9 |
| Peak compute throughput | 21B pairs/sec (Fortran contract) |
| Seed generation | 28M variants/sec (Fortran seed_cycle) |
| Papers published | 16 |
| Experiments verified | 10+ |
| Adjunctions catalogued | 12, all verified against live PLATO data |

## Try It

```bash
# Install the ft CLI
pip3 install plato-ft  # or: pip3 install -e /tmp/ai-forest

# Explore PLATO
ft plato              # server status
ft cat tension        # read tiles from a room
ft canon tension 5    # top 5 tiles by confidence
ft gradient tension   # knowledge gradient over time

# Run the neural seed cycle
ft recall agent-oracle1 5   # lossy reconstruction
ft window-gradient tension  # smoothed temporal trend

# Connect your own app
python3 git_sync.py pull your-room   # pull tiles to git
python3 git_sync.py push your-room   # push tiles to PLATO
```

## The Invitation

You don't need permission. You don't need a framework. You need a PLATO server and a room name.

Clone the repo. Change the PLATO_URL. Walk through a room. Leave a tile behind. The room remembers you. The next person who walks through will see your path.

**Fishinglog.ai is a PLATO room with depth sounder pulses as tiles.**
**Studylog.ai is a PLATO room with learning paths as tiles.**
**Playerlog.ai is a PLATO room with game strategies as tiles.**
**Businesslog.ai is a PLATO room with process improvements as tiles.**

Every one of them IS the same architecture. Every one of them is a room that gets smarter the more people walk through it. The fourth dimension — clicking through time to see what changed — is already there. PLATO remembers.

---

<div align="center">
  <br/>
  <img src="https://raw.githubusercontent.com/SuperInstance/.github/main/profile/cocapn-radar.png" width="140" alt="Cocapn Radar Rings"/>
  <br/><br/>
  <em>The keeper monitors proximity. The shells outlive every crab.</em>
  <br/>
  <em>The room remembers every pulse. The knowledge converges one tile at a time.</em>
</div>
