# Owner review of lk.3 and the three remaining R2 correctness issues (2026-10-19), verbatim

Decision S71 in `decisions-and-supersessions.md`. Preserved byte for byte below the rule (the English brief first, then
the owner's Italian assessment, as received; the fullwidth mark after "SOSA/SSN" in the original is omitted). NIST and W3C SOSA/SSN are cited by the owner as methodological references.

---

Continue R2, preserving all previous decisions, validated behaviour, reproducible versions and shadow-only operation.

Before closing R2, please address three remaining scientific correctness issues identified in the lk.3 review:

1. Experimental compatibility: sharing a document does not necessarily establish a common experimental protocol. Missing source or method information must not be interpreted as demonstrated compatibility. Use positively supported compatibility, including relevant operating and test conditions.
2. Observation identity: identical numeric results within the same document may belong to distinct experiments. Conversely, repeated reporting of one experiment must not become independent evidence. Preserve observation/test identity where available; when identity cannot be established, do not invent either equivalence or independence.
3. Evidential force: incomplete scientific translation does not automatically mean that a contribution is demonstrably partial. Distinguish verified partial contribution from unresolved evidential force. Neither should become direct evidence without sufficient support.

These are general semantic requirements, not category-specific fixes. Reuse the existing QK/KR infrastructure and scientific methods. Add positive, negative and metamorphic tests, measure valid conclusions recovered as well as errors avoided, and explicitly report any justified abstentions.

Continue the planned assessment using existing materials before requesting new acquisitions. Do not expand R2 into the full scientific-document translation work reserved for R3.

Choose the smallest general, reversible implementation and report what is implemented, what is experimentally demonstrated and what remains unverified.


Eventualmente fallo a modo tuo se ritieni errato come suggeriamo, ma vanno risolti: lo dicono gli studi ingegneristici

Claude ha fatto un buon lavoro anche su lk.3. Ho verificato il rapporto e le regole nel repository: non si è limitato a cambiare qualche condizione, ma ha migliorato il modo in cui PEE rappresenta l’identità delle osservazioni, la compatibilità sperimentale e la forza delle evidenze.

Tuttavia, dalla lettura del codice emerge che due dei tre problemi non sono ancora risolti completamente. Non significa che il lavoro sia sbagliato: significa che dobbiamo distinguere il progresso effettivo dalla correttezza scientifica definitivamente dimostrata.

Che cosa ha funzionato

Risultato	Mia valutazione
Distinguere osservazioni di documenti diversi	Miglioramento concreto
Impedire che un dato isolato dimostri una curva	Correzione importante
Riconoscere esplicitamente la compatibilità non dimostrata	Progresso metodologico
Limitare conclusioni basate su conoscenza incompleta	Direzione corretta
Conservare le versioni lk.1 e lk.2	Ottima scelta per la riproducibilità
Test superati	4.726 riferiti da Claude, non rieseguiti indipendentemente

Il fatto che il precedente punto allineato fosse costruito su una lettura che associava 4,4 W e 45,9 W a impostazioni incompatibili è particolarmente significativo.

Claude ha individuato un’inferenza sbagliata e l’ha ritirata. Questo è esattamente il comportamento che vogliamo ottenere da PEE.

I due punti che terrei sotto osservazione

1. Stesso documento non significa necessariamente stesso esperimento

Ho esaminato la regola aligned_point di lk.3.

La compatibilità viene ammessa come same_document quando non risultano fonti diverse, purché non emergano conflitti nelle condizioni.

Il problema è che l’assenza di due fonti diverse non dimostra l’esistenza di un protocollo condiviso.

Anzi, nel codice attuale la regola può essere soddisfatta anche quando manca completamente l’identità della fonte, perché la condizione two_sources non risulta dimostrata.

Inoltre uno stesso articolo può contenere misure prodotte con esperimenti differenti.

È una distinzione confermata dalla metrologia del National Institute of Standards and Technology: ripetibilità e riproducibilità dipendono da procedure e condizioni di misurazione specifiche, non dall’identità del documento che pubblica i risultati.

Il criterio corretto è quindi più preciso: stessa fonte documentale è un indizio utile, ma la compatibilità deve derivare dalle informazioni effettivamente disponibili sul protocollo e sulle condizioni pertinenti.

2. Identità numerica e identità dell’osservazione sono ancora parzialmente confuse

Il nuovo observationKey include la fonte, ma utilizza ancora prodotto, grandezza, valore e condizioni per riconoscere un’osservazione ripetuta.

È certamente meglio di prima.

Tuttavia, immaginiamo che lo stesso laboratorio effettui due prove distinte, entrambe con risultato 20 W, e le riporti nello stesso documento.

Sono due osservazioni, non una.

Lo standard W3C SOSA/SSN distingue infatti l’atto di osservazione dal suo risultato numerico e dalla procedura utilizzata.

La soluzione generale dovrebbe utilizzare l’identificativo della prova o dell’osservazione quando disponibile, senza presumere che valori identici rappresentino necessariamente un’unica prova.

E il fatto che adesso nessun valore abbia forza diretta?

Non lo considero automaticamente un problema.

Prima avevamo conclusioni troppo forti. Ora il sistema riconosce che le procedure scientifiche insegnate sono ancora rappresentate in modo incompleto.

Questo è un miglioramento della prudenza.

C’è però una distinzione da preservare: una traduzione incompleta non rende necessariamente una prova parziale. A volte la conclusione corretta è che la forza dell’evidenza non può ancora essere determinata.

Altrimenti rischiamo di sostituire una conclusione ingiustificatamente forte con una classificazione parziale altrettanto non dimostrata.

Per esempio, il fatto che PEE non capisca il termine tco non gli consente ancora di stabilire quale contributo scientifico rappresenti il singolo valore in watt rispetto al costo complessivo.

Questo conferma quanto sarà importante il lavoro di R3.

Che cosa farei adesso?

Non autorizzerei nuove acquisizioni e non aprirei un’altra fase. Claude ha già indicato correttamente che il prossimo passo consiste nel verificare quanto è possibile dimostrare con il materiale esistente.

Terrei questi problemi come controlli da affrontare prima della chiusura di R2:

* Compatibilità positiva, anche quando la fonte è assente.
* Identità delle prove distinte pubblicate nello stesso documento.
* Distinzione fra contributo parziale dimostrato e forza ancora indeterminata.

Non gli invierei ora un altro lungo prompt, visto che sta già seguendo un percorso sperimentale e il lavoro è ancora in modalità ombra. Possiamo consolidare queste osservazioni nella prossima verifica, senza interrompere continuamente lo sviluppo.

Il mio giudizio sul progresso

La cosa interessante è che siamo passati da riconoscitori basati sulle parole a regole che ragionano su osservazioni, condizioni, metodi, provenienza e conseguenze.

Questo è un progresso architetturale vero.

Ma non abbiamo ancora dimostrato che tale ragionamento funzioni correttamente su documenti completamente nuovi, né che produca risultati sufficienti a consigliare i prodotti.

E soprattutto, non abbiamo ancora affrontato la traduzione completa della conoscenza scientifica.

R2 sta rendendo PEE più rigoroso; R3 dovrà renderlo anche più competente. È proprio la combinazione delle due capacità che può portare al salto di qualità che stiamo cercando.
