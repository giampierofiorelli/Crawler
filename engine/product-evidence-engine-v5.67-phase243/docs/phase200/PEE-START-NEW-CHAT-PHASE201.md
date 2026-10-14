# Product Evidence Engine — continuazione cumulativa dalla fase 201

**Base completa canonica:** `product-evidence-engine-v5.24-phase200.zip` (NON il checkpoint incrementale e NON la v5.23).

## Risultato della Phase200

Il nuovo `src/phase200_signed_source_publication_gate.ts` aggiunge una verifica offline delle ricevute e approvazioni firmate con Ed25519, SHA-256 sui byte originali *temporanei* e due ruoli di revisione distinti. È collegato a Phase199, Phase198, Phase197 e opzionalmente a Phase193 per *bloccare* l'errata promozione di documenti commerciali/derivati già schermati a parità di versione/policy. Usa un feed di revoche firmato e freshness limitata. Le attestazioni sono legate a fonte, variante, criterio, evento e revisione, non a notorietà o nazionalità. Non salva il testo integrale dei documenti né crea un nuovo ranking.

Versione: **5.24.0**. Test eseguiti: **39** mirati, **3.426 TypeScript cumulativi** (13 gruppi), **212 Python** (sei gruppi), tutti superati. Log in `docs/phase200/test-logs`, riepilogo `PHASE200-TEST-RESULTS.json`. SHA-256 e confronto col predecessore nel manifesto integrità.

## Limiti critici da rispettare

- Questo è **staging privilegiato, non autorizzazione alla pubblicazione**. `livePublishingAuthorized:false` e `actualIssuerClaimsValidatedByRuntime:false` sono vincoli espliciti.
- Le chiavi firmanti devono essere fornite da una configurazione server indipendente, autenticata e protetta; l'API di ricerca NON autentica il chiamante, NON verifica da sola il TLS remoto e NON implementa un sistema completo W3C Verifiable Credentials.
- Il rilascio contiene solo **fixture sintetiche**, non snapshot autentici verificati da servizi autorizzati e non un benchmark scientifico su certificazioni/recensioni live.
- Non installare crawler/API commerciali né nuove librerie senza prova del vantaggio. **Riutilizzare** `src/approved_web_reader.ts` (Phase69), `src/phase182_gap_research_orchestrator.ts`, Phase193 versioned screening, Phase195 metadata lineage, Phase196 fonte matrix, Phase197 sufficiency, Phase198 outcome, Phase199 consumer communication.
- Ricerca multi-lingua internazionale rimane una strategia ancora da validare; attuale priorità inglese. L'assenza di prove non indica scarsa qualità. Esperti scelti per competenza documentata *sullo specifico compito*, non per nazionalità automatica.
- Nessun sigillo ufficiale può essere rappresentato senza autorizzazione. Certificazione formale del prodotto, approvazione specialistica, test pratico originale e endorsement commerciale devono restare entità diverse.

## Prossimo incremento consigliato: integrazione trust boundary autentico

1. Ispezionare di nuovo tutti i moduli esistenti e fare CRC + compile/test del ZIP cumulativo. Salvare checkpoint prima di operazioni lunghe.
2. Progettare un adapter **privilegiato** per il lettore approvato Phase69/182: fonte primaria HTTPS con controllo DNS/TLS, robots e diritti, identità issuer dell'endpoint/registro, data/versione originali, limiti su redirect e byte, fingerprint completo. Senza archiviazione del corpo editoriale.
3. Aggiungere credential/role management verificabile con identity provider reale (identity proofing, rotazione e revoca delle chiavi, account e ruoli separati, controlli d'approvazione). La firma di un operatore non dimostra che l'associazione ha rilasciato una certificazione: verificare i veri programmi/registri e le condizioni.
4. Collegare snapshot firmati delle revoche con freshness e audit resistente a manomissioni indipendente; il feed *non* può essere controllato da chi propone la scheda.
5. Benchmark autentici su scope/varianti/date di registri e recensioni reali con etichettatura indipendente, inclusi casi negativi, certificazioni scadute, doppie pubblicazioni del medesimo esperimento, specialisti di nicchia, attestati fuori settore, rischi di false approvazioni.
6. Soltanto dopo l'autenticazione, valutare il collegamento alla vera scheda prodotto e la UX dei trust signal con verifica degli effetti di comprensione/decision accuracy e non soltanto conversione.

**Non dichiarare completata l'autenticazione esterna delle prove, non rendere live badge sulla base della Phase200 e non riavviare il progetto da zero.**

Rapporto completo: `PHASE200-TECHNICAL-REPORT.md` (con link originali e limiti).
