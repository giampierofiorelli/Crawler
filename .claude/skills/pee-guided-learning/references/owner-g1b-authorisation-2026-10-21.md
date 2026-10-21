# Owner authorisation of G1b and the bidirectional-knowledge requirement (2026-10-21), verbatim

Received after Crawler commit 6c7de15 (G1 report). Authorises G1b "Situation-Linked Scientific Knowledge" with the owner's
architectural and scientific precisions, and states a **permanent architectural requirement: bidirectional scientific
knowledge, by need and by category, connected** (recorded in SKILL.md §2b and decision row G1b-start). No ranking,
evidence-authority, operational-store or network-read change; shadow until validated; no new categories or services.

## The owner's message (Italian, unchanged)

Ho letto direttamente il .

G1 ha prodotto un progresso reale, ma non quello principale che cercavamo. Ha corretto difetti del percorso operativo e ha individuato perché il primo tentativo di ragionamento goal-first non era sufficiente.

Risultato	Prima	Dopo G1
Limiti dichiarati dall’utente che vengono persi	21/32	12/32
Richieste fuori conoscenza con una lacuna di ricerca identificata e tipizzata	0/22	13/22
Problemi senza categoria esplicita che portano alla famiglia pertinente	3/13	3/13
Modifiche dannose a shortlist, esclusioni e ranking nei test	—	0

I 5.065 test risultano superati secondo Claude. Il rapporto e i risultati pubblicati li ho esaminati; non ho eseguito indipendentemente la suite.

La conclusione più importante è questa: spostare una conoscenza fuori dalla categoria non basta, se PEE non sa in quali situazioni applicarla.

Per esempio, sapere che la ventilazione può essere un’alternativa all’acquisto di un deumidificatore non significa saper decidere quando ventilare sia appropriato, insufficiente o controproducente.

Per questo considero G1b una proposta sensata. Però ci sono alcune condizioni importanti prima di autorizzarla.

Cosa correggerei nella proposta G1b

Ci sono quattro aspetti da non trascurare.

Primo: E2 non ha dimostrato che la conoscenza indipendente dalla categoria sia un’idea sbagliata. Ha dimostrato che spostare le nove strategie esistenti, senza collegarle alle situazioni in cui sono appropriate, non funziona. È molto diverso.

Secondo: E4 non ha realmente testato una comprensione semantica completa. Claude ha sostituito la corrispondenza tra parole con quella basata sui nomi dei concetti. Ma quei nomi sono ancora espressioni linguistiche. Il risultato negativo non dimostra che un sistema fondato su relazioni scientifiche tipizzate non possa funzionare.

Terzo: le conoscenze generiche non devono sparire dalle categorie. Un bisogno come low noise può essere generale, ma la sua valutazione scientifica resta dipendente dal contesto: rumore durante il sonno, rumore di funzionamento di una lavatrice, rumore di un aspirapolvere. Serve una rappresentazione condivisa del bisogno con applicazioni e misurazioni specifiche, non una semplice deduplicazione di parole.

Quarto: i 75 casi sigillati non sono più completamente inesplorati. Claude non ha usato i singoli casi per sviluppare GF, ma ha già visto risultati aggregati degli altri percorsi. Possiamo ancora utilizzarli per la prima verifica GF dichiarandone il limite; per una conclusione più forte occorreranno anche nuovi casi mai osservati.

La mia raccomandazione

Procederei con G1b, ma non autorizzerei semplicemente l’implementazione letterale dei quattro punti proposti. Darei a Claude il compito di dimostrare che la nuova conoscenza collega realmente situazioni, bisogni e strategie, mantenendo libertà sui metodi.

Gli chiederei inoltre di chiudere o isolare i due problemi rimasti da G1: informazioni esplicite ancora perse e domande prive della causa che le giustifica.

Testo consolidato per Claude

Allegati necessari: nessuno. Il rapporto G1 e tutti i riferimenti sono già disponibili nei repository.

