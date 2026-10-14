# Product Evidence Engine — Phase 69: licensed-source pilot and guarded HTTPS reader
**Research and implementation record | 10 October 2026 | v3.7.0**

## Exact status

This is a **real source licensing and code-integration pilot**, not a live, legally cleared multi-site crawler. The two public sources below are genuine and their own maintainers publish CC BY 4.0 rights statements. A small (20-row) authentic source extract was checked against the author's published table and included for parser regression tests with source credit. **The app did not obtain this source via its newly implemented network worker:** outbound DNS for direct downloads was not available in the current build environment. Claims of production uptime, source indexing coverage, useful ranking accuracy and actual crawl permission are **not made**.

## Source dossier A — original headphone measurements (pilot fixture)

- Source: SBAF / Super Best Audio Friends, *HPDB / headphone-measurements-frequency-response*, https://github.com/superbestaudiofriends/headphone-measurements-frequency-response
- Author-published licence statement in README: *Creative Commons Attribution 4.0 International*, https://creativecommons.org/licenses/by/4.0/legalcode.en
- Example exact data file: https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/blob/master/cEAR30-Sennheiser-HD600-L.txt
- Published method description: MiniDSP EARS cEAR30 with stock screws, compensation 3.02; curve data smoothed at one-sixth octave, normalized to a region in the 500–1500 Hz range, with documented positioning, seal and comparability limitations.
- Prototype fixture: `fixtures/phase69_open_measures/sbaf_hd600_first_twenty_points.txt`, the **first 20 rows only**, attributed as SBAF/HPDB CC BY 4.0. This fixture is not a substitute for the complete curve and must not be used to derive overall headphone quality, preference, distortion, comfort, battery life or purchasing conclusions.
- A measured response curve is one kind of context-specific evidence; do not convert it directly to a star score or independent opinion.
- The author-described license on the dataset is **not an independent grant to automate the GitHub website**. Verify GitHub's relevant access terms, current robots directives, approved fetch route, rights provenance of the relevant file, attribution presentation and commercial application before running any network request. **Website access policy: pending**.

## Source dossier B — independent performance report (future test)

- Author: Samuel Lapp, 2021 (report v1.1.0 mentions March 2022 additions).
- Source: *AudioMoth Performance Testing*, https://github.com/kitzeslab/audiomoth-performance
- Maintainer declares CC BY 4.0 for the report, https://creativecommons.org/licenses/by/4.0/legalcode.en
- Scientific scope: acoustic recording performance, response and housing/tree-position effects. It also mentions a separate SongMeter Micro device test; **do not treat it as evidence for all recorders or all situations**.
- This source was **not downloaded by the acquisition worker**. Before live access, check precise current host terms, robots, file rights and method/variant validity; keep original method conditions and attribution.

## Implemented transport guard

`src/approved_web_reader.ts` provides `restrictedHttpsTransport` and `readApprovedSource`, which:

1. Re-evaluates the Phase 68 source-rights policy at execution time. A source's assertion of a licence or a reviewer ID is not proof the reviewer actually inspected the contract; this remains an administrative responsibility.
2. Requires fresh operator-reviewed website terms, an operator rights record, and a nonexpired source grant for retrieval and local analysis. Permitted operations are separate from access rules.
3. Fetches `/robots.txt` from the **exact origin**, with the identifiable `ProductEvidenceResearchBot` agent, checks a conservative robots-rule matcher and refuses ambiguous or forbidden paths. The parser is a deliberately limited RFC 9309 subset. Unknown or unsupported cases fail closed; it is **not claimed to be a fully conformant RFC 9309 parser**.
4. Constrains to HTTPS, strips no destination hostname, resolves public IPv4 and pins the resolved address in the TLS request to mitigate rebinding; disallows redirects, private/reserved addresses, oversize responses, non-identity compression, unexpected content, unavailable robots and invalid policy.
5. Uses bounded timeouts and response size; returns only a quarantine summary and content hashes. It does not store the fetched article, expose it through the launch path, make derived claims or send content to an external AI model.
6. Supports injected transport for tests; production transport is implemented but **not yet exercised on a live source**. A proxy, container egress policy and enterprise DNS will require further testing before deployment.

## Blocking limitations and decisions

- **Not production-ready**: a properly authenticated rights administrator, transport audit logging, privacy screening, explicit rate limits/backoff and fully validated robots compliance are still needed.
- Licence grants, database rights, automation terms and website robots are four different concerns. Respect all, independently. A robot allow rule is neither a rights grant nor permission to retain copyrighted works.
- UK CDPA s29A does **not** provide blanket commercial TDM permission: https://www.legislation.gov.uk/ukpga/1988/48/section/29A
- UK limited quotation/review provisions and acknowledgement: https://www.legislation.gov.uk/ukpga/1988/48/section/30
- EU DSM Art 4 lawfully accessible TDM and machine-readable reservations: https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32019L0790
- EU protected database substantial or systematic extraction risks: https://eur-lex.europa.eu/eli/dir/1996/9/art_7/oj/eng
- RFC 9309 expressly says robots instructions are not access authorization: https://www.rfc-editor.org/rfc/rfc9309.html
- UK ICO legitimate interests requirements where personal data are processed: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/legitimate-interests/
- CC BY 4.0 permissions and attribution obligations: https://creativecommons.org/licenses/by/4.0/legalcode.en

## Recorded tests

- 380 TypeScript tests passed, including 9 tests for this phase, 47 Python source-ingestion tests, 21 Python ingestion tests, 4 launch tests and 3 release-isolation tests.
- New network tests use injected synthetic transport. These tests **do not verify site access permissions or production internet connectivity**.
- Launch output unchanged; phase69 modules remain separate and cannot silently influence rankings.

## Next engineering step

Document and independently check an explicit live-access route for one source (current terms, actual robots, licence scope, request budget) and obtain permission where needed. Execute one live source retrieval in an environment with controlled public-network egress. Validate byte limits, response decoding, provenance metadata, source variation, and actual source change; add scientific methods review, durable fact storage and evidence updating only after it passes. For denied sites, no retries under alternative identities, no proxy bypass and no invented evidence.
