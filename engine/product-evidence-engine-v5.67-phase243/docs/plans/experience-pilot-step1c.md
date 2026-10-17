# Continuous scientific learning — Step 1C: structural attribution, ambiguity preservation and an untouched test

This is the owner's Step 1C brief of 2026-10-17. It follows Step 1B (`docs/plans/experience-pilot-step1b.md`, d852282) and
supersedes no report.

**Constraints observed:**
- **HTTP:** 7 of the 18 authorised requests were used.
- **Not changed:** production extraction, ranking, schema, retention and signing.
- **Candidate:** evaluation only.
- **Tests:** focused tests only.

**Tiers, kept apart throughout:**
- **T1:** synthetic fixtures.
- **Dev:** previously examined pages and EX-01 – EX-24.
- **T2-untouched:** 5 new pages, first run.
- **Production:** none.

## 0. Outcome

1. **By the pre-registered decision rule the candidate is promising** (§4, rule frozen before any request):
   - **Confidently wrong items:** 14 for the candidate, against 70 for the tuned build and 65 for the frozen one.
   - **New confidently wrong vs the tuned build:** none.
   - **Successes:** 7, against 4 for ambiguity-only withholding and 4 for the tuned build.
2. **Most of the safety gain comes from one rule.** The candidate refuses to treat a headline sentence as a product.
   - The tuned and frozen builds bound values to the page headline: 64 of the tuned build's 70 wrong items (63 on two
     roundup pages, 1 on a TV page).
   - The candidate leaves those values unresolved. That is safe, but they are not usable.
3. **Usefulness is still low.**
   - Only 7 of the 76 values that any arm read get a correct subject; 55 are retained as unresolved.
   - The main limit is not grammar. The shared product-mention detector does not recognise products named by a bare code
     ("the B5's", "the QN80H"), by a short series name ("Bravia 7 II") or without a model code.
4. **On the three TV comparison pages, where grammar decides:**
   - the candidate scores 5 correct, 1 wrong and 7 unresolved;
   - the tuned build scores 4 correct, 7 wrong and 2 unresolved;
   - its one wrong value and its one lost value come from two identified gaps (§5).
5. **Multi-subject handling is untested on new pages.** The blind gold contains no value stated for several products.
6. **Decision: further testing, not production integration** (§9).

## 1. Implementation and frozen protocol

**Candidate** (`src/experience_attribution_candidate.ts`, evaluation only). It re-decides each lead's subject in a fixed
precedence:
- **R1, explicit local structure:**
  - the comparison-table column;
  - a value in parentheses directly after a product, including a product named once with a model code, or a
    "Product: value" label;
  - a value owned by an unnamed referent ("its predecessor's") is left unresolved;
  - a possessive ("X's … value");
  - "X and its … value".
- **R1e, multi-subject:** "both" with exactly two named products gives a multi-subject result. "Both" in comparison wording
  without two named products is left unresolved with its candidates. "Both" about non-products is ignored.
- **R2, grammatical subject:** the only product in the clause that is not in an object position (than, against, by, like,
  prepositions, coordination). This covers fronted values, and an elided subject inherits the previous clause's subject.
- **R3, no competing evidence:**
  - a pronoun takes the previous sentence's subject in the same block;
  - a non-comparative section heading naming one product;
  - otherwise the document's main product, only when the section names no competing product.
  A headline-like page name is never an identity.
- **R4, otherwise unresolved,** recording candidate subjects, the reason and the evidence that would resolve it.

Mentions are prepared first: technical codes and standards (4K, HEPA 14, MERV 13) are dropped, and truncated names are
repaired ("Quiet BP06" becomes "Dyson Big+Quiet BP06").

**Design material.** The candidate was designed on development material only:
- the Phase272 spent untouched set;
- 3 development pages;
- EX-01 – EX-24.

Development numbers (tuned, never untouched):

| Material | Arm | Correct | Wrong | Unresolved |
|---|---|---|---|---|
| Spent set | A, frozen | 48 | 22 | 0 |
| Spent set | B, tuned | 54 | 16 | 0 |
| Spent set | C, candidate | 60 | 8 | 2 |
| Development pages | B, tuned | 18 | 5 | 1 |
| Development pages | C, candidate | 24 | 0 | 0 |

**Frozen before any Step 1C request** (commit fccbd42):
- **Protocol** (`evaluation/step1c/protocol.json`): four arms, scoring, states, source selection, gold rules and the
  decision rule.
  - **Arms:** A, frozen c206c9a; B, tuned; C, candidate; D, the Step 1B ambiguity-only ablation.
