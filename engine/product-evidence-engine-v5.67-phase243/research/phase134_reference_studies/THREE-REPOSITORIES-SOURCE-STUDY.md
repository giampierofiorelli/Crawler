# Product Evidence Engine — audit tecnico del codice ricevuto

**Data:** 11 ottobre 2026  
**Oggetto:** DeepKE, Snorkel, medSpaCy; raccordo con GLiNER2 e PEE v4.57/fase 133.  
**Decisione:** **STUDY FIRST / NO INSTALL / NO VENDOR CODE INTEGRATION.** Non sono state aggiunte dipendenze, non è stato importato codice dei repository e non è stata modificata la v4.57. Questo documento è una valutazione statica del codice realmente caricato dall'utente, non un benchmark di inferenza e non una certificazione legale completa delle dipendenze.

## 1. Provenienza, integrità e licenze

Gli ZIP allegati sono stati letti direttamente e sottoposti a controllo CRC (`ZipFile.testzip`): nessun elemento corrotto rilevato. SHA-256 dei file e inventario nella sezione finale. La licenza del repository **non equivale** alla licenza di ogni peso pretrained, dataset, artefatto o codice terzo incorporato. Uso commerciale e modifica sono ammessi in generale da MIT e Apache-2.0, con conservazione degli avvisi richiesti; nessuna autorizzazione individuale o royalty imposta dalla licenza base. La presenza di licenze permissive **non è un via libera automatico** a ridistribuire qualsiasi file incluso, né elimina costi di calcolo/hosting.

| Archivio | Licenza top-level verificata dal file LICENSE | Volume ZIP | Implicazioni per PEE |
|---|---|---:|---|
| `medspacy-master.zip` | MIT, copyright medspacy 2020 | ~616 KB | Algoritmi contestuali interessanti; framework e vocabolario clinico non direttamente adatti ai prodotti |
| `snorkel-main.zip` | Apache-2.0 | ~1,5 MB | Progettazione di supervisione debole e misura di conflitti; dipendenze Python/ML evitabili |
| `DeepKE-main.zip` | MIT, copyright ZJUNLP 2021 | ~34 MB | Document-level IE e triplette; stack pesante, esempi/derivazioni di terzi da controllare separatamente |

### Perché non installare i pacchetti

- `medspacy-master/requirements/requirements.txt`: spaCy, PyRuSH, pysbd, medspacy_quickumls, jsonschema, loguru. QuickUMLS e le risorse mediche sono irrilevanti per PEE; richiederebbero analisi separate.
- `snorkel-main/requirements.txt`: numpy, scipy, pandas, scikit-learn, torch, networkx, tensorboard, ecc. Sarebbe un secondo stack di machine learning senza dimostrato ritorno sul nostro compito.
- `DeepKE-main/requirements.txt`: torch<=1.11, Transformers 4.26.0, Hydra 1.0.6, wandb 0.12.7, openai 0.28.0, altre versioni datate. **Non** assumere che sia deployabile o mantenibile oggi senza risolvere versioni, sicurezza, modelli, vincoli commerciali e compatibilità.
- In `DeepKE-main/example/triple/PURE/models/data_structures.py` il file dichiara esplicitamente derivazione dal codebase DyGIE++; gli esempi e i sottoprogetti richiederebbero un audit copyright e licenze per-file prima di qualunque copia. Il nostro piano non richiede di copiarli.

## 2. medSpaCy — la tecnica più immediatamente utile

**File effettivamente analizzati:**

- `medspacy/context/context_rule.py`: regola con tipo, direzione `FORWARD/BACKWARD/BIDIRECTIONAL`, `TERMINATE`, `PSEUDO`, `max_scope`, `max_targets`, `allowed_types`, `excluded_types`.
- `medspacy/context/context_modifier.py`: calcolo dello *scope* dei modificatori e sua limitazione da altri modificatori.
- `medspacy/context/context_graph.py`: grafo esplicito di legami modificatore→target.
- `medspacy/context/context.py`: categorie come negazione, possibilità, storico e ipotetico.
- `medspacy/section_detection/sectionizer.py`: struttura gerarchica e contesto per sezioni del documento.
- `medspacy/target_matcher/target_matcher.py`: rilevamento di target con vocabolari tipizzati.
- `resources/it/context_rules.json`: **contiene `{"context_rules": []}`**. Non è prova di supporto effettivo alle negazioni italiane; il motore andrebbe sviluppato e testato multilingue per il nostro dominio.

