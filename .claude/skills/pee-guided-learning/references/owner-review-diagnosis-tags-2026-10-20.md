# Owner review of the REP / K-lost / K-absent diagnosis tags (2026-10-20)

Received after commit 712ef05. Preserved verbatim (Italian), followed by the changes made.

---

La risposta di Claude conferma che stiamo arrivando a una fase interessante: ora abbiamo un metodo per verificare se i problemi di PEE dipendono dalla comprensione del linguaggio, dall'architettura o dalla perdita di conoscenza scientifica.

L'aggiunta delle due etichette diagnostiche è utile:

* REP: permette di individuare gli errori collegati alle incompatibilità semantiche già documentate. Per esempio, interpretare una funzione rifiutata come un risultato desiderato.
* K-lost: permette di individuare conoscenze presenti nei documenti scientifici originali ma assenti o alterate nella base di conoscenza.
* K-absent: distingue le conoscenze realmente mancanti da quelle che PEE ha acquisito ma non riesce a utilizzare.

Questa distinzione può guidare interventi molto diversi. Se prevale REP, occorre correggere il modello semantico. Se prevale K-lost, bisogna intervenire sul processo di acquisizione e conservazione delle relazioni scientifiche. Se prevale K-absent, potrebbe servire ulteriore ricerca scientifica.

Due cautele metodologiche

La prima: queste etichette identificano spiegazioni supportate dalle evidenze disponibili, non dimostrano automaticamente la causa di ogni errore. Una conferma causale più forte richiederà esperimenti mirati, modificando un solo meccanismo alla volta.

La seconda: Claude scrive che la diagnosi è stata modificata prima di qualsiasi esecuzione. Più precisamente, è stata modificata prima delle prime esecuzioni sigillate del pilota sui bisogni. Sono già stati svolti esperimenti di sviluppo e la prima fase sulla negazione. Questa distinzione va mantenuta nei rapporti finali.

È comunque corretto introdurre nuove classificazioni diagnostiche prima delle esecuzioni indipendenti, purché sia dichiarato che la scelta delle etichette è stata informata dalle precedenti analisi di sviluppo.

Un aspetto che considero particolarmente importante

L'etichetta K-lost dovrebbe essere assegnata soltanto quando è possibile ricostruire il percorso:

Documento scientifico originale → relazione documentata → trasformazione nella base di conoscenza → informazione persa o alterata.

La semplice presenza di parole simili nel documento originale non sarebbe sufficiente.

Questo ci permetterebbe di misurare qualcosa che finora abbiamo studiato poco: quanto della conoscenza scientifica acquisita da PEE sopravvive effettivamente nella forma necessaria per ragionare.

È una misura potenzialmente preziosa anche per le future categorie di prodotto.

Per il momento, però, non aggiungerei altre istruzioni. Claude ha già registrato le decisioni, aggiornato la diagnosi e mantenuto congelato l'esperimento.

Il prossimo risultato da attendere è il rapporto A/B/C-lite, comprensivo degli errori, delle cause concorrenti e dei limiti del campione reale. Da lì potremo decidere quale intervento produce il maggiore beneficio operativo senza introdurre nuove regole specifiche o duplicare capacità già esistenti.

---

## Changes made (`evaluation/r3p/needs-failure-causes.json`, amendment 3)

These changes were made before the sealed stage-2 first runs. They were **not** made before every run: the stage-2
development runs, the stage-1 negation first runs and the probe sentences of the N0 design already exist.

- **Label choice informed by development.** The diagnosis protocol now states that its causes and tags were chosen
  after, and informed by, those analyses.
- **Evidence chain required for K-lost.** K-lost is assigned only when the whole chain is reconstructed with
  evidence:
  - original document (file and line, quote hash);
  - the relation as documented there;
  - the transformation into the store (statement or item id, with the derivation that produced it);
  - the loss or alteration.

  Similar words in the original document are not enough. Without the chain, the unit is K-absent or undetermined.
- **Causal status.** The causes and tags are explanations supported by the available evidence, not causal proof.
  Stronger confirmation needs targeted experiments that change one mechanism at a time; the report names them as
  follow-ups.
- **Survival measure.** The report gives, per category, the share of the K units whose documented relation survived
  in usable form.
