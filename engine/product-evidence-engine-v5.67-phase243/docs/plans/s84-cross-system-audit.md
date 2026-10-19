# S84 — Cross-system architecture and knowledge reuse audit (owner decision S84, 2026-10-19)

**Status.** Audit and integration design only: no code was changed and nothing was implemented. Owner brief, verbatim:
`.claude/skills/pee-guided-learning/references/owner-cross-system-audit-s84-2026-10-19.md`. It continues S82 (census of
relations, conditions, units and evidence classes) and S83 (consolidation). These are reused, not redone.

**Roadmap.** R3 stays open and its closure criteria (R3-C, C1–C4) are unchanged. The cross-system programme proposed here
is architecture work alongside the R roadmap, not a substitute for it. Nothing in it completes R4–R7. Every item it
proposes keeps the restrict-only ranking gate, and no ranking authorisation changes.

**How the facts were established.**
- **Static import graph.** All 290 `src` modules, with reachability from the three operational entry points: advice,
  ingestion, and the acquisition scripts. Script `scripts/s84-module-graph.py`, output `evaluation/s84/module-graph.json`.
- **Runtime coverage of the advice path** on the 206 spent regression requests from S83. Script
  `scripts/s84-coverage-summary.py`, output `evaluation/s84/advice-coverage-206.json`.
- **Five read-only regional inspections:**
  - request and needs;
  - discovery and acquisition;
  - extraction and identity;
  - knowledge holders, feedback and evaluation;
  - the S75–S77 semantic experiments.
- **Verification.** Each high-impact claim below was re-checked in code or by running it on a store copy.

**Labels used in this report.**
- **[V]** verified in code or by a run.
- **[E]** an existing experimental result, quoted from its report.
- **[H]** an architectural hypothesis.
- **[O]** an owner decision still required.

## 1. What PEE actually runs (Task 1)

| | Modules | Lines |
|---|---|---|
| All of `src/` | 290 | 51,973 |
| Statically reachable from some operational entry point | 132 | 28,798 |
| Reachable from no entry point | 158 | 23,175 |
| — of which no `src` importer and no script (tests only, or nothing) | 40 | 4,668 |
| — of which used by evaluation or replay scripts only | 79 | 11,642 |
| — of which imported only by other unreachable modules | 39 | 6,865 |
| Advice path: modules loaded on the 206 requests | 70 | 16,233 |
| Advice path: modules that executed any function | **16** | **5,346** |

[V] The advice path that actually runs uses only 16 modules:

| Role | Modules |
|---|---|
| Category and need recognition | `phase248_advisory_journey`, `phase250` lessons, `phase125` (budget) |
| Constraints and quantities | `phase253_request_constraints`, `quantity_knowledge` |
| Decisions and checks | `phase177` decision, `phase249` checks |
| Knowledge read | `phase246` store, `phase247` relations, `knowledge_rules` |
| Comparison and coverage | `phase271` comparative, `request_coverage80` |
| Helpers only | `phase245` normaliser (2 functions), `phase145` (one escape helper), `phase193` (one hash helper) |
| Entry point | `phase253_request_advice` |

With a signed catalog, `phase181`, `phase180`, `phase268` and `knowledge_link` (the shadow D28 trace) also run.

[V] The other 54 loaded modules come in through static import chains that execute nothing. Example:
`phase246 → 245 → 241 → 228 → 220 → 177 → 175 → 174 → 173 → 164`, where the import is often only a type.

The acquisition path that actually runs [V] is `scripts/phase246-live-wave.mjs`. It calls:
- the restricted HTTPS transport;
- the robots check from `phase223`;
- `phase243`, to order leads;
- `phase245` extraction;
- `phase249` reservations;
- the `phase265`/`225`/`226`/`270` test and comparative readers;
- the `phase269` qualitative reader.

Ingestion (`phase246-knowledge.mjs ingest-observations`) persists what that script extracted.

## 2. Census by region: overlaps, collapsed distinctions, unreused capability (Tasks 1–2, 4)

### 2.1 Request → needs → goal assessment

