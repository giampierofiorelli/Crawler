# Phase252 — Validate generalisation, proactive guided teaching, evidence integrity

**Date:** 2026-10-15/16.
**Branch:** `claude/typescript-network-transport-test-1givnd`.
**Start:** HEAD `b57fc21` (Phase251 final). Private store pee-knowledge `7efa0c3`.
**End:** the commit that adds this report. Private store pee-knowledge `4c78d47`, verified.
**Developer:** Claude, sole agent.
**Tiers:**
- T1 is synthetic or developer-written.
- T2 is a real request with gold written by Claude (not author-independent).
- No T3 or T4 results are reported.

Every result below is labelled first run, development (after a first run, on a spent set) or synthetic.

## Answers to the ten questions

1. **Did D′ improve on genuinely new requests?**
   - **Yes on decisions, no on needs.** Untouched set 5 (30 real requests, first run, T2):
     - correct decisions: A 11, R 14, D′ 21;
     - harmful decisions: A 13, R 11, D′ 4;
     - advise cases correct: A 3, R 4, D′ 8 of 9.
   - D′'s 95 % Wilson interval for the correct rate is [0.52, 0.83]; R's is [0.30, 0.64]. Paired D′ against R: 12 cases better, 2 worse.
   - Need recall stayed very low: 1 of 7 listed needs (precision 0.2), and 0 of 17 unlisted needs.
   - Set 5 fell short of its target: 11 in-scope cases (10 need-bearing) against the target of 25 (§1.2).
2. **Were identity collisions found and safely corrected?**
   - **Yes, one confirmed collision.** Sharp MS02EB and QS204AEB were merged under the generic name "20 Litre Microwave Oven".
   - **Earliest cause:** at ingest the product name came from the generic h1; the pages carry no structured identifier, so `productKey246` fell back to host + name.
   - **Evidence:** both pages were re-fetched lawfully on 2026-10-16 (robots.txt allows /microwaves/; HTTP 200). Each page title names its own model code, matching its URL.
   - **Correction:** a journaled, reversible split by whole page; 25 + 25 declarations, none moved between variants.
   - The audit also found and fixed a false identity flag (havitsmart KB901L, named in comparison tables). Other risks are reported, not "corrected" (§2).
3. **Was proactive teaching actually implemented?**
   - **Yes, for two pilot categories chosen by pre-declared criteria:** microwave_ovens (appliance) and headphones (non-appliance).
   - The teaching was written before any test material was collected and compiled into existing modules:
     - registry names and contrasting phrases;
     - store items by section;
     - hypothesis relations (`measured_by`, `not_sufficient_for`, `may_support`);
     - per-need checkable requirements and clarification questions.
   - The material is versioned (`g252.1`), and every statement is labelled with its epistemic basis (§3).
4. **Which external sources informed it?**
   - Nine sources, all read through public pages on 2026-10-16:
     - US DOE Federal Register 75 FR 42579 (repeal of the microwave cooking-efficiency test);
     - the IEC 60705:2024 catalogue page;
     - US FDA microwave-oven guidance;
     - an LG UK buying guide (as an example of maker claims);
     - two AES abstracts by Olive, Welti et al. (headphone preference targets);
     - the ITU-T/WHO H.870 summary;
     - an IEC 60529 IPX4 test explainer (secondary);
     - RTINGS headphone review pages (measured fields only).
   - No standard text was read. The table with URLs, roles and access is in `docs/phase252/TEACHING-PLAN.md`.
5. **What can PEE now do that it could not before?**
   - For the two pilots (in development, on the spent Stage 4 set), PEE now:
     - names the category instead of saying "unsupported": 21 of 28 decisions correct, against 7 for BASE, which abstained on all 21 in-scope cases;
     - derives checkable requirements, including the new `battery_life_min`;
     - says which declared attributes cannot show a need (for example, declared output power and an "inverter" claim are not sufficient for even heating);
     - states the missing independent evidence;
     - asks need-specific clarifications.
   - **Decision layer:** an "up to X" declaration now excludes a product whose upper bound is below the user's minimum, and otherwise stays unknown.
   - **Review claims:** the extractor now rejects seven kinds of unfaithful encodings (§5).
   - **Identity:** model pages that share a generic name stay separate at ingest.