- **Code hashes** (`evaluation/step1c/freeze.sha256`): 19 files, including both builds' readers. The run refuses if any
  of them changes.
- **Scorer** (`src/experience_attribution_scoring.ts`):
  - per-item classes: correct, correct_multi, false_identity_match, unresolved, wrong_product, missing; for undetermined
    items, correctly_unresolved, unsupported_assignment, missing;
  - per-lead classes, so that a wrong lead is not hidden behind a correct one;
  - identity uses the Phase272 shared-token rule plus a brand check;
  - unresolved never counts as correct.
- **Knowledge state:** snapshot `b69a5f8c…`. The plan digests must equal `plans-frozen-known.json`, and they did.
- **Rehearsal:** an offline rehearsal on two spent pages exercised render, gold freeze and run before any request.

## 2. New sources, eligibility and budget

| Tag | Publisher | Category | Products with values |
|---|---|---|---|
| s1c_tv_trd_affordable_oled3 | TechRadar | TV | 3 |
| s1c_tv_trd_rgb_vs_miniled | TechRadar | TV | 2 |
| s1c_tv_trd_bravia7ii_r95h | TechRadar | TV | 2 |
| s1c_ap_hf_small | HouseFresh | air purifier (roundup) | 6 |
| s1c_ap_hf_bedroom | HouseFresh | air purifier (roundup) | 6 |

**Selection** (`evaluation/step1c/source-selection.json`):
- pages were chosen from search titles and URLs only;
- every selected URL is absent from all 3,191 URLs used earlier;
- 7 candidates were excluded because their search summaries exposed results.
- One of those exposures was caused by a page-specific search. After it, no further targeted searches were made.

**Budget:** 7 of 18 requests (2 robots, 5 pages), on 2 of the 5 permitted hosts. All returned 200, with no redirects and
no stops. There were no `noai`, TDM or ai-input markers and no active paywall; the "paywall" strings are CSS templates.

**Limits of the source set:**
- only 2 categories and 2 publishers, the protocol minimum;
- no air-fryer or dishwasher comparison with measured rival results was found without exposure;
- the publishers are open UK and US outlets, not laboratories.

## 3. Gold and its independence

**Annotator.** A separate Claude agent with a fresh context. It received only the plain-text renderings and the frozen
rules. It saw no code, no output, no case and no candidate rule. This is separation, not independence: the annotator is
Claude.

**Gold** (private; hash `4b227682…`, frozen in cf3f14a before any arm ran):
- 102 values, all `exact`: no shared and no undetermined values;
- 49 values carry page-established naming variants;
- 3 values use units that no arm reads ($/year, a PM2.5 level, Delta-E). They are missing equally in every arm.

**The annotator's recorded judgement calls:**
- AHAM CADR figures are excluded as certification figures;
- a cost built from measured kWh is included;
- some rounded repeats are kept as separate values;
- one unit-less value is recorded as nits;
- one page label conflict is kept as two products.

## 4. First-run results (T2-untouched; committed unchanged as 11331c4)

102 gold items, 76 of them read by at least one arm.

| Arm | Correct | Confidently wrong | Unresolved | Missing |
|---|---|---|---|---|
| A, frozen Phase272 | 0 | 65 | 11 | 26 |
| B, tuned | 4 | 70 | 2 | 26 |
| **C, candidate** | **7** | **14** (1 wrong product + 13 false identity) | **55** | 26 |
| D, ambiguity-only | 4 | 68 | 4 | 26 |

**Per document, candidate (C) vs tuned (B):**

| Document | C correct / wrong / unresolved | B correct / wrong / unresolved |
|---|---|---|
| affordable OLED ×3 | 1 / 1 / 0 | 1 / 1 / 0 |
| RGB vs mini-LED | 2 / 0 / 4 | 1 / 3 / 2 |
| Bravia 7 II vs R95H | 2 / 0 / 3 | 2 / 3 / 0 |
| small purifiers (roundup) | 0 / 13 (false identity) / 26 | 0 / 39 / 0 |
| bedroom purifiers (roundup) | 2 / 0 / 22 | 0 / 24 / 0 |

**Transitions:**
- **B → C:** 56 wrong removed; 4 correct gained; 1 correct lost; 0 new confidently wrong.
- **A → C:** 51 wrong removed; 7 correct gained; 0 correct lost.
- **D → C:** 54 wrong removed; 4 correct gained; 1 lost.

