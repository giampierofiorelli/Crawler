# Phase189: original-source, cross-category evidence applicability pilot

This phase extends the Phase188 *signed argument audit* with a separate **RESEARCH-ONLY** evaluator. It does not extend source rights or authorize the production ranking path. The corpus has 14 analyst-annotated atomic observations, four product pages and three different categories, checked on 2026-10-12. Exact source links and positions are included in `evaluation/phase189/annotated-live-source-pilot.json`. No publisher text is replicated beyond short, independently paraphrased descriptions and public quantitative facts; no original webpage bytes or document SHA-256 hashes were captured. The user did not need to download anything.

## Source categories and questions

1. **Vacuums**: RTINGS Dyson V15 Detect versus Shark Stratos Cordless IZ862H, testing airflow (71.9 versus 59.2 CFM) and bare-floor noise (70.5 versus 74.2 dBA), under named methodology v1.4; source also describes issues with dust exposure during bin-emptying and access under furniture. These are separate attributes, not rival independent measurements of a single attribute. Exact configurations/attachments and methodology conditions require review before a purchase recommendation.
2. **Laptops**: Notebookcheck Lenovo ThinkBook 16 G7 QOY `21NH0005GE`, Wi-Fi v1.3 26h54min at 150 cd/m², 297.9 cd/m² on tested WUXGA panel; compatibility and keyboard observations have different epistemic status. Do not claim 26h54min of battery life for gaming, every panel variant, or for every user.
3. **Headphones**: SoundGuys Bose Headphones 700: 19.5 dB total ANC-on attenuation at 410 Hz from the frequency-specific laboratory chart. This does not directly prove whole-airplane or overall multi-frequency cancellation quality. The editorial ANC verdict is not another independent acoustic experiment.

Methodology: https://www.rtings.com/vacuum/learn/how-we-test ; https://www.soundguys.com/how-we-test/ ; https://www.notebookcheck.net/More-than-24-hrs-battery-life-for-less-than-1-000-Lenovo-ThinkBook-16-G7-QOY-laptop-review.958162.0.html

## What's actually implemented

- Original, dependency-free TypeScript `src/phase189_source_pilot_reasoning.ts` (not copied from the user's four OSS repositories) validates a manually annotated dossier, provenance derivation DAG and distinct product/category/field origin scopes.
- Exact **category + model + field + protocol + operating context + unit** applicability checking (numeric); interpretive and experiential observations are not substituted for instrument measurements.
- Conflicting original readings stop the inference; repeated editor summaries of the same reading are grouped rather than counted as corroboration. A `missing` field remains unknown rather than zero.
- Pairwise **strict Pareto dominance** on fully present measurements with the same protocol and condition. No compensatory weighting, overall best-product ranking, inferred scientific precision or approval. Introducing another product does not change a fixed pair's dominance on unaltered fields.
- `tests/phase189_source_pilot_reasoning.test.ts` contains 32 cases, including real manually annotated source facts and synthetic adversarial mutations. They are **not** an independently blinded evaluation of recommendation accuracy.

## What is not accomplished

- Original review document bytes, independently verified source permissions, signed evidence admission and exact retail variant verification. The pilot annotator reading a web page is not equivalent to an external reviewer verifying the original test setup.
- No source-independent measurement uncertainty estimates, standardized cross-publisher conversions, trained relevance extractor, automatic discovery, independent scientific benchmark, calibrated probability or user-facing page integration.
- This is *not* a paired efficacy proof that Phase189 produces better consumer outcomes than Phase188; Phase188 has no real source benchmark corpus. The code exercises newly specified errors by design, and needs independent adversarial tests on held-out original documents and actual user requests.
- Existing Phase181/187/188 source gates and signatures are unchanged; no new external runtime dependencies or background worker.

## Why the uploaded repositories are not installed

- **Carneades 4** provided graph argumentation design, already partly used in Phase188; further graph-weighing code has legal-domain priors and is not calibrated for consumer product evidence.
- **Scikit-Criteria** `core/dominance.py` and rank-reversal methods informed this phase's bounded Pareto test. Its full Python dependencies and normalized MCDA ranks would add unverified assumptions; do not introduce them into the Node hosting path.
- **ASReview** has active-learning screening strategies but requires labeled training/screening records and a recall benchmark. The Phase182 research queue is the integration point *after* source screening validation, not this evidence-verdict module.
- **pgmpy** models probabilities but needs empirically justified priors and enough original measurements. Inserting it now would risk made-up certainty.

## Phase190 recommended

Freeze a larger externally reviewed corpus, 2+ original independent lab organizations per selected field and exact retail variants; license/access rights separately checked. Benchmark source independent-experiment inference; validate test-method calibration, uncertainty, missingness, new reviewer judgments and Pareto incomparability. Benchmark user tasks with hard vetoes and usability outcomes, then consider an authorized, separate decision interface. Do not call this scientific validation prematurely.
