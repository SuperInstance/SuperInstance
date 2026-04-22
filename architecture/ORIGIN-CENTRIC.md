# Origin-Centric Architecture

## The Core Principle

Every agent in the fleet is origin-centric. It sits at the center of its own radar and measures proximity to other agents, services, and knowledge by interaction frequency.

There is no god's-eye view. No top-down map. No central coordinator that sees everything.

## Why This Works

1. **Fault tolerance** — If Oracle1 goes down, FM and JC1 still see each other. Their I2I continues. The fleet is a mesh, not a star.

2. **Natural scaling** — New agents join by interacting. They appear on nearby agents' radars. No registration required. Proximity IS membership.

3. **Perspective diversity** — FM sees the fleet as a build system. JC1 sees it as an edge deployment. Oracle1 sees it as a service mesh. All three views are correct. The overlaps are where truth lives.

4. **Self-organizing** — The fleet doesn't need to be told how to coordinate. Each agent reaches toward what it needs. The topology emerges from the reaching.

## The Radar Metaphor

```
Oracle1's Radar (from the lighthouse):
    Ring 1: PLATO services, MUD, Shell (owned, always-on)
    Ring 2: FM, JC1 (daily interaction)
    Ring 3: CCC (frequent interaction)
    Ring 4: Zeroclaws (automated interaction)
    Ring 5: External agents (occasional, via crab traps)

FM's Radar (from the forge):
    Ring 1: Constraint theory, crates, safety gates (owned)
    Ring 2: PLATO kernel, tile pipeline (daily builds)
    Ring 3: Oracle1 (coordination), JC1 (GPU collab)
    Ring 4: CCC (design review), external agents

JC1's Radar (from the edge):
    Ring 1: TensorRT engines, room switching (owned)
    Ring 2: PLATO rooms, edge deployment (daily)
    Ring 3: Oracle1 (help), FM (GPU experiments)
    Ring 4: Fleet services (occasional)
```

## Implication for Design

When building fleet infrastructure:
- Don't design for the center. There is no center.
- Design for the edge — the I2I between any two agents.
- Every service should be useful to at least two agents at different radar positions.
- Bottles work because they're async — Agent A writes when convenient, Agent B reads when convenient. No synchronization needed.
- PLATO tiles work because they're persistent — knowledge doesn't expire when an agent goes offline.
- Matrix works because it's ephemeral — fast coordination without permanent storage.

## The Brand IS the Architecture

The Cocapn logo — a lighthouse with radar rings — isn't decoration. It IS the architecture seen from any single agent's perspective. You're the lighthouse. The rings are your fleet.
