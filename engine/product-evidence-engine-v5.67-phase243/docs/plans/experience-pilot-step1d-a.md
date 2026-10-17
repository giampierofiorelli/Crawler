# Continuous scientific learning — Step 1D-A: evidence-grounded document entity inventory

This is the owner's Step 1D-A brief of 2026-10-17. It follows Step 1C (`docs/plans/experience-pilot-step1c.md`, 93efede)
and supersedes no report.

**Constraints observed:**
- **HTTP:** none (0 requests). Only pages and gold already held privately were used.
- **Not changed:** production extraction, ranking, store schema, retention and signing (production signing stays disabled).
- **Not created:** no skill, knowledge engine, database, catalog or product dictionary. No external manufacturer catalog.
- **Inventory:** evaluation only, wired into the Step 1C attribution candidate through two additive hooks.
- **Step 1D-B:** not started.

**Tier:** every result below is **development evidence**. The Step 1C pages and the Phase272 pages were examined while the
inventory was designed. Nothing here is held-out; nothing may be reported as such.

## 0. Outcome

1. **On the Step 1C pages, the identity barrier was the dominant cause of failure, and the inventory removes most of it.**
   - Arm A (Step 1C candidate): 7 correct, 1 wrong, 13 false identity, 55 unresolved (of 76 values read).
   - Arm B (same candidate + inventory): 72 correct, 0 wrong, 0 false identity, 4 unresolved.
   - Gold products found by the document inventory: 17 of 18 (the Step 1C mention detector found 6).
2. **On the Phase272 pages the gain is small.** Untouched set (spent): 60 correct both arms; wrong 7 → 6; unresolved 3 → 4.
   Development pages: 23 → 24 correct; the one false identity is gone.
3. **No regression, no new wrong value, no improper merge** on any of the three sets (21 documents, 293 gold values).
   Step 1A/1B replays: 0 lost successes. Metamorphic relations: unchanged against Step 1C (5 hold, 1 violated).
4. **What remains:** 9 distinct identity problems covering 14 values. Most need a page statement or structured product
   name that the document does not give (variants, code-less names), not more text heuristics.
5. **The dominant barrier is now value reading, not identity:** on the Phase272 untouched set 93 of 163 gold values are
   never read by either arm; identity errors affect 10.
6. **Recommendation:** Step 1D-B should be a pre-registered, untouched test of the frozen inventory on new pages (§12),
   which needs an HTTP authorisation this brief does not give.

## 1. Pipeline failure analysis (before the inventory)

Tracing the Step 1C failures through the shared pipeline (mention detection → identity → attribution → scorer):

| Stage | Observed failure on the Step 1C pages | Effect |
|---|---|---|
| Mention detection | Products named by a bare code, by a brand-dropped series name, or by a series with a number and roman numeral were not detected | The candidate had no subject to bind; R4 unresolved |
| Identity | A detected short form was compared to nothing: no document-level list of the products the page names | The page headline was the only "identity"; Step 1C correctly refused it |
| Section scope | The nearest heading was used, so sub-headings ("What we like") hid the product of the enclosing section | Section values unresolved |
| Typing | Standards (filter classes), instruments and the publisher looked like products | Risk of false identities |
| Attribution grammar | Mostly correct once a subject existed | Few failures (§5) |
| Scorer | Correctly rejected unproven aliases (false identity class) | 13 false identities in arm A |

So the first broken link was the absence of a document-level product inventory, not grammar.

## 2. Modules reused and why

| Module | Use | Why |
|---|---|---|
| `experience_attribution_candidate.ts` (Step 1C) | Kept as the attribution engine; two additive hooks: `Mention1C.key` (an identity key distinct from the surface code) and `Context1C.section` (section subject supplied by the caller) | The candidate's precedence and refusal rules were the safety gain of Step 1C; reusing it isolates the inventory's effect. Equivalence check: 0 of 102 item differences against the Step 1C first run when the hooks are unused |
| `experience_attribution_scoring.ts` (Step 1C scorer) | Unchanged, frozen; `identity1C` and `sameProduct1C` also used to match inventory entities to gold | Same scorer for both arms |
| `scripts/experience-observe.mjs` | New policy `candidate_1c_inventory` beside `constrained_candidate_1c`; `documentInventory()` | Same readers, plans and document loading for both arms |
| `scripts/experience-metamorphic.mjs`, replay scripts | Accept the new policy | Same relations and cases as Step 1C |
| Category registry aliases | Category nouns ("purifier", "TV") as typing evidence | Generic, already maintained; not a product list |
| Phase153 entity audit | Examined, **not reused** | It found 15 of 17 gold products but proposed 28–118 entities per page and always abstained on links |

