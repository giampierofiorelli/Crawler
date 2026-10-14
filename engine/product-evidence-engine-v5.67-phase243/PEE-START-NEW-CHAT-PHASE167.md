# Product Evidence Engine — Phase 167 continuity

Use `product-evidence-engine-v4.90-phase166.zip` cumulatively, preserve all historical research, decisions, technical attribution and licences; do not include external GitHub repository copies or GLiNER model weights in release ZIPs.

**Phase166 implemented** `src/phase166_quantified_evidence_bridge.ts` with English structured quantity candidates (`<`, `<=`, `>`, `>=`, range), source-anchored offsets, units, canonical fingerprint, ambiguous/unsupported-unit holds, contradictory-bound holds, synthetic-evidence screening, original-source/protocol screening and `advanceAndPlanRequest166` reusing Phase164+Phase165 context interpretation. **All outputs and product decisions remain candidate-only; zero product ranking authorized.**

**Actual source study (uploaded by user):** Microsoft Recognizers-Text, NLP.js, wink-nlp. MIT licences copied only into `licences/phase166_upstream_reference_only/` for technical records; no third-party runtime code ported or new dependencies. See `PHASE166-QUANTIFIED-USER-REQUIREMENTS-AND-SOURCE-REVIEW.md` for exact source paths, archive SHA256, engineering decisions and limits.

Tests: 36 new TypeScript tests; cumulative eligible **2,165** tests over 125 files (historical Phase91/92 excluded), plus **103** Python tests. All passed. Synthetic fixture: 12 requests, 2 provisional product screens; **not a human independent benchmark**. No new neural inference.

Next: Phase145-to-Phase166 source/variant safe adapter, human-confirmed constraints, authorized original-source retrieval, independently reviewed protocol qualification, noncompensatory Phase97/99 mapping, and organically worded user-request benchmark. Never use old review prices as current. When user has desktop later, set up persistent neural inference; do not interrupt iPhone-only development for micro-Colab tests.
