# Product Evidence Engine — Phase209 technical report (v5.33.0)

**Date:** 13 October 2026  
**Canonical predecessor:** `product-evidence-engine-v5.32-phase208.zip`  
**Status:** Engineering increment and verified **source-page / synthetic-decoder** pilot. **Not** a validated benchmark on original expert product review video content.

## Executive verdict

The Phase203–208 YouTube-only evaluator could not be exercised on an independently reviewable, rights-cleared video unless the source was represented as a YouTube URL. Phase209 extends the **same source identity and signed evaluation chain** to license-labelled original media on Wikimedia Commons. It adds an offline, memory-bounded pilot intake that computes a full-local-file SHA-256, probes actual WebM decoding and ephemeral frames, and makes no claim that these media are independent product performance evidence.

The broader goal remains a trustworthy, goal-based independent purchasing adviser. Source existence and legal reuse do not prove expert competence, product-variant identity, experimental originality, or quality of the outcome. Phase209 intentionally abstains where these cannot be verified.

**Major blocker:** Direct acquisition of externally hosted original media bytes did not succeed in this execution environment. The two authentic CC-licensed video pages were researched, but **zero original videos were retrieved or viewed**; **zero independent human labels** were obtained and **zero real provider executions** were benchmarked. The 2-second WebM used to verify FFmpeg decoding was synthetically generated in this environment and is never labelled original content.

## Direct code changes

1. **`src/phase209_licensed_original_media.ts`**: `canonicalReviewableVideo209` supports canonical YouTube IDs through **the original Phase203 parser**, plus an allowlisted Commons `File:...webm` canonical identity. It prevents confusing arbitrary domains, embedded userinfo or source pages with publisher media. `inspectEphemeralLicensedMedia209` validates a rights-check record, Commons original-file URL matching the exact page filename, CC license URL, byte size, WebM EBML signature, complete SHA-256 and optional caller-supplied digest. The output is a strict textless receipt, never raw media or captions.
2. **Integration rather than duplication**: Phase206 `evaluateVideoEvidence206` and Phase207 `caseScopeFingerprint207` reuse the new canonical media identity. Phase208 paired provider evaluation remains unchanged. The new file never authorizes an independent event, score, ranking, public badge, expert validation, or original-byte authenticity.
3. **`scripts/phase209-local-media-probe.mjs`**: a standalone offline media probe that runs `ffprobe`/`ffmpeg` with argument vectors and bounds; uses temporary image samples at 0, ~1/3 and ~2/3 of the actual decoded duration. It computes PNG SHA-256 hashes, deletes frames, and emits metadata only. The first synthetic test caught FFmpeg reporting success despite returning no frame at a near-end timestamp; the extraction times were revised and an explicit missing-frame check added. There is no network or model inference in this script.
4. **`scripts/phase209-licensed-source-replay.mjs`**: independently reproducible replay of two real **metadata-only** sources using Phase206. It produces zero reviewed labels and null accuracy; it does not falsify transcript or visual evidence.
5. **`tests/phase209_licensed_original_media.test.ts`**: 14 targeted software tests for source/host/identity injection, license and original URL mismatch, ephemeral-only output, two-source separation, full-digest mismatch and reuse of the Phase206/207 evaluation.

### Important controls still absent

- `inspectEphemeralLicensedMedia209` checks a WebM **magic header**, not complete decoding; the CLI probes actual decoding with `ffprobe`/`ffmpeg`. A SHA matching an analyst-provided digest is not an independently authenticated hash of a publisher's original bytes.
- Phase209 source scope is initially **Wikimedia Commons WebM only**. This is a bounded research transport; it neither enables YouTube scraping nor claims that every Commons file is suited to product review evaluation.
- Production decoder sandboxing, streaming storage, media-rights validation across revisions, signed remote acquisition receipts, deletion policies and reviewer evidence capture remain future work.

## Authentic public source-page pilot

The following **original publisher/file metadata pages were checked**, including their licence statement and author attribution. They are source **candidates** rather than reviewed audiovisual benchmark observations.

