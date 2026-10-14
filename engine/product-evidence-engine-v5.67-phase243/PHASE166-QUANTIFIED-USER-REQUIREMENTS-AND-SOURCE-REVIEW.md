# Product Evidence Engine — Phase 166 / v4.90

## Decision

**Implement an original, small, English-first quantity-to-evidence research bridge** using the existing Phase 125/164/165 user request pipeline, the Phase 145 original-document measurement discipline, and the Phase 97 noncompensatory gating policy. Study all three **user-uploaded** upstream source ZIPs for specific algorithms and licence conditions; **do not add** their packages to the production dependencies and **do not copy** their repositories into the cumulative release.

This phase is engineering work, not an independent benchmark, scientific source authentication, broad natural-language competence, or release of a public product-ranking system.

## Original source inspection and engineering fit

The following source paths were inspected **inside the exact ZIPs uploaded by the user**, not inferred from marketing or a website:

| Archive | Inspected implementation in the provided source ZIP | Practical conclusion |
|---|---|---|
| `Recognizers-Text-master.zip` | `JavaScript/packages/recognizers-number-with-unit/src/numberWithUnit/english/dimension.ts`, `.../extractors.ts`, `.../resources/englishNumericWithUnit.ts` | Uses a unit-lexicon/regex extractor with ambiguous-unit handling, but brings a large multi-package parsing stack. The implemented PEE adapter is intentionally smaller, specifically for typed purchase limits and canonical units. |
| `nlp.js-master.zip` | `packages/ner/src/reduce-edges.js`, `.../extractor-trim.js`, `packages/nlu/src/nlu.js`, English tokenizer package | Edge conflict arbitration and learned intent/classification are relevant; not added because PEE already has scoped request/context rules and lacks independent human-labelled intents for defensible training/evaluation. |
| `wink-nlp-master.zip` | `src/tokenizer.js`, `src/automaton.js`, `src/recursive-tokenizer.js` | Robust tokenisation/pattern automation could help future scope tests but the language model resources are a separate deployment cost; not included now. |

MIT licences, source upload hashes and source names are retained in the technical documentation and licence reference directory. **No actual third-party code from these three new ZIPs was ported in this phase.** The new implementation is original TypeScript, informed by the architecture and tested against PEE's existing rules. Re-evaluate adopting the actual libraries only on the *same independently labelled requests*, considering size, performance, licences, deployability and maintenance. Existing carried code/credits from prior phases are preserved.

Upload archive SHA-256:

- `Recognizers-Text-master.zip`: `52aa5167270c2796218e7fa42f8243e84a5df74d236c430ee8775931e6e60dad`
- `nlp.js-master.zip`: `f14f2d27a639401a58150cfc0415c22cd4ff034636feaea5f30bf548123884b4`
- `wink-nlp-master.zip`: `e114ab1a9d9fb654f6da32cfcb09c8f6ec511641267ead8bb7964ba816648d5f`

Upstream reference URLs: https://github.com/microsoft/Recognizers-Text , https://github.com/axa-group/nlp.js , https://github.com/winkjs/wink-nlp . Technical licence copies: `licences/phase166_upstream_reference_only/`. **No public-facing third-party credit banner added.**

## Work actually implemented

**New module** `src/phase166_quantified_evidence_bridge.ts`, exported in `src/index.ts`:

