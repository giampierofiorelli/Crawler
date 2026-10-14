# Phase 48 — Price-free public launch decision (10 October 2026)

## Decision
The first public release recommends **which product best fits a user's needs**, not where a product has the best price today. The team did not identify a robust, licensable and broadly automated manufacturer MSRP/RRP data source suitable for the launch. Therefore **no prices, budget amounts, list-price bands, historical prices, timing recommendations or retailer commercial terms may enter the public product ranking, filtering or candidate eligibility**.

Retailer destinations, including Amazon UK, are appended **only after** evidence-based independent ranking. Use only approved exact-variant links. No Amazon-derived content may supply ranking evidence, product photographs or product specifications.

## Implemented
- `src/launch_rank.ts` is a dedicated evidence-only ranking function, with no numerical price field or price comparisons. It retains applicability/rights/protocol compatibility and non-financial mandatory specifications; scoring remains a **synthetic 0–10 proof of concept**, not verified real-world product expertise.
- `src/launch_pipeline.ts` accepts public types `LaunchVariant` and `LaunchRequest` without pricing. Explicit attempts to pass `maxPrice`, manufacturer list-price inputs, price histories or timing signals are rejected rather than silently ignored. Legacy financial fields on candidate variant objects are projected out; financial/commercial attributes masquerading as specification constraints are rejected.
- `src/launch/index.ts` exposes only the launch recommendation function and safe types.
- `scripts/verify-launch.mjs` allowlists the compiled public dependency graph; the legacy engine and manufacturer list-price modules are forbidden.
- `scripts/package-launch.mjs` generates an isolated `release-launch/` containing only compiled permitted modules. **This is a Node library candidate, not an actual public website.**
- Tests assert price-independent ranking, no budget-based exclusions, merchant-independent ranking and no accidental experimental code in release.

## Retained but NOT enabled in public release
Historical work remains in the full source archive, not the public launch distribution: manufacturer price references, editorial verification, price observations, purchase timing, provider feeds, and price-based tradeoffs. These are research prototypes only; retaining the source does **not** authorize their use or claim a future launch date.

## Limitations / launch gates
1. No live independent testing licences, product evidence ingestion coverage or normalisation across professional labs has been demonstrated. Scoring is synthetic.
2. Merchant-link approval records are mock inputs; no actual Amazon or other affiliate account, link or legal authorisation has been independently approved.
3. Contract review remains required for the actual Amazon Associates UK presentation, disclosures, other networks, brand/IP rights, UK marketing regulations and privacy.
4. User interface must **not** promise the product is within a budget or a good deal, or imply the listed purchase links are the cheapest available. Users check real retailer prices themselves.
5. Non-price hard constraints (for example a verified maximum physical dimension or a required interface type) can continue to filter products; prices cannot.

## Commands
```sh
npm install
npm test
npm run test:launch
npm run test:release
python3 -m unittest discover -s ingestion -p 'test_*.py' -v
```

## Artifacts
`release-launch/` is the smallest permitted runtime graph. Never deploy the research source repository wholesale. The ZIP of the full project is for development and audit only. No Amazon API, live price feed, retailer account or working consumer UI has been connected in this phase.
