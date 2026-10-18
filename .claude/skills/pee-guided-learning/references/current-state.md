# PEE state at skill installation, reuse map and commands

**Snapshot date:** 2026-10-15.

**Phase249 status:** complete and pushed. Final HEAD `2580112` on `claude/typescript-network-transport-test-1givnd`.

**How to use this file.**

- It is date-bound. Before relying on it, check `git log` and the newest `docs/phaseNNN/` report. A later phase
  supersedes these numbers.
- Every figure below comes from committed Phase249 files, chiefly
  `engine/product-evidence-engine-v5.67-phase243/docs/phase249/PHASE249-TECHNICAL-REPORT.md`.

## 0000000000000000000000000. `<br>` fix and knowledge v2 KN (2026-10-18) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/plans/quantity-knowledge.md`, addendum KN.

- **`<br>` (D18 resolved in new versions):** acquisition v1f.2 `renderedText` (opt-in `{rendered:true}`) and 1G
  v1g.2 (`{text:'rendered'}`). v1f.1 and v1g.1 are the byte-identical defaults. The knowledge layer reads v1g.2 by
  default. Oracle: `scripts/rendered-text-1f-verify.mjs` (Chromium innerText).
- **Default pack is now `quantity-knowledge.v2.json` (`qk.2:…`):** built by
  `resources/quantity-knowledge/build/v2-additions.py` from the unchanged v1. New sections: methods (fixed
  conditions), relations (expression language), scales (ordinal classes with regimes), plus language extras (label
  unit prepositions, basis words, axis letters).
- **New functions:** `relationChecks`, `typeClass` / `compareClasses`, `readClassRequirements`, `unitStatedInLabel`,
  `withLabelBasis`, `typeLabelledNumber`. Advice: `adviseFromRequest253(…,{quantityKnowledge,date})` adds
  `classRequirements`.
- **Evaluations:** `evaluation/quantity-knowledge/reading-kn-v1|v2|v2b`, `links-kn-v2|v2b|v2c`,
  `requests-kn-v2-tuned` (TUNED). All pages are spent.
- **Correction K8 / S53:** pack now `qk.2.1`. The acoustic inference from the evidence class was withdrawn; relations
  carry `nature` and `caveat`. Published qk.2 runs are kept (`*-kn-v2*`); corrected runs are `*-kn-v21`.
- **K9 / S54:** pack `qk.2.2` with `kindEvidence` and document protocols. Adjudication: `scripts/acoustic-ac-eval.mjs LABEL [ENGINE_ROOT]`
  against `evaluation/acoustic-ac/freeze.json`.
- **KR / S56:** declarative rules in `src/knowledge_rules.ts` and `resources/quantity-knowledge/rules.v1.json`
  (programs `kind`, `compare`; identity `qk.2.2+kr.1:…`). Check equivalence with
  `scripts/kr-equivalence.mjs LABEL REFERENCE_ROOT` before any rule change.
- **KV / S59:** first unseen validation (`evaluation/kr-unseen/`, `scripts/kr-unseen-eval.mjs`): 7 pages, only 1 with table values.
  Kinds transfer; conditions in cells and comparability do not. P2 adopted (TUNED).
