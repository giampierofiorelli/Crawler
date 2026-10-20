# Owner review of S89 (2026-10-20), verbatim

Received after S89 (Crawler 6d35176). Preserved unchanged. It keeps the direction and sets the next priorities; it does
not authorise a migration or operational activation.

---

S89 è un progresso positivo, soprattutto sulla precisione, ma non ancora sull’apprendimento. La direzione scientifica che abbiamo scelto rimane valida; i nuovi risultati ci mostrano con maggiore precisione dove intervenire.

Ho verificato il rapporto e l’interprete nel repository. Il miglioramento principale è reale: le false attribuzioni scendono da 146 a 8 su un campione di 341 valori provenienti da editori non utilizzati nello sviluppo.

1. Il progresso e il suo costo

Indicatore	S88	S89
Valori correttamente attribuiti	88/113	48/113
False attribuzioni	146	8
Precisione delle attribuzioni	36%	80%
Richiamo dei valori corretti	78%	42%

S89 è molto più prudente: non assegna significati scientifici a valori che non riesce a interpretare con sufficiente evidenza.

È preferibile a costruire un database pieno di attribuzioni sbagliate. Ma non possiamo limitarci ad aumentare la precisione sacrificando sistematicamente il richiamo.

Adesso dobbiamo recuperare informazioni corrette senza reintrodurre falsi collegamenti. È questa la sfida successiva.

2. Il punto critico: l’apprendimento non è ancora dimostrato

Nel codice src/definition_learning.ts esiste un meccanismo per proporre nuovi termini e integrarli nelle definizioni scientifiche.

Ma sui dati reali di S89 ha prodotto:

0

Nuovi termini appresi e utilizzabili

4

Nuovi concetti soltanto proposti

Il test sintetico dimostra che un termine appreso può propagarsi ai componenti che utilizzano le definizioni. Non dimostra ancora che PEE riesca ad apprenderlo autonomamente da documenti reali.

Inoltre, non trasformerei la regola dei due editori indipendenti in un requisito universale: è un buon segnale di corroborazione, ma una fonte specialistica autorevole può fornire conoscenza utile anche prima di una seconda conferma. Deve rimanere possibile acquisirla con uno stato di incertezza appropriato.

3. Dove concentrerei il lavoro adesso

La causa principale della perdita di informazioni è diventata più chiara.

Conoscenza scientifica

Le definizioni vengono già condivise dai componenti sperimentali. Questa direzione va mantenuta.

Struttura del documento

PEE perde etichette presenti nei riquadri delle specifiche e nelle tabelle. È una causa concreta del basso richiamo.

Origine della prova

Il nuovo classificatore riconosce correttamente soltanto 47 ruoli su 113, contro 55 del riferimento banale. Questo è un problema prioritario.

Generalizzazione dell’apprendimento

Bisogna ancora dimostrare che nuove espressioni scientifiche vengano acquisite, verificate e riutilizzate in altri documenti.

Il prossimo esperimento dovrebbe collegare direttamente la struttura documentale alle definizioni: un valore deve ereditare la propria etichetta, ma anche l’informazione che indica se proviene da un test, da una scheda tecnica o da una citazione.

Qui riutilizzerei l’interprete di tabelle già esistente, anziché creare un nuovo riconoscitore specifico per ogni editore.

4. Il giudizio complessivo

Sono favorevole a proseguire nella direzione attuale. S89 ha dimostrato che possiamo ridurre drasticamente le attribuzioni sbagliate attraverso principi più generali, e ha individuato una causa concreta della perdita di informazioni corrette.

Ma non confondiamo questa scoperta con un apprendimento autonomo già funzionante: il ciclo di acquisizione e miglioramento della conoscenza resta incompleto.

La mia priorità sarebbe recuperare il contesto strutturale dei documenti e distinguere correttamente le prove originali dalle dichiarazioni, poi verificare se queste informazioni permettono alle definizioni di apprendere e interpretare più risultati senza perdere precisione.

Non aprirei un nuovo filone di sviluppo e non chiederei un’altra migrazione. Il lavoro più promettente è perfezionare e integrare ciò che esiste, misurandolo nuovamente su materiale indipendente.

Il bilancio di S89 è positivo sulla precisione, negativo sul richiamo e ancora nullo sull’apprendimento reale. Ora conosciamo molto meglio le cause, e questo rende il prossimo intervento più mirato.
