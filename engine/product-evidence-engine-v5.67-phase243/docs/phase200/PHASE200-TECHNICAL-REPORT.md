# Product Evidence Engine — Phase 200: Signed Source Custody and Specialist Trust Staging

**Data:** 13 ottobre 2026  
**Rilascio cumulativo:** v5.24.0, da `product-evidence-engine-v5.23-phase199.zip` (SHA-256 originale `c884b205cb7fe7dcefb9d48c27333865e99cff49d4344293ab64743c729b46ae`).  
**Stato:** incremento software verificato su fixture sintetiche; **non è un servizio pubblico di autenticazione di certificazioni e non abilita badge live**.

## Decisione ingegneristica

La Phase199 crea dichiarazioni di validazione specialistica comprensibili nelle schede prodotto, ma la sua catena di custodia e le identità dei due revisori sono **dichiarazioni testuali del chiamante**. Un revisore scritto in una stringa non è autenticato e l'hash dichiarato di un documento non autentica la sua provenienza. In Phase200 abbiamo costruito un passaggio separato *solo per staging privilegiato* che verifica ricevute firmate, confronta i byte completi del documento *in memoria*, lega le approvazioni al contesto decisionale esatto e rifiuta revoche/firme non valide.

Non abbiamo creato nuovi crawler, database di contenuti editoriali, sistemi di reputazione editoriale, punteggi di ranking o logo di certificazione PEE. Il valore è limitare il rischio che un falso dossier Phase199 produca un segnale rassicurante senza traccia verificabile.

## Codice effettivamente aggiunto

**`src/phase200_signed_source_publication_gate.ts`** (nuovo):

1. `CaptureClaim200` associa variante esatta, documento/versione, URL HTTPS, tipo di origine (`issuer_primary_registry` o `publisher_original_document`), SHA-256 dell'intero documento, data di acquisizione, content type e dichiarazione di controllo TLS. La firma Ed25519 viene verificata contro una chiave del servizio di acquisizione presente nella policy del deployment; il contenuto completo viene confrontato tramite SHA-256, poi **non** entra nella risposta e **non** viene scritto dal modulo su disco.
2. `ApprovalClaim200` autentica *crittograficamente la sottoscrizione* di due differenti ruoli operativi (`source_custody_reviewer`, `scope_and_conflict_reviewer`). Il loro payload firma lo stesso `claimBindingSha256`, la stessa impronta della presentazione Phase199, la variante, il criterio, la revisione del documento e la data. Chiavi o persone duplicate non soddisfano il requisito.
3. `ReleaseStatus200` obbligatorio, firmato dalla distinta autorità di stato. Contiene lo stato delle revoche attualmente conosciute e una data di aggiornamento con freshness massima; status assente, scaduto o manomesso blocca la messa in staging. Una revoca firmata del claim vincolato prevale su vecchie approvazioni ancora crittograficamente valide.
4. `stageSpecialistTrust200(...)` **ricalcola** il giudizio Phase199 dal request specialistico, e non accetta una card positiva già preparata dal chiamante. Solo un dossier Phase199 già circoscritto e un pacchetto Phase200 completo possono generare una `stageCard`; rimangono espliciti `livePublishingAuthorized:false`, `rankingChanged:false`, `actualIssuerClaimsValidatedByRuntime:false` e `productOutcomeIndependentlyVerifiedByPEE:false`.
5. L'adapter opzionale per `lookupScreening193(...)` impedisce che un precedente screening *riutilizzabile su byte originali identici e sulla medesima policy* classificato come classifica Amazon o articolo derivato venga silenziosamente trasformato in un test originale. Il cambio di byte o di policy comporta nuova revisione, non blacklist. Non attribuisce autenticità alle decisioni pregresse, che restano un registro di hash senza firma indipendente.
6. Si riutilizzano direttamente la valutazione di sufficienza Phase197, la valutazione specialistica Phase198, la presentazione Phase199 e la genealogia dei gruppi di evento già incorporata. La verifica Phase200 è **specifica per singola variante/criterio/evento**; non altera le classifiche Phase181 e non elimina prodotti poco recensiti.

**`tests/phase200_signed_source_publication_gate.test.ts`**: 39 nuovi test software con chiavi Ed25519 generate localmente e documenti fittizi. Include firma manomessa, hash e versione modificati, variante diversa, programma non pertinente, fonte originale vs registro, ruoli separati, stessa chiave riciclata, doppia persona, revoca, snapshot revoche scaduto, testo integrale assente dall'output, Phase193 commerciale riutilizzato solo con contenuto/policy invariati, endorsement commerciale, qualifica senza supporto e rigore di scope.

