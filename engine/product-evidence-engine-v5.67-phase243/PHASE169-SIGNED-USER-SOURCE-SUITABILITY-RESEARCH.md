# PEE phase 169 (v4.93): signed user/source research attestations, bounded quantitative + qualitative joining

**Date:** 2026-10-12. **Status:** implemented and mechanically evaluated; **not** a production authentication service, scientific certification, independent benchmark, ranking engine or product UI.

## Executive conclusion

Phase 167 creates provisional original-review measurement candidates from passages. Phase 168 separately interprets the user's qualitative priorities and evaluates quarantined professional-source findings. The new phase169 module joins those paths, scoped to the current conversation revision and exact product variant, while checking the integrity and authorization of *signed research receipts*. It rejects manipulated arithmetic and never takes documentary attestations as sufficient authority for ranking, publication, or final exclusion.

The project **must not wait for access to the user's desktop**: this implementation uses Node's built-in Ed25519 signature verifier, available build/test tools, and existing PEE modules. It does not use GLiNER checkpoint weights, a cloud model/API, GitHub SDK, or new runtime dependency.

## New components and flow

- `src/phase169_signed_suitability_research.ts` exports `planSignedSuitabilityResearch169` and `signingBytes169`.
- Existing, unchanged research engines reused: `auditQuantifiedRequest166`, `Preview167` from `previewOriginalReviewMeasures167`, `planQualitativeNeedResearch168` and its original-source Phase96 qualitative assessment, plus Phase164 session history/Phase165 scope records. No duplication of existing language parsing.
- Receipts support two **different** issuer roles: `user_session_issuer` (asserts an exact user-confirmation event was received) and `source_reviewer` (records review of an exact original-evidence candidate).
- Receipts are Ed25519 signatures over a domain-separated, sorted-key, bounded JSON envelope including session ID, turn, revision, epoch, question SHA-256, receipt ID, issue/expiry times and exact phrase/quantity or source SHA and variant. The key registry must be pinned in protected server-side configuration; the replay ledger must be a protected **durable** store. A JSON body submitted by an end user must never get to set keys or the accepted-ID set.
- Signer roles, allowable source IDs, key revocation, validity periods, signature bytes, duplicate IDs, question/session/epoch/revision/turn binding, precise evidence IDs/source digests/variant, and documented/uncertain methodology are all checked. Input errors fail closed.
- The actual numeric comparisons are **recomputed** from the current quantified user constraints and Phase167 canonical measurements. Tampered pass/fail booleans, cross-product matches and duplicate candidate pairings are refused.
- Signed qualitative findings may be used only if they remain relevant to the confirmed criterion, context, and Phase96 documentary assessment. Missing or uncertain review, unrelated use context, adverse evidence, and conflicting evidence are not treated as successful fit.
- Variant-specific research statuses include `pending_user_attestation`, `unreviewed_candidate`, `signed_candidate_fit`, `signed_candidate_concern`, `qualitative_review_pending`, `signed_qualitative_candidate`, `signed_qualitative_concern`, `conflicting_candidates` and `unresolved_requirement`.
- Every requirement remains `eligibleForRanking:false` and `eligibleForExclusion:false`; global `rankingAuthorized:false`, `publicationAuthorized:false`, `exclusionsAuthorized:false`, `confirmedHumanIdentity:false` and `independentScientificReviewApproved:false`.

## SECURITY AND SCIENTIFIC TRUST BOUNDARY (read before implementing backend)

1. **Key possession is not human identity proof.** A valid signature demonstrates control of a private key corresponding to a pinned public key. It cannot independently establish account ownership, deliberate human confirmation, the reviewer's qualifications or source authenticity. PEE has not implemented enrollment, identity proofing, secure authentication sessions or user-consent UX. See NIST SP 800-63A-4 and SP 800-63-4 links below.
2. **An authorized reviewer attestation is not an authentic independent professional test.** It does not verify a publisher's legal rights, a lab protocol or scientific reliability. Even when all fields are marked `documented`, these are signer *assertions*. Product eligibility and ranking remain blocked.
3. **A receipt ID list held only in an untrusted client cannot stop replay across runs.** A future deployed API needs transactionally persisted accepted IDs, anti-rollback logic, secure key enrollment/rotation/revocation, monitored clock, strict session identity & authorization and an external evidence-adjudication workflow. This release provides only the verifier and contract, not the secure infrastructure.
4. **Canonical JSON is a local bounded serialization contract**, not a full implementation of cross-language RFC 8785/JCS. A future interoperable backend must formalize shared byte encoding and signature transcript tests across runtimes before deployment.
5. **No public ranking authorization.** Under no circumstance should a downstream server treat `signed_candidate_fit` or a Phase96 documentary approval as independently validated evidence. Phase97/99 production promotion is NOT connected.

