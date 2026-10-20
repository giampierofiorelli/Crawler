# S102 — Rule lifecycle, declarative governance and user intent

Owner review of S100 and the post-S100 instruction (2026-10-20, verbatim in
`.claude/skills/pee-guided-learning/references/owner-review-s100-rule-lifecycle-2026-10-20.md`). Roadmap step: R3.
Kind: inference and governance. Maturity: **gated**. Production ranking, publication and evidence-authorisation gates are
unchanged. The evaluation folder `s101` holds the S100 table addendum, so this step is named S102.

The audit that came first is `docs/plans/s102-rule-ownership-audit.md`.

## The five outcomes the owner asked for

**1. What S100 already governs.**
- Statement role, nature and provenance of every gated reading, through one declarative program and one decision policy.
  Nothing else.
- On the document side, eight imperative rule groups (IR1–IR8) decide property, subject, bound, conditions,
  comparability, identity, product link and quantity parsing.
- The request path uses no rule program at all.

**2. Which old rules are obsolete, conflicting or still necessary.** Each now has a lifecycle state in the contract
(`interpretationRules.historicalGuards` and `imperative[].lifecycle`):

| Guard / rule | Origin | State | Why |
|---|---|---|---|
| a label term blocked by any number in between | S89 | **superseded** (by the S100 same-kind rule) | other kinds of numbers blocked correct attributions |
| the episodic situation type decides result/measured (OS11, OS12) | S92 | **retired** (kept in the file, never executed) | 8 of 15 correct on spent material |
| the object must be named; a context term needs its own object | S89 | under review | its S98 replacement runs only in scripts; needs an evaluation before any change |
| `band_of_another_measurement` | S90 | under review | untested |
| approximation / generic early returns suppress the measuring verb | S86c | under review | should be cues, not vetoes |
| comparison-section subject veto | S99 | under review | **still necessary**: S102 removed the page title from it for consistency, saw 3 more values of other products linked to the page product, and restored it |
| a linked statement must share a dimension with the table (GL4) | 1G | active, narrowed | the statement introducing a table is now read separately |
| IR7 product link | S99 | active (**invariant**, gap closed) | a lead was linked through the row's product even when its reading's subject was none |

**3. Which hardcoded policies can safely become declarative.**
- The audit classifies every rule as algorithmic, policy or invariant (§2–§3 of the audit).
- Moved in S102:
  - the bound of a stated request requirement and conflicts between stated requirements (request-semantics rq.1);
  - the retired rules, which are now data with their history.
- Classified as policy, not moved yet (each with a verification criterion in D31): negation scopes (five vocabularies),
  criterion applicability, purchase-target verbs, comparators, required-condition precedence, duplicate cue lists, clause
  boundaries.
- Algorithmic, staying in code: parsing, matching, clause splitting, unit arithmetic.

**4. Whether the user-request path can reuse the shared governance. Yes, and it now does, for one decision.**
- The bound of a requirement has two readers: the request-constraint reader and the quantity-knowledge bound words that
  also read documents. Both are now claims under the same policy.
- The program concludes requirement states only. A test checks that no rule head concludes anything else. User
  preferences never become product facts.
- Two cases now abstain instead of becoming hard exclusions:
  - the readers disagree about a bound;
  - two different limits are stated for one criterion. The last one used to win silently; both now become candidates
    with a question.
- In the 206 regression requests no such case occurs: **0 of 206 answers changed**. The change is safe, but its benefit
  is shown only by tests, not by these requests.

**5. Which improvements are implemented, validated and operational.** See §1–§3 below. All are in the gated reading path
or the operational request path. The ranking path is unchanged.

## 1. Rule lifecycle and rederivation

- **Declarative rules** (`knowledge_rules.ts`): `lifecycle {state, since, reason, supersededBy, consumers, evidence}`.
  - A superseded rule needs an existing, executable successor.
  - A superseded or retired rule needs regression evidence and is never executed.
  - A rule marked `invariant` cannot be superseded or retired through a lifecycle entry.
  - Retiring one side of a declared contest is a valid change.
- **Imperative rules:** the same states and classes in the contract. A test requires evidence files for superseded and
  retired entries, and tests for every invariant on the request path.
- **Rederivation:**
  - The interpreter identity is now `sr102.1+os.3+wd.1` (reader, rule program, document reader). The revision
    derivation key also includes the definitions and quantity-knowledge identities.
  - The audit found that a change of definitions or rules used to leave stored readings current for bytes already seen.
  - A test shows the same bytes re-read under new definitions, with the old readings superseded, not deleted.

## 2. The S100 table problem: introducing statements reach the shared decision

The owner asked for "a general mechanism linking introductory statements, tables, cells, methods and products", not a
rule for one phrase.

- **Tables:** a new 1G evidence level, `table_context`, reads the text that introduces a table (the two blocks before it
  in its section) with the same cues as a caption.
  - An introduction naming more than one kind of evidence does not decide; the linked statements do.
  - A twin table inherits its sibling's introduction (GL12).
- **Prose:**
  - a clause before a colon introduces the value it precedes;
  - a closed parenthetical before a value is an aside, not a clause boundary;
  - a Phase245 row read from a prose sentence is read in that sentence.
- **Vocabulary (data, pd.10):** "spec", "data sheet", "datasheet", "technical data", "technical details", "when
  measuring", "while measuring".

