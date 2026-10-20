# S96 — Typed scientific entities reused by the existing readers

**Roadmap step.** R3 (owner instruction 2026-10-20, verbatim in `owner-instruction-s96-entity-representation-2026-10-20.md`).
**R3 is not closed**, and S96 does not recommend R4. Everything is shadow: no store change, no ranking input, no candidate
promoted, no new dependency, no model.

## Outcome

**Explicit typed knowledge, connected to the existing reader, improves the reading of later unseen documents.** On 13
never-examined pages from 5 publishers PEE had never read, correct property attributions rose from **1 to 28 of 131** values.
Errors grew by one: wrong attributions went from 1 to 2, and false attributions stayed at 2 of 98.

| First run, sealed blind reference (`evaluation/s96/check-firstrun.json`) | Correct (of 131) | Wrong | False (of 98 "none") | Abstained |
|---|---|---|---|---|
| E0: existing definitions pd.5, existing reader | 1 | 1 | 2 | 129 |
| E0+: existing definitions, new reader rule only | 1 | 3 | 2 | 127 |
| **E1: + typed candidates (QK metrics and teaching rows)** | **28** | 2 | 2 | 101 |
| E1m: QK-metric candidates only | 28 | 2 | 2 | 101 |
| E1r: teaching-row candidates only | 1 | 3 | 2 | 127 |
| E2: E1, only candidates validated on earlier documents | 28 | 2 | 2 | 101 |
| E3: hybrid (PPMI choice among unit-kind candidates) | 33 | 4 | 2 | 94 |

**By category:**
- televisions (taught): 0 → 12;
- monitors (unfamiliar: no package, no category profile): 1 → 16.

**Hard pairs** (E1, by the reference concept):

| Hard pair | Result under E1 |
|---|---|
| Input lag | 9 of 13 right |
| Pixel response time | never attributed to input lag or audio latency (7 values) |
| Brightness | 7 of 34 right, 1 wrong |
| Refresh rate | 11 of 77 right |

**Stop rules (preregistered):**

| Stop rule | Outcome |
|---|---|
| Acquisition | **Met positively**: 27 more correct for 1 more error. |
| Validation | E2 = E1. Earlier-document validation removed nothing, so it is not preferred. |
| Hybrid | Met on the check (+5 correct, +2 wrong) but **not on development** (+4 correct, +6 wrong or false). Recorded as **not reliably justified**; not integrated. |
| Qualitative | Met only nominally. Q1 found 24 reference attributes against Q0's 23, and 1 of the 13 sentences whose reference is an acquired attribute. Recorded as **not demonstrated**. |

The 206-request advisory regression changed 0 answers. The full suite passed (4,903 tests).

## 1. Audit: what was explicit, and why S95 failed

PEE already held explicit typed knowledge in three places that did not reach one another:

- **Property definitions (pd.5, 28 properties).** This is the only representation the attribution reader uses, and it has
  no display property.
- **Quantity knowledge (qk.2.4, 19 metrics).** Each metric states its kind, terms, required conditions, non-equivalences,
  defining methods and source. **13 metrics were linked to no definition**, including every display metric (peak
  luminance, input lag, refresh rate, colour gamut coverage, colour error).
- **The owner teaching tables.** Their definition, unit, condition, method and "trap" columns never became definitions.

The store's concepts (`category_items`) state no object, quantity, unit, method or condition. S95 therefore had to
derive its views from names, which is the reason given in S95's own diagnosis.

**The gap was connection, not vectors.** On the spent monitor pages, pd.5 could not attribute a single luminance value
(`no_definition_admits_unit_kind`), although QK typed "peak brightness" as `peak_luminance`.

## 2. The representation (`src/scientific_entities.ts`, `resources/scientific-entities/entity-acquisition.v1.json`)

**Entity classes, each with its own attributes:**

| Class | What it is |
|---|---|
| property | measurable; its kind is corroborated |
| attribute | stated, but its quantity is not corroborated |
| feature | a function or component, never a performance quality |
| method | how a result is obtained |
| instrument | what a result is measured with |

