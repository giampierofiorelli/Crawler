# PEE state at skill installation, reuse map and commands

**Snapshot date:** 2026-10-15.

**Phase249 status:** complete and pushed. Final HEAD `2580112` on `claude/typescript-network-transport-test-1givnd`.

**How to use this file.**

- It is date-bound. Before relying on it, check `git log` and the newest `docs/phaseNNN/` report. A later phase
  supersedes these numbers.
- Every figure below comes from committed Phase249 files, chiefly
  `engine/product-evidence-engine-v5.67-phase243/docs/phase249/PHASE249-TECHNICAL-REPORT.md`.

## 0. Phase250 update (2026-10-15) — read this first

**Phase250 is complete and pushed.** It supersedes the Phase249 figures below where they differ. Report:
`engine/product-evidence-engine-v5.67-phase243/docs/phase250/PHASE250-TECHNICAL-REPORT.md`.

**Persistence**
- The snapshot is written **only** into the private `giampierofiorelli/pee-knowledge`. `save` and `sync` refuse the
  public repository or a foreign origin.
- `sync` compares content and refuses to overwrite a newer remote snapshot.
- `verify` checks `origin/main` exactly as a new session restores it.
- The Stop and SessionEnd hooks run `sync`.
- The snapshot after Phase250 is `d704bd8`: 100 category items, 2,385 declarations.

**Needs and categories**

Real request set 3: 73 Stack Exchange questions, T2, Claude-authored gold.

First run:

| Arm | Needs found (of 24) | Need precision | Wrong category attributions (of 73) |
|---|---|---|---|
| Phase249 journey (A) | 0 | — | 15 |
| Generic repairs only (R) | 0 | — | 13 |
| Fixed curriculum (B) | 8 | 0.471 | 12 |
| Adaptive lessons (C) | 7 | 0.438 | 12 |

- Budgets: 71/73 for A, 73/73 with the repairs.
- Adopted configuration `ADOPTED_LESSONS250`: C plus B without manual brewers, plus development fixes.
  - On spent set 3 (development only): 10/24 needs, precision 0.667, 4 wrong attributions.
  - It has **no** first run yet.

**Category knowledge.** Four kinds, counted separately:
- observed attributes: 196;
- hypothesis items: 48 → 89; need concepts 7 → 43; 11 categories;
- method items: 6 → 10;
- **independently supported relations: 0**.

**Do retained declarations feed category knowledge?** No: 0 items or relations cite them. 1,020 of 2,385 sit on
uncategorised products. They feed **factual requirement checks**: a recognised need becomes `factualRequirements`,
then `decideAdvice249`.

**Evaluation sets.** Real request **set 3 is now spent**. The next measurement needs a new untouched set 4.

**Stack Exchange access.** The sites' robots.txt now disallows all crawlers (`Content-signal: search=no, ai-train=no`).
Use only `api.stackexchange.com`. Run Node with `NODE_USE_ENV_PROXY=1`: built-in `fetch` otherwise bypasses the
container proxy and gets a 403 that is not Stack Exchange's.

**New modules and scripts**
- `src/phase250_category_lessons.ts` (`CURRICULUM_B250`, `ADAPTIVE_C250`, `ADOPTED_LESSONS250`, `applyLessons250`,
  `registryWithLessons250`, `NEED_CRITERIA250`).
- `CATEGORY_REGISTRY250` in `phase248_category_registry.ts`.
- `evaluation/phase250/need-catalogue.json`: the shared need label space.
- Scripts:
  - `scripts/phase250-journey-arms.mjs` (arms R/B/C/D on store copies);
  - `phase250-score.mjs`;
  - `phase250-collect-requests.mjs`;
  - `phase250-category-knowledge-audit.mjs`.
- Commands: `phase246-knowledge.mjs apply-lessons`, `knowledge-snapshot.mjs sync|verify`.

