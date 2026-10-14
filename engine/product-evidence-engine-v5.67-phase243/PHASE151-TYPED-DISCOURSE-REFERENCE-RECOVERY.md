# Product Evidence Engine — Phase 151: type-aware recovery of unverified document references

**Date:** 11 October 2026  
**Version:** v4.75 / Phase 151, cumulative child of v4.74 / Phase 150.  
**Status:** Independently authored TypeScript candidate-stage improvement. No additional model, dependency, remote API, automatic canonical write, or ranking change.

## 1. Concrete problem

Phase150 established an important negative result on its own seven **developer-written, nonblind, multi-paragraph** examples: Phase149 proposed no usable candidate for any of seven annotated references. Three examples were developer-labeled as referring textually to the one named product, but were rejected due to a blanket intervening-component, programme or document-distance rule. Four others were truly ambiguous in the authored examples, due to multiple products, variants, components or under-specified pronouns. The benchmark was useful as a failure analysis, but it was **not a scientific accuracy benchmark**.

This phase changes *candidate selection* without trusting unverified links. It distinguishes a typed generic noun phrase such as **“This model” / “This player”** from a bare **“it”**. A mentioned washing programme, filter or basket can be a referent for “it”; it is not automatically a second **product model** competing with the literal phrase “This model”. This permits carefully bounded textual proposals that Phase149 discarded.

## 2. Implemented in the cumulative code

- `src/phase151_type_aware_discourse_recovery.ts`: consumes the unchanged Phase149 candidate graph, original offsets, named anchors and sentence/paragraph structure. Output records baseline status, anchor spans, reasons and a separate `evidenceChannelSeparated` warning. All candidates remain `identityAuthenticated:false`, `entailmentVerified:false`, `sourceAuthenticated:false`, `experimentalContextTransferAuthorized:false`, `canonicalWriteAuthorized:false`, and `rankingAuthorized:false`.
- **Adjacent paragraph**: a literal product-description reference may propose the unique named product in the preceding paragraph even if a programme or accessory was mentioned between the name and the reference. Competing named products/variants and comparison language still cause abstention.
- **Forward in the same paragraph**: may propose one model named in a later sentence within finite sentence/character limits. It searches for *all* competing named surfaces in that paragraph and blocks comparison targets, explicit 'other model' language and distinct variants. If it sees a plausible three-token **unindexed** model code (e.g. a brand + letters + spaced digits), that is a **safety-only abstention cue**, never a newly authenticated entity.
- **Manufacturer versus reviewer**: a textual subject can be the same across a changed reporting channel, but measurements are **not** transferred. The `evidenceChannelSeparated` boolean is a diagnostic heuristic, not a method to authenticate claims or test conditions.
- **No new pronoun resolution:** when the baseline has blocked “it” or “its” because a component or test may be the antecedent, the additional phase does not upgrade it. Existing Phase149 unverified outputs are preserved or screened for newly visible comparison conflicts, not promoted to verified identity.
- `tests/phase151_type_aware_discourse_recovery.test.ts`: 24 constructed tests for offsets, SHA-256, paragraph links, forward references, reporting changes, competing models, variants, components, negatives, comparison syntax, distance caps and determinism. No test uses independent blind expert labels.
- `scripts/evaluate-phase151.mjs`: reproducible side-by-side Phase149 and Phase151 descriptive trace, **without feeding labels to the recovery module**.

The module is **separately callable**; it does not replace scientific evidence authorization, overwrite the ranking, run as a background service, or silently change other readers. The caller must not treat its candidate ID as a verified product identity.

## 3. Measured results (correctly scoped)

The evaluation reuses *exactly* the previously examined seven developer-authored Phase150 texts and their labels; all were available to the developer. Therefore the result is a **retrospective engineering regression**, not a new or unbiased holdout.

| Measure on those seven authored texts | Phase149 | Phase151 |
|---|---:|---:|
| Candidate textual links proposed | 0 | 3 |
| Matching the three author-labeled same-referent links | 0 | 3 |
| Candidates conflicting with author labels | 0 | 0 |
| Missed author-labeled same-referent links | 3 | 0 |
| Independently annotated original professional reviews | 0 | 0 |

