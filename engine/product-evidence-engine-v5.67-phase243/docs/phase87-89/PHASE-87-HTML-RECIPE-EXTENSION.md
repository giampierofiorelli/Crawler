# Product Evidence Engine — Phase 87: HTML-only manufacturer-specification recipes

**10 October 2026 | status: independently executable companion module, pending v4.14 integration**

## What was actually developed

The last confirmed mainline is v4.14, Phase 86: local Ollama-style proposals for numeric schema.org `Product.additionalProperty` names, verified against 2–6 independently labelled product samples and subject to separate human review. The v4.14 ZIP was located in the user's Library but the current tools returned `This Project file does not have an authorized raw-byte materialization path`. It could be read as a file record but **not opened, checked out or merged**. Accordingly, this delivery does NOT claim to be v4.15 or a completed integration/release of the entire engine.

The separate Phase 87 module extends deterministic extraction to static manufacturer HTML with NO JSON-LD by using Python's standard-library `HTMLParser`. It supports:

- `<table><tr><th>label</th><td>number unit</td></tr>`, including plain `<td>` pairs;
- `<dl><dt>label</dt><dd>number unit</dd></dl>`;
- short `<p>` and `<li>` content in exact `label: number unit` form;
- two-child labelled specification cards where the container class clearly indicates a specification/details block.

No arbitrary execution of model-generated CSS, selectors, XPath, Python, JS or scripts. No web-wide crawling or paid search/scraping API. The existing local-LLM interface can be reused conceptually. A separate strictly loopback Ollama protocol adapter is included because the v4.14 source could not be imported. This is a low-level complement, not a framework substitution.

## Procedure: discover once, validate, review, reuse

1. **Authorized read upstream:** The existing Phase 68 acquisition plan and Phase 69 `readApprovedSource` remain mandatory. The HTML must have been read only after exact source host/path, publication rights, robots, website terms, applicable purpose and operations pass their existing checks. Neither `phase87` nor its CLI performs that authorization or any general web fetch. A user-provided `labelled_by` string is NOT proof of legal clearance or of genuine assessor identity.
2. **Parser inventory:** The isolated HTML parser requires one exact product model in one visible `<h1>`. It gathers *only* numeric explicit-unit candidates and canonicalizes limited unit aliases (e.g. `hours` → `h`, `hr` → `h`) without converting values. Ambiguous sizes, ranges, marketing qualifiers, missing units, unsupported languages or units, and duplicate candidate IDs cannot qualify.
3. **Tiny model input:** The model sees a bounded JSON object containing candidate ID, label, structural kind and unit, along with already reviewed field keys and units. **No HTML, page URL, product name, number, review content, offer, price, availability or purchase intent** enters its input.
4. **Suggestion:** An explicitly invoked local Ollama call proposes only `{fieldKey,candidateId}` associations. The temperature is set to zero. Responses are untrusted and must match known field/candidate IDs. It cannot define fields or invent values/units. No external API endpoint is used.
5. **Qualification:** 2–6 distinct named models of the same reviewed source/scope must reproduce each required numeric field's **independently supplied reference value**, in precisely the reviewed units and without duplicate labels. The result is `ready_for_human_review`, never an approval.
6. **Review:** A second reviewer, distinct from the named example labellers, must approve the bounded source-specific recipe. The test harness accepts a receipt string, but **does not authenticate the human or validate the organizational approval process**. Production must use the existing user/account audit and authorization controls.
7. **Memory/reuse:** A companion SQLite store retains approved, checksummed recipe definitions only. Each authorized page can then be extracted deterministically, without asking the LLM again. Runtime output is `manufacturer_declared` and `quarantined_not_independently_tested`. Source metadata and exact URLs are returned only to the authorized caller; the SQLite store retains no HTML, article text, parsed product values, page snapshots, review summaries or model conversations.
8. **Failure and retirement:** Two consecutive `recipe_missing_or_ambiguous_field` errors suspend the stored recipe. This is a conservative *engineering default to be measured*, not a scientifically validated threshold. No auto-learning on failure and no self-approval. On repair, requalify against a fresh independent reference set and obtain a new human review. A structural extraction success resets the failure counter, **but does not prove the extracted value is semantically true**.

## Trust boundaries

```text
Phase 68 acquisition plan
       ↓
Phase 69 readApprovedSource + source policies/robots/rights     [MANDATORY]
       ↓ authorized transient HTML only
Phase 87 bounded HTMLParser → numeric candidate inventory
       ↓                                   ↓
   if reviewed recipe exists                otherwise: explicit local model proposal
       ↓                                   ↓
   deterministic extract           independently labelled 2–6 models
       ↓                                   ↓
   structural checks                ready_for_human_review
       ↓                                   ↓
   manufacturer-claim quarantine    separate authenticated operator review [NEEDS MAINLINE WIRING]
       ↓                                   ↓
   Phase 72 semantic intake         reviewed strategy memory [NEEDS MAINLINE WIRING]
       ↓
   NEVER pretend a declaration is an original independent test
```

