#!/usr/bin/env node
/** S99 (owner review of S98, 2026-10-20): does a scientific observation cross the whole operational path without losing or
 * changing its identity, statement role, product, nature, property, conditions, method and provenance?
 * The operational path itself runs on the given pages with the code of BUILD (so the S98 baseline and the S99 build are
 * measured by the same script): Phase245, Phase265, Phase269 and the shared scientific reading -> ingestObservation246 into
 * a COPY of the live store (S98 gate on) -> scientificReadings98 retrieval -> scientificEvidence98 on the user path.
 * Two measures:
 *  - preservation (no reference needed): every reading the reader produced is compared, field by field, with its stored row
 *    and its retrieved row (by observation key; v12 builds only), and the stored product link with the reading's subject;
 *  - correctness at the source, against the sealed references of the material (property, statement role, nature, subject).
 * Material: 'dev' = the SPENT S89-S96 waves and the S98 check (post hoc, never independent); 'check' = a sealed S99 wave.
 *   node scripts/s99-integrity.mjs LABEL [--build DIR] [--set dev|check] [--advice]
 * Public output: counts only (evaluation/s99/integrity-LABEL.json); per-item detail stays private. */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const args=process.argv.slice(2);const LABEL=args[0];if(!LABEL||LABEL.startsWith('--'))throw Error('LABEL');