## 3. Representation

New evaluation-only module `src/experience_entity_inventory.ts` (168 lines). `buildInventory1D({blocks, tags, title,
categoryNouns, publisherHost})` returns:

- **Entities** (`Entity1D`): `canonical` (the fullest name the document states), `brand`, model tokens, `type`
  (`product`, `standard`, `instrument`, `other`) with a `typeReason`, the supporting locations, and `unresolved` reasons.
- **Mentions** (`Mention1D`): every surface occurrence with a `state`:
  - `exact` — the full name;
  - `contextual_alias` — a short form linked to one entity, with `support` (the location of the full name it relies on);
  - `ambiguous` — several candidates (listed), never resolved by guess.
- **`section(blockIndex)`**: the product of the enclosing section by heading hierarchy, plus competing products.

Rules (all generic, no product names):
- **Region:** the article starts at the first `h1`; navigation and related links before it are not read.
- **Model-like token:** letters and digits mixed, or a number, roman numeral or code after a capitalised word; dimension,
  quantity and unit tokens are excluded.
- **Typing:** a token is a standard when an acronym of a standard comes first (or second after a non-model word); an
  instrument when an instrument noun follows; product evidence = a heading (multi-word or with a digit), a category noun
  after it, or recurrence. The publisher (from its host) is never a product.
- **Linking:** a short form links only when it is a word-suffix of exactly one full name in the same document; a bare
  brand links only when one product carries it; a word-prefix family name is ambiguous unless one form dominates 3 to 1;
  an h1-only form links to a body form with the same model tokens.
- **Never:** merging two different codes, linking by numerical overlap or lexical similarity, or turning a family name
  into an exact variant.

## 4. Resolved cases (development traces)

Traces EX-25 … EX-36 (private values in `pee-knowledge/private-eval/experience/step1d-traces.json`; value-free index in
`evaluation/experience/step1d-traces-index.json`):

| Case | Before → after | Lesson |
|---|---|---|
| EX-25 | wrong → correct | A bare model code links to the one full name the document states, even once |
| EX-26 | unresolved → correct | A brand-less code that recurs is a mention of the full name stated once |
| EX-27 | unresolved → correct | A series name ending in a number and a roman numeral is model-like |
| EX-28 | false identity → correct | A brand-dropped name links to the full name; the canonical name carries the brand |
| EX-29 | unresolved → correct | Values under sub-headings belong to the product of the enclosing section heading |
| EX-30 | unresolved → correct | A comparative sub-heading naming another product does not take over the section |
| EX-34 | correct → correct | An abbreviated code with no stated link to the full name stays a separate entity |

## 5. Incorrect or uncertain cases

| Case | Family | State | What would resolve it |
|---|---|---|---|
| EX-31 | variant or family | wrong → unresolved | A page statement linking the series name and the full regional code |
| EX-32 | variant or family | wrong (unchanged) | A page statement that a code suffix denotes the same model |
| EX-33 | mention not detected | wrong (unchanged) | A rule for code-less names introduced as products ("we tested the X") |
| EX-35 | grammar after identity | unresolved | A grammar rule for absolute "with X …-ing" constructions |
| EX-36 | mention not detected | unresolved | A structured product name or a model-like token (one-letter series code) |

Development page (AirDoctor): one lead is wrong because the abbreviation and the full name stay split (EX-34). This is the
intended safe outcome; the gold item itself is still correct.

## 6. Before/after counts (A = Step 1C candidate, B = with inventory)

| Set (gold) | A correct / wrong / false id. / unresolved | B correct / wrong / false id. / unresolved | Not read (both) |
|---|---|---|---|
| Step 1C pages (102) | 7 / 1 / 13 / 55 | 72 / 0 / 0 / 4 | 26 |
| Phase272 untouched, spent (163) | 60 / 7 / 0 / 3 | 60 / 6 / 0 / 4 | 93 |
| Phase272 development (28) | 23 / 0 / 1 / 0 | 24 / 0 / 0 / 0 | 4 |

Entity view (gold products found / with alias links / with a remaining problem):
- Step 1C pages: 17 of 18 (Step 1C detector: 6) / 15 / 4.
- Phase272 untouched: 28 of 37 (16) / 16 / 5.
- Phase272 development: 4 of 5 (3) / 3 / 0.

Non-products typed and kept out of attribution on the traced pages: 9 standards, 3 instruments, 3 other.

## 7. Performance by distinct identity problem

One identity error repeated over many values counts once. Arm B leaves 9 distinct problems affecting 14 values:

