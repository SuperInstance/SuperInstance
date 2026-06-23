# conservation-law (local fleet-integration backend)

This is the **locally-vendored** conservation-law crate that
[`fleet-metrics`](../fleet-metrics) builds on. It provides the
`fleet_integration` module — `FleetConservation` and `ConservationReport` —
that the reporter imports:

```rust
use conservation_law::fleet_integration::{FleetConservation, ConservationReport};
```

It models the fleet as a **closed energy system**: total energy is the conserved
constant `C`; transfers redistribute energy between agents without changing the
total (the `γ + η = C` law in physical form), with z-score anomaly detection on
top. Pure `std`, zero external dependencies, fully tested (`cargo test`).

## Relationship to the published crate

There is also a separately-published, more general
[`conservation-law` on crates.io](https://crates.io/crates/conservation-law)
("Generalized conservation law framework: γ + H = C"). That crate is the
canonical, broader formulation and does **not** currently expose the
`fleet_integration` API this reporter was written against — which is why
`fleet-metrics` depends on this local path crate rather than the published one.

If/when the published crate exposes a compatible `fleet_integration` surface,
`fleet-metrics` should switch its dependency to the crates.io version and this
local mirror can be retired. Until then, prefer the published crate as the
conceptual source of truth and treat this as the concrete adapter the reporter needs.
