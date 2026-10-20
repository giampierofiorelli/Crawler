#!/usr/bin/env node
/** S98 independent check (evaluation/s98/check-preregistration.json): never-examined air-purifier and dishwasher pages
 * through the operational path (extractors -> shared scientific reading -> ingestObservation246 into store copies with
 * the S98 gate off and on -> retrieval -> adviseFromRequest253), scored against a blind reference sealed before the run.
 *   items | input        check items and the blind annotator input (private-eval/s98/wave)
 *   run LABEL            the first run, scored per capability (public counts: evaluation/s98/check-LABEL.json) */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [cmd,LABEL]=process.argv.slice(2);const sha=b=>createHash('sha256').update(b).digest('hex');
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');const ROOT=join(PE,'s98/wave');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const SR=await import(D+'scientific_reading98.js');
const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const DE=await import(D+'document_evidence.js');
const qk=QK.loadQuantityKnowledge();const noOverwrite=f=>{if(existsSync(f))throw Error(f+' exists: never overwritten');return f;};
const wave=()=>JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));const pagesOf=()=>wave().pages.filter(p=>p.outcome==='fetched'&&p.role==='heldout_eval');
const htmlOf=p=>{const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);return b.toString('utf8');};
const nQ=bs=>bs.reduce((n,b)=>n+QK.findQuantities(qk,b).filter(q=>q.value!==null||q.low!==undefined).length,0);
function blocksOf(html){const a=textBlocks225(html,{maxBlocks:3000}).blocks;const r=DE.readDocumentEvidence(html,qk,{});const b=r.segments.filter(s=>s.region!=='boilerplate'&&!s.duplicateOf).map(s=>s.text);return nQ(b)>nQ(a)?b:a;}
if(cmd==='items'){const out=[];
 for(const p of pagesOf()){const html=htmlOf(p);const blocks=blocksOf(html);const title=(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').replace(/\s+/g,' ').trim().slice(0,140);
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface,value:q.value??q.low,unit:q.unitSurface});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});const k=Math.ceil(uniq.length/40)||1;
  uniq.filter((_,i)=>i%k===0).forEach((a,j)=>out.push({id:`${p.tag}-${j}`,bi:a.bi,page:p.tag,category:p.category,title,value:a.value,unit:a.unit,surface:a.surface,window:blocks[a.bi].slice(Math.max(0,a.start-160),a.end+160)}));}
 writeFileSync(noOverwrite(join(ROOT,'check-items.json')),JSON.stringify(out,null,1));console.log(out.length,'items',JSON.stringify(Object.fromEntries(pagesOf().map(p=>[p.tag,out.filter(x=>x.page===p.tag).length]))));}
if(cmd==='input'){const it=JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8'));const dir=join(ROOT,'annotation');mkdirSync(join(dir,'pages'),{recursive:true});
 for(const p of pagesOf())writeFileSync(noOverwrite(join(dir,'pages',p.tag+'.txt')),blocksOf(htmlOf(p)).map((b,i)=>`L${i}: ${b.replace(/\s+/g,' ')}`).join('\n'));
 const ctx=SR.scientificContext98();
 const meaning=d=>{const m=d.quantity?.metric?ctx.qk.metrics.get(d.quantity.metric):null;return `${d.label} (${d.form}${d.quantity?.kinds?.length?'; kind: '+d.quantity.kinds.join('/'):''}${d.object&&d.object!=='unstated'?'; about: '+d.object:''})`+(m?.note?' - '+m.note:'')+' [also called: '+d.surface.map(s=>s[0]).slice(0,6).join(', ')+']';};
 const axes=[...ctx.qk.pack.conditionAxes].map(a=>({id:a.id,meaning:[a.note,a.values?'values: '+Object.keys(a.values).join(', '):null,a.valueKind?'a quantity of kind '+a.valueKind:null,a.cues?'cues: '+a.cues.slice(0,5).join(', '):null].filter(Boolean).join('; ')}));
 const f=noOverwrite(join(dir,'items.json'));
 writeFileSync(f,JSON.stringify({labels:{properties:[...ctx.defs.properties.values()].sort((a,b)=>a.id.localeCompare(b.id)).map(d=>({id:d.id,meaning:meaning(d)})),conditionAxes:axes.sort((a,b)=>a.id.localeCompare(b.id))},
  items:it.map(x=>({id:x.id,page:x.page,category:x.category,pageTitle:x.title,line:x.bi,value:x.value,unit:x.unit,surface:x.surface,text:x.window}))},null,1));console.log(it.length,'items',sha(readFileSync(f)));}
