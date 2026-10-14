# Product Evidence Engine — Phase 147: Local claim-to-measurement attachment

**Date:** 11 October 2026  
**Release:** v4.71 / Phase 147  
**Parent:** v4.70 / Phase 146  
**Scope:** English, native TypeScript; *non-authoritative* information extraction.

## Decision and concrete implementation

The requested additional categories are **not needed at this point**. The existing cross-category programme already covers washing machines, ovens, televisions, loudspeakers and CD players, with traditional deep fryers, air fryers, toasters, coffee makers and food steamers queued as future evaluation categories. No new category-specific lexical lists are required for this phase.

Phase 146 preserves composite formats and test conditions, but whole-sentence scope can conflate a manufacturer's quoted figure with a reviewer's measured figure, or conditions from different clauses. Phase 147 introduces **`src/phase147_local_claim_attachment.ts`**, invoked after the original Phase 139 → 144 → 145 → 146 validation sequence.

It retains a trace for each Phase 145 numeric candidate with an exact byte-corresponding source span and SHA-256; splits conservative contrastive clauses; preserves **manufacturer claim**, **test-report cue**, **setting**, **uncertain / conflicting attribution**; records locally explicit mode/test conditions and raw published test-version cues; and evaluates repeated literal subjects in adjacent sentences without equating this with verified model identity.

New work also addresses a defect exposed by short professional excerpts: `75 - 99 degrees Celsius` and `1430-1700W` were previously surfaced by Phase 145 as isolated **upper endpoints**. Phase 147 retains the whole written interval in `numericRange`, and the candidate **abstains** instead of treating one endpoint as a standalone observed result. It does not yet normalize intervals into scientifically validated ranges with protocols.

The provenance, no-canonical-write and ranking isolation controls remain: `sourceAuthenticated:false`, `productIdentityProven:false`, `independentReviewRequired:true`, `canonicalWriteAuthorized:false`, `rankingAuthorized:false`. The module does not run in the recommendation pipeline, change entity records or promote category knowledge.

### Deliberately unresolved cases

- A literal repeated product name is not proof of physical/model identity; compatible readings are only *candidates*.
- A pronoun is not attached to its antecedent without an established reference.
- A sentence naming several modes may produce `ambiguous_modes`; the system does not select one.
- A changed mode, attribution, polarity or dimension cannot silently pass as comparable evidence.
- `2% window`, `test bench 1.7` and similar strings are evidence *cues*, not authenticated testing protocols.
- The new parser is a finite heuristic for contrastive clauses, not general dependency parsing or semantic entailment. Complex coordination, quotation, tables and long-context references can remain unresolved or be mishandled.
- A supplied document SHA-256 checks consistency of the supplied text, **not** the external publisher's authenticity.

## Evaluation

`tests/phase147_local_claim_attachment.test.ts` includes **30 developer-authored tests** covering claim-versus-measurement contrast, HDR/SDR scope, technical ranges, test-window cues, repeated/different named subjects, negation, absent context, budget truncation, source-hash tampering, and regression interoperation.

The full regression reports **1,848 passing TypeScript tests across 106 eligible files**, with two previously excluded legacy suites (Phases 91 and 92). Python suites report **47 primary + 21 ingestion + 9 Phase 133 probe = 77 passing**. These numbers demonstrate code regression behaviour, **not semantic precision/recall**.

Four *short* text excerpts from published pages were examined as diagnostics *after selection*, not as a frozen independent holdout. Results:

| Category | Textual surface detected | Outcome |
|---|---|---|
| Sony A90J television (RTINGS) | `1291 nits`, `2% window` | One unverified measurement candidate with a preserved window cue |
| Morning Machine coffee brewer (TechRadar) | `75 - 99 degrees Celsius` | Entire interval preserved; isolated endpoint is not accepted as a single result |
| Breville coffee machine (TechRadar) | `1430-1700W` | Entire power interval preserved; isolated endpoint abstains |
| Amazon Ember Artline settings (RTINGS) | `125 nits` | One quantity candidate; cannot infer whether this is a setting or independent measured performance from the excerpt alone |

**No independent gold annotations were produced.** The review texts have not been included in full or licensed for redistribution; only brief attributed excerpts are retained. Test-source URLs:

- RTINGS Sony A90J: https://www.rtings.com/tv/reviews/sony/a90j-oled
- TechRadar The Morning Machine: https://www.techradar.com/reviews/the-morning-machine-review-its-pod-coffees-time-to-shine
- TechRadar Breville The Barista Touch Impress: https://www.techradar.com/reviews/breville-the-barista-touch-impress
- RTINGS Amazon Ember Artline settings: https://www.rtings.com/tv/reviews/amazon/ember-artline-2026/settings

`research/phase147_new_source_excerpts.json` retains source URLs, short excerpts and caveats. `PHASE147-CLAUSE-ATTRIBUTION-DIAGNOSTIC.json` contains reproducible predictions for those excerpts and six authored controls. These are not usable as fresh/untouched evaluation samples in a later release.

## Source-code research continuity

The native implementation is consistent with the earlier study of medSpaCy (target/scope/modifier separation), DeepKE (document-level provenance and typed relations), GLiNER2 (multiple bounded candidates without forced resolution), Snorkel (abstention and correlation-aware evidence), TypeSafe (atomic judgements with no unauthorized side effects), and the WordNet, VerbNet and VADER resources studied in Phase 141. No vendor source, model weights, Python runtime, external API or additional runtime dependency was introduced. Earlier third-party source investigations and attribution notices remain inside the cumulative package.

## Next work

Expand the *real-text* evaluation with legally usable, source-disjoint original excerpts annotated independently. Measure false attachment, missed measurements, modality/negation confusion, numerator-versus-range errors, identity mistakes and abstention rate across categories before enabling any claims in the reviewed knowledge pipeline. Only consider a local trained model after a measured, justified comparison with the native baseline.
