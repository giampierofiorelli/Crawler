# PEE — continuation from Phase202

**Canonical full predecessor:** `product-evidence-engine-v5.25-phase201.zip`. It supersedes `v5.24-phase200.zip`; the incremental checkpoint alone is *not* a cumulative base.

## Verified engineering delta in Phase201

- `src/approved_web_reader.ts` (Phase69) modified minimally: raw response byte support and `onQuarantinedDocument` invoked only after existing plan, rights, robots, URL/status/content-type and quarantine checks; callback byte copy is wiped afterward.
- New `src/phase201_approved_origin_capture_bridge.ts`: exact variant/evidence/URL/version/digest check against **recomputed** Phase199, operator-curated primary origin path binding for programme records, clear distinction between untrusted injected transport and real controlled HTTPS signing, short signing clock tolerance, and Phase200-compatible `CaptureClaim200`/`SourceCustody200` handoff. No duplicate crawler, ranker, source matrix, storage engine or review queue.
- The signed branch reuses the built-in Phase69 HTTPS transport and a **separate, protected Ed25519 capture signer**; Phase201 checks signature against configured Phase200 `controlled_capture` anchor. No private keys are committed.
- **Never live-publish from this module**: issuer claims have not been independently authenticated, `livePublishingAuthorized:false`, no external certificate validation and no mark permission. Real signed-network path requires separately provisioned rights and approved remote endpoint and has NOT been exercised.
- **27 targeted TypeScript tests passed**, **3,453 TS cumulative in 13 shards passed**, **212 Python cumulative passed**. All targeted tests use authored synthetic evidence and fixture transport; no real-issuer benchmark. Reproducible logs in `docs/phase201/test-logs/`, structured results in `PHASE201-TEST-RESULTS.json`.

## Canonical principles preserved

- User needs/outcomes and hard compatibility/safety constraints first; goal-relative specialist competence and cultural/traditional evidence when relevant, *never* nationality alone.
- Independent technical measurement, structured professional application test, formal product certification and commercial endorsement are **different**. Specialist outcome validation adds scope-specific corroboration, not a global source score or compulsory badge for all products.
- No article text archive; rights-respecting temporary analysis and metadata/version/digest/genealogy only. An excerpt fingerprint is not a publisher-original hash and does not authorize Phase193 decision reuse.
- Commercial/Amazon-star-only lists can aid discovery, never independent performance proof. No publisher blacklist; unknown niche sources remain discoverable, products with sparse evidence remain represented.
- Rankings deterministic for equivalent canonical intents/evidence/policies and independent of user identity/paraphrase. Never silently alter rankings from signed website custody.
- Existing Phase68/69, Phase182/193, Phase195–200 must be inspected and **reused**, not re-created or overridden.
- Official programme mark/license is never presumed. Textual website trust signals should convey issuer/scope/variant/evidence/limitations once genuinely reviewed; no false badge.

## Phase202 priority

1. Verify SHA/CRC and inspect **v5.25 code**, not only the report; preserve pre-change checkpoint.
2. Select ONE programme registry with lawful reliable access, preferably one with clear model/version/status fields; do not claim real issuer authentication without real controlled observations and independent issuer/operator identity verification.
3. Design a bounded adapter and authoritative issuer registry profile that resolves *product identifier, programme criterion, market, validity window and withdrawn/suspended status* while guarding homographs, historical copies, alternate/region variants and publisher mirrors. Phase201 signed capture alone does **not** validate these contents.
4. Integrate independent protected role/credential/key management with issuer-specific status freshness and Phase200 revocations. Do not accept settings from an untrusted caller or product data. Fail closed on stale registries and ambiguous model matches.
5. Use annotated original records and negative controls for precision/recall with confidence intervals; retain raw data temporarily and avoid copyright-sensitive persistent article bodies. Benchmark human checks and actual decision improvements.
6. Restrict live publishing until security/provenance/authorization and factual audit of the trust signal pass. Keep technical and specialist-outcome evidence distinct; no fake official seals.

**Report:** `PHASE201-TECHNICAL-REPORT.md`, original methodological URLs included.
