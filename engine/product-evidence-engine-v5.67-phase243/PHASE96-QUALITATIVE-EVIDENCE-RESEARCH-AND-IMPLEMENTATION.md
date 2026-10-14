# Product Evidence Engine — Phase 96
## Qualitative professional-review evidence as a first-class decision input

**Date:** 11 October 2026  
**Release:** cumulative source tree v4.20.0, extending v4.19 phase 95.  
**Status:** implemented research-only TypeScript acquisition + context-sensitive adjudication model; **not validated on a representative live review corpus**, and not yet part of the production recommendation decision function.

## Executive finding

An original professional product review is more than star ratings, laboratory numbers or feature lists. An author may report test observations, design limitations, unexpected interaction effects, trade-offs, conditional advantages and subjective experiences. Those observations can be central to matching products to **the person's task and usage context** even when no numerical result is given. But the source's observation, its basis, the editor's explanation and the engine's inference must remain separate.

The implemented module is `src/phase96_qualitative_review_evidence.ts` (with tests under `tests/phase96_qualitative_review_evidence.test.ts`). It:

1. Uses the actual Phase 68 planner and Phase 69 approved reader to access a transient permitted HTML page. No alternative crawler was introduced.
2. Accepts bounded qualitative proposals from an injectable **local** proposal function (a reviewed source-specific parser, human annotator or later a local language model). An injected proposer is not automatically trusted; it does not authorize the fetch or its own outputs.
3. Requires exact product model identity, an already reviewed criterion meaning, the original-test ID and source lineage attestation, source-passage anchoring, explicit circumstances and methodology/reference, and rejects third-party reported claims impersonating direct original testing.
4. Sends transient claims through Phase 69's existing source/check and evidence quarantine. It returns a concise source-attributed proposition and SHA-256 evidence anchors, not full review passages, raw HTML, monetary information or inferred numeric ratings.
5. Keeps source origin, finding type, a separate contextual implication and method/semantic review state. Missing or unreviewed information is **unknown**, never a negative product score.
6. Matches findings to a user criterion only when all documented use-context qualifiers apply. Non-matching contexts cannot be generalized by default.
7. Supports reviewed **descriptive** findings with a decision-relevant implication, even if they have no positive/negative sentiment word. A potential violation of an *explicit* essential user requirement can trigger `hold_for_review`; this is **not** a validated automatic product rejection or an algorithmic winner.
8. Exposes contradictory original-test findings for methodological reconciliation; no vote-counting of review paragraphs or averages across test methods.

### Evidence type vs decision outcome

| Source content | Proposed meaning | Engine treatment |
|---|---|---|
| Original test measurement | Observed physical quantity with protocol | Keep existing Phase95 numeric channel; preserve units, conditions and method |
| Reviewer tested a capability, no number | Descriptive capability or limitation | Source-anchor + verified criterion implication, context, method; may be decision-relevant |
| Reviewer directly experienced comfort/handling | Context-dependent professional observation | Qualitative observation; individual variation and limits explicitly retained |
| Reviewer infers why something happens | Editorial interpretation | Distinct `editorial_inference`, not an observed mechanism; semantic/method review required |
| Reviewer repeats what marketing materials say | Reported claim | Rejected from the original-professional-test qualitative evidence path |
| Editorial star rating or overall verdict | Summary/editorial score | Cannot substitute criterion-specific observation; not introduced as numeric evidence |
| Absent discussion | Unknown evidence coverage | Not treated as evidence that the feature is bad |

### Worked synthetic demonstration (not a real review quotation)

> A tester reports increasing headband pressure during long sessions. The user says discomfort during eight-hour listening is unacceptable.

If original source text, method and exact product are independently verified, the user context matches, and the reviewed criterion implication is adverse, the engine returns **`potential_essential_constraint_conflict`** / **`hold_for_review`**. If the test was conducted for short sessions or on an inapplicable fit, the statement is not simply generalized. A second contradictory original test prompts **`conflicting_evidence`**, not a majority vote. No number is invented for the comfort of either product.

This is a conservative *proposed decision policy* requiring independent evaluation. It is not an empirical rule established by GRADE-CERQual or ISO.

## Research basis and transfer limits

