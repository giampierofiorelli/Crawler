# Phase 86 — Local AI-assisted source strategy proposals

**Date:** 10 October 2026  
**Version:** Product Evidence Engine 4.14  
**Decision:** In-house acquisition architecture remains in force. No mandatory commercial scraping/search API, no Crawl4AI/ScrapeGraphAI integration, no new ranking/publication shortcut.

## Executive result

Phase 86 connects a configurable **local** Ollama-style language-model interface to the Phase 85 source-specific recipe engine. The model proposes an *association* between names of JSON-LD `Product.additionalProperty` declarations and fields **already approved** in the category registry. It cannot define new fields, select its own source access, approve a recipe, infer a product score or publish recommendations.

**Implemented:** `src/phase86_local_recipe_generation.ts` and `tests/phase86_local_recipe_generation.test.ts`.

The process is deliberately narrower than an autonomous AI website crawler. It is a source-strategy learning step for repeatable technical-specification extraction from structured product pages.

## Actual processing sequence

1. The caller supplies 2–6 distinct product/variant records for the same source, including their exact URLs, model identities, source policies and independently labelled expected numeric specifications. A category registry and per-field context must already have an independent review record.
2. For each sample, Phase 68 plans an acquisition and Phase 69's `readApprovedSource` checks the policy, the robots file, exact host/URL and authorized operations **before reading the page**. If a sample is unavailable or unauthorized the proposal cannot proceed. Merely supplying an `allowed` flag does not bypass Phase 69.
3. Each received page is held temporarily in process memory and parsed for a single exact-model JSON-LD `Product`. A compact, bounded inventory of its `PropertyValue.name` and explicit `unitCode` or `unitText` is prepared. Model input does **not** contain HTML, the article text, numeric product values, or extracted customer reviews.
4. The local model receives those declared property *names/units*, plus identifiers of the existing reviewed fields, and returns strictly formatted candidate `{fieldKey, propertyName}` pairs. It is not permitted to generate arbitrary extraction code or transform units.
5. The proposal is checked against the exact source property names, exact reviewed field keys, units and independently approved contexts. Unexpected model output is rejected.
6. The existing Phase 85 `qualifyProposedRecipe` deterministically checks the resulting source recipe against the original transient pages and human-labelled expected values on at least two distinct models. All required fields must match. A passing result is marked **`ready_for_human_review`**; it is *not* automatically reviewed, published or usable for ranking.
7. Only the Phase 85 reviewed-recipe workflow may store an approved recipe for repeated deterministic extraction. Any later actual data intake remains behind the existing acquisition/rights and evidence-quarantine boundaries.

### Model invocation

```ts
import {createLocalRecipeOllamaModel,generateRecipeFromApprovedPages} from './src/phase86_local_recipe_generation.js';

const model = createLocalRecipeOllamaModel({model:'your-installed-local-model',port:11434});
// Supply existing independently reviewed category registry, source policies,
// approved samples, assessor labels and optional source transport.
const result = await generateRecipeFromApprovedPages({
  scope, samples, asOf: new Date().toISOString(), model
});
// result.status === 'ready_for_human_review' is still not approval.
```

The adapter uses `http://127.0.0.1:<port>/api/chat` and the Ollama JSON response shape. It has a strict model/port configuration, request timeout, bounded input/output bytes and a `temperature:0` suggestion. Model names and responses are untrusted. **No running local LLM was available in the execution environment; the integration was tested through a local HTTP protocol simulator.** The local HTTP endpoint is an interface, not a paid cloud API.

## Why the limited input matters

The original article or webpage is not sent to the model: for technical declarations, only the list of property names and units is required to propose a reusable mapping. This reduces the exposure to source prompt injection, keeps repeated inference cheaper and means no source HTML enters the proposed recipe. The proposal still needs independent human judgement: model suggestions may be plausible but semantically wrong, and an extraction matching labelled values on two controlled pages cannot prove reliability on every future product or variation of the page.

The design explicitly does not infer `Discontinued` from retailer inventory, price, sold-out labels, current stock, or a manufacturer's technical specifications. Lifecycle inference and source legitimacy remain separate.

## Failure cases tested

- Missing website-terms authorization prevents source retrieval and model inference.
- An unmatched host/path or duplicated sample identity is rejected before I/O.
- Unknown field keys, generated units, extra approval fields and attempts to present manufacturer claims as independent testing are rejected.
- An inaccurate independently labelled sample blocks promotion to human-review readiness.
- Wrong product model, ambiguous multiple Product nodes, and changed units do not produce a valid reusable recipe.
- An unreviewed proposed recipe is rejected by the existing ReviewedRecipeStore.
- Local loopback HTTP communication succeeds with a simulated Ollama response, while malformed responses fail closed.
- The returned result contains only candidate mappings, qualification decisions and SHA-256 digests, never stored source text, numeric article excerpts, or model conversations.

## Verification completed

| Suite | Result |
|---|---:|
| JavaScript/TypeScript (full) | **610 passed**, including 17 new Phase 86 tests |
| Python primary sources | **47 passed** |
| Python ingestion | **21 passed** |
| Phase 83/84 evaluation Python | **26 passed** |
| Launch artifacts | **4 passed** |
| Release artifact | **3 passed** |

These are software tests with controlled response data; they do not measure performance, accuracy or throughput of a real local LLM or live website acquisition. A genuine Ollama model, live approved websites, browser interaction and database migrations have **not** been validated.

## Boundaries and remaining work

- This phase only generates deterministic numeric JSON-LD field mappings. Free-text professional reviews, PDF test reports, HTML-only specification tables, ambiguous model variants and unknown categories need separate, carefully bounded strategies; do not overstate the scope.
- Human-labelled reference values must genuinely be provided independently of the proposing model. The code checks structure and label receipts, not actual assessor identity. Production needs authenticated approvals and audit trails.
- The persistent ReviewedRecipeStore remains single-writer local-file based. It does not provide a multi-worker durable job queue or PostgreSQL-backed verified strategy catalogue yet.
- One field mapping that has passed two reference pages may break on another template; monitor extraction failures, source revisions and error rates, and automatically withdraw unreliable recipes pending review.
- To measure source-specific proposal quality, run a blinded evaluation with a **real installed local model**, held-out models, independently labelled values, and a sufficiently diverse set of legitimately accessible publisher/manufacturer pages.
- Source licence, site terms, robots.txt and commercial-use checks are distinct and must be re-evaluated at acquisition, regardless of whether the AI runs locally.

## Technical references

- Ollama API chat endpoint: https://docs.ollama.com/api/chat
- Schema.org `Product`: https://schema.org/Product
- Schema.org `PropertyValue`: https://schema.org/PropertyValue
- Playwright (if later needed for rendering, not integrated in this phase): https://playwright.dev/docs/evaluating
- PostgreSQL JSONB: https://www.postgresql.org/docs/current/datatype-json.html

**Next bounded phase:** Evaluate an installed local model on real authorized pages and compare human-labelled extraction precision/recall and maintenance failures; independently extend strategy support to HTML-only static pages using a proper HTML parser. Keep model approval, source rights and recommendation outputs separate.
