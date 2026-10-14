# Product Evidence Engine — Phase 218 technical report

**Date:** 2026-10-13  
**Canonical predecessor:** complete `product-evidence-engine-v5.41-phase217.zip` (v5.41.0)  
**Release:** v5.42.0  
**Scope:** discovery-first provenance of online videos; **research only; no independent-test, ranking or public trust claims**.

## 1. User clarification and resulting architectural correction

In the production PEE workflow the engine itself discovers YouTube videos and videos embedded in editorial webpages. It normally has the YouTube video URL / ID or the hosting webpage URL **before** transcribing the media. The fragmentary user-supplied screen recording in Phases 210–217 was an exceptional audiovisual test fixture, **not** the model for ordinary video provenance retrieval. Consequently, Phase218 does **not** spend resources trying to reconstruct its original YouTube author/video.

The actual pipeline is:

`existing criterion-scoped discovery job (Phase182/203) → source identity receipt (Phase203/205) OR rights/robots-gated editorial-page intake (Phase68/69) → cautious page-video linkage (Phase218) → access and licensing decision → media/ASR/visual observations (Phases205/209–216) → independent source/method/original-experiment review (Phases193–204, 217) → later ranking eligibility, subject to all existing gates.`

URL and platform-ID capture are **source-location metadata**. They cannot authenticate the uploader's competence, source copyright permission, experiments, statements, scientific quality, or product variant.

## 2. Concrete implementation

`src/phase218_discovery_first_video_provenance.ts` adds three bounded functions:

1. **`extractTransientVideoLocations218`**: locally inspect up to 1 MB of publisher HTML for literal iframe `src` and limited schema.org `VideoObject` JSON-LD (`embedUrl`, `contentUrl`). Recognise allowlisted YouTube iframe and privacy-enhanced (`youtube-nocookie`) embed paths and delegate canonical watch-video identity to **existing `canonicalYouTubeVideo203`**. Differentiate canonical YouTube video URL/ID, embedding player URL, and an externally asserted `contentUrl` or external player. Reject credentialed, non-HTTPS, local, IP-addressed, and disallowed URL forms. Mask scripts, templates, comments and fallback markup before extracting iframes. The JSON-LD reader treats metadata as publisher claims, not verified content bytes. This deliberately incomplete lexical extractor is **not a rendering-engine DOM parser**; dynamic embeds are not discovered by it.
2. **`captureDiscoveredPageVideos218`**: use **existing Phase69 `readApprovedSource`** and Phase68 policy planner for rights, terms, live robots evaluation, DNS/HTTPS restrictions, complete-byte custody and quarantine. The caller may provide a `SourceTransport` for tests, which is always designated `fixture_only`. Raw HTML exists only during the local, ephemeral callback; the returned capture stores the full-response SHA-256, original discovery URL, structural locations and whether its version changed against an expected hash. A direct production capture, when actually authorized and executed, is still only `controlled_fetch_unreviewed`, never publisher-signed or proof of originality.
3. **`reconcileDiscoveredVideoOrigins218`**: join existing Phase205 normalized YouTube search/provider snapshots with Phase218 page receipts by existing canonical **video ID**. Store all independently encountered hosting page URLs and distinct player URLs while counting **one video candidate**, not multiple independent experiment events. Conflicting channel assertions are held unresolved; altered document revisions are flagged; standalone `contentUrl` references remain external locations without fabricated YouTube IDs. All results remain research-only.

`tests/phase218_discovery_first_video_provenance.test.ts` covers URL attacks, spoofed hosts, iframe/JSON-LD parsing, page rights and robots denial, missing raw bytes, changed page revisions, multiple discovery paths, channel contradictions and no trust promotion. `examples/phase218-discovery-replay.ts` is a reproducible **synthetic, offline demonstration**.

### Deliberate non-goals