6. **Did the new method beat vocabulary-based teaching on unseen cases?**
   - **No.** First run on 28 untouched requests (T2), research-guided G against lexical L, with the same names and phrase count:
     - decisions were equal: 20 correct and 7 harmful each;
     - G recalled fewer explicit needs: 20 of 44 against 28 of 44;
     - implicit needs were equal: 1 of 6 each;
     - G produced fewer false needs: 14 against 18.
   - G's added capabilities (requirements 5/15, applicability 7/15, declared-spec checks 17) are ones L cannot produce by construction. They measure capability, not generalisation.
   - On the missing-evidence rubric G scored lower (9/23 against 15/23). L flagged more because it recognised more needs.
7. **Did it generalise beyond its lesson aliases?**
   - **Not demonstrated.** Only 1 of 28 untouched requests lacked a category name, and all arms failed it.
   - The registered name control could not be evaluated, for lack of such requests in the sampled pool.
8. **Did false needs or harmful decisions increase?**
   - Set 5: harmful decisions fell (A 13, R 11, D′ 4), but D′ added 4 false needs and 1 harmful choice that R did not make (`v12`: "hand mixer" read as stand_mixers).
   - Teaching set: both teaching arms made 7 harmful decisions where BASE made none. All 7 are controls (amplifier, DAB radio, cable, range hood, crisp plate, video camera, video recording) whose text names the pilot category but whose purchase is something else.
   - Development fixes reduced false needs (L 18 → 14, G 14 → 10). They did not reduce the harmful decisions.
9. **What is runtime-autonomous versus dependent on Claude?**
   - **Runtime (deployed TypeScript):**
     - the journey with taught registry entries;
     - the indifference filter;
     - the decision layer with the upper-bound rule;
     - the ingest identity guard;
     - the faithfulness checks.
   - **Claude-dependent:**
     - choosing pilots, researching sources and writing the teaching material;
     - verifying the identity split (re-fetch and title check);
     - writing gold;
     - writing the contrast cases.
   - Runtime application of teaching to the operational store is not done. Teaching runs on experiment copies only (§3.4).
10. **What remains unverified?**
    - Generalisation to requests without category names.
    - Any independent (non-author) gold.
    - Microwave need understanding: only 3 in-scope cases.
    - Faithfulness checks on real reviews: all T1, with cases and rules by the same author.
    - The content of the IEC and AES documents behind the cited abstracts.
    - Whether adopting G (or a G + literal-vocabulary merge) into the operational registry is beneficial.
    - 63 table-only products and 3 product-line records (§2.1).

---

## 0. Stage 0 — baseline and classification

- **Baseline:**
  - HEAD `b57fc21`, clean tree, Phase251 the latest report;
  - `knowledge-snapshot.mjs verify`: verified at `7efa0c3` (2,385 declarations, 188 products, 100 category items, 1,350 events, integrity and journal ok).
- **Capabilities by maturity:**
  - **Implemented:**
    - the D′ journey (registry + `ADOPTED_LESSONS250` + Phase251 repairs);
    - category assignment (Phase251);
    - the decision layer (Phase249);
    - the identity warning (Phase251);
    - the Phase110 offset and shape validation.
  - **Experimental:** the lesson arms B and C (Phase250).
  - **Research-only:**
    - semantic entailment of review claims (Phase110 needs a model provider; only `ollamaLocal110` exists);
    - Phase113 negation scope (flagged, not resolved).
- **Budget finding not reported before:** `lessonBudget250(ADOPTED_LESSONS250)` reports `within:false` (22 categories, 64 needs, 344 phrases, 23 counterexamples, against caps of 12/45/260/30). The adopted D′ configuration therefore exceeds the Phase250 lesson budget. This was already true in the Phase251 first run (the D arm file records it). The Phase250/251 comparisons with B and C were budget-equal; D′ is not.

## 1. Stage 1 — untouched set 5

### 1.1 Protocol

`evaluation/phase252/protocol.json` was committed at `d41b3b2` before any candidate was read. Code was frozen there.

- **Sampling:** category strata (16 catalogue categories, 26 site/term queries on cooking and coffee) plus two open strata.
- **Roles and quotas:**
  - IN_SCOPE and CLARIFY: up to 3 per category;
  - CONFUSING_CONTROL: up to 12;
  - OUT_OF_SCOPE_CONTROL: up to 8.
- **Source:** Stack Exchange API only (24 requests). Site pages were never fetched.
- **Ordering:** deterministic sha256.
- **Exclusions:** 1,371 already-seen ids.
- **Scorer:** `phase251-score.mjs`, extended before collection with Wilson intervals, lesson attribution and confusion counts. The Phase251 numbers were reproduced unchanged.

