# Product Evidence Engine — Phase 59
## Manufacturer declarations vs independent tests: evidence hierarchy, source quality, and missing data
**Research and implementation date:** 10 October 2026  
**Scope:** Consumer-product personalised recommendations; UK-first, retailer-independent; **research-only implementation**.

## Executive decision
**Retain manufacturer specifications and declarations as inputs**, but never disguise them as independently observed performance. When professional testing is missing, manufacturer information can inform descriptive facts, provisional screening and follow-up questions, **not a confident performance claim or hidden inflated ranking score**. When independent tests exist, they inform performance in the exact conditions studied; the manufacturer statement is retained separately so the user can see any difference. An untested feature is **unknown**, not poor. Avoid a universal 70/30 split; source trust is conditional on the *claim, unit, conditions, independent verification, applicability and data quality*.

### What the sources actually establish
1. **RTINGS, *How We Test Headphones* (updated March 12, 2026)**. The original testing lab explicitly distinguishes manufacturer specifications used as an expectation/baseline from actual measured real-world performance. It standardizes conditions across reviewed headphones and notes that features can work differently in specific configurations. Therefore treating a spec as equivalent to a tested outcome is inappropriate. https://www.rtings.com/headphones/learn/how-we-test
2. **RTINGS, *Battery Life Of Headphones* (updated March 6, 2025)**. The lab documents a specific continuous-playback procedure (85 dB SPL; ANC enabled where applicable). It also explicitly states that *Additional Charges* of the case are manufacturer-reported **and not validated**. Thus an apparently coherent review may legitimately mix measured values and manufacturer claims. Our extraction must keep field-level origin. https://www.rtings.com/headphones/tests/active-features/battery-life
3. **European Commission, EPREL — measured, declared, published**. Within the EU energy-labeling regulatory system, manufacturer measurement, declared values for market surveillance, and published buyer-facing values can legitimately differ. A regulated declaration is not the same thing as an independent market-sample test. Applicability: only covered regulated product classes and relevant jurisdictions; do not extend this framework to general unregulated advertising claims. https://energy-efficient-products.ec.europa.eu/faqs-0/measured-declared-and-published-values-what-should-supplier-enter-eprel-mandatory-parameters_en
4. **Cochrane Handbook, Chapter 14: certainty of evidence**. GRADE evaluates risk of bias, inconsistency, indirectness, imprecision, and publication bias per outcome. This is an *analogy for evidence appraisal*, **not** a validated universal product-scoring methodology and **not** permission to assign fixed numeric trust weights. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14
5. **Cochrane Handbook, Chapter 13: missing evidence**. Missing outcomes may reflect selective reporting; missing evidence should not automatically be interpreted as an unfavorable or zero outcome. The application must examine missingness mechanisms (not tested, not applicable, not published, data rights unavailable, protocol mismatch) rather than treating all missingness as the same. The handbook's clinical setting is not equivalent to electronics reviewing, so the principle requires domain validation. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-13
6. **NIST, Type B uncertainty**. Manufacturer specifications can be useful as *inputs* to some kinds of uncertainty evaluation, but a manufacturer's specification is not by itself an independent performance test. NIST's metrology usage is a methodological analogy, not proof that a manufacturer's consumer marketing claim is reliable. https://pml.nist.gov/cuu/Uncertainty/typeb.html
7. **FTC, *Advertising FAQs: A Guide for Small Business***. Objective product claims require appropriate substantiation. This is US guidance, not a direct UK legal opinion; it illustrates why “manufacturer says so” is not automatically proof that a promised outcome occurs for consumers. https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business

## Evidence role by claim type — designed policy, not expert-sanctioned numeric percentages
| Evidence | Candidate discovery | Hard-constraint screening | Performance comparison | Final confidence | Disclosure |
|---|---|---|---|---|---|
| Manufacturer's static attribute (size, weight, socket) | Yes, if source and exact variant verified | Provisional; critical constraints require stronger confirmation | Not applicable to performance; can compare stated attributes | Depends on consequence of error and verification | Manufacturer stated; independently unverified |
| Manufacturer's performance promise (up to X hours, noise cancellation, cleaning) | Yes | Not proof of runtime / performance | **No** equivalence with controlled lab result; never average together | Low/unknown as proof of real-world performance | Claimed under stated conditions |
| Regulatory declaration under standard protocol | Yes | Depending on jurisdiction/label status | Can be useful *as declaration under standardized conditions*; not automatically independent | Depends on regulatory scheme and source | Regulated manufacturer declaration, not independently measured in a random retail sample |
| Independent original test in relevant configuration | Yes | Stronger evidence if method is valid and product identity matches | Yes **only** after method and uncertainty review for both alternatives | Domain-specific review required | Independently measured, conditions clearly stated |
| Absent / incompatible / unavailable | Keep as unknown | Do not silently pass or fail important constraint | No | Reduce claim scope; not the product's quality by default | Not independently verified / evidence unavailable |