- No replacement spider/browser, commercial discovery or scraping API.
- No direct YouTube API request or original publisher-page network fetch in the new tests or demo.
- No download of media or captions, no remote ASR API, no compulsory external code dependencies.
- No retroactive tracing of the uploaded screen-recording fragment.
- No inferred sponsorship, editor identity, author reputation, licence, measurement method, exact tested variant, or independent test event.
- No claim that a quoted `contentUrl` is reachable or byte-authenticated. A page and a player are not always the original content bytes.
- No ranking, release of trust badges, or publication based on these receipts.

## 3. Actual validation performed

- TypeScript compilation: **passed** with the inherited compiler configuration and existing Node type definitions. No new dependency installed.
- **21/21 new tests passed**. The end-to-end synthetic demonstration ran with the **actual Phase69 gate** and returns one canonical YouTube video candidate discovered through a synthetic search result, a YouTube privacy-enhanced iframe and `VideoObject`, plus a distinct, unverified direct media URL.
- **3,890 admitted TypeScript tests passed** across 14 groups, including the 21 new Phase218 tests. Historical Phase91 and Phase92 remained excluded because of inherited inconclusive behavior; no claim of passing those suites.
- **212 Python tests passed.** Five groups (141 tests) completed within the initial runner, while companion group (71 tests) was verified by separately running its four files, after the outer aggregate runner timed out while waiting. See individual outputs in `docs/phase218/test-logs/`.
- No classification precision, correct-source rate, live website coverage, ASR accuracy percentage, or ranking improvement has been measured.

**Honest scope of the data:** page HTML, YouTube provider metadata, and rights documentation used by the Phase218 example are **synthetic fixtures**. The YouTube ID `M7lc1UVf-VE` is a published **YouTube IFrame API documentation example**, not evidence that the video is a product review or was actually discovered by our software from YouTube. The system did not fetch any real publisher page on behalf of the PEE during this phase, and no live rights determination is claimed.

## 4. Applicable original documentation (URLs)

- YouTube Embedded Players and Player Parameters, player iframe URL and video ID: https://developers.google.com/youtube/player_parameters
- YouTube IFrame Player API Reference, video ID vs player: https://developers.google.com/youtube/iframe_api_reference
- Google Search Central, `VideoObject` and distinction between `embedUrl` (player) vs `contentUrl` (video bytes): https://developers.google.com/search/docs/appearance/structured-data/video
- W3C PROV-O, different provenance relationships and why citation is not identity of independent experimental evidence: https://www.w3.org/TR/prov-o/

These sources document structures, **not** the measured accuracy or correctness of this Phase218 implementation.

## 5. Known limits and next measurable work

1. **Source access at scale is not yet end-to-end.** Phase69 requires explicit documented permission and robots/terms clearance and rejects many sites; it is intentionally conservative. A real-site pilot needs a publisher with documented legal use and a complete eligible original page body.
2. **HTML extraction is limited.** Only literal iframe `src` and `VideoObject` JSON-LD; it is not browser rendering. JS-injected videos, multiple schema vocabulary variants, malformed or HTML-escaped JSON-LD may be missed. Do not silently reinterpret text snippets as verified embeddings.
3. **Metadata origin is not author authentication.** Channel IDs from Phase205 are provider metadata, unreviewed; duplicates or contradictions stay explicit. The actual original experiment and syndication lineage remain Phase193–204 responsibilities.
4. **Direct media URL is a declaration**, not an actual accessible file and not proof that the page owner created it. Do not fetch it without a rights-reviewed media acquisition path.
5. **Provenance should enter the actual candidate queue** and audit log on future work, with state/version transitions; current implementation is a bounded compositional adapter, not an autonomous continuously running search service.
6. **Do not demand a user transcript or clip.** The existing Whisper case from Phase215 already proved one successful real ASR run; assess new original-source media only when access is lawful, available, and relevant.

**Recommended Phase219:** run a single properly authorized *real* discovery page/YouTube metadata intake using existing mechanisms, then integrate captured identity into the existing criterion-scoped candidate queue with versioned, auditable source status. Test the discovery→source→analysis handoff on a known video with consent/license, without permitting unreviewed source metadata into product ranking.
