# Phase263 Checkpoint A — Retention, Rights and Discovery Reassessment

**Date:** 2026-10-16. **Base:** HEAD `6418f25`.

**This is an engineering assessment, not legal advice.** No lawyer reviewed it. Each statement is labelled:

- **[law]**: supported by the primary text cited;
- **[case]**: a court decision as reported by the sources named;
- **[eng]**: my engineering interpretation or recommendation;
- **[measured]**: counted in the private store, read-only.

## 1. Legal distinctions (primary sources read on 2026-10-16)

| # | Distinction | Position | Source |
|---|---|---|---|
| 1 | Expression vs facts and methods | Copyright protects the expression of a work. A single value such as "1750 W", or a test condition such as "200 °C", is not a literary work. Short phrases can still be original expression, so PEE keeps typed values, not sentences. | [eng], consistent with the Phase249 policy |
| 2 | Temporary access vs permanent copy | A transient or incidental copy that is an integral, essential part of a technological process, whose sole purpose is a *lawful use* and which has no independent economic significance, does not infringe. | [law] CDPA 1988 s28A |
| 3 | Original analysis vs reconstructable copy | PEE's own non-verbatim statements are its expression. A close paraphrase, or a set of retained facts that reconstructs a work or a database, is not protected by that label. | [eng] |
| 4 | Single facts vs substantial or systematic extraction | Extracting or re-utilising a substantial part of a protected database infringes. Repeated and systematic extraction of insubstantial parts may amount to a substantial part. A lawful user of a published database may extract insubstantial parts for any purpose, and a term preventing this is void. **Extraction** = permanent *or temporary* transfer to another medium; **re-utilisation** = making available to the public. | [law] Copyright and Rights in Databases Regs 1997, regs 16(1), 16(2), 19, 12(1) |
| 4a | Who has UK database right | For databases created on or after 1 January 2021, only UK citizens, residents and businesses qualify. | GOV.UK guidance (sui generis database rights) |
| 5 | Copyright vs contract | A database protected by neither copyright nor sui generis right falls outside the Database Directive, so its maker may restrict use by contract. | [case] CJEU C-30/14 *Ryanair v PR Aviation* (15 Jan 2015), per the SCL and IPPT summaries |
| 6 | Robots vs legal authorisation | Robots rules are an access convention, not a licence and not a legal grant. PEE honours them as access conditions. | [eng] (Phase249 position, unchanged) |
| 7 | Private retention vs redistribution | Re-utilisation (making contents available to the public) is a separate restricted act. | [law] reg 12(1) |
| 8 | Commercial use vs research exceptions | **UK:** copies for computational analysis are exempt only for research for a **non-commercial** purpose; contract terms cannot override this exception. The government's March 2026 report under the Data (Use and Access) Act 2025 left s29A unchanged and dropped an opt-out commercial TDM exception as its preferred option. Commentators differ on how final that is. **EU:** a TDM exception for reproductions **and database extractions**, commercial use included, applies unless the rightholder has expressly reserved it "in an appropriate manner, such as machine-readable means" for content online. Copies may be kept "as long as is necessary for the purposes of text and data mining". | [law] CDPA s29A(1), (5); DSM Directive 2019/790 arts 2(2), 4(1)–(3) (text as retained on legislation.gov.uk; EUR-Lex returned an empty page to the fetcher); secondary reports (Osborne Clarke, DLA Piper, CASRAI) for the 2026 status |
| 8a | What counts as a reservation | National courts disagree on whether a reservation must be machine-readable. The Amsterdam District Court (*DPG Media v Knowledge Exchange*, Oct 2024) reportedly required it; another ruling accepted plain language. There is no CJEU ruling yet. | [case], via the Oxford Business Law blog; not verified from the judgments |
| 9 | Technical observation vs circumvention | Following 403/429, robots and logins is technical observation. Bypassing them is circumvention, and PEE never does it. | [eng] (unchanged) |
| 10 | Publisher claim vs verified knowledge | An evidence question, not a legal one. A publisher's statement of its own test is a lead (Phase225: `publisher_reported_measurement_lead_only`). | [eng] |

