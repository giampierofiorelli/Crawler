# Product Evidence Engine — SearXNG source-code review

**Reviewed:** 13 October 2026  
**Status:** Engineering investigation; **not** a new PEE software release; **not** a live search test.  
**Original supplied source:** `searxng-master.zip`  
**Supplied archive SHA-256:** `fcca81473bbb74277e24799e0ac76342b01488a8185a6e0305d0685ef132d64e`  
**PEE baseline:** `product-evidence-engine-v5.44-phase220-FULL.zip`, SHA-256 `a952c54c52351e4496c2e62d3eafe0568417ad209e4a545d6d734184f21ae91c`.

## Engineering verdict

SearXNG is a credible *candidate URL discovery* component, not a product-evidence engine, original-source crawler, or substitute for PEE's source-rights, exact-variant, originality, methodology or ranking controls. **Recommend an optional, isolated, self-hosted proof of concept**, subject to source-engine terms and legal/hosting assessment. Do not copy the SearXNG core into PEE, do not require it as a default dependency, and do not treat SearXNG relevance scores as product scores. There is no justification yet for claiming the complete PEE pipeline works autonomously.

A supervised service deployment is more promising than reimplementing hundreds of external search-engine connectors or adding a new LLM browser agent. It is not guaranteed to be the final solution: coverage, failure rate, search relevance, terms, operational burden and comparative performance have not been measured on real PEE workloads.

## Verified in the uploaded code

| Question | Specific source | Finding |
| --- | --- | --- |
| Can it issue search requests? | `searx/search/__init__.py` (`Search._get_requests`, `search_multiple_requests`), `searx/search/processors/online.py` | Yes, it dispatches engine-specific search requests and collects responses, with timeouts and engine suspension. Source inspection is not a successful live run. |
| Is there a machine-readable interface? | `docs/dev/search_api.rst`, `searx/webapp.py`, `searx/webutils.py` (`get_json_response`) | Yes: `/search`, GET/POST, `q`, `format=json`, categories, language, page. JSON includes results and unresponsive engines. |
| Is JSON ready without configuration? | `searx/settings.yml`, `search.formats` | **No**. Uploaded defaults contain only `html`; JSON requests need the operator to enable `json` explicitly. Disallowed format returns 403. |
| Does it consolidate hits? | `searx/results.py` (`_merge_main_result`, `get_ordered_results`), `searx/result_types/_base.py` (`__hash__`) | Yes, matching search-result URLs are consolidated, subject to template / URL / image considerations. This is *search-result* deduplication, not PEE's original-study or press-syndication deduplication. |
| What does its score measure? | `searx/results.py` (`calculate_score`) | Search relevance / engine position and weight, **not** testing quality, product suitability or evidence independence. Never pass it into product ranking as performance evidence. |
| Can engines fail? | `searx/settings.yml` (`suspended_times`), `searx/network/raise_for_httperror.py`, `searx/search/processors/abstract.py` | CAPTCHA, access denial, HTTP 429 and related conditions are explicitly handled with suspension; failure and partial coverage are real design constraints. |
| Does it avoid *all* third-party APIs? | `searx/engines/braveapi.py`, `searx/engines/google.py`, `searx/engines/duckduckgo.py` | No. Certain engines need keys (Brave API); others use non-API web interfaces. No-key does not establish lawful or durable automated access. Each engine/use case needs its own terms and feasibility review. |
| Does it run inside PEE as uploaded? | `requirements.txt`, `container/docker-compose.yml`; PEE `src/approved_web_reader.ts` | No. SearXNG is a Python service with deployment/runtime dependencies; example Compose includes SearXNG and Valkey. PEE's external web transport rejects private/local host addresses for security, so a **separate secured internal discovery client** would be needed, not a relaxation of the evidence fetcher. |
| Licence? | `LICENSE`, `README.rst`, `setup.py` | AGPL-3.0-or-later identifiers. Direct source incorporation/modified network-service deployment has obligations requiring review. Keeping services separate may simplify some aspects but is **not** an automatic legal exemption. |

## What the existing PEE already implements

- `src/phase220_autonomous_discovery_worker.ts`: English request to bounded category/constraints to Phase82 source planner to Phase75 permitted sitemap worker. It cannot spontaneously query a general search index.
- `src/phase82_market_watch.ts`: source prioritisation, scheduling, backoff, signal triage and some original-work grouping. A planner alone is not a daemon.
- `src/phase75_source_discovery.ts`: authorised, source-specific sitemap URL acquisition. URL candidates are not product identities or evidence.
- `src/approved_web_reader.ts`: restricted HTTPS, private-address denial, redirects/byte limits, robots controls and approved source capture.
- `src/phase182_gap_research_orchestrator.ts`: useful research-gap and pre-authorised original-source bridge; not a general search index.
- `src/phase193_screening_memory.ts` and subsequent appraisal/provenance machinery: scientific evidence/screening decisions that **must not** be inferred from search snippets.

Do not rebuild these components for SearXNG. The narrow gap it can address is **broad discovery of candidate page URLs when registered sitemaps/feeds are insufficient**.

## Proposed boundary / data flow (not yet implemented)

