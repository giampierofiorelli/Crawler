# PEE Phase 156 / v4.80 — Cumulative OSS code reuse, document reading and real-product transfer

**Date:** 11 October 2026. **Baseline:** independently opened original cumulative `product-evidence-engine-v4.79-phase155.zip` (1,638 file entries). **Mode:** opt-in, English-first, source-offset reversible analytical hypotheses. This is not a trained NER/RE system or a source-rights determination.

## Actual upstream reuse and integration

This phase imports and ports **actual source code**, in addition to the user-provided original archives already retained in `research/upstream_source_archives/`:

| Repository | Preserved exact Python source | Executable PEE integration | What remains absent |
|---|---|---|---|
| GLiNER2 — Apache-2.0 | `gliner2/inference/overlap.py`, `gliner2/inference/chunking.py`, `gliner2/joint_ie/constraints.py` | `src/phase156_gliner_portable.ts` adapts the exact-boundary deduplication, deterministic weighted-interval overlap solver, nested/longest/allow policies, and overlapping word-window/global-offset approach | Learned span encoders, weights, GPU/CPU inference, rich constraint solver, trained NER accuracy |
| DeepKE — MIT | `src/deepke/relation_extraction/document/prepro.py` | `src/phase156_deepke_document_graph.ts` adapts its DocRED-style `sents`, `vertexSet`, head/tail pairs and sentence-level evidence representation | Trained document-level relation model and joint cross-sentence reasoning; inferred coreference/identities |
| medSpaCy — MIT | Retained in `third_party/phase154_reference_sources` | Existing medSpaCy-derived ConText scope/negation module, now re-run after document-wide span selection | Clinical NLP stack and general semantic understanding |
| Snorkel — Apache-2.0 | Retained in `third_party/phase154_reference_sources` | Existing labeling-function coverage and conflict diagnostics, now reused at full-document level | Generative probabilistic label model and learned truth likelihoods |

**Source of the modifications:** all above local user-supplied GitHub archives. No paid APIs, NER model download, PyTorch runtime, live browser dependency, database writer or UI badge was introduced. The proprietary software can retain the upstream notices in technical source files without displaying upstream branding on its public page, subject to deployment-specific license compliance.

The opt-in `analyzeEnglishReview156()` calls the Phase155 engine on source-preserving overlapping windows, remaps each mention/relation/measurement back to original global UTF-16 JavaScript string offsets, deduplicates exact repeats, globally selects a compatible high-utility set of spans with GLiNER2-derived weighted interval scheduling (rather than the Phase155 same-start-only overlap preference), recovers a page-title correspondence for model names consisting entirely of words, re-runs medSpaCy ConText over the full input, re-runs Snorkel LF coverage diagnostics, and constructs a DeepKE DocRED-style document graph with evidence sentence IDs. All legacy source-offset readings remain inspectable in the prior Phase155 API.

**Important:** these are algorithms and data structures ported from the repositories, not equivalents of their pretrained machine-learning models. The document graph groups only **identical written surfaces**, never assumes product catalog identities or merges similar SKUs. No new interpretation is learned from unlabeled text. Title correspondence is source evidence, not proof of commercial identity.

## Independent algorithmic port parity (not extraction accuracy)

Run a fixed-seed Python comparison against the exact upstream file `third_party/phase156_reference_sources/gliner2/overlap.py`: four overlap policies, 45 generated candidate groups per policy = **180 cases**. The TypeScript resolver agreed exactly with upstream for **180/180 cases**. Stored in `PHASE156-UPSTREAM-OVERLAP-PARITY.json`. This does not validate NER generalization or improve model accuracy by itself.

## Genuine external publisher review pilot — selected manual excerpts

The following **real professionally published reviews** were located and inspected on 11 Oct 2026 before evaluating the Phase156 source reader. Only developer-selected contiguous or assembled short windows were run; **no full article was automatically fetched or processed**, publisher original text is excluded from the release. These are **developer-inspected development cases**, and changes to model-name title correspondence followed this pilot. No blind/source-disjoint quality measure is claimed.