| Source | Publisher's stated creator | Stated licence | Test-criterion limitations |
| --- | --- | --- | --- |
| [Sunday Morning Espresso Routine — abridged](https://commons.wikimedia.org/wiki/File:Sunday_Morning_Espresso_Routine_-_Grind_%2B_distribute_%2B_tamp_%2B_extraction_%2815-Second_Abridged_Version%29.webm) | Scott Schiller | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Practical espresso extraction video; no verified machine-model match, creator qualification or specialist tasting panel. |
| [Knife sharpening video](https://commons.wikimedia.org/wiki/File:Knife_sharpening_video.webm) | Vijayanrajapuram | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Sharpening demonstration; does **not** establish specialist Japanese sushi-knife expertise or model comparison. |

**What was observed:** Pages, descriptions, attribution and stated licensing, not the original video contents. Direct download was attempted through the available environment but blocked; no video bytes are stored in this release. [Wikimedia Commons licensing and reuse guidance](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) applies. The pilot cannot infer any outcome rating for a named machine or knife.

## Executed local validation

- Local 2-second, 160 × 90, 4 fps **synthetic** WebM generated by FFmpeg `testsrc2`, independently decoded by `ffprobe`/`ffmpeg` into three ephemeral PNG samples. Metadata and SHA values are retained in `docs/phase209/test-logs/SYNTHETIC-DECODE-PROBE.json`, the frames and WebM are **not** in the release.
- `docs/phase209/LICENSED-METADATA-REPLAY.json`: two public source metadata leads, **0 original bodies retrieved, 0 review panels, 0 gold labels, accuracy null**.
- No YouTube.js, youtube-transcript-api or PyABSA runtime executed on real content; their original ZIPs are preserved in the cumulative project as required.

## Regressions and reproducibility

- TypeScript compile: **passed**.
- Phase209 targeted: **14/14 passed**.
- Phase206 + Phase207 + Phase209 combined: **66/66 passed** after a backward-compatibility repair.
- TypeScript cumulative: **3,715 verified passed** across bounded runs, excluding two inherited, repeatedly inconclusive Phase91/92 test files. All the groups completed except an initial Group11 run which exposed two genuine backward-compatibility failures: malformed YouTube URLs initially produced `phase209_source_url` where older Phase203 consumers expected `phase203_url`. After preserving the original Phase203 parser contract, Group11 was rerun and **404/404 passed**. Old failures and final passes are both retained in logs, rather than silently deleting evidence of the fix.
- Python cumulative: **212/212 passed** in six groups: 47 primary, 21 ingestion, 26 evaluation, 12 phase95, 35 tests-python, 71 companion. Historic warnings are not reclassified as errors.
- Regression outcomes are **software behavior on authored data**, not published real-world precision/recall or purchase recommendation improvement.

Full logs are under `docs/phase209/test-logs/`; replay scripts and operating instructions are under `docs/phase209/README.md`. An SHA-256 release manifest accompanies the ZIP.

## Comparison with Phase208

| Criterion | Phase208 v5.32 | Phase209 v5.33 |
| --- | --- | --- |
| Source video URL | YouTube only | YouTube unchanged + licensed Commons WebM file pages |
| Original media byte pathway | None | Ephemeral local byte hash with exact filename scope; optional FFmpeg decode probe |
| Local audiovisual probe | None | Real decoder exercised on **synthetic** video, no retained images/video |
| Independently reviewed original footage | 0 | 0 (still blocked) |
| Correctly bounded evaluator and paired comparison | Phase206–208 | Reused rather than duplicated |
| Verified external creator expertise | 0 | 0 |
| Real-world accuracy / recommendation effect | Unmeasured | Unmeasured |
| User-provided code archive candidates | 3 retained | 3 retained, no forced install |

## Research references and engineering lineage

1. [W3C PROV-O](https://www.w3.org/TR/prov-o/) — keep sources, derivations, agents and event identities separate.
2. [Cochrane Handbook: Collecting data](https://www.cochrane.org/node/97) — many documents may describe one original study; do not count twice.
3. [NIST AI RMF, Measure](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) — evaluate against documented, context-relevant independent evidence; do not fabricate ground truth.
4. [Wikimedia Commons: Reusing content](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) — licences, conditions, attribution, derivatives.
5. [FFprobe documentation](https://ffmpeg.org/ffprobe.html) and [FFmpeg documentation](https://ffmpeg.org/ffmpeg.html) — actual local media stream inspection and frame sampling.
6. [YouTube captions API](https://developers.google.com/youtube/v3/docs/captions/download) — uploader/edit permission for official captions download; does not provide general unrestricted transcripts.
7. Cumulative original repositories preserved in `research/phase205-external-code/`, audits in earlier phase docs: **YouTube.js**, **youtube-transcript-api**, **PyABSA**. Studied, not installed in production.

## Phase210 priority

Now that the evaluator accepts licensed alternate original media and the byte-probe exists, the limiting factor is **actual original publisher-media access and rigorous task-specific human review**, not another classification algorithm. Get a permissible, original and verifiably versioned media sample in a network-enabled controlled environment; independently review with qualified practitioners who can actually inspect timed footage; sign source receipts and freeze provider outputs before collecting blinded labels; then reuse the Phase208 paired benchmark to compare systems and trace product recommendation effects. Do not promote licensing, a SHA match, descriptive webpage text or creator popularity into proof of product performance.
