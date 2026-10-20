# S102-1 — Rule-ownership audit: document interpretation and the user request

Owner instruction after S100 (verbatim in
`.claude/skills/pee-guided-learning/references/owner-review-s100-rule-lifecycle-2026-10-20.md`): "First produce a bounded
dependency and rule-ownership audit covering both document interpretation and request interpretation."

**Method.**
- Two read-only passes over the code: the document readers, and the request path.
- One census of the attributions lost between S99 and S100 on spent development material.
- The most consequential claims were checked again in the code before this audit was written.

**Classes.**
- **ALG**: algorithmic (parsing, structure, arithmetic). Stays in code.
- **POL**: policy (vocabulary, precedence, exclusion, exception, threshold). Should be declarative.
- **INV**: invariant (safety, evidence integrity, provenance, authorisation). Must be explicitly protected.

## 1. What S100 already governs

The shared decision (`knowledge_rules.decide`, program `observation_semantics` os.2) decides three fields for every gated
reading: statement role, nature and provenance. It applies to Phase245 rows, Phase265 leads and prose.

Everything else is still decided in TypeScript. On the document side these are IR1–IR8 below; on the request side, all of
§3.

## 2. Document interpretation

| Rule | Decides | ALG | POL | INV | Precedence today | Proposed lifecycle |
|---|---|---|---|---|---|---|
| IR1 `attributeProperty` | property of a value | own-word cutting, plausibility arithmetic | BREAK words, band regex, candidate weight 0.5, QK-competitor veto, profile licence, object rules | ties abstain | code order: band → admissible → score → object → profile → most specific → object resolution | **under review**: the S89 object rules (`termScore`, "the object must be named") stay in production while the S98 replacement (`objectInSentence`) is reachable only from scripts |
| IR2 subject (`readDocumentQuantity98`) | whose value it is | sentence window | comparison-section veto; name distance (3 words, 12 characters); anaphor | role ≠ value → no product | if/else chain (F11) | active; the page-title inconsistency is fixed in S102 (§5) |
| IR3 `quantityBound` | min / max | "(no) X than" parse | word lists (already in the QK pack) | — | kind comparatives > "than" > before > after | active; shared with the request path (§3) |
| IR4 `conditionsOf` | required and stated conditions | union, dedup | union with no source precedence (F6); unmapped `code:` counted as stated | conflicts reported | push order | active (F6 open) |
| IR5 `compareReadings98` | comparability | — | 14 early returns | missing ≠ equal | first return wins | active |
| IR6 occurrence identity | duplicates across extractors | locator prefix, text window | unverified lead text counted as the same occurrence (LTU) | same value ≠ same observation | — | active |
| IR7 product link | the product of a stored reading | — | — | link only from a stated subject | — | **gap, fixed in S102**: leads were linked through the row's product even when the reading's subject was `none` |
| IR8 `findQuantitiesPlain` | which numbers are quantities | m:ss / h:mm compounds, clock times | — | — | — | active |

### Rederivation (owner: "changes to rules … must account for stored interpretations that may require rederivation")

Checked in the code, these defects are real:
- The rule-program version (os.N) is not part of a reading's identity, and its decision record does not keep it. A rule
  change leaves old readings current.
- A revision whose bytes were already seen is re-derived only when the reader name changes. A change to the definitions
  or the quantity knowledge alone takes the "seen again" path, so the stored readings are not re-read.
- No test covers supersession by interpreter.

### Historical restrictive guards (candidates for review, not removal)

| Guard | Origin | Newer mechanism that may subsume it | State |
|---|---|---|---|
| object must be named; a context term needs its own object | S89 | S98 `objectInSentence`, S93 `objectResolution`, S97 `objectLicence` (scripts only) | under review: needs an evaluation before change |
| a label term blocked by any number in between | S89 | narrowed in S100 to numbers of the same kind | superseded (S100) |
| `band_of_another_measurement` early return | S90 | same-kind own words, record roles | under review (untested) |
| S86c approximation / generic early returns suppress the measuring-verb cue | S86c | separate cues under `decide` | under review |
| comparison-section subject veto | S99 | 1G row subjects | under review |
| GL4: a linked statement must share a dimension with the table | 1G | an introducing statement is evidence about the table, whatever its words | **narrowed in S102** for the statement that introduces the table (§5) |
| `structured_table_measurement_term` missing from the Phase265 screen allowlist | Phase265 | the `leadMethodCues` mapping for it is dead code | under review |

### Duplicate vocabularies (F12)

The same cue words live in up to eight places with different meanings:
- "up to" is read as a declaration, as an approximation (abstain) and as a max bound;
- "average" is read as generic (abstain) and as a calculation;
- "maximum" is read as a calculation, a setting, a condition and a bound;
- "sensor" is read as an instrument and as a first-person test.

There are seven clause-boundary definitions. One shared clause function and one cue source per kind are the debt (D31/F12).

## 3. The user request

**Main finding:** no `knowledge_rules` program is used anywhere on the request path. Shared data enters through only
three channels:
- the QK pack (quantities, bounds, aspects);
- the QK `kind` program;
- store concept aliases.

Everything else is TypeScript regex, word lists and tables. Conflicts are settled by evaluation order, first match or last
write. The one consistent exception is category ambiguity, which abstains and asks.

