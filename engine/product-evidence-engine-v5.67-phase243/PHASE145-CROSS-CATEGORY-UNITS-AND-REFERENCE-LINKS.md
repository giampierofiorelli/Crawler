# Product Evidence Engine — Phase 145: unit-aware cross-category observations and conservative repeated-surface links

**Date:** 11 October 2026  
**Version:** v4.69 / Phase 145; cumulative parent v4.68 / Phase 144  
**Scope:** native English-first TypeScript; no new runtime dependency, commercial inference API, Python model, checkpoint, automatic ranking action or canonical fact promotion.

## What was built

Added `src/phase145_unit_context_bridge.ts` while leaving the earlier Phase144 reader unchanged. This layer calls Phase144 (which in turn calls the Phase139 integrity and bounds gate), then produces independently anchored **measurement candidates**. Each candidate stores the exact original text, start/end offsets, a SHA-256 of the original measurement string, a SHA-256 of its source document, its original numeric unit and value, a dimension, and a transparent numeric conversion where unambiguous. These are *surface data*, **not proof** of the product, model, independent measurement, benefit, test protocol or scientific result.

The unit inventory includes degrees Celsius and Fahrenheit; decibels (unweighted or weighting unknown) versus expressly A-weighted dBA; Hz/kHz/MHz; watts/kilowatts; watt-hours/kilowatt-hours; litres/mL; nits and cd/m²; millimetres/centimetres; kilograms; milliseconds; rpm. Exact case and symbol boundaries matter. For example, kWh is energy while kW is power; ordinary dB does not imply A-weighting. Fahrenheit-to-Celsius conversion is numerical only and does not reconcile testing procedures, time, measured location or uncertainty. Published SI unit spelling conventions and prefixes were checked against the Bureau International des Poids et Mesures (BIPM, 2026) and NIST. We did not import code or redistribute standards text.

`role` is a conservative contextual indication (`manufacturer_claim`, `specification_or_setting`, `observed_candidate`, `indeterminate`), not verified provenance. Conditions adjacent to numbers can be retained with original spans, but test settings, advertised performance and independently observed results remain different concepts. Current heuristics still misclassify or abstain on many natural review constructions.

Adjacent sentences with an **identically repeated explicit surface phrase**, same dimension and no paragraph break can yield `surface_repeat_candidate_not_verified`. The link includes exact evidence spans and has `entityIdentityProven:false` and `relationProven:false`. Pronouns, different names, changed models, paragraph jumps or mere category similarity cannot establish links. This is not trained anaphora/coreference resolution, not a claim of semantic entailment, and cannot promote an unverified evidence graph into the reviewed database.

## Regression and pilot

- **30/30** developer-authored Phase145 focused tests passed (basic quantities, conversions, source checks, non-equivalence, links, abstention and limits).
- **1,783 passing tests in 104 eligible TypeScript files**, with Phase91/92 legacy suites excluded as in all recent releases. Results in `PHASE145-REGRESSION-GROUPS.json`.
- **77 Python tests passed:** 47 primary source, 21 ingestion, nine Phase133 probe.
- **Four additional short original professional review excerpts**, from ovens, loudspeakers, televisions and CD players, selected **after the Phase145 code was written**, produced five unit candidates versus one original Phase144 quantity candidate. This is a **coverage diagnostic of unit surfaces**, not a comparison of accuracy, and it is neither blind nor independently annotated. Different extracts and semantic targets must not be conflated. Results in `PHASE145-CROSS-DOMAIN-DIAGNOSTIC.json`; the short copyright-respecting excerpts with source URLs are in `research/phase145_cross_domain_postcode_challenge.json`.

### Four new original-source cases

| Product/category | Publisher and page | What the diagnostic actually showed |
|---|---|---|
| Cuisinart Air Fryer + Toaster Oven | Tom's Guide: https://www.tomsguide.com/home/home-appliances/cuisinart-air-fryer-and-toaster-oven-review | `230°C` detected. Its role remained **indeterminate**, even though the passage was a *maximum temperature specification*. This is a known remaining deficiency, not a verified oven accuracy result. |
| Dali Sonik 1 loudspeakers | What Hi-Fi?: https://www.whathifi.com/speakers/hi-fi-speakers/dali-sonik-1 | `29mm` and `13cm` recognized as component dimensions and proposed as specifications, **not measured sound-quality outcomes**. |
| LG C6 OLED television | RTINGS: https://www.rtings.com/tv/reviews/lg/c6-oled-2026 | `1,362 cd/m²` recognized as a luminance number. The *scene and protocol* cannot be authenticated from a short isolated line. |
| Arcam CD5 CD player | What Hi-Fi?: https://www.whathifi.com/reviews/arcam-cd5 | `192kHz` identified as frequency. The full composite `24-bit/192kHz` digital file compatibility claim is **not yet correctly interpreted as one specification**; no sound-quality measurement follows from it. |

For other categories, earlier cross-category excerpts and their diagnostic histories remain in the archive. These four *publisher excerpts* are now **exposed development diagnostics**; they cannot subsequently be claimed as genuinely unseen holdout evidence after editing the code against them.

## What remains unproven

1. No independently annotated, frozen, source-disjoint multi-category benchmark, so no reliable precision, recall, F1, or false-attribution rate. Developer-authored tests do not establish generalization.
2. Only narrow repeated surface phrases link sentences. Anaphors and context transitions remain unresolved; genuine product and variant identity still require external evidence.
3. The grammatical role classifier uses small local English patterns. It does not distinguish all technical specifications, setup parameters, quoted manufacturer claims, or measurement results.
4. Composite specifications (CD sample bit depth/rate, loudspeaker sensitivity `dB/W/m`, temperature *set* vs *measured*, TV HDR test windows and signal modes) need typed compound representations and test-protocol evidence.
5. No full article was included, independently authenticated publisher snapshot obtained or rights-to-republish verified. Original source metadata is for repeatable manual verification and properly limited quoting, not unlimited redistribution.
6. Numeric normalization does not authorize cross-publication comparability. A changed RTINGS test protocol, measurement conditions, source corrections and page revisions must remain versioned and distinct.
7. The module is additive, not yet wired into an automated reviewed category-growth path. Phase128/129 and the existing deterministic ranking remain authoritative.

## Technical references

- Bureau International des Poids et Mesures, *SI Brochure*, 9th edition, updated 2026: https://www.bipm.org/en/publications/si-brochure
- NIST, *Guide to SI: Units Outside the SI*: https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-5-units-outside-si
- Direct research references retained cumulatively: GLiNER2 https://github.com/fastino-ai/GLiNER2 ; DeepKE https://github.com/zjunlp/DeepKE ; medSpaCy https://github.com/medspacy/medspacy ; Snorkel https://github.com/snorkel-team/snorkel . No upstream code or weights are installed.

## Reproduction

```bash
npm run build
node --test dist/tests/phase145_unit_context_bridge.test.js
node scripts/evaluate-phase145.mjs
node scripts/phase145_regress.mjs
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s primary_sources -t . -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s ingestion -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

All Phase145 outputs have `canonicalWriteAuthorized:false`, `rankingAuthorized:false` and `sourceAuthenticated:false`. A successfully located quantity remains a proposed extraction only.
