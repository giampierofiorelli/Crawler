# Continuous scientific learning — Step 1D-B: frozen, unseen HTML evidence validation

This is the owner's Step 1D-B brief of 2026-10-18. It follows Step 1D-A2 (`docs/plans/experience-pilot-step1d-a2.md`, frozen
candidate ebda3d4) and original Step 3 (`docs/plans/continuous-learning-step3-versioned-reading.md`, 4a24561). It supersedes
no report. It closes the independent-page validation of Step 2. Step 4 was not started.

**Tiers.** T2-untouched first run on 10 new pages (this report). Development results quoted for comparison are labelled.
Nothing here is production.

## 0. Outcome

1. **The HTML-first reader's main benefit did not transfer.**
   - On 89 reference values from 10 unseen pages, the full candidate C finds **18 correct against 15 for the Step 1D-A
     baseline A: +3.**
   - All +3 come from the structural identity layer B, on one comparison page.
   - **The structured test-table reader added 0 values.** On the development set it added +26 (60 → 86 of 163). Here 22
     of the 51 values that no arm reads sit in table cells.
2. **Safety held.** Every pre-registered gate passes, on the frozen scorer and after source-based adjudication:
   - 0 new wrong-product or wrong-variant values;
   - 0 merged products;
   - 0 new declarations read as results;
   - 0 page titles or headlines accepted as a product by B/C;
   - 0 baseline successes lost;
   - experience replays unchanged.
   B also **removes** harm: the baseline's 1 wrong value (4 wrong leads: one rival model's results bound to another
   model) and its 2 headline "main products".
3. **Pre-registered verdict: benefit partial** (+3 is below the +5 threshold, gained in 1 document from 1 publisher). The
   gates pass. **Recommendation: revise on development evidence, then run a new untouched test. Do not integrate in
   Step 4 yet** (§10).
4. **Three problems shared by every arm** matter more than the arm differences (§6):
   - 21 of 87 reference declarations (certified CADR, rated motor wattage, tank capacity, packaging times) become test
     leads;
   - none of the 18 correct leads carries the test condition (fan speed, mode) that 88 of 89 reference values state;
   - 3 of the 10 pages are client-rendered: their text sits in `data-props` JSON, so a static-HTML reader sees nothing.
5. **Budget:** 14 of 20 requests (3 robots, 1 redirect, 10 pages), 3 hosts, no stop, no reservation; 0 retries.

## 1. Source selection and HTTP accounting

**Protocol** (`evaluation/step1d-b/protocol.json`): committed in 59de1fc before any request. The ordered list and its
substitutes (`evaluation/step1d-b/source-selection.json`) were committed in 9117e94, also before any request.