| Decision | Where | Mechanism | When cues disagree | Class |
|---|---|---|---|---|
| category | `runJourney248` | TS registry, cues, lessons | explicit > cue > need; several left → clarify | POL (+ALG matching) |
| purchase target | `purchaseTarget253` | ~90 TS words; three different buying-verb lists | overrides an explicit category alias | ALG + POL |
| negation | five places (need scope, category, indifference, purchase anchor, constraint) plus budget | five vocabularies; the QK pack's `evaluation.negators` unused | each its own scope | POL (one declarative negation scope) |
| need recognition | journey | store aliases + TS stoplists, IDF threshold 2.2, 40-word rule | longest match | ALG + POL |
| **bound of a requirement** | `phase253_request_constraints.ts` 27-76 **and** `quantityBound` | two vocabularies (a third for the budget) | the TS reading wins over the shared one wherever spans overlap (`applyQuantityRequirements253`) | POL + **INV** |
| property of a requirement | constraints 79-88 | TS regex; any volume → capacity; any min power → power | first match | POL |
| explicit vs inferred | constraints l.100; `adviseCore253` | TS | `stated_in_request` → **confirmed, hard** (Phase177) | **INV** |
| **conflict between requirements** | none | — | **two limits on the same key: the last one wins silently**; min > max never noticed | **INV** |
| applicability of a criterion to a category | `SPEC_CRITERIA249`, `NEED_CRITERIA250` | global TS tables | every criterion applies to every category | POL |
| question to ask | journey and advice (the same two questions written twice) | TS tables | taught questions suppress generic ones | POL |
| unrecognised parts | `request_coverage80` | TS stoplist, stemmer (copied) | runs only when a category was resolved | ALG + INV |
| request values as product facts | — | — | never: snapshot only (protected) | INV |

**Invariants to protect.**
- Only a stated, bounded, non-negated requirement becomes hard.
- Inferred needs never enter the snapshot.
- Request values are never product evidence.
- A 2 % source disagreement makes a product unknown, never excluded.
- Ranking only via ra.2 restrict-only.
- Uncovered parts are always reported.

**Can the request path reuse the shared governance?** Yes, for decisions that combine competing readings. The bound
of a requirement (two readers that can disagree), conflicts between requirements, negation scope, applicability and
precedence among cues are all expressible as `knowledge_rules` decisions with tiers and abstention.

Semantics stay distinct. A request rule concludes a *requirement state* (stated, candidate, conflicting); it never
concludes a product fact. The two programs share the decision policy, not the vocabulary.

## 4. Lost attributions S99 → S100 (development, spent material)

Of 55 values S99 had right and S100 lost (11 gained), the evidence behind each:

| Group | n | Evidence on the page | Verdict |
|---|---|---|---|
| Phase245 rows with only the extractor presumption | 18 | 10 are table rows under the heading "Data sheet …" ("data sheet" is missing from the specification vocabulary); 8 are prose sentences that Phase245 read as rows, whose sentence the reader never sees ("Ecovacs claims a suction power of up to 30,000 Pa") | **evidence present, unused** |
| decided correctly, linked to a named product instead of the page product | 14 | product names written differently from the page title (subject identity) | subject, not semantics (IR2) |
| prose with only the page-level test presumption | 9 | 2 have a governing lead-in before a colon ("when measuring its noise level (from 1 m): around 60 dB"); others state a value with no cue ("a disappointingly low 1500 Pa") | partly present (colon lead-in); partly insufficient |
| prose with no evidence | 9 | label:value lists under "The techy stuff", "Product spec:", "Spec:"; 1 lists under a page-level heading only | headings present; "spec" and "techy stuff" not recognised as heading words when written with punctuation or informally (partly vocabulary, partly insufficient) |
| conflicts | 2 | a claim and a result in one sentence | justified abstention |

## 5. What S102 implements (the smallest general changes this audit justifies)

1. **Rule lifecycle.** A versioned lifecycle (active, under review, superseded, retired) for declarative rules in
   `knowledge_rules` and for the imperative registry in the contract. Each state carries its reason, affected consumers and
   regression evidence. Superseded and retired rules are never executed; an invariant cannot be retired by a lifecycle
   entry alone.
2. **Rederivation.** The reading identity carries the rule-program and document-reader versions. Already-seen bytes are
   re-derived when the reader, the definitions, the quantity knowledge or the rule program change.
3. **IR7 invariant.** A lead's product link follows its reading's subject.
4. **Introducing statements (D31/TCX), one general mechanism.**
   - The statement that introduces a table or a list (the nearest preceding text in its section), and the clause before
     a colon that governs a value, are read with the same cues as prose, at table / row scope.
   - Phase245 rows taken from prose are read in their own sentence.
   - This is not a rule for any phrase.
5. **Request path, first bounded integration.** The bound of a stated requirement and conflicts between requirements
   are decided by a `knowledge_rules` decision program. When the two bound readers disagree, or two stated limits on one
   criterion contradict each other, the requirement abstains: it becomes a candidate with a question, never a hard
   exclusion.
6. **Vocabulary (data, with history):** "data sheet", "datasheet" and "technical data" as specification headings. No
   phrase-specific rule.

Not in S102 (registered as under review or as D31):
- the S89 object guards;
- the negation vocabularies;
- criterion applicability;
- the duplicate clause functions;
- comparators F7/F9;
- F5, F6 and F8.
