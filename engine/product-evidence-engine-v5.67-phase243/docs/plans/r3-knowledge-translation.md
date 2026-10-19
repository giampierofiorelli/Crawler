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
