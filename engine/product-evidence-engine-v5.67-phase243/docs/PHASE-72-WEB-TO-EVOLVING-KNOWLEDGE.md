# Phase 72 — From authorised web reading to evolving product evidence
**Product Evidence Engine v4.0.0 | 10 October 2026 | RESEARCH-ONLY**

## Goal
Connect the previously isolated rights-aware web reader (69), typed category evidence matrix (70), and adaptive schema proposal system (71). The system should learn not only *facts* but *what kinds of facts and relations it must represent*, without hoarding review prose or publishing unverified model interpretations.

## Implemented in this phase

1. `approved_web_reader.ts` now supports an optional, **transient local claim extractor**. It is called only *after* a pre-approved source policy is checked and `robots.txt` permits the path. The callback receives the decoded source bytes in process memory and returns short anchoring claims. The reader hashes them and returns no source body or quote to its caller. If extraction fails or exceeds limits, the entire page is blocked. This code does not enforce that an injected callback is truly offline; this MUST be guaranteed by the host/runtime and audited.
2. `phase72_structured_acquisition.ts` offers a working, deterministic source-format adapter for SBAF-style two-column frequency measurements. It validates row structure, ordering and plausible numeric boundaries; samples up to 24 actual observed rows without interpolating; attaches exact frequency, channel, rig, method and version context; and sends only typed numeric values with source hashes into the matrix. It never interprets sound quality from response curves.
3. When the `relative_frequency_response_db` field is absent, its observations become anchored **schema-gap signals**. One original test remains insufficient to auto-grow the research catalog, regardless of row count. If a semantically identical field is already reviewed in the registry, it produces **quarantined observations** (never rankings). Changed definitions are rejected, not silently migrated.
4. `phase72_semantic_intake.ts` is a **cross-category local semantic inference boundary**, with a replaceable adapter for future LLM models. The test suite injects mock suggestions (a human-like qualitative interpretation), checks that the quoted anchor exists in the same authorised source bytes, excludes numerically invented ratings, rejects unauthorized schema redefinitions, records provenance hashes, and permits *only research quarantine*. This is NOT an LLM connection, nor evidence of reliable semantic inference. Model interpretations can be semantically wrong despite a literal match, so independent human-label evaluations remain necessary.
5. `db/migrations/007_transient_acquisition_audit.sql` defines research-only provenance of the *acquisition run* and links to quarantined observation/signal records, without any text, excerpt, model prompt, HTML or embedding columns. It is ADDITIVE, still unexecuted on a live PostgreSQL instance, and it is not yet invoked by an application persistence driver.
6. `scripts/demo-phase72.mjs` produces `audit/phase72/offline-demonstration.json`: a reproducible synthetic-network demonstration using 20 **real, licensed measurement points** already supplied under the phase-69 fixtures. The domain and source policy are **test-only**, not an actual permission claim. The result has one original test and produces the status `needs_more_evidence`.

## Pipeline
```
Reviewed source policy and metadata + exact variant identity
    -> source-specific plan; cache may avoid a new request
    -> conservative DNS/TLS/redirect checks and robots.txt
    -> transient local source analysis (numeric parser OR local inference adapter)
    -> exact source passage binding and claim hashing
    -> field definition, type, unit, context, protocol and provenance checks
    -> reviewed existing field: quarantined structured observation
       absent field: quarantined adaptive schema-gap signal
    -> original-test independence checks and semantic-conflict detection
    -> experimental category schema candidate (may require more sources)
    -> independent provenance/method review before promotion
    -> optional transactional persistence, not yet connected
```
No step in this path authorizes commercial scoring or public publication. A row with an apparently valid source anchor is NOT reliable proof of semantic correctness, identity, independence or methodological quality.

## Numeric point vs. consumer meaning
SBAF describes data in 1/6-octave-smoothed measurements normalized around the 500–1500 Hz region with specific couplers/compensation. This is **relative dB under that measurement setup**, not a calibrated sound-pressure level, listening preference score, ANC performance score or proof of objective quality. Never compare values across instruments, compensation systems or protocols without reviewed comparability. Sampling up to 24 rows is an engineering test, not a full-frequency-response analytical substitute.

## Licensing and access
The SBAF repository README (publisher) says the data are CC BY 4.0. Attribution, link, licence and indication of changes must accompany any eventual publication of derived/redistributed material as applicable. A dataset licence does not itself establish a specific endpoint's current crawling permission or override website conditions. Reading or recording source text only transiently reduces copyright exposure, but does not automatically legalize extraction from every protected site or database. A qualified legal/compliance review remains required for commercial deployment. Under this phase no external model was called and no site was crawled from this container.

## Tests and limits
- `npm test`: 424 TS/JS tests passing (including Phase 72's 20 tests) with local TypeScript tooling and Node type definitions.
- `npm run test:ingestion`: 21 Python tests; `npm run test:primary`: 47 Python tests.
- `npm run test:launch`: 4 launch tests; `npm run test:release`: 3 release tests.
- All substantive new flow tests used an injected deterministic offline HTTP transport; the raw authentic fragment had already been included in project fixtures.
- No production PostgreSQL migration performed; no PostgreSQL transaction or ingestion driver; no production authenticated approval; no live fetch; no operational model inference; no statistical quality assessment.
- The `execution: local_only` flag on a pluggable adapter is an **interface contract, not network isolation**. Implement the execution adapter in a sandboxed process with denied outbound networking before using it on commercially valuable material, and verify any source-required restrictions on TDM and model processing.
- The new SQL migration is structurally reviewed but not run against PostgreSQL. It does not itself enforce linked source grants or revocation propagation; do not deploy as a finished security boundary.

## Next actual deployment gates
1. A lawful live source: independent rights record, terms review, `robots.txt` verification, instrument/variant identity, source lineage, and live HTTPS fetch under allowlisted domain/network safeguards. Revalidate on redirects and permission changes.
2. A local inference implementation (or remote service *only* after operation-specific contractual permission), with evaluation against manually annotated real professional assessments, including contextual qualifiers, variant mismatches, disagreement and omission.
3. A PostgreSQL transaction adapter to insert quarantined proposals/observations with verified grant-to-publisher integrity, idempotency, immutable registry history, revocation cascade and authenticated reviewers; run actual migration and integration tests.
4. Selective refresh and retention/research cache policies (expiry, changed hash, new independent evidence), no open-ended spider or bypass of paywalls/anti-bot controls.

## Primary references
- Original SBAF repository, filename/rig/method and CC BY statement: https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/blob/master/README.md
- Original HD600 measurements used in the fixture (the first 20 lines): https://raw.githubusercontent.com/superbestaudiofriends/headphone-measurements-frequency-response/master/cEAR30-Sennheiser-HD600-L.txt
- Creative Commons BY 4.0 licence: https://creativecommons.org/licenses/by/4.0/legalcode
- PostgreSQL constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- PostgreSQL JSONB: https://www.postgresql.org/docs/current/datatype-json.html
- W3C PROV-O: https://www.w3.org/TR/prov-o/
- UK Copyright, Designs and Patents Act section 29A: https://www.legislation.gov.uk/ukpga/1988/48/section/29A
- EU Directive 2019/790 Art. 4: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0790
