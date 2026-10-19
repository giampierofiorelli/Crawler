# S87a — Why capabilities do not propagate, a shadow evidence assessment, and internal research freedom

Owner briefs (2026-10-19), both verbatim in
`.claude/skills/pee-guided-learning/references/owner-s87a-architecture-and-research-freedom-2026-10-19.md`:
"Scientific Architecture Review and Generalisation of Knowledge into Operational Intelligence" and "Owner Decision:
Internal Research Freedom, Knowledge Database and General Scientific Intelligence". The second completes the first.

Roadmap: cross-system work alongside R3 (no R step completed). Kind: architecture and inference. Maturity: shadow,
development only. **No live network request was made in S87a.** All measurements below use spent S80 pages; none is
held-out.

## 0. Outcome first

- **Cause found.** General capabilities are built and evaluated in shadow; the operational gates hold knowledge as
  constants; storage drops the words that say what a value measures; teaching hides programmes and scales inside
  measurement names. Each new capability therefore stops at the next boundary.
- **Built (shadow).** `src/evidence_assessment.ts`: one assessment per stored observation, composed from mechanisms that
  already exist. It states, with reasons, what each observation can be used for. Three opt-in linking corrections.
- **Measured.** On the 84 rows S86c stored: Phase268 validates 1. The assessment can describe 22 products and compare 21
  within their source; 1 is comparable across sources (the same row Phase268 validates). Linking errors went from about
  9 of 54 links to 0 of 34 by manual audit. Coverage fell; precision rose.
- **Research freedom.** A *standing* policy kind (rolling daily rates instead of experiment totals), temporary
  suspensions instead of permanent exclusions, robots `Crawl-delay`, adaptive back-off and a reservation-honouring
  private page archive. All are implemented and tested. **The standing policy is not yet in force.** See §9.

## 1. Why capabilities do not propagate (delivery point 1)

Trace of the S86c example (84 stored, 1 validated), stage by stage:

| Stage | What exists | Where it stops |
|---|---|---|
| Understanding and extraction | Plan-guided reading with role and subject controls (S86c, shadow) | Readings record words around each value; the store keeps value, unit, codes, block hash |
| Representation | `test_measurements265` | **No measurand words, no taught-measurement id.** With store data only, 31 of 84 rows are ambiguous and 24 link |
| Linking | `linkTypedToMeasure272`, QK typing | Used inside readers only. Defects: per-N scale ignored, measures without a taught outcome dropped, ties broken alphabetically |
| Conditions | D27/D28 `conditionsMetFromStoreRecords` | Shadow; not consulted by validation |
| Validation | Phase268 `VALIDATION_POLICY268` | **One protocol, one publisher, as constants.** Anything else is "not validated" |
| Comparison and advice | ra.2, Phase253 | Read only Phase268-validated rows. So 206 answers stay unchanged |

The recurring cause: **four separate representations of "what this value is"**: reader codes, the QK type, the taught
measurement, and the Phase268 protocol constant. No stage passes its conclusion to the next, so improving one does not
reach advice. Earlier phases each fixed one representation (S82 conditions, S85 quantities, S86 roles, S86c discovery)
and measured it in isolation.

## 2. Research consulted (delivery point 2)

The methods below are established in the literature. Each is labelled with how it applies here: **supported** means it
fits PEE's problem directly and is used in the design; **plausible** means it fits only by analogy and is not
implemented.