1. `auditQuantifiedRequest166(question)` extracts bounded **English** quantified candidate constraints with UTF-16 original text spans, polarity (`<`, `<=`, `>`, `>=`, inclusive range), unit conversion (length `mm/cm/in/metres → cm`, mass `g/kg → kg`, capacity `mL/L → L`), acoustic A-weighting (does **not** confuse `dB` with `dBA`), and explicit currencies without inferring exchange rates or location. Result remains user-meaning **unconfirmed**.
2. Scoped lexical attachment can disambiguate **width, height, depth, capacity, weight, noise and price** where the question actually supports it. A bare `under 35 cm`, an unqualified `45 dB`, unsupported `quarts`, reversed intervals, incompatible ranges or an explicitly negated comparator remain unresolved. Approximate or preference language does not silently become a hard filter. Canonic constraint fingerprints identify explicitly supported equivalent quantity paraphrases without granting ranking parity to unrelated meanings.
3. `screenQuestionEvidence166` reads **only explicitly supplied evidence rows** and produces source-anchored provisional statuses for each product: candidate-fit, candidate-failure, missing evidence, incompatible test protocols, conflicting measurements or unresolved intent. Requires original-test *structural* receipts but **does not independently authenticate** the site, the reviewer or the asserted receipt. Bad row shape, impossible type/unit pairs, wrong product IDs, repeated rows and mismatched question hashes fail closed. Original review price is not trusted as a current market offer. **No automatic exclusion, approved scientific DB write, public recommendation or ranking is permitted.**
4. `advanceAndPlanRequest166` invokes **the existing Phase 164 conversational request processor** (which already incorporates the Phase 165/154 scoped modifier graph) and then the new quantity/evidence bridge. Italian remains outside the quantitative adapter rather than being claimed supported.
5. Reproducible offline engineering examples in `scripts/phase166-constructed-examples.mjs` and `evaluation/phase166/PHASE166-CONSTRUCTED-EXAMPLES.json`. **All questions, measures and URLs in this diagnostic are synthetic.** No products were actually tested or compared, and no online source acquisition occurred.

**Boundary with Phase 145:** Both use explicit physical dimension concepts and distinguish original observations from claims, but currently use different canonical unit conventions (`mm` / `mL` in Phase 145 versus `cm` / `L` at the Phase 166 request boundary). The conversion is defined here; a fully audited Phase145-to-Phase166 adapter with validated subject/variant associations is still required. Do not falsely claim direct ingestion of Phase145 output in this release.

## Verification

- `npm run build`: passed.
- `npm run test:phase166`: **36/36** new focused TypeScript tests passed, covering normalisation, contradictions, negation, missing sources, source kind and protocol distinctions, fallbacks, authenticity safeguards, and original query hash binding.
- Eligible existing and new TypeScript corpus: **2,165/2,165** tests across **125** files in 12 separately executed groups, with the previously documented historical Phase91/Phase92 suites still excluded.
- Python checks: **103 passed** (47 primary source + 21 ingestion + 35 companion Python suite).
- Offline diagnostics: **12 synthetic request inputs**, two synthetic product evidence screens. These are **not independently annotated** cases and not GLiNER inferencing.

### Critical limits

- No independently annotated organic users; zero validated real-world precision/recall.
- No new GLiNER2.5 neural inferencing; user remains on iPhone and the model weights cannot currently be hosted here.
- No confirmed product universe, verified reviewer permissions/authentication, current price feed, market-exhaustiveness claim, or ready-to-publish ranking.
- Hard constraints require user confirmation; similarity fingerprints cannot establish general linguistic equivalence.
- Numeric grammar intentionally incomplete: contextual/nonlinear tradeoffs, dynamic currency conversion, region-specific product sizes, some range expressions and alternate household-size phrases still need broader coverage and independent evaluation.

## Phase 167 priorities

1. Connect Phase145 verified-source intake and entity/variant identity to the Phase166 quantity criteria through a quarantined, provenance-preserving adapter, **without pretending a reviewed claim is an authenticated independent test**.
2. Add deliberately adversarial, independently annotated organic English user requests and explicit metamorphic paraphrase tests before ranking changes.
3. Bridge all confirmed *qualitative and numerical* requirements to authorized retrieval, independent test comparability, and existing Phase97/99 non-compensatory gates; abstain on incomplete coverage.
4. Source current prices from an explicitly authorized market channel; source snapshots and timestamps are mandatory.
5. Defer full remote GLiNER worker deployment until a real computer/server is available; other development proceeds.
