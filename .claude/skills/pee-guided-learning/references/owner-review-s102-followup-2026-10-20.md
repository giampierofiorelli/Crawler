# Owner follow-up on S102 (2026-10-20), verbatim

Received after Claude's answer to the S102 review. Preserved unchanged. **No execution is authorised**: the owner will
prepare one consolidated intervention that includes rule-quality engineering and the progressive reduction of hardcoding.

---

La risposta di Claude è positiva, soprattutto perché ha riconosciuto che il nuovo sistema di governance può proteggere anche una regola concettualmente sbagliata. Questo è un problema fondamentale che dobbiamo risolvere prima di considerare matura l’architettura.

C’è un aspetto particolarmente significativo: RQ08 non è soltanto una regola imperfetta. Claude l’aveva classificata come invariante, rendendone più difficile la modifica. Questo dimostra che non basta governare correttamente le regole: bisogna governare anche il modo in cui vengono create, classificate, validate e successivamente revisionate.

La distinzione che vorrei introdurre

Un’invariante deve rappresentare una proprietà generale realmente giustificata, non una soluzione tecnica adottata durante una fase di sviluppo.

Per esempio:

Regola	Natura corretta
Una preferenza non diventa automaticamente un requisito obbligatorio	Invariante semantica
Due minimi differenti sono sempre contraddittori	Regola sbagliata
Due minimi obbligatori sullo stesso oggetto si combinano nel più restrittivo	Regola logica, soggetta ai necessari presupposti
Un requisito non verificabile non può escludere definitivamente un prodotto	Invariante di affidabilità

Attenzione anche alla frase «almeno 4 litri, oppure almeno 6 per una famiglia»: non è necessariamente una preferenza. Potrebbe esprimere due scenari alternativi. PEE deve riconoscere a quale scenario appartiene ciascun vincolo, senza inventare una preferenza che l’utente non ha esplicitato.

Questa è la differenza fra applicare una regola numerica e comprendere davvero l’intenzione.

Quello che aggiungerei al prossimo intervento

Non mi limiterei ai tre punti proposti da Claude. Preserverei anche ciò che abbiamo concordato sulla qualità complessiva delle regole.

In particolare, il prossimo intervento dovrebbe comprendere:

* Correzione semantica di RQ08, inclusa la revisione controllata della sua classificazione come invariante.
* Verifica della qualità delle regole, non soltanto della loro coerenza: correttezza scientifica, copertura, ambiti, eccezioni e generalizzazione.
* Censimento delle politiche hardcoded residue, con un piano per renderle dichiarative quando opportuno e ritirare realmente quelle sostituite.
* Validazione indipendente delle tabelle e del percorso utente, senza confondere test positivi su esempi preparati con capacità generali dimostrate.
* Gestione della rielaborazione della conoscenza, distinguendo pagine effettivamente rileggibili da quelle per cui non disponiamo più del contenuto o dei diritti necessari.

Non chiederei di implementare necessariamente tutto in una sola iterazione. Chiederei però che tutto rientri nella stessa progettazione, con priorità, dipendenze e condizioni di arresto esplicite.

C’è un’altra cosa che mi interessa molto

Vorrei smettere di scoprire che una regola è sbagliata soltanto quando provoca un errore.

Dovremmo cominciare a verificarne sistematicamente la qualità già quando viene proposta.

Questo ci porta proprio alla ricerca di cui parlavamo: metodi e strumenti di rule engineering, verifica formale, analisi delle contraddizioni e generazione assistita di regole da conoscenze scientifiche.

Ma tali strumenti non devono semplicemente riscrivere le regole in una forma più elegante. Devono aiutarci a capire se sono corrette, complete per il loro ambito e coerenti con le altre conoscenze.

La mia decisione

Approverei la direzione indicata da Claude, ma prima preparerei un unico intervento consolidato che includa anche la verifica ingegneristica della qualità delle regole e la riduzione progressiva dell’hardcoding.

Non avvierei immediatamente un’altra esecuzione.

Il punto più incoraggiante di S102 è che Claude ha iniziato ad accettare che anche le proprie decisioni recentissime possano essere concettualmente sbagliate.

Il prossimo salto sarà trasformare questa capacità di autocorrezione da comportamento occasionale durante lo sviluppo a proprietà permanente, verificabile e riutilizzabile di PEE.
