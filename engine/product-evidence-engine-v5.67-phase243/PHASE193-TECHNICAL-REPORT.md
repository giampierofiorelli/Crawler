# Product Evidence Engine — Phase 193 technical report

**Date:** 13 October 2026  
**Cumulative predecessor:** v5.16 / Phase192  
**Release:** v5.17 / Phase193  
**Status:** Research-only persistent screening memory, **not** production source verification or public ranking permission.

## Executive verdict

The requested rule is scientifically defensible: **retain previously screened decisions and reasons, rather than evaluating the same unchanged source from scratch for every user query**. But making a permanent domain-level blacklist would be both unreliable and damaging. Source documents change; a commercial page can later add legitimate original testing, different product models need new research, and an affiliate-supported publisher might also publish original research.

Phase193 implements a **revision-aware screening-decision ledger** on top of Phase192/191. The ledger can skip repeated whole-document screening of a **human-reviewed document where the same original publisher bytes, rule version, classification revision and market/context are re-encountered**. An unchanged cached exclusion controls *eligibility as independent performance evidence*, **not** product discoverability and not any other independent document on the same site. Records of previous revisions remain inspectable.

### External methodological evidence (original URLs)

1. [Cochrane MECIR C41 — document screening decisions; C42 — group multiple reports of one study](https://www.cochrane.org/authors/handbooks-and-manuals/mecir-manual/standards-conduct-new-cochrane-intervention-reviews-c1-c75/performing-review-c24-c75/selecting-studies-include-review-c39-c42). Cochrane requires traceable selection/rejection and warns that multiple reports are not multiple experiments. Its method is an analogy, not an endorsement of PEE's implementation.
2. [PRISMA 2020, Explanation and Elaboration, items 16a and 16b](https://pmc.ncbi.nlm.nih.gov/articles/8005925/), and [official PRISMA 2020 flow diagrams](https://www.prisma-statement.org/prisma-2020-flow-diagram). Differentiate identified, screened, de-duplicated, excluded and included records; document significant exclusion reasons. Its flow diagrams support updated reviews.
3. [W3C PROV-O ontology](https://www.w3.org/TR/prov-o/). Revision, derivation, invalidation and provenance give useful modeling concepts. They do NOT authenticate reviewer identity, document bytes or data accuracy by themselves.
4. Phase192's existing FTC, peer-reviewed fake-review evidence, Cochrane and Google review-methodology sources still apply; **this release neither claims all Amazon reviews are fake nor blacklists affiliate sites automatically**.

**Engineering decisions (PEE-originated, not claimed by external standards):** exact source URL after removing known tracking, SHA-256 fingerprint of source bytes, policy version, source-classification revision, reviewer reference, scoped eligibility, revision-aware replay and file snapshots.

## Implementation and correspondence to prior work

- `src/phase193_screening_memory.ts` (TypeScript) imports `LineageReport192` and `normalizeDiscoveryUrl192` directly. `draftFromLineage192` maps the prior `sourceUse` results into one of: `discovery_only`, `provisional_specification_only`, `contextual_research_only`, `original_evidence_candidate`.
- The `ScreeningDecision193` records a specific reason, original document fingerprint or limitation, source/variant/field/market scope, reviewer reference and ticket, retained product candidates and optional event identifier. Source review != source truth or public approval.
- Immutable `DecisionEvent193` records have monotonic sequence numbers, `supersedesSeq`, prior-event hashes and SHA-256 event hashes; tampering without recomputation is detected. A changed publisher document, review rule or origin classification triggers a new review. A more recent authentic original test candidate is not shadowed by an older marketplace-only exclusion.
- `lookupScreening193` and `screenBatch193` supply result categories that can be fed to the existing Phase182 research queue by a **future adapter**; this release does not modify Phase182's review/rights rules or Phase181's ranking policy. There is no second scoring engine and no new runtime dependency.
- `saveLedger193`/`loadLedger193` keep the record across processes via a single-writer JSON snapshot, atomic replacement and validation on read. **This runtime ledger must be stored durably by the eventual host:** including the code and a synthetic example inside a ZIP does not provide operational database persistence on a server by itself.
- Reuse of an entire prior screen requires explicitly claimed `human_source_screen` plus **matching `publisher_bytes` fingerprints**. Analyst notes and rights-appropriate excerpts retain their findings but cannot authorize skipping a changed full page. This policy is conservative and reduces false reuse, but may require the host to read/update source fingerprints to detect changes. It is NOT automatic web surveillance.

### What is retained versus rejected

| Input | Retained | Not admitted |
|---|---|---|
| Star-only marketplace buying list (unchanged, reviewed) | Source reference, decision/reason, discovered exact product variants, when last screened | The list's stars and ordering as independent quality/performance evidence |
| Manufacturer specs only | Attributed specs, scope and research gaps | Unsupported original independent test claim |
| Unknown method, copied editorial interpretation | Context, untraced hypotheses, linked source provenance | A second independent empirical experiment |
| Professional source reporting original tests | Reviewed source candidate, method and source links | Automatic public ranking or verified independence |
| New/revised page or changed rule | Old decision as history, new screening request | Automatic continued exclusion based solely on stale decision |

## Executed verification

- **49 newly added targeted tests** (`tests/phase193_screening_memory.test.ts`), all passing. Scenarios include identical source revisits, changed bytes, changed policy/metadata/market, exact model or criterion mismatch, similar content on another domain, no affiliate-domain blacklist, restoration of an original method, old-revision supersession, sparse product retention, a forged/malformed audit chain, out-of-order human reviews, disk save/reload and malicious JSON edits. These are **software fixtures**, not real external independent annotations.
- Demo (`scripts/phase193_demo.mjs`, output `evaluation/phase193/pilot-results.json`): four **fictional** source documents across vacuums, coffee machines, air purifiers. Four synthetic first-pass decisions, four cache reuses on identical publisher-byte fixtures, rescreening on changed page or a different domain, zero evidence newly admitted. Four **real publisher URL metadata records** from Phase189 are included solely to demonstrate that prior *analyst notes* cannot impersonate publisher originals. Synthetic reviewer identity is not an actual person; no cryptographic source authorization was obtained.
- **Cumulative regression:** **3,100 TypeScript tests across 155 eligible TS files**, all passing; **212 Python tests across six inherited groups**, all passing (some inherited `ResourceWarning` lines). Phase91/92 TS suites remain deliberately excluded under established policy. Results: `evaluation/phase193/regression-ts.json` and `regression-python.json`.
- Run `npm run test:phase193`, `npm run demo:phase193`, `python scripts/phase193_eligible_regression.py`, `python scripts/phase193_python_regression.py`.

## Honest limitations and safety boundaries

1. **No independent blinded corpus**: we have not measured real-world precision/recall for rewritten articles, syndication or false merging of independent laboratories. Phase192 text resemblance is a candidate detector, not an assertion of plagiarism. Phase193 prevents duplicated screening **after** provenance has been reviewed; it does not discover the true original unaided.
2. **Authorization**: caller-supplied review IDs/tickets and publisher SHA values are structurally validated, not independently authenticated. A real reviewer-signature process and lawful publisher-byte acquisition must be added before production operation. The SHA chain is not a signature: a malicious writer can recreate it.
3. **Freshness**: when an online original is not checked for changes, a cached hash is not evidence that a live URL is still unchanged. A source fetch/HTTP validator may be needed to compare current bytes; source rights and robots/access controls remain binding. Future updates need rate limiting and source policies, not endless recrawls.
4. **Storage**: atomic single-writer JSON is appropriate for a research pilot, not scalable concurrent web processing or multi-instance hosting. Access controls, transactions, backup/restore, review signatures and race-free leasing are unimplemented.
5. **No reliability weights, automatic blacklists or quality zeroes**: document screening determines use of the source, not intrinsic product quality. A rare untested product stays in the candidate set.
6. **No public ranking**: Phase181 remains restricted to evidence admitted by its existing scientific-review gates. Source screening memory does not unlock them.

## Phase194 next work

Prioritize independently adjudicated duplicate/origin cases across varied product categories, publisher business models and documents: exact copies, legal syndication, heavily paraphrased articles, numeric table reuse, genuine independent same-number lab results, manufacturer data laundered through independent-looking pages, new revisions and sparse products. Obtain permitted original-byte custody for a sample or user-supplied legally acquired originals. Measure pair-level precision, recall, **false merges**, correct origin attribution, reviewer agreement and work saved; compare Phase192 detection **with vs without Phase193's reviewed decision reuse**. Next integrate an authenticated persistent reviewer/ledger provider and source freshness checks into Phase182 research queue; avoid duplicate architectures and never bypass Phase181's signed evidence admission.
