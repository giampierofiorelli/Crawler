# Product Evidence Engine — Critical review of solution-first shopping and role-specific rankings

**Date:** 2026-10-12  
**Status:** strategic/engineering hypothesis; **not implemented, empirically benchmarked, or authorized for live product recommendations**.  
**Canonical code baseline:** `product-evidence-engine-v5.03-phase179.zip` (Phase 179). This document extends, but does not overwrite, `PEE-GOAL-TO-SOLUTION-COMPOSITION-ARCHITECTURE-2026-10-12.md`.

## 1. The proposition, fairly stated

A person should be able to say only what they want to achieve, in ordinary English, without knowing the product category. PEE would identify alternative means, necessary tools and optionally a compatible combination of products. For each relevant tool or role it would offer immediately useful, evidence-grounded product choices. One product might be fully adequate for the **current outcome** without being the best option when the same shopper later adds unrelated or broader future uses. The person could broaden criteria from a product/role page; relevant recommendations should be recalculated deterministically, without losing the original solution context.

This is closely aligned with PEE's existing purpose: finding **the right product for a stated need**. It should not dilute that function in favour of open-ended lifestyle advice.

## 2. Red-team verdict

**Keep:** outcome-first entry point; composition of alternative ways to achieve the outcome; relevance of product rankings to the current role; recognition that a merely adequate, less expensive item may be a better choice than an expensive category leader; easy expansion to broader use cases; dedicated product pages; requirements and evidence snapshots.

**Change:** do **not** show five products automatically for every subcategory; do **not** obtain the bundle by independently selecting the top-ranked item in every category; do **not** call a product "sufficient" without a proven, task-specific threshold; do **not** imply "best overall" without a defined comparison population, scoring policy, and evidence coverage; do **not** assume combining these functions alone differentiates PEE from current shopping assistants.

**Most defensible differentiation hypothesis:** a testable, auditable, continuously updated *decision system* in which product and solution recommendations follow admitted professional evidence, model-level feasibility, explicit constraints, understandable criteria, and reproducible change traces—not an impressive sounding answer or a long product list.

## 3. Competitive reality (verified public product descriptions, not head-to-head tests)

- ChatGPT Shopping Research already asks preference questions, searches and compares products, displays a shortlist and side-by-side comparisons, and supports revising constraints. Official documentation: https://help.openai.com/en/articles/12911370-using-shopping-research-in-chatgpt
- OpenAI described a richer visual product comparison experience on **24 March 2026**: https://openai.com/index/powering-product-discovery-in-chatgpt/
- Anthropic documents web search and comparison of products in Claude: https://www.anthropic.com/news/web-search
- OpenAI's own guidance acknowledges potential mistakes in products, prices and availability; this does **not** establish that PEE is more accurate: https://help.openai.com/en/articles/12911370-using-shopping-research-in-chatgpt

Hence the proposition "unlike ChatGPT/Claude, we can understand a goal and show products" is **false as a differentiator**. A stronger, falsifiable value proposition is reduced verification burden, fewer missed critical constraints, clearer source provenance, repeatable and controllable revisions, higher evidence-grounded outcome success, and lower decision effort *when these are measured*.

## 4. The two-level recommendation model

### A. Rank or compare **solutions** first

Candidate paths for an expressed goal can include: no purchase / existing equipment, a compatible accessory, one standalone product, a verified multi-product configuration, or conditional strategies where unknowns prevent confirmation.

For each path, verify the whole outcome and its dependencies, not just the scores of the ingredients. Present whether the path is established feasible, conditional, or unsupported; the mandatory parts and approximate total cost only when evidence and price snapshots exist; important incompatibilities; and the reason it may suit the present goal.

**A role is not necessarily a purchasable product category.** It can be a process step, capability, ingredient, existing asset, service, or accessory. Never create an extra purchase just to populate a recommendation slot.

### B. Show **product choices for a specific role within a chosen feasible solution**

A role/product panel should initially make visible:

1. The context: "For making fresh rigatoni in this configuration".
2. A verified **fit-for-purpose choice**, when one is known; explicit proof of the required capability, performance conditions, limits, price and known tradeoffs.
3. The **best fit under the currently confirmed preferences**, which may be the same item. Do not fabricate a second winner for variety.
4. A meaningful alternative, when evidence permits, plus an expandable complete ranked set with ties/unknowns and an optional top-five view. The number **five is a presentation choice, not a statistical or engineering law**.
5. "I also need it for…" / "Change priorities" and an inspectable criterion snapshot that can create a new ranking with a versioned difference trace.