**Candidate search.** Candidates came from search titles and the search tool's own summaries only, in 9 searches. Every
candidate whose summary showed a measured value was excluded (9 pages). All 15 candidates are absent from 3,060 earlier
canonical URLs (`step1d-b-eval.mjs screen`: 708 files plus the store's revisions, read-only).

**Publishers not used:**
- PCMag, Serious Eats, Good Housekeeping and CNET block Anthropic's crawler (the search tool refused them). This was
  treated as a reservation: nothing was requested.
- Consumer Reports and Which? are paywalled.

| Tag | Publisher | Category | Page type (reference) | Reference values / declarations / qualitative | Product JSON-LD |
|---|---|---|---|---|---|
| s1db_tv_rt_u7n | RTINGS | TV | single review | 0 / 0 / 0 (client-rendered) | no |
| s1db_tv_rt_best_budget | RTINGS | TV | roundup | 0 / 0 / 0 (client-rendered) | no |
| s1db_tv_rt_best_oled | RTINGS | TV | roundup | 0 / 0 / 0 (client-rendered) | no |
| s1db_ap_apf_a231_hpa100 | AirPurifierFirst | air purifier | comparison | 22 / 15 / 9 | no |
| s1db_ap_apf_ap1512_5500 | AirPurifierFirst | air purifier | comparison | 26 / 15 / 12 | no |
| s1db_ap_apf_best_hepa | AirPurifierFirst | air purifier | roundup | 22 / 15 / 12 | no |
| s1db_ap_apf_a231_p800 | AirPurifierFirst | air purifier | comparison | 10 / 13 / 8 | no |
| s1db_af_ih_af400 | Ideal Home | air fryer | single review | 0 / 9 / 10 | yes |
| s1db_af_ih_doublestack_af400 | Ideal Home | air fryer | comparison | 0 / 5 / 10 | no |
| s1db_dh_ih_best | Ideal Home | dehumidifier | roundup | 9 / 15 / 12 | no |

**Requests.** All three robots.txt files allow every listed path, and none carries a Content-Signal, TDM or
Anthropic-specific rule. One same-site 301 redirect was followed and counted. The post-fetch gate found:
- no noai or TDM marker and no login or paywall;
- no canonical link to a URL used before;
- closest earlier page by 8-word shingles at Jaccard 0.063 or lower.

The page bytes stay in the private evaluation directory. The request log, gate result and reference are in pee-knowledge
`private-eval/step1d-b/`.

**Shortfalls.**
- 3 publishers, not 4.
- No dishwasher or coffee-machine page, and no single-product air-purifier review, was found without exposure.
- Only 2 publishers carry reference values (AirPurifierFirst 80, Ideal Home 9).
- The two Ideal Home air-fryer pages report no measured number: their times are chosen settings or packaging times.
- The RTINGS pages are unreadable as static HTML.
- Ideal Home belongs to the same publishing group as two development publishers.

## 2. Frozen commits, configurations and reference procedure

**Frozen before any request (59de1fc):**
- the arms (A `candidate_1c_inventory`, B `candidate_1c_semantics`, C `candidate_1c_semantics_tables`);
- metrics, safety gates G1–G6 and the decision rule;
- adjudication classes;
- the plan digests of 6 taught categories;
- the code freeze: 277 hashes of every compiled module, the observer, the harness, the wave script and the protocol.

**Candidate check.** Before the freeze, the current build re-ran the Step 1D-A2 development evaluation identically to
`step1d-a2-dev1.json` on 21 of 21 documents. So the candidate at this build is ebda3d4's arm C. Step 3 changed no output.

**Rehearsal.** An offline rehearsal on 2 spent Step 1C pages reproduced the 1D-A2 per-arm results exactly.

**Reading configuration (Step 3).** Recorded per document. A/B read with the category plan and no semantic reading; C
reads with the plan and `pee.document-semantics.v1d2+tables1d2.v1`. This gives 4 distinct C identities, one per category
plan; each digest equals the frozen one.

**Reference.** Written by a separate Claude agent with a fresh context. It saw only the plain-text renderings and the
frozen rules: no code, no output, no earlier case. This is separation from the extractor output, not independent human
adjudication. It was sealed (gold `f2d14ee8…`) in d44571e and f0bd7aa before any arm ran.

| Reference content | Count |
|---|---|
| Values | 89 (85 exact, 4 shared, 2 uncertain) |
| Declarations (negative controls) | 87 |
| Qualitative observations | 73 |
| Values with a stated condition | 88 |

The annotator's main judgement calls:
- rated "power consumption" rows and certified CADR are declarations;
- per-speed noise and power tables are measurements;
- a stated equivalence (A231 = A230 / "Winix Zero") is accepted only where the page states it;
- 5510 vs 5500-2, HealthPro Compact vs Plus and AF300 vs AF400 are kept apart.

**Harness amendment 1** (`evaluation/step1d-b/harness-amendment-1.json`, fa27609). The first `run` call stopped on its
first document, before producing any lead or score: the reference names documents by `doc` and the harness read `tag`.
The fix is one line (`tag ??= doc`). Only the script's hash in the freeze changed; arms, scorer, reference and protocol
are unchanged. The cause is an instruction defect (the annotator was not told the key), and it is recorded as a finding.

## 3. First-run results (T2-untouched; committed unchanged as 4bc6c35 / private c0130ed)

Item classes by the frozen Step 1C scorer: 89 reference values, 38 read by at least one arm.

| Arm | Correct | Wrong product / false identity | Unresolved | Missing | Declarations read as leads | Leads (correct / wrong / unresolved / no reference value) |
|---|---|---|---|---|---|---|
| A, Step 1D-A | 15 | 1 / 0 | 22 | 51 | 21 | 15 / 3 / 23 / 60 |
| B, + structure | 18 | 0 / 0 | 20 | 51 | 21 | 18 / 0 / 23 / 60 |
| **C, frozen candidate** | **18** | **0 / 0** | **20** | **51** | **21** | 18 / 0 / 23 / 60 |

**Transitions:**
- **A → C:** wrong → correct 1, unresolved → correct 2. No success lost, no new wrong.
- **B → C:** no change at all.

| Document | A correct / wrong / unresolved / missing | C correct / wrong / unresolved / missing |
|---|---|---|
| a231_hpa100 (22) | 4 / 0 / 8 / 10 | 4 / 0 / 8 / 10 |
| ap1512_5500 (26) | 3 / 1 / 10 / 12 | **6 / 0 / 8 / 12** |
| best_hepa (22) | 2 / 0 / 3 / 17 | 2 / 0 / 3 / 17 |
| a231_p800 (10) | 5 / 0 / 0 / 5 | 5 / 0 / 0 / 5 |
| dh best (9) | 1 / 0 / 1 / 7 | 1 / 0 / 1 / 7 |
| 5 pages without reference values | — | — |

## 4. Accuracy and safety by publisher, category and page type

| Group | Documents | Values | A correct | C correct | Wrong A / C |
|---|---|---|---|---|---|
| AirPurifierFirst (air purifiers) | 4 | 80 | 14 | 17 | 1 / 0 |
| Ideal Home (air fryers, dehumidifiers) | 3 | 9 | 1 | 1 | 0 / 0 |
| RTINGS (TV) | 3 | 0 | — | — | — |
| Comparisons | 4 | 58 | 12 | 15 | 1 / 0 |
| Roundups | 4 | 31 | 3 | 3 | 0 / 0 |
| Single reviews | 2 | 0 | — | — | — |

**Document understanding** (B equals C here):

| Measure | A (Step 1D-A) | B/C (structure) |
|---|---|---|
| Principal product correct / missed / false | 1 / 0 / **2** | 0 / 2 / **0** |
| Page type agreeing with the reference | — | 7 of 10 |
| Reference products found by the inventory | 14 of 21 | 16 of 21 |
| Merges of distinct reference products | 0 | 0 |
| Product entities naming no reference or other named product | 17 | 16 |

Principal-product detail:
- A's 2 false principals are headline sentences (the air-fryer review and the dehumidifier roundup).
- A's 1 correct principal is the RTINGS page title, a title-based identity.
- B abstains on both titles: it records the conflict `structured_name_is_headline` and has no structured product on the
  client-rendered page.

**Splits.** The same reference product found under several entity names: 9 in both A and B.

**Qualitative** (73 reference observations; Phase269 reader with each arm's mentions):

| Measure | A | B (= C) |
|---|---|---|
| Correct | 6 | 5 |
| Wrong product | 13 | 15 |
| Unresolved | 10 | 9 |
| Missing | 44 | 44 |
| Emitted with no reference observation (unsupported) | 28 | 28 |
| Emitted with a non-product subject | **12** | **3** |

- B lowers non-product subjects 12 → 3: A had bound observations to a headline and to a measuring instrument.
- B is worse on the HEPA roundup, 2 → 9 wrong. Its inventory accepts reader-comment author names followed by digits and
  pollutant codes ("PM2.5") as products, and it truncates "Alen BreatheSmart FLEX" to the family name
  "Alen BreatheSmart".
- The qualitative scorer receives no accepted variants (a harness limitation inherited from Step 1D-A2), so part of B's
  wrong count on that page is unadjudicated.

## 5. False identities, variant disagreements and adjudication

**Adjudication** was done after the frozen run, from the page source blocks. It is recorded in pee-knowledge
`private-eval/step1d-b/adjudication-firstrun.json`, with a public summary in
`evaluation/step1d-b/adjudication-firstrun.json`. The frozen score is unchanged.

| Queue (67 entries) | Adjudicated as |
|---|---|
| A: 1 wrong item + 3 wrong leads | real_wrong_product: results of the Winix 5500-2 bound to the Winix C535, a different model the page names elsewhere; B/C remove all 4 |
| A, B, C: 21 declarations each (the same 21) | declaration_presented_as_test (13 certified CADR in CFM or m³/h, 4 rated motor wattages, 2 tank capacities, 2 packaging oven times; one of those packaging times was bound by A to the wrong product) |
| C only | nothing |

**Variant checks:**
- No arm assigns any value to the A230/A231, 5500-2/5510, HealthPro Compact/Plus or AF300/AF400 pairs wrongly.
- The scorer could tell every pair of reference products apart: 0 indistinct pairs, checked before scoring.

**Safety gates (adjudicated):**

| Gate | Result |
|---|---|
| G1 no unproven variant merge | pass |
| G2 no new wrong-product | pass |
| G3 no new declaration as test | pass as defined (0 new); 21 shared by all arms (§6) |
| G4 no title or headline identity in B/C | pass |
| G5 no silent loss | pass |
| G6 experience replays | pass (§8) |

## 6. Manufacturer-declaration negative controls and other shared defects

These are the same in every arm. They are not caused by the candidate, but the candidate does not fix them either.

1. **Declarations read as test leads: 21 of 87 (24%).**
   - The plan-guided reader accepts "has a CADR of … CFM", "a 50W motor" and "a 5.5L tank" as plan measurements.
   - A rating noun (CADR) and a capacity noun (tank) are not declaration cues in the Phase272 gate.
   - Development pages never exposed this at this rate: 16 controls were read on the Phase272 set.
2. **Conditions missing:** 0 of 18 correct leads carry the stated condition (fan speed or mode). The reader's condition
   pattern does not match "at the lowest speed" or "Speed 2 (Medium)".
3. **Unreadable pages:** RTINGS ships article and test data as JSON in `data-props` attributes, with no `<p>` or `<td>`
   elements. Browser rendering was outside this experiment.
4. **Brand-only references stay unresolved.** In a two-product comparison, "the Winix … whereas the Coway …" names each
   product by brand alone. The candidate leaves these values unresolved, which is safe but loses 16 values on the two
   comparisons with per-speed tables.
5. **Non-gold leads:** 24 leads per arm match no reference value and no declaration, among them site-wide statistics
   ("102 air purifiers tested") and input settings.

## 7. Generalisation versus the Step 1D-A2 development results

| | Development (Phase272 untouched set, spent) | Step 1D-B unseen |
|---|---|---|
| Correct A → C | 60 → 86 of 163 (+26) | 15 → 18 of 89 (+3) |
| Of which from the table reader | +26 | **0** |
| New wrong in C vs A | 8 (6 variant disagreements, 2 scorer artefacts) | 0 |
| Headline principals A → B | 6 → 0 | 2 → 0 |
| Gold products found A → B | 28 → 34 of 37 | 14 → 16 of 21 |

**Why the table reader did not transfer.** This is a diagnostic only; nothing was changed. AirPurifierFirst's per-speed
noise and power tables hold 18 of the missing table values.
- Their heading, caption and headers contain no test word; the measuring statement sits elsewhere on the page.
- Their row labels are fan speeds, not test cues. So the frozen gate treats them as tables of unknown context and reads
  none of their cells.
- Their product columns carry a unit suffix ("Winix A231 (dBA)"), and the Phase245 grid marks them unsupported or
  products-in-rows.

The gate encodes how the development publishers announce a test table: a heading or first-person method prose right
before the table. A publisher that states its method once per page is not recognised. This is a template generalisation
failure, not a safety failure.

**Cost.**
- 119 / 138 / 166 ms per document for A / B / C, and 5–99 ms of semantic reading.
- 549–12,168 DOM nodes, 0 truncations, peak memory 326 MB for the whole run.
- 8.25 MB downloaded.

## 8. Protection of earlier work

| Check | Result |
|---|---|
| Step 1C first run (11331c4) | file unchanged |
| Step 1D-A2 development evaluation (and the Step 1D-A arm A inside it) | identical to dev1 on 21 of 21 documents |
| Replays with the candidate | Step 1A 9 preserved / 0 lost / 4 corrected / 5 persistent; Step 1B 1/0/4/1; both equal the 1D-A2 replays |
| Default-build replays | equal Step 3's (EX-05 and EX-19 keep their documented single loss) |
| No-plan equivalence | 54 of 54 pages identical (`phase272-no-plan-equivalence.mjs`) |
| Step 3 versioning tests | pass |
| Focused suites | 45/45 |
| Contract and fitness tests | 8/8 |
| Live store | `5dd1e763…5607`, byte-identical throughout; opened only to compile plans |
| Rights | robots, reservations and retention unchanged; no page bytes in either repository |
| Signing, ranking, promotion | none |

## 9. What succeeded, what failed, what remains uncertain

**Succeeded:**
- frozen, pre-registered validation on genuinely unseen pages within budget;
- structural identity transfers its safety (no headline principals, no rival-model binding, no merges);
- it adds a small gain;
- no regression anywhere.

**Failed:**
- the main benefit (structured test tables) does not transfer to a new publisher's template;
- 3 of 10 pages are unreadable without rendering;
- B's inventory admits comment authors and pollutant codes as products in qualitative reading.

**Uncertain:**
- 1 effective publisher carries 80 of 89 values, so publisher and category effects cannot be separated;
- the qualitative wrong count is partly a scorer limitation;
- whether a broader context gate would admit declared spec tables (the protocol forbids testing it on these pages).

## 10. Recommendation and remaining roadmap prerequisites

**Revise on development evidence. Do not proceed to Step 4 integration, and do not stop.** The pre-registered rule gives
"benefit partial, gates pass". The revision should come from development pages only, and these pages are now spent:
- **table context:** from the page's own method statement and from row labels that name operating settings, keeping the
  declaration screen;
- **headers:** product-column headers that carry a unit suffix;
- **inventory exclusion:** comment-section author names and pollutant or standard codes;
- **shared base reader:** declaration nouns (CADR, rated, capacity, tank) and operating-condition capture.

A new untouched test then needs a fresh, small HTTP authorisation, with publishers that state their method once per page.

**Step 4 prerequisites** (`docs/architecture/vertical-contract.json` `openDebt`):
- **D11:** the shadow reader, with this result recorded.
- **D12:** base-reader version drift; needs a version bump and a re-derivation procedure that does not rewrite history.
- **D13:** a same-version rights change may leave an earlier observation current. Not demonstrated yet; Step 4 needs a
  fixture and a conservative retirement rule.
- **D14:** reconsideration is row-based, so a valid zero-result reading cannot be re-examined. Here 5 of 10 pages yielded
  none. Unsuccessful readings must take part in later learning through the journal, without a parallel evidence
  database.
- **D15:** declarations read as test leads, and conditions not captured.
- **Integration:** plans, semantic structure and future lessons must reach the ordinary observation path, versioned and
  with uncertainty kept. Shadow operation is not integration.

**Step 2:** its independent-page validation is now done and closed with a partial-benefit, safe result. That is a
decision, not a claim that the reader works generally.

## Reproduce

Run from the engine directory, after `npx tsc -p tsconfig.json`. A first run is never overwritten. Page bytes are private.

```
node scripts/step1d-b-eval.mjs run <new-label>
node scripts/step1d-b-eval.mjs adjudicate <label>
node scripts/experience-replay.mjs <label> --set step1a|step1b --policy candidate_1c_semantics_tables
node scripts/phase272-no-plan-equivalence.mjs
```
