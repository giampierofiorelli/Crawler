# Product Evidence Engine — Phase 111
## Long-document understanding, cross-segment scope and ambiguity-safe consumer requests

**Date:** 11 October 2026  
**Input:** Actual cumulative Product Evidence Engine v4.34 / Phase 110 source.  
**Status:** Experimentally implemented guards and decision logic; **not** a scientifically validated long-document comprehension engine, semantic scope resolver, user-intent parser or live local-LLM evaluation.  
**Principle:** Product knowledge is query-neutral; user intent changes only the private decision projection or triggers a separately authenticated research gap.

## Executive decision

The user identified two fundamental error classes which can interact and compound one another:

1. **Long-review errors:** All sentences may have been read, but a claim can lose its referent, qualifier, negation, test protocol, variant, comparison direction, manufacturer attribution or revision when different relevant passages are far apart. Sentence-at-a-time atom extraction is **not** equivalent to document-level comprehension. A full context window by itself does not solve this.
2. **Consumer-intent errors:** A system can produce a confident but incorrect top-ranked product by silently treating a *relative priority* (“the quietest”) as an *absolute constraint* (“perfectly silent”), or by confusing “kills bacteria”, “tested against viruses”, “hygiene cycle”, and “manufacturer claims viral reduction”. When different reasonable interpretations alter ranking or eligibility, clarification is necessary. Lack of product evidence is a separate issue from ambiguous preference.

The correct solution is a **two-stage, two-authority system**: first construct independently reviewed, context-qualified *product facts*; then create *user-specific decision scenarios*, compare outcomes and clarify the decision-relevant ambiguity. A request NEVER retroactively modifies original review interpretation.

## Scientific evidence — primary links and exact relevance

| Research | What it supports | Limitation for Product Evidence Engine |
|---|---|---|
| Liu et al. (2024), *Lost in the Middle*, TACL — https://aclanthology.org/2024.tacl-1.9/ | Relevant information in the middle of long prompts can be used less reliably; evaluate by position, not theoretical context size | Benchmarks are not source-wide claim recall on commercial product reviews |
| Hsieh et al. (2024), *RULER* — https://arxiv.org/abs/2404.06654 | Evaluate multi-needle retrieval, aggregation and multi-hop tasks; effective context capacity differs from advertised window | Synthetic tasks and evaluated models cannot supply our local model's accuracy |
| Bai et al. (2024), *LongBench* — https://aclanthology.org/2024.acl-long.172/ | Long context is multidimensional (QA, document understanding, synthesis) | Benchmark performance is not proof of robust extraction from tables or footnotes |
| Yao et al. (2019), *DocRED* — https://aclanthology.org/P19-1074/ | Document-level entity/relation extraction requires joining evidence across sentences | Dataset is Wikipedia-derived, not professionally tested consumer devices |
| Pradhan et al. / CoNLL OntoNotes coreference task — https://conll.cemantix.org/2012/task-description.html | Pronouns, names and nominal references must be resolved at document level | Coreference validity for variant IDs requires domain-specific annotation |
| Vincze et al. (2008), *BioScope* — https://pmc.ncbi.nlm.nih.gov/articles/PMC2586758/ | Negation, uncertainty and their **scope** are critical and must be explicitly annotated; >20,000 sentences in the research corpus | Biomedical language and benchmark scores do not validate consumer review interpretation |
| Aliannejadi et al. (2019), *Qulac* — https://arxiv.org/abs/1907.06554 | Clarification can improve information retrieval on ambiguous/faceted needs; benchmark of over 10,000 Q&A pairs | Its reported retrieval gains do not forecast our recommendation gains |
| Rahmani et al. (2024), *Clarifying the Path to User Satisfaction* — https://aclanthology.org/2024.findings-eacl.84/ | Specific clarification questions are more useful than generic ones; their utility depends on the query | We still need our own experiments on when users prefer questions to qualified answers |
| Zhang et al. (2025), *Vague Preference Policy Learning* — https://doi.org/10.1145/3717831 | Vague accepts/rejects can lead to over-filtering; preferences need not be absolute | A recommendation-system study, not a ready-made clinical or physical safety rule |
| Kostric, Balog, Radlinski (2021), *Soliciting User Preferences via Usage-related Questions* — https://research.google/pubs/soliciting-user-preferences-in-conversational-recommender-systems-via-usage-related-questions/ | Ask about intended use instead of technical attributes unfamiliar to shoppers | Needs category-specific trial before deployment |
| Montazer et al. (2025), *Asking Clarifying Questions for Preference Elicitation* — https://research.google/pubs/asking-clarifying-questions-for-preference-elicitation-with-large-language-models-2/ | Adaptive, sequential questions can help elicitation; advanced models also struggle | Not a validated implementation or optimal-question guarantee for our app |
| NIST AI RMF — https://www.nist.gov/itl/ai-risk-management-framework | Validity, reliability, explainability and evaluation are part of trustworthy deployment | Risk-management guidance, not a statistical product ranking formula |
| Cochrane Handbook, Chapter 5 — https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-05 | Systematic extraction, independently adjudicated outcomes and source/method provenance | Healthcare review principles are applied here by analogy, pending domain validation |

