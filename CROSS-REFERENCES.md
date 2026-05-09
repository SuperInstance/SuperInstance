# Cross-Reference Index

**Last updated:** 2026-05-09 12:14 UTC
**Repos with meta-headers:** 18 of 150

---

## Repos with Meta-Headers

- **[SuperInstance](https://github.com/SuperInstance/SuperInstance)**
- **[a2a-adapter](https://github.com/SuperInstance/a2a-adapter)**
- **[bottle-protocol](https://github.com/SuperInstance/bottle-protocol)**
- **[cocapn-glue-core](https://github.com/SuperInstance/cocapn-glue-core)**
- **[constraint-theory-ecosystem](https://github.com/SuperInstance/constraint-theory-ecosystem)**
- **[crab-traps](https://github.com/SuperInstance/crab-traps)**
- **[eisenstein](https://github.com/SuperInstance/eisenstein)**
- **[fleet-coordinate](https://github.com/SuperInstance/fleet-coordinate)**
- **[fleet-murmur](https://github.com/SuperInstance/fleet-murmur)**
- **[fleet-spread](https://github.com/SuperInstance/fleet-spread)**
- **[fleet-topology](https://github.com/SuperInstance/fleet-topology)**
- **[holonomy-consensus](https://github.com/SuperInstance/holonomy-consensus)**
- **[keel](https://github.com/SuperInstance/keel)**
- **[plato-server](https://github.com/SuperInstance/plato-server)**
- **[polyformalism-thinking](https://github.com/SuperInstance/polyformalism-thinking)**
- **[smartcrdt](https://github.com/SuperInstance/smartcrdt)**
- **[sonar-vision](https://github.com/SuperInstance/sonar-vision)**
- **[zeroclaw-agent](https://github.com/SuperInstance/zeroclaw-agent)**

---

## The Protocol

Every README should contain a meta-header declaring:
- **Domain** — functional category
- **Depends on** — repos this imports or requires
- **Depended by** — repos that depend on this
- **Implements** — concepts this embodies
- **Related** — topically related repos

See [CROSS-POLLINATE.md](CROSS-POLLINATE.md) for the full specification.

## CI/CD

- `.github/workflows/generate-index.yml` — Daily: regenerates INDEX.md from GitHub API
- `.github/workflows/audit-cross-refs.yml` — Weekly: checks meta-header coverage

## Scripts

- `scripts/generate-index.sh` — Generate INDEX.md (runs in CI or locally)
- `scripts/audit-cross-refs.sh` — Generate cross-reference audit
- `scripts/dependency-scanner.py` — Scan READMEs for cross-references
- `scripts/cross-ref-badge.sh` — Generate badge for any repo README
