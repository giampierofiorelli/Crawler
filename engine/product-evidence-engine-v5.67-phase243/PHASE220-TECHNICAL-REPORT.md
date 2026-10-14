# Product Evidence Engine — Phase 220: operational autonomy audit and first runnable discovery worker

**Date:** 2026-10-13  
**Predecessor:** supplied `product-evidence-engine-v5.43-phase219(1).zip`, whose internal `package.json` reports v5.43.0  
**Increment:** v5.44.0, Phase220  
**Important result:** *some operational source discovery is newly connected, but there is still NO verified full real-world autonomous product research or independent product recommendation path.*

## Executive finding: answer to the user's central question

**No.** In the supplied v5.43, an ordinary buyer's English-language question could not by itself launch an independently verified web research process, autonomously find current products, ingest original professional tests, evaluate their comparability, and publish a trustworthy recommendation. ChatGPT's manually gathered research was being passed to modules that normally accept prior source and/or product metadata. The software contained valuable standalone components but did not compose them into that process. The distinction is verified in code, not inferred from project phase names.

The newly implemented Phase220 worker runs **one narrower, real program path**:

`English request -> bounded configurable category/constraint hypothesis -> Phase177 optional research-only intake -> Phase82 actual watch selection -> Phase75 rights/robots-gated sitemap transport calls -> deduplicated URL discovery leads -> source-version digest where byte-exact capture is possible -> cache/backoff/stop -> structured receipt / CLI output`.

This is **not** a full scientific evidence pipeline. In a genuinely network-enabled environment, with independently approved publisher permissions, this path can make genuine sitemap/robots HTTP calls using the inherited DNS-pinned transport. In **this** environment no source was added to the live operator registry, and a direct DNS check returned `EAI_AGAIN`. Therefore **no real publisher page, real product or original test was fetched by this Phase220 PEE run**. All successful HTTP-like traces are labeled synthetic fixtures. The second half of the desired workflow remains blocked and is not represented as finished.

## Audit of executable pre-existing functionality

| Function / actual file(s) | Runnable by a normal buyer in v5.43? | Evidence in supplied code; demonstration vs network | First material blocker |
|---|---|---|---|
| Public launch `src/index.ts`, `src/launch_pipeline.ts`, `src/launch_rank.ts` | Functions exist, no normal-language live product-discovery entry | `buildLaunchRecommendation` is explicitly `synthetic_demo`, always `publicationReady:false`; consumes candidates, evidence approvals and other prepared objects | Live source intake and independent evidence admission |
| Research intent `src/phase122_native_question_to_research.ts`, `src/phase124_end_to_end_attempt.ts` | No buyer-facing complete pipeline | `attemptResearch124` searches a *supplied local corpus*; receipt hardcodes `externalWebSearchExecuted:false`; Phase122 interpreter is scoped to floor-cleaning robots | General language interpretation, external discovery |
| Web intake `src/phase177_web_intake.ts`, `src/phase175_disclosure_semantics.ts` | Callable programmatically | Research hypotheses, expressly `userConfirmed:false`, `rankingAuthorized:false`; for the two Phase220 CLI requests this produced **zero** specific proposed facets and one unresolved issue each | Bounded language models insufficient as a general interpreter |
| Source rights and queue `src/web_evidence_acquisition.ts` (Ph68), `src/approved_web_reader.ts` (Ph69) | In research code with prepared policies/candidates, not as self-starting buyer workflow | Real HTTPS transport exists, DNS pinning, host restrictions, robots recheck, byte caps, quarantined original-document callback. Tests use fixtures. | Source registry with independently authenticated legal/technical clearances, live DNS and candidate source identity |
| Sitemap discovery `src/phase75_source_discovery.ts`, `src/phase124_authorized_discovery.ts` | Could be invoked by developer, no direct normal-request CLI in v5.43 | Actual `discoverFromApprovedSitemap` calls source transport for `/robots.txt` then authorized sitemap; returns URL-only leads, not products | No invoked watch worker, permission and source configuration |
| Search adequacy `src/phase78_search_adequacy.ts`, `src/phase79_adaptive_search_decision.ts` | No autonomously populated evidence | Strict receipt-driven decision guidance; explicitly rejects market exhaustion inference from candidate counts | Audited challenger searches and real decision-changing evidence receipts |
| Watch `src/phase82_market_watch.ts` | **Planner**, no persistent daemon or live feed execution | `planMarketWatch` returns `actualNetworkRequests:0`; `nextMarketWatch` computes backoff; `triageMarketSignals` accepts already qualified metadata | Missing execution worker for watch jobs |
| Category/general intent `src/phase112_semantic_ranking_invariance.ts`, `src/phase172_goal_suitability_guide.ts`, `src/phase172_domain_protocol_registry.ts` | Isolated bounded interpreters/audits, not a general buyer-facing live workflow | Synthetic/metamorphic and research-only evidence checks; no automatic acquisition | Verified, general contextual need->product/evidence bridge |
| Research execution `src/phase182_gap_research_orchestrator.ts` | Callable by developer with plans/catalogues/worker/source-registry inputs | `executeResearchGaps182` **can** attempt Phase69 reads if explicitly enabled, but by default `allowSourceReads` is absent and no live acquisition happens; `maxSourceReads` bounded | Externally prepared exact-variant/source records, approvals and reviewed findings |
| Screening memory `src/phase193_screening_memory.ts`, lineage `src/phase194_candidate_retrieval.ts`, `src/phase195_ephemeral_batch_lineage.ts` | Programmatically callable, not automatically filled from buyer question | Append/reuse decisions and candidate document linkage, differentiated by revision, policy, scope | First-party origin bytes, exact variant/method review and human-source decisions |
| Professional/evidence sources Ph196–202 (`src/phase196_source_intelligence.ts`, `src/phase200_signed_source_publication_gate.ts`, `src/phase201_approved_origin_capture_bridge.ts`) | Research-only admission/inspection, not automatic live extraction | Reviewed-source matrices, signed research gates and origin capture logic require source inputs; signature is not scientific correctness | Live documents, legitimate review chain, evidence quality |
| Video Ph203–218 (including `src/phase203_video_evidence_search.ts`, `src/phase205_video_provider_normalization.ts`, `src/phase218_discovery_first_video_provenance.ts`) | Plans/provider snapshots and controlled page analysis, not end-to-end live video discovery+ASR | URL/ID normalization and page custody; Ph215–216 historical ASR on supplied sample does not prove autonomously found videos | Legitimately retrieved media/provider records and verified methods |
| New Ph219 `src/phase219_company_and_publication_signals.ts` | No automatic feed/Trustpilot fetch | `triagePublications219` and `assessCompanyFeedback219` **only accept pre-acquired** descriptors; Trustpilot explicitly permission blocked by default | Rights-reviewed publisher feed and company-data acquisition |