**Decision-rule check (frozen):**
- (1) C's 14 confidently wrong is below both A's 65 and B's 70: met.
- (2) No new confidently wrong item vs B: met.
- (3) C's 7 successes are at least D's 4: met.
- (4) C's 7 successes are at least B's 4 minus 1: met.
- **Inconclusive triggers:** none. There are 76 attributable items, and the difference is not marginal.
- **Verdict: promising.**

## 5. Changes in correct, wrong, unresolved and missing evidence

**Where wrong became unresolved.**
- In arms A and B, every roundup value was bound to the page headline ("The only small air purifiers we recommend …",
  "The air purifiers for the bedroom …"), and one value on a TV page was bound to the article headline.
- The candidate's headline rule (Step 1A lesson EX-08) and R4 keep these as unresolved observations with candidates and
  a reason. The reason in all 71 unresolved leads is "no product established by structure, grammar or section".

**Why so few become correct.** The section-heading rule (R3b) bound 21 leads. Most roundup sections and sentences name
products the shared mention detector cannot see: products without a digit-bearing model code, or products named only once
with their brand. Their values therefore stay unresolved. They are not wrong.

**The 13 false-identity items** are one product named without its brand ("Airmega 100" for "Coway Airmega 100"), bound
by R3b.
- The frozen brand check requires the gold brand to be present, so they count as confidently wrong.
- On inspection (post-hoc, developer audit, not a re-score) the name is incomplete rather than contradictory. The defect
  is in the name the shared mention detector reports.

**TV pages, the attribution-relevant test** (17 items):
- **Gains:** C corrects the two Hisense UR8 values that B sent to a junk mention ("Windows 10"), by grammatical subject.
- **Removed wrongs:** C stops B binding three Bravia 7 II values to the R95H, and a QN80H value to the UR8. They are
  unresolved because "Bravia 7 II" and the bare "QN80H" are not recognised mentions.
- **The one wrong (t1-02):** "It hit 777 nits … to the B5's 668 nits". The bare "B5" is not a recognised mention, so the
  possessive rule could not fire, and the pronoun rule (R3c) gave the value to the sentence subject.
- **The one lost (t2-06):** "with the UR8 clocking in at … 767 nits". "With" is in the object list, so the absolute
  construction lost its subject. The value became unresolved; B had it right.

**Missing (26, identical in every arm):** values never read by any arm. Attribution cannot change recall. This includes
the 3 values whose units are not read.

## 6. Multi-subject and identity-variant findings

- **Multi-subject:**
  - The new gold has no shared values, so R1e is unvalidated on new pages.
  - In development, "both" about foods was correctly ignored, and EX-24 ("both … 174 cfm" with an unnamed second product)
    is left unresolved by the rule.
  - The rule's precision and recall on real multi-subject statements are unknown.
- **Identity variants:**
  - 49 gold values carry page-established variants (short names such as "Coway 100", "Winix A230/A231").
  - The scorer accepted variants as intended.
  - The false-identity class caught one systematic naming defect (the dropped brand). This is a finding about the mention
    detector, not about the attribution rules.

## 7. Experience replay and metamorphic results

**Replay with the candidate** (`evaluation/experience/replay-s1{a,b}-candidate-1c.json`; development material, regression
check only):

| | Preserved | Lost | Corrected | Persistent | Regression |
|---|---|---|---|---|---|
| EX-01 – EX-18 | 9 | 0 | 3 | 6 | no |
| EX-19 – EX-24 | 1 | 0 | 4 | 1 | no |

- **Preserved:** EX-05 and EX-19, the Step 1B regressions.
- **Wrong to unresolved:** EX-01 and EX-08.
- **Corrected:** EX-02, EX-03, EX-20 – EX-23.
- **Persistent:** EX-24. The observer picks a same-value lead, and the case carries the allocation flag.

**Metamorphic relations** (`evaluation/experience/metamorphic-candidate-1c.json`, T1):
- **Hold:** table-row reordering, irrelevant context (2 variants), page-product change, and the comparative oracle that
  the tuned build fails.
- **Violated:** column swap. This is reader recall, unchanged by attribution.

## 8. Lessons

**Supported:**
- *A sentence-like page name is not an identity.* First derived from EX-08; on new pages it prevented 64 wrong items.
- *Grammatical subject over nearest name.* EX-05 and EX-19; the TV pages (UR8, R95H/Bravia); the MR3 oracle.
- *Unresolved with a reason is a safe default.* No new confidently wrong item on new pages.

