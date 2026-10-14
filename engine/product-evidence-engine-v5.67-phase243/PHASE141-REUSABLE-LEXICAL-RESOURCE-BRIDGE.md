# Product Evidence Engine — Phase 141: reusable English lexical data, not hand-expanded keyword rules

**Date:** 2026-10-11  
**Release:** v4.65 / phase 141  
**Parent:** v4.64 / phase 140  
**Policy:** English first. Independently authored TypeScript. No external inference service, installed model, licensed external Python runtime in production, unattended scientific-knowledge promotion or ranking change.

## Engineering verdict

The user's suggestion was correct in an important sense: phase 140 maintained a small collection of hand-written regex phrases (`struggles with`, `uses`, `outperforms` etc.). There are established linguistic datasets that can supply structured lemmas, senses, verb classes and sentiment cues instead of manually retyping every synonym. **However none of these resources understands the review independently, assigns the intended sense in context or proves what a tested product does.**

We read the three *uploaded* ZIPs directly and built a compact offline projection. The original source packages are not installed or copied wholesale to PEE. The new JSON data **is derived from third-party sources**, retains attribution, and must not be represented as our original authored linguistic research.

## Actual input inspection

| Supplied ZIP | SHA-256 | Actual usable content and usage |
|---|---|---|
| `vaderSentiment-master.zip` | `48917868711e2db6ce6a4a32ddbf6c0365b993a95adcff7080e5c86b80e8ac13` | `vaderSentiment/vader_lexicon.txt`, 7,506 distinct valence keys after parsing. MIT LICENSE.txt included; raw word sentiment is exposed for optional diagnostics only. VADER's Python sentiment logic and emoji analysis are **not** installed, ported or claimed to be present. |
| `verbnet-master.zip` | `2c7c32785aa13238f9bc8ba11ccf040e6e89421f30d9b25eed07badc3b` | `verbnet3.4/*.xml`, 329 classes and 3,694 distinct verb lemmas; index keeps class IDs and possible thematic role *names*. This is **not** a parser that assigns roles to actual sentences. |
| `english-wordnet-main.zip` | `491a8d3e389f3fdddba475130d538bafad605e4bab1e3066ff850a32365dbdd2` | YAML synset lexical data under `src/yaml/`. A reviewer-curated selection of 5 verb synsets yields **9 lemma-plus-construction cues**. Sense IDs retained; not all synset members are blindly imported. |

The actual compact resource `resources/phase141/english_lexical_bundle.json` is **486,656 bytes**, JSON, built offline and read locally using Node's built-in `fs`. Original ZIP source files stay outside the release ZIP. The importer stores their cryptographic digests and original reference URLs.

## Concrete changes

- `scripts/build-phase141-lexicon.py`: reproducible *offline* source-to-data projection using `zipfile`, `xml.etree` and **PyYAML for reading upstream YAML**. This is an optional **offline build tool**; PyYAML is not a Node application/runtime dependency. The user must supply the same three ZIPs to regenerate it; no downloads happen in production. Fails if the approved WordNet source synsets/lemmas cannot be found.
- `resources/phase141/english_lexical_bundle.json`: distinct, versioned data artifact. VADER scores, VerbNet class-role indexes and a small **sense-reviewed** WordNet cue list are kept independent; no weights or model inference.
- `src/phase141_local_lexical_resources.ts`: local lookup and new lexical candidate-generation path using Phase139 source/hash/mention checks and Phase140's baseline. Matching text becomes a **quarantined proposal** with source offsets and WordNet sense IDs, not a product claim. It refuses to infer product identity from an unreviewed pronoun and respects model-variant mismatches. Negation/modality and uncertain comparisons stay unresolved.
- `tests/phase141_local_lexical_resources.test.ts`: 31 *developer-authored* regression tests, including UK/US spellings, morphology, source offsets, negative/uncertain claims, variant identity, missing product subject, unverified comparator, duplicate subject, unapproved WordNet synonyms and no product ranking authorization.
- `scripts/evaluate-phase141.mjs` and `PHASE141-LEXICAL-RECALL-DIAGNOSTIC.json`: seven constructed trials alongside **the three previously selected original-excerpt diagnostics** from phase 140, without invented gold labels.
- `research/phase141_licences/` and `resources/phase141/ATTRIBUTION.md`: legal notices and pointers back to the first-party terms.

## Important conservative decisions

