#!/bin/bash
set -euo pipefail

# Test script for Loom caching rollout
TEST_DIR="$(mktemp -d)"
trap "rm -rf $TEST_DIR" EXIT

# Copy script to test directory
cp loom-caching-rollout.sh "$TEST_DIR/"
cp loom-caching-rollout.conf.example "$TEST_DIR/loom-caching-rollout.conf"

# Update log file path in test script to use temp dir
sed -i 's|LOG_FILE="/var/log/loom-caching-rollout.log"|LOG_FILE="$TEST_DIR/loom-caching-rollout.log"|' "$TEST_DIR/loom-caching-rollout.sh"

cd "$TEST_DIR"

# Test 1: Help menu
./loom-caching-rollout.sh --help

# Test 2: Config parsing
cat > test-config.conf << 'EOF'
CLOUDFLARE_ZONE_ID="test-zone-id"
CLOUDFLARE_API_TOKEN="test-api-token"
ROLLOUT_PERCENT=10
HEALTH_CHECK_ERROR_THRESHOLD=3
EOF

./loom-caching-rollout.sh --config test-config.conf --help

# Test 3: Dry run of fleet discovery
sed -i 's/function get_fleet_instances() {/function get_fleet_instances() { echo "test-instance-1 test-instance-2 test-instance-3 test-instance-4 test-instance-5";/' loom-caching-rollout.sh
echo "=== Test Fleet Discovery ==="
./loom-caching-rollout.sh --config test-config.conf status

# Test 4: Mock Cloudflare metrics test
cat > mock-cloudflare-api << 'EOF'
#!/bin/bash
if [[ "$1" == *"browserPageViews"* ]]; then
  echo '{"data": {"viewer": {"zones": [{"httpRequests1mGroups": [{"sum": {"browserPageViews": 10000, "status4xx": 100, "status5xx": 50}, "avg": {"responseTime": 800}}]}]}, "success": true}}'
else
  echo '{"data": {"viewer": {"zones": [{"httpRequests1mGroups": [{"sum": {"browserPageViews": 10000, "status4xx": 1000, "status5xx": 50}, "avg": {"responseTime": 800}}]}]}, "success": true}}'
fi
EOF
chmod +x mock-cloudflare-api

# Override curl to use mock API
PATH="$TEST_DIR:$PATH" curl() {
  if [[ "$1" == "-X" && "$2" == "POST" && "$3" == *"graphql"* ]]; then
    shift 3
    ./mock-cloudflare-api "$@"
  else
    command curl "$@"
  fi
}

export -f curl

echo "=== Test Metrics Calculation (Normal Load) ==="
./loom-caching-rollout.sh --config test-config.conf status

echo "=== Test Metrics Calculation (High Error Rate) ==="
cat > mock-cloudflare-api << 'EOF'
#!/bin/bash
echo '{"data": {"viewer": {"zones": [{"httpRequests1mGroups": [{"sum": {"browserPageViews": 10000, "status4xx": 1000, "status5xx": 50}, "avg": {"responseTime": 800}}]}]}, "success": true}}'
EOF
chmod +x mock-cloudflare-api

set +e
./loom-caching-rollout.sh --config loom-caching-rollout.conf status
exit_code=$?
set -e

if [[ "$exit_code" -eq 0 ]]; then
  echo "ERROR: Should have failed with high error rate"
  exit 1
else
  echo "✓ Correctly failed on high error rate"
fi

echo "=== All tests passed! ==="
cd -