`buyer goal (English) -> PEE canonical intent and constraints -> evidence-gap/question planner -> bounded search queries -> isolated search-discovery gateway -> self-hosted SearXNG /search?format=json -> untrusted candidate URL descriptors -> PEE canonicalization and original-work/source dedup -> independently authorised PEE web acquisition -> exact product/market/variant identification -> evidence screening -> PEE adequacy and deterministic ranking / abstention`.

Discovery receipts should retain: query text or appropriately protected hash; canonical intent key; search date/time and locale; SearXNG deployment/version and selected engine set; engine errors/unresponsive list; raw *response* SHA-256 if legally retainable; original result URL/title/engine metadata; downstream URL canonicalization and retry/stop decisions. Avoid storing sensitive customer queries unnecessarily. Never accept snippets as tested product facts or search engine popularity as expert evaluation.

Security boundaries: only an administrator-configured discovery endpoint, private network authentication, strict request/response time and byte limits, low rate ceilings, response schema validation, no redirected credentials, no arbitrary user-provided discovery server. **Do not open PEE's restricted source reader to localhost/private IPs.** Search engine output is hostile input and cannot confer permissions. Page fetch must independently pass existing Phase68–69 conditions, publisher terms/robots and source/market/version gates.

## Minimal configuration and verification design (not a tested deployment)

On a genuinely controlled SearXNG instance, enable `search.formats: [html, json]` in its operator settings. Test a bounded internal query (illustrative URL only, not a tested address):

```bash
curl --fail --show-error --max-time 15 \
  'http://127.0.0.1:8080/search?q=football+boots+artificial+grass+independent+test&format=json&language=en&pageno=1'
```

The loopback HTTP URL is a service-administration example, **not** an acceptable PEE external-source URL or an asserted network test. The instance itself needs outbound DNS/HTTPS and compatible configured engine access. Pin a SearXNG release/image digest and record configuration/engine versions before comparing results, rather than relying on floating `latest` or `master`. The supplied GitHub ZIP has no `.git` metadata and **does not establish a commit SHA**.

Acceptance test before adopting any integration:

1. Self-hosted instance reports successful JSON and selected-engine configuration; record actual responses, failures and engine terms.
2. Compare SearXNG and PEE's existing permitted sitemap/feed discovery on the *same* two categories and canonical English paraphrase sets. Use genuinely existing product/independent-test URLs, not synthetic fixtures.
3. Measure unique relevant original sources, unique exact variants, missed sources, duplicate/PR/sponsored noise, response latency, rate-limit/CAPTCHA failure and operator cost. Do not pretend that a single good query proves reliable coverage.
4. Prove the PEE source reader still blocks unapproved domains, private/network destinations, unreviewed content/rights and unsuitable variants.
5. Prove equivalent intents with identical evidence/version policy yield identical **final PEE rankings**. Search-result ordering alone must not be allowed to shift ranking.
6. Require an auditable stop decision for sufficiency, budget exhaustion, source access denial and unsupported evidence. No recommendation if verified proof is insufficient.

## Execution evidence and limits of this review

- Uploaded archive was opened and its relevant Python sources, settings and internal docs inspected (not an assertion that every source file was semantically reviewed).
- Python `compileall -q searx` returned exit code **0** on the extracted uploaded code: a *syntax-only check*, **not** SearXNG's application tests or a service-start check.
- Archive has **1,229 entries** (including directories); configuration contains many heterogeneous engines, not 352 independent usable evidence sources.
- Container had **no Docker binary**; required runtime modules such as `flask`, `curl_cffi`, `msgspec` and `valkey` were absent at inspection. SearXNG was **not** launched here.
- PEE v5.44 has not been modified by this review; **zero PEE live SearXNG searches**, **zero live product acquisitions**, **zero new PEE regression passes** claimed.
- External documentation inspection corroborated the source-reported API, JSON format toggle and deployment path. It is not PEE live ingestion.

## References (clickable)

- SearXNG repository: https://github.com/searxng/searxng
- API documentation: https://docs.searxng.org/dev/search_api.html
- SearXNG settings documentation: https://docs.searxng.org/admin/settings/index.html
- Container installation: https://docs.searxng.org/admin/installation-docker.html
- Licence: https://github.com/searxng/searxng/blob/master/LICENSE
- Search coordinator: https://github.com/searxng/searxng/blob/master/searx/search/__init__.py
- Results aggregation: https://github.com/searxng/searxng/blob/master/searx/results.py
- Search JSON serializer: https://github.com/searxng/searxng/blob/master/searx/webutils.py
- Default settings: https://github.com/searxng/searxng/blob/master/searx/settings.yml
- Error/suspension handling: https://github.com/searxng/searxng/blob/master/searx/search/processors/abstract.py

**Next action:** No more GitHub ZIPs are needed at present. First get the controlled SearXNG *service* running on a DNS/HTTPS-capable machine with explicitly reviewed engine configuration, and benchmark its output before inserting even an optional gateway into the PEE codebase. If the environment cannot support this, the software's end-to-end external discovery remains blocked and should be reported as such rather than replaced with synthetic proof.
