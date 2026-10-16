# Phase263 — Retention, Discovery and the Path to a First Real Research Result

**Date:** 2026-10-16. **Base:** Phase262 HEAD `6418f25`.

**Commits:**

- Checkpoint A (assessment): `eedbd43`.
- Checkpoint B (implementation): `a7cf463`.

**Labels used throughout:**

- **[law]**: primary legal text;
- **[eng]**: engineering judgement;
- **[measured]**: real store, read-only copy;
- **[fixture]**: controlled fixtures;
- **[network]**: genuine network observation. There are **none** this phase.

The full legal and discovery analysis is in `PHASE263-ASSESSMENT.md`. It is not legal advice, and no lawyer reviewed
it.

## 1. Findings

**1. Retention rights are not the bottleneck [measured].**

- 2,385 of 2,385 observed declarations are retained.
- 0 reservations or caps were reached, and 0 observations were blocked.
- All 90 sources retain values under the Phase249 class policy.

The Phase249 design (CDPA s28A; Database Regs 1997 regs 12, 16 and 19; facts and not expression; per-host caps;
honoured reservations; private only) holds up against the primary texts read this phase **[law]**:

- s29A is still non-commercial only; the government's March 2026 report left it unchanged;
- DSM art 4 extends a commercial TDM exception to database extraction unless machine-readably reserved;
- *Ryanair* C-30/14 lets contract govern databases that have no protection.

**No new retention policy is needed.** Loosening reservation handling would gain nothing measurable (0 sources
affected), and reservations are legally relevant in the EU.

**2. The loss is in the pipeline, not in the rules [measured][eng].**

- The 4 independent-test revisions in the store gave **0** observations. The spec extractor reads specifications, not
  test results.
- Phase225/226/227 already extract test-result leads (value, unit, condition as a quantity, method cue, unverified
  subject). **These are never persisted.**
- Phase246 and Phase249 could hold them as `test_publisher_declaration_unreviewed` measurements; only the connection
  is missing.
- There is no real page body to test such a connection on, by design: bodies are never kept. It is therefore deferred
  until a lawful retrieval pilot exists.

**3. Three misattributed rights gaps [measured].** Three products were still flagged "declarations not retained:
rights" although rights were no longer the cause:

- 2 have no linked revision after re-derivation;
- 1 has only value-retaining revisions with nothing declared.

Missing knowledge was being blamed on rights.

**4. Discovery should not rest on one engine [eng].** Official documentation read this phase gives:

| Service | Terms | Use for PEE |
|---|---|---|
| SearXNG | metasearch, AGPL-3.0; public instances often block bots | needs a self-hosted instance |
| Common Crawl CDX | heavily rate-limited | a URL dataset, not relevance search |
| Open Web Index (OWIL v1.0) | non-commercial research only | evaluation only |
| OpenAlex, Crossref | open scholarly metadata | category science |
| Wikidata | CC0 | official manufacturer domains |
| Marginalia | data CC BY-NC-SA by default | long-tail sites, non-commercial terms |

Route by need, through one provider-neutral plan and one lead and provenance model.

**5. Network feasibility [measured].** Egress goes through a policy-enforcing proxy, and PEE's transport supports
it. No endpoint was contacted.

## 2. Implemented and verified (Checkpoint B)