**Lezione da riimplementare internamente:** dopo aver individuato una possibile relazione, non basta cercare la parola “not/no”. Serve individuare il modificatore, la sua portata grammaticale, la parola/struttura che interrompe la portata e il target a cui si applica. Deve distinguere negazione dell'esistenza, negazione dell'efficacia, assenza di prove, condizioni, ipotesi, opinione del reviewer e affermazione del produttore. La provenienza di ogni modifica resta collegata a offset e documento originali.

**Confronto PEE:** `src/phase132_contextual_relation_guard.ts` usa regex e separatori limitati per bloccare affermazioni pericolose: ottima precauzione, ma non un grafo di dipendenza contestuale. Fare una riscrittura **originale e minimale in TypeScript**, senza importare spaCy, è il candidato #1.

**Rischi da testare:** “not only”, “not necessarily”, negazione citata ma non assertiva, due negazioni, “no evidence of X but evidence of Y”, negazione con obiettivo distante, correzioni tra frasi, inglese/italiano, ambito del comparativo, tabelle di test.

**Fonte:** https://github.com/medspacy/medspacy ; file specifico: https://github.com/medspacy/medspacy/blob/master/medspacy/context/context_rule.py

## 3. DeepKE — rappresentazione documentale e relazioni

**File effettivamente analizzati:**

- `src/deepke/relation_extraction/document/prepro.py`: lettura della struttura DocRED; token, menzioni di entità, label e identificatori di frasi di evidenza. Include gestione per input lunghi con chunk sovrapposti.
- `src/deepke/relation_extraction/document/model.py`, `module.py`: complesso modello neurale per relazioni a livello documento: **non** ha senso copiarne l'implementazione nel motore Node attuale.
- `src/deepke/name_entity_re/cross/extraction/record_schema.py`: schema tipizzato con liste di categorie, ruoli e vincoli ruolo→tipo.
- `example/triple/PURE/models/data_structures.py` e `relationUtils.py`: span ed entità separati dalle relazioni, ID di documenti/frasi, selezione di coppie candidato e finestra di contesto limitata.

**Lezione da riimplementare internamente:** non registrare soltanto `(metrica, measures, risultato)`. Costruire una *asserzione documentale* che conservi le menzioni, i loro riferimenti, le prove distribuite su una o più frasi, le condizioni di misura e l'eventuale contraddizione. Generare coppie di candidati soltanto quando sono consentite dallo schema di categoria, per contenere il costo combinatorio. Vincolare la relazione a intervalli di evidenza: il fatto che due parole siano vicine non significa che il documento dimostri un nesso.

**Confronto PEE:** `src/phase131_local_relation_learning.ts` attualmente riceve già gli span delle due entità e li considera all'interno di un input; `src/phase129_category_growth_cycle.ts` gestisce le prove ancorate a documenti ma per la promozione di concetti, non risolve tutte le relazioni tra menzioni. Il prossimo collegamento deve gestire grafi di candidati e prove multi-frase, senza introdurre il gigantesco stack DeepKE.

**Rischi da testare:** salto fra paragrafi, coreferenza (“this figure”, “it”), confondere dati del prodotto A con B, unità e protocolli differenti, grafici/tabelle, commenti dell'autore su dati altrui, perdita di offset durante chunking e traduzione.

**Fonte:** https://github.com/zjunlp/DeepKE ; articolo tecnico indicato nel README: https://arxiv.org/abs/2201.03335 ; benchmark: https://aclanthology.org/P19-1074/

## 4. Snorkel — supervisionare i nostri apprendimenti, NON dichiarare automaticamente fatti veri

**File effettivamente analizzati:**