**Overlaps [V].**
- At least 18 separate request vocabularies:
  - categories: 5 lists, 3 of them buying phrases;
  - needs: 4 sources, with store aliases written by 4 paths;
  - negation: 5 sets;
  - units, currencies and bounds: 4;
  - bound words: 2;
  - questions: 3 maps, where `needQuestions` is never filled;
  - the stemmer: duplicated exactly (`phase248:55`, `request_coverage80:26`).
- Two quantity typers that disagree. A run of `extractConstraints253` against QK `readQuantityRequirements` gave:

  | Request | Phase253 | QK |
  |---|---|---|
  | "between 3 and 5 litres" | the range | no bound |
  | "fits a space 40 cm wide" | a maximum | nothing |
  | "extracts 12 litres a day" | a capacity question ("at least 12 l?") | no rate |
  | "at least 2 kg capacity" | dropped silently | typed |
  | "at least 55 inches" | unmapped | typed, then **suppressed** because the span is unmapped (`phase253_request_advice:325`) |
  | "44 dB", "15 bar" | not seen | typed |

- Two answers to "comparable when …" in the same response:
  - the QK `evidenceNeed` names generic axes;
  - the teaching names the taught measurement's conditions.

  The quantity requirement is never linked to the need it serves.

**Collapsed distinctions [V].**
- **Feature or mechanism read as an outcome need.** Run on a store copy: "high brew pressure" becomes the need `extraction_parameters`, and the answer becomes research. Same for "steam wand" and "convection fan". Cause: need recognition accepts concepts of every kind (`phase248:322`).
- **Lost without a trace:** "quiet dishwasher". A clause counts as covered when half its words are used, and the category alias counts (`request_coverage80:77`).
- **Related merged with equivalent** in stored aliases: "running costs" under energy use, and one alias on two tumble-dryer outcomes.
- **Inferred need merged with stated need.** An IDF-inferred need enters `needs` like an alias match.
- **"most reliable dishwasher" becomes `out_of_scope`.** "reliable" sits in a boundary word list.

**Unreused [V].**
- `qualitative_needs.readQualitativeNeed` already reads "quiet" as noise and "cooks evenly" as spatial uniformity. It is shadow only.
- Phase128's alias-collision check. The operational `addConceptAliases246` has none and makes an alias live at once.
- The `uninterpreted` spans: computed on every request and never kept.

### 2.2 Research needs → search → source selection → acquisition

**Overlaps [V].**
- **Robots: one parser, about 6 policies.** They disagree:
  - a robots.txt answering 404 is allowed by `phase223`;
  - the same 404 is refused by `readApprovedSource` (`approved_web_reader:233`).
- **At least 5 gates for the one side effect "GET a page".** The script that actually reads (`phase246-live-wave`) stores the owner policy file in its state (`:44`) but enforces only its `--budget` argument. The `phase257`/`263` gates, meanwhile, always deny. This conflicts with "one gate per side effect, authorise the resource".
- **Research gaps:** 4 representations, none of which reads another (store `research_gaps`, NeedKind254, ResearchGap181, SignalKind243).
- **Source role and lane:** 6 vocabularies, on top of S82's 3–4 role mappings.
- **Search queries:** 2 dimension word lists. The planner uses the smaller one (`phase262:33`).

**Collapsed distinctions [V].**
- **Error and unknown recorded as refusals.** The live wave sends robots-unknown, 401 and 403 all as `forbidden`, and `recordAccess246` counts `error` as a restriction (`phase246:406`).
- **Hosts dropped on one record.** The discovery pilots exclude any host with `restricted>0` (`phase261:186`, `phase262:139`), with no expiry. In the live store, 28 hosts with a single record are excluded though never suspended.
- **Yield never recorded.** `ok` is never written, so yield per host is unrecorded, not zero.

**Unreused [V].** At the advice boundary, the advice already computes per outcome:
- the relevant measures;
- the conditions per measure;
- the proxies;
- the D28 conditions not verifiable.

`compileExtractionPlan272` already gives the measurement terms, units and conditions. Yet research needs carry only a need id (`phase254:101`), and queries say "`<need words>` measured test" (`phase262:66`).

