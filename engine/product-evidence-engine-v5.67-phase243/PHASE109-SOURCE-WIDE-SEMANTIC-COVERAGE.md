# Phase 109 — Source-Wide Semantic Capture, Atomic Memory and Omission Controls
**11 October 2026 · Product Evidence Engine v4.33 · experimental research implementation**

## Executive decision
**One product entering the radar must trigger source-wide review, never query-wide interpretation.** The user's first reason to discover a product can prioritize the *acquisition queue*, but it must not define which aspects of an acquired professional review survive interpretation. The unit of review is the **entire eligible original source**, not an excerpt answering the current question. The resulting product entity is a reusable, query-neutral set of structured, atomic, contextual claims with provenance.

**The essential limitation:** a system cannot scientifically guarantee that it captures "every grain of sand" without independent document-level recall measurement against exhaustive annotation. The implementation certifies *coverage of an independently declared manifest* only, **not** the completeness of the initial webpage/parser inventory and **not** the semantic recall of extraction. No model, crawler or live professional-review parser was benchmarked on real sources in this phase.

## Research and what it supports
1. **Cochrane Handbook, Chapter 5, Collecting data**: systematic, piloted extraction forms; original *studies* rather than duplicate *reports* as unit of interest; outcome extraction independently in duplicate; retaining contextual/method details; explicit omissions and discrepancies. This is a methodological analogy from health evidence synthesis, not a ready-made consumer-product extractor. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-05
2. **Data extraction methods for systematic review (semi)automation: update of a living systematic review**: highlights evaluation and reproducibility limitations of LLM data extraction, including concerns about reporting of recall; justifies avoiding self-certified completeness. https://pmc.ncbi.nlm.nih.gov/articles/PMC8361807/
3. **W3C PROV Overview**: records the lineage and creation of derived knowledge, including agents, activities and entities. https://www.w3.org/TR/prov-overview/
4. **W3C Web Annotation Data Model**: anchors observations to specific portions of documents via locators/selectors. Here we retain locator and content digest, not TextQuoteSelector's article text. https://www.w3.org/TR/annotation-model/
5. **Seo et al., Active Learning for Knowledge Graph Schema Expansion**, IEEE TKDE, 2022, DOI 10.1109/TKDE.2021.3070317: motivates controlled accommodation of previously unseen concepts, not a claim that uncontrolled relation invention is correct. https://doi.org/10.1109/TKDE.2021.3070317
6. **Ouyang et al., OmniDocBench, CVPR 2025**: diverse page parsing requires explicit evaluation across formats; success on paragraphs does not imply table/figure coverage. https://openaccess.thecvf.com/content/CVPR2025/html/Ouyang_OmniDocBench_Benchmarking_Diverse_PDF_Document_Parsing_with_Comprehensive_Annotations_CVPR_2025_paper.html
7. **W3C provenance access/query**: supports locating provenance from a resource, and separates the source location from derived observations. https://www.w3.org/TR/prov-aq/
8. **Historical KG ontology evolution**: legacy annotated datasets require explicit consideration when a schema evolves. https://doi.org/10.1016/j.knosys.2020.105508

## Architecture now implemented

### Source manifest (before interpretation)
- A separately approved source fetch/render process must generate an **entire-source inventory** (paragraphs, comparison tables, figures, captions, footnotes, methodology, interactive components, videos and structured data when present). `makeEphemeralInventory109` builds this from caller-supplied blocks in memory. It digests each block and discards its text from the persistent output.
- Source/test identity is two-tier: `reportId` identifies a publication/revision; `originalTestId` identifies underlying original evidence to avoid counting syndication as independent corroboration.
- Each declared segment has `locator`, `surface`, `accessible` and `spanSha256`. An inaccessible segment is represented explicitly and prevents sealing.
- `inventoryReviewReference` and `inventoryReviewerId` are recorded **as asserted strings**: the prototype does not cryptographically authenticate them and cannot itself confirm the inventory matches the rendered page.

### Atomic extraction (not one sentiment for the article)
- Each distinct observation is a `SemanticAtom109` with exact product variant, optional compared variants, concept ID, optional existing criterion, semantic type (including method, uncertainty, limitation, comparison, safety/risk, durability, maintenance), polarity, evidence mode, status, and normalized operating conditions.
- Optional typed `quantity` preserves measured values, measurement units, protocol ID and stated uncertainty; never converts words such as `rather noisy` to fictitious dB.
- Optional typed `relation` retains direction, compared variant and comparison provenance. Product comparisons belong to the same original study even when displayed for both products.
- Observations can be positive, negative, mixed, neutral or not-applicable. No product receives a universal approval/rejection from the word alone.
- `criterionId=null` allows unanticipated observations to survive without corrupting approved category taxonomies. A separately reviewed whole-category map can later associate an existing concept to a criterion **without rewriting the atom**.
- The canonical record stores stable coded assertions, source location/hash and review metadata **without original review prose, paragraphs, quote fields, extracted full text, embeddings or request IDs**. Source reinspection and independent auditing may still require authorized access to the source in the future.

