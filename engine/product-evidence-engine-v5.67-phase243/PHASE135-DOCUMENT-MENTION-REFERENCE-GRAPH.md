# Product Evidence Engine — Phase 135

**Data:** 11 ottobre 2026  
**Release:** v4.59 / Phase 135  
**Parent cumulativo:** v4.58 / Phase 134, ZIP SHA-256 `c749d37868cf940e6df5ad8ba0c953e214f79cd08c38b58f7a3b957841342a44`  
**Area:** grafo documentale delle menzioni, identità di prodotto e riferimenti interfrase  
**Priorità linguistica:** inglese; nessuna nuova dipendenza o servizio.

## 1. Stato raggiunto realmente

Nella fase 134, `inspectAtomicCandidate134` può analizzare una relazione già dotata di due span e di una fonte integra, individuando alcuni modificatori contestuali. Da solo, non sa se «It» nella frase successiva indichi un determinato prodotto oppure il suo accessorio. La fase 135 **aggiunge software eseguibile e testato** per conservare questa distinzione in un grafo; non dichiara di avere ottenuto comprensione linguistica generale.

### Nuovo codice

- `src/phase135_document_mention_graph.ts`: `buildDocumentMentionGraph135` e `inspectDocumentBridge135`.
- `tests/phase135_document_mention_graph.test.ts`: 29 test in scenari costruiti (documenti, nomi, anafore, conflitti, ricevute di revisione, fake hash, integrazione fasi 131/132/134).
- `scripts/evaluate-phase135.mjs`: 4 scenari illustrativi riproducibili, con trace JSON.
- `scripts/phase135_regress.mjs`: riesecuzione a gruppi dei test TypeScript eleggibili.
- `PHASE135-CONSTRUCTED-TRACE.json`: output *developer-authored*, non evidenze professionali indipendenti.
- `PHASE135-REGRESSION-GROUPS.json` e `PHASE135-RELEASE-VERIFICATION.json`: controlli di regressione e integrità del pacchetto.

## 2. Contratto del grafo

**Input:** `RelationDocument131` (testo originale, fonte, ID del documento e SHA-256), lista di `MentionInput135` con offset originali, tipo e identità **già annotata a monte**. Per i prodotti è obbligatorio il variant ID: nessuna identificazione automatica e nessun trasferimento di identità da fonti diverse. Facoltativamente sono ammesse `ReferenceReview135`, ricevute di adjudication umana con ID di annotatore, document hash e hash della finestra testuale composta dalle due frasi pertinenti.

**Output:** frasi e paragrafi con offset UTF-16 half-open, nodi di menzione, archi espliciti e alternative ancora aperte, più divieti costanti `rankingAuthorized:false` e `canonicalWriteAuthorized:false`.

**Stati:**

- `anchor`: prima menzione esplicita tipizzata, che costituisce un punto di riferimento locale, senza certificare l'autenticità della fonte;
- `resolved_explicit_repeat`: nome non generico ripetuto nello stesso documento con **la stessa** identità annotata, variante e tipo; è equivalenza testuale locale, non verità scientifica;
- `unresolved`: pronome o descrittore con candidati alternativi, assenza di antecedente, conflitto di identità o limite di paragrafo;
- `resolved_reviewed_reference`: collegamento registrato con una ricevuta di revisione riferita a quel documento e a quell'intervallo testuale. **La presenza della ricevuta non equivale all'autenticazione crittografica del revisore** e non concede accesso al ranking.

I pronomi inglesi comuni (*it, its, they, their*) e alcuni descrittori (*this device, the unit*) sono riconosciuti solo quando gli offset vengono forniti a monte. Il modulo **non determina da sé che cosa indicano**. Produce alternative di antecedenza nello stesso paragrafo e nella frase immediatamente precedente; se manca la revisione o la ripetizione esplicita del nome, il collegamento resta aperto. Un accessorio annotato può competere con il prodotto: una *heated dock* e un *robot* non vengono fusi solo perché «It» segue immediatamente.

## 3. Collegamento effettivo con le fasi precedenti

`inspectDocumentBridge135` riceve una `CandidateRelation131` che riguarda il pronome o il nome ripetuto **e un outcome nella stessa frase**. Richiede:

1. documento e SHA-256 correnti uguali a quelli del grafo;
2. Phase131 `assertRelationAnchoring131` (comprende il guard di contesto Phase132);
3. ricostruzione deterministica del grafo da menzioni + ricevute, per rilevare falsificazioni di un semplice status in memoria;
4. span dei due argomenti esattamente corrispondenti alle menzioni, evidenza contenuta in una sola frase;
5. riferimento al prodotto risolto tramite nome ripetuto o ricevuta di revisione locale;
6. `inspectLearnedProposal134` prima di rilasciare un'eventuale **ipotesi in quarantena**.

Il ponte NON inventa un predicato che colleghi due frasi. Il predicato dev'essere già proposto separatamente per una frase e sottoposto ai controlli delle fasi 131–134. Se il pronome resta ambiguo, la decisione è `reference_unresolved`, senza `atomicDecision`. Un collegamento approvato non supera automaticamente una negazione come «It did not improve...», che continua a essere bloccata da Phase132.

**Non c'è nessun writer verso CategoryBrain 128/129, nessuna modifica a query interpretation, ranking, DB canonico, web crawling o ingestione.**

## 4. Risultati ottenuti / cosa NON dimostrano

