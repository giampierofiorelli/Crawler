# Owner review of S103 (2026-10-20), verbatim

Received in the Claude Code session after the S103 report (`docs/plans/s103-rule-admission.md`). Italian original,
unchanged. The owner attached the strategic brainstorming memo of 2026-10-20 (kept unmodified in the private repository,
`pee-knowledge/owner-documents/PEE-BRAINSTORMING-STRATEGIA-2026-10-20.zip`); it states that it does not authorise code
changes, tool installation, gate changes or new work (§14).

---

S103: abbiamo migliorato il motore, ma non ancora abbastanza la comprensione

Ho verificato il e il codice dei moduli principali.

La mia valutazione è positiva sul piano architetturale, ma decisamente più cauta sui risultati operativi. Claude ha rispettato le istruzioni e, soprattutto, ha dichiarato apertamente i limiti delle verifiche.

La distinzione emerge chiaramente dai numeri.

Errori dannosi — richieste nuove

7 vs 8

S103 rispetto a S102

Limiti correttamente riconosciuti

47/81

Erano 45/81 in S102

Limiti stretti/inclusivi corretti

45/47

Erano 29/45 in S102

Ruoli corretti nelle nuove tabelle

0/5

Nessun progresso rispetto a S102

Richieste scritte e annotate da agenti Claude; tabelle da editori reali con annotazione tramite agenti Claude. Non equivalgono a una validazione con utenti reali o revisori umani indipendenti.

Il miglioramento nel distinguere limiti stretti e inclusivi è sostanziale. Ma riconoscere 47 degli 81 limiti valutabili è ancora insufficiente per sostenere che PEE comprenda bene i requisiti quantitativi in generale.

E soprattutto, abbiamo introdotto un nuovo errore dannoso.

Il problema che S103 ha messo in evidenza

Prendiamo i due errori più significativi.

Testo originale	Che cosa dovrebbe comprendere PEE	Problema attuale
“Nothing over 6L”	La capacità non deve superare 6 litri	S103 applica erroneamente un minimo
“Real everyday use numbers, not what manufacturers claim”	L’introduzione contrappone dati pratici e dichiarazioni del produttore	Le due provenienze vengono trattate come indizi concorrenti, senza interpretare correttamente la negazione

Questi esempi mi interessano perché mostrano lo stesso problema in due parti diverse del software: PEE riconosce parole pertinenti, ma non sempre comprende come una negazione o un contrasto cambi il significato della relazione.

Non è soltanto una parola mancante nel vocabolario.

La soluzione generale dovrebbe riguardare la rappresentazione di negazione, ambito, contrasto e relazioni fra proposizioni, riutilizzabile tanto nella richiesta dell’utente quanto nell’interpretazione dei documenti.

Questo è più promettente che aggiungere una regola per nothing over e un’altra per not what manufacturers claim.

Tre aspetti che terrei sotto osservazione

1. Il nuovo processo di ammissione non garantisce ancora la validità delle regole.

Ho verificato checkAdmission: ora richiede giustificazioni, prerequisiti, controesempi ed evidenze, ma questi controlli verificano principalmente la presenza e la struttura delle informazioni.

Non costituiscono una revisione scientifica indipendente. Inoltre 86 regole di interpretazione precedenti rimangono esplicitamente non riesaminate.

La governance è più rigorosa, ma il patrimonio esistente non è ancora stato interamente validato.

2. La qualità dell’estrazione scientifica rimane un ostacolo.

Nelle sei nuove pagine con tabelle, PEE ha riconosciuto correttamente la proprietà in 5 dei 26 casi dotati di riferimento e non ha interpretato correttamente nessuno dei cinque ruoli confrontati.

Questo significa che, anche con regole formalmente ben governate, la conoscenza disponibile non arriva ancora in modo sufficientemente efficace all’interpretazione dei documenti.

3. Le 152 revisioni del deposito richiedono un piano di aggiornamento.

Sono state elaborate con una vecchia versione dell’estrattore. Ciò non significa automaticamente che tutte le informazioni siano sbagliate.

Significa che non possiamo dimostrare che siano coerenti con l’interpretazione attuale senza rielaborarle. Poiché non conserviamo le pagine originali, serviranno nuovi accessi autorizzati, da pianificare per priorità e nel rispetto dei diritti.

Che cosa farei dopo S103

Qui mi ricollego soprattutto al nostro ultimo brainstorming.

Non vorrei che passassimo altre dieci fasi a correggere singoli casi linguistici senza sperimentare finalmente l’utilizzo attivo della conoscenza scientifica.

Vedrei due priorità strettamente collegate.

La prima è correggere il problema trasversale della negazione attraverso un meccanismo generale e validato. È importante perché oggi un requisito può essere applicato al contrario, con conseguenze potenzialmente dannose.

La seconda è avviare il nostro banco di prova sulla comprensione dei bisogni dell’utente, mettendo a confronto il sistema attuale con una versione capace di utilizzare maggiormente le relazioni scientifiche già acquisite.

Per esempio, una persona che chiede un purificatore adatto a una camera da letto non dovrebbe dover pronunciare tutte le parole tecniche giuste. PEE dovrebbe sfruttare conoscenze su rumore, portata d’aria, prestazioni di filtrazione e condizioni d’uso per identificare i requisiti pertinenti, senza inventare preferenze.

Questo ci consentirebbe di misurare se la conoscenza produce un miglioramento concreto senza aggiungere continuamente nuove regole per ogni frase.

La mia conclusione

S103 ha dimostrato qualcosa di importante: abbiamo ottenuto un sistema di regole più controllabile e abbiamo persino scoperto un vero difetto numerico grazie ai test generativi.

Ma il miglioramento dell’interpretazione è ancora piccolo.

Credo quindi che sia arrivato il momento di cambiare il tipo di progresso che cerchiamo. Mantenere e consolidare la governance, certamente, ma cominciare anche a verificare quanto può migliorare PEE quando la conoscenza scientifica viene utilizzata attivamente per comprendere le intenzioni, proporre requisiti e collegarli alle prove.

È proprio l’esperimento che avevamo deciso di non dimenticare e che abbiamo conservato nel nostro documento strategico.

Non preparerei ancora un ulteriore prompt senza esaminare prima le dipendenze di questo esperimento. E non dichiarerei chiuso R3.

La domanda centrale per la prossima fase dovrebbe essere: quanto più intelligente diventa PEE usando la conoscenza che possiede già, senza modificare le regole per ogni nuovo caso?

Quella sarebbe una prova molto più significativa della strategia che stiamo costruendo.
