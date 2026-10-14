# Product Evidence Engine — Phase 196 technical report

**Date:** 13 October 2026  
**Version:** 5.20.0 (increment on 5.19.0, not a restart)  
**Engineering state:** bounded software increment completed. **Scientific validation and live ranking admission: NOT achieved.**  
**Main decision:** a scoped, multidimensional **Source Intelligence & Evidence Reliability Matrix** is useful as a *search-and-review ordering instrument*. It must never automatically authenticate editorial content, test events, or product merit.

## 1. Baseline actually inspected

The complete predecessor `/mnt/data/product-evidence-engine-v5.19-phase195(1).zip` was CRC-tested and extracted. Its SHA-256 is recorded in `checkpoints/phase196/PRECHANGE_SHA256.txt`. The source compiled successfully with Node 22 and TypeScript after pointing TypeScript to locally available Node type declarations. The global executable and temporary local type-link are not new PEE runtime dependencies.

Direct source-code checks:

| Inherited module | What it really does | Phase196 treatment |
|---|---|---|
| `src/phase192_lineage_marketplace_screen.ts` | Source-level use types, claimed test roots, original-vs-derived relation candidates, normalized discovery URLs | Reused URL normalization and the document/test distinction; does not auto-merge experiments |
| `src/phase193_screening_memory.ts` | Versioned hash-chained screening ledger, source-content basis, policy/category/variant/field/market scope; conditional reuse | Reused decisions and history; no new shadow decision ledger |
| `src/phase194_candidate_retrieval.ts` | Candidate near-duplicate retrieval, LSH; fresh-byte gate for Phase193 | Calls **`checkFreshPublisherSnapshot194`** rather than trusting Phase195 extract hashes |
| `src/phase195_ephemeral_batch_lineage.ts` | In-memory multi-review comparison, chronological alerts, candidate duplicate links, textless derived metadata | Consumes existing `BatchResult195` without storing reviews again |
| `src/phase182_gap_research_orchestrator.ts` | Prioritised, controlled research jobs; acquisition opt-in | Read-only linkage to jobs, with no change to permissions or ranking |
| Phase181 and previous ranking/consumer modules | Dynamic recommendation constraints and earlier studies | Unmodified; Phase196 cannot alter consumer scores or ranking |

**Important predecessor limitations carried forward:** RTINGS protocol versions cannot be blended by assumption; page dates are not test-producer authentication; licensed publisher bytes and source custody are not supplied by a digest, analyst summary or self-declaration; Phase193 hash chains are tamper-evident only, not signed or independently authenticated. Some legacy Phase91/92 suites have known execution-cost and orchestration problems; they were run in independently bounded shards in this release.

## 2. Methodological findings, and what they do not prove