const opt=k=>{const i=args.indexOf('--'+k);return i>0?args[i+1]:null;};const SET=opt('set')??'dev';const ADVICE=args.includes('--advice');
const BUILD=resolve(opt('build')??new URL('..',import.meta.url).pathname);const D='file://'+join(BUILD,'dist/src/');
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');const OUTD=join(PE,'s99');mkdirSync(OUTD,{recursive:true});
const PUB=new URL('../evaluation/s99/',import.meta.url).pathname;mkdirSync(PUB,{recursive:true});
const noOverwrite=f=>{if(existsSync(f))throw Error(f+' exists: never overwritten');return f;};
const {KnowledgeStore246,DEFAULT_STORAGE_POLICY246}=await import(D+'phase246_knowledge_store.js');const {FACTUAL_CLASS_POLICY249,detectReservations249}=await import(D+'phase249_retention_policy.js');
const {extractSpecifications245,SPEC_EXTRACTOR_VERSION}=await import(D+'phase245_spec_extraction.js');const {testLeadsFromHtml265,testDocumentSubject268}=await import(D+'phase265_test_measurements.js');
const {qualitativeObservations269}=await import(D+'phase269_qualitative_observations.js');const SR=await import(D+'scientific_reading98.js');const EV=await import(D+'scientific_evidence98.js');
const QK=await import(D+'quantity_knowledge.js');const qk=QK.loadQuantityKnowledge();const sha=b=>createHash('sha256').update(b).digest('hex');
const CLASS={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const live=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const storeFile=join(OUTD,`store-${LABEL}.sqlite`);for(const x of [storeFile,storeFile+'-wal',storeFile+'-shm'])rmSync(x,{force:true});copyFileSync(live,storeFile);
const ON=new KnowledgeStore246(storeFile,{...CLASS,scientificReadings98:true});
const TYPE={independent_test_or_review:'independent_original_test',independent_test:'independent_original_test'};
const WAVES=SET==='dev'?[['s89','annotations.json'],['s90','annotations.json'],['s91','annotations.json'],['s92','annotation/annotations.json'],['s93','annotation/annotations.json'],
 ['s94/wave','annotation/annotations.json'],['s96/wave','annotation/annotations.json'],['s98/wave','annotation/annotations.json']]:[['s99/wave','annotation/reference.json']];
const urlOf=new Map();const outputs=new Map();const counts={pages:0,declarations:0,leads:0,documentQuantities:0,documentKept:0,documentSkipped:{},identity:{}};const ms=[];
for(const [S] of WAVES){const W=join(PE,S);const w=JSON.parse(readFileSync(join(W,'wave.json'),'utf8'));
 for(const p of w.pages.filter(p=>p.outcome==='fetched'&&(SET==='dev'||p.role==='heldout_eval'))){const f=join(W,'raw',p.tag+'.html');if(!existsSync(f))continue;const b=readFileSync(f);if(sha(b)!==p.sha256)continue;
  const html=b.toString('utf8');const url=p.finalUrl??p.url;const host=new URL(url).host;const st=TYPE[p.sourceType]??p.sourceType??'unknown';urlOf.set(S+':'+p.tag,url);
  const cat=p.category&&p.category!=='mixed'?p.category:null;
  const x=testDocumentSubject268(extractSpecifications245(html,url),st);const robots=w.robots?.[host]?.status===200?w.robots[host].body??null:null;
  const leads=testLeadsFromHtml265(html,url,p.sha256,x,{category:p.category});const quals=qualitativeObservations269(html).observations;
  const t0=Date.now();const sci=SR.readPage98(html,url,p.sha256,x,leads,quals,cat,st);ms.push(Date.now()-t0);outputs.set(url+'|'+p.sha256,sci);
  ON.ingestObservation246({source:{sourceId:'src_'+host.replace(/[^a-z0-9]+/gi,'_'),host,sourceType:st,sourceTypeBasis:'operator_asserted'},url,sha256:p.sha256,bytes:p.bytes,httpStatus:p.httpStatus??200,
   fetchedAt:p.fetchedAt,runId:'s99_'+S.replace(/\W/g,'_'),extractorVersion:SPEC_EXTRACTOR_VERSION,extraction:x,categoryHypotheses:cat?[cat]:[],
   reservations:detectReservations249(robots,html),testLeads:leads,qualitative270:{readerVersion:'phase270-qual-1',observations:quals},scientific98:sci});counts.pages++;
  for(const k of ['declarations','leads','documentQuantities','documentKept'])counts[k]+=sci.counts[k];
  for(const [k,v] of Object.entries(sci.counts.documentSkipped))counts.documentSkipped[k]=(counts.documentSkipped[k]??0)+v;
  for(const [k,v] of Object.entries(sci.counts.identity??{}))counts.identity[k]=(counts.identity[k]??0)+v;}}
const urlRev=new Map(ON.db.prepare('SELECT revision_id,url FROM revisions').all().map(r=>[r.revision_id,r.url]));
// the page's main product as the store records it (product_sources role main_product), per revision
const mainOfRev=new Map(ON.db.prepare("SELECT revision_id,product_id FROM product_sources WHERE role='main_product'").all().map(r=>[r.revision_id,r.product_id]));
const revOf=new Map(ON.db.prepare('SELECT revision_id,url,sha256,retention FROM revisions').all().map(r=>[r.url+'|'+r.sha256,r]));
// ---------------- preservation: reader output -> stored row -> retrieved row (v12 builds) ----------------
const stored=ON.db.prepare("SELECT * FROM scientific_readings98 WHERE state='current'").all();const retrieved=ON.scientificReadings98();
const v12=stored.length>0&&'observation_key' in stored[0];
const FIELDS={property:r=>r.property.id,property_state:r=>r.property.state,nature:r=>r.nature,statement_role:r=>r.statement?.role??null,bound:r=>r.statement?.bound??null,subject:r=>r.subject?.value??null,
 provenance:r=>r.provenance??null,result_basis:r=>r.resultBasis??null,object:r=>r.object??null,conditions:r=>JSON.stringify(r.conditions),missing:r=>JSON.stringify(r.missing),method:r=>JSON.stringify(r.method),
 source_locator:r=>r.source?.locator??null,source_offset:r=>r.source?.offset??null};
const COL={property:'property_id',property_state:'property_state',nature:'nature',statement_role:'statement_role',bound:'bound',subject:'subject_value',provenance:'provenance',result_basis:'result_basis',object:'object',
 conditions:'conditions_json',missing:'missing_conditions_json',method:'method_json',source_locator:'source_locator',source_offset:'source_offset'};
const sortK=v=>Array.isArray(v)?v.map(sortK):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sortK(v[k])])):v;
const canonJ=s=>{try{return JSON.stringify(sortK(JSON.parse(s)));}catch{return s;}};
const preservation={readingsProduced:0,stored:0,notStored:{},retrieved:0,fieldChanged:{},productLink:{consistent:0,linkedWithoutStatedSubject:0,statedButNoProductIdentityOnPage:0,statedButNotLinked:0}};
if(v12){const byKey=new Map(stored.map(r=>[r.revision_id+'|'+r.observation_key,r]));const retKey=new Set(retrieved.map(r=>r.revision_id+'|'+r.observation_key));
 for(const [uk,sci] of outputs){const R=revOf.get(uk);const rev=R?[R.revision_id]:[];
  const all=[...sci.declarations.map(d=>d.reading),...sci.leads.map(l=>l.reading),...sci.document.map(d=>d.reading)];
  for(const r of all){preservation.readingsProduced++;const row=rev.map(v=>byKey.get(v+'|'+r.source?.key)).find(Boolean);
   // a reading is stored exactly when the row it describes is retained (same insert loop); unstored readings are classified
   // by the revision's retention, which the rights policy decides
   if(!row){const why=(R?.retention==='metadata_only'?'rights_metadata_only:':'not_retained_by_class_policy:')+(r.source?.reader??'unknown');preservation.notStored[why]=(preservation.notStored[why]??0)+1;continue;}preservation.stored++;
   if(retKey.has(row.revision_id+'|'+row.observation_key))preservation.retrieved++;
   for(const [f,get] of Object.entries(FIELDS)){let a=get(r),b=row[COL[f]];if(['conditions','missing','method'].includes(f)){a=canonJ(a);b=canonJ(b);}if(f==='source_locator'&&a)a=String(a).slice(-200);
    if(String(a??'')!==String(b??''))preservation.fieldChanged[f]=(preservation.fieldChanged[f]??0)+1;}
   const main=mainOfRev.get(row.revision_id)??null;const sv=r.subject?.value;
   if(row.subject_table==='document_quantity'){if(row.product_id&&sv!=='page_product'&&sv!=='named_product')preservation.productLink.linkedWithoutStatedSubject++;
    else if(!row.product_id&&sv==='page_product'&&!main)preservation.productLink.statedButNoProductIdentityOnPage++;
    else if(!row.product_id&&sv==='page_product')preservation.productLink.statedButNotLinked++;else preservation.productLink.consistent++;}
   else preservation.productLink.consistent++;}}}