### 2.3 Page bytes → extraction → identity → store

**Stored and used by default advice [V]:**
- Phase245 declarations;
- product identities;
- `comparative_results271`.

**Stored for ranking only:** `test_measurements265`, which is used only with a signed catalog.

**Stored and read by nothing:** `qualitative_observations270` (9 rows).

**Overlaps [V].**
- **10 product or variant attribution mechanisms.** None merges on similarity, but they disagree:
  - three model-token rules: "AirDoctor 3000" gives model `3000` in Phase272 and nothing in Phase268 or `urlModelToken252`;
  - comparative rows link to the main product by name alone (`phase246:744`), while test rows also need model and SKU (`phase265:252`).
- **The 7 unit tables of S82, all in this region.** None keeps A-weighting: "52 dB(A)" becomes dB in every operational reader. [E] With the quantity-knowledge layer, A-weighting is kept on 44 of 60 values, against 0 without it (`quantity-knowledge.md` §4A).
- **Table re-scanning.** Phase265, Phase270 and Phase272 each re-scan tables, and `textBlocks225` runs 3–4 times per page. Phase225 runs the whole Phase155 reader to keep only a count.

**Collapsed distinctions [V].**
- **A manufacturer declaration can be stored as a measured comparative test.**
  - Test-lead and comparative reading run on every fetched page, whatever its source type (`live-wave:220`).
  - `applyComparative271` stores `value_basis='measured'` and a constant `testing_status` (`phase246:745-756`).
  - `comparativeEvidence271` does not filter on `reported_by`.
  - The risk is latent: 87 of 87 current rows come from test publishers.
- **Spec-table declarations from test-publisher pages are counted as "independent results"** in the journey (`phase248:410`). The store currently holds 0 such declarations.
- **Declarations read as tests.** [E] The table readers read declarations as test leads: 21 of 87 in Step 1D-B, and 9 AHAM CADR values in the table audit. This is why they stay unconnected (debts D15/D17).
- **Feature vs metric.** Declarations carry no measurand: Phase245 does not use quantity knowledge, so "CADR 400 m³/h" and "airflow 400 m³/h" differ only by their label.

**Unreused [V].**
- **No operational extractor types quantities with `quantity_knowledge`.** All 12 stored test rows have `dimension_basis=not_established`.
- **`phase252_review_semantics` is wired only to Phase110.** It contains a check for "manufacturer claim promoted to test".
- **New units and labels are counted, then dropped.** None becomes a vocabulary candidate.

### 2.4 Knowledge holders, feedback, evaluation

**Store state [V], read on a snapshot copy:**

| Holding | Count | State |
|---|---|---|
| Category items | 284 | all `proposed_unverified`, 0 reviewed |
| Relations | 200 | all hypothesis or method reference |
| Sufficiency assessments | 56 | all same-model; 16 say "establishes" |
| Machine-translated statements | 6,118 | — |
| Research gaps | 80 | 21 open |

**Overlaps [V].**
- **Teaching enters three times:** store items and relations; a code registry (need criteria and questions); translated statements.
- **The promotion workflow exists four times.** Only the store's two versions are journaled, and neither has a non-test caller.
- **Sufficiency and evidential force:** 5 scales — Phase247 values, the derived state, the Phase253 rank map, knowledge_link force, and the shadow overlay that labels every `measured_by` "supported".
- **Comparability:** 3 vocabularies (knowledge_link, Phase271, Phase249).
- **Scoring:** 3 schemes (Phase181, Phase268; Phase98 is types only).
- **Explanation:** at least 4 code→text tables.

**Collapsed distinctions [V].**
- **Same-model assessment counted as established.** `sufficiencyOf247` turns any "establishes" assessment into `established` without reading its `independence` column (`phase247:92-97`). ra.2 does not look at the relation's support grade (`phase253_request_advice:231-245`). So a hypothesis relation whose only assessment is a same-model reading of the owner package can pass ra.2. [O] Whether that counts as the "positive sufficiency evidence" of S78 is an owner decision. It is bounded today by the signed-catalog requirement and the S79 release rule.
- **Teaching basis lost.** The basis (source observation, method reference, instructor hypothesis) survives only as text inside the statement.
- **Gap creation is not journaled; resolution is** (`phase246:905-914`).
- **Aliases cannot be reversed.** The alias event omits the values, and the category version hash ignores aliases.

