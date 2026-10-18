# Restriction audit: every filter from fetch to use (WD-A, 2026-10-18)

## Brief and method

**Owner brief (2026-10-18, Italian).** Examine critically every inherited filter or condition that can block
acquisition, reading, extraction, linking or use. Distinguish four kinds of restriction:
- truly mandatory constraints;
- technical problems;
- empirically justified criteria;
- prudential restrictions we introduced.

Verbatim: "Non presumere che una regola precedente sia corretta semplicemente perché esiste."

**Same brief, verbatim:** "non autorizzerei né una cancellazione della cronologia né una nuova politica rigida basata su
questa analisi preliminare. Lascerei intatti i materiali." This audit therefore:
- changes no retention or access rule;
- deletes nothing;
- proposes, for each filter, a verdict for the owner or for later steps.

**Method.**
1. A read-only code map of every stage, with file:line references, produced by a separate exploration pass. Its main
   claims were checked at the cited lines.
2. Measured losses on the 69 retained development pages (spent, zero HTTP). The 7 pages of the KV experiment were
   counted for location only; their non-table content was not read and stays untouched for evaluation (WD-D).
3. Each filter classified as one of:

   | Class | Meaning |
   |---|---|
   | **O** | obligation (law, access control, owner rule) |
   | **T** | technical limit |
   | **E** | empirically justified: a measured error it prevents is on record |
   | **P** | our own prudence: no measured risk on record |

## 1. The funnel on the development pages (measured)

**Where the quantities are.** These are quantities with a unit known to the knowledge pack, on 69 unique pages.

| Location | Quantities | Reaches the knowledge layer |
|---|---|---|
| HTML table cells (1G observations) | 1,089 | yes: 813 typed |
| Paragraphs (`p`) | 953 | no |
| List items (`li`) | 213 | no |
| `blockquote`, `figcaption` | 3 | no |
| Other text: `div` / `span` cards, spec grids, labels | 313 | no |
| **Total** | **≈ 2,570** | **≈ 32% read, all of it from tables** |

- 39 of the 69 pages have quantities only outside tables.
- On the 7 KV pages: 49 in tables against about 384 outside. Two client-rendered pages ship their data only in script
  payloads: a Next.js flight payload and JSON-LD.

**What the live path keeps from the same pages** (the readers that persist to the store):

| Live reader | Items | Note |
|---|---|---|
| Phase245 spec declarations, quantity kinds | 165 (of 350 facts) | 196 more held back as ambiguous |
| Phase225/265 test leads | 25 (all pass the screen) | 19 of them `page_context_unverified` |
| Phase226 test tables | 0 | no page meets its structural gate |
| Phase270 comparative results | 97 | duration, energy and cost only |
| Phase269 qualitative codes | 158 produced | 10 `noise` codes are always refused at ingest |

So about 290 quantity items reach the store from about 2,570 printed: **about 11%**.

**Interpretation inside prose** (feasibility on the development pages: the same knowledge, the sentence as context):

| Outcome | Count |
|---|---|
| Quantities in `p`/`li` | 1,169 |
| Kind established | 1,113 (95%) |
| Kind ambiguous: dB(A) pressure or power | 46 |
| Metric identified | 85 (7%) |
| Conditions read | 24 |

The obstacle in prose is attribution (which product, which test, which metric), not the units.

## 2. Findings that change something (ranked by measured cost)

### F1. The knowledge layer reads tables only (T, architectural)

- Cost: about 68% of quantities are never offered to the knowledge, scope and comparability rules.
- No rule requires this. It is the order in which components were built (1E/1F/1G were table work).
- **Verdict: replace.** Use one segment model for every location, read with the same knowledge and rules (WD-B).

### F2. Live readers each keep their own unit lexicon and cues (T, recurring)

- Phase245, Phase225, Phase226, Phase265, Phase270 and Phase249 each define units separately. Examples:
  - Phase225 has no nits, Hz, m³/h, cfm or ppm;
  - Phase265's screen refuses units it does not list (`unit_not_recognised`);
  - none of them uses the typed knowledge pack.
- This is principle 4 (recurring failure): the GK pack was built to end this, but only the shadow layer and the request
  side consult it.
- **Verdict: replace, in steps.** First the new segment reader uses the pack (WD-B). The live readers' lexicons are
  retired only after an equivalence run.

### F3. A sentence headline becomes the product name in Phase245 (defect; the conflict check is E)

- On roundup pages with no structured product, the single h1 ("I've selected the top dehumidifiers – …") is taken as
  the main product.
- Every product card is then attributed to it, and the conflict check (correctly) blocks them.
- Measured: 116 spec values on 4 distinct roundup pages, 167 counting the rehearsal copies. Each card carries 8
  properties of a different product.
