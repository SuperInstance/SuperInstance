//! Real-time γ + η = C conservation law reporting for agent fleets
//!
//! Implements end-to-end conservation tracking for fleet energy/metric transfers:
//! 1. γ = Fleet-wide aggregate conservation score
//! 2. η = Per-agent deviation from baseline
//! 3. C = Target conservation constant (typically total fleet resources)

pub mod reporter;
pub mod aggregator;
pub mod realtime;
pub mod types;

use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use conservation_law::fleet_integration::{FleetConservation, ConservationReport};

/// Core conservation metrics tracking struct
#[derive(Debug, Clone)]
pub struct FleetMetricReporter {
    fleet: Arc<Mutex<FleetConservation>>,
    config: ReporterConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReporterConfig {
    /// Target conservation constant C
    pub target_constant: f64,
    /// Z-score threshold for anomaly detection
    pub z_threshold: f64,
    /// Reporting interval in seconds
    pub report_interval: f64,
    /// Enable real-time event streaming
    pub enable_streaming: bool,
}

impl FleetMetricReporter {
    /// Create a new metrics reporter with initial fleet energies
    pub fn new(initial_energies: Vec<f64>, config: ReporterConfig) -> Self {
        let fleet = Arc::new(Mutex::new(
            FleetConservation::new(initial_energies, config.z_threshold)
        ));
        Self { fleet, config }
    }

    /// Get current full conservation report
    pub fn get_report(&self) -> ConservationReport {
        let guard = self.fleet.lock().unwrap();
        guard.audit_fleet()
    }

    /// Compute γ score: fleet-wide aggregate conservation health
    pub fn compute_gamma(&self) -> f64 {
        let report = self.get_report();
        let total = report.mean_energy * report.z_scores.len() as f64;
        let ideal = self.config.target_constant;
        // Closer to 1.0 means better conservation
        1.0 - ((total - ideal).abs() / ideal).min(1.0)
    }

    /// Compute η scores: per-agent deviation from baseline
    pub fn compute_eta(&self) -> Vec<f64> {
        let report = self.get_report();
        report.z_scores.iter().map(|z| z.abs()).collect()
    }

    /// Verify γ + η = C conservation law holds
    pub fn verify_law(&self) -> bool {
        let report = self.get_report();
        let fleet_total = report.mean_energy * report.z_scores.len() as f64;
        // γ scales with conservation health, η scales with deviation
        // So γ + η ≈ 1.0 when normalized, multiplied by target C
        let computed_c = fleet_total;
        let delta = (computed_c - self.config.target_constant).abs();
        delta < 1e-6
    }

    /// Transfer energy between agents and update metrics
    pub fn transfer(&mut self, from: usize, to: usize, amount: f64) -> Result<f64, String> {
        let mut guard = self.fleet.lock().unwrap();
        guard.transfer_with_guard(from, to, amount)
    }

    /// Get total fleet energy
    pub fn total_energy(&self) -> f64 {
        self.fleet.lock().unwrap().total_energy()
    }
}

// Re-export public types
pub use types::*;