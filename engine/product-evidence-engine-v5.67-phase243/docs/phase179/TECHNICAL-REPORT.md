# Product Evidence Engine — Phase 179 technical report

**Date:** 12 October 2026  
**Build:** v5.03-phase179 (cumulative successor to v5.02-phase178)  
**Status:** bounded and tested **category-research coordination prototype**. No independently validated autonomous scientific reading, live full-category crawl, or new exact-model ranking.

## Engineering verdict

Reusing the project is more valuable than inventing another knowledge service. The historical Phase73/74 research planner and permitted-worker execution, Phase128/129 category brain and quarantine, Phase172–174 goal/method mapping, Phases169–171 original-source/protocol controls, and Phase177–178 website decision snapshots are substantial prior implementations. Phase179 adds a missing typed **need→outcome→mechanism→observable→method candidate relation** and a deterministic, append-only *research* ledger, while preserving those layers' existing trust boundaries.

This is a software increment, NOT proof that the application autonomously studies a previously unknown category end-to-end. The new orchestration explicitly reports missing research workers and does not fabricate sources, external requests, reviewer identity, certified test methods or product suitability.

## Implemented modules

`src/phase179_category_learning.ts`:

- `planCategoryLearning179` accepts a safe English category label and existing category registry, reuses Phase73 route/phase capability plan, proposes nine specialist workstreams including source methods, critical feasibility, alternative technologies and source-disjoint English validation. It handles known, unknown and ambiguous routing without publishing a novel category.
- `runCategoryInvestigation179` calls the actual Phase129/74 worker coordinator. Any missing worker remains a missing worker.
- `stageNeedEvidence179` checks caller-supplied original document identity, source role, SHA-256, timestamp, rights flags and exact text spans. Proposals become unverified, non-ranking edges carrying source/offset fingerprints, never product claims. These checks cannot prove that the passage semantically entails the proposed causal relationship, or that permissions are genuine.
- `summarizeResearchGaps179` reports missing methods, independent-review work, cross-document matching candidates and real English evaluation requirements. Different document IDs do not establish independent organizations or scientific replication.
- `stageExistingCategoryConcepts179` routes existing extracted category concepts to Phase129 quarantine rather than building an alternative ontology.
- `openResearchLedger179` / `appendResearchBatch179` keep separate hash-linked research revisions with optimistic concurrency and exact batch identities. Hashes protect against accidental change, not deliberate rewriting or forged document provenance. This JSON-serializable object still requires an application persistence/transaction implementation.

`tests/phase179_category_learning.test.ts` provides **45 passing targeted tests**, including new unseen-in-code category labels, five pilot categories, source controls, invalid offsets, denial of unlicensed input, distinct PFAS/lead and rolling/extrusion paths, counterfeit source role, cross-document distinction, duplicate and tampered research batches, missing workers and existing-ontology reuse. Most source text in tests is explicitly synthetic; results are code behavior, not empirical linguistic accuracy.

The evidence-aware five-category engineering plan from `PEE-PHASE179-CATEGORY-NEEDS-RESEARCH-DECISION.md` remains an input, not replaced.

## Technical research and verifiable primary URLs

- W3C PROV-O: entities, activities and derivations for traceable provenance; our TypeScript structures are **not** PROV-O compliant RDF: https://www.w3.org/TR/prov-o/
- W3C SHACL: constraint-checked knowledge graphs; our validators are **not** a SHACL engine: https://www.w3.org/TR/shacl/
- RTINGS, vacuum test methods: performance depends on surface, debris and setup; this is original *method scope*, not measurement for an arbitrary product: https://www.rtings.com/vacuum/learn/how-we-test
- NSF, reduction claims: particular substances, exact listings and filter/cartridge limits matter: https://www.nsf.org/consumer-resources/articles/contaminant-reduction-claims-guide and https://www.nsf.org/consumer-resources/articles/product-label-literature-claims
- The previous Phase179 needs decision provides further links for washing machines, kettles, pasta makers and quality-function methodology. Its propositions are still open to independent category review.

No commercial search/scraping dependency or whole external GitHub repository is added to the shipped release. Existing user-provided GitHub sources remain study material, with external-model integration conditional on benchmark, license and hosting costs.

## Results

- `npm run test:phase179`: **45 / 45 passed**.
- Eligible TypeScript regression: **2,654 tests in 139 test files, 13/13 groups passed**, excluding long-quarantined Phase91/92. See `evaluation/phase179/regression-ts.json`.
- Python: **212 tests passed** across six groups. The first five groups passed in the original sweep; the sixth group (71 tests) passed in a separately run command after the outer sweep hit a tool-level time limit. Historical SQLite `ResourceWarning` messages remain. See `evaluation/phase179/regression-python.json`.
- This phase contains no independent end-to-end acquisition run, no blinded benchmark, no authorised exact-product rank evaluation or UX conversion experiment.

## Major unsolved issues, in priority order

1. Wire existing source-transport/approved-reader ports to an actual permitted category investigation and verify a complete unattended task sequence, with robots/rights checks and authentic timestamped source custody. No automatic search provider has been configured in this block.
2. Independently benchmark open-domain extraction from original English technical documents and genuine user questions. The existing lexical observer in Phase129 cannot generalize to all scientific links; proposed edges currently arrive from bounded caller-provided local extractors.
3. Build an independently reviewed ontology-update transaction with authenticated expert identity, causal scope and explicit invalidation of derived knowledge. The Phase129 approval is structurally guarded but a trusted authentication/persistence service is external to this module.
4. Improve five categories with comparable original protocols, falsification studies, technology-family alternatives and product-specific evidence; distinguish revisions across test protocols and variant identities. Expand only after controlled cross-category transfer tests.
5. Keep confirmed user criteria/versioned website snapshots separate from research updates, and prove identical rankings and traces for semantically equivalent confirmed intents given identical evidence-policy snapshots.
6. Compare specialized domain libraries with generic baselines on held-out English prompts, including false hard exclusions, critical misses, researcher cost and source independence.

## Release integrity

Rebuilt conservatively from the canonical v5.02 ZIP: historical entries are preserved byte-for-byte other than the explicitly updated `package.json`. Phase179 code, tests, diagnostics, report and next-phase continuity are additive. Test the deliverable archive itself from a fresh extraction before calling the cumulative release ready.
