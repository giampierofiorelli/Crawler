# Phase 29 / v0.3 — Transactional PostgreSQL ingestion, review and revocation

This is a **development-only** implementation. It does not authenticate reviewers, verify legal rights, configure production database roles, or demonstrate a running PostgreSQL integration in the build environment. Do **not** connect it to a public-facing database without security review.

## Install and initialize (PostgreSQL 15+)

```bash
python3 -m pip install -r requirements-db.txt
export DATABASE_URL='postgresql://developer:password@localhost:5432/evidence_dev'
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_initial.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/002_ingestion_workflow.sql
python3 -m unittest discover -s ingestion -p 'test_*.py' -v
```

Only run migration 001 once on a fresh database. It contains a non-idempotent `ALTER TABLE ... ADD CONSTRAINT`. Migration 002 is likewise intended to be applied once.

## Stage and promote synthetic fixture

```bash
python3 -m ingestion.postgres --actor developer stage fixtures/synthetic-import.json
# The command prints the batch ID. Use that ID below:
python3 -m ingestion.postgres --actor developer promote BATCH_ID
```

`stage` writes raw JSON to `import_payload` and a SHA-256 batch manifest **atomically**, in quarantine. Repeating an identical import returns the existing batch ID. `promote` atomically creates relational records **with all trust fields downgraded**: measurement `pending`, test identity `ambiguous`, variant `unverified`, applicability `pending`, rights `unknown` and no allowed uses. Promoting does **not** publish.

The synthetic fixture cannot be batch-approved for commercial scoring. It must not appear in `scoring_eligible_measurements` even if someone manually edits its flags, because the view requires `fixture_kind='real'`.

## Real-data review workflow (not safe for production as-is)

1. Acquire the source legally and record verifiable, document-backed permissions. `fixture_kind=real` is **self-declared**, not independently verified.
2. Stage, validate and promote; review every product variant and original test session.
3. Use `decide` to record an individual decision, actor, reason, and (for rights) documentary URL. An approval changes the corresponding technical status. **The CLI trusts the actor string and documentary URL; it does not authenticate or verify them.**
4. Explicitly approve `variant`, `session`, `measurement`, `applicability`, and `rights` where supported. Cross-variant applicability is blocked; a separate equivalence workflow is not implemented.
5. `approve-batch` changes the batch gate only. The eligibility view also checks individual approvals and live rights.
6. Revoke a grant using `revoke-rights`: its status changes to `prohibited` and a timestamped audit event is inserted within one transaction. The live eligibility view immediately stops returning dependent measurements on subsequent queries.

Examples:

```bash
python3 -m ingestion.postgres --actor reviewer1 decide BATCH_ID variant VARIANT_ID approved --reason 'Exact market SKU checked'
python3 -m ingestion.postgres --actor reviewer1 decide BATCH_ID session SESSION_ID approved --reason 'Tested unit identity verified'
python3 -m ingestion.postgres --actor reviewer1 decide BATCH_ID measurement MEASUREMENT_ID approved --reason 'Method reviewed'
python3 -m ingestion.postgres --actor reviewer1 decide BATCH_ID applicability APPLICABILITY_ID approved --reason 'Exact tested variant'
python3 -m ingestion.postgres --actor reviewer1 decide BATCH_ID rights GRANT_ID approved --reason 'Permission document checked' --documentary-uri 'https://example.com/contract-reference'
python3 -m ingestion.postgres --actor reviewer1 approve-batch BATCH_ID
python3 -m ingestion.postgres --actor reviewer1 revoke-rights GRANT_ID --reason 'License withdrawn'
```

## Known limitations and next gates

- **No live PostgreSQL integration test was possible in this environment.** The 19 Python tests use mocked database transactions and cover SQL call flow, input validation and failure rollback, not PostgreSQL execution semantics.
- There is **no authentication, RBAC, RLS, immutable database audit enforcement, independent legal verification, or secure review UI**. A database administrator must create least-privilege roles and restrict writes to approved procedures. `review_decision` and `audit_event` are append-oriented by convention, not immutable against a privileged writer.
- `review_decision` can record an arbitrary actor string; never treat it as a verified human identity.
- `approve-batch` permits an empty/incomplete real batch to become approved; this is safe from accidental publication only because the view requires each measurement's individual review and technical flags. Stronger approval gating should be added.
- Current database view is an eligibility filter, not a normalized ranking dataset. Do not mix incompatible metrics, test protocols, conditions or variant transfers.
- The v0.1 TypeScript ranking engine is **not yet wired to PostgreSQL**.
- The imported fixture rights URI is fictional and must never be treated as a license.
- Expiry is enforced on every query through `CURRENT_DATE`. A rights revocation updates the database; already-cached results outside PostgreSQL must be invalidated by a future cache/event integration.
- The ingestion CLI is designed for a single trusted developer on a local DB. It does not yet support safely importing a second batch referring to previously imported entities, nor cross-batch reuse of rights grants.
