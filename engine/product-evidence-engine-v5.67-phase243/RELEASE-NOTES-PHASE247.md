# PEE Phase247 (on Phase246)

- **Extraction generalization (spec-extractor-2→4, generic rules, no new dependencies).**
  - Untouched held-out sets, strict first run:
    - 42/65, precision 0.933, recall 0.646, 0 false associations;
    - 49/61, precision 0.961, recall 0.803, 0 false associations;
    - old extractor on the same pages: precision 0.82/0.87, 5 and 1 false associations.
  - Adjudicated results are recorded separately.
- **Knowledge store (schema v3).**
  - Re-derivation from hash-verified local bytes instead of refetching.
  - Alias identity keys.
  - Page titles alone do not create products.
  - Revisit planner; deterministic NDJSON shards; rights worksheet.
- **Category knowledge.**
  - Declared-attribute vocabulary (labels only).
  - Typed, source-graded relations compiling into Phase116 with its audit.
- **Phase243 prioritization:** family round-robin at ties; reviewed strength lifts identity checks.
- **Tests:** 4,326/4,326 TS tests pass.
- **Storage/rights decision needed** (the code repo is public). See `docs/phase247/PHASE247-TECHNICAL-REPORT.md`.
