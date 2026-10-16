# Phase268 — Real evidence, autonomous research and the first authentic ranking

**Date:** 2026-10-16. **Start:** HEAD `f819320`, clean working tree. The store was verified before any change (remote
`50e117c`, live store identical, 1,374 events).

**Brief:** "PEE — Real evidence, autonomous research and first scientific recommendation".

**Tier vocabulary (principle 11):**

- **T1 synthetic:** fictional fixtures.
- **T2 authentic controlled:** authentic evidence through the real components, on a copy of the store, under a
  proposed policy or an evaluation-only signer.
- **T3 operational:** authentic evidence on the operational path, under authorised policy.

**Values.** No value bound to a product appears in this public report (S23, principle 9). Values, gold sets and full
answers are in the private repository `pee-knowledge`, under `private-eval/phase268/`.

## Summary

| Question | Answer |
|---|---|
| Authentic original professional-test observations PEE now holds | **10** rows in the operational store, unreviewed. They come from 10 Expert Reviews air-fryer reviews: 8 energy measurements that match the gold set, plus 2 cooking-time leads outside the gold scope. |
| Observations usable for ranking | **3** under the proposed default validation policy (**5** under the permissive alternative). **0** in production, because no policy is authorised and no production signer exists. |
| First authentic ranking | Produced at **T2**. The frozen request returns a deterministic, cited `ranked_recommendation` of 3 products by measured electricity use. "Best cooking results" is reported as not assessed. |
| What blocks production | Owner authorisation of 2 proposed policies, plus a production signing authority (Phase180/181 pinned key). |
| What blocks "best cooking results" | Policy `pee249` does not retain specialist verdicts from test publishers, and no comparable numeric cooking outcome exists across products. |

## A. Source discovery

The pilot ran under policy `pee268_test_evidence_pilot`, authorised by the owner brief; its durable copy is in the
private repository, under `policy/`. It used the existing tool `scripts/phase246-live-wave.mjs`, which reaches pages
through the Phase69 restricted transport with robots checks, as agent `ProductEvidenceResearchBot`.

**Budget used:**

| Limit | Allowed | Used |
|---|---|---|
| Publishers (hosts) | 5 | 3 |
| Page requests in total | 50 | 25 |
| Requests per host | 12 | at most 12 (Expert Reviews) |
| Delay between requests to one host | at least 5 s | 5 s or more |

Web searches went through the search tool, not to publishers: 8 queries. The full request log is in
`evaluation/phase268/pilot-requests.json`.

| Publisher | Requests | Original first-hand tests? | Outcome | Evidence boundary |
|---|---|---|---|---|
| Expert Reviews (UK) | 12: robots, 1 listing, 10 reviews | Yes. Named staff reviewers state an energy protocol: empty, 1 hour, 200 °C, plug-in power meter, every compartment. Cooking tests are qualitative. | 10 reviews fetched (8 development, 2 held out) | Accessible and processable |
| RTINGS | 4: robots, 2 reviews, 1 method page | Yes: a lab that buys its own units | Anonymous HTML carries only a membership notice; even the method page is gated. **Not bypassed:** the bytes were classified, not mined. | Discovered but inaccessible (paywall) |
| TechGearLab | 9: robots, plus 8 that are 4 identical redirects per page | Yes | HTTP 301 to the **same URL**, a cookie or anti-bot step. **Not bypassed.** | Discovered but inaccessible |
| Which?, CHOICE, Consumer NZ | 0 | Yes (labs) | Method pages are public; per-model results are for subscribers. They were not requested. | Discovered but inaccessible (subscriber) |
| Manufacturer blogs, affiliate "best" lists | 0 | No | Excluded. Manufacturer studies are never independent tests. | — |

**Defects found and fixed in the acquisition tool:**

- The tool repeated a redirect to the same URL 4 times; that cost 8 TechGearLab requests. It now stops on the first
  such redirect.
