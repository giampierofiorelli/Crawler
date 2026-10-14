# Product Evidence Engine — Phase 142: conservative English lexical frame and scope screening

**Date:** 2026-10-11  
**Release:** v4.66 / phase 142  
**Parent:** v4.65 / phase 141  
**Policy:** English-first; original TypeScript implementation; no new dependencies, weights, remote inference APIs, unreviewed canonical facts or ranking changes.

## What was actually implemented

The user supplied original Open English WordNet, VerbNet and VADER archives in Phase141. That phase generated an attributed, local 486,656-byte lexical projection containing **nine reviewed lemma/construction cues**, **3,694 VerbNet lemma entries**, **7,506 VADER valences** and **five selected WordNet synsets**. These numbers refer to imported lexical data, NOT trained language understanding.

Phase142 adds `src/phase142_scoped_lexical_frames.ts` as an **additional optional screening interface** above `readLexicalEnglish141`. It reuses Phase139's source-text SHA-256 validation, mention proposals and caller-declared exact aliases. It does not alter the approved product vocabulary, the deterministic ranking service, the original lexical bundle or earlier modules.

For each Phase141 lexical proposal it now:

- distinguishes the **surface textual subject**, predicate, and bounded direct complement; these are syntactic *candidates*, not independently identified thematic roles;
- marks `utilizes no filter` as `negated_target` rather than feature presence, and treats `does not utilize` / `doesn't utilize` as negated predicates;
- blocks **passive voice** (`Aster X2 is outmatched by B4 Pro`) from being read as the active assertion that Aster X2 outperforms B4 Pro;
- requires a comparison name **at the beginning of the direct complement**, not merely mentioned later in a list or incidental clause;
- recognizes bounded conditional, modal and quoted surface contexts, conservatively retaining abstention;
- bounds one predicate's object before subsequent coordinated predicates / selected relative clauses;
- treats the elided grammatical subject of a second coordinated verb as **unverified**, rather than using the name from earlier in the sentence as proof;
- preserves exact UTF-16 offsets and adds SHA-256 receipts of the surface subject, predicate and bounded complement;
- exposes **possible** VerbNet class/role labels (not role assignments) with `roleAssignmentsVerified:false`;
- returns typed issue counts, `changedDisposition`, object-boundary diagnostics and `coverageTruncated` inherited from the prior bounded stage.

Every frame remains a **quarantined or unresolved hypothesis**: `sourceVerified:false`, `scientificallyValidated:false`, `canonicalWriteAuthorized:false`, `rankingAuthorized:false`. The returned `sourceId` and caller-supplied snapshot digest are not authentication of the external publisher. Possible VerbNet classes, WordNet senses and VADER raw valences cannot authorize scientific evidence. No model was trained.

## Recorded behaviour (developer-authored constructed scenarios)

`PHASE142-SCOPE-AND-ROLE-DIAGNOSTIC.json` replays **ten authored cases**. They contain **11 Phase141 lexical candidates**. Phase142 retains the same candidate count but changes **six dispositions to the more conservative `unsupported_scope`**. It also bounds the first object's span in one coordination example.

| Constructed input, abridged | Phase141 | Phase142 |
|---|---|---|
| `Aster X2 utilizes no filter` | quarantined positive-form surface proposal | `unsupported_scope` — explicitly negated object |
| `Aster X2 is outmatched by B4 Pro` | quarantined comparison | `unsupported_scope` — passive inversion |
| `Aster X2 outmatches competitors including B4 Pro` | quarantined comparison | `unsupported_scope` — B4 Pro not the direct comparator |
| `If Aster X2 utilizes a filter...` | quarantined surface proposal | `unsupported_scope` — conditional clause |
| `Aster X2 supplies a dock and furnishes a brush` | two quarantined proposals | first object bounded to `a dock`; second predicate's elided subject unresolved |
| `“Aster X2 supplies perfect cleaning”` | quarantined surface proposal | `unsupported_scope` — quoted claim |
| `Aster X2 outmatches B4 Pro` | quarantined comparison | remains quarantined only, not a true product ranking |
| `It utilizes a filter` / different model variant | unresolved / different variant | statuses preserved |

The original Phase141 experiment revisited **three previously selected real publisher snippets** (RTINGS, TechRadar and Tom's Guide). Their lexical-only pathway has **zero new proposals in both phases**. Phase142 likewise adds zero. This is *not* a new real-source holdout and does not show higher real-world recall, accuracy or precision. The older Phase140 structural reader can still propose other hypotheses on these snippets, but that is a different pathway.

## Tests and release controls

- Phase142 focused, developer-authored tests: **29 passing**. Includes negation, passive, conditionals, quotes, comparisons, relative clauses, coordination, provenance hashes, variant identity, abstention, cap/truncation, text tampering and deterministic replay.
- TypeScript cumulative sharded suite: **1,720 passing across 101 eligible files**, excluding the same two legacy files (`phase91_watch_gate.test.js`, `phase92_recipe_lifecycle.test.js`).
- Python targeted groups: **77 passing** = 47 primary source + 21 ingestion + 9 Phase133 offline probe.
- No third-party lexicon source ZIP embedded. Phase141's derived, attributed local JSON bundle and all four legal notices remain included unchanged.
- Existing code and distributions from the parent archive were byte-preserved except intentionally updated `README.md` and `package.json` (plus the additive Phase142 files). See `PHASE142-RELEASE-VERIFICATION.json`.

Reproduce within the existing Node development environment:

```sh
npm run build
npm run test:phase142
npm run demo:phase142
npm run regress:phase142
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s primary_sources -t . -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s ingestion -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

## Important limits and next scientific test

This is a finite pattern and clause-boundary screen, **not** syntactic dependency parsing, word-sense disambiguation, verified VerbNet role labelling, coreference resolution, entailment or product-performance evaluation. It may over-abstain on nested conditional or quoted text. It cannot recover lexical proposals missed by the nine candidate cues. It does not prove source authenticity. A **false rejection** is as important to measure as blocking a false positive; retaining abstentions indiscriminately can destroy coverage.

Next, freeze a genuinely source-disjoint sample of original English expert reviews with independently annotated product entities, variant identity, syntactic references, candidate relation edges, negation and conditions; assess the Phase140→141→142 change in accepted coverage, candidate recall, precision of usable hypotheses, false rejection and latency. Where sense selection and syntax require learned generalisation, consider an **offline local model benchmark** against the native path; do not assume adding more dictionaries can reproduce a pretrained neural model.

### References and attribution retained in the release

- `resources/phase141/ATTRIBUTION.md`; `research/phase141_licences/` with original approved license notices.
- [Open English WordNet](https://github.com/globalwordnet/english-wordnet) and [license](https://github.com/globalwordnet/english-wordnet/blob/main/LICENSE.md).
- [VerbNet](https://github.com/cu-clear/verbnet) and [academic source](https://verbs.colorado.edu/verbnet/).
- [VADER](https://github.com/cjhutto/vaderSentiment) and [MIT license](https://github.com/cjhutto/vaderSentiment/blob/master/LICENSE.txt).
- Technical study material **not installed**: [GLiNER2](https://github.com/fastino-ai/GLiNER2), [DeepKE](https://github.com/zjunlp/DeepKE), [medSpaCy](https://github.com/medspacy/medspacy), [Snorkel](https://github.com/snorkel-team/snorkel), [TypeSafe AI docs](https://docs.typesafe.ai/introduction).
