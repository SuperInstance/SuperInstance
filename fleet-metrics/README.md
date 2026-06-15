# Fleet Metrics: Real-time γ + η = C Conservation Law Reporting

Real-time conservation law monitoring for agent fleets, implementing **γ + η = C**:
- **γ**: Aggregate fleet conservation health score (0-1)
- **η**: Per-agent deviation from baseline energy
- **C**: Target total system energy constant

## Features

### Core Functionality
✅ Real-time energy conservation tracking
✅ Anomaly detection via Z-score analysis
✅ Circuit-breaker protected energy transfers
✅ HTTP REST API for metrics access
✅ Time-windowed aggregation and trending
✅ Compliance with γ + η = C conservation law

### Architecture Built On
- Built on Rust and the `conservation-law-rs` crate
- Uses Tokio async runtime
- Hyper HTTP server for real-time streaming
- Serde + JSON for all API and state handling

## Quick Start

### Install Dependencies
```bash
cd fleet-metrics
cargo build
```

### Run the Reporter
```bash
# Default: 3 agents, 100 energy each, target C=300
cargo run -- --energies "100,100,100" --target-constant 300

# Custom example: 5 agents, report every 10s
cargo run -- --energies "50,75,100,125,150" --interval 10 --listen 0.0.0.0:8902
```

## API Endpoints

### GET /metrics
Get full real-time metrics bundle
```bash
curl http://localhost:8902/metrics
```

### GET /summary
Get γ+η summary
```bash
curl http://localhost:8902/summary
```

### POST /transfer
Transfer energy between agents
```bash
curl -X POST http://localhost:8902/transfer \
  -H "Content-Type: application/json" \
  -d '{"from": 0, "to": 1, "amount": 25.0}'
```

### GET /
API documentation

## Configuration

| Flag | Description | Default |
|---|---|---|
| `--energies` | Comma-separated initial agent energies | `100,100,100` |
| `--target-constant` | Target conservation constant C | `300.0` |
| `--z-threshold` | Z-score anomaly threshold | `2.0` |
| `--interval` | Reporting interval in seconds | `5.0` |
| `--listen` | API server listen address | `127.0.0.1:8902` |
| `--no-server` | Disable HTTP API server | Enabled by default |

## Example Output

```
🧮 Initialized fleet metrics reporter with 3 agents
🎯 Target conservation constant C = 300.0
📊 Reporting every 5 seconds
🌐 API server listening on http://127.0.0.1:8902

🚀 Starting real-time γ + η = C conservation reporting...

=== [2026-06-15 10:30:00] === 
   Total Fleet Energy: 300.00 / Target C: 300.00
   γ Score (Conservation Health): 1.0000
   η Scores (Per-agent Deviation):
     Agent  0: 0.0000
     Agent  1: 0.0000
     Agent  2: 0.0000
   Conservation Law (γ + η ≈ C): ✅ VALID
```

## Integration

### Library Usage
```rust
use fleet_metrics::{FleetMetricReporter, ReporterConfig};

let config = ReporterConfig {
    target_constant: 1000.0,
    z_threshold: 2.0,
    report_interval: 5.0,
    enable_streaming: true,
};

let mut reporter = FleetMetricReporter::new(vec![100.0; 10], config);

// Transfer energy
reporter.transfer(0, 1, 25.0).unwrap();

// Get metrics
let report = reporter.get_report();
let gamma = reporter.compute_gamma();
let eta = reporter.compute_eta();
```

## Fleet Conservation Law

The pipeline enforces that:
```
γ + η * N ≈ C
```
Where:
- N = Number of agents
- γ = Aggregate conservation health
- η = Average per-agent deviation

This ensures total system energy remains conserved at the target constant C.

## License

MIT OR Apache-2.0
