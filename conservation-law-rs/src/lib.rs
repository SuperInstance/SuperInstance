//! # conservation-law
//!
//! The conservation law for agent fleets, expressed as a closed energy system.
//!
//! A fleet holds a total quantity of "energy" (resources, budget, attention).
//! Energy may move *between* agents, but it is neither created nor destroyed by
//! a transfer — the total is a conserved constant **C**. This is the same shape
//! as the fleet-economics law **γ + η = C**: cost and value redistribute, the
//! budget total holds.
//!
//! On top of conservation sits anomaly detection: an agent whose energy strays
//! more than `z_threshold` standard deviations from the fleet mean is flagged.
//!
//! This is a foundational crate — pure `std`, no external dependencies.
//!
//! ```
//! use conservation_law::fleet_integration::FleetConservation;
//!
//! let mut fleet = FleetConservation::new(vec![100.0, 100.0, 100.0], 2.0);
//! assert_eq!(fleet.total_energy(), 300.0);
//!
//! // Move 40 units from agent 0 to agent 2 — total is conserved.
//! fleet.transfer_with_guard(0, 2, 40.0).unwrap();
//! assert_eq!(fleet.total_energy(), 300.0);
//!
//! let report = fleet.audit_fleet();
//! assert!(report.conserved);
//! ```

pub mod fleet_integration;

pub use fleet_integration::{ConservationError, ConservationReport, FleetConservation};