- **WD / S60:** whole-document reader `src/document_evidence.ts` (wd.1, shadow only): pairs, sentences, lists, cards and embedded JSON-LD / Next.js data through `typeQuantity` and the shared rules; P1 as rule program `record` (`rules.v2.json`, kr.2); knowledge qk.2.3. Evaluation: `scripts/wd-eval.mjs` + `scripts/wd-score.mjs` (reference sealed on the KV pages' non-table content, now spent); funnel: `scripts/wd-funnel.mjs`, `scripts/wd-live-yield.mjs`. Restriction audit `docs/plans/restriction-audit.md`.
- **FC / S62:** typed product facts `src/product_facts.ts` (fc.2, shadow only) over the WD reading: functions (presence, stated by), components, modes (scale, rank, stated equivalence per product), results with conditions by kind, function performance; first-order program `product` (`resources/quantity-knowledge/product-rules.v1.json`, KR engine), vocabulary `functions.v1.json`. Evaluation `scripts/fc-eval.mjs`, `scripts/fc-score.mjs` (9-page reference, now spent). Report `docs/plans/product-functions-and-conditions.md`.
- **Open:** D19, D20, D21, D22, D23, D24, D25 (v2 knowledge reported but used by no decision; class scale needs a registry
  category).

## 000000000000000000000000. Typed quantity knowledge GK (2026-10-18) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/plans/quantity-knowledge.md`.

- **Pack** `resources/quantity-knowledge/quantity-knowledge.v1.json` (27 kinds, 51 unit atoms, 5 level units, 6
  metrics, 6 condition axes, English bound words); **interface** `src/quantity_knowledge.ts` (identity `qk.1:<digest>`).
  Add knowledge by editing the pack, never by adding a unit list to a reader.
- **Consumers:** `src/table_interpreter1g_knowledge.ts` (layer over frozen 1G, identity `…+qk:…`);
  `adviseFromRequest253(…,{quantityKnowledge})` (opt-in quantitative requirements, questions, evidence needs); Phase253
  rate guard (default path: a rate is never a capacity); `typedMeasures272` / `linkTypedToMeasure272`.
- **Evaluation** `scripts/qk-eval.mjs reading|requests|links LABEL` (never overwrites); request gold sealed in
  `evaluation/quantity-knowledge/requirements-freeze.json`; first run `requests-firstrun.json` unchanged.
- **Open debt** D18 (1F `<br>`), D19 (role of a quantity in a request), D20 (seven legacy vocabularies), D21
  (comparability not consumed on the default path).

## 00000000000000000000000. Phase272 knowledge-guided extraction and unknown-category pilot (2026-10-17) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase272/REPORT.md` (stopped for independent review).

- **Plan before reading**: `compileExtractionPlan272` (store teaching -> outcomes, measurement terms, units, conditions,
  proxies, category nouns; never evidence) passed to the Phase225/265/269 readers; without a plan they are byte-identical
  to 09526c4 (54 retained pages). Arm A runs from a frozen build at /home/user/p272-armA (worktree of 09526c4).
- **Untouched first run** (16 pages, air fryers / dishwashers / air purifiers / televisions; independent gold):
  values A 2/163 -> B 65/163 (precision 0.75); findings A 12/123 -> B 58/123 (precision 0.56); but 20 of B's 65 matched
  values counted wrong-product (14 audited true, comparison content). E (generic units, no knowledge) finds 77 values only
  as leads. Tuned mention rule (spent set): 15 wrong of 66.
- **Televisions taught** (t272.tv1, generator with config); speakers package received and Stage-A inventoried.
- **Unknown category** (tumble dryers): gap now stated (out_of_scope) for 1 of 3 requests and the reuse request;
  transferred plans gave B 1/27 = A on 4 untouched pages (negative); learned teaching kept in the store as hypotheses.
- **Policy** pee272 (owner, 60 requests / 6 hosts / 7 days): 30 requests used, 5 hosts.

## 0000000000000000000000. Phase271 evidence operations and nine-family research intake (2026-10-17) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase271/REPORT.md` (stopped for independent review).

- **Store v8** `comparative_results271`; 2 authentic experiments retained (Which? lab, lovemoney home test), duplicates
  keyed by content. `comparativeEvidence271` judges comparability; Phase253 uses it for air fryer vs owned oven and
  refuses it for choosing an air fryer (no same-class experiment; compartments in use never recorded).
- **Attribution**: appliance lists and row labels resolve subjects (Phase270 docs, tuned: exact subject 0.35 -> 1.0).
  Held-out (5 TechRadar documents): qualitative 9/49 -> 11/49; quantitative 0/3 (dB and seconds not read).
- **Packages**: 04, 05, 06 (+ duplicate countertop), 07, 08, dehumidifier R01-R39 preserved in pee-knowledge; Stage-A
  inventories in `research-inventory/phase271`; speakers (09) and air fryers v3.9.0 not received.
- **Taught**: dishwashers and air purifiers (`phase271_category_teaching.ts`, generated from inventories); untouched
  cross-category set: category 0 -> 0.75, decision 0.31 -> 0.56. Dehumidifier provenance t271.d2.
- **Signer**: key handles have no sign(); copied handles refused. Publication acknowledgements are line-exact (tested).
- Phase270 pilot budget: 22 of 24 requests spent (continuation state `private-eval/phase271/wave.json`).

## 000000000000000000000. Phase270 review fixes and bounded pilot (2026-10-17) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase270/REPORT.md` (stopped for independent review).

- **Ranking** is authorised only positively (`outcomeAuthorised270`): teaching `measured_by` + known measurement (signed
  `measureId`) + no proxy + all `requires_condition` met + every stated outcome and factual need assessed. Missing
  knowledge refuses. One verification (`verifySignedCatalog181`) gates ranking and partial comparison; partial
  comparisons need a revision in `PARTIAL_COMPARISON_POLICY270`. Raw quantities: `valueKind:'raw_quantity_only'`.
- **Response** mirrors `goalAssessment.decision` (`partial_comparison`, `no_purchase_check` are responses now).
- **r2 policies**: `authorised_partial_comparison_only`. **Signer** `phase270_catalog_signer` (evaluation keys only;
  production refused). Owner setup proposal in the report §2.
- **Store v7**: `qualitative_observations270` under `pee249-factual-observations-v2-qualitative-codes`.
- **Extraction**: `phase270_comparative_results` (tables, `<br>` lists, prose; duration/energy/cost separate). Held-out
  (6 docs, 3 new publishers): 0/60 -> 37/60, precision 0.925, exact subject 0.351; qualitative 1/24 (weak).
- **Teaching**: `phase270_teaching` deltas (U4, U6, C2) and dehumidifiers (package B; R01-R37 missing, every lesson
  "awaiting source verification"). Generalisation set (13): decision 7 -> 9.
- **Evidence**: Which? lab energy/time per completed dish for one named air fryer and one oven; not retained (no
  comparative retention path). No cross-model comparison exists: no complete recommendation is possible.
- **Publication check** accepts line-exact reviewed acknowledgements (`docs/architecture/publication-acknowledgements.json`).
- Pilot: `pee-knowledge/policy/phase270-bounded-pilot-policy.json`, 15 of 24 requests spent.

## 00000000000000000000. Phase269 scientific integration and goal relevance (2026-10-17) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase269/SCIENTIFIC-INTEGRATION-REPORT.md`.

- **Research packages:** received 16 Oct 2026; unmodified in the private repo `pee-knowledge/research-packages/`, extracted
  for reading at `~/.local/share/product-evidence-engine/research-packages/`. The air-fryer package is a RECONSTRUCTED
  v2.2.0 compendium plus addenda, not v3.9.0. Inventory: `evaluation/phase269/research-package-inventory.json`.
- **Teaching:** `src/phase269_research_teaching.ts` (air fryers, coffee), applied to the live store with
  `phase246-knowledge.mjs apply-teaching --category air_fryers|coffee_machines`.
- **Goal relevance:** `Advice253.goalAssessment` (decision, coverage, relevant measures, rejected proxies, conditions,
  incomparability, partial comparison).
- **Policies r2:** proposed. `VALIDATION_POLICY268` and `SCORING_POLICY268` are now r2; `_R1` constants reproduce Phase268.
- **Evaluations:**
  - `evaluation/phase269/teaching-*.json` and `coffee-*.json`;
  - untouched extraction first run (0/12);
  - qualitative pilot (`scripts/phase269-qualitative-pilot.mjs`, private).
- **Owner decisions pending:**
  - approval of the r2 policies;
  - initial key management for policy-bound signing;
  - the pee249 amendment for qualitative outcome codes.

## 0000000000000000000. Phase268 real evidence and first authentic ranking (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase268/REAL-EVIDENCE-REPORT.md`.

- **Live pilot:** `scripts/phase246-live-wave.mjs` under policy `pee268_test_evidence_pilot` (private repo `policy/`;
  expires 2026-10-23); 25 of 50 requests used, 3 hosts. The script now honours `politenessMs`, `maxHosts`,
  Retry-After, and stops on a redirect to the same URL.
- **Store:** schema v6 (condition codes on `test_measurements265`). It holds 10 authentic test-measurement rows from 10
  Expert Reviews air-fryer reviews (unreviewed), 9 new air-fryer products named by `testDocumentSubject268`, and the
  `low_energy_use` concept.
- **Extraction:** Phase225 probe v2 (`pee225-probe.v2`). Gold: 11 measurements; 8 extracted (tuned); held-out first run
  0/1 (committed unchanged).
- **Validation and scoring:** `src/phase268_evidence_validation.ts` (`validateTestMeasurements268`, `compileCatalog268`,
  `points268`); policies `pee268-test-evidence-validation` and `pee268-energy-scoring` are PROPOSED, not authorised.
- **Controlled evaluation:** `scripts/phase268-authentic-eval.mjs --label X` (refuses to overwrite). The frozen request
  ranks 3 products by measured energy under the proposed default; cooking results stay unassessed.
- **Owner decisions pending:** authorise or amend the two policies, and name a production signer. Also decide whether
  structured specialist outcome classes may be retained (cooking results).

## 000000000000000000. Engineering correction and vertical integration (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase267/ENGINEERING-CORRECTION-REPORT.md`. The contract of
the operational path is `docs/architecture/vertical-contract.json`.

- **Connected:** `adviseFromRequest253(text, store, registry, {ranking:{catalog, authority}})` now reaches the
  existing Phase181 engine for stated performance needs covered by a reviewed catalog dimension. The order is
  restricted to products that passed every stated factual check. This is verified with a synthetic signed catalog
  only.
- **Production ranking stays disabled:** no signed catalog exists, and its producer and signing authority are an
  owner decision.
- **Principle 8:** `unassessedObjectives` and the "Not assessed: …" statement.
- **Fitness tests:** `tests/vertical_path_fitness.test.ts` (A–G, with fault injection), `tests/vertical_contract.test.ts`
  and `tests/publication_guard.test.ts`.
- **Publication guard:** `scripts/pee-publication-check.mjs` (pre-push hook `.githooks/pre-push`, activated by the
  session-start hook).
  - The history audit found exposures beyond `f388d3a`, including older evaluation files still in the tree.
  - Remediation (forward redaction, history rewrite, or making the repository private) awaits the owner.
- **Vocabulary:** `espresso_quality` aliases added to `CONCEPT_VOCABULARY248`. The live store is not reseeded; it needs
  `phase246-knowledge.mjs seed-vocabulary`, an operator step.

## 00000000000000000. End-to-end reality check (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase266/REALITY-CHECK-REPORT.md` (audit, not a phase).

- **Works:**
  - request → unordered, cited factual shortlist from retained declarations (`adviseFromRequest253`);
  - ranking engines (Phase180/181) correct and deterministic on controlled synthetic evidence.
- **Does not work, or never tested:**
  - 0 authentic independent test results in any category;
  - test extraction never run on an authentic test document;
  - `adviseFromRequest253` never calls Phase180/181; nothing produces a signed catalog or release;
  - Phase265 measurements cannot reach the decision layer;
  - a conflict fails a whole Phase181 catalog closed.
- **Fixed:**
  - water-tank requirement (`water_tank_capacity_min`; boilers excluded from capacity);
  - an article ends the purchase noun phrase.

  Measured on 7 frozen requests (`evaluation/phase266/`).
- **Open, without network:**
  - CAD budgets;
  - taste and noise need vocabulary;
  - component heights read as overall height;
  - "X crushes ice" phrasing.

## 0000000000000000. Phase265 update (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase265/PHASE265-TECHNICAL-REPORT.md`; next brief
`docs/phase265/CONTINUATION-PROMPT.md` (Phase266: teaching from the three research packages, measured before and
after).

- **Store schema v5** (the live store and the snapshot are still v4 and migrate on first open by the Phase265 code). `test_measurements265` holds publisher-reported test measurements (Phase225/226/227 leads). It
  has a nullable product, provenance and qualifiers, and CHECK constraints: unreviewed, independence not established,
  never evidence or ranking.
  - **Written by:** `ingestObservation246({testLeads})` in the same transaction, under the Phase249 retention decision
    and the per-host cap.
  - **Read with:** `testMeasurements265()` and `testMeasurementConflicts265()`.
  - **CLI:** `phase246-knowledge.mjs test-measurements`.
  - **Builders:** `testLeadsFromHtml265` in `phase246-live-wave.mjs observations` and `ingest-recovered`.
  - **Validated on synthetic fixtures only (T1):** 11 of 11 frozen scenarios (`evaluation/phase265/`); 0 measurements
    in the real store (no real body to re-ingest).
- **Phase264 gate:**
  - sitemap requests only for sitemaps the gate itself established;
  - domains only via `acceptBrandDomains` (from its own Wikidata responses);
  - expiry is rechecked after the delay;
  - the `fileUsageLedger264` budget is per policyId, across executions.
- **Phase225:** a percent value followed by a space is now matched; it was silently lost before.

## 000000000000000. Phase264 update (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase264/PHASE264-TECHNICAL-REPORT.md`; next brief
`docs/phase264/CONTINUATION-PROMPT.md` (Phase265: persist Phase225/226 test leads, then teaching).

- **New:** `phase264_metadata_pilot.ts`. It provides:
  - the operation-specific policy `pee264.metadata-discovery-policy.v1` (at most 7 days, strict fields, protected file
    via the shared `readProtectedPolicyFile257`);
  - `MetadataPilotGate264`, the only network path. It checks scope, expiry, the Date skew, global, Wikidata and
    per-domain budgets, spacing and the byte cap, and stops on 403/429/5xx/Retry-After/maxlag;
  - the Wikidata P856 assessment, which treats P856 as an unverified claim;
  - sitemap leads through Phase75 and Phase261.
- **Runner:** `scripts/phase264-metadata-pilot.mjs` (single run, plus an offline `--rehearse` mode).
- **First genuine run:** 1 request; Wikidata returned 429 with Retry-After; pilot halted; 0 domains and 0 URLs; every
  integrity limit held. The private report is in `privateEvaluationDir249()/phase264` and in pee-knowledge
  `private-eval/phase264/`; public counts are in `evaluation/phase264/`.
- **Policy** r2 expires on 2026-10-23. A copy is in pee-knowledge `policy/`. Do not re-run it without the owner's
  explicit confirmation.
- **Phase69:** `SourceResponse` now carries `date` and `retryAfter`.

## 00000000000000. Phase263 update (2026-10-16) — read first

Reports: `engine/product-evidence-engine-v5.67-phase243/docs/phase263/PHASE263-ASSESSMENT.md` (legal and discovery
analysis, decision table) and `PHASE263-TECHNICAL-REPORT.md`; next brief `docs/phase263/CONTINUATION-PROMPT.md`
(Phase264: Wikidata + sitemap metadata pilot, gated on the owner's approval sentence).

- **Retention is not the bottleneck:** 2,385 of 2,385 observed declarations are retained, and Phase249 holds up
  against the primary texts.
- **The pipeline loses test knowledge:** Phase225/226 test-result leads are never persisted; 4 test revisions gave 0
  observations.
- **Discovery leads are corrected:** a document's role is `role_unknown` (the publisher's type is context only);
  `publisherRecognised` is kept apart from `documentRegistered`; leads carry full provenance; the provider is a
  parameter (`searchForTarget262({provider})`).
- **New:** `phase263_operation_gates.ts`, a read-only report of six separate operation gates; across 90 sources, the
  binding gates are discovery (no registry) and access (reads disabled).
- **`reconcileRetentionGaps249`** now closes rights gaps whose cause is gone (3 on the real copy; the live store is
  not changed yet).

## 0000000000000. Phase262 update (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase262/PHASE262-TECHNICAL-REPORT.md`; next brief
`docs/phase262/CONTINUATION-PROMPT.md` (Phase263: first genuine metadata-only search, gated on the owner).

- **Capability B exists as an adapter.** Phase223 `searchCandidateUrls223` speaks SearXNG JSON, but no provider is
  configured or permitted, and no real search has ever run (S31).
- **`searchWithPlan223`** takes pre-planned queries; `SearchConfig223.language` is optional (default `en`).
- **`phase262_job_search.ts`:**
  - `planJobSearch262` builds typed job queries (declared identifier, or brand and name; category; criterion; no
    user text);
  - `searchForTarget262` classifies candidates as new domain or known source, rejects already-seen URLs and other
    models, and keeps unknown identity unknown; live is refused;
  - `historicalAssessment262` is metadata only.
- **Phase261 attribution** is exported as `attributeUrl261`.
- **Fixture pilot:** typed beats generic only when an exact identifier exists. 0 wrong attributions.
- **Historical assessment:** 17 of 19 jobs are absent from known sources and 2 are blocked by identity; none is
  explained by rights or extractor age.

## 000000000000. Phase261 update (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase261/PHASE261-TECHNICAL-REPORT.md`; next brief
`docs/phase261/CONTINUATION-PROMPT.md` (Phase262: first genuine discovery pilot, gated on owner decisions).

- `src/phase261_discovery_bridge.ts`:
  - `discoveryTargetFromJob261` maps a genuine Phase182 job (id re-derived) to a typed target: evidence lane, Phase82
    channels, exact identifiers, market from the policy, no language filter;
  - `discoverForTarget261` reads through Phase82 → Phase75/221 (offline fixture only; live is refused under Phase257);
  - `assessDiscovery261` lists the blockers.
- It provides **capability A** (new documents from known, authorised channels). **Capability B** (new publishers or
  domains) does not exist in PEE.
- **All 19 jobs map; 0 can be served.** There is no operator `Registry220` for PEE categories, no known host has a
  source policy, and reads are disabled. 15 of 19 products have no cross-host exact identifier.
- **Not expressible yet:** requirement qualifiers (test conditions, assessor expertise, cultural tradition) in
  `ResearchGap181`/`ResearchJob182`.
- **No Phase82 channel types** for regulatory notices, video, news or cultural experts.
- **Phase260 retries:** identical retries of superseding records are now idempotent.

## 00000000000. Phase260 update (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase260/PHASE260-TECHNICAL-REPORT.md`; next brief
`docs/phase260/CONTINUATION-PROMPT.md` (Phase261: connect jobs to existing discovery).

- Store schema **v4**: `source_memory260` is a read-only projection of four new journal event kinds
  (`source_annotation_recorded`, `screening_decision_recorded`, `source_state_changed`, `source_contribution_verified`).
- Module `src/phase260_source_memory_store.ts`:
  - write with `recordSourceMemory260` (validated inside one `BEGIN IMMEDIATE` transaction, idempotent);
  - recover with `checkSourceMemory260`, `rebuildSourceMemory260` and `recoverSourceMemory260`;
  - read with `descriptorWithMemory260`, `screeningLedger260`, `sourceStateLedger260` and `contributions260`.
- Review claims need an operator verifier; there is no default. Records never copy canonical fields and never
  authorise access, evidence or ranking.
- The live store is migrated and has **0 memory records**. All 189 retained links give a descriptor identical to
  Phase259's.

## 0000000000. Phase259 update (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase259/PHASE259-TECHNICAL-REPORT.md` (persistence
requirements in it); next brief `docs/phase259/CONTINUATION-PROMPT.md`.

