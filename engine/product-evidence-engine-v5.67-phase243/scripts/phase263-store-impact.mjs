#!/usr/bin/env node
/** Phase263 — real-store impact of the retention and gate changes, measured on a COPY of the verified snapshot (outside
 * Git; the live store is not opened). Counts only: no values, URLs or names.
 *  - observed vs retained declarations by source type and retention class;
 *  - the open rights gaps and what the corrected reconciliation closes (on the copy);
 *  - per-operation gate distribution for all sources under the real research policy.
 * Usage: node scripts/phase263-store-impact.mjs [--out FILE]
 */
import {writeFileSync,copyFileSync,mkdirSync,rmSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {loadResearchPolicy257} from '../dist/src/phase257_research_planning.js';
import {operationGates263} from '../dist/src/phase263_operation_gates.js';
const out=process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:null;
const dir=join(homedir(),'.local','share','product-evidence-engine','arms263');mkdirSync(dir,{recursive:true});
const dbf=join(dir,'real-copy.sqlite');for(const x of ['','-wal','-shm'])rmSync(dbf+x,{force:true});
copyFileSync('/home/user/pee-knowledge/snapshot/pee246.sqlite',dbf);
const asOf=new Date().toISOString();
const policy=loadResearchPolicy257(process.env.PEE_RESEARCH_POLICY??join(homedir(),'.local','share','product-evidence-engine','research-policy','research-policy.json'),new Date());
const s=new KnowledgeStore246(dbf);
const q=sql=>s.db.prepare(sql).all().map(r=>({...r}));
const retention=q('SELECT s.source_type sourceType,r.retention,COUNT(*) revisions,SUM(r.declarations_seen) observed,SUM(r.declarations_retained) retained FROM revisions r JOIN sources s USING(source_id) GROUP BY 1,2 ORDER BY 1,2');
const openRights=()=>s.db.prepare("SELECT COUNT(*) n FROM research_gaps WHERE kind='declarations_not_retained_rights' AND resolved_at IS NULL").get().n;
const before=openRights();const closed=s.reconcileRetentionGaps249(asOf);const after=openRights();
const reasons=q("SELECT payload_json FROM events WHERE kind='gap_reclassified'").map(e=>JSON.parse(e.payload_json).reason);
const gates={};
for(const {source_id} of q('SELECT source_id FROM sources ORDER BY source_id')){
 const g=operationGates263(s,source_id,{asOf,researchPolicy:policy});
 for(const k of ['discovery','access','temporaryInterpretation','structuredRetention','originalAnalysis','publication']){gates[k]??={};gates[k][g[k].status]=(gates[k][g[k].status]??0)+1;}
}
const result={schema:'pee263.store-impact.v1',runAt:asOf,input:'copy of pee-knowledge snapshot (outside Git); live store not opened',
 retention,totals:{observed:retention.reduce((a,r)=>a+r.observed,0),retained:retention.reduce((a,r)=>a+r.retained,0)},
 rightsGaps:{openBefore:before,closedByCorrectedReconciliation:closed,openAfter:after,reasons},
 gates,sources:q('SELECT COUNT(*) n FROM sources')[0].n,journalOk:s.verifyJournal().ok,
 note:'Historical counts describe what was observed under past extractors; they are not proof of what original pages contained.'};
s.close();
const text=JSON.stringify(result,null,1)+'\n';if(out)writeFileSync(out,text);process.stdout.write(text);
