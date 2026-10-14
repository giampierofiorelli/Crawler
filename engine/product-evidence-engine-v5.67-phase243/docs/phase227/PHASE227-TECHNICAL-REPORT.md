# Product Evidence Engine — Phase 227 technical report

**Date:** 13 October 2026  
**Version:** v5.51.0 (built on canonical v5.50.0 / Phase 226)  
**Outcome:** Extend the existing temporary HTML test-table reader to a bounded subset of explicit table header associations. **No real Internet acquisition; no new scoring or ranking.**

## Executive result

Phase 226 already extracted unverified publisher-reported measurements from simple, single-row-header tables with explicit `scope` values. Its reader rejected another standards-supported way to specify cells' meaning: the `headers` attribute on a `<td>` pointing to the `id` values of the relevant row and column `<th>` cells. Such association is described by W3C technique H43. Phase 227 extends that *same* reader, retaining the previous strict limits and all scientific-evidence admission guards.

**Concrete source changes:**
- `src/phase226_transient_test_tables.ts`: two supported paths in the existing bounded HTML table parser. The original scoped-header path remains. A new explicit-link path activates when table body cells contain `headers=`. It verifies that each data cell references **exactly** the expected row and column IDs, accepting either ordering. It requires distinct, bounded and syntactically safe header IDs; rejects duplicate row/column IDs, mixed/incomplete relationships, wrong model or column links, conflicting scope attributes, row/column spans and malformed structure. Model match must remain unique among page product leads. The same conservative numeric/unit/method checks and pending scientific-review status apply.
- `tests/phase227_explicit_table_headers.test.ts`: ten entirely synthetic tests covering correct per-model association, ordering, cross-row/column spoofing, duplicate IDs, conflicting structure, manufacturer-advertised column suppression, required model match, local method, safe abstention, deterministic identities and zero text storage.
- `scripts/phase227-evaluate-explicit-headers.mjs`: runnable offline program demonstrating two *invented* products/categories without requesting a page from the Internet or claiming scientific verification.
- `package.json`: `npm run test:phase227` and `npm run demo:phase227`.

**No new package dependencies, ML models, crawler, database, persistence of article text, new ranking algorithm, or network integration.** This is a conservative subset of HTML structure. It is **not** a general HTML5 DOM/table-grid parser; complex tables requiring colspan, rowspan, rowgroups or arbitrary multilevel references continue to abstain. HTML parsing by bounded regular expressions is suitable only for this deliberately restricted input class; a standards-complete parser would require separate engineering and validation.

## Source and expert documentation reviewed externally

The following were consulted by ChatGPT's external web research **to design the implementation**, not by the PEE software during a live run:

1. W3C WAI, *Tables Tutorial*: <https://www.w3.org/WAI/tutorials/tables/>. Details `<th>`, `<td>`, `<caption>`, `scope`, and explicit `id`/`headers` associations for complex tables.
2. W3C, WCAG Technique H43, *Using id and headers attributes to associate data cells with header cells*: <https://www.w3.org/TR/WCAG20-TECHS/html#H43>. Describes exactly matching referenced header IDs and checking uniqueness; accessibility semantics inform the extraction design but do not validate laboratory measurements.
3. W3C, WCAG 2.2 Technique H63, *Using the scope attribute*: <https://www.w3.org/WAI/WCAG22/Techniques/html/H63>. Distinguishes row/column scopes and explicit associations.
4. NIST, *Measurement Uncertainty*: <https://www.nist.gov/itl/sed/topic-areas/measurement-uncertainty>. Numerically matching values with the same unit are not by themselves evidence of the same measurement process.
5. NIST, *Measurand defined by measurement method*, Technical Note 1297: <https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-d4-measurand-defined-measurement-method>. Method implementation, repeatability, reproducibility and the defined measurand affect interpretation. No unverified candidate is deemed comparable.

The W3C documents guide structural attachment **only**. The NIST documents support separating numeric leads from accepted comparable measurements; this code does not implement metrological uncertainty estimation or a complete scientific method validator.

## Local, newly executed checks

- TypeScript compile via `tsc -p tsconfig.json`: **passed**.
- `npm run test:phase227`: **26/26 passed** in the Phase226 + Phase227 targeted files, of which **10 are new**.
- Full admitted cumulative TypeScript regression: **4,030 tests passed in 15 groups, zero failures, 191 test files**. Historical Phase91/92 excluded consistently with the predecessor, not silently counted as passed. Group logs are in `docs/phase227/test-logs` and the structured result in `docs/phase227/PHASE227-REGRESSION-RESULTS.json`.
- `node scripts/phase227-evaluate-explicit-headers.mjs` ran on two invented datasets: 2 football-shoe mass leads, 1 recycling-bin compartment-capacity lead. A synthetic manufacturer-total-capacity column was not promoted. All candidates remain unreviewed; the result is `docs/phase227/PHASE227-SYNTHETIC-REPLAY.json`.
- The actual `scripts/phase225-run.mjs` CLI was executed with English football-boot and recycling-bin requests, using the phase220 vocabulary registry. Neither had source feeds/search engine configured. Each returned **zero live sources, zero verified products and no ranking**. These CLI runs do not validate the new reader on live pages.
- Python regressions were **not re-executed**. Any prior successful suite count belongs to an earlier release, not this one.

## Evidence custody and constraints

All examples in the new test file and demo are **synthetic and fictional**. The new branch runs on temporary HTML already read by Phase222, performs no second fetch, produces hashed candidate/source references, and does not preserve article paragraphs or table HTML. A data cell's explicit `headers` relationship may strengthen attribution to a publisher-declared model, but it **cannot prove** manufacturer/market/variant identity, methodology, calibration, uncertainty, independence, original-work status, comparability or relevance to a person's needs. `scientificEvidenceAdmitted` and `rankingAuthorized` remain false. One publication's two rows do not constitute two independent experiments.

**Outstanding blocker:** there was no direct PEE access to live publisher HTML or a configured SearXNG instance in this environment. No empirical precision, recall, false-attachment rate or publisher-disjoint generalisation estimate can be made. ChatGPT external web results are **not** PEE ingestions. The highest-impact remaining action is a genuine live access/deployment and an independently labelled corpus of original professional-review pages for benchmarking, subject to applicable access rules.

## Reproduce (on a Node/TypeScript environment)

```bash
npm run build
npm run test:phase227
node scripts/phase227-evaluate-explicit-headers.mjs
# CLI without configured search sources (correctly abstains):
node scripts/phase225-run.mjs --request 'I play football on artificial grass and need comfortable boots' --registry docs/phase220/phase220-category-vocabulary.json --state /tmp/pee-football-state.json
```

## Next phase (228)

Prioritise obtaining permitted real original-document HTML within an actual PEE-capable network environment, then evaluate blinded per-publisher attachment precision and recall and evaluate mismatched variants/methods. Pending that, investigate a *measured* deterministic connection between newly identified test leads and pre-existing Phase193–204 original-work/variant/protocol registers, not another scoring shortcut. Keep every historical source and Deep Research file that is actually present; do not present referenced-but-absent originals as read.
