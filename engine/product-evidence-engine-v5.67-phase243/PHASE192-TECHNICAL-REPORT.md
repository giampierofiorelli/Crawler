# Product Evidence Engine — Phase192 technical report

**Date:** 13 October 2026  
**Canonical predecessor:** v5.15 Phase191  
**Target cumulative release:** v5.16 Phase192  
**Status:** Research-only source-lineage and marketplace-rating-list exclusion from *scientific performance evidence*. No public ranking authorization.

## 1. Technical and product verdict

This release implements an original TypeScript overlay on Phases189/191 rather than importing whole OSS repositories or creating a separate ranking engine. It addresses two linked problems: **(a)** web search returns many apparent reviews whose conclusions are copied or are based on retailer stars rather than original controlled product tests; **(b)** an uncommon product may have little editorial research but should remain discoverable and should not be assigned an unsupported bad score. The evidence object, original method and exact product remain the unit of assessment; neither page popularity nor affiliation is a universal reliability weight.

**Policy decided:** An affiliate-supported “best products” list that ranks products exclusively from Amazon/customer-star averages, sales popularity or unexplained selection is **not eligible as independent comparative performance evidence**. It can contribute candidate discovery and create questions for targeted research, not establish a superior product or count as a separate expert experiment. Verified original tests published by an affiliate-supported outlet can remain *candidates* for reviewed admission, and disclosed sponsorship is a context/risk flag not an automatic proof of falsity. Aggregate retailer/user experiences remain hypotheses or complementary qualitative data subject to separate review, not instrument measurements. Do not allege every Amazon review is fabricated.

### Evidence basis, external references

