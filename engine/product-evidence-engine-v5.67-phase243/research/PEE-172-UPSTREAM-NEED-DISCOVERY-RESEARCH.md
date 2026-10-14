# Product Evidence Engine — Research note for Phase 172
## Goal-first, novice-aware, evidence-grounded product suitability

**Prepared:** 12 October 2026. **Status:** evidence-informed research and architecture proposal, not implemented code or an independent empirical benchmark.

### Core product principle

The user need not know the product category, vocabulary, technical specifications, or even their stable priorities. PEE should behave like a technically competent, independent in-store adviser who investigates the intended outcome, discovers non-obvious constraints, and links them to actual testable product performance. Product evidence remains separate from forum anecdotes and provisional need-inference rules. Ranking is deterministic for equivalent verified intentions and equivalent evidence/policy versions, while legitimately changing if intended outcomes, context, constraints or priorities differ.

### I. Findings from primary research literature

1. **Usage-based elicitation for novice users** — Kostric, Balog and Radlinski, ACM RecSys 2021. The study explicitly identifies the failure of direct product-attribute questioning when shoppers lack domain knowledge, proposing questions based on intended usage derived from review sentences. This is a particularly close match for PEE. https://research.google/pubs/soliciting-user-preferences-in-conversational-recommender-systems-via-usage-related-questions/
2. **Preferences are partly constructed, not simply retrieved** — Bettman, Luce & Payne, *Journal of Consumer Research* 1998, 25(3), 187–217, doi:10.1086/209535. Consumers may form preferences as they consider options. Inference: PEE must support exploration and revision without equating its initial interpretation with a user-confirmed desire. https://academic.oup.com/jcr/article-abstract/25/3/187/1795625
3. **Conversational recommenders need conversation policy, understanding and recommendation logic** — Gao et al., *AI Open* 2021, survey covering question-based elicitation, multi-turn interaction, language understanding, exploration and evaluation. https://www.sciencedirect.com/science/article/pii/S2666651021000164
4. **Knowledge-based/constraint-based recommendation** — Uta et al., *Frontiers in Big Data* 2024, review of explicit requirements, constraints, case-based and constraint-based approaches, including handling inconsistent requirements. Review highlights acquisition and maintenance costs of expert recommendation knowledge. https://pmc.ncbi.nlm.nih.gov/articles/PMC10925703/
5. **Information collected through dialogue can improve recommendations, but performance is domain-dependent** — Christakopoulou, Radlinski & Hofmann, KDD 2016: experimental work on question selection for restaurants. Its numerical improvements should not be extrapolated to appliances. https://research.google/pubs/towards-conversational-recommender-systems/
6. **Modeling measurements with procedures** — W3C SOSA/SSN describes observable properties, features of interest, procedures and observations. Useful design reference, not automatic validation of published reviews. https://www.w3.org/TR/vocab-ssn/

### II. Authentic user questions and what they can teach us

*These are published self-selected online posts. They are useful to discover possible goal/constraint patterns, not representative user prevalence or trustworthy performance evidence.*

| Category | Public user question | Inferential lesson, not claimed fact |
|---|---|---|
| Air fryer | Single user wanting to prepare 2–3 meals at once: https://www.reddit.com/r/airfryer/comments/16e8jfz | Household size is not cooking batch size; ask about batch preparation before recommending small capacity. |
| Air fryer | Single user seeking easy cooking and an oven substitute: https://www.reddit.com/r/airfryer/comments/141cunw | Investigate intended dishes, usable cooking area, oven unavailability, cost and skill rather than only liters. |
| Air fryer | Beginner learning to cook specific dishes and trying to save money: https://www.reddit.com/r/cookingforbeginners/comments/1w377nx/ | Check suitability for named foods, learning burden, waste and running costs; ask only decisions-changing questions. |
| Espresso | Beginner prioritizing easy operation and cleaning, not ultimate flavor: https://www.reddit.com/r/espresso/comments/1f8zzou | A laboratory flavor-first 'best' can be wrong for a user whose likelihood of sustained use collapses with maintenance burden. |
| Espresso | Non-coffee-drinker buying for experienced barista: https://www.reddit.com/r/espresso/comments/1w933j1/non_coffee_drinker_in_need_of_home_espresso/ | Buyer expertise and intended user's expertise differ; gift recipient's usage matters more than purchaser's familiarity. |
| Coffee | Wants café-like taste but doesn't know equipment: https://www.reddit.com/r/Coffee/comments/f2zcge | The right solution may be a combination of equipment (e.g. grinder + brewer), not a single product in the initially named category. |
| Vacuums | Multi-floor home, animals, allergies, constrained maneuvering: https://www.reddit.com/r/VacuumCleaners/comments/1s0mee9/tell_me_what_to_buy/ | Cleaning effectiveness, filtration, furniture access, transport up stairs and maintenance are distinct constraints; one headline suction figure cannot substitute. |
| Vacuums | First-time owner wants affordable compact vacuum, no carpets or pets: https://www.reddit.com/r/VacuumCleaners/comments/1w0de6z/first_time_buying_a_vacuum_hard_floors_no_pets/ | Floor type, storage space, country availability and price are needed to understand suitability. |
| Washer | Machine depth blocks opening/use despite attractive features: https://www.reddit.com/r/BuyItForLife/comments/whz69p | Installation and operability can be non-compensatory vetoes. Dimensions must include clearances and door swing, not just chassis size. |
| Washer | Conflicting retailer review ratings causing reliability anxiety: https://www.reddit.com/r/Appliances/comments/1tshjxt/i_need_a_new_washer_machine_but_every_brand_has/ | User may need calibrated reliability evidence, not brand anecdotes or an average of ratings. |

