# Product Evidence Engine — Phase 153: source-anchored English commercial-entity inventory

**Release:** v4.77 / phase 153  
**Parent:** v4.76 / phase 152 (SHA-256: `a23171e4951513a6131817366b457572e324a223177670230b15e516fbd0f7a2`)  
**Date:** 11 October 2026  
**Status:** implemented, tested as a **separately invoked hypothesis/advisory module**; **not** a validated general-purpose NER, verified coreference engine, ranking input, or independent publisher-review benchmark.

## 1. Engineering decision

Phase 152 identified model-like competitor surfaces that an upstream reader had missed, but it mainly covered product codes and some numbered series. It could not reliably nominate all-word names (e.g. `Cosori Dual Blaze Twinfry Compact Air Fryer`), complex multi-token models, short family mentions, apostrophe-bearing brand forms or incomplete shorthand. A longer list of single-product regexes would be difficult to maintain, category-dependent and prone to new false vetoes.

Phase 153 introduces `src/phase153_entity_inventory.ts` (`discoverEntityInventory153`). It is an original TypeScript *candidate-lattice* reader that combines independent kinds of **observable textual support**; the signals are correlated and are neither probabilistic confidence nor identity authentication:

1. Source-anchored Phase148 anchors and Phase152 structured-name candidates, conserved with the full Phase152 reference-safety report.
2. Open-class token-sequence proposals across proper words, numeric codes, hyphenated tokens, letter/number mixtures, and multi-token families, without an appliance-specific list of model names.
3. Exact, bounded matches for caller-declared page aliases and corroboration when a phrase also occurs in a review's title. Such caller-provided metadata is **not externally verified**.
4. Separate, explicitly unresolved shorthand proposals when a number occurs in a compatible *textual* product-description frame; do not infer brand or SKU equivalence from it.
5. Repetition groups for **identical written surfaces**, and warnings for a shared-prefix *possible family/variant* (`Breville Bambino` vs `Breville Bambino Plus`, `LG C6` vs `LG C6 2026`). Neither a group nor a prefix warning merges identities.
6. A monotone safety screen over Phase152 document reference proposals: it can retain a prior decision or veto a tentative link when an additional plausible local name remains unindexed. It **never upgrades** a prior block/abstention to a link.

Candidate output includes the exact original character offsets and SHA-256 of each literal, identity flags, untrusted evidence signals, typed candidate kind and nonpromotion flags. The Phase152 report remains part of the returned object, conserving older source, experiment/observation and reference metadata. The scanner has a bounded candidate budget and reports truncation; a truncated inventory never silently means no competing products exist.

**Scientific/ranking invariants:** `commercialIdentityVerified:false`, `sourceAuthenticityVerified:false`, `canonicalWriteAuthorized:false`, `rankingAuthorized:false`. No evidence database, catalogue identity, model variant or published performance fact is autonomously authenticated. No change to the deterministic ranking and canonical intent path.

## 2. Reproducible source diagnostics, with proper caveats

`node scripts/evaluate-phase153.mjs` records **nine short snippets** from professional publishers (six already examined in Phase152, three newly checked). It compares exact matches on **12 developer-selected explicit surface targets**:

| Descriptive test (not a quality estimate) | Phase152 | Phase153 |
| --- | ---: | ---: |
| Exact target literals nominated in the nine selected short excerpts | 2 / 12 | 12 / 12 |

**This is not precision, recall, accuracy or a generalization estimate.** The text selection, target nomination and the later fixes were developer-directed. The additional punctuation/shorthand cases were adjusted *after* the initial diagnostic; its apparent complete coverage is training/development performance. Unannotated additional false positives, missed mentions and document-level coreference errors remain unknown. The report includes source URLs, excerpt hashes, exact output spans and explicit null values for independent estimates.

Publisher excerpts and sources:

