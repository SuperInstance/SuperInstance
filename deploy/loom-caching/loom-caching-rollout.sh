#!/bin/bash
set -euo pipefail

# Loom Caching Fleet Rollout Script
# Version: 1.0.0
# Production-grade rollout with 25% canary, auto-rollback, and Cloudflare metric sync

# Configuration
VERSION="1.0.0"
LOG_FILE="${LOG_FILE:-./loom-caching-rollout.log}"
LOCK_FILE="${LOCK_FILE:-./loom-caching-rollout.lock}"
CONFIG_FILE="/etc/loom-caching-rollout.conf"

# Default values (can be overridden by config file or environment variables)
CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
LOOM_FLEET_TAG="${LOOM_FLEET_TAG:-loom-fleet}"
ROLLOUT_PERCENT=25
HEALTH_CHECK_ERROR_THRESHOLD=5  # Percentage of errors that triggers rollback
HEALTH_CHECK_LATENCY_THRESHOLD=1000  # Maximum acceptable latency (ms)
MONITORING_DURATION=300  # Duration to monitor canary (seconds)
MONITORING_INTERVAL=60  # Interval between health checks (seconds)
VERBOSE=false

# --------------------------
# Helper Functions
# --------------------------

function log() {
  local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
  if [[ "$VERBOSE" == "true" ]]; then
    echo "[$timestamp] $*" | tee -a "$LOG_FILE"
  else
    echo "[$timestamp] $*" >> "$LOG_FILE"
  fi
}

function error_exit() {
  log "ERROR: $*"
  exit 1
}

function check_requirements() {
  log "Checking required tools..."
  if ! command -v curl &> /dev/null; then
    error_exit "curl is required but not installed."
  fi
  if ! command -v jq &> /dev/null; then
    error_exit "jq is required but not installed."
  fi
  if [[ -z "$CLOUDFLARE_ZONE_ID" || -z "$CLOUDFLARE_API_TOKEN" ]]; then
    error_exit "CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN must be set via config or environment variables."
  fi
}

function acquire_lock() {
  if ! ln -s "$(basename "$0")" "$LOCK_FILE" 2>/dev/null; then
    error_exit "Another instance is running. Lock file: $LOCK_FILE"
  fi
}

function release_lock() {
  rm -f "$LOCK_FILE"
}

# --------------------------
# Cloudflare Metric Functions
# --------------------------

function get_cloudflare_metrics() {
  local start_time="$1"
  local end_time="$2"
  
  # Build proper GraphQL query
  local graphql_query="{
\"viewer\": {
\"zones\": [{
\"zoneTag\": \"$CLOUDFLARE_ZONE_ID\"
}],
\"httpRequests1mGroups\": {
\"limit\": 1,
\"filter\": {
\"date_geq\": \"$start_time\",
\"date_lt\": \"$end_time\"
},
\"dimensions\": [\"datetime\"],
\"sum\": [\"browserPageViews\", \"status2xx\", \"status3xx\", \"status4xx\", \"status5xx\"],
\"avg\": [\"responseTime\"]
}
}
}"

  # Create JSON payload
  local payload=$(printf '{"query": %s}' "$(jq -R . <<< "$graphql_query" | tr -d '\n')")

  local response_file=$(mktemp)
  local http_code=$(curl -s -w "%{http_code}" -o "$response_file" -X POST "https://api.cloudflare.com/client/v4/graphql" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "$payload")

  if [[ "$http_code" -ne 200 ]]; then
    local error_msg=$(cat "$response_file")
    log "Cloudflare API request failed with code $http_code: $error_msg"
    rm -f "$response_file"
    return 1
  fi

  local success=$(jq -r '.success' "$response_file")
  if [[ "$success" != "true" ]]; then
    local errors=$(jq -r '.errors[].message' "$response_file" | paste -sd "," -)
    log "Cloudflare API query failed: $errors"
    rm -f "$response_file"
    return 1
  fi

  local total_requests=$(jq '.data.viewer.zones[0].httpRequests1mGroups[0].sum.browserPageViews // 0' "$response_file")
  local status4xx=$(jq '.data.viewer.zones[0].httpRequests1mGroups[0].sum.status4xx // 0' "$response_file")
  local status5xx=$(jq '.data.viewer.zones[0].httpRequests1mGroups[0].sum.status5xx // 0' "$response_file")
  local errors=$((status4xx + status5xx))
  local error_rate=$(awk -v e="$errors" -v t="$total_requests" 'BEGIN { printf "%.2f", (e > 0 && t > 0) ? (e / t) * 100 : 0 }')
  local latency=$(jq '.data.viewer.zones[0].httpRequests1mGroups[0].avg.responseTime // 0' "$response_file")

  rm -f "$response_file"
  echo "$error_rate $latency"
}

