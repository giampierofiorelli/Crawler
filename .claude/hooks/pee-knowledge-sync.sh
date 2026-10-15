#!/usr/bin/env bash
# Stop and SessionEnd: never leave knowledge-store changes only in the ephemeral container. If the live store's content
# differs from the snapshot in the private repository giampierofiorelli/pee-knowledge (or a snapshot commit is
# unpushed), save, commit and push it. On Stop, a failure exits 2 so Claude must deal with it before finishing.
input=$(cat)
event=$(printf '%s' "$input" | jq -r '.hook_event_name // empty' 2>/dev/null)
active=$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)
ENGINE="${CLAUDE_PROJECT_DIR:-/home/user/Crawler}/engine/product-evidence-engine-v5.67-phase243"
LIVE="${PEE_KNOWLEDGE_DIR:-$HOME/.local/share/product-evidence-engine/knowledge}/pee246.sqlite"
[ -f "$LIVE" ] || exit 0
# sync needs the compiled store module for saving.
[ -f "$ENGINE/dist/src/phase246_knowledge_store.js" ] || (cd "$ENGINE" && timeout 200 npx tsc -p tsconfig.json >/dev/null 2>&1)
R=$(cd "$ENGINE" && timeout 220 node --no-warnings scripts/knowledge-snapshot.mjs sync 2>&1)
code=$?
case "$R" in *'"pushed"'*) echo "PEE knowledge store auto-synced to pee-knowledge: $R" ;; esac
if [ $code -ne 0 ]; then
  echo "PEE knowledge store NOT synced to giampierofiorelli/pee-knowledge: $R" >&2
  # Block Stop once so the failure is handled; do not loop, and SessionEnd cannot block.
  if [ "$event" = "Stop" ] && [ "$active" != "true" ]; then exit 2; fi
fi
exit 0
