# Product Evidence Engine — Phase 202: Scoped Registry Reconciliation and YouTube Video Evidence Feasibility

**Date:** 13 October 2026  
**Candidate cumulative release:** `v5.26.0` built directly from `product-evidence-engine-v5.25-phase201.zip`  
**Status:** completed bounded source-code increment, synthetic tests, source-policy research. **Not** independent proof that any real model is currently certified, not an issuer authentication service, not a live YouTube transcript crawler, not a public trust-mark release.

## Executive decision

The user's new question about YouTube is well motivated. Expert video reviews may document genuine practical outcomes not sufficiently described in articles. **The correct design is to incorporate YouTube into the *existing* Phase182 research queue and Phase196 source intelligence, retaining Phase198 task-specific expertise and Phase195 textless lineage.** Do not create a popularity-sentiment ranking, blindly trust famous channels, scrape captions, or equate spoken assertions with visual proof.

The current phase's executable increment instead follows the Phase202 continuity priority: a **strict, claim-limited exact-model reconciliation adapter for one real, documented issuer programme dataset**. Selected official pilot: US EPA ENERGY STAR Certified Room Air Cleaners V3.0 (dataset ID `gaa3-swy6`). This pilot exercises the *different problem* of source-specific registry matching: it does not purport to validate espresso taste or sushi skill and **must not be mislabelled Specialist Outcome Validation**.

## Real primary public documentation checked

- ENERGY STAR, Certified Room Air Cleaners V3.0 dataset, created March 2025; listing explicitly says V3.0 effective 9 October 2025 and supplies field descriptions including `pd_id`, `brand_name`, `model_number`, `additional_model_information`: https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6
- ENERGY STAR, official API User Essentials, says model-specific records are supplied through EPA's Socrata API, describes EPA programme and restrictions around official logo permission: https://www.energystar.gov/products/spec/energy_star_api_user_essentials_pd
- ENERGY STAR, Products Tools and Resources, documents data export/API availability and daily updating across product listings. **This is a programme statement; this run did not independently verify today's data freshness or any withdrawal notice:** https://www.energystar.gov/products/productstr
- ENERGY STAR, room-air-cleaner criteria and scope: https://www.energystar.gov/products/air_purifiers_cleaners/key_product_criteria
- ENERGY STAR, specific product listing example illustrating model and market dimensions, used **only as documentation of the record type**, not imported as a validated Phase202 model: https://www.energystar.gov/productfinder/product/certified-room-air-cleaners/details/4570157
- W3C PROV-O, provenance derivations vs original event identity: https://www.w3.org/TR/prov-o/

**YouTube research and rights**

- Google's official NotebookLM announcement (26 September 2024): supports adding public YouTube URLs and analyzing videos with citations tied to transcripts. This does **not** grant other developers an equivalent unlimited caption-download API: https://blog.google/innovation-and-ai/products/notebooklm-audio-video-sources/
- Official YouTube video search metadata API: https://developers.google.com/youtube/v3/docs/search/list
- Official captions list: API call requires OAuth and **does not return the caption text**: https://developers.google.com/youtube/v3/docs/captions/list
- Official captions download: requires permission to **edit the video**, not merely that it is public: https://developers.google.com/youtube/v3/docs/captions/download
- Official Developer Policies: prohibited scraping YouTube applications / obtaining scraped content: https://developers.google.com/youtube/terms/developer-policies
- Official YouTube API EMEA terms: https://developers.google.com/youtube/terms/api-services-terms-of-service-emea
- Peer-reviewed research caution on perceived credibility: Michalovich and Hershkovitz (2020), randomized experiment of 707 participants rating YouTube science-news credibility, does not validate PEE or professional product reviewers: https://pubmed.ncbi.nlm.nih.gov/32072863/

The web facts above support access constraints and scoped method choices. **They do not establish measured performance of our adapter or video-based expertise detection.**

## Code audit and reuse

Existing components were checked in the original extracted v5.25 code: `src/approved_web_reader.ts` (Phase69 restricted HTML reader), `src/phase182_gap_research_orchestrator.ts` (rights-aware search), `src/phase193_screening_memory.ts` (reusable document decisions), `src/phase195_ephemeral_batch_lineage.ts` (temporary group comparison and metadata-only persistence), `src/phase196_source_intelligence.ts` (per-domain/category scoped priority), `src/phase197_evidence_sufficiency.ts` (when to stop), `src/phase198_specialist_outcome_validation.ts` (expert competence per discipline and outcome), `src/phase199_specialist_trust_presentation.ts` (consumer disclosure), `src/phase200_signed_source_publication_gate.ts` (signatures + two independent approvals) and `src/phase201_approved_origin_capture_bridge.ts` (authorized HTML-byte custody, not issuer authentication).

No existing ranking, screening, crawler, rights engine, trust presentation or certificate-mark authorization was bypassed or replaced.

## Bounded code increment

New: `src/phase202_energy_star_registry_reconciliation.ts`:

