# S99 — End-to-end semantic integrity of scientific observations

Owner review of S98, 2026-10-20 (verbatim in
`.claude/skills/pee-guided-learning/references/owner-review-s98-semantic-integrity-2026-10-20.md`). Roadmap step: R3.
Kind: integration and inference. Maturity: **gated** (the path stays disabled for decisions and ranking).

The principle the owner set: *every scientific observation keeps its identity and its meaning from the source to the
store*: statement role, product and variant, nature, property, conditions, method and provenance.

## Outcome

1. **Integrity is now verifiable, and it holds.** Store v12 keeps each reading's observation key, source locator and
   offset, statement role, bound, subject with its basis, provenance, result basis and object.
   - `scripts/s99-integrity.mjs` compares every reading, field by field, with its stored and retrieved row.
   - On 6 never-examined pages: 116 readings produced, 116 stored, 0 fields changed, 0 products linked without a stated
     subject.
   - On 115 spent pages: 0 fields changed after the identity fix described in item 3.
   - The S98 store could not be checked this way: it kept no observation identity.
2. **The duplicate test the owner suspected was losing observations.** On the spent pages, "value + unit" counted 358
   observations as already captured; only 75 were the same occurrence and 224 were distinct observations elsewhere.
   Duplicates are now recognised by occurrence: the same element as a Phase245 row, or the same block text as a Phase265
   lead.
3. **A second identity defect, found by the integrity check.** Observation keys collided inside one paragraph, because
   segments of one element each start at offset 0. Different observations (run duration, sound level, capacity) were
   collapsed into one stored row. The key now includes the segment.
4. **Independent check (sealed reference, first run unchanged): all preregistered stop rules hold, but correctness is
   not better than S98's on new pages.** Under the preregistered outcome, the S99 reader replaces S98's as the gated
   reading. Five residual causes are documented (§4). None was tuned on the check pages.

## 1. What changed (one principle, not four patches)

