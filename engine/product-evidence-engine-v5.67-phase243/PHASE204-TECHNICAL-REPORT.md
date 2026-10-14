# Product Evidence Engine — Phase204 technical report

**Date:** 2026-10-13  
**Release candidate:** v5.28.0, cumulatively derived from `product-evidence-engine-v5.27-phase203.zip`.  
**Status:** small, deterministic *research-only* engineering increment. No independent calibration of YouTube creator reliability, awards, reviewers, test originality or consumer purchase decisions.

## Answer-first findings

Not every credible product commentator is a laboratory scientist. A creator with genuine sustained hands-on experience can contribute useful **subjective experience** or observations about usability, daily frustrations and maintenance. That is not automatically a replicable laboratory result, and a declared specialist is not automatically qualified to judge a preparation-specific outcome. Likewise, product awards differ in purpose, test methodology, selection process, issuer and commercial relationships. A design/innovation prize cannot be used as proof that a coffee machine makes excellent espresso. These distinctions should be retained as separate evidence roles, with uncertainty and human review, rather than mixed into a single authority score.

The goal for PEE is **credibility relative to the specific claim**, not a universal channel reputation or a subscriber-count threshold. YouTube creator profiles can use external web research (lateral reading) *alongside* inspection of individual videos. No profile, editor or award programme becomes a blanket whitelist.

## Research basis and limits

| Source | What it establishes | What it does NOT establish |
|---|---|---|
| Willemsen, Neijens & Bronner, *Journal of Computer-Mediated Communication*, 2012, https://doi.org/10.1111/j.1083-6101.2012.01598.x | Perceived reviewer expertise and trustworthiness are separable constructs; self-proclaimed expertise and other identification cues can operate differently. Study 1 had N=265, on fictional television/hotel reviews. | It does not yield validated PEE weights or channel authority estimates. |
| McGrew & Breakstone, *AERA Open*, 2023, https://doi.org/10.1177/23328584231176451 | Professionals investigate outside a page/source (lateral reading); instruction can change information evaluation. | No claim that searches automatically authenticate a YouTube creator. |
| College lateral-reading intervention, 2021, https://pmc.ncbi.nlm.nih.gov/articles/PMC8012470/ | A controlled teaching evaluation compared 136 intervention students and 94 controls, reporting improved trustworthiness evaluation. | Student performance is not a product reviewer's objective credibility. |
| The Trust Project, https://thetrustproject.org/trust-indicators/ | A documented set of transparency indicators (expertise, references, methods, corrections, work type, financing). | Voluntary transparency does not itself prove a claim true. |
| FTC Endorsement Guides, https://www.ftc.gov/news-events/topics/truth-advertising/advertisement-endorsements | Endorsements must not mislead; material relationships require disclosure. | Every compensated review is not automatically false. |
| UK ASA guidance on award-based comparisons, https://www.asa.org.uk/advice-online/comparisons-based-on-awards-or-surveys.html | Objective claims based on awards require adequate substantiation; subjective votes cannot automatically support objective product performance claims. | Does not itself certify any award or product. |
| FTC expert endorsements guidance, https://search.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business | Expert endorsements require suitable qualifications **and** an evaluation appropriate to the claim. | An author's occupational title alone cannot authenticate a test. |
| YouTube channel metadata, https://developers.google.com/youtube/v3/docs/channels | Official metadata includes channel description and rounded subscriber counts. | Subscriber count and view metrics have no validated direct conversion into expertise. |
| CES Innovation Awards, https://www.ces.tech/innovation | CTA explicitly says it **does not test or endorse** Innovation award-winning products; the programme assesses engineering/functionality, design and innovation through submitted applications. | No blanket performance validation. |
| iF Design Award, https://ifdesign.com/en/if-design-award-and-jury | Design competition has published judging criteria, a jury process, entry and winner fees. | Neither a prize nor its fee structure proves or disproves coffee flavour, cleaning performance or general scientific validity. |
| Which? endorsement programme, https://b2b.which.co.uk/work-with-us/endorsements | Which? describes category-specific lab test practice behind Best Buy and paid licensing of a corresponding promotional logo. | Licensed logo use is not a second independent lab result. |
| PyABSA, https://github.com/yangheng95/PyABSA | Open-source aspect-based sentiment tools; candidate for extracting aspect-specific user experiences. | Sentiment is not truth, qualifications or experimental identity; heavyweight ML dependencies require benchmarking. |
| Argilla, https://github.com/argilla-io/argilla | Open-source human annotation and review workflows. | Does not authenticate internet sources or verify award issuers by itself. |
| FEVER, https://github.com/awslabs/fever | Benchmark/framework for evaluating factual textual claims against supplied evidence. | Wikipedia-based claim verification is not the same task as verifying a review video or lab result. |
| Sentence Transformers, https://github.com/huggingface/sentence-transformers | Open-source embeddings and reranking for semantic search, useful for surfacing corroboration candidates. | Semantic similarity or ranking is not evidence of an expert's reliability. |

These are externally verified public-source descriptions and findings, not test results produced by PEE. The algorithm below is an engineering proposal; no empirically calibrated reliability scores or award multipliers were found.

## Existing modules audited and reused

- Phase182 research jobs and Phase203 multilingual video searches: **existing research job** boundaries; no second crawler/queue.
- Phase196 Source Intelligence: scoped source selection, historical screening; no source-wide authority scores.
- Phases192–195: provenance and derivative publication identification; no doubling experiments.
- Phase197: per-goal evidence sufficiency, preserving poorly reviewed products.
- Phase198: task-specific professional outcome validation; no authority inferred from nationality.
- Phase199–201: cautious trust presentation, source/issuer evidence custody; never borrow product badges from creator reputation.
- Phase202: scoped official registry reconciliation; not reimplemented.