Unlike the code that actually passed the companion unit tests, **connecting that diagram to the real mainline is not verified**; exact Phase 69 and Phase 72 signatures are unavailable here. Nothing in this patch disables the previous guards or changes the ranking, public publication or lifecycle/discontinuation decisions. No affiliate-link or price feed is added.

## Usage (run independently before integrating)

```bash
cd product-evidence-engine-phase87-patch
python -m unittest discover -s tests -v
python -m phase87.demo
```

From the extracted v4.14 repository, optional **non-destructive source copy only**:

```bash
bash product-evidence-engine-phase87-patch/scripts/apply-to-v4.14.sh /path/to/product-evidence-engine-v4.14
```

`phase87/phase87_client.ts` is a TypeScript Node ESM bridge that calls the Python module through a bounded stdin/stdout JSON protocol. It has been exercised under Node 22's `--experimental-strip-types`. Calling `phase87Call('extract_stored', ...)` must happen **only after** the existing Phase 69 reader authorizes the exact URL and obtains the HTML. The CLI does not access public websites. A future integrated adapter must preserve the Phase 85 reviewed-store contract and be validated through the full 610-test JS/TS suite, 94 existing Python tests and both launch/release suites. Running `apply-to-v4.14.sh` does not claim that integration has occurred.

### Example staged JSON calls

`phase87Call('inventory', {samples, host, prefix, fields})` returns label metadata. An LLM call is intentionally **not automatic**; the orchestration layer explicitly calls `phase87Call('suggest', {inventory, model:'installed-ollama-model', port:11434})` only while a source has no approved recipe. The caller then invokes `phase87Call('qualify', {samples, host, prefix, category, fields, proposal})`. A separately approved result is submitted to `phase87Call('review', {recipe, reviewer, review_receipt})`, stored with `phase87Call('install', {db_path, recipe})`, and subsequently used via `phase87Call('extract_stored', {db_path, recipe_id, url, model, html})` without `suggest`. `status` returns suspension state. The reviewer receipt must come from a real authenticated approval workflow in production, not free-form customer input.

## Actual test status and important limitations

- **36/36 Python standard-library unit tests passed**, including HTML forms, model identity, unit mismatches, duplicate labels, multiple scope failures, unaudited approval, SHA-256 tampering, SQLite persistence/suspension, bounded HTML, and a **simulated** loopback Ollama response.
- A TypeScript bridge successfully invoked the Python inventory with Node 22's experimental type-stripping support. This is an interface smoke test, not the v4.14 full suite.
- **No real Ollama model was called.** **No external manufacturer or professional-testing website was fetched** and no live approval/rights decision was exercised. There is no empirical precision/recall or drift-recovery performance claim.
- This parser deliberately requires exact visible `<h1>` identity, explicit numeric units, and one numeric value per field. It rejects many real manufacturer layouts. Dynamic JavaScript, PDFs, translated units, nested comparison grids, localization, unit conversion, variant selectors, image-based specs, measurements with uncertainty, and prose specifications are not yet supported. For HTML5 misnested tag recovery, the Python parser is not equivalent to the HTML5 parse5 algorithm. These constraints prevent overstating supported coverage.
- SQLite is a **standalone compatibility-store prototype**. The authoritative multiworker/production strategy store, signed review receipts, source-policy recheck at every read and the category/field registry must be integrated with v4.14 rather than silently replaced. The absence of a vendor-verified provenance chain means parsed claims cannot produce a public recommendation.
- Product inventory, pricing, retailer availability or a schema.org `Discontinued` value **do not establish actual manufacturer retirement**. Confirmed retirement remains subject to the previously developed authoritative Phase 81 process.

## Suggested next bounded development after mainline integration

1. Reopen the actual v4.14 archive and wire this companion behind `readApprovedSource`, using known Phase 85 reviewed storage and Phase 72 quarantine contracts. Run **all** original tests and new tests and package a verified cumulative v4.15. Do not infer API shapes from this documentation.
2. On an authorized set of live manufacturer pages, independently annotate exact models and declared fields. Log unsupported-layout rate, false positives, wrong variant attribution, changes in labels/units, local model proposal accept/reject rates, and time/cost per source. Keep rights/robots refusals in the evaluation denominator.
3. Broaden HTML coverage where real failures justify it: nested tables, semantic microdata, non-English units, multi-variant pages, optional HTML5 parser such as parse5, and JS rendering via Playwright **only when necessary and authorized**. Do not introduce a complete external crawler unless a measured quality/cost advantage warrants it.

## Referenced technical specifications

- Python standard library `html.parser`: https://docs.python.org/3/library/html.parser.html
- Python standard library `sqlite3`: https://docs.python.org/3/library/sqlite3.html
- Ollama local chat protocol: https://docs.ollama.com/api/chat
- Schema.org Product: https://schema.org/Product
- Playwright documentation: https://playwright.dev/docs/evaluating
- OWASP SSRF prevention (Phase 69 caller scope): https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html

*These URLs identify interfaces and security concepts; no fresh review of current pages or real-world external evaluation is claimed.*
