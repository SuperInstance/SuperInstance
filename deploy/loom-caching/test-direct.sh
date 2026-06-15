#!/bin/bash
set -euo pipefail
echo "Testing script syntax..."
bash -n loom-caching-rollout.sh
echo "✓ Syntax check passed"

echo "Testing help output..."
./loom-caching-rollout.sh --help > /dev/null 2>&1
echo "✓ Help works"