// ---------------- correctness at the source (against the material's sealed references) ----------------
const nu=u=>{const p=u?QK.parseUnit(qk,String(u).trim()):null;return p?p.expression:String(u??'').toLowerCase().replace(/\s+/g,'');};
const valueOf=r=>{if(r.subject_table==='document_quantity')return {v:r.value,u:r.unit};if(r.subject_table==='test_measurements265'){const t=ON.db.prepare('SELECT value,unit FROM test_measurements265 WHERE measurement_id=?').get(r.subject_id);return {v:t?.value,u:t?.unit};}
 const d=ON.db.prepare('SELECT value_json FROM declarations WHERE declaration_id=?').get(r.subject_id);const v=d?JSON.parse(d.value_json):null;return {v:v?.number??v?.min??null,u:v?.unit??null};};
const byPage=new Map();for(const r of retrieved){const x=valueOf(r);const k=urlRev.get(r.revision_id);(byPage.get(k)??byPage.set(k,[]).get(k)).push({...r,v:x.v,u:nu(x.u)});}
const roleOfRow=r=>r.statement_role??(r.nature==='measured'||r.nature==='calculated'?'result':r.nature==='declared'?'specification':r.nature==='condition'?'condition':'unresolved');
const REF_ROLE={declared_spec:'specification',measured_by_publisher:'result',test_condition:'condition',quoted_other_source:'specification',specification:'specification',result:'result',setting:'condition'};
const REF_NATURE={declared:'declared',calculated:'calculated',condition:'condition',measured:'measured',measured_by_publisher:'measured',declared_by_maker:'declared',calculated_by_publisher:'calculated'};
const key=existsSync(join(PE,'s96/dev-key.json'))?JSON.parse(readFileSync(join(PE,'s96/dev-key.json'),'utf8')).accept:{};
const accepts=(acc,id)=>acc.some(a=>a===id||id&&a.startsWith('acq_')&&id.startsWith(a+'_'));
const Z=()=>({items:0,property:{refPositive:0,correct:0,wrong:0,notStored:0,refNone:0,falseStored:0},
 role:{compared:0,agree:0,confusion:{}},nature:{compared:0,agree:0,confusion:{}},subject:{reviewed:0,reviewedLinked:0,other:0,otherLinked:0,none:0,noneLinked:0},
 storedNoneByRole:{},falseProductValue:0,refNoneStoredAsNonValue:0});