**Amendment 5b** (`5f29ec6`) was registered after screening set 5 and before collecting 5b, because the frame yielded about 10 in-scope cases (most hits were technique, use or repair questions). It used the `tagged=equipment` frame (6 requests). It yielded 1 more in-scope case. Set 5 and 5b are reported pooled and labelled.

### 1.2 Set and shortfall

- 125 candidates were read and every exclusion recorded (`screening.json`).
- **Set:** 30 cases:
  - 9 advise;
  - 2 clarify;
  - 8 confusing controls;
  - 11 out-of-scope controls.
- **Target versus result:** the target was 25 in-scope need-bearing cases and 10 controls; the result is 10 need-bearing in-scope cases and 19 controls.
- **Empty strata:** coffee_grinders had 0 eligible candidates; toasters, toaster_ovens, deep_fryers, slow_cookers, milk_frothers and air_fryers had none in scope.
- **Probable cause:** the lawful pool of kitchen-appliance purchase questions on these sites is largely consumed by sets 1–4.

### 1.3 First run (`journey-real-requests-set5-score-firstrun.json`, committed unchanged in `6b5d067`)

| Arm | Correct | Harmful | Advise correct | Justified abstention | Listed needs | False needs | Harmful on 8 confusing controls |
|---|---|---|---|---|---|---|---|
| A (Phase249) | 11 | 13 | 3/9 | 8/21 | 0/7 | 5 | 8 |
| R (generic repairs) | 14 | 11 | 4/9 | 10/21 | 0/7 | 1 | 8 |
| D′ | 21 | 4 | 8/9 | 13/21 | 1/7 | 4 | 3 |

- **Paired D′ against R:** 12 cases better, 2 worse (`v12` correct → harmful, "hand mixer"; `v18` correct → unhelpful); 16 the same.
- **False needs new in D′:** `small_kitchen`, `dough_kneading` and 2× `versatility`.
- **Budget:** 29/30 exact in every arm. The miss is "$999 CAD" read as USD.
- **Set 5 is now spent.**

**First-failing-link diagnosis (development):**
- needs written as adjectives before the product noun are dropped by the `modifiesProduct` rule ("durable water kettle");
- vocabulary gaps;
- currency codes after a symbol;
- accessory heads in titles ("tray to put a microwave on", "baking sheet in air fryer", "gasket in a blender");
- "hand mixer" read as stand mixer.

These were not patched phrase by phrase (see §4.4).

## 2. Stage 2 — product identity integrity

### 2.1 Audit

`scripts/phase252-identity-audit.mjs`; output `identity-audit.json` holds ids, names, URLs and counts, never values.

| Finding | Count | Status |
|---|---|---|
| Collisions: own pages with different URL model codes | 1 (Sharp) | confirmed and corrected |
| Name-only identity whose URL carries a model code absent from the name | 8 | risk; now guarded at ingest |
| Products known only from comparison tables (role `named_in_table`) | 63 | unverified; attribution by table column, not reviewed |
| Product-line names recorded as products ("2000/3000/4000 Series", ebac.com) | 3 | unresolved, left uncertain |
| Same host and name in several products (false-split candidates) | 0 before; 1 after the split (intended: MS02EB and QS204AEB now differ by declared model) | — |
| Same identifier in several products | 0 | — |

**Wikipedia "Model A 1" versus "Model A 1+".** My first audit normalised away "+" and suggested a false split. They are different Raspberry Pi models; nothing was changed.

### 2.2 Correction

- **Store operation:** `KnowledgeStore246.splitProductIdentity252`.
  - It moves whole pages (declarations and source links of named revisions) to a new product keyed `model:<host>:<code>`.
  - It sets both products' `declared_model` and keys.
  - It refuses to move variant declarations or to empty the original.
  - It journals a `product_identity_split` event with everything needed to reverse it.
- **Inverse:** `reverseProductSplit252`, tested.
- **Evidence file:** `identity-verified-splits.json` (page titles, sha256 of the re-fetched bytes, kept outside Git).
- **Result in the live store:**
  - products 188 → 189;
  - declarations unchanged at 2,385;
  - 25 moved, 25 kept;
  - attribution unchanged (every declaration keeps its revision and URL).
- **Persistence:** synced and verified at pee-knowledge `4c78d47`.

### 2.3 Prevention and decision path

