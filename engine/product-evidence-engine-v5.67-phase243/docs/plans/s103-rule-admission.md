# S103 — Rule admission, static analysis and request semantics

Owner authorisation 2026-10-20 ("PEE — Authorisation: Rule Admission and Semantic Validation", verbatim in
`.claude/skills/pee-guided-learning/references/owner-rule-admission-authorisation-2026-10-20.md`). The assessment that
came first is `owner-rule-admission-2026-10-20.md` and commit `5a02af1`. Roadmap step: **R3** (scientific knowledge
consulted in reading; consolidation R3-C). Kind: inference and governance. Maturity: **gated**.

Unchanged by S103:
- production ranking, publication and evidence authorisation;
- every decision of the observation-semantics program (os.4) on the development material.

**R3 is not complete. S103 authorises no production ranking.**

Commits:
- `8cc7ccf`: implementation freeze.
- `7414e4b`: preregistration.
- `b1c365d` and `4bf0e47`: Part A requests, sealed reference and first runs.
- `15e030e` and `7d328e8`: Part B sealed reference and first runs.
- `0c4161a` (pee-knowledge): private evaluation detail.

Material and tiers:

| Material | Tier | Note |
|---|---|---|
| The 206 regression requests and the S89–S102 pages | development | spent; never reported as held-out |
| Part A: 40 requests | T1 independent author | written by a fresh Claude agent; annotated blind by a second Claude agent |
| Part B: 6 pages, 3 never-used publishers | T2 authentic controlled | blind reference from two Claude-agent annotations plus adjudication |

No real-user or human-annotated evidence was produced. The frozen build `8cc7ccf` was compared with the S102 build `dce8a3a`.

## 1. What was implemented

| Capability | Kind | Maturity | Where |
|---|---|---|---|
| Rule admission record: meaning, scope, prerequisites, exceptions, counterexamples with their tests, provenance, consumers, classification, evidence | governance (vocabulary) | operational at load: a program that requires admission refuses an unadmitted rule | `src/knowledge_rules.ts` `checkAdmission` |
| Invariant governance: `invariant` needs an `invariantKind` and a justification; `experimental` rules run in shadow only, and their claims never decide; `rejected` state | governance | operational at load | `knowledge_rules.ts` |
| Program-level declarations: `admission.required` with a ratchet of legacy unreviewed rules; single-valued input keys; exclusive conclusions proved at load; declared input domains | governance | operational at load | `knowledge_rules.ts` |
| Named contests: each says which rules conflict and why, with every pair verified by the analyser. Blanket or vacuous contests are refused | governance | operational at load | os.4: 30 contests, 129 verified pairs |
| Static analysis: overlap, conflicting conclusions with a witness, redundancy, rules that never fire, gaps. **Declared coverage `ANALYSIS_COVERAGE`**: the COMPLETE class proves absence; outside it the result is "incomplete analysis", never "no conflict" | inference (tooling) | operational in tests and at load for contests | `analyseProgram` |
| Request semantics, rq.2 (detailed below) | inference | operational on the request path | `src/phase253_request_constraints.ts`, `resources/request-semantics/request-semantics.v1.json` |
| Strict vs inclusive bounds, end to end: request → constraint → Phase177 snapshot (`exclusive`) → Phase249 check (strict `meets`) → advice symbols | inference | operational | phase177, phase249, phase253 |
| New criteria `capacity_max` and `power_max` | vocabulary | operational | `phase249_decision.ts` |
| One bound reader for requests and documents. The Phase253 local bound regexes are retired and their phrases moved into the QK pack (qk.2.5) | vocabulary | operational | `quantity_knowledge.ts` `quantityBound` |
| fast-check 4.10.2, an exact test-only devDependency (MIT; its only dependency is pure-rand 8.4.2, MIT). Fixed seeds; the shrunk counterexample is recorded | testing | operational in the suite | `evaluation/s103/property-seeds.json` |
| Re-derivation census of the store | inference (audit) | operational script | `scripts/s103-rederivation-census.mjs` |

### Request semantics (rq.2)

Each limit now carries:
- a status: stated, candidate, preference, superseded or implied;
- a closure (strict or inclusive) and the words that justify it;
- a force: requirement or preference;
- the object, the scenario, its relations to other limits, a question when one is needed, and a canonical base value.

How intervals are read:
- "between 3 and 5 litres" gives two ends;
- a range written with no bound word ("$40–60") becomes a candidate with a question.

How several limits combine is decided by `request_combination`, rules RC01–RC10:
- two minima on the same property, object and scenario: the stricter one applies and the other is reported;
- a correction supersedes the limit it corrects;
- limits on another object or scenario stay separate;
- a minimum above a maximum is a contradiction, and both limits are asked about;
- RC10 is the semantic invariant "a preference never becomes a requirement".

### Metamorphic and property tests

Scoped as the owner asked. Under fast-check with fixed seeds:
- reordering *independent* requirements leaves the decision unchanged;
- reordering a *correction* is expected to change the decision ("at least 4 L, actually make it 6").

