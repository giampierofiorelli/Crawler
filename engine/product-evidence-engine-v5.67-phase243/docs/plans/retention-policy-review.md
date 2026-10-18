# Retention of public source texts: independent review (2026-10-18)

The owner asked (2026-10-18, Italian) for an independent, rigorous assessment of the rule "no third-party text in any
repository", starting from the law that actually applies. Four things are to be kept apart:
- lawful access and acquisition;
- temporary or private copies for research and verification;
- extraction and retention of facts;
- full reproduction and redistribution.

The assessment also covers whether a private Git repository changes the analysis, and must not assume the current
policy is right.

**Nothing is changed by this document.** No retention rule, no repository history, no deletion. This is not legal
advice. No lawyer reviewed it. A commercial launch needs counsel, chiefly on jurisdiction and UK commercial copying.

## 1. The questions the law turns on

1. **Which law.** Copyright is territorial; protection is governed by the law of the country for which it is claimed
   (Rome II, art. 8).
   - PEE's sources are mostly UK publishers.
   - The owner operates from Italy (EU law as implemented in L. 633/1941).
   - The copies are made in a cloud container and stored on GitHub.
   - A UK publisher could claim under UK law, so both regimes matter.
2. **Commercial or not.** PEE is described as an independent buying adviser. If it is, or becomes, a commercial
   service:
   - the UK research exception (s.29A CDPA) is unavailable;
   - the Italian research exception (art. 70-ter, research organisations only) is unavailable.

   The general EU exception (art. 70-quater) remains, subject to its conditions. This status should be stated by the
   owner; it changes the answer.
3. **What is copied.**

   | Material | Protected as |
   |---|---|
   | Facts (a measurement, a unit, a condition) | Not protected |
   | A page's text | Protected as expression |
   | 11 consecutive words | Can be a protected part if they express the author's own intellectual creation (CJEU Infopaq, C-5/08) |
   | A product catalogue or test database | Can carry the database right |

## 2. The four activities