- **Ingest guard (`ingestObservation246`).** When a name-only key would merge a main-product page into a product whose own pages carry a different URL model code, the page is keyed by its own code and an `identity_name_shared_by_model_pages` gap is recorded. A URL code is never used to merge.
- **Identity warning.** It now counts only the product's own pages (role `main_product`). This removed a false flag on KB901L, which is named in comparison tables on two other models' pages.
- **Shortlist names.** Shortlisted products split from one generic name show their model code ("20 Litre Microwave Oven (MS02EB)"); otherwise the user would see two identical names.
- **Decision path checked.** For capacity ≥ 20 L, the shortlist went from 2 of 3 (Sharp held "unknown: identity") to 4 of 4, with distinct names.

## 3. Stage 3 — proactive, research-guided teaching

### 3.1 Research consulted

**Skill research** (`research-v9-full.md`), read in full in these passages:
- lines 83–316: brain, memory and teacher; the learning objective; the curriculum; teaching-pack fields; source families; the facts/relations/methods/judgments ladder; the decisive experiment; a falsifiable, removable teacher;
- lines 464–707: two curricula; worked counterexamples; the source atlas; evidence-level reasoning; value-of-information gap selection; research versus preference questions; the anti-failure table; the minimal experiment; the pack template;
- lines 800–1029: metacognitive diagnosis; the Critical Decision Method and cognitive apprenticeship; value of information; investigation before abstention; measurement science (measurand defined by the method); causal types; missing evidence; syndication; stopping; the protected evaluator; teacher fading; decomposed rubrics.

**Not re-read this phase:** lines 1108–1453 (learning progress, metrology detail) and 1751–2008 (annotation bias).

**External sources:** the nine in answer 4.

### 3.2 Pilot selection

The criteria were declared in `teaching-pilot-selection.json` before choosing:
- C1: new to the journey;
- C2: factually evaluable (≥2 products, ≥2 hosts, ≥2 observed attributes);
- C3: an untouched real-request pool exists, counted with `filter=total` so no text was seen;
- C4: lawful public method sources exist;
- C5: one appliance and one non-appliance.

Tie-break: products, then hosts. C2 excluded keyboards, tents, fans and vacuums. **microwave_ovens** (3 products) beat dehumidifiers (2); **headphones** (4 products, 4 hosts) beat running shoes (3).

### 3.3 Material and implementation

- **Lexical arm L** (`LEXICAL_L252`): names plus need phrases, written from general knowledge and committed (`76c6b2f`) before the research.
- **Research-guided arm G** (`RESEARCH_GUIDED_G252`, `src/phase252_category_teaching.ts`, version g252.1).
  - **Rendering:** `docs/phase252/TEACHING-PLAN.md`.
  - **Labels:** each statement is a source-backed observation, a method reference or an instructor hypothesis. There are no independently supported relations.
  - **Structure:**
    - A: boundary, the same names as L, 12 contrasting accessory or consumable phrases, subtypes and mechanism;
    - B: source routes by evidence question (a method, not a site list);
    - C: interpretation of evidence types;
    - D: per need — phrases, checkable requirement, what would show the outcome, declared attributes that are insufficient or that support it, clarification;
    - plus applicability limits and gaps.
  - **Budget:** phrase count is equal to L's (31 and 34). Needs ≤ 10 per category, contrasting phrases ≤ 12.

**Smallest general extension of existing modules.** No parallel ontology:
- `registryWithTeaching252` and `applyTeaching252` reuse `registryWithLessons250`, `applyLessons250`, `addCategoryItem246` and `addRelation247`;
- every item is a `technical_hypothesis` (`assistant_authored_unreviewed`), and every relation has `hypothesis` support;
- `CategoryEntry248.needQuestions` holds the clarification for a recognised taught need;
- the journey adds a research-plan entry "missing evidence for X" for a taught (hypothesis-level) measure;
- `SPEC_CRITERIA249.battery_life_min` (duration dimension);
- `decideAdvice249`: an "up to" declaration below a minimum fails, otherwise it is unknown, with the reason stated.

### 3.4 Not done

The teaching is not applied to the operational store or registry. Stage 4 did not justify adopting it as is (§4).

## 4. Stage 4 — evaluation on untouched material

### 4.1 Protocol

`teaching-protocol.json` was committed with the frozen G at `c43f6e8`, before collection.

- **Arms** (each on its own copy of snapshot `4c78d47`):
  - BASE: current system;
  - L: BASE + `LEXICAL_L252`;
  - G: BASE + `RESEARCH_GUIDED_G252`.