**What this means for PEE.** PEE may be commercial, so in the UK it cannot rely on s29A. Its UK position must rest on:

- facts not being protected expression;
- s28A for transient processing, with "lawful use" the main uncertainty;
- regs 16 and 19 for database contents;
- contract and robots for access.

For EU-made databases, the article 4 TDM exception also covers commercial extraction **unless rights are reserved**. This makes honouring machine-readable reservations *legally relevant*, not just courteous, wherever an EU database right exists.

**Phase249 is sound on all of these points.** The extra facts found this phase confirm it rather than overturn it:

- UK s29A is unchanged;
- DSM article 4 confirms that EU reservations matter;
- *Ryanair* confirms that terms matter for unprotected databases.

**Needs legal review (unchanged from Phase249, plus one point):**

1. "Lawful use" under s28A where site terms forbid automated access.
2. Website terms for databases with no sui generis protection (*Ryanair*).
3. Jurisdiction-specific treatment of EU-made databases.
4. **New:** the licence position for operating, as opposed to calling, AGPL search software.

## 2. Audit of the existing mechanisms

**Measured on the private store** (read-only; 90 sources, 140 revisions, 2,385 declarations):

| Fact | Value |
|---|---|
| Declarations observed vs retained, revisions with value retention (137 revisions) | **2,385 observed / 2,385 retained, 0 lost** |
| Revisions kept as metadata only | 3: methodology pages of independent test publishers; 0 declarations observed |
| Independent-test revisions (4) | **0 observations extracted** (the spec extractor reads specifications, not test results) |
| Reservations, caps reached, blocked observations (events) | 0, 0, 0 |
| Open `declarations_not_retained_rights` gaps | 3, all **misattributed**: 2 products have no linked revision left after re-derivation; 1 has a current value-retaining revision with nothing declared |
| Sources by retention | 90 of 90 `facts_retained_class_policy`; `policy_json` null for all |

**Mechanism-by-mechanism findings:**

| Question | Finding |
|---|---|
| Is valuable non-expressive knowledge discarded? | **Yes, by the pipeline, not by rights.** Phase225/226/227 extract test-result leads from fetched HTML: numeric value, unit, a condition as a quantity (`at 200 °C`), an instrument cue, a method cue and an unverified subject, with only a block hash. **They are computed and thrown away**; nothing persists them. Phase246+249 could already hold them (class `independent_original_test`, measurement kinds, 25 products per host, role `test_publisher_declaration_unreviewed`, never test evidence by CHECK constraint). The connection is missing. |
| Are document-reproduction checks applied to structured facts? | No. Phase249 decides per fact kind and class; page bodies and prose are never kept (`prose_value_not_kept`). |
| Is a retained interpretation treated as protected source text? | No. `category_items` (PEE statements of at most 300 characters citing revisions) are not gated by the source's retention class. Review promotion is gated by evidence type, which is correct. |
| Where must source restrictions still apply? | `reviewed_prohibited` terms or refused basis → blocked; robots disallow → blocked; machine-readable reservations → metadata only (legally relevant in the EU, §1); per-host caps (regs 16(2), 19); public export only with `derived_publication`. |
| Is a per-operation gate missing? | The gates exist, but in six places: discovery (Phase75/223), access (Phase69/246 `host_access`), temporary interpretation (Phase222/224/225, in memory), structured retention (Phase249), original analysis (`category_items`), publication (`exportShards246`). Nothing reports them together for one source, so "blocked for X" is easily read as "blocked for everything". |
| Is a new retention policy necessary? | **No.** No measured loss is caused by the policy. |

**Conclusion [measured][eng].** Retention rights are not today's bottleneck. The bottlenecks are:

- **acquisition:** reads are disabled and no search provider is configured;
- **extraction scope:** there is no persistence for test leads;
- **representation:** there is no persistent shape for practical observations or qualified assessments in the staging tier. Phase101 is the reviewed tier.

