# R2 — typed link to the teaching and graded evidential force (2026-10-19)

**Roadmap step:** R2 (owner authorisation S68). **Kind:** inference (rules over typed facts) plus a translation of the
teaching with the quantity knowledge's existing vocabulary; no new recogniser, no new vocabulary.
**Shadow only:** nothing reaches the store, the ranking or the advice. No existing module changed.

## 1. What was built

`src/knowledge_link.ts` and the rules `resources/quantity-knowledge/link-rules.v1.json` (lk.1).
1. **Translation with provenance.** Each taught measurement in the store is read with the quantity knowledge's own
   metric terms, kind terms, unit forms and condition values. The result is a typed descriptor:
   - the measurands it measures, named in the concept's name or only mentioned in its statement;
   - the condition values its name fixes ("at sleep mode");
   - the axes it needs ("by signal mode", or named by its requires_condition relations).
   Words the knowledge cannot type are listed as **untyped** (e.g. "SDR", "aged filter"): what the teaching says and PEE
   cannot yet read.
2. **Program `link` (KR, with derivations).**
   - A value links by what both are (metric, then kind, then a mention), never by shared words.
   - A candidate that would assume an unstated condition is not preferred.
   - Competing candidates with the same consequences are immaterial (the value is linked to each). Otherwise the value
     stays ambiguous, with the axes that would decide it.
   - A value no taught measurement measures is reported as **outside the teaching**.
3. **Program `evidence`: graded force (owner S68).** Each link carries one of these forces:
   - direct;
   - partial contribution;
   - indirect indicator;
   - force not verified;
   - relevant, but its conditions are not shown.

   For each product and outcome, the program then states whether the outcome is assessed:
   - by direct evidence;
   - by every contributing measurement the teaching lists (at least two);
   - only partly.

   Forces come from the R1 source verification. It is a reversible private overlay
   (`pee-knowledge/knowledge-overlays/r2-relation-force.v1.json`); the store is unchanged. Nothing here authorises a
   ranking; that also needs the user's need, the conditions of comparison and independent sources (D26).
4. **Tests** (`tests/knowledge_link.test.ts`, 8): translation, every link status, the force grades and outcome
   assessments, and shape checks over the rules. The R2 metamorphic exit tests also pass:
   - renaming the product keeps every inference;
   - removing the only support withdraws the conclusion;
   - changing the mode changes the link.

## 2. Development set (Phase272, spent; details inspected: development evidence only)

Arms A and C1 reproduce R1 exactly. The 79 values C2 left ambiguous split into:
- 40 justified abstentions: 30 where no measurement applies, 10 where the reference itself is ambiguous;
- 39 missed uses of held knowledge.

C2 also found no candidate for another 24 values.

| Arm (163 values) | Correct links | Wrong (measurement / where none / on an ambiguous reference) | Correct and usable for decisions |
|---|---|---|---|
| A older reader + lexical link | 27 | 12 / 13 / 15 | 17 |
| C1 newer reader + lexical link | 33 | 11 / 23 / 17 | 27 |
| C2 R1 typed seam | 13 | 8 / 2 / 11 | 12 |
| **C3 lk.1** | **56** | **0 / 2 / 0** | **52** |

Two R1 seam links were lost; both depended on the word "HDR", which the knowledge does not type. The ablations show
that metrics decide 24 links (gamut coverage); fixed conditions decide almost none here.

## 3. Link-unused set s1cd: first run, unchanged

**Set:** the Step 1C and 1D-B pages of taught categories, 191 values.
- The value references were sealed earlier.
- The link reference was annotated blind by 2 fresh agents after the build was frozen (`evaluation/r2/freeze-s1cd.json`).
- The link mechanism was never developed on these pages. They did serve earlier reader development, so they are **not
  untouched documents**.
- 164 of the 191 values are air purifiers.

| Arm (191 values) | Found | Product correct | Correct links | Wrong (measurement / where none) | Correct and usable |
|---|---|---|---|---|---|
| A | 112 | 16 | 59 | 21 / 11 | 8 |
| C1 | 166 | 79 | **74** | 30 / 16 | 16 |
| C2 | 166 | 79 | 7 | 7 / 11 | 0 |
| **C3** | 166 | 79 | 56 | **0 / 11** | **24** |

**What the first run shows:**
- **Wrong links:** 46 with the lexical link, 11 with C3. All 11 have one cause: the "reduction" kind word (a ratio)
  makes a gas-reduction measurement a candidate for percentage values that are not gas reductions.
- **Correct links:** C3 recovers far more than the R1 seam (56 vs 7) but fewer than the lexical link (74). 77 values
  stay ambiguous:
  - **50 power values** compete between "power per mode" and the "CADR/noise/power curve". A power value is a measurand
    of both. The link treats candidates as exclusive, and that assumption is the cause. It is a finding, not changed on
    this set.
  - **16 TV luminance values:** SDR vs HDR is untyped in the knowledge.
  - **11 CADR values:** "aged filter" is untyped.
- **Correct and usable for decisions:** 24 vs 16. The bound here is product attribution: 82 of the 166 values have no
  product on these roundup pages.
- **Force:** all 24 are "relevant, conditions not shown". The fan setting or the pollutant is not stated with the value.
  None yet assesses an outcome on this set.

## 4. R2 exit and status

| | Status |
|---|---|
| Metamorphic tests | pass (8 tests; full suite 4,719) |
| No unexplained regression | no existing module changed; A and C1 reproduce R1 exactly |
| Fewer wrong inferences | shown on unused data (46 → 11) |
| Correct conclusions recovered | better than the R1 seam, **not yet** as many as the lexical link |
| Graded force | implemented (L2 in tests, L3 on the spent set); on s1cd no value reaches an assessable force |

**Maturity:**
- the typed link is at **L4 candidate** (a first run on data not used to build it, not untouched documents);
- the force grading is at L3;
- kind: inference over translated knowledge; learning: none.

**What the software now says about its own knowledge:**
- which values the teaching does not cover;
- which taught words it cannot type;
- which missing conditions keep a link from assessing.

**Next, by measured cost (proposals):**
1. Allow a value to be the measurand of several measurements at once, instead of exclusive candidates (the 50).
2. Restrict generic kind words in teaching names, such as "reduction", to measurands the name actually measures (the 11
   errors).
3. Read conditions stated in table columns or section headings (the "conditions not shown").
4. Type the untyped decisive words (SDR/HDR, aged filter). This is knowledge translation, and belongs to R3.

Each change needs a new first run on data not used to build it.
