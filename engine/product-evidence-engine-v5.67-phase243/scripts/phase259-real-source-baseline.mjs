#!/usr/bin/env node
/** Phase259 — Phase258 on REAL retained metadata (read-only copy of the store; no network; no writes).
 * Builds Phase258 descriptor candidates from sources, revisions, product_sources, products and host_access, using only
 * retained fields: unknown stays unknown (country, language, market, rights, robots, originality, method). Then runs
 * the Phase196 route with the text actually retained (none: empty), and Phase258 selection for the Phase257 demo jobs.
 * Output: ids, roles, codes and counts only (no declaration values).
 * Usage: node scripts/phase259-real-source-baseline.mjs --label baseline|after [--out FILE]
 */
import {writeFileSync,copyFileSync,mkdirSync,rmSync,readFileSync} from 'node:fs';import {resolve,join} from 'node:path';import {homedir} from 'node:os';
import {DatabaseSync} from 'node:sqlite';
import * as C258 from '../dist/src/phase258_source_contributions.js';
import * as M258 from '../dist/src/phase258_source_memory.js';
import {analyzeEphemeralBatch195} from '../dist/src/phase195_ephemeral_batch_lineage.js';
import {emptyLedger193} from '../dist/src/phase193_screening_memory.js';
import {loadPublisherSeed196,planSourceReviews196} from '../dist/src/phase196_source_intelligence.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const dir=join(homedir(),'.local','share','product-evidence-engine','arms259');mkdirSync(dir,{recursive:true});
const dbf=join(dir,'real.sqlite');for(const x of ['','-wal','-shm'])rmSync(dbf+x,{force:true});copyFileSync('/home/user/pee-knowledge/snapshot/pee246.sqlite',dbf);
const db=new DatabaseSync(dbf,{readOnly:true});
const expected=JSON.parse(readFileSync('evaluation/phase259/expected.json','utf8'));
const demo=JSON.parse(readFileSync('evaluation/phase257/policy-demo.json','utf8'));
const resolveId=p=>db.prepare("SELECT product_id FROM products WHERE product_id LIKE ? LIMIT 1").get(p+'%')?.product_id;
const restrictedHosts=new Set(db.prepare('SELECT host FROM host_access WHERE restricted>0 OR suspended_until IS NOT NULL').all().map(r=>r.host));
const rows=pid=>db.prepare(`SELECT ps.role attribution,r.revision_id,r.url,r.sha256,r.fetched_at,r.state,r.superseded_by,r.screening_verdict,s.source_id,s.host,s.source_type,s.source_type_basis,s.policy_json,
 p.identity_state,(SELECT count(*) FROM declarations d WHERE d.revision_id=r.revision_id AND d.product_id=ps.product_id) nd,
 (SELECT json_group_array(property) FROM declarations d WHERE d.revision_id=r.revision_id AND d.product_id=ps.product_id) props,
 (SELECT count(DISTINCT product_id) FROM product_sources x WHERE x.revision_id=r.revision_id) shared
 FROM product_sources ps JOIN revisions r USING(revision_id) JOIN sources s USING(source_id) JOIN products p USING(product_id) WHERE ps.product_id=?`).all(pid);
// The mapping the Phase258 contract allows today: only what is retained.
const ROLE={manufacturer:'manufacturer_specification',retailer:'retailer_listing'};
const NEW=typeof C258.descriptorFromRetained259==='function';
function candidate(pid,r){
 if(NEW)return C258.descriptorFromRetained259({productId:pid,...r,declaredProperties:JSON.parse(r.props??'[]'),restricted:restrictedHosts.has(r.host)});
 return {schema:'pee258.source-descriptor.v1',origin:'operator_metadata',descriptorId:('d_'+r.source_id+'_'+pid).toLowerCase().slice(0,100),sourceId:r.source_id.toLowerCase(),url:r.url,
  roles:ROLE[r.source_type]?[ROLE[r.source_type]]:[],statementKinds:r.nd>0?['declared_specification']:[],publisherCountry:'unknown',language:'und',productMarket:'unknown',
  product:{productId:pid,identityStatus:'unverified'},testingConditions:{declared:false,conditionIds:[]},method:{described:false,referenceId:null},specialist:null,culturalTradition:null,
  sponsorship:'unknown',originality:'unknown',derivedFrom:[],access:{rights:'unreviewed',robots:'unknown'},statement:null,limitations:['metadata_only']};
}
const lostFields=r=>[r.source_type_basis==='heuristic_unverified'?'roleBasis(heuristic)':null,r.attribution!=='main_product'?'attributionBasis('+r.attribution+')':null,
 r.identity_state!=='extracted_unverified'?'identityState('+r.identity_state+')':null,'revision(id,sha256,fetchedAt,state)',r.superseded_by?'supersession':null,
 restrictedHosts.has(r.host)?'hostAccess(restricted)':null].filter(Boolean);
// 1. Sample cases.
const cases=expected.cases.map(c=>{const pid=resolveId(c.productId);
 return {id:c.id,productId:pid,records:rows(pid).map(r=>{const d=candidate(pid,r);let ok=true,err=null,role196=null;
  try{const v=C258.validateSourceDescriptor258(d);role196=C258.materialRoleFor196(v);}catch(e){ok=false;err=String(e.message).replace(/^phase258_invalid_descriptor: /,'');}
  return {sourceType:r.source_type,roleBasis:r.source_type_basis,attribution:r.attribution,identityState:r.identity_state,declarations:r.nd,sharedUrlProducts:r.shared,
   representable:ok,error:err,roles:ok?d.roles:null,role196,lostInDescriptor:NEW?(d.retained?[]:lostFields(r)):lostFields(r),screeningVerdictRetained:r.screening_verdict!==null,hostRestricted:restrictedHosts.has(r.host),
   unknownRecorded:{country:d.publisherCountry==='unknown',language:d.language==='und',market:d.productMarket==='unknown',rights:d.access?.rights==='unreviewed',robots:d.access?.robots==='unknown'}};})};});
