# Phase 47 — Independent manufacturer evidence: dual-approval launch gate

## Decision and scope

The engine recommends **which product fits the person**, independently of Amazon, other retailers, affiliate commissions and selling prices. Manufacturer MSRP/RRP is only an **advisory economic reference**, never a verified current purchase price, hard-budget guarantee, commercial-offer ranking feature or price comparison. No Amazon API, Amazon-sourced content or history is used by this module.

## Prior issue addressed

Phase 46 correctly checked fields and timestamps, but a caller could set `rights: 'authorized'`, `exactVariantVerified: true`, `reviewer` and an HTTPS URL without any secondary gate. The public launch pathway now **requires two distinct evidence objects** in addition to the base reference record:

1. **Manufacturer publisher approval**: exact accepted hostnames, independently reviewed manufacturer identity, documentary rights evidence with the narrowly scoped `internal_list_price_budget_reference` permission, independent reviewer, expiration and revocation.
2. **Specific price reference approval**: SHA-256 of the immutable price record, captured source evidence identifier **and digest**, exact-variant match evidence identifier, rights evidence identifier, maker registry ID, distinct submitter/reviewer, expiration and revocation.

`buildLaunchRecommendation()` passes manufacturer list-price records through `gateManufacturerRecords()` **before** `assessManufacturerListPrices()`. No registry or no approval => no economic reference; rankings and retailer destinations are unaffected. Existing direct analytical assessment is not itself the public approval gateway.

## Editorial workflow required before loading real data

1. **Establish publisher identity independently.** Verify the real manufacturer's official domain using independently obtained corporate website or trusted documentation. Do not accept the URL or domain merely because the submitted record says “manufacturer.” Store exact DNS hostnames with documentary proof; do not approve suffix matches or wildcard assumptions. Independently examine redirects and page ownership.
2. **Verify rights for the intended use.** Record an actual license, agreement or authoritative permission allowing reuse/processing of MSRP/RRP for an internal personalised guidance service. Public availability of a webpage **does not prove reuse rights**. `rights: authorized` alone is insufficient. Do not assume official list price figures are offered for UK market, all SKUs or every time period.
3. **Capture the manufacturer page/document.** Preserve timestamp, source URL, original document capture in a controlled evidence store, and SHA-256 of **the actual captured bytes**. The local tool validates a digest format but **does not download, capture or authenticate evidence**.
4. **Match exact variant and market.** Inspect SKU/GTIN, capacity, finish, generation, voltage, bundle, GBP/UK applicability and whether the figure is MSRP/RRP (not promotional or selling price). Reconcile local and global sites. Treat list-price changes as new editorial records requiring new approval.
5. **Use separated reviewers.** Publisher ownership/rights reviewer and price reference reviewer cannot be the price submitter. Identity, document access and permissions must ultimately be enforced by an authenticated editorial service; strings alone are not identity verification.
6. **Approve / revoke / expire.** Record all evidence IDs, the immutable record fingerprint and approved scope. Revoke immediately when a source is withdrawn, rights change, a variant is found mismatched or evidence becomes invalid; re-review at expiry.
7. **Run tests and audit before release.** Review an audit report; a missing, expired, duplicate, modified or unapproved record must be absent from production budget guidance. No amounts or source URLs appear in audit output.

## Code and interfaces

- `src/manufacturer_editorial_gate.ts`: `fingerprintManufacturerRecord()`, `gateManufacturerRecords()` and review/registry types.
- `src/launch_pipeline.ts`: optional `manufacturerPublishers` and `manufacturerPriceApprovals` passed into the **public launch** path. The default with missing approvals is fail closed.
- `tests/manufacturer_editorial_gate.test.ts`: approval, immutable record fingerprint, lookalike-host rejection, independent review, rights, expiry/revocation, launch-ranking invariance.
- `scripts/verify-launch.mjs`: the new module is allowlisted in the restricted release; disallowed pricing/timing modules remain excluded.

## Important assurance boundary

**Automated test pass ≠ evidence authenticity, real licence, manufacturer ownership, independent reviewer identity or Amazon approval.** All test records, domains, references and reviewer names in this package are synthetic. The workflow does not authenticate people, fetch a manufacturer page, verify live domains, read contracts or perform legal review. Production must supply these through an externally authenticated and audited editorial process.

No real manufacturer MSRP/RRP values were imported, no live publisher permissions were verified, no live Amazon affiliates or third-party merchant accounts were connected, and no end-to-end PostgreSQL integration was tested here.

## Verification

```sh
npm test
npm run test:launch
python3 -m unittest discover -s ingestion -p 'test_*.py' -v
```

## Go/no-go before live launch

- Human compliance review of Amazon UK Associates Operating Agreement and live link design; transparent affiliate disclosure.
- Evidence source contracts and manufacturer publisher ownership independently verified.
- Authenticated editorial workflow and immutable document vault implemented (this phase defines the gate, not the vault).
- Production origin/snapshot retention, rights expiry handling, tests with actual approved product variants and access/audit controls.
- Validate that users never interpret MSRP/RRP reference as an actual store price, a guaranteed budget fit or the best deal.
