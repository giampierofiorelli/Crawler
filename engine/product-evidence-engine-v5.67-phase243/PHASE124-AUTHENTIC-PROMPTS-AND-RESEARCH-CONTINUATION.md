# Product Evidence Engine — Phase 124: authentic-question failure audit and first in-house research continuation

**Date:** 11 October 2026  
**Starting code:** cumulative v4.47 / Phase123  
**New version:** v4.48 / Phase124  
**Status:** controlled experimental implementation. **NOT** end-to-end autonomous consumer research, open-domain NLP or a validated ranking engine.

## Executive findings

The real obstacle is **not another missing product feature rule**: it is the incomplete transition from real human language into an independently established goal, original-source discovery and source-grounded comparable product measures. Phase123 used an author-created diagnostic. Phase124 freezes **12 exact excerpts from 9 authentic Reddit discussion threads** that precede this development. Every excerpt is linked to its public discussion in `research/phase124_authentic_questions.json`. Labels were assigned manually by the developer, **not by an independent panel**; some prompts depend on earlier discussion context. This is an external-user-language diagnostic, **not a statistically representative, blind, independent, validated benchmark**.

**Observed baseline, using the unchanged Phase123 model:** 2/12 correctly accepted according to author labels, 0/12 wrongly accepted, 10/12 deferred or reviewed. This is **16.7% coverage with 100% precision among only two accepted cases in this tiny nonrepresentative sample**, not proof of general reliability. No attempted research with an empty evidence corpus produced a ranking. All 12 were blocked from ranking, correctly given zero original measurements.

A particularly important failure remains: `Which one would you choose?` cannot be understood properly without the preceding candidate list; a floor-robot category context alone is not enough. The baseline also fails to recognize some straightforward autonomy phrasings and personalized requests. None of these problems is disguised by modifying the benchmark prompts or hardcoding their vocabulary into the classifier.

## What was actually implemented

### 1. Native question → plans → local candidate evidence → action trace

`src/phase124_end_to_end_attempt.ts` exports `attemptResearch124` and `auditAttribution124`.

- Runs the existing Phase123 learned proposal on untouched user wording and the narrow older Phase122 interpreter.
- **Corrects a handoff problem:** when the experimental learner abstains but Phase122 has a bounded, non-negated hypothesis, the Phase122 research obligations remain usable as *unconfirmed research leads*. For instance, an autonomy question does not lose the need for measured unattended completion and human maintenance minutes.
- Routes unambiguous research hypotheses into the existing in-house BM25 local index; incorporates sparse legacy retrieval candidates without granting the old parser authority to certify meaning.
- Gives a deterministic machine-readable trace with unresolved obligations, search query count, source candidate IDs, next action, and source-assurance status.
- Distinguishes semantic review, rights-aware new-source acquisition, local candidate discovery and invalidated constraints. No speculative winning product.
- Leaves `publicRankingAuthorized=false`, `sourceFactsVerified=false`, `originalSourceAuthenticated=false` and `measurementComparabilityVerified=false` in **every** output. Finding a lexical match cannot elevate a product claim or measurement.

### 2. Exact product/source attribution integrity check

`auditAttribution124` checks **product ID, passage content SHA-256, passage ID, asserted source identity, URL, duplicate editorial anchors and rights-review flag**. These checks directly address the Phase118 adversarial example in which a source discussing eufy could be attached to Roborock. It quarantines wrong-product, duplicate or altered records. 

This is **internal integrity, not cryptographic proof of the original publisher's authorship**: the curated registry can itself be wrong or fabricated, so external verification and a reviewed original test are still required before a measurement is accepted. Even a perfect digest match never authorizes a public ranking. `research/phase124_editorial_passages.json` contains three **project-authored paraphrase notes** with URLs linked to Phase118 real-source research. They are not cached original articles, new original product tests or fresh source acquisitions.

### 3. Connection to existing first-party source discovery, without external service

`src/phase124_authorized_discovery.ts` reuses `discoverFromApprovedSitemap` (Phase75) and the existing restricted first-party HTTPS transport. With a reviewed source-policy object, it can fetch robots.txt and an authorised publisher sitemap and collect **candidate URLs only**. If there is no reviewed permission record, it blocks. Tests use an **artificial policy and mocked network response**, not a real licence or new live sitemap crawl. No real web discovery, article retrieval or automatic original-source extraction was executed by the Phase124 evaluation.

This is not a search API. An approved sitemap is source-scoped and inherently incomplete: it cannot prove comprehensive market coverage, find all independent professional testers or identify which pages contain valid measurements. Existing Phase68–93 acquisition and rights gates must be connected and validated to get beyond candidate URLs.

### 4. External user-language diagnostic and evaluation harness