# --------------------------
# Fleet Management Functions
# --------------------------

function get_fleet_instances() {
  # Replace with your actual fleet instance discovery logic
  # Example for AWS EC2:
  # aws ec2 describe-instances --filters "Name=tag:Name,Values=$LOOM_FLEET_TAG" "Name=instance-state-name,Values=running" --query "Reservations[].Instances[].InstanceId" --output text
  # Example for Kubernetes:
  # kubectl get nodes -l "$LOOM_FLEET_TAG" -o jsonpath='{.items[*].metadata.name}'
  echo "i-1234567890abcdef0 i-1234567890abcdef1 i-1234567890abcdef2 i-1234567890abcdef3 i-1234567890abcdef4"  # Dummy instances
}

function deploy_to_instance() {
  local instance="$1"
  log "Deploying caching configuration to instance: $instance"
  # Replace with your actual deployment logic:
  # - SSH + remote command
  # - AWS SSM Run Command
  # - Kubernetes rollout
  # Example:
  # aws ssm send-command --instance-ids "$instance" --document-name "AWS-RunShellScript" --parameters "commands=['systemctl enable --now loom-caching']"
  sleep 2  # Simulate deployment delay
}

function rollback_instance() {
  local instance="$1"
  log "Rolling back instance: $instance"
  # Replace with your actual rollback logic:
  # aws ssm send-command --instance-ids "$instance" --document-name "AWS-RunShellScript" --parameters "commands=['systemctl disable --now loom-caching']"
  sleep 1  # Simulate rollback delay
}

# --------------------------
# Rollout Logic
# --------------------------