### Why no universal percentages
A claimed **physical dimension** and a manufacturer's **promise about battery runtime** have fundamentally different epistemic roles. Likewise, two lab results with different ANC settings cannot be averaged as though equivalent, even when both were produced independently. **The user's importance weights** influence which criteria matter; they must NOT be confused with **confidence in the source**. A source-confidence number could be considered only after testing against independently verified outcomes on a representative sample. No such calibration currently exists.

## Missingness and nonuniform product coverage
Track distinct reasons in the full system: (a) test never run, (b) test not applicable, (c) method incompatible, (d) result not disclosed, (e) source rights unresolved, (f) exact variant mismatch, (g) source out of date. (a), (d), (e), (f) are **not a zero score**; (b) must be addressed by use-case logic; (c) prevents numeric synthesis; and selective publication (d) is a potential bias, not an excuse to infer positive or negative outcomes. **Products that received fewer professional tests must not systematically be penalised as lower-quality products.** Conversely, recommendation confidence must not be artificially high when critical claims rely only on manufacturer's brochures.

## Proposed decision workflow
1. Confirm real user needs, separate **essential** from important and nice-to-have; expose inferred preferences for correction.
2. Map each need onto a physical attribute or a testable performance criterion; consider customer-use conditions.
3. Ingest source-labelled facts, with exact model and variant, unit, original URL, rights state, and conditions. Keep **regulatory declaration**, **manufacturer claim** and **independent test** distinct.
4. Compare like with like. Keep a declared value visible even if independent tests cover another context. A mismatch of observation and declaration is a **review flag** requiring conditions/tolerance audit, not an automatic accusation of misleading advertising.
5. If original independent outcomes of **both candidates** pass quality, rights, method, variant and uncertainty checks, mark them eligible for *future* tested comparison. This prototype does NOT implement completed methodological QA, hence **never claims ranking eligibility**.
6. If no labs: static manufacturer attributes may inform a **provisional shortlist**. Manufacturer promises about performance do NOT establish a measured ordering, even when both brands make them.
7. For essential untested performance needs, communicate an evidence gap; do not choose a winner based on an invented score. If a nonessential area is untested, future policy may still recommend on well-evidenced remaining priorities, but must show the limitation. Validate with users before launch.
8. After ranking, only then add independently reviewed commercial links; no Amazon data enters the evidence model.

## User-facing example, explicitly fictional
**Question:** “I commute by train and need genuinely strong ANC and all-day battery.”

**Headphone A:** manufacturer claims “up to 30h”; original independent lab measures 18h with ANC on at a declared volume; independent ANC result missing.  
**Headphone B:** manufacturer claims “up to 40h”; lab measures 19h under exactly the same conditions; independent ANC result missing.  
**Correct:** show that **18h vs 19h is an observed comparison under the stated method** (uncertainty and practical significance still pending); show 30h/40h as the manufacturer's declarations, never average them; **do not select a travel winner based on unknown ANC**. Do not describe the differences between claims and tests as proof of deception without checking test configurations.

If **B has no independent battery test**, do not rank its 40h claim against A's measured 18h as though this were a fair performance comparison. Retain B in the candidate set with an explicit unknown.

## Phase 59 implementation and gates
- `src/spec_test_evidence.ts`: research-only typed observations and per-need reconciliation; returns source type, exact values/units, test/context status, provenance, declared-vs-tested difference notes and critical evidence gaps.
- `tests/spec_test_evidence.test.ts`: missing data, competing manufacturer's claims, test override without erasure, regulatory declaration, mismatched protocols/conditions, possible conflicting records, no commercial fields and no fake scoring.
- The module remains excluded from `src/launch/` and restricted `dist-launch/`. No production recommendation, live API access, rights clearance, scientifically validated source confidence weighting or external user validation is claimed.
- No numerical 70/30 weighting was implemented. Next prerequisite is **calibration against real authorised source outcomes**, auditing error rates of official specs and specific lab procedures, and testing users' interpretation of caveats.

## Mandatory further validation
- Sampling of comparable manufacturer claims vs professional test outcomes per category; distinguish test conditions and model versions. Estimate category-specific discrepancy and missing-data patterns instead of inventing global trust percentages.
- Editorial method reviews for each independent laboratory, with deduplication and treatment of lab interdependence/syndication.
- Whether and how structured manufacturer data may legally be imported at scale, and how to verify claims against official model documentation.
- Bias and stability checks when less-reviewed/newer models compete with well-tested models. Compare **decision robustness** under assumed missing outcomes rather than awarding missing criteria a zero.
- An empirical user decision study: does clearly labelling “manufacturer claims” reduce confusion while keeping recommendations useful?

**Status:** research design supported by primary expert sources; executable structural controls implemented. No live evidence feed or consumer-facing validated recommendation is asserted.

> **2026-10-19 (S83, owner review of S82 condition 4):** `src/spec_test_evidence.ts` and its test were removed. The
> module was marked DEPRECATED by Phase 60 (successor `src/technical_vs_independent.ts`), no source module, script or
> evaluation imported it, and no replay uses it. Its last version is in commit `d305652` for anyone who needs to
> reproduce Phase 59.