Other properties tested the same way:
- a preference is never hard;
- an empty interval is a contradiction;
- two minima apply the larger, in any unit;
- strict checks are consistent with the bounds.

One counterexample was found and shrunk during development: 8383 ml became 8.383000000000001 l, and the larger minimum was misjudged. The base value is now rounded, and an example test keeps the case.

## 2. What was independently validated (first runs, unchanged)

Preregistration: `evaluation/s103/preregistration.json`. The stop rules were:
- if harmful request errors or false product attribution are higher than S102, report a regression and claim no improvement;
- no tuning on this material.

### Part A: 40 new requests (T1 independent author), 116 annotated limits

Of the 116 limits, 81 are on a property PEE has a criterion for. The other 35, mostly noise levels, are counted as coverage gaps.

| Measure | S103 | S102 |
|---|---|---|
| Limits detected (same property, side, base value) | 47 / 81 | 45 / 81 |
| Handled exactly as the reference says (apply / ask / report) | 35 | 32 |
| **Harmful: applied when it must not be** (preference, replaced, alternative, unclear range) | 6 | 8 |
| **Harmful: a limit the reference does not contain, applied** | 1 | 0 |
| Over-cautious: asked or reported where the reference applies | 5 | 5 |
| Justified abstentions (asked where the reference asks) | 2 | 2 |
| Closure (strict/inclusive) agrees, among detected | 45 / 47 | 29 / 45 |
| "Apply" limits missed entirely | 26 | 28 |
| Answer type changed (clarification / shortlist / abstention) | 1 request (abstention → clarification) | — |

Stop rule: harmful errors 7 vs 8. Fewer, so the rule holds, but only narrowly.

The new harmful case is q01, "nothing over 6L":
- S103 reads it as a strict *minimum* of 6 L and applies it, which makes "at least 4 litres" redundant;
- S102 read the same minimum but asked about it.

The cause is that the negation of a bound is not read (D31/NEG, NEG_BOUND below). S103's combination rules made the misreading harmful.

S103 corrected:
- "would rather stay below $350" (a preference, now reported);
- "$40–60" (a range without a bound word, now asked);
- 16 closure errors: S102 read every limit as inclusive.

Residual harmful errors, shared by both builds:

| Request | Limit | Cause |
|---|---|---|
| q01 | "Under £100 *ideally*" | hedge written after the limit |
| q07 | "under 2.5kg *if there is such a thing*" | hedge written after the limit |
| q10 | "we'd like at least 300 litres" | "we'd like" is not a preference word |
| q22 | "Sub included *if* it's under £400" | condition not read as a scenario |
| q23 | "I was going to say under $100" | correction not read |
| q38 | "budget is 50 to 100 dollars" | the budget is read by the Phase125 budget reader, outside the S103 semantics |

### Part B: tables of stated provenance (T2 authentic controlled)

The material:
- 6 pages from 3 never-used publishers: powerbank20, ultrabookreview and hothardware;
- 3 publishers excluded: justinsimoni redirected to itself, and thesmarthomehookup and technixt are blocked. None was bypassed;
- 61 items. The two blind annotations agreed before adjudication on property 61/61, role 59, bound 61, subject 55, nature 60 and provenance 57.

| Measure | S103 | S102 |
|---|---|---|
| Property correct / wrong / not stored (26 reference values) | 5 / 1 / 20 | 5 / 1 / 20 |
| Items with no fitting property label | 28 | 28 |
| Role decided and correct | 0 of 5 compared | 0 of 5 |
| False product values | 1 | 1 |
| Items whose role was decided by the table's introducing statement | 0 | 0 |
| Bound agrees | 6 / 8 | 7 / 8 |

The bound difference is a scorer pairing artefact:
- S103 correctly reads the prose "50Wh or smaller one" as a maximum;
- the scorer pairs that reading with the same value in the table cell.

**This test failed to show the table-introduction capability.** One introduction says "real everyday use numbers, and not what manufacturers claim". It names the measurement and denies the declaration, yet it was treated as mixed evidence: both cues fired because the negation of the declaration is not read. Most table values also have no property definition (units such as Wh delivered and charge efficiency in these categories).

Both builds are identical on this material:
- **no regression and no gain**;
- false product attribution is unchanged.

### Development material (spent)

| Material | S102 | S103 |
|---|---|---|
| S89–S102 pages: reading correctness | — | unchanged |
| Bounded readings | 125 | 127 |
| 206 regression requests | — | 0 decisions changed |

Two more bounded readings: the maker claim "Max 30,000 Pa" is now read as a bound in two places.

What the 206 requests did change:
- 6 budgets are now marked strict;
- one quantity-identity string changed;
- 7 requests changed in their statements or constraints (`evaluation/s103/advice-diff-it1.json`).

## 3. Rules replaced or retired

