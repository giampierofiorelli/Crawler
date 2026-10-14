# Product Evidence Engine — PASSAGGIO ALLA NUOVA CHAT
**Data:** 12 ottobre 2026. **Stato:** fase 172 IN SVILUPPO, non rilasciata. Ultima release cumulativa completata: **v4.95, fase 171**.

## Come riprendere senza perdere lavoro
Questo pacchetto contiene l'ultima release PEE completa, il codice nuovo della fase 172 in un *overlay* separato, i materiali di ricerca recenti, il documento tecnico della fase 171, e i resoconti dei test effettuati. I file originali della release non devono essere sovrascritti alla cieca.

1. Apri ed esamina `base/product-evidence-engine-v4.95-phase171.zip` (sorgenti cumulativi, studi, licenze e manifest fino alla fase 171).
2. Applica gli otto file in `phase172-WIP-overlay/` dentro la cartella radice estratta di v4.95, mantenendo le loro sottocartelle. Non includere i log in produzione.
3. Leggi entrambi i file in `research/` e `continuity/`. Non considerare documentato o implementato ciò che i report presentano solo come ricerca e proposta.
4. Ispeziona il codice nuovo in `src/phase172_goal_suitability_guide.ts`, i relativi test e i precedenti moduli `phase164`, `phase165`, `phase166`, `phase167`, `phase168`, `phase169`, `phase170`, `phase171`.
5. Ricomincia **dalla fase 172 già avviata**, completando la validazione e l'integrazione prima di generare una release cumulativa successiva.

## Scopo e differenziazione del prodotto (vincolante)
PEE è un consulente tecnico indipendente specializzato nella scelta dei prodotti. **Non è un comparatore di stelle o un chatbot persuasivo.** La sua competenza centrale è tradurre obiettivi quotidiani espressi in linguaggio naturale, anche confusi o senza specifiche, in requisiti scientificamente motivati, criteri prestazionali e condizioni di idoneità; considerare anche soluzioni appartenenti a categorie differenti quando l'utente non vincola la categoria; distinguere ciò che un prodotto può fare, ciò che fa bene e ciò che **non può fare per l'utente**, inclusi incompatibilità decisive non compensabili da altri pregi.

Agire come un eccellente consulente di negozio: la persona non deve conoscere le caratteristiche tecniche. Fare poche domande legate all'uso e ad alto valore informativo, soltanto quando risposte differenti cambiano davvero fattibilità, opzioni o ranking. Non stereotipare utenti single, principianti, anziani o famiglie; ragionare sulle reali situazioni d'uso. Investigare sistematicamente le richieste spontanee pubblicate online e la letteratura di esperti. **Non chiedere al proprietario del progetto di reclutare o testare utenti reali**: lavorare con corpora e casi pubblicati e con verifiche tecniche riproducibili, senza inventare rappresentatività o tassi di accuratezza.

Tradurre: `richiesta colloquiale -> obiettivo -> contesto -> meccanismi e limitazioni -> parametri misurabili -> protocolli di test -> evidenze indipendenti e loro qualità -> compatibilità/veti/incertezze -> ranking personalizzato deterministico -> spiegazione comprensibile`. I collegamenti causali fra bisogni e prestazioni devono essere verificati da fonti ingegneristiche, non dichiarati veri perché ricorrono in un forum. Confrontare criticamente recensioni professionali originarie, variante, indipendenza della fonte, metodi e condizioni; non usare solo opinioni consumer, giudizi del produttore o concordanza di fonti duplicate. Conservare provenienza e versioni. Non trasformare mancanza di prova in prova di incompatibilità.

**Ranking:** con medesima intenzione verificata, vincoli, preferenze, contesto, insieme di prodotti, snapshot di prove e politica di ranking, la classifica completa e le spiegazioni devono essere identiche, anche con parafrasi diverse. È legittimo cambiare classifica se cambiano le esigenze. Esclusioni definitive soltanto per veti realmente dimostrati; i compromessi ponderabili vanno distinti dai veti e dall'insufficienza delle prove. L'apprendimento è una coda di nuove ipotesi e relazioni sottoposte a verifica/versionamento, mai alterazione automatica silenziosa del database scientifico o dei ranking.

**Comunicazione:** prima informazioni corte, comprensibili e davvero rilevanti, con dettaglio opzionale. Verificare anziché assumere la bontà universale della progressive disclosure; non nascondere compromessi, esclusioni decisive o incertezze che potrebbero cambiare la decisione. Accompagnare l'utente quando cambia obiettivo o famiglia di prodotto, spiegando *quali criteri* cambiano. Non dichiarare una nuova classifica se non è stata ricalcolata sulle prove.

## Ambito già coperto / da studiare
Priorità English-first. Categorie pilota: friggitrici ad aria, macchine da caffè, aspirapolvere, lavatrici, frigoriferi. Backlog anche friggitrici tradizionali, tostapane, vaporiere e altri prodotti. Ricerca per usi/contesti reali, non soltanto personas anagrafiche.