**Open problems after Phase250**, ranked:
1. A first run of the adopted configuration on new set 4.
2. Needs outside any curriculum: all-needs recall is about 0.2.
3. No T3 need reference.
4. Categories for the 1,020 uncategorised declarations.
5. A review-semantics probe with contrast pairs on Phase110/113.
6. Independent comparable measurements.

## Contents

1. Verified Phase249 outcome
2. Open problems at installation
3. Reuse map — existing modules by concern
4. Commands
5. Storage and private locations

## 1. Verified Phase249 outcome

The figures below were read from committed files when the skill was installed. They were not re-measured.

### Restrictions audit

- **Over-broad rules corrected:**
  - item-listing exclusion;
  - `tablist` and modal-drawer exclusions;
  - duplicate h1;
  - colon-less lines;
  - label length;
  - the "discontinued" scan;
  - normalisation gaps;
  - the blanket `fact_storage` retention gate;
  - need inference from description overlap.
- **Rules justified and kept:**
  - holding back ambiguous facts (0 recoverable correct facts among those held back);
  - the unnamed-main-product rule;
  - signed rankings.

### Extraction

Untouched first runs:

| Set | Pages / hosts | Version | Sampled recall |
|---|---|---|---|
| Set 1 | 34 / 20 | v5 | 77/118 |
| | | v6 | 77/118 |
| Set 2 | 19 / 11 | v5 | 28/59 |
| | | v6 | 32/59 |
| | | v7 | 33/59 |

- No version produced an identity error or a wrong attribution on any untouched set.
- Set 1 is now **spent**.
- spec-extractor-7's 106/118 on set 1 and 188/190 on the Phase248 set are development results.
- Remaining misses on untouched pages:
  - content rendered client-side;
  - unlabelled prices;
  - products named only in `<title>`.

### Retention

- Policy `pee249-factual-observations-v1`: individual factual declarations, private store only.
- Per-host caps:
  - manufacturers 300;
  - retailers and encyclopaedias 50;
  - other classes 30;
  - test publishers 25, measurements only.
- Reservations are honoured.
- Store contents: 0 → **2,385 retained declarations**, 188 products, 140 revisions, 90 sources.
- Public export still requires `derived_publication`.

### Advisory journey

Real Stack Exchange requests, CC BY-SA. Real set 2 (22 requests), first run, round 3:

| Metric | Value |
|---|---|
| Category | 0.818 |
| Decision | 0.727 |
| Need recall | 0.625 |
| Need precision | 0.625 |
| Unsafe | 0 |

Phase248 on the same set: 0.591 / 0.591 / 0.625 / 0.455.

### Decision layer

`decideAdvice249` produces these outcomes:

- `requirements_shortlist`: a cited, unordered list;
- `requirements_shortlist_performance_unverified`;
- `ranked_recommendation`: only through a valid signed Phase180 release;
- `no_candidate_meets_requirements`;
- `withhold_insufficient_evidence`;
- `clarify`.

Real store examples: air fryers ≥ 5 L shortlist 3 of 4; kettles ≥ 1.5 L shortlist 1 of 2.

### Independent evidence

- GOV.UK OPSS notices: active under `evaluation/phase249/opss-policy-active.json` (valid to 2027-04-15); 35 notices
  persisted. These are safety context, never performance evidence.
- SCA certification: blocked by robots rules aimed at AI crawlers. Use needs SCA's permission, which is an owner
  action.
- Paid publishers (Which?, CHOICE, Stiftung Warentest): not authorised.

### Tests

Full suite: 4,367 tests passed (17 shards).

### Status of the evaluation sets for future work

**Spent (development only).** These sets have informed code changes:

- the Phase248 extraction set;
- Phase249 extraction set 1;
- Phase249 real request set 1;
- the journey dev set.

**Run once, then analysed.** Phase249 extraction set 2 and real request set 2 were each run once as a first run, and
the report then examined their failures. The next change built on those failures must therefore be measured on a
**new** untouched set. Re-running set 2 afterwards counts as development, not held-out.