### Coverage ledger and sealing
- Each segment must be explicitly reconciled as `extracted`, `no_product_observation` (with a reason), or `blocked`.
- An `extracted` segment must list **every recorded atom** in that segment; provisional atoms cannot be silently included as approved or discarded.
- A complete seal fails when any declared block is unreadable, unreviewed or contains provisional observations. Inventories and sealed atoms are immutable; changed source revisions require new records.
- The seal reports **coverage of the declared inventory** only. It is **not** a claim that all claims embedded in a segment were found. Requiring a separate source-versus-extraction audit, preferably by an independent annotator, remains a release blocker.
- `canonicalAdmissionCheck` checks a seal, mapping, original test identity and source location before allowing **downstream review**. It does not directly write to the Phase101 canonical claims, and it does not certify human approval, statistical calibration or source rights.

### Query neutrality and use-case projections
- Product discovery and source acquisition may be caused by any query, but no `userId`, query, user importance weight or context-specific ranking is accepted in source manifest/atom records.
- A user request can read the entire atom history and, if a criterion was previously unknown, trigger a separate category-wide review through Phase108; the source's original semantics never change to satisfy that user.
- Context and performance conditions are facts about the *test*, not tailored interpretations for a requester. User-specific tradeoffs remain separate in Phases 98–100/107–108.

## Executed constructed example
`audit/phase109/constructed-source-wide-capture.json` and `npm run demo:phase109` demonstrate a fictional vacuum article with summary paragraph, noise table, methods footnote and brush caption. Three independent coded observations are stored (noise, high-power setting, pet-hair wrap). The unknown brush-maintenance aspect is mapped later without rereading the source. The demo uses synthetic text and manually constructed atom candidates. **It does not use a real crawler, a real LLM or an independently adjudicated professional article.**

## Critical remaining work before this could be considered complete
1. **Authorized whole-source capture/renderer.** Integrate Phase69 approved reads and existing reviewed browser/recipe pipeline with a *rendered and text/data asset reconciliation* process: not just HTML DOM paragraphs but tables, footnotes, figures, PDF attachments, variants, linked methodology pages when materially part of the article, and revision tracking. These may be inaccessible; explicitly report gaps.
2. **Automatic candidate extractor.** Test an in-house local LLM/structured extraction stage over every eligible segment and cross-segment reference; obtain two-pass discovery (`known categories` and `unknown novel observations`) plus deterministic numeric/table recovery. Capture negations, hedges, ranges, comparative targets, operational conditions and reviewer-vs-manufacturer attribution. This phase provides the storage/coverage contract only, **not a deployed extractor**.
3. **Independent evaluation corpus.** Collect a lawful test corpus of professional reviews (e.g. multiple product categories, publishers, formats). Independently annotate the full set of atomic claims and non-claim portions in duplicate, adjudicate disagreements and publish a versioned gold reference. Evaluate micro and macro **precision, recall, F1**, long-tail/novel-aspect recall, omission severity, numerical fidelity, context attachment, wrong-product/variant errors, source lineage, and *false certainty*; report results per format and source. No such dataset was used here.
4. **Rigorous blind audit of the segment manifest.** Source completeness requires two separate checks: `page → all eligible segments` and `all segments → all semantic atoms`. A 100% segment-status rate is not document recall. Run stratified inspection and audit on high-impact omissions; do not infer a global 100% guarantee from a test suite.
5. **Reviewed admission mainline.** Wire this gate through the only allowed Phase101/108 canonical admission path; remove or restrict legacy direct writers. Apply authenticated approvals and transactional outbox semantics; currently modules are separate SQLite prototypes and direct writes can bypass the gate.
6. **Open-world evolution.** Use versioned ontology proposals, reconciliation and systematic backfill across ALL previously acquired products/claims when adding a new category aspect. The present map allows reusing saved existing atoms, but cannot recover a previously *unextracted* idea if the source can no longer be reread.
7. **Rights and access.** Continue original factual synthesis, controlled access and citation. Avoid asserting that public readability grants unrestricted automated scraping or commercial reuse rights. The memory does not retain full copyrighted prose, but acquisition permissions and provenance still matter.
8. **Scalability and multimodal limits.** Node 22 SQLite is experimental; full text is ephemeral only in `makeEphemeralInventory109`; storage and performance have not been load-tested for thousands of reviews and segments, nor for images/audio/video.

## Evidence-level acceptance criteria for future phase
A product/article is `coverage-ready` only if its inventory is independently checked against the rendered source; all eligible blocks are examined; high-impact observations are separately adjudicated; no unresolved or inaccessible blocks are hidden; no user-specific criterion selection influences extraction; each original test is traceable; and independent held-out evaluation demonstrates acceptable recall/error performance per category. **This is a proposed quality standard, not a scientifically pre-established pass threshold.**

## Provenance and limitations
This phase reuses the cumulative original repository v4.32. It introduces `src/phase109_source_wide_semantic_intake.ts`, `tests/phase109_source_wide_semantic_intake.test.ts`, the demonstration, and this report. Existing source files from v4.32 remain unchanged; `package.json` is updated. The constructed tests validate the code's stated invariants, not the completeness of natural-language comprehension.
