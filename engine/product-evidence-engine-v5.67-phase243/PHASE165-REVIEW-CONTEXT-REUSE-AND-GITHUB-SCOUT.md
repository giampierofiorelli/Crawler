# Product Evidence Engine — Phase 165 / v4.89
## Reuse of professional-review context algorithms for user requests; targeted GitHub scout

**Status:** implemented and deterministic engineering tests passed. This release does **not** prove general natural-language understanding, annotation-independent performance, product recommendations, professional-source authenticity, or deployability of GLiNER2.5.

## Objective, decision

User asked to continue development on **user questions**, and to investigate whether the linguistic algorithms previously used for **review interpretation** could be reused or whether specific GitHub projects offered better components. No desktop or repeated phone/Colab inferencing is required or requested.

**Decision:** reuse PEE's already-adapted Phase154 context graph now; do not create a parallel NLP engine and do not add third-party packages until a measured, rights-checked comparison proves that they improve request interpretation.

## Source material actually inspected

- Cumulative v4.88 archive, including Phase164 user journey, Phase125 composition, Phase127 stateful clarification, Phase128 category brain, and Phase154 `buildContextGraph154` from the existing medSpaCy-inspired port.
- Installed local source/technical license corpus from previous stages; all historical release artifacts preserved.
- Online GitHub repository descriptions and licenses for the three candidates linked below; **did not download, execute, or evaluate their full code and weights**.
- Prior phases 141/142/151 scoped document lexical recovery were examined as examples of evidence-span discipline, but are **not** falsely claimed reused wholesale for user requests. Their review-specific subject/referent logic needs a separate adaptation.

## Reused engineering component

`src/phase154_context_graph.ts` already contains a deterministic, scoped modifier-to-target graph, adapted earlier from medSpaCy's ConText algorithms, with sentence boundaries, overlapping trigger pruning, explicit termination boundaries, substring-safe matching, span offsets and bounded work.

`src/phase165_request_context_audit.ts` now applies it to English user requests with a **separate domain-specific rule set**. It does not use clinical vocabulary. It reads schema aspect aliases, produces source-anchored aspect spans, annotates modifiers (`REQUIRED`, `OPTIONAL`, `EXCLUDE`, `PREFERRED`), and compares them to Phase125's candidate interpretation. All extracted meanings and corrections remain unverified candidates. Review-source restrictions are masked in place when necessary so a phrase such as `no customer reviews` does not negate a later product feature.

`src/phase164_user_request_journey.ts` is connected to this audit **before committing new preferences to conversation memory**. Simple, unambiguous explicit cues can correct *candidate-only* state:

- `must have a steam wand` → candidate mandatory feature (`required`) instead of weak requested capability;
- `don't need a steam wand` / `no need for a steam wand` → candidate optional (removes inappropriate positive requirement);
- `without a steam wand` → exclusion, with offsets and lexical trace.

Truly unresolved forms (`not too noisy`, `under 35 cm`, `not a steam wand`, uncommon source requirements) are flagged for review. Unsafe interpretation does not overwrite previous conversational constraints. This also applies to follow-up edits. Incoming caller-provided category definitions remain **only structurally** vetted by existing interfaces; no scientific category endorsement implied.

**Caveat:** these are bounded lexical rules, not a general syntactic/semantic parser. A confidence estimate/verified paraphrase-equivalence model has not been added. Terms such as "and", "or", modal clauses, implicit comparisons, temporal budget revisions, priority inversions, unit equivalence and complex coreference still require broader evaluation. Candidate output must not authorize rankings.

## Evaluations and reproducibility

- `npm run build` — passed using existing compatible developer toolchain (`TypeScript` and `@types/node`; temporary local symlink not distributed).
- `npm run test:phase165` — **16/16 new targeted tests passed**.
- Phase164 **21/21** targeted tests passed after connection.
- Eligible cumulative TypeScript suite — **2,129 tests in 124 files**, 11 bounded groups, all passed, **excluding the two historical Phase91/92 suites** as already documented in previous releases.
- Python suites — 47 `primary_sources` + 21 `ingestion` + 35 `tests-python` = **103 passed**.
- `node scripts/phase165-evaluate-contrasts.mjs <new-output-path>` — **42/42 expected behaviours matched** with constructed, developer-labelled English contrast cases across requirements, negation, contrast, source policies, dimensional limits and scalar qualifications. This is **NOT** a blinded organic user benchmark; it measures anticipated rule behaviour and has zero independently annotated requests. Output has no product truth and no neural inference.

