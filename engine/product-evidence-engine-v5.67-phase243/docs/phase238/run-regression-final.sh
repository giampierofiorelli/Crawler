#!/bin/bash
set -euo pipefail
cd /mnt/data/phase238work
mkdir -p docs/phase238/test-logs-final
: > docs/phase238/PHASE238-REGRESSION-FINAL.log
for i in $(seq 1 16); do
 if timeout 105s node scripts/run-test-shards.mjs "$i" >"docs/phase238/test-logs-final/shard-$i.log" 2>&1; then
   tail -n 2 "docs/phase238/test-logs-final/shard-$i.log" >>docs/phase238/PHASE238-REGRESSION-FINAL.log
 else
   echo "FAILED shard $i (error or timeout)" >>docs/phase238/PHASE238-REGRESSION-FINAL.log
   tail -n 75 "docs/phase238/test-logs-final/shard-$i.log" >> docs/phase238/PHASE238-REGRESSION-FINAL.log
   exit 3
 fi
done
echo 'ALL16_SUCCESS' >>docs/phase238/PHASE238-REGRESSION-FINAL.log
