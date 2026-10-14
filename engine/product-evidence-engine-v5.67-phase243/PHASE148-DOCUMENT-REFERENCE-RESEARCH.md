# Product Evidence Engine — Phase 148: bounded English document-reference hypotheses

**Date:** 2026-10-11  
**Release:** v4.72 / Phase 148; parent v4.71 / Phase 147.  
**Decision:** native TypeScript, original code, no runtime dependencies, no model weights, no remote AI or paid API. Data and ranking still protected.

## Problem and design

Phase 147 classified quantity-bearing clauses and compared repeated literal subjects in adjacent sentences. It did not create a source-span-preserving discourse graph for anaphora, and it was vulnerable to losing product references when a later clause said *it* or *this player*. An apparent same antecedent must not automatically be treated as a verified product. For example, *it* can refer to a dock, programme, measurement or manufacturer claim rather than the reviewed model.

The new `src/phase148_document_reference_hypotheses.ts` uses the **existing** phase-147 input and source checks, segments English paragraphs and sentences, proposes explicit model-shaped anchors (or caller-supplied aliases, separately labeled unverified), records anaphor/description spans with SHA-256 and original character offsets, and produces a bounded list of candidate antecedents. It does not claim to implement neural coreference, grammatical dependency parsing or natural-language inference.

Reference statuses are kept separate:

- `possible_unique_antecedent_unverified` — a single matching named surface remains only a hypothesis, never a verified identity.
- `blocked_competing_antecedents` — two or more distinct named product surfaces occur in the allowable context.
- `blocked_competing_nonproduct_referent` — an intervening dock, battery, cycle, setting, test, filter, etc. may be the pronoun's true antecedent.
- `blocked_paragraph_boundary` — the named candidate appears in another paragraph; the system preserves the candidate ID but does not attach it automatically.
- `blocked_reporting_change` — an advertising claim and review observation cannot be merged; also guards explicit claim/report transitions where no numeric attachment was extracted.
- `blocked_polarity_change`, `blocked_context_change` — negation or explicit modes change between consecutive observations.
- `unresolved_no_antecedent` — no eligible explicit anchor.

The function `readDocumentReferences148()` consumes `ReaderInput139` and produces `DocumentReferenceGraph148`; it includes the prior `ClaimAttachmentGraph147`. The output includes original document ID, source ID, digest, spans, sentence and paragraph index, candidate anchor IDs, and affected prior numeric attachment IDs (where available). It **does not** overwrite Phase 147, promote weak evidence, or perform ranking. `identityAuthenticated`, `entailmentVerified`, `measurementComparable`, `sourceAuthenticated`, `canonicalWriteAuthorized` and `rankingAuthorized` remain `false` by construction.

Budget limits: up to 140 references by default, up to 300 on request; lookback of 2 sentences by default, maximum 4; at most 1,500 sentences and 900 anchors scanned. Hitting a limit sets `coverageTruncated` and records the reason. Source hashing verifies supplied bytes, not authenticity of the external publisher.

## Results (what the figures actually measure)

- **24/24 new targeted tests**: synthetic named product versus component, competing products, paragraph boundary, claim versus measurement, changed modes, negation, numeric punctuation, reference cap, original offsets and source-digest rejection.
- **1,872 TypeScript tests** passing across **107 eligible test files**, excluding the two legacy Phase 91/92 suites from the existing regression protocol; **77 Python** tests passing (47+21+9).
- Three short professional-review excerpts from **Reviewed** (washing machine), **RTINGS** (television), and **What Hi-Fi?** (CD player), selected as post-implementation diagnostics. On the first, the reader proposes one *unverified* Maytag antecedent; on the other two, it correctly retains `unresolved_no_antecedent` because the selected excerpt does not identify the model before the generic reference.
- Previous Phase 147: zero quantity attachments on all three excerpts. Phase 148 adds a different type of representation (references); **do not compare this as a gain in quantitative measurement accuracy or semantic precision**.
- There are **zero independently authored/blinded gold annotations**, hence no legitimate recall/precision/false-merge or quality score. The excerpts have been seen during evaluation and are no longer eligible as independent unseen examples.

The original publisher links and short excerpts are stored in `research/phase148_fresh_published_excerpts.json`, with the results in `PHASE148-DOCUMENT-REFERENCE-DIAGNOSTIC.json`.

## Gaps and risks

- **Cataphora**: referring expressions before the explicit model name, e.g. “This player … The model X…”, are not linked.
- **Paragraph coherence**: cross-paragraph antecedents are preserved as potential candidates but intentionally blocked pending a stronger identity-resolution test.
- **Multiple models with variant suffixes**: near-identical model names require structured product identity / variant alignment, not simple name comparison.
- **Common-noun product names** without digits or caller-alias are often missed. Blind expansion of capitalization detection would revive the Phase 143 error (mistaking wash cycles for products).
- **Component descriptions** are caught only by a bounded local signal list. Complex attachments, quoted pronouns, paragraph headings, lists, tables and long-distance references remain unresolved.
- **No genuine semantic entailment**: extraction status is not evidence that the proposition is true, nor that measurements under different testing protocols are comparable.
- **No rights claim** about full review ingestion or redistribution is established. Only very short attributed source extracts are packaged.

## Source continuity and research references

This original module applies lessons already documented in the cumulative codebase: DeepKE document-level spans and relationships, medSpaCy scoped modifiers, GLiNER2 typed candidate alternatives and abstention, Snorkel's caution about correlated signals, and TypeSafe's separation of typed questions from application authority. Phase 141's WordNet, VerbNet and VADER imported lexical data and attribution files remain untouched. None of these third-party libraries are imported by Phase 148. Their trained model capabilities have **not** been reproduced merely by extracting design patterns.

Primary review pages inspected for this diagnostic:

- Reviewed, Maytag MHW8630HC: https://www.reviewed.com/laundry/content/maytag-mhw8630hc-front-load-washer-review
- RTINGS, LG UN7000: https://www.rtings.com/tv/reviews/lg/un7000
- What Hi-Fi?, TEAC VRDS-701: https://www.whathifi.com/reviews/teac-vrds-701

Technical references (design inspiration, no runtime dependency):

- DeepKE: https://github.com/zjunlp/DeepKE ; DocRED: https://aclanthology.org/P19-1074/
- medSpaCy: https://github.com/medspacy/medspacy
- GLiNER2: https://github.com/fastino-ai/GLiNER2
- Snorkel: https://github.com/snorkel-team/snorkel
- TypeSafe entity alignment (design documentation): https://docs.typesafe.ai/cookbooks/entity_alignment

## Recommended next development

First build an independent, frozen gold set of longer original passages across categories with separate labels for entity spans, true antecedents, variant identity and evidence attachment. The next targeted improvement should handle *forward* descriptions and unambiguous paragraph transitions with traceable alternative hypotheses. Compare false-merge, abstention, retrieval coverage and runtime cost with Phase 148. A small local pretrained model remains an optional competitor for empirical benchmarking, not an assumed dependency. No additional product categories are required from the user now.