### What these tests do NOT show

No generalization estimate, precision/recall on organic questions, qualitative judgement of users' real needs, cross-domain equality, cross-lingual support, verified expert-source data, products tested/ranked, speed of an external GitHub library, or executed GLiNER2.5 checkpoint. A harmless rule repair can still be linguistically wrong in an unfamiliar construction. The conservative review gate is essential.

## Targeted external GitHub investigation — sources and decisions

| Candidate / verified upstream links | Supported functionality described upstream | Commercial/licensing and PEE decision |
|---|---|---|
| **wink-nlp**: https://github.com/winkjs/wink-nlp ; https://github.com/winkjs/wink-nlp/blob/master/LICENSE ; language model details https://winkjs.org/wink-nlp/language-models.html | English tokenization, POS, named entities, sentence boundaries, negation flags, custom entities and compact English models. | MIT; **best later lightweight challenger for negation/POS/token-level disambiguation**, but needs model package and direct same-test-text comparison. NOT added as dependency. |
| **Microsoft Recognizers-Text**: https://github.com/microsoft/Recognizers-Text ; https://github.com/microsoft/Recognizers-Text/blob/master/LICENSE ; readme https://github.com/microsoft/Recognizers-Text/blob/master/README.md | Numeric values, ranges, currency, dimensions and temperatures; JavaScript/TypeScript packages available, English support. | MIT; **strong later challenger for exactly the unresolved quantified dimension and budget expressions**. Integration should be an optional structured-number adapter, not a complete replacement for the product-intent engine. NOT installed, code not ported here. |
| **NLP.js**: https://github.com/axa-group/nlp.js ; https://github.com/axa-group/nlp.js/blob/master/LICENSE.md ; node package https://github.com/axa-group/nlp.js/blob/master/packages/node-nlp/package.json | Intent classifiers, entity extraction, sentiment, slot-filling; package builds on multiple NLP components. | MIT; **defer** until real human-labelled request corpus exists, because a classifier trained on developer-written utterances might score well on those utterances without generalizing. Larger package/dependency burden must be reviewed. NOT installed. |

This is a **capability and engineering-fit shortlist**, not measured competitor accuracy. Third-party license obligations matter if actual code is adopted. Existing Phase154 medSpaCy-derived internal attribution/LICENSE remains unchanged; nothing is added to the visible PEE site. Product core code remains private.

## Files changed

- NEW `src/phase165_request_context_audit.ts` (reuses existing bounded review context graph).
- MODIFIED `src/phase164_user_request_journey.ts` (audit before committing candidate constraints).
- MODIFIED `src/index.ts` (exports bounded audit).
- NEW `tests/phase165_request_context_audit.test.ts` (16 tests).
- NEW `research/phase165/PHASE165-CONSTRUCTED-CONTRASTS.json` (42 documented developer cases).
- NEW `scripts/phase165-evaluate-contrasts.mjs` (reproducible constructed diagnostic, refuses overwrite).
- MODIFIED `package.json` (v4.89, added `test:phase165` only; no new runtime dependencies).
- Documentation, audit and release verification artifacts added. No external source ZIPs/models bundled.

## System boundaries and next priorities

1. **Independent organic English-user question benchmark.** Blind human adjudication must check negation, modality, priorities, must-haves, single-household fit, source quality restrictions, bare comparatives, changed budget, and same-meaning paraphrases. The 42 constructed contrasts cannot stand in for it.
2. **Quantity adapter decision** against `Recognizers-Text` on the same verified inputs. Current `under 35 cm` is explicitly *unresolved*, not a parsed dimensional limit. Similarly, an explicit monetary budget in Phase125 remains bounded.
3. **Evidence bridge:** map verified requirements into legitimate independent original-source retrieval, evidence eligibility, comparability, exclusions, candidate-universe completeness and deterministic ranking, allowing abstention when coverage is inadequate. No scientific DB writes or ranking changes from hypotheses.
4. Revisit learned language models/GLiNER2.5 only when there is a reachable persistent host; do not require repeated phone notebook tests.

All numbers are engineering-regression figures, not independent product accuracy measurements.