- The per-host delay was fixed at 4 s. It can now be raised by the budget, to 5 s here.
- A `maxHosts` cap was added.
- `Retry-After` is now recorded and honoured on any status.

**Evidence boundaries per gold measurement** (11 measurements in 10 documents, plus 2 documents with none):

| Boundary | Count | Where |
|---|---|---|
| No evidence exists | 2 documents | Two reviews contain no measurement. |
| Discovered but inaccessible | 5 pages | RTINGS (3), TechGearLab (2) |
| Accessible but not processable | 0 | — |
| Extraction failed (final extractor) | 3 | 2 result sentences with no first-person cue, in a review that states no protocol. 1 number written as a word. |
| Attribution failed | 1 | The page has no product markup (NewsArticle only), so the row stays `subject_unresolved` and is never forced onto a product. |
| Stored but cannot reach a decision | 3 | Validation under the default: empty load not established (2); duration not stated (1). Of the 8 extracted gold measurements, 3 were validated. |
| Reached but not comparable | 1 | A single-compartment value of a dual appliance is another measurand. |

## B. Real extraction metrics

The gold set is private. It was annotated by reading the transient bytes before the extractor run it scores, and it
contains only what the tester reports having measured. Full figures are in
`evaluation/phase268/extraction-metrics.json`.

| Run | Tier | Documents | Gold | Extracted | Leads outside gold | Tuned? |
|---|---|---|---|---|---|---|
| First run: the existing Phase225 probe, unchanged | T3 | 8 | 10 | **0** | 0 | no |
| After fixes | T3 | 8 | 10 | 7 | 0 | **yes (development)** |
| Held-out first run, extractor frozen (hashes recorded) | T3 | 2 | 1 | **0** | 2 | **no: held-out** |
| Final, after the held-out fix | T3 | 10 | 11 | 8 | 2 | **yes: not held-out** |

Why the existing extractor found nothing on real pages:

1. Testers write in the **first person singular** ("I measured", "in my tests", "in tests"). The cues covered only
   "we".
2. `200&deg;C` decoded to "200 C", so every temperature was lost.
3. Thousands separators: "2,000W" was read as 0 W.
4. Results are stated without a cue but are linked to **the review's own protocol section** ("One hour's usage at
   200 °C consumed …"). The new method cue `energy_result_with_document_protocol` covers kWh only.
5. The headline is marked up as the product. Expert Reviews' JSON-LD gives the Product the name "X review: tagline".
   Without `testDocumentSubject268`, the store would have recorded headlines as product identities.

The held-out miss was a two-word gap ("my energy tests"). The held-out false lead was a test load ("500g of …"). Both
were fixed **after** the held-out run, so the final row is tuned.

**Further measures:**

- **Conditions:** all 8 extracted measurements carry the gold conditions, or correctly report a condition as unstated.
  These conditions are setpoint, duration, empty load, compartments, and conditions from cold or including preheat.
- **Attribution:** 7 measurements go to the exact reviewed product; 1 is unresolved; 0 are wrong. No two products were
  merged; product keys are per host.
- **Retention:** 10 rows are kept under `pee249` class `independent_original_test` (numbers only; 9 products, within
  the cap of 25 per host). No page text is retained.

## C. Category, research packages, reusable teaching

- **Category:** air fryers. Only for this category did a publicly accessible original lab publish **numeric**
  measurements under a **stated, repeated protocol**. For coffee machines, CHOICE results are behind a paywall and the
  RTINGS-style labs are gated.
- **Owner research packages:** searched in this repository, the environment (`find /` by name), the private
  repository and the evaluation directories. **None of the three is present.** Missing:
  1. the air-fryer package;
  2. the dehumidifier package;
  3. the coffee-machine and grinder package.

  **Nothing was ingested from them, and nothing is claimed.**
