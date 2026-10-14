#!/bin/bash
set -e
cd "$(cd "$(dirname "$0")/../.." && pwd)"
mkdir -p docs/phase237/test-logs
: > docs/phase237/PHASE237-REGRESSION-STREAM.log
for i in $(seq 1 16); do
  echo "START shard $i" >> docs/phase237/PHASE237-REGRESSION-STREAM.log
  if node scripts/run-test-shards.mjs "$i" > "docs/phase237/test-logs/shard-$i.log" 2>&1; then
    tail -2 "docs/phase237/test-logs/shard-$i.log" >> docs/phase237/PHASE237-REGRESSION-STREAM.log
  else
    echo "FAILED shard $i" >> docs/phase237/PHASE237-REGRESSION-STREAM.log
    tail -50 "docs/phase237/test-logs/shard-$i.log" >> docs/phase237/PHASE237-REGRESSION-STREAM.log
    exit 1
  fi
done
echo ALL16_SUCCESS >> docs/phase237/PHASE237-REGRESSION-STREAM.log
