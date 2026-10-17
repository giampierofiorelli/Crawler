# Phase270 — Independent review fixes and the next operational milestone

**Date:** 2026-10-17
**Brief:** owner brief "PEE — PHASE269 INDEPENDENT REVIEW AND NEXT OPERATIONAL MILESTONE".
**Supersedes:** `docs/phase269/SCIENTIFIC-INTEGRATION-REPORT.md` as the current status.
**Status:** stopped for independent review after the bounded experiment, as the brief requires.

All Phase268/269 baselines, negative results and safeguards are kept. Every first run is committed unchanged. Tuned
results are labelled as tuned.

## Summary

- **Ranking authorisation.** Ranking is now authorised only by positive evidence. One verification is used on every
  path that consumes catalog evidence.
- **Raw quantities.** They can no longer be mistaken for scores.
- **Response and decision.** The response now matches the decision.
- **Signing.** A dedicated signer works with evaluation keys only. Production signing is not activated.
- **Qualitative codes.** They can be retained under a narrow amendment.
- **Bounded pilot.** It used 15 of 24 requests on 3 new publishers, with no access restriction met. It found the first
  authentic **energy and time per completed dish** for identified appliances (Which? lab). It also found a home
  smart-meter test (lovemoney).
- **Extraction on these six untouched documents.** Quantitative extraction went from **0/60 to 37/60** (precision
  0.925). Qualitative extraction stayed at **1/24**.
- **Generalisation set.** On the frozen 13-request set, correct decisions went from **7/13 to 9/13**.
- **PEE still cannot produce a genuinely complete recommendation** (§9).

| Commit | Content |
|---|---|
| `78deb0e` | Generalisation set frozen with its baseline (before any change) |
| `fb2a937` | Untouched-extraction rules and extractor hashes frozen (before any fetch) |
| `7a39720` | Pilot first run, unchanged |
| `4181cca` | §2, §3, §5, §10 fixes |
| `cabd2b5` | Signer |
| `13abd27` | Comparative reader, qualitative reading and held-out after-run |
| `a710db7` | Qualitative retention |
| `ed0666b` | Teaching and dehumidifiers |
| `bc26f8c` | Generalisation after-run |
| `5316958` | Publication acknowledgements |

## 1. Verification defects fixed

### Ranking authorisation (§2)

The Phase269 rule `return !m||!k||…` let an unknown measurement, or a need without category teaching, authorise a
ranking. It is replaced by `outcomeAuthorised270` (`src/phase253_request_advice.ts`).

A scored catalog dimension assesses an outcome only when **all** of the following hold:

- category teaching exists for the need;
- the dimension's measurement is known to that teaching (a signed `measureId`, a measurement key, or a known protocol);
- a `measured_by` relation links this measurement to the outcome;
- the measurement is not marked as a proxy (`not_sufficient_for`);
- every `requires_condition` is met by the dimension's signed `conditionsMet`;
- the dimension carries a score at all.

In addition, an overall ranking requires **every** stated outcome and every unresolved factual need to be assessed.
Otherwise the answer says "not every stated objective is assessed" and keeps them unassessed.

Which explicit policy allows a legitimate ranking: the category teaching (relations cited to their package source)
together with the signed catalog. The vertical fitness world now states this: coffee teaching, signed
`measureId:'espresso_sensory_assessment'` and `conditionsMet:['same_beans_and_grind']`. One Phase269 test asserted
the permissive behaviour ("without the teaching, the same catalog still ranks"). It now asserts that the same catalog
does **not** rank.

Negative tests are in `tests/phase270_ranking_authorisation.test.ts`. Each case refuses, keeps the objective
unassessed and states why:

- unknown measurement;
- unknown catalog method;
- missing category teaching;
- a known measurement of another outcome (no `measured_by`);
- missing essential condition;
- a known proxy;
- a valid catalog for an unrelated category;
- an unassessed essential objective.

### Catalog verification on every evidence path (§3)

`verifySignedCatalog181` is exported from Phase181. It reuses Phase181's signature check and `validateCatalog`. It
checks:

