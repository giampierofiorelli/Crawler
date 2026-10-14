# Product Evidence Engine — Phase 172
## Goal-first suitability research and layered decision guidance

**Date:** 2026-10-12  
**Base:** cumulative v4.95 / Phase 171  
**Status:** implemented and tested *bounded English-first research prototype*, **not** a deployed adviser, independently benchmarked recommender or scientifically approved product-ranking engine.

## Executive finding

Product-choice advice should start with the result the person wants to achieve, not with product parameters they may not know. A person can be uncertain about the category, unable to name the important requirements, or can change priorities after learning about a constraint. PEE must supply the missing technical competence while remaining evidence-grounded, not turn the user into the engineer.

**Communication hypothesis evaluated:** concise-first, expandable explanations are a reasonable default, *not a universally proved ideal number of sentences*. They must never conceal a decisive mismatch, a serious trade-off, or uncertainty capable of changing the decision. A smooth explanation can make a recommendation seem trustworthy even when choice quality declines. The purpose is better decisions, not persuasion.

## What was newly implemented

`src/phase172_goal_suitability_guide.ts` includes three exported functions:

1. `researchUserGoal172`: deterministic, provisional English-language *usage-to-research* map, optionally bound to the **actual Phase164 request output for the same exact question**. Limited seed maps cover air fryers, coffee machines, vacuum cleaners, washing machines, and refrigerators. Starting from observable use phrases it produces candidate outcomes, plausible engineering mechanisms to investigate, measurable/performance dimensions to investigate, possible decisive failure modes, conditional equipment-family alternatives and **at most one decision-relevant plain-language clarification**. It can hypothesize a category from use-context clues but marks it `usage_clue_only`. No product capability claim, exclusion, evidence approval, weight or ranking results.
2. `explainGoalResearch172`: a read-only **two-sentence default** diagnosis followed by **immediately visible consequential cautions** and optional details (what to check, possible failures, verification work). The default is adjustable in future research; a two-sentence brief is **not** claimed to be a validated UX optimum. Any identified important incompatibility remains visible up-front rather than being buried in the optional section. It does not name a winning product.
3. `explainGoalChange172`: compares two candidate research maps and explains which evidence dimensions might change when the stated use changes. **Never claims a ranking changed**, because a real comparison requires independently checked product evidence, user-confirmed requirements and a known ranking policy. Mere detectable equality of provisional dimensions is **not proof of full semantic equivalence**.

Rules and knowledge records are explicitly `usage_hypothesis_requires_domain_review`, not expert-validated causes. Product claims require the Phase169–171 source/identity/protocol sequence or later scientifically controlled admission. These prototype outputs always return `rankingAuthorized:false`, `productExclusionsAuthorized:false`, and `independentEvidenceVerified:false`. This is not a bypass around the established source controls.

## Concrete cases and what the rules did

The four source posts below were individually opened and confirmed as real public user questions. The **inputs to our demo are short author-written paraphrases**, not an unaltered corpus and *not independently annotated ground truth*. The original comments are not treated as performance evidence.

| Public request (paraphrased) | Verified original post | Research hypotheses generated |
|---|---|---|
| One person wants to prepare several meals with an air fryer | https://www.reddit.com/r/airfryer/comments/16e8jfz | Portion and batch size cannot be inferred from household size; investigate usable basket area, loading uniformity, extra cooking cycles |
| Espresso novice prioritizes ease and cleaning over fancy options | https://www.reddit.com/r/espresso/comments/1f8zzou | Workflow steps, cleaning effort, repeatability and actual desired drinks before selecting a device |
| Vacuum needed for pet hair, rugs, carpets and stairs | https://www.reddit.com/r/VacuumCleaners/comments/1s0mee9/tell_me_what_to_buy/ | Surface-specific debris pickup, handling on stairs, tangle maintenance and furniture access, not headline suction alone |
| Washing-machine selection obstructed by tight installation/door clearance | https://www.reddit.com/r/BuyItForLife/comments/whz69p | Installed depth, usable door opening and servicing access can be feasibility conditions before extras and styling |

**Reproducibility:** `evaluation/phase172/public_usage_seed.json` contains the original links and short paraphrases, `scripts/demo-phase172.mjs` runs the installed code, and `evaluation/phase172/public_usage_diagnostic.json` contains the actual output. These cases were available to the designer and influenced the rules, **so a correct output is not a benchmark accuracy result**. No prevalence inference from these self-selected posts is valid.

## Changes of mind: communication contract

When a user's context changes, PEE should say *which technical criteria become more or less relevant, and why*, before presenting any new winner. Example (illustrative):

> Initial: “I live alone and want an air fryer.” We should ask whether they usually cook one portion or several meals in advance, rather than assume a tiny basket.
>
> Revised: “I batch-cook three meals at once.” “That changes what we need to check: usable cooking area, loading uniformity and whether extra cooking cycles are needed. We will check those measurements before changing the product order.”

Only after authenticated/verifiable requirements, identity-matched measurements, comparable sources and a deterministic ranking policy may a separate authorized engine report “Product B has become the better match”. **This phase deliberately cannot do so**. For already verified decisions, a future presenter should derive the concise reason from the engine's *actual difference trace*, not generate an ungrounded post-hoc story.

The first layer for an eventual authorized product recommendation should contain: (a) direct answer or justified abstention; (b) the one or two criteria that genuinely determine it; (c) any decisive mismatch or large uncertainty immediately; and (d) a way to open source/protocol details. A conditional alternative and the material change that would reverse the choice should be made discoverable. This is a design hypothesis, subject to subsequent source-based critique; it is not assumed that all requests need the same text length or layout.

## Critical review of the concise-first hypothesis