- The same defect was fixed three times elsewhere, but not here:
  - `document_semantics.ts:151`;
  - `phase265_test_measurements.ts:160` (plan only);
  - `nameShapedPrincipal1G`.
- **Verdict:**
  - the conflict check stays: it prevented 116 wrong attributions;
  - the name rule is a defect, to fix with one shared "name-shaped" test;
  - the cards should be attributed to the product their section heading or card names (the segment model's product
    scope, WD-B).

  A live-extractor change needs an equivalence run on a store copy first, so it is proposed and not applied here.

### F4. Phase226 test tables: structural gate never met (P)

- The gate requires:
  - `thead` and `tbody`, with no spans and at most 8 cells;
  - a first header from a fixed word list;
  - a parenthesised unit in every header;
  - a row header exactly equal to the page product;
  - a lead paragraph with "we tested" within 280 characters.
- 0 results on 69 pages. No measured error motivated the conjunction; each part was a guard against a hypothetical
  misreading.
- **Verdict: superseded by 1G.** 1G reads the same tables with role hypotheses and explicit ambiguity. Keep Phase226
  only for reproduction.

### F5. Readers that produce and a store that refuses (P, inconsistent)

- **Noise codes.** Phase269 emits `noise`, but the store accepts only the 5 cooking outcomes, so 10 observations are
  produced and refused.
- **Table test leads.** Leads with `structured_table_measurement_term` (Step 1D-A2) are refused by the screen *by
  design*: shadow work must not reach the store.
- **Verdict:**
  - noise: decide deliberately. The acoustic knowledge (K9) can now type it, so it should be kept with its kind and
    justification;
  - table leads: keep refused until the segment reader replaces them.

### F6. Phase225 probe needs a first-person method cue *and* a numeric-report cue in the same block (E, partly)

- **Where it is justified.** It prevents declared values being read as test results. This is the phase268 lesson, and
  the separation of evidence types is an owner rule.
- **What it loses.** Results in a "How we test" section stated impersonally ("Extraction: 12 L/day at 30 °C"). These
  are covered by the document protocol (K9 rules C1–C5), which says *where* the method statement applies instead of
  requiring it in the same block.
- **Verdict: generalise.** The evidence class of a segment comes from the scope of the document's method statements
  (rules), not from a cue in the same block.

### F7. Phase245 excludes whole regions: "reviews", "related", outside `<main>`, item listings (E for declarations)

- **Where it is justified.** For *manufacturer declarations*, review and related-product regions are other products'
  data or user opinion. The exclusion prevented misattribution in Phase245–247.
- **Where it is wrong.** For an independent review site, the "review" region *is* the evidence. The same exclusion
  applied to the segment model would drop it.
- **Verdict: keep for declarations.** In the segment model, region type becomes a scope fact (boilerplate, other
  product, page subject), not a deletion.

### F8. Values in prose dropped by Phase245 (E for declarations)

- Values over 160 characters or sentence-like are discarded as "prose" (`phase245_value_normalizer.ts:72`).
- Correct for a spec value. For evidence it removes the medium in which reviewers report.
- **Verdict:**
  - keep in Phase245 (declarations);
  - prose is read by the segment reader, with relation extraction.

### F9. Client-rendered and embedded data invisible (T)

- Every reader skips `script`, `template` and `noscript`. No reader parses `__NEXT_DATA__`, `self.__next_f` flight
  data or `application/json`.
- On KV, the two Bosch pages hold their spec sheets only there.
- **Verdict: add.** Read embedded payloads as segments with an `embedded` role and the same provenance. Do not render
  with a browser except as an oracle.

### F10. Validation path admits one publisher and one measurand (P, explicitly provisional)

- `VALIDATION_POLICY268` qualifies only expertreviews.co.uk and `appliance_energy_one_hour_empty`.
- It is labelled `proposed_not_authorised`, as a first authentic path.
- **Verdict: keep, as recorded owner scope.** Widening it is a ranking decision, out of this brief: ranking is "in
  secondo piano".

## 3. Full classification

The table below covers each filter class; file:line references are in the code map (§5). "Kept" means the safeguard is
justified as it stands.

