# Phase209 — Licensed audiovisual source intake and research-only replay

## What is new

`src/phase209_licensed_original_media.ts` extends **source identity**, not the scoring model: the existing Phase206 evaluator and Phase207 signed scope now accept canonical Wikimedia Commons WebM source pages alongside the original YouTube URLs. Phase208 paired-provider trial is reused unchanged. The new intake accepts only a short allowlisted set of stated CC licences and an exact matching Commons original-media filename. It computes a SHA-256 over **temporary local media bytes** and outputs an allowlisted metadata receipt only. A caller-provided digest matching those same bytes does **not** prove the publisher supplied them. Rights, creator competence, video content, exact product variant and original experiment identity all remain unproven.

`scripts/phase209-local-media-probe.mjs` takes a *local* WebM file and a rights/source manifest, verifies its shape, uses `ffprobe` / `ffmpeg` to decode the file and inspect three time positions, retains only timecodes and SHA-256 digests of ephemeral PNG samples, then deletes the PNGs. It never visits websites, never saves review text, and cannot issue a product recommendation.

Two real, published and CC-labelled **source pages** were documented in `LICENSED-VIDEO-SOURCE-LEADS.json`. This runtime could access the web pages through research but could not retrieve their complete video bytes. Those leads are not footage viewed by the PEE. `scripts/phase209-licensed-source-replay.mjs` exercises the inherited evaluator against them with **0 human labels and null accuracy**.

## Reproduce with permitted local media

1. Independently check the exact publisher file page, history, licence, attribution, content rights and media file URL. The attribution strings in the candidate JSON are not themselves authentication. Obtain the WebM where permitted, outside this environment if necessary.
2. Edit `docs/phase209/sample-source-manifest.json` for the actual licensed source and record who checked the licence and when. The prototype currently supports Commons WebM only, not arbitrary sites.
3. Run `npm run build` then `node scripts/phase209-local-media-probe.mjs docs/phase209/sample-source-manifest.json /absolute/local/file.webm /absolute/output.json`. `ffmpeg` and `ffprobe` must be installed separately by the operator. Do not pass arbitrary untrusted local files to decoders without an isolation/sandbox process in production.
4. Review the video against the exact target task, product variant and relevant technique using verified qualified specialists; use the pre-existing signed admission in Phase207. A matching hash or a successful decoder probe is NOT an original independent test. Do not claim that a signature attests actual viewing without separate audited reviewer identity.

## Reproduce included **synthetic decoding test** (never count as real evidence)

```
ffmpeg -v error -f lavfi -i testsrc2=size=160x90:rate=4 -t 2 -an -c:v libvpx -b:v 200k -y /tmp/pee209-test.webm
node scripts/phase209-local-media-probe.mjs docs/phase209/sample-source-manifest.json /tmp/pee209-test.webm /tmp/pee209-probe.json
node scripts/phase209-licensed-source-replay.mjs
node --test dist/tests/phase209_licensed_original_media.test.js
```

The sample manifest describes a **real Commons page**, but a locally generated testsrc video must explicitly remain `synthetic_fixture`. The receipt never authenticates it as Commons publisher bytes. The `sourceMediaSha256` for the synthetic fixture must not be recorded as an original video hash.

## Critical blockers and safeguards

- No real video decoded from the original publisher; no independently credential-checked annotators; no original benchmark gold; no external model actually executed. The licensed video source pages are two leads, not product performance test evidence.
- Commons original videos are often demonstrations of an activity, not exact named product/variant reviews. An espresso preparation clip does not certify a coffee machine, nor does generic knife sharpening validate a sushi knife.
- The prototype permits media up to 120 MB in memory. Real service: streaming ingestion, decoder sandbox, immutable source snapshots, deletion/retention policy, and rights/legal review still needed. SHA-256 and video EBML-header checks are not proof of platform authenticity. Licences apply to any released derivatives.
- Phase203 YouTube official-metadata intake remains intact. This phase does **not** add an unofficial YouTube scraper, or integrate YouTube.js, youtube-transcript-api or PyABSA. Original ZIPs remain preserved for measurement-based adoption.
