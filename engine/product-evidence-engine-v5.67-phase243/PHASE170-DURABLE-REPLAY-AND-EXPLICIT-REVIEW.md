# Product Evidence Engine — Phase170 / v4.94: durable research replay admission and explicit review draft

**Status: implemented, compiled and regression tested (12 October 2026). Research-only; NOT deployed authentication, independent scientific adjudication, public product comparison or ranking.**

## Executive verdict

Phase169 already verifies Ed25519 receipts, scoped to request turn/session/revision/variant/source, but explicitly delegates cross-run replay prevention to a durable ledger. The Phase170 implementation closes that **mechanical replay gap** using a small, transactional SQLite store (Python standard library) joined to the actual TypeScript Phase169 verifier. It does **not** close the real-world identity, user-consent or independent-source verification gaps. The new explicit review draft preserves the full original user query and proposed quantity/quality candidates for future interactive confirmation rather than falsely marking those requirements confirmed.

## Source-derived context and exact reuse

- `src/phase169_signed_suitability_research.ts`: full signature/role/scope checks and `receiptAudits`; its `rankingAuthorized:false` and identity/science flags remain unchanged.
- `src/phase164_user_request_journey.ts`: exact source question hash, turn, session epoch and revision.
- `src/phase166_quantified_evidence_bridge.ts`: numerical constraint candidates and scope; unparsed text is not discarded.
- `src/phase165_request_context_audit.ts`: proposed qualitative meanings; they are shown as *proposals*, not consent.
- All Phase96/167/168 evidence remains quarantined; Phase170 changes no evidence status and writes no canonical product facts.

## New functionality

### 1. Real atomic on-disk research receipt ledger

- `scripts/phase170_replay_ledger.py` uses Python stdlib `sqlite3` with `BEGIN IMMEDIATE`, uniqueness constraints, explicit commit/rollback, WAL, `synchronous=FULL`, a busy timeout, and a **private, operator-created directory** (permissions 0700) with an 0600 SQLite database file.
- The schema stores only session ID, epoch/revision, turn ID, question SHA-256, fingerprint and consumed receipt IDs; **no plaintext user question or model output**.
- A repeated receipt ID is rejected across processes, even after restart; the whole attempted batch rolls back if any receipt has already been consumed.
- A lower (epoch,revision) is rejected. Within the same revision, an altered turn, question hash or fingerprint is rejected. Additional distinct receipts for the exact same revision can be admitted.
- Concurrent SQLite processes serialize admissions; only one submission of the same receipt succeeds (tested with six concurrent processes).
- Invalid shape, duplicate or unsorted IDs, unsafe true flags, loose database directory permissions and a symlink to an existing database are rejected.
- **Security limit:** this Python script does not and cannot verify signatures; only the TypeScript entry point must be allowed to invoke it. It is a research prototype, not a publicly callable API. Hardened deployment also needs backups/anti-rollback, external key management, isolated service permissions, monitored time, DB integrity checking, HTTP session security and transport protection.

### 2. Signature verification + commit join

- `src/phase170_durable_research_admission.ts` exports `verifyAndAdmitResearch170`, which calls *the existing Phase169 cryptographic verifier first*, obtains authenticated-to-key audit IDs, then sends an operator-scoped JSON envelope to the SQLite process using `spawnSync` with **no shell**. If either phase fails, no successful research admission is returned.
- The result is explicitly `admitted_research_only`; `humanIdentityVerified:false`, `scientificIndependenceVerified:false`, `rankingAuthorized:false`, `publicationAuthorized:false`, `exclusionsAuthorized:false`.
- Python >=3.10 is required for this runtime adapter, not an additional npm runtime dependency. This is an executable integration, not an actual deployed service.

### 3. User review draft for future UX

- `buildExplicitUserReview170` produces a review summary containing the **original full question**, candidate quantitative conditions and qualitative mentions with proposed meaning. It never labels a suggestion confirmed. It retains `unknownRequirementsMayRemain:true` until independently evaluated; no omission creates implied consent.
- No real account login, CSRF control, explicit click capture, backend session attestation or user identity verification has yet been connected. A cryptographic receipt signed by a mock event gateway still says nothing about who clicked.