The Phase262 result is also limited. It looked at retained labels, not original pages, and covered 19 jobs and 5 categories; it must not be generalised.

## 3. Discovery options (official documentation read on 2026-10-16)

| Option | Kind | Programmatic access and cost | Licence / terms | Fit for PEE |
|---|---|---|---|---|
| **SearXNG** (Phase223 adapter) | metasearch (depends on upstream engines) | Self-hosted or public instance. JSON must be enabled by the operator. Public instances often rate-limit or block bots (429, empty results). | Software AGPL-3.0: running a separate instance is not incorporating it, but operating or modifying one needs licence review | Good general recall for unfamiliar publishers, **only from a self-hosted instance**. Fragile on public instances. |
| **Common Crawl** CDX index | URL dataset (index of an existing crawl) | Free; CDX API heavily rate-limited (503, 24 h blocks); the columnar index (Athena, DuckDB) is suited to bulk use | Terms of use (no rights in third-party content) | Strong for capability A+ (URLs on a known or suspected host, with dates) and for finding pages on a domain; not a relevance search engine |
| **Open Web Index** (OpenWebSearch.eu) | open web index (downloadable partitions) | Dashboard download, registration (B2Access, Google, Facebook) | OWIL v1.0: **personal, non-commercial, research use**; attribution required; no redistribution; revocable | Usable for research evaluation only; **not for commercial operation** under current terms |
| **OpenAlex** | scholarly index | No key needed for basic queries; free key gives 10× the budget; 10–30 requests/s; 429 on overrun | Data free; licence not stated on the page read | Category science (heat transfer, psychrometrics, extraction) |
| **Crossref** REST API | scholarly metadata | No sign-up; `mailto` polite pool | "almost none of the metadata is subject to copyright"; abstracts may be | DOIs and standards literature; science lane |
| **Wikidata** | structured knowledge graph | Public API and query service | Main namespace **CC0** | Manufacturer official websites (property P856) and brand↔company links, for an identity and declaration lane |
| **Marginalia Search** | independent small-web search | Shared public key, own key on request | Software mostly AGPL-3.0; **data CC BY-NC-SA 4.0** by default; commercial licence negotiable | Long-tail and independent sites; non-commercial terms by default |
| Phase75/82/221 known channels | sitemaps and feeds of known sources | Per source | Per-source policy | Capability A (already connected in Phase261) |

Not verified this phase: Stract and YaCy (licences not confirmed) and any paid APIs (excluded as mandatory dependencies).

**Recommendation [eng]: no single engine.** Route by information need, through the provider-neutral plan Phase262 created:

| Need | Primary route | Secondary route |
|---|---|---|
| declared specifications and manuals | Wikidata P856 → official domain → known-source discovery (Phase75/261) | general search |
| independent performance | general search (self-hosted SearXNG) | Common Crawl URL index on candidate test publishers |
| category science, standards | OpenAlex, Crossref | — |
| safety | existing regulatory sources (GOV.UK OPSS, already retained) | — |

All routes produce the same `Candidate`/lead provenance and feed one validation model.

**Network feasibility [measured].** Egress goes through a policy-enforcing proxy. PEE's Phase69 transport supports `HTTPS_PROXY` (CONNECT). Whether a given endpoint is reachable is decided by that proxy. It was not tested, because no live request is authorised.

## 4. Blockers to the first real result (ordered)

1. **No authorised live metadata operation.** `ResearchPolicy257` types reads as false, so no edit of that file can permit one. The owner has not approved a search-specific policy.
2. **No configured provider.** The only SearXNG config is a disabled example with a placeholder endpoint.
3. **Test-result leads are not persisted** (§2), so even a lawful retrieval would keep no test knowledge.
4. **Product identity:** 15 of 19 job products lack a cross-site exact identifier.

## 5. Decision table

