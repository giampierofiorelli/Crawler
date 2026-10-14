# Product Evidence Engine — Phase 67
## Independent assessment protocol for selective user-experience research
**Date:** 10 October 2026  
**Status:** Research harness implemented and software-tested. **No human validation conducted. No licensed review corpus ingested.**

## Executive outcome
This phase advances the *original* Product Evidence Engine, not a price comparator or a marketing-specification engine. Professional independent tests and documented technical specifications remain the normal evidence inputs. User experiences are a potential targeted supplement **only if** a material task-specific information gap remains and acquisition/AI analysis is legally authorized.

We now have a software evaluation harness for asking whether the Phase 66 selective-research gate makes the **right kind of research decision**, rather than rewarding it for producing more searches or additional review text. We do not currently possess an independently labeled benchmark, a validated AI extraction model, real review-data rights, or a consumer-proven suitability ranking.

### Empirical status
- **16 constructed scenarios** for headphones and vacuum cleaners; they are *authored test cases*, **not observed user requests**, not a representative sample, and not professionally adjudicated.
- All six decision classes can be exercised: no search (adequate professional evidence); request clarification; obtain professional test; nonmaterial; rights blocked; selective candidate experience research.
- **Zero independent assessor judgments.** The evaluator returns `metrics: null`. No accuracy, precision, recall, confidence interval, or claim of expert agreement is made.
- A model-output prediction and a human-established reference label remain different entities in both data and reporting.

## Research-grounded design

1. **Additional information should be sought only if it may affect the decision.** The *value of information* depends on available choices, uncertainties and costs; in this project we use only a qualitative research trigger because outcome utilities, probabilities and costs are not measured. This is *not* an EVPI calculation. National Academies, *Environmental Decisions in the Face of Uncertainty*, chapter 5: https://www.ncbi.nlm.nih.gov/books/NBK200840/ ; see also a Decision Support Systems discussion of EVPI limits: https://doi.org/10.1016/j.dss.2018.03.003
2. **Search usefulness must be assessed against actual relevance judgments.** NIST TREC evaluations distinguish the question/topic, documents and independent relevance judgments; incomplete judgment pools limit what can be claimed about recall. We borrow the *evaluate against a reference* principle, not a claim that our software matches TREC's methodology: https://trec.nist.gov/data/reljudge_eng.html ; https://trec.nist.gov/pubs/trec33/papers/overview_33.pdf ; https://trec.nist.gov/pubs/trec30/papers/Overview-2021.pdf
3. **Human labeling must be reproducible and agreement measured.** Reliability of human content judgments is a distinct empirical question; Krippendorff cautions about misleading reliability statistics. We record two independently attributed labels and require recorded adjudication on disagreement; software **cannot verify** actual assessor identity, independence or blinding. K. Krippendorff (2004): https://doi.org/10.1111/j.1468-2958.2004.tb00738.x ; University of Pennsylvania resources: https://www.asc.upenn.edu/krippendorffs-alpha-reliability
4. **AI testing must consider validity and representativeness.** NIST AI RMF provides a voluntary framework for measuring and managing reliability, limitations and context. It does not certify our product: https://www.nist.gov/itl/ai-risk-management-framework ; https://airc.nist.gov/
5. **User-review derived information remains regulated in the UK.** The CMA cautions against misleading presentation, imbalanced selection, unverified authenticity and hidden incentives, even when publishing information derived from reviews. We neither acquire review text nor publish derived claims in Phase 67: https://www.gov.uk/government/publications/fake-reviews ; https://www.gov.uk/government/publications/reviews-guidance-for-online-review-sites/reviews-guidance-for-online-review-sites ; https://www.legislation.gov.uk/ukpga/2024/13/schedule/20/paragraph/13/2026-09-30

## Evidence model and non-negotiable constraints
- Technical specifications: only genuinely documented technical facts; label them clearly as declared; never ingest product-marketing rhetoric as evidence of achieved performance.
- Professional tests: independent, test-specific, variant-matched and method/context-appraised; do not mistake reviews quoting one original test for independent replication.
- User reviews: never an automatic replacement for measured performance or technical compatibility, nor a representative prevalence estimate. They may generate **context-specific candidate observations** requiring rights clearance, bias assessment and external validation.
- Amazon: no Amazon reviews, ratings, product content or API input to ranking/research. Retailer links and affiliates remain strictly downstream.
- No prices, historical prices, deal-monitoring or retailer commission in the launch ranking.
- No new criterion, ranking weight or product winner is generated by this evaluation harness.

## Phase 67 data contract
`src/selective_evaluation.ts` introduces:

