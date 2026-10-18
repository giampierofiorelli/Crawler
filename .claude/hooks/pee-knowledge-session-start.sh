#!/usr/bin/env bash
# SessionStart: make the PEE knowledge store available. The store lives in the PRIVATE repository
# giampierofiorelli/pee-knowledge (never in public Crawler). Output is shown to Claude as session context.
# Never fails the session: every step is best-effort and the result is reported.
K=/home/user/pee-knowledge
ENGINE="${CLAUDE_PROJECT_DIR:-/home/user/Crawler}/engine/product-evidence-engine-v5.67-phase243"
# Principle 9: every push runs the publication guard (.githooks/pre-push).
git -C "${CLAUDE_PROJECT_DIR:-/home/user/Crawler}" config core.hooksPath .githooks >/dev/null 2>&1 || true
if [ -d "$K/.git" ]; then
  timeout 60 git -C "$K" pull -q --ff-only origin main >/dev/null 2>&1 || true
else
  timeout 120 git clone -q --depth 1 https://github.com/giampierofiorelli/pee-knowledge "$K" >/dev/null 2>&1 || rm -rf "$K"
fi
if [ -f "$K/snapshot/pee246.sqlite" ]; then
  R=$(cd "$ENGINE" && timeout 60 node scripts/knowledge-snapshot.mjs load 2>&1 | tail -1)
  echo "PEE knowledge store: $R"
  echo "Snapshot source: private repo giampierofiorelli/pee-knowledge at $K. After changing the store: node scripts/knowledge-snapshot.mjs save, then commit and push $K (branch main)."
else
  echo "PEE knowledge store NOT loaded: the private repository giampierofiorelli/pee-knowledge is not attached to this session."
  echo "If the task needs the store: attach giampierofiorelli/pee-knowledge (add_repo, push access), clone it to $K, then run 'node scripts/knowledge-snapshot.mjs load' from $ENGINE."
fi
R="${CLAUDE_PROJECT_DIR:-/home/user/Crawler}/.claude/skills/pee-guided-learning/references/roadmap.md"
if [ -f "$R" ]; then
  echo "PEE ROADMAP (owner request 2026-10-18): $(grep -m1 '^\*\*Current step:' "$R" | sed 's/\*\*//g')"
  echo "Before any PEE work: name the roadmap step it serves and answer the anti-drift checklist (roadmap.md section 4). Work outside the current step needs an owner decision."
fi
exit 0
