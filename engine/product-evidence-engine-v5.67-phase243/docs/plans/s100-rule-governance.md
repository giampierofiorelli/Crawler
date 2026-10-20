# S100 — Rule governance and the operational semantic correction

Owner review of S99 and the instruction "PEE — Next R3 Step: Rule Governance and Operational Semantic Correction",
2026-10-20 (verbatim in `.claude/skills/pee-guided-learning/references/owner-review-s99-rule-governance-2026-10-20.md`).
Roadmap step: R3. Kind: inference (with governance tests). Maturity: **gated**: the path stays disabled for decisions and
ranking, and S99's operational gates are unchanged.

The owner asked for two outcomes, reported separately:
- (a) a general, permanent method for interactions, precedence, scope, exceptions and conflicts among the scientific
  interpretation rules;
- (b) its immediate use on the S99 blocker: "The extractor that discovered a value must not, by itself, determine whether
  that value is measured, declared, calculated, a threshold, a norm or a condition."

## Outcome

**(a) Rule governance: operational for role, nature and provenance.**
- **One precedence policy, inside the existing rule engine (`knowledge_rules.ts`), not a new engine.**
  - Claims carry a tier (constraint > explicit > inherited > default) and a scope (value < cell < clause < header < row
    < sentence < table < section < document < source).
  - The highest tier present decides; within it, the narrowest scope.
  - Claims that disagree at the deciding level are a conflict: the field stays undecided and the conflict is reported.
  - A default is reported as a presumption and never decides.
  - The most specific rule does not win because it is specific: a statement about the occurrence outranks context of
    any scope, and narrower context outranks wider context.
- **Load-time checks reject:**
  - undeclared fields, values, scopes and tiers;
  - duplicate rules;
  - any two rules that can conclude different values at one tier and scope, unless the contest is declared with its
    values and a reason.

  A later change cannot silently add a contradicting rule.
- **No bypass.**
  - The rules are data (`resources/scientific-reading/observation-semantics.v1.json`, os.2: 86 rules, 39 cue kinds).
  - Every cue kind is produced by a registered reader.
  - A test fails if the reader assigns a role, nature or provenance outside the shared decision.
  - The remaining imperative rules (property attribution, subject, bound, required conditions, comparability, identity,
    product link, quantity parsing) are registered in the contract (`interpretationRules.imperative`), each with what it
    decides, its scope, its tier and its tests.
- **Open conflicts stay visible.** Those not yet under the policy are debt D31, each with its consumers and a
  verification criterion.

**(b) The S99 correction: S100 becomes the gated reading; the table blocker is removed as a wrong decision, not yet
replaced by the right one.**
- Phase245 rows, Phase265 leads and prose are read with the same cues. The extractor is only a presumption.
- On the spent material, role and nature precision rose and false product values fell, at a cost in coverage (§3).
- Both preregistered independent checks pass every stop rule (§4).
- On a new publisher's measured results table, S99 typed all 17 rows as maker specifications; S100 types none of them
  as specifications and abstains. It does not yet read them as results: the only evidence is the sentence that
  introduces the table (§5).

## 1. The rule-interaction audit (S100-1)

Three read-only passes over the readers, the rule data and their consumers found these interactions:

| Finding | What it was | Now |
|---|---|---|
| Meaning by extractor | Phase245 rows were specifications and Phase265 leads results, by construction | cues and one decision (os.2) |
| Precedence by code order | the first matching branch decided | tier, then scope, then conflict |
| F1 | "29:30 mins" read as 30 minutes | one duration (29.5 min); bare clock times are not quantities |
| F2 | "or less" listed both as a bound word and as a threshold cue | one owner: the quantity knowledge's bounds |
| F3 | norm cues that named judgements ("is considered") | reference nouns at value scope ("the 80-decibel mark", "the 44 dB standard") |
| F10 | another object anywhere in the sentence vetoed the property | the veto applies only in the value's clause |
| Term distance | any number between label and value blocked the term (S89) | only a number of the same kind blocks it |
| Comparability | an undecided role, or a field stated on one side only, counted as agreement | conditions unestablished |
| Stale readings | a definition change left old readings current | the reading identity includes the definition and QK identities; supersession |
| F5, F6, F7/F9, F8, F11, F12 | two vocabularies, union of required conditions, `verdicts[0]` in compare, method/condition leak, other code-order precedences, duplicated cue lists | D31 |

The owner's suspected Set/length bug in `scientific_evidence98.ts` was checked by execution: `cb` is an array, and a
cross-source pair under one stated method is `comparable`. A positive test now covers that case.

