#!/usr/bin/env node
/** S98 operational validation on SPENT material (owner decision 2026-10-20, item 6: "first use the already examined
 * S89-S97 material to diagnose losses and regressions"). It runs the operational path itself, not an evaluation harness:
 * the existing extractors (Phase245, Phase265, Phase269) and the shared scientific reading on the retained bytes of the
 * S89-S96 waves -> ingestObservation246 into two COPIES of the live store (S98 gate off = rollback baseline, gate on)
 * -> scientificReadings98 retrieval -> adviseFromRequest253 on the 206 regression requests. Scored against the sealed
 * references of those waves (post hoc: spent, never independent). Public output: counts only.
 *   node scripts/s98-validate.mjs LABEL */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const LABEL=process.argv[2];if(!LABEL)throw Error('LABEL');
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');const OUTD=join(PE,'s98');mkdirSync(OUTD,{recursive:true});
const D=new URL('../dist/src/',import.meta.url).href;
const {KnowledgeStore246,DEFAULT_STORAGE_POLICY246}=await import(D+'phase246_knowledge_store.js');const {FACTUAL_CLASS_POLICY249,detectReservations249}=await import(D+'phase249_retention_policy.js');
const {extractSpecifications245,SPEC_EXTRACTOR_VERSION}=await import(D+'phase245_spec_extraction.js');const {testLeadsFromHtml265,testDocumentSubject268}=await import(D+'phase265_test_measurements.js');
const {qualitativeObservations269}=await import(D+'phase269_qualitative_observations.js');const SR=await import(D+'scientific_reading98.js');const {scientificEvidence98,compareReadings98}=await import(D+'scientific_evidence98.js');
const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');const QK=await import(D+'quantity_knowledge.js');
const qk=QK.loadQuantityKnowledge();const sha=b=>createHash('sha256').update(b).digest('hex');
const CLASS={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const live=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const mk=(name,storage)=>{const f=join(OUTD,`store-${LABEL}-${name}.sqlite`);for(const x of [f,f+'-wal',f+'-shm'])rmSync(x,{force:true});copyFileSync(live,f);return new KnowledgeStore246(f,storage);};
const OFF=mk('off',CLASS),ON=mk('on',{...CLASS,scientificReadings98:true});
// operator-asserted source types of the spent waves (fetched as 'independent_test_or_review', a type the store does not know)
const TYPE={independent_test_or_review:'independent_original_test',independent_test:'independent_original_test'};
const WAVES=[['s89','annotations.json'],['s90','annotations.json'],['s91','annotations.json'],['s92','annotation/annotations.json'],['s93','annotation/annotations.json'],['s94/wave','annotation/annotations.json'],['s94/wave2',null],['s96/wave','annotation/annotations.json']];
const t0=Date.now();const pageMs=[];const counts={pages:0,declarations:0,leads:0,documentQuantities:0,documentKept:0,documentSkipped:{}};const urlOf=new Map();
for(const [S] of WAVES){const W=join(PE,S);const w=JSON.parse(readFileSync(join(W,'wave.json'),'utf8'));
 for(const p of w.pages.filter(p=>p.outcome==='fetched')){const f=join(W,'raw',p.tag+'.html');if(!existsSync(f))continue;const b=readFileSync(f);if(sha(b)!==p.sha256)continue;
  const html=b.toString('utf8');const url=p.finalUrl??p.url;const host=new URL(url).host;const st=TYPE[p.sourceType]??p.sourceType??'unknown';urlOf.set(S+':'+p.tag,url);
  const x=testDocumentSubject268(extractSpecifications245(html,url),st);const robots=w.robots?.[host]?.status===200?w.robots[host].body??null:null;
  const leads=testLeadsFromHtml265(html,url,p.sha256,x,{category:p.category});const quals=qualitativeObservations269(html).observations;
  const base={source:{sourceId:'src_'+host.replace(/[^a-z0-9]+/gi,'_'),host,sourceType:st,sourceTypeBasis:'operator_asserted'},url,sha256:p.sha256,bytes:p.bytes,httpStatus:p.httpStatus??200,
   fetchedAt:p.fetchedAt,runId:'s98_validate_'+S.replace(/\W/g,'_'),extractorVersion:SPEC_EXTRACTOR_VERSION,extraction:x,categoryHypotheses:p.category&&p.category!=='mixed'?[p.category]:[],
   reservations:detectReservations249(robots,html),testLeads:leads,qualitative270:{readerVersion:'phase270-qual-1',observations:quals}};
  const ts=Date.now();const sci=SR.readPage98(html,url,p.sha256,x,leads,quals,p.category&&p.category!=='mixed'?p.category:null,st);pageMs.push(Date.now()-ts);
  OFF.ingestObservation246(base);ON.ingestObservation246({...base,scientific98:sci});counts.pages++;
  for(const k of ['declarations','leads','documentQuantities','documentKept'])counts[k]+=sci.counts[k];for(const [k,v] of Object.entries(sci.counts.documentSkipped))counts.documentSkipped[k]=(counts.documentSkipped[k]??0)+v;}}
const ingestMs=Date.now()-t0;
// ---- rollback baseline: the gate changes nothing but the readings table
const tableCounts=s=>Object.fromEntries(['declarations','test_measurements265','qualitative_observations270','comparative_results271','products'].map(t=>[t,s.db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n]));
const baseline={off:tableCounts(OFF),on:tableCounts(ON)};
// ---- retrieval: every current reading, with its value (from its subject row) and its page
const readings=ON.scientificReadings98();const rv=r=>{if(r.subject_table==='document_quantity')return {value:r.value,unit:r.unit};
 if(r.subject_table==='test_measurements265'){const t=ON.db.prepare('SELECT value,unit FROM test_measurements265 WHERE measurement_id=?').get(r.subject_id);return {value:t?.value??null,unit:t?.unit??null};}
 const d=ON.db.prepare('SELECT value_json FROM declarations WHERE declaration_id=?').get(r.subject_id);const v=d?JSON.parse(d.value_json):null;return {value:v?.number??v?.min??null,unit:v?.unit??null};};
const urlRev=new Map(ON.db.prepare('SELECT revision_id,url FROM revisions').all().map(r=>[r.revision_id,r.url]));
const nu=u=>{const p=u?QK.parseUnit(qk,String(u).trim()):null;return p?p.expression:String(u??'').toLowerCase().replace(/\s+/g,'');};
const byPage=new Map();for(const r of readings){const v=rv(r);const k=urlRev.get(r.revision_id);(byPage.get(k)??byPage.set(k,[]).get(k)).push({...r,v:v.value,u:nu(v.unit)});}
const census={readings:readings.length,bySubject:{},byNature:{},withProperty:0,withExplicitCondition:0,withMissingCondition:0,withConflict:0,byAssociation:{}};
for(const r of readings){census.bySubject[r.subject_table]=(census.bySubject[r.subject_table]??0)+1;census.byNature[r.nature]=(census.byNature[r.nature]??0)+1;census.byAssociation[r.product_association]=(census.byAssociation[r.product_association]??0)+1;
 if(r.property_id)census.withProperty++;if(r.conditions.some(c=>c.state==='explicit'&&c.value!==null))census.withExplicitCondition++;if(r.missing.length)census.withMissingCondition++;if(r.conflicts.length)census.withConflict++;}
// ---- end-to-end attribution and product attribution against the sealed references (post hoc)
const key=JSON.parse(readFileSync(join(PE,'s96/dev-key.json'),'utf8')).accept;
const accepts=(acc,id)=>acc.some(a=>a===id||id&&a.startsWith('acq_')&&id.startsWith(a+'_'));
const attribution={};const product={};const detail=[];
for(const [S,f] of WAVES){if(!f)continue;const W=join(PE,S);const j=JSON.parse(readFileSync(join(W,f),'utf8'));const ref=j.values??j.items??j;
 const its=JSON.parse(readFileSync(join(W,'check-items.json'),'utf8'));const items=(Array.isArray(its)?its:its.items).filter(x=>ref[x.id]);
 const A={items:0,refPositive:0,storedCorrect:0,storedWrong:0,notStored:0,refNone:0,storedFalse:0};const P={withSubjectRef:0,reviewedAsMain:0,reviewedNotLinked:0,otherAsMain:0,otherNotLinked:0};
 for(const x of items){const r=ref[x.id];const acc=S==='s94/wave'?(key[String(r.concept??'').toLowerCase()]??[r.property??'none']):[r.property??'none',...(r.alsoAcceptable&&r.property!=='none'?[r.alsoAcceptable]:[])];
  const url=urlOf.get(S+':'+x.page);const cand=(byPage.get(url)??[]).filter(z=>z.v!==null&&Math.abs(z.v-Number(x.value))<1e-9&&z.u===nu(x.unit));
  const withProp=cand.filter(z=>z.property_id);const ok=withProp.find(z=>accepts(acc,z.property_id));A.items++;
  if(acc.includes('none')){A.refNone++;if(withProp.length)A.storedFalse++;}
  else{A.refPositive++;if(ok)A.storedCorrect++;else if(withProp.length)A.storedWrong++;else A.notStored++;}
  const subj=r.subject;const hit=ok??withProp[0];
  if(hit&&(subj==='reviewed_product'||subj==='other_product')){P.withSubjectRef++;const main=hit.product_association==='page_main_product_unverified'||hit.product_association==='as_subject_row'&&hit.product_id;
   if(subj==='reviewed_product'){if(main)P.reviewedAsMain++;else P.reviewedNotLinked++;}else{if(main)P.otherAsMain++;else P.otherNotLinked++;}}
  detail.push({set:S,id:x.id,accept:acc,stored:withProp.map(z=>({p:z.property_id,s:z.subject_table,a:z.product_association,n:z.nature}))});}
 attribution[S]=A;product[S]=P;}
// ---- comparability (with the conditions carried, and as S96 would have judged them without), and stored judgements
const prods=[...new Set(readings.map(r=>r.product_id).filter(Boolean))];const ev=scientificEvidence98(ON,prods);
const comp={withConditions:{comparable:0,conditions_unestablished:0,not_comparable:0},withoutConditionTransfer:{comparable:0,conditions_unestablished:0,not_comparable:0}};
const byProp=new Map();for(const r of readings.filter(r=>r.product_id&&r.property_id&&r.form==='quantity'))byProp.set(r.property_id,[...(byProp.get(r.property_id)??[]),r]);
for(const rs of byProp.values())for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){if(rs[i].product_id===rs[j].product_id)continue;
 comp.withConditions[compareReadings98(rs[i],rs[j]).verdict]++;comp.withoutConditionTransfer[compareReadings98({...rs[i],missing:[],conditions:[]},{...rs[j],missing:[],conditions:[]}).verdict]++;}