## Verification (not an accuracy benchmark)

- TypeScript compiled; new TS tests **6/6**, including a real generated Ed25519 key and signature tested end-to-end through the Phase169 verifier and new SQLite ledger; invalid signatures do not create a DB file and replays are rejected.
- SQLite Python tests **11/11**: concurrent processes, atomic rollback, restart replay, stale epoch/revision, same-revision tampering, duplicate IDs, unsafe flags and filesystem restrictions.
- Full eligible TypeScript regression: **2,247/2,247 tests**, across **129 test files** in 13 process groups. Legacy phase91/phase92 suites remain excluded as before. Raw counts: `evaluation/phase170/REGRESSION-COUNTS.json`.
- Python regression: `primary_sources` 47; `ingestion` 21; `tests-companion` 71, including the 11 new tests; **139/139**. Existing suites emitted non-fatal `ResourceWarning: unclosed database` messages, a pre-existing lifecycle issue to track separately.
- All tests run on *constructed data* and deterministic systems tests; **zero newly evaluated authentic consumer sessions, independent professional reviews, learned model predictions, or live account authentications**. The earlier GLiNER checkpoint is still unavailable locally.

## Threat model and non-goals

**Implemented controls:** replay uniqueness, transactional atomicity, monotonic session tracking, original request binding, existing Phase169 signature and scope verification, safe failure, always research-only output.

**Not implemented/claimed:** authenticated consent or user identity, production HTTP handler, independently verified editorial/source rights or reviewer qualification, production backups, trusted deployment, secure key enrollment/rotation, direct evidence approval, product exclusion/ranking/publication, generalized English understanding.

The SQLite script by itself accepts envelopes that a caller could fabricate; it MUST NOT be exposed to end users or treated as a trust authority. Its directory and CLI paths must be operator-controlled. A hostile local process with write access to the ledger can modify or destroy records; do not claim comprehensive tamper resistance or rollback protection.

## Engineering research, primary references

1. SQLite transaction semantics, especially `BEGIN IMMEDIATE`, transaction locking and atomicity: https://www.sqlite.org/lang_transaction.html
2. SQLite write-ahead logging: https://www.sqlite.org/wal.html
3. SQLite PRAGMA `synchronous` and durability tradeoffs: https://www.sqlite.org/pragma.html#pragma_synchronous
4. OWASP Session Management Cheat Sheet (strict, server-issued sessions; rotation after privilege changes): https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
5. NIST SP 800-63-4 Digital Identity Guidelines: https://pages.nist.gov/800-63-4/sp800-63.html
6. RFC 8032 EdDSA / Ed25519: https://www.rfc-editor.org/info/rfc8032/

These are engineering reference designs, not certifications of our implementation. No SaaS added: a hosted entity or sentiment API would not provide session identity or transactional replay semantics for this evidence pipeline.

## Next logical phase (171)

1. Define and implement a real authenticated-session *integration contract* with user-facing confirmation UX, CSRF/session binding, TTL, server-side key access and explicit choice per constraint; demonstrate actual integration only after an account/session service exists.
2. Build independent source reviewer enrollment/roles and two-person conflict adjudication workflow with original-document identity, rights, variant, measurement protocol and quality of proof. Signed reviewer opinion is still NOT enough on its own.
3. Adversarial natural-language user-query evaluation with independently labelled cases, and safe exposure of unresolved clauses to UX.
4. Keep production ranking disabled until independent evidence eligibility is established. Do not turn PEE into a signature/authentication company; concentrate future effort on user/product decision quality.
5. When desktop/compute is available, restore neural model evaluation on complete, rights-cleared reviews. Do not require the user to run tiny Colab tests on their iPhone.

## Distribution

ZIP must preserve all 1,847 files in v4.93 exactly except explicitly changed `README.md`, `package.json` and `.gitignore`; preserve historical manifest files and licences. **Do not include** GitHub repository copies, model weights, runtime DBs, private keys, caches, `node_modules` or personally identifying user confirmation logs. Tests use ephemeral keys and temporary databases.
