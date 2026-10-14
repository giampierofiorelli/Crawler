# Phase 192 — Origin lineage and marketplace-only ranking screen

**Research-only code, not a publicly deployable recommendation system.** Reuses Phase189 dossiers and the Phase191 product retention/source-origin validation. The module does not change Phase181 rankings or submit anything to source/review gates.

## Functional changes

1. Every exact candidate remains visible even without an original review. `documentsDiscovered` counts identified documents **about the model**, `examinedDocuments` counts analyst-reviewed documents, and `fieldRelevantDocuments` counts documents containing a recorded claim for the particular field. These numbers are neither denominators for total web coverage nor quality scores.
2. Classifies marketplace-star-only buying lists as **discovery-only**, whether or not they contain affiliate commerce links. It does not use their star order as a technical score and does not assert that their individual user reviews were forged. It does **not** blanket-blacklist affiliate-supported outlets: an independently reported original protocol may remain a candidate for supervised field review. The actual field claim's origin (Phase191) still controls.
3. Identifies exactly duplicated URLs after stripping known tracking parameters, identical normalised analysis text, and near-duplicate five-token shingle candidates. These detect document duplication, **not proof of plagiarism or experiment independence**. Text excerpts are only locally supplied rights-appropriate *analyst notes* in the pilot.
4. Detects equal exact-model numeric observations under equal field/protocol/condition/unit across outlets. Such collisions are **candidates for source investigation**, not automatic merging: independently conducted tests can produce identical numbers.
5. Tracks explicitly reported producer + test-event provenance; only the annotated same-event relationship collapses claims into a shared lineage group. The purported original URL and earliest date are **not automatically the true origin**; inconsistencies fail closed. Findings distinguish original tests, quoted reports, unclear provenance, missing fields and commercial-only lists.
6. The `claimedOriginalEventGroups` count is NOT `independentExperimentsVerified`; the latter is deliberately `null` until publisher source custody and external study verification are established. **Nothing is permitted to rank publicly.**

## Try it

`npm run test:phase192` / `npm run demo:phase192`.

Demo: original product facts were hand-annotated in Phase189 from three linked professional original review pages: RTINGS Dyson V15, Notebookcheck ThinkBook 16 G7 QOY and SoundGuys Bose Headphones 700. **One additional Amazon-stars-only list and model are entirely FICTIONAL fixtures**, not a real site or a statement about the named retailers. No body text or original publisher assets were copied into Phase192.

## Validation and scientific caveats

Original data are research annotations, not independently verified source bytes, chain-of-custody proof, verified independence, or permission to reproduce third-party tests. Deterministic fixtures demonstrate code behavior **only**; no externally blinded recall/precision or ranking uplift has been shown. Document matching is multilingual-insensitive at this stage and may miss rewrites, translations, altered units or hidden network syndication. Shingle resemblance thresholds are engineering hypotheses, not validated science. No accusations of fraud, copying or bias are generated. Source counts are snapshot-only, not a census of the internet. A commercial claim or testimonial can still be useful as a hypothesis or provisional attribute, but cannot become independent scientific testing.

## Research references

- Cochrane Handbook [Ch4](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04) / [Ch5](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-05): one study can have multiple reports; preserve secondary reports without double-counting.
- [W3C PROV-O](https://www.w3.org/TR/prov-o/): wasDerivedFrom/provenance semantics, adapted to PEE metadata.
- [FTC Rule and Endorsement Guides](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers), [FTC on affiliate marketing disclosure](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking).
- [He, Hollenbeck & Proserpio 2022, *The Market for Fake Reviews*](https://doi.org/10.1287/mksc.2022.1353): an actual study of purchased Amazon reviews; does not imply that every marketplace review is fake.
- [Google Search Central — Write high quality reviews](https://developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews): original experiences, quantitative measurements and appropriate use of affiliate links.
- Broder 1997, *On the resemblance and containment of documents*: shingling/Jaccard background; no specific PEE threshold endorsed.
