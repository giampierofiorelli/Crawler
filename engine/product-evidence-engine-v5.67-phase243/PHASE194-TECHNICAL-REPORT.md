# Product Evidence Engine v5.18 — Phase 194: Deduplication Candidate Retrieval and Review Revalidation

Date: 2026-10-13. **Status: completed bounded source-code audit and experimental engineering increment; NOT an independently validated web duplicate-detection system or production ranking permission.**

## Executive verdict

Four full repositories supplied by the user were read directly from the uploaded ZIPs. There are valuable reusable engineering concepts, but their whole installations would introduce unnecessary components at this stage. Phase194 therefore adds a small, original TypeScript **candidate generation** layer to PEE Phase192 source lineage and Phase193 screening memory, without introducing any dependency from the four libraries.

**Important epistemic boundary:** a similar article is not necessarily a copied article; a copied article does not automatically prove a duplicate original test; two independent tests can generate identical numerical measurements. Phase194 never infers original scientific experiment identity, never merges experiments, never alleges plagiarism or misconduct, and never changes a public ranking.

## Source audit — user-supplied code, not assumptions about GitHub HEAD

| ZIP archive | Source files inspected | Engineering learning | Decision |
|---|---|---|---|
| `datasketch-master.zip` (MIT) | `datasketch/lsh.py`, `datasketch/minhash.py`, `datasketch/lshensemble.py` | MinHash signatures, LSH blocking, approximate-neighbor false-positive/false-negative tradeoffs, persistent index options | **High-value comparator**; real code executed locally via `sys.path`, not installed in PEE |
| `text-dedup-main.zip` (Apache-2.0) | `src/text_dedup/minhash.py`, `src/text_dedup/simhash.py` | Bulk signature generation, efficient candidate clustering, post-candidate Jaccard verification | Study post-retrieval checks; bulk datasets/polars dependencies inappropriate now |
| `dedupe-main.zip` (MIT) | `dedupe/api.py`, `dedupe/blocking.py`, `dedupe/predicates.py` | Human-labeled matching and nonmatching pairs; `uncertain_pairs` / `mark_pairs` for supervised entity resolution | Strong future candidate for **human-reviewed record linkage**, requires authenticated, sufficiently numerous independent labels |
| `changedetection.io-master.zip` (Apache-2.0) | `changedetectionio/processors/base.py`, `changedetectionio/content_fetchers/requests.py`, `changedetectionio/store/__init__.py` | Source versioning, content checksums, diffing, change history | Reuse checksum+revision concepts; no web-monitoring server now |

Official repositories: https://github.com/ekzhu/datasketch ; https://github.com/ChenghaoMou/text-dedup ; https://github.com/dedupeio/dedupe ; https://github.com/dgtlmoon/changedetection.io . SHA-256 and archive integrity details: `PEE-PHASE194-FOUR-REPOSITORY-INTEGRITY.json` delivered separately. All four ZIP checks passed; no code has been copied from them into the PEE repository.

External documented method: https://github.com/ekzhu/datasketch/blob/master/docs/lsh.rst — approximate MinHash-LSH retrieval does **not** guarantee exact results and should be followed by checking original sets. The local uploaded code was the main inspection basis, not a promise of compatibility with any different live GitHub revision.

## New code and interfaces

- `src/phase194_candidate_retrieval.ts` is an **additive** source-candidate index. It reuses `normalizeDiscoveryUrl192` and the actual `lookupScreening193` gates, with no parallel ranker. Single-pass deterministic sorted indexing detects declared raw-body text hashes, canonicalized URLs, identical normalized text, and near-identical distinctive shingle sets.
- Source evidence basis remains explicit: `publisher_bytes`, `rights_appropriate_extract`, `analyst_annotation`. The program validates SHA-256 against supplied local text but does **not** authenticate publication origin or content rights.
- For approximate search, tokenize English-first text, form 5-token shingles, remove highly frequent (boilerplate) shingles in corpora of at least twelve documents, create deterministic 64-value MinHash-style salted signatures, index 16 bands × 4 rows, and verify candidates with *distinctive-shingle* Jaccard (experimental floor 0.60). These parameters have not been externally tuned or validated.
- For a reused Phase193 screening decision, `checkFreshPublisherSnapshot194` requires newly acquired publisher bytes and applies the existing Phase193 exact content/policy/classification/scope review. ETags and old hash assertions alone do not prove freshness. Neither crawling nor HTTP download is performed.
- `evaluateCandidateRetrieval194` accounts for explicitly supplied human-labeled `textuallyRelated` pairs with TP, FP, FN and TN, but the API does not authenticate a purported reviewer's identity; provided labels in our benchmark were constructed by its author and **are not independent ground truth**.
- `scripts/phase194_offline_datasketch_reference.py` can run the user-provided datasketch code *outside the PEE runtime*, using a specified local repository path. No Python package was installed into PEE's dependencies.
- `scripts/phase194_demo.mjs`, `evaluation/phase194/*.json`, `docs/phase194/README.md`, `tests/phase194_candidate_retrieval.test.ts` give a reproducible, bounded pilot.