## Implementation

**New** `src/phase204_creator_authority_awards.ts`:

1. `assessCreatorCredibility204`: checks documented identity-to-channel mapping and *task-specific* evidence of qualifications/professional practice, independent references, commercial relationships and corrections. Groups external references by their documented source group; one syndicated press story is not ten independent corroborations. Emits one of four **research lanes**, not numerical ratings or verified credentials. An unchecked biography cannot promote its author to specialist status. Language, nationality and audience size cannot establish qualifications.
2. Reuses time-coded `VideoEvidenceResearch203` observations: a reviewer can contribute a human-annotated personal-use experience or an AI-proposed opinion, but neither counts as an instrumental test or a verified specialist outcome. No video, subtitle or copyrighted excerpt is retained in Phase204 output.
3. `planCreatorLateralChecks204`: offers bounded search strings for external professional qualifications, independent reputation, experience and awards. Validates linkage to already-existing Phase182 work and a matching Phase203 video plan. **Planning only**; no live browsing/crawling or new queue.
4. `appraiseAwardCandidates204`: distinguishes design, innovation, sustainability, practical performance, specialist-outcome, consumer-popularity and **creator career** awards; checks winner type, exact product variant, issuer entry/method review annotations, status (including withdrawn or expired), disclosed fees/licensing/sponsorship, and republished award stories. Every output remains an issuer verification candidate. Even a prize with a structured jury is not an admitted original test; an award to the creator is biographical context, not an award to the product.
5. `appraiseVideoMethodCues204`: attaches review cues to existing **time-coded Phase203 observations**. A video can document practical setup, comparisons and acknowledged confounders; a candid first-person experience may still be useful without laboratory rigor. Unsupported superlatives and commercial pitches remain caution signals. AI-proposed cues are segregated from human annotations and cannot authenticate visible demonstrations. No caption text is retained.
6. No output can authorize a recommendation ranking, product certification, trust badge, company logo, original test event, or external credential claim.

**New** `tests/phase204_creator_authority_awards.test.ts` covers scoped expertise, self-promotion, false discipline transfer, copied citations, source contradictions, individual opinions and AI annotation uncertainty, source URLs and identities, existing research jobs, variant mismatches, awards from different issuers/years, and deduplication, and video narration/method cues (48 targeted tests).

**Updated** `package.json` version `5.28.0`, test command `test:phase204`. No added runtime package or heavyweight model installed.

## Weighting opinions and awards

Do **not** introduce uncalibrated percentages (e.g. “expert 80%, YouTuber 20%”). Each reviewed datum receives a *role*: (a) original measurement candidate, (b) structured professional outcome candidate, (c) first-person experiential observation, (d) preference/subjective response, (e) award programme metadata, or (f) marketing/sponsorship. The role controls what proposition it can support and when it may affect sufficiency or ranking **after independent validation**. A specialist's unrelated fame does not multiply product evidence. Opposing experiences should remain visible, not averaged into a misleading vote.

## Tests and reproducibility

**Final observed software results:** TypeScript compilation passed; **48/48** targeted tests passed; **3,580/3,580 TypeScript** tests passed across **13 completed shards / 169 compiled test files**, after rerunning shard 11 on the final code; **212/212 Python** tests passed in six groups. The companion group took approximately 44 seconds and printed inherited `ResourceWarning` lines but no failures. One exploratory invocation of a nonexistent shard 14 returned `No test shard selected`; it was a script invocation mistake, not a test failure, and is not included in regression counts. Full logs are recorded in `docs/phase204/test-logs/` and `PHASE204-TEST-RESULTS.json`. The Phase203 baseline's cumulative runs were incomplete, so do **not** interpret the difference 3,580 versus its 3,507 confirmed successes as only newly implemented tests. Authored fixtures demonstrate software invariants; they do not measure sensitivity/specificity on an independent corpus of actual video reviewers, real awards or independent lab tests. The release does not scrape YouTube or authenticate real credentials.

## Next validation work

1. Select ~30–100 **authentic** publicly documented reviewers/videos across independent categories (e.g. espresso, Japanese sushi knives, an unrelated appliance) under a consent/access method compatible with applicable terms; include small channels and sponsored content.
2. Independently annotate (at least two reviewers with suitable expertise) the identity of creators, precise criterion/domain, experience basis, commercial relationship, what is **spoken** vs *visibly demonstrated* vs independently tested, timestamp and original event group; annotate unknown explicitly.
3. Verify programme awards with current official issuer directories, exact year/model, entry and judging rules, revocations and licensed logos; label overlaps with tests already counted.
4. Benchmark precision/recall of expertise *candidate* discovery, false promotions, missed original specialists, award-scope misclassification, paraphrased publicity mistakenly counted as separate reputation evidence, false independent event merges, and calibration of outcomes. Compare to a baseline without external checks, and quantify cost/time.
5. Integrate only validated provenance into Phase193 memory and existing publication controls, then evaluate whether including subjective experience actually helps relevant users without skewing repeatable technical rankings.

## Still blocked

Real authenticated identities; official award and credential registries at live/current version; external HTTP/YouTube audiovisual access and video transcript rights; independently labelled cross-category corpus; impact on Phase197 stopping/ranking; licence/hosting/privacy review. Source pages are **not** automatically trusted because they were indexed or analyzed by an AI model.
