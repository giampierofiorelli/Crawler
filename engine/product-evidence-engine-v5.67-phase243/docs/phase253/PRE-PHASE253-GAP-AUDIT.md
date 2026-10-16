<!-- Versioned copy (Phase253 Stage 0) of the read-only audit written on 2026-10-16 in the Phase252 session
     scratchpad. Content unchanged below the addendum. It holds code references and aggregate store counts only
     (no declaration values, page text or private evaluation material). -->

# Addendum (Phase253 Stage 0, 2026-10-16): verification of the findings at HEAD d11f42f

Each finding was re-checked against code before Phase253 changes. The F1 experiment was re-run on a store copy.

| Finding | Status | Evidence |
|---|---|---|
| `runJourney248` does not call `decideAdvice249` | **Confirmed defect** | the name appears in `src/phase248_advisory_journey.ts` only in a comment; callers are CLI scripts |
| Journey decisions never return a positive factual shortlist | **Confirmed defect** | every known-category branch sets `withhold_insufficient_evidence` (lines ~339–346); `'recommend'` is declared but unreachable |
| Explicit non-budget quantities are not carried into requirements | **Confirmed defect** | `factualRequirements[].stated` is `null` except for `budget_max` (line ~275); `composeQuestion125` returns only `userBudget` |
| Many recognised needs cannot be checked against products | **Confirmed defect** | `NEED_CRITERIA250` maps 2 needs (`batch_capacity`, `small_kitchen`) of 51 adopted need concepts |
| Evaluation scores do not measure final product advice | **Confirmed defect** | `phase251-score.mjs` and `phase252-teaching-score.mjs` score the category label and need ids; no shortlist metric. A silent scorer defect: gold without `expectedBehaviour` defaults to "advise" (set 3: "harmful 58/73") |
| Some declarations have unknown source classification | **Confirmed data gap** | 53 of 90 sources `unknown` (`source_type_basis` `operator_asserted`); 1,041 of 2,385 declarations `unclassified_declaration` |
| Many modules exist outside the advisory path | **Architectural observation, not a defect** | 146 of 241 `src` modules unreachable by import from the current runtime roots. Import reachability does not show whether a module is obsolete; Stage 6 classifies the relevant ones individually |

One correction to the audit's wording: F1 also depends on an **owner-approved safeguard** that the audit did not
mention. Phase177 refuses to confirm a criterion whose provenance is `english_intake_candidate`
(`phase177_unconfirmed_nlp_promotion`). Connecting the journey to the decision must respect this. Phase253 does
so with a distinct, bounded provenance for constraints the user stated verbatim; inferred needs remain candidates.

---

# PRE-PHASE253 GAP AUDIT — Product Evidence Engine

**Date:** 2026-10-16.
**Repository state:** HEAD `d11f42f` (Phase252 final), clean tree; private store pee-knowledge `4c78d47`.
**Scope:** read-only. No code, tests, skill, store or configuration were changed; no commits were made. One
experiment ran on a temporary store copy, which was deleted afterwards.

**Inputs:**
- `CLAUDE.md`;
- the `pee-guided-learning` skill (decisions S1–S20, research v9);
- the Phase252 report;
- the code, tests and committed evaluation files;
- read-only counts from the private store.

**ECC.** The deterministic `harness-audit.js` (ECC 2.2.3) is present, but it fails on a missing dependency
(`@iarna/toml`). Installing tools was out of scope, so **no ECC score is reported**. No multi-agent ECC workflow was
used. The ECC finding that matters is about the harness, not PEE: GateGuard asked for facts 13 times in the Phase252
session. That is a cost to Claude Code usage, not a PEE product defect (finding 10).

Labels used below:
- **Confirmed:** shown by code, tests, store counts or committed results.
- **Suspicion:** plausible, but not tested.

---

## 1. Most important gaps, ranked by impact

### F1 — The positive advice path exists but cannot be reached from a request *(confirmed; highest impact)*

**Evidence.** The same request run through both layers on the current store:

> "I want an air fryer of at least 5 litres for my family, under £120"

- `runJourney248` returns:
  - decision `withhold_insufficient_evidence`;
  - **needs []**;
  - factual requirements: only `budget_max`;
  - a generic question that offers "cook enough food for a family" as an option, which the user has just said.
- `decideAdvice249` (via `scripts/phase249-advise.mjs`), given the same need as a confirmed `capacity_min` of 5 l,
  returns `requirements_shortlist`: **4 of 5 products, cited**.

