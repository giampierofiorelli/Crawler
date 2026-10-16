# Phase264 — First Live Metadata-Discovery Pilot

**Date:** 2026-10-16. **Base:** Phase263 HEAD `ebf94ce`.

**Commits:**

- Checkpoint A (policy, gate, Wikidata assessment, sitemap leads): `28664ca`.
- Predeclared criteria, sealed before the run: `52f81c8`.
- Pilot runner and the separate Wikidata budget: `873aaef`.
- First-run results, the Retry-After log field and this report: the commit that adds this file.

**Labels used throughout:**

- **[network]**: genuine network observation;
- **[fixture]**: controlled fixtures or the offline rehearsal;
- **[eng]**: engineering judgement.

## 1. Authorisation

The owner authorised a narrowly scoped, metadata-only live discovery pilot, valid for seven days from policy
activation. Its scope, as granted:

- Wikidata API for brand or manufacturer identity and P856 (official website), using the brands of the 19 genuine
  research jobs;
- robots.txt on candidate official domains;
- public sitemap metadata only, if permitted.

Its limits:

- at most 60 HTTP requests, 1 request per second and 2 MB per response;
- stop on 403, 429, 5xx or Retry-After;
- no page or article retrieval, no retention, no source registration, no evidence admission, no scoring and no
  ranking.

It does not supersede the Phase257 policy.

**Policy as activated:** `pee264_metadata_pilot`, revision 2, issued 2026-10-16, expires 2026-10-23.

- **Live copy:** `~/.local/share/product-evidence-engine/metadata-pilot/policy.json`. Mode 0600, directory 0700, outside
  Git.
- **Durable copy:** private `pee-knowledge/policy/`.
- **Budgets:**
  - 60 requests in total;
  - at most 4 per candidate domain;
  - at most 10 to Wikidata;
  - at least 1,100 ms between requests;
  - 2,000,000 bytes per response;
  - at most 300 s of clock skew against the server's Date header.
- **User-Agent:** `PEEMetadataPilot/264 (<repository URL>; ProductEvidenceResearchBot research bot) node/22`. It gives
  a name and version, a contact URL and the word "bot", following the Wikimedia User-Agent policy. No personal email.

Revision 1 was never used for a live request. Revision 2 adds `maxWikidataRequests` (§2).

## 2. What was built (reusing existing infrastructure)

| Piece | Where | Reuses |
|---|---|---|
| Strict policy validator | `validateMetadataPilotPolicy264`, `loadMetadataPilotPolicy264` | Phase257 protected-file checks, now shared as `readProtectedPolicyFile257` |
| Request gate, the only network path | `MetadataPilotGate264` | Phase69 `restrictedHttpsTransport` (HTTPS, no redirects, uncompressed body, byte cap), which now exposes Date and Retry-After |
| Wikidata P856 assessment | `assessBrand264` | none (new; P856 is treated as an unverified claim) |
| Sitemap leads | `discoverDomain264`, `classifyForJob264` | Phase75 `discoverFromApprovedSitemap` (public_metadata mode, in-memory record), Phase261 `attributeUrl261`, Phase192 URL normalisation |
| Single-run runner | `scripts/phase264-metadata-pilot.mjs` | Phase262 pilot layout (store copy, private/public split) |

**The gate checks every request:**

- the policy has not expired;
- the operation is in scope;
- Wikidata requests use only the exact API endpoint, `wbsearchentities` or `wbgetentities`, with `format=json` and
  `maxlag=5`;
- robots requests use only `/robots.txt`, and only on an accepted domain;
- sitemap requests only reach accepted domains;
- the global, Wikidata and per-domain budgets;
- the spacing between requests;
- the byte cap;
- the server's Date against the local clock.

**Stops.** A 403, 429, 5xx, Retry-After or `maxlag` from Wikidata halts the whole pilot. The same from a domain halts
that domain only. There are no retries.

**Wikidata matching.** A brand is:

- **unambiguous** only when exactly one exact label or alias match is an organisation or brand entity with a current
  P856;
- **ambiguous** when several are (no domain is accepted);
- **unresolved** otherwise.

Flags record:

- a brand entity whose manufacturer may differ;
- multiple current sites;
- language or jurisdiction qualifiers;
- ended or deprecated sites, which are excluded.

