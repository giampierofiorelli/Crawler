# Product Evidence Engine — Phase 191 Technical Report

**Date:** 13 October 2026  
**Canonical base:** PEE v5.14 / Phase190  
**Target release:** PEE v5.15 / Phase191  
**Status:** Research-only source-integrity and sparse-evidence overlay. No public ranking admission.

## Executive outcome

The Phase191 module (`src/phase191_sparse_source_integrity.ts`) prevents two opposing errors: (1) making a product disappear or scoring it as poor when it has sparse/missing documentation; (2) treating an attributed marketing assertion, reseller quote or brand-commissioned test as a publisher-performed independent experiment. It is a read-only extension of the exact-product, exact-method Phase189 research dossier and reuses the Phase189 threshold assessor. It does **not** replace Phases169–171 rights/source admission, Phase181 on-demand ranking, Phase187 signed field policy or Phase188 provenance graph.

Unlike crude trust scores, it tracks **what the source is** and **who produced the individual claim**, separately. Publisher ownership, commercial funding or affiliate programs, sample procurement, test protocol and claim origin are orthogonal dimensions. A publisher's affiliate disclosure is not automatically proof of fabrication; the absence of advertising disclosure does not automatically establish independence. A manufacturer can publish technically useful specs even if no independent testing exists. The system retains these facts with explicit provenance and provisional labels. It never imputes missing performance to zero.

## Actual code change

New original TypeScript, no new runtime dependency:

- `SourceContext191`: the editor/owner identity relationship, funding disclosure, method disclosure, whether the product was loaned/gifted/purchased, traceability of the source-level annotation.
- `RecordOrigin191`: **per individual claim**, identity of its originating tester or reporter, whether the method was manually traced. This catches **source laundering**: an editorial site repeating a brand's laboratory claim is not a second or independent experiment.
- `inspectSparseEvidence191`: returns every candidate, including entirely unseen exact variants or categories, with `knowledgeState`, `visibility`, coverage of distinct original groups, cautionary signals and next research actions.
- Only results reported as original tests, on the exact method and field and with manually traced authorship, may enter *research-only bounded field comparisons*. An official registry may provide an appropriately scoped registry observation, not proof that it replicated independent laboratory work.
- Marketing claims cannot create false original-lab disagreements. Genuine disagreement between commercial and original-lab figures is flagged for investigation. A separate disagreement between eligible original measurements leaves the field contested. Missing exact-field test = `not_yet_documented`, never product failure.
- Every finding explicitly contains `rankingPermitted: false`, `absenceMeansPoorPerformance: false` and `sourceNatureNotProofOfTruth: true`.

**Important epistemic limit:** all classifications of actual review pages are analyst annotations; the code validates *internal consistency*, not authenticity, funding disclosures, original publisher files, benchmark protocols or publisher intellectual-property rights. `manually_traced_to_original_method` is not a scientific certification, and no synthetic fixtures prove deployment suitability.

## Categories and evidence

- **Aspirapolvere:** prior Phase189 hand-annotated RTINGS reviews of Dyson V15 Detect and Shark Stratos Cordless. Field-level noise/airflow measurement; editorial interpretations cannot multiply original observations.
- **Laptop:** prior manually annotated Notebookcheck Lenovo ThinkBook 16 G7 QOY battery testing and a source-reported loaned review unit; battery under the recorded Wi-Fi test is not gaming endurance.
- **Headphones:** prior SoundGuys Bose Headphones 700 frequency-specific sound attenuation; a frequency point is not a general ANC score.
- **Dehumidifiers (fixture only):** entirely unknown model, manufacturer-listed capacity, retailer information, sponsored editorial numerical claims and contradictory advertising values. These are synthetic regression examples, **not real reviews**.

The reproducible script `scripts/phase191_demo.mjs` writes `evaluation/phase191/source-ecology-research-demo.json`. It preserves all four candidates even though one has no known original sources. Data from the three publications are Phase189 manual annotations, not newly retrieved content.

## Methodological evidence consulted

1. [Cochrane Handbook, Chapter 7 — considering bias and conflicts of interest](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-07). The methodological analogy is to separate *bias*, *precision*, *directness*, *funding* and *missing results*; there is no universal review-count threshold and a funding disclosure alone is not an outcome-specific risk-of-bias score. This is not a direct clinical-GRADE transfer to consumer products.
2. [US FTC, Endorsement Guides](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking) — material commercial ties, including affiliate links, should be disclosed and can alter consumer interpretation; their presence does not make every underlying measurement false.
3. [UK ASA/CAP, recognition of marketing communications](https://www.asa.org.uk/type/non_broadcast/code_section/02.html) and [Affiliate marketing guidance](https://www.asa.org.uk/advice-online/affiliate-marketing.html) — criteria for identifying marketing/editorial advertising; not an automatic test-validity rubric.
4. [W3C PROV-O](https://www.w3.org/TR/prov-o/) — provenance and derived-from links; concepts adapted via existing Phase188/189 evidence lineage.
5. Professional original review/method pages already documented in Phase189–190: [RTINGS Dyson V15](https://www.rtings.com/vacuum/reviews/dyson/v15-detect), [RTINGS Shark](https://www.rtings.com/vacuum/reviews/shark/stratos-cordless), [Notebookcheck ThinkBook](https://www.notebookcheck.net/More-than-24-hrs-battery-life-for-less-than-1-000-Lenovo-ThinkBook-16-G7-QOY-laptop-review.958162.0.html), [SoundGuys Bose 700](https://www.soundguys.com/product/bose-headphones-700/).

## Tests, limitations and next step

Targeted TypeScript tests include: category unknown, variant unknown, manufacturer-only specs, retail affilation, sponsored content, publisher copying manufacturer numbers, apparent lab claims with untraced method, affiliate-flagged original experiments, editorial review loaned sample, qualitative hands-on observations, conflicting originals, conflicting promotion vs eligible original, protocol/condition mismatches, dependency-group deduplication, required gaps, input tampering, deterministic order and false source classification.

Full cumulative eligible TypeScript and Python regressions are reported separately in `evaluation/phase191/regression-{ts,python}.json`. As previously, historic Phase91/92 suites are not part of the eligible test contract. Their exclusion is not proof they would pass.

**Missing before a scientifically usable shopping decision:** independently reviewed source custody, verified exact retail variant and manufacturer relationship, calibrated decision criteria, source rights, source coverage recall (including inconvenient negative results), independently created blinded gold labels across multiple categories and measurable improvement over baseline, especially product inclusiveness and wrong hard-veto rate. A single original test can support a narrow observation but not an overall best-in-market label. Public ranking stays blocked.

## Architecture to preserve

The **central asset is versioned product knowledge** (not cached rankings). Source identity and claim origin are mutable annotations requiring review and conflict tracking; no existing reviewed fact is overwritten silently. Different user criteria can produce different rankings *only after evidence admission*, and products with sparse observations remain in the knowledge/catalogue candidate set with appropriate limits. The future first-screen explanation must include important unknowns visibly rather than conceal them in optional details.
