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

## 8. Cycle 2 (owner S74): consulting translated limits in reasoning, shadow only

The owner asked that translated "not sufficient" and "not comparable" statements be used in reasoning, each keeping
its scope of validity, without ranking consequences or exclusions, and shown to improve reasoning without new errors.

**8a. Sufficiency of taught measurements (first run against a pre-existing reference).** `deriveSufficiency` reads a
taught relation "measurement M bears on outcome O" as *informs only* when a self-checked not_sufficient statement's
subject identifies M and its object identifies O; never "establishes" from silence. Frozen
(`evaluation/r3/sufficiency-freeze.json`) and compared with the R1+ V1 blind verification (made before R3, without the
translator): **0 derived** (`sufficiency-first.json`; 36 informs-only and 15 establishes relations all unresolved: no
error, no benefit). A development change to concept identification (statement words, aliases, inverse frequency;
`sufficiency-dev1.json`, development categories only) also derives 0. Cause, measured: the documents' 301 self-checked
not_sufficient statements are almost never about the taught test designs; they are about what pages show (labels,
nominal capacities, demonstrations, particle CADR, coverage figures). This consumer is kept (tested, no false
derivation) but has no effect.

**8b. Proxy limits on read values.** `proxyLimits` turns a statement whose subject is a typed quantity into a limit
("a value of this quantity does not by itself establish …", with quote, line and scope); `applicableLimits` attaches it
to a read value of that metric (or of that kind with a shared distinctive word), and not when the value states another
value of an axis the statement names. Annotation only: links, forces and rankings unchanged (C7 → C8 transitions
identical). Blind applicability judgement (one fresh-context judge, same model family; protocol `r3/limits/prompt.md`):

| | pairs | applies | not about this value | outside scope | harmful |
|---|---|---|---|---|---|
| first run, unchanged (`limits-p272-r3l1.json`) | 173 | 24 | 149 | 0 | 0 |
| after the subject-head rule, TUNED (`limits-r3l2-tuned.json`) | 21 | 19 | 2 | 0 | 0 |

The first run's errors had three general causes: a quantity mentioned in passing ("OLED burn-in in high-brightness
imagery"), two sentences merged into one subject, and an introductory phrase ("Without … actual CADR/room height,
coverage figures"). The fix (`subjectHead`: the last sentence, without the introductory phrase, cut before a
preposition, as for taught measurement names) removed 147 wrong attachments and 5 correct ones (a sentence whose head
is the appliance, not the quantity). What applies now: particle CADR values qualified as not establishing gas (NO₂,
second-hand smoke) protection; measured humidity reduction qualified as not proving mould removal or health effects.
Remaining error: an air-fryer statement about "time to a fixed food mass loss" attached to cooking times by a shared
word.

**8c. What this shows.** PEE now uses knowledge it translated itself, with provenance and scope, on values it reads, at
90% precision on a tuned set and with no harmful use; but on 19 attachments in 2 families. It does not yet produce more
correct *conclusions* in the owner's sense: a limit qualifies a value, it does not decide anything. The binding
constraint is identification: 85% of the documents' limit statements have a subject PEE cannot type (claims, labels,
designs, product features), and taught concept names do not match document language.

## 9. Cycle 3 start (owner S75): where held-out knowledge is lost (`evaluation/r3/funnel-c3-0.json`)

The owner asked to test, not assume, whether the 45% omission and the 85% untyped limit subjects share a cause, by
separating three bottlenecks. Census of the 740 held-out units (translation kt-cues.2, TUNED on these sections; blind
same-model coverage judgements; store-comparison gaps; consumers as of cycle 2; `scripts/r3-funnel.mjs`):

