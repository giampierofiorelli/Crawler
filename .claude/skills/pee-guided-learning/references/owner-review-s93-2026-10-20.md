# Owner review of S93 and consolidated instruction for S94 (2026-10-20), verbatim

Received after S93 (Crawler 7a29534). Preserved unchanged. It contains:
- the review of S93;
- a conceptual correction: lexical overlap must not create a scientific hierarchy;
- one consolidated English instruction for three sequential, separately measured workstreams:
  1. joint table and document inference;
  2. hybrid vector–symbolic entity understanding;
  3. controlled Qwen re-evaluation.

It stays in R3 and does not authorise ranking or migration.

---

S93 è un progresso positivo sul piano tecnico, ma i risultati scientifici sono ancora insufficienti. Ho verificato il rapporto e il codice pubblicati nel commit 7a29534.

La cosa più interessante è che Claude sta individuando problemi sempre più precisi: non manca soltanto la capacità di leggere una tabella, ma quella di ricostruire le relazioni scientifiche tra i suoi valori, le operazioni matematiche e le condizioni di prova.

Bilancio di S93

Capacità	Risultato	Valutazione
Collegamento alla frase originale	Dal 4% al 21%	Miglioramento concreto
Riconoscimento dei calcoli	18/180, precisione 60%	Ancora debole
Identificazione delle ipotesi di calcolo	0/129	Non funziona
Distinzione fra proprietà simili	57 → 78 corrette in sviluppo	Promettente
Apprendimento di nuove definizioni	Nessun beneficio su pagine nuove	Non dimostrato
FlyingSquid	Stime di affidabilità errate	Limite identificato

C’è però una precisazione: sulle 407 osservazioni nuove, il numero complessivo di classificazioni corrette della natura del risultato passa da 87 a 91. Il recupero dei calcoli avviene quindi perdendo anche altre classificazioni corrette.

Questo non è ancora un miglioramento sufficientemente robusto.

Ho individuato un errore concettuale importante

Nel codice definition_learning.ts, Claude può proporre automaticamente una relazione narrower_than quando due concetti condividono una parola principale.

Per esempio:

* charging time viene interpretato come concetto più specifico di run_duration;
* robot height viene collegato gerarchicamente a obstacle_height.

Queste relazioni non sono scientificamente giustificate dalla semplice somiglianza lessicale.

Il tempo di ricarica non è necessariamente un sottotipo della durata di funzionamento. Analogamente, l’altezza di un robot e l’altezza di un ostacolo misurano oggetti differenti.

Questo è proprio il problema che volevamo evitare attraverso I-ADOPT, LogMap e la rappresentazione scientifica delle entità.

Fortunatamente, le nuove definizioni restano candidate e non sono autorizzate per il ranking. Tuttavia, non permetterei al sistema di promuovere queste relazioni come conoscenza verificata senza ulteriori controlli semantici.

Cosa ci dice S93 sulle nostre tre direzioni?

1. Matrici, tabelle e inferenza congiunta — priorità confermata

La maggior parte dei calcoli mancati nei laptop riguarda differenze percentuali tra celle. Servono collegamenti fra operazione, valori di ingresso, riga di riferimento e risultato. È esattamente il problema per cui avevamo individuato TableMiner+ e Limaye.

2. Vettori e conoscenza simbolica — priorità confermata

L’apprendimento genera concetti, ma non ne verifica abbastanza bene il significato scientifico. Qui possono essere utili rappresentazioni ibride e controlli di coerenza delle relazioni.

3. Qwen — ancora da verificare

S93 non ha utilizzato Qwen. Il confronto con le nuove rappresentazioni scientifiche rimane un esperimento distinto e potenzialmente interessante, ma non dobbiamo dargli priorità rispetto ai problemi documentali già dimostrati.

R3 oppure R4?

Rimarrei in R3, ma eviterei di continuare con esperimenti isolati senza una verifica integrata.

