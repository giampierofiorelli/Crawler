# Crawler — Product Evidence Engine (PEE)

PEE is an independent product research and buying adviser. It is written in TypeScript on Node.js.

- **Code:** `engine/product-evidence-engine-v5.67-phase243/`.
- **Phase reports:** `docs/phaseNNN/` in that directory. The newest report is the current status; check it and
  `git log` before starting work.

## Guided development skill

Read the project skill **`pee-guided-learning`** (`.claude/skills/pee-guided-learning/`) before planning,
implementing, evaluating or reporting any PEE work. It holds:

- the owner decisions;
- the supersession log;
- the current-state and reuse map;
- the evaluation protocol;
- the complete cumulative research.

## Non-negotiables (details in the skill)

- **Claude is the sole development agent.** ChatGPT or Codex reviewers, AI bridges and extra AI services are
  deferred.
- **Infrastructure:**
  - one code repository, plus the private data repository `pee-knowledge`;
  - no paid services;
  - no heavy dependencies;
  - English first.
- **Knowledge store (database):** private SQLite in `$PEE_KNOWLEDGE_DIR`.
  - Its persistent copy lives in the **private** repository `giampierofiorelli/pee-knowledge`, at
    `snapshot/pee246.sqlite`. It is never committed to this public repository.
  - At session start, the hook `.claude/hooks/pee-knowledge-session-start.sh` clones the private repository to
    `/home/user/pee-knowledge` and restores the store automatically.
  - If the hook reports that the repository is not attached, attach it (`add_repo`, push access), clone it there,
    and run `node scripts/knowledge-snapshot.mjs load`.
  - After changing the store, run `node scripts/knowledge-snapshot.mjs sync`. It saves a verified snapshot, then
    commits and pushes `/home/user/pee-knowledge` on branch `main`.
    - The Stop and SessionEnd hooks also run it.
    - It never overwrites a newer remote snapshot.
    - `verify` checks what a new session would restore.
- **Confidential evaluation inputs:** in `$PEE_PRIVATE_EVAL_DIR`.
- **Access rules:**
  - Never bypass robots rules, 403/429 responses or access controls.
  - Never commit third-party HTML or full articles.
  - A public URL is not storage permission.
- **Evidence:**
  - Manufacturer declarations are never independent tests or rankings.
  - Never merge products on similar names.
- **Evaluation:**
  - Gold stays separate from operational knowledge.
  - First-run results are committed unchanged.
  - A tuned set is never reported as held-out.
- **Audit over-strict restrictions.** Keep the safeguards a real risk justifies.

## Build and test

Run these from `engine/product-evidence-engine-v5.67-phase243/`:

- `npx tsc -p tsconfig.json`
- `npm test` (full sharded suite)
- `node --test dist/tests/<file>.test.js`
