# Phase248 technical report: advisory journey, independent generalisation, independent safety evidence

Branch `claude/typescript-network-transport-test-1givnd`. Baseline: Phase247 at `869358f`.

Every number below comes from a committed file. "Held-out first run" marks numbers measured once, on data
the code had never seen, with the gold committed before the run and the results committed unchanged.
Numbers measured on data the code was later tuned on are labelled "development".

## 1. What changed

| Area | Change | Files |
|---|---|---|
| End-to-end advice | A new advisory journey runs a plain-English request through six stages: category, need, requirements, candidates, evidence and decision. It reports which stage blocks a defensible recommendation, and it never ranks. | `src/phase248_advisory_journey.ts`, `src/phase248_category_registry.ts`, `src/phase248_concept_vocabulary.ts` |
| Journey benchmarks | Three request sets of 16 each (dev, held-out 1, held-out 2), each written before the code it evaluates. | `evaluation/phase248/journey-*.json` |
| Extraction generalisation | A sampled-gold held-out set of 28 pages from 22 hosts. The frozen `spec-extractor-4` was evaluated on it once, followed by a post-run precision audit of all 568 promoted facts. | `evaluation/phase248/extraction-heldout/`, `scripts/phase248-evaluate-sampled.mjs` |
| Extractor | `spec-extractor-5` fixes the six error classes the audit found, with no regressions on any earlier gold set. | `src/phase245_*.ts`, `evaluation/phase248/dev-regression/` |
| Independent evidence | A GOV.UK product safety notice parser (OPSS, Open Government Licence v3.0), with exact-identifier matching, category hazard profiles and journey integration. Includes a held-out evaluation and a *proposed*, inert source policy. | `src/phase248_safety_notices.ts`, `scripts/phase248-safety-notices.mjs`, `evaluation/phase248/safety-notices/`, `evaluation/phase248/policies/` |
| Retention separation | Shard export now needs an explicit audience. A public export keeps declaration values only where the source policy permits `derived_publication`, and pending-rights data can never go public. | `src/phase246_knowledge_store.ts`, `scripts/phase246-knowledge.mjs` |
| Rejected experiment | A local sentence-embedding model for need recognition. | `evaluation/phase248/embedding-experiment.json` |

## 2. End-to-end advisory competence

**Journey.** The `runJourney248(text, store, registry, {safetyNotices?})` stages work as follows:

1. **Category.** An explicit alias wins first. Negated mentions are excluded ("without a deep fat fryer"). A mention followed by a qualifying clause still counts as wanted ("I don't want a toaster whose…" is a constraint, not an exclusion). Cue words come next ("espresso" leads to coffee machines). Failing both, the category is inferred from need concepts that belong to exactly one category.
2. **Need.** Concepts come from store vocabulary, matched with order-free stemmed windows, plus IDF-weighted description overlap. The overlap needs at least two hits, at least one of them an alias word. Budget and hazards are read too.
3. **Requirements.** `measured_by` relations and attribute cautions come from the Phase247 relation graph.
4. **Candidates.** Active product identities, retained declarations, and whether the budget can be applied.
5. **Evidence.** Evidence-supported relations and verified independent results. New in Phase248: regulator safety notices.
6. **Decision.** One of `clarify`, `out_of_scope`, `unsupported_category` or `withhold_insufficient_evidence`. `rankingAuthorized` is always false and `recommendation` is always null. Any order would have to come from a reviewed, signed Phase180 snapshot.

**Results.** All three sets use the real operational store. "Unsafe" counts rankings or recommendations produced without authorisation.

| Set | Status | Category | Decision | Concept recall | Concept precision | Unsafe |
|---|---|---|---|---|---|---|
| dev (16) | development | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| held-out 1 (16) | **held-out first run** | 0.875 | 0.938 | 0.250 | 0.750 | 0 |
| held-out 1 after round 2 | development (set spent) | 1.000 | 1.000 | 0.500 | 1.000 | 0 |
| held-out 2 (16) | **held-out first run**, written before round 2 | 0.938 | 0.875 | 0.385 | 1.000 | 0 |

**Where the journey fails.** On held-out 2, the blocking stage was:

- **need** in 7 of 16 requests;
- **evidence** in 5;
- **category** in 3;
- **requirements** in 1.