- the pinned key and the Ed25519 signature;
- content and original-test reference integrity;
- category and market;
- the validity interval at the authority's date;
- optionally, permitted policy revisions.

Phase253 verifies the catalog once and passes only the verified catalog to both the ranking and the goal assessment.
The partial comparison also requires a policy revision listed in `PARTIAL_COMPARISON_POLICY270`. A rejected catalog
adds a limitation and a `need_review` research item, and none of its values appear.

Fault-injection tests: invalid signature, expired catalog, unpinned signer, measurements altered after signing, wrong
market and unpermitted revision. For each, the test checks that no measurement value appears anywhere in the answer.

### Non-scoring representation (§5)

`KnowledgeDimension181.valueKind:'raw_quantity_only'`, emitted by `compileCatalog268` for r2:

- Phase181 rejects a raw dimension whose `valuePoints` is not 0, or whose test lacks `measured`.
- Phase181 never ranks on a raw dimension: no order, no tie.

### Consumer-facing integrity (§10)

- `Advice253.response` gains `partial_comparison` and `no_purchase_check`. When the goal assessment decides one of
  these, the response mirrors it. An order survives only when the decision is `ranking`. There is one decision, not
  two engines.
- The no-purchase statement begins "Buying may not be necessary". It names the **taught** alternative, for example
  "There may be a leak … repair and ventilation come before any appliance", and never says "do not buy".
- D2: unresolved factual needs, such as `batch_capacity`, are listed among the unassessed objectives.

## 2. Production authorisation boundaries

| Item | Status |
|---|---|
| Validation r2 (`pee268-test-evidence-validation:r2`) | `authorised_partial_comparison_only` (owner §4). Labelled partial comparisons of raw quantities, after catalog verification. No recommendation, no ranking, no exact-variant promotion of `product_name_only` identities |
| Scoring r2 (`pee268-energy-scoring:r2`) | `authorised_partial_comparison_only` (owner §5). Raw quantities only, `valueKind:'raw_quantity_only'` |
| Signer `src/phase270_catalog_signer.ts` | Compiles the catalog itself from a validation run and the exact policies (it never signs a supplied catalog). Checks the permitted revisions, category and market scope, validity at most 7 days, and that the validation run matches the named revision. Self-verifies with `verifySignedCatalog181`. Its audit record holds digests only. Keys are closure handles; the private key is never returned or serialised |
| Evaluation keys | `evaluationSigningKey270()`: ephemeral, in memory, keyId `eval_…`. Used by `phase269-teaching-eval.mjs --catalog r2` |
| Production signing | **Not activated.** `productionSigningKey270()` always refuses. A production authority that pins an `eval_` key is refused (`assertProductionAuthority270`) |
| Qualitative codes | Retained under `pee249-factual-observations-v2-qualitative-codes` (§7), never ranking input |

### Proposed owner-controlled production setup (for decision, not implemented)

1. **Key generation and custody.** The owner generates the Ed25519 key on their own machine
   (`openssl genpkey -algorithm ed25519`) and encrypts it with a passphrase (`openssl pkcs8 -topk8 -v2 aes256`).
   - It stays outside every repository, evaluation file and log, and Claude never holds it.
   - Only the public key is committed, as a pinned authority entry with keyId `pee_prod_YYYYQn` and a validity window.
     Phase200 anchors already model `activeFrom` and `activeThrough`.
2. **Signing runs where the key is.** The owner runs a signing command that loads the key from a path given at run
   time. It calls `signCompiledCatalog270` with a production signing policy, which still has to be written and
   approved. Claude produces only the unsigned compiled input and its digest for the owner to review.
3. **Rotation.**
   - A new dated keyId each quarter, or at once on suspected exposure.
   - The old key's window is closed in the authority file. Catalogs expire within 7 days, so they are re-signed under
     the new key.
4. **Cost.** No paid dependency: OpenSSL and Node crypto only.

## 3. Quantitative extraction on new sources (§8)

### Freeze and annotation

Rules and extractor hashes were frozen before fetching (`evaluation/phase270/untouched-extraction-rules.json`,
`extractor-freeze-untouched.sha256`). The gold was annotated from the transient bytes **before any extractor run**: 60
measurements, plus negative controls (private: `pee-knowledge/private-eval/phase270/`).