PEE — Authorisation G1b: Situation-Linked Scientific Knowledge

Autorizzo G1b, sulla base del rapporto G1 pubblicato al commit 6c7de15, con le seguenti precisazioni architetturali e scientifiche.

Utilizza attivamente pee-guided-learning e le skill pertinenti. Mantieni autonomia nella scelta dei metodi e negli esperimenti, senza interpretare la proposta G1b come un’implementazione prescritta.

Obiettivo: dimostrare che PEE può comprendere bisogni e situazioni indipendentemente dalla categoria e raggiungere strategie appropriate, comprese soluzioni senza acquisto, attraverso collegamenti scientifici verificabili.

1. Non considerare E2 una confutazione della conoscenza trasversale, né E4 una confutazione del ragionamento semantico: i due esperimenti hanno verificato meccanismi più limitati.
2. Studia e riutilizza la conoscenza scientifica esistente per rappresentare collegamenti situazione → bisogno/obiettivo → strategie → meccanismi → categorie, con condizioni, provenienza, controindicazioni e stato epistemico. Non inventare relazioni causali dove le fonti attestano soltanto pertinenza o associazione.
3. Distingui bisogni generali e realizzazioni specifiche delle categorie. Un bisogno condiviso non deve diventare automaticamente prova della pertinenza di un prodotto, ma non deve perdere le proprie condizioni e misure specifiche.
4. Non sostituire semplicemente la corrispondenza fra singole parole con quella fra frasi intere. Confronta metodi capaci di distinguere i ruoli e il significato delle informazioni, verificando gli errori di attribuzione e le ipotesi inventate.
5. Affronta i difetti residui G1: informazioni esplicite ancora perse e domande senza causa identificabile. Distingui chiarimenti dell’utente, lacune scientifiche, errori algoritmici e problemi di integrazione.
6. Preregistra i confronti prima degli esperimenti. Usa il materiale G1 ancora non utilizzato per GF dichiarandone i limiti; riserva materiale veramente nuovo per la verifica successiva di generalizzazione. Non addestrare o correggere sul primo risultato indipendente.
7. Mantieni il percorso goal-first in ombra fino alla validazione. Non modificare ranking, autorità delle evidenze, store operativo o autorizzazioni alle letture di rete. Usa copie e rappresentazioni ricostruibili.

Procedi autonomamente, fermando soltanto le parti i cui presupposti vengano smentiti. Conserva i risultati positivi già dimostrati.

Criterio fondamentale di successo: non basta raggiungere più categorie o produrre più ipotesi. PEE deve migliorare misurabilmente la comprensione dei bisogni, la selezione di strategie pertinenti e la capacità di riconoscere ciò che non sa, riducendo collegamenti inventati e senza nascondere difetti algoritmici.

La futura ricerca autonoma, la lettura scientifica R4, l’attribuzione, la valutazione e l’apprendimento di nuove categorie restano obiettivi integrati della roadmap. Non introdurre ora nuove categorie o nuovi servizi.

Consegna un rapporto che distingua implementazione, risultati di sviluppo, prime verifiche indipendenti, trasferibilità e limiti. Non promuovere capacità che non abbiano superato i criteri preregistrati.

Questa volta eviterei di imporre a Claude di usare necessariamente una particolare struttura di nodi o un particolare algoritmo.

La cosa che voglio vedere dimostrata è più ambiziosa: davanti a un problema nuovo, PEE deve utilizzare la conoscenza scientifica per capire quali strategie siano pertinenti, non cercare semplicemente quale prodotto condivide più parole con la richiesta.

Questa è la capacità che può trasformare PEE da un sistema di classificazione dei prodotti in un consulente scientifico realmente orientato ai bisogni.

Sì, ti spieghi benissimo. E non soltanto ha senso: credo che questa debba diventare una delle caratteristiche fondamentali dell’architettura scientifica di PEE.

La conoscenza deve essere organizzata sia per categoria di prodotto sia per bisogno dell’utente, e soprattutto le due prospettive devono essere collegate.