| Stage | Units | Share |
|---|---|---|
| 1a not extracted (no statement on the unit's lines) | 139 | 19% |
| 1b extracted, but the statements there carry other knowledge | 193 | 26% |
| 1c extracted, distorted | 28 | 4% |
| 2a kept, but neither a taught concept nor a typed quantity is identified | 155 | 21% |
| 3a identified (concept candidate or typed quantity), not consulted by any decision path | 221 | 30% |
| 3b identified and consulted | 4 | 0.5% |

Findings:
- **The hypothesis is refuted as stated.** Omission (1a + 1b, 332) is an extraction and representation loss, not a
  naming loss: in 193 of the 332 the translator produced statements on the same lines that the judges found to carry
  something else. Omission concentrates where the store comparison found representational gaps: status or certainty
  (63 omitted), compound procedures (49), expert judgements (37), and nearly all conflicts (11 of 15).
- **Mapping (2a, 21%) is a separate loss**, concentrated in proposed methods, limitations and expert judgements.
- **Consultation is the largest single loss (3a, 30%)**: knowledge kept and identified is read by nothing, because the
  consumers read only two statement types and the link program's measurement concepts. This loss is upstream of any
  "more correct conclusions".
- **The 3a figure overstates the mapped stage:** identification there is a candidate (`identifyConcept`), not a
  validated alignment. Candidate retrieval and validation of meaning are not yet separated (owner S75); mapping
  correctness is unmeasured.

Consequence for the next experiment: no single fix serves all three stages. The order chosen: (i) separate candidate
retrieval from validated alignment with explicit match types (exact, close, broader/narrower, related, none), measured
against a blind sealed annotation that includes negative pairs sharing words; (ii) a consumer for the validated
alignments that changes an interpretation, not just an annotation; (iii) richer representation for the status,
compound-procedure and conflict losses.

## 10. Cycle 3: candidate retrieval versus validated alignment (owner S75)

**Reference.** 120 development and 120 held-out mentions (subjects and objects of translated statements), each with
up to four candidates from a deliberately liberal retriever (`retrieveConcepts`) plus one control sharing no word;
blind annotation of every candidate with a SKOS match type and of what each mention denotes (two fresh-context agents
of the developer model family; protocol `r3/align/prompt.md`). The held-out annotation was sealed by hash before any
validator existed (`evaluation/r3/align-freeze.json`).

**What the mentions denote.** Development / held-out: measurement or test 24 / 27, outcome 17 / 22, condition 3 / 8,
product feature 16 / 14, claim or label 9 / 5, source or evidence 13 / 17, other 38 / 27. Fewer than half are of the
kinds the store has concepts for (measurements, outcomes, conditions); the rest have no concept to align to.

**Identity is rare.** Of 393 / 382 retrieved candidates only 6 / 19 are exact or close; most share words and are
`related` (79 / 86) or `none` (301 / 272).

**Identifiers scored** (`align-*.json`; identity = exact or close):

| Identifier | Side | identifications | correct | related only | none | identities missed |
|---|---|---|---|---|---|---|
| cycle-2 `identifyConcept` (frozen) | development | 14 | 1 | 8 | 5 | 5 of 6 |
| v0 `alignConcept` (head word, aliases, kind) | development | 4 | 0 | 2 | 2 | 6 of 6 |
| cycle-2 `identifyConcept`, first run | **held-out** | 21 | 3 (14%) | 14 | 4 | 16 of 19 |

Findings:
- **Lexical identification is not identification.** On the sealed held-out reference the cycle-2 identifier is right
  in 3 of 21 identifications and turns `related` concepts into identities 14 times. The census's stage 3a ("identified
  but not consulted", §9) therefore overstates what PEE identifies; it is a candidate count, not an alignment count.
  Consumers of cycle 2 used it only where it decided nothing (`deriveSufficiency`: 0 derived) or as an informational
  field (`proxyLimits.outcome`); no link, force or ranking depended on it.
- **The real identities need equivalence and hierarchy knowledge**, not word overlap ("physical reduction of aerosol"
  = fine-particle reduction; "dust defence" ⊂ allergen-particle reduction; "a clinical benefit" = clinical health
  outcome). The documents hold such knowledge mostly implicitly (table rows listing members under a class, enumerated
  examples), rarely as explicit definitions.
- v0 (stricter lexical validation) is worse than abstaining on development; it is kept for its tests but not used.

Next mechanisms, in order: (a) keep `related` as a first-class result that no consumer may read as identity;
(b) acquire equivalence and broader/narrower relations from document structure (class rows and their members,
"such as" enumerations, headings over lists), each with provenance and a SKOS type, and score them on the sealed
held-out reference; (c) concepts for the kinds of things mentions denote and the store lacks (features, claims,
evidence types), which the representation gaps of §2 also point to.

## 11. Cycle 3, continued: semantic-type check before identity

**Step 1 (`related` first-class).** `alignConcept`/`alignWithType` return every candidate with a SKOS match type;
`related` is never an identity, and the phrase stays `unresolved` when no candidate is identity-grade.

**Step 2 measured before building (structure-based equivalence).** The general prose structures that state
equivalence or hierarchy ("X such as A, B", "X (e.g. A)", "X, including A", acronyms in brackets) occur 11 times in
~45 KB of development text, mostly noisy. The documents carry such knowledge implicitly (tables, context). Not built.

**Semantic type (new).** `denotationOf` reads what a phrase refers to (measurement or test, outcome, condition, product
feature, claim or label, source or evidence, other) from general role words (`denotation-cues.v1.json`, one
development round) and QK typing; `alignWithType` (v1) lets a candidate become an identity only when its concept kind
is compatible with that denotation. Frozen before the held-out run (`align-freeze.json`, `validatorFreeze`).

| | side | identifications | correct | false (related / none) | identities missed | denotation correct |
|---|---|---|---|---|---|---|
| cycle-2 identifier | held-out (first run) | 21 | 3 | 14 / 4 | 16 of 19 | — |
| v1 type-gated | development | 2 | 0 | 1 / 1 | 6 of 6 | 64 / 120 |
| v1 type-gated | **held-out (first run)** | 6 | 2 | 4 / 0 | 17 of 19 (16 unresolved, 1 on a wrong candidate) | 54 / 120 (45%) |

Correction (owner review 2026-10-19): the scorer counted as "missed" only identities left unresolved; for v1 one
reference identity went to a wrong candidate, so 17 of 19 were missed, not 16 (the scorer now reports both). Status
of the reference: the held-out alignment annotation has been examined in aggregate (cycle-2 first run, this first
run, the diagnoses above). These first runs stay as recorded; any later change evaluated on it is development or tuned
evidence, not new validation.

What this shows: checking semantic type removes 78% of false identities on unseen mentions (18 → 4) at the cost of
one correct identity; precision rises from 14% to 33%, recall stays about 10%. The type recogniser itself is weak
(45%: a component's specification read as a measurement, outcomes stated as verbs). With lexical evidence alone PEE
cannot reach the true identities, which need equivalence and hierarchy knowledge ("aerosol" ≈ particles; dust ⊂
allergen particles).

Options for that recall limit, none chosen yet:
1. a distributional similarity model trained only on the owner packages (no external dependency or service) as a
   better retriever, with the type check and an explicit `unresolved` state as validation;
2. a small local language model as a validator: a heavy dependency, needs owner authorisation (skill §2);
3. not aligning to existing concepts at all where none fits: keep document concepts (features, claims, evidence types)
   with typed `related` links, and make limits evidence-role aware (a limit on a declared value applies to
   declarations, one on a measurement to measured values), which needs no identity.

## 12. Cycle 3, options 3 and 1 (owner 2026-10-19: "prosegui con la 3 e poi la 1")

All results below use the alignment and limit references already examined: development evidence, not validation.

**Option 3a: evidence-role-aware limits.** A limit is restricted to declared values when its subject states a
declaration ("advertised litres"), to measured values when it states a measurement ("a measured CADR"); otherwise it
concerns any value of its quantity. A value whose role is unknown does not receive a role-restricted limit (counted).
Read values carry the reader's evidence class (`document_evidence` / 1G). Effect on the link experiment
(`link-*-r3l3.json`): attachments on measured values unchanged (5 / 15 / 1); 2 new on declared air-fryer cooking times,
judged blind `true_but_trivial` (no harm, no value). Measured limit: 213 of the 327 read values have an unknown
evidence class, so role-aware knowledge has little to act on: a reading limit, not a knowledge one.

**Option 3b: document concepts** (`document-concepts-c3.json`). Unaligned subjects and objects of translated
statements, by head words: 956 (development) and 856 (held-out) distinct, of which only 41 and 34 recur. Denotations:
other 442 / 457, measurement or test 200 / 146, product feature 104 / 83, source or evidence 74 / 66, outcome 68 / 55,
claim or label 53 / 44, condition 15 / 5. Without recognising that two phrases name the same thing, these are phrases,
not concepts: consolidating them needs the same alignment ability that is missing.

**Option 1: distributional similarity from the owner corpus** (`trainDistributional`: PPMI over ±5-word windows, 88
package files, 6,182 paragraphs, 5,646 stems; no dependency). It learns topical relatedness, not equivalence:
"aerosol" is as close to "gas" (0.21) as to "particle" (0.20); "dust" is near "pollen" (0.37) and "allergen" (0.28) but
also "brush" and "hair".

| Over the 25 annotated identities | first | top 3 | top 5 |
|---|---|---|---|
| lexical retrieval ranks the identity | 15 | 22 | 24 |
| distributional retrieval ranks the identity | 10 | 21 | 23 |

(The reference was built from lexical candidates, which favours lexical retrieval.)

Validation by similarity, top lexical candidate accepted above a threshold on min(similarity both ways), all 240
annotated mentions: with the type check, best 18 accepted / 5 correct (28% precision, 23% recall); with the
annotators' own type, 23 / 6 (26%); without type, 64 / 9 (14%). No threshold separates identity from relatedness.

**Conclusion of cycle 3.** Retrieval is not the bottleneck: the right concept is among the first three candidates for
22 of 25 identities. Validation is: with lexical, structural or corpus-distributional evidence PEE cannot tell an
identity from a related concept (precision ≤ 33% at every setting tried). What remains possible without a semantic
validator: consumers that need only `related` links (never decisions), the semantic-type guard (78% fewer false
identities), and quantity-typed knowledge, which does work (proxy limits, acquired axes).

## 13. Bounded semantic-model experiment (owner S76): stopped

Shadow-only feasibility experiment, outside PEE (`scripts/r3-semantic/validate.py`, separate virtual environment and
model cache outside the repositories; no weights committed; nothing produced enters the store, links or rankings).
Candidates: an NLI cross-encoder (`cross-encoder/nli-deberta-v3-xsmall`, Apache-2.0, 71 M parameters) and small
instruction LLMs (`Qwen2.5-0.5B-Instruct`, `Qwen2.5-1.5B-Instruct`, Apache-2.0), scoring each candidate concept; the
decision rule (identity threshold, optional semantic-type check, unique identity or `unresolved`) lives in
`scripts/r3-semantic-score.mjs`. Methods and thresholds were chosen on the two examined references only; a **fresh
blind reference** (120 mentions, 396 candidates, from the transfer packages televisions, household dishwashers and
dehumidifiers, never used for alignment) was annotated and sealed by hash before any model touched it
(`align-freeze.json`, `transfer`), and the arms were frozen before its single first run (`transferRunFreeze`).

**Development (examined references).**
- NLI, first formulation (shared context in premise and hypothesis): 0 correct identities at every threshold (the
  shared prefix inflates entailment). Variant c (phrase and concept description, no context): the concept-to-phrase
  entailment separates real identities (median 0.83) from related (0.01) and unrelated (0.007) candidates on the 6
  development identities; per mention, best development result 25% precision / 33% recall; on the held-out reference
  (19 identities) 19% / 16%, no better than the lexical identifier (14% / 16%).
- LLM 0.5B: 0 correct identities at every threshold. LLM 1.5B: 0 correct identities at every threshold; it scores
  real identities lower (median 0.14) than hierarchical relations (0.51).

**Fresh blind reference, first run (14 identities):**

| Arm | identifications | correct | precision | recall | wrong: related promoted to identity |
|---|---|---|---|---|---|
| lexical identifier (cycle 2) | 15 | 3 | 20% | 21% | 8 |
| type-gated alignment v1 | 4 | 1 | 25% | 7% | 1 |
| NLI variant c, concept→phrase ≥ 0.7 | 15 | 4 | 27% | 29% | 7 |
| LLM 1.5B, identity ≥ 0.5, type gate | 5 | 0 | 0% | 0% | 1 |

Semantic type on new categories: 40 / 120 correct (33%).

**Costs (CPU, 4 threads).** NLI: 0.10–0.13 s per pair, 0.9 GB memory, 283 MB weights. LLM 0.5B: 0.61 s per pair,
3.3 GB. LLM 1.5B: 1.76 s per pair, 9.3 GB (float32; bfloat16 on CPU was far slower). Runtime environment 1.2 GB
(PyTorch CPU and transformers). Free to download; not free to run: a 1.5B validator over a category's ~1,000 mentions
with 3–5 candidates each is about 1.5–2.5 hours of CPU per run.

**Decision (S76 criterion: a clearly better recovery of correct identities on fresh blind data without promoting
related concepts to identities).** Not met. The best arm on fresh data (NLI) recovers 4 of 14 identities against 3 for
the lexical identifier, and still promotes 7 related concepts to identity. The experiment is stopped; no model is
integrated; the harness is kept for reproduction. R3 continues on the other established bottlenecks (§9): extraction
and representation of status, compound procedures, expert judgements and conflicts; reading of the evidence role
(declared or measured) of page values.

## 14. Architecture audit (owner S77, 2026-10-19): findings, corrections, measured effects

Scope: the whole chain behind the R3 alignment results (owner documents → translation → concept representation →
identity validation → store → retrieval → link and evidence → consumers), legacy components included. Method: read
the execution paths actually used (versions, files, defaults), trace authentic failures (U1 particle CADR limit, U2
air-fryer power and capacity), re-run the committed scorers, and re-derive counts. No external material, no new owner
attachment, no new model experiment except one re-run whose earlier conclusion rested on a defective readout (§14.4).
All judgements below are by fresh-context agents of the developer model family, blind to the mechanism: same-model
annotation, **not** independent validation. Every held-out set used here was already examined: all after-change
figures on it are **TUNED**.

### 14.1 Classification of verified findings

| # | Area | Finding | Class | Action |
|---|---|---|---|---|
| T1–T15 | Translator (`knowledge_translation.ts`) | lost negation and hedges in relations; "A is B, not C" (452 occurrences in the packages, 40 translated) unread; a relation word in noun position read as a verb ("temperature control are …" → `depends_on`); subject heads dropping "of" complements; decimals read as versions; abbreviations ending sentences; header roles by substring; table headers stating a relation ignored; case-sensitive condition acquisition merging disjoint value sets; role-restricted limits applied to values of unknown role | bugs | fixed (kt-cues.3, tests); measured §14.2 |
| T16 | Translator, first fix | whole-word header roles lost plural headers ("Risks and limitations", "traps"); the noun guard stopped at the first rejected relation word and treated relative "that" as a determiner | regression introduced by the audit itself, found by the held-out reach drop 289 → 273 | fixed: stem-based header roles, masked retry, demonstratives removed |
| T17 | Translator rendering | `not_sufficient` always rendered "does not *by itself* establish", weakening a plain "does not establish" (4 partials in the blind check) | bug | fixed after the check (rendering only; not re-judged) |
| Q1–Q15 | Reader / quantity knowledge | value-level evidence class decided by sentence and headings before the value's own clause; generic words naming specific metrics ("energy label", "brightness", "latency"); hyphen/space phrase mismatch; recurring cost read as an estimate without cost context; narrow first-person test cues; narrative test reports on a page that declares its own test left `unknown` (1G row-order layout, /24h, P1e conditions, noise kind, short units: recorded, not changed) | bugs and missing capability | evidence class, qk.2.4, hyphen, cost context, page-level test rule fixed; rest recorded |
| S1 | Production ranking `outcomeAuthorised270` (`phase253_request_advice.ts:172`) | every `measured_by` relation authorises ranking, including the 36 the store qualifies as informing only | unsupported inference in production | **not changed** (ranking protected): owner decision needed, proposal §14.5 |
| S2 | same, `:176` | required conditions pooled across all measurements relevant to the need, so one measurement's conditions bind another's | architectural limitation | not changed, owner decision |
| S3 | `relations247` | relations whose `item:` endpoint was superseded stayed active (dehumidifiers 10 → 6) | bug | fixed earlier in the audit |
| S4–S9 | Store | duplicate concept ids; concept-less items dropped by `teachingView`; no representation for conditions, scope, status, negation, procedures, conflicts; attribute endpoints unvalidated; relation kinds no consumer reads | architectural limitations / missing capabilities | recorded; they bound what translation can ever deliver to the store |
| S10 | Datalog engine (`knowledge_rules.ts`) | `<`/`>` on non-numbers compared code units ("s10" < "s9") | bug | fixed (numeric-aware collation; ISO dates unchanged) |
| S11 | Documentation | `knowledge_link.ts` header named link-rules v1 (v6 runs); 14 scripts hard-code the store path | stale documentation / fragility | header fixed; paths recorded |
| E1 | S76 LLM arm (`validate.py`) | label readout took only the first token of the lowercase forms: "narrower" was the token "n", capitalised answers ("Exact", the usual first word of a reply) were discarded | evaluation defect | fixed (full-sequence readout over four surface forms); re-run §14.4 |
| E2 | Reach metric (`r3-translate.mjs`) | `proposed_method` (79 units) and `hypothesis` (3) had no compatible statement type; `is_not` none | evaluation defect: §4 and later reach figures understate | fixed (`compat v2`; `R3_COMPAT=v1` reproduces the old table) |
| E3 | Fidelity delta scorer | a base that is itself a delta did not carry its own base's judgements | evaluation defect (would have shown 713 items "missing") | fixed (chain resolved) |
| E4 | Limits judgement | the same (category, value, limit) recurs across sets; the tuned file was written by hand | evaluation defect | per-distinct counts; `carry` mode writes the tuned file |
| E5 | Alignment references | candidates were retrieved lexically before annotation, so "22/25 in top 3" measures the retriever against its own candidates (circular); recall denominators omit identities the retriever never proposed | evaluation defect / unsupported claim | corrected below; not re-run |
| E6 | Reported numbers | C7 → C8 changed 28 decisions, not 12 (C8d filter axis 16); align1 on transfer made 5 identifications (1 correct, 20%), not 4 (25%); decision_usable on s1cd +1, not +6; funnel stage 1b is co-location, not judgement; freezes are checked by scorers, not at run time; NLI variant was not recorded in outputs | reporting errors | corrected here; NLI variant and LLM readout now recorded |

Earlier sections are not rewritten: these rows are the dated correction notes for §4, §5, §9, §10, §12 and §13.

### 14.2 Measured effects of the corrections

| Measure | Before | After | Tier |
|---|---|---|---|
| Held-out translation, blind fidelity (577 statements; only changed items re-judged, 51) | faithful 367, partial 106, distorted 29, unjustified 47 | faithful 404, partial 107, distorted 22, unjustified 44 | TUNED, same-model judges |
| Held-out units (740), blind coverage | captured 265, omitted 332, distorted 28 | captured 289, omitted 314, distorted 22 | TUNED, same-model judges |
| Held-out reach, old table / corrected table | 289 / — | 287 / 343 | mechanical, development measure |
| Development reach, old table / corrected table | 479 / — | 502 / 520 | development |
| Evidence role of 327 page values vs sealed blind reference (local text only) | agree 35, missed measured 79, asserted where text cannot tell 78 | agree 113, missed measured 0, asserted 95, wrong 2 (unchanged) | development (spent pages) |
| Link outcomes p272 / s1cd / af | — | unchanged on every arm | development |
| Proxy limits, per distinct (category, value, limit) | 14 of 56 apply (25%) | 12 of 28 apply (43%), 8 true but trivial, 7 not about the value, 0 harmful | first run / TUNED |

The 17 values newly asserted as publisher measurements (95 − 78) are on pages that declare their own test; the
reference annotator saw only the value's sentence, so it could not tell. They are plausible but not validated: a
page-context reference would be needed to score them.

### 14.3 What the audit establishes about the alignment failures

The repeated alignment failures were not only model limitations. Of the four ingredients the S76 decision rested on,
one was defective (LLM readout, E1), one overstated (retrieval circularity, E5), and the translator feeding the
mentions had 15 defects that removed or distorted knowledge before any alignment (T1–T15). The NLI result (4 of 14
fresh identities, 7 related concepts promoted) is unaffected by these defects and stands.

### 14.4 The S76 LLM arm re-run with a valid readout (development reference only)

Qwen2.5-1.5B on the 393 development pairs, labels scored by full-sequence probability over four surface forms
(`LLM_READOUT=seq`, recorded in the output). The six labels now carry a median 95.5% of the next-token probability, so
the first readout's loss was real but small. Result unchanged: 0 correct identities at every threshold, with or without
the type gate; the model still scores real identities (median 0.10) below hierarchical relations (0.42). Cost 3.2 s per
pair. The S76 conclusion therefore stands on a valid measurement; a transfer re-run is not justified and was not made.

### 14.5 Proposal for the owner (production ranking; not implemented)

`outcomeAuthorised270` should count a `measured_by` relation as establishing an outcome only when its qualification
does not say it merely informs (36 relations in the store today), and should check required conditions per
measurement, not pooled across the need. Both make ranking stricter, never looser; both change production behaviour,
so they wait for an owner decision.

### 14.6 Outcome

- **Trustworthy (verified on authentic material in this audit):** the KR engine and the lk.6 link program (derivations
  re-derived; one comparison bug fixed); the reader's typed quantities and attribution on the R2 sets (link outcomes
  unchanged by every correction); the translator's statement provenance and render-back self-check; the sealed blind
  references and their hash checks.
- **Not yet validated:** translator fidelity after the corrections (TUNED: the held-out sections were examined); the
  page-level evidence-role rule (17 values the reference cannot decide); proxy-limit applicability (TUNED, 28 distinct
  pairs); every alignment arm on new categories beyond the single transfer first run.
- **What actually constrains R3:** (1) the store cannot represent conditions, scope, status, negation, procedures or
  conflicts (S6), so faithful translation cannot reach reasoning; (2) identity knowledge (equivalence, hierarchy) is
  absent: neither lexical, distributional nor the tested small models supply it; (3) 314 of 740 held-out units are
  still omitted (practitioner judgements, compound procedures, causal claims); (4) evaluation rests on same-model
  annotation.
- **Consequences for the MVP:** advice can use translated limits only as labelled caveats (shadow) until (1) is
  solved; ranking stays on signed catalogs and taught `measured_by` relations, with the two stricter rules of §14.5 as
  the next owner decision; concept alignment for new categories needs taught equivalences or owner-reviewed mappings,
  not a model.

## 15. Engineering priorities after S77 (owner S78, 2026-10-19)

Model experiments are suspended (S78 §1); the harness and the S76/S77 findings stay. All judgements here are by
fresh-context agents of the developer model family, blind to the mechanism: same-model annotation, not independent
validation. Every reference used was examined before: every after-change figure is development evidence (TUNED). No new
external material was acquired.

### 15.1 Ranking authorisation corrected (S78 §2): ra.2 in production

| Finding (verified) | Class | Correction |
|---|---|---|
| `outcomeAuthorised270` accepted any `measured_by` relation as establishing the outcome, including unassessed hypotheses (58 of 63 relations are hypotheses) | unsupported inference in production | ra.2 (`outcomeAuthorisedRa2`) needs an active, source-citing assessment that the relation ESTABLISHES the outcome and none that disagrees |
| Conditions of every measurement of a need were required of each (pooled) | bug | conditions are those of the dimension's own measurement |
| Support grades and the review gate existed but no consumer read them | architectural gap | store v9 `relation_assessments` (journaled, basis and citation, never public); teaching may declare sufficiency only with a cited source |

Shadow census before the switch (`evaluation/s78/authorisation-census-live-1.json`, live store, 56 outcome-measurement
pairs, a hypothetical scored dimension each): ra.1 authorised 38, of which 20 on relations the blind source check found
to inform only and 5 on never-assessed relations, and refused 18 only because of other measurements' conditions; ra.2
authorises 15 (13 of ra.1's, plus 2 ra.1 wrongly refused). Hand check of the refusals: coffee taste is refused because
the need bundles taste with "little effort" and sensory assessment covers taste only; tumble dryers were never verified.
Scope caveat: "clinical trial establishes clinical outcome" holds at population level, not for a named product. ra.1
stays callable and every answer carries an `authorisationTrace` of both rules. Visible change on real requests: "What
would answer this" now names each measurement with its own conditions and what the sources say ("consumer lab cleaning
drying score (...; informs it but does not establish it) or residual soil score by soil type (...)").

### 15.2 Representation and operational use of translated knowledge (S78 §4, §8)

Store v10 `knowledge_statements`: 6,118 statements from 28 owner documents with polarity, hedge, the document's status
labels, scope, typed subject/object/parts, provenance (document hash and line, never the quote), translator version and
the measured reliability of the statement type (`resources/knowledge-translation/statement-type-reliability.json`).
Rows can never be ranking input (schema CHECK) and never reach a public export. Conflicts (the same relation asserted
and denied) are derived on reading; none found in the current translation.

Use in decisions: the advice shows at most one research caveat per need or measurement, of the reliable warning types
(limitation, not_sufficient, is_not) with the concept as subject, labelled "translated by PEE, not reviewed". Blind link
check, first run on 40 sampled concept-statement links (`evaluation/s78/caveat-link.json`): any position 30 apply, 9
related, 1 not about, 2 misleading; subject-only 12 of 16 apply, 0 misleading. Subject-only was chosen after seeing the
sample (TUNED). Examples now shown: crisp chips -> "'as crispy' is a culinary description, not matched instrumented
testing"; two foods at once -> "A dual-zone demonstration does not establish independent zone accuracy, equivalent
doneness or full-meal capacity". Coverage limit: only ~2% of statements have a subject typed to a taught concept; most
needs get no caveat (identity, not translation, is the bottleneck there).

### 15.3 Reading: translator precision (S78 §5) and attribution (S78 §6)

| Measure | Before S78 | After S78 | Tier |
|---|---|---|---|
| Held-out statements distorted + unjustified (blind) | 66 (audit3) | 26 of 547 | TUNED |
| Held-out units distorted / omitted | 22 / 314 | 5 / 322 | TUNED |
| `depends_on` bad | 47% | 0% (16) | TUNED |
| s1cd product attribution correct / missing / wrong | 79 / 82 / 5 | 93 / 68 / 5 | development (spent) |
| p272 product attribution correct / missing / wrong | 118 / 6 / 14 | 124 / 0 / 14 | development (spent) |
| Usable decisions C8 p272 / s1cd | 62 / 48 | 63 / 52 | development (spent) |
| Experience replays s1a / s1b | unchanged | unchanged (no lost success added) | regression check |

Translator corrections (general, no lexical category lists): ambiguous noun/verb words need syntactic evidence to be
relation verbs; questions are not claims; the leftmost main verb wins; modals the pattern consumed are hedges; code
blocks, bibliographic sections and recurring record fields are not knowledge; "verification/evidence needed" columns
are requirements (kt-cues.4). Cost: 8 more held-out units omitted (precision over coverage). Attribution corrections:
brand + model-code names found in the page body; a model code alone refers to its product when unique; a sentence
opening with This/Our/It gives its first values to the reviewed product. A first version of that last rule listed
category nouns; it was replaced by the general form, with identical results on both sets.

### 15.4 Evaluation infrastructure (S78 §9)

- The experience replay opened the live store with historical builds, which refuse a newer schema: `--frozen-store`
  gives historical builds a pre-S78 copy (from the private repository's history); the build under test reads the live store.
- The translation reach table, the fidelity delta chain and the limits counts were corrected in §14.
- The air-fryer link set reports every value "missing" a product: its values come from comparative tables (an air
  fryer against an oven), which the comparative-results reader handles, not the document reader. Recorded, not changed.

### 15.5 Verified, not yet validated, unresolved

- **Verified and corrected:** ranking authorisation (ra.2); pooled conditions; translator noun/verb, question, record
  and bibliographic errors; attribution of model-code and prose-named products; replay schema incompatibility.
- **Not yet validated (no untouched data available):** translator fidelity after correction; attribution gains; caveat
  relevance beyond the 40-link sample.
- **Architectural limits that remain:** identity of document phrases with taught concepts (~2% of statements linked);
  conditions and scope of translated statements are stored but no reasoning rule consumes them yet; comparative tables
  are attributed by equipment class, not by product.
- **Unresolved hypothesis:** a page-context evidence-role reference would decide the 17 values the local-text reference
  cannot judge.

## 16. Release safety after the owner's S78 review (S79, 2026-10-19)

Dated correction of §15.1 and §15.2 (owner review verbatim: skill `owner-s78-release-safety-review-2026-10-19.md`).

1. **Ranking: ra.2 restrict-only.** §15.1 put ra.2 in production; it also authorised two pairs ra.1 had refused, on a
   shadow over hypothetical dimensions, not on real signed catalogs. The deciding rule is now `outcomeAuthorisedRelease`:
   ra.2's safeguards in full, and a pair ra.1 refused is withheld (`new_authorisation_pending_validation`) unless it is
   listed in `VALIDATED_NEW_AUTHORISATIONS` with its validation record (empty). ra.1's acceptance alone is never enough.
   Census on the live store (`evaluation/s78/authorisation-census-live-2.json`): 13 pairs authorised (all authorised by
   both rules), 2 withheld pending validation, 36 refused as inform-only, 5 as not established. Every answer's
   `authorisationTrace` records ra.1, ra.2 and the decision.
2. **Research caveats internal.** §15.2 put machine-translated caveats into consumer answers while their scope and
   conditions were stored but not checked when used, on a tuned 12/16 relevance sample. They are removed from the answer
   (no field, no statement, no limitation); `teachingCaveatsShadow` returns them for internal evaluation only. A
   "not reviewed" label is not validation. The S78 behaviour that stays user-visible is the per-measurement wording of
   "What would answer this", which only restricts what an answer claims.
3. **What validation would release them:** for a withheld pair, a real signed catalog whose dimension uses the
   measurement, run through the full path, plus a source check of the sufficiency verdict; for caveats, a blind
   applicability check against the user's stated situation (scope and conditions consumed by a rule), on requests not
   used to build the linking rule.
4. **Attribution refinement after S79** (development sets, spent): the 14 wrong attributions on p272 were examined one
   by one. 5 are a naming granularity difference, not a wrong product (reader "Samsung QE65S85H", the page's exact UK
   65-inch code; reference "Samsung S85H"); 4 follow the page faithfully ("Candy CF 57CF0W"; the reference adds a "-80"
   variant suffix the page does not print); 2 were a reader defect (a structured product "name" that is a sentence,
   "The IQAir Atem X wouldn't look out of place…"), now read as its leading capitalised run; 3 are real errors ("the
   Elite", a model named by a word without digits), left unresolved because a general rule would risk merging products.
   p272 wrong 14 -> 12, usable decisions C8 63 -> 65; s1cd and af unchanged; evidence roles unchanged.
