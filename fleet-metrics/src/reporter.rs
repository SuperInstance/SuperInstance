//! Command-line reporter and scheduler

use std::time::Duration;
use clap::Parser;
use tokio::time::interval;
use crate::realtime::MetricsServer;
use chrono::Utc;
use crate::*;

/// Command line arguments
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Cli {
    /// Initial agent energies, comma-separated values
    #[arg(short, long, default_value = "100.0,100.0,100.0")]
    pub energies: String,

    /// Target conservation constant C
    #[arg(short, long, default_value = "300.0")]
    pub target_constant: f64,

    /// Z-score threshold for anomalies
    #[arg(long, default_value = "2.0")]
    pub z_threshold: f64,

    /// Reporting interval in seconds
    #[arg(short, long, default_value = "5.0")]
    pub interval: f64,

    /// Enable HTTP API server
    #[arg(short, long, default_value = "true")]
    pub server: bool,

    /// API server listen address
    #[arg(long, default_value = "127.0.0.1:8902")]
    pub listen: String,
}

/// Run the command-line reporter
pub async fn run_cli() -> anyhow::Result<()> {
    let cli = Cli::parse();

    // Parse initial energies
    let energies: Vec<f64> = cli.energies.split(',')
        .map(|s| s.parse().unwrap_or(100.0))
        .collect();

    // Create config
    let config = ReporterConfig {
        target_constant: cli.target_constant,
        z_threshold: cli.z_threshold,
        report_interval: cli.interval,
        enable_streaming: cli.server,
    };

    // Initialize reporter
    let reporter = FleetMetricReporter::new(energies.clone(), config.clone());
    println!("🧮 Initialized fleet metrics reporter with {} agents", energies.len());
    println!("🎯 Target conservation constant C = {}", cli.target_constant);
    println!("📊 Reporting every {} seconds", cli.interval);

    // Start HTTP server if enabled
    let _server_handle = if cli.server {
        let addr = cli.listen.parse()?;
        let server = MetricsServer::new(reporter.clone(), addr);
        let handle = tokio::spawn(async move {
            server.start().await.unwrap();
        });
        println!("🌐 API server listening on http://{}", cli.listen);
        Some(handle)
    } else {
        None
    };

    // Start reporting loop
    let mut interval = interval(Duration::from_secs_f64(cli.interval));
    println!("\n🚀 Starting real-time γ + η = C conservation reporting...\n");

    loop {
        interval.tick().await;

        let report = reporter.get_report();
        let gamma = reporter.compute_gamma();
        let eta = reporter.compute_eta();
        let law_holds = reporter.verify_law();
        let total_energy = reporter.total_energy();

        // Print summary
        println!("=== [{}] === ", Utc::now().format("%Y-%m-%d %H:%M:%S"));
        println!("   Total Fleet Energy: {:.2} / Target C: {:.2}", total_energy, cli.target_constant);
        println!("   γ Score (Conservation Health): {:.4}", gamma);
        println!("   η Scores (Per-agent Deviation):");
        for (i, e) in eta.iter().enumerate() {
            println!("     Agent {:2}: {:.4}", i, e);
        }
        println!("   Conservation Law (γ + η ≈ C): {}", if law_holds { "✅ VALID" } else { "❌ VIOLATED" });
        if !report.anomalous_agents.is_empty() {
            println!("   ⚠️ Anomalous Agents: {:?}", report.anomalous_agents);
        }
        println!();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cli_parse() {
        let cli = Cli::parse_from([
            "fleet-metrics",
            "--energies", "100,200,300",
            "--target-constant", "600.0",
        ]);
        assert_eq!(cli.energies, "100,200,300");
        assert_eq!(cli.target_constant, 600.0);
        assert_eq!(cli.interval, 5.0);
    }

    #[test]
    fn test_reporter_initialization() {
        let config = ReporterConfig {
            target_constant: 600.0,
            z_threshold: 2.0,
            report_interval: 5.0,
            enable_streaming: false,
        };
        let reporter = FleetMetricReporter::new(vec![100.0, 200.0, 300.0], config);
        assert_eq!(reporter.total_energy(), 600.0);
        assert!(reporter.verify_law());
    }
}
