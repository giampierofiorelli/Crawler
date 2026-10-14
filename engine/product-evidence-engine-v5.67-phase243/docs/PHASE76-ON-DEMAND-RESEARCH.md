# Phase 76: Research on demand with an honest customer-facing wait state

**10 October 2026 — Research / single-host prototype. Not deployed.**

## User contract

- An unknown **category** starts a cold-start investigation; a product label refers to a
  **product-specific** request and cannot be satisfied by category research alone.
- The site displays "request queued" only after the job is durably recorded, and
  "researching" only while a backend holds a valid lease.
- Missing research capacity is a distinct state: the system does not pretend work is ongoing.
- A research task that has produced candidates is *awaiting independent review*.
  Source candidates are **not** a verified recommendation.
- If evidence is insufficient, tell the user and stop polling rather than looping forever.
- User can continue browsing; a saved private status link permits later lookup.
  Completion notifications by email / account / push **are not implemented**.
- No completion time or fabricated percentage of progress is exposed.

## Data flow

`POST /v1/research-requests` (categoryLabel, optional productLabel, useCaseKey)
→ category routing / clarification → persistent queue → worker claim →
(category: Phase 75 research + journal; product: separate product worker)
→ unreviewed status → externally authenticated independent quality check
→ publish verified result reference → `GET /v1/research-requests/:requestId`.

For an initial demonstration use the `examples/phase76-consumer-request.html`
page mounted at the same origin as the API. The **private** progress link contains
an access token in the URL fragment, which is not sent to the backend as part
of HTTP navigation; JavaScript transmits it via Authorization. It is a bearer
credential; do not share it. A logged-in user account and encrypted token management
are preferable in a production site.

## What is real in the phase 76 code

- TypeScript compiled; persistent JSON request ledger uses an exclusive directory
  lock, atomic replace and digest, with a deliberate single-host deployment scope.
- Request deduplication uses category + optional product + controlled use case;
  followers receive separate bearer tokens, only hashed credentials persist.
- Claims have lease tokens and bounded retry; expired claims can be retried;
  stale workers cannot overwrite successors.
- Integration invokes the Phase 75 coordinator for category investigations;
  a dedicated product-worker contract is available separately.
- HTTP submission + private status retrieval were tested over real loopback HTTP.
- Tests use fixture source references and local workers. No live web crawl,
  running LLM, deployed PostgreSQL or production website was exercised.

## Gaps to close before a public launch

1. Natural-language query parser: determine category and use case from an arbitrary
   user question (this prototype expects structured fields). Authenticate the parser
   and handle confidence, synonyms, language and ambiguous taxonomies.
2. Real source-discovery services with source-specific rights verification and a
   configured local AI model. Without configured workers the visible state is
   `awaiting_research_capacity`.
3. PostgreSQL backed transactional queue, distributed leases, audit logging,
   stale-lease handling, retries, alerts and operational monitoring; migration 011
   is a schema proposal only and is **not applied**.
4. Verified answer storage and authenticated human/independent QA. The code accepts
   a server-internal authorizer callback but cannot itself establish two independent
   original tests or the correctness of findings. It is deliberately not exposed via HTTP.
5. Production traffic controls: TLS, auth/session lifecycle, quotas, anti-abuse,
   safe content processing, CSRF/origin rules, user account notifications, privacy
   retention period, deletion, GDPR/UK GDPR and source-specific licensing.
6. Real UX tests, latency/budget measurements, email/notification opt-in and
   context-sensitive fallback (e.g. research cannot be completed).

Never claim that adding a candidate observation means the public recommendation is ready.

## Quality gate detail

- The internal publication attestation includes at least two distinct audited
  **original test IDs** and at least two separately recorded source-reference IDs.
- The queue checks that the referenced evidence IDs actually appear in the worker
  history. An independent authorized quality service must check whether those
  referenced test IDs really represent independent original work, whether the
  research complies with source rights, and whether the answer answers the
  particular user's need. A forged `authorizer = () => true` test fixture is **not**
  production verification.
- The app should check for an **existing verified answer first**; only unresolved
  or insufficiently supported requests should enter this on-demand research path.
