# S86d — Independent validation, scientific generalisation and architectural learning (owner brief, 2026-10-19)

**Owner brief, verbatim:** `.claude/skills/pee-guided-learning/references/owner-s86d-independent-validation-2026-10-19.md`.

**What did not change:**
- R3 stays open.
- No HTTP request was made.
- No ranking authorisation changed.
- No production path was enabled.
- `src` is byte-identical to the S86c commit `ec9d4bb`. One prototype was built and **rejected** (§3.5), and its code was reverted.

**Evidence labels.**
- **[R]** development or regression material: the 12 spent S80 pages, on which S86c was tuned.
- **[P]** pre-registered but not yet run.

Nothing in this report is independent validation.

## Outcome

1. **The independent run is blocked by authorisation, not by preparation.** No active owner policy covers it (§1). The experiment is frozen and pre-registered, so one authorised run executes it unchanged (§2).
2. **The main new finding is downstream, not in reading.** With S86c's readings in a store copy:
   - the store holds 84 result rows from the 12 pages instead of 7;
   - Phase268 validation still admits exactly **1** (the same 1). 83 are refused as `publisher_not_qualified`, because the validation policy names **one protocol for one publisher** (air-fryer energy, 1 h empty at 200°C, Expert Reviews);
   - the 206 spent requests give **identical answers**.

   Better discovery cannot reach a user until that gate is generalised (§3.1).
3. **The S86c controls rest mostly on one publisher.**
   - Subject withholding, specification-section, certification, derivation and repeat rules fired only on HouseFresh, which supplied 66 of 78 guided results.
   - On these 12 pages, page-bootstrap 95% intervals for D's correct results run from 25 to 150, and its non-result share from 0 to 7.9%.

   The development figures do not establish generality (§3.2, §3.3).
4. **There is an identity gap no existing mechanism closes.** PEE cannot tell a named feature or technology (AirDry, QuickSelect, PowerPod) from a product:
   - not with the S86c heuristic;
   - not with the Step 1D-A entity inventory (prototype E, rejected);
   - not in the qualitative reader.

   It is the most likely failure on unseen publishers (§3.4, §3.5).

## 1. Why the independent run did not happen

Every policy file in `pee-knowledge/policy/` was read. Each authorises a specific earlier experiment, and several forbid reuse explicitly:

| Policy | Status |
|---|---|
| Phase268 and Phase270 pilots | "one bounded run" each, already made |
| Phase272 research | "cross-category A/B/C experiment and unknown-category pilot" |
| Step 1C | "limited to obtaining … evidence for this experiment. It does not extend, renew or reuse the previous Phase272 budget" |
| Step 1D-B | "one-time Step 1D-B research budget" |
| KR unseen | "small unseen-document experiment … Reuses no earlier allowance" |
| S80 e2e | new-request validation of S80 |
| Phase264 | metadata only |
| First research policy | `allowSourceReads: false` |

Using any leftover budget would extend an authorisation to a purpose it does not name, which the brief forbids.

**What unblocks it:** one owner authorisation matching `evaluation/s86d/preregistration.json`.
- At most 40 HTTP requests, at most 8 hosts, at most 6 per host.
- 7 days.
- The S85 wave gate.
- Private retention, and the live store untouched.

## 2. The frozen experiment [P]

**Freeze** (`evaluation/s86d/freeze.json`):
- the candidate D is the S86c reader at `ec9d4bb`, with SHA-256 of the 10 reader sources and the 4 evaluation scripts;
- the per-category plan digests and reading identities from the live store;
- the annotation-protocol hash;
- a leakage exclusion list of 239 URLs on 72 hosts examined in earlier phases.

**Tooling.** All of it was checked on S80 before freezing:
- `scripts/s86d-page-recovery.mjs` reads any page set from a manifest. It reproduces the S86c runner on all 12 pages, and can keep its store copy for downstream checks.
- `scripts/s86d-worksheets.py` is the S86b annotation-worksheet builder, now versioned. Its output is byte-identical on all 24 S80 worksheets.
- `scripts/s86d-page-score.mjs` is scorer v2.1: identical totals to v2, plus per-page, per-publisher and per-category figures and page-bootstrap intervals.
- `scripts/s86d-downstream.mjs` reports Phase268 refusals and stored typing.

