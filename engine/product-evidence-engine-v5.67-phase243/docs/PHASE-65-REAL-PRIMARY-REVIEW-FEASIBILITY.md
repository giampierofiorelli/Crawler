# Phase 65 — Real original professional reviews: auditable miniature feasibility exercise
**Research date:** 10 October 2026  
**Status:** source-backed editorial feasibility, **NOT external expert validation**, not a licensed lab feed, not publishable recommendations.

## What changed from phase 64
Phase 64 only exercised fictional lab records. Phase 65 adds a **manually authored, limited first-party public-review case study** and a runnable audit, with exact source links. No third-party score tables, article text, charts, or raw measurements are ingested. The project does not assert that public visibility gives automated commercial reuse rights. To use provider data in the product itself, rights and technical access remain a separate question.

### Sources visited and evaluated individually
1. RTINGS, original lab comparison of **Sony WH-1000XM5 vs Bose QuietComfort Ultra Headphones Wireless (FIRST generation)**, methodology v2.3, comparison updated 2 July / 15 June 2026 (different product dates): https://www.rtings.com/headphones/tools/compare/sony-wh-1000xm5-wireless-bose-quietcomfort-ultra-headphones-wireless/33024/44629
2. SoundGuys, original editorial/lab comparison of these FIRST-generation models, article updated 16 October 2025: https://www.soundguys.com/bose-quietcomfort-ultra-headphones-vs-sony-wh-1000xm5-104454/

The project analyst's manual paraphrases are **not** independent expert judgments. Distinct publishers do not prove independent test executions or source rights. This is a convenience sample and cannot establish the general accuracy of the product.

### Selected qualitative source observations (paraphrased; no published numeric ratings copied)
- **Noise reduction:** RTINGS reports Bose modestly better in overall isolation; SoundGuys reports a modest edge to Bose in ANC. **Overall isolation vs ANC are not identical variables** and the methodologies/units were not harmonized. Their apparent agreement MUST NOT be used as two statistical replications of one lab outcome.
- **Comfort:** RTINGS expresses a relative comfort preference for Bose; SoundGuys says both are comfortable during long flights. These are context-dependent descriptions, **not controlled outcomes for glasses wearers over eight hours**.
- **Passive wired use:** RTINGS reports that Sony can play with power off when wired, whereas Bose requires power to use its wired option. This is informative for a specifically constrained user, **not evidence of better sound overall**.
- **Microphone in wind:** SoundGuys finds Sony somewhat preferable, but not a decisive advantage. No numerical practical-benefit threshold or uncertainty is available in our research intake.

All six source observations are in `research/phase65-public-source-case-study.json` and are labelled `reference_only_not_cleared`, `one_researcher_transcription_not_expert_adjudicated`, with no imported measurements and no application-facing use rights.

## Five user tasks used in the feasibility audit
| Task ID | Context | Finding from today's source coverage | Limit |
| --- | --- | --- | --- |
| `anc_train` | ANC on a train | ANC compared in broadly noisy conditions | No exact train protocol/conditions documented in the selected notes; do not extrapolate |
| `passive_audio` | Cable listening with power off | RTINGS reports the relevant technical difference | Requires external confirmation and use-context test before a commercial recommendation |
| `eight_hours_glasses` | Wearing glasses for eight hours | Comfort comments exist | Neither source observation precisely tests this combination |
| `wind_calls` | Windy calls outdoors | SoundGuys supplies a contextual editorial comparison | Practical difference and measurement uncertainty not determined |
| `anc_general` | General noisy environment | RTINGS addresses overall noise isolation | No permitted numeric laboratory measurements; cannot quantify functional improvement |

## Reproducible results
After `npm install`, run:
```
npm test
node scripts/phase65-evaluate.mjs > phase65-audit.json
npm run test:primary
npm run test:ingestion
npm run test:launch
npm run test:release
```
The output is **research-only, with commercial rights not cleared**, and always `publicationReady=false`, `rankingEligible=false`, no winner. Tests are executable and use synthetic adversarial scenarios; only the six article-referenced annotations point to genuine published material.

## Why this is NOT an external validation
There have been **zero independent domain reviewers**. No blind duplicate review, expert adjudication, independently proven data lineage, repeated instrument measurements, ground-truth functional success criteria, or user test. The included CSV is a **blank external-review template**, not completed evidence. Software cannot authenticate a person from an arbitrary `raterId`; any raw agreement on supplied entries is explicitly unverified and not a calibration score.

## Minimum external study design, before declaring empirical validation
1. Pre-register a small, category-specific use-case rubric: functional criterion, exact variant, context, essential vs negotiable constraint, evidence required and abstention reason. Include challenging examples where both products may be acceptable.
2. Obtain lawful source access; recruit **two truly independent people with appropriate category/methodological expertise** to review source articles **without seeing each other's judgments or the algorithm's output**. Keep identity, consent and signed protocol outside the software fixtures.
3. Capture judgments of **source-to-task relevance** and **sufficiency of supporting evidence**; assess agreement by task and disagreement categories. If there are enough ratings and an appropriate design, choose agreement metrics (e.g., Cohen's kappa) suitable for the labels and their prevalence; do not set success cutoffs arbitrarily.
4. Reconcile ambiguous test protocols, model revisions and contradictory descriptions with experts; store references but only ingest/reuse source material under permitted rights.
5. Separately validate actual **choice quality** with user task-outcomes or suitable ground-truth performance data; high agreement with experts on extraction is *not* proof the final recommendations serve users.
6. Publish a transparent sampling frame, exclusions, uncertain cases and sensitivity analyses. Until then this remains a demonstrated research process, not a validated recommendation engine.

### Methodological references and their applicability
- ISO 5725-2:2025 discusses designed experiments to estimate repeatability/reproducibility in interlaboratory measurement: https://www.iso.org/standard/90054.html — not proof of such statistics in two consumer-review webpages.
- COSMIN research on **relevance, comprehensiveness and comprehensibility** of measured constructs (developed in healthcare) provides a useful, explicitly *adapted* framework for reviewing whether observations cover user tasks: https://pubmed.ncbi.nlm.nih.gov/40562250/ — not a validated commercial-product rubric.
- The exact primary review sources above are the substantive article evidence. Avoid inferring a cross-publisher calibrated scale or identical protocols from similarly worded verdicts.

## Keep the original business contract
- Product needs and independent testing first; technical specifications are explicitly distinguished from independent measurements and editorial judgments; product marketing excluded.
- No Amazon/merchant signals in the ranking; no prices or purchase-timing intelligence. Links to retailers only after ranking when rights and approval gates permit.
- No public recommendations derived from this phase. `dist-launch` remains the isolated research demonstration.

## Decision
**PARTIAL RESEARCH ADVANCE ONLY.** Real professional sources were examined and a repeatable feasibility audit was implemented. The empirical validation gate from Phase 64 **remains open**: obtain authorized evidence and blinded external reviewers, then test decision outcomes. Do not make up expert agreements or claim that a linked article grants reuse rights.
