# Product Evidence Engine — Phase 110
## Source-wide, local, query-neutral semantic extraction and omission auditing

**Research / implementation:** 11 October 2026  
**Baseline:** full cumulative v4.33 / Phase 109  
**Delivery:** experimental integration, with injected model interface and a loopback-only Ollama adapter. **No actual Ollama model run, professional-review corpus, original expert labels, or real-world claim recall validated.**

## Executive verdict

The user has specified a genuinely important property of the product's knowledge system: the first customer query that happens to discover a product must not select what is learned from its professional reviews. The intake system must attempt to capture all relevant atomic findings, favorable and unfavorable, expected and unexpected, while preserving measured test values, conditions, provenance, uncertainty, limitations, and comparisons. The reviewer prose itself is **not** the canonical knowledge store. Previously established source-access controls and review approval remain required.

This phase makes the upstream machine-readable extraction **run as executable code**, rather than accepting only preauthored evidence atoms. It follows the Phase 109 inventory and writes reviewed results only through `SourceWideSemanticMemory109`. It is not accurate to say that it now recognizes every detail of every article: neither the inventory's completeness nor semantic extraction recall has been established on an independently annotated real dataset.

The main scientific guardrail is **do not confuse evidence grounding, duplicate-model output, actual extraction accuracy, and approval**. These are different things.

## 1. Primary source-derived methodological support

| Source | Verified contribution | What this does **not** establish |
|---|---|---|
| Cochrane Handbook, Chapter 5, Li/Higgins/Deeks, v6.5 (2024) https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-05 | Structured data collection, complete and traceable extraction, linked original studies vs. reports, independent duplicate extraction of key outcomes, explicit reconciliation and future reuse | A consumer review extraction system has Cochrane-level validity, or that two passes by one LLM equal two independent professional reviewers |
| Liu et al., *Lost in the Middle*, TACL 2024 https://aclanthology.org/2024.tacl-1.9/ | Relevant information may be recovered less reliably from middle positions of long model inputs, motivating bounded segments and positional stress tests | That the selected arbitrary 14,000 UTF-16 code-unit cap is universally optimal |
| Min et al., *FActScore*, EMNLP 2023 https://aclanthology.org/2023.emnlp-main.741/ | Atomic factual propositions and their support are an appropriate level for factuality analysis | Source-side recall of ALL claims; FActScore chiefly evaluates factual precision of generated text, not document-wide extraction recall |
| Šimsa et al., *DocILE*, ICDAR 2023 https://github.com/rossumai/docile and https://arxiv.org/abs/2302.05658 | A benchmark approach for localized document information extraction, with precision, recall, F1 and field-type breakdowns | DocILE's business-document labels are equivalent to the product-review phenomena we need |
| Ollama official structured output documentation https://github.com/ollama/ollama/blob/main/docs/capabilities/structured-outputs.mdx and https://ollama.com/blog/structured-outputs | Ollama local API supports JSON-schema constrained outputs | Schema-compliant output is semantically true or complete; any specific local model is accurate |
| GROBID FAQ https://github.com/grobidOrg/grobid/blob/master/doc/Frequently-asked-questions.md | Document parser can preserve structural regions but may not recover table cell structure reliably without other tools | GROBID is a comprehensive consumer-review web crawler or is already integrated in this project |
| W3C PROV https://www.w3.org/TR/prov-overview/ | Evidence provenance should remain recoverable after normalization | Semantic correctness of derived observations |

## 2. What is implemented in the cumulative source tree

**Main code:** `src/phase110_local_semantic_extractor.ts`  
**Tests:** `tests/phase110_local_semantic_extractor.test.ts`  
**Illustrative executable example:** `examples/phase110-semantic-demo.ts`  
**Results:** `audit/phase110/constructed-extraction.json`.

### Source-wide operations