const correctness={};const detail=[];
for(const [S,f] of WAVES){const W=join(PE,S);if(!existsSync(join(W,f)))continue;const j=JSON.parse(readFileSync(join(W,f),'utf8'));const ref=j.values??j.items??j;
 const its=JSON.parse(readFileSync(join(W,'check-items.json'),'utf8'));const items=(Array.isArray(its)?its:its.items).filter(x=>ref[x.id]);const C=correctness[S]=Z();
 for(const x of items){const r=ref[x.id];C.items++;
  const acc=S==='s94/wave'?(key[String(r.concept??'').toLowerCase()]??[r.property??'none']):[r.property??'none',...(Array.isArray(r.alsoAcceptable)?r.alsoAcceptable:r.alsoAcceptable&&r.property!=='none'?[r.alsoAcceptable]:[])];
  const url=urlOf.get(S+':'+x.page);const cand=(byPage.get(url)??[]).filter(z=>z.v!==null&&z.v!==undefined&&Math.abs(Number(z.v)-Number(x.value))<1e-9&&z.u===nu(x.unit));
  const withProp=cand.filter(z=>z.property_id);const ok=withProp.find(z=>accepts(acc,z.property_id));const hit=ok??withProp[0]??null;
  if(acc.includes('none')){C.property.refNone++;if(withProp.length){C.property.falseStored++;const k=roleOfRow(withProp[0]);C.storedNoneByRole[k]=(C.storedNoneByRole[k]??0)+1;
    // what matters for a product: a value the reference says is not a property value, stored as a value of a product
    if(withProp.some(z=>['result','specification'].includes(roleOfRow(z))&&z.product_id))C.falseProductValue++;else C.refNoneStoredAsNonValue++;}}
  else{C.property.refPositive++;if(ok)C.property.correct++;else if(withProp.length)C.property.wrong++;else C.property.notStored++;}
  const rr=REF_ROLE[r.role];if(hit&&rr){C.role.compared++;const got=roleOfRow(hit);if(got===rr)C.role.agree++;const k=rr+'->'+got;C.role.confusion[k]=(C.role.confusion[k]??0)+1;}
  const rn=REF_NATURE[r.nature];if(hit&&rn){C.nature.compared++;if(hit.nature===rn)C.nature.agree++;const k=rn+'->'+hit.nature;C.nature.confusion[k]=(C.nature.confusion[k]??0)+1;}
  if(hit){const main=mainOfRev.get(hit.revision_id)??null;const linked=!!hit.product_id&&hit.product_id===main;
   if(r.subject==='reviewed_product'){C.subject.reviewed++;if(linked)C.subject.reviewedLinked++;}else if(r.subject==='other_product'){C.subject.other++;if(linked)C.subject.otherLinked++;}
   else if(r.subject==='none'){C.subject.none++;if(hit.product_id)C.subject.noneLinked++;}}
  detail.push({set:S,id:x.id,accept:acc,ref:{role:r.role??null,nature:r.nature??null,subject:r.subject??null},
   stored:withProp.map(z=>({p:z.property_id,role:roleOfRow(z),bound:z.bound??null,n:z.nature,nb:z.nature_basis,sv:z.subject_value??null,sb:z.subject_basis??null,a:z.product_association,sr:z.statement_basis??null}))});}}
const total=Z();for(const C of Object.values(correctness)){total.items+=C.items;for(const g of ['property','subject'])for(const [k,v] of Object.entries(C[g]))total[g][k]+=v;
 for(const g of ['role','nature']){total[g].compared+=C[g].compared;total[g].agree+=C[g].agree;for(const [k,v] of Object.entries(C[g].confusion))total[g].confusion[k]=(total[g].confusion[k]??0)+v;}
 for(const [k,v] of Object.entries(C.storedNoneByRole))total.storedNoneByRole[k]=(total.storedNoneByRole[k]??0)+v;total.falseProductValue+=C.falseProductValue;total.refNoneStoredAsNonValue+=C.refNoneStoredAsNonValue;}
