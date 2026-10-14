#!/bin/bash
set -euo pipefail
cd /mnt/data/phase238work
mkdir -p docs/phase238/test-logs
: >docs/phase238/PHASE238-REGRESSION-STREAM.log
for i in $(seq 1 16); do
 if node scripts/run-test-shards.mjs "$i" >"docs/phase238/test-logs/shard-$i.log" 2>&1; then
  grep -E '^Shard [0-9]+: .*passed' "docs/phase238/test-logs/shard-$i.log" >> docs/phase238/PHASE238-REGRESSION-STREAM.log
 else
  echo "FAILED shard $i" >> docs/phase238/PHASE238-REGRESSION-STREAM.log
  tail -60 "docs/phase238/test-logs/shard-$i.log" >> docs/phase238/PHASE238-REGRESSION-STREAM.log
  exit 2
 fi
done
echo ALL16_SUCCESS >> docs/phase238/PHASE238-REGRESSION-STREAM.log
