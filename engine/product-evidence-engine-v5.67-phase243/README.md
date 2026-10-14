**Phase 170 / v4.94:** Executable Phase169-signed research-receipt → protected SQLite transactional replay ledger (Python stdlib) + user-facing unconfirmed review-draft projection. Rejects receipt replay, stale session revisions, changed hashes, and partial admissions, including concurrent processes. Research-only; **no real login, human identity proof, independent publisher rights/method certification, ranking or public recommendations**. Python ledger is NEVER a public endpoint; require a server-verified Phase169 request and operator-owned private database. See `PHASE170-DURABLE-REPLAY-AND-EXPLICIT-REVIEW.md`.

**Phase167 / v4.91:** A source-span and declared-variant-safe Phase145→Phase166 numerical research preview is available as `previewOriginalReviewMeasures167`. It does not authenticate original tests, approve evidence, exclude products or authorize ranking. See `PHASE167-ORIGINAL-SOURCE-TO-USER-CRITERIA-RESEARCH-BRIDGE.md`.

# Phase 164 — v4.88 (cross-category English user-request journey, research-only)

**New:** `src/phase164_user_request_journey.ts` now routes English requests through existing Phase128 reviewed category-schema projections and Phase125–127 compositional dialogue, preserving scoped followups, per-category preferences, budget corrections, presented candidate referents and provenance. It distinguishes an air fryer from a traditional fryer even when aliases nest, and blocks ambiguous mixed-category requests rather than guessing. It retains evidence/source preferences such as **no customer reviews**; because the Phase122 local passage index cannot independently verify publisher roles, independent-professional-only requests do not retrieve unqualified text. Unhandled phrases remain explicit research/review obligations. All interpretations are *unverified user-intent hypotheses*: no products ranked, no canonical sources authenticated, no neural weights executed, no online search performed. Source-review receipt fields are structurally checked, **not independently authenticated**.

`npm run test:phase164` runs new user-journey guards. Offline driver: `node scripts/phase164-request-journey.mjs --registry research/phase164/PHASE164-CONSTRUCTED-CATEGORY-REGISTRY.json --turns research/phase164/PHASE164-CONSTRUCTED-QUESTION-JOURNEYS.json --out /tmp/phase164-journey.json` (create a fresh output path). The supplied six-category registry uses **FAKE, explicitly labelled fixture review receipts**, so it is a software diagnostic and must not be used for live product recommendations. A 13-event scripted diagnostic and the new 21 focused TS tests passed; the prior 2,092 eligible TS tests and 103 Python tests also passed. See `PHASE164-USER-REQUEST-JOURNEY.md` and `PHASE164-RELEASE-VERIFICATION.json` for caveats and the remaining work on real user-query benchmarks, authorized acquisition, evidence-backed ranking and UX. No desktop/Colab access is required for this phase.

---

# Phase 163 — v4.87 (GLiNER2.5 optional typed relation proposals; unverified until checkpoint run)

`python scripts/phase161_neural_worker.py --with-relations ...` enables local `extract_relations()` from the same already-loaded GLiNER2.5 model used for entities (no new download, service or model dependency in PEE). Source-aligned `product_has_feature`, `feature_has_measurement`, and `product_compared_with` proposals are checked for exact UTF-16 offsets, fixed type inventory, source traceability and entity-label compatibility before PEE exposes them as **unverified candidates**. A mismatch does not create an identity or science fact. A tampered relation quarantines that document, while other batch records continue. Relation-enabled/disabled cache results are disjoint. `scripts/phase163_relation_eval.py` evaluates source-bound typed links against **separately supplied** annotations, never asserting their independence. The previous Colab run did *not* execute GLiNER2.5 relations, and this development environment still lacks pretrained weights: only deterministic API stubs and source-bound coordination have been tested, not model relation accuracy on real professional reviews.

Run `npm run test:phase163`; see `PHASE163-NEURAL-RELATION-INTEGRATION.md`, `PHASE163-RELEASE-VERIFICATION.json`, and `PEE-START-NEW-CHAT-PHASE164.md`. All historic reports remain; no third-party repository archives, model weights, publisher-full-review text, ranking or canonical DB changes.

---

# Phase 162 — v4.86 (private benchmark-corpus preparation and paired exact-span evaluation)

**New:** `scripts/phase162_corpus_prepare.py` builds source-bound private manifests in 100-document batches, rejects document duplicates and split leakage across publisher groups/product families, and enforces owner/permission/public-domain declarations for whole editorial reviews. `scripts/phase162-native-export.mjs` exports raw native spans against precisely the same documents as the external neural worker. `scripts/phase162_benchmark.py` compares native and neural against separately supplied, source-hashed annotations, showing coverage gaps and exact-span TP/FP/FN on the paired subset. None of this authenticates actual publisher permission or human annotation independence.

Phase162 replayed **only the two previously executed GLiNER2.5 Colab constructed examples** (no new model inference): matched developer-constructed spans, 4/8 neural vs 1/8 native for product-model mentions; other label breakdown in `PHASE162-CONSTRUCTED-PAIRED-DIAGNOSTIC.json`. These figures are diagnostics **not independent accuracy**. The actual GLiNER2.5 checkpoint remains unavailable on this machine and complete rights-permitted, independently annotated professional reviews are still absent. Ranking, canonical evidence approval and identity merging remain blocked.

Run `npm run test:phase162` or see `PHASE162-PRIVATE-CORPUS-AND-PAIRED-EVALUATION.md`. As before, no model weights, full external GitHub repositories or full third-party copyrighted reviews are in the lean cumulative ZIP.

---

# Phase 161 — v4.85 (persistent local offline neural worker; actual pretrained checkpoint not run)

**New:** a long-lived Python worker `scripts/phase161_neural_worker.py` that can load an already reviewed local GLiNER2.5 checkpoint once and process successive private filesystem batch jobs. It verifies source digests and operator checkpoint locks, caches candidates per checkpoint+implementation+document hash, isolates failures and writes auditable outputs. The new `scripts/phase161-coordinate.mjs` joins these hypotheses to Phase160 only if a matching operator audit is provided. The Phase159/160 TypeScript API now distinguishes local offline worker output from older Colab results and rejects missing/mismatched worker receipts. Science/ranking approval remains disabled. **The trained checkpoint is unavailable here; tests use stubs.** No publisher-complete independent benchmark exists. See `PHASE161-PERSISTENT-LOCAL-NEURAL-WORKER.md` and `PEE-START-NEW-CHAT-PHASE162.md`.

Development validation: 2,087 eligible TypeScript tests / 121 files (legacy 91/92 excluded); 90 Python tests; a 100-document deterministic fake-extractor dry run produced 100/100 cache hits on the repeat. This tests orchestration only, **not neural language accuracy**. Full external GitHub archives and model weights remain excluded from the cumulative ZIP. Run `npm run test:phase161`.

---

# Phase 160 — v4.84 (bounded reusable batch pipeline; live-model batch execution not yet verified)

**New:** `src/phase160_batch_review_pipeline.ts` accepts 1–100 source-hashed English review documents per manifest and can combine native PEE output with external GLiNER2.5 spans, when actually available. It uses Phase159 scope, context and evidence safeguards. Mixed documents are processed separately; invalid neural spans are quarantined per document; results exclude full copyrighted review text, and no identity merges, database or ranking writes occur. `scripts/phase160_gliner_batch.py` adds an opt-in local weights, multi-document runner with bounded overlapping windows and Python-to-JS offset conversion; it was tested with a fake model, **not the real neural checkpoint on full reviews**. `scripts/phase160-batch.mjs` executes repeatably without network access. The source manifest distinguishes original constructed examples, publisher short excerpts and rights-permitted full reviews.

A light adaptation of ExtractGPT's Apache-2.0 attribute classification buckets is implemented in `src/phase160_attribute_eval.ts` for **evaluation only**. The WDC PAVE repository has no explicit licence in the uploaded archive, so no code from it was copied. MAVE's CC BY-NC-4.0 materials remain excluded from the commercial engine. The duplicate WDC Products archive had an identical SHA-256. Full upstream repositories are not included in the release. See `PHASE160-BATCH-REVIEW-AUTOMATION-AND-SOURCE-AUDIT.md` and `PEE-START-NEW-CHAT-PHASE161.md`.

Run `npm run test:phase160`; example: `npm run build && node scripts/phase160-batch.mjs --manifest research/phase160/phase160_five_case_diagnostic_manifest.json --neural research/phase159/GLINER25-COLAB-CONSTRUCTED-PILOT.json --out phase160-results.json`. The all-file TS regression preceded a final one-line source-status correction, after which 19 focused Phase159/160 tests passed; see `PHASE160-POSTPATCH-VALIDATION.json` for the incomplete second full-regression attempt. The combined five-case diagnostic uses exactly two previously executed **constructed** neural cases and three **native-only** short real-publisher excerpts; it is not an independent benchmark.

---

# Phase 159 — v4.83 (real external GLiNER2.5 output, safe PEE coordination)

**New:** `src/phase159_colab_gliner25_coordinator.ts` accepts the user's actually executed GLiNER2.5 Small Colab JSON, rigorously checks source-bound entity offsets and provenance assertions, joins model candidates with Phase156 heuristic document review, medSpaCy-derived scoped context and Snorkel-derived vote diagnostics, and emits review-tested / not-tested / comparison-only / contradictory cue ledgers plus conservative feature/quantity pair candidates. No identity merge, scientific fact approval, database or ranking write. This is imported *external* neural inference, not GLiNER weights running in the PEE server. Two diagnostic inputs are constructed; separate publisher excerpts test the native reader only. Inference on complete authentic independent reviews remains open.

Tests: 2,078 eligible TypeScript across 119 files (12 new Phase159 tests), 81 Python. Lightweight cumulative archive retains prior PEE history and licence obligations without nine third-party repository ZIPs or 296 MB weights. Read `PHASE159-GLINER25-COLAB-TO-PEE-COORDINATION.md` and both `PHASE159-*DIAGNOSTIC.json` files; run `npm run test:phase159` or `npm run demo:phase159`.

---

# Phase 158 — v4.82 (offline model gate; external matching baseline; lean cumulative distribution)

**New:** `src/phase158_offline_inference_coordination.ts` joins the Phase156 document engine, optional Phase157 structured claims, and optional locally generated GLiNER2 mentions. The proposed spans are source-checked but remain **unverified hypotheses**, never authorised to merge identities, write scientific evidence, or change ranking. The optional Python checkpoint runner accepts only a preexisting local weights folder, forces HF offline mode, and has **not** been run with weights in this release. Missing checkpoint and dependencies explicitly block neural verification; they do not imply neural accuracy.

**Product-pair diagnostic:** a separate research-only, supervised logistic classifier trained on the original Ditto bundled WDC train-small split. At a validation-chosen high-precision threshold it finds 135 true positive matches and four false proposed matches on 4,251 pre-existing labelled test pairs while abstaining on 4,112. Its threshold fails the 98% precision target on the held-out test, and only 11.68% of gold positives are covered. No trained weights are distributed and WDC record/model-training rights remain to be cleared. The script needs the external Ditto ZIP supplied separately. This does NOT evaluate PEE's ranking or full professional reviews.

**HTML:** `scripts/phase158_extruct_jsonld_port.py` is a bounded, limited adaptation of the upstream extruct JSON-LD extraction approach that reads caller-provided HTML without network access. It passed constructed PEE HTML fixture tests; **full upstream extruct** and Microdata/RDFa are not installed or claimed.

**Lean ZIP policy:** full third-party GitHub source archives have been removed from the cumulative distribution. `PHASE158-EXTERNAL-REPOSITORY-PROVENANCE.json` retains SHA-256 hashes and `licences/phase158_upstream/` retains the original licence notices. No public UI attribution is added. If source inspection is needed in a new conversation, request only the required original ZIP files. All PEE canonical history is kept. Historical bytecode caches generated by tests are omitted.

Read `PHASE158-OFFLINE-MODEL-AND-EXTERNAL-MATCHING-REPORT.md`, `PHASE158-TYPESCRIPT-REGRESSION.json`, the WDC diagnostic JSON and `PEE-START-NEW-CHAT-PHASE159.md` before further development. Run `npm run test:phase158`; the two longstanding Phase91/92 suites are excluded from the cumulative regression.

---

## Phase 157 / v4.81 (2026-10-11)

Original user-uploaded OA-Mine, Ditto, extruct, WDC Products, PyABSA archives are now retained byte-identically under `research/upstream_source_archives/` with SHA-256 inventory and legal/source caveats. Adds an **opt-in** `analyzeEnglishReviewWithExtruct157()` analytical bridge consuming already-extracted extruct JSON-LD/Microdata objects; extruct itself is not installed or run, and no new model weights or services were introduced. Also adds a reproducible external historical Ditto/WDC title-pair diagnostic (4,251 valid labelled pairs) exposing false entity-merges from a simple model-token overlap baseline; this diagnostic is **not** a PEE-model score or publisher-review gold. See `PHASE157-GITHUB-PRODUCT-INTEGRATION.md`, `PHASE157-WDC-EXTERNAL-PAIR-DIAGNOSTIC.json`, `PHASE157-UPSTREAM-ARCHIVE-INVENTORY.json`, and `PEE-START-NEW-CHAT-PHASE158.md`. All automatic canonical writes and ranking effects remain disabled.

## Phase 156 / v4.80 (2026-10-11)

