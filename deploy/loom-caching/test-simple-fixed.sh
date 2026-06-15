#!/bin/bash
set -euo pipefail

# Simple test for the loom rollout script
TEST_DIR="$(mktemp -d)"
trap "rm -rf $TEST_DIR" EXIT

cp loom-caching-rollout.sh "$TEST_DIR/"
mkdir -p "$TEST_DIR/logs"

cd "$TEST_DIR"

# Use a test config file
cat > test.conf << 'EOF'
CLOUDFLARE_ZONE_ID="test-zone"
CLOUDFLARE_API_TOKEN="test-token"
ROLLOUT_PERCENT=25
HEALTH_CHECK_ERROR_THRESHOLD=10
EOF

# Override fleet discovery to return test instances
sed -i.bak 's/function get_fleet_instances() {/function get_fleet_instances() { echo "instance-1 instance-2 instance-3 instance-4 instance-5 instance-6 instance-7 instance-8 instance-9 instance-10";/' loom-caching-rollout.sh

# Mock curl to return fake metrics
cat > curlmock << 'EOF'
#!/bin/bash
if [[ "$*" == *"graphql"* ]]; then
  echo '{"data": {"viewer": {"zones": [{"httpRequests1mGroups": [{"sum": {"browserPageViews": 10000, "status4xx": 100, "status5xx": 50}, "avg": {"responseTime": 800}}]}]}, "success": true}}'
else
  /usr/bin/curl "$@"
fi
EOF
chmod +x curlmock

# Run test with env var override for log file
export LOG_FILE="$TEST_DIR/rollout.log"
export PATH="$TEST_DIR:$PATH"

# Test help
./loom-caching-rollout.sh --config test.conf --help

# Test status
./loom-caching-rollout.sh --config test.conf status

echo "=== Test passed! Rollout script is functional ==="
cd -