| Document | Publisher | Gold content |
|---|---|---|
| `w_vs_oven` | Which? lab, air fryer vs built-in oven | Energy, time and tariff-derived cost for 4 dishes; named Morphy Richards 480003 and Bosch HHF113BR0B |
| `lm_test` | lovemoney journalist home test, smart meter | Lakeland Dual Basket, name only |
| `tr_electricity` | TechRadar, calculations only | 0 measurements: every number is a negative control |
| `tr_af300` | TechRadar review | Ninja AF300UK |
| `w_ninja_brand`, `w_tower_t17102` | Which? listings | Publisher-derived annual running costs |

### Diagnosis on the development documents

The development documents are CHOICE, Consumer NZ and Expert Reviews. The causes of the Phase269 result (0/12, 1
false positive) were:

- **Structure.** The probe reads at most 380 blocks, and the CHOICE article starts after block 500 of 1,084.
- **Lists.** Results are `<br>`-separated lines inside one paragraph.
- **Formats.** Times are written `36min`; costs in `cents`.
- **No comparative reader.** Results attributed to several appliances had no reader.
- **Cue.** The document has no first-person cue near the value.

### Fix: `src/phase270_comparative_results.ts`

A reader for results attributed to several appliances. It is wired into `testLeadsFromHtml265`
(`comparative270`); extraction only, not retained.

- **Sources.** Tables (appliance rows, time, energy and cost columns), `<br>` lists and first-person prose.
- **Measurands.** Duration, energy and cost stay separate.
- **Not results:** tariffs, prices of £10 or more, bounds, ranges, added time, and annualised or hypothetical figures.
- **Attribution.** By clause.
- **Class rows.** Resolved to a named product only when the document's own subject statement names exactly one product
  of that class.

### Held-out discipline

Cue phrases first seen while annotating the held-out documents were **removed before the after-run**:

- `our appliances`, `opted to test`, `prepared`, `calculated`, `expert-led test`, `our research`, `test lab`;
- the `than the …` target rule;
- `sells for`.

Generic numeric hygiene written after that reading stays, and is declared: £ amounts, number words, bound and range
words. The after-run is therefore held out from tuning, but its documents were read by the annotator.

### Results

| Measure | First run | After change (held-out, single run) |
|---|---|---|
| Leads | 0 | 40 |
| Matched / gold | 0 / 60 | **37 / 60** |
| Precision | — | **0.925** |
| Recall, all gold | 0 | 0.617 |
| Recall, excluding publisher-derived annual costs (not targeted) | 0/40 | **37/40** |
| Duration per completed task | 0/15 | 13/15 |
| Energy per completed task | 0/9 | **9/9** |
| Cost (tariff-derived) | 0/8 | 8/8 |
| Cost (smart meter) | 0/8 | 7/8 |
| Annual running cost (listings) | 0/20 | 0/20 |
| Exact subject attribution | — | **0.351** |

Development (tuned): CHOICE 0/12 → 12/12 with 0 false positives.

**False-positive causes (3).**

- A comparison target is taken as the subject: "At only 6p … than the oven" is attributed to the oven. The rule that
  fixed this was removed, as above.
- A preheat-cost component (17p) is a real measurement, but it is absent from the frozen gold.
- A time setting ("stick it on for 10 minutes") is read as a result.

**Attribution.** The 24 Which? values are found but stay at class level, because the subject cue was removed. This is
the main remaining extraction defect: an appliance list ("Our appliances: …") is a generic structure that should be
learned on a new development document.

**Misses.** A range ("12p to 17p"), an upper bound ("under five minutes"), and the listing pages, which have no
first-person test cue.

## 4. Qualitative extraction (§7)

### Retention

- **Policy.** The `QUALITATIVE_AMENDMENT270` amendment, `pee249-factual-observations-v2-qualitative-codes`.
- **Store.** Schema v7 `qualitative_observations270`. It holds codes only: dish, outcome, direction, hedging, setting
  changed, comparative, appliance, dish-from-heading, identity state and block hash.