**Attributes of a record:**
- definition;
- quantity: kinds, metrics and units, each typed, ambiguous or unknown;
- object of interest: **always unknown unless a column states it**;
- conditions, typed to a QK axis where possible;
- method;
- what it does not establish (the owner's traps);
- stated relations: `not_equivalent_to` 8, `derived_from` 1, `defined_by` 4;
- provenance: package file and line, or QK source;
- state: `teaching_candidate` or `qk_metric`.

**The corroboration rule.** A row becomes a measurable property only when two independent cells agree on the kind:
- the unit column with the subject or the definition; or
- the subject with the definition.

It1 of the acquisition cut the acquired definitions from 59 to 12. The rejected typings included "Accessibility →
length" and "filter lifetime → mass": one cell alone never invents a kind.

**Census** (`evaluation/s96/entity-census.json`):

| Class | Records |
|---|---|
| teaching rows: property | 32 |
| teaching rows: attribute | 187 |
| teaching rows: method | 146 |
| teaching rows: feature | 104 |
| teaching rows: instrument | 20 |
| QK metric entities | 19 (6 reuse an existing definition) |

**Reuse, with no new store and no new reader:**
- Typed property entities without a definition become **candidate** definitions in the existing pack: 25 in all, 13
  `qkm_*` from QK metrics and 12 `acq_*` from teaching rows.
- Attribute entities with a stated definition and a word name become **candidate aspects** of the existing qualitative
  reader: 59.
- Candidates keep `state: candidate` and `object: unstated`, and carry no decision authority.

**One reader rule (`attributeProperty` option `ownTermObject`, off by default).** When the value's own words contain a
definition's own term ("a 240Hz refresh rate"), the known-object block no longer rejects that definition. On its own,
with pd.5, it changes nothing useful: E0+ has 1 correct and 2 more wrong. Its value is in letting the acquired knowledge
reach the reader.

## 3. Development and freeze

- **Material.** The spent S94 monitor and SSD items (240), scored against a development key written before any run.
- **Reformulations: two.**
  - it1: the reader rule.
  - it2: aspect names must be words. Symbols (TDB, IEF, mAh) and function words ("each") are refused.
- **Development, E1:** 6 → 61 correct, false 4 → 12.
- **Freeze:** `evaluation/s96/freeze.json`, with the digests of the code and knowledge.
- **Amendment 1 (before any annotation).** The legacy regex block reader returns no article text for Home Cinema
  Choice's unclosed `<p>` paragraphs. Each page therefore uses whichever existing reader finds more quantities. This
  defect of the existing reader is recorded as debt.

## 4. Independent check

- **Wave.** 13 pages, 32 requests (robots included) under the standing policy. 229 values (TVs 80, monitors 149) and 120 evaluative sentences.
- **Publishers new to PEE:** Home Cinema Choice and GamesRadar (TVs); Overclock3D, DisplayNinja and PC Gamer (monitors).
  GamesRadar and PC Gamer share Future plc templates with sites read before.
- **Excluded, never bypassed:**
  - AI-agent refusals in robots: AVForums, PCWorld, IGN and Lifewire name ClaudeBot or anthropic-ai.
  - 403 responses: FlatpanelsHD, Guru3D.
  - Robots blocked: Club386.
  - Unsafe address: CNET, ZDNet.
  - Denied redirect: PCMonitors.
  - 404 robots: Monitornerds.
- **Annotation.** Three blind Claude-agent annotators labelled the pages from the union label set. Each label carried its
  stated meaning, and the labels were sorted by id so that their origin was not signalled. The annotations were sealed in
  `evaluation/s96/annotation-freeze.json` before any arm ran.

## 5. What the evidence says

1. **A typed representation that reuses acquired knowledge: yes, for quantities.**
   - Concepts the quantity knowledge had acquired earlier from teaching (QK's display metrics) now read values on
     publishers and categories never seen.
   - This includes an **unfamiliar category** (monitors: 1 → 16).
   - It held without new false attributions, and the hard pairs held: response time is not input lag, and display input
     lag is not audio latency.
2. **The teaching-table rows did not transfer to documents.**
   - E1r equals E0+ on both development and the check. Publishers do not write the owner's terms ("HDR white", "input
     delay"); they write "peak brightness" and "input lag".
   - The rows hold explicit definitions, conditions and traps that now live in typed records. As **reading vocabulary**
     they add nothing; their value has to come from interpretation: conditions, traps, comparability.
3. **Validation on earlier documents** (E2) supported all 15 candidates that ever fire, so it did not discriminate. This
   is a weak validation criterion, not evidence of quality.
4. **Vectors: not justified for identity or attribution.**
   - The hybrid tie-break gains a few values on one set and loses on the other.
   - Together with S94 and S95, this supports the S96 instruction's caveat: the knowledge is too sparse for a meaningful
     embedding experiment. The gap addressed here was representational.
5. **Qualitative attributes fit the same framework structurally, not yet operationally.**
   - Attribute records become candidate aspects of the existing reader.
   - On development they added 12 plausible links (viewing angles, uniformity and blur on monitors). On the check they
     found 1 of the 13 sentences whose reference names an acquired attribute.
   - Publishers' wording ("motion clarity", "local dimming blooming") rarely matches the package names.
6. **The remaining losses** (101 abstentions):
   - **67 are refresh-rate values written without the term.** Examples: "a 27-inch 1440p 240Hz OLED", values in product
     names and menus. Some are blocked by the known-object rule.
   - **About 25 are brightness values** that QK deliberately does not call peak luminance ("full-screen brightness",
     "brightness of 300 nits").
   - Attribution remains bound to a term in the value's own words. **An unfamiliar category has no profile** that would
     let a unit kind alone decide.

## 6. Limits

The following are not shown, so R3 is not satisfied:
- operational generalisation beyond display quantities;
- learning of *new* concepts from documents;
- an object of interest stated for any acquired entity;
- condition-aware comparison using the acquired conditions;
- qualitative reuse.

Other limits:
- One annotator per page; no agreement measure.
- Small samples per hard pair.
- The development key and the check protocol treat test settings differently: settings are `none` in development and
  scored by their quantity in the check.

## Files

- **Public:**
  - code and test: `src/scientific_entities.ts`, `tests/s96_scientific_entities.test.ts`, `scripts/s96-entities.mjs`;
  - `evaluation/s96/`: preregistration, census, development it0-it2, freeze, amendment 1, annotation freeze, first run,
    advisory diff.
- **Private:**
  - `private-eval/s96/`: development key and details, wave receipt, items, annotations, first-run detail.
- **pee-knowledge:** a copy with text fields hashed; no page bytes, no page text.
