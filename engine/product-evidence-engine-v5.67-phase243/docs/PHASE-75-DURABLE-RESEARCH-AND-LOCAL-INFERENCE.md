# Product Evidence Engine — Phase 75: persistent cognitive research pilot

**Date:** 10 October 2026  
**Version:** 4.3  
**Status:** Implemented and unit-/integration-tested with offline/loopback fixtures. Not live source ingestion, not a validated model, not production.

## Scope / decisions

This increment preserves Phases 68–74 and adds:

1. `src/phase75_priority.ts`: research-only, explainable **ordinal priority** scheduler. It ranks pending capability work against category gaps, with distinct relevance for safety, coverage, method uncertainty and freshness, *subject to verified research dependency receipts*. The heuristic numbers are not probabilities, expected utility estimates, accuracy measurements or user research. No source is authorized by priority.
2. `src/phase75_memory.ts`: bounded, durable single-host metadata journal. Stores task/status IDs, source reference IDs and SHA-256 fingerprints; **not original articles, quotes, prompts, completions or page excerpts**. Uses exclusive lock directory, write/temp/rename, file sync and integrity check. Idempotent run IDs, replay with same run ID detected, corrupt state fails closed. This JSON pilot is **not** a concurrent distributed database and checksum is **not** a cryptographic signature or authenticated review.
3. `src/phase75_runtime.ts`: selects ready tasks, runs eligible local-only capability workers and records only unreviewed metadata. Review receipts still require an external authenticated authority; new work cannot certify itself.
4. `src/phase75_local_model.ts`: real HTTP transport to an operator-owned, **loopback-only** Ollama-compatible local inference service (`127.0.0.1:11434/api/chat`, `stream: false`, `format: 'json'`). Input size, runtime, output size and response proposal count are bounded. The model is **not present in the current test environment**. A loopback HTTP mock verifies the adapter's contract; no actual LLM inference was performed. Existing Phase 72 semantics require precise source anchoring and quarantine; local model output never validates itself.
5. `src/phase75_source_discovery.ts`: an API-free **approved-source sitemap** candidate discovery adapter, with fresh robots check, scoped host/path, controlled response size and pre-reviewed metadata-discovery rights. Returns URLs only as **unverified discovery candidates**; does not retrieve their pages or assert independent test identities. This is not a general-purpose independent web search engine. Current tests use simulated sitemap responses and a live local HTTP socket (for inference transport only).
6. Proposed migration `db/migrations/010_category_research_priorities.sql` for recording gap/priority/discovery metadata. **Not run on PostgreSQL**; the JSON pilot is the only storage exercised in this phase.

## Test commands

```sh
npm run test:phase75
npm test
npm run test:primary
npm run test:ingestion
npm run test:launch
npm run test:release
```

Test isolation safeguards: previously reviewed task dependency gate; retries/pending tasks; corrupted journal; model output anchored to the original source text; unreviewed source denial; robots-disallowed paths; document-type limit; withheld independent original-test identity; no article text retained in the pilot journal.

## Example for operators

```ts
import {createLocalOllamaAdapter} from './src/phase75_local_model.js';
const adapter=createLocalOllamaAdapter({model:'a-model-installed-locally',port:11434});
// Pass adapter to the existing Phase 72/74 transient inference boundary.
// Source rights must have been verified before its caller reads page content.
```

The operator must install and run a compatible local model, verify machine capacity and model licensing, separately authenticate reviewers, and provision source permissions. No hardware or inference accuracy guarantee is implied.

## Evidence and docs

- Ollama's documented chat request and JSON format: https://github.com/ollama/ollama/blob/main/docs/api.md
- PostgreSQL official JSON/JSONB behaviour: https://www.postgresql.org/docs/current/datatype-json.html
- Prior research and rights restrictions: `docs/PHASE-68-WEB-EVIDENCE-RESEARCH-AND-ARCHITECTURE.md`, `docs/PHASE-69-LICENSED-WEB-READING-PILOT.md`.

## Open blockers and next experiment

1. Conduct an actual HTTP discovery from an explicitly permitted source and record a verifiable reference trace, not an unverified synthetic source-policy attestation.
2. Run an actual local LLM (not a mocked endpoint) on independently labelled, permission-cleared professional test passages; evaluate per-field precision, completeness, false positives, missed evidence, units and context errors.
3. Test the PostgreSQL schema/migration on an available instance, then implement transactional task leasing and an authenticated independent review service. File storage is not suitable for multi-worker production.
4. Replace ordinal priority proxies with measured research utility once decision-outcome evidence and costs exist.
5. Improve cold-start discovery beyond approved site sitemaps (permitted feeds, partner directories and operator-reviewed links); do not substitute unauthorized search scraping.
6. Independently review copyright, website terms, database rights and personal-data processing before commercial rollout. Structured fact storage alone does not confer lawful extraction rights.
