# PEE — Continuous scientific learning: architecture readiness review

Status: assessment only (owner assignment of 17 Oct 2026). It starts from Phase272, commit `214c788`
(`docs/phase272/REPORT.md`).

**Changed by this review:** no runtime behaviour, schema, extractor, teaching rule or ranking logic. No web requests
were made and no test suite was run. Every statement about code below was checked by reading or grepping the repository
at `214c788`. Results are quoted from committed runs.

## 0. Summary

PEE already has most of the substrate a cumulative learner needs:
- **A store:** one SQLite store with journaled events, supersession, typed knowledge classes, review receipts and a derived-node
  invalidation graph.
- **Teaching:** one teaching mechanism (Phase252) that every knowledge source already flows through (owner packages,
  inventories and, since Phase272, PEE's own research).
- **A plan compiler:** compiles that knowledge into a reading prior (Phase272).
- **An evaluation discipline:** frozen protocols, first runs committed unchanged, the A/B/C/E ablation, independent gold and arm-A
  frozen builds.

What is missing is mostly **connection and memory, not new engines:**
- **Plans never reach production:** the production acquisition pipeline never receives a plan.
- **Guided leads are unversioned:** plan-guided leads would carry the same extractor version as unguided ones.
- **No lesson memory:** failures and successes live only in reports and private run files. They do not exist as replayable cases
  that later changes must keep passing.
- **Learned categories are invisible at request time:** they exist in the store, but the request path reads a code registry.

**The first safe step:** turn the verified Phase270–272 failures and successes into a frozen, replayable **experience case
corpus**, with a deterministic replay check. Change no runtime behaviour. Every later step (attribution
correction, production wiring, lesson retrieval, transfer repair) needs that corpus as its regression gate (§6).

## 1. Architecture inventory

Status classes:
- **OP:** implemented and on the operational path.
- **EVAL:** implemented, used mainly in evaluations.
- **PART:** partially integrated.
- **PROP:** proposed, not implemented.

Demonstration tiers: T1 synthetic, T2 authentic controlled, T3 operational, plus "dev" (tuned only).

### 1.1 Scientific knowledge

| Mechanism | Where | Status | Demonstrated |
|---|---|---|---|
| Category knowledge items, knowledge classes, provenance, review receipts, supersession, retirement | `phase246_knowledge_store.ts` (`category_items`, `KnowledgeClass246`, `ItemProvenance246`, `reviewCategoryItem246`, `retireCategoryItem246`) | OP | T3 (store v8, 284 items after Phase272) |
| Typed relations, evidence-support levels (`hypothesis`/`reviewed`/`evidence_supported`) | `phase247_category_relations.ts` (`measured_by`, `requires_condition`, `not_sufficient_for`, `may_support`) | OP | T3 |
| Teaching of owner research into the store (versioned teachings, cited sources, basis labels) | `phase252_category_teaching.ts` `applyTeaching252`; `phase269/270/271/272_*teaching.ts`; generator `scripts/phase271-generate-teaching.py` | OP (applied to the live store) | T2: six categories taught |
| Goal relevance / ranking authorisation from teaching | `phase253_request_advice.ts` `goalAssessment269`, `outcomeAuthorised270` | OP | T2 on frozen request sets |
| Comparative experiment evidence and comparability states | `phase271_comparative_evidence.ts` (Phase272: `comparable_with_unmet_conditions`) | OP | T2 (2 experiments) |
| Change propagation | `derived_nodes` / `derived_edges`, `invalidate()` | OP | T1/T3 |

### 1.2 Knowledge → reading (Phase272)

| Mechanism | Where | Status | Demonstrated |
|---|---|---|---|
| Extraction plan compiled from the store (outcomes, terms, units, conditions, proxies, category nouns; `isEvidence:false`) | `phase272_extraction_plan.ts` | **EVAL** | T2 untouched: values 2 → 65 / 163, findings 12 → 58 / 123; wrong-product 20 of 65 |
| Guided and exploratory passes in the existing readers | `phase225` probe, `phase265` `testLeadsFromHtml265`, `phase269` reader (optional `plan`, `exploratory`) | **EVAL**; no plan = byte-identical (54/54 pages) | T2 |
| Plan delivery to the **production** acquisition pipeline | `scripts/phase246-live-wave.mjs` `observations` and `scripts/phase246-knowledge.mjs` ingest call `testLeadsFromHtml265(...,{category})` and `qualitativeObservations269(html)` **without a plan** | **Not connected** | — |
| Version identity of guided leads | `TEST_LEAD_EXTRACTOR265` is a constant; a plan-guided lead would be stored under the same `extractorVersion` as an unguided one, so extractor supersession could not tell them apart | **Gap (blocks safe wiring)** | — |
| Retention of guided qualitative codes | `applyQualitative270` accepts only the five cooking codes; other observations are withheld (`invalid_code`) | PART (safe by default) | T1 test |

### 1.3 Research methodology

| Mechanism | Where | Status | Demonstrated |
|---|---|---|---|
| Unknown-category gap statement | `phase248_advisory_journey.ts` (`out_of_scope`; Phase272 rule for shared need words) | OP | T2: 1/3 research requests + reuse request |
| Transferable method principles (mined across ≥2 taught categories), provisional hypotheses, method-page acquisition, teaching from research | `phase272_category_research.ts` | EVAL | T2: no extraction gain (1/27 = A) |
| Research planning, budgets, discovery leads | `phase257_research_planning.ts`, `phase254_research_needs.ts`, `phase243_budgeted_category_search.ts`, `phase223_search_discovery.ts` | PART (plans questions; source reads policy-gated) | T2 (earlier phases) |
| Bounded live acquisition (robots, budgets, reservations) | `scripts/phase246-live-wave.mjs`, `phase249_retention_policy.ts` | OP (operator-run waves) | T3 |
| Learned categories in the request registry | `registryWithTeaching252` exists, but only scripts call it; the request path uses the code `CATEGORY_REGISTRY250` | **PART** | T2 (store copy only) |
| Source selection for a new category | Operator web search (Phase272) | Not a PEE capability | — |

### 1.4 Operational experience

| Mechanism | Where | Status |
|---|---|---|
| Frozen protocols, gold, first runs, refusal to overwrite | `evaluation/phase26x–272`, scorer scripts | OP for development (process, not runtime) |
| Arm-A frozen build and no-plan equivalence | `scripts/phase272-no-plan-equivalence.mjs`, worktree of `09526c4` | EVAL |
| Vertical contract, open debt (D1–D10), fitness tests | `docs/architecture/vertical-contract.json`, `tests/vertical_*` | OP (CI) |
| Lessons as durable, replayable cases (failure, success, counterexample) | Exists only as prose in reports, the skill's principles 1–18 and private run JSON | **PROP** |
| Retrieval of lessons before reading | — | **PROP** |

## 2. What can genuinely be reused

1. **The store, unchanged in kind.**
   - Knowledge classes already separate `technical_hypothesis` from `reviewed_general_knowledge` and
     `evidence_supported_finding`.
   - Supersession, retirement and journaled events give versioning and rollback of knowledge items.
   - A lesson about a *category* fits here. A lesson about the *reading process* does not, and should not be forced into
     `category_items` (§4).
2. **The teaching mechanism** as the single entry for scientific and methodological knowledge, including PEE's own research
   output (`teachingFromResearch272` already uses it).
3. **The plan compiler** as the single point where knowledge (and later lessons) reaches the readers. Its digest already
   identifies the exact knowledge used, which makes per-plan A/B and rollback possible.
4. **The evaluation harness:**
   - the A/B/C/E runner with a frozen arm A;
   - independent gold annotation;
   - no-plan equivalence;
   - first-run discipline.
   This is the promotion gate a learner needs; it already exists.
5. **The research procedure** (gap → principles → hypotheses → acquisition → teaching): sound in structure; its weaknesses are
   specific (§3, F6).

## 3. Known limitations and confirmed error families

For each family:
- **Symptom:** what was measured.
- **Established cause:** demonstrated by inspection or a controlled re-run.
- **Suspected cause:** not yet demonstrated.
- **General principle:** a candidate lesson.
- **Missing evidence.**

**F1 Identity binding by default** (most dangerous)
- **Symptom:**
  - untouched B: 20 of 65 matched values counted wrong-product, audited 14 true (all comparison prose or tables naming other models); 5 are naming variants and 1 is a headline used as the product name;
  - qualitative: 15 wrong subjects;
  - tuned after-change: 15 of 66.
- **Established cause:** a value with no product named in its own clause inherits the page product. Product mentions came only from headings until the tuned change.
- **Suspected cause:** comparison tables whose unit lives in the row label are not tied to columns.
- **General principle:** *in a document that names several products, a value without its own subject is unresolved, never the page product.*
- **Missing evidence:** an untouched re-test of that rule; its recall cost (how many correct values become unresolved).

**F2 Lexical overreach in guided reading**
- **Symptom:** B's qualitative precision is 0.56 against A's 0.71. Spurious dimensions appear (e.g. the alias "washing" spawned a duration hypothesis).
- **Established cause:** a generic evaluative lexicon plus broad outcome terms. One positive or negative word in a clause that shares one taught term becomes a finding.
- **Suspected cause:** false-positive types not yet broken down (design remarks? value judgements? other products?).
- **General principle:** *an evaluative finding needs an anchor, a stated subject and a test context, all in the same clause.*
- **Missing evidence:** a typed breakdown of B's 45 unmatched findings.

**F3 Coverage narrowing (lost evidence)**
- **Symptom:** B/C miss 1 value and 7 findings that A or E found, mostly untaught dimensions (preheat time, apps).
- **Established cause:** guided linking finds no taught outcome, and C records such clauses only as leads.
- **Suspected cause:** de-duplication across subject variants.
- **General principle:** *guidance may add or veto with a stated reason; it may never silently drop what the baseline found.*
- **Missing evidence:** a per-item trace of the 8 losses.

**F4 Representation gaps**
- **Symptom:**
  - currency-denominated derived costs and Delta E are never read;
  - values inside pros/cons widgets are missed (Phase271 68 dB);
  - the first 380 blocks limit applies only to the old path.
- **Established cause:** the generic unit lexicon and the block reader's tag set.
- **General principle:** *representations come from a generic lexicon; a missing unit is a lexicon gap, never a category rule.*
- **Missing evidence:** how often each gap occurs across the five categories' gold.

**F5 Category recognition**
- **Symptom:**
  - 2 of 3 tumble-dryer requests not recognised as an unknown category;
  - "garment steamer" routed to steam cookers (shared head word);
  - pre-Phase272, shared need words routed to dishwashers.
- **Established cause:** purchase-phrase detection finds no phrase for "I want a quiet tumble dryer…" and "Is a heat pump tumble dryer worth it…"; alias matching on the head word.
- **General principle:** *a product noun phrase the registry does not know is a gap to state, not a near match to accept.*
- **Missing evidence:** a frozen request set of unknown-product phrasings.

**F6 Thin transfer**
- **Symptom:** tumble-dryer B with the transferred or learned plan: 1/27 = A. Learning changed labels, not reading.
- **Established cause:** provisional measurements' terms are generic ("energy"), and the plan's distinctiveness filter removes exactly those terms. Method-page confirmation upgrades labels but adds no terms or units to the measurement.
- **Suspected cause:** one hypothesis per dimension is too coarse.
- **General principle:** *transferred knowledge must carry dimension-level anchors (words and units); category-specific anchors must come from the new category's own sources.*
- **Missing evidence:** a re-run on the spent tumble-dryer set after the fix, then a new held-out category.

**F7 Knowledge not reaching the operational workflow**
- **Symptom:** plans used only by evaluation scripts; learned categories invisible to the request path; guided qualitative codes outside cooking withheld.
- **Established cause:** §1.2 and §1.3 (no plan in production ingest; constant extractor version; code registry; Phase270 amendment scope).
- **General principle:** *every knowledge-driven reading must be versioned by the knowledge it used.*

**F8 Measurement validity of the evaluation itself**
- **Symptom:** naming variants scored as wrong products ("Samsung S85H" vs "QE65S85H"); gold units outside the scoring table ("s", "p", "delta_e").
- **Established cause:** the frozen subject rule (token Jaccard) and the unit table.
- **General principle:** *the scorer's identity rule must distinguish "same product, other name" from "other product", and must be frozen per protocol.*

**Recurring pattern across families.** Most failures are *defaults that fail open*:
- page product by default (F1);
- one evaluative word becomes a finding (F2);
- a near-match alias becomes a category (F5);
- silent drop under guidance (F3).

Every one of the principles above turns a fail-open default into an explicit, stated state: unresolved, lead, gap or vetoed-with-reason. That is the kind of lesson worth retaining; category-specific rules are not.

## 4. Proposed cumulative knowledge / experience model (smallest extension)

Three kinds of memory, each stored where its kind already lives. Nothing here is a new database or a new agent.

| Memory | What it holds | Where (existing) | Promotion |
|---|---|---|---|
| **Scientific knowledge** (per category) | Outcomes, measurements, conditions, proxies, mechanisms, with basis labels and sources | `category_items` / `category_relations` via `applyTeaching252` (as now) | Knowledge class `technical_hypothesis` → `reviewed_general_knowledge` → `evidence_supported_finding`, via the existing review receipts |
| **Methodological knowledge** (cross-category) | Transferable principles, source routes, method-page acquisition results | Computed deterministically from the store (`transferablePrinciples272`); research outcomes persisted as teaching (as now) | Same as above; principles are never stored as facts, only recomputed |
| **Operational experience** (reading process) | **Cases**: one authentic document region (by hash and gold id), the expected behaviour, the observed failure or success, the error family, and the principle it supports or contradicts. **Lessons**: a named rule in the readers or the plan compiler, citing the cases it must satisfy and the counterexamples it must not break | **Code + tests + private case corpus**: lesson rules are PEE-authored code; the case corpus (gold ids, hashes, expected states; no page text) lives in `pee-knowledge/private-eval/experience/`; a public value-free index lives in `evaluation/experience/` | candidate → dev-replayed → untouched-validated → enabled → monitored |

### Design points

- **Lessons are code, cases are data.** A deterministic lesson ("value without own subject in a multi-product document →
  unresolved") is best expressed as a rule with a test. The cases make it permanent: no later change may break them
  without a recorded supersession. This avoids accumulating ad-hoc rules, because each rule must cite general cases from
  more than one category or publisher before promotion.
- **Retrieval before reading.**
  - The plan compiler attaches the lesson ids that apply to the document's features (several product mentions, comparison
    table, units present, category taught or not).
  - Each lesson is a flag inside the plan, so the plan digest identifies the exact lesson set. This enables per-lesson ablation and
    rollback by plan.
- **Provenance, confidence, applicability, exceptions:**
  - each lesson records its cases, the categories and publishers it was validated on, and its known counterexamples;
  - confidence is reported as counts (validated / failed cases), not as a score.
- **Verification before promotion.** The existing harness:
  1. replay of the case corpus (no loss);
  2. a dev run;
  3. a frozen untouched run with independent gold (gain, and no wrong-attribution increase);
  4. no-plan equivalence.
- **Versioning and rollback:**
  - the extractor version recorded with each lead becomes `base version + plan digest` (F7). Supersession by extractor version then works
    unchanged, and a rolled-back lesson re-derives from retained revisions;
  - teaching already has version ids and retirement.
- **Knowing when knowledge is insufficient:**
  - the plan already exposes coverage (no measurement for an outcome, no units, no category);
  - these become explicit `insufficient_knowledge` reasons in the plan. They are reported in answers through the existing
    `unassessedObjectives` path, never guessed.
- **Transfer to unknown categories:** the research procedure stays. F6 is repaired by carrying dimension-level anchors. Learned
  categories enter the request registry through `registryWithTeaching252` from the store (data-driven), labelled
  provisional.

## 5. Ordered implementation roadmap

Each step is small, independently verifiable, and ends at an owner stop. Costs are relative: S = about one short session,
M = about one phase, L = several phases.

| # | Objective | Reuse / modify | Minimal scope | Depends on | Acceptance | Independent validation | Failure / rollback | Cost | Owner stop |
|---|---|---|---|---|---|---|---|---|---|
| **1** | **Experience case corpus + replay check** (no behaviour change) | Phase272 private gold and runs; `phase272-ab-extraction.mjs` matching; vertical-contract tests | Case schema (JSON, no page text); about 40–60 cases from Phase270–272 (F1–F5, F8 failures and matched successes, incl. counterexamples); a replay script that reports, per case, the current behaviour against the expected state; a test that the corpus is well-formed and the replay is deterministic | — | Every case has a family, a provenance (run, gold id, block hash) and an expected state; replay of `214c788` reproduces the committed first-run outcomes exactly (characterisation) | Re-derivation from committed first runs; no new pages | Not reproducible → fix the corpus, not the code | S | Owner reviews the corpus and the families |
| 2 | Attribution safety (F1): unresolved instead of page default in multi-product documents; column binding in comparison tables | `phase225` guided pass, `phase265` mentions | Plan-only rule; no-plan path unchanged | 1 | Replay: F1 cases resolved or unresolved, none wrong; no success case lost beyond a stated bound | A frozen untouched wave (deferred budget) is required before any claim | Wrong-product rate not reduced, or recall loss beyond the bound → revert the rule | S–M | Stop before any wave |
| 3 | Version identity of guided reading (F7) | `testLeadsFromHtml265`, `TEST_LEAD_EXTRACTOR265`, ingest | Extractor version = base + plan digest when a plan is used | 1 | Store supersession tests; no-plan rows unchanged | T1 + replay | Any change to existing rows → revert | S | — |
| 4 | Plans in the production acquisition pipeline, behind a policy flag | `phase246-live-wave.mjs` observations, `phase246-knowledge.mjs` ingest | Optional plan per page category; default off | 2, 3 | Flag off: byte-identical observations; flag on: replay passes; guided leads stay unreviewed, `rankingInput:false` | Offline re-ingest of retained revisions into a store copy | Any ranking or catalog change → revert | S | Owner authorises the flag |
| 5 | Qualitative retention beyond cooking (owner direction: rights and retention review first) | Phase249 policy, `applyQualitative270`, store schema | **Review first**; then codes referencing taught outcome ids, attributable, unreviewed, ineligible for ranking | 2, 4, owner review | Rights review recorded; schema migration tests; ranking safeguards unchanged | T1 + migration fault injection | Any non-code text retained → stop | M | Owner decision on the review |
| 6 | Lesson ledger + retrieval before reading (precision: F2; no loss: F3) | Plan compiler (lesson flags), case corpus | Lessons as named rules with cited cases; plan carries applicable lesson ids; per-lesson ablation | 1–4 | Per-lesson replay gain, no case loss; lessons cite ≥2 categories or publishers | Frozen untouched run per promoted lesson | A lesson that loses a case is not promoted | M | Owner reviews promoted lessons |
| 7 | Transfer repair (F5, F6): dimension-level anchors; data-driven registry for learned categories; unknown purchase phrases | `phase272_category_research.ts`, `phase248` purchase phrase, `registryWithTeaching252` | Fixed on spent tumble-dryer pages and a frozen unknown-request set | 1, 6 | Spent-set gain reported as tuned; registry change does not alter known-category regression sets | New held-out category with independent gold (needs budget) | Known-category regression → revert | M | Stop before the held-out category |
| 8 | Verification wave (about 20 requests) under a frozen protocol | Phase272 protocol / runner | Untouched pages for steps 2, 6, 7 | 2, 6, 7 + owner budget | First run committed unchanged | Independent gold | — | M (+ HTTP budget) | Owner budget decision |
| 9 | Diversity programme (Phase272 report §8) | Steps 1–8 | Curriculum subsets × held-out categories | 8 | Learning curves with denominators and order spread | Held-out categories only | — | L | Owner per round |

**Order rationale:**
- correctness of attribution (2) and version identity (3) come before any production wiring (4);
- production wiring comes before retention extensions (5) and lesson promotion (6);
- nothing learned influences a decision until steps 2–4 hold;
- ranking stays gated by the unchanged Phase181/270 authorisation throughout.

## 6. Recommended first step (only this one)

**Step 1 — Experience case corpus and deterministic replay (no runtime change).**

**Objective.** Make the verified Phase270–272 experience permanent and testable, so that every later change is measured
against what PEE has already learned: failures, successes and counterexamples.

**Scope:**
1. **Schema.** `evaluation/experience/case-schema.json` (public), with these fields:
   - case id;
   - error family (F1–F8 or `success`);
   - category, publisher host;
   - source run (committed file) and gold item id;
   - document and block SHA-256;
   - expected state (`found` / `unresolved` / `rejected_declaration` / `lead_only` / `gap_stated`);
   - principle id;
   - `counterexampleOf` (optional).

   No page text; values only in the private copy.
2. **Corpus.** About 40–60 cases from committed runs:
   - all audited F1 cases (14 wrong product, 5 naming variants, 1 headline);
   - the 8 lost-by-guidance items (F3);
   - a sample of B's qualitative false positives (F2, typed);
   - F4 unit gaps;
   - the F5 requests (3 tumble-dryer requests, "garment steamer");
   - an equal number of matched successes across all five categories, so that a fix that breaks a success is caught.

   Private values go to `pee-knowledge/private-eval/experience/`. A public index (ids, families, hashes, expected states) goes to
   `evaluation/experience/`.
3. **Replay.** `scripts/experience-replay.mjs`:
   - recompute each case's observed state with the current build and with arm A, from retained private page bytes;
   - print per-family counts;
   - refuse to overwrite.
4. **Test.** The corpus validates against the schema. Replay of the current build reproduces the committed first-run outcomes for
   every case (characterisation).

**Not in scope:** any reader, plan, schema, teaching or ranking change; any HTTP request.

**Acceptance criteria:**
- every case carries its provenance and reproduces its committed outcome;
- families cover F1–F5 and F8 across at least three categories;
- successes are at least as many as failures;
- the publication guard reports 0 findings.

**Independent validation.** Replay agreement with the committed first-run files (independent of the corpus author's judgement).
A second annotator may type the F2 false positives.

**Failure condition.** A case that cannot be reproduced from committed runs is dropped and listed, never edited to fit.

**Cost.** S: one short session, no network, no full suite needed beyond the new test and the guard.

**Stop point.** The owner reviews the families, the case balance and the expected states before step 2 is authorised.

## 7. Owner directions recorded (this assignment)

- **Qualitative retention:**
  - extending structured professional qualitative observations beyond cooking is supported in principle, subject to a rights
    and retention-policy review;
  - observations stay attributable, explicitly unreviewed where applicable, and ineligible for ranking until independently
    justified;
  - no unreviewed blanket retention expansion is implemented (roadmap step 5 starts with the review).
- **Additional live research:** no HTTP budget for this assignment. The proposed 20-request verification wave is deferred until the
  corrections and its frozen protocol are ready (step 8).
- **Production signing:** remains disabled.

## 8. Decisions that genuinely require owner input

1. **Authorise step 1** (corpus and replay, no behaviour change).
2. **Acceptable recall cost of attribution safety (step 2):** for example, at most N correct values may become unresolved for
   each wrong-product value removed. This sets the bound in step 2's acceptance criterion.
3. **Scope of the qualitative retention review (step 5):**
   - which source classes are in scope;
   - which codes may be kept;
   - whether the Phase270 amendment is extended or replaced.
4. **Whether learned categories may enter the request registry automatically** (labelled provisional), or only after owner
   review (step 7).
5. **Budget and timing of the verification wave** (step 8) and of the first held-out categories (step 9).

## 9. Expected validation and resource costs

| Step | Network | Gold work | Compute | Risk to the operational path |
|---|---|---|---|---|
| 1 | none | reuse committed gold | seconds per replay | none (no runtime change) |
| 2–3 | none until the wave | reuse plus the corpus | small | low (plan-only; no-plan equivalence) |
| 4 | none | — | re-ingest into a store copy | medium (flag off by default) |
| 5 | none | — | migration tests | medium (schema; rights) |
| 6–7 | none until validation | spent-set reuse | small | low to medium |
| 8 | about 20 requests | about 4–5 independent annotators | about 1 session | none (evaluation) |
| 9 | about 30 requests per round | about 6 held-out categories | a few sessions per round | none (evaluation) |

The existing scientific knowledge and research history are preserved throughout:
- owner packages unmodified in `pee-knowledge`;
- teaching versioned in the store;
- first runs committed unchanged;
- superseded material kept with dated notes.