- **Reusable teaching, planned and partly done:**
  - Need vocabulary through the existing lesson mechanism: `low_energy_use`, journaled in the store.
  - Publisher qualification and protocols as policy data (`ValidationPolicy268`), not code.
  - Extractor generalisations not specific to one site: first-person cues, entities, thousands separators,
    protocol-linked results, condition codes.
  - A second category needs:
    - a qualified publisher entry;
    - a protocol entry;
    - a scoring dimension.

## D. Evidence-to-ranking pathway (smallest defensible)

```
live page (transient bytes) ─ Phase245 + testDocumentSubject268 ─ Phase225 v2 probe ─ Phase265 screen
  ─ test_measurements265 (store v6: + condition_codes, protocol_codes, setpoint_c; unreviewed by CHECK)
  ─ validateTestMeasurements268 (policy: provenance, qualified publisher, exact product, protocol, conditions,
     duplicates, conflicts)
  ─ compileCatalog268 + points268 (fixed-anchor linear scoring) ─ UNSIGNED Phase181 catalog
  ─ signing (separate; Phase180/181 pinned key) ─ adviseFromRequest253 → existing dynamicKnowledgeAnswer181
```

**Reused, not replaced:**

- the Phase225/226/227 probe (extended);
- Phase245 extraction;
- Phase246 ingestion and the Phase249 retention policy;
- the `test_measurements265` table;
- the Phase177 snapshot;
- the Phase180/181 verification and ranking engine, unchanged;
- the Phase253 request path;
- the Phase250 lesson mechanism.

**The only new module** is `src/phase268_evidence_validation.ts`. The contract listed `evidence_validation` and
`comparable_assessment` with no component.

**Comparability rules:**

- One measurand: appliance energy over one hour, empty, at 200 °C, whole appliance.
- Lower is better.
- A single-compartment value is a different measurand.
- Equal values from different revisions count once.
- Different values are a conflict: none of them is used.
- The scoring is linear in kWh, so energy and cost are proportional. Its anchors are fixed by policy (0 kWh = 10,000
  points; 2 kWh = 0), so adding a product never moves another product's points.
- The raw value and unit stay with each point in the private run.

## E. Autonomous validation and scoring: status

The four responsibilities are separated:

1. **Scientific validation rules:** `validateTestMeasurements268`. They are deterministic, every rejection names its
   reasons, and nothing is written back to the store.
2. **Expert-source qualification:** `qualifiedPublishers` in the policy, with a recorded basis. Independence is
   **never** established. Expert Reviews is commercial: advertising and affiliate links.
3. **Deterministic scoring:** `ScoringPolicy268`.
4. **Certification and signing:** not in PEE code. Phase180/181 accept a catalog only when a pinned key signs it.

**Proposed minimum defaults and their alternatives**, with the result of each on the same 10 authentic rows (T2):

| Choice | Proposed default | Alternatives | Rows validated |
|---|---|---|---|
| Empty load | stated with the value, or in the **same review's** first-person protocol | only with the value (and no block context): **0**; also from the publisher's protocol in other reviews: **5** | **3** |
| Exact variant | product name accepted, with the limitation stated | require a declared model code: **1** | 3 |
| Conditions elsewhere in the same paragraph | accepted, with the limitation stated | refused (counted in "strict" above) | 3 |
| Qualified publishers | Expert Reviews for the energy measurand only | none (then nothing ranks) | — |
| Scoring | linear, anchors 0 and 2 kWh | raw-value ordering (identical order for one dimension) | — |

**Status:** both policies are `proposed_not_authorised`. No unreviewed row was promoted. The store still forces
`verification='unreviewed'` and `ranking_authorized=0`.

**Authorisation needed for T3 (operational):**

- (a) approve or amend `pee268-test-evidence-validation` r1;
- (b) approve or amend `pee268-energy-scoring` r1;
- (c) designate a production signing authority: either an owner-held key, or authorise PEE to sign automatically
  catalogs produced under the authorised policies, with a pinned key and expiry;
