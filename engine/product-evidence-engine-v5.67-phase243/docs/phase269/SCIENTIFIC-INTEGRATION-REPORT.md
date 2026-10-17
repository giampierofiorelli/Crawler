# Phase269 — Phase268 independent review, scientific knowledge integration and goal relevance

**Dates:** 16–17 October 2026.

**Start state:**

- HEAD `797d6f2`, clean tree.
- Store verified: private repo `2e03e50`, live store identical to it.

**End state of the store:** private repo `ea799b0`, 1,462 events.

**Brief:** "Phase268 independent review, scientific knowledge integration and next development priorities".

**Tiers:**

- **T1 synthetic:** fictional fixtures.
- **T2 authentic controlled:** authentic evidence on a store copy, with proposed policies and an evaluation-only signer.
- **T3 operational:** authentic evidence on the operational path, under authorised policy.

**Publication:** no value bound to a product appears in this public report. Private material is in `pee-knowledge`:

- `research-packages/`
- `private-eval/phase268/` and `private-eval/phase269/`

## Summary

| Question | Answer |
|---|---|
| Does PEE still turn the empty-run energy figure into a recommendation? | **No.** In the baseline the controlled catalog produced a ranking for 5 of 13 frozen requests, including "I already have a fan oven…" and "…only ever use one drawer…". After teaching, 0 of 13 do. This holds even when the catalog labels the proxy as the consumer need. |
| What does the frozen Phase268 request get now? | `partial_comparison`: the empty-run metric, labelled as such, with raw kWh, direction, and limitations per product (variant not verified, fixed one-hour run, every compartment running). Every objective is stated as not assessed, including "cooking results". |
| Did teaching change observable decisions? | Yes. Over the 7 development requests and 6 untouched ones, decisions match the gold for 2 of 7 → 7 of 7, and 1 of 6 → 4 of 6 (§D). |
| Did it transfer to another category? | Partly. On 4 untouched coffee requests, relevant criteria went from 0 to 0.75 and decisions from 0.5 to 0.75. The code was the same: only data were taught. |
| Authentic evidence usable for a consumer recommendation | **None** for the frozen objective. No product has a measurement that establishes energy per completed cooking task, or cooking quality. |
| Tests | Full suite: 4,515 passed, exit 0. The new `tests/phase269_goal_relevance.test.ts` has 7 tests (fictional data). |

## A. Independent scientific review of Phase268

| Phase268 claim or assumption | Verdict | Basis |
|---|---|---|
| 10 authentic measurements, acquired lawfully and retained with provenance | **Valid**, preserved unchanged | Store rows and the private Phase268 runs are untouched. |
| An extractor that found 0 of 10 now finds 8 of 11 | **Valid, but tuned.** The held-out first run found 0 of 1. | The genuinely untouched set gives 0 of 12 (§H). |
| A "deterministic ranking of 3 products" | **Over-interpreted.** It orders a fixed-duration empty-run metric only. | Package 1.4 and 5.3; Phase14 (Consumer NZ fixed 30 min vs Which? completed dishes). |
| An empty run at 200 °C for 1 h indicates "relatively little electricity" | **Weak proxy** | It measures heat-up, losses and cycling, not the energy to finish a meal (package 7.2, Phase13, Phase14). |
| Measuring both drawers fairly represents a dual appliance | **Requires qualification.** It disadvantages a one-drawer user. | Package 2.1 (B2), 5.3(1). |
| Exact-variant scope for every compiled test | **Not justified.** 2 of 3 had no model code. | Corrected in r2 (§H). |
| Linear 0–2 kWh anchors make a meaningful score | **Unverified.** It is reproducible, not scientifically justified. | Retired in r2: the raw quantity only, no new anchors (§F). |
| "Cooking results" not assessed | **Correct**, and now taught as a separate outcome with its own measurement | Package 3.4 and 4. |
| Capacity says nothing about suitability for one person | Supported by the package | Package 0 guardrail, 6.1, 6.2. |

**Changes needed before the evidence supports consumer advice:**

- an outcome-relevant measurement: energy per completed cooking task, under the same food, load and doneness, with the
  compartments in use recorded;
- cooking-outcome evidence;
- verified variants;
- authorised policies and signer (§K).

## B. Research-package inventory