- `snorkel/labeling/lf/core.py`: contratti delle labeling functions; un segnale può proporre un'etichetta o astenersi.
- `snorkel/labeling/analysis.py`: `label_coverage`, `label_overlap`, `label_conflict`, statistiche per ciascun segnale e facoltativamente accuratezza rispetto a etichette vere.
- `snorkel/labeling/model/label_model.py`: modello generativo che combina labeling functions e stima affidabilità in modo probabilistico.
- `snorkel/labeling/model/graph_utils.py`: funzioni di struttura delle dipendenze.
- `snorkel/slicing/monitor.py`: valutazioni su gruppi specifici, non soltanto un'accuratezza media.

**Importante:** `label_model.py` dichiara esplicitamente (nel codice incluso nello ZIP) che l'implementazione corrente **assume indipendenza condizionale** delle labeling functions data l'etichetta vera. Due regole che ripetono lo stesso pattern non diventano due prove indipendenti; la loro correlazione può generare fiducia ingiustificata. Le label deboli sono materiale di addestramento, non fatti scientifici da promuovere nel database.

**Lezione da riimplementare internamente:** inventariare separatamente le funzioni che individuano possibili relazioni, negazioni, condizioni, unità e confutazioni, annotando la loro famiglia/origine. Salvare una matrice dei segnali, tasso di astensione, conflitti, copertura e prestazioni *per fetta* (negazione, cross-sentence, nuovo dominio, lingue, fonti). Solo in presenza di un campione gold indipendente valutare una combinazione statistica; non iniziare dal porting del LabelModel.

**Confronto PEE:** oggi `phase131` addestra Naive Bayes su pochi esempi e `phase132` scherma alcune relazioni, ma manca un programma verificabile per ampliare i dati di addestramento e misurare se i segnali siano duplicati. Qui Snorkel offre l'architettura di qualità dei dati, senza richiederci di usare PyTorch.

**Fonte:** https://github.com/snorkel-team/snorkel ; https://snorkelproject.org/get-started/ ; https://link.springer.com/article/10.1007/s00778-019-00552-1

## 5. Sintesi: architettura interna da costruire

**Un solo grafo della conoscenza e dei suoi indizi**, composto da entità, menzioni, relazioni candidate, modificatori contestuali, prove documentali e varianti di categoria. Non confondere il livello dell'asserzione di una fonte con quello del fatto indipendentemente verificato.

1. **Discovery e parsing** già in PEE (fasi 74, 122–130): recupero permesso e tracciabile; niente parsing inventato.
2. **Candidate mentions**: entità e metriche con offset documentale. Se gli span non sono individuati, segnalare `entity_not_found`, non simulare una relazione.
3. **Context Scope Graph** [ispirazione medSpaCy]: modificatori con direzione, portata e interruzioni; assegnarli ai target con prove; qualificare negazione/incertezza/condizioni.
4. **Document Evidence Graph** [ispirazione DeepKE]: collegare menzioni in più frasi solo attraverso referenti verificabili; associare fonte, documento, protocollo, data/versione, pagina e citazione esatta.
5. **Signal/Label Audit** [ispirazione Snorkel]: segnali con astensione, indipendenza discutibile, conflitti e versioni; eventualmente addestrare modelli specialistici su esempi revisionati.
6. **Constrained resolver** [ispirazione allo studio GLiNER2]: rimuovere candidati incompatibili con le condizioni e con lo schema, ma **non** forzare una singola interpretazione se più letture restano plausibili.
7. **Scientific review e approval** [PEE fasi 128–129]: promozione esplicita e versionata soltanto dopo controlli; zero ranking dagli output grezzi del modello.
8. **Dialogue feedback** [PEE fasi 125–127]: la comprensione delle domande usa esclusivamente concetti revisionati; ambiguità materialmente rilevanti → chiarimento mirato.

### Un caso che deve passare

> “The manufacturer claims stronger steam cleaning. The reviewer found no evidence that the steam function removed more staining on the tested flooring, although performance improved after a second pass.”

*Esiti da non confondere:* esistenza della funzione secondo il produttore; assenza di prova osservata per maggiore rimozione su una certa superficie; miglioramento dopo seconda passata **non automaticamente causato dal vapore**; attribuzione di ciascuna affermazione alla sua fonte; prestazione non generalizzabile a superfici non testate. Se non sappiamo ricostruire la dipendenza, il sistema deve astenersi.

