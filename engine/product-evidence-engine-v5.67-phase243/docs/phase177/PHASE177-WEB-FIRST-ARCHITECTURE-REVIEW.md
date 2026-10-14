# Product Evidence Engine — Phase 177 architectural review

**Date:** 12 October 2026  
**Canonical software baseline:** v5.00 / Phase176; **no new software release is claimed by this review.**
**Decision status:** Web-first direction adopted as an architectural design requirement; exact interface layout, need inference and recommender performance remain empirical hypotheses to test.

## Decision: guided product-decision website, not mandatory continuous chat

PEE should support an independent product-decision workflow using natural-language English at intake and when the user chooses to revise a choice, but structured web UI for exploration, comparison, corrections, clarifications and review of evidence. Chat may be optional for difficult free-text questions; a chronological chat transcript is **not** the canonical requirement state.

### Canonical state and separation of concerns

1. **Original user input / action:** retain exact English text or UI action and source span; label whether direct user input, product-page click, preference correction or externally quoted text.
2. **Interpreted candidate needs:** provisional goals, constraints, tradeoffs, alternatives and unknowns, each with status (inferred / confirmed / denied / withdrawn / uncertain), evidence provenance and confidence calibration (not artificial percentages).
3. **Editable decision snapshot:** versioned canonical set of user-confirmed hard constraints, user priorities, conditional preferences, context, open questions and choice scope. A UI change produces a new version with a signed/auditable delta, not merely a new message.
4. **Category-domain engineering map:** separately validated need -> functional mechanism -> performance dimension -> measurable test -> protocol/source validity, with abstention when unavailable.
5. **Product assessment and ranking:** independently admitted source- and variant-matched measurements; deterministic ranking tied to a fully defined requirements snapshot and policy/evidence versions. A paraphrase without material change must not alter it.
6. **Result interface:** initial suitability and important incompatibilities visible, product evidence comparisons and expandable technical explanations; feedback such as "too large," "cleaning is more important," "show a different technology," or "I don't want this family" modifies only attributable state.

## Proposed website journey to test

* **Entry:** a single short open-English question about desired outcome, with optional search/category access.
* **Interpretation:** show editable understanding in everyday language; confirmation only on consequential ambiguity. Never assume a household attribute determines a mechanical constraint.
* **Shortlist:** display only when evidence admission allows; if it does not, explain evidence missing and show researched category checks or credible abstention. Clearly indicate meaningful failures or uncertainties.
* **Explore and refine:** accessible controls for trade-offs, alternatives and critical compatibility; one user-initiated question when needed; no mandatory wizard or endless interrogation.
* **Compare and inspect:** consistent measured performance across product variants; methods, dates, source identity and test protocols expandable. User may undo a revision and see a criterion-level explanation of legitimate ordering changes.
* **Return later:** restore the last confirmed snapshot if authorized; unconfirmed inferences remain separate.

## Reassess previous engineering investment

**Retain:** Phase154 scoped context/negation, Phase163 review relation candidates, Phase169-171 evidence admission/identity/conflict controls, Phase172-175 goal extraction and meaning/scope/ownership cues. These are useful for reviews and user input alike.

**Reduce in primary UX:** Phase176 full dialogue-state ledger should be an optional NLP fallback and test utility, not an assumption that each user will engage in a continuous conversation. A state-diff mechanism from explicit website controls is simpler and usually more auditable than resolving "that one" across multiple chat turns. Do not delete the module or history without testing.

**FastCoref review use:** uploaded `fastcoref-main.zip` contains code and a README for candidate mention/coreference clusters and span offsets. Relevant example: in an independent review comparing two vacuum cleaners, resolving "it" may attribute a noise or hair-removal statement to one of them. Coreference *cannot* prove factual accuracy, feature measurement or review speaker authority; it needs entity/speaker/negation/quote isolation and a domain-held-out labeled comparison to the Phase154/151 bounded baseline. Uploaded root code is MIT; weight files and other assets need independent licensing inspection. `pyproject.toml` declares substantial Torch/Transformers/SpaCy dependencies; no runtime integration approved.

**Schema-Guided Dialogue / SGD-X use:** uploaded `dstc8-schema-guided-dialogue-master.zip` contains task-dialogue schema, state and paraphrase stress-test material, rather than professional reviews or authentic product-selection user sessions. Use its annotation approach, not its performance claims, to design goal/criterion-change and schema-robustness benchmarks; do not substitute it for real shopping data. Dataset LICENSE.txt is CC BY-SA 4.0; rights for derived datasets and redistributed materials must be checked before commercial adoption.

## Evidence supporting examination, not guaranteed product-specific UX effectiveness

* Chen & Pu, *Interaction design guidelines on critiquing-based recommender systems* (2009), https://doi.org/10.1007/s11257-008-9057-x ; user trials of feedback on suggested items vs combined suggested and user-initiated critiques.
* Chen & Pu, *Critiquing-based recommenders: survey and emerging trends*, https://doi.org/10.1007/s11257-011-9108-6 .
* *Evaluating conversational recommender systems*, AI Review (2022/23), https://doi.org/10.1007/s10462-022-10229-x ; distinguish objective performance from subjective satisfaction, many systems mix UI and ranking components.
* Preference-elicitation interface study, https://doi.org/10.1007/s11257-011-9116-6 ; interface representation affects expressed preferences and user effort.
* NN/g product comparison tables, https://www.nngroup.com/articles/comparison-tables/ ; web UX guidance on consistent dimensions and comparison of few options.
* NN/g explicit differences, https://www.nngroup.com/articles/explicit-differences/ ; surface consequential distinctions.
* NN/g progressive disclosure, https://www.nngroup.com/articles/progressive-disclosure/ ; does not justify hiding decisive mismatch.
* SGD dataset README in provided archive, official repo https://github.com/google-research-datasets/dstc8-schema-guided-dialogue .
* FastCoref README/modeling in provided archive, official repo https://github.com/shon-otmazgin/fastcoref .

## Phase177 engineering backlog and evaluation contract

1. Build a **minimal immutable decision-snapshot and action-delta schema** with event provenance, typed constraints, reversibility and stable canonical keys. Existing ranker authority flags remain false unless required external evidence admitted. Test undo/redo, absent vs denied vs unknown, user-edit overriding inference, product ownership vs desired purchase, and material vs cosmetic changes.
2. Build a **read-only website presentation data contract** carrying a concise first layer, consequential problems, criteria and optional drilldowns. No fake product winners.
3. Test three interactions against the same state contract: short English free text, explicit chips/controls, optional free-text clarification. Do not assume one mode is universally better.
4. Run a separate **review-side FastCoref feasibility comparison** on licensed English review passages with referential ambiguity and multiple product mentions. Compare to existing bounded resolver; record correct antecedent and dangerous false attachments, runtime costs, model availability, license and version.
5. Use SGD-X as structural inspiration for *new independent* English paraphrase and state-revision annotations, not as proof of product-domain correctness. Source-blind before adapting code; guard against leakage.
6. Evaluate objective outcomes: erroneous hard veto rate, missing decisive constraint rate, wrong reference attribution, requirement edit reversibility, ranking parity across equivalent snapshots, time/actions to reach a correct shortlist, and willingness to revise criteria. Avoid optimizing mere engagement or confidence.

**Anti-overclaim:** This file is a design/audit decision, not a deployed UI, validation study, independent user experiment or new product suitability ranking release. No code was modified or test counts increased by writing this file.
