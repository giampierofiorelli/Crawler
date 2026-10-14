# PEE Phase 141 lexical data — attribution and terms

The independently authored PEE TypeScript code is not a port of a vendor runtime.
The lexical JSON bundle *is derived from third-party linguistic data* and must
retain notices and provenance in any redistributed form. The original third-party
source ZIPs are not bundled. This data is not proprietary PEE vocabulary.

* **Open English WordNet**, https://github.com/globalwordnet/english-wordnet — CC BY 4.0 with underlying Princeton WordNet notices. Source license files are in `research/phase141_licences/OEWN-LICENSE.md` and `OEWN-WNDB-LICENSE.txt`. The derived data selects five synsets and nine lemma-construction cues; attribution is required to the Open English WordNet team and Princeton University.
* **VerbNet 3.x**, University of Colorado, https://github.com/cu-clear/verbnet — the VerbNet 3.X license permits commercial reuse with notice and disclaimer retained. See `research/phase141_licences/VERBNET-3X-LICENSE.txt` and the official https://uvi.colorado.edu/nlp_applications. The index is extracted from 329 VerbNet 3.4 class XML files; it is a lexical/class index, not a role parser.
* **VADER**, C. J. Hutto, https://github.com/cjhutto/vaderSentiment — MIT. `research/phase141_licences/VADER-LICENSE.txt`. The JSON contains lexicon valence entries only; neither original Python logic nor a compatible end-to-end VADER sentiment algorithm is bundled.

The ZIP digest of each user-uploaded input, the selected synset IDs, and reference URLs are carried inside the JSON. Raw scores and lexical membership cannot authorize scientific claims or product ranking.