**Knowledge invisible to other consumers [V]:**
- acquired condition axes (one script only);
- lesson cues, part phrases, counterexamples, need criteria and questions (code constants only);
- quantity-knowledge terms (not seen by need recognition);
- request words left uninterpreted, and unknown labels and units (never persisted);
- experience-case lesson hypotheses (evaluation files only).

## 3. Bidirectional reuse (Task 3)

**Existing knowledge → better operation.** These are the reuses the census found possible today.

| Operation | Knowledge already held that it does not use | Effect if used |
|---|---|---|
| Request understanding | QK typing (as sole typer); concept kinds; `readQualitativeNeed`; knowledge_link from a request quantity to taught measurements | 12 L/day, 2 kg, 55 inch, dB requests read; "quiet" stays an explicit unassessed objective; features stop becoming outcome needs; one set of conditions stated |
| Search planning and source selection | goal-assessment measures and conditions, D28 not-verifiable conditions, `compileExtractionPlan272` terms and units, `test_measurements265` and comparative rows per host | queries name the measurand and its conditions; hosts known to publish original tests of that measurand preferred |
| Passage location and extraction | QK typing and units; the teaching's `not_sufficient_for`; `phase252_review_semantics` checks | measurand on every stored test row; declaration-as-test screened; A-weighting kept |
| Identity and attribution | one exact-match model-token and subject rule | comparative and test rows of a page attach under the same rule |
| Missing evidence and research gaps | store `research_gaps` from ingestion | ingestion gaps become research needs |
| Evaluation and explanation | one sufficiency scale, one condition-state vocabulary (S83), one explanation table | same verdict worded the same way on every path |

**New observations → better knowledge.**
- [V] **There is no single path today.** The store already has the right shape:
  - items and relations go hypothesis → reviewed → evidence-supported;
  - promotion needs a receipt, and `evidence_supported` needs an independent original test;
  - everything is journaled, retirable and superseded rather than deleted;
  - research gaps hold open questions.
- [V] **What is missing:**
  - an **observation / candidate** stage with its origin, below `hypothesis`: request words, unknown labels and units, acquired axes;
  - a collision check before an alias goes live;
  - journaled gap creation;
  - lessons stored as data rather than code.
- [V] **The older quarantine → promote pilots** (Phase128, Phase129, Phase179, `adaptive_schema_evolution`, experience `recurringPatterns`) hold state in memory only. Reviving any of them would duplicate the store.
- [H] **The home for candidate knowledge** should be the existing store journal (`category_items`, `category_relations`, `relation_assessments`, `research_gaps`). Experience cases would supply the recurrence evidence.
- **Promotion stays the owner's** (or goes through independent validation). Similarity never becomes identity, and a claim never becomes a fact automatically.

## 4. Classification (Task 4)

| Class | Mechanisms |
|---|---|
| Fundamental, keep | restricted transport; robots core and stop rules (401/403/429, Retry-After); retention classes and reservations; `productKey246` and exact identity; store journal, retire and supersede; teaching relations with ra.2 restrict-only; QK; KR engine; `request_coverage80` (principle 8) |
| Shared but inconsistent | quantity typing (request ×2, extraction ×7 tables); robots policies; page-read gates; access-outcome mapping; model-token and subject rules; source-role vocabularies (S82 plus 6 lanes); negation sets; research-gap kinds; sufficiency, force and comparability scales; explanation tables |
| Specialised for good reasons | Phase249 criterion mapping; Phase125 budget; Phase270 multi-appliance tasks; Phase268 qualified-publisher policy; Phase264 metadata gate; Phase249 per-class caps (keep, but make them visible to acquisition) |
| Provisional or replaceable | Phase225/226 closed unit regexes (CFM, m³/h, nits, Hz never seen); Phase265 `UNITS`; Phase270 `unitOf`; Phase262 word list; IDF need inference; boundary adjective list; code-constant lessons and need criteria; acquired axes and concept alignment (pilots) |
| Historical / replay-only | 1G, KN and 1D-A2 table readers; `document_evidence`; `product_facts`; experience tooling; old rule files (S83) |
| Redundant or unreachable | 40 modules with no importer and no script (4,668 lines); 39 modules held only by other unreachable modules (6,865 lines). Examples: Phase72/109–111/113/117/119/122/123/126/127/164/165/172/173 request tools (superseded by 248/253/269); the Phase147–151 prose chain; the Phase155 call inside 225; `qualitative_observations270` storage with no reader |