Cumulative, explicit opt-in `analyzeEnglishReview156()` integrates portable **actual** GLiNER2 overlap and word-window algorithms and the DeepKE DocRED document-evidence structure into the prior medSpaCy/Snorkel coordinated review reader. Port algorithms ≠ trained neural models or their quality. 180/180 deterministic overlap parity versus preserved GLiNER2 Python source; 2,052 eligible TypeScript tests, 77 Python tests. Real refrigerator, air fryer and espresso machine developer-selected publisher excerpts reveal improved all-word title correspondence but still false `At 60dB` / `Casabrews 5418 Pro I` candidates and no independent full-review quality metric. Sources remain private; no canonical writes or ranking effect. See `PHASE156-SOURCE-PORTS-FULL-DOCUMENT-AND-REAL-PRODUCT-PILOT.md`, `THIRD-PARTY-PHASE156.md`, and `PEE-START-NEW-CHAT-PHASE157.md`. Run `npm run test:phase156`; supplied local review text via `node scripts/evaluate-phase156.mjs --file ... --title ... --url ...`.

## Phase 155 / v4.79 (2026-10-11)

Adds explicit `analyzeEnglishReview155`: coordinated Phase153 commercial-entity inventory, actual medSpaCy-derived scoped context and Snorkel-derived LF vote diagnostics from the user-provided open-source GitHub archives, plus review-aware, layout-safe mentions, tentative model comparison links, variant-table reading and bounded label/value measurement candidates. A real Maytag RTINGS review pilot and LG STUDIO challenge use genuine **selected editorial excerpts**, not independently annotated entire reviews; publisher source text is not redistributed. The link between original text and claims is source-offset and SHA backed. Two legacy Phase91/92 tests excluded; final eligible regression **2,037 TS tests across 114 files and 77 Python tests passed**. All scientific approval/ranking/database gates remain closed. Run `npm run test:phase155`, see `PHASE155-REVIEW-ORCHESTRATION-AND-REAL-REFRIGERATOR-PILOT.md`, machine diagnostics and `PEE-START-NEW-CHAT-PHASE156.md`.

## Phase 153 / v4.77 (2026-10-11)

Adds opt-in, original TypeScript English commercial-entity inventory (`src/phase153_entity_inventory.ts`) that combines candidate token sequences, source-title/alias correspondence, written-surface grouping, variant warnings and **monotone, non-authoritative** Phase152 reference screening. No new libraries, model weights, network dependencies, automatic database writes or ranking changes. 36 focused tests; independent full-review accuracy remains unmeasured. A separate post-code original-publisher snippet challenge exposed a missed `iRobot Roomba j9+` full-span name. See `PHASE153-ENGLISH-COMMERCIAL-ENTITY-INVENTORY.md`, source/diagnostic JSON and `PEE-START-NEW-CHAT-PHASE154.md`.

Run `npm run test:phase153`, `npm run demo:phase153`, `npm run regress:phase153`. Full eligible suite measured in bounded groups: 2,011 passing across 112 test files, two legacy suites excluded. Python: 77 passing. First all-in-one group orchestration timed out, then pending groups were run separately and recorded; do not represent the partial run as a single successful uninterrupted test command.

## Phase 152 / v4.76 (2026-10-11)

Cumulative Phase151 plus native English source-offset safety screening for missed commercial model surfaces and false document-reference links. 24 targeted tests; post-code six-editorial-excerpt diagnostic, no independent full-review accuracy claims. **No external inference or canonical writes.** See `PHASE152-UNSEEN-PRODUCT-SURFACE-SAFETY.md`.

## Phase 151 — conservative type-aware document reference recovery (v4.75, 11 Oct 2026)

`src/phase151_type_aware_discourse_recovery.ts` adds source-offset-preserving, **unverified** candidate recovery for explicit product-description references in adjacent paragraphs and bounded forward context, while preserving pronoun ambiguity and never transferring experimental measurements or manufacturer claims. Evaluation on previously known *developer-written* Phase150 examples recovers three author-labeled references; there is **no independent original-review accuracy claim**. See `PHASE151-TYPED-DISCOURSE-REFERENCE-RECOVERY.md`. Run `npm run test:phase151`, `npm run demo:phase151`, and `npm run regress:phase151`. No runtime dependency or ranking/database change.

## Phase 150 — document-scale reference evaluation (v4.74, 11 Oct 2026)

`src/phase150_document_reference_benchmark.ts` adds span-grounded annotation/corpus validation, frozen-manifest comparison, source/hostname/product-family holdout leakage protection, and descriptive false-link/missed-link diagnostics over unmodified Phase149 reader outputs. No model integration or canonical write authority.

Run `npm run test:phase150`, `npm run demo:phase150`, `npm run regress:phase150`. The diagnostic uses seven **developer-authored long multi-paragraph** texts and three **short editorial source excerpts**. It is neither an independent gold benchmark nor an evaluation on complete copyright-restricted original reviews. See `PHASE150-LONG-DOCUMENT-REFERENCE-RESEARCH.md` for the explicit negative result and technical priorities.

## v4.72 / Phase 148 — English document reference hypotheses

Adds a bounded, source-offset-preserving TypeScript mention graph across sentences, explicit competing-antecedent and paragraph-boundary controls, conservative pronoun hypotheses, and source-backed diagnostics. No inferred identity or evidence is authorised for canonical knowledge or ranking. Run `npm run test:phase148` and `npm run demo:phase148`. See `PHASE148-DOCUMENT-REFERENCE-RESEARCH.md`.

# Product Evidence Engine v4.71 — Phase 147

Phase 147 adds clause-scoped attribution of technical measurements and explicit abstention for incomplete numeric ranges. It is a quarantined, unverified candidate layer and does not modify canonical product evidence or ranking. See [PHASE147-CLAUSE-SCOPED-EVIDENCE-ATTACHMENT.md](PHASE147-CLAUSE-SCOPED-EVIDENCE-ATTACHMENT.md) and the phase-specific diagnostics and regression reports.

## Phase 146 / v4.70 — candidate compound conditions (11 October 2026)

`src/phase146_compound_conditions.ts` conserves compound CD-player formats, speaker sensitivity notation, HDR brightness window conditions and conservative repeated explicit oven temperature pairs, retaining offsets, provenance and all scientific/ranking gates. See `PHASE146-COMPOUND-SPECIFICATIONS-AND-TEST-CONDITIONS.md`. Future cooking-appliance categories are tracked in `research/phase146_future_category_backlog.json`, not yet used as test evidence. No new runtime dependencies.

# Phase 144 — v4.68: Typed cross-category observation extraction

Added `readCrossCategoryObservations144`: original bounded English TypeScript stage capturing quantity spans, mode/test settings, source-role distinctions and uncertainty across product categories. Previously exposed six short review excerpts yield **12 quantity candidates**, not 12 established facts; one of three newly selected excerpts was parsed and two unhandled units reveal remaining lexical coverage gaps. All results stay unverified and excluded from ranking. Details: `PHASE144-CROSS-CATEGORY-TYPED-OBSERVATION-GRAPH.md`. Run `npm run test:phase144`, `npm run demo:phase144`, `npm run regress:phase144`.

# Phase 143 — v4.67: Cross-category original review transfer pilot

See `PHASE143-CROSS-CATEGORY-ORIGINAL-REVIEW-PILOT.md` for five-category original publisher sources, untuned Phase139–142 diagnostic, Phase143 subject-identity safety guard, executable trace and limitations. Seven new tests and no new runtime dependencies.

## Phase 142 — English lexical predicate scope screening (v4.66)

Additive `readScopedLexicalFrames142` over the attributed Phase141 lexical data.
Separates surface subject, predicate and bounded complement; conservatively
screens object negation, passive voice, uncertain conditionals, quotations,
comparators and coordinated clauses. VerbNet role labels remain possible classes,
not verified parse assignments. Every output stays unreviewed and unauthorized
for science, canonical database writes or ranking. See
`PHASE142-SCOPED-LEXICAL-FRAME-ENGINEERING.md` and
`PHASE142-SCOPE-AND-ROLE-DIAGNOSTIC.json`. Run `npm run test:phase142`,
`npm run demo:phase142`, `npm run regress:phase142`.

## Phase 141 — local licensed English lexical data (v4.65)

Original TypeScript Phase141 reader and an offline-generated local JSON projection
from user-supplied Open English WordNet, VerbNet and VADER. Source data are
attributed, explicitly sense-restricted, and **never authorize canonical product
facts or ranking**. Python/PyYAML are optional only to regenerate the data
artifact offline; not production requirements. `npm run test:phase141`,
`npm run demo:phase141`, `npm run regress:phase141`.

See `PHASE141-REUSABLE-LEXICAL-RESOURCE-BRIDGE.md`,
`resources/phase141/ATTRIBUTION.md`, and `PHASE141-RELEASE-VERIFICATION.json`.

## v4.64 Phase 140 — bounded English structural recall supplement

Phase 140 provides `readBoundedEnglishRecall140` for English limitation, capability, feature presence/absence and comparison surface cues missed by Phase 139. It does not replace Phase 139, resolve pronouns, verify sources, authorise facts or change ranking. New three-publisher short excerpt diagnostic is development-selected (NOT independent gold). See `PHASE140-STRUCTURAL-RECALL-ENGINEERING.md`.

# Phase 139 — Unmarked English Review Candidate Reader (v4.63)

**Implemented:** `src/phase139_unmarked_english_candidate_reader.ts` proposes bounded English product-name spans, variant indicators, unresolved pronouns, physical feature phrases, qualitative outcomes and numerical values directly from **unmarked text**. Input requires source text/digest and metadata; caller can supply an existing page-reviewed product identity and exact aliases, but **does not provide any candidate spans or relation labels**. Exact aliases are caller attestations, not independently validated identities. The proposal stage uses the Phase134 contextual-modifier checker, not the Phase131 trained classifier, because textual co-occurrence is not a justified causal relation label. It never writes to category knowledge, product facts or deterministic ranking.

**Evidence:** Six *previously selected* real publisher snippets were reprocessed with automatic span proposal. This is a regression/diagnostic corpus, **not** independent accuracy, general NER, or a representative benchmark. See `PHASE139-UNMARKED-ORIGINAL-EXCERPT-DIAGNOSTIC.json`, `PHASE139-NATIVE-UNMARKED-ENGLISH-READER.md`, and `PHASE139-RELEASE-VERIFICATION.json`. New adversarial tests are developer-authored. No third-party code, weights, commercial API or new runtime dependencies.

Run `npm run test:phase139`, `npm run demo:phase139`, `npm run regress:phase139`.

---

# Phase 138 — Real Publisher Excerpt Diagnostic (v4.62; English first)

**New:** Six short verbatim passages manually checked against three original public professional reviews (RTINGS, Vacuum Wars, TechGearLab). The source registry retains attributed excerpt text, URLs, self-computed excerpt hashes, original product identification, *developer* claim interpretations and strict quote limits. No full publisher page snapshot or independent external annotations were acquired, and no scientific accuracy or model recall can be inferred. The review pages were not automatically crawled in this phase. These excerpts are diagnostic probes, not a representative holdout.

`src/phase138_original_excerpt_pilot.ts` screens a page-identified, explicit first mention through the existing Phase131/132/134 guards without fabricating an earlier mention for Phase135. Unresolved pronouns, unapproved product variants and percent-only measurements with no named endpoint abstain. The single-mention path is **a quarantined hypothesis**, not reviewed evidence. Aliases, intended relations and subjects/objects are developer-supplied and are not auto-extracted. There are no new runtime dependencies, third-party models or canonical/ranking writes.

Run `npm run test:phase138`, `npm run demo:phase138`, `npm run regress:phase138`. See `PHASE138-ORIGINAL-REVIEW-EXCERPT-PILOT.md` and `PHASE138-REAL-EXCERPT-DIAGNOSTIC.json` for concrete findings and limits.

---

# Phase 136 — Independent Evidence-Screen Evaluation (v4.60, English first)

**Added:** `src/phase136_independent_signal_benchmark.ts` creates an evidence-screen evaluation and vote-audit harness around Phases 134–135. It includes source-group/product-family/hostname/document-sha disjointness guards, a corpus manifest digest, breakdowns of abstentions, false accepts, supported-claim retention, baseline/current paired results, and per-source, category and phenomenon slices. It still cannot authenticate source rights, independent human annotations, or holdout freeze chronology. **The 3 reproducible demonstrations are constructed; there are 0 independently evaluated original professional-review passages.** It cannot learn product facts or change ranking.

**Verification:** 38 targeted Phase136 tests; 1,563 passing TypeScript tests across 95 eligible test files; 77 passing Python tests. Phase91/92 legacy timeout-prone files remain explicitly excluded. No new runtime dependencies, pretrained weights, commercial APIs or integrated third-party source code. See `PHASE136-INDEPENDENT-EVIDENCE-SCREEN-EVALUATION.md`, `PHASE136-RELEASE-VERIFICATION.json`, and `PHASE136-CONSTRUCTED-TRACE.json`. Run `npm run test:phase136`, `npm run demo:phase136`, `npm run regress:phase136`.

---

# Phase 135 — Document Mention and Reference Graph (v4.59, English first)

**Added:** `src/phase135_document_mention_graph.ts` builds a bounded, source-anchored document mention graph. It links explicit repeated product names only under matching upstream identity and model variant. English pronouns remain unresolved candidates until a locally recorded human reference adjudication; no document-level relation becomes true without scientific review. The bridge to Phase131→132→134 screens existing same-sentence hypotheses; it does not generate cross-sentence facts.

**Verification:** 29 Phase135 tests, 1,525 TypeScript tests in 94 eligible files, plus the previous 77 Python tests. The same two legacy Phase91/92 tests were excluded. All Phase135 evaluations use constructed data; real professional-review precision and recall have NOT been measured. No new runtime dependencies or third-party libraries, weights, search APIs, or server services.

**Read:** `PHASE135-DOCUMENT-MENTION-REFERENCE-GRAPH.md`; run `npm run test:phase135` and `npm run demo:phase135`. This release includes all previous phases unchanged apart from README/package metadata.

---

# Phase 134 — Native Atomic Context and Evidence Guard (v4.58, English first)