## 2. What changed (S100-2, S100-3)

**Code and data**
- `src/knowledge_rules.ts`: decision programs (`DecisionDef`), `decide`, `claimRules` and the load-time checks.
- `src/observation_semantics.ts`: the cue readers and `decideSemantics`. The readers cover:
  - the value's own noun phrase;
  - the clause (S86c, S91, S92 and S93 readers reconnected);
  - the sentence;
  - the 1G table ladder (cell, header, caption, linked statement);
  - provenance column headers;
  - section headings (not the page title);
  - record rows;
  - lead method cues;
  - the document and the source.
- `src/scientific_reading98.ts` (sr100.1): all three quantity readers call the decision. Readings keep the cues they were
  decided from. "Claimed"/"Measured" headers are no longer products.
- Store v13 (`semantics_json`), pd.9 and os.2.

**Tests** (`tests/s100_rule_governance.test.ts`, 27 tests):
- *Load-time governance:* a contradicting rule fails to load, and so do an undeclared field, value, scope or tier and a
  duplicate rule. Cue coverage is checked against the registered readers.
- *No bypass:* no meaning is assigned outside the decision, and the contract registry is complete.
- *Seeded property tests:*
  - defaults never decide;
  - the order of the evidence is irrelevant;
  - context never overrides an explicit statement;
  - equal-level disagreement abstains;
  - inheritance follows the narrowest scope;
  - the condition exception yields to a value's own stated property.
- *Owner's examples:* "standard" as a norm, a mode or an adjective; "the 80-decibel mark".
- *Metamorphic page tests:*
  - the same table under a test heading and under a specification heading;
  - an unrelated paragraph does not change the reading;
  - a measurement header under a specifications section;
  - provenance headers are not products;
  - a bare row abstains;
  - the page title is not a section heading.
- *Other cases:* compound durations, parenthetical restatements, calculation operators, positive cross-source
  comparability.

Full suite: 4,945 tests pass.

## 3. Development on spent material (post hoc; never independent)

`evaluation/s100/integrity-dev-*.json`. Material: 115 pages of the S89–S98 waves plus the spent S99 check. The same script
ran three builds.
- it0: the first formulation.
- it1 and it2: the two reformulations used. The general causes they fixed:
  - page titles read as section headings;
  - aspect names (performance, battery life, noise) read as test headings;
  - "maximum power" and "total power output" read as calculations;
  - the S92 "episodic" cue (8 of 15 correct);
  - a value in parentheses losing its clause;
  - a lead's offset read in the wrong line.
- it2 was frozen as `8f982dc`.

| Measure | S98 | S99 | S100 (it2) |
|---|---|---|---|
| Fields changed reading → store / links without a stated subject | not measurable | 0 / 0 | 0 / 0 |
| Correct / wrong / not stored property | 412 / 36 / 519 | 411 / 39 / 517 | 416 / 39 / 512 |
| False product values | 77 | 59 | 45 |
| Other-product / no-product values linked to the reviewed product | 12 / 4 | 4 / 2 | 4 / 0 |
| Statement role: precision among decided (abstentions) | 51% (46) | 85% (89) | 87% (128) |
| Nature: precision among decided (abstentions) | 33% (5) | 63% (66) | 81% (78) |
| Reviewed-product values correctly stored and linked (of 603) | 130 | 98 | 81 |
| Spent S99 check: role precision among decided | 11 of 18 | 11 of 18 | 13 of 14 |
| Advice: decisions changed of 206 | — | — | 0 |

The cost is coverage. S100 abstains where the extractor type was the only evidence: 42 Phase245 rows with nothing but
the extractor presumption, and 50 prose values with only the page-level test presumption. The owner's rule is that the
extractor must not decide, so these are counted as justified abstentions, not errors. They are also the largest pool for
future positive evidence.

## 4. Independent checks (preregistered, sealed, first runs unchanged)

Preregistration: `evaluation/s100/check-preregistration.json`, committed before any fetch, with the table addendum
committed before its fetch.

**Reference procedure (both checks).**
- The S99 guide unchanged, plus one paragraph on tables written before annotation.
- Two blind Claude annotators, then a blind adjudicator.
- Sealed by SHA-256 before any run.

**Check s100.** 7 pages from 4 publishers never used:
- Stereophile measurements;
- SoundStage! Simplifi reviews;
- Levoit maker pages;
- the CleanAirKits maker FAQ.

