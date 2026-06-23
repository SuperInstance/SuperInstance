//! Fleet-level conservation tracking and anomaly detection.
//!
//! [`FleetConservation`] owns the per-agent energy vector and the conserved
//! constant `C` (the initial total). [`FleetConservation::audit_fleet`] returns
//! a [`ConservationReport`] with the fleet statistics and any anomalous agents.

use std::fmt;

/// Relative tolerance used when checking that the total is conserved.
const CONSERVATION_EPSILON: f64 = 1e-9;

/// Why a transfer was rejected.
#[derive(Debug, Clone, PartialEq)]
pub enum ConservationError {
    /// An agent index was out of range.
    IndexOutOfBounds { index: usize, len: usize },
    /// Source and destination were the same agent.
    SelfTransfer { index: usize },
    /// The transfer amount was not strictly positive (or was NaN/infinite).
    NonPositiveAmount,
    /// The source agent does not hold enough energy to send `amount`.
    InsufficientEnergy { available: f64, requested: f64 },
}

impl fmt::Display for ConservationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ConservationError::IndexOutOfBounds { index, len } => {
                write!(f, "agent index {index} out of bounds (fleet size {len})")
            }
            ConservationError::SelfTransfer { index } => {
                write!(f, "cannot transfer from agent {index} to itself")
            }
            ConservationError::NonPositiveAmount => {
                write!(f, "transfer amount must be a positive, finite number")
            }
            ConservationError::InsufficientEnergy { available, requested } => {
                write!(
                    f,
                    "insufficient energy: agent holds {available:.4}, requested {requested:.4}"
                )
            }
        }
    }
}

impl std::error::Error for ConservationError {}

/// A point-in-time audit of the fleet's conservation state.
#[derive(Debug, Clone, PartialEq)]
pub struct ConservationReport {
    /// Per-agent energies at audit time.
    pub energies: Vec<f64>,
    /// Sum of all agent energies (the current total).
    pub total_energy: f64,
    /// Mean energy per agent.
    pub mean_energy: f64,
    /// Population standard deviation of agent energies.
    pub std_dev: f64,
    /// Per-agent z-scores: `(energy - mean) / std_dev` (0.0 when `std_dev == 0`).
    pub z_scores: Vec<f64>,
    /// Indices of agents whose `|z|` exceeds the configured threshold.
    pub anomalous_agents: Vec<usize>,
    /// Whether the current total still equals the conserved constant `C`.
    pub conserved: bool,
}

/// A closed energy system over a fleet of agents.
///
/// The total energy is fixed at construction and is the conserved constant `C`.
/// Transfers redistribute energy between agents without changing the total.
#[derive(Debug, Clone)]
pub struct FleetConservation {
    energies: Vec<f64>,
    z_threshold: f64,
    /// The conserved constant C — the total energy at construction.
    conserved_total: f64,
}

impl FleetConservation {
    /// Create a fleet from initial per-agent energies and a z-score threshold.
    ///
    /// The sum of `initial_energies` becomes the conserved constant `C`.
    /// `z_threshold` is the number of standard deviations beyond which an agent
    /// is considered anomalous (a typical value is `2.0` or `3.0`).
    pub fn new(initial_energies: Vec<f64>, z_threshold: f64) -> Self {
        let conserved_total = initial_energies.iter().sum();
        Self {
            energies: initial_energies,
            z_threshold: z_threshold.abs(),
            conserved_total,
        }
    }

    /// Number of agents in the fleet.
    pub fn agent_count(&self) -> usize {
        self.energies.len()
    }

    /// Borrow the current per-agent energy vector.
    pub fn energies(&self) -> &[f64] {
        &self.energies
    }

    /// The conserved constant `C` (total energy at construction).
    pub fn conserved_total(&self) -> f64 {
        self.conserved_total
    }

    /// Current total energy across all agents.
    pub fn total_energy(&self) -> f64 {
        self.energies.iter().sum()
    }

    /// True if the current total still matches the conserved constant `C`.
    pub fn is_conserved(&self) -> bool {
        let total = self.total_energy();
        let scale = self.conserved_total.abs().max(1.0);
        (total - self.conserved_total).abs() <= CONSERVATION_EPSILON * scale
    }

    /// Transfer `amount` of energy from one agent to another, conserving the
    /// total. The transfer is guarded: it is rejected (leaving state untouched)
    /// if indices are invalid, the amount is non-positive, or the source lacks
    /// sufficient energy.
    ///
    /// Returns the amount actually transferred on success. The error is
    /// stringified to match the fleet-metrics reporter contract; use
    /// [`FleetConservation::transfer`] for the typed error.
    pub fn transfer_with_guard(
        &mut self,
        from: usize,
        to: usize,
        amount: f64,
    ) -> Result<f64, String> {
        self.transfer(from, to, amount).map_err(|e| e.to_string())
    }

    /// Typed-error variant of [`FleetConservation::transfer_with_guard`].
    pub fn transfer(
        &mut self,
        from: usize,
        to: usize,
        amount: f64,
    ) -> Result<f64, ConservationError> {
        let len = self.energies.len();
        if from >= len {
            return Err(ConservationError::IndexOutOfBounds { index: from, len });
        }
        if to >= len {
            return Err(ConservationError::IndexOutOfBounds { index: to, len });
        }
        if from == to {
            return Err(ConservationError::SelfTransfer { index: from });
        }
        if !amount.is_finite() || amount <= 0.0 {
            return Err(ConservationError::NonPositiveAmount);
        }
        if self.energies[from] < amount {
            return Err(ConservationError::InsufficientEnergy {
                available: self.energies[from],
                requested: amount,
            });
        }

        self.energies[from] -= amount;
        self.energies[to] += amount;
        Ok(amount)
    }

