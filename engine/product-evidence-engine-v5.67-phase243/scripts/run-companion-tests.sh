#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# 36 Phase87 + 20 Phase89 watch + 4 scope hardening regression (or current suite totals).
python3 -m unittest discover -s tests -p 'test_phase*.py' -v
# Phase88 11 + Phase89 5 isolated/bridge simulations.
node --experimental-strip-types --test \
  tests/phase88_adapter.test.mts tests/phase88_e2e.test.mts tests/phase89_watch.test.mts
