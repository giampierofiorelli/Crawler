# Internal open-source source attribution (Phase156; NOT public UI content)

Actual user-provided source code was adapted and included in PEE proprietary TypeScript:

- `src/phase156_gliner_portable.ts` from GLiNER2 `gliner2/inference/overlap.py`, `gliner2/inference/chunking.py`, copyright respective GLiNER2 contributors, license Apache License 2.0. Full license and exact Python source preserved at `third_party/phase156_reference_sources/gliner2/`. This is not a representation of pretrained GLiNER2 NER capabilities.
- `src/phase156_deepke_document_graph.ts` from DeepKE's `src/deepke/relation_extraction/document/prepro.py` DocRED document data organization and evidence attribution, copyright 2021 ZJUNLP, license MIT. Original source and license preserved at `third_party/phase156_reference_sources/deepke/`. This is not trained DeepKE relation extraction.
- Previous medSpaCy and Snorkel attributions are retained in `THIRD-PARTY-PHASE154.md` and `third_party/phase154_reference_sources`.

All four original user-supplied repository ZIPs are retained under `research/upstream_source_archives/`. This internal document does not imply permission to erase copyright notices from distributed binaries or source. Check license obligations if any affected code is bundled for browser distribution or made available to third parties. No public website credit UI is required by these permissive licenses in the ordinary backend integration described here.