    /// Produce a full conservation + anomaly audit of the current state.
    pub fn audit_fleet(&self) -> ConservationReport {
        let n = self.energies.len();
        let total: f64 = self.total_energy();

        if n == 0 {
            return ConservationReport {
                energies: Vec::new(),
                total_energy: 0.0,
                mean_energy: 0.0,
                std_dev: 0.0,
                z_scores: Vec::new(),
                anomalous_agents: Vec::new(),
                conserved: self.is_conserved(),
            };
        }

        let mean = total / n as f64;
        let variance = self
            .energies
            .iter()
            .map(|e| {
                let d = e - mean;
                d * d
            })
            .sum::<f64>()
            / n as f64;
        let std_dev = variance.sqrt();

        let z_scores: Vec<f64> = self
            .energies
            .iter()
            .map(|e| if std_dev > 0.0 { (e - mean) / std_dev } else { 0.0 })
            .collect();

        let anomalous_agents: Vec<usize> = z_scores
            .iter()
            .enumerate()
            .filter(|(_, z)| z.abs() > self.z_threshold)
            .map(|(i, _)| i)
            .collect();

        ConservationReport {
            energies: self.energies.clone(),
            total_energy: total,
            mean_energy: mean,
            std_dev,
            z_scores,
            anomalous_agents,
            conserved: self.is_conserved(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn total_energy_is_sum() {
        let fleet = FleetConservation::new(vec![100.0, 200.0, 300.0], 2.0);
        assert_eq!(fleet.total_energy(), 600.0);
        assert_eq!(fleet.conserved_total(), 600.0);
        assert_eq!(fleet.agent_count(), 3);
    }

    #[test]
    fn transfer_conserves_total() {
        let mut fleet = FleetConservation::new(vec![100.0, 100.0, 100.0], 2.0);
        let moved = fleet.transfer_with_guard(0, 2, 40.0).unwrap();
        assert_eq!(moved, 40.0);
        assert_eq!(fleet.energies(), &[60.0, 100.0, 140.0]);
        assert_eq!(fleet.total_energy(), 300.0);
        assert!(fleet.is_conserved());
    }

    #[test]
    fn transfer_rejects_insufficient_energy() {
        let mut fleet = FleetConservation::new(vec![10.0, 10.0], 2.0);
        let err = fleet.transfer(0, 1, 50.0).unwrap_err();
        assert!(matches!(err, ConservationError::InsufficientEnergy { .. }));
        // State is untouched after a rejected transfer.
        assert_eq!(fleet.energies(), &[10.0, 10.0]);
    }

    #[test]
    fn transfer_rejects_bad_index() {
        let mut fleet = FleetConservation::new(vec![10.0, 10.0], 2.0);
        assert!(matches!(
            fleet.transfer(0, 9, 5.0).unwrap_err(),
            ConservationError::IndexOutOfBounds { index: 9, len: 2 }
        ));
        assert!(matches!(
            fleet.transfer(9, 0, 5.0).unwrap_err(),
            ConservationError::IndexOutOfBounds { index: 9, len: 2 }
        ));
    }

    #[test]
    fn transfer_rejects_self_and_nonpositive() {
        let mut fleet = FleetConservation::new(vec![10.0, 10.0], 2.0);
        assert_eq!(
            fleet.transfer(0, 0, 5.0).unwrap_err(),
            ConservationError::SelfTransfer { index: 0 }
        );
        assert_eq!(
            fleet.transfer(0, 1, 0.0).unwrap_err(),
            ConservationError::NonPositiveAmount
        );
        assert_eq!(
            fleet.transfer(0, 1, -5.0).unwrap_err(),
            ConservationError::NonPositiveAmount
        );
        assert_eq!(
            fleet.transfer(0, 1, f64::NAN).unwrap_err(),
            ConservationError::NonPositiveAmount
        );
    }

    #[test]
    fn audit_balanced_fleet_has_no_anomalies() {
        let fleet = FleetConservation::new(vec![100.0, 100.0, 100.0], 2.0);
        let report = fleet.audit_fleet();
        assert_eq!(report.mean_energy, 100.0);
        assert_eq!(report.std_dev, 0.0);
        assert!(report.z_scores.iter().all(|z| *z == 0.0));
        assert!(report.anomalous_agents.is_empty());
        assert!(report.conserved);
    }

    #[test]
    fn audit_flags_outlier() {
        // One agent hoards energy: it should exceed the z threshold.
        let fleet = FleetConservation::new(vec![10.0, 10.0, 10.0, 10.0, 1000.0], 1.5);
        let report = fleet.audit_fleet();
        assert!(report.anomalous_agents.contains(&4));
        assert!(report.z_scores[4] > 1.5);
    }

    #[test]
    fn audit_empty_fleet_is_safe() {
        let fleet = FleetConservation::new(vec![], 2.0);
        let report = fleet.audit_fleet();
        assert_eq!(report.total_energy, 0.0);
        assert_eq!(report.mean_energy, 0.0);
        assert!(report.anomalous_agents.is_empty());
        assert!(report.conserved);
    }

    #[test]
    fn z_scores_are_symmetric_around_mean() {
        let fleet = FleetConservation::new(vec![50.0, 150.0], 5.0);
        let report = fleet.audit_fleet();
        assert_eq!(report.mean_energy, 100.0);
        // Two symmetric points sit at ±1 std dev.
        assert!((report.z_scores[0] + 1.0).abs() < 1e-12);
        assert!((report.z_scores[1] - 1.0).abs() < 1e-12);
    }
}