### Schema di output suggerito

```json
{
  "sourceDocumentId": "...",
  "sourceVersion": "...",
  "entityMentions": [{"entityId": "...", "start": 0, "end": 0}],
  "claim": {
    "subjectId": "...", "relationCandidate": "...", "objectId": "...",
    "claimant": "reviewer|manufacturer|unknown",
    "polarity": "affirmed|negated|unknown",
    "epistemicStatus": "observed|claimed|hypothetical|inconclusive",
    "conditions": [], "measurementProtocolId": null,
    "evidenceSpans": [{"start": 0, "end": 0, "sha256": "..."}],
    "candidateModelVersion": "...",
    "reviewStatus": "quarantined",
    "rankingAuthorized": false
  }
}
```

I campi numerici zero qui sono segnaposto dello **schema**, non offset di una fonte realmente verificata.

## 6. Sequenza ingegneristica e criteri di successo

**Fase seguente consigliata: sviluppo nativo di un *Context Scope Graph* in TypeScript, senza dipendenze runtime esterne.** Collegarlo al filtro PEE phase132 e agli span phase131 con test di regressione multilingue. Conservare la regola originale in quarantena fino al test su testi mai usati nello sviluppo. Partire da frasi autentiche autorizzate e campioni di documenti professionali non inclusi in precedenti test; annotazione indipendente laddove possibile.

**Prove da distinguere:**

- Unit test: funzione corretta sugli esempi preparati; non prova comprensione generale.
- Holdout per documento e fonte: precision, recall, F1 e soprattutto false-accept rate per relazioni positive negate; tassi di astensione; falsi rigetti; latenza/memoria.
- Test metamorfici: negazione, posizione del modificatore, contrasto con “but/ma”, inversione ordine, parafrasi autentiche, lingua IT/EN, spezzatura tra frasi.
- Decisione di integrazione: solo se il nuovo gate non deteriora indebitamente la copertura e riduce i falsi positivi su nuovi documenti.
- In una fase successiva, misurare il beneficio del grafo multi-frase e il programma di weak supervision **separatamente**, non aggiungere tre tecniche insieme impedendo attribuzione degli effetti.

**Non dimostrato dall'audit:** una soluzione totale alla comprensione scientifica, accuratezza linguistica del codice esaminato nel dominio prodotti, indipendenza delle fonti, licenze di tutti i subcomponenti e modelli, superiorità misurata delle tecniche, deploy senza problemi su server reale.

## 7. Link originali da conservare

- medSpaCy: https://github.com/medspacy/medspacy
- medSpaCy ConTextRule: https://github.com/medspacy/medspacy/blob/master/medspacy/context/context_rule.py
- Snorkel: https://github.com/snorkel-team/snorkel
- Snorkel documentation: https://snorkelproject.org/get-started/
- Snorkel paper: https://doi.org/10.14778/3157794.3157797
- DeepKE: https://github.com/zjunlp/DeepKE
- DeepKE paper: https://arxiv.org/abs/2201.03335
- DocRED: https://aclanthology.org/P19-1074/
- GLiNER2: https://github.com/fastino-ai/GLiNER2
- MIT text: https://opensource.org/license/mit
- Apache 2.0 text: https://www.apache.org/licenses/LICENSE-2.0

## 8. Integrità dei materiali esaminati

| ZIP | File in archivio | Byte compressi | SHA-256 ZIP | CRC |
|---|---:|---:|---|---|
| `DeepKE-main.zip` | 1018 | 35,375,394 | `4ac9b84952b5e457405c114d0d8d5da50ea8bc4a5589f84ffa663c0df25af51a` | PASS |
| `snorkel-main.zip` | 243 | 1,518,044 | `decc813bcc86745424e3fb36632bd52603d54b4b85f7ebba60f5526caedc210e` | PASS |
| `medspacy-master.zip` | 479 | 630,522 | `278797185c70e2274664d8186a5ed36670c6fc13e8477dbf353f85b9a91074a3` | PASS |
