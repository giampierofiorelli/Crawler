# Product Evidence Engine — Phase 178 engineering report

**12 October 2026 · Cumulative candidate v5.02 / Phase178 · English-first, website-first**

## Executive assessment

This phase connects the Phase177 canonical decision snapshot to a **real, editable local browser interface**, rather than treating a chat history as the truth of the user's choice. English natural-language intake can propose provisional criteria; people can confirm them, change the importance, revise type-preserving values, add needs not recognized by the parser, set a different category/task, reject or set aside suggestions and undo the last action. The local Node HTTP service retains authoritative state and refuses stale edits. The browser never manufactures product winners or silently converts language hypotheses into hard exclusion criteria.

The product remains a **research prototype**. The new screen is usable and directly interactive, but there is **no verified product inventory, evidence-admitted comparison, independent correctness benchmark, production authentication or deployed site**. Our external diagnostic identified serious gaps in the language layer. Therefore this release must not be described as a completed product adviser.

## Implemented and where

| Component | Work completed | Limit |
|---|---|---|
| `web/phase178/index.html`, `style.css`, `app.js` | Actual responsive English browser page; input, candidate review, user-controlled confirmation, explicit essential criteria, priorities, edits with preserved value kinds (boolean/choice/quantity), withdrawal/denial, scope switching, one-step undo, detailed provenance and absent-product-comparison notice | Not a production hosting stack; no independent usability or WCAG conformance audit |
| `src/phase178_site_server.ts` | Local static HTTP delivery and JSON API; reuses immutable Phase177 builder, edits, undo, ranking-input fingerprints and read-only view; stores state in bounded anonymous in-memory sessions; revision conflict detection, read-only asset allowlist and local-only binding | No real user authentication, HTTPS, CSRF-grade production enforcement, durable storage or privacy compliance assessment |
| `tests/phase178_web_surface.test.ts` | 21 new automated tests covering browser assets, session isolation, unconfirmed NLP, explicit edits, priority change, undo, quoted reviews, stale-write rejection, visible cautions and lack of fictional rankings | Software behaviour tests only; not meaning correctness or real-user UX tests |
| `evaluation/phase178/` | External public-post diagnostic data, outputs and cumulative regressions | Linked paraphrases and developer-written review targets, **not blinded independent ground truth** |
| `docs/phase178/ENGINEERING-NOTES.md` | Design, technical boundaries, code reuse, methods and original sources | Research record only |

The front end has no external JavaScript libraries or framework. Phase154 context-scoping techniques are reused through Phase175 → 177; optional Phase176 quote scoping supports guarded English intake. Phase169–171 evidence source/identity/test-protocol gates remain unchanged and are not bypassed. The 12 user-supplied GitHub archives remain **research material**, not incorporated as heavyweight runtime dependencies. In particular, FastCoref and SGD-X may still be worth independent controlled evaluation in reviews / language robustness; neither has been installed here.

## Research evaluated against implementation

**Comparison design.** Nielsen Norman Group recommends making meaningful differences between options explicit, with secondary information progressively disclosed. Their guidance comes from ecommerce usability research and is NOT proof that this particular PEE screen improves outcomes. Sources: https://www.nngroup.com/articles/explicit-differences/ ; https://www.nngroup.com/reports/ecommerce-ux-homepages-and-category-pages/ ; https://www.nngroup.com/reports/ecommerce-ux-product-pages-including-reviews/ . We intentionally show **no invented side-by-side product comparison**, because there is no admitted model-specific measurement dataset to compare. Instead the page shows a clearly labelled evidence/unavailability notice and actual confirmed-input changes.

**Accessible interaction.** The page uses labelled inputs, visible textual errors/statuses, minimum 44 px primary controls, a skip link, keyboard focus treatment and a one-column responsive layout. These implement *some* relevant methods from WCAG 2.2 guidance but do not establish WCAG conformance. W3C: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum ; https://www.w3.org/WAI/WCAG22/Understanding/error-identification ; https://www.w3.org/WAI/WCAG22/Understanding/status-messages .

**Explanation bias.** Balog, Radlinski and Petrov (CHI EA 2023) describe an experiment with 129 participants finding recommendation explanations can affect selections. This warns against optimizing for agreement, satisfaction or persuasion alone. We will need to measure missed disqualifiers, wrong choices and calibration in an independent PEE study. https://research.google/pubs/measuring-the-impact-of-explanation-bias-a-study-of-natural-language-justifications-for-recommender-systems/ .

**Natural-language robustness.** SGD-X, Lee et al. 2022, found sensitivity to alternative schema wordings for two dialogue state models; a motivation for metamorphic tests, not a product-shopping benchmark. https://doi.org/10.1609/aaai.v36i10.21341 . Source dataset licence: https://github.com/google-research-datasets/dstc8-schema-guided-dialogue .

**Local HTTP security.** The demo binds to 127.0.0.1, restricts asset routes, uses controlled JSON mutating requests, checks Origin/fetch metadata, caps sessions and rejects stale revisions. Still, OWASP's CSRF prevention guidance is explicit that simple cookie or origin mitigations do not substitute for layered application security. Do not expose the prototype publicly: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html .