The shipped archive's top-level directory is historically named `product-evidence-engine-v5.38-phase214/`, **but its `package.json` is v5.43.0**. The complete Phase219 report/tests are under `docs/phase219/`; absence of a root-named Phase219 report is not absence of the report itself. This release preserves that material.

**Repository/source-archive caveat.** `PHASE158-EXTERNAL-REPOSITORY-PROVENANCE.json` and `research/upstream_source_archives/README-EXTERNAL-ARCHIVES-NOT-BUNDLED.md` explicitly state that several original user-provided GitHub archives are **not bundled**. The manifest naming them does not supply their bytes. Phase220 has studied the source analyses actually present and preserved bundled reference ZIPs, but cannot claim to have inspected archives absent from this upload. Deep Research Markdown material that is actually present under `research/` is preserved; no absent research report is silently replaced.

## Exact new implementation

1. **`src/phase220_autonomous_discovery_worker.ts`**: `interpretForDiscovery220`, `runAutonomousDiscovery220`, `emptyCheckpoint220`. Product vocabulary and essential high-impact clarification questions are **declarative input data**, rather than category-specific branching code. Validates registry, limits sources/bytes through existing transport, reuses Phase82 scheduler and Phase75 sitemap reader, logs real transport invocation URLs (or clearly labeled fixture calls), captures byte-exact SHA-256 of sitemap when original bytes are supplied, and stores only URL leads/digests/clock/source state. No scientific facts are extracted, promoted or scored. Cached URLs are not reused once the source permission is removed and external-host/off-scope cached URLs are rejected. The existing Phase82 backoff controls repeat errors. RSS/Atom paths are **explicitly blocked as unsupported by this worker**, never mislabeled as sitemap ingestion.
2. **`scripts/phase220-run.mjs`**: runnable local CLI. It **cannot** inject mock HTTP transports; mock transports exist only through explicit `mode:'synthetic_fixture'` in developer tests. Saves bounded local source-state file atomically and optional structured run output. A local operator must independently review control over registry permissions; an arbitrary `rightsDocumentId` string does **not** prove legal permission.
3. **`docs/phase220/phase220-category-vocabulary.json`**: editable examples for football footwear (`playing_surface`: FG/AG/SG/TF/indoor) and sorting bins (`waste_streams`). Deliberately **no imaginary approved live source** is configured. Artificial grass without a precise sole/surface description triggers clarification rather than pretending AG and TF are interchangeable; local waste rules are asked about, not guessed.
4. **`tests/phase220_autonomous_discovery_worker.test.ts`**: synthetic case pairs, rights denied, replay/caching, cross-host tampering, unsupported mechanism and live transport injection denial.
5. **`docs/phase220/`** contains actual CLI output, true DNS resolution failure logs, synthetic offline receipts and rerun logs. No synthetic source, URL, permission record or imaginary football boot is scientific evidence.

## Reproduce the actual executions

Requires Node >=20, TypeScript and compatible `@types/node` **development** types. The runner requires no new runtime packages. In this sandbox compilation used globally provided TypeScript 5.8.3 and `@types/node` 22.19.7 via a temporary local symlink. That symlink is **excluded** from the ZIP; after extracting, run `npm install` in a network-capable Node environment or provide the dev dependencies locally.

