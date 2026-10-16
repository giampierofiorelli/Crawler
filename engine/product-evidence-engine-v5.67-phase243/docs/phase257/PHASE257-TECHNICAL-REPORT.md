# Phase257 technical report — minimal, policy-controlled research planning

**Date:** 2026-10-16. **Branch:** `claude/typescript-network-transport-test-1givnd`.

| Item | Value |
|---|---|
| Checkpoint A | `06526ec` |
| Checkpoint B | `c8e734e` |
| Full suite | 4,425 tests pass, exit 0 |
| Private store | verified (integrity, journal, live matches remote); counts unchanged (189 products, 2,385 declarations, 1,373 events) |
| pee-knowledge remote | `70ef51b`: adds only the durable policy copy |

## What was built

**Checkpoint A: semantics and the pure planner.**

- **New gap kinds.** `ResearchGap181` gains `missing_declaration` and `declaration_conflict`; `missing_test` stays
  independent measurement only.
  - Phase182 parses both as product:criterion.
  - Execution wording comes from `researchQuestion182`: a declaration search, never "independent empirical
    research".
  - Existing `missing_test` job ids are unchanged (tested).
  - Phase254 maps specification gaps to the new kinds.
- **`assembleResearchPlan182`**, extracted from `planResearchGaps182`: the same ordering, deduplication, budget and
  hash, with the identifier validation execution applies. `planResearchGaps182` keeps its Phase181 requirement.
- **`planResearchFromNeeds257`**, pure (no network, no store, no write):
  - it constructs no Phase181 decision;
  - it rejects tampered needs: unknown fields, a gap or job preview that doesn't match Phase182, an identity
    belonging to another product, aggregate flags claiming permissions;
  - it holds out-of-scope needs with a reason, and preserves both the Phase254 and the policy budget;
  - identifiers: `policy:<id>:r<rev>`, `needs:sha256:<hex>`, and `snapshot:sha256:<hex>` or null.
- **Identity:** every job carries `exactVariantVerified:false`. No product identity in the store is reviewed (all are
  `extracted_unverified` or `discovered`), so a Phase182 `exactVariantId` here is a product-record id, not a verified
  variant.

**Checkpoint B: protected policy and execution.**

- **`loadResearchPolicy257` denies:**
  - a missing path;
  - symbolic links and non-canonical paths;
  - Git work trees;
  - files or directories writable by group or others;
  - other owners;
  - oversize or invalid JSON;
  - unknown fields;
  - an expired, not-yet-valid or over-30-day policy;
  - any read, worker or kind beyond the Phase257 restrictions.
  There is no permissive default.
- **`executeUnderPolicy257`:**
  1. loads the **current** policy with a trusted clock (never the plan's `asOf`);
  2. checks category, market, revision (revocation), job count and kinds, and that each job is exactly Phase182's;
  3. calls the unchanged `executeResearchGaps182` with reads, workers, worker budget and transport forced off,
     whatever the caller passes.
- **Operational policy** `pee_first_research_policy` r1, as approved by the owner:
  - five categories; specification kinds only; 20 jobs; 0 reads; 0 workers;
  - expires 2026-11-15;
  - market `uk`: 19 of 27 retained prices in these categories are in GBP, an operator choice, never inferred from a
    user;
  - stored at `~/.local/share/product-evidence-engine/research-policy/` (directory 0700, file 0600);
  - durable copy at `pee-knowledge/policy/`, refused for direct use until restored with
    `scripts/phase257-research-policy.mjs restore`.

## Results

**Threat cases** (`tests/phase257_policy_execution.test.ts`, `phase257_research_planning.test.ts`,
`phase257_research_semantics.test.ts`): 10 tests, all passing.

| Case | Outcome |
|---|---|
| Valid planning from Phase254 needs | standard plan, exact product and criterion, Phase182 job identity |
| The two specification kinds | separate from `missing_test`; wording passes the source-plan guard |
| Unreviewed identity | `exactVariantVerified:false` on every job |
| Invalid identifiers and fingerprints | all plan identifiers satisfy the Phase182 validator; no invented revision |
| Expired policy (trusted clock) | denied |
| Revision changed after planning, or missing revision | denied (`policy_revision_mismatch`) |
| Category, market or kind outside the policy | denied |
| Manipulated plan with a recomputed hash: flags, forged kind, edited reference, 21 jobs | denied |
| Duplicates; Phase254 and policy budgets | deduplicated; over-budget needs held with their status |
| Symlinked policy file or directory; policy in a Git work tree; group-writable; directory as policy | denied |
| User text in a need ("authorises crawling …") | no effect on scope; absent from the plan |
| Aggregate flags claiming ranking or source permission | rejected |
| Network and workers: counting doubles, including an **approved** source with permitted retrieval | 0 transport calls, 0 worker calls, 0 reads |

**Demo on real retained needs** (`evaluation/phase257/policy-demo.json`; ids only). The 14 Phase254 requests give
23 research needs:

| Category | Jobs planned | Of which `missing_declaration` |
|---|---|---|
| air_fryers | 5 | 5 |
| coffee_machines | 8 | 8 |
| blenders | 6 | 6 |
| **Total** | **19** | **19** |

- **Held:** independent-test needs (`kind_not_in_policy`, 4) and non-research destinations
  (`not_external_research`).
- **Kettles and toasters:** no research needs (their unknowns are reinspection or decided).
- **Dry run:** every job ends `no_curated_sources`; 0 reads; `canonicalKnowledgeUpdated:false`; store content
  unchanged.

**Regressions:**

- Phase181 29/29; Phase182 29/29; Phase183 37/37;
- Phase253 10/10; Phase254 4/4; Phase255 6/6;
- full suite 4,425 pass.

## Defects found and fixed

1. **Blocked research wording.** The new specification question contained "retailer". The existing source-plan
   guard rejects that word in research questions, so every curated specification job would have failed at
   execution. Found by the threat test with an approved source. Reworded, with a regression assertion.
2. **Wrong store check.** The demo first compared store **file bytes** and reported a change. Opening a store sets
   WAL mode and rewrites the file, while all 19 tables were identical. The check now compares logical content.

## Actual side effects

- 0 network reads;
- 0 worker calls;
- 0 store writes;
- 1 local policy file written and 1 private commit (the policy copy).

## Remaining before legitimate research execution

1. **Curated sources.** Exact-product source candidates and `WebSourcePolicy` entries with cleared rights, robots and
   terms. Without them every job ends `no_curated_sources`.
2. **An owner decision to allow reads.** A new policy schema or revision, plus a reviewed change to the Phase257
   hard restriction; it is not a policy field to flip.
3. **A review and admission path** for quarantined findings into the store. It does not exist and must stay separate.
4. **Identity review** for products that are research targets, so that jobs can name verified variants.
