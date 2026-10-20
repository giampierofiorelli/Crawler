# Owner direction on rule admission and rule-engineering tools (2026-10-20), verbatim

Received after the S102 follow-up. Preserved unchanged. No execution authorised: the owner is designing the next
consolidated intervention; first compare the checks of `knowledge_rules.ts` with DMN/Drools, Z3 and fast-check and keep
only what adds a demonstrable advantage. The owner asks Claude to study the sources online.

---

Claude ha recepito correttamente la questione e, soprattutto, ha fatto bene a non avviare un’altra esecuzione. Ora abbiamo la possibilità di progettare il prossimo intervento senza aggiungere altre correzioni una sopra l’altra.

La scoperta su RQ08 è importante: abbiamo costruito un sistema capace di proteggere le invarianti, ma non avevamo ancora costruito un sistema sufficientemente rigoroso per decidere quali regole meritassero davvero di diventare invarianti.

È una lacuna che voglio affrontare alla radice.

Ho individuato tre strumenti ingegneristici particolarmente pertinenti

Ho controllato la documentazione tecnica. Non suggerirei di installare un nuovo motore: queste tecnologie possono inizialmente servirci per analizzare e verificare le regole esistenti.

Tecnologia	Che cosa può fare per PEE
DMN / Drools	Individuare sovrapposizioni, contraddizioni e lacune nelle decisioni. Drools documenta controlli statici per gaps e overlaps.
Z3	Verificare formalmente se combinazioni di vincoli siano compatibili, impossibili o ridondanti. È open source MIT.
fast-check	Generare molte combinazioni di casi, individuare controesempi e ridurli automaticamente a esempi minimi riproducibili.

Per RQ08, ad esempio, uno strumento di verifica dei vincoli può aiutarci a dimostrare che due requisiti minimi compatibili non sono contraddittori. Ma la distinzione fra requisito, preferenza e scenario alternativo richiede comunque una corretta interpretazione dell’intento.

Nessuno dei tre strumenti può stabilire da solo che una regola sia scientificamente vera. Dovremo affiancare la verifica formale alla validazione delle definizioni e delle evidenze.

Quale cambiamento vorrei introdurre

Non soltanto un registro delle regole, ma un processo permanente di ammissione.

Regola proposta

Da ricerca scientifica, conoscenza esistente o nuovo documento

Validazione del significato

Definizione, ambito, presupposti, eccezioni e controesempi

Analisi delle interazioni

Conflitti, ridondanze, precedenze e vecchie regole coinvolte

Verifica eseguibile

Test positivi, negativi, metamorfici e casi mai esaminati

Ammissione o revisione

Attiva, sperimentale, in revisione oppure rifiutata, con motivazione

Questo processo potrebbe anche aiutarci, in futuro, a proporre regole a partire da documenti scientifici, senza trasformare automaticamente ogni affermazione estratta in una regola eseguibile.

E i miglioramenti che abbiamo già visto?

Non vorrei sottovalutarli. Con S102 abbiamo recuperato, su materiale già esaminato, 19 delle 20 attribuzioni corrette perdute in S100, mantenendo sostanzialmente la precisione raggiunta. Abbiamo anche introdotto il ciclo di vita delle regole, il loro riutilizzo parziale nella richiesta utente e la rielaborazione sensibile alle versioni.

Sono miglioramenti reali, ma non ancora prove di una migliore accuratezza generale su documenti nuovi.

La prossima fase deve quindi fare due cose insieme: consolidare la qualità delle regole e verificare che questa qualità migliori effettivamente il comportamento di PEE.

Non preparerei ancora un prompt che chieda semplicemente a Claude di integrare Z3, Drools o fast-check. Prima confronterei i controlli già disponibili in knowledge_rules.ts con le capacità di questi strumenti, scegliendo soltanto quelle che aggiungono un vantaggio dimostrabile.

La direzione che terrei ferma è questa: meno regole locali, meno logica hardcoded, ma soprattutto regole migliori, giustificate e verificabili prima che possano influenzare le decisioni.

Claude ha registrato le questioni in D31 e si è fermato. È la situazione giusta per progettare un unico prossimo intervento, senza perdere ciò che abbiamo costruito.

Mi raccomando tutto ciò che serve a te per accedere alle fonti per capire meglio devi sempre andare a studiarti online
