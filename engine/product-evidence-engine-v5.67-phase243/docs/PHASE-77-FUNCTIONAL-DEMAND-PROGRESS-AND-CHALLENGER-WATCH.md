# Phase 77 — Need-first decision research, honest progress and challenger triage
10 October 2026. **Research-only integration pilot**, not production.

## Architecture decisions

1. A user's desired outcome is **not** automatically a new product category. A functional demand can map to multiple existing solution families, provisional solution families, or no verified family at all. Structured demand includes outcomes, must-have criteria, exclusions and region. A human-confirmed or independently reviewed categorization is needed. The phase has **no natural-language classifier**; the `/v2/decision-research` endpoint deliberately rejects free-form user queries. In a public site an NLP/AI intake and user confirmation layer must precede it.
2. Request identity includes all controlled needs and exclusions, preventing inappropriate deduplication across users seeking different uses or safety constraints. No raw customer queries are stored in the research ledger. A classification taxonomy and privacy policy are still needed.
3. Search coverage is a methodological audit, **not a fixed top-5/top-10 quota**. Coverage requires a documented search boundary, reproducible discovery, accounted-for solution families, eligible comparable alternatives and distinct original tests. Two is only a *comparison floor*, not a scientific or marketing claim that the best products were found. It creates `eligible_for_comparative_review`, **never** a ready-to-publish product ranking.
4. New entrant signals are evaluated against confirmed user needs. Manufacturer announcements alone trigger metadata monitoring; relevant new original independent tests trigger targeted research. Duplicate original tests, blocked-source material, and irrelevant announcements cannot force ranking changes. Full category research is not automatically repeated.
5. `Phase77ProgressLedger` is a durable, single-host research progress record with a token-protected status query. A milestone starts only after an approved worker action, and is verified only after a trusted external callback checks a receipt. Stage statuses can be blocked/resumed. No fabricated percentage or predicted completion time is shown. `nextScheduledCheckAt` is present only after an **authorized real scheduler reservation**. The public API cannot invoke milestone or publication mutations. No outbound notifications are yet implemented. A backend implementation must provide a notification subscription/consent store, identity management and delivery receipts.
6. The prior Phase 76 queue remains intact for known category/product requests. Phase 77 provides a **separate need-first gateway and ledger** instead of mapping functional needs to phantom categories. The two are not yet merged into a production worker system; do not interpret the new HTTP endpoint as an autonomous research engine.

## Exact progress stages
`goal_review` → `solution_family_mapping` → `source_permissions` → `candidate_discovery` → `method_and_safety_review` → `candidate_evidence` → `comparative_quality_review`.

These are **verified milestones**, not a time or completion percentage. A stage can block when the next work step has no allowed source or an unavailable execution worker. Completion of all stages still awaits independent approval. A valid research request may remain unresolved indefinitely; the UI must show a truthful `blocked`/waiting state and, when possible, provide an alternative evidence-bounded answer.

## Site communication

- At receipt: “Abbiamo registrato la tua ricerca. Puoi lasciare questa pagina e tornare tramite il collegamento riservato.”
- During genuine worker execution: “Stiamo verificando le possibili soluzioni e le fonti disponibili.”
- When a stage is completed: show its short label and the timestamp, not an invented progress percentage.
- When blocked: “Ci mancano ancora prove sufficienti. La ricerca non sta avanzando in questo momento.”
- After backend-scheduled check only: “Il prossimo controllo è programmato per [data e ora].” This is **not** a promised answer date.
- Opt-in notification: **NOT available in the pilot**. Do not show a working alert button before a real, privacy-compliant delivery service has been connected.

## Files and tests
- `src/phase77_decision_research.ts`: need identity, cross-category routing, portfolio sufficiency audit and entrant triage.
- `src/phase77_progress_ledger.ts`: persisted progress and authenticated-by-backend milestones.
- `src/phase77_http.ts`: intake/status HTTP demo for pre-classified, confirmed demand; requires `authorizeIntake` supplied by the host.
- `tests/phase77_*.test.ts`: offline constructed examples, not real product recommendations.
- `db/migrations/012_demand_progress_and_challenger_watch.sql`: additive proposed PostgreSQL tables, not executed.
- `scripts/demo-phase77.mjs`: offline reproducible fixture, not live acquisition.
- `examples/phase77-discovery-status.html`: static site status view using private URL fragment `#id=req_...&key=<accessToken>`; must be served from the same authenticated-origin deployment as the API, with HTTPS. Not a standalone public production page.

Run `npm run test:phase77`, `npm test`, `npm run test:primary`, `npm run test:ingestion`, `npm run test:launch`, `npm run test:release`, `npm run demo:phase77`.

## Production gates / limitations
No connected search service; no live website crawler, LLM NLP, independently verified product comparison, job worker running continuously, deployed PostgreSQL, genuine automatic notifications, calibrated ETA or legal authorization to retrieve unreviewed pages. The HTTP adapter requires reverse-proxy/TLS, origin/CSRF checks, authentication, abuse limits, secure handling of bearer access tokens, service authorization, production DB transactions and worker heartbeats/lease recovery. Its `authorizeIntake` callback is a **test extension point, not an independently sufficient security control**. The file ledger uses checksums for accidental corruption, **not tamper-proof signatures**. The metadata `nextScheduledCheckAt` must only be set from an actual reserved scheduler job. Independent QA attestations must bind to real original-test and result provenance; never treat `approve:async()=>true` test doubles as authorization.

Do not claim a product is best because this phase says a portfolio is eligible for comparative review. The existing Phase 60/63/64/67 evidence-quality and publication gates remain applicable. The old 76 release artifact isolation must remain preserved.
