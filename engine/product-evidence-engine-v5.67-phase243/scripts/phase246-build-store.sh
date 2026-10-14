#!/usr/bin/env bash
# Rebuilds the Phase246 knowledge store from recorded inputs (no network). Raw page bytes are read only from
# operator directories and only when their SHA-256 matches the recorded receipts.
# Usage: RAW_RECOVERED=dir1,dir2 WAVE_STATE=state.json WAVE_RAW=dir [PEE_KNOWLEDGE_DIR=...] scripts/phase246-build-store.sh
set -euo pipefail
cd "$(dirname "$0")/.."
K="node --no-warnings scripts/phase246-knowledge.mjs"
$K ingest-recovered --raw "$RAW_RECOVERED" >/dev/null
for c in air_fryers coffee_machines toasters; do $K seed --category $c >/dev/null; done
OBS=$(mktemp -d "${WAVE_RAW%/}/../obs.XXXX")/observations.json
node --no-warnings scripts/phase246-live-wave.mjs observations --state "$WAVE_STATE" --raw "$WAVE_RAW" --out "$OBS" >/dev/null
$K ingest-observations --file "$OBS" >/dev/null
$K add-method-refs --file evaluation/phase246/method-references.json >/dev/null
for c in air_fryers coffee_machines toasters; do $K profile --category $c --commit "phase246 wave 1" >/dev/null; done
$K status