Do not claim "lowest price that works" if downstream energy, cleaning, consumables, repairs or reliability materially affect real cost and have not been evaluated.

## 5. Formal distinctions and ordering

- **Adequacy / eligibility gate:** item or set passes every applicable *evidence-supported* noncompensatory requirement for the current role and goal. Missing decisive evidence yields `needs_verification`, not `pass`.
- **Economy among adequate alternatives:** among eligible options, compare justified cost, maintenance, time, usability and durability where validated. "Good enough" is a verified relationship to a defined use, **not a poor-quality product**.
- **Optimality conditional on preferences:** rank comparable feasible alternatives against the current versioned goal, confirmed priorities, evidence and policy. No universal or stable-without-context "best overall".
- **Whole-configuration ranking:** apply compatibility and combined cost/space/workflow constraints before preference ranking. The highest-scoring component from category A may be incompatible with the highest-scoring component from category B, or two specialists may jointly cost more and perform worse for the user's goals than one integrated appliance.
- **Broader-use re-evaluation:** when a user adds an additional confirmed use, produce a new need snapshot; show preserved/added/relaxed constraints and evidence-backed reasons for differences. If the recommendation is unchanged, say so.

A category rank may be deterministic and still *wrong* when evidence or thresholds are unsound. Determinism is necessary for reproducibility, not proof of quality.

## 6. User experience illustration (illustrative English copy, NOT real recommendations)

**Initial statement:** "I want to make fresh rigatoni at home. I don't own any equipment, and I won't make other pasta shapes." 

**PEE response:** "We'll check ways to make this shape, including the equipment and any required dies or accessories. A sheet-rolling machine is not automatically a viable rigatoni solution." Show alternative verified strategies only when the underlying domain evidence supports them. If essential information is unavailable, ask one outcome-changing question.

**Solution card:** "Option A: a complete setup for this goal" with mandatory items, compatibility status, all-in cost where known, unsupported claims explicitly marked and critical tradeoffs immediately visible. "Use what I already own" remains an alternative if relevant.

**Product role:** "For the forming/extruding step" -> `Meets requirements` / `Needs verification` / `Does not meet requirement` with the original evidence and comparisons; "Compare other verified choices" expands a compact list. A claim about a specific machine/die must cite a manual, identity-matched technical specification or eligible independent test, not an LLM's generic knowledge of the category.

**Revision:** "Actually, I also want to make ravioli and spaghetti." PEE retains original rigatoni goal, creates a new version, expands the required outcomes and reruns feasible-path and role-specific product comparisons. It may find that an initial specialized recommendation no longer dominates; it must not silently rewrite the earlier result.

## 7. Why automatic top-five-by-category is a risky default

- If three role categories each show five products immediately, users face up to **15** product cards before they know which roles are mandatory, and many cross-product combinations may be invalid.
- A meta-analysis of **99 observations (N = 7,202)** identifies preference uncertainty, choice task complexity and other moderating factors for choice overload. It does not prescribe "always show three" or "never show five": https://doi.org/10.1016/j.jcps.2014.08.002
- A broader 2022 review of **177 studies** reports benefits and costs of larger assortments, underscoring the need to test alternatives rather than hardcode one layout: https://doi.org/10.1016/j.jretai.2022.01.001
- Nielsen Norman Group recommends highlighting the differences that actually matter and progressively exposing lower-priority differences: https://www.nngroup.com/articles/explicit-differences/

**UX hypothesis:** one grounded best-fit product per necessary role, salient fail/warning flags and 1–2 genuinely different alternatives, with a full expandable comparison. Test this against visible top-fives, not as dogma.

## 8. Engineering composition and existing work to reuse

- `src/phase116_category_function_model.ts`: functions, outcomes, mechanisms.
- `src/phase117_goal_outcome_comparison.ts`: outcome and measurement comparability.
- Phase164/172–175: bounded English interpretation, entity roles, user ownership and context.
- `src/phase177_decision_snapshot.ts`: user-confirmed, editable criteria and revision state. Prefer it over chat-log identity.
- Phase105/106: dependency invalidation and deterministic recomputation.
- Phase129/179: controlled category knowledge growth; discovered novel technologies enter review, not production ranking.
- Phase169–171: professional-source admission, exact product/variant identity, protocol comparability, conflict and revalidation.
- Phase178: UI/browser path (cumulative v5.02 and successor v5.03).