**Implemented:** `src/phase134_atomic_context_evidence.ts`, `tests/phase134_atomic_context_evidence.test.ts`, and `scripts/evaluate-phase134.mjs` connect Phase131 learned relation hypotheses to typed, provenance-anchored lexical context checks and a small signal-vote/conflict audit. Their design draws on technical lessons from the user-provided GLiNER2, medSpaCy, DeepKE and Snorkel source archives, plus the TypeSafe AI documentation study. No third-party code was copied or installed. No model weights, runtime Python AI stack, commercial API or server infrastructure were added.

**Strict scope:** candidate quarantine and blocking only. This is neither general English semantics nor a scientific evidence-verification engine. An input document's metadata and hashes are caller supplied; matching them proves internal consistency, not original-source authenticity, permission, or editorial correctness. Cross-sentence coreference still abstains. An evidence candidate can never authorize ranking or canonical learning.

Run `npm run test:phase134` or `npm run demo:phase134`. Full sources, regression results, actual test limits and outstanding work: `PHASE134-NATIVE-ATOMIC-SEMANTIC-INTEGRATION.md`.

---

## Phase 132 (v4.56): contextual relation safety and GitHub engineering review — 11 Oct 2026

Phase 132 adds a deterministic, reject-only scope/polarity verification to the **actual** Phase131 relation proposal and anchoring path, plus a strictly offline candidate adapter for optional local AI extractors. GitHub projects including GLiNER2, spaCy, medSpaCy/ConText, Snorkel, Stanza, GLiNER and doccano were reviewed. No third-party AI package, LLM, pretrained checkpoint or internet search dependency has been installed. The previously known 18-example synthetic challenge shifts from 4 correct/1 wrong/13 abstentions to 4 correct/0 wrong/14 abstentions, **retrospectively, not independently**. See `PHASE132-GITHUB-AI-ENGINEERING-DECISION.md` and `PHASE132-RETROSPECTIVE-REPLAY.json`.

# Phase 130 — native scientific-reader engineering comparison (v4.54)

See `PHASE130-AI-ENGINEERING-NATIVE-READER-AND-UNSEEN-CORPUS-AUDIT.md`, `PHASE130-POSTFREEZE-CHALLENGE-RESULTS.json`, and `PHASE130-RELEASE-VERIFICATION.json`. The new local reader improves on the baseline in a tiny development set, but recovered only 2/6 expected terms on the separate post-code challenge. Not validated for autonomous online reading or product ranking.

# Phase 129 — v4.53 (11 October 2026)

- `src/phase129_category_growth_cycle.ts`: bounded category-research → locally observed concepts → review-gated category memory → derived dialogue. Includes conservative category-independent technical-term observation.
- `PHASE129-BOUNDED-CATEGORY-RESEARCH-TO-KNOWLEDGE-GROWTH.md`: scientific sources, genuine EPA-methodology example and precise limits.
- Neither unrestricted autonomous web discovery nor end-to-end original product ranking is validated. No new remote dependency.
- Historic Phase91/92 test timeouts remain an outstanding regression issue.

# Phase 127 — v4.51 (11 October 2026)

Research-side in-house orchestration of **category-reviewed ambiguity hypothesis discovery**, Phase111 independently reviewed decision-impact checks, Phase126 one-question policy, and a **serializable multi-turn session state** with selectable reply, show-both, free text, skip, Phase100 swing preferences and explicit correction. The original review knowledge base is unchanged. Impact projections are caller-attested, not automatically generated/authenticated; general semantic understanding and ranking remain unvalidated. Full original research links, scope, and limitations: [PHASE127-EXPERT-SYNTHESIS-MIXED-INITIATIVE-AND-DIALOGUE-STATE.md](PHASE127-EXPERT-SYNTHESIS-MIXED-INITIATIVE-AND-DIALOGUE-STATE.md). Run `npm run test:phase127`.

---

# Phase 126 — v4.50: conversational ambiguity and clarification policy (11 October 2026)

The additive in-house controller `src/phase126_conversational_clarification_policy.ts` connects **existing Phase111 material-ambiguity checking, Phase100 decision-relevant preference elicitation, and Phase125 compositional dialogue framing**. No form or compulsory clarification for general “best robot” questions: one optional grounded multi-choice question only for consequential readings, open-text reply, compare-both and skip options, no repeated issue prompt, plus research-first behavior when actual source measurements are missing. No new LLM or third-party service. **Research sidecar, not full NLP or a deployed ranking UI.** [Methodology, references and limitations](PHASE126-CONVERSATIONAL-CLARIFICATION-AND-AMBIGUITY-REUSE.md). Check with `npm run test:phase126`. 25 new tests and 1,325 eligible TypeScript tests plus 68 Python tests passed; two Phase91/92 legacy TypeScript files remain outside the completed regression.

---

# Phase 125 — v4.49 additive research update (11 October 2026)

New in-house composed question-frame prototype (`src/phase125_compositional_dialogue_frame.ts`) and local BM25 candidate retrieval, without outside APIs or a hosted LLM. It preserves multiple goals, negative requirements, personal operating conditions and verified-context product references as **hypotheses**, never published product verdicts. Prior frozen Phase124 sample: 11/12 expected coarse goals surfaced without detected hazards (non-blind developer diagnostic); see `PHASE125-FROZEN-QUESTION-DIAGNOSTIC.json` and the full linked source/method audit in `PHASE125-COMPOSITIONAL-QUESTION-UNDERSTANDING-AND-EVIDENCE-PATH.md`. 38 new targeted tests and 1,300 eligible TypeScript regressions plus 68 Python checks passed; two older Phase91/92 files remain unverified. Run `npm run test:phase125` and `npm run demo:phase125`. All previous research/implementation preserved.

---

## Phase 124 — real-user-language audit and in-house evidence research continuation (2026-10-11)

- See `PHASE124-AUTHENTIC-PROMPTS-AND-RESEARCH-CONTINUATION.md` and `PHASE124-AUTHENTIC-PROMPT-BASELINE.json`.
- On 12 publicly sourced Reddit questions from 9 threads, the unchanged Phase123 intent learner accepted 2 correctly, accepted 0 incorrectly and deferred 10; small, author-annotated, non-blind sample, not a production accuracy estimate.
- `src/phase124_end_to_end_attempt.ts` connects semantic hypotheses to local BM25 research, carries forward bounded Phase122 research obligations without accepting their meaning as ground truth, traces missing evidence and checks curated passage-to-product integrity.
- `src/phase124_authorized_discovery.ts` reuses existing Phase75 in-house permission-gated sitemap discovery. Only mocked approved-policy examples were executed here, **not** real live crawling.
- No automatic facts, source authentication, article measurement extraction or market rankings are validated in Phase124. No hosted LLM, search/scrape APIs or SaaS introduced.

## Phase 123 (v4.47): native learned intent diagnostic and unknown-goal retrieval bridge

- Added a small **fully in-house** multilingual word/subword TF-IDF prototype classifier over 125 author-constructed examples (100 training / 25 calibration). No hosted LLM or new external runtime service.
- Pilot intent classes are bounded; an unfamiliar task leads to an exploratory **research proposal**, not a declared physical capability, product ranking or claim of comprehension.
- Both Phase122's bounded rule parser and Phase123's learned proposal remain visible so disagreements cannot silently replace prior interpretations.
- Reuses local Phase122 BM25 over caller-supplied rights-reviewed passages; candidate passages **are not** verified evidence. No public web discovery has been executed by this code.
- **Non-blind developer diagnostic:** 4/30 cases accepted with the author-supplied label, 0 accepted with a different label, 26 deferred. This is inadequate coverage, not general model accuracy.
- Scientific audit and sources: `PHASE123-NATIVE-INTENT-LEARNING-AND-OPEN-GOAL-AUDIT.md`; experiments and case-level results: `PHASE123-CONSTRUCTED-CHALLENGE-RESULTS.json` and `PHASE123-PRIOR-REQUESTS-DIAGNOSTIC.json`.
- Check using `npm run test:phase123` or `npm run demo:phase123`. Previous cumulative work preserved. **Not production-ready.**

# Phase 122 — v4.46 additive update (11 October 2026)

An internally implemented, bounded question → evidence-gaps → research plan path has been added (plus native BM25 passage retrieval). NO external LLM, search engine, crawler or commercial API was introduced by Phase122; NO automated source acquisition or market ranking is claimed. See [PHASE122-NATIVE-QUESTION-TO-RESEARCH-EVIDENCE-AND-ARCHITECTURE.md](PHASE122-NATIVE-QUESTION-TO-RESEARCH-EVIDENCE-AND-ARCHITECTURE.md). Test with `npm run test:phase122`; demo with `npm run demo:phase122`.

## Phase 120 — General and personal best/value (v4.44, 2026-10-11)

Research-only typed adapter with two objective lenses and category baseline gates. An explicitly general request is actionable without a forced task clarification; distinct task lanes preserve specialist vs combo differences. Source links, limits and methodology: `PHASE120-GENERAL-VS-PERSONAL-BEST-AND-VALUE-EVIDENCE.md`. Run `npm run test:phase120`. Full free-language, empirical best/value ranking and source-to-SKU verification remain unvalidated.

# Product Evidence Engine v4.43 — Phase 119 (task-scope ambiguity and value)

The new research-only task/view gate and tests are documented in [`PHASE119-OPEN-ENDED-BEST-VS-VALUE-AND-TASK-SCOPE.md`](PHASE119-OPEN-ENDED-BEST-VS-VALUE-AND-TASK-SCOPE.md). No production recommendations or natural-language generalization are claimed. Full v4.42 baseline retained.

---

# Product Evidence Engine v4.42 — Phase 118 (real original-source capability audit)

This version cumulatively extends v4.41 Phase117 with a **manual, linked original-source audit of eight stair/threshold robot systems**, including independent witnessed climbing demonstrations, manufacturer specs, official sale/failed-crowdfunding status, and two independently reported original measured threshold results (57 mm Roborock Saros 20 and 36 mm Dreame X50 Ultra). A threshold is never treated as a staircase; a stair carrier is not presumed to vacuum the steps; a trade-show demo is not a home cleaning test. See [PHASE118-REAL-STAIR-CLIMBING-ROBOT-EVIDENCE.md](PHASE118-REAL-STAIR-CLIMBING-ROBOT-EVIDENCE.md).

Run `npm run test:phase118`; compile `npm run build` and run `node dist/examples/phase118-stairs-demo.js` from the repository root to regenerate the reviewed result snapshot. **No market-wide completeness, cross-lab metric calibration, live sale check or production ranking claim.** Phase117 and all prior files retained.

---

# Product Evidence Engine v4.41 — Phase 117 (research-only)

Cumulative continuation of **v4.40 Phase 116**. The new goal-outcome comparator is category-neutral and connects to Phase116's goal/endpoint graph. It requires an independently measured original outcome, explicitly verified intent, and a reviewed exact comparison contract; it never quietly substitutes speed, passes, or a manufacturer feature for effectiveness. Phase117 includes specific protections for contradictory results, incompatible lab setups or versions, missing products, syndication, and reported uncertainty. See [`PHASE117-GOAL-OUTCOME-COMPARABILITY.md`](PHASE117-GOAL-OUTCOME-COMPARABILITY.md).

This is **not a deployed consumer ranking**; all newly added test measurements are constructed examples. The review-status field is a caller assertion, not an attestation. Validation on real expert product evidence, genuine multilingual user requests, and runtime integration remain open. Run `npm run test:phase117` and `npm run test:phase116`.

---

## New in v4.39 / Phase115

See [`README-PHASE115.md`](README-PHASE115.md) and [`PHASE115-HYGIENE-PROCESS-CAUSAL-EVIDENCE-RESEARCH.md`](PHASE115-HYGIENE-PROCESS-CAUSAL-EVIDENCE-RESEARCH.md). Ordinary floor-hygiene suitability is evaluated as a qualified **process** (before, during, after) and never confused with direct bacterial/viral floor disinfection. New isolated research module; existing launch path not changed.

# Product Evidence Engine v4.32 — Phase108 Query-Neutral Evidence Boundary

**Cumulative baseline: v4.31 Phase107 preserved.** The initial user query must never determine canonical interpretation of reviews/product facts; it may only produce a personalized, revision-pinned decision view or a research-gap proposal. Phase108 adds query-neutral read projection, independent category-wide aspect proposal approval, request/source gap isolation, and a reviewed source-intake adapter. It does not modify public launch ranking or certify source-interpretation completeness.

Read [PHASE108-QUERY-NEUTRAL-CANONICAL-EVIDENCE.md](PHASE108-QUERY-NEUTRAL-CANONICAL-EVIDENCE.md) for the full scientific references, test caveats and migration priorities. Tests: `npm run test:phase108` (18 focused checks); 1,037 cumulative tests passed in completed groups. The Phase108 protected intake is an adapter, not yet an enforced guard on every legacy Phase101 write route.

---

## Phase 107 — v4.31: source-free personalized evidence recomputation (research only)

The cumulative v4.30 repository is retained. Phase107 binds an immutable per-use-case reviewed value profile and calibrated Phase101 product evidence to the Phase98 compensatory model and Phase100's bounded ordinal preference polytope. Phase105 invalidates affected personalized projections and preserves pinned provenance/derived snapshots. Unreconciled duplicate interpretations, absent calibration, changed evidence or unsynchronized journals never produce a newly approved ranking. No review article text or LLM inference is needed at read time. **This remains a research-only comparison (`publicationReady=false`, `rankingEligible=false`)**; no real consumer calibration, rights authorization or multi-store atomic consistency is claimed.

Full primary-linked scientific and technical report: [PHASE107-REVIEWED-PERSONALIZATION-RECOMPUTATION.md](PHASE107-REVIEWED-PERSONALIZATION-RECOMPUTATION.md).