**The offline rehearsal (`--rehearse`) found a defect before any network use [fixture].** The single per-host budget
also capped the Wikidata API (4), while the pilot needs 7 calls (6 searches plus 1 entity read). Wikidata now has its
own budget, tested in `phase264_metadata_pilot.test.ts`. The rehearsal then ran end to end:

- 19 fixture requests, all within the limits;
- every URL class populated;
- store unchanged.

**Tests.** `phase264_metadata_pilot.test.ts` has 5 tests, all on fixtures. The related suites (Phase69, 75, 257, 261
and 264) give 35 of 35 passing.

## 3. First genuine run [network]

Run once on 2026-10-16 at 13:52 UTC. The results below are the first run, committed unchanged.

| Measure | Result |
|---|---|
| Jobs | 19 (5 without a brand, reported unresolved without a request) |
| Distinct brands | 6 |
| Unambiguous / ambiguous / unresolved | 0 / 0 / 6 (`lookup_not_completed`) |
| Candidate domains (known / new) | 0 (0 / 0) |
| Resources (accessible / blocked / unavailable) | 0 / 0 / 0 |
| Sitemap URLs; leads (exact-identifier / unknown attribution) | 0; 0 (0 / 0) |
| Duplicates, already observed, other model, irrelevant | 0 |
| Requests / bytes | **1** / 1,966 |
| Rate-limit responses | **1** (HTTP 429 with Retry-After, on the first Wikidata search) |
| 403 / 5xx / network errors | 0 / 0 / 0 |
| Pilot halted | `stop_429_retry_after` |
| Pages retrieved, values retained, sources registered, retries after stop | 0, 0, 0, 0 |
| Store | unchanged (copy statistics identical; live store not opened) |

**Against the sealed criteria, the run succeeds on integrity and yields nothing.** It completed within every limit,
and the provider's instruction was obeyed at once. Whatever the yield, the first run is not repeated.

**What is known about the 429.**

- It came from upstream: the agent proxy reported no relay failures.
- It was the session's first request to Wikidata, so it was not caused by this pilot's own request rate.
- Its cause cannot be established from this run:
  - neither the body nor, before the fix below, the Retry-After value was recorded;
  - [eng] a plausible cause is that the shared cloud egress address was already rate-limited, but this is unverified.

**Gap fixed after the run.** The gate now records the provider's Retry-After value in its request log, so a later,
separately authorised run can honour it exactly. The first-run file is unchanged.

**Where the outputs are:**

- **Private report:** `privateEvaluationDir249()/phase264/pilot-firstrun.json` (mode 0600), with a durable copy in
  private `pee-knowledge/private-eval/phase264/`. It holds the request log, brand assessments and per-job results.
- **Public counts only:** `evaluation/phase264/pilot-firstrun-public.json`, checked for URLs, brand names, hosts and
  entity ids (none).

## 4. What this does and does not show

- **Not shown:** whether Wikidata P856 resolves job brands to official domains. Nor whether those domains expose
  permitted sitemaps with identifier-bearing URLs. **No URL was discovered; nothing here is evidence.**
- **Shown:**
  - the authorisation, budget and stop machinery works on the real network path, end to end, including a genuine
    rate-limit stop;
  - the transport and the proxy reach Wikidata;
  - an identifiable bot User-Agent alone does not guarantee access from this egress.
- **Unchanged:**
  - the Phase249 retention policy;
  - the Phase257 policy (it still permits no reads);
  - no source registration, scoring or ranking.

## 5. Checks

- **Full suite (`npm test`):** 4,475 tests passed across 19 shards, exit 0.
- **Store:** `node scripts/knowledge-snapshot.mjs verify` passes. The live store was not modified in this phase.

## 6. Open, for the owner

- **Retry.** Within the 7-day validity, a pause-and-resume run that honours the recorded Retry-After value would need
  the owner to confirm that it is the "pause" the authorisation allows. Under the sealed criteria, it would be reported
  as a second run, never as the first.
- **Persistence.** If Wikidata keeps rate-limiting this egress, the official-domain step needs another lawful identity
  source, or an owner-run lookup outside this environment.
- Teaching from the three research packages and the Phase225/226 test-lead persistence are untouched (next phase).
