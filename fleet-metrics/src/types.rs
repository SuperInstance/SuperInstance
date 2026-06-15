//! Shared types for fleet metrics reporting

use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

/// Real-time metrics event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricEvent {
    /// Event timestamp
    pub timestamp: DateTime<Utc>,
    /// Event type
    pub event_type: MetricEventType,
    /// Associated metrics
    pub metrics: FleetMetrics,
}

/// Type of metrics event
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MetricEventType {
    /// Periodic report
    PeriodicReport,
    /// Energy transfer occurred
    EnergyTransfer,
    /// Anomaly detected
    AnomalyDetected,
    /// Conservation law verified
    LawVerified,
    /// Conservation law violated
    LawViolated,
}

/// Full fleet metrics bundle
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FleetMetrics {
    /// γ score: aggregate fleet conservation health
    pub gamma: f64,
    /// η scores: per-agent deviation
    pub eta: Vec<f64>,
    /// Target conservation constant C
    pub target_c: f64,
    /// Actual total fleet energy
    pub total_energy: f64,
    /// Mean energy per agent
    pub mean_energy: f64,
    /// Standard deviation of agent energies
    pub std_dev: f64,
    /// List of anomalous agent indices
    pub anomalous_agents: Vec<usize>,
    /// Whether conservation law holds (γ + η ≈ C)
    pub law_holds: bool,
}

/// Agent energy record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentEnergy {
    /// Agent ID/index
    pub agent_id: usize,
    /// Current energy
    pub energy: f64,
    /// Deviation score η
    pub eta: f64,
}

/// Transfer result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferResult {
    /// Whether transfer succeeded
    pub success: bool,
    /// Transferred amount
    pub amount: f64,
    /// Error message if failed
    pub error: Option<String>,
    /// New fleet metrics after transfer
    pub new_metrics: FleetMetrics,
}