## Real-world diagnostic: language failures discovered

A live browser scenario `I need a water filter for PFAS and lead.` returned only a candidate for PFAS; **lead was omitted**. The UI now keeps the original English request visible and warns **interpretation may be incomplete** even when some candidates are returned. An explicit add/edit workflow allows users to correct missing needs. This is a safety mitigation, not proof that users will reliably notice all missed constraints.

Nine *short developer paraphrases* of original public requests were collected after implementation from separate threads. Their original URLs and outputs are inside `evaluation/phase178/`. Five of the nine generated zero hypotheses: a gas-stove kettle with breakage/material concerns, a rigatoni/bucatini machine with durability needs, a beginner pasta choice emphasizing cleanup, an RO-vs-bottled-water cost/plastic comparison, and a shallow dryer capable of handling a large duvet. Other cases produced only one or two suggestions and may miss major requirements. Original public sources include:

- Gas-compatible durable kettle: https://www.reddit.com/r/BuyItForLife/comments/1uzm833/tea_kettle_recommendations/
- Pour-over kettle and boiling temperature: https://www.reddit.com/r/Coffee/comments/u2xdfw
- Rigatoni extruder and die/durability needs: https://www.reddit.com/r/pasta/comments/1hprs8y
- Beginner pasta-machine learning and cleanup: https://www.reddit.com/r/pasta/comments/1raphgj/what_is_the_best_pasta_machine_to_buy_for_a/
- Filter pitcher vs bottled water and RO cost: https://www.reddit.com/r/WaterFilters/comments/1dk3xzk
- Vacuum for stairs, hair and shoulder limitations: https://www.reddit.com/r/VacuumCleaners/comments/111h4lt
- 60 cm laundry clearance: https://www.reddit.com/r/Appliances/comments/1bci4b2
- Shallow-depth laundry and bulky bedding: https://www.reddit.com/r/Appliances/comments/1w2vsk9/large_capacity_but_shallow_depth_washer_dryer_sets/
- Rigatoni extrusion troubleshooting (not necessarily shopping): https://www.reddit.com/r/pasta/comments/1fydch6

**Methodological discipline:** original posts are user content, not expert proofs of performance. The prompts are short paraphrases, review targets were authored by the same developer, the sample is opportunistic and no blinded dual annotation was conducted. The result is diagnostic failure discovery, NOT unbiased recall/accuracy or a category-level market prevalence estimate. Zero suggestions does not mean an item was formally misclassified against independent ground truth.

## Test results

- **Phase178 targeted TypeScript:** 21 tests passed, including API integration with actual Phase177 decision state.
- **Eligible cumulative TypeScript:** **2,609 passing tests across 138 eligible files** in 13 groups; Phase91/92 suites continue to be quarantined (do not count them as passing or imply an all-files pass). See `evaluation/phase178/regression-ts.json`.
- **Python:** **212 passing tests across six groups**. Historic SQLite `ResourceWarning`s still occur in the companion suite; they are not new Phase178 test failures. See `evaluation/phase178/regression-python.json`.
- **Browser smoke:** Chromium loaded the actual HTML/CSS/JavaScript under a local Playwright bridge to the same tested Node HTTP endpoints. Intake, suggestion, confirm, undo, category change and page layout passed at desktop **1,400 px** and mobile **390 px**, with zero observed JS errors and no horizontal overflow. Direct Chromium localhost navigation was blocked by the evaluation environment's administrator restrictions, so the bridge was explicitly used; this is an instrumented test, **not** a production end-to-end browser/network test or human usability study. Visual evidence: `PEE-Phase178-Desktop-Demo.png` and `PEE-Phase178-Mobile-Demo.png` as separately delivered assets.

## Priorities for Phase179

1. **Semantic completeness and missing-critical-need evaluation:** establish a source-disjoint, professionally annotated English request set, including goals without named categories, two constraints in one clause, negation, original quoted reviews, alternative solution choices and hard-vs-optional priorities. Report missed crucial needs, unjustified candidate/veto and abstention, not only match rate. No fine-tuning against benchmark labels.
2. **Engineering fact registry:** for each admitted need→outcome→mechanism→measurement link, identify original professional protocols, test conditions, source rights, variant lineage and failure modes. Hard gates require source/variant-compatible admitted evidence.
3. **Evidence-backed product comparison adapter:** only display real products through the Phase169–171 source custody/identity/protocol pipeline and known ranking policy. Tests should prove paraphrase invariance and legitimate changes when confirmed needs actually change. Abstain otherwise.
4. **Hardening the site:** durable authorized session storage, actor authentication, robust undo/history and realistic user experience / accessibility assessment. Evaluate whether details-on-demand improve decision correctness and effort, not just persuasion.
5. **Reuse only demonstrably useful OSS:** controlled review-coreference trials of FastCoref against scoped Phase154/175, measured attribution errors and deployment/rights costs before integrating a model. Keep SGD-X as method support rather than direct product-ground-truth data.

The release implements a functional browser **decision UI**, not a mature shopping service. Its most important result is that a working interface and passing tests exposed a serious real requirement-coverage gap.
