//! Fleet Metrics Runner

use fleet_metrics::reporter::run_cli;

#[tokio::main]
async fn main() {
    run_cli().await.unwrap();
}
