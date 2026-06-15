# Loom Caching Fleet Rollout Script

## Overview
This production-grade shell script automates a phased 25% canary rollout of Loom caching with automatic rollback guardrails and Cloudflare metric sync for monitoring.

## Features
- ✅ 25% canary deployment strategy
- 🚨 Automatic rollback on error rate or latency thresholds
- 📊 Cloudflare HTTP metrics integration (error rates, latency)
- 🔒 Idempotent operations with file locking
- 📝 Comprehensive logging
- 🛠️ Configurable thresholds and timing

## Prerequisites
1. `curl` and `jq` installed on the system
2. Cloudflare API token with permissions to read zone HTTP metrics
3. Access to your Loom fleet instances (AWS EC2, Kubernetes, SSH, etc.)

## Installation

1. Copy the script and config file:
```bash
cp loom-caching-rollout.sh /usr/local/bin/
chmod +x /usr/local/bin/loom-caching-rollout.sh
cp loom-caching-rollout.conf.example /etc/loom-caching-rollout.conf
```

2. Edit the configuration file:
```bash
nano /etc/loom-caching-rollout.conf
```

## Usage

### Quick Rollout
```bash
# Set environment variables or use config file
export CLOUDFLARE_ZONE_ID="your-zone-id"
export CLOUDFLARE_API_TOKEN="your-api-token"

# Run full rollout (25% canary + full rollout)
loom-caching-rollout.sh rollout
```

### Check Status
```bash
loom-caching-rollout.sh status
```

### Manual Rollback
```bash
loom-caching-rollout.sh rollback
```

### Command Line Options
```bash
Usage: loom-caching-rollout.sh [OPTIONS] [rollout|rollback|status]

Options:
  -h, --help          Show this help message
  -v, --verbose       Enable verbose logging
  -c, --config FILE   Path to configuration file (default: /etc/loom-caching-rollout.conf)

Actions:
  rollout             Perform full 25% canary + 100% rollout
  rollback            Roll back all fleet instances
  status              Show current rollout status
```

## Configuration Options

| Parameter | Description | Default |
|---|---|---|
| CLOUDFLARE_ZONE_ID | Cloudflare zone ID for metrics | Required |
| CLOUDFLARE_API_TOKEN | Cloudflare API token with read access | Required |
| LOOM_FLEET_TAG | Fleet tag/filter for instance discovery | "loom-fleet" |
| ROLLOUT_PERCENT | Canary deployment percentage | 25 |
| HEALTH_CHECK_ERROR_THRESHOLD | Max allowed error rate (%) | 5 |
| HEALTH_CHECK_LATENCY_THRESHOLD | Max allowed latency (ms) | 1000 |
| MONITORING_DURATION | Total monitoring time (seconds) | 300 |
| MONITORING_INTERVAL | Health check interval (seconds) | 60 |

## Fleet Discovery Customization

Edit the `get_fleet_instances()` function to match your infrastructure:

### AWS EC2 Example
```bash
function get_fleet_instances() {
  aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=$LOOM_FLEET_TAG" \
    "Name=instance-state-name,Values=running" \
    --query "Reservations[].Instances[].InstanceId" \
    --output text
}
```

### Kubernetes Example
```bash
function get_fleet_instances() {
  kubectl get nodes -l "app=$LOOM_FLEET_TAG" \
    -o jsonpath='{.items[*].metadata.name}'
}
```

### SSH Direct Example
```bash
function get_fleet_instances() {
  echo "server1.example.com server2.example.com server3.example.com"
}
```

## Deployment Customization

Edit the `deploy_to_instance()` and `rollback_instance()` functions to match your deployment workflow:

### AWS SSM Example
```bash
function deploy_to_instance() {
  local instance="$1"
  aws ssm send-command \
    --instance-ids "$instance" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=['systemctl enable --now loom-caching']"
}

function rollback_instance() {
  local instance="$1"
  aws ssm send-command \
    --instance-ids "$instance" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=['systemctl disable --now loom-caching']"
}
```

## Monitoring & Logs

Logs are written to `/var/log/loom-caching-rollout.log` by default.

### systemd Service Example

Create `/etc/systemd/system/loom-caching-rollout.service`:
```ini
[Unit]
Description=Loom Caching Fleet Rollout
Documentation=https://example.com/loom-docs
After=network.target

[Service]
Type=oneshot
Environment="CLOUDFLARE_ZONE_ID=your-zone-id"
Environment="CLOUDFLARE_API_TOKEN=your-api-token"
ExecStart=/usr/local/bin/loom-caching-rollout.sh rollout
User=root

[Install]
WantedBy=multi-user.target
```

## Safety Guards
- The script uses file locking to prevent multiple concurrent runs
- Automatic rollback triggers if error rate exceeds threshold
- Automatic rollback triggers if latency exceeds threshold
- All operations are logged with timestamps

## Version History
- v1.0.0: Initial production release with canary rollout, Cloudflare metrics, and auto-rollback