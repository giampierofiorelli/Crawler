# Product Evidence Engine — Phase 201: Controlled Source Acquisition Bridge

**Date:** 13 October 2026  
**Cumulative release:** **v5.25.0**, built directly from `product-evidence-engine-v5.24-phase200.zip` (original SHA-256 `40fd1ac8c67ea502e17c9c38ce5597ae0fc43acb0f2346b9eba4af4af23e145b`).  
**Status:** bounded, tested source-acquisition engineering increment. **Not** a verified live certification registry, an authenticated issuer identity service, an independent assessment of product results, or a public-badge authorization.

## Engineering decision

Phase200 already authenticates *signed custody claims and reviewer approvals*, but only when an external trusted service supplies the signed capture and full document bytes. Phase69 already performs restricted HTTPS retrieval and Phase182 schedules rights-aware source searches. Building a second crawler would duplicate security and sourcing rules. The Phase201 increment therefore **connects the existing Phase69 controlled reader to Phase200 custody**, with no new network dependency, commercial service, document archive or ranking system.

There are two deliberately separate types of execution:

1. **Fixture transport, for testing only.** It can run source-retrieval rules and derive SHA-256 of provided bytes, but cannot emit a signed custody receipt or invoke a signing callback. Such records carry `state:'fixture_untrusted'` and must never be promoted to live proof.
2. **Built-in restricted HTTPS transport.** There is no injectable transport on this path. An externally managed signing service may sign a capture claim only after the Phase69 plan, rights, robots and response checks succeed, and the authentic *response bytes in memory* match the reviewed document SHA-256. The claim remains `signed_custody_only`, **never** authentication of the certificate issuer or of a product result. This path has not been exercised against a real approved issuer in this release.

The prior Phase199 preview, Phase200 two-role Ed25519 review, separate revocation status and Phase193 screening constraints remain in force. **No live publishing was enabled.**

## Confirmed codebase reuse

| Existing code | Reused responsibility | Phase201 addition |
|---|---|---|
| `src/approved_web_reader.ts` (Phase69) | operator rights policy, re-planning, HTTPS/TLS, IPv4 DNS pinning, redirects disallowed, fresh robots, response limits, research quarantine | optional transient **complete byte** callback, executed only after quarantine, wiped after callback |
| `src/web_evidence_acquisition.ts` (Phase68) | source plan, exact variant, site policy, permissions, allowed retrieval operations | existing planning/permission contract reused unchanged |
| `src/phase182_gap_research_orchestrator.ts` | gap research scheduling, read budgets | no second crawler, scheduler or discovery queue |
| `src/phase199_specialist_trust_presentation.ts` | reviewed scope, classification and document-level custody dossiers | exact reviewed evidence ID, URL, variant, version and full-document digest required |
| `src/phase200_signed_source_publication_gate.ts` | verified Ed25519 capture, reviewer signatures and revocation checks | generation of Phase200-compatible capture payload, with separate external signer |
| Phase193/195/196/197/198 | screening memory, lineage, source matrix, sufficiency and outcome review | no changes to their decisions, authority or ranking |

## Implementation

**Modified:** `src/approved_web_reader.ts`.

- `SourceResponse.rawBytes?:Uint8Array` allows the existing built-in transport to supply the exact response byte sequence, distinct from decoded text. An injected fixture transport can also return bytes but its presence **does not authenticate their origin**.
- `readApprovedSource` now accepts `onQuarantinedDocument`. It runs **after** policy, fresh robots and research quarantine pass; a missing raw buffer, oversize buffer or lossy/mismatched UTF-8 round trip fails closed. The callback receives a temporary byte copy, which is wiped in a `finally` block; no page body is placed in the returned result. The module cannot prevent a malicious callback from making its own copy, so the privileged caller must be access-controlled and audited.
- Existing APIs and research-only return values are preserved for callers that do not supply the callback.

**New:** `src/phase201_approved_origin_capture_bridge.ts`.

