# Phase 64 — Original Test Methodology, Risk of Bias & Applicability

**Research date:** 10 October 2026  
**Scope:** Product Evidence Engine — *method appraisal* after phase 63 original-test lineage validation. UK-first. Synthetic research data only. **No legal approval, accredited lab or validated consumer ranking is asserted.**

## Executive decision

**Reject universal source weighting.** A professional lab or review publication is not inherently reliable for every criterion; a published test is not necessarily applicable to every user's task. Appraise an *original measurement*, its *method*, and the *use-case context* separately. Importantly, "method not described" is not proof of a defective test. Report documented concerns, missing documentation, and mismatched conditions separately. **Never convert this qualitative appraisal into an invented numeric confidence percentage, arbitrary 1–10 credibility score or automatic winner.**

## First-party scientific references and what they actually support

1. **ISO/IEC 17025:2017** — laboratory competence, impartiality and consistent operation. It does **not** imply that an online consumer reviewer is accredited or that a single commercial article fulfills ISO/IEC 17025. Official ISO abstract: https://www.iso.org/standard/66912.html
2. **ISO 5725-2:2025** — repeatability/reproducibility of measurement methods via designed inter-laboratory experiments, for appropriate continuous measurands and specified assumptions. Version 2025 is current, superseding the 2019 edition. Our field `repeatability_information` means *documentation found/not found*, not a computed repeatability standard deviation. https://www.iso.org/standard/90054.html
3. **NIST Technical Note 1297, Appendix D** — repeatability holds under the same specified measurement conditions; reproducibility varies some conditions and needs the differences identified. This justifies storing exact setup/protocol/versions without inventing cross-protocol equivalence. https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-d1-terminology
4. **Cochrane Handbook, Chapter 14** — risk of bias, inconsistency, indirectness, imprecision and publication bias are distinct considerations when assessing a body of evidence. **GRADE is developed for healthcare studies, not calibrated for consumer product testing.** Adapting the domains is a research hypothesis. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14
5. **RTINGS — Test benches & scoring** — the test bench specifies measurements, setup and scoring systems. Protocol versions matter for comparability. This is evidence of an actual product-testing workflow, not evidence of data-reuse rights for our engine. https://www.rtings.com/company/test-benches-and-scoring-system
6. **RTINGS — How We Test Monitors (updated 17 March 2026)** — lab-controlled test benches, purchased units and changes requiring re-tests; some results across different bench versions are not comparable. https://www.rtings.com/monitor/learn/how-we-test
7. **RTINGS — Editorial independence** — discloses product sourcing and an editorial/commercial separation. Treat the disclosure as a source claim to evaluate, **not external certification** of impartiality. https://www.rtings.com/company/how-we-make-money
8. **NIST — Evaluating Inter-Laboratory Comparison Data (2022)** — even standard normalized-error criteria can appear permissive if uncertainty components are large. This is one reason the presence of an "uncertainty value" alone does not prove valid comparison. https://www.nist.gov/publications/evaluating-inter-laboratory-comparison-data

## Six **provisional engineering** documentation questions (NOT a canonical ISO checklist)

| Review domain | Specific question | Why it matters | What `not_reported` means |
| --- | --- | --- | --- |
| sample_selection | Was the tested unit/sample selection explained? Could units be chosen strategically? | Selection can influence how representative an observation is | No sufficient documentation retrieved; **not** a proven biased sample |
| protocol_documentation | Is the exact protocol, software/test-bench version and setup described? | Repeatability and comparisons depend on method | No documented protocol detail; **not** automatically an invalid test |
| instrument_qualification | Were the measuring tools, their suitability and where appropriate calibration/verification described? | Instrument effects may change the value | No instrument evidence available; **not** proof of non-calibration |
| repeatability_information | Were repeated observations, number of units or variability reported? | A single value does not provide a variance estimate | Repeatability unknown; do **not** infer variability or statistical significance |
| conflicts_of_interest | Were review funding, sample supply and commercial influences documented? | Possible source of bias; disclosure is not a binary quality score | No disclosure found; not evidence of paid influence or its absence |
| data_completeness | Can we see the measured outcome, units, conditions, missing fields and limits? | Avoid cherry-picking and misleading generalization | Underlying evidence incomplete for audit; not proof of cherry-picking |

