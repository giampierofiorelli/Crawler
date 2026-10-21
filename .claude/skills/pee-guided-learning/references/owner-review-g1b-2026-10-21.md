# Owner review of G1b (2026-10-21), verbatim

Received after Crawler commit e8d44a3 (G1b report). **It authorises no work**: the owner will send one consolidated prompt
that includes the permanent bidirectional-knowledge requirement and an explicit experimental comparison of
vectorisation. Decision row: G1b-review. Report correction: `docs/plans/g1b-report.md` §10.

## The owner's message (Italian, unchanged)

Ho verificato il .

Il feedback di Claude rafforza notevolmente la tua intuizione sulla vettorializzazione. E arriva in un momento interessante: G1b ha costruito una parte della conoscenza bidirezionale che desideravamo, ma non riesce ancora a recuperarla affidabilmente quando l’utente descrive un problema con parole diverse da quelle presenti nei documenti.

Tengo fermi i due principi che abbiamo concordato:

* Conoscenza per bisogno e per categoria, collegata, senza duplicazioni inutili.
* Vettorializzazione della conoscenza da valutare come componente permanente del recupero semantico, non come sostituto delle relazioni scientifiche e delle prove.

Cosa ha realmente ottenuto G1b

Situazioni scientifiche rappresentate

926

Con provenienza documentale

Situazioni collegate a strategie senza acquisto

167

Collegamenti derivati dalle fonti

Conoscenza bidirezionale

Implementata in ombra

Bisogno → strategie → categorie, e categoria → bisogni. Ricostruibile, senza modifiche allo store operativo.

È un progresso architetturale significativo. Tuttavia, i test dimostrano soprattutto che questa struttura può essere costruita, ricostruita e consultata nei due versi. Non dimostrano ancora che tutti i collegamenti siano scientificamente corretti né che PEE sappia selezionarli per un nuovo problema.

Quest’ultima capacità è proprio quella che è fallita.

Il dato decisivo

Sulle 24 richieste di sviluppo con conoscenza pertinente disponibile, Claude ha individuato:

12/24

Problema di precisione

La conoscenza condivide parole con la richiesta, ma il sistema dà importanza a corrispondenze irrilevanti.

12/24

Problema di parafrasi

La conoscenza pertinente esiste, ma è formulata con parole differenti.

Questo secondo problema è esattamente quello per cui gli embeddings semantici meritano di essere sperimentati.

E il primo potrebbe beneficiare di un recupero ibrido seguito da controlli sui ruoli, sulla pertinenza delle relazioni e sulle condizioni di applicabilità.

Attenzione però: i 24 casi sono materiale già utilizzato e la classificazione è retrospettiva. Il dato identifica due ipotesi tecniche convincenti, non misura ancora quanto un modello vettoriale le risolverebbe.

Cosa penso della proposta di Claude

Claude suggerisce di procedere prima con la classificazione delle situazioni in tipi, e soltanto dopo valutare un piccolo modello locale di embeddings.

Capisco il ragionamento: vuole evitare di introdurre nuove dipendenze prima che siano necessarie.

Io però non imposterei più la vettorializzazione come ultima possibilità, dopo l’ennesimo tentativo basato su parole e classificazioni.

Per tre motivi.

1. Abbiamo già accumulato abbastanza risultati negativi dai confronti lessicali. Continuare ad aggiungere regole senza un confronto serio con il recupero semantico rischia di consumare altri incrementi senza sapere se esista una soluzione migliore.

2. La somiglianza distribuzionale sperimentata in G1b non è equivalente a un moderno modello di sentence embeddings. Claude ha utilizzato PPMI, cioè associazioni statistiche ricavate dalle parole presenti nei pacchetti. Questo è un approccio vettoriale elementare, ma il suo fallimento non dimostra che un modello semantico preaddestrato, piccolo e locale, non possa riconoscere parafrasi molto meglio.

3. I tipi di situazione restano utili anche con i vettori. Non sono due alternative esclusive. Un tipo scientifico come excessive indoor humidity può collegare diverse espressioni quotidiane, mentre un embedding può aiutare a riconoscere formulazioni linguistiche mai incontrate.

Come procederei

Per il prossimo esperimento confronterei:

Metodo	Cosa verifica
A — Situazioni scientifiche tipizzate	Se una struttura semantica esplicita migliora l’attribuzione
B — Embeddings locali	Se la similarità semantica recupera parafrasi sconosciute
A+B — Recupero ibrido	Se i due approcci si rafforzano reciprocamente
A+B con verifica delle relazioni	Se possiamo recuperare più conoscenza senza aumentare le strategie inventate

Non farei acquistare servizi, non imporrei un database vettoriale esterno e non modificherei ancora lo store operativo.

Per le 926 situazioni rappresentate, un primo indice vettoriale sperimentale potrebbe anche essere piccolo e ricostruibile. L’obiettivo iniziale sarebbe dimostrare la qualità del recupero, non costruire subito un’infrastruttura definitiva.

E vettorializzerei unità di conoscenza con significato definito — bisogni, situazioni, strategie e dichiarazioni scientifiche — mantenendo riferimenti alle fonti, condizioni e stato di validazione. Non semplicemente migliaia di pagine di testo indistinto.

Una cautela sulla conclusione di Claude

Nel rapporto si legge che il collo di bottiglia non è più la conoscenza o la sua rappresentazione.

Questa conclusione mi sembra troppo definitiva.

Sappiamo che abbiamo rappresentato 926 situazioni e recuperato alcuni collegamenti. Ma sappiamo anche che N1 non aveva raggiunto le soglie di accuratezza semantica: alcuni ruoli o collegamenti possono quindi essere sbagliati o incompleti.

Un algoritmo vettoriale perfetto non risolverebbe gli errori contenuti nella conoscenza che indicizza.

Per questo l’esperimento dovrebbe separare accuratezza del recupero, correttezza scientifica dei collegamenti recuperati e decisione finale sulle strategie.

Sono tre capacità distinte.

La mia conclusione

G1b non è stato uno spreco. Ci ha fornito una struttura di conoscenza bidirezionale e ha identificato un punto preciso sul quale sperimentare.

Ma ritengo che ora sia opportuno portare la vettorializzazione al centro della prossima valutazione architetturale, insieme alle situazioni scientifiche tipizzate.

Non dobbiamo decidere anticipatamente che gli embeddings vinceranno. Dobbiamo finalmente confrontarli in maniera rigorosa con i metodi attuali e verificare se il miglioramento generalizza.

E non dimenticherei i residui operativi: PEE continua a perdere 10 limiti dichiarati su 32 nel precedente campione G1. La comprensione degli obiettivi non può dirsi risolta mentre informazioni esplicite dell’utente vengono ancora perse.

Non invierei a Claude una correzione frammentaria del vecchio incarico, che è ormai concluso. Il prossimo prompt dovrà essere uno solo, consolidato, e includere sia il requisito permanente di conoscenza per bisogni e categorie sia un confronto sperimentale esplicito della vettorializzazione.

Il principio che terrei fermo è questo: la conoscenza scientifica di PEE deve essere strutturata per poter ragionare, indicizzata semanticamente per poter essere trovata e verificata attraverso le fonti per poter essere utilizzata nelle decisioni.