1. `SourceInput110` requires a source-specific original test identity, report identity, source URL, exact allowed variants and all declared blocks. There are **no fields for a user's discovery query, user identity, weighting, or personal goals**. Extra top-level fields are rejected.
2. Blocks carry surface type, addressable locator, accessible state and a declared representation quality: `complete`, `partial`, or `unavailable`. A readable caption of an unreadable chart remains *partial*.
3. Reuses Phase 109 `makeEphemeralInventory109`, retaining block hashes and source-revision identity, not the article body. The upstream rendered-page parser still needs independent source-coverage audit.
4. The model receives **each bounded block separately** (the 14,000-code-unit limit is a safety engineering default, not a scientific optimum), with an initial broad evidence extraction pass followed by a different omission-hunting pass. Inputs over the threshold become unresolved: there is no silent truncation. Upstream structure parsing or block splitting is needed for long paragraphs.
5. Returned model claims contain exact source positions or a **short temporary literal anchor** that the deterministic validator locates uniquely within that block. The anchor is dropped before generating the output packet or storing a fact.
6. Each claim must be an atomic record with variant, aspect, polarity, typed kind, condition identifiers, epistemic status, evidence mode and source span. The source may contain favorable results, failures, missingness, methods, limits, context, quantitative measurements, unusual aspects or comparisons. Unknown taxonomy concepts are allowed as unmapped codes, not silently discarded.
7. Invalid structures, cross-segment reports, unsupported numeric literals, unresolvable anchors and model failures are flagged. Numeric presence within an anchor is a **lexical plausibility check**, not metrological validation. Unit, protocol, exact-variant applicability and semantic entailment must still be independently verified.
8. Exact duplicate candidates from both passes are deduplicated by stable fingerprints. Two model passes are **not independent original scientific evidence**. Source authors and actual original tests remain authoritative lineage dimensions.
9. `ExtractionPacket110` is a review packet: everything is provisional. `applyHumanReview110` requires an external authentication callback and complete block-level decisions, and then reuses the **Phase 109 authoritative SQLite ledger**. Missing, unresolved or rejected candidates cannot simply disappear under a supposed full-coverage approval. An externally authenticated review receipt is a **required integration contract**, not a built-in digital-signature provider. Human sign-off cannot guarantee perfect recall, either.
10. Query-time ranking, the Phase 101 canonical memory and the public recommendation pipeline are **unchanged**. No LLM-produced observation is admitted or ranked just because it fits a user query.

### Ollama adapter limitations

`ollamaLocal110(modelName, endpoint)` is an **optional executable adapter** for a locally installed Ollama server. It accepts only explicit loopback HTTP endpoints; outbound commercial APIs and redirects are rejected. It requests constrained JSON using Ollama's `format` schema and runs with temperature zero, a bounded request and no streaming. The interface can be injected with a deterministic stub to test the full pipeline without a model. There is **no evidence yet** that an installed local model can correctly produce the complete schema for real reviews; validating that is the next empirical engineering hurdle. The LLM may still obey hostile instructions embedded in an untrusted review: the schema, source anchoring and required downstream review reduce certain risks but do not provide a proof against prompt injection.

### Critical source representation boundary

The current module **does not fetch, parse or render a professional review automatically**. It assumes an already-authorized upstream parser has identified source blocks. It does not decode image-only plots, transcribe video or infer invisible table cells. The project-wide source policy must be respected upstream. Any unavailable or partial visual surface remains an explicit coverage blocker.

## 3. Demonstration actually run

The demo uses an **invented vacuum review**, not a professional article:
- Main paragraph: strong cleaning, with an audible motor whine at full power.
- Footnote: pet hair accumulation around the brush.
- Publisher metadata section: no product observation.

The deterministic simulated model returns cleaning and brush maintenance in pass one and the overlooked motor noise aspect in pass two. Output packet contains three atomic concepts: `cleaning_quality`, `noise_tone`, `pet_hair_wrap`. They retain distinct favorability and provenance but are still **provisional**. The output is `audit/phase110/constructed-extraction.json`; it deliberately stores no paragraph text. The toy 0.75 recall displayed in this demo is an **illustration of the metric calculation on invented gold labels**, not measured system recall on a real corpus.

## 4. What must be tested scientifically on real articles

### Sampling and adjudication

