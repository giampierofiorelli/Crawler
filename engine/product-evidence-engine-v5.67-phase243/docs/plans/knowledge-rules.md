# Declarative knowledge rules (KR), first experiment — 2026-10-18

Owner brief (2026-10-18, Italian). The question: can PEE's decisions become more general, understandable, verifiable
and reusable, with fewer rules scattered in code and fewer unjustified ambiguities?
- First-order logic and declarative rules are a direction, not an obligation.
- Outputs need not stay identical where the earlier behaviour was wrong; corrections are measured separately.
- The experiment stays bounded and reversible. Baselines stay reproducible; the store and ranking are unchanged; no new
  acquisition.

This extends `docs/plans/quantity-knowledge.md` (K9–K10): those scope and comparability decisions now live in rules.

## 1. Choice and why

**The choice: a small stratified Datalog in TypeScript, no dependency.**
- **What it is:**
  - function-free Horn rules with negation as failure, evaluated bottom-up to the perfect model;
  - built-ins `= != < >`;
  - a provenance record for every derived fact.
- **Where it lives:**
  - engine: `src/knowledge_rules.ts`, 136 lines;
  - rules: `resources/quantity-knowledge/rules.v1.json`, a shared vocabulary of 67 predicates (each with an arity and a
    one-line meaning) and two programs: `kind` (40 rules) and `compare` (29 rules).