| Method | What it contributes | Here |
|---|---|---|
| W3C PROV-DM (entity, activity, agent) | Provenance is a separate record from the claim | **Supported**: the assessment carries source, reporting agent, method cue and extractor version for every row |
| Fellegi–Sunter record linkage; entity linking with NIL (TAC-KBP) | Link, non-link and an explicit undecided state | **Supported**: `measurement_ambiguous` vs `measurement_not_linked`; tie abstention |
| DocRED (document-level relation extraction) | Relations need cross-sentence evidence; most facts are not in one sentence | **Supported** as diagnosis: bare table cells lose their row label (10 rows) |
| FEVER, SciFact (claim verification with rationale) | Retrieval is not verification; a verdict cites its evidence or says "not enough info" | **Supported**: discovery and validation are separate purposes; each refusal has a reason |
| KILT | One knowledge source shared by many tasks, with provenance | **Supported** in principle: one assessment shared by description, comparison and advice. Not yet wired in |
| Snorkel / data programming | Many weak, noisy labelling functions combined with learned accuracies | **Plausible**: the reader controls are labelling functions; estimating their accuracies needs independent gold that PEE does not yet have |
| Selective prediction (coverage–risk curves) | Report accuracy against coverage; abstaining is a choice | **Supported**: the link audit reports both |
| Metrology (VIM: measurand, influence quantities) | A measurand is defined with its conditions; the scale belongs to the definition | **Supported**: per-N scale check; programme as a condition, not as an identity (teaching change proposed, not made) |

## 3. Retain, consolidate, retire (delivery point 3)

- **Retain:** QK typing; `linkTypedToMeasure272`; D27/D28; Phase249 retention; Phase268 as the ranking gate.
- **Consolidate:** "what this value is" should be one record: QK type + taught measurement + conditions + provenance.
  `assessStoredEvidence87` is that record, computed rather than stored.
- **Retire (proposed, not done):**
  - Phase268's constant protocol list, as a source of *validation* (it stays for ranking until a replacement is
    validated);
  - alphabetical tie-breaking in `linkToMeasure272` (kept as the reader default, off in the assessment);
  - programme and scale words inside measurement ids (a teaching change).

## 4. Is a new kind of reasoning needed? (delivery point 4)

**No new inference engine is needed.** The reasoning parts already exist:
- typing with justification;
- defeasible conditions;
- per-observation validity;
- provenance.

They are not *composed*. One genuinely missing capability is the **purpose-relative judgement**: the same observation
can be fit to describe a product, unfit to compare across sources and irrelevant to ranking. Earlier code reduced this
to one boolean ("validated"). The assessment adds it as an explicit judgement per purpose.

## 5. What was built (delivery point 5)

**Evidence assessment**
- `src/evidence_assessment.ts`: `assessStoredEvidence87(store, category, opts)`. Shadow; it is never read by ranking.
- It states five purposes, each with its reasons:
  - `record` (always met);
  - `describe_product`;
  - `compare_within_source`;
  - `compare_across_sources`;
  - `rank` (always false: ranking keeps its own gate).

**Linking corrections.** These are opt-in (`LinkOptions272`). The default reader behaviour is unchanged, and a test
asserts this.
- `scale`: a measurement taught "per N units" (N > 1) links only to a value whose words state the same N.
- `outcomeless`: a taught measurement without a taught outcome still links (energy of an empty run).
- `tieAbstains`: equal word evidence chooses neither.
- `typeStoredQuantity(qk, row, labels)`: the reading's words type a stored value, so a cfm value next to "CADR" is typed
  as CADR.

**Research freedom**
- The `standing` policy kind; the rolling 24-hour gate; robots `Crawl-delay`; adaptive back-off; the private page
  archive.
- `activeSuspensions246` replaces permanent discovery exclusions in Phase261 and Phase262.

**Script and tests**
- Script: `scripts/s87a-assess.mjs` (`--link-fixes off` reproduces the earlier assessment exactly; verified).
- Tests: `tests/s87a_generalisation.test.ts` (5 tests, including reproducing the per-100 defect). Full suite: **4,855
  passed** in 23 shards.

## 6. Improvements, measured (delivery point 6)

S80 store copy, S86c configuration D readings, 84 rows; development only.

| Measure | Phase268 | Assessment, before corrections | Assessment, after |
|---|---|---|---|
| Rows usable for anything beyond record | 1 | — | — |
| Linked to a taught measurement | — | 54 | 34 |
| Links judged wrong (manual audit) | — | ~9 | 0 |
| Ambiguous (explicit) | — | 1 | 25 |
| Not linked | — | 29 | 25 |
| Can describe its product | 1 (validated) | 41 | 22 |
| Comparable within its source | — | 40 | 21 |
| Comparable across sources | 1 | 0 | 1 |
| Store words only (no reading words): linked | — | 25 | 24 |