Requiring all six entries in **our own data structure** is an auditable software design decision, not a requirement from ISO 17025, ISO 5725 or Cochrane. For each domain, the input is `documented`, `not_reported`, `documented_concern` or `not_applicable` (latter requires specific rationale and link). These are *human-supplied documentary labels*, **not observations independently authenticated by the code**. A fully documented review has state `documented_without_recorded_concern`, not "trusted"/"high quality".

## Separate axes — do not hide this distinction

1. **Originality & lineage:** phase 63 determines if measurement ID belongs to documented original execution rather than syndication. NOT legal, statistical or scientific verification.
2. **Methods & possible bias:** phase 64 records what was actually documented, where, and limitations. It cannot detect unreported procedures, fabrications or misconduct.
3. **Applicability:** phase 64 requires exact match to a human-specified criterion, exact variant, protocol/version, measurement unit and full context conditions. Different conditions are returned as `different_context` and never silently converted to use-case success.
4. **Uncertainty and replication:** phase 58 handles source-reported expanded uncertainty when present; ISO 5725 cautions against presuming reproducibility without suitable repetitions/design. Phase 64 does not invent missing error distributions.
5. **Between-source variation:** distinct measured values under matched procedures are descriptive, **not by themselves conflicting estimates or evidence of statistical heterogeneity**.
6. **Availability/publication bias:** no module can demonstrate complete coverage of all sources or quantify missing results without a defined sampling frame. The audit discloses that blind spot.
7. **Copyright and rights:** a reviewer marking an input as "documented" does not provide commercial re-use rights; separate actual rights review remains mandatory.
8. **User context:** matches refer to research mappings, not confirmed effectiveness in real-world use or a causal benefit.

## Hypothetical example (not real measurements)

Two reviews of an ANC headset each give battery runtime in hours. One uses ANC-on with fixed volume, one ANC-off. A user needs the device for ANC-on travel. A naive aggregate might average 22 h and 20 h into 21 h; the Phase 64 method instead reports that only the ANC-on test has **matching context**, and that the detailed repeatability information is **not reported**. It will not claim the ANC-on number is true for every user, that one test is independent confirmation of the other, or that the device is the best for travel.

## What has actually been implemented

- `src/evidence_appraisal.ts`: research-only, six-domain documentary appraisal for each original measure, exact-context mapping, fingerprint replay protection, lineage prerequisite, differentiated blocking reasons, deterministic output with **null** numeric confidence and no winner or ranking.
- `tests/evidence_appraisal.test.ts`: tests for missing reviews, described concerns, incompatible conditions/versions, source edits, lineage quarantine, questionable metadata and no invented certainty.
- `examples/evidence-appraisal-demo.ts`: **fully fictional** demonstration to illustrate metadata and differences.
- Public launcher remains isolated. Module is **not** exported from `src/launch/index.ts`.

## Not yet established

- No licensed RTINGS/Notebookcheck feed or third-party real test data in this phase.
- No external expert has applied and independently validated the six-domain checklist.
- No signed rights grant, independent sampling audit, confirmed laboratory accreditation, or actual user testing.
- No empirical calibrated estimates of how method limitations should affect a product's personalized ranking.
- No verified causal link from a lab criterion to satisfaction of a user's concrete task.

## Required next empirical gate

Select an appropriately licensed first-party dataset (not just a demo), have **two domain reviewers independently assess** a small sample with explicit source citations, reconcile disagreements, check external validity in a recorded use-case, and compare the application's flags against expert adjudications. Report missing evidence separately from confirmed issues. Until that is done, **keep `rankingEligible=false` and the module out of the public bundle.**