| Activity | EU / Italy | UK | Assessment |
|---|---|---|---|
| **Lawful access and acquisition** | Accesso abusivo (art. 615-ter c.p.) for bypassing protections; anti-circumvention (InfoSoc art. 6) | Computer Misuse Act 1990; anti-circumvention (CDPA s.296ZA ff.) | **Obligation.** Never bypass paywalls, logins, CAPTCHAs or 403/429. A public URL is accessible, not licensed. |
| **Respecting opt-outs** | Art. 70-quater: TDM is lawful only if the rightholder has not expressly reserved it. For online content the reservation must be "appropriate", in practice machine-readable (DSM art. 4(3); OLG Hamburg, Kneschke v LAION, 10 Dec 2025, holds a natural-language reservation insufficient, appeal pending). Since L. 132/2025, TDM via AI systems in breach of 70-ter/70-quater is also a criminal offence (art. 171(1)(a-ter) LDA). | No opt-out regime; commercial TDM simply has no exception. | **Obligation** in the EU, and since 2025 a criminal-law matter in Italy. Honouring robots.txt, TDMRep, Content-Signal `ai-input=no` and `noai` is not mere prudence. |
| **Temporary copies to read and analyse** | InfoSoc art. 5(1) / art. 68-bis LDA: transient or incidental copies with no independent economic significance | CDPA s.28A, same test | **Allowed.** Fetching, parsing and analysing in memory are covered. |
| **Persistent private copies (raw HTML, rendered text) for research, verification and reproducibility** | Art. 70-quater: reproductions and extractions for TDM, for any purpose including commercial, from lawfully accessed content, with no reservation. **Retention only "for the time necessary for the purposes of TDM"** (comma 2). | s.29A: only for non-commercial research, with lawful access (contract cannot override). If commercial, there is no exception; s.28A does not cover persistent copies. | **EU: lawful within conditions** (no opt-out, purpose-limited, time-limited). **UK, if commercial: a concrete risk** without a licence. **US** (if the container's location governs the copy): fair use is arguable, not relied on. |
| **Extraction and retention of facts and provenance** | Facts are not protected. Database right (Directive 96/9 art. 7, art. 102-bis LDA) on substantial or systematic extraction harming the maker's investment (CJEU CV-Online Latvia, C-762/19) | Copyright and Rights in Databases Regulations 1997, regs 13 and 16 | **Allowed**, with per-host caps (already in Phase249). |
| **Short attributed excerpts as evidence** (one sentence of method or verdict) | Quotation, art. 70 LDA, for criticism, discussion or research, with attribution and not competing with the work | s.30 / s.30(1ZA) quotation, fair dealing, sufficient acknowledgement | **Low risk privately.** Public use only within quotation limits. |
| **Full reproduction or public redistribution** | Reproduction and communication to the public (InfoSoc arts. 2–3) | CDPA ss.17, 20 | **Prohibited** without a licence. Publishing page text in the public Crawler repository is a clear infringement. |
| **Website terms of use** | Contract. Where a database is not protected, the terms bind freely (CJEU Ryanair v PR Aviation, C-30/14). Courts differ on browsewrap. | Contract; s.29A(5) overrides terms only for non-commercial research | **Concrete risk per site.** Retailers' terms commonly prohibit automated extraction and TDM. Selfridges, John Lewis and Argos terms could not be retrieved by search; they must be read before use. |

## 3. Does a private Git repository change the assessment?

- **Not the copyright analysis.** A file in a private repository is a reproduction, exactly as a file on the container
  disk is.
  - Private access by the owner and Claude is not communication to a "new public".
  - The question is the legal basis for the copy and its duration, not where it sits.
  - PEE already keeps about 88 MB of raw pages on disk (`$PEE_PRIVATE_EVAL_DIR/*/raw`) for its evaluations. Legally,
    the Git copy of one rendered page and of sentences from 12 pages is the same kind of copy.
- **It changes three practical things:**
  1. **Duration.** Git history keeps a file indefinitely and is hard to delete. This conflicts with art. 70-quater's
     "only for the time necessary", which is the main legal reason to avoid Git for page copies.
  2. **Exposure.** Forks, clones and a mistaken visibility change turn a private copy into a published one.
  3. **Custody.** GitHub holds the copy as a service provider under its terms. That does not by itself breach anything.
- **Conclusion.** Committing page text to the private repository was a breach of our own rule, not, by itself, a legal
  violation. On the facts:
  - the pages were lawfully accessed;
  - no reservation was signalled;
  - the copies are a research and evaluation reference, kept privately.

  The defect is open-ended retention.

## 4. What in the current policy is obligation, prudence or our own choice

| Rule now | Basis | Class |
|---|---|---|
| Never bypass robots, 403/429, paywalls or logins | 615-ter c.p., CMA 1990, anti-circumvention | Obligation |
| Honour machine-readable TDM reservations, Content-Signal `ai-input=no`, `noai` | Art. 70-quater, DSM art. 4(3), art. 171(1)(a-ter) LDA | Obligation (EU) |
| No third-party text in the **public** repository; value-free public exports | Arts. 2–3 InfoSoc, CDPA ss.17/20; the Phase249 retention policy | Obligation |
| Per-host caps on retained facts | Database right (96/9 art. 7; UK regs 13/16) | Proportionate safeguard |
| Read each site's terms before acquiring | Contract | Prudent, necessary for retailers |
| "Page bytes are processed transiently and not stored" (Phase249 rationale, s.28A) | Was **inconsistent with practice**: the evaluation pipeline has kept raw pages on disk since Phase252 | **To correct**: name the real basis (art. 70-quater, or s.29A if non-commercial) and add a retention period |
| No page text in the **private** repository at all | No rule requires it as such | Our choice (the right outcome for raw pages, because of retention) |
| No short excerpts even privately (qualitative observations kept as codes only) | Quotation exceptions allow short attributed excerpts | **Over-strict**: it costs evidence quality (who said what, under which conditions) |
| History rewrite to remove the two commits | Not legally required while the repository stays private and the copy is a time-limited research copy | Optional |

## 5. Proposed proportionate policy (for the owner's decision; not applied)

**R0 — Access (unchanged, obligations).**
- Lawful access only; robots and every machine-readable reservation honoured.
- Stop on 401/403/429.
- For each new host, its terms of use are read, and their TDM or automated-access clauses recorded, before the first
  page request.

**R1 — Facts and provenance (unchanged).** Values, units, conditions, product identity, URL, byte hash, time and reader
version are retained privately with per-host caps. Public outputs stay value-free.

**R2 — Short attributed excerpts (new, private only).**
- At most one or two sentences (about 300 characters) per item, kept as the evidence for an interpretation: a method
  statement, a condition, an expert's qualitative observation.
- Each carries source URL, hash and position.
- Never published.
- This makes qualitative evidence ("annoying vibration at top speed", with author and test) representable.

**R3 — Research copies of full pages (made explicit, time-limited).**
- Raw HTML and rendered text may be kept privately, for TDM, evaluation and reproducibility of a named experiment, when:
  - R0 holds;
  - no reservation applies;
  - the terms do not prohibit it.
- For UK publishers while PEE's commercial status is unsettled: the same, but deleted when the experiment's report is
  accepted. Re-fetching from hashes is preferred.
- **Storage outside Git history:**
  - an access-restricted store whose items can be deleted individually (for example release assets of the private
    repository, or the private evaluation directory backed up as an archive);
  - only manifests and hashes go into Git.
- **Retention:** a stated review date per experiment (proposed: 12 months, or earlier when superseded), and a recorded
  deletion.

**R4 — Never.**
- Third-party text in the public repository.
- Republication of articles.
- Mirroring a catalogue.
- Ignoring a reservation.

**Guard (proposed):**
- extend the pre-push check so that both repositories refuse files with long runs of page-derived text (for example any
  JSON string over 1,000 characters, or text matching a retained page's shingles) outside the excerpt fields of R2;
- facts, hashes and R2 excerpts pass.

## 6. The two commits in the private history

The commits are `0517659` and `f73c0d1`:
- one manufacturer product page, rendered as text (Meaco 12L);
- method and noise sentences from 12 already-retained review and manufacturer pages.

Under R3 they are research copies of the K9 and KV experiments. A rewrite is therefore:
- **not legally necessary now**;
- **justified later**, when their retention review date arrives or if the owner prefers to apply the stricter rule;
- **not reversible**.

If it is done, the precautions are:
- an isolated rewrite (git-filter-repo on a mirror clone);
- a check that every other blob and file is byte-identical;
- a check that no other branch, tag or pull request exists;
- a force push, then a request to GitHub Support to purge cached views, because rewritten commits can remain reachable
  through GitHub's caches.

Not done; it awaits the owner's decision.

## 7. Open points for the owner

1. Is PEE, now or in the near future, a commercial service? This decides the UK basis for R3.
2. Which jurisdiction governs operations: an Italian operator, UK sources, cloud copies.
3. Approval of R2 and R3 (or changes), and of the guard.
4. The fate of the two commits: keep under R3 with a review date, or rewrite now.

## Sources consulted (2026-10-18)

- Art. 70-quater and 70-septies L. 633/1941 (Brocardi, text updated 18/12/2025); commentary on L. 132/2025 (Legance
  newsletter, Wolters Kluwer Copyright Blog, Merlin/OBS on art. 171(1)(a-ter)).
- s.29A CDPA (Bristows; CASRAI summary reporting that a March 2026 government decision keeps commercial TDM unlicensed:
  not confirmed against a government source).
- CJEU CV-Online Latvia C-762/19 (Bird & Bird, SCL summaries).
- OLG Hamburg, Kneschke v LAION, 5 U 104/24, 10 December 2025 (Bird & Bird, heise, Open Future).
- Selfridges, John Lewis and Argos terms: not found by search; to be read on the sites.

Not re-read in this session: InfoSoc, DSM and Database Directive texts, CJEU Infopaq and Ryanair. They are cited from
established knowledge and should be checked before any external reliance.