Il prompt consolidato che avevamo concordato resta valido nella sua struttura: prima inferenza congiunta, poi rappresentazioni vettoriali e simboliche, infine Qwen come verifica aggiuntiva.

S93 rafforza soprattutto le prime due priorità. Prima dell’invio aggiornerei il prompt in un unico testo, includendo il controllo delle false gerarchie scientifiche e delle dipendenze fra celle nei calcoli.

Non manderei invece un allegato separato o istruzioni sovrapposte.

Il mio giudizio finale: il miglioramento dell’architettura di PEE rispetto alle fasi precedenti è considerevole. Adesso il motore possiede rappresentazioni e strumenti che prima non aveva; il problema è integrarli in un procedimento scientificamente coerente.

Ma non confondiamo la ricchezza dell’architettura con la capacità operativa dimostrata. S93 non chiude R3. Ci offre, però, una motivazione molto concreta per il confronto tra gli algoritmi che avevamo già progettato.

Io farei tutte e tre le cose, ma non contemporaneamente. Dare a Claude un unico prompt consolidato, con tre esperimenti consecutivi e risultati separati, è la scelta migliore.

Così evitiamo di interromperlo continuamente, non sprechiamo crediti e soprattutto riusciamo a capire quale tecnologia migliora effettivamente PEE.

L’ordine che consiglio

1

Matrici, tabelle e relazioni documentali

Prima priorità

Perfezionare l’inferenza congiunta già presente in 1G, ispirandosi a TableMiner+, Limaye, Sato e TUTA. La priorità è collegare correttamente valore, intestazione, prodotto, condizioni e frase che documenta il metodo.

Questo affronta il problema più evidente di S92: individuare la prova esatta, non soltanto il suo tipo.

2

Vettori + conoscenza scientifica strutturata

Seconda priorità

Riprovare i meccanismi PPMI, Semantic-Type Gating e Knowledge Graph Induction, utilizzando le informazioni scientifiche oggi disponibili.

Studiare OWL2Vec, LogMap e ChemDataExtractor 2.0* come riferimenti, senza imporre nuove dipendenze. Obiettivo: trovare concetti nuovi, distinguere quelli simili e trasferire la conoscenza.

3

Seconda possibilità a Qwen

Terza priorità

Riprovare Qwen2.5-1.5B-Instruct, confrontando i vecchi input di S76 con quelli prodotti dall’architettura migliorata.

L’obiettivo è determinare se il modello oggi aggiunge qualcosa che i metodi non generativi non riescono a ottenere, tenendo conto dei costi di esecuzione.

Perché questo ordine è importante

Immagina che con il primo intervento PEE migliori già moltissimo. Se attivassimo contemporaneamente vettori e Qwen, non sapremmo quale componente abbia prodotto il beneficio.

Invece possiamo misurare progressivamente:

Confronto	Domanda
S92 vs fase 1	Migliora grazie alla comprensione delle tabelle?
Fase 1 vs fase 1+2	I vettori e la conoscenza strutturata aggiungono valore?
Fase 1+2 vs fase 1+2+Qwen	Qwen aggiunge un beneficio ulteriore e giustifica il costo?

Ogni passaggio dovrebbe preservare i risultati positivi dei precedenti, senza riattivare automaticamente meccanismi che peggiorano le prestazioni.

Un unico messaggio per Claude

Allegati necessari: nessuno. Claude dispone già del repository, dei rapporti S76–S92 e dei riferimenti scientifici. Non occorre ricostruire materiali.

Ti preparo il messaggio consolidato, così non dobbiamo aggiungere istruzioni fondamentali mentre lavora.

PEE — R3: Consolidated Scientific Algorithm Evaluation

Continue from the existing repository state after S92. Preserve all previous architectural decisions, safety policies, experimental records and scientific knowledge. Do not restart R3 or create a parallel engine.

Objective: Determine whether three complementary approaches can improve PEE’s general ability to understand documents, identify scientific entities, connect evidence to its source, acquire knowledge and reuse that knowledge on unfamiliar product categories.