| Controllo | Risultato | Limite |
|---|---|---|
| Nuovi test Phase135 | **29/29** superati | Esempi costruiti dallo sviluppatore, nessun set annotato indipendentemente |
| Regressione TypeScript inclusi i nuovi test | **1.525 test su 94 file** | Esclusi gli stessi due test legacy Phase91/92 già esclusi nella release precedente |
| Python precedenti | **77/77**: 47 primary + 21 ingestion + 9 Phase133 | Non misurano la qualità del nuovo coreference graph |
| Scenario replay | **4** esempi | Solo illustrazioni, senza valore di precision/recall di prodotto |
| Dipendenze runtime introdotte | **0** | Usa solo Node.js/TypeScript già esistenti e moduli built-in |
| Corpus di recensioni professionali originali, annotato blind | **0** | Precisione, richiamo, tasso di false link e costo su workload reale **sconosciuti** |
| Modelli/licenze di codice terzi integrati | **0** | Nessuna equiparazione ai risultati di GLiNER2, DeepKE, Snorkel, medSpaCy, TypeSafe |

I controlli SHA-256 provano la coerenza dei dati consegnati dal chiamante, **non** l'autenticità del sito sorgente, i diritti d'uso, l'identità reale dell'annotatore o la veridicità delle conclusioni.

## 5. Limiti tecnici da affrontare, senza nasconderli

1. **Le menzioni sono annotate a monte.** Se l'upstream dimentica di segnalare un accessorio o assegna il tipo sbagliato, l'elenco degli antecedenti può apparire artificiosamente univoco. La fase 135 non ripara la lacuna.
2. **Nessuna disambiguazione autonoma dei pronomi.** Identificare una sola possibilità annotata non è prova che il pronome la designi. Serve revisione, e il tasso di astensione può essere alto.
3. **Niente dipendenze sintattiche o semantica documentale generale.** Il detector di frasi è deliberatamente elementare: abbreviazioni, citazioni complesse, tabelle, OCR, interruzioni di riga e lunghi documenti con più referenti richiederanno ulteriori metodi e test.
4. **Niente catene anaforiche automatiche.** «It ... It ...» resta generalmente irrisolto senza nuovi antecedenti espliciti e revisione.
5. **Solo equivalenza locale delle denominazioni.** Non sono state aggiunte alias generiche di marca/modello, attributi di versione esterni al testo o collegamenti fra documenti distinti.
6. **Ricevuta di revisione non autenticata.** È presente una traccia verificabile rispetto a ID e hash del testo, non una firma digitale, un audit scientifico indipendente o una fonte di verità.
7. **Nessuna valutazione produttiva delle prestazioni.** Lo scanning è limitato a 250.000 caratteri, 300 menzioni e 100 ricevute, ma CPU e memoria non sono ancora benchmarkate su macchine di deploy.

## 6. Continuità dello studio dei repository caricati

I repository originali rimangono **fuori dal runtime e fuori dal pacchetto**, esattamente come nella fase 134. La fase 135 riprende dalle relazioni documentali in DeepKE, dai grafi tipizzati in medSpaCy, dal principio di astensione di Snorkel e dalla separazione tra candidati e constraints di GLiNER2. Non incorpora i modelli, le implementazioni Python, il codice dei vendor, i pesi, le API o il loro hosting.

I file di studio anteriori rimangono nel pacchetto sotto `research/phase134_reference_studies/`, insieme alle decisioni cumulative delle fasi precedenti.

**Riferimenti di origine (URL copiabili):**

- DeepKE (sorgente): https://github.com/zjunlp/DeepKE
- DocRED (paper di relazione interfrase): https://aclanthology.org/P19-1074/
- medSpaCy (sorgente): https://github.com/medspacy/medspacy
- medSpaCy `context_graph.py`: https://github.com/medspacy/medspacy/blob/master/medspacy/context/context_graph.py
- Snorkel (sorgente): https://github.com/snorkel-team/snorkel
- GLiNER2 (sorgente): https://github.com/fastino-ai/GLiNER2
- TypeSafe (documentazione studiata, non installata): https://docs.typesafe.ai/introduction

Questi URL identificano gli studi tecnici di riferimento: **non** dimostrano performance sperimentali del nostro software, né autorizzano la copia indiscriminata di codice/pesi/dataset.

## 7. Prossimo lavoro consigliato: Phase136

Preparare un campione *source-disjoint* di documenti professionali originali in inglese ottenuti con diritti adeguati e un protocollo di annotazione indipendente prima della taratura. Annotare menzioni, varianti, antecedenti, alternative plausibili, esito indeterminato e collegamenti tra frasi. Misurare prima il baseline Phase134 (astensione interfrase), poi Phase135 (copertura, false positive dei link, precision a copertura accettata, costo di revisione e memoria/CPU), con breakdown su pronomi, accessori, modelli concorrenti, cambio di variante, paragrafi e fonti.

La fase successiva di weak supervision/learning da segnali imperfetti deve partire **solo** dopo avere congelato il campione di valutazione e verificato il beneficio reale. La promozione nel database resta una fase separata e approvata scientificamente.

## 8. Comandi di riproduzione

```bash
npm run build
npm run test:phase135
npm run demo:phase135
node scripts/phase135_regress.mjs
python -m unittest discover -s primary_sources -t . -p 'test_*.py'
python -m unittest discover -s ingestion -p 'test_*.py'
python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

Build richiede le **devDependencies già dichiarate** (`typescript`, `@types/node`), senza nuove librerie. `node_modules` non fa parte della distribuzione e deve essere preparato normalmente nell'ambiente di sviluppo. Il pacchetto comprende già i moduli `dist/` per i test nel runtime Node compatibile.
