# PEE retention policy for factual observations (pee249-factual-observations-v1)

This is an engineering policy, not legal advice. No lawyer reviewed it. The owner authorised a proportionate
redesign on 2026-10-14, with this condition: "no blanket permission to copy restricted material is granted".

## 1. What changed and why

**Before (Phase246–248).** PEE retained a source's declarations only when that source had a reviewed per-source
`WebSourcePolicy` granting `fact_storage`. No such policy existed, so:

- 1,346 observed declarations were reduced to identity metadata;
- PEE could not accumulate knowledge at all.

**After (Phase249).** A documented source-class policy lets PEE keep, in its **private** operational store,
individual factual declarations observed on product pages. Each declaration keeps its provenance:

- URL;
- SHA-256 of the fetched bytes;
- fetch time;
- extractor version.

The policy is implemented in `src/phase249_retention_policy.ts` and enforced in `ingestObservation246`. It is the
CLI default (`--storage-policy class`); `--storage-policy deny` restores the Phase246 behaviour.

## 2. The distinctions the policy rests on

Sources fetched and read in this session (2026-10-14):

- GOV.UK guidance pages:
  - [exceptions to copyright](https://www.gov.uk/guidance/exceptions-to-copyright);
  - [sui generis database rights](https://www.gov.uk/guidance/sui-generis-database-rights);
  - [reuse GOV.UK content](https://www.gov.uk/help/reuse-govuk-content).
- Statute text from legislation.gov.uk:
  - CDPA 1988 s28A and s29A;
  - Copyright and Rights in Databases Regulations 1997, regs 12, 13, 16 and 19.

| Activity | Position taken | Basis |
|---|---|---|
| Accessing and reading a public page | Allowed, when robots.txt allows the path and the site does not refuse access (403/429 stop and suspend the host; nothing is retried or bypassed). | Access conditions are honoured technically; robots allowance is treated as a crawl condition, not a rights grant. |
| Temporary copy of the page bytes for analysis | Allowed. Bytes are hashed and parsed in memory, or in an operator scratch directory; they are never stored in the knowledge store and never committed. | CDPA s28A: a transient or incidental copy that is an integral part of a technological process for a lawful use, with no independent economic significance. |
| Keeping individual factual values (for example "1750 W", "6.22 kg", "£129") | Allowed privately, capped per host. | Copyright protects original expression, not facts. A short value is not a literary work. |
| Keeping expression (descriptions, reviews, articles, marketing copy, images) | **Not allowed.** Prose values are dropped by the extractor (`prose_value_not_kept`), and page bodies are never stored. | Copyright in literary and artistic works. |
| Systematically extracting a protected database | Bounded by per-host caps. PEE samples a source and does not mirror its catalogue. | Database right arises from substantial investment in obtaining, verifying or presenting contents (reg 13). Extracting a substantial part infringes (reg 16(1)), and so can repeated, systematic extraction of insubstantial parts (reg 16(2)). A lawful user of a published database may extract insubstantial parts for any purpose, and contract terms preventing that are void (reg 19). |
| Text and data mining exception | **Not relied on.** | CDPA s29A covers non-commercial research only; PEE may become commercial. |
| Contract terms, robots and other access conditions | Terms reviewed as prohibiting the use → `blocked`. Machine-readable reservations → metadata only: a robots.txt `Content-Signal: ai-input=no` in the `*` group, `<meta name="tdm-reservation" content="1">`, or a `noai` robots meta. | Honours expressed reservations without per-fact manual approval. |
| Citation and linking | Every retained value keeps its source URL, so PEE can cite and link. | Citation is **not** treated as permission to copy. |
| Public redistribution of retained values | **Not allowed.** Public shard exports still need a per-source policy granting `derived_publication`; private exports and backups include the values. | Making contents available to the public is "re-utilisation" (reg 12). It needs its own justification. |
| Original assessments built from many facts | Allowed. They are PEE's own expression and cite their sources. | Not a copy of any source's expression. |

## 3. Classes and caps

| Source class | Value kinds kept | Products per host |
|---|---|---|
| manufacturer | all short factual kinds | 300 |
| retailer | all short factual kinds | 50 |
| reference_encyclopedia | all short factual kinds | 50 |
| editorial, community, promotional, unknown | all short factual kinds | 30 |
| independent_original_test | numeric measurements only (quantity, range, dimensions, number) | 25 |

**Why the caps are uneven.**

- Manufacturer specification data is largely data the manufacturer *created*. Retailers and test publishers
  invest in *obtaining and verifying* data, which is what database right protects (reg 13). They therefore get
  tighter caps.
- Test publishers' verdicts and text are never kept. Only individual measurements are kept, cited, for a small
  number of products.

**How the cap works.**

- The cap counts distinct products with retained facts from a host.
- Re-observing a product that is already counted never trips the cap.
- A source reaching its cap continues as metadata only, with the gap `insubstantial_part_cap_reached`.

## 4. Remaining legal uncertainty, and the restriction kept for each point

1. **Website terms without a machine-readable reservation.** PEE does not read every site's terms.
   - Under reg 19, a term preventing insubstantial extraction from a published database is void for a lawful user.
     However, this protection exists only where UK database right exists.
   - Under the GOV.UK guidance, UK database right is not available to non-UK makers for databases created on or
     after 1 January 2021. For such sources, contract terms may govern instead.
   - Restriction kept: any per-source review that finds terms prohibiting the use blocks the source.
   - Open: whether to add an automated terms check, and for which source classes.
2. **"Lawful use" in s28A.** If a site's terms forbid automated access, whether the transient copy serves a lawful
   use is uncertain. The policy relies on robots and access conditions as the operative signal; this is a judgement,
   not a settled rule.
3. **Case law not re-verified in this session.** Two cases are recalled from general knowledge, and their current
   status in UK law was not checked:
   - *British Horseracing Board v William Hill* (C-203/02): investment in *creating* data is not investment in
     obtaining it.
   - *Ryanair v PR Aviation* (C-30/14): contract terms can restrict use of a database that has no sui generis
     protection.
4. **Personal data.** Product specifications are not personal data. Reviews, seller names and community posts can
   be, and PEE does not retain reviews or posts.
5. **Other jurisdictions.** EEA database right applies to EEA makers. The caps are the same everywhere; a
   jurisdiction-specific policy is future work.

## 5. Owner-visible effect

Re-deriving every page whose raw bytes remained available (hashes verified against the recorded receipts) gave:

- **0 → 2,385 privately retained factual declarations**;
- 140 revisions, 188 product identities and 90 sources;
- an intact event journal.

Three revisions remain metadata-only, because they are methodology pages with nothing to extract.

None of these values is in Git. The store lives at `$PEE_KNOWLEDGE_DIR`, by default
`~/.local/share/product-evidence-engine/knowledge`, and refuses to open inside a Git working tree.

In this execution container that location is **ephemeral**. Durable hosting means pointing `PEE_KNOWLEDGE_DIR` at a
persistent volume, and keeping the rotated, verified backups (`backup-rotate`) on a second medium.
