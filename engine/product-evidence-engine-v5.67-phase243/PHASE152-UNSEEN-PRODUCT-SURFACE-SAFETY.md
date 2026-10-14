# Product Evidence Engine — Phase 152: unindexed product surfaces and cautious document-reference screening

**Release:** v4.76 / Phase 152  
**Parent:** v4.75 / Phase 151, preserved cumulatively  
**Date:** 11 October 2026  
**Decision:** add one original, English-first, bounded TypeScript *safety overlay* over Phase 151; no external AI framework, pretrained weights, package, API, DB update or ranking change.

## Executive finding

The prior document reference reader could propose a single textual antecedent because its upstream entity reader had simply failed to notice a competing product. This is particularly hazardous in professional reviews containing model families, years, variants, component names and side-by-side comparisons. In a constructed test, it indexed `LG C6` but missed `Sony BRAVIA 9 II`, then retained a `This TV` linkage. Phase 152 identifies the overlooked structured commercial-name *candidate* and vetoes that linkage. Its output remains unverified even when no competitor is detected.

**Scope:** This release improves a narrow defensive condition, **not** general entity recognition, long-document coreference, semantic entailment or independent accuracy. It cannot turn an abstention into a positive link.

## What was implemented

- `src/phase152_product_surface_safety.ts`: `scanPossibleModelSurfaces152()` and `inspectReferenceSurfaceSafety152()`. A bounded orthographic scanner produces source-anchored spans, hashes, and a flag marking overlap with existing Phase148 named anchors. A safety overlay revisits Phase151 reference hypotheses, vetoing tentative links when another unindexed model-like phrase occurs in the local paragraphs. It also vetoes links after scanner or upstream reference truncation.
- The scanner recognizes some forms with spaced model codes (`Sony BRAVIA 9 II`, `Marantz CD 70`), embedded codes (`Samsung WW90T684DLH`, `Marantz CD6007`), and numeric series (`Philips 5000 Series`). It deliberately excludes some obvious mode labels such as `HDR 1000`, `Heavy Duty`, and `USB` units. These are **syntactic candidates**, not a validated product register; unrecognized naming patterns remain common.
- `tests/phase152_product_surface_safety.test.ts`: 24 constructed targeted regression checks for missed competitors, partial model names, measurement/mode false positives, locality, source integrity, nonpromotion, truncation, legacy behavior, and deterministic replays.
- `scripts/evaluate-phase152.mjs`: read-only post-code diagnostic on **six short original publisher excerpts**. No full third-party reviews are redistributed. Publisher URLs, excerpt hashes, and observed candidates are in `PHASE152-POSTCODE-EDITORIAL-DIAGNOSTIC.json`.
- `scripts/phase152_regress.mjs`: complete eligible TypeScript regression grouping. Existing historical files and code are left intact, except metadata in `README.md` and `package.json`.

### Constructed error example (not independent evidence)

> This TV was evaluated. LG C6 2026 performed better. Sony BRAVIA 9 II was brighter.

Phase 151: `retained_phase149`, relying on an incomplete list of named models. Phase 152: `abstain_overlooked_named_competitor`, with source-offset evidence identifying the unindexed alternative. This does **not** establish what `This TV` really refers to; the text remains underdetermined.

### Post-code publisher diagnostic

The six excerpts were selected from web-published materials and only checked **after the module's initial implementation**. They are extremely short and were inspected by the developer; they cannot establish source-disjoint, genuinely blinded quality. Site domains overlap earlier phases, and there are no independently verified reviewer labels.

| Publisher, category | Model-like candidates found by new scanner | Limitation |
|---|---|---|
| [TechRadar — Cosori air fryer](https://www.techradar.com/home/air-fryers/cosori-dual-blaze-twinfry-compact-review) | 0 | All-word commercial name |
| [What Hi-Fi? — CD players](https://www.whathifi.com/hi-fi/cd-players/thought-cd-was-dead-our-audio-experts-pick-out-the-best-cd-players-and-some-of-our-favourite-test-discs-that-you-can-own-for-ever) | `Marantz CD6007` | A referenced model `CD 70` appears without an attached brand in the short excerpt |
| [HouseFresh — Philips 3200](https://housefresh.com/philips-3200-review/) | 0 | Family number plus letter not covered by the current grammar |
| [Trusted Reviews — Hisense washer](https://www.trustedreviews.com/reviews/hisense-wf5s1045bw/) | `Samsung WW90T684DLH` | Manufacturer-verified identity still absent |
| [Notebookcheck — Lenovo laptop](https://www.notebookcheck.net/More-than-24-hrs-battery-life-for-less-than-1-000-Lenovo-ThinkBook-16-G7-QOY-laptop-review.958162.0.html) | 0 | Multi-token model with more than one intermediate family code |
| [RTINGS — LG Gallery TV](https://www.rtings.com/tv/reviews/lg/gallery-2026) | 0 | All-word series with embedded year and interposed names |

**Observed:** two of six very short source passages yielded structured name candidates; the other four did not. This is a count of detected **patterns**, not recall or precision. The six excerpts do not support a meaningful overall accuracy estimate or an advantage on full unseen documents. Neither an automatically found name nor a matched URL authenticates the commercial product identity.

## Reproducibility and limits

- TypeScript: **1,975 passing tests across 111 eligible test files**, including 24 new Phase152 tests. The two longstanding Phase91/92 files remain excluded as in the parent. See regression JSON.
- Python: 47 primary-source + 21 ingestion + 9 Phase133-probe tests = **77 passed**.
- Runtime additions: **0** new dependencies, models, services, model weights or paid API calls. Existing ranking and canonical evidence pathways are not changed.
- Source SHA-256 checks verify caller-provided byte consistency, **not** a publisher's external authenticity; the real-review snippets are not independently annotated or verified for evaluation rights of full-length texts.
- Overmatching could increase unnecessary abstention and harm recall. The explicit 120-candidate cap makes an incomplete scan visible. No runtime CPU/memory study on production hardware was performed.
- This is an explicitly called screening layer: no claim that all existing product research workflows invoke it automatically.

### Next technically justified work

The primary failure has shifted from recognizing a few numeric patterns to robust entity detection and discourse identification across varied source layouts and model naming systems. The previous GLiNER2/DeepKE source studies offer patterns for typed spans and joint selection, medSpaCy for scope, Snorkel for disagreement assessment; none were installed. More local regex rules alone will not establish language generalization. A future quality comparison should include permitted full professional review snapshots, independently labeled subject/variant mentions and coreference, development/holdout source separation, and a *frozen* test set. Compare native candidate discovery with a replaceable commercial-use-licensed **offline** model only after memory, operational cost, weights licenses and maintenance are verified. Continue English-first.

**Safety invariant:** every output remains a hypothesis with `identityVerified:false`, `sourceAuthenticityVerified:false`, `entailmentVerified:false`, `canonicalWriteAuthorized:false`, `rankingAuthorized:false`.