| Item | Decision |
|---|---|
| Fix Phase262's inference of a document's role from its host; separate "familiar domain" from "registered source identity"; complete the per-lead provenance (Phase261 too) | **Safe now: implement** |
| Pass the search provider in as a parameter (`runSearch`), with SearXNG/Phase223 as the default | **Safe now: implement** |
| Per-operation gate report for a source (discovery, access, interpretation, retention, analysis, publication), derived only from existing fields, with no new policy | **Safe now: implement** |
| Correct `reconcileRetentionGaps249` so rights gaps are not left open when rights are no longer the cause | **Safe now: implement**; the live store is *not* modified in this phase (3 affected gaps, reported) |
| Phase249 class policy, reservation detection, caps, `derived_publication` export gate, Phase255 reinspection, Phase246 revisit planning, Phase193 screening reuse | **Reuse unchanged** |
| Persist Phase225/226 test-result leads as `test_publisher_declaration_unreviewed` declarations under the existing Phase249 measurement rule (value, unit, condition quantity; subject kept unverified) | **Requires a lawful retrieval pilot first** (no real input exists to test on); legally within Phase249 as written; no new policy needed |
| Loosen reservation handling (keep facts despite `tdm-reservation` or `ai-input=no`) | **Not recommended**: legally relevant in the EU (DSM art 4(3)), 0 sources affected today [measured] |
| A metadata-search policy, plus a self-hosted SearXNG or another provider | **Requires owner approval and an operational decision** (endpoint, licence review for operating AGPL software, limits) |
| Wikidata, OpenAlex, Crossref and Common Crawl connectors | **Deferred**: one connector at a time after the first real pilot; terms are compatible with metadata lookup as read |
| Open Web Index | **Deferred**: non-commercial research licence only |
| Source scoring | **Deferred**: no validated contribution data (0 Phase260 records) |
| Teaching packages | **Deferred** to the next phase, as the brief requires |

## Sources

- [CDPA 1988 s28A](https://www.legislation.gov.uk/ukpga/1988/48/section/28A)
- [CDPA 1988 s29A](https://www.legislation.gov.uk/ukpga/1988/48/section/29A)
- [Copyright and Rights in Databases Regs 1997, reg 12](https://www.legislation.gov.uk/uksi/1997/3032/regulation/12), [reg 16](https://www.legislation.gov.uk/uksi/1997/3032/regulation/16), [reg 19](https://www.legislation.gov.uk/uksi/1997/3032/regulation/19)
- [DSM Directive art 2](https://www.legislation.gov.uk/eudr/2019/790/article/2), [art 4](https://www.legislation.gov.uk/eudr/2019/790/article/4)
- [GOV.UK: sui generis database rights](https://www.gov.uk/guidance/sui-generis-database-rights)
- *Ryanair v PR Aviation* C-30/14: [IPPT summary](https://www.ippt.eu/sites/ippt/files/2015/IPPT20150115_ECJ_Ryanair_v_PR_Aviation.pdf), [SCL](https://www.scl.org/3280-the-cjeu-takes-flight-databases-and-air-fares/)
- UK 2026 position: [Osborne Clarke](https://www.osborneclarke.com/insights/opted-out-uk-government-moves-away-preferred-position-ai-and-copyright-following-report), [DLA Piper](https://www.dlapiper.com/en/insights/blogs/mse-today/2026/tdm-and-training-ai-models)
- Reservation case law: [Oxford Business Law Blog](https://blogs.law.ox.ac.uk/oblb/blog-post/2025/12/ai-and-redefinition-law-code-future-legal-intention-under-article-4-dsm)
- Discovery services:
  - [Common Crawl FAQ](https://commoncrawl.org/faq)
  - [OWIL v1.0](https://openwebsearch.eu/owil-current/)
  - [OpenAlex rate limits](https://help.openalex.org/how-to-use-the-api/rate-limits-and-authentication)
  - [Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
  - [Wikidata licensing](https://www.wikidata.org/wiki/Wikidata:Licensing)
  - [Marginalia API](https://www.marginalia.nu/marginalia-search/api/)
  - SearXNG settings and `formats` (see the Phase223 report)
