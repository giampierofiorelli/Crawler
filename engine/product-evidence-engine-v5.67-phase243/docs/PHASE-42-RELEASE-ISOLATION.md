# Phase 42 — Launch build isolation (offline, synthetic)

## Decision

**Rank first, merchant links second.** Merchant inputs are not scoring inputs. No Amazon API, Amazon catalogue, Amazon reviews, historical prices, price monitoring, price comparison, or purchase timing in the launch module. Merchant links require human-reviewed approvals and are withheld when uncertain. This is a *technical boundary*, not legal clearance.

## What changed

- `src/launch/index.ts` is the restricted public launch entrypoint.
- `tsconfig.launch.json` compiles only its TypeScript import closure to `dist-launch/`, excluding the normal `src/index.ts` barrel and research-only modules.
- `npm run build:launch` **deletes stale build output first**, compiles and verifies a strict file allowlist and runtime export surface.
- `npm run test:launch` tests the compiled artifact, including deliberate injection of a forbidden legacy module and forbidden import reference.
- The original `dist/` and source tree retain experimental modules for offline research, but **must never be published or bundled into a production deployment**.

## Deployment contract

1. Run `npm ci`, `npm test`, `python3 -m unittest discover -s ingestion -p 'test_*.py'`, and `npm run test:launch` in CI.
2. Only publish the **`dist-launch/`** directory plus the minimal package metadata required by the runtime. Never publish the repository root or `dist/`.
3. Import `dist-launch/launch/index.js` from the application, not `src/index.ts` or `dist/src/index.js`.
4. Keep the merchant approval registry access-controlled, audited and separate from ranking inputs. Never infer a rights approval from fixture flags.
5. If any build verification or approval fails, do not deploy the commercial links. No merchant links is an acceptable result.

## Remaining blockers

- Synthetic evidence scoring is not calibrated for real products; independent licensed sources and normalization validation are missing.
- No live merchant link verification, affiliate account, real ASIN matching or merchant contract approval.
- The current optional `maxPrice` filter in the ranking engine depends on independently sourced catalogue prices; disable until lawful source rights are established.
- No real PostgreSQL integration, application security review, UI, privacy review or UK legal opinion.
- Amazon Associates agreement and the site's final presentation still require verification. This package makes no compliance certification.
