# Phase 193 — Persistent source-screening decision memory

**Research-only; not a deployable source intelligence service or a public ranking gate.** This is a focused extension of Phase192 (origin lineage and marketplace-only rejection), Phase191 (per-claim original measurement provenance) and Phase182 (reviewed-source reuse).

An article excluded from **independent product-performance evidence** should not be laboriously reanalysed on every search. But excluding a document must not erase the exact product candidates it contains, falsely blacklist other articles on the same domain, or persist through a material source/policy change. The ledger stores decision scope, reason, reviewer reference, original-content fingerprint and rule revisions.

- `draftFromLineage192` binds a decision proposal to a Phase192 source-level evidence screen. Trials remain unapproved.
- `recordScreening193` / `validateLedger193`: append-only audit history (prior decisions retained), SHA-256 linked snapshots with revision lineage. **Tamper-evident against accidental edits only, not authenticated**: a malicious writer can recompute hashes, and the reviewer name/ticket is not a cryptographic signature.
- `lookupScreening193` / `screenBatch193`: skip re-screening a **previously human-reviewed exact publisher document** only when URL identity (minus known tracking), publisher-byte fingerprint, source classification, policy, and scope match. Change one and rescreen. Newer candidate original-test evidence supersedes older discovery-only classification. Product variants uncovered by stars-only sites remain candidates. A previous test is never publicly admitted merely because its review was cached.
- `saveLedger193` / `loadLedger193`: synchronous **single writer** atomic JSON storage; records survive restarts only if the hosting application's filesystem retains this JSON. No automatic background web checks, distributed locking, authenticated reviewer identities, legal-rights acquisition or public deployment has been implemented. Do not mistake ZIP fixture state for an actual production database.

`publisher_bytes` is necessary for skipping **full-document** re-screening. An analyst note or short legally usable excerpt alone cannot prove that a publisher's entire page is unchanged. This deliberately trades cache-hit rate for validity. Publisher bytes must be obtained through lawful source access; hash alone is not evidence of rights or source truth.

## Pilot and constraints

Commands: `npm run test:phase193`; `npm run demo:phase193`.

Demo uses **four wholly fictional publications** across vacuums, air purifiers and coffee machines and artificial review-ticket labels. It also references actual source URL metadata from Phase189, explicitly marked as annotations without publisher original bytes. Synthetic expected outcome: four first-pass screenings, four subsequent cache hits on unchanged revisions, rescreen changed pages and pages hosted at a different domain, zero evidence-admission authority. This is not an independent, blinded study of near-duplicate detection, false merges, original-authorship identification, or commercial advice accuracy. Phase192 related tests remain included in cumulative regression.

Future work: get permission for stable original sources; blinded independent annotation of actual copied and independent reports; measure precision, recall and accidental merging; integrate an access-controlled reviewer/ledger persistence provider and Phase182 research queues; then compare rankings under unchanged policies. No independent scientific ranking is authorized by Phase193.

## Literature

- [Cochrane MECIR C41/C42](https://www.cochrane.org/authors/handbooks-and-manuals/mecir-manual/standards-conduct-new-cochrane-intervention-reviews-c1-c75/performing-review-c24-c75/selecting-studies-include-review-c39-c42): preserve screening decisions and avoid multiple reports counting as studies.
- [PRISMA 2020 item 16a/16b](https://pmc.ncbi.nlm.nih.gov/articles/8005925/): report identified, deduplicated, excluded records and explicit reasons, including review updates.
- [W3C PROV-O](https://www.w3.org/TR/prov-o/): revisions and invalidated entities as provenance concepts.

None of these sources endorses the particular PEE cache keys, content hash, retry policy or code; those are engineering proposals subject to tests.