## 1. Understanding reviews without losing the meaning

### 1.1 Never equate a sentence with its final standalone meaning

Example (fabricated):

- Paragraph A: “The programme delivered outstanding hygiene performance.”
- Method section: “Only bacterial reduction was measured in intensive mode.”
- Footnote: “Viral inactivation was not evaluated. The manufacturer advertises a separate disinfection cycle.”

Extracting “outstanding hygiene performance” as `virucidal_verified=true` would be false. It commits *at least three distinct errors*: outcome expansion (bacteria→viruses), condition loss (intensive mode→all modes), and attribution promotion (manufacturer assertion→independent finding).

Canonical evidence must retain: assertion, exact subject and variant, target phenomenon, test protocol, measured vs. declared vs. inferred status, condition, relevant cross-segment limitations, negation/hedging scope, publication/test identity, uncertainty and revision lineage. **Negation of having tested something is not proof that the product fails the task.**

### 1.2 Document processing architecture

1. **Authorized rendered-source inventory**: all accessible text, headings, tables, footnotes, methodological sections, figures, captions, and explicit inaccessible surfaces. This already exists in Phases 109–110. HTML/PDF/multimedia rendering is upstream and not solved by Phase 111.
2. **Deterministic bounded windows**: the new `planLongSource111` creates overlapping, traceable portions, preserving every UTF-16 unit of accessible complete text and original offsets. It never silently truncates. Overlap is an engineering choice, NOT a scientifically calibrated universal window size.
3. **Atomic broad extraction**: Phase 110 runs initial and omission-search passes per window. New `extractLongReview111` actually invokes this pipeline. It preserves original-window offsets and detects duplicate candidates appearing in overlap. Two passes and two overlapping occurrences of the same original finding remain **one original evidence source**, not independent corroboration.
4. **Document-scope review**: `auditContext111` accepts explicit proposed relations between a claim and other source blocks — coreference, negation, condition, hedge, attribution, test protocol, variant, comparison target, revision/correction. It checks that these proposals refer to real spans in the **same exact source revision**, returns content-free hashes, and **always demands independent semantic adjudication**.
5. **No false approval**: exact quote matches validate textual origin, **not entailment**. Absence of a flagged scope link does not prove that the model found all scope restrictions. Production publication requires genuinely reviewed model outputs, full inventory checks and safe canonical write integration.
6. **Source-neutral persistence**: final reviewed facts, scopes and provenance are stored as structured metadata, not entire review body, consumer preferences or their first discovery query. Temporary chunks/anchors are discarded after analysis.

### 1.3 Unresolved engineering and scientific problems

- Real coreference/scope resolver and human-reviewed cross-segment links are **not yet implemented**: Phase 111 validates proposed links and requires an independent review, rather than auto-reconciling all meanings.
- Paragraph/window boundaries may cut a sentence or split antecedent and consequent; overlap mitigates some boundary cases but is not proof of resolution. Tables require heading/column/row linkage, not arbitrary character slicing; images/graphs require distinct extraction methods. Source segmentation and layout coverage must be evaluated separately.
- A model can output a lexical span that contradicts its coded assertion. Lexical anchoring alone does not identify mistranslation, conditional inversion, unit error, or mistaken variant. A different verifier/model/human must be evaluated independently on semantic entailment.
- A sophisticated score on a generic long-context benchmark cannot replace **expert-labeled original review** recall/accuracy per category.

## 2. Ambiguity in consumer requests is a separate inference boundary

### 2.1 Categories of ambiguity we must recognize

| User wording | Possible confusion | Proper handling |
|---|---|---|
| “I want the quietest vacuum” | Relative best among available products vs. absolute silence | Default to *relative noise priority* when unambiguous; don't exclude all noisy vacuums |
| “A dishwasher that kills bacteria and viruses” | Both capabilities mandatory; or one preferred; “sanitizing” mistaken for virucidal evidence | Explicitly distinguish independently tested outcomes; clarify material scope; unknown capability stays unknown |
| “Must be small” | Width/depth/height and hard limit unspecified | Ask about relevant dimensions **if** likely to change eligibility |
| “Good for my pet” | Pet hair collection, allergens, noise sensitivity, maintenance burden | Distinguish contexts/use cases; ask a specific consequential question, not a generic questionnaire |
| “Not too expensive” | Soft budget tolerance vs absolute ceiling | Keep a range/tradeoff; do not invent a budget hard filter |
| “Doesn't make much noise at night” | Personal threshold vs typical mode of operation | Evaluate night use, measured/qualitative conditions; ask if materially necessary |
| “It doesn't do that” | Pronoun/product reference ambiguity | Resolve product and feature or ask; do not edit product facts based on guesses |

### 2.2 Decision-relevant ambiguity gate