- On real retained metadata, Phase258 represents 6/6 sample records via `descriptorFromRetained259`, with roles
  `role_unknown` and `not_retained` and the optional `retained` block.
- No source has a retained country, language, market, rights policy or screening decision.
- Selection never re-proposes already-read pages, table attributions or restricted hosts. All 19 Phase257 jobs have
  no fresh candidate: new source discovery is needed.
- Nothing is persisted yet; Phase260 adds journal events plus a projection.

## 000000000. Phase258 update (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase258/PHASE258-TECHNICAL-REPORT.md` (plus
`REUSE-AUDIT.md`); next brief `docs/phase258/CONTINUATION-PROMPT.md`.

- `src/phase258_source_contributions.ts`: source descriptor (12 roles, 8 statement kinds, publisher country, BCP 47
  language with `und`, product market, Phase197 expertise basis, cultural tradition requiring specialist validation,
  sponsorship, originality, access), mapped onto Phase196 by `materialRoleFor196`.
- `src/phase258_source_memory.ts`: source states (append-only), contribution feedback (no scores) and dry-run
  selection per Phase257 job.
- Validated on synthetic fixtures only; nothing persisted.
- Language capability (`LANGUAGE_CAPABILITIES258`): English-only semantics; no detection, no translation.

## 00000000. Phase257 update (2026-10-16) — read first

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase257/PHASE257-TECHNICAL-REPORT.md`; next brief
`docs/phase257/CONTINUATION-PROMPT.md`.

- Research planning works under the operator policy: `src/phase257_research_planning.ts` and
  `scripts/phase257-research-policy.mjs verify|restore|demo`.
- The operational policy lives at `~/.local/share/product-evidence-engine/research-policy/research-policy.json`
  (restore from `pee-knowledge/policy/`). It expires 2026-11-15.
- Demo on real retained needs: 19 `missing_declaration` jobs, 0 reads, store unchanged.
- Execution is a dry run only: reads, workers and transport are forced off.
- Missing before real research: curated sources with cleared source policies, an owner decision on reads, a review
  and admission path, identity review.

## 0000000. Phase256 decision (2026-10-16) — read first

`engine/product-evidence-engine-v5.67-phase243/docs/phase256/PHASE256-ARCHITECTURE-DECISION.md` (design only, no code
change). Next: Phase257 implements `loadResearchPolicy257`, `planResearchFromNeeds257` and `executeUnderPolicy257`
plus the gap-kind semantics fix, with `allowSourceReads:false`. Owner decisions open: policy location and first
policy.

## 000000. Phase255 update (2026-10-16) — read first; adds to §00000

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase255/PHASE255-TECHNICAL-REPORT.md`; next brief
`docs/phase255/CONTINUATION-PROMPT.md` (research-planning authority, design first). Store unchanged (`38495fe`).

