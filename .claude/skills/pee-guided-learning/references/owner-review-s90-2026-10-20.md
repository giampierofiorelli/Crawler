# Owner review of S90 (2026-10-20), verbatim

Received after S90 (Crawler ee18cc3). Preserved unchanged. It keeps the direction and sets the next priorities; it does
not authorise a migration or operational activation. It also corrects a count in the S90 report (8 publishers, not 9;
correction note added there).

---

S90 è un progresso positivo e, soprattutto, conferma che stiamo lavorando nella direzione giusta. Questa volta il miglioramento deriva dal riutilizzo della struttura dei documenti, non dall’aggiunta di nuove regole specifiche per ciascun prodotto.

Ho verificato il rapporto e il codice pubblicati.

1. Che cosa è migliorato davvero

Risultato su 208 valori nuovi	S89	S90
Proprietà riconosciute correttamente	33/82	40/82
Precisione delle attribuzioni	80%	82%
False attribuzioni	1	1
Ruoli della prova corretti	7/82	34/82

Il miglioramento è reale, anche se contenuto: sette proprietà corrette recuperate in più, senza aumentare le false attribuzioni.

Dei sette risultati aggiuntivi, cinque derivano specificamente dall’utilizzo della struttura documentale. Questa è una conferma sperimentale del vantaggio di collegare la conoscenza scientifica alla lettura.

2. La scoperta più importante

Il problema del ruolo della prova sta diventando molto chiaro.

PEE può leggere correttamente un valore come:

Suction power: 12,000 Pa

Ma deve anche capire se si tratta di una specifica dichiarata dal produttore oppure di una misura effettuata autonomamente dal recensore.

Le due informazioni non sono equivalenti.

Il nuovo sistema riconosce meglio la struttura, ma continua a utilizzare un classificatore che, in assenza di indizi, interpreta molti valori come misurati.

È un errore di impostazione, non semplicemente di vocabolario.

La correzione proposta da Claude — lasciare il ruolo non risolto quando mancano prove sufficienti — è scientificamente sensata. Tuttavia, non basta a migliorare automaticamente l’accuratezza: deve poi riuscire a riconoscere positivamente sia le dichiarazioni sia le misure originali.

Inoltre, una recensione può contenere nella stessa sezione specifiche dichiarate e misurazioni indipendenti. Perciò il tipo di pagina, da solo, non può stabilire il ruolo di ogni valore.

3. Cosa continua a mancare

Ci sono tre limiti importanti.

Il richiamo è ancora al 49%. Più della metà delle proprietà corrette resta non identificata.

L’apprendimento non ha prodotto un vantaggio misurabile. I 26 termini acquisiti non hanno cambiato il risultato sui documenti di verifica. È positivo che il meccanismo distingua termini candidati e supportati, ma non abbiamo ancora dimostrato che questa conoscenza migliori autonomamente la lettura.

La verifica è sbilanciata verso le specifiche dichiarate. Dei valori di riferimento, 74 su 82 sono dichiarazioni. Classificare tutto come dichiarato darebbe 74 risposte corrette, contro le 34 di S90. Questo rende indispensabile misurare separatamente il riconoscimento delle vere prove indipendenti, non soltanto l’accuratezza complessiva.

4. La direzione che manterrei

Non cambierei architettura e non ripartirei dalla ricerca teorica.

Il prossimo intervento dovrebbe concentrarsi su come i componenti già esistenti rappresentano e trasmettono il contesto documentale: etichetta, sezione, tipo di contenitore, metodo, autore della dichiarazione e relazione con il prodotto.

Queste informazioni devono arrivare alla stessa definizione scientifica, senza introdurre un nuovo classificatore per ogni editore.

Anche la verifica successiva dovrebbe includere documenti ricchi di misurazioni originali, oltre alle schede tecniche, e misurare separatamente precisione, copertura e astensione per ogni ruolo.

Una piccola discrepanza documentale: il rapporto parla di nove editori nuovi complessivi, ma dai gruppi effettivamente valutati in S89 e S90 ne risultano quattro per esperimento, quindi otto. Non cambia il giudizio, ma vale la pena mantenere precisi anche questi conteggi.

Il mio giudizio complessivo: S90 ha confermato un principio fondamentale: la conoscenza scientifica e la struttura del documento devono lavorare insieme.

Il miglioramento non è spettacolare numericamente, ma è architetturalmente significativo. Ora PEE può recuperare informazioni precedentemente perse senza moltiplicare le attribuzioni sbagliate.

La prossima sfida non è inventare nuove conoscenze per robot e soundbar. È fare in modo che lo stesso meccanismo generale capisca da dove arriva ciascuna informazione, che cosa significa e come utilizzarla correttamente.

R3 resta aperto e il sistema è ancora sperimentale, ma la direzione è supportata da risultati sempre più concreti.
