# Product Evidence Engine — confronto dei motori open source

**Data della revisione:** 13 ottobre 2026  
**Stato:** revisione tecnica dei sorgenti; **nessuna nuova fase o release PEE**, nessuna integrazione installata, nessuna ricerca live effettuata dal PEE.  
**Base PEE:** `product-evidence-engine-v5.44-phase220-FULL.zip` e rapporto precedente `PEE-SEARXNG-SOURCE-REVIEW-2026-10-13.md`.  
**Archivi aggiunti dall'utente:** `4get-master.zip`, `crawlee-master.zip`, `yacy_search_server-master.zip`.

## 1. Decisione

**Non adottare immediatamente nessuna libreria o servizio.** Per il primo collo di bottiglia del PEE, la scelta architetturale più ragionevole *da verificare empiricamente* resta **SearXNG come fornitore opzionale e isolato di URL candidati**. Ha già un'API JSON, interrogazione di più motori e aggregazione/deduplicazione dei risultati; non sostituisce il sistema PEE che acquisisce e valuta prove.

**Crawlee è il progetto da cui apprendere più codice applicabile**, ma per un problema distinto: gestione affidabile di code HTTP, retry, persistenza e, quando assolutamente indispensabile, rendering browser. Il PEE dispone già di un lettore HTTPS vincolato a policy e di un worker iniziale: non conviene sostituirli ciecamente con Crawlee. Una eventuale prova di integrazione deve riguardare una lacuna dimostrata (per esempio pagine lecite che non espongono informazioni senza rendering), non il solo fatto che il progetto esiste.

**4get** è un'alternativa plausibile a SearXNG da tenere nel benchmark, non un miglioramento già dimostrato. La sua API seleziona un singolo scraper/motore per richiesta; l'aggregazione tra motori richiederebbe orchestration a livello PEE. Necessita di un servizio PHP e ha una licenza AGPL-3.0-only.

**YaCy** è il candidato più indipendente *come infrastruttura di indicizzazione*, perché ha crawler e indice propri, ma richiede Java, indicizzazione e/o peer network. La copertura corrente di modelli nuovi e recensioni professionali non è stata verificata: un indice autonomo piccolo potrebbe essere peggiore di un metasearch per lo scopo PEE. Non è il primo componente da integrare.

**Decisione temporanea:** terminare la *vertical slice* di discovery sul PEE (source-discovery gateway + policy + source receipts + valutazione + stop); confrontare SearXNG e 4get su stesso insieme di query e fonti autorizzate **solo in un ambiente con rete funzionante**. Tenere Crawlee come eventuale implementazione del solo worker di pagine dinamiche; YaCy nel backlog, salvo prova che l'indicizzazione dedicata di fonti autorizzate dia reale valore aggiunto.

## 2. Componenti esistenti: non duplicarli

Dall'archivio PEE v5.44:

- `src/phase220_autonomous_discovery_worker.ts` interpreta richieste inglesi tramite vocabolario/slot registrati e attiva il percorso limitato alle sitemap delle fonti configurate; restituisce esplicitamente `rankingAuthorized: false`, `independentEvidenceVerified: false`. **Non ha una ricerca web generalista.**
- `src/phase82_market_watch.ts` pianifica fonti, host budget e controllo dei segnali; non è un motore di ricerca pubblico.
- `src/phase75_source_discovery.ts` acquisisce URL candidati da sitemap approvate; non certifica prodotti, varianti o evidenze.
- `src/approved_web_reader.ts` applica gate separati per policy, robots e accesso HTTPS e rifiuta destinazioni private. Non aprirlo a localhost per collegare un servizio di ricerca: usare un *client interno distinto*, verso un solo endpoint amministrativamente configurato.
- `src/phase182_gap_research_orchestrator.ts` gestisce ricerca su lacune e percorsi autorizzati, con output ancora `rankingAuthorized: false`.

La ricerca web manuale dell'assistente non è un test della capacità del software.

## 3. Matrice ingegneristica