The full metadata is in `evaluation/phase269/research-package-inventory.json`. All three files were received and are
readable. They were not modified, and they are stored privately.

**Package A — air fryers.** The brief requested `PEE-AIR-FRYERS-CROSS-RESEARCH-v3.9.0.zip`. What arrived is
`PEE-AIR-FRYERS-RESEARCH-RECOVERED.zip`:

- the compendium v2.2.0, reconstructed;
- 34 addenda: the Phase2–17 audits and source ledgers, a dish-technique matrix, and contradictions and corrections.

**It is not the v3.9.0 archive.** The recovery notes say so: archive membership, manifests and non-text assets cannot be
verified. The compendium consolidates the master research and six cuisine supplements; later work is only in the
addenda.

Status conventions:

- physical principle, original observation, supported relation, claim, hypothesis, unresolved;
- the attribute types SPEC, DESIGN, PROXY, MEASURE, CONTEXT and CLAIM;
- "PROPOSED" for methods that are not standards.

**Package B — dehumidifiers.** `PEE-CAT-DH-002` 1.0.0-research, 924 lines, consolidated: sections 0–17 plus addenda A–E.

- **Gap:** the §17 source register has only its introduction, so the references R01–R37 cannot be resolved from the file.
  The addenda carry their own sources.
- **Labels:** PHYSICS, REGULATORY, ORIGINAL_TEST, GUIDANCE, DECLARED, ENGINEERING_INFERENCE, PROPOSED_TEST, UNKNOWN.

**Package C — coffee machines and grinders.** Six documents, kept verbatim as annexes, consolidated 15 October 2026, 1,450
lines.

- There was no fresh primary-source re-verification.
- Annex 1 states that ChatGPT authored it.
- The statements about puck pressure and the Espresso Italiano Certificato parameters are only partial.
- **Labels:** OBSERVED_CONTROLLED, CERTIFICATION_CRITERION, INDEPENDENT_PRODUCT_TEST, DECLARED_SPECIFICATION,
  MECHANISM_SUPPORTED, HYPOTHESIS, PREFERENCE, UNKNOWN, plus `contradiction_type`.

**Contradictions preserved, not resolved by PEE:**

- **Air fryers:**
  - fixed-duration vs completed-dish energy (Consumer NZ vs Which?);
  - acrylamide studies that disagree;
  - preheat or no preheat;
  - "bigger basket is better" vs "avoid crowding".
- **Coffee:**
  - the arithmetic of the ECBC retention figure;
  - ECBC temperature vs the Batali study;
  - two Altroconsumo weighting schemes.
- **Dehumidifiers:** ENERGY STAR (close the doors) vs EPA (open the doors).

## C. Scientific knowledge that entered PEE (existing architecture only)

**Mechanism.** The Phase252 teaching machinery was extended, not replaced:

- `measurement` concepts, with no everyday aliases, so they are never recognised as needs;
- test-condition concepts;
- the relation `requires_condition` (Phase247);
- measurement proxies stored as `not_sufficient_for`.

**Command:** `phase246-knowledge.mjs apply-teaching --category air_fryers|coffee_machines`. It is idempotent and
journaled. Every statement is a `technical_hypothesis` that keeps its package section and status.

**Air fryers** (`src/phase269_research_teaching.ts`): 17 items and 23 relations.

- **Measurements:** energy per cooking task, empty-run energy (proxy), cooking outcome assessment, cooking evenness test,
  usable cooking area, batch cooking test, cleaning effort assessment, two-zone cooking test.
- **Conditions:** same food load, completed doneness, compartments in use.
- **Proxies:**
  - empty-run energy for low energy use and for cooking results;
  - declared power for low energy use;
  - declared capacity for single portion, batch capacity and evenness;
  - "dishwasher safe" for cleaning effort.
- **New needs:** `cooking_results`; `oven_alternative` (owned equipment); `single_compartment_use` (stated use).

**Coffee:** 5 items and 7 relations.

- **Measurements:** sensory assessment with the same beans and grind; brew temperature stability over consecutive shots.
- **Proxies:** PID; power.
- **Owned equipment:** `moka_alternative`.

**Runtime use.** `Advice253.goalAssessment` gives, for each need:

- coverage (assessed, proxy only, unassessed, or context);
- the relevant measurements;
- the rejected proxies;
- the required conditions;
- incomparable evidence;
- the decision.