Sorgenti GitHub consegnati in passato come **materiale di studio**: GLiNER2, DeepKE, medSpaCy, Snorkel, OA-Mine, Ditto, extruct, PyABSA, WDC Products, ExtractGPT, WDC PAVE, MAVE, Microsoft Recognizers-Text, NLP.js, wink-nlp. Le parti adottate si trovano nella release cumulativa. Non imporre automaticamente nuove dipendenze/servizi costosi, pesi neurali o copie integrali dei repository; verificare prima licenze, vantaggi, peso, sicurezza e costi di manutenzione. I file ZIP completi dei repository esterni NON sono in questo piccolo pacchetto, perché non sono necessari per riprendere la fase 172; richiederli solo se bisogna riesaminare il sorgente originale non già integrato.

## Stato verificato del lavoro della fase 172 al momento del passaggio
- Nuovo codice `src/phase172_goal_suitability_guide.ts`: ipotesi tecniche per l'uso (NON verità scientifiche certificate), domande selettive, ricerca di soluzione, comunicazione sintetica read-only; nessun ranking o esclusione autonomamente autorizzati.
- Nuovi test `tests/phase172_goal_suitability_guide.test.ts` e demo/script per regression. Cinque categorie supportate come esempi, compresi casi con categoria sconosciuta e scelta successivamente ristretta dall'utente.
- Diagnostica `evaluation/phase172/public_usage_diagnostic.json` ricavata da brevi **parafrasi di richieste pubblicate**, non corpus di utenti reale indipendentemente annotato. Le URL sono indizi di esigenze, non evidenza tecnica o veridicità sui prodotti.
- Registro TypeScript `evaluation/phase172/regression-ts.json`: 2.291 test passati, 131 file eleggibili, 12 gruppi, esclusi suite storiche Phase91/92. Esecuzioni in due gruppi dopo una regressione bloccata includendo suite escluse.
- Registro Python `evaluation/phase172/regression-python.json`: 26 + 21 + 12 + 47 + 35 + 71 = 212 test superati separatamente in sei comandi. Un comando ha emesso ResourceWarning per connessioni SQLite non chiuse; non trasformare il superamento in certificazione di assenza di problemi.
- Nessun modello neurale GLiNER2.5 eseguito in questa fase: pesi e ambiente persistente non disponibili. GLiNER neurale già provato nel precedente esperimento Colab limitato, ma senza benchmark rappresentativo.
- **Non è stato ancora creato un rilascio cumulativo fase 172**: questi sono file WIP preservati per non perderli nel passaggio.

## Come proseguire
1. Rileggere tutto il codice e i report inclusi, soprattutto le relazioni bisogno -> prestazione da verificare scientificamente.
2. Audit qualitativo avversario dei casi: chi non sa specificare la categoria, cambiare soluzione, riconoscere obiettivi impliciti, domande scelte solo se utili, veti di fattibilità, mancanza evidenza e vincoli di categoria.
3. Collegare con cautela la nuova logica `phase172_goal_suitability_guide` ai moduli conversazionali e di evidenza esistenti; non scrivere un secondo motore incompatibile.
4. Rafforzare la mappa competenze di categoria e documentare i fondamenti ingegneristici di ogni inferenza; priorità alla qualità decisoria reale, non aggiungere strati di controllo solo per incrementare il numero di fasi.
5. Definire la presentazione breve + approfondimento con protezione immediata di veti/incertezze determinanti. Nessun linguaggio di eccessiva certezza.
6. Ripetere i test dopo le modifiche, non vantare risultati non misurati, produrre un **nuovo ZIP cumulativo** che conservi la v4.95 e un rapporto documentato con fonti URL.

## Vincoli operativi
L'utente usa soprattutto iPhone e non ha ancora un computer disponibile per test neurali persistenti: NON chiedere piccoli esperimenti Colab uno per volta, né confondere questo limite con uno stop allo sviluppo delle altre componenti. Preparare codice/bench locali verificabili, rimandando i test neurali su vasta scala alla disponibilità di un computer e runtime autorizzato. Non promettere accesso diretto al computer da questa chat; quando necessario discutere degli strumenti desktop disponibili, chiedendo autorizzazioni esplicite.

### Primo messaggio consigliato
«Continua il Product Evidence Engine dalla fase 172 IN CORSO usando il pacchetto allegato. Leggi `CONTINUE-IN-NEW-CHAT.md` e usa integralmente `base/product-evidence-engine-v4.95-phase171.zip`, gli otto file `phase172-WIP-overlay/`, i due report di ricerca in `research/` e il materiale di continuità. NON ripartire da zero, non dichiarare completata la fase 172, non fermarti sui test neurali che richiedono il mio computer. Verifica il codice già scritto, correggi i limiti, approfondisci le competenze ingegneristiche e procedi con l'integrazione bisogno→prestazioni→idoneità→classifica verificata→spiegazione breve/approfondibile, preservando tutte le evidenze e i test.»