// ---------------- comparability on the user path ----------------
const prods=[...new Set(retrieved.map(r=>r.product_id).filter(Boolean))];const ev=EV.scientificEvidence98(ON,prods);
const verdicts={};const reasons={};for(const p of ev.properties){for(const [k,v] of Object.entries(p.comparisons))verdicts[k]=(verdicts[k]??0)+v;for(const [k,v] of Object.entries(p.reasons))reasons[k]=(reasons[k]??0)+v;}
const census={readings:retrieved.length,byRole:{},byNature:{},bySubject:{},byAssociation:{},bounded:0};
for(const r of retrieved){const k=roleOfRow(r);census.byRole[k]=(census.byRole[k]??0)+1;census.byNature[r.nature]=(census.byNature[r.nature]??0)+1;const s=r.subject_value??'n/a';census.bySubject[s]=(census.bySubject[s]??0)+1;
 census.byAssociation[r.product_association]=(census.byAssociation[r.product_association]??0)+1;if(r.bound)census.bounded++;}
let advice=null;
if(ADVICE){const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');
 const SETS=['phase248/journey-dev.json','phase248/journey-heldout.json','phase248/journey-heldout2.json','phase250/journey-real-requests-set3.json','phase251/journey-real-requests-set4.json','phase266/requests.json','phase271/cross-eval-set.json','s80/protocol.json'];
 const texts=[];for(const f of SETS){const j=JSON.parse(readFileSync(join(new URL('../evaluation/',import.meta.url).pathname,f),'utf8'));const walk=(o,k)=>{if(typeof o==='string'){if((k==='text'||k==='request')&&o.length>15&&/\s/.test(o))texts.push(o);return;}if(Array.isArray(o))o.forEach(y=>walk(y,k));else if(o&&typeof o==='object')for(const [kk,v] of Object.entries(o))walk(v,kk);};walk(j,'');}
 advice={requests:0,decisionChanged:0,shortlistChanged:0,withScientificEvidence:0,verdicts:{}};
 for(const t of [...new Set(texts)]){advice.requests++;const o={quantityKnowledge:qk,date:'2026-10-20'};const a1=adviseFromRequest253(t,ON,CATEGORY_REGISTRY250,o),a2=adviseFromRequest253(t,ON,CATEGORY_REGISTRY250,{...o,scientific98:true});
  if((a1.goalAssessment?.decision??null)!==(a2.goalAssessment?.decision??null)||a1.response!==a2.response)advice.decisionChanged++;if(JSON.stringify(a1.shortlist)!==JSON.stringify(a2.shortlist))advice.shortlistChanged++;
  const e=a2.scientificEvidence98;if(e&&e.properties.length){advice.withScientificEvidence++;for(const p of e.properties)for(const [k,v] of Object.entries(p.comparisons))advice.verdicts[k]=(advice.verdicts[k]??0)+v;}}}
const out={schema:'pee.s99.integrity.v1',label:LABEL,set:SET,build:opt('build')?'other build (--build)':'working tree',reader:SR.SCIENTIFIC_READER98,
 material:SET==='dev'?'spent S89-S96 waves and the S98 check (post hoc; never independent)':'sealed S99 check wave',
 reading:{...counts,msPerPage:+(ms.reduce((a,b)=>a+b,0)/Math.max(1,ms.length)).toFixed(0)},preservation:v12?preservation:'not measurable: build without observation keys (pre-v12)',
 correctness:{total,bySet:correctness},census,comparability:{verdicts,reasons},advice};
writeFileSync(noOverwrite(join(PUB,`integrity-${LABEL}.json`)),JSON.stringify(out,null,1)+'\n');writeFileSync(join(OUTD,`integrity-${LABEL}-detail.json`),JSON.stringify(detail));
ON.close();console.log(JSON.stringify({reading:out.reading.identity,preservation:out.preservation,total,census,comparability:out.comparability.verdicts,advice},null,1));
