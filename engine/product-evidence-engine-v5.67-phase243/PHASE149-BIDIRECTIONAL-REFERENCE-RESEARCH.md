# Product Evidence Engine — Phase 149: bounded bidirectional reference hypotheses

**Date:** 11 October 2026  
**Release:** PEE v4.73 / Phase 149  
**Parent:** v4.72 / Phase 148, cumulative package  
**Engineering policy:** English-first; original TypeScript only; no runtime dependencies, licensed model weights, external inference, paid APIs, database promotion, or ranking changes.

## Why this was needed

Phase 148 could find a named model followed by *this player* or *it*, but left references unresolved when the generic description appeared **before** the explicit product name. It also stopped at paragraph boundaries. This was sensible for safety but created avoidable gaps in possible entity-link discovery. Phase 149 adds a **candidate discovery** layer, not a coreference resolver.

The new native `src/phase149_bidirectional_discourse_candidates.ts` keeps the complete Phase 148 graph and adds:

1. **Forward, same-paragraph proposals** for *this/the model/device/player/oven/TV/machine...*, when an explicit named surface follows within a bounded sentence window; bare *it/its/they* are **never** resolved forward by this heuristic.
2. **Adjacent-paragraph proposals** for an explicit generic product description beginning the next paragraph, with a single named surface in the previous paragraph. Reporting changes, different test modes, and components or accessories block bridging.
3. **Variant-conflict warnings**, distinguishing a numeric model stem such as `Aster X100` from `Aster X100 Pro`; exact repeated surface names form clusters but do not establish same physical product/region/revision.
4. **Comparison-target blocker**: a later named product following constructions such as *unlike*, *similar ... to*, and *compared with* is often the comparator, **not** the referent of *This TV*.
5. **Provenance**: original character offsets, exact substring SHA-256, baseline status, declared candidate IDs, reason codes, and explicit `false` authorization for evidence promotion and ranking. Budget exhaustion is visible rather than interpreted as absence of evidence.

The module calls `readDocumentReferences148` and retains Phases 131–147 transitively. It does not alter any prior module. No auto-merge, product ranking, category-schema update, or evidence truth claim is possible through its output.

## Demonstrated behavior, with limitations

The six developer-authored examples in `PHASE149-BIDIRECTIONAL-REFERENCE-DIAGNOSTIC.json` cover: forward candidate, cross-paragraph candidate, variant conflict, reporting transition, bare-pronoun abstention, and comparison-target blocker. Phase 148's statuses are recorded side by side. **27/27 focused TypeScript tests pass**. These are implementation regression tests, not evidence of general-language understanding.

Three **short** excerpts from independently published professional sources were then checked as *post-development diagnostics*, with URL and exact quotation stored in `research/phase149_fresh_editorial_excerpts.json`:

| Publisher | Category | What the module actually returned |
|---|---|---|
| [TechRadar](https://www.techradar.com/home/air-fryers/ninja-5-in-1-grill-and-air-fryer-review) | Air fryer | `unresolved_no_safe_candidate`: product not named inside selected excerpt, even though the overall webpage has product identity. |
| [What Hi-Fi?](https://www.whathifi.com/reviews/pmc-prodigy-1) | Loudspeakers | Two explicit product aliases, zero reference candidates in selected text. Adjacent model names do not establish equivalence. |
| [RTINGS](https://www.rtings.com/tv/reviews/sony) | Television | `blocked_comparison_target`: a later named Sony model is a comparator, not necessarily the TV introduced by *This TV*. |

**No blinded independent annotation has been performed:** gold annotations 0, precision/recall/false-merge estimates **not available**. These extracts are now *seen* and cannot be used as future independent held-out data. A future long-document evaluation requires independently curated source-disjoint reviews (and careful treatment of rights, test-method versions and model/region variants).

## Regression and release

- New targeted **27/27** passing tests.
- Full grouped TypeScript regression **1,899 passing tests across 108 eligible files**. The same two legacy test files (`phase91_watch_gate.test.js` and `phase92_recipe_lifecycle.test.js`) remain excluded, as in v4.72.
- Python **77** passing tests (47 primary sources, 21 ingestion, 9 Phase133 offline probe).
- Runtime dependencies added: **0**. Python ML stack, pretrained checkpoint, browser service and vendor API added: **0**.
- Parent ZIP integrity is verified separately in `PHASE149-RELEASE-VERIFICATION.json`; previously supplied reference and linguistic-resource attributions remain preserved.

## Scientific and engineering limits

- No true grammatical parsing, discourse model, linguistic entailment or learned entity resolution; an unverified **single candidate can still be wrong**, especially when a new sentence starts a new subject without a transition.
- Forward candidates are highly conservative for pronouns. Component, comparison and attribution vocabulary is necessarily incomplete; implicit comparators and quoted marketing text remain hard.
- Surface equality is not a real product identity, and family-name overlap is not a principled model/version identifier.
- Paragraph bridging is still not sufficiently reliable for autonomous use. Its status is explicitly *unverified*, and its result must not supply canonical product evidence.
- Hashed original text proves the byte sequence received, not independent authenticity of the publisher webpage. Rights to redistribute complete third-party documents have not been established.
- The design increases the number of **candidate** connections, not independently verified knowledge or general semantic accuracy.

## Next experiment

Freeze longer professionally authored English reviews across appliances, audio, televisions and other categories, with human labels for named entities, cataphoric vs anaphoric references, components, distinct model/region variants, comparison relations and manufacturer versus lab claims. Measure candidate recall, false-merge cost, abstention, annotation agreement and latency separately, comparing Phase 148 with Phase 149. Do not tune on the final holdout. If rule improvements plateau, evaluate a small offline local model on the *same* frozen set before adding deployment complexity. The present category inventory is sufficient; no user action is needed.

## Research and reference basis

- [Anaphora Resolution with the ARRAU Corpus — Poesio et al., CRAC 2018](https://aclanthology.org/W18-0702/). Distinguishes identity anaphora, bridging and discourse deixis; PEE intentionally does not conflate these.
- [Bridging Anaphora Resolution as Question Answering — Hou, ACL 2020](https://aclanthology.org/2020.acl-main.132/). Useful for the limits of assuming known gold mentions; **not** implemented as a neural QA model.
- [Unifying the Scope of Bridging Anaphora Types in English — Levine & Zeldes (2024)](https://arxiv.org/abs/2410.01170). Shows that different benchmark schemes classify bridging phenomena differently.
- [DeepKE](https://github.com/zjunlp/DeepKE), [medSpaCy](https://github.com/medspacy/medspacy), [GLiNER2](https://github.com/fastino-ai/GLiNER2), [Snorkel](https://github.com/snorkel-team/snorkel): already studied cumulatively; no third-party model/code added to runtime in this phase.
- The uploaded WordNet/VerbNet/VADER data and attribution files from Phase 141 remain untouched.
