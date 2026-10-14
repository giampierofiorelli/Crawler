# Product Evidence Engine — Phase171 / v4.95: original-source conflicts and research decision quality

**Status: implemented and tested in the bounded English review-research path. Date: 12 October 2026.**

## Executive result

The original review-to-user-need pipeline was previously able to present provisional numeric fits and an undifferentiated conflict flag, but that can mislead on multi-source synthesis. Phase171 implements **a deterministic, research-only conflict workbench** over existing Phases 164/166/167/169/170. Instead of interpreting several pieces of content as independent corroboration, it explicitly distinguishes declared editorial families, original document digests, measurement protocols/versions, test conditions, user confirmation and source review. The existing Phase168 qualitative state is also routed into a conservative research-work queue; no attempt is made to average vague opinions into quantitative results.

**Do not claim** that this phase validates a publisher, a professional method, an independent laboratory, an actual consumer session, or a product recommendation. Declared editorial family IDs and protocol IDs are documentary annotations, **not verified proof of independence or scientific comparability**. The user’s iPhone and GLiNER weights were not needed for this development; there are no new real neural model runs.

## Source-derived basis — existing repository

- Phase164: request/session revisions and exact original question hash.
- Phase166: numeric comparisons as unconfirmed English-language candidates, including hard/soft/ambiguous scope and dBA vs dB boundaries.
- Phase167: source-text-derived original-document and exact-variant candidate measurements; `candidate_pending_scientific_review` is not a scientific admission.
- Phase168 / Phase96: context-bound qualitative reviewer findings and research obligations, with feature presence vs tested performance separated.
- Phase169: Ed25519-bound signer role, question/turn/source/variant/measurement span checks, recomputation of numeric fits, source-review declarations; signatures prove *key control only*.
- Phase170: SQLite transactional replay admission after signature and scope checks. Its ledger must remain operator-controlled, not a browser-visible service.

Phase171 **re-runs the Phase169 signature and binding validation** (without repeating the Phase170 ledger write) and requires the exact previously admitted Phase170 result. Original measure previews must equal the verified inputs. This is a trusted-server contract, not an endpoint accepting arbitrary unsigned data.

## New code and semantics

### `src/phase171_source_conflict_workbench.ts`

The `reconcileOriginalSourceConflicts171()` research function accepts:

1. a Phase170 admitted research envelope;
2. the original server-controlled inputs used to verify the signed Phase169 receipts;
3. the exact Phase167 measurement preview; and
4. optionally, explicitly **unverified** editorial-family and method/condition declarations anchored to `candidateId`, `sourceId`, `originalDocumentId` and `documentSha256`.

It returns per-requirement and per-variant traceable candidate assessments, with the original document hashes, provisional measured values, original source and receipt IDs, opposite/same-side comparison groups and next research actions. All rankings, exclusions and publication outputs remain false.

| Disposition | Meaning / next research action |
|---|---|
| `user_scope_unresolved`, `user_confirmation_pending` | Clarify or explicitly confirm the original user requirement. |
| `original_evidence_missing`, `documentary_review_missing` | Find and review an original test rather than fabricate a product verdict. |
| `method_lineage_missing` | Identify original editorial lineage, protocol version and conditions before synthesis. |
| `republication_across_declared_families` | Same original document appears under different declared families; trace back to one source. Phase167 currently rejects identical-text duplicate documents even earlier. |
| `conflict_within_editorial_family` | Inconsistent provisional fits inside one family under a comparable method; not independent laboratories. |
| `different_methods_not_directly_comparable` | Different protocol IDs/versions or operating conditions: **do not call this a direct contradiction**. |
| `conflict_under_declared_same_method` | Both provisional fit and failure under the same declared method/condition group: independent adjudication needed. |
| `single_editorial_family_only` | Several documents from one declared family cannot be counted as multiple independent confirmations. |
| `apparent_cross_family_agreement_unverified` | Multiple declared families and one declared method agree; still cannot claim independence or evidence eligibility. |
| Qualitative dispositions | Retain pending original qualitative research, context conflicts, adverse signals and optional needs, without scoring/averaging. |

**Conservative order:** within a declared comparable protocol group, a direct fit/fail discrepancy takes priority; changes of protocol version or test condition otherwise stop direct synthesis. A same-family conflict is classified as internal inconsistency only when its protocol group has genuinely incompatible provisional outcomes.