The new `gateRequest111` is **not an NLU parser**. It takes competing *independently generated* interpretations, each paired with a read-only, scenario-specific eligible set and possible winner. It operates by deterministic comparisons:

- If alternatives were **not checked** → `analyze_alternatives` (do not trust a single unchallenged interpretation).
- If credible readings differ in **winner, eligibility or absolute constraints** → `clarify`, with one short, category-specific clarification question (or `analyze_alternatives` if no useful question has been prepared).
- If readings agree but a material **evidence gap** exists → `gather_evidence`, not a spurious clarification question or a false rejection.
- If relevant outcomes and eligibility are invariant across examined readings → `proceed` while exposing any material assumptions when presenting the result.
- Any scenarios contain the person's interests and candidate products, but **cannot write to Phase109/101 canonical evidence**.

Crucial: `alternative_meanings_checked` is a caller assertion, not proof that *every* plausible meaning was discovered. A real interpreter needs domain-trained evaluation, adversarial counterexamples and a coverage audit. The engine cannot assert 100% unambiguity.

### 2.3 Avoid clarification fatigue

One explicit nonnegotiable requirement or unclear product identity may warrant an immediate clarification if it would exclude products. A superficial adjective with no impact on the top recommendation generally does not. Question utility should be assessed by whether different answers **change decisions**, not by whether a model labels the query “vague.” Usage-related questions are often better than jargon-specific ones. Missing laboratory evidence cannot be fixed by asking the consumer a question.

## 3. New runnable code and limits

| File | What is actually implemented |
|---|---|
| `src/phase111_long_context_and_query_ambiguity.ts` | Deterministic lossless overlapping source-window planner; injected Phase110 extraction pipeline; original-span candidate mapping and overlap-group detection; document-scope link provenance check with source revision digest; material ranking-ambiguity gate |
| `tests/phase111_long_context_and_query_ambiguity.test.ts` | **25 synthetic software tests** covering complete offsets, emoji/surrogate characters, inaccessible figures, long sections, query isolation, stale source revision, negation/condition scope anchors, ambiguous requests, relative-not-absolute noise preference, evidence gaps and no false approval |
| `PHASE111-LONG-CONTEXT-AND-AMBIGUITY-RESEARCH.md` | Scientific references, architecture decision, evaluation protocol and limitations |

**The path is research-only.** Neither the public ranking nor the existing source approval path has been changed. To make these safeguards mandatory in production, a single enforced ingestion/write orchestrator must require cross-segment adjudication (not allow callers to bypass with direct Phase110 approval) and the consumer UI must call the ambiguity gate before publishing a materially uncertain winner.

## 4. Independent empirical evaluation required

### Source-understanding dataset

Build an independently authorized, human-labeled dataset of long professional reviews across at least headphones, dishwashers and vacuums, with independent publishers and exact variants. Reviewers, blinded to the initial shopper request, annotate *all* claims plus relations to other passages, including note-linked limitations, pronouns, manufacturer attribution, retractions, uncertain assertions, units, test modes and source diagrams. Independently adjudicate disagreements and retain gold source spans. Partition by **original lab/publisher** and by product model, not random duplicate snippets.

Test an ablation series: A Phase110 original blocks; B deterministic windows; C windows + contextual relation proposals; D dedicated independent semantic verifier; E human-reviewed gold. Vary location of limitations (start/middle/end), section distance, negation scope, multi-table references, source length and model/context budget. Measure claim precision/recall/F1 and severity-specific false-positive/false-negative counts; correct product referent; correct qualifier attachment; wrong virucidal vs bactericidal inference; hallucinated measurements; contradiction handling; repeated overlapping source counts; fraction of source blocks genuinely represented. Report measured timings/memory and confidence intervals where data support them. **No such empirical model measurements have yet been run.**

### Shopper-query dataset

Obtain actual or independently authored query/intent examples with adjudicated alternative meanings, especially relative/absolute noise, hard/soft budgets, ambiguous physical dimensions, safety, hygiene, pets and conflicting priorities. Evaluate interpretation-set recall, material-ambiguity recall, false clarifications per session, unacceptable exclusions, false winner claims, top-k stability, user correction burden, satisfaction and task completion. Evaluate whether a question genuinely improves decision quality rather than encouraging arbitrary explicit hard filters. Test across Italian and English separately.

### Release blockers

- No verified production local Ollama execution or semantic entailment calibration.
- No independent real-review long-context gold corpus or human-judged scope recall.
- No mandatory end-to-end gate blocking older write paths.
- No observed user-intent parsing or question utility benchmark; supplied competing interpretations are test fixtures or caller output.
- No claims of full copyright/access rights or ability to retain licensed source text; approved acquisition policy remains independently enforced upstream.

## 5. Bottom line

**This is a strong architectural extension, not a finished AI understanding engine.** The persistent, source-neutral product entity must know *what was tested, under which conditions, by whom, which statement qualifies another, and what is not established*. A consumer query is a temporary lens on that stable knowledge. Neither a document's length nor a person's ambiguous adjective may be allowed to create a fabricated product fact or unjustified elimination.