**Contradicted or limited:**
- *The pronoun antecedent rule is not safe* when a local possessive names an unrecognised product (t1-02).
- *"With" is not always an object marker* ("with the X clocking in at …", t2-06).
- *Brand presence is too strict as an identity test* for brand-dropped names. Brand contradiction would be the correct
  test; this is noted, not changed.

**Provisional:**
- multi-subject "both" handling (no new-page evidence);
- section-heading binding on roundups (21 uses, mostly limited by the mention detector);
- name repair (only development evidence).

None is promoted. Each stays linked to its cases and gold ids in this report, with maturity "untouched first run, 5 pages"
or "development".

## 9. Recommendation for the candidate

**Further testing; no production integration and no rejection.**
- **Safety:** it consistently converts confident errors into explicit uncertainty, without new errors.
- **Usefulness:** low, because the product inventory it reasons over is incomplete.
- **Scale:** the untouched evidence is 5 pages from 2 publishers, so a production change would be premature.

## 10. Recommended next bounded step (not started)

**Step 1D: document product inventory for attribution.**

**Change.** One evaluation-only inventory per document. From the document's own text, it records:
- bare-code and short-series references tied to their full name ("the B5" → "LG B5", "Bravia 7 II");
- brand-dropped names;
- products named without a model code in headings.

The frozen candidate then uses the inventory. The two grammar gaps (the pronoun after a possessive, and "with … -ing") are
fixed on development material only.

**Validation:**
- frozen C vs C + inventory on 4–6 new untouched comparison pages, one first run, with blind gold;
- replay of EX-01 – EX-24 with zero lost successes;
- the metamorphic relations;
- new experience cases (EX-25+) from the Step 1C pages, which are now development material.

**Stopping and success:**
- stop and report if the inventory adds any new confidently wrong item;
- success requires at least 10 more correct items than C on the new pages, with no rise in confidently wrong items.

**Cost and dependencies:**
- **Effort:** M, about one session plus blind annotation.
- **HTTP:** 11 Step 1C requests remain until 2026-10-24, but they are authorised only for this experiment. Using them for
  Step 1D needs the owner's confirmation, or a new authorisation.
- **Pages:** preferably including real "both" statements and a third publisher.

## 11. Contribution to the permanent mission

**What the step did:**
- **Lessons tested:** it turned lessons from earlier failures (EX-05, EX-08, EX-19) into general, testable rules.
- **Untouched test:** it ran those rules on pages no rule had seen.
- **Uncertainty:** it kept uncertainty explicit: 55 values are retained with candidates and the evidence needed, in the
  evaluation record.
- **Limit found:** it identified the next limiting capability, the product inventory, by measurement rather than
  assumption.

**What it did not do:** it did not make PEE learn by itself, and it does not show any production capability.

## Publication-audit triage (39 whole-tree findings; existing information only)

All 39 are rule `product_bound_declared_value`, and all predate Step 1A. None is in a Step 1A–1C file, and none blocks this
step.

| Class | n | Files | Severity |
|---|---|---|---|
| Probable false positive: standards or consumer wording | 3 | TEACHING-PLAN (ITU H.870 row); phase252 teaching (WHO dose limits); phase270 request text ("20 bar vs 15 bar") | none |
| Probable false positive: generic synthetic fixtures | 16 | tests phase245 (3), phase246 (1), phase247 (3), phase252_identity (9; "20 Litre Microwave Oven" 800/700 W) | none–low (to confirm against the store) |
| Genuine historical: pre-Phase253 evaluation outputs with extracted specifications | 13 | evaluation/phase245, 247, 248, 249 results and gold | low (factual specification values of public pages; no text) |
| Genuine historical: one Phase255 case in report, test and gold | 6 | Phase255 report (3), test (2), reuse-gold (1) | low |
| Genuine historical: a specification in a code comment | 1 | phase245_value_normalizer | low |

**Remediation** would need an owner decision on rewriting committed history or redacting current files. It is deferred,
as the brief instructs.

## Reproduce

Run from the engine directory, after `npx tsc -p tsconfig.json`. A first run is never overwritten.

```
node scripts/step1c-attribution-eval.mjs run <new-label>
node scripts/experience-replay.mjs <label> --set step1a|step1b --policy constrained_candidate_1c
node scripts/experience-metamorphic.mjs <label> --policy constrained_candidate_1c
node --test dist/tests/experience_attribution_candidate.test.js dist/tests/experience_attribution_scoring.test.js
```