**Pre-registration** (`evaluation/s86d/preregistration.json`):

| Element | Design | Reason |
|---|---|---|
| Size | 24 pages (minimum 18) | S80 shows heavy clustering (one page held a third of all results). About 150 stored results bound a 2% wrong-product rate at ≤ 3.7% (≤ 1 error) and a 5% false-evidence rate at ≤ 5.7% (≤ 3 errors), Wilson 95% |
| Strata | ≥ 16 pages from ≥ 4 **never-examined** hosts; ≤ 8 unseen pages from the S80 hosts | Separates template generalisation (S86c was tuned on three publishers) from content generalisation |
| Categories | All six taught categories, 4 pages each | Coffee machines and dehumidifiers compile only 2 measurement concepts each (§4), so their recall also measures teaching depth |
| Layouts | ≥ 6 comparison or roundup pages, ≥ 6 with result tables, ≥ 6 single-product prose reviews | Attribution on multi-product pages is the riskiest untested ability (§3.3) |
| Selection | One fixed search query per (host, category); the first eligible result in rank order; the ranked list and every eligibility decision logged and hashed **before** any request | No cherry-picking; replacement only for documented technical failure |
| Reference | The S86b blind protocol; Claude annotators who see only page text; 25% double-annotated, with kappa reported; third-agent adjudication; sealed before reading | Blind to the implementation, but **not** independent human validation |

**Primary endpoints**, each with page-bootstrap intervals:
- recovery (D vs B);
- false-evidence share (point ≤ 5%, upper ≤ 10%);
- wrong-product share (point ≤ 2%, upper ≤ 5%);
- legacy only-old = 0.

The interpretation is stated in advance.

## 3. What was learned offline [R]

### 3.1 Do recovered results reach the user? No, and the reason is a gate, not the reader

The readings of B (operational) and D (S86c) were each ingested into a store copy, then checked through Phase268 validation, the shared typing, D28 and the 206-request harness (`evaluation/s86d/downstream-*.json`, `advice-diff-B-vs-D.json`).

| | B | D |
|---|---|---|
| Result rows stored from the 12 pages | 7 | 84 (56 on the reviewed product, 28 kept unresolved) |
| Rows the shared quantity knowledge types | 7 | 84 |
| Validated by Phase268 (catalog input) | 1 | 1 |
| Refused: `publisher_not_qualified` / `measurand_not_in_protocol` | 5 / 1 | 83 / 0 |
| Refused: `subject_unresolved` | 0 | 28 |
| Answers changed on the 206 requests | – | **0** |

**Why.** `VALIDATION_POLICY268` lists one protocol, `er_energy_1h_empty_200c_v1`, and one qualified publisher, `www.expertreviews.co.uk`. Every newly recovered kind of result is outside it. That includes clean-down times, CADR, noise, dishwasher energy and water, and power by fan speed.

**The knowledge the gate would need already exists.** The store holds taught measurement concepts with `measured_by` and `requires_condition` relations for all six categories. It is simply not consulted: this is cause 1 and cause 2 below.

### 3.2 How much do 12 pages establish? Little

Page-bootstrap 95% intervals (`evaluation/s86d/s80-uncertainty.json`):

| | Correct results stored | Non-result share | Wrong-product share |
|---|---|---|---|
| D | 76 (25–150) | 1.3% (0–7.9%) | 0% (0–0%) |
| B | 6 (2–11) | 14% (0–50%) | 0% |

The width comes from clustering, not from the number of values. This sets the independent sample size (§2).

### 3.3 Where were S86c's controls learned? Mostly from one publisher

Control decisions by publisher on the development pages (`evaluation/s86d/control-firings.json`):