```bash
npm run test:phase107
npm run demo:phase107
```

---

## Phase 106 — v4.30 (research-only incremental recomputation)

The full Phase105 repository is preserved. `src/phase106_recomputation_worker.ts` now recomputes allowlisted direct original-test pair comparisons and deterministic explanations from Phase101's normalized approved claims. `src/phase105_incremental_reasoning_graph.ts` stores source-pinned result payloads and dependency receipts in the graph store; stale projections fail closed. No review article text, LLM invocation or consumer ranking is required for reusing these results. Personalized tradeoffs are not auto-computed without independently reviewed value functions. See `PHASE106-DETERMINISTIC-KNOWLEDGE-RECOMPUTATION.md`.

Run: `npm run test:phase106` or `node dist/examples/phase106-recomputation-demo.js` after `npm run build`.

---

# Phase 105 cumulative extension (v4.29, 11 October 2026)

**Cumulative v4.28 source preserved.** Phase105 adds replay-safe incremental invalidation for knowledge dependencies. Phase101 retains authority over evidence; Phase104 remains the authoritative entity-reasoning journal. Register downstream comparison, trade-off and explanation dependencies in `src/phase105_incremental_reasoning_graph.ts`; `journalPage` was added to Phase104 for globally ordered incremental event replay. No article rereads or LLM inference occur during replay. The graph does **not** publish rankings or approve externally computed results. See `PHASE105-INCREMENTAL-KNOWLEDGE-DEPENDENCIES.md` for design, 12 new tests, verified cumulative suites and boundaries.

```bash
npm run build
npm run test:phase105
node dist/examples/phase105-dependency-demo.js
```

---

# Current cumulative version v4.26 — Phase 102

This release retains the full Phase 101 codebase, appending `src/phase102_evidence_knowledge.ts`, tests, and source-backed research document. Phase 101's memory gains transactional source-free frame snapshots. This is a research-only **knowledge query** layer; it does not turn qualitative words into numeric scores, fit Bradley–Terry or Rasch models, or change public product ranking.

**Documentation:** `PHASE102-EVIDENCE-INTELLIGENCE-RESEARCH-AND-ARCHITECTURE.md`.

**Focused verification:** `npm run test:phase102`.

---

# Current cumulative build — Phase 100 (v4.24; research only)

Continuing directly from the complete Phase 99 v4.23 tree, Phase 100 adds a **single-question, decision-relevant, ordinal swing-weight preference module** (`src/phase100_adaptive_preference_envelope.ts`) operating on the real Phase 96→99 evaluated-evidence chain. It enumerates admissible swing-weight vertices exactly within an explicitly restricted additive model, identifies robust or underdetermined two-product comparisons, preserves hard exclusions only for confirmed non-negotiables and prioritises missing original evidence over preference questions. See [the expert-grounded technical report](PHASE100-ADAPTIVE-PREFERENCE-ELICITATION-RESEARCH.md). Full MACBETH/UTA-GMS and user calibration are not claimed. No published ranking change or new LLM call. Run `npm run test:phase100` for the focused regression and `node scripts/run-test-shards.mjs` for full TS regressions.

---

## Current cumulative build — Phase 93 (v4.18)

This **full cumulative repository** preserves all v4.17 archive members and adds externally root-signed, out-of-band-policy-hash-pinned reviewer authorizations; a pre/post source-read Phase85 active-recipe snapshot; opt-in mandatory Phase89 drift-watch status and durable audit on the Phase90 HTML path; and a permissioned pilot measurement harness with explicit denominators. No automatic LLM re-approval, source-rights bypass, new crawler framework or recommendation-score change. **The research build is not live-site validated and not production-ready.** Details, caveats, testing and links: [PHASE93-OPERATIONAL-TRUST-AND-PILOT.md](PHASE93-OPERATIONAL-TRUST-AND-PILOT.md).

The test corpus was fully executed in 4 independently invoked Node groups (643 passing), plus the companion/primary/ingestion/evaluation/launch/release suites (177 passing), totaling **820 passing software cases**. In this container, monolithic Node test invocations could hang without a case failure; successful per-group logs are kept in `audit/phase93/`. `npm run test:phase93` targets the eight new cases.

---

## Current cumulative build — Phase 92 (v4.17)

This archive retains the complete Phase91 v4.16 baseline and adds Phase92's **signed, append-only HTML recipe lifecycle** to the *same Phase85 authoritative reviewed store*. Exact-scoped recipes can be suspended and replaced only by a newly reviewed version that passes disjoint held-out deterministic extraction checks and a verified Ed25519 human-reviewer signing key. The old version and signed transition remain available for audit. Phase90 intake uses only the active version; the Phase82 market-discovery plan and original JSON-LD path remain intact. See [Phase92 report](PHASE92-SIGNED-RECIPE-LIFECYCLE.md). All 812 offline tests passed across separately executed suites. This is not production-deployed and not live-site validated.

## Current cumulative build — Phase 91 (v4.16)

This repository contains the complete retained Phase90 baseline plus Phase91 source-recipe drift gate and Phase82-compatible watch view. See [PHASE91-RECIPE-DRIFT-GATE.md](PHASE91-RECIPE-DRIFT-GATE.md) for verified test evidence, safety limitations, and the next work stage. Monitored manufacturer HTML intake checks Phase89 case state before actual Phase69 retrieval; market discovery is not stopped by the failure of one extraction recipe. The stored reviewed recipes remain under Phase85 authority. The implementation is research-grade, not production deployed.

> **Update 10 October 2026 — v4.15 / Phase 90.** This tree preserves the full v4.14 Phase86 baseline and adds the historical Phase87–89 companions plus a genuinely mainline-wired Phase90 HTML strategy. See [PHASE90-REAL-MAINLINE-INTEGRATION.md](PHASE90-REAL-MAINLINE-INTEGRATION.md) for exact scope, 795 passing tests, and research-only limits. Source policy/robots are enforced by Phase68/69, evidence goes to Phase70 quarantine, and approved HTML/JSON-LD recipes share the Phase85 store. Not live-site validated or deployed.

# Phase 86 — Local AI-assisted reusable extraction strategies (v4.14)

Phase 86 integrates an optional **local Ollama-model adapter** with independently verified source-specific JSON-LD extraction recipes. The model receives only a bounded inventory of manufacturer-declared property names and units, then proposes mappings to already-reviewed category fields. Approved source retrieval remains mandatory; two distinct independently labelled model pages must qualify the proposal, and **only a human reviewer can approve a recipe** for deterministic reuse. No commercial scraping/search APIs or third-party AI crawler are required. **A real installed LLM and real web acquisition have not been tested.** See [Phase 86 technical report](docs/PHASE-86-LOCAL-AI-RECIPE-PROPOSALS.md).

Run `npm run test:phase86` for 17 new tests or `npm test` for the full TypeScript suite.

---

# Product Evidence Engine v4.13 — Phase 85

**Decision:** in-house, source-adaptive acquisition remains the default. No new external crawler/framework dependency. See [Phase 85 architecture and evidence](docs/PHASE-85-IN-HOUSE-REUSABLE-ACQUISITION.md).

A reviewed manufacturer JSON-LD recipe can be reused for different product models and passed through the existing rights-checked, quarantined structured evidence path. AI-proposed recipes are testable but not self-approving. Phase 85 consists of local tests, not web-live acquisition or an external framework benchmark.

# Product Evidence Engine v4.11 — Phase 83 (evaluation-only)

**Architecture unchanged:** Phase 83 adds an offline, controlled in-house-vs-Crawl4AI benchmark harness. **No framework has been selected or installed in the application.** Current TypeScript ranking, acquisition rights controls and product lifecycle logic remain as in v4.10 Phase 82.

**Outcome:** the 12 machine-readable facts in five static local fixtures were recovered in a prototype; browser navigation was blocked by this environment, and Crawl4AI was not installed. **No fair A/B winner can be declared.** See [the detailed Phase 83 report](docs/PHASE-83-COMPARATIVE-ACQUISITION-PILOT.md) and [machine-readable output](audit/phase83/offline-local-benchmark.json).

Repeat: `npm run test:phase83`; pilot: `python evaluation/phase83/benchmark.py --arm both`. No paid scraping/search APIs, no model network calls, no external websites were used.

---

# Product Evidence Engine v4.10 — Phase 82

**Added:** low-overhead source-watch scheduling and new-market-signal triage. This edition extends v4.9 without claiming a production crawler.

**Research & limitations:** [Phase 82 documentation](docs/PHASE-82-MARKET-SIGNAL-DISCOVERY-RESEARCH.md), with official documentation and community links.

**Tests:** `npm run test:phase82` for the new module, `npm test` for regression. Feeds are not actually fetched during these tests.

---

# Phase 80 — Priority for POPULATING product knowledge, launch seeding and lifecycle (RESEARCH ONLY)

**Corrected architecture:** Select which product *records* to enrich first, using original independent professional shortlist appearances as fallible discovery leads, category-family diversity and demand-specific overrides. Preserve other candidates as low-cost discovery stubs for later enrichment. A budget-limited first wave may pause without certifying market coverage or any winner. Manufacturer-verified discontinuation is separate from retail out-of-stock; archive pages remain visible. See [`docs/PHASE-80-POPULATION-FIRST-PORTFOLIO-AND-LIFECYCLE.md`](docs/PHASE-80-POPULATION-FIRST-PORTFOLIO-AND-LIFECYCLE.md). Run `npm run test:phase80` and `npm run demo:phase80`. No real sources, public ranking changes, deployed DB, live AI or web crawler are implied.

---

# Phase 79 — Demand-specific search depth and legitimate narrow selection (RESEARCH ONLY)

Independent discovery challenges, item-level filter evidence and decision-stability checks now distinguish one/three truly suitable products from a one/three-item database. Product count is never the stopping rule. The new component returns targeted work types rather than falsely claiming market completeness or authorizing a ranking. See [`docs/PHASE-79-DEMAND-SPECIFIC-SEARCH-STOPPING.md`](docs/PHASE-79-DEMAND-SPECIFIC-SEARCH-STOPPING.md). Run `npm run test:phase79` and `npm run demo:phase79`. **Current portfolio audit limit 500 candidates; real web/AI/DB connections and statistical calibration remain unimplemented.**

---

# Phase 77 — Need-first research, progress and new-product challenge evaluation (RESEARCH ONLY)

A functional user need may connect to several existing product categories, so Phase 77 does **not** automatically create a new category for an unknown request. The research gateway preserves confirmed outcomes and constraints in the request scope, audits whether a candidate portfolio is comparable without a fixed top-N, and triages new entrants for **targeted** study without changing published rankings. A private persisted seven-stage journal reports only actual verified research milestones, not a fabricated percentage or ETA. The HTTP intake accepts **structured, confirmed** needs only; there is no live NLP, crawler, AI inference or notification delivery. See [`docs/PHASE-77-FUNCTIONAL-DEMAND-PROGRESS-AND-CHALLENGER-WATCH.md`](docs/PHASE-77-FUNCTIONAL-DEMAND-PROGRESS-AND-CHALLENGER-WATCH.md). Run `npm run test:phase77`, `npm run demo:phase77`.

---

# Phase 75 — persistent research / local inference pilot (2026-10-10)

See [Phase 75 architecture, tests and limitations](docs/PHASE-75-DURABLE-RESEARCH-AND-LOCAL-INFERENCE.md). New modules provide a durable single-host research metadata journal, explainable priority selection, local-model HTTP interface, and rights-gated sitemap candidate discovery. No live model or live licensed web retrieval was executed in this phase. Public ranking remains isolated. Run `npm run test:phase75` for phase-specific checks.

---

## Phase 74 (v4.2): executing category research and unknown-category evidence intake

The cognitive capability planner now has a bounded, dependency-aware execution layer. It can invoke injected local research tools, construct a provisional research dossier from URL/hash references, and ingest structured evidence for a previously unknown category through the Phase 69 rights-gated reader. Work products do not self-approve their conclusions, and the category blueprint is always quarantined.

See `docs/PHASE-74-EXECUTION-AND-COLD-START.md`, `src/category_research_execution.ts`, `src/category_cold_start_intake.ts`, `db/migrations/009_category_research_execution.sql`, and `tests/category_research_execution.test.ts`. **Offline software tests are not proof of actual autonomous internet research, legal compliance at a particular source, a deployed local LLM, or a migrated database.**

# Product Evidence Engine v4.1.0 — Phase 73

**New:** Category cognitive mesh and cold-start research, including specialized capability routing, provisional category schemas, evidence-backed criterion proposals and bounded preventive category research. See [`docs/PHASE-73-CATEGORY-COGNITION-COLD-START.md`](docs/PHASE-73-CATEGORY-COGNITION-COLD-START.md). This is **research software**, not operational self-learning, live web ingestion, or production ranking.

## Current checkpoint: v3.9 / Phase 71 — adaptive research ontology

Added `src/adaptive_schema_evolution.ts`: evidence-anchored automatic **research-only** schema growth, proposed category fields and typed relations, duplicate-test suppression, semantic collision detection, selective backfill, immutable field-registry promotion, historical comparability, anonymised demand prioritisation. Additive unexecuted SQL: `db/migrations/006_adaptive_schema_research.sql`. See `docs/PHASE-71-AUTONOMOUS-SCHEMA-EVOLUTION.md`.

Not yet a live crawler, automatic AI extractor, production PostgreSQL service or verified ranking improvement. Candidate source rights and original-test identities remain attestations requiring independent review. Web-first acquisition and optional APIs remain the plan. No production scoring integration.

---

# Phase 70 — Controlled, extensible structured knowledge matrix (RESEARCH ONLY)