**Unnecessary restrictions found [V]:**
- the `restricted>0` host exclusion, with no expiry;
- non-idempotent access counting;
- "reliable" as a boundary word;
- QK requirements suppressed because Phase253 left the span unmapped.

**Safeguards that must stay:** the declaration screens that keep the table readers unconnected (D15/D17), and robots fail-closed on unknown.

## 5. The semantic experiments (Task 5)

[E] **The negative findings stand unchanged.** Every model in S75–S77 was asked to **validate** identity (exact or close versus related). None was measured as a **ranker** of candidates.

| Arm (transfer first run, 14 identities) | Result | Identities missed |
|---|---|---|
| lexical identifier | 3 of 15 correct | 11 |
| NLI (cross-encoder, 71M) | 4 of 15 correct, 7 related concepts promoted | 10 |
| Qwen 1.5B | 0 of 5 correct | 14 |

Distributional similarity also failed as a validator: it captures topical relatedness, not equivalence. Nothing operational depends on any model. S78–S80 suspend model experiments.

[H] **Bounded hypotheses for a later, separately authorised experiment.** In each, the model only proposes or ranks candidates. Validation stays with QK typing, the type gate, `unresolved` and owner adoption.

| | Candidates for | Notes |
|---|---|---|
| H1 | Aliases for unknown request words | Needs requests written by other people |
| H2 | The taught concept of an unknown table label or review phrase | Unit typing is an independent check that S76 lacked; the strongest case |
| H3 | Passages relevant to a taught measurement | — |
| H4 | Reranking re-analysis | Zero-cost: top-1 and MRR of the existing NLI scores, development only |

**Ordering.** These are more informative **after** two steps:
1. one candidate pool (Intervention C below), which gives recall@k a stable denominator;
2. uniform validation gates.

The exception is H4, which costs nothing. [O] Any model experiment needs a new owner authorisation.

## 6. Prioritised integration plan (Task 6)

These are four interventions, each improving several components. The order is by reuse gained against risk. None changes a ranking authorisation.

### A. One quantity typing: quantity knowledge everywhere a quantity is read

1. **What.**
   - Request typing exists twice: `phase253_request_constraints` (UNIT/MIN/MAX/property regexes) and QK `readQuantityRequirements`.
   - Extraction typing is spread over the Phase245 `UNIT_ALIASES`, the Phase265 `UNITS`/`DIMENSION_UNITS`, the Phase225/226 unit regexes, Phase270 `unitOf` and `UNIT_LEXICON272`.
   - Research queries use their own dimension words.
2. **Reuse.**
   - QK `findQuantities`, `typeQuantity` and `readQuantityRequirements` (pack v3);
   - the S82/S83 reader-condition overlay;
   - Step 3 versioned reading, for re-deriving stored rows;
   - `knowledge_link`, to link a typed quantity to the taught measurement.
3. **Benefit across the system.**
   - **Request:** the six misreadings in §2.1.
   - **Store:** the measurand on test and comparative rows; A-weighting kept; CADR distinct from airflow.
   - **D28 and comparison:** typed records instead of re-parsing.
   - **Research:** queries name the measurand.