| Control (S86c) | HouseFresh (4 pages) | TrustedReviews (6) | Expert Reviews (2) |
|---|---|---|---|
| Guided results | 66 | 12 | 0 |
| Subject withheld (other product) | 23 | 0 | 0 |
| Repeats removed | 20 | 0 | 0 |
| Specification section / certification / derivation | 3 / 2 / 6 | 0 | 0 |
| Temperature or setting conditions / presets | 0 | 11 / 9 | 19 / 2 |

The role rules for settings and presets were exercised on two publishers. The attribution and structure rules rest on **one** publisher's template, which is the strongest reason to weight the independent sample towards unseen publishers and multi-product layouts.

### 3.4 Would S86c's subject control transfer to qualitative evidence? Not safely

- **The replay.** The Phase269 guided qualitative reader was replayed on the same pages. It places 62 of its 80 taught-outcome observations on the reviewed product. S86c's subject check flags **3** of them as naming another product.
- **All 3 are false alarms.** The names are a component of the product ("PowerPod"), feature names ("QuickSelect", "AirDry") and acronyms ("BBQ", "XXL", "LED").
- **Effect today.** The quantitative S80 readings never hit this case: all 23 of their withholdings were correct competitors.
- **Effect on unseen publishers.** The same weakness would leave correct results unresolved, never misattributed.

### 3.5 Prototype E: subject by the Step 1D-A entity inventory (rejected)

- **Why I tried it.** Step 1D-A already built a document entity inventory: typed mentions (product, instrument, standard), aliases within the document, and no merging of model codes. It was evaluation-only. In S86c I had added a weaker parallel heuristic instead of reusing it, a lapse in the "audit by function" rule.
- **What E did.** It asked the inventory first and kept S86c's relational cues ("achieved by", earlier version). It ran in shadow with D unchanged, which was checked on all 12 pages and in its identity.
- **Results** (`evaluation/s86d/configuration-E-rejected.json`):
  - first run: 7 other-product results on the reviewed product, against D's 0;
  - after fixing 2 lookup bugs of mine: 3, plus 3 correct results withheld.
- **Causes.** The inventory:
  - misses names without a model code ("the Mila", "IQAir Healthpro Plus");
  - types table headers "SPEED 3/4" as products;
  - types feature names (AirDry, QuickSelect, PowerPod) as unknown products.

  So it does not solve the problem that motivated it either.
- **Decision.** Rejected before any fresh data. The code was reverted, so D stays the only candidate. This is a negative result: the gap is a missing capability (§4, cause 4), not a choice between two existing mechanisms.

## 4. Why evidence is still lost: four causes [R]

**Sources.** 46 measured results D still misses, 6 results it withholds, and the downstream refusals.

