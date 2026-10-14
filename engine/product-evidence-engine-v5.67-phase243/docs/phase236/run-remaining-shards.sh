#!/usr/bin/env bash
set -u
cd /mnt/data/phase236work
: > docs/phase236/PHASE236-REMAINING-SHARDS.txt
for n in $(seq 14 -1 1); do
  timeout 155s node scripts/run-test-shards.mjs "$n" >"docs/phase236/test-logs/shard${n}.log" 2>&1
  rc=$?
  echo "shard=$n exit=$rc $(tail -n 1 "docs/phase236/test-logs/shard${n}.log")" >> docs/phase236/PHASE236-REMAINING-SHARDS.txt
  if [[ "$rc" -ne 0 ]]; then exit "$rc"; fi
done