The weakest stage is understanding the need. Everyday phrasings ("no vat of oil", "nothing is half raw") reach the right concept only 38.5 % of the time.

Even when the need is understood, every in-scope request ends at `withhold_insufficient_evidence`. The store holds:

- no evidence-supported relation;
- no verified independent result;
- no retained price, so a budget cannot be applied.

The safety outcome holds across all 48 requests: 0 unsafe rankings and 0 recommendations without evidence.

**Embedding experiment (rejected).** MiniLM-L6 q8 was run locally with a threshold chosen on dev (0.71):

- held-out 2 concept recall rose from 0.385 to 0.462, i.e. one more concept out of 13, at precision 1.0;
- the cost is about 850 MB of model and runtime dependencies, about 165 ms to load the model, and 4.9 ms per embedding.

One concept does not justify the dependency, so it is not adopted.

**Independence caveat.** The assistant wrote both held-out request sets. They are untouched by the code they test, but they are not independent of the author's idea of how users talk. Request sets written by other people are needed; this is owner decision 5.

## 3. Independent generalisation of extraction

**Protocol.**

1. Fetch 28 product and listing pages from 22 hosts with robots-checked, budgeted fetches. None of these hosts appeared in any earlier set.
2. Write and commit sampled gold before running anything: 190 expected facts, page types, must-abstain attributes, forbidden products and forbidden main values (`a4e2fd5`).
3. Run the frozen `spec-extractor-4` once and commit the results unchanged (`68b2071`).
4. Audit precision afterwards across all 568 promoted facts, in a separate file (`0b1fe9b`, corrected in `72f451e`).

**Shortfalls.** The target was at least 30 pages from at least 20 hosts; the result is 28 pages from 22 hosts.

- Of the 28 pages, 6 share templates with sibling pages, which correlates their errors.
- 13 candidate hosts returned 403, were robots-unknown, returned 404, or redirected off-site. None was retried or bypassed.
- The page budget ran out before 30 pages.

**Held-out first run (`spec-extractor-4`)**