- `decideAdvice249` codes:
  - new codes `unit_missing`, `axes_unlabelled`, `range_straddles`;
  - ranges compared by direction;
  - name volumes (ml, cl) and name wattages (`powerFromName249`) used only without a declaration;
  - gross dimensions are packaging.
- `adviseFromRequest253` checks stated limits in registry categories without category knowledge.
- Phase254 destinations: research, user_clarification, reextraction, **source_reinspection**, not_actionable.
- Fresh set (12, developer gold): responses 3 → 12, product statuses 3 → 25 of 25, unnecessary research 2 → 0,
  0 wrong inclusions.
- Phase253 set (development): checks 132 → 137 of 138, harm 0.
- Open: `source_reinspection` has no executor, and research planning still lacks an authority.

## 00000. Phase254 update (2026-10-16) — read first; adds to §0000

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase254/PHASE254-TECHNICAL-REPORT.md`; next brief
`docs/phase254/CONTINUATION-PROMPT.md`. Store unchanged (pee-knowledge `38495fe`).

- `collectResearchNeeds254` (`src/phase254_research_needs.ts`) turns `Advice253.researchInputs` into
  `pee254.research-needs.v1`. Destinations: research, user clarification, reextraction, not actionable. Needs have
  exact product and criterion, are merged across requests and bounded by a budget.
- Research needs are `pending_authorization`: no signed Phase181 catalog exists (S24).
- First run on real retained products (developer gold, spent T1 requests): 32/34 correct, 0 missed, 1 false,
  2 wrong destination, attribution 33/33.
- Known gap: values readable in product names or unit-less texts are coded `no_declaration`.

## 0000. Phase253 update (2026-10-16) — read this first; it supersedes §000 and earlier where they differ

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase253/PHASE253-TECHNICAL-REPORT.md`. Next brief:
`docs/phase253/CONTINUATION-PROMPT.md`. Module inventory: `docs/phase253/MODULE-INVENTORY.md`. Store: pee-knowledge
`38495fe` (189 products, 2,385 declarations, 1,373 events).