**Root causes** (all in `src/phase248_advisory_journey.ts`):
1. The journey never calls `decideAdvice249`. It appears there only in a comment (line ~147). Its only callers are
   CLI scripts.
2. A known category always ends in `withhold_insufficient_evidence`, even inside the branch where evidence exists
   (lines ~339–341). `Decision248` declares `'recommend'`, but no code path produces it.
3. Every requirement except the budget has `stated: null`: no quantity is read from the request text (line ~275).
   `composeQuestion125` extracts only the budget; "at least 5 litres" and "opening 57.5 cm wide" are lost.
4. The conversation state modules that could carry confirmed criteria across turns are not used:
   - `phase176_turn_state_ledger` (no caller outside src);
   - `phase127_stateful_clarification`;
   - `phase177_decision_snapshot` (used only by the CLI).

**Consequence.**
- Users never receive the cited shortlist that PEE is already able to justify (in this example, 4 of 5 products).
- Every evaluation since Phase248 has measured category labelling, not advice (see F6).

**Reuse:**
- `normalizeValue245` (quantities and units);
- `SPEC_CRITERIA249` with `comparable249`;
- `createDecision177` and `applyDecisionAction177`;
- `decideAdvice249`;
- `phase176` and `phase127` for carrying confirmations across turns.

**Smallest correction:**
- Read stated quantities next to a checkable criterion into `factualRequirements[].stated`.
- When category, at least one stated or confirmed factual requirement and candidates exist, call `decideAdvice249`
  and return its outcome (a requirements shortlist, unordered and cited) instead of withholding.

Ranking stays behind Phase180. No safeguard is relaxed: shortlists use declarations only and are labelled as such.

**Test:**
- T1 tests on the journey-to-decision hand-off.
- A first run on a new untouched set, scored on **advice correctness**:
  - Is every shortlisted product truly inside the stated limits, by its cited declaration?
  - Are wrongly excluded products listed?
  - Is withholding used where it is justified?
- Keep the category-only score as a secondary metric.

**Priority:** first. It turns existing, tested capability into user value, and it changes what Phase253 should
measure.

### F2 — Category knowledge is not wired to decisions: 51 need concepts, 2 checkable *(confirmed)*

**Evidence:**
- `ADOPTED_LESSONS250` defines 51 category-need concepts.
- `NEED_CRITERIA250` maps only two needs to decision criteria: `batch_capacity` → `capacity_min` and
  `small_kitchen` → width, depth and height. `registryWithLessons250` applies that same map to every category.
- Phase251 found 28 checkable criteria across 13 categories (`observational-knowledge-after.json`), but no need
  points to them.
- The store's 99 category items are all `technical_hypothesis`.
- Relations:
  - 5 `measured_by` with support `method_reference`;
  - 13 hypotheses;
  - **0** `evidence_supported`.
- The journey's evidence branch needs `evidenceSupported>0 && independentResults>0`. Independent results need
  declarations in state `verified_for_purpose`; **all 2,385 are `extracted_unverified`**.

**Root cause.** Knowledge is added as vocabulary and hypotheses. The links "need → checkable property" and
"need → independent measure" are written by hand, one at a time, and mostly not at all. The promotion APIs
(`reviewCategoryItem246`, `verifyDeclarationForPurpose246`) exist and are tested, but are never called by any
script.

**Consequence.** More lessons raise category recognition. They cannot raise decision quality beyond capacity, size
and budget.

**Smallest correction.** Make the need → criterion map **per category data**, stored or registered next to the need
item. Fill it from the properties Phase251 already observes per category (power, weight, dimensions, capacity,
battery hours). Do this before adding any new category.

**Test:** count needs with at least one checkable criterion per category, and requirements-shortlist coverage on new
requests.

### F3 — Need understanding is limited by a closed, per-category alias vocabulary *(confirmed)*

**Evidence.**
- **Unlisted needs** (needs outside the catalogue) equal or exceed listed ones in 3 of 4 real sets:

  | Set | Listed | Unlisted |
  |---|---|---|
  | Set 3 | 24 | 29 |
  | Set 4 | 4 | 6 |
  | Set 5 | 7 | 17 |
  | Teaching set | 50 | 31 |

- The headline metric `recallListed` excludes unlisted needs entirely.
- Concepts are matched only within the resolved category, from item aliases. Even "family" was missed for
  air_fryers in the F1 example, although `batch_capacity` exists for that category.