**This is not statistical metrology.** No uncertainty estimate, confidence interval, calibration, source independence certificate, measured repeatability or real-world method validation is invented. A pair of numbers on the same side of a user threshold is only preliminary agreement on *that threshold*, not agreement on precise performance.

### Tests and eligibility

- Tests cover single editorial family, superficially independent agreement, same-method conflict, different protocol/condition/version, same-family internal conflict, missing method lineage, unsigned reviewer/no user confirmation, missing source review, missing original reviews, tampering with question, source document, original preview, signed envelope or cryptographic signature, duplicate source records and deterministic declaration ordering.
- One test runs the actual Phase169 Ed25519 validation → Phase170 operator-controlled SQLite admission → Phase171 workbench on constructed documents.
- No real external editorial review or user corpus was benchmarked in this phase. Test fixtures are deliberately artificial, including the fictional **Orion coffee machine** and fictitious source identities.
- The eligible TypeScript regression excludes legacy Phase91/92 suites exactly as the previous release did. Full counts are stored in `evaluation/phase171/regression-ts.json`; Python runs remain separate. No empirical model accuracy can be computed from these tests.

## Targeted engineering reference review (external research, not facts established by the code)

1. **NIST TN 1297, Appendix D.1: Repeatability and reproducibility terminology**: distinguishes repeated measurements under the same conditions from measurements under changed conditions. This motivates explicit protocol/condition grouping; the module does not implement NIST uncertainty analysis. https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-d1-terminology
2. **NIST, Traceability Considerations for the Characterization and Use of Measuring Systems (2016)**: measurement systems, influence quantities, operating conditions, resolution and repeatability matter for meaningful comparison. https://www.nist.gov/publications/traceability-considerations-characterization-and-use-measuring-systems-0
3. **W3C PROV Overview / Primer**: entities, activities and agents enable explicit source lineage. Declared publisher family in our code is a deliberately smaller research annotation, not a completed PROV graph. https://www.w3.org/TR/prov-overview/ ; https://www.w3.org/TR/prov-primer/
4. **Cochrane Handbook, Ch. 21 and GRADE-CERQual**: methodology, relevance, coherence and adequacy are dimensions of qualitative synthesis. **PEE does not purport to conduct CERQual assessments** and should not translate repeated editorial opinions directly into confidence scores. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-21 ; https://www.cerqual.org/overall-confidence-in-the-evidence/

These references are engineering/methodological guidance rather than independent evaluation of PEE. No external SaaS or GitHub library was adopted or paid API integrated. The source materials supplied by the user remain a cumulative engineering basis, with existing licenses retained.

## Security and limitations

- This is **research-only**. No public rankings, exclusions, price updates, canonical scientific writes or source authenticity approvals are performed.
- The input metadata can be wrong. Different strings are not proof of different editorial owners, and different hashes do not rule out near-duplicate or syndicated reviews.
- A signature proves control of an enrolled key, not a real-world reviewer’s credentials or the originality of a professional test.
- The current integration is a callable module **after** Phase170, not yet a deployed browser/account session or HTTP UI; the original session is not independently authenticated.
- Comparability beyond an exact declared protocol/version/condition identity will need expert review, measurement uncertainty, and category-dependent protocols. Source count is never used as an autonomous vote to pick the “best” product.
- The examples are constructed, and the algorithm is English-first. We have not performed fresh inference on full, independent, rights-cleared original professional reviews.

## Release preservation

Keep all prior cumulative files and technical third-party licensing. Do not add uploaded entire GitHub repos, neural weights, new caches, `node_modules/`, raw user sessions, SQLite ledgers, private keys or authentication tokens. **Historical exception:** the v4.94 ZIP itself already contained prebuilt `dist/` files and Python `__pycache__/` bytecode. All those earlier bytes are retained unchanged to satisfy the cumulative preservation contract; Phase171 does not add further compiled artifacts to the ZIP.

## Phase172 — next value-producing step

1. Test end-to-end user decisions on authentic and independently annotated **English** requests, clearly separating model/context errors from missing source evidence.
2. Define an operator-reviewed source family registry and tested-protocol version mapping; avoid inferring independence from website URL and do not let self-declared metadata authorize source admission.
3. Add a bounded research response layer that tells a user specifically what can be concluded, what is unknown and which question or additional original test would change the answer — without inventing winners.
4. Further tighten variant/identity provenance and category-specific method comparability; when a real desktop compute environment is available, revisit GLiNER on complete rights-cleared texts.