- **Request → advice now works end to end:** `adviseFromRequest253` (`src/phase253_request_advice.ts`) reuses
  `runJourney248`, `extractConstraints253`, Phase177 (`state_in_request`, provenance `user_request_statement`),
  `eligibleCandidates253` and `decideAdvice249`. The output is `Advice253` (`ordered:false`, `rankingAuthorized:false`).
- **First run (Phase253 advice set, 43 cases, pre-registered, gold sealed):** N against P: correct response 35 against
  8; constraints 25/26 against 0/26; product checks 121/138 against 0/138; justified positives 14 of 17 against 0;
  harmful 0 and 0.
  - The positives are T1 (synthetic requests on real evidence, same author). Not held-out.
  - The 16 new real requests (T2) contained no checkable limit; real limit-stating requests are scarce in the lawful
    pool.
- **Development after the first run** (spent cases): axis-labelled dimensions (`axisValue249`), purchase-target rules
  and bare ranges as candidates bring T1 to 27/27 with harm 0.
- **Coverage gap:** the operational registry lacks `headphones` and `microwave_ovens`, which the store holds (owner
  decision).
- **Disconnected:** only 11 of 245 modules execute on the advice path. The next link is research execution
  (`phase182_gap_research_orchestrator`).
- **Teaching packages:** the interface exists (`phase253_teaching_package.ts`); none has been processed. Reserved
  untaught: `rice_cookers`, `pressure_cookers`, `food_processors`, `steam_cookers`.
