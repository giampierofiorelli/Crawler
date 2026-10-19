# R3 — scientific knowledge acquired from documents and consulted in reading (2026-10-19)

Owner brief S73 (`.claude/skills/pee-guided-learning/references/owner-r3-brief-2026-10-19.md`). Shadow-only: no
ranking unlocked, no external page acquired, no new attachment, no original scientific source retrieved, no paid
dependency, no separate knowledge architecture. Everything below runs on the owner packages already held in the private
repository and on value sets already spent in R2.

The four kinds of result the owner asked to keep apart:

| Kind | Where | What it is |
|---|---|---|
| Claude's manual analysis | §1, §2 | blind inventories and store comparison by fresh-context agents (same model family) |
| PEE implementation | §3 | code in `src/knowledge_translation.ts`, `src/knowledge_link.ts` (lk.6), QK `labelled` axes |
| Operational change | §5 | before/after and ablation on the R2 link experiment (spent sets: diagnostic) |
| Independent evidence | §7 | none: no independent human validation exists; the judges are the developer's model family |

## 1. Owner documents used (inventory: `evaluation/r3/source-inventory.json`)

127 files, 9 archives inventoried by name, path and version. Selected (owner preference): air purifiers v1.2.0
consolidated; coffee cumulative package; air fryers compendium v2.2.0 (recovered) with addenda. Held out for transfer:
televisions v1.0.0 and household dishwashers v2.0.0 (never used to build the mechanism). No missing document was
recreated. Source references in the documents are preserved as references (`refs`); none was retrieved.

Sections of each selected document were split before any translator existed (`scripts/r3-section-split.mjs`, sealed):
development 34 sections, held-out 34 sections, about 45 KB per side.

## 2. Source-first inventory and comparison with the store (Claude's manual analysis)

Six fresh-context agents inventoried the sections blind (one per category and side; sealed in
`evaluation/r3/inventory-freeze.json`): 1,680 knowledge units (mechanisms, relations, causal and conditional claims,
methods, compound procedures, quantitative evidence, expert judgements, limitations, conflicts, applicability,
consumer outcomes), each with quote, lines, status and references.

The units were compared with the store (census `evaluation/r3/store-comparison-census.json`):

| | correct | partial | distorted | missing |
|---|---|---|---|---|
| all six sides (1,680 units) | 132 (8%) | 340 (20%) | 0 | 1,208 (72%) |

- Representable by the store's current structures: yes 306, partly 1,185, no 189.
- Main representational gaps: scope or applicability 312, method detail 200, status or certainty 180, compound
  procedure 143, definition 125, expert judgement 101, causal direction 100, condition value 63, quantitative threshold
  47, conflict 22.
- **Represented but unused:** 169 units are held (correctly or partly) only by store entries that no decision path
  consults (the link program and goal relevance read measurement concepts and the `measured_by`,
  `not_sufficient_for`, `requires_condition` relations; product subtypes, `enables`, `may_support`, `may_risk` are not
  read).

## 3. What PEE now does (implementation)

**3a. Translation** (`translateDocument`, cues `resources/knowledge-translation/translation-cues.v2.json`). A teaching
document is read into blocks (paragraphs, bullets, numbered items, table rows with their header roles), clauses and
typed statements of a closed set (Rosetta-style): not_sufficient, depends_on, increases, decreases, composed_of,
requires, not_comparable, measured_by, method_step, definition, limitation, quantitative_finding, plus table roles.
Each statement keeps its quote, provenance (source, line, headings, block, column), the document's own status markers
(never upgraded), references, typed spans (QK metrics, kinds, axes, units and store concepts) and a rendered sentence
that can be checked against the quote. What is not recognised is counted. A render-back **self-check** marks a
statement whose rendering lost a negation; such a statement is kept for audit and must not be used as knowledge.

