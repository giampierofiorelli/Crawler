# Phase 40 — Production launch boundary and link approval gate

## Implemented

- `src/index.ts` no longer exports the experimental purchase timing function or commercial price rights utilities. Experimental source files remain for historical research and existing tests; **do not import them directly from any production app**.
- `src/launch_purchase.ts` requires an independently documented, uniquely matched, unexpired human approval record for each merchant link; no inferred approval and no auto-approval. The prior Phase 39 resolver still checks HTTPS, variant verification, Amazon UK canonical link/tag format, rights flags and market.
- No retailer or Amazon data can alter the ranking in the launch resolver. Missing merchant links leave product ranking intact.
- No Amazon API, scraping, historical price or price monitoring implementation was added.

## Mandatory approval record fields

- Unique approval ID; exact variant ID, market, retailer and exact destination URL
- Reviewer identity; review and expiry timestamps
- Evidence reference; merchant agreement reference; exact-variant match evidence; content/source rights reference
- Approved status (draft/revoked fail closed)

**Important**: These are assertions supplied by a compliance operator, not automatic checks of external contracts or live merchant pages. Never mark a record approved without actually reviewing its evidence. The demo fixtures do not represent real merchant authorizations.

## Remaining launch blockers

1. Review the current Amazon UK Operating Agreement and Special Links requirements; confirm exact intended multi-retailer placement and disclosure, preferably with written guidance.
2. Verify UK ASA/CAP advertising identification and placement of Amazon's required Associate disclosure.
3. Obtain and record actual affiliate agreements, variant identity evidence and source-content permissions for each destination.
4. Build an authorized verification workflow for real URLs and periodic re-review; do not treat an unexpired record as proof that stock or product identity has not changed.
5. Review UK GDPR/PECR cookie and affiliate tracking behavior and applicable market requirements.
6. Verify that any deployed server/API imports only the public launch entrypoint and that experimental price modules are not bundled or reachable. This requires deployment-level integration tests; package exports alone do not guarantee isolation.

## Public references (not proof of site-specific approval)

- https://affiliate-program.amazon.co.uk/help/operating/agreement
- https://affiliate-program.amazon.co.uk/help/operating/policies
- https://affiliate-program.amazon.co.uk/help/operating/license
- https://www.asa.org.uk/advice-online/affiliate-marketing.html
- https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/