1. **Cochrane Handbook chapter 21 (qualitative evidence synthesis)**: describes thematic and mixed-method syntheses and use of qualitative findings for context, participants' experiences and decision-making; recommends GRADE-CERQual for confidence in synthesized qualitative findings. **Transfer limit:** consumer tester opinions are not themselves the kind of primary qualitative study for which GRADE-CERQual confidence categories were validated. Use its *questions* as an audit checklist, not certified confidence scores. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-21
2. **Lewin et al., GRADE-CERQual (2015) and WHO explanation (2018)**: methodological limitations, coherence, adequacy, relevance. The engine documents corresponding dimensions; it does not calculate an evidence-quality number or claim GRADE-certified product reviews. https://doi.org/10.1371/journal.pmed.1001895 ; https://www.who.int/news/item/18-01-2018-new-series-published-to-support-the-use-of-qualitative-research-in-decision-making
3. **Cochrane chapter 12, synthesis without meta-analysis**: explicit assumptions/methods and cautious interpretation; simple voting/unsupported aggregation can mislead. We do not turn two mentions by one author into two independent tests or merge incompatible contexts into a single superiority claim. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-12
4. **Thomas & Harden (2008), thematic synthesis**: separates source-close descriptive coding from later analytic interpretations. This motivates distinguishing what the tester observed, the original author's explanation and the engine's derived implication for a particular user. https://doi.org/10.1186/1471-2288-8-45
5. **Hua et al. (2024), systematic review of Aspect-Based Sentiment Analysis**: 727 studies and significant dataset/domain diversity limitations. Extract and evaluate aspect-specific opinions rather than overall polarity; do not assume a method trained for one product family generalizes to all categories. https://doi.org/10.1007/s10462-024-10906-z
6. **Cai, Xia & Yu (2021), implicit aspect/opinion quadruples**: demonstrates that implicit product opinions require an aspect-sensitive representation; a sentiment alone does not identify product suitability. https://aclanthology.org/2021.acl-long.29/
7. **Lawrence & Reed, Argument Mining: A Survey (2019/2020)**: distinguishes an asserted conclusion from premises and support; opinion extraction alone cannot determine whether a reviewer's reasoning is supported. This motivates a separate methodology reference and semantic-faithfulness check. https://doi.org/10.1162/coli_a_00364
8. **ISO 9241-11:2018 (via NIST terminology)**: product usability depends on specified users, goals and use context, rather than a universal rank. https://csrc.nist.gov/glossary/term/usability

**No publication here claims that the above research validates numerical scoring weights, an automatic winner, quality inference from prose without checking methods, or a measured performance lift for our engine.**

## Source-integrity and review model

Quarantined observations retain a **newly worded proposition** and: original test ID; exact product and criterion IDs; polarity or descriptive status; observation vs inference; documented usage conditions; method identifier; source URL; source-document hash and source-passage hash; non-score flags.

A separate review receipt is required for contextual synthesis. It records independently checked semantic faithfulness to the original source, methodological concerns, adequacy and a reviewed impact on the criterion (`supports`, `concerns`, `tradeoff`, `undetermined`). This is an **attested research interface**, not a cryptographic identity/approval service; Phase92/93's actual signature and permission policy must govern any operational integration.

Only source-backed propositions with separately reviewed method and user-context fit enter the decision support analysis. Data marked uncertain is kept for review without influencing eligibility. Inconsistency is displayed; contextual differences are not automatically interpreted as contradictions. `hold_for_review` is explicitly research-only, not connected to published recommendation ranking.

## Test evidence and what remains unproven

- New Phase96 focused tests: **15/15 passed**, covering Phase69 access, context matching, descriptive limitations, negative essential constraints, conflicting original tests, duplicates, missing review, source-hash mismatch, comparative attribution and invented numerical-score refusal.
- Cumulative TypeScript/JavaScript suite: **666/666 passed**, individually executing five shards of 168, 149, 158, 165 and 26 tests. The one-process run timed out after two completed shards and is not called a completed check.
- Companion tests: **60/60 Python + 16/16 Node passed**.
- Primary sources: **47/47**, ingestion: **21/21**, Python evaluation: **26/26**, launch: **4/4**, release: **3/3** passed.
- Total completed separate-suite assertions reported by their runners: **843** (including 15 new tests), subject to possible overlap between project suites; not a corpus-level accuracy metric.

**Not yet verified:** autonomously proposing accurate qualitative claims with a local LLM, correctness on representative authentic review HTML, calibration of human contextual-implication assessments, independently authenticated reviewer identities, production cross-category QA, source processing permission, reproducible test-method metadata, disagreement adjudication by trained reviewers, runtime throughput or benefit to recommendations. HTML fixtures are constructed and access receipts simulated; no claim of live retrieval.

### Next empirical milestone

Prepare a blinded multi-category annotation corpus of original professional tests with source-level and passage-level model identity, condition qualifiers, observation vs inference, explicit vs implicit aspect, author/tester, supporting evidence and independent assessor judgments. Measure claim extraction precision/recall, wrong-model attribution, unsupported semantic implications, contextual false matches, missed critical adverse statements, and false constraint holds. Compare a category-specific deterministic extractor, a local-model proposer and a hybrid with the same held-out cases. The LLM remains a **proposal** engine, never its own verifier or reviewer, and reusable approved procedures remain the objective.

Do not change independent ranking, retirement detection, manufacturer declaration separation, user evidence restrictions, or commerce-link placement merely to incorporate these findings.