| Dimensione | SearXNG | 4get | Crawlee | YaCy |
|---|---|---|---|---|
| Funzione prevalente | Metaricerca / discovery | Proxy-metasearch / discovery | Crawling HTTP e browser automation | Crawler + indice di ricerca proprio |
| Interfaccia verificata nel sorgente | `/search` con `format=json` *se abilitato* | `/api/v1/web`, news, video ecc. JSON | API libreria Node/TS | `yacysearch.json`, RSS, API web |
| Risultati da vari motori nella stessa interrogazione | Aggregazione nella ricerca SearXNG | Scraper selezionato per richiesta; eventuale confronto esterno | Non nativo: necessita URL iniziali | Interroga indice locale e, per configurazione, peer |
| Trova da sé il web intero? | Dipende da motori esterni | Dipende da motori esterni | No indice generale; segue seed/URL/link | Può costruire proprio indice, ma la copertura non è garantita |
| Tecnologia richiesta | Servizio Python | Servizio PHP; nel Dockerfile Apache/PHP 8.4 e curl-impersonate | Moduli Node; browser opzionali | Applicazione Java, indice/risorse associate |
| Licenza individuata nel pacchetto | AGPL-3.0-or-later | AGPL-3.0-only | Apache-2.0 (`packages/core/package.json`, LICENSE.md) | GPL-2.0-or-later (parte del sorgente), LGPL per sottopacchetti secondo `COPYRIGHT` |
| Riutilizzo immediato più plausibile | Discovery URL come servizio separato | Challenger nel benchmark discovery | Pattern di affidabilità, poi eventuale worker dinamico | Eventuale indice interno dedicato |
| Può valutare originalità, prova scientifica, variante esatta e ranking PEE? | No | No | No | No |
| Evidenza di risultati live in questo ambiente | Nessuna | Nessuna | Nessuna | Nessuna |

**Non interpreto le memorie RAM indicate nel README di 4get come benchmark indipendenti.** I numeri pubblicizzati non sono una misura riproducibile del carico PEE.

### SearXNG

Verificati nel precedente rapporto fornito: `searx/search/__init__.py`, `searx/search/processors/online.py`, `searx/results.py`, `searx/webapp.py`, `searx/settings.yml`, `docs/dev/search_api.rst`. Interroga motori, registra indisponibilità, accorpa risultati e può fornire JSON dopo configurazione esplicita. **Score di SERP ≠ score qualità prodotto.** Captcha/429 e differenze di copertura rimangono.

Documentazione ufficiale: https://docs.searxng.org/dev/search_api.html ; https://docs.searxng.org/admin/settings/settings_search.html ; sorgenti https://github.com/searxng/searxng

### 4get

Archivi verificati: `4get/api.txt`, `4get/web.php`, `4get/lib/frontend.php` (`getscraperfilters`), `4get/settings.php`, `4get/lib/curlproxy.php`, `4get/Dockerfile`, `4get/license.txt`.

- `api.txt` documenta endpoint JSON web, news, immagini, video e musica, status applicativo e paginazione. Avverte che **l'API dell'istanza pubblica non è destinata a scraping intensivo o interrogazioni non avviate da un umano**; consiglia l'autohosting per usi diversi. Questo non autorizza automaticamente accessi ai motori sottostanti.
- `lib/frontend.php` sceglie il motore mediante parametro `scraper`/cookie/token e `web.php` esegue `$scraper->web($get)`. Quindi una richiesta 4get non equivale alla fusione contemporanea dei risultati di tutti i motori. In PEE andrebbero programmate query separate, gestiti duplicati ed errori per motore.
- `Dockerfile` usa componenti curl-impersonate. Le possibilità tecniche di impersonazione non autorizzano bypass di restrizioni; il PEE non deve incorporare pratiche di elusione.
- API propria ≠ licenza sui testi e snippet di terzi. Va mantenuta la verifica di origine e dei diritti per ogni URL.

Codice e documentazione: https://git.lolcat.ca/lolcat/4get ; https://git.lolcat.ca/lolcat/4get/src/branch/master/api.txt

### Crawlee

Archivi verificati: `packages/basic-crawler/src/internals/basic-crawler.ts`, `packages/core/src/storages/request-queue.ts`, `packages/http-crawler/src/internals/http-crawler.ts`, `packages/playwright-crawler/src/internals/playwright-crawler.ts`, `packages/utils/src/internals/robots.ts`, manifest di pacchetto.

