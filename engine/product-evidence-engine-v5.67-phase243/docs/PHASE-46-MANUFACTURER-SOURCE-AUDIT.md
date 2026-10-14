# Phase 46 — Manufacturer list-price source audit

## Implemented

- `auditManufacturerListPrices()` provides a machine-readable accept/reject result for each requested product variant, with no amounts, prices or URLs in the returned audit.
- Rejects absent or ambiguous manufacturer references, missing independent rights authorization, mismatched variant verification, non-positive or non-finite amounts, malformed/future/inverted timestamps, expired verification, and missing reviewer/evidence references.
- Manufacturer source URLs must be HTTPS, without embedded credentials, fragments, non-default ports or local hostnames. This is a syntactic check, **not** proof that the page belongs to the manufacturer or that the licence is valid.
- `assessManufacturerListPrices()` uses the same audit gate, so rejected records never generate budget signals.
- Retailer links, Amazon APIs, prices and commissions remain outside the ranking engine.

## Important limitations

The records are still supplied by the caller. The system does **not** verify source ownership, manufacturer authority, URL liveness, actual terms of reuse, price authenticity, reviewer identity, or real-world data accuracy. It cannot claim Amazon compliance or production readiness. A genuine production intake requires authenticated editorial review and documentary rights verification. MSRP/RRP is not a sale price and never guarantees a hard budget.

## Test commands

```sh
npm test
npm run test:launch
python3 -m unittest discover -s ingestion -p 'test_*.py' -v
```
