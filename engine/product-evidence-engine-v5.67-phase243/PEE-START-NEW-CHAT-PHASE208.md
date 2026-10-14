# PEE continuity — begin Phase208

**Canonical complete predecessor:** `product-evidence-engine-v5.31-phase207.zip`, not the small incremental ZIP. The accompanying technical report and test-results JSON form part of the handover. Extract and inspect the real code; do not rebuild from scratch.

## What Phase207 added, and did not

`src/phase207_signed_benchmark_admission.ts` adds a provider-neutral signed blind-review admission layer (Ed25519) on top of Phase203 video identity, Phase200 Signed200 envelope and Phase206 benchmark. It binds the *frozen* predictions to exact source-scoped cases and verifies two review attestations from separately configured keys before counting corresponding Phase206 labels. Signed event-pair review is supported. This is research-only, no new crawler/ranker/badges/full-text archive. Operational verification that reviewers viewed source content, really were blinded, have relevant expertise and accessed lawful original material remains outstanding.

`scripts/phase207-public-metadata-replay.mjs` reruns the six authentic source URL leads from Phase206: zero reviewed labels, accuracy null. The script's transient demo keys do not represent real enrolled reviewers. Do not call the six video links a reviewed video benchmark.

Targeted **27** TypeScript tests passed, cumulative **3,672** TypeScript software tests passed, **212** Python tests passed. Two historic Phase91/92 TypeScript tests remain uncompleted and must never be called passed. See `PHASE207-TEST-RESULTS.json` and full logs. Retain all predecessor files and all user-provided GitHub source archives.

## Highest-value Phase208 work

Obtain original source-review evidence through permitted access and *genuinely independent* human annotation, covering a range of technical and non-technical YouTube creators, culturally specialized professionals, languages, potential commercial disclosures, independent/derived experiments and product/creator awards. Test a realistically useful whole buying workflow: buyer intent -> relevant source discovery -> scoped original observations -> capability assessment -> evidence sufficiency -> product decision impact. Perform fair A/B comparisons against YouTube.js, youtube-transcript-api and PyABSA **only on identical source-reviewed cases**, measuring accuracy and cost/latency, and weigh whether to implement native functionality or integrate existing code. Do not install packages without performance, legal/access, maintenance and deployment checks.

If videos are inaccessible or reviewer annotation cannot be independently verified, explicitly state the blocker and continue engineering the integration/measurement without inventing ground truth. Preserve snapshots/checkpoints, signed-source limitations and research links.

## Inherited non-negotiable principles

PEE is a deterministic evidence-based buyer advisor for ordinary goal-based English-language questions, not a generic popularity search engine. Infer technical and non-technical success criteria; consider safety and compatibility as non-compensatory; understand technical and specialist outcome expertise (e.g. Italian espresso/pasta, Japanese sushi knives) only when relevant; don't presume competence from nationality, subscriber counts or follower metrics. Use credible consumer/creator experience as consumer experience, not laboratory verification. Distinguish awards by actual issuer, model, year and evaluated dimension. Avoid duplicating experiments, don't count affiliate Amazon-stars-only lists as performance evidence, don't drop niche products for lack of reviews, prefer adaptive research stopping. Retain Phase193 screening memory; Phase196 source matrix; Phase197 sufficiency; Phase198 specialist outcome; Phase199-202 registry/custody; Phase203-207 video/reviewer layers. Never falsely claim published badges, externally authenticated experts or independently benchmarked recommendations.