- Dispone di `RequestQueue`, retry, limiti di profondità/numero di richieste, concorrenza, autoscaling, trasporto HTTP e browser Playwright; sono capacità concrete nel codice. Non offre un indice web da cui far emergere spontaneamente recensioni e modelli sconosciuti.
- **Controllo necessario:** nel codice della versione caricata `respectRobotsTxtFile` ha default `false`; `retryOnBlocked` ha default `false`; `sameDomainDelaySecs` ha default `0`. Per il PEE robots, permessi/licenze, limiti host, DNS/IP e redirect devono essere verificati e applicati dall'infrastruttura sicura. Abilitare la sola opzione robots non sostituisce i diritti di acquisizione.
- Il contenuto caricato presenta `@crawlee/core` **4.0.0** e richiede `node >=22.13.0`, mentre alla consultazione la pagina release GitHub mostrava `v3.18.1` come ultima release stabile e `v4.0.0-rc.0` come prerelease. **Non adottare il branch `master` come versione di produzione** senza tag/release/versione e benchmark documentati.
- Evitare browser, proxy, fingerprinting e bypass di protezioni quando non necessari o non autorizzati. Il costo di Chrome/Playwright è distinto dal peso del pacchetto e va misurato.

Documentazione: https://crawlee.dev/js/api/basic-crawler/interface/BasicCrawlerOptions ; https://github.com/apify/crawlee ; https://github.com/apify/crawlee/releases

### YaCy

Archivi verificati: `README.md`, `COPYRIGHT`, `source/net/yacy/htroot/yacysearch.java`, `htroot/yacysearch.json`, `source/net/yacy/search/query/SearchEvent.java`, `source/net/yacy/crawler/CrawlSwitchboard.java`, `defaults/yacy.init`.

- Integra crawler, scheduler, indicizzazione e interrogazione; il template `htroot/yacysearch.json` e la logica HTTP `yacysearch.java` supportano risultati in formato strutturato.
- Per impostazione descritta nel README, può partecipare alla rete peer-to-peer; configurazioni alternative limitano la ricerca all'indice locale. L'indice peer non è garanzia di copertura, freschezza, autorizzazione ad acquisire contenuti o identità dei prodotti.
- Richiede Java 17+ e Ant per la compilazione da sorgente; i componenti di indicizzazione aumentano l'onere operativo rispetto a una discovery gateway che chiama un servizio metasearch. Potrebbe essere utile come indice secondario di un corpus **autorizzato e circoscritto**, ma PEE ha già meccanismi di custodia/versione che non vanno duplicati.

Repository: https://github.com/yacy/yacy_search_server ; guida https://yacy.net/download_installation/

## 4. Sicurezza, indipendenza e diritti: requisiti non delegabili

Il percorso da costruire è:

```text
Richiesta naturale in inglese
  -> intento canonico / chiarimenti ad alto valore
  -> valutazione sufficienza e obsolescenza delle prove in memoria
  -> se necessario: query di ricerca limitate e tracciate
  -> gateway interno di discovery (SearXNG / challenger 4get / fonti approvate)
  -> URL candidati NON attendibili (URL, query, ora, engine, errori)
  -> PEE policy su accesso, host, IP/DNS, robots, termini e licenza
  -> fetch HTTPS autorizzato, custodia byte/hash/versione, eventuale rendering controllato
  -> identificazione fonte, autore, originale, test e variante/mercato
  -> estrazione di claim con metodo/protocollo, screening e conflitti
  -> sufficienza oppure astensione, ranking deterministico e motivazioni
```

Un servizio di ricerca self-hosted su `localhost` o rete privata necessita **un canale di comunicazione interno apposito**: non allargare l'accesso locale del `approved_web_reader`. Il gateway dovrebbe accettare un endpoint fisso da configurazione dell'operatore, tempo e dimensione limitati, credenziali non incluse nelle URL, schema strettamente validato, audit di query, motori realmente interrogati, rate limit e no esecuzione di codice restituito dai risultati.

I risultati SERP possono soltanto suggerire URL. Non attribuire ai prodotti valutazioni sulla base della posizione, delle recensioni generiche, delle stelle Amazon o degli snippet. Una pagina sponsorizzata/PR non diventa test indipendente tramite un motore di ricerca; i duplicati dello stesso test originale rimangono un'opera sola. Trustpilot mantiene il default-deny già stabilito, in assenza di permessi utilizzabili.

I controlli su URL secondari, risorse e redirect di browser automatizzati sono particolarmente delicati: autorizzare la *prima* pagina non equivale ad autorizzare ogni richiesta di un browser. Se questa garanzia non è implementabile, usare HTTP documentato oppure astenersi.

## 5. Verifiche effettuate in questa sessione

