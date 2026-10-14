# Phase 30 — v0.4 read-only PostgreSQL bridge

## What is implemented

- `ingestion/export_approved.py`: uses one PostgreSQL **repeatable-read, read-only transaction**. Queries `scoring_eligible_measurements` (not the raw measurement table), a verified variant, and a **fresh in-stock offer (48h)**. Emits a JSON snapshot to stdout. It does **not** claim a license or independently verify a review.
- `src/db_adapter.ts`: validates the snapshot, market/currency, price freshness, exact tested-variant identity, source link and measurement units. It calls the original deterministic `rank()` function.
- `scripts/run-db.mjs`: runs the Python exporter and consumes its stdout directly; there is no arbitrary JSON-file input in the production CLI.
- `scripts/demo-bridge.mjs` and `fixtures/bridge-synthetic.json`: **synthetic-only** demo, deliberately separated from the live database flow.
- `db/migrations/003_read_gate_hardening.sql`: defense-in-depth for batch approval, per-record decisions, tested-unit identity and rights. **Not live-DB-tested.**

## Critical limitation: real measurement normalization is NOT yet validated

The TypeScript engine currently accepts only `synthetic_0_10` fixture scores. It is **incorrect** to feed it kPa, minutes, percentage debris collection or arbitrary review scores and pretend they are comparable. Consequently, `run:db` currently **rejects every real measurement for scoring**, reports its rejection reasons, and returns `insufficient_evidence`. This is intentional fail-closed behavior, not a finished real-world recommendation feature.

Next implement a documented, per-dimension/per-protocol normalizer, with test-set calibration and methodology review, before allowing real data into `rank()`.

## Commands

```bash
npm install
npm test
python3 -m unittest discover -s ingestion -p 'test_*.py' -v
npm run demo:bridge

# Optional PostgreSQL 15+ test database; NEVER use a production database yet.
# Requires Python psycopg: pip install -r requirements-db.txt
# Apply the three migrations, in order, using psql, and use a read-only service role.
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_initial.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/002_ingestion_workflow.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/003_read_gate_hardening.sql
npm run run:db
```

## Operational security notes

- The DB role used by `run:db` should have **only SELECT on `scoring_eligible_measurements`, `product_variant`, `market_offer`, `test_session`, `source_publisher`, `review_article`**. Do not expose this CLI to untrusted users.
- PostgreSQL view owner, `search_path`, role creation and grants have **not** been configured/tested. This is not a production access policy.
- `review_article` URLs and `market_offer` rows are not themselves part of the reviewed provenance/rights workflow. They need a separate feed provenance and merchant offer authorization process before a public launch.
- Revocations are respected on subsequent DB queries, **not** necessarily in previously generated output or external caches. No production caching is implemented.
- Do not expose user requests, secrets or personally identifiable information to the exporter; this is a developer-only bridge.
- `rankSnapshot()` trusts the `origin` label only as a sanity check; an attacker could forge that label in a standalone JSON file. The supported production entrypoint is the direct DB exporter process, not user-supplied snapshots.
- Test code currently uses mocks for the DB exporter. No live PostgreSQL integration test was run here.

## Acceptance criteria for the next phase

1. Real PostgreSQL migrations execute on an isolated DB, including 003.
2. Live test: a quarantined or synthetic record is never returned by the eligibility view.
3. Live test: only separately approved real records with verified identity, applicability and rights are returned.
4. Live test: rights revocation removes measurements on the next read.
5. Live test: stale or unavailable offers exclude variants.
6. A separately validated normalization layer converts only explicitly approved metrics and protocols; otherwise the engine abstains.
7. Results are clearly marked as experimental until independent user testing and calibration.