**Selection discipline:**

- Teaching phrases were chosen from the development requests and the packages only.
- Phrases that also occur in an untouched request are disclosed in `UNTOUCHED_OVERLAP269`: "cook for myself" (U2,
  package 6.2), "evenly" (U5, from development failure D7), "moka pot" (C4, package taxonomy).

**Parser defects found on development requests and fixed in the journey:**

- a loose match that skips a word hid a contiguous need;
- "which air fryer actually cooks…" ran past the category name;
- "chips … from an air fryer" was not a purchase of the category.

## D. Measured learning (frozen sets, first runs committed unchanged)

**Runs:**

- **Set:** `evaluation/phase269/teaching-eval-set.json`, frozen in commit `4ede679` before any teaching, with the
  baseline in the same commit.
- **Context:** the Phase268 controlled catalog is supplied with every request.
- **Columns:** "after" uses the same r1 catalog context as the baseline; "after (r2)" uses the Phase269 proposed
  catalog.

| Behaviour (mean score) | Development: baseline → after → after (r2) | Untouched: baseline → after → after (r2) |
|---|---|---|
| 1 outcomes recognised | 0.452 → 1.0 → 1.0 | 0.583 → 0.75 → 0.75 |
| 2 relevant criteria | 0 → 1.0 → 1.0 | 0 → 0.667 → 0.667 |
| 3 inadequate proxies rejected | 0 → 1.0 → 1.0 | 0.2 → 0.8 → 0.8 |
| 4 necessary test conditions | 0 → 1.0 → 1.0 | 0 → 0.6 → 0.6 |
| 5 incomparable results recognised (D6) | 0 → 1 → 1 | — |
| 6 unassessed objectives preserved | 0 → 0.857 → 0.857 | 0.25 → 0.75 → 0.75 |
| 7 decision | 0.286 → 0.857 → 1.0 | 0.167 → 0.333 → 0.667 |
| outcomes "assessed" through a proxy | D1, D5, D6 → none → none | U1, U3 → none → none |

**Why "after" is lower than "after (r2)" on decisions:** the r1 catalog carries no raw values. A partial comparison
cannot be shown from it, so the proxy requests (D1, U1, U3) fall back to `research`.

**Remaining failures (untouched, not tuned):**

- **U4** "dual zone … two different things … same time": neither the category nor the need is recognised.
- **U6** "least power … reheating leftovers": the energy need is not recognised.
- **D2:** a need with a factual criterion (`batch_capacity`) is not listed among the unassessed objectives. This is a
  principle-8 gap.

**Regressions:** none in the full suite. The frozen Phase266 and Phase253 sets run as tests and are unchanged.

**Coffee transfer.** `coffee-eval-set.json` has 4 untouched requests, frozen and baselined in commit `4144eff` before any
coffee teaching. The generic goal-relevance code already existed at that point.

| Behaviour | Baseline | After |
|---|---|---|
| Outcomes | 0.625 | 0.75 |
| Relevant criteria | 0 | 0.75 |
| Conditions | 0 | 0.75 |
| Proxies | 0.5 | 0.5 |
| Unassessed | 0.625 | 0.75 |
| Decision | 0.5 | 0.75 |

- **C4** ("I already have a moka pot…") becomes a no-purchase check.
- **C2** ("best-tasting traditional Italian espresso") is still not recognised.

## E. Corrected evidence applicability

**Empty-run energy vs cooking energy:**

- The empty-run measurement (`energy_empty_run`) is `not_sufficient_for` both `low_energy_use` and `cooking_results`.
- The measurement that establishes `low_energy_use` is `energy_per_cooking_task`, which requires the same food load,
  completed doneness and the compartments in use.

**Whole appliance vs one drawer:**

- When the user states one-drawer use, the whole-appliance figure (every compartment running) is incomparable.
- No partial comparison is shown, and the answer says why (test 3).

**Capacity:** declared litres are rejected as evidence for one person, for a family load and for evenness. The relevant
measurements are usable cooking area and batch cooking, not a litres-per-person rule.

**No-purchase:** an owned oven or moka pot turns the decision into `no_purchase_check`. The answer names what a
comparison would need.

