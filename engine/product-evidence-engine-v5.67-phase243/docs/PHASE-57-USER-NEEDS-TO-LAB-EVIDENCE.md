# Product Evidence Engine — Phase 57
## User-needs ↔ original-laboratory-evidence bridge
**Date:** 10 October 2026  
**Status:** tested research-only implementation; **not production evidence or consumer recommendations**.

### What changed
The project already contained a needs interpretation prototype (`src/needs_discovery.ts`) and an isolated validator for original test feeds (`primary_sources/original_lab_feed.py`). Their outputs were not joined. A retailer-independent bridge now connects a confirmed **user criterion** to an actual **test measurement field** under explicit, reviewer-documented conditions.

New files:
- `src/lab_needs_bridge.ts` — typed contract and matching/comparability logic
- `tests/lab_needs_bridge.test.ts` — positive, adverse, cross-protocol, ambiguous and security cases
- `examples/phase57-needs-lab-demo.ts` — **fictional** sample with one supported need and one deliberately unsupported need

### Evidence chain and decisions
`User answers → confirmed user need → exact source-to-need mapping rule → original lab export under quarantine → exact product variant → same unit / protocol / version / environmental conditions → observed directional comparison → evidence gaps + limitations`.

The bridge carries **original measured values and source URLs**, not publisher star scores, price feeds or manufactured 0–10 ratings. It refuses to infer the merit of one product from a different model or an incomparable protocol. Duplicate records for a variant+criterion in the same mapped test group trigger ambiguity rather than an arithmetic mean. A comparison can be marked descriptive even when the two observations differ: without stated statistical uncertainty or repeatability evidence, it cannot prove superiority.

### Worked hypothetical
Two invented headphones are each tested under the same battery loop method. `headphone_a` records **20 h**, `headphone_b` **15 h**. An explicitly reviewed mapping associates this protocol with the user's battery priority. That supports only a **directional observation under those test conditions**, not a general "better headphone" judgment. The commuter also prioritises ANC, and there is **no ANC measurement**: the engine lists this as a gap and produces **no winner**.

A second test creates hypothetical vacuum trade-offs: one model performs better in a carpet-cleaning observation while the other is quieter in a separate, internally consistent sound test. The output describes the trade-off, but does not assign a global winner or prove significance.

### Why this conservative rule exists
- The **ISO 5725-1:2023** standard establishes the role of measurement method, conditions, precision and trueness in making results comparable: https://www.iso.org/standard/69418.html
- **NIST** distinguishes traceability and measurement uncertainty from fitness for a particular decision. Metadata equality is *necessary in this implementation*, but never sufficient for a scientifically validated comparison: https://www.nist.gov/metrology/metrological-traceability
- **Baymard** observed that customers considering technical products benefit from comparison interfaces, but require usable organisation of the information; this does not validate our specific product: https://baymard.com/blog/user-friendly-comparison-tools

### Compliance and data limitations
- The bridge's `needs.evidenceAvailable` means only that a comparable research observation was matched; **it does not mean the reuse rights were verified**. `publicationReady: false` remains mandatory.
- Python source-feed validators only check **asserted** permission metadata. A flag or editor ID is **not proof of a signed licence**. The original publisher's rights and the specific use must still be checked.
- No live lab feed has been licensed or connected. Tests and demo contain invented measurements, and `example.org` addresses are placeholders.
- No claim of a statistically significant effect, measurement uncertainty, reproducibility, source-independence or real-world reliability is made.
- Does not combine two different laboratories' point estimates, convert units, reconcile changed protocols, compute averages, infer ANC from battery life, or extrapolate specifications into lab test results.
- The current bridge supports pairwise research comparisons, not complete category-wide rankings. It does not establish that a source measurement is relevant across all usage situations or product variants.
- **No Amazon-derived data, retailer pricing, trade tracking or affiliate revenue** can become an input. Amazon and other retailer links remain downstream and unchanged.
- It is deliberately absent from `src/launch/index.ts` and `dist-launch` and will not be included in the separate public release.

### Next empirical gate — do not work around it
1. Obtain **two or more lawful original-test measurement records for two exact UK-market variants**, plus a rights grant or other substantiated legal basis for computational reuse.
2. A domain expert reviews the proposed mapping rule and its physical interpretation (same measurand, units, protocol, setup, test version, relevant range, direction).
3. Record uncertainty and repeatability details, interlaboratory equivalence where needed, external validation of variant identity and evidence provenance.
4. Compare the *qualitative* output against what independent experts conclude, with predefined evaluation criteria. If inadequate, abstain rather than inventing scores.
5. Run moderated usability tests on whether customers understand missing evidence, the observed trade-offs, and how changing their needs changes the explanation.

### Execution
From project root:
```bash
npm test
node dist/examples/phase57-needs-lab-demo.js
npm run test:launch
npm run test:release
python -m unittest discover -s . -p 'test_*.py'
```
No source rights or legal compliance are established by those tests.