| Product, source | Phase155 names | Phase156 names | Phase156 output, observed limits |
|---|---:|---:|---|
| LG LS27T3230S refrigerator — [RTINGS, review 9 Oct 2026](https://www.rtings.com/refrigerator/reviews/lg/ls27t3230s), Methodology v1.1 | 4 | 4 | Correctly proposes LG as reviewed surface, identifies Whirlpool WRS588FIHZ, Frigidaire FRSS2623AS and GE GSS25GYPFS as other written model surfaces; four page-scoped measurement candidates: **81.3%**, **40.0%**, **18.1%**, **37.0 dBA**. Only the Whirlpool receives a comparison role in the available excerpt, other two remain unresolved; no claim that product identities, roles or results are verified. |
| Cosori Dual Blaze Twinfry Compact air fryer — [TechRadar, 1 Sep 2026](https://www.techradar.com/home/air-fryers/cosori-dual-blaze-twinfry-compact-review) | 5 | 5 | Word-only commercial model recovered as tentative reviewed name through title correspondence. **False candidate `At 60dB` remains**; the article's own 60 dB measurement is not captured as a typed observation. Specification table not yet converted into structured product evidence. |
| De'Longhi Dedica Duo espresso machine — [TechRadar, 29 Sep 2025](https://www.techradar.com/home/coffee-machines/delonghi-dedica-duo-review) | 5 | 5 | Product name in ASCII and typographic-apostrophe forms is tentatively recognized as reviewed surface; the Dedica Style is distinct. **False over-extended `Casabrews 5418 Pro I` remains**; the source's rich discussion of brew consistency and coffee-making conditions is not yet represented as controlled qualitative evidence. |

Machine outputs: `PHASE156-REAL-PRODUCT-DIAGNOSTICS.json`. They include source URLs, input SHA-256s, counts, role candidates and derived values, **not publisher paragraphs**. The first Cosori/De'Longhi diagnostic exposed title-word problems and informed a post-code patch. **These examples are no longer unbiased challenges.** No precision, recall, accuracy, or independent real-review benchmark score can be inferred.

## Regression, custody and licensing

- **2,052 eligible TypeScript tests passed across 116 files**, including **15 Phase156 tests**, in bounded 12-file shards. The two previously excluded legacy Phase91/92 files stay excluded. This was not one uninterrupted suite command.
- **77 Python tests passed**, from 47 primary, 21 ingestion and 9 Phase133 offline probe tests.
- All **1,638 original Phase155 ZIP files** preserved byte-identically except `package.json` and the intentionally added `README.md` handoff. Incidental `.pyc` test changes were reverted from the baseline before packaging. See `PHASE156-BASELINE-INTEGRITY-AUDIT.json`.
- The local source-read `npm run test:phase156` and `node scripts/evaluate-phase156.mjs --file <authorized-source-text> --title ... --url ...` are deterministic with identical inputs. `evaluate-phase156.mjs` never fetches or prints the original article text.
- Upstream MIT notices and Apache-2.0 license sources are preserved under `third_party/`; all four original repositories remain in the cumulative archives. No third-party public UI attribution was added.

## Strict safety and open engineering gates

`sourceAuthenticated`, `independentlyAnnotated`, `canonicalWriteAuthorized`, `rankingAuthorized`, `modelInferencePerformed` remain explicitly `false` in the Phase156 ledger. Neither this branch nor Phase155 writes into canonical evidence or changes deterministic recommendation rankings. Document vertices are written-surface clusters, not proven product identities; relation edges remain proposals with sentence evidence.

**Still unproven:** reading entire publisher-permitted reviews automatically; combining non-adjacent subject mentions or pronouns accurately; resolving variant descriptions expressed in prose; capturing source-specific units and qualitative outcome claims; avoiding false `dB` model names and spurious trailing words; quality/recall on independently annotated reviews from new publishers and unseen categories; licensed/operationally feasible usage of the actual GLiNER2 and DeepKE *trained* models. The next engineering decision is evidence-driven: acquire authorized full-review input, establish external adjudication, then measure what the lightweight port misses versus an actual local learned model under CPU/RAM/weight/license constraints, not assume either is superior.

## Source code, source documentation and publisher URLs

- Original, user-uploaded GLiNER2: https://github.com/fastino-ai/GLiNER2 — Apache-2.0. Local algorithm sources `inference/overlap.py`, `inference/chunking.py`.
- Original, user-uploaded DeepKE: https://github.com/zjunlp/DeepKE — MIT. Local algorithm source `src/deepke/relation_extraction/document/prepro.py`.
- Original, user-uploaded medSpaCy: https://github.com/medspacy/medspacy — MIT.
- Original, user-uploaded Snorkel: https://github.com/snorkel-team/snorkel — Apache-2.0.
- LG RTINGS: https://www.rtings.com/refrigerator/reviews/lg/ls27t3230s
- Cosori TechRadar: https://www.techradar.com/home/air-fryers/cosori-dual-blaze-twinfry-compact-review
- De'Longhi TechRadar: https://www.techradar.com/home/coffee-machines/delonghi-dedica-duo-review
