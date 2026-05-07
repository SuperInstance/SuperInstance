# A2A Repos Consolidation Report

**Date:** 2026-05-07  
**Auditor:** Oracle1 (subagent)  
**Status:** COMPLETE — No duplicate repos found

## Summary

Investigated all A2A-related repos in the SuperInstance fleet. **No zero-divergence Lucineer forks were found.** The four A2A-related repos serve distinct purposes and are not duplicates of each other.

---

## Repos Investigated

### 1. `SuperInstance/a2a-protocol`
| Attribute | Value |
|-----------|-------|
| **Language** | TypeScript |
| **Platform** | Cloudflare Workers |
| **Lines of Code** | 384 (src/worker.ts) |
| **Status** | ✅ Active — clean, working implementation |
| **Last Commit** | 2026-05-07: "fix: expand minimal README with full API reference" |
| **Purpose** | Base A2A protocol — type-safe, room-based messaging between fleet agents |
| **Key Features** | Message routing, vessel registry, subscriptions, TTL-based queue |

**README Description:** "Agent-to-agent protocol specification and Cloudflare Workers reference implementation. Enables type-safe, room-based messaging between fleet agents."

### 2. `SuperInstance/a2a-r-protocol`
| Attribute | Value |
|-----------|-------|
| **Language** | Python |
| **Lines of Code** | 276 (src/protocol.py) |
| **Status** | ✅ Active — clean, working implementation |
| **Last Commit** | 2026-05-07: "chore: add MIT license" |
| **Purpose** | A2A-R: Real-time robotics extensions — QoS, safety coordination, sensor streaming |
| **Key Features** | QoS levels (Safety-critical, Realtime, Interactive, Background), WebRTC, safety veto system |

**README Description:** "A2A-R: Agent-to-Agent protocol extensions for real-time robotics operations. Extends Google's A2A with QoS levels, sensor streaming, safety-critical coordination, and latency guarantees."

**Relationship to a2a-protocol:** A2A-R is an *extension* of the base A2A protocol, not a fork. They serve different use cases (general agents vs. robotics).

### 3. `SuperInstance/polyformalism-a2a-python`
| Attribute | Value |
|-----------|-------|
| **Language** | Python |
| **Lines of Code** | 1,587 (9 modules) |
| **Status** | ✅ Active — published to PyPI (polyformalism-a2a) |
| **Last Commit** | 2026-05-07: "docs: prep for publication" |
| **Purpose** | 9-channel intent encoding framework for multi-agent alignment |
| **Key Features** | Intent profiles, LLM encoder, fleet-constraint bridge, SoA mixed-precision batch |

**README Description:** "Think like a polyglot, not a compiler. A 9-channel intent encoding framework for agent-to-agent communication."

**This is NOT an A2A protocol implementation.** It's a higher-level framework for encoding intent using 9 channels (Boundary, Pattern, Process, Knowledge, Social, Deep Structure, Instrument, Paradigm, Stakes).

### 4. `SuperInstance/polyformalism-a2a-js`
| Attribute | Value |
|-----------|-------|
| **Language** | JavaScript/ESM |
| **Lines of Code** | 364 (3 modules) |
| **Status** | ✅ Active — published to npm (@superinstance/polyformalism-a2a) |
| **Last Commit** | 2026-05-07: "docs: prep for publication — zero-dep ESM, LLM encoder" |
| **Purpose** | Same as polyformalism-a2a-python, JS/Node.js version |

**This is NOT an A2A protocol implementation.** It's the JavaScript equivalent of the polyformalism 9-channel framework.

---

## Findings

### No Duplicates Found

The task description mentioned "3 of 4 A2A repos: zero-divergence Lucineer forks." This was **incorrect**. After investigation:

| Repo Pair | Relationship |
|-----------|--------------|
| a2a-protocol ↔ a2a-r-protocol | **Related but distinct** — A2A-R extends A2A for robotics |
| a2a-protocol ↔ polyformalism-* | **Completely different** — base protocol vs. intent encoding |
| a2a-r-protocol ↔ polyformalism-* | **Completely different** — robotics protocol vs. intent encoding |
| polyformalism-python ↔ polyformalism-js | **Same concept** — different language implementations (expected) |

### No Archive/Delete Actions Needed

All four repos are actively maintained with distinct purposes:
- `a2a-protocol` — Base agent messaging protocol
- `a2a-r-protocol` — Robotics extension of A2A  
- `polyformalism-a2a-python` — 9-channel intent encoding (Python)
- `polyformalism-a2a-js` — 9-channel intent encoding (JavaScript)

---

## Recommendations

1. **Keep all four repos** — they serve distinct purposes
2. **No archival or deletion required** — none are zero-divergence forks
3. **Cross-link in READMEs** — each README should reference related repos clearly
4. **Consider bundling** — if consolidation is desired, polyformalism repos could be renamed to remove "a2a" from the name since they're not actually A2A protocol implementations

---

## Evidence of Active Development

All repos show commits within the last 24-48 hours, indicating active maintenance rather than abandoned forks.