**Arguments in favor:** Nielsen Norman Group describes progressive disclosure as making complex interfaces easier to approach; its product-comparison guidance asks designers to highlight important differences and allow secondary details on demand. These are *design guidelines*, not appliance-specific controlled efficacy estimates. Sources: https://www.nngroup.com/articles/progressive-disclosure/ ; https://www.nngroup.com/articles/explicit-differences/ .

**Arguments against treating brevity as an absolute rule:**

- Tintarev and Masthoff (2012) distinguish explanation **effectiveness**, transparency, satisfaction, scrutiny and persuasiveness; those objectives can conflict. Their four empirical studies were in camera and movie domains and personalized simple explanations did not automatically improve choice effectiveness: https://doi.org/10.1007/s11257-011-9117-5 .
- A consumer decision-aid experiment reports that more elaborated explanations could heighten decision confidence, reduce effort and worsen choices. This is evidence against treating “more explanation = more accurate choice”, *not* evidence that all short explanations are superior: https://doi.org/10.1016/j.dss.2011.12.010 .
- The 2021 calibrated-trust research found participants could skip or misapply explanatory material; the study focused on professional clinical decision-support, not household product shopping. Transfer as a warning, not a measured PEE effect: https://pmc.ncbi.nlm.nih.gov/articles/PMC8327305/ .
- NN/g product pages require **adequate** information and comparative clarity. An extreme one-line recommendation that hides fit problems or conflicts would violate the aim: https://www.nngroup.com/articles/ecommerce-product-pages/ .

**Engineering consequence:** visible risks take precedence over arbitrary word limits; expandable methodological details must be real, traceable and symmetric across compared models. Avoid exaggerated certainty, FOMO, needless adjectives and user-flattering persuasion.

## Basis for goal-first elicitation

1. Kostric, Balog and Radlinski, RecSys 2021, *Soliciting User Preferences in Conversational Recommender Systems via Usage-related Questions*: technical-attribute questions can exclude novices; questions based on usage are an alternative. https://research.google/pubs/soliciting-user-preferences-in-conversational-recommender-systems-via-usage-related-questions/
2. Bettman, Luce & Payne, JCR 1998: preferences can be constructed while deciding, so initial preferences must remain revisable. https://doi.org/10.1086/209535
3. Uta et al., 2024 knowledge-based recommendation survey: engineering knowledge and constraint handling are central, expensive to acquire and maintain, not solved by simple string matching. https://pmc.ncbi.nlm.nih.gov/articles/PMC10925703/
4. W3C SSN/SOSA provides a model for observations, features of interest and test procedures; its presence in our research does **not** validate manufacturer claims or tests. https://www.w3.org/TR/vocab-ssn/
5. Conversational explaining can allow deeper engagement, but findings on interface formats and domains are not automatically transferable to PEE's exact ranking context. https://doi.org/10.1145/3579541

## Test evidence

- **Phase172 targeted:** 24 TypeScript tests passed. They cover goal discovery, category uncertainty, scope-sensitive requests, one-question behavior, negative language, conditional equipment-family expansion, explicit family restrictions, original Phase164 context binding, in-place material cautions, and non-publication safeguards.
- **TypeScript eligible full regression:** **2,291 tests across 131 files**, all passing, in 12 isolated groups. The two historically quarantined Phase91/92 suites are excluded consistently with earlier releases. Broad first attempt including them timed out and is **not** called a success. `evaluation/phase172/regression-ts.json` records the successful eligible groups.
- **Python tests:** **212 tests** across six direct unittest discovery groups, all passing (`evaluation`, `ingestion`, `phase95`, `primary_sources`, `tests-python`, `tests-companion`). `evaluation/phase172/regression-python.json` records each command and count. This wider sweep is not directly comparable to older releases' narrower Python totals.
- **Four verified original public posts:** qualitative source discovery; code was run on *our paraphrases* and returned the hypothesized goals. No real-product ranking, no blinded ground truth, no accuracy/precision/recall metric, no end-to-end live production trial or model inference.

## Explicit gaps and falsifiable next questions

1. The mappings currently use **bounded literal/regex cues**. They cannot be claimed to understand unbounded natural language, negation scope or all English paraphrases. A brittle rule may miss a need or misclassify a category; the system must abstain rather than project invented technical knowledge.
2. **Domain mechanisms are research candidates**. For each proposed `goal → outcome → mechanism → metric → method` relation, specialist engineering sources and original professional protocols must be reviewed before it affects ranking weights or veto gates.
3. Existing Phase164 request context can be reused but this prototype is **not yet wired into the live API or product UI**. The explanation layer is research-only; cannot render a confirmed ranking without a future trusted ranking-trace interface.
4. A realistic benchmark needs a **different, previously unseen** set of published questions and independently prepared domain mappings, held out from rule creation; avoid author/thread and near-duplicate contamination. No recruitment of live users is a prerequisite.
5. Explicit ranking changes should be tested counterfactually across verified matching evidence snapshots, with no drift under paraphrases. Changes of evidence or policy version must be identified separately from changes of need.
6. A concise presentation should be assessed against *objective decision correctness, missed disqualifiers and improper confidence*, not merely satisfaction, engagement or persuasive conversion. These are proposed assessment dimensions, not completed user experiments.

## Decision and next development block

Preserve Phase171 audit/suitability constraints and all canonical sources. Keep `Goal → Context → Need-to-Mechanism → Performance/Test → Verified suitability/ranking → User-facing rationale` as distinct, versioned layers. The next serious engineering task is a reviewed category causal/measurement registry, together with trustworthy ranking-difference traces once the ranking engine has admitted comparable evidence. Avoid upgrading a prototype “explanation of changed choice” into proof of a changed winner.