| Element of meaning | Before (S98) | S99 |
|---|---|---|
| Statement role | not represented; every value was a candidate product value | result, specification, threshold, norm, target, condition, judgement or unresolved, decided before attribution. Bounds come from the quantity knowledge's bound words, now shared with request requirements (`quantityBound`); norm, target and threshold cues are data (pd.7 `statementRoles`) |
| Evidence role and nature | the document class of the sentence | the value's own clause: S91 positive role evidence, S92 situation type and S93 nature and provenance, reconnected (they existed but were not called with the value's position). A page-level test default is not local evidence |
| Product | linked when a name matched, including by default | linked only from a stated subject (clause, section heading, anaphor, row, the page's own title statement). S86c's withholding signal is no longer read as "another product". No product for thresholds, norms, targets or conditions |
| Identity | value + unit | the source occurrence, with the segment in the key |
| Comparability | nature and stated conditions | also role, bound, kind, basis, object, definition version and method. Different sources compare only under a stated common method; one source under one method compares within that source (S54) |
| Store | v11 | v12: the fields above; the product link follows the reading's subject |

## 2. Development on spent material (post hoc; never independent)

`evaluation/s99/integrity-dev-*.json`: 115 pages from the S89–S98 waves, S98 baseline (`3e953ef`) against S99, both run
by the same script. Iterations it1–it3 were the three permitted reformulations; it3 was frozen as `2032a3a`.

| Measure | S98 | S99 (it3) |
|---|---|---|
| Fields changed between reading and store | not measurable | 0 |
| Products linked without a stated subject | not measurable | 0 |
| Correct property / wrong property | 399 / 33 | 400 / 35 |
| False product values (reference: not a property value; stored as a result or specification linked to a product) | 28 | 22 |
| Other products' values linked to the reviewed product | 12 | 4 |
| Statement role: precision among decided readings (abstentions) | 50% (43) | 86% (87) |
| Nature: precision among decided readings (abstentions) | 29% (2) | 62% (63) |
| Advice: decisions changed of 206 | — | 0 |

S99 abstains more and asserts less, which is what the owner asked for. The development references are spent and partly
older (role and nature are annotated on different subsets), so these figures are diagnosis, not validation.

## 3. Independent check

**Material.** 6 pages never examined by PEE, from 3 publishers never used, fetched under the standing policy (9
requests; no robots refusal, no reservation):
- BreatheSafeAir: 3 air purifier reviews;
- Best Cordless Vacuum Guide: 2 stick vacuum reviews;
- Oransi: 1 maker's CADR explainer.

111 values, at most 20 per page.

**Reference** (owner: "definizioni scientifiche condivise prima dell'annotazione, esempi difficili e una verifica
indipendente dei disaccordi"):
- a shared guide written before annotation (definitions of role, bound, subject, nature and provenance, and 11 hard
  examples paraphrased from spent pages);
- `no_fitting_label` kept distinct from `none`;
- two independent blind Claude annotators;
- a third blind agent adjudicating every disagreement and checking every `no_fitting_label`.

Agreement before adjudication:

| Field | Agreement |
|---|---|
| Property | 111 / 111 |
| Role | 109 / 111 |
| Bound | 108 / 111 |
| Subject | 108 / 111 |
| Nature | 108 / 111 |
| Provenance | 106 / 111 |
| Condition axes | 85 / 111 |

The adjudicator chose A 8 times, B 31 times and neither 0 times, and confirmed all 28 `no_fitting_label` calls. The
reference was sealed (`evaluation/s99/check-annotation-freeze.json`) and committed before the run.

**First run** (`evaluation/s99/integrity-check-firstrun-{s98,s99}.json`, unchanged):

| Capability | S98 | S99 |
|---|---|---|
| Preservation (fields changed / links without a stated subject) | not measurable | 0 / 0 (116 of 116 stored and retrieved) |
| Quantitative attribution: correct / wrong / not stored (53 with a property) | 13 / 3 / 37 | 11 / 4 / 38 |
| Label gaps (28 values with no fitting label) stored with a listed property | 4 | 4 |
| False product values | 2 | 2 |
| Reviewed-product values correctly stored and linked (40) | 11 | 8 |
| Other-product values / no-product values linked to the reviewed product | 0 / 2 | 0 / 2 |
| Statement role: precision among decided (abstentions) | 11 of 18 (3) | 11 of 18 (2) |
| Nature: precision among decided (abstentions) | 11 of 17 (3) | 11 of 16 (3) |
| Bound agreement | 19 of 21 | 17 of 20 |
| Comparability (cross-product pairs): comparable / not established / not comparable | 1 / 157 / 94 | 1 / 102 / 54, each with its reason (unresolved role 13, bound 10, missing conditions, nature) |
| Qualitative judgements | 0 | 0 (none on these pages) |
| Advice: decisions / shortlists changed of 206 | 0 / 0 | 0 / 0 |

**Stop rules** (`evaluation/s99/check-preregistration.json`):
- S1 integrity: holds;
- S2 no new false attribution: holds (2 = 2; 0 = 0; 2 = 2);
- S3 role and nature precision not lower: holds (equal for role, 11 of 16 against 11 of 17 for nature);
- S4 advice: holds.

As preregistered, the S99 reader becomes the gated reading. The path stays disabled for decisions and ranking.

## 4. Residual causes the independent check revealed (not tuned on these pages)

1. **The extractor type decides the role.** Phase245 rows are stored as maker specifications by construction. A
   publisher's own test-results table ("Mid: 76.2 dB", "Low: 74.6 dB") becomes a specification in both builds: the
   page structure is taken as evidence of who stated the value. This is the largest remaining identity defect: the role
   of a table row must come from the table's own evidence (its heading, its method), as for prose.
2. **Sentence-level class applied to a single value.** "It exceeded Dyson's 40-minute claim, running for over 48
   minutes" holds a claim and a result in one sentence. The document class is per sentence, so the result becomes a
   bounded specification.
3. **Times written mm:ss** ("Auto: 29:30") are split by the quantity finder into "30"; the value is lost before any
   interpretation.
4. **Threshold vocabulary.** "breaches the 80-decibel mark" is not recognised as a threshold, so it is stored as the
   product's value.
5. **Two correct attributions lost.** "just under 27 minutes" (test room cleared from 500 to 5 µg/m³) and "143 CFM" lost
   their property when S99 gave the interpreter the value's position: the S89 rule that a label term supports a value only
   with no other number between them now applies, and here it is too strict.

Coverage was not a goal (owner: "Non dobbiamo cercare di eliminare indiscriminatamente le … mancate attribuzioni"). It
fell slightly (correct 13 → 11; linked reviewed-product values 11 → 8), and items 1, 2 and 5 explain it.

## 5. Findings for the vocabulary (not errors of reading)

28 of 111 values are real property values with no label:
- dimensions and weight;
- charging time;
- filter life;
- free airflow of vacuums;
- on-board sensor readings;
- hair wrap;
- UV-C kill rate;
- air changes per hour as a quantity.

They are now measured separately from false attributions. 4 of them are stored with a listed property in both builds,
which is wrong.

## 6. Limits

- One check of 6 pages, 3 publishers and 2 categories plus one explainer.
- The annotators and the adjudicator are Claude agents, not human experts.
- Development figures are on spent material.
- No per-component ablation beyond S98 against S99 and the dev iterations.
- No ranking, no recommendation, no promotion of definitions. R3 stays open.

## Files

- Code:
  - `src/scientific_reading98.ts` (sr99.1), `src/scientific_evidence98.ts`;
  - `src/phase246_knowledge_store.ts` (v12);
  - `src/quantity_knowledge.ts` (`quantityBound`), `src/property_definitions.ts`;
  - `resources/property-definitions/property-definitions.v1.json` (pd.7).
- Tests:
  - `tests/s99_observation_identity.test.ts` (occurrence identity, roles, field preservation into the store, stated-subject
    product links, comparability, segment keys);
  - `tests/phase260_source_memory_store.test.ts` (v12).
- Scripts: `scripts/s99-integrity.mjs`, `scripts/s99-check.mjs`.
- Evaluation: `evaluation/s99/` (dev iterations, preregistration, seal, first runs).
- Private copies: pee-knowledge `private-eval/s99/` (text hashed; no page bytes, no store copies).
