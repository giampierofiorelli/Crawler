# Product Evidence Engine — Phase 197

**Version:** v5.21.0 (cumulative successor of v5.20.0 / Phase196)  
**Date:** 13 October 2026  
**Status:** Engineering increment verified on authored software fixtures; **not an independently validated, production-ready system for deciding how many authentic consumer reviews suffice**.

## 1. Executive decision

A universal minimum number of reviews would be misleading. The stopping decision must be specific to the **user's decision**, exact **product variant**, relevant **feature or criterion**, **test protocol/conditions**, and the **research that has been attempted**. Thirty retellings of the same laboratory experiment are not thirty independent results. Equally, a niche product with no professional review is **not automatically a bad product**.

Phase197 introduces a research-only, deterministic **evidence-sufficiency advisory**, layered on the existing Phase77/78/79 demand and search boundary, Phase191 sparse-evidence representation and Phase182/196 research workflows. It does not create another ranking engine, authenticate publishers, download foreign-language websites or confer product quality points by country of origin.

## 2. Verified starting point and recovery

- Started from the CRC-validated cumulative package `product-evidence-engine-v5.20-phase196.zip`, original SHA-256 `741ef251f9d863f7b97319068a03b77fda2f75dbe3aec76de1a19f9eb0552a04` (checkpoint included). The full archive contains **2,289 original files**. File-for-file comparison confirmed that all 2,289 predecessors were present without changes **before** this increment; the v5.21 package modifies the package version and adds source/tests/documentation.
- Source preserved as `src/phase197_evidence_sufficiency.ts`, test suite as `tests/phase197_evidence_sufficiency.test.ts`. Both were recovered after the user's interrupted prior execution. A separate recoverable prepatch checkpoint is included.
- Initial recovery confirmed all 13 TypeScript shards had previously passed (3,285 tests; 44 Phase197 targeted). The recovered code was then adversarially reviewed and fixed before **fresh final** targeted and cumulative verification.
- The ongoing cumulative changes are additive and isolated to the new Phase197 module, its test, documentation, and the package version. Existing Phase79, 191, 182, 193–196 logic was **not forked or rewritten**.

## 3. Concrete implementation

### 3.1 Decision states

`assessSufficiency197` takes an existing `PortfolioAudit`, `ReviewedSearchAudit`, `SearchContinuationAudit`, `EvidenceLandscape191`, exact product/variant/category/market, explicitly named decision criteria, scoped evidence records, reviewed search passes, region/language exploration targets, criteria-specific expertise records and an operational status. The result is a deterministic advisory, with five statuses:

| Research state | Meaning | Quality/ranking interpretation |
|---|---|---|
| `sufficient_bounded` | Existing Phase79 decision boundary and reviewed criteria coverage are provisionally consistent; required exploration has no identified open gap | **Not** proof of accuracy, adequacy for all use cases, authenticated originality or product superiority |
| `provisional` | Partial/limited material supports a scoped discussion, with explicit incompleteness | Does not automatically admit manufacturer or derivative claims |
| `continue` | Relevant critical gaps, contradicting findings, missing competency reviews or unfinished required searches remain | Research action, not product penalty |
| `exhausted_insufficient` | Reviewed currently accessible paths have ended while decisive gaps remain | **Does not mean bad product**; cannot silently infer performance |
| `deferred_by_budget` | Resource/access policy halted research | Operational deferral, not scientific sufficiency |

No fixed article count, star rating threshold, national reputation score, or presumption of source originality is introduced. Output explicitly fixes `rankingAuthorized=false`, `evidenceProvenanceAuthenticated=false`, `exactTestEventIdentityAuthenticated=false` and `fullReviewTextStored=false`.

### 3.2 Criterion-level, provenance-aware coverage

Evidence must refer to a record already represented by Phase191 and must match the exact **field, version of protocol and condition**. Proposed independent evidence requires reviewed identifiers for genealogy, method, exact scope and a claimed originating test-event group. Repeated publications referring to the **same group** count as **one group**; the group remains **reviewer-annotated and unverified**, not an authenticated experiment. The module separately counts manufacturer specifications, derivative/unresolved claims and inconclusive independent measurements.

A potentially decisive **inconclusive** test does not close a critical coverage gap. Contradicting observations require further assessment instead of producing a falsely stable conclusion. Missing safety/compatibility coverage prevents sufficiency, even when many other reviews exist. Manufacturer claims remain explicitly provisional. The module never calculates a product performance score.

### 3.3 International exploration, not nationality scoring

`RegionalSearchTarget197` describes a search target by criterion, language, market, reason and a reviewer reference. Examples include a specialist market, cultural test protocol, exact market variant and search for a novel publisher. Completed attempts have separate receipts and may encounter translation or lawful-access blocks. Crucially, **a completed search only closes an international requirement if its `targetIds` explicitly cover that requirement and its language/market match**. A query for Italian safety tests no longer falsely completes the separately required Italian culinary-tradition search.

