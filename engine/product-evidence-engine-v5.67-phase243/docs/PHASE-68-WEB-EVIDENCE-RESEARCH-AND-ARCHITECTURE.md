# Phase 68 — AI-guided web evidence acquisition without mandatory commercial review APIs
**Product Evidence Engine | Research and implementation record | 10 October 2026**

## Decision

**The user's proposed architecture is feasible in principle.** Lack of a publisher's product-review API is not itself a legal prohibition on reading, reporting independently verified facts, providing links or writing original comparative assessments. Neither is a public webpage a general commercial crawling and extraction licence. No blanket finding of legality or illegality is supported: the actual combination of access, copying, automation, extraction, permanence, jurisdiction, contractual terms, database rights and output matters.

**Recommended model: adaptive discovery + permission/rights registry + original-test lineage + scoped on-demand acquisition + short-lived processing + incremental metadata/fingerprint refresh + human review.** Keep consumer-review research exceptional and fully separate. Preserve Phase 60–67 methodology and price-free ranking isolation. **This module is NOT an implementation of a web spider or remote LLM; see the explicit build status below.**

## A. Legal findings and boundaries

| Question | Supported finding / project decision | Sources |
|---|---|---|
| Can an AI reason from professional tests in its own words? | Original *independent reasoning and factual comparison* can be a separate output; there is no general rule that using factual information is prohibited. Yet processing may involve copying protected content, and systematic extraction of a protected database may implicate database rights. Paraphrasing is not a universal legal safe harbour, particularly for close reproduction of expressive structure or substantial protected material. | [UK CDPA s30](https://www.legislation.gov.uk/ukpga/1988/48/section/30); [UK Database Regulations 1997](https://www.legislation.gov.uk/uksi/1997/3032/contents); [EU Database Directive Art 7](https://eur-lex.europa.eu/eli/dir/1996/9/art_7/oj/eng) |
| Does on-demand research change the result? | One targeted read and a full persistent automated corpus carry different practical risks and factual use profiles. But a user's request does **not**, by itself, provide an exception or permission to automate commercial copying. Assess the precise act and rights. | [UK CDPA s29A](https://www.legislation.gov.uk/ukpga/1988/48/section/29A); [EU DSM Art 4](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32019L0790) |
| UK commercial text and data mining? | CDPA **section 29A** covers specified computational analysis by someone with lawful access **solely for non-commercial research**, with acknowledgement conditions. Do not treat it as a general commercial exception. A March 2026 government report analyzed proposed AI copyright reforms; a policy paper is not an enacted commercial TDM permission. | [CDPA s29A, enacted 2014](https://www.legislation.gov.uk/ukpga/1988/48/section/29A); [Government copyright/AI report, published 18 Mar 2026](https://www.gov.uk/government/publications/report-and-impact-assessment-on-copyright-and-artificial-intelligence/report-on-copyright-and-artificial-intelligence) |
| EU commercial text and data mining? | DSM Directive **Art 4** provides an exception for reproductions/extractions of lawfully accessible works for TDM, subject to appropriately expressed reservation of rights, including machine-readable reservations for public online works. Art 4(2) limits retention to what is necessary for TDM. Check *national transposition*, site restrictions, other legal obligations and whether the intended operation and outputs fall within the exception. It does not create an unrestricted republishing licence. | [DSM Directive 2019/790 Art 4, 2019](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32019L0790) |
| Do citation and links resolve copyright? | Generally no. UK **s30** has specific fair-dealing quotation/criticism-and-review conditions, including fair extent and acknowledgement where required. Attribution does not itself authorize broader copying. Conversely the CJEU's **Svensson** judgment concerns permissible hyperlinks to works freely available on another website, within the judgment's facts; it does not license scraping. Keep URLs to substantiate claims. | [UK CDPA s30](https://www.legislation.gov.uk/ukpga/1988/48/section/30); [CJEU Svensson, 13 Feb 2014, C-466/12](https://infocuria.curia.europa.eu/tabs/redirect/juris/documents.jsf?num=C-466%2F12) |
| Facts, scores, datasets | Even when a single factual observation is not protected expression, repeated systematic extraction and substantial use of a qualifying database create separate risks. Individual publisher ratings may reflect protected methodology/expression and can be misleading when stripped of method. No copying tables, editorial scoring formulae or entire review corpora into this project without specifically reviewed rights. | [EU Database Directive Art 7(1), (5)](https://eur-lex.europa.eu/eli/dir/1996/9/art_7/oj/eng); [UK Database Regulations](https://www.legislation.gov.uk/uksi/1997/3032/contents) |
| Is robots.txt a licence? | **No.** RFC 9309 explicitly says robots rules are not access authorization. Respect disallow decisions as a crawler constraint, but an allow result cannot substitute for rights/contract assessment. Website terms, publisher requests, paywalls, protection and rate limits require independent review. | [IETF RFC 9309 §1, June 2022](https://www.rfc-editor.org/rfc/rfc9309.html) |
| Open licence route? | Properly verified CC BY 4.0 allows commercial adaptation/reuse with attribution and conditions, subject to third-party material and other rights. CC BY-NC does not grant commercial reuse. A general website footer or third-party snippet is insufficient to establish rights over every included item. | [Creative Commons BY 4.0 licence](https://creativecommons.org/licenses/by/4.0/legalcode.en); [CC licensing FAQ](https://creativecommons.org/faq/index.html); [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.en) |
| Derived consumer experiences and privacy | If user reviews are ever considered, consider authenticity, incentives, selection, representativeness and consumer law; do not imply anecdotes represent the population. Personal data may appear in user posts. An ICO statement addressing *generative-AI training scraping* describes conditions for legitimate interests; that specific statement is **not** a blanket ruling for product evidence search, but flags privacy diligence. | [CMA fake reviews, 4 Apr 2025](https://www.gov.uk/government/publications/fake-reviews); [CMA review-platform guidance, 3 Sep 2025](https://www.gov.uk/government/publications/reviews-guidance-for-online-review-sites); [ICO web-scraping lawful-basis consultation response](https://ico.org.uk/about-the-ico/what-we-do/our-work-on-artificial-intelligence/response-to-the-consultation-series-on-generative-ai/the-lawful-basis-for-web-scraping-to-train-generative-ai-models/) |

This is product/legal research, not jurisdiction-specific legal advice. Counsel must approve the actual provider terms, text processing, dataset and planned markets before live commercial deployment. International markets other than UK/EU require additional analysis, including US contract, IP and access law.

## B. Architecture trade-offs (qualitative, not cost measurements)

| Option | Independent original evidence quality | Commercial reuse risk / blocker | Availability and update properties | Decision |
|---|---|---|---|---|
| A. Publisher RSS/sitemap → title, URL, date → targeted authorized retrieval | Good discovery, contents uncertain | Discovery mechanism itself may impose conditions; full-text extraction separate | Incremental and low duplicate fetch volume when feeds exist | **Core discovery path** |
| B. On-demand metasearch / general search provider → original-site URL → permitted reading | Broad discovery, mixed source quality | Search terms/API and downstream retrieval rights separate; search results are not publisher licences | Broad but variable quality/cost and index lag | **Optional discovery adapter; no mandatory paid review API** |
| C. Direct licensed publisher feeds, consented data partnerships | High if original methodology and variant documented | Contract approval and renewal required | Potentially stable but negotiation, coverage and cost constraints | **Preferred for repeat commercial acquisition** |
| D. Original open-licensed lab datasets & technical documentation | High for specific measured functions, narrower product breadth | Verify dataset licence, source ownership and conditions; declared technical specs separate from measured performance | Reproducible where original files/versions are available | **Preferred initial end-to-end real-evidence pilot** |
| E. Generic indiscriminate web spider preserving article text and reviews | Highly variable; syndication and bias problems | Copyright, database, terms, anti-bot and privacy exposure across sources | Large ongoing infrastructure, high maintenance and stale copies | **Reject** |
| F. Search-and-cite only, no evidence storage | Can answer one question with audited source context | Reading/extraction remains subject to applicable rights and tools' terms | Repeated retrieval cost, poor longitudinal memory | **Fallback; not the complete product brain** |

A self-hosted HTML browser does not remove restrictions that apply to a paid API. Commercial review APIs also do not automatically grant *every* use; precise scope must be checked. Optional browser/search adapters are implementation choices, not implied rights.

## C. Proposed evidence lifecycle

1. **Understand goal, identify exact model/region/version** through Phase 56+ need model. Mandatory requirements must not be compensated with irrelevant criteria.
2. **Look up evidence coverage** keyed by variant, source URL, original test identity and user criterion. Sufficient recent original evidence → reuse; missing evidence → targeted discovery, not indiscriminate category scraping.
3. **Discover candidate original sources** from permissioned feeds/sitemaps, direct official test datasets and optionally a licensed search index. Preserve original source links and claimed publication/update dates. Discovery results are *untrusted*.
4. **Check access and rights per operation** (metadata discovery, page retrieval, local processing, remote LLM sending, facts storage, excerpt storage, public citations, derived outputs), for the correct host and time. Run a fresh robots/terms check at execution. If unresolved, stop; do not try an alternative bot identity.
5. **Retrieve minimally** only when authorized. Reject redirects out of the approved scope; enforce HTTPS, DNS egress restrictions, response type, byte limits, concurrency and request budgets *in the eventual network worker*. The current module does not yet implement that worker.
6. **Extract provisional evidence** as provenance-tagged candidates (original-test identity, exact variant, criterion, method/version/conditions, source URL, observation date, anchor and content fingerprint). The code deliberately returns only hashes, with no protected article body or excerpt stored.
7. **Editorial scientific check**: original test vs syndicated restatement; manufacturer technical declaration vs performance result; context match; known missing uncertainty; contradiction/negation; which task was actually tested; source rights. Do not infer absent evidence means a bad product.
8. **Maintain incremental state**: last metadata check, last content check, reported publication update, content hash and revocation/expiry. Reuse a recent unchanged entry; re-read an updated/due entry only when the source is still authorized. Distinguish an `updatedAt` signal from a verified change.
9. **Independent suitability analysis and evidence-limited explanation** after human checks; citations are part of provenance. Store no copied article archive by default. Keep source data out of price, Amazon and merchant decisions.
10. **Exception only for lived experience**: use Phase 66/67 selective gate where an uncovered decision-material user issue justifies a lawful, source-specific inquiry. No automatic user-review ranking adjustment.

### Important engineering reservations

- Search snippets, publisher feeds and page `Last-Modified` headers are **metadata claims**, not proof of content change or independent test truth.
- A saved rights flag, reviewer name, URL or contract ID is **an assertion supplied to software**, not verified human identity or signed permission. Legal documentation must live in access-controlled records; implement revocation propagation before live source acquisition.
- Simple body hashes cannot prove scientific accuracy or plagiarism compliance; they only help with revision detection. If internal auditors require replayable anchors, they must obtain and store content under the rights and retention terms separately.
- No remote LLM calls, automation of user reviews, public commercial publication, autonomous scores or external network calls are in Phase 68.
- A real network fetcher needs tested SSRF defenses (DNS rebinding/redirects), authenticated provider registry, robots parser matching RFC 9309, ToS/publisher opt-out checks, audit logs, rate limits and backoff; **do not confuse our URL syntax validation with network safety**.
- For sources with no grant, `metadata_only` in the planner means **no page retrieval**; it is not blanket permission to store search engine snippets or copyrighted metadata.

## D. Code actually delivered

`src/web_evidence_acquisition.ts` implements **deterministic offline research planning** and a quarantined transient content-analysis audit:

- Source-level per-operation permission declarations, dated reviews, robots and terms flags; **fail closed** if stale, ambiguous or absent.
- Exact model/variant check and normalized HTTPS URL; deny Amazon/merchant content and unsafe URL forms at the planning layer.
- Documented original-test identity deduplication, without counting a syndicated article as a separate original test; a blocked source does not suppress another approved independent path.
- Bounded, configurable freshness threshold; no full refetch when unchanged and recently verified; re-research when source revision is newer or refresh due.
- Response URL/status/content-type/length validation; source-anchor presence checks; quarantine returning **SHA-256** hashes plus URL only. There are no derived public verdicts or stored article bodies.
- `tests/web_evidence_acquisition.test.ts` includes positive, negative and adversarial fixtures. They are simulated policy records and synthetic article text. **No real publisher permission or live fetch is claimed.**
- Current public launch entrypoint remains isolated; no pricing/affiliates added.

**Not delivered yet:** automated search, RSS parser, HTTP browser, LLM extraction, production database adapter, authenticated rights administrator, live independent product evidence acquisition, real-user decision validation or production legal clearance.

## E. Next execution stage (Phase 69 candidate; only after source validation)

A *single* genuine source and test dataset with independently verifiable permitted rights should be selected. Record: licence link and version, holder, any exceptions, source terms, original-data publication date, exact product/variant, test method, access/processing operation permissions, retention and quotation constraints. Connect a narrowly scoped publisher-feed/URL discovery and retrieval worker with actual robots/terms assessment, rate limits and network security, then verify **one genuine incremental revision**. Preserve right to halt or delete stored derivatives on rights revocation, and compare outcome against a human-reviewed evidence dossier. If no source passes the gate, present evidence metadata and an uncertainty statement; do not silently broaden permissions.

### Counsel / source-owner questions before live deployment

1. Do our planned browser visits, temporary HTML copies, content parsing, extraction of numeric measurements, local model processing and optional remote model transmission fall within your conditions for **commercial** service use?
2. May we retain a fingerprint, method/variant tags, extracted factual observations, supporting anchors and brief quotations; for how long; may they be shown to customers?
3. Do the URL, RSS metadata, page content and underlying laboratory dataset have **different** licences or publishers? Do rights extend to machine learning, to the geographic markets served and to our intended publication format?
4. What current automated-access rate limits, robots rules, TDM reservations, paywall restrictions and revocation instructions apply? How are changes announced?
5. Is it acceptable to cite the original test and link out, provide original evaluative commentary, and describe test-method limitations without reproducing copyrighted score tables or methodology?
6. Are derived observations considered consumer-review information under applicable platform/consumer rules, and what evidence of authenticity, moderation and advertising disclosure is required?

## F. Evidence references (copyable direct primary-source URLs)

- UK Parliament, Copyright, Designs and Patents Act 1988, **s29A**, non-commercial computational analysis (section inserted 2014): https://www.legislation.gov.uk/ukpga/1988/48/section/29A
- UK Parliament, Copyright, Designs and Patents Act 1988, **s30**, criticism/review/quotation fair dealing: https://www.legislation.gov.uk/ukpga/1988/48/section/30
- UK Parliament, Copyright and Rights in Databases Regulations 1997, database rights including reg 16: https://www.legislation.gov.uk/uksi/1997/3032/contents
- European Union, Directive (EU) **2019/790**, Article 4 TDM and opt-out (17 April 2019): https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32019L0790
- European Union, Directive **96/9/EC**, Article 7 on database rights (11 March 1996): https://eur-lex.europa.eu/eli/dir/1996/9/art_7/oj/eng
- CJEU, **Svensson**, Case C-466/12 (13 February 2014), hyperlinking facts: https://infocuria.curia.europa.eu/tabs/redirect/juris/documents.jsf?num=C-466%2F12
- UK Government, *Report on Copyright and Artificial Intelligence* (18 March 2026): https://www.gov.uk/government/publications/report-and-impact-assessment-on-copyright-and-artificial-intelligence/report-on-copyright-and-artificial-intelligence
- IETF, RFC **9309**, Robots Exclusion Protocol (June 2022): https://www.rfc-editor.org/rfc/rfc9309.html
- Creative Commons, CC BY 4.0 full licence: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Creative Commons, TDM and databases in licence FAQ: https://creativecommons.org/faq/index.html
- Creative Commons, CC BY-NC 4.0 restrictions: https://creativecommons.org/licenses/by-nc/4.0/deed.en
- Competition and Markets Authority, *Fake reviews* guidance (4 April 2025): https://www.gov.uk/government/publications/fake-reviews
- Competition and Markets Authority, *Reviews: guidance for online review sites* (3 September 2025): https://www.gov.uk/government/publications/reviews-guidance-for-online-review-sites
- ICO, *The lawful basis for web scraping to train generative AI models* (consultation response; **training-specific**, not a general product-research legal opinion): https://ico.org.uk/about-the-ico/what-we-do/our-work-on-artificial-intelligence/response-to-the-consultation-series-on-generative-ai/the-lawful-basis-for-web-scraping-to-train-generative-ai-models/

## G. Explicit limitations of this report

This is a technical/legal source review, not an original empirical study of legal outcomes, search coverage, cost per query, recall, latency, licence price, AI hallucination frequency or product decision improvement. Any such numerical claims require separate measurement. It has not examined the current terms of every specific publisher and should not be used as blanket clearance for an arbitrary third-party site. Sources that discuss AI training or general text mining may not directly decide transient non-training AI-assisted user search; the difference must remain visible.