The new `src/category_evidence_matrix.ts` and additive `db/migrations/005_category_evidence_matrix.sql` model source observations as typed, context-aware, category-versioned fields **without archiving original review prose**. They retain source URLs, test identities and digests; AI hypotheses remain separated from source facts. Records are quarantined, do not enter public recommendations, and do not independently confer rights to extract data. This is web-first and API-optional; it does not bypass site restrictions. See `docs/PHASE-70-STRUCTURED-CATEGORY-EVIDENCE-MATRIX.md`. Run `npm run test:phase70`.

---

# Phase 68 — Permission-gated incremental web evidence acquisition (RESEARCH ONLY)

Added `src/web_evidence_acquisition.ts`: a deterministic incremental evidence discovery/refresh planner and a transient-content hash audit; no web spider, network calls, AI provider, API contract, live rights clearance or product ranking changes. Unknown permissions, conflicting variants, repeated original tests, expired approvals and stale robots/terms cannot trigger retrieval. See [`docs/PHASE-68-WEB-EVIDENCE-RESEARCH-AND-ARCHITECTURE.md`](docs/PHASE-68-WEB-EVIDENCE-RESEARCH-AND-ARCHITECTURE.md) for legal analysis with direct URLs, trade-offs, current limitations and next steps.

**New module is excluded from public launch.** Run `npm test`, `npm run test:primary`, `npm run test:ingestion`, `npm run test:launch`, `npm run test:release`.

---

# Phase 67 — Independent-label validation harness (research only)

The selective user-review research gate is now accompanied by a blinded human-reference protocol (`src/selective_evaluation.ts`). The 16 case fixtures are CONSTRUCTED, not real user interviews; the evaluation report has **no reference labels and no accuracy score**. The package does not crawl websites, read Amazon reviews, run an AI model, or update ranking weights.

Run: `npm test` and `npm run demo:phase67`. See `docs/PHASE-67-VALIDATION.md` for scientific sources, annotation rules and limitations.

---

# Phase 65 — REAL PUBLIC PROFESSIONAL REVIEWS, LIMITED EDITORIAL FEASIBILITY (10 Oct 2026)

Two genuine original source pages (RTINGS and SoundGuys) on the same first-generation Sony and Bose headphones have been manually reviewed. Six **paraphrased, research-reference-only** observations are used to test an **internal** evaluator for five real-world tasks. The engine withholds public rankings, does not copy protected scores or lab result tables, assumes no commercial reuse rights, and makes no claim of independent expert validation. No actual expert adjudication has occurred. See [`docs/PHASE-65-REAL-PRIMARY-REVIEW-FEASIBILITY.md`](docs/PHASE-65-REAL-PRIMARY-REVIEW-FEASIBILITY.md). Run `npm test && node scripts/phase65-evaluate.mjs` to reproduce the diagnostic output. All existing public-release guardrails stay in place.

---

# Phase 64 — METHODOLOGICAL QUALITY & USE-CASE APPLICABILITY (research only; 10 Oct 2026)

New `src/evidence_appraisal.ts` audits six **documentary** method-review domains on original phase-63 lineage-checked test records and screens exact use-case applicability (variant, criterion, protocol/version, unit and conditions). Reports missing method documentation and documented concerns separately. No accreditation or rights are inferred. No generic credibility coefficient, statistical confidence, quality score, Amazon input or public ranking is produced. **The six-field checklist is a provisional engineering construct, not a scientific standard.** See [`docs/PHASE-64-METHOD-QUALITY-CONTEXT-RESEARCH.md`](docs/PHASE-64-METHOD-QUALITY-CONTEXT-RESEARCH.md) for precise primary sources, mapping to implementation and evidence limits. Test: `npm test`, `npm run test:primary`, `npm run test:ingestion`, `npm run test:launch`, `npm run test:release`. Demo: `npm run demo:appraisal` uses invented records.

---

# Phase 63 — ORIGINAL TEST LINEAGE & DEPENDENCE (research only; 10 Oct 2026)

A provenance and overlap audit in `src/evidence_lineage.ts` links syndicated reports to their original test executions, detects shared raw-dataset identity, blocks unreviewed or conflicting original data, identifies incompatible test methods and preserves differentiated provenance without producing any ranking or scientific confidence estimate. Derived exports are research-only. This does NOT prove independent studies or real rights. See [methodological report](docs/PHASE-63-EVIDENCE-LINEAGE-OVERLAP.md). Run `npm test`, `npm run test:primary`, `npm run test:ingestion`, `npm run test:launch` and `npm run test:release`; `node dist/examples/evidence-lineage-demo.js` uses ONLY fictional lab results and syndication records.

---

# Phase 60 — ONLY TECHNICAL SPECIFICATIONS + INDEPENDENT THIRD-PARTY EVIDENCE (10 Oct 2026)

**Current evidence policy supersedes the Phase 59 exploratory handling of manufacturer performance statements.** New logic in `src/technical_vs_independent.ts` admits only specifically mapped technical fields from manufacturer/regulatory **technical documentation** and separately recorded third-party tests/editorial assessments. Generic marketing/performance claims are forbidden; the old Phase 59 handler now rejects `manufacturer_performance_claim` at runtime. No prices, Amazon, merchant inputs, cross-source fixed weights or double-counting. Every research result remains `rankingEligible=false`, `publicationReady=false`, with no score or winner. See [Phase 60 binding technical specification policy](docs/PHASE-60-SPECIFICATIONS-VS-INDEPENDENT-EVIDENCE.md). This module is not in the public `dist-launch/` graph. All evidence/test data so far are synthetic.

---

# Phase 59 — MANUFACTURER DECLARATIONS + ORIGINAL TESTS (research-only, 10 Oct 2026)

Targeted first-party and methodological research: [Phase 59 report](docs/PHASE-59-MANUFACTURER-VS-TESTED-EVIDENCE.md). `src/spec_test_evidence.ts` reconciles manufacturer static attributes, manufacturer performance claims, regulated declarations and original lab results for confirmed user needs, **without inventing fixed 70/30 weights** or mistaking claims for measured results. Missing data remains unknown; comparable original observations still require test-method, uncertainty, rights and quality review. All responses have `publicationReady=false`, `rankingEligible=false`, `winnerId=null`. This source is **not** included in the allowlisted public `dist-launch/` build. Run `npm test && npm run test:launch && npm run test:release`. No real licences or user validation have been obtained.

---

# Phase 56 — USER DECISION NEEDS (research-only, 10 Oct 2026)

See [phase 56 user decision research and architecture](docs/PHASE-56-USER-DECISION-NEEDS-ENGINE.md). `src/needs_discovery.ts` defines a deterministic progressive needs and evidence-gap interpreter with user-confirmed priorities, two illustrative categories, and no price/merchant data. This component is **not integrated into the public launch ranking** and does **not** imply validated user research or access to real laboratory evidence. All scores remain synthetic. `src/needs_demo_pipeline.ts` demonstrates the need-to-toy-ranker connection, but is isolated from `src/launch/index.ts`. Run `npm test` for all tests, and `npm run test:launch` to verify isolation.

---

# Phase 55 — Direct primary-source headphone measurement API (research only)

See [Phase 55: primary headphone measurements via official GitHub REST API](docs/PHASE-55-FIRST-PARTY-HEADPHONE-API.md). `primary_sources/headphone_api.py` directly targets a named original measurement repository publishing CC BY 4.0 raw frequency-response curves. It resolves an immutable commit, checks Git content integrity, validates relative dB/Hz curves, preserves protocol labels and original attribution, and **never enters the public ranking**. New API tests use mocked responses; this environment could not reach GitHub due to DNS restrictions.

---

# Phase 54 — ORIGINAL-LAB MEASUREMENT FEED (research-only, 10 Oct 2026)

See [Phase 54 documented API/feed contract](docs/PHASE-54-ORIGINAL-LAB-FEED-CONTRACT.md). `primary_sources/original_lab_feed.py` validates **fictional** original-laboratory measurement exports, preserves units and protocols, and computes comparable-evidence **coverage only**. It is an offline quarantine tool, NOT a live licensed API or production ranking source. `python -m unittest -v primary_sources.test_original_lab_feed`. Price and Amazon independence remains unchanged.

---

# Phase 53 — research-only primary benchmark importer (10 Oct 2026)

Direct original-source evidence work: `docs/PHASE-53-PRIMARY-TEST-INGESTION-PILOT.md`. A strictly quarantined offline Blender Open Data grouped CSV importer lives in `primary_sources/`. The three-row example is **transcribed** from an official public page, not a retrieved API or official archive dump. It is **NOT a product ranking input**. Run `python -m unittest -v primary_sources.test_blender_ingest`. `dist-launch/` is unchanged. No commercial lab feed, rights grant or real end-user product ranking is claimed.

---

# Product Evidence Engine — Phase 42 isolated launch artifact

`npm run test:launch` builds a fresh, allowlisted `dist-launch/` output that excludes experimental pricing modules. See [Phase 42](docs/PHASE-42-RELEASE-ISOLATION.md). Do **not** deploy `dist/` or the entire repository. No real data rights or legal clearance are claimed.

# Product Evidence Engine — Phase 41 launch orchestration

See [Phase 41](docs/PHASE-41-LAUNCH-ORCHESTRATION.md). The new `buildLaunchRecommendation` function ranks independently before attaching human-approved retailer links; no Amazon API, price comparison or purchase-timing feature is used. **All evidence and merchant links in tests are synthetic. No compliance clearance is claimed.**

# Product Evidence Engine v0.9 — Phase 38

**New:** Commercial rights gate and offline 30-variant coverage audit. See [Phase 38](docs/PHASE-38.md) for official source links, Amazon UK contractual blockers, pilot method and ready-to-send vendor questions. **No live API integrations or rights are claimed.**

Run `npm test` and `npm run demo:coverage` (synthetic only). Existing code and documentation remain included.

---

> **Current research phase: 37 — UK commercial-source audit.** See [docs/PHASE-37.md](docs/PHASE-37.md) for Amazon, Keepa, Awin, Google, licensing gates and the proposed coverage pilot. **The executable engine remains v0.8; no live provider access or legal clearance has been obtained.** Earlier phases remain in this project.

# Product Evidence Engine — Experimental Core v0.7

A **deterministic, TypeScript-based experimental recommendation engine**. Built to be developed further in Cursor, Claude Code, or with ChatGPT. **No generative AI is required in the product.**

## Quick start

Requires Node.js >= 20 and npm.

```bash
npm install
npm test
npm run demo
```

## What this version does

- Models product families and **market-specific variants**.
- Enforces market, currency, price and required specifications.
- Handles three synthetic need dimensions: carpet cleaning, pet hair, ease of use.
- Scores only evidence explicitly marked `admitted` **and** `authorized`.
- Keeps provenance, test identity, protocol, conditions and applicability for each evidence record.
- Prevents reusing US evidence on a UK variant unless applicability is explicitly declared.
- Deduplicates syndicated articles by original test ID.
- Withholds a dimension from numerical scoring if independent evidence has incompatible protocols/conditions.
- Separates scores from weighted **coverage**; missing evidence is never zero.
- Declines to select a candidate when relevant dimensions lack evidence or the top fully covered candidates tie.

## Limitations — important

1. **ALL sample products and measurements are fictional.** Nothing here supports a real purchase recommendation.
2. The 0–10 scales are synthetic. There is **no validated cross-publication normalization**, uncertainty model or source-quality calibration.
3. The current aggregation is an illustrative arithmetic mean across *compatible* independent tests. Real tests need explicit normalization and documented comparability rules.
4. `rights: 'authorized'` is a **manual fixture field**, not proof of a legal license. A production system needs an auditable rights registry.
5. The strict compatibility check is intentionally conservative and uses exact protocol and condition matches.
6. `winnerId` means a leading fully-covered candidate in this toy dataset, **not statistical confidence or superiority**.
7. Data ingestion, persistent database, user interface, merchant offers, prices freshness, analytics, user testing, security and deployment are **not implemented**.
8. A potential issue to resolve before production: the engine currently returns candidate scores for partly covered products; consumers must not interpret these as directly comparable to fully covered candidates.

## Suggested next implementation sequence

1. Freeze the acceptance tests and extend to adversarial cases (duplicates with contradictory values, rights revocation, test revisions, price freshness, ambiguous variant identity).
2. Design a PostgreSQL schema with separate tables for `product_family`, `variant`, `review_article`, `test_session`, `measurement`, `evidence_applicability`, `rights_grant`, `market_offer`, `recommendation_run`.
3. Build a licensed-data import pipeline with human review, provenance audit, and no automatic test-to-variant equivalence.
4. Introduce dimension-specific measurement units, protocols, explicit comparability matrices and *validated* normalization.
5. Evaluate A/B/C against real, authorized evidence and independently assessed purchase scenarios.
6. Only then build the consumer-facing guided-selling interface.

## Working with AI coding assistants

Open this folder in Cursor or Claude Code. Ask it to read `README.md`, `src/types.ts`, `src/engine.ts`, and all tests **before making changes**. Require every change to include passing tests. Do not let assistants replace synthetic values with guessed professional test results or assert license rights without documentary evidence.

## v0.2 addition — database schema and controlled intake

- `db/migrations/001_initial.sql`: PostgreSQL 15+ schema separating family, market variant, source publisher, article, original test session, measurement, applicability, rights, offers, import batches, audit events and recommendation runs. Includes a restrictive scoring eligibility view.
- `fixtures/synthetic-import.json`: fully **fictional** input data for import validation.
- `ingestion/validate.py`: dependency-free, offline JSON validation and SHA-256 quarantine manifest. **Does not write to PostgreSQL or publish data.**
- `ingestion/test_validate.py`: eight independent validation tests.
- `docs/DATA-GOVERNANCE.md`: approval gates, rights handling, and explicitly unresolved implementation tasks.

Try the new pipeline:

