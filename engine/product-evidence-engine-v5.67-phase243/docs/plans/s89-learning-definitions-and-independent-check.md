# S89 — Owner review of S88 applied: corrected principles, a definition-learning mechanism, and a check on never-seen publishers

**Roadmap step.** R3 / R3-C (continuation; owner review verbatim in `owner-review-s88-2026-10-20.md`). R3 is **not**
closed.

**Scope.**
- Shadow only. No store migration, no ranking, no operational activation.
- Pages were fetched under the standing internal research policy:
  - robots-checked, with no reservations on any page;
  - 45 requests: 32 pages fetched, 1 URL error of mine (404), 2 Digital Trends challenge pages (HTTP 202, not retried,
    not bypassed).

## 1. What changed

| Change | Why (owner review, S88 evidence) | Kind |
|---|---|---|
| The refuted "profile licence" is off by default; `profileLicense: true` only reproduces S88 | It caused most of the 56 S88 false attributions | inference (removed) |
| **Known objects** in the definitions: video signal, product body, commerce, time span, display | "120 Hz" of an HDMI signal is not an audio response. A value naming another concept's object is not this property's (I-ADOPT object of interest) | knowledge |
| **Plausible SI ranges** per property (SHACL-style value constraint) | A latency is not measured in years | knowledge |
| **Nearest-quantity attachment.** A value owns the words up to the clause break; neighbours are quantities (QK), not digits | "100% pet hair pickup and 0% tangling": "pickup" belongs to 100% | inference (DocRED/SciREX-style locality) |
| **Context alone needs the object in the value's own words** | Hair length, mop lift and pile depth were attributed from paragraph words | inference |
| **Evidence role and subject slots**, kept apart from the property (S86c structural classifier) | "Recognising the role of the evidence" | interpretation |
| **Definition learning** (`src/definition_learning.ts`), with candidate-concept proposals for recurring unexplained phrases (never used for attribution). Details below. | "The general mechanism that builds, verifies, corrects and applies any definition" | learning |

**How definition learning works:**
- Seed attributions are values attributed through a term in the value's own words.
- Their adjacent words become candidate terms.
- A term is accepted only if it recurs across at least two independent publishers and at least two documents, with purity
  ≥ 0.6, and is not a known object.
- An accepted term becomes `supported` and is merged into the definitions. Through them it reaches every consumer: reading
  plan, attribution, interpretation and comparability. The S89 propagation test shows this.

**Correction of S88.** The rtings pages are paywalled for visitors (`triggered_paywall`): they contain no results in text
or in scripts. The S88 diagnosis "embedded JSON not read" was wrong; a dated correction note is in the S88 report. A census
of 32 pages found no measurement that exists only in embedded data. **No structured-data reader was built**, because the
evidence does not show a need for it.

## 2. Protocol

- `evaluation/s89/preregistration.json` was committed before any page was fetched. It splits publishers in advance:
  - **learn set:** Vacuum Wars, TechRadar, What Hi-Fi, Tom's Guide, Trusted Reviews;
  - **check set:** T3, Homes & Gardens, Expert Reviews, Sound & Vision, Digital Trends. None of these was seen in S88 or
    used for learning.
- The learned layer was frozen before the check reference existed: `learned-layer-freeze.json`.
- A blind Claude-agent reference of 341 values was sealed by hash before any arm ran: `annotation-freeze.json`. The
  annotator was interrupted by a container restart and resumed from its transcript before any arm ran.
- The S88 arm runs S88's own code (commit 220fdff), not an imitation.

## 3. Results — first run on never-seen publishers (unchanged; `evaluation/s89/check-firstrun-*.json`)

113 values attribute a defined property and 228 do not.

| Arm | Correct | Wrong | Abstained | False attributions (of 228) | Precision of attributions |
|---|---|---|---|---|---|
| S88 code (pd.2 + profile licence) | 88 | 9 | 16 | **146** | 36% |
| unit kind only | 82 | 6 | 25 | 139 | 36% |
| **S89 (pd.3, principles)** | **48** | **4** | **61** | **8** | **80%** |
| S89 + learned layer | = S89 | | | | (the frozen layer had 0 terms) |

By publisher (S89 arm), recall of the reference properties:

| Publisher | Category | Recall |
|---|---|---|
| Sound & Vision | soundbars | 15/28 |
| Homes & Gardens | robot floor cleaners | 15/41 |
| T3 | robot floor cleaners | 8/22 |
| Expert Reviews | robot floor cleaners | 9/18 |
| Expert Reviews | soundbars | 0/3 |

**Worst group:** Homes & Gardens robots, with 25 abstentions.

**Other slots (S89 arm):**

| Slot | Result | Trivial baseline |
|---|---|---|
| Evidence role | **47/113** | "all measured": 55/113 |
| Subject | 101/113 | "all reviewed product": 100/113 |
| Basis | 46 correct, 6 wrong | — |
| Conditions | 14 of 105 annotated matched | — |

## 4. What the results show

1. **The corrected principles generalise as held-out precision.** False attributions fall from 146 to 8 on publishers never
   seen. This is the first held-out result where the definitions clearly beat the unit-kind baseline, but only on
   precision.
2. **Recall is the problem now: 48 of 113.** The hand-written vocabulary is thin. Spec-box values ("Battery: 216 minutes",
   "Suction: 25,000 Pa") carry the property only in a label the value does not repeat.
3. **Learning did not take off.** On the learn set almost all seed attributions come from one publisher (Vacuum Wars), and
   the soundbar learn pages are buying guides with few measurements. The cross-publisher rule correctly refused
   single-source vocabulary, so nothing was learned.
   - The mechanism works on its test case and is safe against templates.
   - Its yield depends on having several measuring publishers per category, which these categories do not offer in open
     HTML.
4. **Evidence role fails (G3 not met).** 37 declared specifications were read as measured, because the sentence-level
   classifier cannot see that a value sits in a specification box. This is the S87e failure again. It needs document
   structure (spec box / spec table / test section), not knowledge.
5. **Subject is no better than the trivial baseline.** The check pages are mostly single-product reviews.

## 5. Lessons and status

| Lesson | Status |
|---|---|
| Known objects and plausible ranges remove false attributions on unseen publishers | supported (held-out, one run) |
| A unit kind, even inside a category profile, never licenses attribution | supported (held-out twice: S88, S89) |
| Vocabulary learned from one publisher is a template; independent recurrence is required | supported (design + test); yield not yet shown |
| Spec-box role needs document structure | supported (S87e, S89 held-out) |
| The rtings gap is a paywall, not a reader gap | established |

## 6. Next experimental steps (no owner decision needed; all reversible and shadow)

- **Spec-box and table structure for role and label.** A value in a "label: value" box or a table row takes its label
  (the property's term) and its role (declared) from the structure. The table interpreter 1G and the S86c bare-value
  detector already exist, so these should be reused.
- **Learning with more measuring publishers per category.** Wider discovery is allowed under the standing policy.
- **A second independent check** after these changes. The S89 check pages are now spent.

## 7. Files

**Public:**
- `evaluation/s89/*`: preregistration, seals, first-run scores (counts only);
- `scripts/s89-learn.mjs`, `scripts/s89-check.mjs`;
- `src/definition_learning.ts`;
- `tests/s89_definition_learning.test.ts`.

**Private** (`private-eval/s89/`, with text windows hashed in the pee-knowledge copy):
- items;
- the reference;
- runs;
- the learned layers;
- the wave receipt.

No page bytes are committed.