| Controllo | Risultato | Valore probatorio |
|---|---|---|
| Lettura dei quattro archivi di terze parti e della base PEE | Riuscita | Verifica sorgenti/configurazioni, non operatività end-to-end |
| `php -l` di **73 file PHP** contenuti in 4get, usando PHP 8.4.24 | **73/73 superati** | Solo sintassi, non esecuzione di scraping o qualità delle risposte |
| Java disponibile (OpenJDK 21), Node disponibile (22.16), PHP disponibile (8.4), Ant disponibile | Verificato | Prerequisiti parziali, non dipendenze Java/Node installate |
| Docker, pnpm | Non disponibili | Non avviate le installazioni dei servizi e i test applicativi completi |
| DNS del container verso `github.com` e `www.gov.uk` | Entrambi `Temporary failure in name resolution` | Nessun accesso live dei programmi esaminati |
| Esecuzione SearXNG / 4get / Crawlee / YaCy su query reali | **Non effettuata** | Nessuna prova su precisione, copertura, velocità, tasso di fallimento |
| Esecuzione di test PEE v5.44 in questa revisione | **Non effettuata** | Nessun nuovo pass di regressione dichiarato |

Questo non consente un punteggio quantitativo credibile per copertura, recall, tempi o costi. Gli ZIP sono snapshot di branch e non portano metadata `.git`: non attribuire commit SHA non verificati.

### Impronte degli archivi ricevuti

```text
4get-master.zip                            a6f5401ca57d2ba1a248e674643f23b519c2122050e6987c4093e39f049ad795
crawlee-master.zip                         4d25c0bdfc5a7a119ee4b4e74bf8d299be69225f518291e640c7db6ac2228dc2
yacy_search_server-master.zip              1ac59b9357aba8bcd45119835ebf802fcbcac8f62c20632d9eb5dbb330cd2105
searxng-master.zip                         fcca81473bbb74277e24799e0ac76342b01488a8185a6e0305d0685ef132d64e
product-evidence-engine-v5.44-phase220-FULL.zip a952c54c52351e4496c2e62d3eafe0568417ad209e4a545d6d734184f21ae91c
```

## 6. Cosa fare dopo, senza altre fasi fittizie

1. **Non scaricare altri repository.** Abbiamo già alternative sufficienti da confrontare per due lavori diversi: scoprire URL e leggere le pagine. Più codice sorgente non sblocca il DNS del runtime e non dimostra l'adeguatezza delle prove.
2. Predisporre **un ambiente di esecuzione reale autorizzato con DNS/HTTPS**. Per un pilot senza vendor a pagamento: un servizio SearXNG controllato, JSON abilitato, motori scelti e limitati; opzionalmente 4get autogestito soltanto come challenger. Mai usare l'API pubblica 4get per monitoraggio automatizzato contrario alle sue condizioni.
3. Per **scarpe da calcio** e **cestini differenziata**, costruire un benchmark con input inglesi/parafrasi, query eseguite e ground truth annotata delle URL pertinenti, test indipendenti originali, varianti e vincoli discriminanti. Lo stesso insieme di domande deve alimentare i due gateway; misurare precisione URL, recall sulle fonti note, duplicati, rumor PR, errori, CAPTCHA, tempi, costo, frequenza di stop e riproducibilità.
4. Collegare il vincitore come **provider facoltativo**, lasciando intatti Phase68–69, 75, 82, 193+, 219, 220. Nessun passaggio da URL a ranking prima della verifica di provenienza/metodo/variante e della sufficienza delle prove. Usare Crawlee solo se un test dimostra che le acquisizioni autorizzate di PEE richiedono realmente una coda/browser aggiuntiva.
5. Una release 221 avrà senso soltanto se avrà eseguito almeno una parte nuova del percorso con prove riproducibili, idealmente un'acquisizione live autorizzata. Se l'ambiente non ha rete, registrare il blocco invece di produrre altri adapter astratti.

**Valutazione finale:** per PEE l'architettura plausibile non è *"scegliere il miglior crawler"*. È un gateway di discovery sostituibile + acquisizione conforme + valutazione delle prove nel PEE. **SearXNG è il primo candidato di discovery da testare; Crawlee è la libreria tecnica da tenere pronta per esigenze comprovate.** Non è stata dimostrata una superiorità quantitativa di nessuno dei quattro sui casi reali.
