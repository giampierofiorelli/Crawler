# Product Evidence Engine — Phase 182: targeted research execution bridge

**Base:** v5.05 / Phase181. **Scope:** English-first, web-first software increment; research is not evidence admission. **Source verification date:** 2026-10-12. Never interpret a hash, signed receipt or web source title as scientific verification.

## Engineering result

`src/phase182_gap_research_orchestrator.ts` reuses the existing Phase181 `researchGaps`, Phase129/179 category research worker, Phase68 source planning and Phase69 approved-source reader. It provides:

- A bounded, deterministic, priority-ordered and deduplicated research plan. It identifies exact variants and specific missing dimensions without permitting client-provided source rights.
- Research execution through **existing** workers for category tasks; per-variant source discovery and rights review through existing source-acquisition modules.
- Real HTTP access only behind separately supplied operator policies, robots checks, explicit opt-in and a five-attempt cap. Default is **no HTTP retrieval**. An allowed mock transport is tested; no live website was fetched by this code in the pilot.
- Evidence/source content quarantined as metadata and hashes, never a review or ranking. No editorial receipt, signature or source scientific judgment issued.
- A versioned, chained research-operation checkpoint journal (not a second knowledge database), replay protection and stale-write rejection. The canonical product catalog is unchanged.

## Original professional source pilot, reality check

Independent external page inspection (using the public web research interface, not by Phase182's crawler) located the following **original professional pages**:

1. RTINGS, **How We Test Vacuums**: https://www.rtings.com/vacuum/learn/how-we-test — updated 2025-03-14 according to the publisher. Different tasks and surface types have separate tests. Scores are tied to their specific procedures, not a universal cause-effect coefficient.
2. RTINGS, **Miele Boost CX1 Review**: https://www.rtings.com/vacuum/reviews/miele/boost-cx1 — review date 2025-05-26; publisher states methodology v1.4 and identifies its tested configuration as **Boost CX1 Cat & Dog**, while other named variants differ in included floorheads, accessories and sometimes filtration. Findings cannot be silently transferred to every Boost CX1 variant or market.
3. RTINGS, **Shark WANDVAC Review**: https://www.rtings.com/vacuum/reviews/shark/wandvac — publisher identifies a handheld WANDVAC and methodology v1.4 (as currently labelled). It has different task suitability from the Miele canister. A cross-category or task comparison requires a validated policy and compatible evaluation dimensions.
4. NSF, **Standards for Water Treatment Systems**: https://www.nsf.org/consumer-resources/articles/standards-water-treatment-systems — a category method and certification-scope source, NOT an original reduction test report for an exact filter or cartridge. NSF 42/53 refer to different classes of claims; certification must be checked against a named contaminant and product listing.

The executable pilot under `scripts/demo-phase182-original-source.mjs` registers the two real vacuum review URLs as **source metadata only**, with unknown rights review. The existing Phase68 policy gate correctly returns `metadata_only`, no web fetching, no numerical extraction and no recommendation. This is a genuine demonstration of correct abstention on real source identities, **not** a proof of autonomous crawling or of empirical suitability. Source URL/protocol/variant details above were inspected manually through public web results; no claim is made that licensing/terms or automated retrieval has been approved.

## Non-goals and warnings

- Public source metadata do not establish permission to scrape, store entire pages, reproduce text, or commercially exploit claims. Permission fields cannot be filled from a URL.
- The test transport's `200` responses are constructed fixtures. Its success says nothing about the live RTINGS network or robots policy.
- The Phase182 run journal is an integrity checkpoint, not an authenticated independent-review decision. If a process controls both history and digest, it can rewrite both; protected storage and trusted signing remain deployment tasks.
- The implementation does not yet discover original professional sites autonomously, verify model identity from retrieved HTML, extract measured observations into the trusted catalog, inspect reviewer independence, reconcile protocols/units, or issue a reviewed/signed product-knowledge revision.
- The current web interface does not yet automatically invoke this worker as a background service; safe scheduling/queue persistence and user-visible research progress are future integration work.
- Real-time first-answer rankings require a *genuine* expert-admitted product knowledge corpus and a validated criterion/normalization policy. Phase181 fictional tests do not provide either.

## Next honest engineering steps

1. Live source discovery with selected allowed publishers, bounded robots/terms/rights checks and provenance logging; verify legal rights separately.
2. Exact variant-to-review configuration reconciliation and professional measurement extraction with reversible, locally inspectable code paths.
3. Independently reviewed admission into a versioned Phase181 product knowledge catalog, authenticated outside the extraction worker. Test that changed evidence revisions recompute deterministically while old snapshots remain replayable.
4. A genuinely independent English request benchmark, including new users, contradictory needs, hard negatives and products unknown to the prior registry.
5. Deploy a durable operator research queue and inspect the first user-facing on-demand research flow. No catalog or ranking should ever update merely because a search result was found.