- **Why this and not more:**
  - The errors this project had just made (K8, K9's overreach, K10) were errors of scope and priority between rules,
    hidden in imperative code. Datalog makes each rule's scope a visible condition, terminates always, and explains
    each conclusion.
  - Defeasibility needs no special machinery. "Unless more specific evidence" and "a conflict withdraws it" are
    stratified negation (rules K9, K10, C4/C5).
  - Second-order flexibility comes from reification: kinds, metrics, conditions and justification types are constants
    the rules quantify over, so new knowledge needs no new rule.
  - Full second-order logic, OWL reasoners, SMT and external engines would add weight with no problem that needs them.
- **Negation reads the record, never the world.** `unestablished(X)` means the record does not state X for both
  values, not that X is absent (rule Q12).
- **Static checks at load**, so an error fails before any reading:
  - every predicate declared, with the right arity;
  - every rule safe;
  - the program stratifiable;
  - no rule deriving an input;
  - a program never handed what it derives.

## 2. What moved into the rules

| Decision | Before | Now |
|---|---|---|
| Which document statement applies to which value: restated value, table note, evidence class, **product named** (new), the two blocks after a method sentence | `protocolSupport`, the layer's statement builder | rules S1–S8, C1–C5 |
| Whether the document settles an open kind, and conflicts | `typeQuantity` block | K1–K11 |
| Which justification is reported, and its strength order | `justifyKind` plus an upgrade branch | J1–J14 and the `justification_rank` constants |
| Comparability verdict and reasons | `compareQuantities` cascade | Q1–Q14, F1–F15 (stage order, explanation templates) |

The code now does two things only:
- it reads the text (units, word matches, numbers restated in a block) and states facts;
- it reads the conclusions back.

Every typed value carries `kind.justification.rules` and a readable `derivation`; every verdict carries `rules` and
`derivation`.

## 3. Results (T1 tests; T2 on the 69 spent pages; not held-out)

**Equivalence with the previous build** (`4fa3754`, `evaluation/knowledge-rules/equivalence-kr1-*.json`):

| Run | Values | Kind | Metric | Pairs | Verdict | Justification |
|---|---|---|---|---|---|---|
| kr1-first | 813 | 0 diff | 0 diff | 1,235 | 0 diff | 16 diff |
| kr1-j4 (after the J4 fix) | 813 | 0 | 0 | 1,235 | 0 | 0 |
| kr1-frame (after the scope fix, final) | 813 | 0 | 0 | 1,235 | 0 | 7 (context → protocol, same type: intended) |

Other results:
- Reason wording differs in 141 pairs with the same verdict:
  - underscores became spaces;
  - "only one side is established as cadr" lost the metric's long label.
- Run time is about the same (12.6 s against 12.3 s on 69 pages).
- **Acoustic reference** (sealed, 120 values): unchanged at 82 correct, 0 unjustified interpretations, 0 unjustified
  abstentions (`score-kr1-frame`).
- **Reading and links** (`reading-kn-kr1`, `links-kn-kr1`): 0 count differences.
- **Default path:**
  - advice without the knowledge is identical on 363 requests;
  - the live store is unchanged;
  - suite: 4,673 passed.

## 4. What formalising found (the experiment's main yield)

1. **Justification reported from words that decided nothing (16 values).**
   - What happened: a context phrase ("noise measurement tool") was reported as the justification of a kind the
     document's protocol had settled. The basis message also showed "(null)".
   - Fix: rule J4 now justifies by the value's own words only when they settled the kind.
2. **Nearby paragraphs bypassed every scope rule.**
   - What happened: words in the two paragraphs before a table entered the "context" that decides kinds locally. So
     "We measured the Alpha A1 with a decibel meter" settled the kind of Beta B2's value too. This is the owner's point:
     a methodology does not cover every observation.
   - Fix: only the table's frame (caption, heading) and the value's own labels decide locally. Paragraphs are document
     statements and pass the coverage and product-scope rules (C1–C5).
   - On the retained pages: no kind changed; 7 justifications are now attributed to the protocol.
3. **Instrument words imply their measurand.**
   - What happened: a statement had to name "noise" or "sound" separately to count.
   - Fix: rules S5b/S5c. A kind-specific instrument or the quantity's name makes the statement about that measurand. A
     declared scheme (energy label) still needs the measurand, because labels speak of energy too.
4. **One concept in two lists.**
   - What remains: kind `discriminators` (deciding locally, unscoped) and `kindEvidence` (typed, scoped) overlap.
   - They are kept apart because they differ in scope. A future step should derive both from one typed list with an
     explicit scope.

**New capability: product scope (C4/C5).** A statement that names products covers only those products' values.
- No retained page triggered it.
- It is shown by tests, with an ablation.

## 5. What the experiment shows, and what it does not

- **Shown:**
  - The kind, scope and comparability decisions are expressible as 69 declarative rules, reproducing every earlier
    decision on the retained pages.
  - Each conclusion is explained down to the given facts.
  - New knowledge (a laboratory method for sound power) and rule changes act with no code change; tests cover both
    sides and ablations.
  - Writing the rules exposed two real defects and a duplication that the imperative code hid.
- **Not shown:**
  - Total code did not shrink: the interface grew by 23 lines and the engine adds 136 general lines. Decision code was
    replaced by fact statements, not removed.
  - The benefit on decisions beyond these two programs.
  - Generalisation to unseen pages.
- **Open (debt D24):**
  - metric names and condition cues are still read from nearby paragraphs without scope rules;
  - the discriminators/kindEvidence duplication;
  - the shorter "one metric only" wording;
  - no decision yet consumes these verdicts (D21/D22).
- **Next, if the owner agrees:**
  1. move the remaining context reading (metric names, condition cues) into the rules with the same scope regime;
  2. then the unit-requirement checks of Phase253 requests;
  3. then the typed relevance link (Phase272).

  Each step gets the same equivalence check.

## 6. KR2 (owner review 2026-10-18): complete provenance, and the context under the same scope rules

**Negative premises are recorded.**
- When a rule concludes from an absence (`not ...`), the derivation names the record checked and what was checked.
- Example: `not block_names_product(before 1, Beta B2) [absent from the context of a value of …: no such fact among 7
  given block_names_product facts]`.
- For a derived predicate, it says that nothing in the record derives one.
- This is evidence of absence from that record only, never from the world.

**Nearby context now passes the scope rules too** (new program `scope`, rules X1–X3).
- The texts the layer offers as context for a value are statements with a place: caption and heading (`frame`), the
  paragraphs before or beside the table (`nearby`).
- The frame applies to every value of the table. A nearby paragraph applies unless it names products and not the
  value's.
- Only applicable texts are read for the value's metric names, condition cues, methods and local kind decision.
- Each value records `contextScope` (applied, excluded, derivation).
- On the 69 pages:
  - 248 values read nearby text;
  - 57 values now exclude at least one paragraph. Examples: on a single-product review, the paragraphs about the
    reviewed model are no longer read for the rival models of the comparison tables. The blind acoustic annotator had
    judged that table the same way (the distance does not carry over).
  - Kinds, metrics, conditions and verdicts are unchanged (`equivalence-kr2-final`, 0 differences; reading and links
    0 differences).
  - The acoustic reference is unchanged (`score-kr2`).
- Known limit: a paragraph that names only the reviewed model ("I tested the PuroAir 240 and five rivals") is read as
  about that model only.

**Wording.** The "one metric only" reason again gives the metric's name, via an input fact `metric_label`.

**Suite:** 4,675 passed. Advice without the knowledge is identical on 363 requests; the live store is unchanged.

**Still open (D24).**
- Kind discriminators (local) and typed kindEvidence (scoped) overlap.
- No operational decision consumes the rule verdicts yet.
- No unseen pages have been tested.

## 7. First validation on unseen sources (KV)

See `docs/plans/kr-unseen-validation.md`:
- kind identification transferred (0 unjustified interpretations or abstentions);
- conditions in table cells and comparability did not transfer;
- coverage outside tables is the first obstacle;
- principle P2 (within-source comparability is between products) was adopted in the rule data, TUNED.