4. **Change.**
   - Phase253 keeps only its property→criterion mapping and SPACE ⇒ maximum. Range, rate ("a day") and SPACE move into the QK language data.
   - The local unit tables are retired one consumer at a time.
   - Simplification: about 5 unit tables and one bound vocabulary fewer.
5. **Risk.**
   - **Eligibility:** a wrong bound can turn "unknown" into "fails" and exclude a product. Bound semantics must never widen.
   - **Stored rows:** re-typing changes their reading identity. Step 3 versioning handles this, but it must be replayed.
6. **Measure.**
   - The S83 206-request harness, field by field, with zero unexplained decision changes.
   - QK on/off ablation on the request slice.
   - The quantity-knowledge gold (spent, regression only).
   - The S80 pages (spent).
7. **Independent material:** none held. New requests written by someone other than Claude are needed (owner or public sources), with a reference sealed before the run.
8. **Readiness:** the request slice is ready (harness and QK exist). The extraction slice should wait for the declaration screen (B below) and, for the table readers, D15/D17.

### B. One meaning per role: concept kind and evidence role decide what a thing can be

1. **What.**
   - **Concept kind** is ignored at need recognition (`phase248:322`): a feature or mechanism becomes an outcome need.
   - **Evidence role** is not checked by Phase270/271, so a declaration can become a measured comparison. The journey counts declarations as independent results.
   - **Sufficiency and force:** five scales; same-model assessments count as established.
   - **Explanation:** four text tables.
2. **Reuse.**
   - store `kind` and `knowledge_class`;
   - `declarationRole246` and `reportedBy265` (one of the two becomes canonical);
   - the S83 three condition states;
   - `phase252_review_semantics` (claim promoted to test).
3. **Benefit.**
   - Features become preferences or eligibility checks (R7 later), not research outcomes.
   - Declarations never enter comparison or "independent" counts.
   - The same verdict is worded the same way on the advice, comparative and ranking paths.
4. **Change.**
   - Recognition reads the concept kind.
   - The comparative ingest and query gate on role.
   - One sufficiency vocabulary, owned by Phase247.
   - One code→text table.
   - All restrict-only.
5. **Risk.**
   - Kind labels are unreviewed (all 284 items are `proposed_unverified`), so mislabelled kinds would move needs.
   - If the owner rules on independence, the 16 "establishes" assessments stop counting.
6. **Measure.**
   - The 206-request harness.
   - Counterexample tests for each collapsed distinction in §2.
   - Comparative-row census before and after: 87 of 87 unchanged expected.
7. **Independent material:** the same need as A for requests. For declaration-as-test, the Step 1D-B sealed reference is spent, so new pages are needed.
8. **Readiness:** the comparative and journey role gates are ready and small. The independence rule needs [O].

### C. Candidate knowledge on the existing store journal (the feedback direction)

1. **What.**
   - Uninterpreted request spans, unknown units and labels, acquired axes, and alias additions are dropped, held in memory, or made live immediately.
   - Gap creation is not journaled.
   - Lessons and need criteria are code constants.
   - Four promotion workflows exist.
2. **Reuse.**
   - the store items, relations, assessments and `research_gaps` with the event journal;
   - experience cases (`recurringPatterns`, the request case kind);
   - Phase128's collision rule (as logic, not as module state);
   - CategoryLesson250 adoption.
3. **Benefit.**
   - One path, for every subsystem, from **observation** (with origin and location) to **candidate** to **hypothesis** to **reviewed** to **evidence-supported**.
   - Request, extraction and research all feed it. Need recognition, plans and research all read only adopted entries.
   - This is the precondition for R5 (rule learning) and for any later semantic-candidate experiment. It is not R5 itself.
4. **Change.**
   - Journal gap creation.
   - A typed origin on items, relations and gaps, carrying the teaching basis as data.
   - An observation/candidate state: the existing `state` column, or gaps as the candidate queue.
   - Alias events carrying their values, with a retire operation and a collision check.
   - Lessons and need criteria stored as data.
   - Retire the in-memory pilots.
5. **Risk.**
   - **Privacy:** keeping request text must respect the private store and gold separation (owner rule).
   - **Schema:** migration v11, with category-version hashes changing, so replay is needed.
   - **Promotion:** never automatic.