`research/phase124_authentic_questions.json` freezes original user phrasing, category notes and source links. `scripts/evaluate-phase124.mjs` reruns the unmodified Phase123 model, its calibration split and the new source-empty attempt for all 12 questions. Output: `PHASE124-AUTHENTIC-PROMPT-BASELINE.json`. Inputs were collected before writing the Phase124 code and were **not inserted into Phase123 training**, but the developer did read the labels and failures; this diagnostic is **not blind**. Nine source threads are not twelve independent users.

Partial excerpt provenance includes:
- Low-maintenance / set-and-forget: https://www.reddit.com/r/RobotVacuums/comments/1s9mi5l/what_is_the_most_maintenancefree_robot_vacuum_in/
- Value for money and household context: https://www.reddit.com/r/RobotVacuums/comments/1uau897/best_robot_vacuum_brand_offers_the_best_value_for/
- Strict no-mop requirement, cats and carpeting: https://www.reddit.com/r/RobotVacuums/comments/1rdytw4/best_option_for_pets_and_lots_of_carpet/
- Stair traversal: https://www.reddit.com/r/RobotVacuums/comments/1tod8v1/are_there_robot_vacuums_that_will_climb_stairs/
- Reference-dependent comparative follow-up: https://www.reddit.com/r/RobotVacuums/comments/1p432yp/best_option_under_1000/
- More original links in the frozen JSON.

### Measured cases

- Two intent labels accepted correctly in the author-labelled 12-case sample.
- Ten not accepted; zero accepted wrong in the sample, with very high abstention.
- No violations of explicit negative mopping constraints in the two included cases because the system deferred constraint interpretation.
- **No new external sources discovered live**, no article text extracted, no independent actual measurements assembled, **no autonomously computed product ranking**.
- Phase124 source-attestation unit fixtures are controlled synthetic records. The case notes are manually paraphrased observations from previously inspected publications.

## Expert methodological grounding

1. Ribeiro et al., *Beyond Accuracy: Behavioral Testing of NLP Models with CheckList*, ACL 2020: separate tests for paraphrases, negation, logical changes and other capabilities instead of average accuracy alone. https://aclanthology.org/2020.acl-main.442/
2. El-Yaniv and Wiener, *On the Foundations of Noise-free Selective Classification*, JMLR 2010: abstention is a risk–coverage decision; 100% conditional precision on tiny accepted coverage says very little about usefulness. https://www.jmlr.org/papers/v11/el-yaniv10a.html
3. NIST TREC 2024 Product Search Main track: a public benchmark for separate evaluation of search retrieval, distinct from final product-selection accuracy. https://trec.nist.gov/pubs/trec33/appendices/trec2024-product-main.html
4. Nandan Thakur et al., *BEIR*, 2021: heterogeneous out-of-domain retrieval tests and a credible BM25 baseline. https://arxiv.org/abs/2104.08663
5. Meta, *CRAG: Comprehensive RAG Benchmark*: independent assessment of factual correctness and missing answers, rather than scoring mere retrieval as success. https://github.com/facebookresearch/CRAG
6. Ian Soboroff, NIST, *Don't Use LLMs to Make Relevance Judgments*, 2025: evaluating retrieval and evidence sufficiency requires properly constructed human relevance judgments, not self-generated test truths. https://www.nist.gov/publications/dont-use-llms-make-relevance-judgments

These references justify the **method of evaluation**; they do not validate our classifier, benchmark or implementation by association.

## Proposed next empirical priorities (not completed here)

1. Independently recruited annotators produce blind multi-domain prompts with adjudicated **goal, task scope, constraints, anaphoric referents, missing context, decision action**. Keep test queries sealed until models/thresholds are frozen. Measure precision, recall, selective risk, coverage, false acceptance, abstention, multilingual parity and metamorphic ranking invariance.
2. Fix reference resolution and compositional intent. Do not use just one mutually exclusive intent label for mixed performance, value, autonomy and strict exclusions. Freeze a rich typed query object with what is known, unknown and explicitly negated.
3. Connect the in-house rights-aware acquisition components to a **genuine approved original-source site**, with real HTTP execution, reviewable receipts, exact model identity, source text attribution, extraction and anti-poisoning adversarial verification. No requirement for paid search/scraping APIs.
4. Compare the native-only parser with a replaceable **local open-weights language model** on the *same independent blind set* if native generalization remains poor. The LLM may propose meaning or extract claims; the in-house evidence gates and deterministic ranking retain all authority. Training a general LLM from scratch is a separate feasibility study, not assumed necessary.
5. Run actual market comparisons only when original professional measurements are sufficient under a reproducible category protocol, market/time snapshot and consistent language-independent rank contract.

## Boundaries

This phase provides a **concrete, tested research continuation** beyond isolated semantic prototypes, without buying cloud services. It still does **not** solve new-goal understanding, independent web-scale discovery, complete extraction or recommendation. Full legacy regression status is recorded separately. Evaluation cases must not be used to claim blind generalisation.
