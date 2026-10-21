# Owner review of the second increment N1 (2026-10-21)

Received after Crawler commit ecf0cd5 (N1 report `docs/plans/n1-report.md`). Preserved verbatim (Italian). It records
design direction and a proposal for a third increment; it does not by itself authorise the third increment.

---

Ho letto direttamente il .

Il risultato è negativo per l’ammissione operativa, ma abbiamo fatto un progresso architetturale importante. Soprattutto, l’esperimento ci dice qualcosa di nuovo su come proseguire senza continuare ad aggiungere regole.

1. Cosa abbiamo realmente ottenuto

Relazioni di riga ricostruibili

1.010/1.010

Su una copia dello store

Precisione scientifica H1

37%

Obiettivo preregistrato: almeno 80%

Bisogni aggiuntivi corretti

0

Rispetto a B

Test superati

5.051

Nessuna regressione osservata nelle 206 richieste

Il nuovo meccanismo conserva celle, ruoli, collegamenti, condizioni e provenienza, e permette di ricostruirli senza duplicazioni.

Questo risolve un problema di capacità rappresentativa che il vecchio modello non riusciva ad affrontare.

Ma la capacità di rappresentare una relazione non significa averne compreso correttamente il significato. Il 37% di precisione dimostra che il nuovo lettore è ancora inaffidabile sulle strutture non viste.

Claude ha fatto bene a non inserirne i risultati nel database operativo.

2. Le tre barriere che ora vediamo chiaramente

Comprensione delle relazioni scientifiche

PEE identifica spesso le colonne che hanno un collegamento, ma sbaglia il significato e la direzione del collegamento stesso. Un’intestazione come verification needed può indicare cosa verificare, non il metodo con cui verificarlo.

Questo è un problema di semantica documentale, collegato anche al futuro R4.

Comprensione dell’obiettivo dell’utente

Su 48 nuove richieste, 23 non ricevono una categoria. Sono soprattutto richieste che descrivono una situazione senza indicare il prodotto.

Questo conferma l’importanza del filone C: comprendere il problema prima di scegliere una famiglia di prodotti.

Selezione della conoscenza pertinente

Il recupero N1 restituisce più informazioni contraddittorie della ricerca esistente, perché non applica adeguatamente negazioni, rifiuti e indifferenze.

Qui dobbiamo riutilizzare la semantica sviluppata in N0, non costruire un altro sistema indipendente.

3. C’è una quarta scoperta, forse ancora più importante

Nel rapporto Claude osserva che, anche quando N1 recupera un risultato potenzialmente pertinente, l’attuale sistema può scartarlo perché nessuna parola della richiesta nomina esplicitamente il risultato da inferire.

Questo merita particolare attenzione.

Pensiamo a un utente che scriva:

I need something for my damp bedroom, especially during winter.

Un sistema che possiede conoscenze scientifiche adeguate potrebbe individuare ipotesi riguardanti umidità, condensazione, ventilazione e possibili famiglie di soluzioni, senza che l’utente debba specificare tutte queste caratteristiche.

Ma se per prendere in considerazione un risultato il sistema richiede già la parola che lo identifica, rischiamo di impedire proprio quel ragionamento che vogliamo sviluppare.

Naturalmente non possiamo semplicemente eliminare la protezione: serve anche a evitare bisogni inventati.

La soluzione concettuale è distinguere un’ipotesi scientificamente motivata da un bisogno attribuito definitivamente all’utente.

PEE dovrebbe poter considerare ipotesi nuove, verificarne la pertinenza e chiedere chiarimenti quando servono, senza trasformarle automaticamente in requisiti o esclusioni.

È un collegamento diretto fra N0, N1, C e N2.

4. Cosa farei adesso

Non farei ripetere a Claude N1 aggiungendo nuove regole per le intestazioni delle televisioni. Sarebbe il rischio di adattamento agli esempi che abbiamo già osservato in R3-P.

Proporrei invece un terzo incremento orientato all’integrazione scientifica, con due attività che possono procedere in parallelo.

La prima è il filone C in modalità ombra: riconoscere gli oggetti, distinguere quelli richiesti da quelli citati come contesto e individuare possibili famiglie di soluzioni quando l’utente descrive soltanto un problema. Deve essere possibile anche dichiarare che non ci sono elementi sufficienti per scegliere.

La seconda è un miglioramento generale della comprensione semantica delle tabelle, utilizzando le informazioni nelle celle, le intestazioni, il contesto e le condizioni per determinare il significato dei collegamenti. Claude dovrebbe poter confrontare metodi alternativi, senza limitarsi a nuovi elenchi di parole.

Il modello N1 già implementato resta disponibile per questi esperimenti, ma non va promosso finché non soddisfa le soglie indipendenti.

Non avvierei ancora N2 completo né una ristrutturazione generale dello store.

5. Una conseguenza per la nostra roadmap

Voglio mantenere visibile ciò che avevamo stabilito prima della diagnosi: PEE deve migliorare anche nella ricerca, nella lettura dei documenti, nell’estrazione quantitativa e qualitativa, nell’attribuzione delle prove e nell’apprendimento.

Per questo la lettura delle tabelle non deve diventare un problema secondario rispetto all’interpretazione delle richieste.

Sono due capacità che si rafforzano reciprocamente: PEE deve capire che cosa cercare e deve saper riconoscere che cosa dimostra realmente la fonte trovata.

La mia raccomandazione

Non considero N1 un fallimento da rifare. Considero completato il suo primo esperimento: è stata introdotta una rappresentazione più ricca, è stata verificata la ricostruibilità e sono stati misurati limiti importanti. La capacità scientifica operativa, invece, non è ancora validata.

Ora lascerei a Claude maggiore libertà rispetto ai primi incrementi, come avevamo concordato: obiettivi e vincoli chiari, uso delle skill già create, possibilità di confrontare più soluzioni e test indipendenti prima dell’ammissione.

La prossima fase dovrebbe collegare comprensione dell’obiettivo e comprensione delle evidenze, senza pretendere ancora di produrre raccomandazioni.

E soprattutto non vorrei che il nuovo successo fosse soltanto passare dal 37% all’80% su un’altra serie di tabelle. Vorrei che Claude dimostrasse anche che la conoscenza estratta permette a PEE di affrontare problemi nuovi, riconoscere ciò che non sa e formulare domande migliori.

È questa la differenza tra costruire un estrattore più sofisticato e costruire il sistema di apprendimento scientifico che vogliamo.

---

## Verification of the facts cited (Claude, 2026-10-21)

Each figure was checked against the committed records:

| Owner's figure | Committed record | Agrees |
|---|---|---|
| Row claims 1,010/1,010 rebuilt on a store copy | `evaluation/n1/materialise.json` | yes |
| H1 precision 37% (exact links) vs 80% preregistered | `evaluation/n1/heldout-l1-firstrun.json`; column pairs were 0.81 | yes |
| 0 additional correct needs vs B | `evaluation/n1/needs-check-firstrun.json` | yes |
| 5,051 tests passed; 206 answers unchanged | report §5; `evaluation/n1/advice-diff-*.json` | yes |
| 23 of 48 requests with no category | `evaluation/n1/l4-diagnosis-posthoc.json` | yes |
| More contradicting items from N1 retrieval (11 vs 2), stances not applied | `evaluation/n1/l3-scores-firstrun.json`; 7 of 12 "opposite situation" | yes |
| The anchor guard can drop a relevant outcome | 2 outcomes reached only through claims, both stopped by the guard | yes, measured on 2 cases only |

The first line ("Ho letto direttamente il .") is preserved as received; the name of the document read appears to be
missing.
