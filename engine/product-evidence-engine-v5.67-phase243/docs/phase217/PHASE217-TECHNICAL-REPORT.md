# Product Evidence Engine — Phase 217 technical report

**Date:** 2026-10-13  
**Base:** full `product-evidence-engine-v5.40-phase216.zip` (v5.40.0)  
**Candidate release:** v5.41.0  
**Status:** bounded source-custody research increment; **no new product-ranking, public trust-badge, publisher-authentication or empirical precision claims**.

## 1. Engineering decision and why it matters

Phase216 demonstrated that local Whisper transcripts from a *real user-supplied* 65-second MP4 can be matched provisionally with analyst-noted Apple product specifications. However, a browser-observed specification cannot by itself establish **which complete publisher document bytes were checked**, whether a later revision changed the claim, or whether an editorial article copied the same figures. The video author and original publisher URL remain unknown.

Phase217 takes the smallest useful next step: it reuses the existing Phase69 `readApprovedSource`, Phase68 access policy, and Phase216 scoped claim triage to reconcile **complete received HTML bytes, their SHA-256, and precisely bounded analyst-entered textual anchors**. It neither installs a second crawler nor converts publisher specifications into independent measurements. Previous Phase193 screening decisions continue to require matching original publisher bytes *and* policy scope; Phase217 alone never authorizes that reuse.

The original video is not redistributed. The source URLs below remain analyst observations; no authorized live capture of Apple pages or independently verified reviewer identity was obtained in this phase.

## 2. Code actually added

`src/phase217_primary_fact_custody.ts` exports:

- `captureScopedPrimaryFacts217`: validates source-plan/candidate/rights/variant identity and that each proposed fact appeared in the **existing** Phase216 scoped triage result. It calls the Phase69 approved reader and its ephemeral complete-byte callback. For an exact, bounded, manually annotated fragment, it checks whether that literal string is absent, present once or duplicated in the complete bytes. It never persists the fragment, publisher HTML, or a transcript. Matching fragment content is checked against the original value and unit so a value/units substitution cannot silently pass.
- `compareScopedFactCaptures217`: preserves the Phase216 classification while marking which links have no captured bytes, changed document versions, ambiguous/absent fragments, or only fixture evidence. Repeated copies or divergent snapshots of one URL do not become independent test events.

A captured document has three deliberately separate properties: (a) its bytes were observed, (b) the lexical anchor appeared in that exact document, and (c) the product/field relation, publisher identity, and actual truth remain **unverified**. A literal string might appear in a hidden section, an unrelated comparison or a third-party quotation. No visual rendering or semantic field interpretation is claimed.

**Trust boundary:** an injected `SourceTransport` always produces `fixture_only` (never a purported authentic network result); a controlled HTTPS read is still `controlled_fetch_unreviewed`, not a publisher signature. Rights, terms, robots, and method-scope remain checked by existing Phase68/69 code. The existing Phase69 reader also requires permission for fact storage and public citation before quarantined research succeeds. Phase217 grants none of those permissions.

`tests/phase217_primary_fact_custody.test.ts` uses the actual **Phase216 derived three-claim replay** with synthetic HTML bytes and explicitly synthetic access-policy records. That proves software behavior on those claim scopes, **not** a new fetch of the Apple documents.

## 3. Comparison with Phase216

| Capability | Phase216 | Phase217 |
|---|---|---|
| Real MP4 and real local-ASR claim triage | Yes | Preserved unchanged |
| Exact field, product-variant, condition and market comparison | Analyst-observed producer specifications | Preserved, with document-version linkage |
| Original publisher HTML hash comparison | Not available | Added when bytes are supplied through the approved reader |
| Missing, repeated or changed textual anchors | Not tracked | Added as research-only findings |
| Rights, robots, terms and HTTPS reader | Existing Phase69 | Reused, not duplicated |
| Independent laboratory performance authentication | No | Still no |
| Original reviewer identification | No | Still no |
| Ranking and trust-badge eligibility | Not authorized | Still not authorized |

## 4. Verification