**Proven at T1** (fictional data): even a catalog whose dimension key equals the need cannot rank through a proxy. The
same catalog does rank in a store without the teaching (test 1).

**Non-compensatory safeguards are unchanged:**

- Phase181 hard-outcome failures still exclude.
- A missing essential outcome is never filled from other strengths.

## F. Revised validation and scoring policies (proposed, not authorised)

**`pee268-test-evidence-validation` r2** (r1 is kept as `VALIDATION_POLICY268_R1` for reproduction):

- **Protocol:** the protocol names its measurement concept (`energy_empty_run`, fixed duration).
- **Identity confidence:** `model_code_in_tested_subject` vs `product_name_only`.
  - A consumer ranking requires a model code.
  - A labelled comparison may include a product named only by name, marked "variant not verified".
- **Distinct fields:** publisher qualification (by policy), first-hand basis (statement or the review's own protocol),
  and independence (never established).
- **Limitation codes** carried into the signed catalog and the answer.

**`pee268-energy-scoring` r2:**

- `raw_quantity_only`: no consumer score, and the r1 anchors retired without replacement.
- The dimension key is the measurement, not a need, so it can never be confirmed as a consumer outcome.

**Recommended production-eligibility rule:**

- A measurement may rank an outcome only if category knowledge links it by `measured_by`.
- Its required conditions must be satisfied.
- The tested variant must be verified.

## G. Qualitative professional evidence (pilot, T2, private)

**Design.** `src/phase269_qualitative_observations.ts` emits PEE-authored codes only, plus the hash of the source block:

- dish;
- outcome (crispness, browning, evenness, doneness, moisture);
- direction (positive, negative, mixed);
- strength (explicit, hedged);
- whether the setting was adjusted;
- whether the statement is comparative.

It keeps no wording and invents no number. "How I test" paragraphs are skipped. The block reader is the one Phase225
already uses (`textBlocks225`, a behaviour-preserving refactor).

**Results** on 3 Expert Reviews documents (development) and 1 untouched document (CHOICE), against 18 gold observations
(`evaluation/phase269/qualitative-pilot.json`):

| Run | Precision | Recall | Untouched |
|---|---|---|---|
| First run | 0.583 | 0.778 | 0 of 2 |
| After a hedge-scope fix (tuned) | 0.652 | 0.833 | 0 of 2 |

- Several "extra" codes are genuine findings that the gold omitted. The gold was not edited.
- The "setting adjusted" flag fires on ordinary setting choices.
- On the untouched page, the findings sit outside the blocks the reader uses.
- **Defect in the pilot run script:** it overwrote the first-run file. The first run was restored verbatim from the
  session log (noted inside the file), and the script now refuses to overwrite.

**Retention:** these codes are **not** retained in the operational store, because pee249 keeps only numeric measurement
kinds for test publishers. The amendment needed is listed in §K.

## H. Exact-variant integrity and extraction on untouched material

**The corrected chain:**

1. review subject;
2. model code in the subject;
3. Phase265 association;
4. product identity (keys per host, never merged on a name);
5. Phase268 identity confidence;
6. Phase181 scope (`exact_variant…` or the new `named_product_original_professional_test`);
7. answer ("variant not verified").

**Negative controls (test 4):**

- a family/range headline and a two-model comparison yield no model code;
- a regional code (`…EU`) is its own model and its own product.

**Untouched extraction set:**

- **Rules and extractor hashes** frozen in commit `b1c60c8` before the fetch.
- **Documents:** CHOICE (AU) "air fryer vs oven" and Consumer NZ "air fryer vs oven".
- **Budget:** 5 requests under the still-valid pilot policy, bringing the total to 30 of 50 and the hosts to 5 of 5.
  The policy expires on 2026-10-23.

| Measure | Result |
|---|---|
| Recall | **0 of 12** |
| Precision | 0 of 1: the lead is a modelled scenario, a negative control |
| Attribution of that lead | 1 error: an article title taken as the subject. It would stay unresolved in the store. |

The misses are minute and cost values in a list ("NNmin", cents), with no first-person cue. The result is reported as
is, and no extraction change was made from these documents.

## I. What the consumer now sees (frozen request, r2 context; numbers are private)

1. "Partial comparison only, not a recommendation: Electricity used in a fixed one-hour empty run at 200 °C (one
   publisher protocol; not energy to cook a meal). Lower is better for this metric: [three products, each with kWh; two
   marked 'variant not verified']."