```bash
python3 -m unittest discover -s ingestion -p 'test_*.py' -v
python3 -m ingestion.validate fixtures/synthetic-import.json --output /tmp/product-evidence-import-manifest.json
# Only if you have a local PostgreSQL 15+ instance and an empty test database:
# psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_initial.sql
```

**Versioning note:** This is an additive v0.2 research/development package. The existing v0.1 TypeScript engine remains experimental and unchanged; this package does not claim that database ingestion or end-to-end production scoring is already implemented.

## v0.3 addition — PostgreSQL transactional intake and review

See **`docs/PHASE-29.md`** for setup, workflow and limitations. This version adds:

- `db/migrations/002_ingestion_workflow.sql`: quarantined JSON payloads, import provenance, per-record review decisions, and a live scoring eligibility view gated by real-batch approval, individual review, verified identity/applicability and active rights.
- `ingestion/postgres.py`: parameterized transactional `stage`, `promote`, `decide`, `approve-batch` and `revoke-rights` commands. Raw imported flags are forcibly reset to unverified/pending on promotion.
- `ingestion/test_postgres.py`: mock-backed tests for transaction flow, quarantine, rollback, revocation and approval restrictions.
- `requirements-db.txt`: optional PostgreSQL driver, not needed to run the mock-backed tests.

**Validation status:** Python tests pass with mocks. PostgreSQL itself was not available in the execution environment, so the migrations and end-to-end DB behavior remain **unverified against a live server**. No authenticated review or secure production deployment is included. All sample measurements are synthetic.

## v0.4 addition — read-only database → ranking bridge (Phase 30)

See **`docs/PHASE-30.md`**. This adds a read-only PostgreSQL exporter, strict TypeScript snapshot adapter, hardening migration and synthetic integration demonstration. No AI dependency is introduced in the application.

```bash
npm install
npm test
python3 -m unittest discover -s ingestion -p 'test_*.py' -v
npm run demo:bridge
```

**Important:** `npm run run:db` requires a live PostgreSQL test instance and psycopg, and real measurements are intentionally **not scored** until validated per-protocol normalization is implemented. Database integration remains untested on a live server. The synthetic bridge demo is **not** a live DB test. The package retains all earlier code and migrations.

## v0.5 addition — Smart Trade-off Discovery (Phase 31)

See **`docs/PHASE-31.md`**. This adds `src/tradeoffs.ts` and 11 automated tests for opt-in near-miss suggestions: slightly over a *flexible* budget, slightly beyond a *flexible* numeric size preference, or cheaper with nearly the same evidenced fit. **Hard constraints remain binding and the primary ranking is unchanged.** All demonstrations are synthetic and not validated for real products.

```bash
npm test
npm run demo:tradeoffs
python3 -m unittest discover -s ingestion -p 'test_*.py' -v
```

**Remaining blocker:** real PostgreSQL integration tests and production evidence normalization have not been completed. The size prototype uses exact specification equality in the base engine, not yet a proper maximum-size filter; this is explicitly flagged for the next iteration.

## v0.7 addition — controlled price history intake (Phase 34)

See **`docs/PHASE-34.md`**. Adds a rights-gated offline intake validator, merchant-specific bounded historical coverage assessment, migration `004_price_observations.sql`, and adversarial tests. All data are synthetic; no live price providers or PostgreSQL server were connected. No forecasting or purchase imperative is implemented.

## v0.8 addition — Phase 35 provider feasibility

See **[docs/PHASE-35.md](docs/PHASE-35.md)** for primary-source links, evidence/rights caveats, and pilot gates. Adds `src/provider_feeds.ts` for strictly offline parsing of untrusted Awin-like CSV and eBay-like JSON fixtures. **No provider account connected; no actual live prices imported; no legal rights assumed.**

## Phase 40 launch entrypoint (compliance gate)

For launch-oriented code import `resolveLaunchPurchaseLinks` from `src/index.ts`, not the legacy experimental pricing modules. Each merchant destination needs a uniquely matched, unexpired, human-reviewed approval record with evidence and rights references. See `docs/PHASE-40-LAUNCH-COMPLIANCE-GATE.md`. This is a technical safeguard, **not legal approval or live URL verification**. Do not import the experimental `src/purchase_decision.ts` or `src/price_observations.ts` into production.

## Phase 43 — Budget-safe launch ranking

The restricted launch pipeline **does not enforce `maxPrice` against the legacy `Variant.price` field**. A manufacturer's MSRP/RRP is not a current purchasable price; filtering on it would silently exclude potentially suitable products. A budget warning is returned instead. No prices are serialized in the launch result. See `docs/phase43-budget-and-amazon-compliance.md` for compliance scope and unresolved gaps.

## Phase 44 — Independent manufacturer list-price context

`src/list_price_context.ts` adds a rights- and provenance-gated MSRP/RRP budget *reference*, without introducing Amazon data or current merchant prices. `buildLaunchRecommendation` computes rankings before adding this advisory context; it never filters candidates on list prices. A strict budget cannot be guaranteed. See [docs/PHASE-44-LIST-PRICE-BUDGET.md](docs/PHASE-44-LIST-PRICE-BUDGET.md).

## Phase 45 — Flexible budget reference signals

Manufacturer MSRP/RRP context now distinguishes within-reference, slightly-above-reference (flexible budget only), substantially-above-reference, and unavailable. The flexible tolerance is configurable between 0% and 30%, defaulting to 10%. It **never** changes product rankings or promises actual selling prices. See [docs/PHASE-45-BUDGET-REFERENCE-SIGNALS.md](docs/PHASE-45-BUDGET-REFERENCE-SIGNALS.md). The launch build remains restricted and excludes experimental Amazon/price-history modules.

## Phase 46 — Manufacturer list-price source audit

`auditManufacturerListPrices()` adds explicit fail-closed diagnostics for manufacturer reference records, including future verification dates and malformed source URLs. Rejected records cannot yield budget signals. See [docs/PHASE-46-MANUFACTURER-SOURCE-AUDIT.md](docs/PHASE-46-MANUFACTURER-SOURCE-AUDIT.md). This does not validate real manufacturer sources or establish rights/legal compliance.

## Phase 47 — Mandatory publisher and editorial approval for launch MSRP/RRP guidance

Manufacturer list-price records are **not sufficient** by themselves in the public launch path. `buildLaunchRecommendation()` now requires matching, unexpired publisher identity/rights approvals and distinct, fingerprint-bound editorial reviews; missing or dubious evidence is excluded from budget guidance, without changing ranking or merchant links. Full workflow and limitations: [docs/PHASE-47-MANUFACTURER-EDITORIAL-VERIFICATION.md](docs/PHASE-47-MANUFACTURER-EDITORIAL-VERIFICATION.md). This is a code-level safety gate, **not** verification of any actual manufacturer, data licence, reviewer or Amazon compliance. All new tests use synthetic records.

## Phase 48 — Price-free public launch (current decision)

Following the manufacturer MSRP/RRP automation feasibility review, price and budget features are now **research-only**, not part of the public release. `src/launch_rank.ts` has **no price comparisons or budget filtering**, and `src/launch_pipeline.ts` rejects `maxPrice` and manufacturer-price payloads rather than quietly ignoring them. Merchant links are appended only after ranking. The older phase 43–47 notes above describe experiments, **not the current launch contract**.

Run `npm run test:release` to create and test the standalone `release-launch/` library (contains no experimental pricing modules). Deploy only that verified dependency graph. See [docs/PHASE-48-PRICE-FREE-LAUNCH.md](docs/PHASE-48-PRICE-FREE-LAUNCH.md). This is still a synthetic prototype with no live products, no affiliate approvals and no deployed consumer frontend.

## Phase 49 — Independent evidence audit (current)

The public-ranking candidate has a **mandatory documentary evidence-review gate**; source URLs and a caller-provided `rights: authorized` flag alone no longer admit synthetic test scores. Test sources must be declared independent, tied to the tested variant and exact test record, and carry an unexpired fingerprint-bound editor approval. Amazon source domains are blocked in the ranking pathway.

**Important change:** `buildLaunchRecommendation` now requires `purpose: 'synthetic_demo'` and `evidenceApprovals`. Missing `purpose`, `public` mode or missing approvals fail closed. All results include `publicationReady: false`. The package is an **offline research artifact, not safe to deploy to consumers**. See [docs/PHASE-49-INDEPENDENT-EVIDENCE-GATE.md](docs/PHASE-49-INDEPENDENT-EVIDENCE-GATE.md) for the exact limits and published source-rights examples. Real evidence has not been licensed, normalized or ingested.

## Phase 57 — Linking user needs to real lab measurement fields (research-only)
A new `src/lab_needs_bridge.ts` connects confirmed Phase 56 needs to the normalized original-lab feed schema from Phase 54. Comparison requires exact variants, an explicit reviewed need-to-test rule, identical units, protocol/version, and conditions. It never outputs a score or winner. It reports missing/incompatible measurements and purely descriptive directions, and no licensing assertion is treated as independently verified. **Not in the public/launch package.** See `docs/PHASE-57-USER-NEEDS-TO-LAB-EVIDENCE.md`.

## Phase 58: reported measurement-uncertainty audit (research only)
- `src/lab_uncertainty.ts` is **not part of the public release**. It describes whether lab-reported expanded uncertainty intervals overlap, given Phase 57's strict comparability checks. It does not assert significance, confidence, rankings or reuse rights.
- Full limitations, sample assumptions and NIST references: `docs/PHASE-58-MEASUREMENT-UNCERTAINTY-RELIABILITY.md`.
- Run the **fictional** demo: `npm run build && node dist/examples/phase58-uncertainty-demo.js`.

## Phase 61 — Contextual Functional Suitability (10 October 2026)

The research-only module `src/contextual_functional_suitability.ts` combines confirmed
user needs, mandatory functional constraints, reviewed structural specifications,
original laboratory results and source-reported measurement uncertainty. It
preserves task-specific trade-offs and refuses to infer a statistical winner or
absolute product-quality score. It rejects commercial and marketing inputs. It
is deliberately excluded from the isolated public launch artifact; no real
consumer recommendation is enabled. Full limitations and sources:
`docs/PHASE-61-CONTEXTUAL-FUNCTIONAL-SUITABILITY.md`.

Tests: `npm test`, `npm run test:launch`, `npm run test:release`,
`npm run test:primary` and `npm run test:ingestion`.

## Phase 62 — Decision sensitivity / robustness audit (10 October 2026)

Research-only `src/decision_robustness.ts` re-runs the Phase 61 functional
suitability model under **explicitly documented** user-priority alternatives
and counterfactual removal of an entire original test. It reports which
conditional observations, mandatory requirements and evidence gaps change.
It is **not** a Monte Carlo/SMAA model, statistical confidence estimate,
real-world ranking, proof of rights or safety certification. There are **no
engine-invented probabilities, weights or superiority thresholds**. When
nothing changes under the enumerated scenarios, that does NOT prove overall
robustness. The isolated public demo does not include this module.

Research and sources: `docs/PHASE-62-DECISION-SENSITIVITY.md`.
Synthetic runnable example: `npm run build && node scripts/demo-phase62.mjs`.

## Phase 66 — Selective User Experience Intelligence (10 October 2026)

Research-only `src/selective_user_evidence.ts`: a documented decision-materiality
and rights gate determines **whether** supplementary user reviews could be useful.
The optional AI path is **not implemented as a live LLM service**: candidate
observations can be checked against synthetic, explicitly supplied, permitted
texts but always remain quarantined. No automatic rating, no customer-review
scraping, no Amazon reviews, no publisher text republishing, no price inputs, no
ranking modification and no automatic learning from user feedback.

The system distinguishes experiential questions (possibly suitable for user
reports) from technical compatibility and controlled lab measurements (not
answered by anecdotes). New research needs may be proposed to a human-approved
backlog, but source weights and criteria cannot auto-change. No real permissions,
reviewer authenticity or legal compliance is certified by boolean input fields.

See `docs/PHASE-66-SELECTIVE-USER-REVIEW-INTELLIGENCE.md` for scientific sources,
regulatory constraints, uncertainty, limitations and the empirical validation plan.

## Phase 69 — approved-source guarded HTTPS research pilot (v3.7.0)

- Code: `src/approved_web_reader.ts` (rights/terms/robots recheck; no redirects; public IPv4 DNS pinning, HTTPS-only, bounded output; content hashes quarantined, no article archive).
- Source exercise: `src/open_headphone_measurements.ts` and `fixtures/phase69_open_measures/sbaf_hd600_first_twenty_points.txt`, first 20 **real** measured frequency-response points from an SBAF CC BY 4.0 repository. It is an incomplete excerpt and cannot justify a product verdict.
- Source and licensing dossier, all original URLs and legal qualifications: `docs/PHASE-69-LICENSED-WEB-READING-PILOT.md`.
- `npm run test:phase69` for new tests; `npm test` for full TypeScript suite.
- **No live retrieval was executed in this environment**. Website access/automation terms remain unapproved; production source crawling, remote AI analysis, database persistence and consumer recommendation use are not enabled. We do not represent the presence of a CC BY statement as a permission to scrape the hosting platform.

## Phase 72 — Authorised transient acquisition to adaptive evidence (v4.0.0)
This phase connects web access checking (Phase 69), typed structured facts (Phase 70) and category-schema gap discovery (Phase 71) without enabling unverified commercial recommendations. It adds `src/phase72_structured_acquisition.ts`, `src/phase72_semantic_intake.ts`, bounded transient extraction support in the approved reader, test scenarios and PostgreSQL migration `007_transient_acquisition_audit.sql`. Both output channels are **quarantined and research only**.