The resulting 3/3 descriptive match must **never** be reported as 100% real-world accuracy: we developed the changes after observing those exact failures. The original publisher excerpts checked in Phase150 remain short diagnostic fragments without independent gold. Scientific precision, recall, false-merge rate and comparative model performance remain **unknown**.

**Engineering limitation discovered during tests:** Phase148's named-anchor recognizer can miss model names whose codes contain separated uppercase letters and digits (for example, “Marantz CD 70”). The new Phase151 safety-only detector abstains on some of these unindexed names rather than accepting a misleading sole-product forward link. This detector is not a reliable general entity recognizer; it will miss other forms and sometimes abstain unnecessarily.

## 4. Evaluation and regressions

- New focused tests: **24 passed**.
- Full eligible TS regression: **1,951 passing over 110 files**, excluding the same two legacy Phase91/92 test files; see `PHASE151-REGRESSION-GROUPS.json`.
- Existing Python tests: **47 primary + 21 ingestion + 9 Phase133 probe = 77 passing**.
- Runtime dependencies: **0 added**. No third-party code or weights are copied, no TypeSafe or GLiNER2 service installed, no new API and no paid inference.
- Existing v4.74 source and release remain in the cumulative archive. Only README and package metadata are deliberately changed among prior files; see release verification.

## 5. What remains missing and should govern Phase 152

1. Build or obtain **complete original English professional review documents** for which evaluation processing and any distribution have an established lawful basis; record versions, source ownership and protocol. Short editorial quotes do not substitute for documents.
2. Establish genuinely **independent annotator labels**, with separate product-vs-component links, variants, forward/backward and cross-paragraph cases, adjudication of disagreements, and a source/publisher/product-family-disjoint split **frozen before tuning**.
3. Evaluate both newly recovered true links and **false merges**, abstention, recall and source offsets, with separate condition and evidence-channel audit. A textual reference is not a measured performance claim, and two measurements cannot be aggregated solely because their descriptions refer to the same product.
4. Compare a small offline local trained extractor/coreference model **only if** native generalization remains insufficient and deployability, weights/licences, CPU/RAM, security, hosting complexity and offline reversibility are actually measured. Do not claim that handcrafted rules reproduce neural generalization.
5. Continue improving generic entity mention detection without converting capitalization or model-shaped text alone into authenticated product identity.

**No new product categories needed:** washing machines, TVs, CD players, speakers, ovens, air fryers and the pending fryers/toasters/coffee machines/food steamers already give ample cross-category variety.

## 6. Engineering references (not dependencies)

The earlier uploaded source audits remain part of the cumulative package. Core technical references:

- DeepKE document-level relation extraction: https://github.com/zjunlp/DeepKE ; DocRED https://aclanthology.org/P19-1074/
- GLiNER2 schema-guided entity/relation alternatives: https://github.com/fastino-ai/GLiNER2
- medSpaCy contextual scope and modifiers: https://github.com/medspacy/medspacy
- Snorkel weak-supervision and disagreement audits: https://github.com/snorkel-team/snorkel
- Open English WordNet: https://en-word.net/ ; VerbNet: https://github.com/cu-clear/verbnet ; VADER: https://github.com/cjhutto/vaderSentiment
- Original publisher pages in prior source registry (not reprinted wholesale): https://www.whathifi.com/hi-fi/cd-players/marantz-cd-70 ; https://www.rtings.com/tv/reviews/tcl/qm8k ; https://www.techradar.com/home/coffee-machines/one-year-on-the-ninja-prestige-dualbrew-is-still-the-most-versatile-coffee-maker-ive-ever-tested-heres-why-its-the-best-pick-for-your-small-kitchen

**Provenance caution:** all runtime code in Phase151 is newly written. The research above informed architecture; no model, library or vendor weights are installed. Research usefulness does not prove comparable NLP quality.