// ---- advice: the 206 regression requests on the gated store, off and on; decisions must not change
const SETS=['phase248/journey-dev.json','phase248/journey-heldout.json','phase248/journey-heldout2.json','phase250/journey-real-requests-set3.json','phase251/journey-real-requests-set4.json','phase266/requests.json','phase271/cross-eval-set.json','s80/protocol.json'];
const texts=[];for(const f of SETS){const j=JSON.parse(readFileSync(join('evaluation',f),'utf8'));const walk=(o,k)=>{if(typeof o==='string'){if((k==='text'||k==='request')&&o.length>15&&/\s/.test(o))texts.push(o);return;}if(Array.isArray(o))o.forEach(x=>walk(x,k));else if(o&&typeof o==='object')for(const [kk,v] of Object.entries(o))walk(v,kk);};walk(j,'');}
const uniq=[...new Set(texts)];const adv={requests:uniq.length,decisionChanged:0,shortlistChanged:0,withScientificEvidence:0,withComparisons:0,verdicts:{comparable:0,conditions_unestablished:0,not_comparable:0},judgementsReported:0,offStoreEqualOnStoreGateOff:0};
for(const t of uniq){const o={quantityKnowledge:qk,date:'2026-10-19'};const a0=adviseFromRequest253(t,OFF,CATEGORY_REGISTRY250,o),a1=adviseFromRequest253(t,ON,CATEGORY_REGISTRY250,o),a2=adviseFromRequest253(t,ON,CATEGORY_REGISTRY250,{...o,scientific98:true});
 const sig=a=>JSON.stringify([a.response,a.goalAssessment?.decision??null,a.shortlist.map(x=>x.productId),a.excluded.map(x=>x.productId),a.statements,a.limitations]);
 if(sig(a0)===sig(a1))adv.offStoreEqualOnStoreGateOff++;if((a1.goalAssessment?.decision??null)!==(a2.goalAssessment?.decision??null)||a1.response!==a2.response)adv.decisionChanged++;
 if(JSON.stringify(a1.shortlist.map(x=>x.productId))!==JSON.stringify(a2.shortlist.map(x=>x.productId)))adv.shortlistChanged++;
 const e=a2.scientificEvidence98;if(e&&e.properties.length){adv.withScientificEvidence++;const c=e.properties.reduce((n,p)=>n+p.comparisons.comparable+p.comparisons.conditions_unestablished+p.comparisons.not_comparable,0);if(c)adv.withComparisons++;
  for(const p of e.properties)for(const k of Object.keys(adv.verdicts))adv.verdicts[k]+=p.comparisons[k];}
 if(e&&e.judgements.observations)adv.judgementsReported++;}
const out={schema:'pee.s98.validation.v1',label:LABEL,material:'spent S89-S96 waves (post hoc; never independent)',ingest:{...counts,ms:ingestMs,msPerPageReading:+(pageMs.reduce((a,b)=>a+b,0)/Math.max(1,pageMs.length)).toFixed(0)},
 rollbackBaseline:baseline,readings:census,attribution,productAttribution:product,comparability:{pairs:comp,evidenceProperties:ev.properties.length,judgements:ev.judgements},advice:adv};
const f=new URL(`../evaluation/s98/validation-${LABEL}.json`,import.meta.url).pathname;mkdirSync(join(f,'..'),{recursive:true});if(existsSync(f))throw Error(f+' exists');
writeFileSync(f,JSON.stringify(out,null,1)+'\n');writeFileSync(join(OUTD,`validation-${LABEL}-detail.json`),JSON.stringify(detail));
OFF.close();ON.close();console.log(JSON.stringify(out,null,1));
