#!/usr/bin/env node
/** Phase265 — reproducible persistence evaluation of publisher-reported test measurements (scenarios frozen in
 * evaluation/phase265/scenarios.json before the implementation; synthetic fixtures only, tier T1).
 * Path exercised, through the operational CLIs and nothing else:
 *   fixture HTML (a scratch raw dir) → scripts/phase246-live-wave.mjs observations (Phase245 + Phase225/226/227 probe)
 *   → scripts/phase246-knowledge.mjs ingest-observations (Phase246 store, Phase249 class or default-deny policy)
 *   → process exit (store closed) → reopen here → read → close → reopen → read again.
 * Stores live in a fresh directory outside Git; the real knowledge store is never opened. No network.
 * Usage: node scripts/phase265-persistence-eval.mjs [--out FILE]   (default evaluation/phase265/persistence-firstrun.json)
 */
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {candidatesFromStore249} from '../dist/src/phase249_decision.js';

const out=process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:'evaluation/phase265/persistence-firstrun.json';
const S=JSON.parse(readFileSync('evaluation/phase265/scenarios.json','utf8'));
const base=join(homedir(),'.local','share','product-evidence-engine','arms265');mkdirSync(base,{recursive:true});
const dir=mkdtempSync(join(base,'eval-'));const raw=join(dir,'raw');mkdirSync(raw);
const db={class:join(dir,'class.sqlite'),deny:join(dir,'deny.sqlite')};
const sha=s=>createHash('sha256').update(s).digest('hex');
const node=(args)=>execFileSync(process.execPath,['--no-warnings',...args],{encoding:'utf8',env:{...process.env,PEE_KNOWLEDGE_DIR:join(dir,'unused')}});
const byId=Object.fromEntries(S.scenarios.map(s=>[s.id,s]));
const steps=[];const t0=Date.parse('2026-10-16T09:00:00.000Z');
for(const sc of [...S.scenarios].sort((a,b)=>a.step-b.step)){
 const src=sc.repeatOf?byId[sc.repeatOf]:sc;const html=src.html;const tag='p'+sc.step;
 writeFileSync(join(raw,tag+'.html'),html);
 const state={schema:'pee246.live-wave.v1',startedAt:new Date(t0).toISOString(),budget:{maxRequests:0,maxPerHost:0,maxSeconds:0,maxBytes:0},
  requests:[],hosts:{},robots:{},leads:[],plans:[],stopReasons:[],
  pages:[{tag,url:src.url,finalUrl:src.url,redirects:0,role:'operational',category:'air_fryers',sourceType:src.sourceType,outcome:'fetched',
   httpStatus:200,contentType:'text/html',bytes:Buffer.byteLength(html),ms:0,fetchedAt:new Date(t0+sc.step*60000).toISOString(),sha256:sha(html)}]};
 const st=join(dir,tag+'.state.json'),obs=join(dir,tag+'.obs.json');writeFileSync(st,JSON.stringify(state));
 node(['scripts/phase246-live-wave.mjs','observations','--state',st,'--raw',raw,'--out',obs,'--run','phase265_eval']);
 const offered=JSON.parse(readFileSync(obs,'utf8')).filter(o=>o.observation).map(o=>o.observation.testLeads.probe.candidates.length)[0]??0;
 const ing=JSON.parse(node(['scripts/phase246-knowledge.mjs','ingest-observations','--file',obs,'--db',db[sc.db],'--storage-policy',sc.db]));
 steps.push({id:sc.id,db:sc.db,leadsExtracted:offered,result:ing.results[0]});
}
// Reopen (the CLI processes have exited), read, close, reopen, read again.
const read=f=>{const s=new KnowledgeStore246(f);try{
 const ms=s.testMeasurements265({includeSuperseded:true});
 const vx=(s.db.prepare("SELECT product_id FROM products WHERE name='Sample Maker VX100 Air Fryer'").all()).map(r=>r.product_id);
 const zx=(s.db.prepare("SELECT product_id FROM products WHERE name='Sample Maker ZX900 Air Fryer'").all()).map(r=>r.product_id);
 const conflicts=vx.flatMap(p=>s.testMeasurementConflicts265(p));
 const candidates=candidatesFromStore249(s,'air_fryers');
 const tables=s.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r=>r.name);
 const dump=tables.map(t=>JSON.stringify(s.db.prepare(`SELECT * FROM "${t}"`).all())).join('\n');
 let checkRefusals=0;
 for(const sql of ["UPDATE test_measurements265 SET ranking_authorized=1","UPDATE test_measurements265 SET independent_test_evidence=1",
  "UPDATE test_measurements265 SET scientific_evidence_admitted=1","UPDATE test_measurements265 SET independence='established'",
  "UPDATE test_measurements265 SET verification='reviewed'"]){try{s.db.exec(sql);}catch{checkRefusals++;}}
 const journal=s.verifyJournal();
 return {ms,vx,zx,conflicts,candidates,dump,checkRefusals,journal,
  events:s.db.prepare("SELECT kind,COUNT(*) AS n FROM events WHERE kind LIKE 'test_measurements%' GROUP BY kind ORDER BY kind").all()};
}finally{s.close();}};
const first={class:read(db.class),deny:read(db.deny)},second={class:read(db.class),deny:read(db.deny)};
const strip=x=>JSON.stringify(x.ms);
const reopenEqual=strip(first.class)===strip(second.class)&&strip(first.deny)===strip(second.deny);
// Attribution and promotion audit against the frozen expectations.
const C=first.class;
const rowsFor=id=>{const sc=byId[id];return [...C.ms,...first.deny.ms].filter(m=>m.source.url===sc.url&&m.source.sha256===sha(sc.html));};
const expectedProduct=m=>m.subjectAssociation==='subject_unresolved'?null:C.vx[0];
let wrongAttribution=0,wrongPromotion=0;
for(const m of [...C.ms,...first.deny.ms]){
 if((m.productId??null)!==expectedProduct(m)||(m.productId&&C.zx.includes(m.productId)))wrongAttribution++;
 const by=m.source.sourceType==='manufacturer'?'manufacturer':m.source.sourceType==='independent_original_test'?'test_publisher_operator_asserted':'other_publisher';
 if(m.reportedBy!==by||m.independence!=='not_established'||m.verification!=='unreviewed'||m.scientificEvidenceAdmitted||m.independentTestEvidence||m.rankingAuthorized||
  (m.source.sourceType==='manufacturer'&&m.evidenceRole!=='manufacturer_declaration'))wrongPromotion++;
}
// Prose: every 24-character window of every fixture paragraph, searched in every table of both stores.
const paras=S.scenarios.filter(s=>s.html).flatMap(s=>[...s.html.matchAll(/<p>([^<]+)<\/p>/g)].map(m=>m[1]));
const windows=[...new Set(paras.flatMap(p=>Array.from({length:Math.max(0,p.length-23)},(_,i)=>p.slice(i,i+24))))];
const proseHits=windows.filter(w=>first.class.dump.includes(w)||first.deny.dump.includes(w)).length;
const per=S.scenarios.map(sc=>{const st=steps.find(x=>x.id===sc.id);const tm=st.result?.testMeasurements??{};
 const rows=sc.repeatOf?[]:rowsFor(sc.id);
 return {id:sc.id,expected:sc.expect,observed:{leadsExtracted:st.leadsExtracted,persisted:tm.persisted??0,associated:tm.associated??0,unresolved:tm.unresolved??0,
  alreadyStored:tm.alreadyStored??0,withheldRights:tm.withheldRights??0,withheldReason:tm.withheldReason??null,rejected:tm.rejected??{},
  newRevision:st.result?.newRevision??null,retention:st.result?.retention??null,
  rows:rows.map(m=>({value:m.value,unit:m.unit,dimension:m.dimension,dimensionBasis:m.dimensionBasis,targetScope:m.targetScope,condition:m.condition,instrument:m.instrument,
   methodCue:m.methodCue,subjectAssociation:m.subjectAssociation,productIsPageProduct:m.productId!==null&&m.productId===C.vx[0],reportedBy:m.reportedBy,evidenceRole:m.evidenceRole,
   state:m.state,supersededByRevision:m.supersededByRevision?true:false}))}};});