- `captureApprovedSpecialistSource201` validates one original evidence ID and exact product variant against the **recomputed** Phase199 view, the reviewed source URL, document version and full-byte SHA-256. A changed document must be reviewed again. HTTP `ETag` and `Last-Modified` are recorded as *hints*, never substituted for a byte digest or accepted as independent certification.
- Programme approval/certification pages must match a separately supplied, operator-curated **exact host and bounded path** (`PrimaryOriginRegistry201`); professional original reviews have a different capture kind. This is an **origin-scope control**, not independent proof that the organisation owns the host or issued the claim. An incorrect path/host, missing mapping or source outside the declared discipline cannot be promoted.
- Only the actual restricted HTTPS transport can reach the signing branch. The signer is an explicitly injected **privileged deployment service**, with public key corresponding to the `controlled_capture` role in a separately protected Phase200 trust policy. The module verifies the returned Ed25519 signature over the existing `captureMessage200` contract; fake keys/invalid signatures fail closed.
- A caller-supplied date must be within fifteen minutes of the runtime clock for the controlled-HTTPS signing branch. The phase still lacks a hardware-backed or independently synchronized trusted clock; system clock integrity remains an operational prerequisite.
- Optional `onSignedCapture` receives a transient Phase200 `SourceCustody200` packet so the caller can run the existing staging gate while source bytes are briefly in memory. The function's public return is metadata-only; full publisher content is never returned or deliberately persisted.
- All results explicitly carry `signedCaptureAuthenticatesActualIssuer:false`, `certificateClaimsAutomaticallyVerified:false`, `livePublishingAuthorized:false` and `rankingChanged:false`.

**New:** `tests/phase201_approved_origin_capture_bridge.test.ts` and `npm run test:phase201`.

## Results of executed tests

| Verification | Result | Logs |
|---|---:|---|
| TypeScript compile (`npm run build`) | **PASS** | `docs/phase201/test-logs/build-final.log` |
| Phase201 targeted tests | **27/27 PASS** | `docs/phase201/test-logs/phase201-target-final.tap` |
| Cumulative TypeScript suite, 13 bounded shards | **3,453/3,453 PASS** | `docs/phase201/test-logs/ts-shard1.log` … `ts-shard13.log` |
| Cumulative Python, six inherited groups | **212/212 PASS** | `docs/phase201/test-logs/python-*.log` |
| Independently authenticated real programme issuer records | **0** | no live issuer credentials or controlled source rights provided |
| Independent external accuracy/recall or live trust/UX study | **0** | not claimed |

The targeted suite exercises synthetic good and adverse cases: correct scope, expert-review vs programme distinction, wrong domain/path/product, expired or missing rights, robots denial, binary/PDF refusal, redirects, changed bytes, digest mismatch, raw-byte/decoded-text mismatch, UTF-8 corruption, missing complete bytes, callback exceptions, attempted signing through mock transport, stale controlled capture time and zeroing temporary callback bytes. These are **software-behaviour checks**, not rates of false approval measured on authentic registers.

## Comparison with Phase200 (v5.24)

| Question | Phase200 | Phase201 |
|---|---|---|
| Can Phase200 independently retrieve originals? | No, waits for signed packets | New bridge reuses Phase69 reader and connects checked byte-level acquisition to custody |
| Is the signer tied to controlled acquisition? | Depends on external custody system | Signing branch excludes injected transports; verified role-specific Ed25519 signature after restricted HTTPS path |
| Do hashes refer to original bytes? | Checks whatever full bytes the caller supplies | Reader and bridge distinguish bytes from decoded content and refuse mismatch/lossy decoding |
| Is primary publisher/issuer scope rechecked? | Verified against already-reviewed Phase199 dossier | Additional exact host/path mapping for programme pages plus previously reviewed variant/version/hash |
| Can a fixture generate authenticated success? | Signed synthetic tests can stage | Injected Phase201 fixture captures are explicitly **untrusted and unsigned** |
| Is issuer claim truth externally verified? | No | **Still no**, requires registry/status and identity verification |
| Are public badges or ranking affected? | No | No |
| TS test count | 3,426 | 3,453 |
| Python test count | 212 | 212 |

## Remaining boundaries and non-claims