Tests use invented pages:
- the same table introduced by "We measured the noise … in our lab" is read as results;
- introduced by "The manufacturer lists …", as specifications;
- introduced by an unrelated sentence, or nothing, it stays undecided;
- "When measuring its noise level (from a distance of 1 m): around 60 dB" is read as a result.

## 3. Measurement

### Development (spent S89–S99 material; post hoc; never independent)

The scorer used to pick the first matching stored row in storage order. Reading ids change with the interpreter
identity, so comparisons between builds moved for reasons unrelated to behaviour: S102's first run showed 3 "new"
other-product links that were only reordered rows. The scorer now orders rows by occurrence. All builds were re-scored
with it, so the S100 report's figures differ slightly from the table below.

| Measure | S99 | S100 | S102 |
|---|---|---|---|
| Fields changed reading → store / links without a stated subject | 0 / 0 | 0 / 0 | 0 / 0 |
| Correct / wrong / not stored property | 411 / 39 / 517 | 416 / 39 / 512 | 416 / 39 / 512 |
| False product values | 59 | 45 | 46 |
| Other-product / no-product values linked to the reviewed product | 8 / 2 | 8 / 0 | 8 / 0 |
| Statement role: precision among decided (abstentions) | 84% (90) | 86% (141) | 87% (121) |
| Nature: precision among decided (abstentions) | 56% (56) | 85% (88) | 85% (88) |
| **Reviewed-product values correctly stored and linked (of 603)** | **98** | **78** | **97** |
| Advice: decisions changed of 206 | — | — | 0 |

S102 recovers 19 of the 20 attributions S100 lost while keeping S100's precision. Where they came from, by the audit
census:
- 18 table rows under "Data sheet …" headings: a vocabulary gap, not a missing rule;
- label:value lists under "Spec:";
- lead-in clauses before a colon.

One more false product value: a value under "Spec:" that the reference says is not a property value. This is a property
attribution error (IR1), not a role error.

### The S100 check sets (sealed references; not used in S102 development)

These pages are not new: the S100 checks were spent by S100's first runs, and the StorageReview tables were inspected
then. They are reported as material held out from S102's tuning, not as an independent validation.

| | S100 | S102 |
|---|---|---|
| s100 check: correct property (of 38) / false product values | 6 / 0 | 6 / 0 |
| s100 check: role precision among decided (abstentions) | 6 of 7 (2) | 5 of 6 (3) |
| s101 table addendum: correct property (of 11) / false product values | 1 / 0 | 1 / 0 |
| s101: role precision among decided | 1 of 1 | 1 of 1 |
| Fields changed / links without a stated subject | 0 / 0 | 0 / 0 |

- **One value moved from decided to undecided:** "checking their levels with a sound-pressure-level (SPL) meter showed
  … 80dB". Once the parenthetical no longer splits the clause, the declaration cue "with a" falls in the same clause as
  the measuring verb. The result is a conflict and an abstention. Not an error, but "with a" is too broad (D31/WITHA).
- **The StorageReview leaderboard (17 measured rows) stays undecided.** The introduction mechanism reads its
  introduction, but "failed the bootbench … Here is the current boot leaderboard" contains no test or declaration word
  (D31/INTRO_VOCAB). S102 does not add a phrase rule for it, as the owner asked.

No new independent wave was fetched. The changes are a governance mechanism, a vocabulary gap and two general reading
rules shown on spent material. A new independent check is the next validation, preregistered with tables whose
introductions state their origin.

## 4. Limits

- The coverage recovery is shown on spent material only. On the held-out S100 checks S102 is level with S100.
- The request integration changed none of the 206 regression answers. Its value is shown by tests of cases (conflicting
  limits, disagreeing readers) that those requests do not contain.
- New D31 items:
  - WITHA: "with a" as a declaration cue;
  - INTRO_VOCAB: introductions without cue words;
  - ATTR: the attributive cue against a measuring verb, "We measured … as 61 dB";
  - RQC: request coverage only when a category is resolved;
  - NEG: five negation vocabularies;
  - APP: global criterion applicability;
  - CLAUSE: seven clause-boundary definitions.
- No ranking, no recommendation, no promotion of definitions. R3 stays open.

## Files

- **Code:**
  - `src/knowledge_rules.ts` (lifecycle), `src/observation_semantics.ts`, `src/scientific_reading98.ts` (sr102.1);
  - `src/table_interpreter1g.ts` (table_context, twin inheritance);
  - `src/phase246_knowledge_store.ts` (derivation key, IR7);
  - `src/phase253_request_constraints.ts` (request decisions).
- **Data:**
  - `resources/scientific-reading/observation-semantics.v1.json` (os.3);
  - `resources/request-semantics/request-semantics.v1.json` (rq.1);
  - `resources/property-definitions/property-definitions.v1.json` (pd.10).
- **Governance:** `docs/architecture/vertical-contract.json` (`interpretationRules.lifecycle`, `historicalGuards`,
  `requestPath`, imperative classes and lifecycles, D31).
- **Tests:** `tests/s102_rule_lifecycle.test.ts` (14), `tests/s100_rule_governance.test.ts`. Full suite: 4,959 pass.
- **Evaluation:** `evaluation/s102/`:
  - development runs, re-scored S99 and S100 builds;
  - the S100 check sets run with S100 and S102;
  - the 206-request diff.
- **Private copies:** pee-knowledge `private-eval/s102/` (details and advice answers; text hashed; no page bytes).