**3b. Acquisition of condition axes, driven by questions of PEE's own teaching** (`distinctionQuestions`,
`acquireConditionAxes`, `withAcquiredAxes`). The question is generated, not hand-written: two taught measurements of the
same measurand whose names differ by words the quantity knowledge cannot type (`sustained_sdr_luminance` vs
`hdr_luminance_by_window_and_duration`: "sdr" vs "hdr"). The answer is sought in the documents in three general
structures (an enumerated field `key: a | b | c`, slash alternatives with a head `SDR/HDR mode`, an explicit contrast
`new versus aged filters`). A proposal is kept only when it answers a question completely (each side gets a value); a
one-sided answer is refused because it would make PEE assume the other value. The axis enters as a reversible overlay
(the pack file is unchanged; `labelled:true` makes QK read it from a value's labels) with its quote and line as
evidence. No category word is coded.

**3c. lk.6 link rules** (`resources/quantity-knowledge/link-rules.v6.json`). Specificity: among candidates consistent
with a value, the one whose fixed condition the value states wins, but only when its measurand is fully typed (a match
on one condition does not identify "EU-label kWh per 100 cycles" against a measured per-programme kWh). Partition: when
candidates consistent with the value fix different values of an axis the value does not state, the value stays
ambiguous with that axis as the deciding question; it is never "equivalent" (equal consequences do not make values
measured under different conditions comparable) and no third candidate wins by elimination. A candidate contradicting a
stated condition neither partitions nor is chosen.

Tests: `tests/knowledge_translation.test.ts` (8: provenance, ranges, negation metamorphic, acquisition and its refusals,
enumeration, rendered negation, questions and metadata), `tests/knowledge_link.test.ts` (25, incl. 5 lk.6). Full suite
green.

## 4. Fidelity in both directions (held-out sections; blind judges)

Protocol `r3/fidelity/prompt.md` (hash in `evaluation/r3/translator-freeze.json`, frozen with the translator before the
held-out run). Three fresh-context judges, one per category, saw only the protocol and their input; they did not know
how the translator works. Same model family as the developer: this is not independent human validation.

**First run, unchanged** (`evaluation/r3/translate-heldout-first.json`, `fidelity-heldout-first.json`):

| Direction | Result |
|---|---|
| statement → source (592 statements) | faithful 254 (43%), partial 116, distorted 146 (25%), unjustified 76; status labels inconsistent 46 |
| source → statements (740 units) | captured 171 (23%), partial 108, distorted 129, omitted 332 (45%) |
| mechanical reach (units with a compatible statement) | 290/740 (39%); development sections 482/940 (51%) |

Error families found by the judges:
1. **Negation lost** (115 of 182 limitation statements distorted): the pattern split on "cannot", "is not", "do not",
   "no" and the display template dropped that word, so the rendering asserted the opposite of the source. This is the
   most serious defect: it inverts meaning.
2. Questions, file names, versions and URLs read as claims (most of the 76 unjustified).
3. Method steps losing their leading verb (30 partial).
4. Clause-level depends_on on noun phrases ("temperature control are…") producing nonsense (12 distorted, 10 unjustified).
5. Omission: proposed methods (0/79 reached), conflicts (0/13) and compound procedures (2/13) are barely translated.

The render-back self-check, applied afterwards to the first run's statements, flags 140: 112 of the 118 statements the
judges found distorted by a lost negation, 3 other distortions, 25 partial, and no faithful statement.

**After the fix (TUNED on the held-out sections: the defects were found there)** — see §6.

## 5. Operational change (R2 link experiment; spent value sets: diagnostic, not held-out)

Arms: C7 = lk.5 (R2 closure); C8s = lk.6 rules only; C8 = lk.6 + axes PEE acquired from each category's owner package;
C8r / C8d = acquired axes in reading only / in measurement descriptors only.

| Set | C7 → C8s (rules only) | C8s → C8 (acquired knowledge) | regressions C7 → C8 |
|---|---|---|---|
| p272 (Phase272, 138 found values) | no change | +6 correct (abstain → good) | 0 |
| s1cd (Step 1C/1D, 166 found values) | no change | +6 correct (abstain → good) | 0 |
| af (air fryers, 23 found values) | no change | no change | 0 |

- All 12 gains are television luminance values that lk.5 left ambiguous between SDR and HDR measurements: PEE acquired
  the SDR/HDR axis from the **television package, which was held out from building the mechanism** (transfer), and the
  values now link to the measurement their stated mode names. The gain needs the axis both in reading and in the
  descriptors (C8r and C8d alone: 0).
- Air purifiers: a filter-state axis (new / aged / replaced / unknown) was acquired, but no value in the spent sets
  states a filter state: no measurable effect. Dishwashers: no axis acquired (the EU-label vs wall-plug distinction is a
  measurement basis, not a condition with values; correctly not acquired). Air fryers: empty run vs cooking is not
  stated in the documents as alternative values of one condition; it stays ambiguous (10 values), which is justified
  abstention, not a fix.
- Base-reader limits are separate and unchanged: not found by the reader 25 (p272) / 25 (s1cd) / 41 (af); product
  missing or wrong as before.
- An intermediate lk.6 version had 12 regressions on p272 (3 good → bad, 9 abstain → bad); the development review found
  three general causes (a contradicted candidate counted in a partition; partitioned candidates merged as equivalent; a
  condition match choosing a candidate with an untyped measurand qualifier). The fixed rules have none. Both versions'
  outputs are committed (`link-*-r3dev2`, `link-*-r3c`).

## 6. After-change fidelity (TUNED)

Cues kt-cues.2 (`translation-cues.v2.json`; kt-cues.1 kept to reproduce the first run): the word a pattern splits on is
rendered; instructions without a subject are not shown as "(unspecified)"; questions and metadata values (file names,
URLs, versions, dates) are not statements; the render-back self-check is added. Judged blind again by three new
fresh-context judges, only where the run differs from the first one (169 changed statements, 326 units whose statements
changed); the other judgements carry over (`scripts/r3-fidelity-delta.mjs`, `evaluation/r3/fidelity-heldout-fix1-tuned.json`).
TUNED: the defects were found on these sections, so this is not held-out evidence.

| | first run (unchanged) | after kt-cues.2 (TUNED) |
|---|---|---|
| statements | 592 | 549 (43 questions or metadata no longer read as claims) |
| faithful | 254 (43%) | 367 (67%) |
| partial | 116 | 106 |
| distorted | 146 (25%) | 29 (5%) |
| unjustified | 76 | 47 |
| units captured / partial / distorted / omitted (740) | 171 / 108 / 129 / 332 | 265 / 115 / 28 / 332 |
| high-importance units captured / distorted (238) | 77 / 45 | 114 / 9 |
| statements flagged by the self-check | (140, applied afterwards) | 4 (all judged partial) |

Development sections with kt-cues.2: reach 479/940 (was 482), 606 statements (was 640): no loss of coverage.
Omission is unchanged (332 units, 45%): the fix corrected meaning, not coverage. The remaining partials are mostly
clause fragments with an unresolved referent ("they", "it", "these results"), which needs clause-to-clause context.

## 7. What R3 establishes and what it does not

- **Established (development and tuned evidence, same-model judges):** PEE can translate teaching documents into typed,
  provenance-bearing statements that render back for checking; it can find a question in its own teaching and answer it
  from a document as a reversible condition axis; that acquired axis changes reading and linking with 12 gains and no
  regression on spent sets, including transfer from a package not used to build the mechanism.
- **Not established:** independent human validation (none exists); held-out operational benefit (no unseen value set
  without new acquisition, which is not authorised); consultation of translated statements other than condition axes
  in decisions (the typed statements are not yet read by the link program or goal relevance); empty-run vs cooking
  energy; compound cost procedures as executable knowledge.
- **Maturity (roadmap kinds):** translation — proposed/experimental (vocabulary + structure); axis acquisition —
  experimental (learning, transfer shown on one case family); lk.6 — experimental (inference).
- **Residual omissions:** 45% of held-out units omitted in the first run; proposed methods, conflicts and compound
  procedures nearly untranslated; scope/applicability and status/certainty are the largest representational gaps.