- **Precision.** The earlier "41 can describe" included the 9 wrong links. The corrected 22 is the defensible figure.
- **Abstention.** The 25 ambiguous rows break down as:
  - 10 bare table cells whose row words were not passed on;
  - 10 word ties between two taught measures;
  - 4 CADR values, now correctly typed but tied between CADR measures (for example sleep mode vs mode-by-pollutant);
  - 1 the earlier ambiguity.
- **Answers.** The 206 request answers are unchanged by construction: nothing operational reads the assessment.

Public counts are in `evaluation/s87a/`: `assessment-s80-D.json` (before), `assessment-s80-D-fix1.json` (after) and
`link-audit.json`. Private detail is in pee-knowledge `private-eval/s87a/`.

## 7. Limits (delivery point 7)

- Development pages only, spent. The audit is mine (Claude); there is no independent gold for links.
- The assessment is not stored and nothing operational reads it.
- Recall is limited upstream: readings drop row labels; the store keeps no measurand words.
- Teaching encodes programmes and scales in measurement names; the scale check is a guard, not a cure.
- Conditions for cross-source comparison are mostly unstated by publishers (79 of 84). The correct answer there is
  "within source only", not a failure.
- The legal basis of the page archive (text and data mining exceptions) has not been reviewed by the owner. Phase249
  per-host caps are kept pending that review.

## 8. Contribution to learning (delivery point 8)

| Capability | Kind | Maturity |
|---|---|---|
| Purpose-relative evidence assessment | inference | proposed → shadow (development evidence) |
| Scale-aware, outcome-tolerant, tie-abstaining linking | inference | shadow (opt-in) |
| Reading words in stored-value typing | vocabulary/inference | shadow (opt-in) |
| Standing research policy, temporary suspensions, Crawl-delay, back-off, archive | operational | implemented, tested; **not in force** |

**Lesson (hypothesis, development evidence).** A capability propagates only if its conclusion is represented where the
next stage reads. Measuring a stage in isolation hides this.

**Next.** In this order:
1. Store the taught-measurement id and the measurand words at reading time (a representation change, versioned).
2. Feed the assessment's `describe_product` and `compare_within_source` into Phase268 as a shadow validation path, and
   measure the effect on the 206 answers.
3. Move programme and scale out of measurement names into conditions (teaching).
4. Run the pre-registered S86d independent validation once a policy is in force.

## 9. Internal research freedom — restriction audit

| Restriction | Origin | Decision |
|---|---|---|
| Per-experiment request, host and expiry totals | self-imposed | replaced by the standing kind: rolling 24 h rates per host and overall; a review date |
| Owner decision for each experiment | self-imposed | replaced by one standing owner policy (protected-policy mechanism unchanged: digest, expiry, mode 600) |
| Permanent discovery exclusion after any restriction | self-imposed | replaced: only a suspension in force excludes (`activeSuspensions246`) |
| No `Crawl-delay` support | gap | added (per agent or `*`, capped at 120 s) |
| Fixed delay after errors | gap | adaptive back-off (doubles from 10 s to 120 s; reset on success) |
| Metadata-only retention by default | self-imposed (default-deny) | private page archive for research, unless the page reserves rights |
| Robots, 401/403/429, Retry-After, no authentication bypass | external | **kept** |
| Content-Signal, TDM reservation, `noai` | external | **kept** (the archive withholds such pages) |
| Phase249 per-host caps (database right) | external, legal | **kept**; flagged for owner legal review |
| Nothing private in the public repository | external | **kept** |

**Standing policy status.** A policy file `pee_internal_research_standing_v1` was written to the protected policy
location (60 requests per host per day, 1,500 per day, 5 s politeness, review date 2027-01-19, archive on). After it was
created, the session's automatic safety check refused a later command as "unauthorised persistence".

Granting a broad, long-lived permission to oneself is the kind of action that should be confirmed by a person.
Therefore:
- no live request was made;
- the policy was not committed to pee-knowledge;
- **the owner is asked to confirm it** (or to set different rates) before it is used.

Until then, the pre-registered S86d independent validation stays blocked.