- **21/21 new targeted TypeScript tests passed**, including an additional final regression case rejecting duplicated `factId` records with incompatible quantities.
- **3,869 TypeScript tests passed across 14 admitted groups**. Shard 12 was rerun after the final change (164 passed); the other 13 groups had passed before the final change, which affected only the new Phase217 module/test. The historic Phase91/92 timeout-prone files remain untested in this admitted run, rather than counted as passes.
- **212 Python unittest cases passed** across six inherited groups.
- TypeScript compilation passed. No new runtime dependency was installed. All test logs are included in `docs/phase217/test-logs/`.
- Verified tests include version hash change despite retained phrase; absence/duplication of phrase; variant/metric/condition mismatch; disputed rights; robots denial before page retrieval; missing original bytes; duplicate publication count; forged capture approval; and failure to use an unreviewed scope as a verified claim.

**No classification precision/recall, WER/CER, originality attribution rate, monetary savings or public ranking improvement is claimed.** Tests use synthetic source HTML plus the real-derived Phase216 structured triage. No new independent human labels were collected.

## 5. External methodological sources (original URLs)

- W3C PROV-O separates derivation, attribution, quotation and primary-source relationships. It is a conceptual model, not an endorsement of the implementation: https://www.w3.org/TR/prov-o/
- Cochrane Handbook, Chapter 5 distinguishes a test/study from the potentially multiple reports describing it, a caution against counting web copies as independent experiments: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-05
- NIST's policy on metrological traceability describes the documentation needed to establish a measurement chain. A specification quoted by a reviewer is not such a chain: https://www.nist.gov/metrology/metrological-traceability
- Apple UK iPhone 18 Pro technical specifications, *analyst-observed primary manufacturer source* from Phase216, not byte-authenticated by this module: https://www.apple.com/uk/iphone-18-pro/specs/
- Apple UK regional iPhone 17 Pro Max specification page: https://support.apple.com/en-gb/125091
- Apple Latin-American regional iPhone 17 Pro Max specification page: https://support.apple.com/en-la/125091
- A separate secondary article notes a 16-gram difference with a 233-gram iPhone 17 Pro Max baseline, illustrating why the exact market/hardware context must remain explicit; this does **not** settle the Phase216 ambiguous cross-market comparison: https://www.macrumors.com/2026/09/09/iphone-18-pro-max-heavier/

## 6. Known limits and unresolved risks

1. **No original-reviewer attribution.** A SHA-256 of an uploaded screen recording authenticates the uploaded file only, not its original published YouTube version, the speaker, sponsorship or experiments.
2. **No live authorized publisher-byte acquisition in this phase.** The source-acquisition tests use injected synthetic transports and a fake rights fixture explicitly marked as synthetic. Apple rights and access cannot be assumed from its public domain.
3. **Literal HTML presence is only an anchor cue.** A string can be inside comments, scripts, duplicated comparison tables or hidden markup. This pilot does not parse rendered DOM or infer a physical measurement.
4. **Document updates are not automatically material fact changes.** Byte-digest drift triggers a review; a re-check must determine whether the relevant statement changed.
5. **No source signature or publisher authenticity guarantee.** Even HTTPS retrieval and a self-generated fetch signature provide custody of received bytes, not an endorsement or certification by the issuer.
6. **Versioned screening reuse remains Phase193's responsibility.** A matching new hash cannot bypass policy-, original-byte-, and reviewer-scope checks.
7. **No publisher review body archived; no independent ASR accuracy reference.** The user has explicitly declined providing a verbatim human reference transcript. That does not prevent bounded claim checking, but does prevent honest gold-label ASR accuracy percentages.

## 7. Next measurable increment (Phase218)

Prioritize a documented, rights-permitted end-to-end live capture of *one* original publisher specification with a verifiable current version, then check exact market/variant/field consistency and provenance. Seek original reviewer URL via source text/metadata and report it only upon independent verification. If acquisition is unavailable, preserve explicit blocked status and select an openly licensed publisher source instead. Evaluate whether document revisions materially change the scoped claim, without changing the product ranking until independent experimental evidence is authenticated.