## Test evidence (reproducible)

- `npm run build` completed, using separately available TypeScript/Node type definitions without bundling them into the release.
- New `tests/phase169_signed_suitability_research.test.ts`: **29/29** cases pass, including invalid signatures, swapped roles, changed requirement meaning, expired and replayed receipts, wrong session/revision/epoch/question, invalid source authorization, incorrect variant/source/span, tampered numeric fit, prior source approval absent and adversarial use-context/negative qualitative evidence.
- Regression: **2,241/2,241 TypeScript tests on 128 eligible files** in 13 bounded subprocess batches, excluding the longstanding Phase91/92 legacy suites. Evidence: `evaluation/phase169/REGRESSION-COUNTS.json`. No skipped eligible file.
- Python: `python -m unittest discover -s primary_sources -t . -p 'test_*.py'` **47/47**; `python -m unittest discover -s ingestion -p 'test_*.py'` **21/21**; `python -m unittest discover -s tests-companion -p 'test_phase*.py'` **60/60**; combined **128/128**.
- Synthetic E2E diagnostic: `npm run demo:phase169` writes `evaluation/phase169/PHASE169-CONSTRUCTED-SIGNED-RESEARCH.json`. It generates temporary key pairs in memory, declares a **fictional** Aster coffee machine measured at 31 cm in width, supplies two synthetic signed events and retains a separate unconfirmed qualitative `quiet` requirement. Result: provisional numeric fit and pending qualitative attestation; all ranking/publication flags remain false. This is **NOT** a real user session, product review, authentication/identity proof or accuracy measurement.

## Targeted primary engineering references

- IRTF RFC 8032, EdDSA and Ed25519 (January 2017): https://www.rfc-editor.org/info/rfc8032/. We use Node's built-in implementation; do not claim signing alone authenticates human identity.
- NIST SP 800-63A-4, *Identity Proofing and Enrollment*, final July 2025: https://csrc.nist.gov/pubs/sp/800/63/A/4/final. Explains why external enrollment is required before an actor ID has trustworthy human semantics.
- NIST SP 800-63-4, *Digital Identity Guidelines*: https://pages.nist.gov/800-63-4/sp800-63.html. Authentication requires a bound authenticator and protected authentication process, not just a signed JSON object.
- W3C PROV-O recommendation: https://www.w3.org/TR/prov-o/. An agent's signed assertion, a recorded activity and a genuine independently tested product are separate entities; engineering provenance must retain this distinction.
- W3C Web Annotation Data Model: https://www.w3.org/TR/annotation-model/. Source-text selectors and anchors must be retained for independently reviewable claims.

These standards guide a **design decision**, not an endorsement/certification by the standards bodies. No outside SaaS or model was installed: current blockers are trust-enrollment and source verification, for which hosted sentiment APIs offer no demonstrable solution.

## Next engineering priorities (phase 170)

1. Design and test protected server-side issuance of signed confirmation receipts from an actual authenticated UX event (identity assurance requirements, revocation, durable replay ledger and transactional acceptance). Until deployed, the phase169 event is documentary-only.
2. Create independent original-source human adjudication records with document-rights/protocol/variant review; define a reproducible split for independently annotated genuine professional reviews when legally available. Never rewrite source evidence from model impressions.
3. Exercise Phase169 across many English, mixed qualitative/numeric, naturally written user prompts with reviewer-annotated expected states; ensure unparsed aspects remain visible rather than silently disappearing.
4. Only after independent evidence and consent/identity controls exist, consider a separate, deliberately designed transition into noncompensatory eligibility and deterministic rankings.
5. GPU-based GLiNER execution waits until authorized desktop/server access. Continue other product capabilities in parallel.

## Preservation and licences

Maintain all historical PEE research, Python/TS tools, permitted upstream code excerpts, and technical licences. No repository GitHub copy, 296MB checkpoint, demo private key or proprietary upstream attribution banner is included in the public-facing product. The new research verifier is original project code using the native Node crypto library.
