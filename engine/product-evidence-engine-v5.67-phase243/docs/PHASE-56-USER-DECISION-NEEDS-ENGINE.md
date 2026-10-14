# Product Evidence Engine — Phase 56
## User Decision Needs, Evidence Fit & Explanation Architecture
**Research date:** 10 October 2026  
**Status:** Implemented research prototype + decision model; **not user-validated, not production-ready**.  
**Non-negotiable:** Source-independent ranking; Amazon and other retailer links only **after** independent recommendation; **no prices**, price histories or affiliate incentives in scoring.

## Executive decision

The next milestone is **not another supplier or benchmark connector**. It is defining what evidence is needed to answer a person's actual purchase question, before scoring anything. Sources of professional hands-on tests remain the evidence bedrock. Manufacturer catalogue specifications are not a substitute for measured product performance. An overall expert rating is not a direct measurement of each attribute.

Phase 56 adds the `src/needs_discovery.ts` research module and dedicated tests. It turns explicit use-case responses into explainable, category-specific evidence requirements and **does not make purchases or generate production recommendations**.

### Evidence supporting the design — exact scope and caveats

1. **Users express needs as situations**. Baymard's use-case search guidance identifies queries like 'gaming laptop' and 'cold weather sleeping bag', which do not map neatly to technical product categories. 43% of benchmarked sites had issues supporting use-case searches. This is a **site benchmark**, not a percentage of consumers needing our proposed feature. [Baymard search types, 2026](https://baymard.com/research-articles/ecommerce-search-query-types).
2. **Users inspect shortcomings**. In Baymard's research, 53% of users sought negative reviews for one or more products. The observed behavior is a reason to expose **relevant potential drawbacks**, not to imply user reviews are independent laboratory tests. [Baymard negative reviews](https://baymard.com/research-articles/respond-to-negative-user-reviews).
3. **Comparability and control matter**. Baymard's latest product-list UX benchmark found 58% of desktop and 78% of mobile commerce sites had mediocre or worse product list UX; users particularly struggle with product variations and filters. These statistics refer to site quality scores, **not our product's conversion impact**. [Baymard product list UX 2025](https://baymard.com/research-articles/current-state-product-list-and-filtering).
4. **Ask progressively rather than all at once**. Nielsen Norman Group's progressive-disclosure principle suggests showing immediately needed decisions first and optional settings subsequently. This is general usability guidance, not evidence for an ideal number of questions for our product. [NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/); [NN/g form cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/).
5. **Let users critique and revise preferences**. Peer-reviewed work evaluates interactive preference elicitation and progressive feedback in conversational recommender systems. It does not imply our algorithm is already better or that we should automatically run an LLM. [Cai, Jin & Chen, 2022](https://scholars.hkbu.edu.hk/en/publications/task-oriented-user-evaluation-on-critiquing-based-recommendation-/); [Ziegfeld et al., 2025](https://www.sciencedirect.com/science/article/pii/S0885230824000792); [review, Artificial Intelligence Review](https://link.springer.com/article/10.1007/s10462-022-10229-x).
6. **Consumer scenarios illustrate candidate needs**. Selected community posts describe mixed flooring, pets, maintenance, quiet operation, sensitivity to sound, durability, and unfamiliar product ranges. They are self-selected anecdotes, **not representative prevalence estimates**. [Quiet vacuum with cats](https://www.reddit.com/r/VacuumCleaners/comments/1x05poc/quiet_vacuum_for_hard_floors_and_couches_with_cats/); [mixed floors and pets](https://www.reddit.com/r/VacuumCleaners/comments/1u49mgx/shoved_down_the_reddit_vacuum_rabbit_hole_looking/); [long-term maintenance concerns](https://www.reddit.com/r/VacuumCleaners/comments/1qyh8xd/best_vacuums_for_heavy_pet_hair_mixed_flooring/).
7. **Transparency about review-derived rankings matters**. UK CMA guidance applies to businesses publishing consumer reviews and **information derived from them**, including rankings. It should be checked alongside the distinct rules for professional editorial tests. [CMA guidance 2025](https://www.gov.uk/government/collections/reviews-and-social-media-endorsements-what-businesses-and-content-creators-must-know).

**Evidence confidence:** high that the above sources exist and are relevant to UX patterns; **unknown** whether the exact prompts, scoring weights or prioritisation rules in our prototype help users choose better. Those are hypotheses requiring user research.

## Decision jobs: what a shopper actually needs the engine to solve

These are **product hypotheses from the research**, not measured percentages. Each must be tested:

| User job | User language | System output | Failure to avoid |
| --- | --- | --- | --- |
| Understand the category | "I don't know what matters" | Explain relevant decision criteria in everyday language | Dumping technical specifications |
| Translate a real-world problem | "I have a cat, hard floors and a small flat" | Map the situation to specific test evidence | Pretending a generic overall score answers it |
| Prioritise the non-negotiable | "It must fit this space" | Explicit exact-model constraints, if verifiable | Softening hard constraints without permission |
| Discover personal deal-breakers | "I cannot tolerate loud noise" | Surface noise testing when available; admit gaps otherwise | Assuming other scores proxy sound |
| Compare trade-offs | "Why is B better for me than A?" | Side-by-side differences for matching scenarios | Claiming small numerical margins establish superiority |
| Understand weaknesses | "What's wrong with the winner?" | Evidence-backed limitations relevant to selected needs | Reproducing generic pros/cons uncritically |
| Check proof quality | "Which tests support this?" | Source, method, version, exact variant, agreement/disagreement, missing coverage | Misstating confidence or pooling incomparable tests |
| Refine the decision | "Actually, comfort matters more" | User can revise priorities and see changes | Freezing initial assumptions |
| Decide with unresolved uncertainty | "Nobody tested the feature I care about" | Abstain, or provide conditional options without declaring a winner | Inventing information to fill gaps |
| Buy independently | "Where can I buy it?" | Retailer destinations after ranking | Letting merchant stock, prices or commissions change results |

### No price paradox

Users often need budget/price filtering; Baymard explicitly identifies price among core ecommerce filter types: [Product List UX 2025](https://baymard.com/research-articles/current-state-product-list-and-filtering). We **intentionally exclude** prices for the launch to protect legal/data boundaries around Amazon and source rights. This is a **product-value gap**, not a research finding that price is unimportant. UI must say current cost cannot be confirmed here, and users can check it independently on retailers' pages. Do not ask for a budget and silently ignore it; do not disguise list prices as live affordability; don't invent a cheapness ranking.

## Decision architecture, proposed

**Stage 1 — Starting intention**: User describes intended use, challenge, and where/how the product will be used. This is an unstructured user need; it is NOT evidence about a product.

**Stage 2 — Clarification**: Ask the minimum number of **decision-relevant** questions; split essential context from optional refinement. In the prototype two questions are shown per step by a transparent **design choice**, not a validated optimal count.

**Stage 3 — Confirm interpretation**: Display "We understand you need X and Y; are these priorities right?" Accept explicit correction. Treat inferred importance as **provisional**.

**Stage 4 — Evidence contract**: Each need must map to a measurable criterion, precise test protocol and exact variant applicability before use in ranking. Missing evidence remains missing. A published editor's subjective 'good' label is not an interchangeable decibel/cleaning result.

**Stage 5 — Candidate decision**: With authorized, comparable data, rank only within the evidence and methodological limits, respecting hard constraints. **Never force a winner.** Weights should eventually be calibrated and tested; arbitrary defaults are not scientific scores.

**Stage 6 — Explanation and uncertainty**: Show which considerations dominated the recommendation, strongest relevant limitations, which tests justify it, and what was untested. Allow critiquing/reconsideration.

**Stage 7 — Merchant resolver**: Attach approved, exact-variant affiliate links only **after** ranking is frozen. No prices, history, Amazon data or commission signals within stages 1–6.

### Representing a need without confusing it with evidence

- User need: "A quiet vacuum; my household is sensitive to noise."
- Decision criterion: measured sound output under a specified protocol and operating mode.
- Admissible evidence: tested measurement with units, conditions, exact model, rights and provenance.
- Explanation: show only substantiated sound differences and the relevant caveats.
- If measurement absent: **unresolved**. Do not substitute watts, motor marketing, online star ratings or generic synthetic ease scores.

The same distinction holds for long-lasting devices (requires appropriate lifetime/reliability evidence), headphone comfort (human factors/methodological limits), carpet cleaning (controlled pickup tests), and call quality (microphone speech/noise tests).

## What has actually been implemented

`src/needs_discovery.ts` exports:
- `interpretDecisionNeeds(category, answers, availableEvidence, maxQuestions)` — deterministic, price-free, category-aware need mapping.
- `vacuumNeedsPrototype` — 7 needs (carpet, hard floor, pet hair, handling, noise, filtration, maintenance), 6 adaptive questions.
- `headphonesNeedsPrototype` — commute/calls/gaming/music cases and 6 corresponding *candidate* test criteria. No fake conversion to vacuum scoring.
- Output: selected criteria, explicit/inferred importance, relevant drawbacks, acknowledged unsupported test dimensions, limited next questions, and a decision status.
- Optional `syntheticWeights` only when the input can map wholly to the pre-existing **fictional** carpet/pet-hair/ease demo. These are **not** valid for real professional reviews, and the result always carries `publicationReady: false`.

**Precise limitation:** `availableEvidence` is a caller-supplied set of **capability names**, not a proof that a real dataset contains licensed, comparable evidence. The next integration must derive these capabilities from approved original laboratory observations, and the ranking stage must validate actual measurements. Do not publish merely because `status==='criteria_mapped'`.

**Guardrails implemented:** unknown choices or priorities rejected, forbidden commerce-related input keys rejected, no silent substitution of unavailable evidence, no speculative weights without user confirmation, no public launch module added. The test suite covers these behaviors.

**Not yet implemented:** text-to-need natural-language parsing, dynamic information-gain optimisation, real-world criterion weighting, persona model, genuine negative-test extraction, statistical confidence intervals, full UI, field studies or live professional test integration. No validation of consumer decision quality is claimed.

## Worked hypothetical cases (not real recommendations)

### Case A — Carpet + pets, and strong priority on pet hair
Answers: `floors=carpet`, `pets=yes`, explicitly pet-hair `essential`, carpet `nice_to_have`, confirm. In *fictional demo only*, the engine would map pet hair to 3 synthetic points and carpet to 1; these are merely declared weights, not calibrated empirical coefficients. Real ranking remains blocked until proper evidence mapping.

### Case B — Hard floors and sound sensitivity
Answers: `floors=hard`, `pets=yes`, `noise_preference=yes`, confirm. With existing toy capabilities `{carpet,pet_hair,ease}`, the engine returns **insufficient_evidence**, listing `hard_floor_cleaning` and `noise`. The user should not be given a confident winner based on pet hair alone.

### Case C — Commuting headphones
Answers: `usage=commute`; candidate criteria ANC and measured battery life. Even if a future source supplies both, we need validated, compatible measurements. No synthetic headphone winner is created and the existing vacuum-only scoring is not repurposed.

## Research plan to determine what users actually need (rather than assume it)

### Phase A: qualitative discovery — **planned, not performed**
- Recruit approximately 12–18 recent or active shoppers across two deliberately different categories (e.g., vacuums and headphones), with a range of product familiarity and purchasing confidence; these are **planning numbers, not statistically justified sample sizes**.
- Ask about an **actual recent decision**: trigger; alternatives considered; what they searched; what made them uncertain; how they judged source trust; the single trade-off that nearly changed the purchase; whether they knew what technical measurements mattered; how missing price information would change the decision.
- Think-aloud tasks: start from their own use case, compare 2–3 alternatives using independent evidence, explain *why* one is preferred, identify deal-breakers and the deciding fact.
- Record with consent; redact personal data; code observed behavior separately from stated attitudes; note disagreement and unexpected needs.

### Phase B: prototype evaluation — **planned, not performed**
Compare (within or between participants with order counterbalancing):
1. ordinary list of expert reviews / conventional product table;
2. our progressive needs capture + evidence-backed trade-offs + relevant negatives + source provenance.

Observe task completion, decision correctness using pre-agreed expert criteria, time-to-reasoned-decision, ability to identify a disqualifying drawback, calibration of confidence, ability to spot insufficiency, perceived independence, and error caused by absence of price context. Avoid optimising only click-through to merchants or self-reported satisfaction.

### Phase C: quantitative evaluation — **planned, not performed**
Pre-register hypotheses, use real consenting participants and licensed evidence, quantify task success and confidence calibration, assess category and expertise differences. Choose sample sizes by minimum detectable effect and power analysis only **after** pilot variance and the primary outcome are known. Never invent an uplift, user count, or conversion effect.

### Explicit rejection/iteration triggers
- People cannot understand criteria or distrust explanations.
- Users reject recommendations because a crucial real-life constraint was never requested.
- A dominant share of stated decisions require missing copyrighted/lab measurements.
- Users repeatedly leave because they cannot see or filter by price.
- The engine makes confident statements despite absent, incompatible, or unlicensed evidence.
- Merchant affiliation or product popularity alters independent ranking.

## Immediate technical gates for the next phase

1. Add an audited `need → original evidence metric → accepted test protocol → exact variant` dictionary for **one** category, curated using licensed measurements and expert review.
2. Distinguish raw measurements, editorial scores, compatibility checks, usability measurements, missing data and methodological disagreement.
3. Connect approved evidence capability only after actual evidence/rights checks, not manually asserted strings.
4. Define evidence-weighted uncertainty and abstention before displaying personal recommendations.
5. Prototype the UI with real users and test the absence of price independently of algorithm quality.

## Source links — directly usable

- https://baymard.com/research-articles/ecommerce-search-query-types
- https://baymard.com/research-articles/respond-to-negative-user-reviews
- https://baymard.com/research-articles/current-state-product-list-and-filtering
- https://baymard.com/ecommerce-design-examples/39-comparison-tool
- https://www.nngroup.com/articles/progressive-disclosure/
- https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/
- https://www.sciencedirect.com/science/article/pii/S0885230824000792
- https://link.springer.com/article/10.1007/s10462-022-10229-x
- https://scholars.hkbu.edu.hk/en/publications/task-oriented-user-evaluation-on-critiquing-based-recommendation-/
- https://www.gov.uk/government/collections/reviews-and-social-media-endorsements-what-businesses-and-content-creators-must-know
- https://www.reddit.com/r/VacuumCleaners/comments/1x05poc/quiet_vacuum_for_hard_floors_and_couches_with_cats/
- https://www.reddit.com/r/VacuumCleaners/comments/1u49mgx/shoved_down_the_reddit_vacuum_rabbit_hole_looking/
- https://www.reddit.com/r/VacuumCleaners/comments/1qyh8xd/best_vacuums_for_heavy_pet_hair_mixed_flooring/

### A guarded connection to the existing demonstration ranker

`src/needs_demo_pipeline.ts` implements `runNeedsDemo(...)`, a **separate offline research bridge**. It takes user-confirmed priorities, maps them to the three synthetic vacuum dimensions only if those dimensions are covered, and invokes the existing `rankPriceFree` toy ranker. An important extra safety check suppresses the winner if **any compared candidate lacks requested evidence** (the legacy demonstrator might otherwise select the sole fully-covered candidate). The bridge returns `publicationReady:false` and `purpose:'synthetic_demo'` in all circumstances.

Two deliberately fictional aspirators (A good on carpet but weaker on pet hair; B conversely) change order when a person explicitly changes priorities. That proves a deterministic *software property*, **not that a real customer would prefer either one**.

Tests are in `tests/needs_discovery.test.ts` and `tests/needs_demo_pipeline.test.ts`. Neither the interpreter nor the research bridge is exported from `src/launch/index.ts` or included in `dist-launch/` or the public release archive. The public pipeline remains unchanged and locked to synthetic demonstrations.
