# Structured qualitative evidence (QE), 2026-10-18

Extends `docs/plans/whole-document-reading.md` (qualitative observations). Supersedes nothing.

## Brief

**Owner brief (2026-10-18, Italian).** A targeted engineering study of expert qualitative evidence and its link to the
existing metrics. The structure must distinguish:
- a phenomenon from an opinion;
- a practical test from a commercial claim;
- a use-dependent judgement from a product property;
- a documented cause from a supposition.

Qualitative and quantitative evidence are linked only where a scientific relation exists, without arbitrary scores. The
same knowledge is reused for needs, research and evaluation. The owner also asked:
- not to tune further on the 7 KV pages;
- for a broader, independent check of the changed verdicts before using them;
- for progress measured by evidence correctly understood and attributed, not by rules added.

## 1. What exists already (audit, read-only)

**Five separate qualitative representations, with incompatible vocabularies:**
- Phase269/270 cooking codes;
- the Phase272 `taught_dimension`;
- the WD aspects;
- Phase96 findings;
- Phase109 atoms.

**Gaps:**
- Polarity, hedge and test-cue lexicons are duplicated in 4–5 places.
- Only five cooking codes reach the store. Noise codes, guided observations and leads are produced but withheld.
- No code links an observation to a condition or to a measurement. The pack's `aspect.kinds` was defined and never
  used.
- The taught outcomes (`measured_by`) and the research inventories' qualitative evidence types and failure modes exist
  but are not compiled into reading. Robot cleaners, soundbars and speakers are not taught.
- Advice never consumes qualitative evidence.

**Kept as the base:**
- WD's aspect vocabulary, which is the only one held as data in the knowledge pack;
- PROV-O's model of entity, activity and agent;
- the ACOS and COQE task definitions as references for the fields:
  - aspect, category, opinion and sentiment, including implicit ones (Cai et al., ACL 2021);
  - comparative subject, object, aspect and preference (EMNLP 2021).

Metarule learning (Meta-Interpretive Learning; Muggleton, Cropper) is a reference for the facet hypothesis (§3). It is
not implemented as an engine.

## 2. Independent check of the changed verdicts (before any use)

- **Method.** The 310 verdicts changed by recording operating conditions were each judged by two fresh-context
  annotators. They saw only the table text, never a verdict, and their outputs were hashed before comparison.
- **Agreement.** 310 of 310.
- **Previous build.** 0 of 310 correct: 172 pairs had been called comparable although measured at different fan speeds
  or rating points.
- **New verdicts.** 233 confirmed, 77 cautious, 0 false comparability.
- **Two knowledge errors found by the check:**
  - "standby" was missing;
  - "speed 1", "sleep" and "lowest" were one value. That speed 1 is the lowest speed is an inference, not the page's
    statement.
- **After correcting both:** 298 of 304 are confirmed. This figure is tuned on the check.
- **Result file:** `evaluation/verdict-check/result.json`.
- **Limits:**
  - the annotators share the developer's model family;
  - only the changed verdicts were checked;
  - the fix changed 16 further verdicts that are not yet checked.

## 3. The model (`QualitativeEvidence`, `src/document_evidence.ts`; needs: `src/qualitative_needs.ts`)

One item per statement and property:

| Field | Meaning |
|---|---|
| `property` | `aspect` (property family); `phenomenon` (an observable descriptor: a whine, residue left, uneven browning); `facets` (what the observation shows across categories); `kinds` (the quantity kinds that measure the property) |
| `statementType` | observation (what was perceived), judgement (an evaluation), or both. A word that names a phenomenon is not a judgement |
| `evidenceType` | observed in a test, experience in use, opinion, reported by others, manufacturer claim, inference |
| `conditions` | by kind: setting, test material, test procedure, environment |
| `useContext` | the use situation a judgement depends on (bedroom at night, small kitchen, gaming...) |
| `cause` | stated cause: `documented` when the statement rests on a test or a number, `supposed` when hedged or unsupported |
| `comparison` | the other product and which is better |
| `relatedMeasurement` | the number on the same property in the same or the next statement; its kind (or every kind it can still be) must measure the property |
| `provenance` | PROV-style: the document (entity); the named test (activity); the author (agent), not attributed for claims or reports of others |