1. **WordNet membership is not contextual equivalence.** `miss` shares an absence-related sense with `lack`, but `misses dirt` can mean failure to detect or remove dirt. We *do not* add a blanket `miss -> feature_absence` rule. The WordNet `employ`/`use` sense is also excluded from the new cue list because it can mean employing staff; VerbNet independently shows multiple classes for `employ`.
2. **VerbNet syntax is not automatically a sentence parse.** A class with `Agent`, `Theme` and `Recipient` does not prove which words in a review fill the roles, or whether the reviewer asserted the relation.
3. **VADER is sentiment, not capability.** A raw negative score for `poor` cannot substitute for a measured vacuum/carpet test, identify the target of criticism or change ranking. Its scores are returned through `lexicalLookup141()` only, never sent to scientific knowledge.
4. **Comparisons need a distinct comparator.** `outmatches B4 Pro` can be a quarantined comparative *text* hypothesis; `outstrips the competition`, or a self-comparison, are unsupported. Unverified model-name detection remains a weak point.
5. **Every output is a proposal.** The new code returns `sourceVerified:false`, `scientificallyValidated:false`, `canonicalWriteAuthorized:false`, `rankingAuthorized:false`. Documents remain user-supplied snapshots, and source digest consistency is not external authentication.
6. **No broad performance claims.** Lexical index coverage is not measured extraction recall. The module only scans select constructions; full contextual word-sense disambiguation, quotation handling, dependency parsing, multi-sentence references and independent scientific evaluation remain open.

## Reproduction and checks

```sh
# Existing Node development dependencies, already required by PEE:
npm run build
npm run test:phase141
npm run demo:phase141
npm run regress:phase141

# For rebuilding the lexical data offline ONLY, with Python + PyYAML:
python scripts/build-phase141-lexicon.py /path/vaderSentiment-master.zip /path/verbnet-master.zip /path/english-wordnet-main.zip
```

**Actual results:** targeted 31/31; compiled TypeScript regression **1,691 passing across 100 eligible files**, with only the two known legacy Phase91/92 exclusions; Python 47 primary + 21 ingestion + 9 phase133 = **77 passing**. See `PHASE141-RELEASE-VERIFICATION.json` and `PHASE141-REGRESSION-GROUPS.json`.

**Seven constructed examples:** six lexical matches/proposals and one deliberately rejected unsafe synonym case. They were written by the developer and are **not independent accuracy observations**. On **three previously selected genuine publisher snippets** (RTINGS, TechRadar and Tom's Guide), phase 140 already had one proposal per snippet and phase 141 adds **zero**. Thus the project has not demonstrated a real-source recall improvement or calibrated precision from this phase.

## What the references contribute, and what they do not

| Reference | Direct data/software contribution | Missing ability |
|---|---|---|
| Open English WordNet | Actual verb synsets, carefully selected lemmas (e.g. `utilise`, `furnish`, `outmatch`) | In-context word-sense disambiguation; source truth |
| VerbNet 3.4 | Real class IDs and lists of possible participant roles | Assigning actual syntax/arguments in unmarked reviews |
| VADER | Actual English sentiment token valences | Aspect-based sentiment, grounding to device model and measured quality |
| medSpaCy, GLiNER2, DeepKE, Snorkel, TypeSafe (prior studies) | Cumulative source-learning decisions and existing PEE screening architecture are preserved from earlier phases | No source ZIP, learned model, third-party implementation or new runtime dependency introduced here |

### Source and license links

- [Open English WordNet](https://github.com/globalwordnet/english-wordnet), [CC BY / Princeton attribution](https://github.com/globalwordnet/english-wordnet/blob/main/LICENSE.md), [CC BY 4.0 legal code](https://creativecommons.org/licenses/by/4.0/legalcode.en).
- [VerbNet 3.4 source](https://github.com/cu-clear/verbnet), [University of Colorado license for VerbNet 3.X](https://uvi.colorado.edu/nlp_applications), [VerbNet home](https://verbs.colorado.edu/verbnet/).
- [VADER source](https://github.com/cjhutto/vaderSentiment), [MIT notice](https://github.com/cjhutto/vaderSentiment/blob/master/LICENSE.txt).
- [WordNet license and commercial use](https://wordnet.princeton.edu/license-and-commercial-use).

**Next necessary experiment:** use non-repeated, source-disjoint English professional review passages; annotate mentions/relations independently; compare Phase140 to Phase141 with unchanged retrieval and identical model aliases, measuring **candidate recall, false relation propositions, precision at reviewable coverage, abstention and CPU/memory**. Learn whether broadening word senses outweighs false acceptance; do not simply add more synonyms or assume pretrained-quality language comprehension.
