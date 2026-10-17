#!/usr/bin/env node
/** Continuous-learning Step 1D-A2: DEVELOPMENT evaluation of HTML-first semantic reading (no network; the existing private
 * pages and gold only). Every page here was examined while the contract was designed: nothing is held-out.
 * Arms (same readers, plan and frozen Step 1C scorer; only the stated differences):
 *  A  = Step 1D-A candidate (constrained attribution + document inventory), the baseline at 0d87903;
 *  B  = A + the semantic-document contract for identity and context (structured names, boilerplate exclusion, grid cell
 *       products, structural principal) — reads no new values;
 *  C  = B + the structured test-table reader (Phase245 grid cells with their own labels);
 *  C-x = C with one component off (ablation), T = table reader with every B component off.
 * Reports items, leads, regressions, distinct identity problems, principal-product identification, entity recall and
 * non-product/merge counts, negative-control (declaration) leads, region exclusion of gold values, qualitative scope
 * (A vs B), cost. Usage: node scripts/step1d-a2-eval.mjs LABEL. Private ->
 * pee-knowledge/private-eval/experience/step1d-a2-LABEL.json; value-free -> evaluation/experience/step1d-a2-LABEL.json. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {documentLeads,documentInventory,buildIdentity} from './experience-observe.mjs';
const label=process.argv[2];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL');
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
// Development iterations may write elsewhere (STEP1D_A2_OUT_DIR); the reported run writes to the two repositories.
const OUT=process.env.STEP1D_A2_OUT_DIR;const PRIV=OUT?join(OUT,`private-${label}.json`):join(REPO,`private-eval/experience/step1d-a2-${label}.json`),PUB=OUT?join(OUT,`public-${label}.json`):`evaluation/experience/step1d-a2-${label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: never overwritten');
const D=resolve('dist/src');const S=await import(D+'/experience_attribution_scoring.js');const PL=await import(D+'/phase272_extraction_plan.js');
const T=await import(D+'/phase265_test_measurements.js');const SP=await import(D+'/phase245_spec_extraction.js');
const Q=await import(D+'/phase269_qualitative_observations.js');const ST=await import(D+'/phase246_knowledge_store.js');const R=await import(D+'/phase248_category_registry.js');
const I=await import(D+'/experience_entity_inventory.js');const P153=await import(D+'/phase153_entity_inventory.js');
const {createHash}=await import('node:crypto');const sha=x=>createHash('sha256').update(x).digest('hex');
const UE={db:['db','dba','db(a)','decibels','decibel'],nits:['nits','nit','cd/m2','cd/m²'],minutes:['minutes','mins','min'],seconds:['seconds','s','secs','sec'],hours:['hours','hrs','h','hour'],'%':['%','percent'],l:['l','litres','liters'],w:['w','watts'],kwh:['kwh'],ms:['ms'],cfm:['cfm']};
const canon=u=>{const l=String(u).toLowerCase();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return PL.canonicalUnit272?.(l)??l;};
const E=join(homedir(),'.local/share/product-evidence-engine/private-eval');const CAT={tv:'televisions',ap:'air_purifiers',af:'air_fryers',dw:'dishwashers'};
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const LIVE=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const s1c=JSON.parse(readFileSync(join(E,'step1c/gold.json'),'utf8'));const unt=JSON.parse(readFileSync(join(E,'phase272/gold-untouched.json'),'utf8'));const dvg=JSON.parse(readFileSync(join(E,'phase272/gold-dev.json'),'utf8'));
const SETS=[
 {set:'step1c (spent; examined)',ev:'step1c',docs:s1c.documents.map(d=>({tag:d.tag,category:d.category})),gold:s1c.values,qual:[],neg:[]},
 {set:'phase272 untouched (spent; examined)',ev:'phase272',gold:unt.quantitative.map(q=>({...q,subjectStatus:'exact'})),qual:unt.qualitative,neg:unt.negativeControls??[]},
 {set:'phase272 development pages',ev:'phase272',gold:dvg.quantitative.map(q=>({...q,subjectStatus:'exact'})),qual:dvg.qualitative??[],neg:[]}];
for(const st of SETS)st.docs??=[...new Set(st.gold.map(g=>g.doc))].map(tag=>({tag,category:CAT[tag.split('_')[1]]}));
const B_OFF=['names_json_ld','names_tables','names_links','exclusion','cells','principal'];
const ARMS=[['A','candidate_1c_inventory',[]],['B','candidate_1c_semantics',[]],['C','candidate_1c_semantics_tables',[]],
 ...B_OFF.map(o=>['C-'+o,'candidate_1c_semantics_tables',[o]]),['T','candidate_1c_semantics_tables',B_OFF]];
const count=xs=>xs.reduce((o,k)=>(o[k]=(o[k]??0)+1,o),{});const good=c=>c==='correct'||c==='correct_multi';const wrong=c=>c==='wrong_product'||c==='false_identity_match';
const gs=(s,v=[])=>({subject:s,subjectStatus:'exact',acceptedVariants:v,id:'',doc:'',value:0,unit:''});
const store=new ST.KnowledgeStore246(LIVE);const docsOut=[];const problems=[];
const numRe=v=>new RegExp('(?<![\\d.,])(?:'+[String(v),...(Math.abs(v)>=1000?[Number(v).toLocaleString('en-US')]:[])].map(x=>x.replace(/\./g,'\\.')).join('|')+')(?![\\d])');
for(const st of SETS)for(const d of st.docs){
 const g=st.gold.filter(x=>x.doc===d.tag).map(x=>({...x,unit:canon(x.unit)}));const res={};
 for(const [k,p,off] of ARMS){const t0=Date.now();const r=await documentLeads(D,{evaluation:st.ev,docTag:d.tag,category:d.category},{policy:p,off});if(r.unobservable)throw Error(d.tag+': '+r.unobservable);
  const L=r.leads.map(l=>({...l,unit:canon(l.unit)}));
  res[k]={ms:Date.now()-t0,items:Object.fromEntries(g.map(x=>[x.id,S.scoreItem1C(x,L)])),leads:L.map(l=>({cls:S.scoreLead1C(l,g),subject:l.subject,value:l.value,unit:l.unit,assignment:l.assignment,blockIndex:l.blockIndex})),
   negLeads:st.neg.filter(n=>n.doc===d.tag).filter(n=>L.some(l=>l.value===n.value&&l.unit===canon(n.unit))).length};}
 // Inventories: A (Step 1D-A) and B/C (with the contract).
 const ivA=await documentInventory(D,{evaluation:st.ev,docTag:d.tag,category:d.category});const ivB=await documentInventory(D,{evaluation:st.ev,docTag:d.tag,category:d.category},{semantics:true});
 const sem=ivB.semantics;const subjects=[...new Set(g.map(x=>x.subject).filter(Boolean))];
 const entityView=inv=>{const ents=subjects.map(s=>{const v=g.find(x=>x.subject===s)?.acceptedVariants??[];return {subject:s,found:inv.entities.filter(e=>e.type==='product'&&S.identity1C(gs(s,v),e.canonical)==='match').map(e=>e.canonical)};});
  return {goldEntities:ents.length,found:ents.filter(e=>e.found.length).length,split:ents.filter(e=>e.found.length>1).length,
   productEntities:inv.entities.filter(e=>e.type==='product').length,nonGoldProducts:inv.entities.filter(e=>e.type==='product'&&!subjects.some(s=>S.identity1C(gs(s),e.canonical)==='match')).map(e=>e.canonical),
   merges:inv.entities.filter(e=>e.type==='product'&&subjects.filter(s=>S.identity1C(gs(s),e.canonical)==='match').length>1).map(e=>e.canonical),
   notProduct:inv.entities.filter(e=>['standard','instrument','other'].includes(e.type)).length,missing:ents.filter(e=>!e.found.length).map(e=>e.subject)};};
 // Principal product: gold = the subject of at least half of the document's gold values, else none.
 const share=count(g.map(x=>x.subject));const top=Object.entries(share).sort((a,b)=>b[1]-a[1])[0];const goldPrincipal=top&&top[1]>=g.length/2?top[0]:null;
 const html=ivA.html;const x=T.testDocumentSubject268(SP.extractSpecifications245(html,ivA.url),'independent_original_test');
 const page0=x?.mainProduct?.name&&!x.mainProduct.ambiguous?{name:x.mainProduct.name,model:null}:null;const pA=T.planPageSubject272(page0,T.documentMentions272(html))?.name??null;
 const judge=n=>!n?(goldPrincipal?'missed':'correct_none'):goldPrincipal&&S.identity1C(gs(goldPrincipal),n)==='match'?'correct':'false_main_subject';
 const principal={gold:goldPrincipal,A:pA,Aclass:judge(pA),B:sem.principal.name,Bclass:judge(sem.principal.name),pageType:sem.pageType.kind,conflicts:sem.principal.conflicts};
 // Gold values located in the reader blocks: region of their block (hard exclusion vs the full Phase245 region map).
 const region={goldInBlocks:0,hardExcluded:0,phase245Excluded:0};
 for(const v of g){const re=numRe(v.value);const bi=ivA.blocks.findIndex(b=>re.test(b));if(bi<0)continue;region.goldInBlocks++;if(sem.blocks[bi]?.hardExcluded)region.hardExcluded++;if(sem.blocks[bi]?.region==='excluded')region.phase245Excluded++;}
 // Qualitative scope (A: Phase272 mentions and headline page; B: contract inventory mentions and structural principal).
 let qual=null;const qg=st.qual.filter(q=>q.doc===d.tag);
 if(qg.length){const plan=PL.compileExtractionPlan272(store,d.category,R.CATEGORY_REGISTRY250.find(e=>e.id===d.category)?.aliases??[],TAUGHT.filter(t=>t!==d.category));
  const map=JSON.parse(readFileSync(resolve('evaluation/phase272/protocol-addendum.json'),'utf8')).codeToOutcomeMap[d.category]??{};
  const run=(mentions,page)=>Q.qualitativeObservations269(html,{plan,mentions,page}).observations.map(o=>({dimension:o.outcome==='taught_dimension'?o.dimension272:(map[o.outcome]??'code:'+o.outcome),direction:o.direction,subject:o.subject?.name??null}));
  const score=obs=>count(qg.map(q=>{const same=obs.filter(o=>o.dimension===q.dimension&&o.direction===q.direction);if(!same.length)return 'missing';
   return same.some(o=>o.subject&&S.identity1C(gs(q.subject),o.subject)==='match')?'correct':same.some(o=>o.subject)?'wrong_product':'unresolved';}));
  const mA=T.documentMentions272(html);const oA=run(mA,T.planPageSubject272(page0,mA));
  const mB=I.attributionMentions1D(ivB.inventory).map(m=>({name:m.name,model:m.model}));const oB=run(mB,sem.principal.name?{name:sem.principal.name,model:null}:null);
  const wrongEmitted=obs=>obs.filter(o=>o.subject&&!subjects.some(s=>S.identity1C(gs(s),o.subject)==='match')).length;
  qual={gold:qg.length,A:score(oA),B:score(oB),emittedA:oA.length,emittedB:oB.length,nonGoldSubjectA:wrongEmitted(oA),nonGoldSubjectB:wrongEmitted(oB)};}
 // Remaining missing values (arm C): where they are in the page. Absent (not in the HTML text), only in scripts/metadata,
 // visible but not in a reader block, in a table cell, or in a prose block with or without its unit next to it.
 const UNITX={db:'d[bB]|decibels?',nits:'nits?|cd/m',minutes:'min|minutes?|mins',seconds:'s|sec|secs|seconds?',hours:'h|hrs?|hours?','%':'%|percent',l:'l|litres?|liters?',w:'w|watts?',kwh:'kwh',ms:'ms',cfm:'cfm'};
 const noScript=html.replace(/<!--([\s\S]*?)-->/g,'').replace(/<(script|style|svg|template|noscript|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 const visible=noScript.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ');
 const missingC=g.filter(v=>res.C.items[v.id]==='missing').map(v=>{const re=numRe(v.value);const reU=new RegExp(re.source+'\\s*(?:'+(UNITX[v.unit]??v.unit.replace(/[^a-z0-9%]/gi,''))+')(?![a-z])','i');
  const bi=ivA.blocks.findIndex(b=>re.test(b));const cell=bi>=0&&sem.blocks[bi]?.cell;
  const where=bi<0?(re.test(visible)?'visible_not_in_reader_blocks':re.test(html)?'scripts_or_attributes_only':'absent_from_html')
   :cell?'table_cell':ivA.blocks.some(b=>reU.test(b))?'prose_value_with_unit':'prose_value_unit_elsewhere';
  return {id:v.id,unit:v.unit,where};});
 // Phase153 reconciliation probe: what its open-class candidates (filtered to possible products that recur or match the
 // title) would add to the contract inventory B — gold products B misses, and candidates that name no gold product.
 const t153=Date.now();const text=ivB.blocks.slice(ivB.inventory.articleStart).join('\n\n').slice(0,250000);
 const r153=P153.discoverEntityInventory153({document:{source:{id:'d',url:ivA.url,title:sem.metadata.h1[0]??'',originalDocumentId:'d',role:'original_product_test'},text,sha256:sha(text)}},600);
 const lit=xs=>[...new Map(xs.map(m=>[m.nameKey,m.span.literal])).values()];
 const f153=lit(r153.mentions.filter(m=>m.kind==='possible_product'&&(m.signals.includes('repeated_surface')||m.signals.includes('page_title_correspondence'))));
 const missB=entityView(ivB.inventory).missing;const hit=n=>subjects.find(s=>S.identity1C(gs(s,g.find(x=>x.subject===s)?.acceptedVariants??[]),n)==='match');
 const phase153={proposedAll:lit(r153.mentions).length,proposedFiltered:f153.length,goldFoundFiltered:[...new Set(f153.map(hit).filter(Boolean))].length,
  goldMissingInBAdded:missB.filter(s=>f153.some(n=>hit(n)===s)),nonGoldFiltered:f153.filter(n=>!hit(n)).length,truncated:r153.truncated,ms:Date.now()-t153};
 // Distinct identity problems in C (same cause codes as Step 1D-A).
 for(const s of subjects){const items=g.filter(x=>x.subject===s);const bad=items.filter(x=>!good(res.C.items[x.id])&&res.C.items[x.id]!=='missing');if(!bad.length)continue;
  const v=items[0].acceptedVariants??[];const found=ivB.inventory.entities.filter(e=>e.type==='product'&&S.identity1C(gs(s,v),e.canonical)==='match');
  problems.push({set:st.set,doc:d.tag,subject:s,cause:!found.length?'1_not_detected':found.length>1?'4_identity_split':bad.some(x=>res.C.items[x.id]==='false_identity_match')?'6_evaluator_rejects_alias':'5_identity_present_not_used',measurementsAffected:bad.length,C:count(items.map(x=>res.C.items[x.id]))});}
 const tableLeads=res.C.leads.filter(l=>!res.B.leads.some(b=>b.blockIndex===l.blockIndex&&b.value===l.value&&b.unit===l.unit));
 docsOut.push({set:st.set,doc:d.tag,category:d.category,gold:g.length,
  arms:Object.fromEntries(ARMS.map(([k])=>[k,{items:count(Object.values(res[k].items)),leads:count(res[k].leads.map(l=>l.cls)),negativeControlLeads:res[k].negLeads,ms:res[k].ms}])),
  regressionsVsA:Object.fromEntries(ARMS.map(([k])=>[k,g.filter(x=>good(res.A.items[x.id])&&!good(res[k].items[x.id])).map(x=>x.id)])),
  newWrongVsA:Object.fromEntries(ARMS.map(([k])=>[k,g.filter(x=>wrong(res[k].items[x.id])&&!wrong(res.A.items[x.id])).map(x=>x.id)])),
  itemsChangedAC:g.filter(x=>res.A.items[x.id]!==res.C.items[x.id]).map(x=>({goldId:x.id,A:res.A.items[x.id],B:res.B.items[x.id],C:res.C.items[x.id]})),
  tableReaderLeads:{total:tableLeads.length,byClass:count(tableLeads.map(l=>l.cls)),notGold:tableLeads.filter(l=>l.cls==='lead_not_gold_value').map(l=>({value:l.value,unit:l.unit,subject:l.subject,blockIndex:l.blockIndex}))},
  missingC,entities:{A:entityView(ivA.inventory),B:entityView(ivB.inventory)},phase153,principal,region,qualitative:qual,
  semantics:{pageType:sem.pageType,alignment:sem.alignment,tables:sem.tables.map(t=>({mode:t.phase245Mode,context:t.context,hardExcluded:t.hardExcluded,regionReason:t.regionReason,rows:t.rows,cols:t.cols})),names:count(sem.names.map(n=>n.source)),ms:sem.stats.milliseconds,nodes:sem.stats.nodes,truncated:sem.stats.truncated}});}
store.close();
const sumBy=(f,part,k)=>docsOut.filter(f).reduce((o,d)=>{for(const [c,n] of Object.entries(d.arms[k][part]))o[c]=(o[c]??0)+n;return o;},{});
const summary=Object.fromEntries(SETS.map(st=>{const f=d=>d.set===st.set;const ds=docsOut.filter(f);
 return [st.set,{documents:ds.length,gold:st.gold.length,
  items:Object.fromEntries(ARMS.map(([k])=>[k,sumBy(f,'items',k)])),
  regressionsVsA:Object.fromEntries(ARMS.map(([k])=>[k,ds.flatMap(d=>d.regressionsVsA[k]).length])),newWrongVsA:Object.fromEntries(ARMS.map(([k])=>[k,ds.flatMap(d=>d.newWrongVsA[k]).length])),
  negativeControlLeads:Object.fromEntries(ARMS.map(([k])=>[k,ds.reduce((a,d)=>a+d.arms[k].negativeControlLeads,0)])),
  tableReaderLeads:count(ds.flatMap(d=>Object.entries(d.tableReaderLeads.byClass).flatMap(([c,n])=>Array(n).fill(c)))),
  entities:Object.fromEntries(['A','B'].map(k=>[k,{goldEntities:ds.reduce((a,d)=>a+d.entities[k].goldEntities,0),found:ds.reduce((a,d)=>a+d.entities[k].found,0),split:ds.reduce((a,d)=>a+d.entities[k].split,0),
   productEntities:ds.reduce((a,d)=>a+d.entities[k].productEntities,0),nonGoldProducts:ds.reduce((a,d)=>a+d.entities[k].nonGoldProducts.length,0),merges:ds.reduce((a,d)=>a+d.entities[k].merges.length,0),notProduct:ds.reduce((a,d)=>a+d.entities[k].notProduct,0)}])),
  principal:{A:count(ds.map(d=>d.principal.Aclass)),B:count(ds.map(d=>d.principal.Bclass))},
  phase153:{proposedAll:ds.reduce((a,d)=>a+d.phase153.proposedAll,0),proposedFiltered:ds.reduce((a,d)=>a+d.phase153.proposedFiltered,0),goldFoundFiltered:ds.reduce((a,d)=>a+d.phase153.goldFoundFiltered,0),
   goldMissingInBAdded:ds.reduce((a,d)=>a+d.phase153.goldMissingInBAdded.length,0),nonGoldFiltered:ds.reduce((a,d)=>a+d.phase153.nonGoldFiltered,0),msPerDocument:Math.round(ds.reduce((a,d)=>a+d.phase153.ms,0)/ds.length)},
  missingC:count(ds.flatMap(d=>d.missingC.map(m=>m.where))),missingCByUnit:count(ds.flatMap(d=>d.missingC.map(m=>m.where+':'+m.unit))),
  region:ds.reduce((o,d)=>{for(const [c,n] of Object.entries(d.region))o[c]=(o[c]??0)+n;return o;},{}),
  qualitative:ds.filter(d=>d.qualitative).reduce((o,d)=>{for(const k of ['A','B'])for(const [c,n] of Object.entries(d.qualitative[k]))o[k+':'+c]=(o[k+':'+c]??0)+n;
   o.emittedA=(o.emittedA??0)+d.qualitative.emittedA;o.emittedB=(o.emittedB??0)+d.qualitative.emittedB;o.nonGoldSubjectA=(o.nonGoldSubjectA??0)+d.qualitative.nonGoldSubjectA;o.nonGoldSubjectB=(o.nonGoldSubjectB??0)+d.qualitative.nonGoldSubjectB;return o;},{}),
  msPerDocument:Object.fromEntries(['A','B','C'].map(k=>[k,Math.round(ds.reduce((a,d)=>a+d.arms[k].ms,0)/ds.length)])),semanticsMsPerDocument:Math.round(ds.reduce((a,d)=>a+d.semantics.ms,0)/ds.length)}];}));
const problemSummary={distinctProblems:problems.length,measurementsAffected:problems.reduce((a,p)=>a+p.measurementsAffected,0),byCause:count(problems.map(p=>p.cause))};
const out={schema:'pee.step1d-a2.semantic-eval.v1',label,at:new Date().toISOString(),tier:'development (spent and examined pages; never untouched)',build:buildIdentity(D),arms:Object.fromEntries(ARMS.map(([k,p,o])=>[k,{policy:p,off:o}])),summary,problemSummary};
writeFileSync(PRIV,JSON.stringify({...out,problems,documents:docsOut},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({...out,documents:docsOut.map(d=>({set:d.set,doc:d.doc,category:d.category,gold:d.gold,arms:d.arms,regressionsVsA:d.regressionsVsA,newWrongVsA:d.newWrongVsA,
 itemsChangedAC:d.itemsChangedAC,tableReaderLeads:{total:d.tableReaderLeads.total,byClass:d.tableReaderLeads.byClass},
 entities:Object.fromEntries(['A','B'].map(k=>[k,{...d.entities[k],nonGoldProducts:d.entities[k].nonGoldProducts.length,merges:d.entities[k].merges.length,missing:d.entities[k].missing.length}])),
 missingC:d.missingC,phase153:{...d.phase153,goldMissingInBAdded:d.phase153.goldMissingInBAdded.length},principal:{Aclass:d.principal.Aclass,Bclass:d.principal.Bclass,pageType:d.principal.pageType,conflicts:d.principal.conflicts},region:d.region,qualitative:d.qualitative,semantics:d.semantics}))},null,1)+'\n');
console.log(JSON.stringify({summary,problemSummary},null,1));
for(const p of problems)console.log(p.doc.padEnd(32),p.subject.slice(0,30).padEnd(30),p.cause.padEnd(28),p.measurementsAffected,JSON.stringify(p.C));