### III. Proposed research and engineering contract

**Input layers:** (1) a person's own words, including gaps, uncertainties and revisions; (2) broad task/outcome (what must happen in real life); (3) contextual factors (where/how/often/by whom); (4) non-negotiable restrictions, risk and avoidances; (5) candidate product categories; (6) optional specialist attributes; (7) evidence version.

**Knowledge graph per category:** `Goal -> Use case -> Outcome -> Mechanism -> Performance dimension -> Measurable proxy -> Test protocol -> Product/variant evidence -> Suitability decision`.

Every edge must be typed and versioned as: `documented domain knowledge`, `conditional engineering inference`, `crowd-observed hypothesis`, or `unknown`. An isolated forum recommendation cannot establish a product-performance edge. Negative causal links and veto conditions are first-class entities (e.g., required installation clearance or inability to make an essential task possible).

**Dialogue policy:** Do not open with a technical feature questionnaire. First extract what can be inferred; ask a small number of natural usage-based questions only if their answer could materially change category, eligible candidates or ranking. If ambiguity does not affect the decision, proceed transparently rather than asking. Explicitly separate user-confirmed needs from hypotheses, recommendations from confirmed evidence, and seller/manufacturer claims from original tested measurements.

**Choice expansion:** Before restricting to the category mentioned by the user, verify whether a different product category or combination of appliances better accomplishes the outcome. Return to a narrow category when the user makes it a hard constraint.

**Decision structure:** First evaluate technical feasibility and decisive vetoes with evidence quality; then rank eligible products using scenario-specific utility, justified weights, dependence handling and uncertainty. Where insufficiently evidenced, show provisional suitability without inventing a definitive exclusion. Run sensitivity analysis so a fragile best choice is flagged.

**Learning loop:** Extract newly observed goals, mechanisms and contradictions into a versioned proposal queue; seek corroborating technical studies, original professional tests or documented causal evidence; verify against frozen cases; approve before modifying live decision knowledge. Do not permit a model to learn new scientific 'facts' from repetition or popularity of online discussion.

### IV. Research categories and user situations

Pilot across *different types of needs*, not just demographics: air fryers, coffee machines, vacuum cleaners, washing machines, refrigerators; hold to backlog traditional fryers, toaster ovens/toasters, steam cookers and other product families. Cross-category scenarios are required. Possible contexts: single-portion vs batch cooking, novice vs expert operator, gift-buyer vs end-user, mobility/access constraints, shared accommodation, pet hair and allergy concerns, limited space, low ongoing maintenance, low running costs, reliability/reparability, time pressure. These are **situational variables, not stereotypes about people**.

### V. Offline assessment — no need to recruit users

Build a rights-aware benchmark of existing **authentic published questions** with source URL, timestamp and minimal required quotation/paraphrase, anonymizing user handles. For each: two independently prepared research-grade analyses of intended outcome, missing context, category alternatives, relevant engineering mechanisms, measurable dimensions, hard constraints, and acceptable 'I don't know'. Resolve disputes against authoritative domain sources rather than moderator votes. Do not let the system see these annotations during inference.

Evaluation axes: correct goal extraction, recovery of latent but justified decision variables, harmful false assumptions, necessary versus unnecessary clarifying questions, recognition of disqualifying constraints, relevance of evidence proxies, category-selection mistakes, rank invariance across paraphrases, ranking changes when relevant needs change, robustness to missing/conflicting evidence, and provenance/audit trail. Separate discovery corpus from blind held-out cases by forum thread, author, product family where appropriate. Report outcomes by category and complexity; don't claim general accuracy based on a handful of hand-made examples.

### VI. Decision for Phase 172

The proposed phase is **Goal-to-Suitability Intelligence** (upstream of explanation): discover real-world goals, construct category-specific need-to-measurement maps, build information-value-driven dialogue, broaden category hypotheses, detect decisive mismatches, link to audited evidence and deterministically re-rank. Explanation is the human-readable projection of this causal/decision trace, not a replacement for it.

**Explicit limitations:** The literature supports researching this approach; it does not prove PEE already has these abilities, nor that its inferred goals will be accurate, nor that any published forum recommendation is scientifically sound. No new model training or neural inference was performed for this research note.