- Build a legally usable source sample with varied brands and variants, publishers, category criteria, reviews containing dense prose, specs, footnotes, tables, images, context restrictions and editorial comparisons.
- Separate the original author/test identity from article URL. Ensure that syndicated test copies do not become independent confirmations.
- Have trained human annotators **independently** identify all decision-relevant atomic assertions *without knowing which category the user searched for*. Adjudicate disagreements, retain raw labels, define a taxonomy expansion process. Use held-out sources and publishers.
- Annotate facts at a granularity that supports comparisons: exact variant, target aspect, polarity, numeric value/unit, source condition/method, measurement vs. subjective evaluation vs. manufacturer attribution, uncertainty, comparisons and counterexamples.
- Record source parser completeness before extraction evaluation; if the visual/table content is not accessible, classify a parser coverage failure separately from a semantic extraction failure.

### Metrics

Compute exact and expert-adjudicated semantic match precision, recall, F1, and counts of false positives/negatives at claim level, *by document and by surface*. Evaluate missed-negatives separately (critical for recommendation risk), missed-qualified-statements, incorrect numerical attribution, wrong variant mapping, wrong comparison direction, method context omissions, reviewer and publisher generalization, and throughput. Use stratified uncertainty estimates where enough independent items are available; do not invent confidence intervals on this synthetic package.

`scoreHeldout110` implements a small transparent exact-label micro-counting utility with per-surface detail. **This is not a semantic matcher or calibrated benchmark**: human adjudication must establish the mapping between equivalent normalized claims and gold labels.

### Ablation comparisons

At minimum compare (A) baseline one-pass model; (B) two-pass within-source omission hunt; (C) one-pass plus independent verifier; (D) explicit source structure and tables; (E) human adjudication. Evaluate on a held-out source set with stable gold labels. Report recall *and* false-positive cost, not just number of extracted findings. Also test information positioned at the start, middle, and end of individual long sections, in light of Liu et al. 2024.

### Release gates

Production ingestion must not assert automatic completeness until: real authenticated receipts; independent held-out benchmark; parser layout coverage checks; source/variant lineage QA; local model version pinned and drift tests; controlled taxonomy evolution; end-to-end write isolation; and evidence rights/permissions checks. If an upstream part is missing, the product entity must preserve a durable unknown or unresolved state rather than silently manufacturing a fact.

## 5. Audit against cumulative architecture

- **Phase 95:** original professional test measurements stay distinct from manufacturer claims.
- **Phase 96:** qualitative strengths, weaknesses and contextual observations are maintained, not collapsed to sentiment scores.
- **Phases 97–100:** no global disqualification from a weak criticism; calibrated criteria and user-driven tradeoffs remain separate downstream of evidence intake.
- **Phases 101–104:** source-independent product knowledge, conflict/consensus states, provenance, revisable entity conclusions continue as before.
- **Phases 105–107:** incremental recomputation and personalized reasoning are not changed by extraction itself.
- **Phase 108:** the discovery query never enters the canonical interpretation contract.
- **Phase 109:** existing canonical source-wide ledger and approval boundary remain authoritative; Phase 110 is the *upstream candidate generator*, not a competing evidence database.

## 6. Evidence and release status

- Source tree derived from actual `product-evidence-engine-v4.33-phase109`, verified via file inventory, rather than reconstructed from memory.
- Local mainline TypeScript build passed, including the new code and example.
- **24/24** new targeted tests passed using deterministic synthetic/mocked local model outputs.
- Cumulative JS/TS shard and ancillary suite results and exact counts are recorded in `PHASE110-RELEASE-VERIFICATION.json` and logs.
- **No real local Ollama inference was run**. Local hardware, model availability, real-source rights, schema adherence, source recall, semantic quality, cross-source generalization, reviewer authentication and production integration are **not** empirically proven by this release.

## 7. Recommended Phase 111

Prioritize the *first real, legally authorized original-review dataset and locally executed model comparison*. Implement an actual source renderer/parser to provide complete eligible blocks and create an expert-labeled gold corpus for end-to-end coverage, including charts and method footnotes. Benchmark multiple local model configurations and verification strategies against the same gold, record cost/time/error, and connect only proven adjudicated output into canonical knowledge. Do not invent precision/recall, and do not allow a user query to determine which product claims are extracted.
