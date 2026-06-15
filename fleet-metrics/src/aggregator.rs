//! Fleet metrics aggregation and stream processing

use std::collections::HashMap;

use chrono::{DateTime, Utc, Duration};
use serde::{Serialize, Deserialize};
use crate::types::*;

/// Aggregates metrics over time windows
#[derive(Debug, Clone)]
pub struct MetricsAggregator {
    window_size: std::time::Duration,
    events: Vec<MetricEvent>,
    agent_metrics: HashMap<usize, Vec<f64>>,
    last_aggregated: DateTime<Utc>,
}

impl MetricsAggregator {
    /// Create a new aggregator with a given time window
    pub fn new(window_size: std::time::Duration) -> Self {
        Self {
            window_size,
            events: Vec::new(),
            agent_metrics: HashMap::new(),
            last_aggregated: Utc::now(),
        }
    }

    /// Add a new metric event to the aggregator
    pub fn add_event(&mut self, event: MetricEvent) {
        self.events.push(event.clone());
        
        // Update per-agent metrics
        for (idx, eta) in event.metrics.eta.iter().enumerate() {
            self.agent_metrics.entry(idx).or_default().push(*eta);
        }
        
        // Prune events outside the window
        let cutoff = Utc::now() - Duration::from_std(self.window_size).unwrap();
        self.events.retain(|e| e.timestamp > cutoff);
    }

    /// Get aggregated statistics for a time window
    pub fn aggregate(&self) -> AggregatedMetrics {
        let total_events = self.events.len();
        if total_events == 0 {
            return AggregatedMetrics::default();
        }

        let mut avg_gamma = 0.0;
        let mut avg_total_energy = 0.0;
        let mut law_hold_rate = 0.0;

        for event in &self.events {
            avg_gamma += event.metrics.gamma;
            avg_total_energy += event.metrics.total_energy;
            if event.metrics.law_holds {
                law_hold_rate += 1.0;
            }
        }

        avg_gamma /= total_events as f64;
        avg_total_energy /= total_events as f64;
        law_hold_rate /= total_events as f64;

        AggregatedMetrics {
            time_window: self.window_size,
            event_count: total_events,
            average_gamma: avg_gamma,
            average_total_energy: avg_total_energy,
            law_violation_rate: 1.0 - law_hold_rate,
            agent_deviation_avg: self.agent_metrics.values().flatten().sum::<f64>() / self.agent_metrics.len() as f64,
        }
    }

    /// Get real-time anomaly trend
    pub fn anomaly_trend(&self) -> AnomalyTrend {
        let recent_events: Vec<&MetricEvent> = self.events.iter()
            .rev()
            .take(10)
            .collect();
        
        let recent_anomalies: Vec<usize> = recent_events.iter()
            .flat_map(|e| &e.metrics.anomalous_agents)
            .cloned()
            .collect();
        
        // Count unique with hashset
        let mut unique_set = std::collections::HashSet::new();
        let mut unique_count = 0;
        for a in &recent_anomalies {
            if unique_set.insert(a) {
                unique_count +=1;
            }
        }
        
        AnomalyTrend {
            last_10_minutes_anomalies: recent_anomalies.len(),
            unique_anomalies: unique_count,
            trend: self.compute_trend(&recent_anomalies),
        }
    }

    fn compute_trend(&self, anomalies: &[usize]) -> TrendDirection {
        if anomalies.len() < 3 {
            return TrendDirection::Stable;
        }
        
        let first = anomalies[0..anomalies.len()/2].len() as f64;
        let last = anomalies[anomalies.len()/2..].len() as f64;
        
        if last > first * 2.0 {
            TrendDirection::Increasing
        } else if first > last * 2.0 {
            TrendDirection::Decreasing
        } else {
            TrendDirection::Stable
        }
    }
}

/// Aggregated metrics over a time window
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AggregatedMetrics {
    pub time_window: std::time::Duration,
    pub event_count: usize,
    pub average_gamma: f64,
    pub average_total_energy: f64,
    pub law_violation_rate: f64,
    pub agent_deviation_avg: f64,
}

/// Trend direction for anomalies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrendDirection {
    Increasing,
    Decreasing,
    Stable,
}

/// Anomaly detection trend report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnomalyTrend {
    pub last_10_minutes_anomalies: usize,
    pub unique_anomalies: usize,
    pub trend: TrendDirection,
}

// Add unique iterator support

