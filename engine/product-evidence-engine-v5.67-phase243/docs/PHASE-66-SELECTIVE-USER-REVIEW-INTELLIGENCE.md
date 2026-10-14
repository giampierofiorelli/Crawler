# Phase 66 — Selective Experience Intelligence (research only)

**Product Evidence Engine | 10 October 2026**

## Executive decision
Preserve the original system: personalised suitability derives from documented technical specifications and professional independent testing, assessed for *specific user functions and contexts*. User experiences are **supplementary, selectively sought evidence** only when they could answer a documented, decision-relevant question that professional evidence does not resolve. An AI component can propose structured, excerpt-anchored observations from content for which processing rights have been established; it may not autonomously crawl arbitrary reviews, manufacture conclusions, assign a product winner, update source weights, or learn from feedback without human approval.

This is an architectural hypothesis informed by scientific and regulatory material, **not** an externally validated classifier or legal opinion.

## A. Scientific grounding, with scope limits

1. **Value of Information (VoI):** Identifies whether additional information could reduce material decision uncertainty, and helps prioritise data collection. Adapted here as a qualitative gate, NOT a quantitative expected-value calculation: we have no empirical preference distributions, costs, or outcome-loss model. [Annual Review of Statistics and Its Application, Value of Information Analysis (2022)](https://doi.org/10.1146/annurev-statistics-040120-010730).
2. **Aspect-Based Sentiment Analysis (ABSA):** Extracting a specific aspect and opinion is preferable to treating an overall review star score as a universal quality measure. A 2024 systematic review of 727 papers documents substantial dataset/domain mismatch. Cross-category performance must be measured, not assumed. [Hua et al., Artificial Intelligence Review (2024)](https://doi.org/10.1007/s10462-024-10906-z).
3. **Self-selection bias:** People who purchase and review an item are not a random sample of prospective owners; intense positive and negative experiences may be overrepresented. No general-population prevalence or product-quality score can be inferred from raw review frequencies. [Hu, Pavlou & Zhang, MIS Quarterly (2017)](https://aisel.aisnet.org/misq/vol41/iss2/8/).
4. **Factual consistency / hallucinations:** LLM-generated or AI-assisted summaries can misstate source content. Exact excerpt anchoring is a necessary traceability check but NOT enough: negation, sarcasm, conditional use, model identity and relevance still require human or separately validated checks. [Luo, Xie & Ananiadou (2024)](https://doi.org/10.1016/j.eswa.2024.124456).
5. **UK consumer reviews law (in force April 2025):** The DMCC Act Schedule 20 paragraph 13 addresses fake or concealed-incentivised reviews, misleading presentation of consumer review *information derived from reviews*, and reasonable/proportionate preventative steps. [Legislation](https://www.legislation.gov.uk/ukpga/2024/13/schedule/20/paragraph/13); [CMA guidance](https://www.gov.uk/government/publications/fake-reviews); [CMA guidance for review websites](https://www.gov.uk/government/publications/reviews-guidance-for-online-review-sites). This remains relevant even if we display only AI-derived conclusions rather than the source text.
6. **Amazon:** UK Associates conditions restrict display/use of Amazon customer reviews and their star ratings unless obtained through permitted APIs under the applicable licence. We continue the stricter launch architecture: **NO Amazon reviews in this engine**; Amazon only appears at the purchase-link stage. [Official UK policy](https://affiliate-program.amazon.co.uk/help/operating/policies/).
7. **Personal-data precautions:** User reviews may include identifiable details or special-category information. UK ICO guidance on Article 6/Article 9 legal bases, data minimisation, and AI fairness must be reviewed before ingesting personal data or involving any remote AI processor. [ICO special-category guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-rules-on-special-category-data/); [ICO AI fairness](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/).

## B. What triggers additional user-review research

The system records a precise product/variant, a user task, a real use context, professional-evidence coverage, and *why* the unresolved question could affect the decision (explicit user request, mandatory constraint or documented robustness failure).

- **No search:** professional evidence adequately answers the specific question.
- **Clarify first:** the user's context or intended task is insufficiently specified.
- **Professional test or authoritative spec needed:** compatibility or controlled performance remains unverified; anecdotal user opinions are not a substitute.
- **Not material:** no documented reason that the new research would change a decision.
- **Rights blocked:** a potentially material lived-experience gap exists, but we have no currently documented permission for automated commercial collection and AI processing of a relevant non-Amazon source.
- **Research candidate:** a material, unresolved *experiential* question has a source with a recorded, scoped grant. This is permission to develop a quarantined candidate study, not to publish derived results or alter rankings.

A true *numerical* VoI score is NOT calculated because probability models, research costs, user utilities and decision-loss functions have not been measured.

## C. The optional AI workflow

`unresolved need -> permission gate -> targeted acquisition by future authorised connector -> excerpt-anchored candidate AI extraction -> deterministic source-match checks -> independent context/authenticity/legal review -> future controlled study -> reviewed evidence`.

Candidate schema: exact review and variant IDs, criterion, use context, polarity/type, source substring and source URL. Matching an excerpt provides only syntactic traceability. It does not prove that the author actually used the product, that the anecdote is representative, or that a third-party AI processor may receive the text. **The current code performs no live acquisition and no LLM inference.** It does not publish or promote any of these candidate observations to the main ranking.

## D. Growth without uncontrolled self-modification

Every new requirement discovered by users/research can become a proposal in a **human-reviewed research backlog**. A proposal must link to a specific unresolved real decision. The engine must not alter weights, criteria, data licences or published conclusions from user feedback alone. For future advancement require: operational definition, allowed source, independent annotations, held-out error evaluation by category, documented failure analysis, versioned release and rollback. Avoid over-representing highly vocal reviewers. Interpret long-term use, region, disability-related needs and firmware revisions only when legally and ethically justified.

## E. Validation before activation

- Rights: signed/scoped permissions and documented access for each specific review corpus and AI-processing technique, including remote transfers when applicable. Rights evidence cannot be verified merely by a boolean in data.
- Data: exact variants and contexts, duplicate/syndicated reviews, possible incentives, privacy, removal/withdrawals, dates, provenance and source changes.
- AI: independently annotated extraction gold set; precision/recall/error breakdown by aspect, product category, negation, context, language and incentives; error rate on source anchoring and hallucinated claims; no invented pass threshold. Document actual base rates and sample coverage.
- Decision: expert and user studies assessing whether supplementary experiences resolve the *original question* and meaningfully improve decisions over professional evidence alone, rather than merely increasing text volume.
- Publication: CMA compliance, transparent distinction between anecdote and controlled result, legal review, no unsubstantiated prevalence, legal and editorial human approval.

## F. Current implementation

`src/selective_user_evidence.ts`:
- `decideSelectiveUserReviewResearch` — evidence-need and rights gates, optional local AI research *plan only*;
- `auditAiCandidate` — deterministic excerpt/variant/criterion/source checks with permanent research quarantine;
- `proposeTaxonomyResearch` — versioned, human-approved proposals linked to unresolved cases; no automatic changes to ranking.

This file is not exported from `src/launch/index.ts`; the main ranking and purchase resolver are unchanged. All tests use **synthetic** review texts and grants; no legal permission is claimed, no outside model called, no reviews scraped, no ranking benefit measured.

## G. Next empirical work

Start with 10–20 user questions on a single category, independently labelled for materiality, missing professional evidence, appropriate evidence type and search decision; do not claim the sample is representative. Obtain a genuinely licensed corpus, evaluate the AI candidate extraction blinded against expert annotations, and only then test whether it can produce reliable contextual insights. If a source is unavailable or not licensed, skip it rather than quietly reverting to scraping or Amazon user reviews.
