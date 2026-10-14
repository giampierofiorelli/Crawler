# Product Evidence Engine — Phase 132: GitHub AI engineering review and contextual relation safety

**Date:** 11 October 2026. **Base:** v4.55 / Phase131, cumulative. **Release:** v4.56 / Phase132. **Status:** guarded prototype, not a model-quality validation. **Architecture:** in-house and offline by default.

## Engineering finding

The Phase131 locally trained Naive Bayes relation classifier marked a sentence denying a relation as a high-margin positive `measures` relationship. Its failure is dangerous because the category graph might ultimately receive the wrong meaning. Fixing training labels by appending a handful of new sentences would conceal the real cause: the model ignores polarity scope and clause structure.

The solution adopted now is **independent contextual screening after statistical inference**, before any candidate can be handed to scientific review. This uses a small, conservative native rule layer, inspired by context/negation scope systems; the rules were written for this project, not copied from any third-party repository. It is a reject/abstain guard only, never an automatic classifier or assertion of scientific truth.

This is a bounded mitigation. It does **not** understand all nested clauses, sarcasm, implicit negation, quantifiers, multilingual texts or long-range coreference. We need separately reviewed publisher-level data and future controlled comparisons with locally executed models.

## GitHub projects considered — with source links and boundaries

| Project | Direct repository | Verified code licence | Contribution to PEE | Decision |
|---|---|---|---|---|
| GLiNER2 | https://github.com/fastino-ai/GLiNER2 | Apache-2.0 (repository) | Single local architecture for spans, text categories, relations and extraction from previously unseen vocabulary; potential compact alternative to a generative LLM | **Priority 1 for a future local benchmark**, not installed today. Check the individual model checkpoint licence, memory/hardware and Python support; documentation currently lists testing with Python 3.10–3.12. |
| GLiNER | https://github.com/urchade/GLiNER | Apache-2.0 (library) | Trainable or zero-shot entity extraction to remove the Phase131 assumption of manually marked subject/object spans | Consider a separately licensed model. Its model catalogue includes both Apache-2.0 checkpoints and CC-BY-NC checkpoints; the latter cannot be assumed commercially permissible. |
| spaCy | https://github.com/explosion/spaCy | MIT | Syntactic parsing and dependency matching, useful for clause boundaries, modifiers and negation attachment | Strong candidate for optional local structural parsing; a parser's model is a separate dependency. |
| medSpaCy / ConText | https://github.com/medspacy/medspacy | MIT | Explicit scope rules for negation and uncertainty provide an engineering design reference | **Design reference used in principle**, no package/code imported. Clinical assertions differ from consumer-product research. |
| Snorkel | https://github.com/snorkel-team/snorkel | Apache-2.0 | Weak-supervision label aggregation to enlarge annotated datasets when reliable gold labels are expensive | Later, after independently verified labels; weak labels cannot validate themselves. Library has significant dependencies. |
| Stanza | https://github.com/stanfordnlp/stanza | Apache-2.0 | Local sentence segmentation, grammatical dependencies and potentially multilingual parsing | Alternative to spaCy, benchmark locally if grammar limits become material. |
| doccano | https://github.com/doccano/doccano | MIT | Human review and annotation of entities/relations; workflow support for genuinely independent test corpora | Useful data-operation tooling; doesn't itself improve accuracy. |
| skweak | https://github.com/NorskRegnesentral/skweak | MIT | Aggregating noisy annotators over text spans | **Not adopted**: repository expressly says it is no longer actively maintained. |
| REBEL | https://github.com/Babelscape/rebel | CC BY-SA-NC 4.0 (repository) | Text-to-relation approach for comparison | **Not adopted**: non-commercial restriction and generative inference are poor defaults for a potentially commercial product. |

Licence statements are about repository code only. Model weights, upstream data, dependencies, patents, licences for content retrieved online, and local resource cost must each be checked separately. The GitHub projects are not interchangeable with a web-search API and need not browse the web: they can be run entirely on texts acquired by our own permitted source reader.

**Primary technical documentation:**

