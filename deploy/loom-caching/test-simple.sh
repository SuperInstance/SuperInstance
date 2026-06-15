#!/bin/bash
set -euo pipefail

# Simple test for the loom rollout script
TEST_DIR="$(mktemp -d)"
trap "rm -rf $TEST_DIR" EXIT

cp loom-caching-rollout.sh "$TEST_DIR/"
cd "$TEST_DIR"

# Use a test config file
cat > test.conf << 'EOF'
CLOUDFLARE_ZONE_ID="test-zone"
CLOUDFLARE_API_TOKEN="test-token"
LOG_FILE="$TEST_DIR/rollout.log"
ROLLOUT_PERCENT=25
HEALTH_CHECK_ERROR_THRESHOLD=10
EOF

# Override fleet discovery to return test instances
sed -i 's/function get_fleet_instances() {/function get_fleet_instances() { echo "instance-1 instance-2 instance-3 instance-4 instance-5 instance-6 instance-7 instance-8 instance-9 instance-10";/' loom-caching-rollout.sh

# Mock curl to return fake metrics
sed -i 's/curl -s -w/%curlmock -s -w/' loom-caching-rollout.sh

echo '#!/bin/bash' > curlmock
cat >> curlmock << 'EOF'
if [[ "$*" == *"graphql"* ]]; then
  echo '{"data": {"viewer": {"zones": [{"httpRequests1mGroups": [{"sum": {"browserPageViews": 10000, "status4xx": 100, "status5xx": 50}, "avg": {"responseTime": 800}}]}]}, "success": true}}'
else
  command curl "$@"
fi
EOF
chmod +x curlmock

PATH="$TEST_DIR:$PATH"

# Test help
./loom-caching-rollout.sh --help

# Test status
./loom-caching-rollout.sh --config test.conf status

# Test dry run rollout
echo "=== Testing canary calculation ==="
./loom-caching-rollout.sh --config test.conf -v status 2>&1 | grep "Canary subset: 3 instances"

echo "=== All simple tests passed! ==="
cd -