1. [He, Hollenbeck & Proserpio (2022), *The Market for Fake Reviews*, Marketing Science](https://doi.org/10.1287/mksc.2022.1353). Empirical research on organized purchasing of fake reviews for products on Amazon. It reports impact on visible rating metrics and sales, not a finding that all marketplace reviews are fraudulent.
2. [US FTC: Consumer Reviews and Testimonials Rule Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers). The rule addresses specified deceptive practices, not an automatic ban on every promotional or compensated review. [FTC Endorsement Guides](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking) explain affiliate relationship disclosures.
3. [Google Search Central — Write high-quality reviews](https://developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews). Advocates documented first-hand evaluation, quantitative measurements, own research, benefits and limitations; acknowledges affiliate links may be present. Not proof that a site indexed by Google is reliable.
4. [Cochrane Handbook Chapter 4](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04), [Chapter 5](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-05): combine multiple reports of the same study and preserve secondary information without double-counting it. This is a methodological analogue, not applying clinical efficacy conclusions to appliances.
5. [W3C PROV-O](https://www.w3.org/TR/prov-o/): provenance of evidence, activities and derivation; implemented in PEE's existing metadata framework, without adding semantic-web runtime dependency.
6. Broder (1997), *On the resemblance and containment of documents*: document shingle matching; the specific five-token Jaccard threshold is a software hypothesis and must be calibrated with blinded diverse sources.

## 2. What exactly changed

- `src/phase192_lineage_marketplace_screen.ts`: reuses Phase189 original annotated dossier and Phase191 source/claim-origin validator as a strict read-only input. No numeric PEE ranking changes.
- `DocumentContext192`: identified source page, exact product variants it discusses, selection basis, whether actually examined, URL canonical *hint*, citation links, analyst notes and optional publication date. The original publisher full page is **not** copied into the demo.
- `ClaimLineage192`: a separately reviewable origin-source, original measurement producer, test-event identity and link-strength annotation for each existing Phase189 record. A URL or oldest publication date never proves who did the experiment.
- `sourceUse192`: `marketplace_stars_only` lists are `discovery_only`; manufacturer and retailer information can be provisional specs; original editorial procedures can become reviewed evidence *candidates* only under described method and context; other reports are contextual research. Claim-level Phase191 provenance remains binding, including protection against publisher laundering of manufacturer data.
- Document duplicate discovery: normalised URLs (strip known tracking parameters), exact normalised note fingerprint, high-overlap token-shingle similarity. URL/text duplicates and citations do **not** prove copied scientific experiments or plagiarism. Similar texts may represent reprints; dissimilar texts may share a result.
- Numeric claim collision suggestions: identical exact model, field, value, units, protocol and measurement conditions found in distinct outlets are **possible copied observations** only. Such collisions are never forcibly deduplicated if the producer/test event isn't traced. Two independent laboratories may independently produce equal numbers.
- `tracedEventGroups` counts annotated producer+test-event groups with corroborating Phase191 original-claim and method metadata. A quote can link into an already eligible original reported event without becoming an additional one. Even those counts are `reported_origination_not_independently_authenticated` and `independentExperimentsVerified` is deliberately `null`.
- Coverage per **exact model/field**: total sources identified about product; those examined; those mentioning the field; unique URLs; commercial and star-only pages; original events *reported* with sufficient internal context; derived claims; unresolved sources. These counts are **not** quality or confidence scores, nor exhaustive web coverage.
- Research output explicitly forbids rank admission, automatic fraud allegations or originality certification. Missing evidence does not lead to deletion or negative assessment of a product.

## 3. What was actually tested

**36 targeted adversarial TypeScript tests**, including discovered-only niche products, star-only list with simulated laboratory-looking numbers, sponsored versus affiliate-supported original reporting, fraudulent-looking but not automatically condemned content, manufacturer measurement laundered through publisher, independent equal measurement results, two publications of one traced event, probable near-text duplications, unknown original producer, more sources not creating extra tests, exact-variant matching, alternative methods/conditions, incompatible origin linkage, citation URLs, malformed source metadata and ordering determinism. Tests are fabricated fixtures, not adjudicated third-party copying cases.

**Multi-category reproducible demo:** hand-annotated prior Phase189 reviews (RTINGS Dyson V15, Notebookcheck ThinkBook 16 G7 QOY, SoundGuys Bose 700), plus one explicitly fictional star-only affiliate list and fictional unstudied vacuum. **No real Amazon list was copied or identified as dishonest**, and no original publisher materials were ingested for republication.

- `npm run test:phase192`
- `npm run demo:phase192`
- `evaluation/phase192/multi-category-lineage-demo.json`

Regression: **3,051 TypeScript tests over 154 eligible files**, all passed, and **212 Python tests in six existing groups**, all passed. Historic TypeScript Phase91 and Phase92 suites were intentionally excluded by inherited eligible-regression policy; their failure/success has not been determined in this release. Some inherited Python groups emit Python `ResourceWarning` lines; not new failures. See `evaluation/phase192/regression-{ts,python}.json` for reproducible exact counts.

## 4. Engineering, rights and epistemic limitations

1. Source/context/lineage fields are **analyst-supplied**, not cryptographically authenticated publisher originals or peer-reviewed conclusions. False annotations remain a risk, even when validation accepts their structure.
2. Jaccard comparison on five-word shingles is English-oriented and insensitive to heavily paraphrased content, synonym substitutions, translations and layout/table copies. No representative precision/recall benchmark exists yet. This release does **not** independently detect every copied review.
3. Exact numerical agreement does not prove a common source, and divergent numerical results do not prove independence. Confirmation requires laboratory identity, original protocol and source records. Explicit agreement of traced metadata is necessary but not sufficient for independent evidence custody.
4. Source counts are restricted to the supplied sample/snapshot: they do not say how many sources exist on the web. A source may address a product but not its decisive criterion; both numbers are shown.
5. The FTC evidence is US-specific and not a universal jurisdictional determination. None of the code declares an affiliate publication unlawful or fraudulent. Technical specs from manufacturers remain potentially useful for narrow feasibility checks.
6. **No public product rankings, network crawling, source-rights audit, blind original-document labeling, calibration of text-duplicate thresholds or externally adjudicated accuracy uplift** occurred in this phase. A source URL cannot establish text-republication rights.
7. No additional runtime dependency from Carneades, Scikit-Criteria, ASReview or pgmpy. The original code is deliberately scoped to prevent a duplicate ranking engine.

## 5. Priority Phase193

Obtain a genuinely independent, blinded original-document set across categories and commercial arrangements. Compare all duplicate/lineage methods on identical held-out cases with pre-defined **false merges, missed copies, original-attribution errors, independent-study precision/recall, user-relevant source coverage and false deletion of sparse products**. Check pages with translated/paraphrased articles, same-value independent labs and manufacturer republishing. Seek actual rights-cleared originals when necessary. Only after validation connect approved lineage and source discovery to the Phase182 research queue, canonical exact-variant evidence ledger and eventual Phase181 ranking source-admission gates.