- Defines one pinned, official **programme/dataset/scope**: EPA ENERGY STAR room air cleaners, dataset `gaa3-swy6`, specification `3.0`, programme URL and exact SODA endpoint.
- Requires exact category, brand, model, US/Canada market and matching model variant supplied by the caller; prohibits fuzzy model-family substitution and wildcard pattern expansion. ASCII case-only equivalence is used as a narrow identifier normalization; homograph substitutions are not accepted.
- Enforces explicitly versioned V3 specification, bounded sample bytes, strict UTF-8/JSON parsing, 7-digit documented EPA ESUID pattern, latest dataset and acquisition dates, exact source URL, and a reviewed **full-byte SHA-256**, not an excerpt digest/ETag.
- Handles absence, ambiguous duplicate entries, outdated or modified bytes, unsupported model/market/scope, and possible disqualification reviews conservatively. A missing record in **a supplied API page** is not interpreted as the product being unqualified or poor-performing.
- Produces only bounded, typed **metadata** and claim limits. Does not persist the source rows or any proprietary review text.
- Explicit output flags: `independentlyVerifiedIssuer:false`, `certificateStillActiveAuthenticated:false`, `sufficientForPublication:false`, `specialistOutcomeValidation:false`, `consumerBadgeAuthorized:false`, `rankingChanged:false`.
- It is a **pure offline adapter for operator-supplied snapshots**, not a real network fetcher, identity verifier, recheck scheduler, or trusted registry status feed. A matching SHA verifies internal byte equality only.

New: `tests/phase202_energy_star_registry_reconciliation.test.ts`: **33 synthetic unit tests** exercising exact matching, case-only normalization, region mismatch, variant suffix, alias and wildcards, spoofed strings, duplicate ESUIDs, disqualification annotations, missing rows, untrusted bytes, wrong dataset/host/spec, stale snapshots, source modifications, malformed JSON/UTF-8, invalid dates, resource limits, deterministic output and non-publication.

Modified: `package.json` version `5.26.0`, new `npm run test:phase202` script. No new production dependency was installed.

Research-only: `docs/phase202/YOUTUBE-EVIDENCE-FEASIBILITY.md`; no YouTube API or caption fetching was implemented in this phase. The adapter and documentation both preserve original evidence and cultural expertise rules.

## Validation and test results

- TypeScript compilation passed. Runtime needed the preinstalled **Node 22 type definitions** (local `node_modules/@types/node` symlink for compilation only, deliberately excluded from distributable ZIP); no third-party runtime code was installed. The first compilation with Node 25 types had unrelated inherited test-typing errors; switching to Node 22 types restored predecessor-compatible compilation.
- **33/33** Phase202 synthetic unit tests passed.
- **3,486/3,486** cumulative TypeScript tests passed in 13 bounded shards (Phase201 baseline 3,453, delta +33). A first monolithic invocation timed out in the historical runner; all shards subsequently passed separately and their logs are retained.
- **212/212** cumulative Python tests passed in the six inherited suites; historical ResourceWarning lines in companion tests are not test failures.
- **0** externally authenticated real EPA registry records, **0** independently verified withdrawal registers, **0** controlled live JSON source captures, **0** licensed YouTube transcript analyses, **0** independent accuracy/recall benchmarks.

These are software-behaviour tests using deliberately authored example records. They do not measure false-positive and false-negative rates on a blinded external corpus.

## Comparison to Phase201

| | Phase201 v5.25 | Phase202 v5.26 |
|---|---|---|
| Source custody | Controlled restricted HTTPS HTML acquisition bridge | Preserved unchanged |
| Programme model validation | Only operator path/host mapping, no model matching | New offline exact-model/market/spec dataset reconciliation for one official EPA programme |
| Unsupported/withdrawn models | Not resolved | Explicit ambiguity and possible-disqualification research states; independent status **still required** |
| Programme identity authentication | Not implemented | **Still not implemented** |
| YouTube sources | No video-specific research document | Feasibility and rights-aware proposed integration, no video ingestion yet |
| Public trust signals | Not authorized | Still not authorized |
| TS cumulative | 3,453 | 3,486 |
| Python cumulative | 212 | 212 |

## Critical open issues and next increment

1. **Actual certified record currentness**: Phase69/201 signed custody is restricted to HTML; this official EPA API is JSON. Extending the already secured reader to rights-authorized JSON requires fresh security tests, bounded pages/complete dataset controls, permission, actual EPA origin authentication, signed capture and issuer-status disqualification review. No untrusted operator snapshot may be promoted to an official confirmation.
2. **Dataset completeness and version drift**: pagination, specification changes, `pd_id` semantics, category-specific model aliases/wildcards and same-model duplicates require issuer-specific verified rules; a partial response cannot prove absence.
3. **Brand rights**: the EPA's official ENERGY STAR label is protected; PEE must not use any official programme mark without permission and exact current certified scope.
4. **A distinct claim**: energy-efficiency certification is not proof of filtration-result superiority in every criterion, nor equivalent to a chef/sushi specialist's outcome validation.
5. **YouTube**: obtain API credentials and licensed creator transcripts/owner authorization where appropriate, legally valid access review, specialist competence/independence provenance and timecoded original-event annotation. Transcript-only content cannot validate what the video visually shows. Do not use likes, comments or subscriber popularity as test proof; never issue fake certification or a video popularity badge.
6. **Benchmark** with genuine original EPA entries and negative controls, independent adjudication, precision/recall and fresh disqualification checks, plus later pilot for video evidence with caption error/translation tests. None performed yet.

**Next work:** Phase203 should attach a lawful, bounded **JSON** transport to existing Phase69/201 custody and reconcile actual issuer registry statuses; in parallel scope a YouTube metadata-only discovery intake and small creator-permission pilot, staying inside Phase182/196/198/195 rather than creating new infrastructure.