**Rules of reading:**
- Product and model names are masked before reading: "Twinfry Compact" says nothing about size.
- A phenomenon with no aspect of its own qualifies the sentence's aspect only when there is one aspect; otherwise it is
  kept as "other", with its facet.
- Nothing is a ranking input. Relevance to a need is a list of stated reasons, never a numeric score. Test observations
  are listed before opinions, and opinions before claims.

**Facets: the cross-category hypothesis (second-order principle, reified as data).** Facets are:
- spatial uniformity;
- consistency across runs;
- tonal character;
- transient events;
- residue;
- failure events.

A need is read for the facets it asks for ("cooks evenly" → spatial uniformity). An observation showing that facet is
relevant in any category: tests show uneven air-fryer browning and missed spots of a robot cleaner both answering the
same need, while "even though" does not. Each facet has `status: hypothesis` and needs evidence beyond these tests.

## 4. Measurement (8 development pages, qualitative content not inspected by the developer, 537 reference items)

| | Current reader wd.1 | qe.1 first run | qe.1 tuned (evidence scope only) |
|---|---|---|---|
| Statements reached | 89 (17%) | **151 (28%)** | 151 |
| Property family correct | 38 | 71 | 71 |
| Product correct / wrong | 85 / 4 | 134 / 17 | 134 / 17 |
| Polarity correct / wrong | 62 / 27 | 92 / 59 | 92 / 59 |
| Observation vs judgement correct | 0 (not represented) | 53 of 151 | 53 |
| Evidence type correct / wrong | 47 / 42 | 56 / 95 | 68 / 83 |
| Hedged correct | 77 | 130 | 130 |
| Conditions attributed | 0 of 43 | 19 of 58 | 19 |
| Use context present | 0 of 10 | 4 of 18 (10 extra) | same |
| Comparison correct | 0 of 15 | 4 of 27 | same |
| Related measurement correct | 0 of 11 | 3 of 11 (4 wrong) | same |
| Reader items not in the reference | 41 | 125 | 125 |

**What the first run teaches:**
1. **The evidence-type rule overreached.** The WD rule "a testing document covers its judgements" was tuned on one
   publisher whose every sentence reports a test. On these pages it read 46 opinions and 25 use experiences as test
   observations.
   - Refined principle: testing covers what the tests made observable, not every opinion. This is the same scope
     principle as the kind protocols (C1–C5).
   - Effect: 56 → 68 correct (TUNED).
2. **Reach is limited by vocabulary.** Most unreached items are about ease of use (60), cooking results (49),
   capacity (46), "other" (40) and cleaning results (30). The reader recognises a property only by listed words.
3. **Observation and judgement are told apart badly.** 98 of 151 are wrong; the annotators mark "observation and
   judgement" where the reader sees only one of the two (64 cases: 37 read as judgement only, 27 as observation only).
4. **Precision fell as reach rose.** There are 59 wrong polarities, mostly negation and contrast, and 125 items not
   in the reference.

## 5. Shown, not shown, next

**Shown:**
- Qualitative statements are represented with the distinctions the owner asked for, linked to conditions, use contexts,
  causes, comparisons and same-property measurements.
- On pages not seen by the developer, reach rises from 17% to 28%, correct products from 85 to 134, and observation
  versus judgement goes from not represented to 53 correct.
- A rule tuned on one publisher was found to overreach, and corrected as a scope principle.
- The changed comparability verdicts were checked independently before use.

**Not shown:**
- Accuracy good enough for decisions: polarity is correct for 61% of reached items, statement type for 35%.
- The facet hypothesis beyond synthetic tests.
- Any use in advice: shadow only. Nothing reaches the store.

**Not done this phase:**
- product cards in roundups;
- units in sibling data leaves;
- unitless scores with scales (owner priorities 1 and 2).

**Next, by measured cost:**
1. Read properties from the taught outcomes and the research inventories, not only the pack's word lists. Reach is
   the first loss, and the outcomes already carry `measured_by` links to measurements.
2. Polarity scope: contrast ("but", "while"), negation beyond three words, comparatives.
3. Product cards in roundups, and units in sibling data leaves.
4. Scores with scales: a rating-score kind with its scale, direction and publisher.
5. A new authentic set; acquisition needs the owner's authorisation.