- GLiNER2 package/repository and its declared Python requirements: https://github.com/fastino-ai/GLiNER2 ; https://github.com/fastino-ai/GLiNER2/blob/main/pyproject.toml
- GLiNER model-specific licensing examples: https://github.com/urchade/GLiNER/blob/main/docs/intro.md
- spaCy dependency matching and syntactic relations: https://github.com/explosion/spaCy/blob/master/website/docs/usage/rule-based-matching.mdx
- medSpaCy / ConText modular negation and assertion attributes: https://github.com/medspacy/medspacy
- Snorkel supervision documentation: https://github.com/snorkel-team/snorkel
- DocRED paper (relations across sentences): https://aclanthology.org/P19-1074/
- DyGIE++ (contextual spans and relations): https://aclanthology.org/D19-1585/
- Provenance ontology principles: https://www.w3.org/TR/prov-o/

## Code integrated (zero external runtime dependencies)

1. `src/phase132_contextual_relation_guard.ts`: a **conservative** scope/polarity screening step, reporting why candidate relations are withheld and preserving qualifiers. Only short one-clause claims can pass; opposing statements across clauses cannot be merged. A positive `measures`/`contributes_to`/`conditioned_on` label cannot pass an explicit locally scoped negation. A negative label requires a locally scoped negation, and ambiguities like `not necessarily` abstain.
2. The **existing live proposal path** in `src/phase131_local_relation_learning.ts` now runs this gate, rather than relying on an isolated demo. Its anchoring check also requires the same context validation. The earlier model, calibration and raw predictions are not retrained or changed.
3. `src/phase132_local_extractor_adapter.ts`: an entirely **offline, provider-neutral input contract** for future local-model proposals. It verifies source/document identity, content hash and exact spans; compares model IDs and artifact hashes to an **independently supplied internal approval registry**; applies the same scope gate; and ALWAYS outputs `knowledgeWriteAuthorized:false`, `rankingAuthorized:false`. A matching supplied hash does not authenticate a publisher. Registry approvals need a trusted operational process. **No GLiNER/LLM model was downloaded, run or integrated.**
4. `tests/phase132_contextual_relation_guard.test.ts`: 14 executable unit/adversarial tests, including two-sided clauses, double negation, conditional contexts, metadata spoofing, wrong source identity and rank-gate invariants.
5. `scripts/evaluate-phase132.mjs`: reproducible **retrospective** replay of the already-known Phase131 challenge, recording both unguarded and guarded results. It does not silently overwrite Phase131's frozen evaluation.

## Retrospective experiment — do not mistake it for blind validation

Same Phase131 split, same algorithm, same model version, same 0.9-target margin picked on the original calibration: 60 synthetic training records, 12 synthetic validation records, 18 synthetic challenge records.

| Measure | Phase131 classifier | Classifier + scope gate |
|---|---:|---:|
| Accepted correct | 4 | 4 |
| Accepted wrong | 1 | 0 |
| Abstained | 13 | 14 |

The one rejected item is the **previously discovered error that motivated this gate**. This is a retrospective safety check, not an independent improvement estimate. It does not establish that future false assertions will be prevented; many negative constructions were not tested. The gate can also reject valid complex relationships, reducing recall. Both training and challenge sentences remain developer-authored and entity spans were supplied in advance. No independent expert document interpretation or real product recommendation was evaluated here.

## Why not install GLiNER2 immediately?

- The current test environment runs Python 3.13; the upstream docs describe core testing with Python 3.10–3.12. Compatibility, separate local environment and dependency resolution need validation.
- Any checkpoint has separate licensing, size, memory, inference and domain accuracy considerations. We have not downloaded or checked a checkpoint, so accuracy/cost comparisons would be invented.
- Proper comparison requires the *same original, permissioned, independently annotated documents*, source-level and category-level holdouts, entity span evaluation, negation/attribution stress tests and blinded reviewer adjudication.
- Our in-house reviewer/publisher attribution/quality/ranking rules remain authoritative even if an optional extractor proves useful.

## Engineering next step

Prepare a small **independent gold corpus from permitted original professional reviews** with document IDs, entity spans, relation labels, qualifier scope, evidence sentence IDs, and two independent annotators plus reconciliation. Freeze data by publisher/category before any fine-tuning. Compare:

A. Phase131 native NB alone; B. native NB + Phase132 scope guard; C. small locally fine-tuned native contextual model; D. appropriately licensed local GLiNER2 checkpoint (if environment/resources permit). Track accepted-error rate, per-relation precision/recall, abstentions, source misattributions, reviewer minutes per valid edge, memory footprint and runtime. Import only *proposals* into the reviewed category graph.

This is a measurable way to decide whether open source can help, while preserving the core intelligence in-house.