- Phase252 showed that the research-chosen wording lost to literal wording (20/44 against 28/44), and that implicit
  needs stayed at 1/6 in both arms.

**Root cause.** This is architectural, not only vocabulary. Needs are a fixed list of ids per category, recognised by
phrase matching. Three things are missing:
- a category-independent layer of **generic need types** with typed parameters (capacity or people, space, budget,
  noise, duration, durability, ease, cleaning, portability, compatibility);
- a way to carry a **stated quantity** with the need;
- a slot for "other need" that is recorded instead of dropped.

Purchase-target identification is the second cause of harm, separate from need recall (Phase252: all 7 harmful
decisions).

**Reuse:**
- `GENERIC_NEEDS250` (already a list of shared needs);
- `phase125` frames;
- `phase116_category_function_model` (headphones, dishwasher and robot-floor models, unused by the journey).

**Smallest correction:**
- Recognise generic need types plus stated quantities first; map them to category criteria (F2).
- Keep category-specific needs for genuinely category-specific outcomes.
- Report recall over listed **and** unlisted needs as the primary need metric.

**Suspicion.** Some unlisted needs ("works with Ubuntu", "no hiss when silent") are compatibility constraints that no
declaration covers. They are research questions, not vocabulary gaps.

### F4 — Teaching material lives in TypeScript code, so learning a category requires a developer *(confirmed)*

**Evidence:**
- Category names, cues, contrasting phrases, need criteria and questions are constants in:
  - `src/phase248_category_registry.ts`;
  - `src/phase250_category_lessons.ts`;
  - `src/phase252_category_teaching.ts`.
- Only items and relations are in the store.
- A new category or package therefore needs a code change, a build and a commit.
- The journey's "unsupported_category" and research-plan outputs are strings that nothing consumes (no caller
  outside the scorer).

**Consequence.**
- Runtime autonomy for category learning is zero today.
- "Importing packages" (Phase253) cannot be done without Claude editing code each time.
- Knowledge in code also escapes the store's journal, snapshot and rollback.

**Smallest correction.**
- Define one versioned **teaching-package data format** (JSON). It can map one-to-one onto `CategoryTeaching252` and
  the registry fields.
- Write an importer that validates the format and applies it through the existing `applyTeaching252` and store APIs.
  The registry is derived from the store and package records, not edited in code.
- Keep the TypeScript constants only as fixtures.

**Test:**
- Import a package into a store copy, then remove it (journaled). The journey's behaviour must change accordingly.
- No code change may be needed.

### F5 — Research ingestion and autonomous investigation stop at several hand-offs *(confirmed)*

The trace from an unfamiliar product to advice:

| Step | Module | Runtime-autonomous? |
|---|---|---|
| Request names an unknown category | journey: `out_of_scope` or `unsupported_category`, plan string | yes (detects); **the plan is not executed** |
| Source discovery | `phase243_budgeted_category_search`, `phase246-live-wave.mjs` (robots, budgets) | partly: `curate` / `leads` are **operator** commands |
| Fetch and extraction | `phase245` extractor, `ingestObservation246` | yes, under budgets and policies |
| Category assignment | `phase251_category_assignment` | yes (journaled) |
| Category knowledge (goals, mechanisms, methods) | lessons and teaching in code; `phase179`, `phase129` unused at runtime | **no**: written by Claude |
| Review meaning | `phase110` needs a local model; only `ollamaLocal110` exists, none in this environment | **no**: 0 native atoms (Phase251) |
| Faithfulness check | `phase252_review_semantics` | yes (lexical, T1-tested) |
| Verification and promotion | `verifyDeclarationForPurpose246`, `reviewCategoryItem246` | **no caller**: needs a review receipt |
| Advice | `decideAdvice249` | yes, but not reachable from a request (F1) |

**Consequence.** Every learning step after extraction depends on Claude in a session. The research-plan output is a
dead end.

**Smallest correction.** Do not build autonomy yet. Make the journey's plan **typed actions**
(`find_candidates(category)`, `find_method(need)`, `verify_declaration(product, criterion)`), which the existing
`phase246-live-wave` budgeted runner can consume. Measure how many plans complete without Claude.

### F6 — Evaluation metrics overstate competence *(confirmed)*

**Evidence:**
- **"Correct decision" means only that the category label is right**
  (`scripts/phase251-score.mjs`, `rowFor`; `phase252-teaching-score.mjs`, `row`). No metric checks advice
  correctness, citations or shortlist membership. Abstaining on a control scores "correct", which is why BASE scored
  7/28 while advising nothing.