- **Schema checks.** The CHECK constraints set `ranking_input`, `laboratory_measurement` and `independent_finding` to
  0.
- **When codes are kept.** Only when the revision keeps values under the class policy, and only for
  `independent_original_test` sources. This means the same per-host cap and the same honoured reservations as for
  measurements.
- **Never published.** Public shards are empty.
- **Ingestion.** The wave tool attaches the codes to every observation.

### CHOICE 0/2 diagnosis

- The same 380-block bound.
- The contrast "the oven pie had slight burning…, **while** the air fryer pie had a better crust and more even
  browning" was read as one clause.

### Fix

Inside the same module, with no new architecture:

- read up to 1,500 blocks;
- headings (`h2`–`h4`) give the dish context;
- `while` and `whereas` split clauses, and each clause carries its appliance.

### Results

| Set | Before | After |
|---|---|---|
| Development: CHOICE | 0/2 | 2/2 (+1 code that is true but outside gold) |
| Development: ER | 15/16 | 15/16 (unchanged) |
| **Held-out (6 new documents)** | **1/24**, precision 0.5 | **1/24**, precision 0.2 |

**Held-out failure causes.** These were not tuned:

- Which? states its outcomes in short table cells ("5* Juicy, …") with no first-person cue.
- lovemoney's first-person verbs ("we could cook", "opted to test") do not pass the document gate.
- "halloumi fries" is coded as chips; sausages are not in the dish vocabulary.
- A generic sentence in a calculation article gave 2 false codes.

## 5. New frozen generalisation results (§9)

The set is `evaluation/phase270/gen-eval-set.json`: 13 untouched requests (G1–G9 air fryers and coffee, H1–H4
dehumidifiers), frozen in `78deb0e` with the baseline. The after-run is `gen-after.json` (`--catalog r2`, run once).

| Behaviour | Baseline | After |
|---|---|---|
| Outcomes recognised | 0.346 | **0.615** |
| Relevant criteria | 0.364 | 0.545 |
| Proxies rejected | 0.429 | 0.714 |
| Conditions | 0.364 | 0.545 |
| Unassessed kept explicit | 0.269 | **0.615** |
| Decision | 7/13 | **9/13** |
| Proxy-assessed failures | 0 | 0 |

**Gained:**

- G3 ("least power", partial comparison);
- H3 (mould after a leak, now a no-purchase check).

**Still failing (not tuned):**

- G1 "twin-drawer … main and a side together";
- G5 "crunchiest";
- G9 "most consistent shots";
- H4 "cheapest to run".

Teaching phrases that also occur in a G or H request are listed in `OVERLAP270` and were taken from development
requests or the package, not from the set:

- `least power` (G3, from development request U6);
- `windows are wet` (H1);
- `unheated` (H2);
- `mould behind` (H3).

The last three are package B utterances. H1–H3 are therefore partly package-derived requests.

The Phase269 teaching and coffee sets were re-run under r2 (`*-phase270-r2.json`) and score 1.0. They are **tuned**:
U4, U6 and C2 were used as development cases.

## 6. Cross-category learning, including dehumidifiers

- **Teaching deltas** (`src/phase270_teaching.ts`), through the Phase252 mechanism only:
  - U4 aliases (dual zone) and the two-zone simultaneous test, which requires `compartments_in_use`;
  - U6 `least power`;
  - C2 `traditional italian espresso`.
- **Dehumidifiers.** Minimal registry entry and teaching pilot from package B:
  - outcomes: moisture removal and energy per litre;
  - measurement: `removal_at_room_conditions`, `energy_per_litre_matched`;
  - condition: `matched_temperature_humidity`;
  - proxies: declared capacity and rated power;
  - context needs: cold room, and leak or structural alternative (a no-purchase check).
- **R01–R37 status.** Package B cites R01–R37, but its source register (§17) is empty. Every dehumidifier lesson is an
  `instructor_hypothesis` that says "Awaiting source verification: package refs R…". No reference was reconstructed.
  A test enforces that every dehumidifier lesson carries the mark.