Execute the following workstreams sequentially, with independently measured contributions. This is one consolidated instruction, not a request to run three uncontrolled implementations in parallel.

1. Joint table and document inference

Review the existing 1F/1G, DocumentModel1G, ContextLink1G, methodLinks and definition-interpreter implementations.

Use Limaye, TableMiner+, Sato and TUTA as scientific references. Reuse the existing whole-table hypotheses, matrix/grid representation, collective typing and document context before introducing new algorithms.

Focus on identifying the actual supporting statement for each observation, including cross-section methodology links, exact product and variant, conditions, original measurements, manufacturer declarations and derived calculations.

Maintain separate fields for evidence provenance and result derivation. A calculation from independently measured inputs remains derived, not a direct measurement.

Compare improvements against frozen S92 baselines.

2. Hybrid vector–symbolic entity understanding

Re-evaluate the existing R3 algorithms: PPMI/cosine similarity, Semantic-Type Gating, and Document Concepts/Knowledge Graph Induction.

Use OWL2Vec*, LogMap and ChemDataExtractor 2.0 as architectural and algorithmic references, evaluating their suitability rather than automatically installing or reimplementing them.

Compare existing lexical retrieval against vector-based candidate retrieval enriched by verified scientific properties, objects, quantities, conditions and graph relationships.

Enforce the distinction between identity, hierarchical relationships, relatedness and incompatibility. Vector similarity alone must never establish scientific identity.

Test whether newly acquired concepts become verified, reusable definitions that improve interpretation on subsequent unseen documents.

3. Controlled Qwen re-evaluation

Only after establishing the first two baselines, reproduce the S76 Qwen comparison in a bounded, local, shadow-only experiment.

Start with Qwen2.5-1.5B-Instruct, using the corrected S77 label readout. Compare the original S76-style inputs against new structured scientific definitions and document evidence, using the same frozen evaluation examples.

Consider the 0.5B model only if it provides useful cost/performance information. Use no paid APIs, no fine-tuning and no production model dependency. Measure CPU, RAM, latency and incremental benefit.

A negative result is acceptable; do not continue tuning an ineffective model indefinitely.

Scientific validation and stopping conditions

Before evaluating each experimental variant, establish comparable baselines and freeze the relevant algorithms and independent evaluation material. Use legally accessible original sources, including genuinely measurement-rich documents and at least one previously untaught category. Do not reuse examined pages as fresh evidence.

Measure property attribution, exact entity and variant identity, evidence role, correct supporting-source links, original-versus-derived results, qualitative evidence where supported, false positives, recall, abstentions, cross-category transfer, learning reuse, execution costs and effects on the existing advisory path.

Distinguish development, first-run independent checks and subsequent tuning. Include ablations to establish the contribution of each approach and report negative results unchanged.

Preserve existing signed-catalog, rights, publication and ranking protections. No new production ranking authorisation or automatic migration.

Work autonomously through the three stages without unnecessary requests for approval or artificial repeated checkpoints. If an approach cannot justify its complexity, record the evidence and stop that approach. Do not delay the subsequent stage solely to perfect an unsuccessful experiment.

Final deliverable: One concise evidence-backed report explaining what each approach improved, worsened or failed to demonstrate, what should remain integrated, and whether R3’s original scientific-generalisation and operational-validation criteria are now satisfied or still require targeted work before R4.

Do not declare R3 completed merely because implementations or tests pass.

La mia raccomandazione finale: un solo prompt, tre fasi in sequenza, libertà tecnica per Claude e verifiche che permettano di separare gli effetti.

E soprattutto, non gli chiederei di chiudere R3 a tutti i costi. Gli chiederei di fornire finalmente le prove necessarie per decidere se R3 può essere chiuso e R4 può iniziare.

Questa volta il lavoro è orientato a verificare un miglioramento generale del sistema, non soltanto a correggere un altro gruppo di errori.