- **Need recall excludes unlisted needs** (F3).
- **Small denominators:** 9 advise cases in set 5; 3 microwave cases in the teaching set; 1 request without a
  category name.
- **Author-dependent gold:** every real-request gold is T2, written by the same author who wrote the lessons and the
  teaching. In Phase252 the Stage 5 cases and rules were designed in the same session.
- **Construction rubrics:** the Stage 4 requirements, applicability and missing-evidence rubrics can be met only by
  the arm whose research defined them. This is reported, but easy to misread.
- **Pool exhaustion and distribution shift:** Stack Exchange kitchen purchase questions are nearly used up
  (set 5: 125 read, 11 in-scope). Enthusiast sites state needs literally and name the product, which inflates
  name-based recall and hides the colloquial requests real users write.
- **Silent scorer defect:** `phase251-score.mjs` applied to set 3 (gold without `expectedBehaviour`) reports
  "harmful 58/73". The missing field makes every case "advise"; the numbers are meaningless, not flagged.

**Consequence.** Reported gains (D′ 21/30 "correct") are category-labelling gains. Advice quality has never been
measured on real requests.

**Smallest correction:**
- Add an advice-correctness metric (with F1).
- Make the scorer refuse gold without required fields.
- Report recall over all needs.
- Pre-register a **new request source** before Phase253 collection. Options to evaluate:
  - other Stack Exchange sites by need-worded queries;
  - open-licence shopping-query corpora already assessed in Phase251 (QueryNER, ESCI) for the category step only;
  - owner-supplied anonymised real questions, as T2.5 with an author other than the developer.

### F7 — Prior domain assets are dormant and were not reused *(confirmed)*

**Evidence:**
- 146 of 241 `src` modules are unreachable by import from the current runtime path (journey, decision, store,
  teaching, assignment, safety notices) and from the Phase246+ scripts.
- **Phase252 headphone teaching ignored three existing assets:**
  - `src/open_headphone_measurements.ts` (Phase69: an attributed **CC BY 4.0 frequency-response extract**, used
    only by its test);
  - `HEADPHONES_MODEL116` (category function model);
  - `src/lab_needs_bridge.ts`, `src/needs_discovery.ts` (question-driven need interpretation, vacuum prototype),
    with no runtime caller.
- The reuse map in `current-state.md` does not list them.

**Consequence:**
- duplicated effort;
- a missed path to the first licensed independent measurement for a pilot category;
- a parallel "needs" architecture that disagrees with the journey.

**Smallest correction:**
- Before Phase253, a one-page inventory: dormant modules worth reviving or worth retiring (by category: needs,
  measurements, research planning).
- Add them to the reuse map.
- Do not delete anything yet.

**Suspicion.** Open-licence headphone measurement collections may allow the first `evidence_supported` relation
(for example, frequency-response deviation and preference, Phase252 sources). Rights must be checked per source.

### F8 — Evidence-quality risks are concentrated in source typing and table attribution *(confirmed)*

**Evidence:**
- 53 of 90 sources have `source_type='unknown'`, so 1,041 of 2,385 declarations are `unclassified_declaration`.
  Manufacturer and retailer cannot be told apart for 44 % of the facts used in shortlists.
- 63 products exist only through comparison tables (`named_in_table`), attributed by column header, never reviewed.
- 3 product-line records ("2000 Series") are treated as products.
- 222 `host_suspended` events, all reason `forbidden`.

**Consequence.**
- Shortlists cite facts whose source role is unknown.
- Table attribution errors would reach advice once F1 is wired.

**Smallest correction:**
- Classify source types from existing signals (host lists, schema.org Organization, page type). This is reversible
  and journaled, like the Phase251 category assignment.
- Exclude `named_in_table` products from shortlists until reviewed, or show them as "from a comparison table".
- Gate F1's shortlist on these two checks.

**Not over-restrictive.** This is a labelling fix, not a new block. Unknown-role facts can still be shown as
"declared by a source of unknown type".

### F9 — Review comprehension: meaning extraction is absent at runtime; only checking exists *(confirmed)*

**Evidence:**
- Phase110 extraction needs a model provider; with none, it yields 0 atoms.
- The Phase252 checks reject unfaithful **proposals**; they cannot produce meaning.
- Truth verification does not exist; correctly, it is not claimed.

**Consequence.** Review-based evidence cannot enter decisions without Claude acting as the extractor.