| Rule | State | Replaced by | Why |
|---|---|---|---|
| RQ01, RQ02 (two bound readers as competing claims) | superseded | RQ03, RQ04, reading one bound from `quantityBound` | one reader for requests and documents (F12) |
| RQ08 (two different limits for one criterion = conflict, marked invariant) | superseded; reclassified on the owner decision as a development choice, not an invariant | `request_combination/RC05` and RC01–RC10 | owner review of S102: limits combine, correct, refer to other objects, or contradict only when incompatible |
| Phase253 local bound regexes (`MIN_BEFORE`, `MAX_BEFORE`, `MIN_AFTER`, `MAX_AFTER`) | removed from code | QK pack qk.2.5 request phrases | census: 0 disagreements in 185 quantities (`bound-reader-census.json`) |
| os blanket contests (`'*'` vs `'*'`) | refused by the loader | 30 named contests, 129 verified pairs | a contest must name the rules it settles |

## 4. Semantic policies still hardcoded, and why

| Policy | Why it is still code | Check that will move it |
|---|---|---|
| Five negation vocabularies with different scopes (D31/NEG) | a single scope needs a clause model; the evidence above (q01, the table introduction) shows it is now the most harmful gap | NEG and NEG_BOUND |
| Criterion applicability per category (APP) | needs per-category declarations first | APP |
| Comparators decided in several places (F7_F9) | the compare program returns `verdicts[0]` | F7_F9 |
| Required-condition precedence (F6) | QK and definitions disagree with no precedence declared | F6 |
| Other duplicate cue lists: declaration, test, certification, "up to", "average" (F12) | only the bound words moved in S103 | F12 |
| Clause boundaries, seven definitions (CLAUSE) | algorithmic, but with different word sets | CLAUSE |
| Phase125 budget reader | it predates the semantics and also reads currencies; it still decides budget ranges | BUDGET_READER |
| Parsing, unit arithmetic, matching | algorithmic, correctly code | — |
| 86 os.4 rules admitted as `legacyUnreviewed` | the ratchet forbids new ones; each needs its own review | OS_ADMISSION |

## 5. What remains open in D31

These items are recorded in `docs/architecture/vertical-contract.json`.

Resolved by S103:
- **RQ08**;
- **INVARIANT_GOV**.

Progressed by S103:
- **F12**: the bound words;
- **REDERIVE_SWEEP**: the census.

Census result:
- all 152 value-retaining revisions in the live store were derived by spec-extractor-7, while the code is spec-extractor-8;
- none of their page bytes is held, so only a new authorised fetch can re-derive them;
- page copies used by evaluations exist only in this container.

Added by S103:

| Item | What |
|---|---|
| NEG_BOUND | negated bounds ("nothing over 6L") are read with the opposite side |
| HEDGE_AFTER | hedges written after a limit ("ideally", "if there is such a thing") and "we'd like" are not preference cues |
| BUDGET_READER | the Phase125 budget reader sits outside the request semantics |
| REQ_VOCAB | "plus" ("30 hours plus"), space-fit wording ("fits a 45cm gap", "fit 60x60"), a weight without a weight word |
| INTRO_NEG | a table introduction that denies one provenance ("not what manufacturers claim") fires both cues |
| SCORER_PAIR | the integrity scorer pairs a prose bound with a table cell of the same value |
| OS_ADMISSION | 86 legacy unreviewed os.4 rules |

Still open from before:
- F5, F6, F7_F9, F8, F11, P245, LTU, INS, TCX, UNIT, RQC, NEG, APP, CLAUSE, WITHA, INTRO_VOCAB and ATTR;
- TCX and INTRO_VOCAB are not shown resolved: Part B decided 0 items through an introduction.

## 6. Did the integrated system become more correct and maintainable?

**More maintainable: yes.**
- Rules now enter with a stated meaning, scope, provenance and test, and invariants need a justification.
- Conflicts are declared per pair and verified, and the analyser states what it cannot decide.
- One bound reader replaces two.
- Request combination and closure are data with tests.

**More correct on requests: modestly, and not uniformly**, on Claude-authored requests only.
- Closure went from mostly wrong to mostly right (29/45 → 45/47).
- Harmful errors went from 8 to 7.
- One new harmful error came from a negation the semantics cannot yet read.
- About a third of the "apply" limits are still missed, mostly through vocabulary gaps.

**More correct on tables: no.** Part B showed no change, and neither build reads these tables.

Rule consistency is not scientific correctness. The analyser shows that the rules agree with each other, not that they
are right.

## Files

| Area | Files |
|---|---|
| Code | `src/knowledge_rules.ts`, `src/phase253_request_constraints.ts`, `src/phase253_request_advice.ts`, `src/phase253_advice_contract.ts`, `src/phase249_decision.ts`, `src/phase177_decision_snapshot.ts`, `src/quantity_knowledge.ts` |
| Rule and knowledge resources | `resources/scientific-reading/observation-semantics.v1.json` (os.4), `resources/request-semantics/request-semantics.v1.json` (rq.2), `resources/quantity-knowledge/quantity-knowledge.v3.json` (qk.2.5) |
| New tests | `tests/s103_rule_admission.test.ts`, `tests/s103_request_semantics.test.ts` |
| Updated tests | s85, s86, s100, s102, phase253, phase259 and quantity_knowledge, each with a dated note |
| Evaluation | `evaluation/s103/`: public counts and sealed references |
| Private detail | `pee-knowledge/private-eval/s103/` |