// 2. Phase196 route with the text actually retained (none).
let p196={ran:false};
try{const recs=cases.flatMap(c=>rows(c.productId).map(r=>({c,r})));
 const uniq=[...new Map(recs.map(x=>[x.r.source_id.toLowerCase()+'|'+x.c.productId,x])).values()];
 const batch=analyzeEphemeralBatch195({batchId:'batch_259',analyzedAt:'2026-10-16T10:00:00Z',reviews:uniq.map((x,i)=>({sourceId:'src259_'+i,url:x.r.url,category:JSON.parse(db.prepare('SELECT category_hypotheses_json c FROM products WHERE product_id=?').get(x.c.productId).c)[0]??'uncategorised',variantId:x.c.productId,transientText:'',textBasis:'analyst_annotation',dates:[],attribution:[],measurements:[]}))});
 const m=planSourceReviews196({batch,ledger:emptyLedger193(),seed:loadPublisherSeed196('data/phase196/publisher-method-seed.json'),
  annotations:uniq.map((x,i)=>({sourceId:'src259_'+i,materialRole:ROLE[x.r.source_type]?'manufacturer_specification':'unclassified',field:'unspecified',market:'unknown',protocol:null,sourceRevision:null,freshPublisherBytes:null}))});
 p196={ran:true,sources:uniq.length,lanes:m.rows.reduce((a,r)=>(a[r.priorityLane]=(a[r.priorityLane]??0)+1,a),{}),documentCandidates:batch.documentCandidates.length,
  textRetained:0,note:'no text is retained, so Phase195 lineage signals are empty or artificial'};}catch(e){p196={ran:false,error:String(e.message)};}
// 3. Metadata-only coverage for the 19 Phase257 demo jobs.
const jobs=demo.plans.flatMap(p=>p.jobs.map(j=>({...j,categoryId:p.categoryId})));
const cov=jobs.map(j=>{const prods=db.prepare("SELECT product_id FROM products WHERE category_hypotheses_json LIKE ?").all('%"'+j.categoryId+'"%').map(r=>r.product_id);
 const descs=[];let unrepresentable=0;
 for(const pid of prods)for(const r of rows(pid)){try{descs.push(C258.validateSourceDescriptor258(candidate(pid,r)));}catch{unrepresentable++;}}
 const ownRows=rows(j.productId);
 const s=M258.selectSourcesForJob258({job:{productId:j.productId,criterion:j.criterion,gapKind:j.gapKind},descriptors:descs,feedback:[],states:M258.emptySourceLedger258(),maxSources:5});
 const alreadyRead=s.selected.filter(x=>ownRows.some(r=>r.source_id.toLowerCase()===x.sourceId));
 return {jobId:j.jobId,productId:j.productId,criterion:j.criterion,descriptors:descs.length,unrepresentable,selected:s.selected.length,
  selectedAlreadyRetainedWithoutCriterion:alreadyRead.length,freshCandidates:s.selected.length-alreadyRead.length,
  otherProductExcluded:s.excluded.filter(x=>x.reason==='other_product').length,accessExcluded:s.excluded.filter(x=>x.reason!=='other_product').length,
  excludedReasons:s.excluded.reduce((m,x)=>(m[x.reason]=(m[x.reason]??0)+1,m),{}),noFreshCandidates:s.noFreshCandidates??null,
  retainedNotSuitedByRole:s.notSuited.length,ownRecordsTableOnly:ownRows.filter(r=>r.attribution!=='main_product').length,ownHostRestricted:ownRows.filter(r=>restrictedHosts.has(r.host)).length};});
const all=cases.flatMap(c=>c.records);const sum=f=>cov.reduce((s,x)=>s+f(x),0);
const out={schema:'pee259.real-source-run.v1',label:F.label??'baseline',codeHasRetainedAdapter:NEW,
 sample:{records:all.length,representable:all.filter(r=>r.representable).length,errors:all.filter(r=>!r.representable).map(r=>r.sourceType+': '+r.error),
  unknownHonest:all.filter(r=>r.unknownRecorded.country&&r.unknownRecorded.language&&r.unknownRecorded.market).length,
  lostInformation:[...new Set(all.flatMap(r=>r.lostInDescriptor))],screeningDecisionsReusable:all.filter(r=>r.screeningVerdictRetained).length,
  sharedUrlRecords:all.filter(r=>r.sharedUrlProducts>1).length},
 phase196:p196,
 coverage:{jobs:cov.length,jobsWithAnySelection:cov.filter(x=>x.selected>0).length,selectedTotal:sum(x=>x.selected),
  selectedAlreadyRetainedWithoutCriterion:sum(x=>x.selectedAlreadyRetainedWithoutCriterion),freshCandidates:sum(x=>x.freshCandidates),
  otherProductExcluded:sum(x=>x.otherProductExcluded),jobsNoFreshCandidates:cov.filter(x=>x.noFreshCandidates).length,
  excludedReasons:cov.reduce((m,x)=>{for(const [k,v] of Object.entries(x.excludedReasons))m[k]=(m[k]??0)+v;return m;},{}),unrepresentableRecordsSeen:sum(x=>x.unrepresentable),ownTableOnly:sum(x=>x.ownRecordsTableOnly),ownHostRestricted:sum(x=>x.ownHostRestricted)},
 restrictedHosts:restrictedHosts.size,cases,jobs:cov};
db.close();
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({sample:out.sample,phase196:out.phase196,coverage:out.coverage},null,1));