**Smallest correction:** none needed for Phase253's main goal. Keep this as research-only, unless a lawful local
model becomes available. Do not invest further in rules on synthetic cases: the next step is real review text (see
the Phase252 continuation priority 4).

### F10 — Cost and complexity of development, not of the product *(confirmed for the harness; suspicion for causes)*

**Evidence:**
- The `package.json` has about 300 scripts.
- Each phase adds arm runners and scorers with overlapping logic:
  - `phase250-journey-arms.mjs`;
  - `phase252-teaching-arms.mjs`;
  - `phase251-score.mjs`;
  - `phase252-teaching-score.mjs`.
- GateGuard asked for facts 13 times in Phase252.
- The full suite (4,395 tests) runs on every validated commit.
- `research-v9-full.md` is 2,440 lines.

**Consequence.** A large share of Claude Code tokens is spent on harness compliance and re-deriving context, not on
PEE capability.

**Smallest correction:**
- One reusable arm runner and one scorer with plug-in arms and rubrics.
- Run phase-specific tests during iteration; run the full suite only before a push.
- Ask the owner whether GateGuard should exempt `evaluation/**` and `docs/**` (`GATEGUARD_EXEMPT_GLOBS`). That is an
  owner decision on a safeguard, not mine.

---

## 2. What PEE already does well and should not be rebuilt

- **Knowledge store** (`phase246_knowledge_store.ts`): journal, invalidation, revisions, retention classes and
  identity keys. The Phase252 split operation shows corrections can be journaled and reversed.
- **Private persistence:** snapshot, sync and verify.
- **Decision layer** (`decideAdvice249`):
  - cited, unordered requirements shortlist;
  - identity holds;
  - upper-bound rule;
  - ranking only through the signed Phase180 path.
  The positive path works (F1); it is unwired, not wrong.
- **Extraction and acquisition:** the Phase245 extractor and value normaliser; the Phase246 budgeted, robots-checked
  live wave.
- **Category assignment** (Phase251): journaled and evidence-based (57/57 on its gold).
- **Evaluation discipline:** pre-registration, frozen code, first runs committed unchanged, spent sets. Keep it, and
  fix what it measures (F6).

## 3. Fundamental architectural weaknesses

1. **Two disconnected halves** (F1): language understanding stops before decision.
2. **Knowledge stored as code** (F4): registry, lessons and teaching are TypeScript constants, outside the
   store's journal and outside runtime learning.
3. **Closed per-category need vocabulary** (F3): no generic need types, no quantities, no "other need" slot.
4. **No working promotion path** (F2, F5): every item and declaration stays unverified forever, so the evidence
   branch and the Phase180 ranking can never activate.

## 4. Missing capabilities for genuinely autonomous category learning

1. A data format and importer for category knowledge, so packages are applied without code (F4).
2. Typed research actions that a budgeted runner can execute from the journey's plan (F5).
3. A need → property link learned from observed declarations. For example: "these categories declare battery hours;
   battery_life needs `battery_life_min`." Today it is written by hand (F2).
4. A verification step that can promote at least source-typed manufacturer declarations for a purpose, with a
   receipt that is not Claude's say-so. For example, an exact model-page re-check, or two independent pages that
   agree (F2, F8).
5. Review meaning extraction at runtime: research-only; needs a lawful local model (F9).
6. A transfer test design: categories reserved for autonomous learning, never taught, with their own request pool
   registered in advance (section 5).

## 5. Assessment of the proposed Phase253 (importing ChatGPT-produced scientific category packages)

**Can the existing modules support it?** Partly.

- `CategoryTeaching252` already holds:
  - typed statements (source-backed, method reference, instructor hypothesis);
  - sources with URLs;
  - needs with requirements, measures, proxies and questions;
  - source routes, applicability and gaps.
- `applyTeaching252` compiles them into store items and hypothesis relations.

What is missing, and what must come first:

1. **F1 first.** Without the journey-to-decision hand-off, better category knowledge cannot change advice. Phase252
   showed this: richer teaching changed no decision.
2. **A package data format and importer (F4).** It must validate before import:
   - every non-hypothesis statement cites a source;
   - every criterion exists in `SPEC_CRITERIA249`;
   - phrase and need budgets are respected.
3. **Treat packages as instructor hypotheses.** Statements labelled "source-backed" by ChatGPT should be stored as
   `instructor_hypothesis` until PEE (or Claude in a session, recorded as such) fetches the cited source and confirms
   it. Fabricated or mis-cited references are a known risk of model-written research.
