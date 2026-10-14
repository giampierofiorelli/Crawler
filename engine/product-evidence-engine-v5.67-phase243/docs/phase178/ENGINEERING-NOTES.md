# Phase178: web-first decision surface and external diagnostic

**Status:** functioning English-first *local browser research prototype*, not a production website, accessibility-certified site, evidence-admitted ranking service or independently benchmarked adviser.

## Implemented architecture

- `web/phase178/index.html`, `style.css`, `app.js`: native accessible-leaning browser interface for free English goal entry, provisional suggestions, explicit confirmation, essential/high/normal/low priorities, set aside/denial, user-entered typed criteria, goal/scope revisions, one-step undo, and visible method/evidence cautions. Responsive tested at 1400 px desktop and 390 px mobile. No framework/npm runtime addition or external CDN. Browser strings and UI are English.
- `src/phase178_site_server.ts`: actual local HTTP API and static asset server. Node 22, binds to 127.0.0.1, requires JSON mutating POST, origin/fetch-metadata checks, isolated random in-memory sessions, revision preconditions, and no API granting product rank/exclusion. Browser does not submit authoritative snapshots; server retains Phase177 canonical state. Session exists only in memory and disappears on refresh/server restart. No secure authentication, no long-term persistence, no transport encryption: development only.
- `scripts/run-phase178.mjs`: run local research prototype (`npm run demo:phase178`). The local browser may be blocked in restricted evaluation environments; a Playwright bridge test was used to execute actual browser JS while a Python test process relayed HTTP requests to the same local server.
- `tests/phase178_web_surface.test.ts`: local API/property/security/safety contract tests.
- `evaluation/phase178/external-public-post-diagnostic-inputs.json` and `external-public-post-diagnostic-results.json`: links to nine independently located public discussions, developer-authored short paraphrases and explicit review targets, tested after the web code was written. NOT blinded annotation or real-user sampling; outputs MUST NOT be described as a statistically valid measured accuracy. Original thread texts are not reproduced.

## Key empirical engineering finding

In the browser trial, “I need a water filter for PFAS and lead” yielded just the PFAS research candidate. The lead concern was not separately mapped. The UI therefore includes an immediately visible warning that important original needs may be missing, even when some suggestions were generated. This is a critical *language coverage failure*, not a reason to allow the browser to silently add a hard requirement. The original request remains visible, with controls to explicitly add overlooked criteria.

The nine external developer-paraphrased cases produced zero suggestions in five cases (gas stovetop kettle, rigatoni home extruder, beginner pasta cleanup, cost-constrained bottled-water alternative and shallow dryer). This is a targeted **failure discovery** diagnostic; neither case selection nor reviewer labels were blinded. The next phase needs truly separate English annotation and specialist category assessment, rather than an endless rule list.

## Research and provenance

- Nielsen Norman Group, *Explicitly State the Difference Between Options*, Aug 2024: https://www.nngroup.com/articles/explicit-differences/ . Design principle for highlighting meaningful differences, NOT product-specific efficacy study. Real PEE product comparison intentionally not created without admitted product evidence.
- NN/g, *Ecommerce UX Product Pages* and *Search, Filters, and Routing Pages* methodology and layered information: https://www.nngroup.com/reports/ecommerce-ux-product-pages-including-reviews/ ; https://www.nngroup.com/reports/ecommerce-ux-search-including-faceted-search/ . Research covers shopping sites; transfer to PEE is unproven.
- W3C WCAG 2.2, **2.5.8 target size**, **3.3.1 error identification**, **4.1.3 status messages**: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum ; https://www.w3.org/WAI/WCAG22/Understanding/error-identification ; https://www.w3.org/WAI/WCAG22/Understanding/status-messages . Native labeled controls, live status updates, large controls, keyboard focus and no hidden consequential cautions; no formal accessibility audit is claimed.
- Balog, Radlinski and Petrov, CHI EA 2023 (n=129): explanation bias can affect recommendation selections, so do not optimize only persuasion or confidence. https://research.google/pubs/measuring-the-impact-of-explanation-bias-a-study-of-natural-language-justifications-for-recommender-systems/ . Their domain/results are not direct measured effect sizes for PEE.
- OWASP CSRF Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html . The loopback demo implements some boundaries; they are NOT a substitute for production sessions/authentication/CSRF/threat modelling.
- SGD-X, Lee et al., AAAI 2022: https://doi.org/10.1609/aaai.v36i10.21341 . Sensitivity to semantically equivalent schema phrasings motivates metamorphic testing, but is not evidence of PEE user-need accuracy. No dataset weights or licensing-sensitive archives were integrated.

## Historic code genuinely reused

`src/phase178_site_server.ts` calls the **existing** `phase177_decision_snapshot` canonical builder/action/undo/diff and `phase177_web_intake` adapter; the latter delegates to Phase175, Phase174, Phase173, Phase172, and optional bounded Phase176 scope guard. Phase154/context techniques also remain in the Phase175 path. Phase169–171 source/identity/test-protocol evidence admission is **not** bypassed. FastCoref and SGD-X remain research sources, not UI/runtime dependencies. No inference from downloaded weights was performed.

## Risks and limitations

1. No actual ranked products, product prices or test results; product comparison region is an explicit absence notice. Neither criteria confirmation nor a ``hard`` priority can authorize a product exclusion.
2. English goal parsing remains brittle; omitted, misattributed or incompletely mapped needs are possible. Do not infer completeness from the candidate count.
3. User-revision IDs and SHA-256 fingerprints are **not** authenticated credentials or tamper-proof signatures.
4. Single user local demo, ephemeral anonymous sessions, no real DB, data privacy/access-control guarantees, production front-end stack or HTTPS. Server is bound to loopback only.
5. One-level undo is implemented. Multi-version history/branching and server-issued signed edits are future work.
6. Browser screenshots and action simulation are instrumentation, not a usability trial with real customers. WCAG formal assessment remains open.
7. Production needs validated need-to-mechanism registry, source and variant-provenance engine, expert gating and deterministic rank differences before displaying winners.