const sum=k=>per.reduce((a,p)=>a+(typeof p.observed[k]==='number'?p.observed[k]:0),0);
const rejected={};for(const p of per)for(const [k,v] of Object.entries(p.observed.rejected))rejected[k]=(rejected[k]??0)+v;
const withheld={};for(const p of per)if(p.observed.withheldRights)withheld[p.observed.withheldReason]=(withheld[p.observed.withheldReason]??0)+p.observed.withheldRights;
const result={schema:'pee265.persistence-eval.v1',firstRun:true,evidenceTier:S.evidenceTier,path:S.path,
 totals:{leadsExtracted:sum('leadsExtracted'),persisted:sum('persisted'),associatedWithPageProduct:sum('associated'),retainedWithoutProduct:sum('unresolved'),
  rejected,withheldRights:withheld,duplicatesOnRepeat:per.find(p=>p.id==='S3_repeat_S1').observed.persisted,
  alreadyStoredOnRepeat:per.find(p=>p.id==='S3_repeat_S1').observed.alreadyStored,
  supersededByRevision:C.ms.filter(m=>m.state==='superseded_by_revision').length,currentRows:C.ms.filter(m=>m.state==='current').length,
  conflicts:C.conflicts.map(c=>({kind:c.kind,key:c.key,values:c.values,reporters:c.measurements.map(m=>m.reportedBy)})),
  equalAfterReopen:reopenEqual,incorrectAttribution:wrongAttribution,incorrectEvidencePromotion:wrongPromotion,proseWindowsChecked:windows.length,proseFragmentsInStore:proseHits,
  checkConstraintRefusals:`${C.checkRefusals}/5`,decisionCandidatesUsingTestMeasurements:C.candidates.flatMap(c=>c.declarations).filter(d=>/^tm_/.test(d.declarationId)).length,
  journal:{class:C.journal,deny:first.deny.journal,events:{class:C.events,deny:first.deny.events}}},
 scenarios:per};
writeFileSync(out,JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify(result.totals,null,1));
