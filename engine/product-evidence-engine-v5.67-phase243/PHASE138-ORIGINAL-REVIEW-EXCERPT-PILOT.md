# Product Evidence Engine — Phase 138: first real-language publisher excerpt pilot

**Release:** v4.62 / 11 October 2026  
**Parent:** v4.61, Phase 137  
**Engineering policy:** English-first, native TypeScript, zero new runtime dependencies, no paid APIs, no third-party runtime/model weights, no learned facts promoted and no ranking changes.

## 1. What genuinely changed

For the first time in Phases 134–138, the new diagnostic directly executed the PEE context-screening code against *short, verbatim pieces of original public professional reviews*, instead of only against synthetic developer sentences. Six excerpt probes came from three editor websites, manually inspected in the public pages on 2026-10-11:

- [RTINGS — Roborock Qrevo Curv](https://www.rtings.com/robot-vacuum/reviews/roborock/qrevo-curv); its review states Methodology v1.1 and a July 2026 test bench revision.
- [Vacuum Wars — Dreame L60 Ultra PE](https://vacuumwars.com/dreame-l60-ultra-pe-review/); original review discusses PE versus FE variant differences and a corrected combined mopping score.
- [TechGearLab — MOVA P10 Pro Ultra](https://www.techgearlab.com/reviews/smart-home/robot-vacuum/mova-p10-pro-ultra); original review includes qualitative carpet-cleaning and obstacle-response findings.

Each stored excerpt is a small contiguous quotation (maximum **25 whitespace-separated words per original webpage across the whole JSON corpus**). The JSON includes the exact source URL, publisher group, manually named reviewed model, aliases explicitly asserted by the developer, subject and object substrings, candidate relation type, SHA-256 *of the excerpt* and the developer's interpretive note. It does **not** include a downloaded full article, raw page HTML, paywalled measurements or a publisher-authenticated snapshot. The quoted fragments should not be treated as independent data points or a legally approved, distributable full article corpus.

The pipeline already had a strict Phase135 document-mention graph, but that bridge requires a *prior* mention of the named product. As a result, even obvious single-sentence descriptions could not pass through it as review hypotheses. Phase138 introduces a deliberately narrow, original TypeScript path for **explicit first mention → pre-declared exact alias of page-reviewed model → existing Phase131/132/134 provenance and contextual screens → quarantined candidate only**. It does not rewrite Phase135, infer coreference or automatically generate source candidates. Comparison-model variants are kept separate. A bare numerical result is held if the measured endpoint was not identified; developer-attested endpoint IDs do not prove real protocol correctness.

## 2. Actual pilot results

The reproducible `node scripts/evaluate-phase138.mjs` yielded the following. They are *diagnostic decisions*, not accuracy scores.

| Case ID | Source | Observed decision | Why it matters |
|---|---|---|---|
| `rtings_floor` | RTINGS | `candidate_quarantined` | One explicit reviewed product mentioned once can be screened; no fabricated previous mention |
| `rtings_its_negation` | RTINGS | `abstain_reference_unresolved` | Isolated possessive 'its' is not silently assigned to the page's reviewed product |
| `vacuumwars_pe` | Vacuum Wars | `abstain_ambiguous_context` | A percentage without the measured endpoint cannot automatically become a scientific outcome |
| `vacuumwars_fe_variant` | Vacuum Wars | `abstain_variant_not_reviewed` | FE's test figure cannot be written into the PE's reviewed-product identity |
| `techgearlab_carpet` | TechGearLab | `candidate_quarantined` | One explicit qualitative claim reaches context guard, but remains unverified |
| `techgearlab_it_negative` | TechGearLab | `abstain_reference_unresolved` | Isolated 'it' lacks a verified antecedent; the positive causal claim is not promoted |

**Totals:** 6 snippets, 3 URLs/publishers; 2 quarantined, 2 unresolved reference, 1 missing measurement endpoint, 1 wrong variant; **0** scientifically validated facts, **0** independent annotators, **0** autonomously extracted mention pairs, **0** full article snapshots, **0** independent holdout accuracy estimates.

The original source articles supply actual text, not the truth labels or candidate pairs. **All selected excerpts, offsets, subject/object candidates, aliases, relation types and developer judgments were manually prepared while viewing the source pages**. This introduces cherry-picking, hindsight and selection bias. The six excerpts cannot tell us candidate-recall, domain-general performance, misclassification rate, false-link probability or whether the engine could parse full articles without supplied markup. No output should be presented as a percentage of correctly understood reviews.

## 3. Technical and safety constraints

- `src/phase138_original_excerpt_pilot.ts`: independent native TypeScript entry point, SHA-256 consistency check on the small provided excerpt, unambiguous exact substrings and explicit product-name whitelist, phase131/132/134 gating. Ambiguous pronouns, non-reviewed variants and unspecified numeric endpoints abstain.
- `research/phase138_original_review_pilot/PHASE138-ORIGINAL-EXCERPT-PILOT.json`: six manually copied small excerpts, each linked to original publisher page and typed interpretation. It is a **diagnostic corpus, not frozen independent gold data**.
- `tests/phase138_original_excerpt_pilot.test.ts`: **19 constructed regression tests** for single mention handling, variant mismatch, pronouns, numerical endpoint, lexical negation, SHA integrity, duplicate spans, quote budgets and deterministic ordering.
- `scripts/evaluate-phase138.mjs` and `PHASE138-REAL-EXCERPT-DIAGNOSTIC.json`: executable diagnostic and its exact outputs. Statements about publisher origin are *manual attestations*, not third-party signatures.
- `scripts/phase138_regress.mjs`: bounded TypeScript regression; excludes the two inherited, timeout-prone Phase91/92 test files, transparently.

The new module is **available to import, not connected to the production server's canonical update or ranking routes**. The developer's supplied aliases could themselves be mistaken or malicious. The end-to-end source authenticity, legal rights to full article ingestion, actual test protocol consistency, calibration and independent human editorial review remain unverified. Keeping a short, attributed public extract in a diagnostic package is distinct from claiming rights to copy entire proprietary reviews.

## 4. Verification

- Targeted Phase138: **19/19 passed**.
- Cumulative TypeScript regression: **1,603 passing tests across 97 eligible files**, retaining the same explicit Phase91/92 exclusions as Phase137.
- Python: **77 passing** (47 primary source, 21 ingestion, 9 Phase133 probe).
- Zero new runtime dependencies, model installations, publisher scraping services or paid inference APIs.
- All previous parent ZIP members preserved byte for byte, except the deliberately revised `README.md` and `package.json` (see release integrity record). The historical `.pyc` files are restored from parent if Python regenerated them.

## 5. What Phase 139 should actually develop

The bottleneck is now concrete: all six cases still need their proposed entity spans supplied externally. The next engineering work should be an **automatic, bounded English mention/candidate proposal stage** using reviewed category terms and verified model aliases, not another scoring harness. Run it over full original review documents only through lawful, permitted in-memory intake, without bundling protected article bodies. Preserve original offsets, variants, paragraph boundaries, measured conditions and attribution. Compare its *candidate recall*, false transfers across models, missing referents and false positives on publisher- and product-disjoint unseen passages. Explicitly distinguish **not retrieved / not parsed / entity not found / identity ambiguous / measured endpoint absent / evidence contradiction / screened candidate**, and avoid converting a missing article into evidence that a feature is absent.

If a native pipeline cannot match the necessary extraction quality, assess a removable offline open-source model only after a directly measured benefit and a separate license, hosting, safety and compute review. Research lessons from GLiNER2, DeepKE, medSpaCy, Snorkel and TypeSafe remain study inputs, not silently installed dependencies.

**Authoritative status:** Phase138 is an executable limited real-language diagnostic and narrow new first-mention screening capability. It is not a full semantic review reader, an independently evaluated product model or authorization to update the scientific database.