- **Generalisation.** On H1–H4 the decisions are 3/4. The categories transferred without new code: the
  goal-relevance machinery is generic.

## 7. Authentic evidence for complete cooking tasks

The Which? lab article reports, for four dishes (roast chicken, chips, jacket potato, cake):

- cooking time, energy (kWh, preheat included) and tariff-derived cost;
- for one named air fryer (Morphy Richards Health Fryer **480003**) and one named built-in oven (Bosch Serie 2
  **HHF113BR0B**);
- with the same food quantities, except the cake (reduced in the air fryer: incomparable);
- with a star rating and a short quality note per dish.

This is the first authentic **energy per completed cooking task** that PEE has read for identified variants.

lovemoney is a home smart-meter test of a Lakeland dual-basket fryer (name only) against the author's unidentified
oven and grill.

**Limits:**

- One air fryer per publisher, so no cross-model comparison of air fryers is possible from this evidence.
- The values are held privately (gold, runs) and are not in the operational store: comparative appliance-level results
  have no retention path yet (owner decision 1 below).
- Which?'s per-model reviews hold only annualised running costs on listing pages. Its member-gated test results were
  not accessed.

Pilot record (`pee-knowledge/private-eval/phase270/pilot-request-log.json`, no page bytes):

- 15 of 24 requests: 3 robots files, 12 page requests;
- per host: Which? 10 (two 301 redirects of older URLs to the same article), lovemoney 2, TechRadar 3;
- 0 refusals, 0 errors;
- 5 s or more between requests to the same host;
- policy `pee-knowledge/policy/phase270-bounded-pilot-policy.json`.

## 8. Remaining evidence gaps and owner decisions

1. **Comparative results retention.** Should appliance-level comparative results be retained, for example "air fryer
   X vs oven Y, same dish, energy per task"? A product-bound result needs a resolved named subject. Proposal: a store
   table like `test_measurements265`, keyed by task, with appliance and subject identity, under pee249 v1 measurement
   kinds and caps.
2. **Production signing setup.** Adopt or amend §2's proposal, and approve a production signing policy.
3. **Evidence for a real comparison.** At least two air fryers measured under the same completed-task protocol are
   needed. Which?'s per-model energy data is behind membership (not bypassed). An owner decision on a licensed or
   member data source, or a further pilot for publishers with multi-model completed-task tests, is needed.
4. **Dehumidifier register.** Supply package B's source register (R01–R37) so that the lessons can be verified.
5. **Next extraction work, on new development documents:** document appliance lists as subjects, table-cell
   qualitative outcomes, and comparison targets.
6. **Open debt.** Contract debt is updated: D1, D2 and D5 are narrowed, D6 stays open, and D7's retention is
   resolved, but its reader is weak.

## 9. Can PEE produce its first genuinely complete recommendation?

**No.** For air fryers, the consumer objectives are energy per completed meal and cooking outcome.

- PEE now holds an authentic, relevant measurement of energy per completed task for **one** air fryer against **one**
  oven.
- It holds no comparable measurement for any second air fryer.
- No measured cooking outcome is retained as a ranking input.

The ranking authorisation now refuses everything short of this, by design. The honest answers PEE can give are:

- labelled partial comparisons;
- no-purchase checks;
- targeted research.

The core mission is **not** complete.

## Verification

- **Full suite:** 4,533 tests passed (`npm test`, 20 shards).
- **New tests:**
  - `phase270_ranking_authorisation` (8);
  - `phase270_catalog_signer` (3);
  - `phase270_comparative_results` (3);
  - `phase270_qualitative_retention` (2);
  - `phase270_teaching` (2).
- **Vertical fitness and contract tests:** passed.
- **Store:** migrated to v7 and taught; `knowledge-snapshot.mjs sync`, then `verify`: `integrityOk`, `journalOk`,
  `liveContentMatchesRemote`.
- **Publication check:** 0 findings, 2 reviewed acknowledgements. The check now accepts line-exact acknowledgements in
  `docs/architecture/publication-acknowledgements.json`:
  - a frozen request mentioning a common pump pressure;
  - a fixture price that coincided with a retained price (changed).
