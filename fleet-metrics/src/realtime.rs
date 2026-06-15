//! Real-time metrics streaming and HTTP API

use std::convert::Infallible;
use std::net::SocketAddr;
use std::sync::Arc;
use hyper::{Body, Request, Response, Server};
use hyper::service::{make_service_fn, service_fn};
use serde_json::json;
use crate::*;
use chrono::Utc;

/// HTTP API server for fleet metrics
#[derive(Debug)]
pub struct MetricsServer {
    reporter: Arc<std::sync::Mutex<FleetMetricReporter>>,
    addr: SocketAddr,
}

impl MetricsServer {
    /// Create a new metrics API server
    pub fn new(reporter: FleetMetricReporter, addr: SocketAddr) -> Self {
        Self {
            reporter: Arc::new(std::sync::Mutex::new(reporter)),
            addr,
        }
    }

    /// Start the HTTP server
    pub async fn start(self) -> Result<(), hyper::Error> {
        let reporter = self.reporter.clone();

        let make_svc = make_service_fn(move |_conn| {
            let reporter = reporter.clone();
            async move {
                Ok::<_, Infallible>(service_fn(move |req| {
                    handle_request(req, reporter.clone())
                }))
            }
        });

        let server = Server::bind(&self.addr).serve(make_svc);
        println!("🚀 Fleet metrics API running on http://{}", self.addr);
        server.await
    }
}

async fn handle_request(
    req: Request<Body>,
    reporter: Arc<std::sync::Mutex<FleetMetricReporter>>,
) -> Result<Response<Body>, Infallible> {
    let path = req.uri().path();
    let method = req.method();

    match (method, path) {
        // Get current metrics
        (&hyper::Method::GET, "/metrics") => {
            let guard = reporter.lock().unwrap();
            let report = guard.get_report();
            let gamma = guard.compute_gamma();
            let eta = guard.compute_eta();
            let law_holds = guard.verify_law();
            let total_energy = guard.total_energy();

            let metrics = FleetMetrics {
                gamma,
                eta: eta.clone(),
                target_c: guard.config.target_constant,
                total_energy,
                mean_energy: report.mean_energy,
                std_dev: report.std_dev,
                anomalous_agents: report.anomalous_agents.clone(),
                law_holds,
            };

            let response = json!({
                "status": "success",
                "data": metrics,
                "timestamp": Utc::now().to_rfc3339()
            });

            Ok(Response::new(Body::from(response.to_string())))
        }

        // Get gamma + eta summary
        (&hyper::Method::GET, "/summary") => {
            let guard = reporter.lock().unwrap();
            let gamma = guard.compute_gamma();
            let eta = guard.compute_eta();
            let law_holds = guard.verify_law();

            let summary = json!({
                "status": "success",
                "data": {
                    "gamma": gamma,
                    "eta_scores": eta,
                    "conservation_law_holds": law_holds,
                    "target_c": guard.config.target_constant,
                    "active_agents": eta.len(),
                },
                "timestamp": Utc::now().to_rfc3339()
            });

            Ok(Response::new(Body::from(summary.to_string())))
        }

        // Transfer energy between agents
        (&hyper::Method::POST, "/transfer") => {
            // Parse request body
            let whole_body = match hyper::body::to_bytes(req.into_body()).await {
                Ok(b) => b,
                Err(_) => {
                    return Ok(Response::builder()
                        .status(400)
                        .body(Body::from("Invalid request body"))
                        .unwrap())
                }
            };

            let transfer_req: serde_json::Value = match serde_json::from_slice(&whole_body) {
                Ok(v) => v,
                Err(_) => {
                    return Ok(Response::builder()
                        .status(400)
                        .body(Body::from("Invalid JSON"))
                        .unwrap())
                }
            };

            let from = transfer_req["from"].as_u64().unwrap_or(0) as usize;
            let to = transfer_req["to"].as_u64().unwrap_or(0) as usize;
            let amount = transfer_req["amount"].as_f64().unwrap_or(0.0);

            if amount <= 0.0 {
                return Ok(Response::builder()
                    .status(400)
                    .body(Body::from("Amount must be positive"))
                    .unwrap())
            }

            let mut guard = reporter.lock().unwrap();
            let result = guard.transfer(from, to, amount);

            let response = match result {
                Ok(amount_transferred) => {
                    let report = guard.get_report();
                    let gamma = guard.compute_gamma();
                    let eta = guard.compute_eta();
                    let law_holds = guard.verify_law();
                    let total_energy = guard.total_energy();

                    let metrics = FleetMetrics {
                        gamma,
                        eta: eta.clone(),
                        target_c: guard.config.target_constant,
                        total_energy,
                        mean_energy: report.mean_energy,
                        std_dev: report.std_dev,
                        anomalous_agents: report.anomalous_agents.clone(),
                        law_holds,
                    };

                    json!({
                        "status": "success",
                        "data": TransferResult {
                            success: true,
                            amount: amount_transferred,
                            error: None,
                            new_metrics: metrics,
                        }
                    })
                }
                Err(e) => {
                    json!({
                        "status": "error",
                        "data": TransferResult {
                            success: false,
                            amount: 0.0,
                            error: Some(e),
                            new_metrics: FleetMetrics::default(),
                        }
                    })
                }
            };

            Ok(Response::new(Body::from(response.to_string())))
        }

        // API docs
        (&hyper::Method::GET, "/") => {
            let docs = r#"
# Fleet Metrics API

## Endpoints:
- GET /metrics - Get full real-time metrics
- GET /summary - Get gamma/eta summary
- POST /transfer - Transfer energy between agents
  - Body: {"from": 0, "to": 1, "amount": 10.0}
- GET /status - Get server status

## Metrics:
- gamma: Aggregate fleet conservation health (0-1)
- eta: Per-agent deviation scores
- conservation_law_holds: γ + η = C verification status
"#;

            Ok(Response::new(Body::from(docs)))
        }

        // 404
        _ => Ok(Response::builder()
            .status(404)
            .body(Body::from("Not found"))
            .unwrap()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::TcpListener;

    #[test]
    fn test_server_binds() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        drop(listener);

        let config = ReporterConfig {
            target_constant: 1000.0,
            z_threshold: 2.0,
            report_interval: 1.0,
            enable_streaming: false,
        };
        let reporter = FleetMetricReporter::new(vec![100.0; 10], config);
        let server = MetricsServer::new(reporter, addr);

        tokio::spawn(async move {
            server.start().await.unwrap();
        });
    }
}
