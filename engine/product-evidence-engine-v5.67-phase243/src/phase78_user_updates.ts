/** Phase 78 — truthful, demand-specific customer progress, derived only from verified records. */
import type {ProgressView} from './phase77_progress_ledger.js';
import type {ResearchAdequacy} from './phase78_search_adequacy.js';
export type PublicUpdateKind='registered'|'researching'|'research_paused'|'checking'|'complete';
export interface CustomerResearchUpdate {
 kind:PublicUpdateKind;title:string;body:string;thanks:string;
 /** A scheduled check is not a completion ETA. */
 nextCheckAt:string|null;
 verifiedOptionCount:number|null;
 optionCards:{presentation:'verified_options_not_ranking';productIds:string[]}|null;
 isRanking:false;isMarketExhaustiveClaim:false;
}
/** Stateless copy: no inferred progress, fabricated estimates or implicit publication. */
export function customerResearchUpdate(
 progress:ProgressView,coverage:ResearchAdequacy|null,sharedKnowledgeEnabled=false
):CustomerResearchUpdate {
 const kind:PublicUpdateKind=progress.status==='ready'?'complete':
  progress.status==='blocked'?'research_paused':
  progress.status==='awaiting_independent_review'?'checking':
  progress.status==='working'?'researching':'registered';
 const title={registered:'Abbiamo registrato la tua ricerca',
 researching:'Stiamo lavorando per te',research_paused:'La ricerca richiede un altro controllo',
 checking:'Stiamo verificando le informazioni raccolte',complete:'La tua ricerca è pronta'}[kind];
 const intro={registered:'La richiesta è stata registrata. Le attività di ricerca non sono ancora iniziate.',
 researching:'Stiamo approfondendo le soluzioni che potrebbero rispondere alle tue esigenze.',
 research_paused:'Per il momento la ricerca è in pausa: mancano informazioni o verifiche necessarie.',
 checking:'Abbiamo completato alcune verifiche e il risultato attende un controllo indipendente.',
 complete:'La valutazione è stata verificata ed è disponibile.'}[kind];
 const exploration=(kind==='registered'||kind==='research_paused'||kind==='complete')?'':
 coverage===null||coverage.searchAdequacy==='coverage_not_established'?
  'Non sappiamo ancora se le soluzioni già individuate rappresentino adeguatamente le alternative disponibili.':
 coverage.verifiedSelection==='one'?
  'La ricerca documentata ha individuato una soluzione verificata rispetto ai tuoi vincoli. Non significa che sia l’unica sul mercato.':
 coverage.verifiedSelection==='none'?
  'Nell’insieme di alternative finora esaminate non è stata ancora verificata una soluzione che soddisfi tutti i tuoi vincoli.':
  'Abbiamo verificato più soluzioni rispetto ai tuoi vincoli. La ricerca documentata non equivale a un censimento di tutto il mercato.';
 const thanks=sharedKnowledgeEnabled?
  'Grazie: la tua domanda ci aiuta a individuare nuove esigenze. Le conoscenze verificate potranno migliorare anche le risposte per altre persone.':
  'Grazie: la tua domanda ci aiuta a capire quali esigenze meritano ulteriori approfondimenti.';
 const cards=coverage?.publishableUnrankedProductIds.length&&kind!=='complete'&&kind!=='registered'&&kind!=='research_paused'?
  {presentation:'verified_options_not_ranking' as const,productIds:coverage.publishableUnrankedProductIds}:null;
 return {kind,title,body:[intro,exploration].filter(Boolean).join(' '),thanks,
  nextCheckAt:progress.nextScheduledCheckAt,verifiedOptionCount:coverage?.verifiedOptionCount??null,
  optionCards:cards,isRanking:false,isMarketExhaustiveClaim:false};
}