6. **Measure.**
   - Journal verification.
   - Replay of every category version.
   - Counts of candidates by origin.
   - For any adopted candidate: knowledge on/off on requests not used to propose it.
7. **Independent material:** candidates from the spent sets are development only.
8. **Readiness:** design ready. [O] Persisting request phrases and the schema change need owner consent.

### D. One acquisition gate per side effect, with outcomes fed back

1. **What.**
   - About 5 page-read gates. The one that reads does not enforce the policy file.
   - About 6 robots policies, with 404 handled two ways.
   - Access outcomes conflated, and hosts excluded on one record.
   - Research needs blind to the teaching.
2. **Reuse.**
   - restricted transport;
   - the `phase223` robots policy;
   - `readProtectedPolicyFile257`;
   - store `hostSuspended246`;
   - Phase249 caps;
   - `phase260`, a source-memory projection that already exists but is unreachable;
   - goal-assessment outputs and `compileExtractionPlan272` for queries.
3. **Benefit.**
   - The owner policy is enforced on the resource.
   - Legitimate hosts are no longer lost.
   - Yield is known.
   - Queries name what the advice is missing.
4. **Change.**
   - One gate module used by the live wave and the metadata pilot.
   - Retire the divergent robots rules and the always-deny flags as authorities.
   - Idempotent access events with `ok` recorded.
   - Research needs carry measure and conditions.
5. **Risk.**
   - This must never widen access: robots unknown and 401/403/429 stay fail-closed.
   - [O] Phase257 excludes test needs from research plans; a decision is needed.
6. **Measure.**
   - An offline rehearsal on fixtures (the Phase264 lesson).
   - A request-log comparison against the policy.
   - A counterexample robots set.
7. **Independent material:** live behaviour is shown only by a new authorised run.
8. **Readiness:** ready for an offline slice. Live use needs a policy in force.

### Code that can leave the operational path (supports A–D, not a separate project)

**Remove in batches.**
- Start with the 40 modules (4,668 lines) that nothing imports and no script uses, then the 39 held only by other unreachable modules.
- Per batch:
  - confirm no replay depends on it (S83 method);
  - leave a dated note;
  - keep the last commit as the replay reference.

**Break the type-only chains** that pull 54 executed-nothing modules into the advice process.

**Expected effect [H]:** up to about 11,500 lines out of `src`, with no behaviour change.

## 7. Recommended first bounded implementation

**A, request slice: QK as the only quantity typer on the request path, with B's two restrict-only role gates carried with
it only if the owner wants them in the same step.**

Why this one first:
- It removes a real duplicate (two typers) on the path that runs for every request.
- It fixes six verified misreadings.
- It reuses existing mechanisms only.
- It has a ready field-by-field regression harness (206 requests) and a knowledge on/off ablation.
- It never touches ranking authorisation.
- It creates the shared typed representation that the extraction and research slices then reuse.

**Stop condition:**
- no unexplained decision change on the 206 requests;
- no new "fails" for any product;
- first runs committed unchanged.

**Validation:** a first run on new requests from people other than Claude, sealed before the run.

## 8. Owner decisions required

1. **Independence:** may a same-model "establishes" assessment of the owner package count as established for ra.2? Or must sufficiency require a human or independent assessment (restrict-only)?
2. **Order:** A (request slice) first, with or without the two B role gates (comparative declaration gate; journey "independent results").
3. **Candidate intake (C):** persisting request phrases and unknown expressions in the private store as candidates, plus schema v11.
4. **Research (D):** whether Phase257 may plan test research (it currently excludes test needs); and a policy in force for any live slice.
5. **Code removal:** batch retirement of unreachable modules under the S83 rule.
6. **Semantic models:** the H4 re-analysis of existing scores (no new runs) now, or nothing until A and C are done.
7. **Stored data:** keep or stop retaining `qualitative_observations270`, which nothing reads.
8. **Roadmap text:** the R4 heading is missing in `roadmap.md` (its body is present). Correct it or leave it.
