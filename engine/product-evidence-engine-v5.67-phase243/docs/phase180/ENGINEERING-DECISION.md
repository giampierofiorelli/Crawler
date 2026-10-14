# Phase 180: First-answer reviewed-ranking publication gate

Date: 2026-10-12. Canonical parent: v5.03 / Phase179.

## Implemented scope

`src/phase180_reviewed_first_answer.ts` connects a Phase177 **confirmed** category/criterion fingerprint to a **precomputed and independently signed** evidence-release envelope. The published view is deterministic and scoped to a configured market, category, confirmed criteria, reviewed policy version and evidence revision. Missing/ambiguous evidence and hard requirement failures remain visible but unranked; score ties share a rank. No source URL or untrusted client flag can grant publication authority; the publication verification keys must be configured on the trusted server outside the browser. Signed release evaluation uses Ed25519 verification from built-in Node.js crypto. The existing Phase178 server and English browser presentation consume the new answer projection only if a matching signed release exists. No extra runtime dependencies or third-party code were imported.

`phase180_reviewed_first_answer.test.ts` and `phase180_first_answer_http.test.ts` run **synthetic fake-product fixtures** only, signed with a test-generated key. They are not professional product evidence. Hard-gate `unknown` holds an item rather than excluding it. Numeric ranking applies only within a single signed comparable protocol for each criterion. External reviewers must supply and approve the policy elicitation receipt and source-level variant match *before* signing; the signature does not itself establish correctness or scientific validity.

## Existing PEE components reused

- Phase177 canonical confirmed-criteria fingerprints and versioned browser decisions.
- Phase178 actual local HTTP service and progressive English UI.
- Phase112 invariance contract, Phase97/98 hard veto / preference policy principles, and Phase169–171 source/protocol review rules (review requirements respected as external prerequisites, **not claimed to be wired in as an authorizing service**).
- Phase80/81 market discovery and Phase179 category research are upstream discovery mechanisms, **not source-admission evidence**.

## Deliberate limitations and gaps

1. The site still cannot produce a first-turn ranking for an unreviewed natural-language query. Phase177 returns unconfirmed NLP hypotheses, which must not silently become hard constraints. To achieve immediate first results safely, Phase181+ needs a validated goal→reviewed-frame matching layer, an explicit uncertainty threshold, user-visible provisional assumptions, and fallback to targeted clarification.
2. There are **no authentic, independently approved, signed product ranking releases** in the included project. The test-only signer private key is generated on the fly and never packaged. The production professional evidence review, scoring-policy calibration, independent signing service and trusted market-specific release registry are not implemented.
3. `ReviewedRelease180` does not claim complete web/market coverage; the released candidate set and excluded/held results are enumerated. A signer's assertion of professional status is not independently verified by this module. Do not treat a valid signature as a scientific endorsement.
4. A numeric ranking of products suitable for a given task is not the same as an outcome-level solution/bundle recommendation or scientifically proved cost-minimizing choice. Combined-product compatibility, total-cost optimization and no-purchase paths remain unimplemented.
5. Phase178 is an in-memory localhost prototype, without production authentication, persistent decisions or published reviewed-product dataset. This module is not public-ready deployment security.
6. The protocol check requires a single independent original source per criterion/variant; reconciling professional test revisions, multiple sources and genuine measurement uncertainties must be implemented upstream, not silently averaged here.
7. Changing criteria, including a label-only semantic edit, invalidates a prepared release immediately; a new matching review or separately audited recomputation is needed. Freshness uses the trusted server's clock.

## Technical sources consulted (design analogies, not validation of PEE)

- NIST AI RMF MEASURE: objective repeatable assessments, uncertainty, benchmark comparisons, post-deployment change monitoring: https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
- NIST AI RMF Playbook, including assessment of external validity and third-party data: https://airc.nist.gov/airmf-resources/playbook/measure/
- Google OR-Tools CP-SAT: constraint solving for future verified configurations; heavyweight engine **not needed nor imported** for this phase: https://developers.google.com/optimization/cp/cp_solver
- Prior PEE strategic review (source links and documented competitive limitations): `PEE-PHASE180-SOLUTION-FIRST-SHOPPING-STRATEGY-CRITICAL-REVIEW.md` (external file; not assumed attached inside v5.03).

## Release status

Software slice is tested for integrity and abstention. **No real-product ranking or independent scientific recommendation is claimed.**

## Correctness refinement after initial regression

The Phase177 ranking fingerprint deliberately excludes criterion labels. An explicit label-only edit could change an English meaning while preserving its key, value and priority. Phase180 therefore requires the signed release to bind the exact confirmed criterion label, structured value and priority in addition to the Phase177 fingerprint. This is conservative: harmless paraphrases can force another reviewed release until genuine semantic equivalence is independently validated.