Future typed interfaces: `Goal`, `RoleOrSubgoal`, `Strategy`, `Compatibility`, `SuitabilityGate`, `SolutionCandidate`, `ItemWithinRole`, `DecisionSnapshot`, `EvidenceTrace`, `RankingDifferenceTrace`. Determine what exists before adding new abstractions. Do not add a second rating ontology or a second mutable user-state engine.

Formal family-level discovery is **not** exact-model selection. Never output five named products from a theoretical category graph until exact product identity, source coverage and scoring policy have been independently admitted.

## 9. Critical tests / falsification plan

Run at least three independently sourced goal classes and several unseen authentic English phrasings each: (i) attainable with owned equipment / zero new purchases; (ii) single multifunctional product versus a multi-product alternative; (iii) mandatory compatible parts with at least one adversarial incompatible pair. Include a fourth with an outcome that cannot be verified, to test abstention.

Compare four conditions on the **same curated expert-reviewed product evidence set**:

1. Generic goal-to-product response without explicit role and compatibility gates.
2. PEE existing category-ranked recommendation without solution composition.
3. PEE solution-first with all top-five lists immediately displayed.
4. PEE solution-first with role-specific sufficient choice and expandable comparisons.

Also benchmark up-to-date ChatGPT Shopping Research and Claude web search at the time of study, using identical goals, region, budget, inventory, evidence access and comparable run budgets wherever possible. Report limitations in matching their capabilities and research conditions. Blind expert reviewers should assess:

- mandatory-step coverage and outcome feasibility;
- false-positive feasibility / critical missed constraints;
- unsupported exact-product/compatibility claims;
- unnecessary purchases and all-in economic efficiency;
- sensitivity to paraphrases and legitimate changed priorities;
- decision time, comprehension, uncorrected overconfidence and change friction;
- citation/source correctness and provenance;
- stability with identical inputs and versioned sources.

**Success criterion is not marketing persuasiveness, click-through rate or merely showing a shopping list.** A strong design would demonstrate measurably more correct and more economical complete decisions than the baselines. Avoid claiming superiority in advance.

## 10. Research sources and their scope

- Knowledge-based and constraint-based recommendations: Mathias Uta et al. (2024), *Knowledge-based recommender systems: overview and research directions*. https://doi.org/10.3389/fdata.2024.1304439 . Supports constraints, explicit preference revisions and the knowledge-acquisition challenge. Does not validate PEE's model.
- Choice overload moderators: Chernev, Böckenholt & Goodman (2015), *Choice overload: A conceptual review and meta-analysis*. https://doi.org/10.1016/j.jcps.2014.08.002 . Does not establish a universally optimal number of displayed product cards.
- Assortment tradeoffs: Sethuraman et al. (2022), *The effect of retail assortment size on perceptions, choice, and sales*. https://doi.org/10.1016/j.jretai.2022.01.001 . Not a trial of PEE.
- Product comparison clarity: Nielsen Norman Group, *Explicitly State the Difference Between Options*. https://www.nngroup.com/articles/explicit-differences/ . Usability guideline, not direct evidence of higher product-outcome correctness.
- Bounded rationality/satisficing: *Simon’s bounded rationality* (2024). https://link.springer.com/article/10.1007/s10203-024-00436-2 . Conceptual background for threshold-based adequacy, not proof that a proposed threshold is technically valid.
- Shopping assistants (competitive capabilities, vendor descriptions): https://help.openai.com/en/articles/12911370-using-shopping-research-in-chatgpt ; https://openai.com/index/powering-product-discovery-in-chatgpt/ ; https://www.anthropic.com/news/web-search . Not third-party audited comparative performance.

## 11. Architectural decision

**Proceed as a bounded, evidence-governed extension of PEE's existing best-product engine, not a pivot into a generic AI advice website.** The purchase decision is still central. Let the outcome-first workflow identify which product decisions actually need to be made, then give each one a clear recommendation and an inspectable, revised ranking when the user expands goals. Only claim the differentiation from general-purpose AI assistants after a blinded, source-controlled benchmark demonstrates it.