The optional assessor expertise records distinguish documented professional practice, formal sensory training, domain protocol authorship and demonstrated domain-specific standard experience. They are criterion-scoped and reviewed; being Italian/Japanese/German or publishing in that language gives **no automatic authority multiplier**. Competence in judging a traditional food result does not prove competence in measuring electrical safety. The software does not infer languages from nationalities or claim to translate or interpret multilingual source material.

`internationalResearchHints197` is **read-only** over Phase182 research jobs and Phase196 source queues. It returns candidate source IDs and target IDs for research planning. The Phase196 matrix does not yet authenticate document language, so these IDs are **not verified language-matched review results**. Nothing is fetched, admitted or ranked through this bridge.

## 4. Recovery-stage adversarial corrections

During continuation, the recovered Phase197 implementation passed its original 44 tests but had two logical vulnerabilities:

1. A proposed independent original measurement with `finding='inconclusive'` could be counted towards sufficient coverage merely because its reviewed original-group ID existed. Fixed by requiring at least one **informative** observation for the relevant criterion; inconclusive measurements are recorded separately as unresolved.
2. A search completed in the right language and market could satisfy **every** required target in that location, even where the completed search covered a different criterion. Fixed with optional explicitly scoped `targetIds` on research-pass receipts. Without a matching receipt, the individual target remains unfinished.

Four new focused tests cover these cases, wrong-market/language receipts and untargeted matching-language searches. Historical tests retained, including deduplicated experiment groups, safety, absence of test data, protocol and condition mismatches, commercial material, unreviewed expertise, and deterministic input order. This was a material correction to an incomplete implementation, **not** a claim of empirical calibration.

## 5. Final verification (executed on recovered and patched files)

| Test | Recorded result | Reproducible evidence |
|---|---:|---|
| `npm run build` | PASS | Local TypeScript compilation; no new runtime dependency |
| Phase197 targeted | **48 passed, 0 failed** | `docs/phase197/test-logs/phase197-targeted-48.log` |
| Full cumulative TypeScript | **3,289 passed, 0 failed** across 13 shards | `docs/phase197/test-logs/phase197-final-shard01.log` through `phase197-final-shard13.log` |
| Cumulative Python | **212 passed, 0 failed**, 6 groups | `docs/phase197/test-logs/phase197-python-*.log` |

A three-worker regression controller stalled before reporting shard 12, despite 12 other successful shard reports. The missing shard was run **separately** and passed **158 tests**. The interrupted controller output is retained separately so it cannot be mistaken for a complete uninterrupted run. Each shard has an explicit successful test tally and zero failed tests.

**Comparison with predecessor Phase196:** 3,241 → 3,289 passing cumulative TypeScript tests (**+48**); Python remains 212; Phase197 adds one focused source/test module, and no extra third-party runtime library. The total count is a software regression count; it says nothing about original-review recall or quality of real-world recommendations.

## 6. Scientific and methodological basis, with original URLs

These works motivate the research questions and conservatism of the workflow; **none validates these thresholds or code on genuine product reviews**. The full contemporary research note is bundled as `docs/phase197/RESEARCH-BASIS.md`.

1. **Cochrane Handbook, Chapter 4 (Searching for and selecting studies)**: search completeness, language restrictions and the difficulty of stopping. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04
2. **Cochrane Handbook, Chapter 5 (Collecting data)**: collate several reports of one study rather than count them as independent studies. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-05
3. **SAFE stopping for active-learning systematic-review screening (2024)**: domain-specific, conservative stopping experiments; results are not a transferable PEE recall guarantee. https://link.springer.com/article/10.1186/s13643-024-02502-7
4. **Statistical stopping criteria for automated systematic-review screening**: quantitative stopping evaluated in another retrieval setting. https://pmc.ncbi.nlm.nih.gov/articles/PMC7700715/
5. **Cochrane Handbook, Chapter 14 (Summary of findings / GRADE)**: certainty applies to particular outcomes rather than a global universal score. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14
6. **ISPOR Value of Information Task Force (2020)**: rationale for comparing incremental information to expected decision benefit and costs, not yet a calibrated PEE EVSI model. https://www.valueinhealthjournal.com/article/S1098-3015%2820%2930027-9/fulltext
7. **Nussbaumer-Streit et al. (2020), review-language sensitivity**: 59 clinical Cochrane reviews; findings cannot be simply generalized to commercial product reviews. https://pubmed.ncbi.nlm.nih.gov/31698064/
8. **ISO 8586:2023**, selection/training of sensory assessors; cultural or professional competence should be evidenced rather than inferred from citizenship. https://www.iso.org/standard/76667.html
9. **Kim et al. (2015), Food Research International**, cross-cultural tea evaluations by trained Korean and French assessors; familiarity and preference can affect sensory outcomes. https://www.sciencedirect.com/science/article/pii/S0963996915001180
10. **European Regulation 97/2010**, traditional-speciality specification for Pizza Napoletana as an example of criterion-specific cultural-standard conformance. https://eur-lex.europa.eu/eli/reg/2010/97/oj/eng
11. **Stiftung Warentest**, public testing-process description (self-reported methodology, not proof of any specific article). https://www.test.de/unternehmen/testablauf-5017344-0/
12. **Altroconsumo**, public testing methods; applies to some Italian-market/category questions, not a universal quality guarantee. https://www.altroconsumo.it/vita-privata-famiglia/servizi-e-contratti/speciali/metodo-test
13. **UFC-Que Choisir**, testing-method statement and shared collaborative test structures; multiple countries may rely on the same original laboratory event. https://www.quechoisir.org/decryptage-essais-comparatifs-de-que-choisir-pourquoi-nos-tests-sont-payants-n101292/
14. **National Consumer Affairs Center of Japan**, public description of consumer-product technical testing. https://www.kokusen.go.jp/hello/data/test.html
15. **W3C PROV-O**: distinctions among derivation, attribution and sources. https://www.w3.org/TR/prov-o/