To verify: `npm test`, `npm run test:ingestion`, `npm run test:primary`, `npm run test:launch`, `npm run test:release`. To reproduce the offline trace: `npm run build && node scripts/demo-phase72.mjs`. No live HTTP transaction, PostgreSQL migration, or real LLM call was performed for the Phase 72 release. See [Phase 72 engineering and evidence audit](docs/PHASE-72-WEB-TO-EVOLVING-KNOWLEDGE.md).

## Phase 76 — On-demand consumer requests (v4.4)

When the user requests an unsupported product or a category unknown to the
catalog, `src/phase76_request_queue.ts` records a durable scoped request, and
`src/phase76_service.ts` connects it to Phase 75 research. `src/phase76_http.ts`
exposes a **loopback prototype** of POST/GET request status; the
`examples/phase76-consumer-request.html` sample illustrates how to present
"research pending" without fabricating a recommendation or progress.

Important: this is a local development prototype, **not** a deployed research
service or a verified product recommender. There is no background daemon running
in this environment. A production site must configure a worker, source access,
a real model, source review, quality approvals and persistent service hosting.
See [Phase 76 specification](docs/PHASE76-ON-DEMAND-RESEARCH.md) and
proposed `db/migrations/011_consumer_research_requests.sql` (NOT executed).

For tests: `npm run test:phase76`. For offline demonstration:
`npm run demo:phase76`. A local user must retain the private status link to
return later; no email/push alerts or user-account association exist yet.

## Phase 81 — New models and permanent retirement (v4.9)

Manufacturing-discontinued models stay on their permanent, clearly labelled greyed-out historical pages, but **never** enter current-product competitions again. Retail stock levels are irrelevant to this policy and removed from the lifecycle input. A verified globally scoped manufacturer retirement applies across all markets; a persisted tombstone continues to block the model even after a subsequent evidence snapshot omits the retirement notice. Conflicting live listings create an investigation task, not automatic reinstatement. Manufacturer specs for newly announced models may create a structured record, but cannot support independent performance rankings. Genuine professional reviews and original tests trigger evidence appraisal rather than automatic promotion. See [Phase 81 technical note](docs/PHASE-81-NEW-MODEL-AND-PERMANENT-RETIREMENT.md). Code and tests are local research-stage; PostgreSQL migration and website deployment remain untested. Existing synthetic demo ranking entrypoints still require integration with the shared lifecycle gate before any real launch.


## Phase 84 — Auditable acquisition comparison; decision still pending (v4.12)

- `evaluation/phase84/replay.py`: provenance-locked offline evaluation on the previously provided authentic SBAF headphone measurement excerpt (20 points, CC BY 4.0 source attribution, not a live fetch). The extract is not a full test or product recommendation.
- `evaluation/phase84/schema_product.py`: independent generic schema.org/Product identification and declared specification parsing. It **does not** infer lab performance, product retirement, sales availability, rankings, or legal permission.
- `evaluation/phase83/benchmark.py`: the **shared** parser now includes a constructed JSON-LD source, reducing the original bias toward custom `data-*` fixture attributes. Dynamic HTTP navigation remains unverified in this environment.
- `evaluation/phase84/preflight.py`: actual tool and DNS readiness diagnostic (no site crawling).
- Run `npm run test:phase84` and `npm run demo:phase84`. See `docs/PHASE-84-REPLAY-AND-COMPARISON-READINESS.md` for evidence ledger and remaining live comparison tasks.
- **No Crawl4AI dependency, no paid API and no changes to the product-ranking source** are introduced. This version does **not** claim a real A/B result.

## Phase 96 — qualitative original-review evidence (research only)

Independent professional review assertions are first-class, context-specific evidence alongside test measurements. See [PHASE96-QUALITATIVE-EVIDENCE-RESEARCH-AND-IMPLEMENTATION.md](PHASE96-QUALITATIVE-EVIDENCE-RESEARCH-AND-IMPLEMENTATION.md). The Phase96 API requires Phase69-approved source reading, anchored propositions and separate human semantic/method/contextual implication review. It does not invent scores, recommend products, or independently approve its findings. Run `npm run test:phase96`.

## Phase 97 — Non-compensatory professional-evidence screening (research only)

`src/phase97_noncompensatory_qualitative_gate.ts` now composes the real Phase61 original measurement and confirmed user-needs evaluator with the Phase96 professional qualitative evidence and review records. The new gate distinguishes provisional exclusions for supported essential-need failures, unresolved cases requiring adjudication, and conditional comparison of remaining products. Positive aspects never compensate for a supported essential failure; source/variant/context contradictions and missing observations do not count as negative product scores. Documentary human-adjudication records are not yet authenticated through Phase92/93 and are **not** authorization for a public recommendation. Public launch ranking remains unchanged. See [PHASE97-NONCOMPENSATORY-QUALITATIVE-SCREENING.md](PHASE97-NONCOMPENSATORY-QUALITATIVE-SCREENING.md) and run `npm run test:phase97`.

## Phase 98 — Evidence-grounded compensatory trade-offs (11 October 2026)

Research-only corrective extension of Phase 97: quality drawbacks can reduce an elicited user-specific criterion value and be outweighed by strengths; verified failure of an *explicit hard requirement* still prevents a conditional ranking. `essential` is not synonymous with `hard`. No per-sentence sentiment-to-number mapping; numerical value functions and swing weights must be independently elicited and documented. Implementation: `src/phase98_tradeoff_value_model.ts`; tests: `tests/phase98_tradeoff_value_model.test.ts`; full research, references and limitations: `PHASE98-COMPENSATORY-RANKING-RESEARCH.md`. The original public ranking is **not** changed. All original independent-testing provenance, source-policy and commerce separation controls remain in force.

## Phase 99 — Original qualitative evidence → reviewed performance → user tradeoffs (v4.23)

`src/phase99_qualitative_tradeoff_bridge.ts` links quarantined, source-anchored
Phase96 original professional review observations and their independent review
receipts to the Phase98 compensatory per-criterion value model. It requires a
**separate** performance adjudication to associate observations with a previously
elicited criterion level; an LLM's sentiment or reviewer stars never become
points. The bridge keeps all relevant unadjudicated observations visible and
suppresses a conditional winner when they could change the comparison. It
tracks original tests rather than counting review paragraphs as repeated votes;
prevents the same original passage being scored on different criteria; validates
reported hard-constraint failures against matching source records; and evaluates
explicitly provided user-preference scenarios for sensitivity.

`essential` remains different from `confirmed_nonnegotiable`. The interface
reports contribution advantages/drawbacks and conditional order **for research
only**; public ranking remains unchanged. It does not implement MACBETH
elicitation, full Robust Ordinal Regression, authenticated reviewer approval,
real-user calibration or a production evaluation. See
[PHASE99-QUALITATIVE-TO-TRADEOFF-RESEARCH.md](PHASE99-QUALITATIVE-TO-TRADEOFF-RESEARCH.md).

Run `npm run test:phase99`. Test scenarios are constructed; no live review data
has been fetched by this phase.

## Phase 101 — Durable interpreted expert evidence (research only)

`src/phase101_interpretation_memory.ts` adds a single-process SQLite store for independently reviewed, normalized professional original-test observations (qualitative descriptors, documented pairwise relationships, compatible noise measurements and externally calibrated performance levels). It preserves provenance pointers and revision fingerprints but not article bodies. `findLessNoisy()` reuses stored interpretations with **no web access or LLM calls**, leaving incomparable and unevaluated products visible. `getCalibratedPerformance()` exports already reviewed performance levels in the Phase98 input shape, without creating arbitrary numeric values. No source-reader permissions, review approvals, public ranking or production dataset are implied. Node 22's SQLite API is experimental. Reproduce with `npm run test:phase101`; see `PHASE101-REUSABLE-INTERPRETATION-MEMORY-RESEARCH.md` for research sources, limitations and the constructed demo.

## Phase 103: product evidence convergence (v4.27)

`src/phase103_evidence_consensus.ts` adds per-criterion/context descriptive convergence of independent original professional tests and a multi-criterion evidence coverage profile. It consumes the Phase 101–102 immutable claim snapshots and **does not** recrawl articles, invoke an LLM, compute a product-wide agreement percentage or modify public ranking. Tests: `npm run test:phase103`. Research and limitations: `PHASE103-EVIDENCE-CONVERGENCE-AND-ARCHITECTURE-AUDIT.md`. All Phase 102 functionality remains in place.

## Phase 104 — Entity-centred evidence cognition (research-only)

The cumulative project now contains `src/phase104_entity_cognition.ts`, a derived state and historical transition layer over the authoritative Phase101 review memory and Phase102–103 scoped reasoning. See [PHASE104-ENTITY-CENTRED-REASONING-ARCHITECTURE.md](PHASE104-ENTITY-CENTRED-REASONING-ARCHITECTURE.md) for original scientific sources, boundaries, complete roadmap and research caveats.

```bash
npm run test:phase104
node scripts/phase104-demo.mjs
```

Never treat a derived knowledge projection or its advisory research tasks as independently authorized evidence or published product rankings.

## Phase 109 — whole-source semantic memory (research module)
`src/phase109_source_wide_semantic_intake.ts` supplies an independent-of-request
source inventory, coded atomic observation ledger, segment reconciliation,
open-world concept mapping, sealing and provenance check. **This does not yet
crawl or automatically interpret full review pages**, and sealing the declared
inventory is not proof of information-extraction recall. See
`PHASE109-SOURCE-WIDE-SEMANTIC-COVERAGE.md` and run
`npm run test:phase109` / `npm run demo:phase109`.


## Phase 110 — Local whole-source semantic candidate extraction (research prototype)

`src/phase110_local_semantic_extractor.ts` consumes **authorized, ephemeral** blocks inventoried per full review. An injectable local-language-model adapter makes two bounded passes over each block and validates atomic claims against exact source spans; an Ollama-compatible loopback adapter is provided but has **not** been validated on a real installed model. Human-adjudicated results may enter the existing Phase 109 authoritative memory; user discovery intent is not accepted as input, and inferred claims are never auto-approved. See [`PHASE110-LOCAL-SOURCE-WIDE-EXTRACTION-RESEARCH.md`](PHASE110-LOCAL-SOURCE-WIDE-EXTRACTION-RESEARCH.md), `tests/phase110_local_semantic_extractor.test.ts`, and `audit/phase110/constructed-extraction.json`.

`npm run test:phase110` and `npm run demo:phase110` execute the deterministic tests and synthetic simulation. Real-world semantic precision/recall, completeness of HTML parsing, authorized source acquisition and human approval authentication remain unproven.

## Phase 111 (v4.35) — Long-document scope and ambiguity-safe requests

- `src/phase111_long_context_and_query_ambiguity.ts`: lossless ephemeral overlapping
  windows for long source blocks; directly invokes Phase110 extraction and records
  original-offset candidates requiring overlap reconciliation; scope-link provenance
  and exact-revision checks, never automatic semantic approval.
- `gateRequest111`: read-only comparison of separately proposed interpretations to
  clarify materially different winners, hard constraints or eligible product sets;
  evidence gaps never become user constraints; relative preferences are not vetoes.
- `tests/phase111_long_context_and_query_ambiguity.test.ts`: synthetic, deterministic
  checks. Full methodology/limitations in `PHASE111-LONG-CONTEXT-AND-AMBIGUITY-RESEARCH.md`.
- **Not a real validated local-LLM reader or consumer intent parser.** Production
  must enforce the new review gates at all entry points and benchmark them empirically.

## Phase 112 — Verified semantic-equivalence ranking contract (experimental)

- `src/phase112_semantic_ranking_invariance.ts`: typed query-neutral semantic-intent signatures, same-snapshot deterministic measured-value ranking, and paraphrase invariance audit; no production recommendation permission.
- `tests/phase112_semantic_ranking_invariance.test.ts`: paraphrases, negative controls, method/provenance integrity and ranking consistency.
- `examples/phase112-real-reviews-demo.ts`: manually curated source-grounded measurements from four original RTINGS review pages (v1.4), never autonomous live extraction.
- `audit/phase112/real-professional-reviews-invariance-pilot.json`: reproducible constructed utterances, full rankings, source links and caveats.
- `PHASE112-SEMANTIC-EQUIVALENCE-REAL-SOURCE-AUDIT.md`: detailed references, methods, findings and empirical limitations.

A structured, *verified* matching intent with identical candidate/evidence/policy snapshots must yield identical output. This phase does not claim to understand every natural-language paraphrase, determine complete user preferences or publish a full purchase recommendation. Unknown constraints trigger abstention, and same top-1 alone is not a sufficient test of equivalence.

## Phase 113 — local semantic intent proposal and independent evaluation

**Research status; not publication ready.** `src/phase113_local_intent_interpreter.ts` adds an experimental loopback-only Ollama structured-output adapter, literal anchor verification, critical-constraint omission/negation safety checks, consequence-sensitive surface clarification, and a behavioral benchmark that refuses to compute empirical model accuracy from constructed labels. The proposal cannot rewrite canonical product evidence or self-certify as a verified ranking intent. **No real local Ollama inference or independently human-adjudicated request corpus was available for this build.**

Scientific research, methods, test results, limitations and full direct-source links: [`PHASE113-MULTILINGUAL-INTENT-ROBUSTNESS-RESEARCH.md`](PHASE113-MULTILINGUAL-INTENT-ROBUSTNESS-RESEARCH.md).

```bash
npm run test:phase113
npm run build && node dist/examples/phase113-intent-demo.js
```

### Phase 114 (v4.38, bounded research audit)
The real-review 'best overall robot floor cleaners WITH hygiene capability' test
has found an actual Phase113 objective-schema gap and a risk of mistaking dock
mop washing or maker germ-kill claims for verified on-floor disinfection. See
`PHASE114-HYGIENIC-ROBOT-REAL-REVIEWS-AUDIT.md` and
`src/phase114_hygiene_capability_audit.ts`. This is a tested additive research
module, **not** an LLM-validated canonical-intent or public ranking integration.

