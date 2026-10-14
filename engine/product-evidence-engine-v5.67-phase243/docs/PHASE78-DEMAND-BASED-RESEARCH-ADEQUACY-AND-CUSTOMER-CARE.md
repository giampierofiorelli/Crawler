# Phase 78 — Why three known products do not imply only three possible solutions

**Date:** 2026-10-10  
**Version:** Product Evidence Engine 4.6.0  
**Status:** Implemented and tested with constructed inputs, not production-validated.

## Design decision

A request begins with a **confirmed user outcome and constraints**, not a predefined
category or model. The size of our stored product catalog tells us nothing about
whether relevant options are missing. A shortlist of one may be valid after a
well-documented search and exclusion of alternatives; one known product is never
sufficient evidence of market exclusivity.

**Separate axes:**

1. **Catalog population:** the number of candidates stored or retrieved.
2. **Evidence-based applicability:** variants with reviewed support for every
   desired outcome and constraint, relevant original testing, verified rights,
   safety and methodology.
3. **Discovery adequacy:** whether we sought plausible alternatives via independent,
   reproducible discovery paths in the region and the specific use context.
4. **Editorial publication:** separate approval of individual product cards, and
   later independent approval of any *comparative ranking*.

These axes cannot be reduced to an arbitrary minimum of 3, 5 or 10 products.

## Worked cases (all constructed examples)

**Case A: 3 products in the database, no market audit.** We do not tell the
user there are only three solutions. The existing products cannot certify search
completeness. We record work required for broader discovery. In-progress status
is shown only if a worker has actually started.

**Case B: 30 products in the database, but the right use context is unexamined.**
Still incomplete, even though the count is large. Catalog size is not a proxy
for the quality of research.

**Case C: 3 products studied; after review, 2 fail a user requirement and 1
passes.** A documented search boundary may support a demand-specific narrow
result. The wording is "una soluzione verificata tra le alternative esaminate",
never "l'unica soluzione esistente". A single item is not ranked #1.

**Case D: 1 promising product, many still waiting for independent tests.**
The unchecked products remain unresolved. "Insufficient evidence" cannot be
used to exclude them as if they were definitively unsuitable.

**Case E: relevant options independently approved while search continues.**
They may be shown as **verified options, not an ordered ranking**. Publication
requires an editorial approval bound to the exact same request scope. This
module cannot on its own authorize a ranking.

## Runtime/data architecture

`assessResearchAdequacy(portfolio,audit,optionApproval)` is a pure function. The
portfolio comes from the Phase 77 evidence model and must be obtained from
trusted records. The accompanying discovery audit must carry the identical
scope hash, independent source origins, procedure receipts, a boundary decision,
unresolved alternatives, and documented exclusions. It must fail closed on
ongoing discovery or unmet checks. This is not a proof of total market coverage.

`customerResearchUpdate(progress,coverage,sharedKnowledgeEnabled)` returns
Italian copy and separately approved unranked option IDs. Progress stage states
come from the persisted ledger, not an LLM. The next-check timestamp is emitted
only after the existing scheduler-backed checkpoint is registered. This time
is **not an ETA for completion**.

The status endpoint `/v2/decision-research/:requestId` accepts the existing
private bearer token. `getReviewedResearch` is an optional **trusted backend**
callback. It is not a public endpoint and the browser cannot issue publication
approvals. The ledger binds the request ID, authenticated access token and scope
hash. If coverage cannot be verified, the user still sees verified progress but
not a purportedly reviewed market shortlist.

The shared-learning thank-you copy is enabled only by a host configuration:
there is no user-data-sharing claim merely because a request was made. Before
using real personal queries for shared learning, the host must design privacy,
retention, anonymization and consent/legal-basis controls as appropriate.

## Deliberate limitations and required next integrations

- Real discovery must use authorized, rights-cleared source access. Existing
  sitemap and web-reader pilots are **not** proven production crawling.
- Signed review artifacts, independent provenance audits and a product-card
  catalogue rendering API must be supplied by the backend; identifiers are not
  product descriptions or prices.
- Comparison ranking remains forbidden here. A separate verified methodology,
  independent test appraisal and explicit publication decision are needed.
- Real queued worker execution, AI/LLM evaluation, multi-worker storage,
  commercial-use legal clearance, reliable notifications and measured completion
  windows remain unverified.
- Avoid claiming "we are working" while the request is queued or blocked.
- Do not repeat raw user questions or private constraints in shared data.

## Verification

Run `npm run test:phase78`, `npm test`, `npm run test:primary`,
`npm run test:ingestion`, `npm run test:launch`, `npm run test:release`,
`npm run demo:phase78`. The demo's data and independent approval identifiers
are deliberately **constructed**.