## 2. Open problems at installation

Ranked from Phase249 §9; check the newest report before choosing.

1. **Need recall (≈ 0.4–0.6) on real requests.**
   - Cause: the concept vocabulary covers only three categories, with a few aliases each.
   - Remedy: more category knowledge. Looser matching raised false positives.
   - Known failures:
     - grinders read as coffee machines;
     - "pressure cooker" read as coffee through "brew pressure";
     - budgets such as "< $500" or "70€ tops" not parsed.
2. **No comparable independent performance evidence for any category.** Rankings stay correctly unavailable.
3. **Category knowledge has not been derived from retained declarations.** Research v9 §11 questions 3–4 remain open:
   do the 2,385 declarations feed category derivation? Before claiming a gain, measure category items split into
   - vocabulary;
   - hypotheses;
   - methods;
   - supported relations.
4. **Extraction misses**: client-side content and title-only product names.
5. **Retention legal points left open:**
   - contract terms without reservations;
   - "lawful use" under s28A;
   - case law not re-verified.
6. **Autonomous improvement.** A degradation monitor and a signed promotion and rollback record are the next pieces.
   They must not be built prematurely (owner decision).

## 3. Reuse map — existing modules by concern

All paths are relative to `engine/product-evidence-engine-v5.67-phase243/`. Extend these modules; do not duplicate
them.

| Concern | Modules (src/) | Notes |
|---|---|---|
| Page reading and spec extraction | `phase245_html_dom.ts`, `phase245_spec_extraction.ts`, `phase245_table_grid.ts`, `phase245_value_normalizer.ts` | spec-extractor-7. Freeze versions with worktrees for first runs. The evaluator resolves the extractor relative to its own path. |
| Fetching under rules | `approved_web_reader.js` (`restrictedHttpsTransport`, `RESEARCH_AGENT`, `robotsDecision`), `phase75_source_discovery` (`approvedMetadataDiscovery75`) | Stop on 403 or 429; honour Crawl-delay. |
| Knowledge store (product + category) | `phase246_knowledge_store.ts` (KnowledgeStore246, schema v3, journal, re-derivation, `backupRotate249`, `verifyStoreFile249`, `restoreStore249`, `reconcileRetentionGaps249`), `phase246_category_seeds.ts` | `node:sqlite`. Refuses to open inside a Git work tree. |
| Category relations | `phase247_category_relations.ts`, `phase247_relation_seeds.ts` | Support classes: hypothesis, method reference and evidence-supported relation. |
| Older category cognition | `phase116_category_function_model.ts`, `phase128_category_cognition_dialogue_bridge.ts`, `phase179_category_learning.ts`, `phase101_interpretation_memory.ts` to `phase105_incremental_reasoning_graph.ts` | Audit these before adding any category-learning layer. |
| Language understanding | `phase110_local_semantic_extractor.ts`, `phase113_local_intent_interpreter.ts`, `phase125_compositional_dialogue_frame.ts` | Review interpretation and intent. Check these before replacing anything. |
| Requests to needs to decision | `phase248_advisory_journey.ts` (round 3 + Phase250 repairs, `factualRequirements`), `phase248_category_registry.ts` (`CATEGORY_REGISTRY250`), `phase248_concept_vocabulary.ts`, `phase250_category_lessons.ts`, `phase249_decision.ts` (`decideAdvice249`, `SPEC_CRITERIA249`, `comparable249`) | Teach categories with lessons, not looser matching. Needs outside the curricula are the main gap. |
| Ranking contract | `phase180_reviewed_first_answer.ts`, `phase177_decision_snapshot.ts` | Signed releases only. Forged releases are refused. |
| Rights and retention | `phase249_retention_policy.ts` (`FACTUAL_CLASS_POLICY249`, `detectReservations249`, `classDecision249`, `privateEvaluationDir249`) | Policy document: `docs/phase249/RETENTION-POLICY.md`. |
| Safety notices | `phase248_safety_notices.ts`, `scripts/phase248-safety-notices.mjs` (`--persist`) | OGL policy gate, with a fresh robots check on each run. |