### Phase 116 addendum — stain removal is not implicit single-pass performance
`src/phase116_stain_outcome_semantics.ts` and its tests distinguish the main endpoint of *effective stain removal* from **one-pass**, **fewest passes**, and **fastest time**. Mixed publisher scores that favor early passes are not converted into a pure final-cleaning endpoint. Comparisons are restricted to the same verified protocol, substrate, stain and observation horizon; unsupported products remain unranked. This addendum is experimental and query-neutral. Read `PHASE116-STAIN-OUTCOME-VS-EFFICIENCY-RESEARCH.md` for original RTINGS/Vacuum Wars sources and caveats.

### Phase 116 — category functions, operating mechanisms and measured outcomes
`src/phase116_category_function_model.ts` keeps causal mechanism hypotheses separate from verified measured performance for three pilot categories (robot floor cleaning, dishwashers, headphones). See `PHASE116-FUNCTION-FIRST-CATEGORY-ARCHITECTURE.md`. These mappings are research prototypes, not exhaustive category knowledge or launch ranking. In addition, the stain question stress test is documented in `PHASE116-STAIN-OUTCOME-VS-EFFICIENCY-RESEARCH.md`.

## Phase 119 — General "best robot" / "best value" request without specified cleaning task
`src/phase119_task_scope_and_value_gate.ts` provides a review-frame-only, query-neutral
research adapter separating vacuum focus, mop focus and joint cleaning from physical
robot configurations. Unknown use does not silently become a combination robot.
It distinguishes documented functions from measured quality; blocks future products
from purchase picks; evaluates same-market same-date value via conservative
endpoint-preserving Pareto comparisons. No published winner, price search, broad NLP
or mainline integration is claimed. See `PHASE119-OPEN-ENDED-BEST-VS-VALUE-AND-TASK-SCOPE.md`.
Run `npm run test:phase119`.

## Phase 121 (v4.45) — measured human intervention / hands-off autonomy

`src/phase121_autonomy_workload_comparison.ts` adds a category-goal **autonomy view** alongside the general/personal performance and value views of Phase120. It requires verified, adequate cleaning *before* any autonomy comparison; separates unattended completion, rescue interventions, routine user minutes and corrective user minutes; conservatively compares only source-reviewed, protocol- and exposure-compatible observations. Feature inventories such as auto-empty or self-wash never become manufactured time savings. `npm run test:phase121` exercises independently specified synthetic adversarial fixtures. It has **not** produced real market-wide autonomous robot winners or independently validated a live review-ingestion/NLP pipeline. Original expert-source links, definitions and open gaps: `PHASE121-INTERVENTION-FIRST-AUTONOMY-RESEARCH-AND-ARCHITECTURE.md`.

## Phase128 — shared category cognition drives question schemas (v4.52)

`src/phase128_category_cognition_dialogue_bridge.ts` connects Phase71/73/74 evolving category research, Phase116 goal/outcome semantics and Phase125/127 compositional dialogue. New knowledge enters quarantined; only reviewed definitions become query vocabulary, quality-method references or ambiguity meanings; snapshots are versioned and content-addressed. It cannot approve a live professional source, prove a product metric or issue a ranking. Read `PHASE128-SELF-EXTENDING-CATEGORY-COGNITION-AND-DIALOGUE.md` before reusing the module. New tests: `npm run test:phase128`.

## Phase131 v4.55 — Local relation learning (experimental)

This cumulative release adds a locally trainable five-label statistical relation classifier, source-anchored relation proposals, a scientific-review queue, and an intentionally limited constructed cross-domain evaluation. It **does not** discover entities, fetch websites by itself, validate scientific claims, learn cross-document relations, or authorize product rankings. The blind-looking challenge is developer-authored, not independently adjudicated. See `PHASE131-NATIVE-RELATION-LEARNING-ENGINEERING-RESEARCH.md`, `PHASE131-RELATION-LEARNING-EVALUATION.json`, and `evaluation/phase131/`.

Commands: `npm run test:phase131`, `npm run demo:phase131`. Legacy Phase91 and Phase92 tests remain outside the completed TypeScript regression due to previously observed timeout behavior.


## Phase 133 / v4.57 — Free-license release gate, offline neural-model benchmark (11 Oct 2026)

- `src/phase133_licence_release_gate.ts`: fail-closed policy for separately verified free, commercially compatible software, checkpoint weights and transitive runtime dependencies. Hypothesis-only; neither knowledge mutation nor ranking is authorized.
- `scripts/phase133_offline_checkpoint_probe.py`: optional, local-path-only GLiNER2.5 Small evaluator. Model files are **not present in this archive**; no download is made.
- `PHASE133-CANDIDATE-AUDIT.json`: upstream Apache-2.0 claims for the library and one checkpoint, with **production approval explicitly false**, because local hashes and dependency closure have not been verified.
- `PHASE133-GLINER2-FREE-LICENCE-AND-OFFLINE-BENCHMARK.md`: independent source URLs, engineering limits, safe validation plan.
- Tests: 10 targeted TypeScript and 9 targeted Python tests; full non-legacy regression outputs in `PHASE133-REGRESSION-GROUPS.json`. The two legacy phase91/92 test files remain excluded from completed verification, as in earlier releases.

No API, paid subscription, commercial permission request, pretrained weights or new third-party packages were introduced.

## Phase 134 — Study-to-code closure (v4.58)

Phase 134 implements an original, English-first TypeScript context/evidence screen inspired by the *engineering ideas* in the user-provided GLiNER2, medSpaCy, DeepKE and Snorkel source archives and the TypeSafe documentation study. The source ZIPs and any external Python/LLM runtime were NOT installed or bundled. See `PHASE134-CUMULATIVE-SOURCE-TO-NATIVE-ENGINEERING.md` and `research/phase134_reference_studies/` for direct source URLs, scope and limitations.

The module distinguishes exact source anchoring, basic bounded assertion modifiers, competing candidate relations, abstention and weak-signal conflicts. All outputs remain candidates requiring independent review, never authorized facts, category updates or product rankings. Run `npm run test:phase134` and `node scripts/evaluate-phase134.mjs`. This is NOT a validated general English entailment or cross-document relation model.

### Phase 136 — native evidence-screen evaluation readiness (v4.60)

`src/phase136_independent_signal_benchmark.ts` adds a read-only, source-/product-family-disjoint evaluation harness across Phases 134–135, signal-family coverage/conflict metrics, order-invariant benchmark digest, and conservative eligibility for independently annotated original English expert passages. The accompanying constructed examples **are not** an empirical performance estimate. The new module does not change ranking, source acquisition or canonical knowledge. No GLiNER2/medSpaCy/DeepKE/Snorkel/TypeSafe dependency or model is included. See `PHASE136-INDEPENDENT-EVIDENCE-SCREEN-EVALUATION.md` and `research/phase136_user_reference_studies/` for documentation and complete reference studies.

Commands: `npm run test:phase136`, `npm run demo:phase136`, `npm run regress:phase136` (build uses existing TypeScript dev dependencies).

## v4.61 — Phase 137: original-source custody and blinded annotation

The original TypeScript `src/phase137_original_source_annotation.ts` adds a URL-only source-candidate inventory, source/span-integrity blind annotation packets, two-person claim+reference voting, conservative cross-split near-duplicate checks and a guarded bridge to the Phase136 evaluation. Source candidates and test fixtures are **not** independently licensed or annotated real evaluation data; real original holdout still equals zero. Run `npm run test:phase137`, `npm run demo:phase137`, and `npm run regress:phase137`. See `PHASE137-ORIGINAL-SOURCE-CUSTODY-AND-BLIND-ANNOTATION.md` for limits and source links. No vendor AI code/weights, new runtime dependencies, external APIs, canonical writes or ranking updates.

## Phase 145 — Unit/context hypotheses across more product categories (v4.69)

`src/phase145_unit_context_bridge.ts` adds a conservative, read-only typed-unit pass (temperature, acoustic levels, power vs energy, frequency, volume, luminance, dimensional measures). It preserves source offsets and hashes; °F is converted to °C for numeric convenience without implying scientific comparability. dB is never silently promoted to dBA, and a setpoint or manufacturer claim is not treated as an observed test result. Narrow, repeated explicit surfaces in adjacent sentences produce only **unverified link candidates**, not resolved product identity. All canonical-write and ranking flags remain false. The Phase144 extractor is unchanged.

A four-category short-original-excerpt diagnostic (oven, loudspeakers, television, CD player) is published with publisher URLs and its limits; it has zero independent annotations and does not estimate accuracy. See `PHASE145-CROSS-CATEGORY-UNITS-AND-REFERENCE-LINKS.md` and `research/phase145_cross_domain_postcode_challenge.json`.

Commands: `npm run test:phase145`, `npm run demo:phase145`, `npm run regress:phase145`. Same two historical Phase91/92 suites excluded from cumulative regression. Existing developer dependencies only; no new runtime dependency or external model.

### Phase 149 — bounded bidirectional mention candidates (v4.73)
`src/phase149_bidirectional_discourse_candidates.ts` retains Phase148 hypotheses and introduces separate unverified forward and adjacent-paragraph candidates, surface-only clusters, and explicit different-variant/comparison blockers. No autonomous product identity merge, scientific promotion or ranking. See `PHASE149-BIDIRECTIONAL-REFERENCE-RESEARCH.md` and `npm run test:phase149`; all published excerpts are post-development diagnostics, not blinded gold.


## Phase 154 — actual reuse of user-provided source (v4.78)

- Full **original uploaded** source ZIPs (medSpaCy, Snorkel, GLiNER2, DeepKE) are retained under `research/upstream_source_archives/` for later work. They are source inputs, not installed runtime dependencies.
- Ported medSpaCy ConText rules/graph and Snorkel LFAnalysis diagnostics into TypeScript, with verbatim upstream source extracts, tests and licences under `third_party/phase154_reference_sources/`.
- `analyzeEnglishProductDocument154(input)` combines Phase153 candidate inventory, scoped contextual modifiers and conflict/coverage diagnostics. See `PHASE154-OSS-REUSE-AND-CONTEXT-INTEGRATION.md`.
- `src/index.ts` exposes this explicit evidence-intake entrypoint. It is **not** wired to live search/ranking and does not write facts or verify identity.
- Public UI displays no third-party credits; preserve technical licence notices as required in distributed source/code.

## Phase 165 — reused review-context graph for user requests (v4.89)

`src/phase165_request_context_audit.ts` reuses the Phase154 medSpaCy-inspired context graph to detect bounded English requirements, exclusions, optionality, preferences, negation, contrast and unparsed quantitative limits in questions. Phase164 now applies the audit before committing new candidate-only requirements into dialogue memory. Explicit grammatical corrections may change **candidates**, not verified meanings or rankings. Scope uncertainty leaves previous preferences intact. Targeted GitHub review found wink-nlp, Microsoft Recognizers-Text and NLP.js worth later controlled comparison (none installed here). See `PHASE165-REVIEW-CONTEXT-REUSE-AND-GITHUB-SCOUT.md` for source/license links and limitations. Run `npm run test:phase165`. A 42-example constructed diagnostic is provided but is **not** independently sourced/annotated user-language evidence. Production ranking and canonical scientific writes remain prohibited from this research-only path.

## Phase166 — v4.90

Added bounded English quantitative user-constraint parsing and provisional independent-source research screening. See `PHASE166-QUANTIFIED-USER-REQUIREMENTS-AND-SOURCE-REVIEW.md` for implementation, evidence boundaries and repository source audit. No public recommendation or ranking authorization.


## Phase168 — qualitative user constraints × contextual professional evidence (v4.92)

`planQualitativeNeedResearch168` bridges Phase164/165 request interpretation and Phase96 quarantined professional qualitative assessment. Feature presence is deliberately distinct from tested performance; optional and contradictory requirements never become product exclusions. All source and user confirmations remain documentary-only, original method/variant integrity must still be independently verified, and no public ranking is authorized. See `PHASE168-QUALITATIVE-CONTEXT-ENGINEERING-AND-SAAS-REVIEW.md` (targeted linked literature, W3C, SaaS option review). `npm run test:phase168`, `npm run demo:phase168`.

## Phase169 — signed, version-bound suitability research (v4.93)

`planSignedSuitabilityResearch169` coordinates Phase166 quantitative user limits, Phase167 original-review measurement candidates, and Phase168/Phase96 qualitative evidence. Built-in Ed25519 signature verification ties research receipts to a session revision, user phrase, document hash, exact variant and reviewer source scope; it also recomputes numeric suitability to reject forged fit flags. **Signatures attest key control, not human identity or genuine independent testing.** Trusted key enrollment, durable replay store, real user confirmation UX and scientific source adjudication are not implemented yet. This is a research-only integration: ranking, publication and final exclusions remain disabled. Run `npm run test:phase169`, `npm run demo:phase169`; read `PHASE169-SIGNED-USER-SOURCE-SUITABILITY-RESEARCH.md` for security model, standards links and validation results.


## Phase171 — original-source conflict reconciliation (v4.95)

`src/phase171_source_conflict_workbench.ts` follows the authenticated-*to-key* Phase169 receipts and Phase170 transactional research admission with a **research-only** per-variant/per-constraint adjudication queue. It distinguishes repeated editorials from truly independent evidence candidates, missing provenance, different test conditions or versions and disputed measurements. All source-lineage metadata is declared **unverified** and cannot validate independence, scientific quality, rankings or exclusions. It also preserves unresolved qualitative requests and adverse/contextual evidence concerns. See `PHASE171-ORIGINAL-SOURCE-CONFLICT-RECONCILIATION.md` for engineering sources, limits and methodology. Run `npm run test:phase171`. No SaaS, upstream repo copies, neural weights or additional runtime libraries.