```bash
npm run build
npm run test:phase220
node scripts/phase220-run.mjs --request 'I need football boots for AG pitches' \
  --registry docs/phase220/phase220-category-vocabulary.json \
  --state /tmp/pee-football-state.json --output /tmp/pee-football-run.json
node scripts/phase220-run.mjs --request 'I need a recycling bin for paper and plastic' \
  --registry docs/phase220/phase220-category-vocabulary.json \
  --state /tmp/pee-recycling-state.json --output /tmp/pee-recycling-run.json
```

The included live-mode CLI runs returned `awaiting_authorized_sources`, zero actual transport requests, and zero candidates, accurately reflecting the deliberately empty rights-approved source registry. They **did** run the actual TypeScript CLI, not ChatGPT imitation. A separate synthetic replay used a *fictional* publisher/permission/HTML-free sitemap: two transport calls (`robots.txt`, `sitemap.xml`), one fabricated URL-only lead, SHA-256 of synthetic source bytes, and zero second-run calls for a semantically equivalent query. See `docs/phase220/PHASE220-SYNTHETIC-REPLAY.json`.

A **live verified pilot requires** a legitimate source grant / approved licence for the exact operation and market, independently reviewed terms and robots rules, suitable source URL(s), outbound DNS and HTTPS, plus source/product identity and method review. The runtime cannot create those approvals. After qualifying one real source, configure its exact `WatchSource` and `WebSourcePolicy` records. Do **not** copy fictional fields from the synthetic tests and treat them as a grant.

## Tests independently run in this Phase220 session

- TypeScript `tsc -p tsconfig.json`: **passed**.
- New targeted Phase220 suite: **11 passed / 0 failed** (after fixing two issues identified by new tests).
- Bounded neighboring regression suite: **149 passed / 0 failed**, re-run on the current code before the final two added tests.
- Full eligible TypeScript test corpus: **3,933 passed / 0 failed** across **15** fresh bounded test groups; predecessor Ph91/92 remain excluded. Results are recorded in `docs/phase220/PHASE220-REGRESSION-RESULTS.json`, not borrowed from Ph219.
- Direct outbound DNS attempts: `www.gov.uk` and `news.samsung.com` each returned `getaddrinfo EAI_AGAIN`, recorded in `docs/phase220/dns-probe.log`. This is a network/runtime blocker, **not** a copyright/robots permission finding.
- **No newly executed Python regression claim**; Ph219 historically reported 212 Python passes. **No real-site crawl, newsroom inspection, video discovery, real product variant identification or product rankings tested.**

## First missing links and next engineering priorities

1. **Immediately:** provide a network-accessible operator runtime and genuinely reviewed one-source licence/terms/robots registry; execute the existing Phase75 worker against that source, capture original bytes and sitemap document version. The source's robots response is still checked live. Source access success and source suitability are separate from ranking approval.
2. Execute candidate URL -> original page/variant identity determination -> Ph69 controlled origin acquisition (using Ph218 for video locations), then Ph193/195/196 screening with method/variant provenance. Today a sitemap URL is **not** an identified product; the new worker intentionally stops at this missing step.
3. Activate existing Phase82 RSS/Atom and permitted newsroom feed execution as separate mechanisms under the same queue/state, not by creating a second watcher. Keep 219 Trustpilot closed until licensed for the exact use. Distinguish producer announcements, reprints, independent tests, sponsored work, and UK OPSS primary recalls.
4. Replace bounded vocabulary demonstration with independently benchmarked, general English need understanding; confirm mandatory compatibility constraints and semantic-paraphrase identity with real anonymised English queries. Source discovery must also expand beyond registered sitemaps when lawful and technically feasible. The system still lacks a **general autonomous web search/index**.
5. Wire reviewed evidence receipts to sufficiency/decision-stability checks already in Ph78/79 and to the independent publication gate, and only then produce a determinate reproducible complete ranking. Candidate count or a 24-hour cache hit is **never** a sufficient-evidence stop rule. No claim of real search completion is made here.

### Inherited primary documentation URLs (from the supplied Phase219 report; not fetched by PEE Phase220)

- Trustpilot consumer terms, restrictions on unauthorized automated harvesting: https://corporate.trustpilot.com/legal/for-reviewers/terms-of-use-for-consumers/oct-2026
- Trustpilot data-use enforcement: https://corporate.trustpilot.com/legal/for-everyone/action-we-take/mar-2026
- Trustpilot API authentication: https://developers.trustpilot.com/authentication
- UK CMA fake reviews guidance: https://www.gov.uk/government/publications/fake-reviews
- FTC advertising/sponsored editorial identification: https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses
- UK official product recalls and alerts: https://www.gov.uk/guidance/product-recalls-and-alerts
- Manufacturer newsroom discovery example (not licensed/acquired in this runtime): https://news.samsung.com/global/
- Provenance model: https://www.w3.org/TR/prov-o/

These are **contextual source links**, not proof that the PEE fetched or was legally authorized to mine their pages. Any permission review must be independent of the existence of a URL.