**`package.json`**: 5.23.0 → 5.24.0, script `npm run test:phase200`.

## Verifiche riproducibili

| Controllo | Risultato | Dove si trova |
|---|---:|---|
| TypeScript `npm run build` | PASS | `docs/phase200/test-logs/build-phase193.log` |
| Phase200 `npm run test:phase200` | **39/39 PASS** | `docs/phase200/test-logs/phase200-target-final.tap` |
| Regressione cumulativa TS (13 shard) | **3.426/3.426 PASS** | `docs/phase200/test-logs/ts-shard1.log` … `ts-shard13.log` |
| Regressione cumulativa Python (6 gruppi) | **212/212 PASS** | `docs/phase200/test-logs/python-*.log` |
| Corpus reale con snapshot originali firmati e valutatori indipendenti | **0 valutati** | Mancanza dichiarata, non benchmark superato |

I test sono fixture software originali, non verifiche di prodotti commerciali o autenticazioni indipendenti di certificati. Le chiavi generate nei test sono fittizie, non chiavi di un ente certificatore, e **non** vengono conservate nel rilascio.

## Confronto con la v5.23 / Phase199

| Dimensione | Fase 199 | Fase 200 |
|---|---|---|
| Source custody | Campo dichiarato `confirmed_original_publisher` | Firma della ricevuta di acquisizione più match dei byte temporanei, con fiducia nella chiave della fonte di cattura |
| Identità dei revisori | Due stringhe identificative | Due firme Ed25519 di ruoli distinti ancorati a chiavi configurate, senza prova autonoma delle identità civili |
| Revoca | Status Phase198 noto al caller | Snapshot firmato e fresco di revoche *di approvazioni PEE* |
| Fonte originale / registro | Dossier dichiarato | Due classi di ricevute che non possono impersonarsi a vicenda |
| Screening commerciale Phase193 | Non attraversato dalla presentazione | Controllo negativo riutilizzabile solo quando revisione/policy/scope coincidono |
| Test professionali / certificazione del modello | Sempre distinti | Distinzione preservata e richiede firma per la propria classe di origine |
| Output | Card consumer-preview | Card soltanto in staging controllato; **nessuna pubblicazione** |
| Test cumulativi TS | 3.387 | 3.426 |
| Test cumulativi Python | 212 | 212 |

## Limiti critici e minacce non risolte

- **La firma non prova la verità della dichiarazione.** Una firma Ed25519 prova il controllo della chiave privata corrispondente alla chiave autorizzata. Non dimostra da sola che la pagina sia stata realmente acquisita da quel sito, che un certificato sia veritiero, che uno chef sia competente o che un prodotto faccia un ottimo espresso. Il servizio di acquisizione deve possedere TLS/DNS, controllo redirect, diritti, policy robots, tracciabilità e verifiche di issuer autentici. Il PEE dispone già del lettore ristretto `approved_web_reader.ts` e del planning Phase182: il prossimo adapter deve riusare quei controlli, non ricreare un crawler.
- **Trust store ancora passato come configurazione dall'operatore.** In questa fase l'API accetta un `TrustAnchorPolicy200` e ne verifica struttura, algoritmi e scadenze. Il codice NON dimostra che chi gli passa la policy abbia diritti amministrativi. La politica deve essere caricata da configurazione server protetta con autenticazione, gestione revoche chiavi, approvazioni e separazione dei poteri; non dal browser né dai metadati della recensione. Una chiave compromessa resta un rischio.
- **Status release firmato = dichiarazione di stato dell'autorità PEE**, non verifica autonoma del registro del certificatore. Un registro potrebbe cambiare fuori banda. Occorre una riconciliazione regolare con l'issuer ufficiale, identificazione del modello esatto, mercato, programma, data, condizioni e autorizzazione del marchio; in questa fase non è implementata.
- **Il confronto SHA-256 autentica i byte forniti rispetto alla ricevuta firmata, non l'asserzione di provenienza HTTP.** Nessuna immutabilità di pagina remota è certificata. Una nuova versione del documento richiede nuova cattura. Qualsiasi testo recuperato temporaneamente deve essere ottenuto lecitamente e non archiviato integralmente.
- **Doppia firma non equivale a due professionisti realmente indipendenti** senza gestione delle identità, delle relazioni e dei diritti. `principalId` proviene dal registro chiavi del deployment, e deve essere mantenuto in un servizio autorevole. Le due funzioni possono anche far parte della stessa organizzazione. L'opportunità di ulteriori controlli deve essere studiata.
- **Carenza di benchmark reali.** Non è stata misurata precisione/recall nel riconoscimento delle credenziali autentiche, dei registri variabili o di originalità sperimentale. Nessuno studio UX ha dimostrato che il badge aumenti fiducia *calibrata* invece della semplice propensione all'acquisto.
- **Non pubblicare Phase199 o Phase200 su un sito aperto** usando questa API come unica autorizzazione. `livePublishingAuthorized:false` è intenzionale. Anche le eventuali certificazioni scadute o sospese devono essere ricontrollate nelle fonti originali.