2. "This metric does not show the electricity needed to cook a meal, and it does not assess cook single portion, cooking
   results, crisp texture, low energy use."
3. "What would answer this: for cook single portion, usable cooking area; for cooking results, cooking outcome
   assessment (completed doneness, same food load); … for low energy use, energy per cooking task (compartments in use,
   completed doneness, same food load)."
4. "Not assessed: … 'best cooking results'."
5. Limitations per product:
   - the model code was not published;
   - a condition came from the paragraph rather than the same sentence;
   - the empty load comes from the review's protocol;
   - every compartment was running;
   - fixed one-hour run;
   - one publisher.

   Each limitation is given with its source URL.
6. The proxies rejected for declared attributes.

`crisp_texture` is still recognised spuriously by a loose match ("results … little"). It is reported here and not
fixed.

## J. Generalisation across categories

**Measured:**

- **Air fryers:** §D.
- **Coffee:** a minimal transfer of the same process on 4 untouched requests (§D).

**Dehumidifiers — bounded plan** (not executed: the registry has no dehumidifier category):

1. Onboard the category: registry aliases and part phrases, such as "dehumidifier bags" and "moisture absorber".
2. Freeze 6 development and 6 untouched requests, for example:
   - wet windows;
   - mould behind the wardrobe;
   - a pipe leak last month;
   - a cold bedroom;
   - "for 100 m²";
   - "to prevent asthma".
3. Teach from package B:
   - **Measurements:**
     - removal at the room's temperature and relative humidity (the rating is at defined DOE or EN 810 points, not at
       household conditions);
     - net removal including defrost;
     - L/kWh under a matched protocol.
   - **Proxies:**
     - rated L/day for household removal;
     - floor area for the moisture load;
     - watts for efficiency.
   - **Conditions:**
     - matched temperature and RH;
     - door state.
   - **Context needs:**
     - `leak_or_structural_alternative` (repair before buying);
     - `ventilation_alternative`.
   - **Health claims:** association only; a dehumidifier is not a treatment.
4. Rerun with the same scorer.

Estimated size: one teaching module (data) plus a registry entry, and no new decision code.

## K. Remaining owner decisions (only the necessary ones)

| # | Decision | Recommendation | Risk if accepted | Consequence if not |
|---|---|---|---|---|
| 1 | Approve `pee268-test-evidence-validation` r2 | Approve **for labelled partial comparisons only**. A consumer ranking also needs a model code in the tested subject and an outcome-relevant measurement linked by `measured_by`. | Low: no ranking from proxies is possible. | Partial comparisons stay controlled-evaluation only. |
| 2 | Approve `pee268-energy-scoring` r2 (raw quantity, no score) | Approve. | Low. | No change in behaviour. |
| 3 | Initial key management for policy-bound automatic signing | **One Ed25519 key** generated on an owner-controlled machine. Only its public half is pinned in a versioned authority file in this repository. The private key is never in any repository; the Claude session receives it only as an environment secret. It signs only catalogs compiled under policy versions the owner has authorised, with the policy hash inside the catalog. Expiry is 7 days, and rotation means a new key id. The signature attests integrity and the authority, not the science. | Leak of the secret allows false catalogs until rotation; mitigated by short expiry and the policy-hash binding. | No production ranking at all. |
| 4 | Amend pee249 so that independent original tests may retain PEE-authored qualitative outcome codes (no wording, block hash, attributed, at most 25 products per host) | Approve as `pee249-factual-observations-v2`, controlled first. | Codes could be over-read as findings; mitigated by `independentFinding:false` and `rankingInput:false` until a validation policy admits them. | Cooking quality can never be assessed from professional tests. |

## L. Next evidence-based milestone

Acquire one original test of **energy per completed cooking task** for the same food, load and doneness, on at least
two air fryers under one publisher protocol, and admit it through r2.

This is the smallest step that would let the frozen request's energy objective be assessed rather than proxied.

The remaining pilot authorisation is 20 requests and no new hosts, and it expires on 2026-10-23. A new publisher needs a
new owner authorisation.

In parallel, fix the three recorded recognition gaps (U4, U6, D2) on development data, then re-measure them on a new
untouched set.