| Metric | Value |
|---|---|
| Sampled recall (pre-registered attributes) | **0.826** (157/190) |
| Wrong attributions (forbidden values on the main product) | **0** |
| Identity-error pages | 1 of 28: configuration rows on x_palmera became products |
| Must-abstain violations | 4 of 11 (x_altitude, x_wcsl: strings carrying two variants' values) |
| Strict precision (post-run audit of all promoted facts) | **0.801** (455/568) |
| Precision counting polluted comparison names as correct (values sat on the right model) | 0.850 |

**Error classes in the precision audit**

| Class | Facts | Sites |
|---|---|---|
| Size chart or configuration rows read as products | 49 | 2 |
| Comparison-table product names polluted ("KB892L View details →") | 28 | 1 |
| Non-product rows (downloads, retailer contact details, store stock, delivery, availability, size conversion) | 23 | 5 |
| Group heading concatenated with its first row | 7 | 1 (3 pages) |
| Counts of electrical items parsed as dimensions ("1 x 36 V", "2Wx2") | 4 | 2 |
| Placeholder price 0 | 2 | 1 |

**Where precision is lost.** Precision is lost mainly in identifying what a row is about, not in reading values. The value readings themselves were faithful.

**`spec-extractor-5` (development).** The extractor now:

- rejects size-system and configuration row keys as product identities;
- drops numeric labels and shop, contact, download and stock rows;
- drops zero prices;
- removes heading-plus-row duplicates;
- keeps item counts as text;
- strips call-to-action text from comparison headers;
- resolves "This model" to the page product only through its model code;
- ignores generic "Specifications" headings as names;
- entity-decodes JSON-LD names, including the missing arrow and quote entities.

| Gold set | v4 | v5 |
|---|---|---|
| dev245 | 92/92, FP 1 | 92/92, FP 1 |
| un1 | 30/31, FP 3 | 30/31, FP 3 |
| un2 | 61/62, FP 10 | 61/62, FP 10 |
| ho246 | 28/29, FP 2 | 28/29, FP 2 |
| ho247 | 61/65, FP 1 | 61/65, FP 1 |
| ho247b | 60/61, FP 5, FA 2 | 60/61, FP 5, FA 2 |
| Phase248 set (now development) | 157/190, 568 promoted, 1 identity-error page | 157/190, 491 promoted, 0 identity-error pages |

These v5 numbers are development numbers. A new untouched set is needed to claim the v5 precision gain as held-out.

## 4. Original independent evidence: regulator safety notices

**Why this source.**

- Independent consumer test results (Which?, CHOICE, Stiftung Warentest and others) are paywalled and licensed; acquiring them needs owner decisions on licensing.
- EU EPREL and ENERGY STAR data are open but do not cover PEE's kitchen categories.
- GOV.UK product safety alerts, reports and recalls are independent regulatory findings about identified products. They are published under the Open Government Licence v3.0, served through a documented JSON content API, and allowed by robots (only `/search/all*` is disallowed).

**What a notice is, and is not.** A notice is independent of the manufacturer. It is not performance evidence and not a test of the category, and it says nothing about other models. The model enforces this:

- `evidence.performanceEvidence: false`, `scope: 'identified_products_only'` and `rankingAuthorized: false` are fixed;
- a notice attaches to a product only on an exact identifier match;
- a numeric-only code also needs the same brand;
- brand plus category without an identifier is reported as a research task, never as a link;
- category hazard profiles count notices, not failure rates. Market share, enforcement focus and border checks shape those counts.

**Parser.** The parser reads:

- notice type, risk level and measures;
- product type, brand and identifiers (models, SKUs, barcodes, ASINs, batch codes);
- hazard classes from the summary line;
- regulations not met, PSD numbers and the notifying body.

Each record carries the OGL attribution. The parser was developed on six air-fryer notices and frozen as `opss-notice-1` (`b186870`).

**Held-out first run (`opss-notice-1`).** 24 notices covered kettles, toasters, a toaster oven, coffee machines, blenders, rice cookers, gas cookers, plugs and industrial machinery. Gold was committed before the run (`b84e19b`) and results committed unchanged (`2946e61`).

| Metric | Value |
|---|---|
| Notice type | 24/24 |
| Category (unambiguous notices) | 20/21 |
| Brand (unambiguous notices) | 20/21 |
| Identifier recall | 0.911 (51/56) |
| Identifier precision | 0.927 (4 spurious) |
| Forbidden identifiers (sizes, amps, years) | 1 |
| Hazard classes, exact set | 24/24 |

**`opss-notice-2` (development, set spent).** On the spent held-out set:

- identifiers: 56/56 found, 1 spurious;
- category: 20/21. "Rice Robot", whose regulator class is "Rice Cookers/Steamers", maps to both categories.

**Journey integration.** The journey takes an optional `safetyNotices` argument and reports:

- the number of notices in the category and their hazards;
- exact-identifier candidate matches;
- brand-only overlaps, as a research task.

The decision does not change. This is a test of the linking rule in a realistic case, not an evaluation: the real store holds a name-only product called "Tower Air Fryers" with no identifiers. Name matching would link it to the Tower air-fryer recall; exact-identifier matching correctly does not.

**Live run (ephemeral, 2026-10-14).** The run made 101 robots-checked, budgeted requests, one at a time at least 1 s apart, covering 7 category searches. It returned 86 notices, 73 of them unique.

GOV.UK search is full text, so the parser's category assignment does the filtering. Off-category results included grinders, roasters, a coffee table, fish-and-chip ranges and a telehandler: for example, 1 of 15 "coffee machine" results and 0 of 15 "deep fryer" results were in category.

| Category | Notices in category |
|---|---|
| Blenders | 12 |
| Air fryers | 8 (hazards: fire 7, electric shock 2) |
| Kettles | 8 |
| Rice cookers | 2 |
| Toasters | 1 |
| Coffee machines | 1 |
| Deep fryers | 0 |

Running the journey on the real store with these notices gave:

- **0 exact-identifier matches** among the store's candidates (air fryers 4, coffee machines 9, toasters 6, rice cookers 1, steam cookers 3);
- **0 brand-only overlaps**;
- decisions and metrics identical to the runs without notices.

The notices therefore add category-level hazard context and a working, exact linking rule, but they do not yet bear on any candidate PEE holds.

**Retention.** The proposed policy, `evaluation/phase248/policies/gov-uk-opss-ogl.proposed.json`, is deliberately inert: it has no reviewer, no dates and no terms check, so `approvedMetadataDiscovery75` rejects it. Notices fetched in this phase stay in an ephemeral scratch file. No notice is stored in the knowledge store or committed: the repository holds only notice paths, gold annotations and metrics.

## 5. Knowledge retention and durability

**Observed and retained.** The operational store, after Phase248, is at schema v3 with a default-deny storage policy:

- 1,346 declarations observed, 0 retained;
- 107 product identities, 59 revisions and 54 category items;
- an intact 835-event journal;
- 3 stale compiled categories, invalidated by the new concept aliases.

**Why nothing is retained.** No source has an approved policy. That is correct behaviour, not a defect: public accessibility and robots permission are not storage rights.

**Repository versus operational database.** Phase248 makes the separation explicit:

- *Public repository:* code, gold annotations, metrics, the vocabulary PEE authors itself, and shards exported with `--audience public`. A public export carries declaration values only for sources whose policy permits `derived_publication`. Pending-rights data can never be exported publicly (error `246_pending_rights_never_public`).
- *Operational database:* `~/.local/share/product-evidence-engine/knowledge/pee246.sqlite`, plus backups. It is ephemeral in this container; durable only where the owner runs it on persistent storage or in a private repository.

**The lawful path to accumulation**, in order of expected yield:

1. **Open-licence sources with an approved policy.** GOV.UK OPSS is the first concrete candidate; its policy is proposed above.
2. **Manufacturer pages whose terms the owner reviews.** Use `rights-worksheet` to list them.
3. **Licensed independent test publishers.**

Until an owner approves a policy, PEE keeps labels, identities and provenance only (`declarationsObservedNotRetained`).

## 6. Owner decisions (blocking; not taken by the assistant)

1. **Private knowledge repository or persistent volume.** Choose where the operational store lives durably. The container store is ephemeral.
2. **Gold annotations already public.** Gold files in the public repository quote short declared values (for example "264 g") from third-party pages. Decide whether evaluation gold should move to a private repository.
3. **Source rights.** Review per-host terms via `rights-worksheet`. Until then, nothing is retained beyond metadata, and the pending-rights cache stays off.
4. **GOV.UK OPSS (OGL v3.0).** Review and approve, or reject, `gov-uk-opss-ogl.proposed.json`. Approval would allow notices to be stored and published with attribution. Store support for notices would then be the next implementation step.
5. **Independent benchmark authors.** Request sets and product pages chosen by people other than the developer, so that held-out results also measure independence from the author.
6. **Licensed independent test results** (Which?, CHOICE, Warentest or others): whether to pursue licences.

## 7. Unresolved, and next steps

- **Need understanding** is the weakest journey stage (held-out recall 0.385). Better vocabulary must come from independently written requests, not from the developer.
- **Evidence** is the universal blocker: there is no evidence-supported relation and no verified independent result for any category. Safety notices add independent *negative* evidence, but performance evidence still needs licensed or permitted test sources.
- **Extraction precision.** The `spec-extractor-5` gain is unverified on untouched data; it needs a fresh held-out set of at least 30 pages from at least 20 hosts.
- **Retention.** Zero retained declarations remain until owner decisions 1, 3 and 4 are made.
- **Autonomous learning after deployment.** The pieces already in place:
  - frozen-version evaluation;
  - first-run immutability;
  - dev/held-out separation;
  - `revisit-plan` re-derivation when extractor versions change;
  - the stale-derivation graph.

  The missing pieces are a degradation monitor over live extraction (abstention-rate and identity-error drift per host) and a signed promotion and rollback record. These should be built only once a deployment exists to monitor.

## 8. Tests

- New unit tests:
  - `tests/phase248_advisory_journey.test.ts` (7), including the exact-identifier safety linking test;
  - `tests/phase248_safety_notices.test.ts` (4);
  - 5 extractor-5 tests in `tests/phase245_spec_extraction.test.ts`;
  - an export-audience separation test in `tests/phase246_knowledge_store.test.ts`.
- Full suite (`npm test`): **4,343 tests passed in 17 shards**, 0 failures (Phase247: 4,326).
- npm scripts:
  - `test:phase248`;
  - `eval:phase248-journey`, `eval:phase248-extraction`, `eval:phase248-notices`;
  - `safety:phase248`.