- **Source:** Stack Exchange API only (8 requests) on hardwarerecs, avp, cooking and diy, with need-worded queries ("noise cancelling", "reheat") as well as names.
- **Exclusions:** all earlier pools.
- **Gold:** need catalogue = union of the L and G need ids; explicit and implicit needs separated. Requirements are derived by a rubric, not labelled by hand.
- **Scorer:** `phase252-teaching-score.mjs`, 10 dimensions, plus the name control.

### 4.2 Set

- 41 candidates were read.
- **Set:** 28 cases:
  - 18 headphones and 3 microwave in scope;
  - 5 confusing controls;
  - 2 out-of-scope controls.
- **Microwave shortfall:** 3 in-scope against the target of 12. The pool is dominated by reheating technique.
- Only 1 case lacks a category name.

### 4.3 First run (committed unchanged in `515769f`; T2)

| Dimension | BASE | L | G |
|---|---|---|---|
| Correct decisions (of 28) | 7 | 20 | 20 |
| Harmful decisions | 0 | 7 | 7 |
| Advise correct (of 21) | 0 | 20 | 20 |
| Explicit needs (of 44) | 0 | 28 | 20 |
| Implicit needs (of 6) | 0 | 1 | 1 |
| Incorrect needs (on controls) | 0 (0) | 18 (4) | 14 (2) |
| Need precision | — | 0.617 | 0.600 |
| Technical requirements (of 15, rubric) | 0 | 0 | 5 (1 false) |
| Applicability cautions (of 15, rubric) | 0 | 0 | 7 |
| Declared-spec product checks available | 0 | 0 | 17 |
| Missing evidence flagged (of 23, rubric) | 0 | 15 | 9 |
| Clarification questions asked | 6 | 7 | 30 |
| Runtime (ms, 28 requests) | 1,506 | 1,746 | 1,729 |
| Phrases / items / relations added | 0 | 65 / 17 / 0 | 65 / 57 / 19 |

- **Name control:** name-present 27 cases; name-absent 1 case, failed by all arms.
- **G against L:** decisions 0 better, 0 worse; needs (tp − fp) 4 better, 7 worse.

**Construction caveat (registered).** The requirement, applicability and missing-evidence rubrics come from the same research as G, so BASE and L cannot satisfy them by design. Judge generalisation on category, needs and decisions.

### 4.4 Diagnosis (development; the set is spent)

1. **G lost literal need words.** The research led to situational phrases ("calls", "meetings", "zoom", "hours") instead of the words users actually write ("microphone", "mic", "comfortable"). On hardwarerecs users state needs literally. This is a method finding (§6.2): it is not evidence that situations are useless, since implicit recall was 1/6 in both arms.
2. **Indifference was ignored** ("not bothered about noise-cancelling", "not looking for wireless", "ANC doesn't matter"). This was the main source of false needs in both arms.
3. **The category name appeared as context, not as the purchase** (all 7 harmful). G's contrasting phrases prevented none of them.
4. **The singular of a plural name was not matched** ("earbud").
5. **Space given as measurements** ("opening 57.5 cm wide") was not recognised by either arm.

### 4.5 Development changes kept

These are general and apply to every category. They were measured on spent sets only:
- **Indifference markers drop a need.** Paraphrase matches of a need set aside everywhere it is named are dropped too. Expressions of wanting an absence ("don't want cold spots", "without cold spots") still count as needs.
- **Category names also match the singular.** Names only: applied to cues and need phrases, the singular caused new ambiguity ("grounds" → "ground"), so it was restricted.

| Spent set (development) | Before | After |
|---|---|---|
| Teaching set, L | correct 20, explicit 28, false needs 18 | 21, 29, 14 |
| Teaching set, G | correct 20, explicit 20, false needs 14 | 21, 21, 10 |
| Set 5, D′ | correct 21/30, harmful 4, needs 1/7, fp 4 | unchanged |
| Set 4, D′ | 48/50, harmful 0, needs 3/4, fp 1 | unchanged |
| Set 3, D′ | needs 10/24, fp 4 | unchanged |

Not changed: accessory/context purchase detection (3), measurements as space (5) and G's vocabulary (1). Fixing them would be more phrase patching or retuning on spent data; they are carried to the next phase.

## 5. Stage 5 — review-semantic integrity

**Inspected:**
- Phase109 (atom vocabulary);
- Phase110: validation is offset/shape only; there are two model passes, and a scripted provider stands in for a model;
- Phase111–112 (long context, ranking invariance; not changed);
- Phase113: negation is flagged for adjudication, not resolved.