| Stage | Filter | Class | Verdict |
|---|---|---|---|
| Fetch | robots honoured; unknown robots = deny; 401/403/429 stop the host; Retry-After honoured; no redirect across sites | O | kept |
| Fetch | Content-Signal `ai-input=no`, `tdm-reservation`, `noai` meta | O (art. 70-quater, DSM 4(3)) | kept. **Gaps:** the TDM response header and `X-Robots-Tag` are not checked; recovered-page ingest passes no reservations (`phase246-knowledge.mjs:97`). Both are **defects**: they under-protect |
| Fetch | https on port 443 only, public IPv4 only, no userinfo, odd encodings refused | P (SSRF security) | kept; IDN hosts excluded is a small cost, not measured |
| Fetch | no compressed responses; UTF-8 decode regardless of charset | T | the charset is a **defect for non-UTF-8 pages** (none among the retained pages); the compression refusal costs bandwidth only |
| Fetch | content type not checked before saving `.html` | defect | check it (a PDF would be parsed as HTML) |
| Fetch | page caps: 3 MB live, 1 MB legacy and quarantine | T, inconsistent | unify, when the legacy path is next used |
| Fetch | owner budgets (requests, hosts, delay ≥ 4 s) | O (owner) | kept |
| Read | 250k-node, 400-depth parse budget, silent truncation | T | kept; the truncation is flagged |
| Read | `textBlocks225`: only `p`/`li`/`td`/`th`/`h*`; blocks over 1,400 characters dropped; 380-block cap | T / P | superseded by the segment model; `div` text is invisible to the probe (313 quantities) |
| Read | hidden and `display:none` content kept (closed tabs) | E | kept: accordions are content |
| Extract | Phase245 region exclusions, listing exclusion, `<main>` restriction | E for declarations | kept there; scope facts in the segment model (F7) |
| Extract | Phase245 prose values discarded | E for declarations | kept there (F8) |
| Extract | Phase245 h1 as name without a name-shape check | defect | F3 |
| Extract | Phase245 blocking flags (conflict, compound, per-variant, multiple values) | E | kept: they prevent wrong attribution; the cause upstream is fixed instead (F3) |
| Extract | Phase225 cue conjunction | E / P | F6 |
| Extract | Phase225/226/265/270 separate unit lexicons | T, recurring | F2 |
| Extract | Phase226 structural gate | P | F4 |
| Extract | Phase270: 8 cooking classes; duration, energy and cost only | P (scope of the first pilot) | generalise through the segment model and the knowledge pack's kinds |
| Extract | Phase269: 10 dishes, 6 outcomes, first-person cooking gate | P (pilot scope) | generalise: qualitative statements become segments with a subject, aspect, polarity and conditions, read with category teaching (WD-B, first step) |
| Link | exact-identity product keys, no merge on similar names | O (owner rule) | kept |
| Link | test leads linked only by exact name equality | E | kept for persistence; the segment reader adds product scope by section and card as a *candidate* attribution, never a merge |
| Retain | per-class host caps; measurement kinds only for test publishers | O-derived (database right), numbers P | kept; the legal review (`retention-policy-review.md`) found them proportionate |
| Retain | qualitative codes only, no excerpts | P | over-strict (legal review §4); the owner decides on R2. Not changed |
| Retain | store accepts only 5 cooking outcome codes | P, inconsistent | F5 |
| Use | 9 spec criteria in Phase249 decisions; 2% disagreement threshold | P / E | outside this brief (ranking second) |
| Use | Phase268 validation: one publisher, one measurand | P (explicit) | F10 |

## 4. Principles behind the verdicts (candidates, to be tested)

- **R-1. A filter is about a decision, not about the text.**
  - A region, a prose value or a missing cue is a reason to withhold *a particular conclusion*: a declaration, a test
    result, an attribution.
  - It is not a reason to stop reading. Readers should state scope facts; rules decide which conclusion each fact
    blocks.
  - This is what the KR scope programs already do for tables.
  - Counterexample to test: a cookie banner with "2 years" is not evidence of anything. Its scope fact
    (`boilerplate`) must block every conclusion, so the rule is not "read everything and believe it".
- **R-2. One knowledge, one rule set, many readers.**
  - A reader's job is to segment and locate: what was printed, where, next to what.
  - Interpretation (kind, metric, conditions, evidence class, product, comparability) belongs to the shared knowledge
    and rules.
  - F2, F4 and F6 all come from interpretation done inside readers.
- **R-3. Fix the cause upstream, keep the guard downstream.**
  - In F3 the guard (conflict) worked; the cause (a sentence taken as a name) did not.
  - Relaxing the guard would have created 116 wrong attributions.

## 5. Code map

The stage-by-stage map (acquisition, document model, readers, attribution, retention, use, and which readers feed the
knowledge layer) was produced read-only on 2026-10-18. It is summarised in the table above. The claims checked at the
cited lines:
- `phase246_knowledge_store.ts:681` (noise refused);
- `phase265_test_measurements.ts:233` (table leads refused, by design, documented at :151-153);
- `phase246-live-wave.mjs:184` (no content-type check);
- `phase246-knowledge.mjs:97` (no reservations on recovered ingest);
- `phase268_evidence_validation.ts:67`;
- `phase226_transient_test_tables.ts:66`.

Measurement scripts: `scripts/wd-funnel.mjs` and `scripts/wd-live-yield.mjs` (counts only; no page text in outputs).