1. **Authenticating a transport is not authenticating an issuer's claim.** The official organisation's identity, exact programme scheme, exact model/region, current approval/withdrawal state and current register entry must be checked independently. An HTTPS page with a positive phrase cannot by itself establish a certification. We have *not* implemented a general issuer-specific parser, W3C Verifiable Credentials stack, trust-mark licensing verification or trusted publication authority.
2. **The trust anchors and signer must be owned by a protected backend**, never loaded from a product page, browser, AI search result or a caller-controlled API request. There is no production identity-provider/RBAC/rotation/hardware security integration in this release. A compliant signature would not prevent a compromised controlled-capture service.
3. **Phase69 supports text/html and text/plain quarantine; Phase201 deliberately limits signed custody to UTF-8 HTML**. PDF, JSON APIs, redirects and alternate encodings are not supported by this increment; they require protocol-specific acquisition and security tests, not silent best-effort parsing.
4. **Copyright/rights are not inferred from robots.txt, HTTP 200 or page existence**. Rights and terms are still documented by an operator policy. The run did not access or copy live restricted articles. No editorial review body is persisted as application data.
5. **Originality, lab independence, professional skill and outcome quality remain separate judgments.** A verified page may quote another laboratory; a dated article need not identify the original experiment. The Phase193 exclusions and Phase195 evidence lineage still apply.
6. **Potential operational failures** include revoked signing keys, weak operator origin mapping, permission changes, remote HTML edits, stale issuer registers, TLS/DNS infrastructure misconfiguration, redirected third-party records and signed approvals that are technically correct but substantively wrong. The existing Phase200 revocation feed covers PEE approvals, not automatically an external issuer's own register changes.
7. **The signed-network branch has not been executed on a real authorised registry**. Fixtures only exercise the unsigned path; previous Phase200 tests independently exercise signature verification. Do not extrapolate an end-to-end accuracy claim from those tests.

## Primary methodological references and their relevance

These sources document methodological/security requirements, **not measured validation of PEE**:

- OWASP, *Server-Side Request Forgery Prevention Cheat Sheet*, DNS/URL validation and redirect avoidance: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- IETF, RFC 9309, *Robots Exclusion Protocol*, user-agent and allow/disallow rules: https://www.rfc-editor.org/rfc/rfc9309.html
- IETF, RFC 9110, *HTTP Semantics*, strong/weak entity tags and validators. An ETag does not establish an original experiment or issuer approval: https://www.rfc-editor.org/rfc/rfc9110.html
- W3C, *Verifiable Credentials Data Model v2.0* (2025 Recommendation), separates cryptographic credential verification, validity and issuer-relevant business logic: https://www.w3.org/TR/vc-data-model-2.0/
- NIST, SP 800-63A-4, *Identity Proofing and Enrollment*, why the claimed identity needs independent proofing: https://csrc.nist.gov/pubs/sp/800/63/A/4/final
- NIST, SP 800-63B-4, *Authentication and Authenticator Management*, relevant future protected signer/service identity control: https://csrc.nist.gov/pubs/sp/800/63/B/4/final
- W3C, *PROV-O*, distinctions between entities, agents, activities and derivations: https://www.w3.org/TR/prov-o/
- UKAS, official accreditation register, a possible future authoritative lookup, **not yet connected**: https://www.ukas.com/find-an-organisation/
- ENERGY STAR Product Finder, official category/model-specific product record directory, **not yet connected**: https://www.energystar.gov/productfinder/index

## Phase202 proposal

The next high-value deliverable is **issuer-specific reconciliation** on primary registers, not another generic badge or similarity score. First choose one legally accessible authoritative programme with explicit machine-readable or documented lookup terms. Verify operator identity and origin through a protected deployment profile, identify precise model, region, programme version and active/withdrawn state, and reconcile independent records against Phase200 revocations and Phase201 fresh capture. Build a labelled positive/negative dataset of genuine programme records and explicit non-matches (near-identical model names, imported variants, historical awards, revoked models and unrelated qualifications), with independent reviewer adjudication and confidence intervals. Only then consider public trust signals under a publishing authorisation policy, including periodic rechecking and user studies of **correct interpretation**, not merely higher conversion.
