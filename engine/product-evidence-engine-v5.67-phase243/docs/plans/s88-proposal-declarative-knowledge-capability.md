# S88 proposal — One scientific definition, used along the whole PEE path (decisive step for R3)

**Status.** Proposal for owner approval. Nothing is implemented. Supersedes nothing; it is linked from the
`S88-proposal` decision row.

**Owner direction (verbatim, `owner-s88-direction-2026-10-19.md`).**

> "trasformare la conoscenza scientifica dichiarativa in una capacità riutilizzabile lungo tutto il processo di PEE …
> una definizione scientifica possa aiutare contemporaneamente a leggere, interpretare, attribuire e valutare prove,
> comprese quelle qualitative, anche in categorie nuove … non in un altro modulo isolato."

**What it builds on:**
- the S87c study;
- contract v0.3 (S87d/S87e);
- the S87e lessons (`docs/plans/s87e-reconstruction-of-missing-meaning.md` §6, §8);
- the owner reviews of S87b–S87e.

## 1. The measurable goal

**One definition, many uses.** A property definition is held as knowledge data. Without category-specific code, the
same definition must change behaviour in four places:
1. **reading:** finding the value and its condition and basis words in a document;
2. **interpretation:** typing the observation into the contract (kind, basis, conditions, object, evidence role);
3. **attribution:** linking it to the right property, which replaces the two disagreeing linkers;
4. **evaluation:** comparability (Q1), agreement for the same product (Q2), and difference with sufficiency for a
   buyer's need (Q3).

It must work for quantitative, qualitative and comparative evidence, and in categories whose definitions were written
**before** any of their documents were seen.

**Success is measured, not asserted:**

| # | Criterion | Measured on | Pass condition (proposed) |
|---|---|---|---|
| G1 | The same definition is consumed by all four stages | code graph plus a test that removing one definition changes all four stages' outputs | 4 of 4 stages; no per-category branch in code |
| G2 | Per-slot recovery: conditions, object, basis, evidence role, qualitative judgement, comparison | sealed blind references, **unseen publishers and unseen categories**, worst group reported | each slot better than the current path **and** no slot introduces more errors than it fixes (four-set rule) |
| G3 | Evidence role: measured vs declared vs quoted | the S87e failure case (spec boxes) plus new pages | beats the trivial "all measured" baseline |
| G4 | End to end: the request → advice path | the 206 regression requests plus new requests on held-out material (R3-C C3/C4 protocol) | at least one decision becomes better justified; no new harmful conclusion |
| G5 | Fewer duplicated rules | the 338 word-list regexes in 73 files | every recogniser the definitions replace is removed from the shadow path; the count is reported |

## 2. What a definition is (declarative, versioned, with a lifecycle)

The shape of a definition follows I-ADOPT, VIM, LOINC and ChemDataExtractor 2. It is general; nothing in the schema is
category-specific:

```
PropertyDefinition (knowledge data, versioned; state: candidate | supported | verified | decision_usable)
  id, label, form: quantity | categorical | judgement
  quantity:   quantity kind / metric (QK pack), admissible units, statistic
  judgement:  the aspect judged, polarity orientation (higher = better?), ordinal grades if any
  object:     what it is about (appliance, run, load, picture …) and part nouns that may name it
  basis:      default basis convention (an INDEFINITE null instantiation: e.g. one programme run), stated cues
  conditions: dimensions with relevance — defining | influencing | irrelevant — and their admissible values
  methods:    standards or method families that define it; which conditions they fix
  surface:    trigger terms and phrases (lexicon), each with provenance and its own lifecycle state
  relations:  measured_by / not_sufficient_for / requires_condition (existing teaching relations, reused)
  provenance: source (owner package, standard, regulation), author, review state
```

**Sources of definitions.** Nothing new is invented without provenance. Definitions come from:
- the existing 218 taught items and 200 relations (they start as `candidate`, or `supported` where a source exists);
- the QK pack;
- the owner's research packages;
- standards and regulations already read in S87c (EU labels, AHAM).