4. **Owner decisions.** S1 and S2 defer AI bridges and external reviewers. Owner-supplied documents written with
   ChatGPT are research input, like research v9, not an integration. Packages must enter by owner upload; no
   automated ChatGPT connection.
5. **Contamination controls** (register these before importing):
   - a written list of **reserved categories** for autonomous-learning tests, never covered by any package, lesson or
     example;
   - packages must not contain example user requests or posts from the evaluation sources (Stack Exchange). A model
     may have seen the very posts used as gold. Check the package text against registered pools before import;
   - gold for taught categories must be written before the package is read, or by someone other than the package
     author;
   - per the Phase252 method lesson, keep users' literal need words as well as package vocabulary.
6. **Measure methods, not only material.** Transferable research methods (source routes, measurement semantics,
   proxy warnings) should be scored on the reserved categories, through the typed research actions of F5. Otherwise
   "learning methods" cannot be told apart from "receiving answers".

**Can be developed incrementally:**
- per-category need → criterion data (F2);
- source-type classification (F8);
- reviving dormant assets (F7).

## 6. Opportunities to simplify and reduce Claude Code usage

- Wire F1 and F2 before adding any category. Each new category currently costs lessons, code and evaluation, with no
  decision effect.
- Consolidate arm runners and scorers (F10). One `evaluate --arms` script would replace about 6 phase-specific
  scripts.
- Move registry, lessons and teaching to data (F4). Category work stops requiring builds and the full test suite.
- Prune or archive the reuse map. List the dormant modules once (F7), so sessions stop re-reading or re-inventing
  them.
- Run the full suite only before a push. Ask the owner about GateGuard exemptions for `evaluation/**` and `docs/**`.

## 7. Recommended changes to the Phase253 priorities and sequence

The Phase252 continuation prompt put **purchase-target identification** first and **merged teaching** second.
Recommended order:

1. **F1: journey → stated requirements → `decideAdvice249`**, with an **advice-correctness metric** (F6). This is the
   largest user-facing gap, it is mostly wiring, and every later step is measured through it. Gate it on the F8 checks
   (source type; table-only products).
2. **Purchase-target identification** (the Phase252 harms). It is now more important: once F1 produces shortlists,
   a wrong category produces wrong products, not just a wrong label.
3. **F3 + F2: generic need types with quantities, and per-category need → criterion data.** The quantities come from
   F1's parser.
4. **F4: package data format and importer.** Then import **one** owner-supplied package for **one** category, as
   instructor hypotheses, with reserved categories and pre-written gold (section 5).
5. **Evaluation renewal (F6),** registered before collection:
   - a new request source;
   - recall over all needs;
   - the scorer refusing incomplete gold.
6. **Deferred:** autonomous research actions (F5), review meaning extraction (F9), promotion workflow (F2, item 4).
   Their designs depend on 1–4.

Not recommended for Phase253:
- more phrase-level lessons;
- more synthetic faithfulness cases;
- new pilot categories before F1 and F2.

---

## Appendix — evidence index (read-only commands; nothing was written to the repository)

| Item | How it was checked |
|---|---|
| Journey never reaches decision | `grep decideAdvice249` (journey: comment only); journey lines ~310–354; experiment on a store copy (deleted) |
| `stated:null` | `src/phase248_advisory_journey.ts` ~275; `composeQuestion125` returns only `userBudget` for quantities |
| 2 of 51 needs checkable | `NEED_CRITERIA250`; `ADOPTED_LESSONS250` need ids |
| Store state | read-only SQLite: items 99 (all hypotheses); relations 18 (0 evidence-supported); declarations 2,385 (all `extracted_unverified`); sources 90 (53 unknown); 222 `host_suspended` (forbidden) |
| Unused promotion APIs | `reviewCategoryItem246`, `verifyDeclarationForPurpose246`: 0 script callers |
| Dormant modules | import graph from runtime roots: 95 of 241 reachable; `open_headphone_measurements.ts`, `HEADPHONES_MODEL116`, `needs_discovery.ts`, `lab_needs_bridge.ts` with no runtime caller |
| Listed versus unlisted needs | gold files of sets 3–5 and the teaching set |
| Scorer defect | Phase252 development run: set 3 scored "harmful 58" with `phase251-score.mjs` |
| ECC | `harness-audit.js` fails: `Cannot find module '@iarna/toml'`; not installed by design |