| Change | Where | Verified by |
|---|---|---|
| **Defect fixed: a familiar host no longer gives a new document a role.** Candidates carry `publisher {recognition, canonicalSourceId, canonicalSourceType (context only), sourceTypeBasis}` and `documentRole:'role_unknown'`. | `phase262_job_search.ts` | phase262 and phase263 tests; pilot rerun: documents on known hosts were labelled `manufacturer_specification`, now `role_unknown`, with nothing else changed |
| **Registration ≠ familiarity.** `stages.publisherRecognised` vs `stages.documentRegistered` (always false for a candidate), replacing `sourceIdentityRegistered`. | Phase261 and Phase262 | phase261 and phase262 tests |
| **Full lead provenance:** provider, query, query index, requirement (job, gap kind, criterion), access (retrieval not authorised, rights unreviewed, robots unknown), originality unknown, duplication by URL, revision ids null, `verificationRequired` (product identity, document role, originality, access rights, method) | Phase262 | phase263 test |
| **Replaceable provider:** `searchForTarget262({provider:{id,run}})`, with Phase223 SearXNG as the default; live is still refused by the research policy | Phase262 | phase263 test (non-SearXNG provider; live blocked) |
| **Per-operation gate report:** discovery, access, temporary interpretation, structured retention, original analysis and publication, each from its existing deciding field; no new policy | `phase263_operation_gates.ts` | phase263 tests |
| **Rights gaps close when rights are no longer the cause** (journaled `gap_reclassified` with the reason); still-restricted revisions keep theirs | `reconcileRetentionGaps249` (Phase246) | phase263 test (positive and negative); real copy: 3 → 0 |

**The phase263 tests (6) cover:**

- facts retained while the page's prose sentence is found nowhere in the store;
- a refused source blocking discovery, access, interpretation, retention and publication, even if reads were allowed,
  while another source is unaffected;
- a machine-readable reservation keeping metadata only without stopping PEE-authored analysis;
- unknown identity carried forward as verification work;
- an unreviewed scientific claim refused as "reviewed", while a hypothesis stays a hypothesis.

**Real-store impact** (`scripts/phase263-store-impact.mjs` → `evaluation/phase263/store-impact.json`, on a copy):

| Gate | Status for all 90 sources |
|---|---|
| discovery | needs an operator registry entry |
| access | not authorised by the research policy |
| retention | class policy, capped |
| analysis | allowed with citation |
| publication | private only |

Rights gaps went from 3 to 0 on the copy. **The live store was not modified.** The 3 gaps close the next time the
existing reconciliation runs.

**Checks.**

- **Full suite:** 4,470 passed, exit 0.
- **Store:** verified, live matches the remote, 1,374 events.
- **Public outputs:** no URLs, brands or hosts.

## 3. The first genuine research experiment: not run, and why

**Not satisfied:**

- an owner-approved, operation-specific live policy;
- a reviewed provider endpoint.

`ResearchPolicy257` cannot permit reads by design. **No live search or read was performed; nothing here is a
genuine discovery.**

**Recommended smallest genuine pilot.** It needs no broad investigation by the owner. It needs one approval
sentence:

> Approve a metadata-only discovery pilot, expiring in 7 days: (1) Wikidata API lookups of the official website
> (P856) for the brands of the 19 genuine job products; (2) on each returned official domain, a robots.txt fetch and,
> if allowed, its sitemap. At most 60 requests in total, 1 request per second, responses of at most 2 MB, through the
> existing Phase69 transport. No product-page retrieval, no fact retention, no source registration.

Why this pilot:

- **Lawful and cheap:** Wikidata is CC0, and sitemaps are public metadata, using the existing Phase223/75 code.
- **Free:** no AGPL deployment and no paid API.
- **Measurable:** for genuine jobs it shows, for the first time:
  - how many brands resolve to an official domain;
  - how many of those expose a reachable, robots-permitted sitemap;
  - how many sitemap URLs match a job's exact identifiers.

**What Phase264 must implement:** a narrow `metadata-discovery` policy validator, following the Phase257
conventions:

- protected file outside Git, trusted clock, strict fields;
- explicit job ids;
- request, byte and time budgets;
- revocation by revision.

That validator becomes the **only** gate letting `discoverForTarget261` and a Wikidata provider run live.

## 4. Unresolved

**Legal review:**

- s28A "lawful use" where terms forbid automated access;
- terms governing unprotected databases (*Ryanair*);
- EU-database jurisdiction handling;
- operating AGPL search software.

**Technical:**

- persistence of test-result leads (after a lawful retrieval);
- requirement-side qualifiers (test conditions, assessor expertise, tradition);
- syndication detection without retrieval;
- 15 of 19 products lacking cross-site identifiers.

**Unchanged:** teaching packages are not imported; no source scoring (0 contribution records).
