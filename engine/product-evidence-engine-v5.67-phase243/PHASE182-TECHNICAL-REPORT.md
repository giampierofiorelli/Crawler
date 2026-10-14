# Product Evidence Engine — Phase 182 technical report

**Date:** 2026-10-12  
**Canonical predecessor:** v5.05 / Phase181  
**Scope:** English-only research execution bridge, bounded original-source pilot and durable operation checkpoint  
**Claim level:** implemented/tested software, **not** independently validated product recommendations, scientific source approval or full autonomous web research.

## 1. Purpose and architecture

The durable knowledge base is the exact-product and category evidence, **not** whole-ranking caches. Phase181 identified `researchGaps` when the exact model, requested dimension, category, protocol or evidence freshness was inadequate, but did not execute corresponding work. Phase182 turns these gaps into bounded, reproducible research instructions and delegates to the **existing** PEE pipeline:

- Phase181: identify missing exact product, test, criterion, new category, stale evidence, unconfirmed intent or review requirement.
- Phase179 and Phase129 over Phase73/74: perform bounded category research via preconfigured local workers, with dependency gates and quarantine. This is not a new ontology.
- Phase68 and Phase69: route exact-variant source metadata through original-test identity, commercial rights, terms and robots checks. A separate operator has to configure trusted access. The crawler is never free to search or retrieve arbitrary URLs supplied by a shopper.
- Phase169–171 remain the independent provenance, custody, conflict and review controls to satisfy **before** material is considered for the Phase181 signed product catalog. Phase182 does not mint review attestations and cannot promote observations into published rankings.

Source: `src/phase182_gap_research_orchestrator.ts`.

## 2. Implemented functionality

`planResearchGaps182` canonicalizes, validates, deduplicates and deterministically prioritizes missing-criterion, missing-test, missing-product, stale-knowledge, new-category, no-catalog, independent-review and clarification requests. It separates exact-product research from category research and user clarification. The input fingerprint, product identity, category, market, evidence/policy versions and request time are in the immutable plan hash. Work is bounded by an explicit job count.

`executeResearchGaps182` delegates real work to the prior Phase179/129 local category worker and to Phase68/69's source-acquisition planner/reader. It defaults to **zero HTTP reads**, even where source permissions may have been declared. Explicit operator opt-in and separate vetted access settings are needed. The byte and robots controls are inherited from Phase69; the additional Phase182 budget caps new retrieval attempts at five. Any downloaded content is held only transiently by the reader and reported as a hash in research quarantine, without admitting numerical test observations. A source access attempt blocked by robots is correctly distinguishable from a page successfully quarantined. A single permitted source is not re-downloaded when two requests refer to it in the same run.

`openResearchJournal182` / `appendResearchRun182` provide a JSON-serializable, append-only operation checkpoint with revision, expected-hash checks, idempotent retries and integrity hashing. This is a **research-operations ledger**, not an alternative product knowledge graph or a source of scientific authority. A real deployment must protect the storage and writers; hashes alone cannot prevent deliberate server-side rewriting.

## 3. Original professional sources pilot

The independent external web interface was used to inspect actual original public professional pages, then their canonical URLs were passed to the Phase182 demonstration as metadata **without asserting any permission to scrape or commercially reuse their contents**. See `evaluation/phase182/original_source_pilot.json` and `scripts/demo-phase182-original-source.mjs`.

1. **RTINGS, “How We Test Vacuums”:** https://www.rtings.com/vacuum/learn/how-we-test . The methodology separately assesses pet-hair pickup, floor types, maneuverability, portability and noise. Method version and floorhead/test conditions matter; a single suction figure does not establish task success.
2. **RTINGS, “Miele Boost CX1 Review”:** https://www.rtings.com/vacuum/reviews/miele/boost-cx1 . The publisher states methodology v1.4 and identifies the **Boost CX1 Cat & Dog** as the configuration it tested. It lists other regional/accessory variants: this is a concrete reason to preserve exact-variant and floorhead identity. Some review text and tests have been revised since initial publication. We did not import those scores into the PEE catalog.
3. **RTINGS, “Shark WANDVAC Review”:** https://www.rtings.com/vacuum/reviews/shark/wandvac . The publisher describes a handheld configuration with its own suitability and v1.4 methodology indication. The PEE must not equate its use-case scores with an unrelated form factor without a separately validated criterion/policy mapping.
4. **NSF, “Standards for Water Treatment Systems”:** https://www.nsf.org/consumer-resources/articles/standards-water-treatment-systems . Provides category-level test/certification scope, not proof that a named filter system passes an unspecified contaminant-reduction claim. NSF/ANSI 42 addresses aesthetic effects; NSF/ANSI 53 addresses identified health-related contaminants. It is not a scored test for any particular filter in this pilot.

**Actual Phase182 pilot result:** two exact-vacuum source metadata candidates were considered. Both were `metadata_only` because licensing, website conditions and access approval were unverified. **0 live HTTP requests**, 0 test measurements extracted, 0 independent approvals, 0 product-knowledge updates, 0 authorized rankings. The URLs were discovered and examined via the assistant's separate public web research tool, not through an autonomous PEE worker. The two paths were tested with mock HTTP transports under fictitious permissions; those tests are not evidence that RTINGS permits automated access.

## 4. Test evidence

- TypeScript build: pass, TypeScript strict NodeNext.
- Phase182 focused software tests: **29 passed**, including original-source rights rejection, category worker invocation, malformed variant and negation of implied rights, robots denial, simulated permitted retrieval, no retained page text, deterministic job order, stale/replayed journal records, and no automatic knowledge promotion.
- Full eligible TypeScript regression: **see `evaluation/phase182/regression-ts.json`**. Historic Phase91/92 suites remain intentionally excluded as in prior releases.
- Python regression: **see `evaluation/phase182/regression-python.json`** for the six original discovery commands and their return codes. Older Python ResourceWarnings, if any, are documented rather than confused with test failures.
- Distribution ZIP is checked against the predecessor file list, tested for ZIP corruption, SHA-256 manifest, and compiled/tested from an independent clean extraction before final delivery.

These are software invariants only. They do not establish extraction precision/recall, independent expert review quality, site search completeness, safe commercial reuse of publisher content, model identity correctness in all markets, or suitability of any real product.

## 5. What still blocks a real first-answer ranking

The research queue has been connected to the existing evidence-acquisition architecture, but does not yet automatically discover original professional sites, obtain rights approval, normalize measured units, reconcile model variants, perform independent source/weighting review, sign a genuine exact-product catalog, or update the live website when that catalog changes. The manually inspected pilot shows why these omissions matter. A real claim-specific standard, a tested machine variant, and an independently normalized use-case score are different entities, and they must remain separate.

## 6. Recommended next engineering work

Phase183 should conduct a narrowly scoped **permission-aware real-source intake pilot** on an exact model whose primary evidence may lawfully be fetched and stored; implement a local extractor with verbatim span custody and independent checks; separate source dates from catalog validity; then admit reviewed, variant-matched, protocol-comparable observations to a versioned product catalog and test deterministic reranking under changing confirmed English criteria. Require real original-source evidence and independent review before a recommendation is shown. Avoid adding another general-purpose framework or hosted AI dependency without a controlled comparative benefit study.
