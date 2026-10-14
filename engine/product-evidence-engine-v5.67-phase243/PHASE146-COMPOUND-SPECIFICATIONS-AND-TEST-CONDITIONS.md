# Product Evidence Engine — Phase 146: compound technical specifications and bounded test conditions

**Date:** 11 October 2026  
**Build:** v4.70 / Phase 146, cumulative parent v4.69 / Phase 145  
**Runtime:** existing TypeScript / Node, built-in `node:crypto` only; **no new packages, model weights, hosted APIs or automatic scientific writes**.

## Engineering result

`src/phase146_compound_conditions.ts` consumes `readDimensionalContext145` and adds three separate **candidate** representations. The existing readers, numeric normalization and provenance rules remain unchanged.

1. **Compound specifications:** `24-bit/192kHz` becomes one `digital_audio_format_surface` with original offsets for `24-bit` and `192kHz`, typed bit depth and 192,000 Hz sample rate. It remains a quoted *format mention*, not proof that the reviewed device supports it, that ordinary Red Book CD-Audio is high resolution, or that the sound is high quality. `88 dB/W/m` similarly becomes a speaker sensitivity *notation candidate*, never a measured SPL result under an authenticated test.
2. **TV luminance context:** an already recognized nits or cd/m² quantity may be accompanied by **HDR versus SDR**, **peak versus sustained** and an explicit **2% / 10% / 25% / 50% / 100% test window**. Conflicting cues in the same sentence produce unknown or ambiguous results. These are textual surface associations only: no publisher test-bench version, calibration or HDR mode configuration is authenticated.
3. **Oven temperature setpoint versus reading:** two temperature quantities explicitly associated with an *identically repeated subject surface* can be stored as a proposed setpoint/reading pair. If the subject changes, becomes a pronoun, a paragraph interrupts the context, or an explicit set or actual-reading cue is missing, the link is not created. Even a linked pair does **not** authorize an accuracy difference, causal conclusion, same-device guarantee or ranking.

Every new compound has original source offsets, SHA-256 of its exact literal text and component text, references to the preceding quantity IDs where available, and explicit `sourceAuthenticated:false`, `canonicalWriteAuthorized:false`, `rankingAuthorized:false`. Output retains the upstream Phase145 graph and flags incomplete scans. The composition is conservative English-first engineering, **not a grammatical parser or semantic entailment model**.

## Reproducible results

- **35/35** new constructed Phase146 tests passed. They cover digital-audio component offsets, dB/W/m ratios, negated support descriptions, conflicting TV test conditions, thermal settings versus observations, false cross-product matches, source digests, truncation, and no scientific promotion.
- **1,818 TypeScript tests passed across 105 eligible files** (Phase91 and Phase92 legacy test files excluded, consistently with the previous release). See `PHASE146-REGRESSION-GROUPS.json`.
- **77 Python tests passed:** 47 primary-source, 21 ingestion, nine Phase133 probe.
- A replay of **four short, previously examined professional review excerpts from Phase145** yielded **one compound format representation** for the CD-player text `24-bit/192kHz`. The other excerpts (oven, speaker and television) had no compound expression in their quoted text. One visible wattage or temperature value is **not** a compound, and the previously used TV snippet lacks an explicitly stated window; the system must not invent one. See `PHASE146-COMPOUND-CONTEXT-DIAGNOSTIC.json`.
- **Five constructed Phase146 diagnostic examples**, separate from professional sources, demonstrate speaker-sensitivity notation, HDR 10% test window, a quarantined setpoint/reading pair, a format specification, and an ambiguous multiple-condition TV case. Their outputs do not estimate real-world accuracy.
- **Zero** independent gold annotations; **no** frozen independent cross-category holdout; precision, recall and false-attribution rate **not measurable** from this material.

### What still fails or remains limited

- `24-bit/192kHz` is identified, but general compound specifications and nested forms are still out of scope (for example HDMI bandwidth, resolution/refresh combinations and subjective statements describing performance).
- `dB/W/m` is recognized as a notation; equivalent reference-condition spellings and actual calibrated sensitivity measurement provenance are not generally handled.
- Multiple quantities in a complex, coordinated TV sentence can still require abstention. Same-sentence HDR/window terms are not a reliable substitute for an authenticated measurement protocol.
- A repeated text surface cannot verify physical product identity or model revision. Pronoun reference resolution remains unresolved rather than guessed.
- A setpoint/reading pair has no validated sensor, timing, placement or uncertainty. Arithmetic temperature differences are not automatically interpreted as evidence of an oven's accuracy.
- Source documents are short selected excerpts rather than full independently rights-cleared article snapshots. Their authors, protocol versions and source authenticity must be reviewed upstream.
- The new module is additive; canonical category growth, question interpretation and deterministic ranking were **not** changed.

## Future product categories from the user

The following were added to `research/phase146_future_category_backlog.json` for **later** source-disjoint assessment, without pretending to have researched or tested them already:

- Traditional deep fryers
- Air fryers
- Toasters
- Coffee machines
- Food steamers

These join the earlier multi-category work on washing machines, dishwashers, ovens, loudspeakers, TVs, CD players, purifiers and laptops. New source documents should be preserved separately before tuning the code against them.

## Relevant technical sources and links

- RTINGS, *Our TV Brightness Tests: HDR Brightness*, updated May 25, 2026: https://www.rtings.com/tv/tests/picture-quality/hdr-peak-brightness . Explains peak and sustained window measurements, use of five window sizes, calibration and protocol revisions; **not evidence that any specific TV excerpt contained those conditions**.
- RTINGS, *Our TV Brightness Tests: SDR Peak Brightness*: https://www.rtings.com/tv/tests/picture-quality/sdr-peak-brightness . SDR windows and comparability cautions.
- BIPM, *The International System of Units*: https://www.bipm.org/en/publications/si-brochure
- NIST, *Guide to SI*: https://www.nist.gov/pml/special-publication-811
- Phase145 short professional-source evidence (conserved unchanged): Tom's Guide https://www.tomsguide.com/home/home-appliances/cuisinart-air-fryer-and-toaster-oven-review ; What Hi-Fi? (Dali) https://www.whathifi.com/speakers/hi-fi-speakers/dali-sonik-1 ; RTINGS (LG C6) https://www.rtings.com/tv/reviews/lg/c6-oled-2026 ; What Hi-Fi? (Arcam CD5) https://www.whathifi.com/reviews/arcam-cd5 .
- Cumulative source-code engineering references, **no code or weights installed**: GLiNER2 https://github.com/fastino-ai/GLiNER2 ; DeepKE https://github.com/zjunlp/DeepKE ; medSpaCy https://github.com/medspacy/medspacy ; Snorkel https://github.com/snorkel-team/snorkel ; Open English WordNet https://en-word.net/ ; VerbNet https://github.com/cu-clear/verbnet ; VADER https://github.com/cjhutto/vaderSentiment . License and attribution material from earlier phases is preserved.

## Repeatability

```bash
npm run build
node --test dist/tests/phase146_compound_conditions.test.js
node scripts/evaluate-phase146.mjs
node scripts/phase146_regress.mjs
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s primary_sources -t . -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s ingestion -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

## Recommendation for Phase147

Do not add more regex patterns without testing. Use the next **unseen** category review samples and a frozen, source-disjoint benchmark to measure both missed relationships and false attribution. Strengthen predicate-to-measurement attachment before interpreting many simultaneous quantities; maintain abstention, model-variant boundaries and scientific review permissions. Examine existing lexical resources and local model options only where the errors show a demonstrable need.