| Cause | Instances | Evidence |
|---|---|---|
| **1. Knowledge available but not consulted** | Validation protocols; number words; teaching depth | Phase268 uses one hand-written protocol while the store holds taught measurement concepts with their required conditions (83 refusals). Two number-word tables exist (`phase270`, `product_facts`) but neither discovery reader uses them (8 misses: "four minutes", "two-thirds"). Plan compilation keeps 2 of 6 dehumidifier and 2 of 4 coffee measurement concepts (the others are conditions), against 8–15 elsewhere. |
| **2. Correct mechanisms blocked by representation or restriction** | Approximate values; the record bound; unresolved subjects | Phase245 and Phase270 values carry `approximate`; test leads and `test_measurements265` do not, so "around 250 kWh" can only be dropped (9 misses). The guided pass stops at 40 records (16 misses on one page). Another product's result can only be stored with no product, so two products with the same value in one block are indistinguishable (merged), and such rows can never be validated (28 refusals). |
| **3. Existing capabilities to combine** | Three quantity recognisers; three subject mechanisms | Discovery runs through Phase225's closed `candidateNumeric`, the plan's own `UNIT_LEXICON272` pattern, and Phase226 header units, while the shared quantity knowledge reads hyphenated units ("20-minutes", 2 misses), basis words and ranges. The plan gives "EOTF tracking and colour accuracy" no unit although the knowledge has colour difference (ΔE). Subject decisions are duplicated across `documentMentions272`/clause subject, the S86c heuristic, the 1D-A inventory and Phase269's own `subjectOf`. |
| **4. Missing reasoning** | Feature vs product; derivation; relational results | No mechanism separates named features from products (§3.4, §3.5). Derived values (room size from the publisher's own CADR, 2) have no derivation representation linking them to the measurement they come from. Relational statements ("only 1 minute faster") and timer observations ("10 minutes left to run") have no representation. |

## 5. Architectural implications

- **Can knowledge improve discovery, not just classification?** Yes, but on development pages only (S86b/S86c: 6 → 66–77 found). Discovery still runs through three separate recognisers, and most remaining recall losses are representation and sharing problems (causes 2 and 3), not missing knowledge.
- **Qualitative and quantitative evidence.**
  - *What already transfers:* the role logic (`observationRole86c`) is general and could serve both readers.
  - *What does not:* the subject logic, because it lacks the feature-versus-product distinction (§3.4).
  - *Where the shared context belongs:* the shared representation should be the per-observation context (role, subject, conditions), with each reader keeping its own meaning (a value versus a polarity).
- **Where is evidence lost today?** At three stages, in order of effect on the user:
  1. **downstream validation**, which admits 1 of 84 rows;
  2. **discovery**, where 46 of 123 results are missed even by D;
  3. **attribution**, which is good on development pages but untested on new layouts.

  The first is the binding constraint: until it changes, no reading improvement reaches an answer (§3.1).
- **S87.** The signals the candidate intake should receive are now concrete and typed by cause:
  - classified observations (role, reason);
  - unresolved subjects (an unknown product named in a clause);
  - approximate values;
  - rows refused for a missing protocol.

  Unknown feature or product names are the clearest case where learning helps: "AirDry" seen as a feature in many dishwasher pages.
- **Propagation.**
  - The product-versus-feature distinction is the same one S85's `featurePreferences` needs in requests ("steam wand").
  - Knowledge-derived protocols would serve research planning (which test to look for) as well as validation.

## 6. Recommendation

1. **Do not admit S86c to production now.** There is no independent evidence. Admission would also not change any answer until the downstream gate generalises (§3.1).
2. **Authorise the pre-registered independent run** (§1–2). It is the cheapest decisive experiment: about 40 requests, offline scoring, and the tooling is already checked.
3. **The next bounded implementation, if you agree, should be knowledge-derived validation protocols, in shadow.**
   - *What it changes:* Phase268 would compile its protocols from the taught measurement concepts and their required conditions, instead of one constant.
   - *How it would be measured:* how many of D's stored rows would validate, with which conditions verified or missing. Ranking authorisations, signed catalogs and the S79/ra.2 rules would stay unchanged.

   This is the link between discovery and advice. It should run alongside or after the independent run, not before it, so the freeze stays clean.
4. **Afterwards, two consolidations** that need their own four-set checks:
   - one discovery recogniser: the shared quantity knowledge, which already reads hyphenated units, basis words and ranges, extended with the existing number-word tables and an `approximate` flag carried to stored rows;
   - one document entity service with a feature-versus-product distinction informed by category teaching.

## 7. Resources and complexity

- **Network:** 0 HTTP requests.
- **Source:** net 0 lines (E added, measured, reverted).
- **Added scripts:** 4 evaluation scripts (`s86d-page-recovery`, `s86d-page-score`, `s86d-worksheets.py`, `s86d-downstream`).
- **Changed scripts:** the advice harness now honours `PEE_KNOWLEDGE_DIR`; its default is unchanged.
- **Runs:** about 15 page runs of 12 pages and 4 advice runs of 206 requests, all local. No agents and no paid services.
- **Private outputs:** `pee-knowledge/private-eval/s86d/`, with page text stripped.
