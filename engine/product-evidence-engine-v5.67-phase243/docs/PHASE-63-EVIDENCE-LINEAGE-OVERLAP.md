# Product Evidence Engine — Phase 63
## Original-test lineage, duplicate evidence, source dependence and methodological conflict
**Research date:** 10 October 2026.  **Status:** RESEARCH ONLY; no production recommendation; no rights validated.

### Executive decision
A review article is **not** an independent laboratory test. A test may be republished, syndicated, cited in newsletters, summarized by aggregators, and cited by another professional reviewer. None of those republications establish additional independent experiments. The correct unit of original comparative evidence must be defined at the level of the actual test execution and measured product variant. Retain all original source URLs and report URLs for traceability, but count original tests rather than displayed reviews.

**Scientific grounding — careful domain transfer:** Cochrane and PRISMA concern systematic reviews, principally health and other scholarly studies, not consumer review websites. Their principle of avoiding double-counting multiple reports of the *same investigation* is directly useful, but their clinical evidence certainty rubrics are **not automatically calibrated or validated** for headphones or vacuum cleaners.

### Direct source evidence and what it supports
1. **Cochrane Handbook, Chapter 4 — searching and selecting studies**, Section 4.6 / MECIR C42: collate multiple reports of one study; a study rather than each report must be the unit of interest; secondary reports may still add methodological details. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04
2. **Cochrane Handbook, Chapter 5 — collecting data**, Sections 5.2.1 and 5.5.4: different reports of a single investigation should be linked; different reports can also disagree and need an explicit reconciliation procedure. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-05
3. **PRISMA 2020**, BMJ n71 / n160: distinguishes records, reports and studies, including a study represented by multiple publications. https://www.bmj.com/content/372/bmj.n71.long and https://www.bmj.com/content/372/bmj.n160
4. **Cochrane Handbook, Chapter V — Overviews of Reviews**, Section V.4.7: track overlap of primary studies across multiple systematic reviews, using a citation matrix and (where relevant) corrected covered area. We do not invent such a statistic for our small consumer-test examples. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-v
5. **Cochrane Handbook, Chapter 14 / GRADE**: risk of bias, inconsistency, indirectness, imprecision and publication bias are distinct domains. They must not be collapsed into a made-up review-quality coefficient. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14

### Implemented research-only model (`src/evidence_lineage.ts`)
Inputs:
- Exact-variant original-laboratory measurements already held in a **quarantined** export.
- One editorial *attestation* per measurement: original-test ID, execution ID, fingerprint of the exact measurement, raw dataset SHA-256, primary/syndicated role, original test URL, reviewer reference and rights claim.
- Optional URLs of secondary publications explicitly related to an original-test ID.

Audit controls:
- Reject undocumented/ambiguous claimed origin or source-host mismatches.
- Changing numeric values, test protocol, units, variant or other reviewed fields invalidates a measurement fingerprint.
- Count the original documented test execution once, not every report.
- Prevent repeated identical observations from multiplying support.
- Quarantine numerical discrepancies **within one original test and one matching criterion/context** until a reviewer resolves them (not an average).
- Flag the same raw dataset reused across purportedly separate test IDs; do not automatically treat separate URLs as independent replications.
- Describe variation between different test executions with matching protocols as **observed variation**, without an inference of statistical disagreement or significance.
- Flag divergent protocols/conditions as **not directly comparable**, rather than as contradiction.
- Retain a trace of secondary reports, but never make them independent evidence contributions.
- Permit a filtered **research-only** derivative export; its SHA-256 is derived and differs from the original export hash. Audit-to-export fingerprint binding prevents replay against changed input.
- No user-facing product winner, numerical confidence, proof of independent publishers or public ranking.

### 12 articles ≠ 12 independent tests
Illustrative fictional example: two documented testing sessions produce two measurements, while ten syndicated articles refer to the first session. The result is **2 documented test executions and 10 related reports**, not 12 independent experiments. A third article repeating the same number under another title remains a derivative of the first, not an additional independent source.

### Why simple numerical agreement is insufficient
- Identical values in two articles may mean syndication, a shared source, coincidence, rounding, common use of manufacturer specifications or genuinely independent measurements.
- Distinct values across different conditions, versions or equipment do not prove contradiction; they may be measuring different targets.
- Different values *attributed to the same original tested quantity* require investigation. They may be rounding, corrections, different reporting or extraction errors. In this pilot, we conservatively quarantine rather than choosing a preferred report.
- Different laboratories testing different individual specimens of the same nominal model do not automatically measure the same unit's behaviour; sample-to-sample variation remains an open statistical problem.

### What remains deliberately unsupported
- The editor-status flag does not authenticate a person, the true source of the file, an API permission, or the underlying publisher's legal rights.
- A SHA-256 supplied in a fixture is a *claim* about a raw dataset: it proves nothing until verified against the actual downloaded original file.
- Two different original-test IDs and hashes are **not proof** of independence: the original hardware sample, instrumentation, calibrations, source funding and dataset may still be shared.
- Source quality/risk of bias, selection bias, systematic error, repeated measurements and confidence intervals require separate methodology, appropriately evidenced.
- Raw multi-trial measurements from one experiment require a documented trial-level design. The current conservative rule quarantines conflicting values for one same-measurand group rather than assuming which value is correct.
- The existing Phase 57 bridge accepts one original publisher domain at a time. Cross-laboratory integration needs explicit source-specific adapters and independent rights checks; Phase 63 is not a completed multi-laboratory connector.
- None of these methodological sources establishes legal rights to ingest professional review scores or publisher materials; contractual review remains separate.

### Scientific-to-technical traceability
| Published principle | Research implementation | What it does **not** prove |
|---|---|---|
| One study despite multiple reports (Cochrane Ch. 4/5) | Group by attested original execution ID | Real-world authenticity of the claimed identity |
| Report versus study (PRISMA) | Separate downstream URL records from original measurements | That every online review is a replica |
| Shared studies in multiple reviews (Cochrane Ch. V) | Shared data-hash detection across test IDs | Proven independence when hashes differ |
| Bias / inconsistency / indirectness are distinct (GRADE) | Flag unresolved identity, differing protocols and descriptive variation separately | GRADE evidence grade for consumer products |

### Honest remaining gates
1. Obtain and validate rights for actual original publisher data.
2. Verify lineage against original methods, hashes, original article URLs and correction histories by authenticated reviewers.
3. Document lab-study dependence beyond one record: shared raw datasets, common hardware specimen, identical trials, publisher syndication and test lineage.
4. Validate context/protocol comparability and per-criterion uncertainty.
5. Evaluate whether independent functional evidence is sufficient to change decisions for real users.
6. Only after those gates consider integrating this into the public recommendation path, subject to approval and deployment audit.

**Commercial separation remains absolute:** no Amazon data, other merchant data, price, manufacturer marketing or affiliate commission participates in the ranking.