- **Public/private rule:** committed advice runs are public forms; full runs go to `$PEE_PRIVATE_EVAL_DIR/phase253`.
- **Spent sets:** sets 1–5, the Phase252 teaching set and the Phase253 advice set.

## 000. Phase252 update (2026-10-16) — read this first; it supersedes §00 and §0 where they differ

Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase252/PHASE252-TECHNICAL-REPORT.md`. Next brief:
`docs/phase252/CONTINUATION-PROMPT.md`. Store: pee-knowledge `4c78d47` (189 products, 2,385 declarations).

- **D′ first run (set 5, 30 real requests, T2):**
  - correct: A 11 / R 14 / D′ 21;
  - harmful: 13 / 11 / 4;
  - advise correct: 3 / 4 / 8 of 9;
  - need recall still about 0 (D′ 1/7 listed).

  Set 5 fell short of its target (11 in-scope). The lawful Stack Exchange pool of kitchen purchase questions is nearly
  used up.
- **ADOPTED_LESSONS250 exceeds LESSON_BUDGET250** (`within:false`), so D′ is not budget-equal to B and C.
- **Identity:**
  - Sharp MS02EB/QS204AEB split by `splitProductIdentity252` (journaled; reversible with `reverseProductSplit252`);
  - the ingest guard keys a page by its URL model code when a generic name would merge different model pages;
  - the identity warning counts only the product's own (`main_product`) pages;
  - still open: 63 table-only products and 3 product-line records.
- **Teaching (pilots microwave_ovens and headphones):**
  - Module: `src/phase252_category_teaching.ts`, with arm L (lexical) and arm G (research-guided, sources with URLs,
    typed statements).
  - Compiled by `registryWithTeaching252` and `applyTeaching252` into the existing registry, store items and
    hypothesis relations.
  - NOT applied to the operational registry or store.
  - First run on 28 untouched requests:
    - decisions equal for L and G: 20 correct and 7 harmful each, all harmful on controls;
    - explicit needs: L 28/44, G 20/44;
    - only G gives requirements, applicability cautions and declared-spec checks.
  - Generalisation without category names is unmeasured (1 case).
- **Journey and decision additions:**
  - `needQuestions` per taught need;
  - "missing evidence for X" plan entries;
  - indifference markers drop a need;
  - plural category names match the singular;
  - `battery_life_min`;
  - the "up to" upper-bound rule.
- **Review semantics:** `src/phase252_review_semantics.ts` adds 7 bounded lexical faithfulness checks inside
  `extractReview110`. They are not entailment and not truth. Evidence is T1 only.
- **Spent:** sets 1–5 and the Phase252 teaching set. The 24 review-semantics cases are now development.
- **Reuse map additions:**
  - identity split and guard: `phase246_knowledge_store.ts`;
  - teaching: `phase252_category_teaching.ts`;
  - faithfulness: `phase252_review_semantics.ts`;
  - Stage 4 arms and scorer: `scripts/phase252-teaching-arms.mjs` and `scripts/phase252-teaching-score.mjs`.

## 00. Phase251 update (2026-10-15)

**Phase251 is complete.** Report: `engine/product-evidence-engine-v5.67-phase243/docs/phase251/PHASE251-TECHNICAL-REPORT.md`.

**First run on untouched set 4** (50 Stack Exchange questions; T2; 5 advise cases):

| Arm | Correct (of 50) | Harmful | Advise correct (of 5) | Needs |
|---|---|---|---|---|
| A, Phase249 | 40 | 9 | 1 | 0/4 |
| R, repairs only | 44 | 5 | 1 | 0/4 |
| D, repairs + ADOPTED_LESSONS250 | 46 | 3 | 4 | 3/4 |

- Repairs and lessons each help.
- **Set 4 is now spent.**

**Current code D′** (development: `dropCues` "coffee", budget tiers and ranges, complements in short queries):
- set 4: 48/50 correct, 0 harmful;
- set 3: 2/73 wrong attributions;
- **no untouched first run yet**.

**Category assignment** (`src/phase251_category_assignment.ts`, store method `assignProductCategory251`):
- 57/57 correct, 0 wrong (development gold);
- 842 of the 1,020 uncategorised declarations now categorised;
- applied to the live store and synced (`pee-knowledge` `7efa0c3`).

**Useful observational knowledge.** Categories with checkable factual criteria went from 5 to 13; observed attributes
are counted on 2+ products from 2+ hosts. No relation is supported: 0.

**Identity defect.** Phase246's host+name key merged two Sharp microwave models into one product.
`candidatesFromStore249` / `decideAdvice249` now flag such products as unknown. Splitting them needs the pages
re-fetched.

**T3 data.**
- QueryNER (CC BY 4.0): product-type versus modifier only. Not-product wrong attributions 4/4 → 1/4 after the
  development fix.
- ESCI: not read (large parquet).
- WDC PAVE: licence not found.
- No human need benchmark exists.

**Review semantics.** The deployed runtime caught 2 of 12 meaning mutations (numbers and grounding only) and gives 0
interpretations without a model.

**New scripts:**
- `phase251-collect-requests`;
- `phase251-score`;
- `phase251-category-assignment`;
- `phase251-observational-knowledge`;
- `phase251-queryner-eval`;
- `phase251-review-semantics-diagnostic`.

**New CLI command:** `phase246-knowledge.mjs retire-item`.

**Tests:** 4,385 pass.

**ECC plugin.** It is installed; its GateGuard hook asks for facts before the first edit of a file and before the first
Bash command. Answer briefly and retry.

**Next, ranked:**
1. Set 5, appliance-heavy and pre-registered, first-running D′.
2. Registry lessons for the 8 newly checkable store categories.
3. Phase110 deterministic coherence checks.
4. A lightweight ESCI reader.
5. Re-fetch to split the merged identity, and audit `host_name` identities.

## 0. Phase250 update (2026-10-15)

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
| Knowledge store (product + category) | `phase246_knowledge_store.ts` (KnowledgeStore246, schema v4 since Phase260, journal, re-derivation, `backupRotate249`, `verifyStoreFile249`, `restoreStore249`, `reconcileRetentionGaps249`), `phase246_category_seeds.ts` | `node:sqlite`. Refuses to open inside a Git work tree. |
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