## Evaluation performed — do not mistake this for real-world validation

**Targeted:** 41/41 TypeScript tests passed; they cover exact and near duplicates, wrong product variant, same numeric outcome in independent experiments, shared boilerplate, URL tracking variants, malicious/invalid hashes, content updates, stale screening decisions, policy/context changes, unverified annotations, order invariance and explicit false-positive accounting.

**Cumulative TypeScript:** 3,141 tests passed in 156 admitted suites; historic Phase91/92 intentionally excluded per the preceding release's policy.

**Cumulative Python:** 212 tests passed across six groups; existing resource warnings in one historical companion group do not count as test failures.

**Illustrative dataset:** 78 author-written synthetic documents, eight deliberately related pairs, ten explicitly unrelated labeled pairs. The original unfiltered native prototype caused 2,942 candidate pair comparisons, demonstrating a serious *boilerplate collision* weakness. The improved filtered version performed **8 comparisons of 3,003 possible**, found the eight deliberate related pairs and none of the ten deliberately unrelated pairs. Precision/recall on these 18 **constructed** labels = 1.0/1.0. This is NOT externally estimated precision/recall; the labels and template edits were designed by the same author and are too easy to generalize.

**Actual uploaded reference implementation:** Running the `datasketch-master` code directly on a parallel 78-document **synthetic** comparison produced 2,998 candidate pairs before removing document-frequency-heavy boilerplate, and 8 after applying the same shingle-filter idea (all eight planted related pairs retrieved). This comparison illustrates the need for corpus-aware preprocessing, not superiority over datasketch or proof that the native module is better for real web documents. Different authored templates in the two benchmark scripts mean raw pair counts are not a formal head-to-head efficacy result.

## What remains unresolved and why it matters

1. **Ground truth:** no authentic, rights-cleared corpus of independent publisher reviews with blinded human labels and adjudicated original experiment relationships was supplied or acquired. Do not fabricate an empirical false-merge or copy-detection success rate.
2. **Deep paraphrases and quotations:** content with little lexical overlap can go undetected. Different numbers, dates and layouts can also defeat shingle matching. Conversely, shared manufacturer boilerplate may produce false candidates. Need rigorous real-case recall and false-positive studies.
3. **Publisher and origin identity:** a SHA of local bytes does not prove which publisher served them; independent source and byte custody are necessary.
4. **Scale and performance:** pilot index is memory-resident, per-batch; it can degrade on very short articles, common templates or extremely large corpora; no concurrent writer, durable LSH index or maintenance jobs yet.
5. **Review state:** the Phase193 JSON event-chain is tamper-evident without external reviewer authentication. Only a properly authenticated reviewer can approve source provenance for production.
6. **Cumulative research system:** Phase194 retrieves **candidate documentary relationships**. Phase192 remains responsible for asserted source→claim→event lineage; Phase191 for claim producer vs marketing source; Phase181 for eventual approved ranking. Phase182 job integration awaits controlled source custody.
7. **Intellectual property:** metadata and brief licensed analysis only; do not silently publish large quantities of copied publisher review text.

## Next phase suggestion: 195

Build a **real cross-category, independently adjudicated challenge set** with separately labeled (a) exact/near-document duplicates, (b) attributed reproductions or paraphrases, (c) shared original experiment, (d) truly independent experiments with same measurements, (e) new independent observations embedded in derivative articles. Blind annotators to the model's prediction, validate sources and model variants, measure stratified precision/recall and false merges, and compare native/indexed to audited existing OSS under consistent resource budgets. Only after measured gains decide whether to add `datasketch`, `dedupe`, or a source-monitoring backend. Retain products from discovery-only affiliate roundups without upgrading their star scores to technical evidence.

This file is an engineering report, not proof of independent product-ranking validation.
