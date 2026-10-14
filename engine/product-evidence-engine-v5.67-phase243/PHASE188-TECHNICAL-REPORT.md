# Product Evidence Engine — Phase 188 technical report

**Date:** 12 October 2026  
**Canonical input:** PEE v5.11 / Phase187 (`product-evidence-engine-v5.11-phase187.zip`)  
**Proposed output:** PEE v5.12 / Phase188

## Engineering result

Implemented a bounded, original TypeScript **argument/provenance audit** reusing the signed field-level Phase187 decision. The new module does not make or amend a product ranking. It records what exactly a claim is about, which reviewed source observations or separately reviewed professional qualitative observations support or challenge it, which editorial statements derive from earlier statements, and where expert review is still required.

### Hard gates

1. The field catalogue must pass the existing Phase187 signature, market, category, technical field, profile and validity-date gate.
2. The argument ledger is separately signed by an externally pinned reviewer key; its review must postdate the corresponding field knowledge and match the exact field catalogue revision.
3. A measurement or registered specification argument must bind to an identical exact-variant observation ID, original SHA-256, row locator, source URL, measurement unit and protocol version in the signed field catalogue.
4. Its stated stance must agree with the signed field threshold or exact certified claim (a 110 CFM result cannot be described as satisfying a 150 CFM requirement).
5. A separately reviewed structured observation from an expert does not masquerade as a numerical test. An editorial interpretation requires an acyclic derivation link to a premise from the same original experiment/source family.
6. Repeated copy/summary nodes of an experiment remain in one provenance group. Group identity ambiguities, duplicate physical origins across unrelated groups, protocol conflicts and tampering fail closed.
7. A measurement cannot be used as proof of unrelated benefits, safety, reliability or overall product quality. The Phase187 field verdict is returned unchanged.

### Reasoning results

For each authored, reviewed atomic field claim, the audit offers `limited_field_support`, `field_inadequate`, `contested`, `provisional` or `undetermined`. Supporting/challenging group lists are informational; **source group counts are diagnostics, not votes, certainty scores or weights**. Arguments contradicting each other cause a research gap, not an averaged percentage. A result is explicitly limited to the reviewed criterion.

The prototype's methodological inspiration was the actual source-code audit of user-supplied Carneades 4, Scikit-Criteria, ASReview and pgmpy. No library was copied or installed. Two methodological sources online are GRADE-CERQual (https://www.cerqual.org/overall-confidence-in-the-evidence/) and W3C PROV-O (https://www.w3.org/TR/prov-o/). These are *inspirations*, not validations of PEE quality. See the companion original-source audit for exact files, licenses and omissions.

### What is not complete

- No real professional claims were independently annotated or reviewed for this phase; every test is synthetic.
- Actual source rights, exact real-world retail variant mapping and reviewer independence are **not proved by an Ed25519 signature**.
- No trained inference, web crawler, review screening, Bayesian probability, MCDA rank recalculation, scientific trust percentages or new server dependencies.
- No exposure of these argument summaries on the live website, and no automatic knowledge-admission gate; existing Phase181 and Phase187 authorizations remain in control.
- The static ledger uses reviewer-declared source/experiment groupings; these declarations need actual source inspection to be reliable. The current prototype can detect inconsistencies, not determine true independence on its own.
- The result demonstrates code handling of adversarial fixtures, not scientifically superior purchase decisions. Real-world blind paired evaluation and source-availability checks are prerequisites.

## Files

`src/phase188_evidence_argument_audit.ts`, `tests/phase188_evidence_argument_audit.test.ts`, `docs/phase188/README.md`, `evaluation/phase188/TEST-MATRIX.md`, source audit and repo integrity manifest from the user-provided ZIPs, plus the cumulative older files and a future SHA-256 manifest.

## Proposed next steps

Phase189: blind paired comparison on 2–3 real product families and genuine expert documents allowed for analysis, control documentation of source rights; quantify unsupported extrapolations, double-counting, improper exact-variant references, conflict/abstention correctness and decision latency. Investigate the Phase187 constraint that all field observations with the same dimension but different methods are held—valuable safety gate but potentially over-conservative; change only after test-protocol translation research and independent review. Preserve separate handling of Phase181 signed dynamic ranking, Phase185 registry facts and Phase186 AC feasibility.

## Regression and packaging verification

- **2,918 TypeScript tests** in **150 eligible test files**, 14 of 14 shards, zero failures; historic Phase91/92 suites excluded by the inherited admissibility policy.
- **212 Python tests** across six inherited groups, zero failures; 70 historic SQLite resource-warning lines (not failing tests).
- **36 Phase188 targeted adversarial tests**, fictional signed catalogs and ephemeral reviewer key; source credibility never claimed.
- Regression JSON: `evaluation/phase188/regression-ts.json` and `regression-python.json`.
- The full cumulative ZIP is regenerated from the original v5.11 file list preserving every older file except intentionally updated `package.json`, with an independent file-wise byte comparison and clean-extraction check.