Evaluation scripts:

- `scripts/phase245-evaluate.mjs`
- `scripts/phase248-journey-eval.mjs`
- `scripts/phase248-evaluate-sampled.mjs`
- `scripts/phase246-regression.mjs`
- `scripts/phase249-public-audit.mjs`

Gold and first-run results live in `evaluation/phase2NN/`.

## 4. Commands

Run these from `engine/product-evidence-engine-v5.67-phase243/` (Node ≥ 20 per `package.json`; developed on Node 22).

```bash
npx tsc -p tsconfig.json                     # build to dist/
node --test dist/tests/phase249_*.test.js    # targeted tests after build
npm test                                     # full suite (build + 17 shards)
npm run test:phase249                        # Phase245–249 focused suite
node scripts/phase246-knowledge.mjs <cmd>    # store: status, profile, category-graph, backup-rotate, verify-backup, restore, reconcile-gaps, …
npm run advise:phase249 -- --category C --criteria '[…]'   # decision layer on the real store (read-only)
npm run audit:phase249-public                # public evaluation exposure audit (read-only)
```

## 5. Storage and private locations

| Item | Location |
|---|---|
| Operational knowledge | `$PEE_KNOWLEDGE_DIR` (default `~/.local/share/product-evidence-engine/knowledge`, file `pee246.sqlite`). Outside Git. Back it up with `backup-rotate`. |
| Confidential evaluation inputs | `$PEE_PRIVATE_EVAL_DIR` (default `~/.local/share/product-evidence-engine/private-eval`). Refused inside a Git work tree. |
| Ignored by `.gitignore` | `*.sqlite`, `private-eval/` |
| Published | metrics, manifests (URL, SHA-256, fetch time) and gold limited to sampled facts. CC BY-SA excerpts carry attribution (`evaluation/phase249/NOTICE-CC-BY-SA.md`). |

The coding container is ephemeral. Durable hosting needs a persistent volume, plus backups on a second medium.

**Persistent copy: the private repository `giampierofiorelli/pee-knowledge`.** This is an owner decision of
2026-10-15. Each cloud container starts empty, so the store is restored from that repository.

- **Snapshot:** `snapshot/pee246.sqlite`, plus its manifest (SHA-256, counts, integrity and journal checks) and
  `snapshot/safety-notices/`. First snapshot: commit `048d473`, the Phase249 final state.
- **Session start:** the SessionStart hook (`.claude/hooks/pee-knowledge-session-start.sh`, registered in
  `.claude/settings.json`) does the following:
  1. clones or pulls the repository into `/home/user/pee-knowledge`;
  2. runs `scripts/knowledge-snapshot.mjs load`, which verifies the SHA-256 and copies the snapshot into
     `$PEE_KNOWLEDGE_DIR`, but only if no live store exists.
- **If the hook reports the repository is not attached:**
  1. attach it with `add_repo`, push access;
  2. clone it to `/home/user/pee-knowledge`;
  3. run `load`.
- **After any change to the store:** automatic since 2026-10-15 (owner authorisation). The Stop and SessionEnd hooks
  (`.claude/hooks/pee-knowledge-sync.sh`) run `node scripts/knowledge-snapshot.mjs sync`. When the store's content
  differs from the snapshot, it saves a verified snapshot, then commits and pushes `pee-knowledge` `main`. It refuses to
  overwrite a newer remote snapshot, and a failure blocks the end of the turn. Run `sync` by hand after a large change
  rather than waiting for the hook.
- **Rules:**
  - Never copy the store or snapshot into the public Crawler repository.
  - The live store still refuses to open inside a Git work tree; only the snapshot copy sits in `pee-knowledge`.