- [TechRadar, Cosori Dual Blaze Twinfry Compact](https://www.techradar.com/home/air-fryers/cosori-dual-blaze-twinfry-compact-review) — all-word air-fryer name.
- [What Hi-Fi?, CD player comparison](https://www.whathifi.com/hi-fi/cd-players/thought-cd-was-dead-our-audio-experts-pick-out-the-best-cd-players-and-some-of-our-favourite-test-discs-that-you-can-own-for-ever) — `Marantz CD6007`, unresolved `CD 70` shorthand; the short passage alone does not establish an equivalent product.
- [HouseFresh, Philips 3200](https://housefresh.com/philips-3200-review/) — bare-number shorthand and different numbered family.
- [Trusted Reviews, Hisense washer comparison](https://www.trustedreviews.com/reviews/hisense-wf5s1045bw/) — `Samsung WW90T684DLH`.
- [Notebookcheck, Lenovo ThinkBook 16 G7 QOY](https://www.notebookcheck.net/More-than-24-hrs-battery-life-for-less-than-1-000-Lenovo-ThinkBook-16-G7-QOY-laptop-review.958162.0.html) — long multi-token model.
- [RTINGS, LG Gallery](https://www.rtings.com/tv/reviews/lg/gallery-2026) — all-word/numbered brand and competitor mentions.
- [Which?, Dualit 2 Slice Lite 26205](https://www.which.co.uk/reviews/toasters/2-slice-lite-26205) — newly checked toaster heading.
- [Tom's Guide, Breville Luxe Brewer](https://www.tomsguide.com/home/coffee-makers/breville-luxe-brewer-review) — newly checked coffee-machine passage.
- [Tom's Guide, affordable espresso machines](https://www.tomsguide.com/home/coffee-makers/no-you-dont-need-to-spend-usd1-000-on-an-espresso-machine-i-recommend-these-4-breville-and-delonghi-models-for-delicious-coffee-at-home) — short apostrophe-bearing product name.

### Separate, post-implementation challenge (not used for further tuning)

A later selection covered a dishwasher and robot vacuum products on **three additional, different publisher hostnames** from the development nine:

- [Reviewed, Bosch 800-series dishwashers](https://www.reviewed.com/dishwashers/best-right-now/best-bosch-dishwashers/)
- [Expert Reviews, Eufy Clean X10 Pro Omni](https://www.expertreviews.co.uk/home-garden/vacuums-cleaning/eufy-clean-x10-pro-omni-review)
- [TechHive, Roborock S8 MaxV Ultra comparison](https://www.techhive.com/article/2340503/roborock-s8-maxv-ultra-review.html)

**3 of 4** developer-identified product-name literals were exactly nominated. **Failure:** `iRobot Roomba j9+` was **not** captured as a complete source span (a partial `Roomba j9` was proposed). This is a real observed limitation of lower-case-prefix and punctuation handling, not evidence of an invalid commercial identity. The three challenge sources are hostname-disjoint from the nine Phase153 development excerpts **only**; prior cumulative PEE work has covered some of these categories, and there was no independent reviewer adjudication or frozen pre-tuning corpus. Do not call this blinded/source-disjoint scientific validation. See `PHASE153-POSTCODE-CHALLENGE.json`.

Four small **developer-constructed** negative controls on measurement/unit, mode, component and generic terminology produced no listed unwanted nominations. Four cases do not establish a false-positive rate, particularly since unlisted nominations are not comprehensively adjudicated.

## 3. Tests and regression

- New TypeScript test module: `tests/phase153_entity_inventory.test.ts`, **36 passing constructed tests**. Cases include diverse kitchen/home/audio categories, valid offsets/hashes, metadata, variants, alias distrust, truncation, no-promotion, deterministic replay and conservative safety behavior.
- All **112 eligible TypeScript test files** ran successfully in bounded groups: **2,011 passing tests**, compared with **1,975 / 111** in Phase152. The same Phase91/92 legacy files are excluded. An initial combined command timed out after 11 passing groups; groups 12–14 were executed successfully separately and the modified group 11 was rerun after four further tests were added. These results are an aggregate of recorded group runs, **not** a falsely reported single uninterrupted execution. See `PHASE153-REGRESSION-GROUPS.json`.
- Python: primary source **47**, ingestion **21**, Phase133 offline-probe **9**; total **77 passed**.
- Node/TypeScript build: completed; **zero** added runtime dependencies, API credentials, pretrained weights, server processes or paid scraping services.

Suggested commands:

```bash
npm run test:phase153
npm run demo:phase153
npm run regress:phase153
python -m unittest discover -s primary_sources -t . -p 'test_*.py'
python -m unittest discover -s ingestion -p 'test_*.py'
python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

The `regress:phase153` script runs the same bounded groups; under a constrained environment a single invocation can take longer than the orchestration timeout. The observed group verification is recorded separately so failures cannot be disguised.

## 4. Compute and deployment

`PHASE153-COMPUTE-DIAGNOSTIC.json` measures one local run per length on **constructed repeated text**: 194, 1,940 and 9,700 source characters. The Phase153 call (which itself invokes Phase152) took approximately **7.7 ms, 11.1 ms and 96.6 ms** on this environment; the longest sample triggered a truncation gate. These one-off, non-warmed, memory-uncontrolled results **do not establish production latency, peak RAM, or a head-to-head speed advantage**. The implementation remains native Node/TypeScript with no local model weight and no network calls. Larger article benchmarks and practical CPU/RAM ceilings need dedicated measurement.

## 5. Integration audit and remaining failure modes

**Actual connection:** Phase153 is exported as a callable library function, imported by its own tests and diagnostics; its internally called Phase152/151/149/148 chain is executable. There is **no evidence that the user-facing research route, ingestion approval process or ranking pipeline automatically invokes Phase153**. A source file existing or passing tests is not mainline integration. Linking it into production requires an explicit stage owner and approval boundary, end-to-end verification and adversarial regression. No untrusted phrase should be promoted to a canonical product row simply because it occurs in a page title.

Known shortcomings:

- Missed or **partial** mentions, including `iRobot Roomba j9+`, idiosyncratic manufacturer typography, interleaved prose, embedded tables, images and nonstandard product IDs.
- All-word names can still be mistaken for capitalized non-product expressions; a conservative false veto can increase reference abstentions. There is no quantified false-positive/over-abstention improvement.
- The module groups exact *written* forms, not actual model identities. `Philips 3200`, `3200`, `Philips 3000i Series` and variants cannot be merged from string resemblance.
- Real-document references across paragraphs and true pronoun antecedents remain uncertain; attaching a text reference is not the same as attaching a measured laboratory outcome. Protocol versions, reviewer/manufacturer roles, test conditions, uncertain statements and claim strength must still be independently reviewed.
- No publisher-permissioned complete-review snapshot corpus; **no independently reconciled mention/entity/variant/coreference labels**, annotation disagreements or calibrated precision/recall, and no independent blind comparison of native vs neural extractor.
- Hashes authenticate bytes handed to the library, **not** their asserted original publisher attribution. Titles, aliases, source roles and source URLs are caller inputs; their assertions may be inaccurate or manipulated.

## 6. Continuing technical research, not new dependencies

Phase153 was informed by cumulative, included primary-source engineering studies. The following external originals provide relevant architectural background, **not proof of equivalent capability**:

- [GLiNER2](https://github.com/fastino-ai/GLiNER2) — typed/schema-guided candidate boundaries; we did not install a model or checkpoint.
- [DeepKE](https://github.com/zjunlp/DeepKE) and [DocRED](https://aclanthology.org/P19-1074/) — document-level mention/edge modeling; we did not install their pipeline.
- [medSpaCy](https://github.com/medspacy/medspacy) — local context/scoped exclusions.
- [Snorkel](https://github.com/snorkel-team/snorkel) — multiple heuristic signals and disagreement; signals here are **not** combined as independent votes.
- [Open English WordNet](https://en-word.net/), [VerbNet](https://github.com/cu-clear/verbnet), [VADER](https://github.com/cjhutto/vaderSentiment) — local Phase141 resource/provenance files are retained; none authenticate commercial products.

Previously bundled licence texts and attribution are preserved. Do not confuse repository source licenses with permission to redistribute trained model weights or publisher review corpora.

## 7. Phase 154 decision

Priority is **empirical coverage and safe coreference**, not another unchecked expansion of rules. Acquire publisher-permitted complete professional-review snapshots with source versions; annotate product names, aliases, series/SKU variations, components and programmes, incomplete/truncated model spans, competing product identity and genuine pronoun reference. Use two independent reviewers with adjudication and chronologically frozen, publisher/product-family-disjoint splits. Preserve 'not found' separately from 'confirmed absent', measure false merges **and** false vetoes, and report CPU/RAM for article-scale loads.

Until then, conservative native hypotheses may improve candidate coverage but cannot be claimed to match a trained entity/coreference model. Only if a separately licensed offline local model wins on a truly controlled benchmark, with acceptable hosting/security/dependency cost and a reversible adapter, should it be considered for optional integration.

**No further product-category input is required for Phase154 preparation.** The existing categories include washing machines, TVs, CD players, speakers, ovens, air fryers, toasters, coffee machines, conventional fryers and steamers, with several deliberately still in backlog.