if(cmd==='run'){if(!LABEL)throw Error('LABEL');
 const fz=JSON.parse(readFileSync(new URL('../evaluation/s98/check-annotation-freeze.json',import.meta.url),'utf8'));const rb=readFileSync(join(ROOT,'annotation','annotations.json'));
 if(sha(rb)!==fz.annotationsSha256)throw Error('reference does not match its seal');const ref=JSON.parse(rb).values;
 const {KnowledgeStore246,DEFAULT_STORAGE_POLICY246}=await import(D+'phase246_knowledge_store.js');const {FACTUAL_CLASS_POLICY249,detectReservations249}=await import(D+'phase249_retention_policy.js');
 const {extractSpecifications245,SPEC_EXTRACTOR_VERSION}=await import(D+'phase245_spec_extraction.js');const {testLeadsFromHtml265,testDocumentSubject268}=await import(D+'phase265_test_measurements.js');
 const {qualitativeObservations269}=await import(D+'phase269_qualitative_observations.js');const {scientificEvidence98,compareReadings98}=await import(D+'scientific_evidence98.js');
 const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');
 const CLASS={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
 const live=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');const OUTD=join(PE,'s98');
 const mk=(name,storage)=>{const f=join(OUTD,`check-store-${LABEL}-${name}.sqlite`);for(const x of [f,f+'-wal',f+'-shm'])rmSync(x,{force:true});copyFileSync(live,f);return new KnowledgeStore246(f,storage);};
 const OFF=mk('off',CLASS),ON=mk('on',{...CLASS,scientificReadings98:true});const w=wave();const urlOf=new Map();const ms=[];const counts={declarations:0,leads:0,documentQuantities:0,documentKept:0,documentSkipped:{}};
 for(const p of pagesOf()){const html=htmlOf(p);const url=p.finalUrl??p.url;const host=new URL(url).host;const st=p.sourceType;urlOf.set(p.tag,url);
  const x=testDocumentSubject268(extractSpecifications245(html,url),st);const robots=w.robots?.[host]?.status===200?w.robots[host].body??null:null;
  const leads=testLeadsFromHtml265(html,url,p.sha256,x,{category:p.category});const quals=qualitativeObservations269(html).observations;
  const base={source:{sourceId:'src_'+host.replace(/[^a-z0-9]+/gi,'_'),host,sourceType:st,sourceTypeBasis:'operator_asserted'},url,sha256:p.sha256,bytes:p.bytes,httpStatus:p.httpStatus??200,fetchedAt:p.fetchedAt,
   runId:'s98_check',extractorVersion:SPEC_EXTRACTOR_VERSION,extraction:x,categoryHypotheses:[p.category],reservations:detectReservations249(robots,html),testLeads:leads,qualitative270:{readerVersion:'phase270-qual-1',observations:quals}};
  const t0=Date.now();const sci=SR.readPage98(html,url,p.sha256,x,leads,quals,p.category,st);ms.push(Date.now()-t0);
  for(const k of ['declarations','leads','documentQuantities','documentKept'])counts[k]+=sci.counts[k];for(const [k,v] of Object.entries(sci.counts.documentSkipped))counts.documentSkipped[k]=(counts.documentSkipped[k]??0)+v;
  OFF.ingestObservation246(base);ON.ingestObservation246({...base,scientific98:sci});}
 const nu=u=>{const p=u?QK.parseUnit(qk,String(u).trim()):null;return p?p.expression:String(u??'').toLowerCase().replace(/\s+/g,'');};
 const urlRev=s=>new Map(s.db.prepare('SELECT revision_id,url FROM revisions').all().map(r=>[r.revision_id,r.url]));
 // gate on: the stored readings with their values; gate off: the stored rows (declarations and test measurements) with the measurand the baseline types
 const readings=ON.scientificReadings98();const uOn=urlRev(ON);const valOf=r=>{if(r.subject_table==='document_quantity')return {v:r.value,u:r.unit};if(r.subject_table==='test_measurements265'){const t=ON.db.prepare('SELECT value,unit FROM test_measurements265 WHERE measurement_id=?').get(r.subject_id);return {v:t?.value,u:t?.unit};}
  const d=ON.db.prepare('SELECT value_json FROM declarations WHERE declaration_id=?').get(r.subject_id);const v=d?JSON.parse(d.value_json):null;return {v:v?.number??v?.min??null,u:v?.unit??null};};
 const onBy=new Map();for(const r of readings){const x=valOf(r);const k=uOn.get(r.revision_id);(onBy.get(k)??onBy.set(k,[]).get(k)).push({...r,v:x.v,u:nu(x.u)});}
 const uOff=urlRev(OFF);const offBy=new Map();
 for(const t of OFF.db.prepare("SELECT revision_id,value,unit,dimension FROM test_measurements265 WHERE state='current'").all().filter(t=>uOff.get(t.revision_id)&&[...urlOf.values()].includes(uOff.get(t.revision_id)))){const k=uOff.get(t.revision_id);(offBy.get(k)??offBy.set(k,[]).get(k)).push({v:t.value,u:nu(t.unit),metric:t.dimension,kind:'lead'});}
 for(const d of OFF.db.prepare("SELECT revision_id,value_json FROM declarations").all().filter(d=>[...urlOf.values()].includes(uOff.get(d.revision_id)))){const v=JSON.parse(d.value_json);const k=uOff.get(d.revision_id);(offBy.get(k)??offBy.set(k,[]).get(k)).push({v:v?.number??v?.min??null,u:nu(v?.unit),metric:null,kind:'declaration'});}
 const ctx=SR.scientificContext98();const metricOfProp=id=>ctx.defs.properties.get(id)?.quantity?.metric??null;
 const acceptsP=(r,id)=>!!id&&(id===r.property||(Array.isArray(r.alsoAcceptable)?r.alsoAcceptable.includes(id):id===r.alsoAcceptable));
 const S={attribution:{refPositive:0,on:{correct:0,wrong:0,notStored:0},off:{storedAnyRow:0,typedCorrect:0},refNone:0,onFalse:0,byCategory:{}},
  conditions:{refWithStated:0,storedCorrectWithStated:0,axisRecordedExplicit:0,statedAxesTotal:0,statedAxesRecorded:0,missingReported:0},product:{reviewed:0,reviewedLinkedMain:0,other:0,otherLinkedMain:0},
  nature:{agree:0,disagree:0},reuse:{viaDefinitions:0,viaQkMetricCandidates:0}};
 const it=JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8'));const detail=[];
 for(const x of it){const r=ref[x.id];if(!r)throw Error('unannotated '+x.id);const url=urlOf.get(x.page);const same=z=>z.v!==null&&z.v!==undefined&&Math.abs(Number(z.v)-Number(x.value))<1e-9&&z.u===nu(x.unit);
  const on=(onBy.get(url)??[]).filter(same).filter(z=>z.property_id);const off=(offBy.get(url)??[]).filter(same);const cat=S.attribution.byCategory[x.category]??={refPositive:0,onCorrect:0,offTypedCorrect:0,onWrong:0,onFalse:0};
  if(r.property==='none'){S.attribution.refNone++;if(on.length){S.attribution.onFalse++;cat.onFalse++;}detail.push({id:x.id,ref:'none',on:on.map(z=>z.property_id)});continue;}
  S.attribution.refPositive++;cat.refPositive++;const ok=on.find(z=>acceptsP(r,z.property_id));
  if(ok){S.attribution.on.correct++;cat.onCorrect++;if(String(ok.property_id).startsWith('qkm_'))S.reuse.viaQkMetricCandidates++;else S.reuse.viaDefinitions++;}else if(on.length){S.attribution.on.wrong++;cat.onWrong++;}else S.attribution.on.notStored++;
  if(off.length)S.attribution.off.storedAnyRow++;const m=metricOfProp(r.property);if(m&&off.some(z=>z.metric===m)){S.attribution.off.typedCorrect++;cat.offTypedCorrect++;}
  const stated=(r.conditions??[]).filter(c=>c&&c.axis);if(stated.length&&ok){S.conditions.refWithStated++;S.conditions.storedCorrectWithStated++;const rec=stated.filter(c=>ok.conditions.some(k=>k.id===c.axis&&k.state==='explicit'));
   S.conditions.statedAxesTotal+=stated.length;S.conditions.statedAxesRecorded+=rec.length;if(rec.length)S.conditions.axisRecordedExplicit++;}
  if(ok&&ok.missing.length)S.conditions.missingReported++;
  const hit=ok??on[0];if(hit){const main=hit.product_association==='page_main_product_unverified'||(hit.product_association==='as_subject_row'&&!!hit.product_id);
   if(r.subject==='reviewed_product'){S.product.reviewed++;if(main)S.product.reviewedLinkedMain++;}else if(r.subject==='other_product'){S.product.other++;if(main)S.product.otherLinkedMain++;}
   const n={measured_by_publisher:'measured',declared_by_maker:'declared'}[r.nature];if(n){if(hit.nature===n)S.nature.agree++;else S.nature.disagree++;}}
  detail.push({id:x.id,ref:r.property,on:on.map(z=>[z.property_id,z.nature,z.product_association]),off:off.map(z=>[z.kind,z.metric])});}
 const prods=[...new Set(readings.map(r=>r.product_id).filter(Boolean))];const comp={withConditions:{comparable:0,conditions_unestablished:0,not_comparable:0},withoutTransfer:{comparable:0,conditions_unestablished:0,not_comparable:0}};
 const bp=new Map();for(const r of readings.filter(r=>r.product_id&&r.property_id))bp.set(r.property_id,[...(bp.get(r.property_id)??[]),r]);
 for(const rs of bp.values())for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){if(rs[i].product_id===rs[j].product_id)continue;comp.withConditions[compareReadings98(rs[i],rs[j]).verdict]++;comp.withoutTransfer[compareReadings98({...rs[i],missing:[],conditions:[]},{...rs[j],missing:[],conditions:[]}).verdict]++;}
 const ev=scientificEvidence98(ON,prods);
 const SETS=['phase248/journey-dev.json','phase248/journey-heldout.json','phase248/journey-heldout2.json','phase250/journey-real-requests-set3.json','phase251/journey-real-requests-set4.json','phase266/requests.json','phase271/cross-eval-set.json','s80/protocol.json'];
 const texts=[];for(const f of SETS){const j=JSON.parse(readFileSync(join('evaluation',f),'utf8'));const walk=(o,k)=>{if(typeof o==='string'){if((k==='text'||k==='request')&&o.length>15&&/\s/.test(o))texts.push(o);return;}if(Array.isArray(o))o.forEach(y=>walk(y,k));else if(o&&typeof o==='object')for(const [kk,v] of Object.entries(o))walk(v,kk);};walk(j,'');}
 const adv={requests:0,inCategories:0,decisionChanged:0,shortlistChanged:0,offEqualsOnGateOff:0,withScientificEvidence:0,withComparisons:0,verdicts:{comparable:0,conditions_unestablished:0,not_comparable:0},newProductsConsidered:0};
 const newProducts=new Set(prods);
 for(const t of [...new Set(texts)]){adv.requests++;const o={quantityKnowledge:qk,date:'2026-10-20'};const a0=adviseFromRequest253(t,OFF,CATEGORY_REGISTRY250,o),a1=adviseFromRequest253(t,ON,CATEGORY_REGISTRY250,o),a2=adviseFromRequest253(t,ON,CATEGORY_REGISTRY250,{...o,scientific98:true});
  const sig=a=>JSON.stringify([a.response,a.goalAssessment?.decision??null,a.shortlist.map(x=>x.productId),a.excluded.map(x=>x.productId),a.statements,a.limitations]);if(sig(a0)===sig(a1))adv.offEqualsOnGateOff++;
  if(a1.category==='air_purifiers'||a1.category==='dishwashers')adv.inCategories++;
  if((a1.goalAssessment?.decision??null)!==(a2.goalAssessment?.decision??null)||a1.response!==a2.response)adv.decisionChanged++;if(JSON.stringify(a1.shortlist)!==JSON.stringify(a2.shortlist))adv.shortlistChanged++;
  if([...a2.shortlist,...a2.unknown,...a2.excluded].some(x=>newProducts.has(x.productId)))adv.newProductsConsidered++;
  const e=a2.scientificEvidence98;if(e&&e.properties.length){adv.withScientificEvidence++;let c=0;for(const p of e.properties)for(const k of Object.keys(adv.verdicts)){adv.verdicts[k]+=p.comparisons[k];c+=p.comparisons[k];}if(c)adv.withComparisons++;}}
 const out={schema:'pee.s98.check.v1',label:LABEL,reference:fz.annotationsSha256,pages:pagesOf().length,items:it.length,reading:{...counts,msPerPage:+(ms.reduce((a,b)=>a+b,0)/ms.length).toFixed(0),readingsStored:readings.length},
  ...S,comparability:comp,evidence:{properties:ev.properties.length,judgements:ev.judgements},advice:adv};
 const f=noOverwrite(new URL(`../evaluation/s98/check-${LABEL}.json`,import.meta.url).pathname);writeFileSync(f,JSON.stringify(out,null,1)+'\n');writeFileSync(join(OUTD,`check-${LABEL}-detail.json`),JSON.stringify(detail));
 OFF.close();ON.close();console.log(JSON.stringify(out,null,1));}