Publisher method pages and official schemes are first-party declarations/program descriptions; their inclusion here **does not independently audit an individual test**. Source links were taken from the documented research basis rather than freshly re-audited as production evidence for this increment.

## 7. Limitations, explicitly unresolved

- All new 48 tests operate on authored fixtures. There is **no independently labeled original-review corpus** and no estimate of authentic duplicate precision/recall, false merging, authenticity of original labs, decision stability over time, multilingual retrieval recall, or marginal research cost.
- `sufficient_bounded` is a **research-only advisory** generated from operator-reviewed assumptions and Phase79 constraints; it is not a license to tell consumers that a product is scientifically verified, nor a statistically defensible percentage of completeness. Human review, rights/variant verification and Phase193 evidence admission remain separate.
- Search receipts and laboratory-root IDs are **annotations**, not authenticated publisher content bytes or independently verified experiment identity. Article age and country do not prove originality. Shared international test programmes may generate multiple publisher articles from one experiment.
- Language tags and market codes are narrowly validated. The system does not perform translation, international crawling, natural-language expertise verification, robust locale normalization, publisher-language authentication or automatic review of foreign-language text. Existing English-first semantic engine is unchanged.
- The Phase182/196 read-only bridge is not wired into live crawling, production queues or final ranking. No live customer ranking effects were measured.
- The module currently uses deliberately **conservative deterministic rules**, not statistical confidence, empirical threshold calibration, a trained language model or an empirically estimated Value of Information. Some exploratory searches may be unnecessarily continued and some operator-endorsed sufficiency recommendations may prove premature on real data.
- For extreme scarcity, a reviewed lack of accessible sources closes the **current search attempt**, not the set of sources that could exist now or emerge tomorrow. Explicit fresh-event triggers and time/effort accounting are Phase198 work.
- Copyright/licensing, storage privacy and authority of the reviewer receipts require operational policies before deployment. As per Phase195, no full editorial review bodies are intentionally persisted by Phase197.

## 8. Phase198 benchmark and integration sequence

1. Create lawful, independently annotated **original publisher-review snapshots** across at least several categories (home appliances, audio/electronics, kitchen equipment, niche products). Annotate exact variant, market, published/modified/test dates, measured and practical criteria, shared underlying experiments and conflicts, with inter-annotator adjudication. Avoid invented numbers and treat model-manufacturer claims separately.
2. Compare English-only vs multilingual discovery and specialist-domain search using **the same candidate universe, source-rights and research budget**. Measure new **independent** experiments found, decisive-criterion coverage, false source mergers, new/niche publisher retrieval, blocked translations, time/cost, and effects on product recommendations.
3. Operationalize scoped `targetIds`, original document/criterion linkage and the Phase182 queue so only reviewed, permissioned passes can actually close targets. Add resumable research receipts and invalidation on changed source/protocol/variant/needs.
4. Calibrate **marginal information value** and stopping rules using blinded held-out cases. Measure false premature stops and unnecessary extra work; compare against Phase79 unchanged and a naïve fixed-review-count baseline. No production stopping authorization without externally evaluated risk boundaries.
5. Consider privacy-preserving cross-session compact signatures only if empirical performance, cost and source rights justify them. Keep Phase193 reviewed screening memory versioned and safe from stale extract-hash reuse.

**Delivery:** full cumulative `product-evidence-engine-v5.21-phase197.zip`; this report; machine-readable test results and release SHA-256; `PEE-START-NEW-CHAT-PHASE198.md`; independently recoverable incremental checkpoint.
