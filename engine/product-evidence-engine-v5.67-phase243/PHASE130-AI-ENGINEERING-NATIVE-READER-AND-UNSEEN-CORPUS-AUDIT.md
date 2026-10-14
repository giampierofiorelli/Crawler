# Product Evidence Engine — Phase 130: native scientific-reader engineering evaluation

**Date:** 11 October 2026. **Version:** v4.54-phase130. **Status:** local, bounded, evidence-proposing prototype; NOT autonomous web-scale knowledge acquisition or validated open-domain semantic understanding.

## Executive verdict

The engineering choice to own the product ontology, evidence provenance and decision rules remains appropriate. **It does not follow that regexes are sufficient as a universal scientific reader.** Phase130 tested the existing Phase129 acronym-only observer against a new, local multi-signal observer and then against a separately prepared post-code category challenge. The development result improved substantially; the post-code challenge exposed very poor recall. Hence the main project investment should now be grounded, empirical machine learning / relation extraction, not an ever-increasing list of rules, while preserving the same canonical evidence architecture.

**Crucial:** neither a candidate name nor a source quotation licenses a claim that a metric predicts product quality, that it has a universal direction, or that any actual product is best. The prototype never promotes discoveries without Phase129 review.

## What AI engineering actually teaches us

1. **Semantic bootstrapping, not only lookup dictionaries.** Thelen & Riloff's *Basilisk* learns lexicon members from shared extraction-pattern contexts. It is a model for growing conceptual vocabulary from text. Its reported results apply to their evaluated categories, not ours. https://aclanthology.org/W02-1028/
2. **Weak supervision.** Ratner et al.'s *Snorkel* makes heuristics and patterns imperfect labeling functions; a generative model estimates their reliability and dependency. **Phase130 implements only a deterministic multi-signal candidate reader, not the Snorkel generative label model.** We must avoid treating agreement among correlated patterns as independent confirmation. https://pmc.ncbi.nlm.nih.gov/articles/PMC5951191/ ; https://doi.org/10.14778/3157794.3157797
3. **Cross-sentence relation extraction.** Yao et al.'s *DocRED* evaluates relations that cannot necessarily be deduced from one sentence. Our Phase130 deliberately has no such inference. It should not claim to understand caveats spread across a full review. https://aclanthology.org/P19-1074/
4. **Provenance.** The W3C PROV-O recommendation represents relationships between entities, activities and sources. The existing Phase128–129 transaction model uses source identities, exact spans, content hashes, staged review and versioned concepts; this follows a similar purpose, but is **not a PROV-O implementation**. https://www.w3.org/TR/prov-o/
5. **Measurement validity before ranking.** NIST describes operating conditions, uncertainty, repeatability and traceability as prerequisites for interpreting a measurement. Hence identifying a unit or measure name does not establish a comparable endpoint or a performance threshold. https://www.nist.gov/publications/traceability-considerations-characterization-and-use-measuring-systems ; https://www.nist.gov/calibrations/traceability
6. **Active learning and selective review.** The literature distinguishes uncertainty sampling, disagreement and diversity, to decide which examples to send for review. Our current review queue only groups labels and counts source identifiers / distinct hostnames. Hostnames do **not** prove editorial or experimental independence and no confidence score is calibrated. https://link.springer.com/article/10.1007/s10462-022-10246-w ; https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2026.1844765/full

## What was coded

- `src/phase130_native_scientific_reader.ts`: internal English-oriented, bounded, deterministic candidate extraction from source text. Four contextual signals (`acronym_definition`, `label_definition`, `measured_property`, `measurement_instrument`). It filters a limited set of explicit unsupported/negated assertions, keeps original substring offsets and returns only `outcome` *hypotheses*. It does not generate quality claims.
- `nativeScientificExtractor130()`: a local-only adapter to `stageCategoryObservations129`, which validates exact spans, permissions asserted by a caller, source IDs, hashes and category state, and quarantines suggestions. No autonomous approval or ranking.
- `planConceptReviews130()`: deterministic deduplication and review queue by hostname and source identity, explicitly without treating multiple hostnames as independent measurements.
- `planScientificFollowups130()`: five research obligations for each novel metric: technical definition; procedure/version; units, conditions and uncertainty; relationship to user goals; comparable original product results. All are questions, not asserted scientific facts.
- Tests and executable evaluation script compare Phase129 with Phase130 on the same inputs; result artifacts retain item-level predictions and errors.

## Empirical comparison and methodological limitations

The original Phase129 observer uses an acronym with a metric-like expression. The Phase130 reader applies other explicit scientific-text cues. Both saw the same small source snippets.

