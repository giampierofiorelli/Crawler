# Product Evidence Engine — Phase 167 / v4.91

## Executive result

The original PEE Phase145 numerical review-reader now has a **real, executable, guarded handoff** to the Phase166 user-quantity request bridge. It operates on original-document **text input** via Phase145 rather than invented pre-filled evidence rows. It requires an exact, local, explicitly asserted subject alias and a declared source/product/variant/document identity binding, and retains SHA256, UTF-16 spans and original reading roles. The output is **only a research preview**. No extracted value becomes Phase166 `EvidenceObservation166` or an authorized product exclusion/ranking.

This phase makes substantive progress toward user request → original review measurement → research candidate matching, **without claiming original-source authentication**, an independently reviewed test protocol, independent user intent labels, neural inference or validated market recommendations.

## Implemented

- `src/phase167_source_variant_quantity_adapter.ts` `previewOriginalReviewMeasures167` recomputes `readDimensionalContext145` against each original `ReaderInput139`; calls the existing `auditQuantifiedRequest166` and `screenQuestionEvidence166` unchanged.
- A declared product/variant binding must match the embedded page identity, original document ID, source ID, document SHA256 and local explicit subject. The declaration **is not an independent identity proof**, and all identity/source authentication flags remain false. Missing pronouns, other model surfaces and mismatched variants are held. A source-role hint other than `original_product_test` cannot produce a review candidate; even that role does not establish independent testing.
- Dimensional adapters: Phase145 `mm` to Phase166 `cm`, Phase145 `mL` to Phase166 `L` for explicitly tank/basket/reservoir **capacity only**; A-weighted `dBA` noise remains distinct from unweighted `dB`. Length must be anchored to a specific axis; water consumption is not tank capacity. Manufacturers' claims/settings are retained but not promoted.
- Bound quantities are compared **arithmetically** with the user's unconfirmed Phase166 constraints and marked potential fits/failures. They do not alter `screenQuestionEvidence166`, which still reports insufficient approved evidence when no qualified receipts exist. All output flags for approval, exclusion and ranking remain false.
- Duplicate source text cannot masquerade as multiple independent sources; document hash mismatch, source/variant conflicts and request hash mismatches fail closed or hold. Coverage truncation is surfaced as a research obligation, never mistaken for negative evidence.
- Deterministic synthetic offline replay: `scripts/phase167-source-preview.mjs` produces `evaluation/phase167/PHASE167-CONSTRUCTED-SOURCE-BRIDGE.json` for three **constructed** product snippets. This is not a test of actual refrigerators or coffee machines.

## Tests and assurance boundaries

- Targeted tests: **25**, all pass. Includes exact spans, conversions, cross-product confusion, pronoun scope, manufacturer source/claim, duplicate sources, missing data, query mismatch, tampering and non-exclusion.
- TypeScript regression of eligible suites excluding the previously known unsupported Phase91/92: see verification manifest for executed file count and test count; last-stage edits rerun focused tests and compilation.
- Python regressions: 47 primary sources, 21 ingestion, 35 companion (103 total).
- No new upstream GitHub repository code copied; no new runtime dependency; all previously carried code/licences/studies retained.

### Explicitly NOT completed

1. Real source retrieval/permissions and independent source authentication, author identity or publisher-role verification.
2. Independent human scientific approval of each original measurement, its test conditions/method and exact variant attribution. A local surface alias is not proven commercial identity.
3. Promotion to Phase166 independently approved measurement, Phase97/99 noncompensatory decisions, public ranking or new evidence database writes.
4. An independently annotated, sealed benchmark of real user wording or authentic full review measurements. Zero new GLiNER2.5 inference.
5. General semantic understanding of request phrases. Regex-scoped quantity matching is deliberately conservative; measurements near multiple features can be held, and some straightforward grammatical constructions remain unmatched.

## Suggested Phase 168 direction

Extend this bridge to *qualitative* hard and soft user constraints with an explicit confirmation protocol, preserving negative polarity and original reviewer test context. Integrate rights-aware original-source retrieval **only on a genuinely approved source**; introduce an independent adjudication process for exact model/variant, original testing, protocol and timestamps before passing any numbers into eligibility screens. Continue evaluating with the existing 12 frozen authentic Reddit prompts from Phase124 (author-labelled only), without contaminating them with generated answers or calling them an independent benchmark. Do not block the other components while the user's desktop GLiNER2.5 runtime is unavailable.
