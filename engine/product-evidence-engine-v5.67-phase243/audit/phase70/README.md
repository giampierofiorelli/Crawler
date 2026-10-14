# Phase 70 test audit — 10 October 2026

- `node --test dist/tests/*.test.js`: **392 tests passed** (incl. 12 new category-matrix cases). Dist files emitted by global TypeScript `tsc` with diagnostics due to unavailable @types/node; these JS runtime tests are valid as runtime checks, NOT a clean TypeScript typecheck.
- `python -m unittest discover -s ingestion -p 'test_*.py'`: **21 passed**.
- `python -m unittest discover -s primary_sources -t . -p 'test_*.py'`: **47 passed**.
- `node --test tests/launch_artifact.test.mjs`: **4 passed**, using previously compiled/partially emitted allowlisted launch files; `node scripts/verify-launch.mjs` reported 14 allowlisted files.
- `npm run build`, `npm run test:launch` and `npm run test:release`: **could not complete** because network could not resolve npm registry, and @types/node is not installed in this container. See `typescript-compile-diagnostics.txt`. No remaining non-Node-typing diagnostics were visible; repeat a clean `npm install && npm test && npm run test:launch && npm run test:release` elsewhere.
- PostgreSQL migration `005` **not applied or verified** on live PostgreSQL.
- All test fixtures are invented, not evidence of licensed publisher rights, factual interpretation correctness or real-product utility.
