# Data governance and publication gates (v0.2)

**Important:** The PostgreSQL schema is provided, but the v0.2 importer is an *offline validator*, not a database writer. Nothing is imported into a live database or automatically published.

## Pipeline

1. Collect only records with a documented lawful acquisition route. Keep original source links and source-document IDs.
2. Normalize records to the import JSON structure. Preserve tested model *as reported*; never infer an exact SKU.
3. Run `python3 -m ingestion.validate path/to/file.json --output path/to/manifest.json`.
4. All batches enter **quarantine**, even if validation succeeds.
5. Human reviewer resolves identity, protocol, test-session deduplication, applicability and licensing. Record their identity, decision, rationale and date.
6. Authorized rights must be substantiated by actual documentary evidence; a populated URI is a technical check, **not legal verification**.
7. Only a separately implemented, authenticated publishing workflow may promote approved records; it must log an audit event and recheck effective/expiry dates and allowed uses.
8. Never train a model, summarize copyrighted reviews at scale, or republish review text based solely on a website being public.

## Key safety decisions

- Test session is distinct from article. Two articles referencing one session must not count as independent tests.
- No automatic cross-variant applicability, even within a product family. Future equivalence decisions need an explicit audited workflow.
- A `measurement` has a metric and unit. No numerical pooling across metrics, units, protocols, or incompatible conditions.
- `scoring_eligible_measurements` is a conservative SQL eligibility view, **not a complete scientific comparability validator**.
- Unknown, expired or prohibited rights cannot be used for commercial scoring.
- Prices are time-stamped offers, not permanent variant attributes. No 'in stock now' claims from stale offers.
- Synthetic fixtures may carry `authorized` flags only for test purposes; they cannot establish rights over third-party material.

## Known gaps for v0.3

- Implement a parameterized PostgreSQL ingestion writer and transactional batch staging (requires a running PostgreSQL service).
- Implement immutable evidence/rights decision history and revocation propagation.
- Validate against actual licensed data and documented grant scope.
- Add schema migration runner, authorization policies and user roles.
- Add measurement-specific normalization and independently evaluated ranking thresholds.
- Verify runtime compatibility with the existing TypeScript engine and build pipeline.