function run_canary_rollout() {
  local all_instances=($(get_fleet_instances))
  local total_instances=${#all_instances[@]}
  
  if [[ "$total_instances" -eq 0 ]]; then
    error_exit "No running instances found for fleet tag: $LOOM_FLEET_TAG"
  fi

 local canary_count=$(( (total_instances * ROLLOUT_PERCENT) / 100 ))
  
  if [[ "$canary_count" -eq 0 && "$total_instances" -gt 0 ]]; then
    canary_count=1
  fi

  local canary_instances=(${all_instances[@]:0:$canary_count})
  log "Selected $canary_count canary instances out of $total_instances total: ${canary_instances[*]}"

  # Deploy to canary instances
  log "Starting canary deployment..."
  for instance in "${canary_instances[@]}"; do
    deploy_to_instance "$instance"
  done

  # Monitor canary health
  log "Monitoring canary deployment for $MONITORING_DURATION seconds..."
  local monitoring_start=$(date +%s)
  local healthy=true

  while [[ $(date +%s) -lt $((monitoring_start + MONITORING_DURATION)) ]]; do
    sleep "$MONITORING_INTERVAL"
    local current_end=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local current_start=$(date -u +"%Y-%m-%dT%H:%M:%SZ" -d "-$MONITORING_INTERVAL seconds")
    
    local metrics=($(get_cloudflare_metrics "$current_start" "$current_end" || echo "0 0"))
    local error_rate=${metrics[0]}
    local latency=${metrics[1]}

    log "Current metrics - Error Rate: ${error_rate}%, Latency: ${latency}ms"

    # Check error rate threshold
    if (( $(echo "$error_rate > $HEALTH_CHECK_ERROR_THRESHOLD" | bc -l) )); then
      log "ALERT: Error rate ${error_rate}% exceeds threshold of ${HEALTH_CHECK_ERROR_THRESHOLD}%"
      healthy=false
      break
    fi

    # Check latency threshold
    if (( latency > HEALTH_CHECK_LATENCY_THRESHOLD )); then
      log "ALERT: Latency ${latency}ms exceeds threshold of ${HEALTH_CHECK_LATENCY_THRESHOLD}ms"
      healthy=false
      break
    fi
  done

  if ! "$healthy"; then
    log "Canary deployment failed. Initiating rollback..."
    for instance in "${canary_instances[@]}"; do
      rollback_instance "$instance"
    done
    error_exit "Rollout aborted due to health check failures"
  fi

  log "Canary deployment successful!"
  echo "${canary_instances[*]}"
}

function run_full_rollout() {
  local canary_instances=($1)
  local all_instances=($(get_fleet_instances))
  local remaining_instances=($(comm -23 <(printf "%s\n" "${all_instances[@]}" | sort) <(printf "%s\n" "${canary_instances[@]}" | sort)))

  log "Rolling out to remaining ${#remaining_instances[@]} instances..."
  for instance in "${remaining_instances[@]}"; do
    deploy_to_instance "$instance"
  done

  log "Full rollout completed successfully!"
}

function run_rollback() {
  local all_instances=($(get_fleet_instances))
  log "Initiating full rollback of ${#all_instances[@]} instances..."
  for instance in "${all_instances[@]}"; do
    rollback_instance "$instance"
  done
  log "Full rollback completed!"
}

function show_status() {
  log "=== Loom Caching Rollout Status ==="
  local all_instances=($(get_fleet_instances))
  local total=${#all_instances[@]}
  log "Total fleet instances: $total"

  local canary_count=$(( (total * ROLLOUT_PERCENT) / 100 ))
  canary_count=$((canary_count == 0 && total > 0 ? 1 : canary_count))
  log "Canary subset: $canary_count instances"

  # Get recent Cloudflare metrics
  local end_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local start_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ" -d "-5 minutes")
  local metrics=($(get_cloudflare_metrics "$start_time" "$end_time" || echo "0 0"))
  log "Last 5min metrics - Error Rate: ${metrics[0]}%, Latency: ${metrics[1]}ms"
}

# --------------------------
# Main Execution
# --------------------------

function main() {
  acquire_lock
  trap release_lock EXIT

  # Load configuration file
  if [[ -f "$CONFIG_FILE" ]]; then
    source "$CONFIG_FILE"
    log "Loaded configuration from $CONFIG_FILE"
  fi

  # Parse command-line arguments
  local action="${1:-rollout}"

  case "$action" in
    -h|--help)
      echo "Loom Caching Fleet Rollout Script v$VERSION"
      echo "Usage: $0 [OPTIONS] [rollout|rollback|status]"
      echo ""
      echo "Options:"
      echo "  -h, --help          Show this help message"
      echo "  -v, --verbose       Enable verbose logging"
      echo "  -c, --config FILE   Path to configuration file (default: /etc/loom-caching-rollout.conf)"
      echo ""
      echo "Actions:"
      echo "  rollout             Perform full 25% canary + 100% rollout"
      echo "  rollback            Roll back all fleet instances"
      echo "  status              Show current rollout status"
      exit 0
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      action="${1:-rollout}"
      ;;
    -c|--config)
      CONFIG_FILE="$2"
      shift 2
      action="${1:-rollout}"
      ;;
  esac

  check_requirements

  case "$action" in
    rollout)
      log "Starting full rollout process..."
      local canary_results="$(run_canary_rollout)"
      run_full_rollout "$canary_results"
      log "Rollout completed successfully!"
      ;;
    rollback)
      run_rollback
      ;;
    status)
      show_status
      ;;
    *)
      error_exit "Unknown action: $action. Use 'rollout', 'rollback', or 'status'."
      ;;
  esac
}

# Run main with provided arguments
main "$@"