| Problem | Distinct | Values |
|---|---|---|
| Grammar after a correct identity | 3 | 3 |
| Variant or family not established by the page | 2 | 5 |
| Code-less or one-letter product name not detected | 2 | 4 |
| Predecessor model referenced as the subject | 1 | 1 |
| Page contradicting itself on the product | 1 | 1 |

By the evaluator's cause codes: 7 problems "identity present, not used" (10 values), 2 "not detected" (4 values). No
problem is an identity split or merge, and no value is lost because the scorer rejects a valid alias.

## 8. Regressions

- Items correct in A and not correct in B: **0** on all sets.
- Items wrong in B and not wrong in A: **0**.
- Improper merges (one entity matching two gold products): **0**.
- Step 1A replay (18 cases): 9 preserved, 3 corrected, 6 persistent, **0 lost**. Step 1B replay (6): 1 preserved,
  4 corrected, 1 persistent, **0 lost**.
- Metamorphic (T1): 5 hold, 1 violated — the same violation as Step 1C (product columns swapped in a comparison table:
  the value goes missing, not wrong). The inventory neither fixes nor worsens it.
- Unit tests: 7 new (fictional brands and codes), 26 of 26 experience tests pass.

## 9. Lessons and counterexamples

Kept as development lessons, not promoted:
1. **A document names its products once in full; short forms rely on that.** Link only to one full name stated in the
   same document (EX-25, EX-26, EX-28). Counterexample: an abbreviation with no stated link stays separate (EX-34).
2. **Heading hierarchy, not nearest heading, scopes a section** (EX-29). Counterexample: a comparative sub-heading does
   not take over (EX-30).
3. **Families and variants need a statement, not similarity** (EX-31, EX-32). Unresolved is better than a guessed merge.
4. **Typing protects identity:** standards, instruments and the publisher must be typed before linking, or they become
   false subjects.
5. **Defects found and fixed generically during development** (each confirmed on another page before keeping): dimension
   tokens typed as products; a size prefix making a code ambiguous; split brand spans; names truncated in headings; a
   lone first word not linked; standards missed when not first; a gallery name typed as a product; an h1 form taking the
   page identity; overlapping duplicate spans; a filter class with a space not detected; a product with a filter class in
   its name typed as a standard.

## 10. Costs

- HTTP: 0 requests. Paid services: none. New dependencies: none.
- Code: 168 lines (module), 156 lines (evaluation and trace scripts), 60 lines (tests), 53 changed lines in existing
  evaluation files.
- Run time: about 4.4 ms per document for the inventory.

## 11. Provenance and legal boundaries

- Pages: only copies already held under the existing private policies; no new acquisition; no page bytes committed.
- Values and product-level traces: private only (`pee-knowledge/private-eval/experience/step1d-dev2.json`,
  `step1d-traces.json`, inventory replays). Public files are value-free (`evaluation/experience/step1d-dev2.json`,
  `step1d-traces-index.json`, `replay-s1{a,b}-inventory-1d.json`, `metamorphic-inventory-1d.json`).
- No manufacturer catalog or external entity source was consulted. No manufacturer declaration is treated as a test.
- The Step 1C first run stays reproducible from 93efede; its frozen files are unchanged in effect (equivalence 0 of 102).

## 12. Failures needing science or external evidence

- **Variants and families** (EX-31, EX-32): need a page statement (apposition, specification table) or structured
  metadata (schema.org Product name, product box). Without it the safe answer is unresolved. Market and colour suffixes
  need product-identity science, not text rules.
- **Code-less names** (EX-33, EX-36): need structured product data or a reviewed rule for introduction phrases; both
  must be tested on new pages before use.
- **Predecessor references and self-contradicting pages:** need a reader for "successor to / replaces" and an explicit
  conflict state; no text rule here.

## 13. Step 1D-B recommendation

1. Freeze the inventory, the candidate and the scorer at this commit; pre-register the decision rule.
2. Annotate gold blind on **new** pages (roundups, comparisons, single reviews; several categories), then one first run
   committed unchanged. This needs an HTTP authorisation from the owner (not given in Step 1D-A).
3. Measure by distinct identity problem, false identities and merges first, then correct values.
4. Only after that: rules for variant statements and structured product names.

## 14. Which barrier dominates

- **Before the inventory, on the Step 1C pages:** identity (product detection and linking) — 69 of 76 read values were
  not correctly bound; with the inventory 72 are.
- **Now:** value reading. On the Phase272 untouched set 93 of 163 gold values are never read; identity problems affect
  10 values. On the Step 1C pages 26 of 102 are never read; identity affects 4.
- Of the remaining identity problems, the largest share needs evidence the documents do not state (variants, code-less
  names), not better heuristics.