1. **Unit of evidence = experiment/observation, not article.** Cochrane explicitly recommends reconciling multiple reports of one study, while retaining additional information in secondary reports ([Cochrane Handbook, Chapter 5](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-05)). This is an analogy for product tests, not direct empirical proof that a proposed PEE deduplicator works. [PRISMA 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC8007028/) distinguishes duplicate records from similar separate reports and asks for transparent study selection and automation disclosure.
2. **Provenance requires typed, uncertain relationships.** [W3C PROV-O](https://www.w3.org/TR/prov-o/) distinguishes derivation, quotation, revision, primary source and attribution. A numerical coincidence or an older timestamp is neither a verified derivation edge nor evidence of a common lab experiment.
3. **Methodological competence and quantitative evidence quality are different dimensions.** [NIST's measurement science paper](https://www.nist.gov/publications/how-measurement-science-can-improve-confidence-research-results) addresses reproducibility, measurement and uncertainty. The [NIST Research Data Framework](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/1500-18/NIST.SP.1500-18r2.html) identifies provenance, data alterations, reproducibility, and use restrictions as distinct concepts. PEE should evaluate an individual measure's apparatus, uncertainty, testing conditions, protocol version and relevant product variant, beyond the publisher's reputation.
4. **Commercial arrangements are disclosed and reviewed, not equated to falsity.** [ICMJE's conflicts-of-interest guidance](https://www.icmje.org/recommendations/browse/roles-and-responsibilities/author-responsibilities--conflicts-of-interest.html) distinguishes disclosure from proof of bias, and asks for funding and sponsor roles to be transparent. Applying this as an analogy to product reviewers is an *engineering transfer*, not a validated consumer-review standard. A sponsor or affiliate relationship never constitutes a website-wide blacklist; it can affect the independence of a specific claim and its research pathway.
5. **Editorial independence does not imply measurement independence.** An editorial publisher may independently choose its products while obtaining a reported test from a contractor, brand, certification body or another publication. Conversely, a test measured by an external lab is not automatically unbiased simply because the journalist did not run it. The graph needs *claim → measurement event → apparatus/protocol → producer* and *document → reporter/publisher → commercial disclosures*, with unresolved links allowed.
6. **Source prioritisation can save review work, but only if evaluated against missed important evidence.** The [ASReview paper](https://www.nature.com/articles/s42256-020-00287-7) supports active learning for title/abstract screening through reported simulation studies; its result does not validate publisher trust or PEE's heuristic queue. The [ASReview documentation](https://asreview.readthedocs.io/en/stable/technical/reference/asreview.html) shows label-and-simulation workflows relevant to future benchmarking.
7. **Similarity is probabilistic candidate retrieval.** [datasketch](https://github.com/ekzhu/datasketch) documents MinHash/LSH, approximate recall and versioned signature compatibility; [text-dedup](https://github.com/ChenghaoMou/text-dedup) provides alternative deduplication implementations. Neither proves that text similarity identifies original test events. Phase194 already addresses candidate generation, so a duplicate runtime is unjustified without a controlled comparison.

### Publisher-method starting set (operator-curated *search seed*)

`data/phase196/publisher-method-seed.json` contains six scoped **publisher statements / programme directories**, supplied separately by the user and validated on load. A method URL establishes only *what is claimed or published at that location* and its **declared scope**. It does not certify every article or measured result.

| Seed entry | Relevant evidence claimed in published methods | First-party basis; specific limitations |
|---|---|---|
| RTINGS | Category test benches and standardised tests | [Test benches](https://www.rtings.com/company/test-benches-and-scoring-system); protocol version and actual variant need checking |
| Which? | Lab tests, practical trials and an editorial independence framework | [Testing & research](https://www.which.co.uk/about-which/research-methods-a3i5n6T4Ucnz), [editorial independence](https://www.which.co.uk/about-which/our-statement-of-editorial-independence-aFnFu0X8HMSl); claims are first-party, not independently audited here |
| Consumer Reports | Published testing-method claims for electronics / appliances | [Consumer Reports methods link supplied in seed](https://www.consumerreports.org/cro/about-us/what-we-do/research-and-testing/electronics/index.htm); current accessibility and product-specific methodology need live recheck |
| Notebookcheck | Device testing, benchmarks and test methods | [Methodology article](https://www.notebookcheck.net/How-does-Notebookcheck-test-laptops-and-smartphones-A-behind-the-scenes-look-into-our-review-process.15394.0.html); configuration and region may matter |
| SoundGuys | Structured audio measurements and hands-on observations | [Testing statement](https://www.soundguys.com/how-we-test/); measurement fixture and protocol need verification |
| ENERGY STAR | Programme-scoped third-party product certification | [Programme requirements](https://www.energystar.gov/partner-resources/products_partner_resources/third-party-cert), [certified product directory](https://www.energystar.gov/productfinder/index); confirms only certified performance claims for exact listed models, not general product superiority |

Of note, ENERGY STAR itself describes product testing in EPA-recognised laboratories and review by recognised certification bodies ([programme description](https://www.energystar.gov/partner-resources/products_partner_resources/third-party-cert)). This has a different evidentiary role from an editor's self-reported review procedure. **PEE does not infer that any specific product has certification from the programme's reputation**.

### Existing external projects assessed, not installed

| Project | Relevant capability | Phase196 decision |
|---|---|---|
| [Carneades](https://carneades.github.io/carneades/) | Argument schemes, attacks and conflicting support | Existing PEE claim graph plus review flags enough for pilot; reconsider for proof argumentation |
| [Scikit-Criteria](https://scikit-criteria.quatrope.org/en/latest/) | MCDA | No scientifically established scalar source weight to optimise; do not collapse dimensions |
| [ASReview](https://asreview.readthedocs.io/en/stable/technical/reference/asreview.html) | Reviewer-in-loop active learning | Future benchmark candidate when a labelled corpus exists; heuristic queue currently avoids model training |
| [pgmpy](https://pgmpy.org/documentation.html) | Graphical probabilistic inference | No calibrated conditional probabilities or independently labelled population yet |
| [datasketch](https://github.com/ekzhu/datasketch) and [text-dedup](https://github.com/ChenghaoMou/text-dedup) | MinHash/LSH and near-duplicate retrieval | Phase194 native candidate finder reused; evaluate cross-session sketch separately |
| [Dedupe](https://github.com/dedupeio/dedupe) | Supervised structured entity resolution | Useful if sufficiently rich labelled producer identities are available; not appropriate for unsupervised test-event auto-merging |
| [changedetection.io](https://github.com/dgtlmoon/changedetection.io) | Change monitoring | Useful for alerts, not custody-authenticated original-byte equality; Phase194 gate retained |

These are architecture-level comparisons against documented features, *not* independent speed/accuracy benchmarks of the libraries. No runtime dependency was added.

## 3. Implemented work (5.20.0)

### `src/phase196_source_intelligence.ts`

* **Strict seed validation:** typed schema and policy invariants, duplicate IDs/domains blocked, HTTPS method links, bounded fields and refusal of unexpected keys and automatic trust/bypass flags. Seed version and fingerprint carried to matrix output.
* **Multidimensional source row:** publisher matching on DNS hostname boundaries (spoofed suffixes do not match), exact category and market scope, test protocol *unverified*, material role, original-test claims vs verified tests, observed screened-decision history, review warnings, and prior-screening gate.
* **No universal source score:** historical Phase193 decisions are read through the *existing* ledger. Counts are selected, human-reviewed documents within a scope, **not** representative fractions of a publisher's output, corrections frequency or independently verified experiments. No false empirical reliability rate is published.
* **Explicit per-document decisions:** evidence material classified as `original_instrumental_claim`, `structured_practical_claim`, `derived_citation`, `manufacturer_specification`, `marketplace_stars_only` or `unclassified`, all as **research annotations pending source verification**. A stars-only list is discovery-only, without excluding its products or future test articles from the same domain.
* **Prioritisation, not admission:** deterministic lanes (`method_scope_review`, `new_source_probe`, `unscoped_review`, `derived_followup`, `discovery_only`); a bounded queue with an exploration slot for unfamiliar original/structured-claim publishers where `maxQueue >= 2`, if eligible. No closed whitelist and no changes to product scores.
* **Source-originality cues:** Phase195 document similarities, scoped numeric collisions, explicit cited-source links and chronological anomalies surface review requests; **zero automatic original-test events and zero test-event merges**.
* **Exact old-screen reuse:** calls native Phase194 freshness gate with newly supplied alleged original publisher bytes and Phase193 full revision/policy/category/market/variant/field metadata. Without bytes, `fresh_publisher_bytes_required`; changed byte digest or policy/version triggers re-screening. An external supply of bytes alone is NOT authenticated publisher custody: live crawler/transport validation is still missing.
* **Rare products kept:** retains coverage with zero *verified* original tests, never interprets absence of proof as zero product quality.
* **Phase182 bridge:** `linkSourceQueueToResearch182` produces read-only source suggestions for exact-variant criterion research jobs. It does not change protected source allowlists, crawler acquisition rights, worker priority orders, or ranking.

### `src/phase196_evaluation.ts`

The `evaluateSourceQueue196` evaluator consumes explicitly supplied labels and calculates labelled-set precision, conditional recall (only when **all** matrix sources are labelled), count of unfamiliar originals in selected work, and stars-only reviews mistakenly selected. It permanently marks `goldLabelsExternallyAuthenticated:false`, `fullCorpusBenchmarked:false` and final recommendation effects as `null`. It refuses to invent false-event-merge or rewritten-copy recall statistics. Labels calling themselves independently adjudicated require at least two reviewer IDs, but IDs are not cryptographic proof of adjudication.

### `scripts/phase196_demo.mjs`

Synthetic, rights-free coffee-machine / steamer example. A familiar scoped-method publisher is researched early, a new candidate lab obtains a probe slot, an Amazon-stars-only list remains discovery-only, and a poorly covered model is still visible. **This fixture is not a real independent review dataset.**

## 4. Evaluation and reproducibility

* **TypeScript build:** `npm run build` after pointing to a temporary local `@types/node` declaration installation; no new runtime packages.
* **Phase196 targeted:** **43/43 tests passed** across two files (35 source-intelligence tests and eight evaluator tests). Includes hostile hostname, mismatching market/category, unknown publishers, exploration slot, affiliate exceptions, original-claim conflict, real-byte rescreen, revision update, copied value vs independent event, chronology, transient editorial text non-retention, and synthetic-label partial-coverage refusal.
* **Cumulative TypeScript:** see `PHASE196-TEST-RESULTS.json` and `tests/` for the final sharded run. Historical 91/92 stress tests required bounded separate execution in the original runner; ordinary one-process `npm test` exceeds some container time budgets.
* **Cumulative Python:** six inherited suites: **212 tests passed** (71 companion + 47 primary + 35 tests-python + 26 evaluation + 21 ingestion + 12 Phase95). Earlier companion `ResourceWarning` lines remain historical warnings.
* **Data authenticity:** all phase196 behavioural fixtures authored and synthetic; publisher methods verified only as publicly available *method statements* (not original-review audits). No corpus of legally acquired and independently labelled product-review originals, no blinded adjudication, no measured effect on consumer recommendations. The synthetic demo may show perfect label metrics by construction; **do not report those values as retrieval or originality accuracy**.

### Benchmark protocol to execute when lawful primary evidence is available

1. Assemble multiple product categories (e.g., vacuums, air purifiers, ovens, air fryers, coffee machines, headphones, electronics and niche equipment), actual market-specific variants, exact study protocols and original URL/version records. Log publication and test dates separately. Rights-safe temporary review access; retain no publisher bodies by default.
2. Independently annotate at least two reviewers per document and per **measurement event**, blind to the PEE's proposed ranking. Labels: original instrument test, structured firsthand observation, derived citation, manufacturer specification, stars-only discovery, ambiguous; test producer, study event, lab/protocol version, variant and reporting provenance. Unresolved is a legal gold label.
3. Pairwise evaluation: duplicate detection precision/recall at document and copied-measure levels, deep paraphrase recall, **false independent-experiment merges**, source-origin attribution accuracy (count abstentions), independent same-number negative controls, and new-original-test discoveries from unknown publishers.
4. Compare baseline Phase195 search order vs Phase196 search queue under equal search/reviewer time and document budgets, including source freshness; count human review minutes and genuinely reused unchanged-byte decisions; ensure re-screening required on updates. Report results separately for sources first seen vs mature publishers, rare vs popular products, structured practical vs instrumental evaluation.
5. Replay evidence admission and recommendations using unchanged Phase181 constraints and evidence snapshots; measure changes in correct evidence admitted, material unsupported rankings, abstentions and coverage. Record all denominators, CIs where appropriate, disagreements and labeling leakage. Prohibit release/admission until external verification and error budgets are approved.

**Not currently measurable:** true real-document duplicate precision/recall, deep paraphrase recall, original-lab identity accuracy, per-publisher original testing frequency, cost saving vs baseline on real research jobs, recommendation improvement. Absent reliable labels, reporting any percentage as an achieved accuracy would be invented.

## 5. Why no keyed similarity sketch yet

The Phase196 continuity brief proposed keyed compact shingle/minhash sketches. This increment deliberately tackles the *upstream* source-priority decision while reusing Phase194 retrieval in Phase195. Cross-session sketches can help find rewritten copies when review text is not retained, but they also make content linkable, allow key-rotation mismatches, and require controlled false-positive/negative assessment on real paraphrases. Salted/HMAC bottom-k can reduce some dictionary attacks **if keys are protected**, but is not anonymous or guaranteed safe. Exact extract hashes cannot authenticate unchanged full publisher pages. A sketch will not be installed or persisted until a demonstrable benefit with controlled retention, key ownership/expiry and privacy assessment exists.

## 6. Known limitations / priorities for Phase197

1. **No verified provenance custody:** `freshPublisherBytes` is operator-provided, without independently authenticated retrieval. It is only a gate input, not proof of source originality. Connect protected Phase182/69 transport and capture original byte hashes, method snapshots and legally permitted source updates.
2. **No real learning of reliability rates:** sample-selection bias of Phase193 screened decisions prevents publisher-wide trust estimates. Collect explicitly sampled documents by category/field/protocol/time and calibration error in real annotation; avoid universal publisher scoring.
3. **No deep paraphrase recognition after transient text expires:** compare protected keyed sketches, re-fetch strategies, licensed excerpts and a no-sketch baseline on genuine rephrasing with negative controls. Review privacy/linkability and content rights.
4. **No automatic original experiment authentication:** preserve document, assertion, measured observation, producer, protocol and test-event independence as distinct objects. Add verified event-lineage reviews and chronology only as a cue. Claims cannot become verified through source identity or a timestamp.
5. **Seed scope is provisional:** six profiles are not comprehensive; methodological pages can change. Require revision/historical update review and discover new niche experts. Certification claims require exact model/regional/version checking.
6. **No producer-recency/coi/correction calibration:** field and protocol matching remain explicitly unverified; provenance graph and commercial relationship annotations have no external validation.
7. **No measured user-facing improvement:** Phase181 production ranking and recommendations remain unmodified. A fair, versioned before/after benchmark with real evidence must precede any admission/ranking change.

## 7. Exact replay commands

```bash
# Node >=20, TypeScript compiler plus matching Node type declarations available
npm run build
node --test dist/tests/phase196_*.test.js
node scripts/phase196_demo.mjs
node scripts/run-test-shards.mjs 13
# For full corpus: node scripts/run-test-shards.mjs (potentially long, bounded per shard)
python -m unittest discover -s primary_sources -t . -p 'test_*.py'
python -m unittest discover -s ingestion -p 'test_*.py'
python -m unittest discover -s evaluation -t . -p 'test_*.py'
python -m unittest discover -s tests-python -p 'test_*.py'
python -m unittest discover -s phase95 -p 'test_*.py'
python -m unittest discover -s tests-companion -p 'test_phase*.py'
```

No independent server/API/software licences were assumed. All URLs in this report are actual source destinations, intended to be copyable, not source markers that require ChatGPT to resolve.