- `EvaluationCase`: a use question, context, evidence gap, alleged rights documents and provenance (`constructed_scenario` or consented real user question), with `development` or `held_out` split.
- `createBlindAnnotationTemplate`: case information **without** the algorithm's decision (or benchmark split); shows source-document references for manual verification. Synthetic documents are placeholders and do not confer rights.
- `BlindAnnotation`: a recorded assessor decision, independent rationale and source references, with a self-reported blinded status.
- `Adjudication`: a third recorded assessor's resolution if the first two disagree. The code rejects adjudication by the original annotators.
- `evaluateSelectiveGate`: prediction-vs-reference table, error/confusion summary and per-class precision/recall *only* for cases with two matching assessments or independently recorded adjudication.

**Crucial limit:** the fields `assessorId`, `blindedToAlgorithm`, `approvedDocumentUrl` and `approvalRecorded` are **claims supplied to the program**. They do not verify human identity, blind review, copyright permission or real licensing. A real audit needs trustworthy identity management and preserved source/contract documents outside the code.

## Recommended empirical workflow (NOT yet completed)

1. Gather actual, consented and appropriately de-identified use questions from prospective users. Clearly distinguish them from our constructed scenarios. Select more than one category; document which are absent and why.
2. For each question, assemble a controlled evidence dossier showing the product variant, professional-test coverage, documented user requirements, actual accessible licensing information and uncertainties. Where no rights evidence exists, record that absence; never create a fictional permission record.
3. Lock the evaluation sample and freeze a version of the algorithm. Maintain a separate held-out set **untouched by tuning**. Our constructed cases do not count as a held-out *empirical* sample.
4. Give the same dossier to two domain-competent human assessors without the algorithm's decision. Require independent answers and documented rationales. If they disagree, record a third adjudication; preserve both original judgments.
5. Measure human-human label disagreement before drawing conclusions about software accuracy. If sample size and class coverage warrant it, calculate a justified inter-rater statistic (e.g., nominal Krippendorff alpha) using a verified statistical implementation. We **have not implemented or reported** alpha in this phase.
6. Run `evaluateSelectiveGate` on the locked set and inspect the *individual mistakes*, not merely overall accuracy. Prioritize false `no_search` decisions that overlook important gaps and false `candidate_research_only` decisions that would lead to unnecessary or unauthorized collection.
7. Report per-class confusion, counts and class coverage; never silently treat missing labels as correct/incorrect or nonexistent relevant sources as irrelevant. Report meaningful subgroup differences only with enough authentic observations.
8. Separately test whether searching licensed user experiences actually improves decisions compared with professional tests alone; do **not** infer that from search-gate classification accuracy.
9. Perform a legal/content review of the actual review source, access, storage, remote AI processor and possible derived claims before any ingestion. If access cannot be authorized, disable that source rather than scraping or switching to Amazon reviews.
10. Progressively improve the engine only through versioned, documented updates with human review, new held-out evaluation and rollback. No autonomous weight or taxonomy drift.

## Illustrative error matrix to examine once human reference exists

| Model answer | Human reference | Implication to inspect |
|---|---|---|
| `no_search_sufficient_professional_evidence` | `candidate_research_only` | Missed material lived-experience gap |
| `candidate_research_only` | `professional_test_required` | Anecdote incorrectly substitutes for controlled measurement |
| `candidate_research_only` | `rights_blocked` | Wrong or unverified source permission |
| `not_decision_material` | `clarify_user_need_first` | Premature dismissal rather than eliciting user context |
| `rights_blocked` | `candidate_research_only` | Unnecessarily denied access; verify dossier and contract |

These are *hypothetical error types*, not measured failures.

## How to run the delivered research artifacts

From the unpacked repository root:

```bash
npm test
npm run demo:phase67
npm run test:launch
npm run test:release
npm run test:primary
npm run test:ingestion
```

The demo writes `phase67-constructed-evaluation-output.json` and `phase67-blind-annotation-template.json` containing constructed cases only. `metrics` remains null. Annotation fields can later be populated **only** from actual independent assessment records; fabricated labels would invalidate the analysis.

## Real project status after Phase 67

**Implemented:** selective-evidence search gate, source-rights assertions gate, a quarantined candidate-extraction audit, a blinded reference-collection schema, evaluation metrics guarded by two genuine assessor records as represented in data, reproducible constructed software tests, price-free ranking isolation.

**NOT implemented or verified:** actual review API or paid corpus rights, actual user-experience data ingestion, live LLM inference, independent human annotations, expert agreement, empirical classification accuracy, significant improvement in user purchase decisions, real-product ranking validity, Amazon compliance certification, or public website launch.

**Go/no-go rule:** no user-review-powered ranking adjustment or derived review statement is deployed on the basis of this phase. The next evidence milestone is a properly sourced set of real questions and human judgments with auditable licenses.
