# Cross-Pollination Protocol

Every README in the SuperInstance organization should contain a structured
meta-header that declares its relationships to other repos. This enables
automated cross-referencing, dependency tracking, and documentation audits.

## The Meta-Header

Every README should open with a section like this:

```markdown
## Meta

**Domain:** constraint-theory | agent-coordination | core-infra | hardware | web | tools
**Depends on:** repo-a, repo-b
**Depended by:** repo-c, repo-d
**Implements:** first-person-ttl, bearing-rate-sensing
**Related:** repo-e, repo-f
```

## Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `Domain` | Yes | Primary functional category | `constraint-theory` |
| `Depends on` | Conditional | Repos this repo imports or requires | `keel-ttl, chrono` |
| `Depended by` | No | Repos that depend on this | `fleet-spread` |
| `Implements` | No | Concepts this repo embodies | `laman-rigidity, h1-detection` |
| `Related` | No | Topically related repos | `fleet-coordinate` |

## The Audit

A CI/CD pipeline (`scripts/audit-cross-refs.sh`) checks every push:

1. **Missing meta-headers** — repos without proper cross-references
2. **Broken downstream links** — "Depended by" lists repos that don't reference back
3. **Stale READMEs** — no update in >90 days
4. **Unlinked dependencies** — `Cargo.toml` mentions a dependency that the README doesn't

The audit generates a `CROSS-REFERENCES.md` that catalogs all relationships.