## Ricerca metodologica e fonti originali

Le fonti sono riferimenti ufficiali sul problema progettuale; non validano le prestazioni empiriche del nostro software.

1. **W3C, Verifiable Credentials Data Model 2.0 (Recommendation, 15 maggio 2025).** Distingue *verification* (autenticità, integrità e status della credenziale) da *validation* (idoneità delle affermazioni per un uso concreto). La verifica della firma **non** certifica la verità della sostanza della dichiarazione. https://www.w3.org/TR/vc-data-model-2.0/
2. **W3C, Verifiable Credentials 2.0 suite (15 maggio 2025).** Panoramica delle specifiche incluse prove crittografiche e liste di status/revoca; il nostro modulo NON implementa lo standard W3C VC completo, usa ricevute Ed25519 PEE proprietarie e circoscritte. https://www.w3.org/news/2025/the-verifiable-credentials-2-0-family-of-specifications-is-now-a-w3c-recommendation/
3. **NIST SP 800-63B-4 (2025)**, autenticazione di soggetti e livelli di sicurezza. Spiega perché firme verificabili e gestione dei soggetti sono questioni distinte; non dichiariamo conformità NIST. https://csrc.nist.gov/pubs/sp/800/63/B/4/final
4. **NIST SP 800-92**, security log management e requisiti di processo per l'audit. È un riferimento per le future registrazioni protette. https://csrc.nist.gov/pubs/sp/800/92/final
5. **W3C PROV-O**, relazioni fra fonti primarie, derivazioni, revisioni e agenti. Base semantica coerente con genealogia Phase192–195. https://www.w3.org/TR/prov-o/
6. **UKAS, Find an organisation**, registro degli organismi accreditati. L'accreditamento dell'organismo non implica automaticamente che il modello preciso sia certificato per il criterio desiderato. https://www.ukas.com/find-an-organisation/
7. **ENERGY STAR Product Finder, U.S. EPA**, registro ufficiale di modelli e ambiti di certificazione. Una certificazione energetica non prova qualità gastronomica né certifica un diverso modello. https://www.energystar.gov/productfinder/index
8. **Digital Markets, Competition and Consumers Act 2024, Schedule 20**, affermazioni commerciali vietate, compreso mostrare un marchio di fiducia senza autorizzazione o dichiarare una approvazione falsa/fuori ambito. https://www.legislation.gov.uk/ukpga/2024/13/schedules/enacted
9. **U.S. FTC, Advertising FAQ**, un endorsement esperto richiede competenza pertinente, un'analisi adeguata e disclosure dei rapporti rilevanti, non soltanto reputazione. https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business
10. **AVPN, elenco forni elettrici approvati**, esempio di schema specialistico legato alla preparazione. Il fatto che il registro esista non costituisce conferma che il PEE abbia verificato un modello. https://www.pizzanapoletana.org/en/forni_elettrici_approvati
11. **SCA, Certified Home Brewers**, programma specifico per caffè filtro, **non** per espresso italiano tradizionale. https://sca.coffee/certified-home-brewer
12. **MAFF, Cooking Skills and Knowledge of Japanese Cuisine**, credenziali di competenza di cuochi che non devono essere scambiate per certificazione del coltello o dell'utensile. https://www.maff.go.jp/e/policies/market/cooking_skills.html

## Phase201 raccomandata

Il massimo incremento successivo sarebbe collegare il lettore autorizzato e i registri di origine reali a una cattura con ricevuta firmata, sotto un identity/RBAC effettivo. Poi sviluppare test su fonti autentiche controllate (programmi AVPN/SCA/registri di prodotto), con attribuzioni indipendenti. Soltanto dopo sarà sensato valutare l'attivazione della scheda prodotto reale, il controllo dei marchi autorizzati e un test UX *di comprensione e calibrazione della fiducia* con misure preregistrate e gruppo di confronto. Tutto senza creare un punteggio reputazionale universale o penalizzare prodotti poco documentati.