**Bundled measurements are decomposed** into property + object + constraints. This removes the overlap behind the
linker conflicts.

## 3. Where it enters the path (no isolated module)

Each stage gets a **switch** in the existing code path (shadow, off by default, part of the reading or knowledge
identity), not a parallel engine:

| Stage | Existing owner | Change |
|---|---|---|
| Reading | `compileExtractionPlan272` → the Phase225/265 reader | Compile the plan from definitions (terms, units, condition dimensions, basis cues), plus **document structure** for roles: table headers, spec box vs test section, quoted sources |
| Interpretation | contract v0.3 + `observation_model` | Conditions typed by the definition's dimensions first and by structure second; basis from the definition's convention (flagged inferred); object from part nouns in the definition |
| Attribution | Phase272 linker + `knowledge_link` rule linker | One linker over decomposed definitions. The 44-item blind adjudication is a regression set; both linkers' complementary coverage must be preserved |
| Storage | `test_measurements265` and friends | Written to a **store copy** only, as contract records beside the existing rows. **No live migration** |
| Evaluation | Phase268 validation, `phase253` advice (regression harness `s83-advice-regression.mjs`, end to end `s80-e2e.mjs`) | Q1 comparability from definitions (defining conditions, method), replacing the publisher constant in shadow. Q2/Q3 as in contract v0.2; sufficiency by purpose, never a blanket veto |

## 4. Protocol (the R3-C discipline)

1. **Freeze and baselines.** The current build on S80 pages, the declaration contexts, and the 206 answers. Integrity
   records (C1).
2. **Definitions written before documents are seen.** For held-out categories they are written from the owner packages
   and standards before any of those categories' documents are read, then hash-sealed.
3. **Development groups only.**
   - Categories: air purifiers and dishwashers (already spent).
   - Publishers: one subset.
   - At most three reformulations per mechanism; principles over relations or types; every counterexample becomes a
     permanent test.
4. **Freeze, then one run on check groups.**
   - unseen publishers in known categories;
   - **unseen categories**: televisions and tumble dryers from existing gold, plus robot floor cleaners or soundbars
     from the owner packages, whose definitions are authored blind.

   The first runs are committed unchanged.
5. **References.** Blind Claude-agent annotation, sealed before scoring, scored one-to-one per slot. Agents are
   labelled as such. An owner or human spot check of a sample is welcome.
6. **End to end (C3/C4).** New realistic requests on held-out material, with a reference sealed before the run, both
   builds run once.
7. **Stop before:**
   - any live store migration;
   - activating ranking;
   - widening authorisation.

## 5. Decisions needed from the owner

1. **Approve this assignment and the criteria G1–G5.** The proposed pass conditions can be changed.
2. **Fresh pages for unseen categories.** Retained pages cover only air fryers, dishwashers and air purifiers (test
   reviews) plus specification pages. A real generalisation test of *reading* needs new review pages in held-out
   categories. Either confirm the standing research policy (still unconfirmed since S87a) or authorise a bounded wave,
   for example 40 requests on 6 hosts in 2 held-out categories. The same robots, rights and private-retention rules
   apply. Without fresh pages, unseen categories can be tested only for interpretation on existing gold, not for
   reading.
3. **R3-C said "no new categories".** I propose to read this as: unseen categories are allowed as *validation
   material*, not as feature expansion. This needs your confirmation.

## 6. Honest risks

- **Definitions are a weak point.** All 218 taught items are unverified, and S87e showed that knowledge as data
  transfers only where it is precise (units, scales). Condition and role knowledge may need richer structure than
  lists; the study names frames and document roles as the candidates.
- **Evidence role may need features PEE's reader does not expose today** (spec box vs test section). If so, that is
  the first structural change.
- **The end-to-end gain may again be zero,** because validation and advice are strict. If so, the report names the
  stage that blocks, as R3-C requires.
