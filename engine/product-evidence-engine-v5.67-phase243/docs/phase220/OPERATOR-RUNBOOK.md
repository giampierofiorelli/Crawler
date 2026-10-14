# Phase220 operator runbook

A minimal development runtime can compile the TypeScript code with Node >=20 and `npm install` (only existing TypeScript and `@types/node` devDependencies). The real CLI accepts one English request and an operator-curated registry.

```bash
npm run build
node scripts/phase220-run.mjs --request 'I need football boots for AG pitches' --registry docs/phase220/phase220-category-vocabulary.json --state /tmp/pee-state.json --output /tmp/pee-run.json
```

The shipped registry contains **no approved sources**, on purpose. It is not a production registry. Each source requires a real independently reviewed and documented `WebSourcePolicy` (legal basis for metadata discovery, exact host, actual rights document, named reviewer, review date, expiry, terms decision, robots snapshot and commercial-use review) and Phase82 WatchSource. Merely setting `rightsClearedForMetadata: true` or inventing a `rightsDocumentId` **is not permission**. The operator must ensure upstream registry control, secrets/security policies, source rights and storage compliance. The application applies the inherited rights gate again and re-reads robots before sitemap access; unknown/expired policy fails closed.

Only `sitemap_delta` is executable in this Phase220 worker. RSS, Atom, browser rendering, search-engine index retrieval and general content crawling **are not** implemented in this runner. Without a lawful publisher scope and network/DNS, it will stop and issue reasons. In fixture mode only, tests may inject fictional HTTP responses; the CLI cannot accept them.

The output's `networkRequests` means **attempted transport URLs**, not proof the remote host returned content. Candidate URLs are unverified leads. SHA-256 is emitted only when exact HTTP payload bytes are available. Source-state JSON uses atomic writes, but is not authenticated or an evidence ledger. Never release product recommendations from these records.