smartairfilters.com was excluded because its robots file names `anthropic-ai`; it was not bypassed. 108 values.
Agreement before adjudication:

| Field | Agreement |
|---|---|
| Property | 77 of 108 |
| Role | 105 of 108 |
| Nature | 106 of 108 |
| Subject | 101 of 108 |

**Check s101 (the table addendum).** 4 pages from 2 publishers never used: StorageReview SSD reviews (a maker
specifications table and a measured results table) and Lygte power-bank tests. 62 values. Agreement: property 61 of
62, role 60 of 62.

| Stop rule | s100: S99 | s100: S100 | s101: S99 | s101: S100 |
|---|---|---|---|---|
| S1 fields changed / links without a stated subject | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| S2 false product values; other / no-product links | 0; 0 / 0 | 0; 0 / 0 | 0; 0 / 0 | 0; 0 / 0 |
| S3 role precision among decided | 4 of 7 | 6 of 7 | 0 of 1 | 1 of 1 |
| S3 nature precision among decided | 4 of 7 | 6 of 7 | 0 of 1 | 0 of 1 |
| S4 advice: decisions changed of 206 | 0 | 0 | (same code) | (same code) |
| S5 B1 table results stored as specifications / B2 specifications stored as results | 0 / 2 | 0 / 1 | 0 / 0 | 0 / 0 |

All rules hold on both checks. As preregistered, the S100 reader replaces S99's as the gated reading.

**What these checks do not show.**
- The decided samples are small: 7 and 1 values.
- Attribution coverage on these pages is low for both builds: 6 of 38 and 1 of 11 reference property values stored
  correctly.
- B1 was not exercised by either sealed reference:
  - the s100 pages hold no HTML table;
  - the s101 measured table reports IOPS, which is not a quantity-knowledge unit, so the preregistered item procedure
    sampled none of its rows.

## 5. The table blocker on a new page (observed outside the sealed reference; not scored)

The StorageReview Crucial T500 and Samsung 990 EVO Plus reviews each hold two kinds of table:
- the maker's specifications table;
- the publisher's measured boot leaderboard, introduced by "Here is the current boot leaderboard", after "failed the
  bootbench".

How each build read them:
- The 17 leaderboard rows: S99 typed all 17 as specifications, the S99 blocker reproduced on new pages. S100 typed none
  as specifications, and all 17 are undecided ("presumption only").
- The specifications table's IOPS rows: both builds read them as specifications, which is correct.

S100 has removed the wrong decision but does not yet reach the right one. The evidence that the leaderboard holds
results is a sentence before the table, and no reader turns a table's introducing statement into a cue. This is D31/TCX,
with its verification criterion.

## 6. Limits

- Small decided samples on new pages; Claude-agent annotators, not human experts.
- The table result is shown on spent pages, in metamorphic tests and in the unscored observation of §5, not on a
  sealed reference.
- Coverage fell on spent material (98 to 81 reviewed-product values correctly linked).
- D31 lists the conflicts not yet under the policy: two vocabularies, required-conditions union, `verdicts[0]`,
  method/condition leak, code-order precedences, duplicated cue lists, Phase245 header products, unexplained lead
  suppression, instrument nouns, table introductions, missing units.
- No ranking, no recommendation, no promotion of definitions. R3 stays open.

## Files

- Code and data:
  - `src/knowledge_rules.ts`, `src/observation_semantics.ts`, `src/scientific_reading98.ts`,
    `src/scientific_evidence98.ts`;
  - `src/phase246_knowledge_store.ts` (v13), `src/quantity_knowledge.ts`, `src/definition_interpreter.ts`,
    `src/document_evidence.ts`;
  - `resources/scientific-reading/observation-semantics.v1.json` (os.2),
    `resources/property-definitions/property-definitions.v1.json` (pd.9).
- Governance: `docs/architecture/vertical-contract.json` (`interpretationRules`, D31,
  `observation_semantics.ts` registered as gated).
- Tests: `tests/s100_rule_governance.test.ts`, `tests/s99_observation_identity.test.ts`.
- Scripts: `scripts/s99-integrity.mjs` (`--set dev100`, `--wave`, `--out`, role per reader),
  `scripts/s99-check.mjs` (`--wave`).
- Evaluation: `evaluation/s100/` (dev runs, preregistration with addendum, seal, first runs) and `evaluation/s101/`
  (seal, first runs).
- Private copies: pee-knowledge `private-eval/s100/` and `private-eval/s101/` (text hashed; no page bytes, no store
  copies).