- (d) for cooking results, decide whether PEE-authored ordinal outcome classes per standard test may be retained,
  attributed to the specialist. These are classes, not the publisher's wording. Policy `pee249` currently excludes
  verdicts.

## F. First authentic advisory evaluation

The request was frozen in commit `25d8962` before any acquisition or ranking change (SHA-256 `8ef2d283…`): "Which air
fryer gives the best cooking results for one person while using relatively little electricity?"

| Run | Tier | Response | Ranked | Unassessed objectives |
|---|---|---|---|---|
| Baseline, before the change (`baseline-advice.json`) | T3 | clarification | — | "relatively little electricity" was not recognised at all |
| `authentic-advisory-firstrun.json`, committed unchanged | T2 | clarification: Phase181 **refused** the compiled catalog | 0 | all four |
| `authentic-advisory-after-fix1.json` | T2 | **ranked_recommendation** | 3 | single portion, crisp texture, best cooking results |

**First-run blocker:** the compiler put prose and "@" into reference fields that Phase181 accepts only as identifiers.
Phase181 correctly failed closed. The compiler was fixed; Phase181 was not changed. A fitness test now checks that the
compiled catalog is accepted.

**After-fix1 order** (proposed default; deterministic; each product cites its review):

1. Salter Crisp and Go Air Fryer
2. Typhur Dome 2 AF03 Air Fryer
3. Cosori Turbo Tower 10.8L Air Fryer

This order matches the order of the gold values. 12 discovered air fryers are held: they have no valid measurement.

**The answer states:**

- the dimension and its protocol;
- that the catalog is "not externally reviewed, machine validated, proposed";
- that the signature does not establish scientific quality;
- that market coverage is not established;
- "Not assessed: … best cooking results".

**Scientific limits** (the private run records them per product):

- one publisher and one protocol;
- empty-run energy is not energy per cooked portion;
- a dual appliance is measured with both drawers running, which disadvantages it for one person;
- two of the three products have no published model code;
- the reviews date from 2024 to 2026.

**Verdict.** This is a defensible ranking **for measured energy use under one stated protocol**. It is **not** a
recommendation for "best cooking results".

## G. Regression and integrity checks

- **Full suite (`npm test`):** run once with the extractor, store, validation and request changes in place, and again
  after the last edit. Both runs exit 0; the counts are in the commit message.
- **New tests:** `tests/phase268_evidence_validation.test.ts` (4, fictional data; the Phase181 acceptance check is test
  4). `tests/vertical_contract.test.ts` gains the principle 11 check.
- **Existing tests:** the Phase225/226/227/265 tests pass unchanged. `phase260` was updated for schema v6.
  `vertical_path_fitness` was updated for the new wording ("signed catalog"): the answer no longer calls a catalog
  "reviewed" unless its review reference says so.
- **Store:** schema v4 → v6 on first open. `knowledge-snapshot sync` pushed `b979396` (1,394 events, journal ok). The
  private repository commit `2e03e50` adds the policy, the gold sets and the full runs. No page bytes went to any Git
  repository.
- **Publication guard:** run on the commits to be pushed by the pre-push hook. The result is in the push output.

## H. Next-step recommendation

1. **Owner decisions (a)–(d) in §E.** This is the only path to T3. Without them PEE stays correct but advisory-only
   for performance.
2. **Carry each product's validation limitations into the answer text** (debt D6). Today they are only in the private
   run.
3. **Cooking results.** This needs decision (d), plus a publisher with a repeated, documented cooking protocol. Expert
   Reviews' hash-brown / chips / chicken protocol is repeated, but it is qualitative.
4. **Second publisher.** It must be accessible without a subscription and must publish numeric results. The rest of the
   remaining pilot budget is reserved for this: 25 requests, 2 hosts, until 2026-10-23.
5. **Small fixes:**
   - "results … little" is falsely recognised as `crisp_texture` (fuzzy match);
   - word numerals;
   - unresolved subjects need a review path.