Non dobbiamo sostituire la conoscenza per categorie con quella per bisogni. Dobbiamo permettere a PEE di ragionare in entrambe le direzioni.

Le due prospettive

Conoscenza per categoria

PEE conosce i deumidificatori: principi fisici, tecnologie, prestazioni, consumi, limiti, condizioni di utilizzo, metodi di prova ed evidenze sui prodotti.

Conoscenza per bisogno

PEE conosce il problema dell’umidità domestica: possibili cause, conseguenze, strategie risolutive, condizioni di applicabilità, vantaggi, limiti e informazioni da verificare.

Collegamenti scientifici tra le due

PEE sa quando un deumidificatore può contribuire a risolvere quel bisogno, quando può essere insufficiente e quando un’altra strategia può essere più appropriata.

Perché è importante mantenerle entrambe

Immagina due utenti.

Utente A: “What’s the best dehumidifier for my bedroom?”

Qui PEE conosce già la categoria. Deve usare immediatamente la conoscenza sui deumidificatori per comprendere i criteri pertinenti e valutare i prodotti.

Utente B: “My bedroom walls are always damp. What can I do?”

Qui PEE deve partire dal bisogno. Potrebbe scoprire che sono pertinenti ventilazione, deumidificazione, isolamento oppure interventi contro le infiltrazioni.

La conoscenza scientifica è in parte condivisa, ma il punto di partenza è diverso.

E c’è un terzo vantaggio: quando PEE impara qualcosa di nuovo su una categoria, dovrebbe poter arricchire anche la conoscenza dei bisogni che quella categoria può soddisfare, e viceversa, sempre distinguendo collegamenti dimostrati e ipotesi da verificare.

Come dovrebbe essere strutturata

Non costruirei due database separati, né duplichererei le stesse informazioni.

Immagino piuttosto un’unica conoscenza scientifica interconnessa, consultabile da due direzioni.

Partenza dal bisogno

Problema → strategie → categorie

Partenza dalla categoria

Categoria → capacità → bisogni

Conoscenza scientifica condivisa

Meccanismi, relazioni, condizioni, evidenze, provenienza e incertezze

Un dettaglio importante: un bisogno come ridurre il rumore può interessare aspirapolvere, lavatrici e deumidificatori, ma i metodi per valutare ciascun prodotto non sono necessariamente identici.

Quindi il bisogno generale è condiviso, mentre la sua applicazione tecnica e la misurazione delle prestazioni devono conservare le differenze fra categorie.

Altrimenti rischieremmo di trasformare un bisogno trasversale in un confronto scientificamente scorretto.

Cosa significa per G1b

La proposta di Claude di rendere i bisogni generici indipendenti dalle categorie va nella direzione giusta, ma da sola non è sufficiente.

Non voglio che PEE semplicemente sposti il concetto low noise fuori dalle lavatrici e dagli aspirapolvere.

Voglio che sappia:

* riconoscere il bisogno generale;
* capire come si manifesta nelle diverse situazioni;
* identificare quali categorie e strategie possono soddisfarlo;
* recuperare la conoscenza tecnica specifica di ciascuna;
* confrontare i risultati soltanto quando esistono evidenze compatibili e appropriate.

E deve funzionare anche nel verso opposto: studiando una nuova categoria, PEE dovrebbe riconoscere quali bisogni già conosciuti può potenzialmente soddisfare, senza inventare efficacia non dimostrata.

In sintesi, la tua idea è più precisa di una semplice architettura goal-first: PEE deve avere una conoscenza scientifica bidirezionale, per bisogni e per categorie.

È questa la formulazione che manterrei come requisito architetturale permanente. Il prompt G1b già ne contiene diversi elementi, ma questa distinzione merita di essere verificata esplicitamente nei risultati: non basta dimostrare che il sistema parte dal bisogno; deve anche dimostrare che sa riutilizzare correttamente la conoscenza delle categorie quando è pertinente.