| Dataset | Input | Phase129 correct | Phase130 correct | Phase130 false-positive | Phase130 missed expected |
|---|---|---:|---:|---:|---:|
| Frozen development corpus | 10 author-curated cases, 9 expected metrics | 0/9 | 9/9 | 0 | 0 |
| Post-code challenge | 8 newly created cases, 6 expected metrics | 0/6 | 2/6 | 0 | 4 |

*Counts are exact matches of manually assigned metric names, not evidence of general language understanding.* The first corpus was frozen before writing the extractor, **but the code was debugged against it**, so it must be treated as a development set. The second was written after the extractor code was implemented, and the extractor was **not tuned to it**. Both consist of deliberately short **editorial restatements** of claims verified in publicly accessible source material, plus constructed negatives. They are not raw downloaded original pages, and their labels have not been independently adjudicated. In particular, the 100% precision in the small challenge is meaningless as a population-wide reliability claim: it rests on only two positive predictions.

The four missed challenge concepts are `Minimum High Speed Airflow`, `Spray force`, `Spray coverage` and `Pressure compensation`. Their varied constructions expose the need for learned semantic structure and entity-relation modeling. The source texts were not altered after failure. The full item-level log is in `PHASE130-POSTFREEZE-CHALLENGE-RESULTS.json`.

### Source material independently consulted, not live-fetched by software

- ENERGY STAR — Dehumidifiers testing, IEF vs EF and capacity: https://www.energystar.gov/products/dehumidifier_testing_and_capacity
- ENERGY STAR — Dehumidifier efficiency criteria/measurement definitions: https://www.energystar.gov/products/dehumidifiers/key_efficiency_criteria
- ENERGY STAR — Clothes dryer criteria and combined energy factor: https://www.energystar.gov/products/clothes_dryers/key_product_criteria
- ENERGY STAR — Consumer description of CEF: https://www.energystar.gov/products/clothes_dryers
- ENERGY STAR — Ceiling fan efficiency and airflow conditions: https://www.energystar.gov/products/ceiling_fans/key-product-criteria
- EPA WaterSense — Spray force, coverage, flow rate and pressure compensation: https://www.epa.gov/watersense/showerheads
- EPA WaterSense specification (primary test requirements): https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P100VLRA.txt

Neither the engineering runtime nor this phase performed a successful live site crawl. Public documents were checked with the available web research tool; direct internet retrieval in the code container failed at DNS resolution. Exact quotation anchoring in unit tests is **relative to supplied fixture text**, not independently authenticated remote page snapshots. The source attribution metadata is manually supplied, and the `example.org` negatives are synthetic only.

## Engineering finding: why this still falls short of a learning brain

The architecture now has a working path for **supplied local text → potential technical label → concrete research obligations → quarantined category knowledge**. But it does not yet infer concepts from unseen natural prose in varied syntax, classify unknown categories and tasks, resolve cross-paragraph scope, prove publisher/test independence, calibrate confidence or automatically learn grammar. It has no independent product-performance database for the new categories.

A faithful analogy to AI training requires a new empirical loop: collect a permissioned original-source corpus with metadata; have independent experts annotate spans, relations, negations, contexts and critical omissions; freeze a blind cross-domain test set; train and calibrate a specialist model on separate material (or evaluate a replaceable local open-weight model); compare both to the native rule engine; inspect false attribution, omissions and reviewer effort. Keep the deterministic ontology, evidence gates, protocol comparability and ranking outside the language model.

## Proposed next engineering sequence (Phase131)

1. **Controlled original-page acquisition** with source snapshots and rights checks. Reuse existing Phase74/75 infrastructure; demonstrate actual permitted downloads independently of manually pasted passages.
2. **Expert-labeled semantic relations:** `<consumer goal, physical mechanism, measured endpoint, test conditions, applicability, failure mode>` rather than metric names alone. Annotate source spans, evidence of negation and whether a measured endpoint actually predicts consumer benefit. Distinguish annotations from source assertions.
3. **Genuine learned baseline:** train a small local sequence tagger / relation classifier or try a small local pre-trained encoder under controlled compute and license conditions. A frozen-encoder comparison is acceptable as a bounded third-party component if it beats our own approach on blind samples. Don't assume an LLM is necessary.
4. **Scientific validation:** per-class precision/recall, domain holdout, epistemic abstention, cross-source leakage, human review workload, source-to-product attribution, and sensitivity to versioned protocols. Regressions on negation and outdated metrics are mandatory.
5. **Closed-loop category knowledge:** only authenticated review may promote new concepts; durable commits and dependency invalidation remain open from Phase129. After promotion, test that new user requests can refer to the reviewed metric without modifying product evidence.

**Decision:** the Phase130 reader is a useful safe candidate generator, but the 2/6 post-code hit rate is not enough to justify continued rule-by-rule expansion as the principal open-domain solution. We should now evaluate learned specialist semantics, still hosted and governed internally, against a substantially stronger independent original-source benchmark.