**Implemented:** `src/phase252_review_semantics.ts`, called by `extractReview110`. Seven bounded, span-local lexical checks reject an encoding:
- a dropped condition;
- polarity against wording (negation-aware);
- a manufacturer claim promoted to an observation or test;
- speculation or hearsay promoted to an observation;
- a previous product's claim attributed to this one (allowed when it is a comparison with that product);
- comparison direction against wording or a negated comparative;
- a span naming another variant.

A rejected candidate is not proposed; it is listed in `problems` and in `faithfulness.rejected`.

**Kept distinct:**
- `validationScope` remains `offset_and_shape_only_not_semantic_entailment`;
- the new field says `bounded_lexical_faithfulness_not_truth`;
- truth is never decided.

| Set | Wrong encodings rejected | Correct encodings wrongly rejected |
|---|---|---|
| Phase251 diagnostic, 12 cases (development: seen before the rules) | 2/12 → 11/12 (still missed: an implicit aspect mapped to the wrong concept) | 0/12 |
| New 24 cases (first run; T1, committed before the checks) | 23/24 (missed `n12`: comparison whose subject is the other product) | 0/24 |

**Caveat.** I designed the 24 cases and the rules in the same working session. The result is optimistic and is not held-out evidence. No real reviews were used: none are lawfully retained. The checks are English-only, span-local and lexical; "passing" them is not entailment.

## 6. Stage 6 — integrity, tests, documentation

### 6.1 Integrity, tests and security

- **Tests:** `npm test` gives 4,395 passing tests (Phase251: 4,385). New T1 tests:
  - `phase252_identity` (4);
  - `phase252_teaching` (5);
  - `phase252_review_semantics` (1).
- **Store:** integrity and journal ok. Snapshot synced and verified (`4c78d47`). No store change after the identity split.
- **Public repository:**
  - `phase249-public-audit.mjs evaluation/phase252` found no HTML and no e-mails;
  - its "phone" hits are hexadecimal product ids and dates (false positives);
  - long texts are the attributed CC BY-SA request excerpts (`NOTICE-CC-BY-SA.md`);
  - re-fetched Sharp HTML stayed in the session scratchpad;
  - raw API responses stay in `private-eval/phase252`.
- **Process error, corrected.** Commit `a1685f1` was pushed with one failing new T1 test, because my command chain did not stop on the failure. It was fixed in `cfe1035`, and later runs checked the exit code before committing.
- **GateGuard (ECC):** it asked for facts before first edits as designed. It was satisfied each time and never disabled.

### 6.2 Method lessons (added to the skill)

- **Keep the user's literal need words when teaching a category.** Research adds structure (requirements, measures, insufficient proxies, clarifications, missing evidence), not better phrasing. In Phase252, research-chosen situational phrases recalled 20/44 explicit needs against 28/44 for literal phrases under the same budget.
- **A rubric that only one arm can satisfy measures a capability, not generalisation.** Report it separately from category, need and decision quality.

## 7. Evaluation data status

| Set | Status |
|---|---|
| Sets 1–4 | Spent (earlier phases) |
| Set 5 | Spent after its first run |
| Phase252 teaching set (28) | Spent after its first run |
| Review-semantics 24 cases | Used once (T1, development from now on) |

Untouched pools remaining:
- Stack Exchange kitchen purchase questions are close to exhausted;
- hardwarerecs and avp still hold headphone questions beyond the 24 eligible ones read;
- diy holds more appliance-installation questions.

## 8. Files

| Area | Files |
|---|---|
| Code | `src/phase252_category_teaching.ts`, `src/phase252_review_semantics.ts`, `src/phase246_knowledge_store.ts` (guard, split and inverse, `urlModelToken252`), `src/phase249_decision.ts` (identity warning on own pages, model in names, `battery_life_min`, upper-bound rule), `src/phase248_advisory_journey.ts` (`needQuestions`, missing-evidence plan, indifference, singular names), `src/phase110_local_semantic_extractor.ts` (faithfulness hook) |
| Scripts | `phase252-collect-requests.mjs`, `phase252-identity-audit.mjs`, `phase252-teaching-arms.mjs`, `phase252-teaching-score.mjs`, `phase252-review-semantics-eval.mjs`; `phase251-score.mjs` (extended before set 5) |
| Evaluation (`evaluation/phase252/`) | protocols, screenings, gold sets, first-run results and scores, `development/`, identity audit and verified splits, teaching pilot selection, review-semantics cases and first run, `NOTICE-CC-BY-SA.md` |
| Documentation | this report, `TEACHING-PLAN.md`, `CONTINUATION-PROMPT.md` |
