#!/usr/bin/env node
/**
 * FC scorer (2026-10-18), written before the first run of the fact layer. Protocol: evaluation/function-fc/protocol.json;
 * reference sealed in evaluation/function-fc/freeze.json.
 *   node scripts/fc-score.mjs ARM LABEL      ARM = base | fc1; PEE_FC_BUILD = engine root of the frozen build
 * Zero HTTP. Public output: counts only. Private output: ids and categories (no page text). Never overwrites.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const [arm,label]=process.argv.slice(2);if(!['base','fc1'].includes(arm)||!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: base|fc1 LABEL');
const FC=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'function-fc');
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';const PUB=join('evaluation/function-fc',`score-${label}-${arm}.json`),PRIV=join(REPO,'private-eval/function-fc',`run-${label}-${arm}.json`);
for(const f of [PUB,PRIV])if(existsSync(f))throw Error(f+' exists: never overwritten');
const freeze=JSON.parse(readFileSync('evaluation/function-fc/freeze.json','utf8'));
for(const g of freeze.files)if(sha(readFileSync(join(FC,'gold',g.file)))!==g.sha256)throw Error('reference changed since sealing: '+g.file);
if(sha(readFileSync(join(FC,'annot/annotation-input.json')))!==freeze.annotationInputSha256)throw Error('annotation input changed');
const input=JSON.parse(readFileSync(join(FC,'annot/annotation-input.json'),'utf8'));const wave=JSON.parse(readFileSync(join(FC,'wave.json'),'utf8'));
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim();
const toks=s=>new Set(norm(s).split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>1||/\d/.test(x)));
const STOP=new Set(['mode','modes','function','functions','feature','features','control','controls','the','a','an','of','and','or','with','setting','settings','option','options','support','system','programme','programmes','program','programs','cycle','cycles','preset','presets','its','to','on','in','for','built','is','are','has']);
const content=s=>{const t=[...toks(s)].filter(x=>!STOP.has(x));return new Set(t.length?t:[...toks(s)]);};
const overlap=(a,b)=>{const A=content(a),B=content(b);for(const x of A)if(B.has(x)||[...B].some(y=>y.length>=4&&x.length>=4&&(y.startsWith(x)||x.startsWith(y))))return true;return false;};
const nums=s=>(norm(s).replace(/(\d),(\d{3})/g,'$1$2').match(/\d+(?:\.\d+)?/g)??[]).map(Number);
const sameProduct=(a,b)=>{if(!a||!b)return false;const A=toks(a),B=toks(b);const mA=[...A].filter(x=>/\d/.test(x)&&/[a-z]/.test(x)),mB=[...B].filter(x=>/\d/.test(x)&&/[a-z]/.test(x));
 if(mA.length&&mB.length)return mA.some(x=>B.has(x))||mB.some(x=>A.has(x));let n=0;for(const x of A)if(B.has(x))n++;return n/Math.min(A.size,B.size)>=0.6;};
/** the rendered line holding most of an item's text (containment of the item's words), ties to the line most made of it */
const lineOf=(page,text)=>{const T=toks(text);if(!T.size)return null;let best=null,score=0,tie=0;for(const l of page.lines){const L=toks(l.text);if(!L.size)continue;let n=0;for(const x of T)if(L.has(x))n++;const c=n/T.size,d=n/L.size;if(c>score||(c===score&&d>tie)){score=c;tie=d;best=l.n;}}return score>=0.7?best:null;};
/** a mode name of the reference against a reader's: numbers must agree when the reference names one; else shared words */
const modeMatch=(g,r)=>{const gn=nums(g),rn=nums(r);if(gn.length)return rn.length>0&&gn[0]===rn[0]&&(overlap(g.replace(/\d+/g,''),r.replace(/\d+/g,''))||/speed|level|setting|fan/.test(norm(g))&&/speed|level|setting/.test(norm(r)));
 if(/\b(?:top|max|maximum|highest|full|turbo|boost)\b/.test(norm(g))&&/\b(?:top|max|maximum|highest|full|turbo)\b/.test(norm(r)))return /turbo|boost/.test(norm(g))===/turbo|boost/.test(norm(r));
 if(/\b(?:lowest|minimum|min)\b/.test(norm(g))&&/\blowest|minimum\b/.test(norm(r)))return true;if(/\b(?:sleep|night)\b/.test(norm(g))&&/\bsleep|night\b/.test(norm(r)))return true;return overlap(g,r);};
const D=join(resolve(process.env.PEE_FC_BUILD??'.'),'dist/src');
const QK=await import(D+'/quantity_knowledge.js');const W=await import(D+'/document_evidence.js');const PF=arm==='fc1'?await import(D+'/product_facts.js'):null;const qk=QK.loadQuantityKnowledge();
const opAxes=new Set(qk.pack.conditionAxes.filter(a=>a.operatingCondition&&a.id!=='floor_type').map(a=>a.id));
const C={};const inc=(k,n=1)=>C[k]=(C[k]??0)+n;const rows=[];let ident=null;
const prodOk=(g,r,subject)=>g==='none_or_unclear'?(r?'attributed_where_reference_unclear':'justified_none'):!r?'missing':g==='page_subject'?(r===subject||sameProduct(r,subject)?'correct':'wrong'):sameProduct(r,g)||(r===subject&&sameProduct(g,subject))?'correct':'wrong';
const gProd=(g,subject)=>g==='page_subject'?subject:g==='none_or_unclear'?null:g;
for(const p of wave.pages.filter(p=>p.set==='reference')){const html=readFileSync(join(FC,'raw',p.tag+'.html'),'utf8');const page=input.pages[p.tag];const gold=JSON.parse(readFileSync(join(FC,'gold',p.tag+'.json'),'utf8'));
 const doc=W.readDocumentEvidence(html,qk,{sourceType:'independent_review'});const pf=PF?PF.readProductFacts(qk,doc):null;ident=pf?pf.identity:doc.readingIdentity;const subject=doc.pageSubject;
 const seg=new Map(doc.segments.map(s=>[s.id,s]));const segText=s=>s.role==='pair'?(s.label??'')+': '+s.text:s.text;
 // reader items with their lines
 const qe=doc.qualitativeEvidence.map(e=>{const s=seg.get(e.segment);return {id:e.id,aspect:e.property.aspect,line:lineOf(page,s.text.slice(e.sentence.start,e.sentence.end))};});
 const reclass=new Set((pf?.reclassifiedQualitative??[]).map(x=>x.id));
 const aspectTerms=new Map((qk.pack.aspects??[]).map(a=>[a.id,a.terms]));
 const qeAboutName=(line,name)=>qe.filter(e=>e.line===line&&(aspectTerms.get(e.aspect)??[]).some(w=>content(name).has(norm(w))||norm(name).includes(norm(w))));
 const tableObs=doc.tables.tables.flatMap(t=>t.observations.map(o=>({...o,tableText:o.property.join(' ')+' '+o.surface})));
 const fnItems=pf?pf.functions.map(f=>({...f,line:lineOf(page,f.text),label:PF.loadProductFunctions().pack.functions.find(x=>x.id===f.function)?.label??f.function.replace(/^named:/,'')})):[];
 const compItems=pf?pf.components.map(c=>({...c,line:lineOf(page,c.text)})):[];
 const perfItems=pf?pf.functionPerformance.map(x=>({...x,line:lineOf(page,x.text),label:PF.loadProductFunctions().pack.functions.find(y=>y.id===x.function)?.label??x.function.replace(/^named:/,'')})):[];
 const resItems=pf?pf.results.map(r=>({id:r.id,product:r.product,surface:r.surface,modes:r.modes,line:lineOf(page,r.table!==null?r.text:r.text.slice(0,4000))})):
  [...doc.quantities.filter(q=>q.quantity&&!q.identifierPart&&q.recordRole!=='condition').map(q=>({id:q.id,product:q.product,surface:q.surface,modes:q.quantity.conditions.filter(c=>opAxes.has(c.axis)).map(c=>c.value),line:lineOf(page,segText(seg.get(q.segment)))})),
   ...tableObs.filter(o=>o.quantity&&o.recordRole!=='condition').map(o=>({id:o.id,product:o.product,surface:o.surface,modes:o.quantity.conditions.filter(c=>opAxes.has(c.axis)).map(c=>c.value),line:lineOf(page,o.tableText)}))];
 // a sentence-level result maps to its sentence's line rather than the whole segment's
 if(pf)for(const r of resItems){const q=doc.quantities.find(x=>x.id===r.id);if(q){const s=seg.get(q.segment);const u=W.sentences(s.text).find(u=>q.start>=u.start&&q.end<=u.start+u.text.length);if(u&&s.role!=='pair')r.line=lineOf(page,u.text)??r.line;}}
 else for(const r of resItems){const q=doc.quantities.find(x=>x.id===r.id);if(q){const s=seg.get(q.segment);const u=W.sentences(s.text).find(u=>q.start>=u.start&&q.end<=u.start+u.text.length);if(u&&s.role!=='pair')r.line=lineOf(page,u.text)??r.line;}}
 const modeItems=pf?pf.modes.map(m=>({mode:m.mode,name:m.name,scale:m.scale,product:m.product})):resItems.flatMap(r=>r.modes.map(m=>({mode:m,name:m,scale:null,product:r.product})));
 const used={f:new Set(),c:new Set(),m:new Set(),r:new Set(),p:new Set()};
 for(const [gi,g] of gold.items.entries()){const row={page:p.tag,ref:gi,type:g.type};rows.push(row);inc(g.type+'_ref');const f=(k,v)=>{row[k]=v;inc(`${g.type}_${k}_${v}`);};
  if(g.type==='function'){
   const qa=qeAboutName(g.line,g.name).filter(e=>!reclass.has(e.id));if(g.effectivenessInSameStatement==='none')f('read_as_qualitative',qa.length?'yes':'no');
   if(!pf){const t=tableObs.find(o=>(o.kind==='boolean'||o.kind==='text')&&lineOf(page,o.tableText)===g.line&&o.property.some(x=>overlap(x,g.name)));f('base_representation',t?'untyped_table_value':qa.length?'qualitative_only':'none');continue;}
   const m=fnItems.find(x=>!used.f.has(x.id)&&x.line===g.line&&(overlap(x.name,g.name)||overlap(x.label,g.name)));if(!m){f('reached','no');continue;}used.f.add(m.id);f('reached','yes');row.reader=m.id;
   f('presence',m.presence===g.presence?'correct':'wrong');f('product',prodOk(g.product,m.product,subject));f('statedBy',m.statedBy===g.statedBy?'correct':'wrong');
   f('sensorBased',m.sensorBased===null?'missing':m.sensorBased===!!g.sensorBased?'correct':'wrong');}
  else if(g.type==='component'){if(!pf){f('reached','no');continue;}
   const m=compItems.find(x=>!used.c.has(x.id)&&x.line===g.line&&overlap(x.name,g.name));if(!m){f('reached','no');continue;}used.c.add(m.id);f('reached','yes');row.reader=m.id;
   f('product',prodOk(g.product,m.product,subject));if(g.enables)f('enables',m.enables.some(e=>e.basis==='stated'&&overlap(e.function.replace(/_/g,' '),g.enables))?'stated_correct':m.enables.some(e=>overlap(e.function.replace(/_/g,' '),g.enables))?'knowledge_only':'missing');}
  else if(g.type==='mode'){const gp=gProd(g.product,subject);
   const cands=modeItems.filter(x=>modeMatch(g.name,x.name)||modeMatch(g.name,x.mode));const m=cands.find(x=>!gp||sameProduct(x.product,gp)||x.product===gp)??null;
   if(!m){f('reached',cands.length?'other_product_only':'no');continue;}f('reached','yes');if(pf)f('scale',m.scale===g.scale?'correct':'wrong');
   if(g.statedEquivalence){const e=(pf?.equivalences??[]).find(e=>(modeMatch(g.name,e.a)&&modeMatch(g.statedEquivalence.to,e.b))||(modeMatch(g.name,e.b)&&modeMatch(g.statedEquivalence.to,e.a)));f('equivalence',e?'reached':'missing');}}
  else if(g.type==='result'){const gv=nums(g.value)[0];
   const m=resItems.find(x=>!used.r.has(x.id)&&x.line===g.line&&gv!==undefined&&nums(x.surface).includes(gv));if(!m){f('reached','no');continue;}used.r.add(m.id);f('reached','yes');row.reader=m.id;
   f('product',prodOk(g.product,m.product,subject));const gm=(g.conditions??[]).filter(c=>c.kind==='operating_mode');
   if(gm.length)f('mode',m.modes.some(x=>gm.some(c=>modeMatch(c.value,x)))?'attributed':m.modes.length?'other_mode':'missing');}
  else if(g.type==='function_performance'){
   if(!pf){f('linked','no');f('qualitative_present',qe.some(e=>e.line===g.line)?'yes':'no');continue;}
   const m=perfItems.find(x=>!used.p.has(x.id)&&x.line===g.line&&(overlap(x.label,g.function)||overlap(x.function.replace(/_/g,' ').replace(/^named:/,''),g.function)));
   if(!m){f('linked','no');f('qualitative_present',qe.some(e=>e.line===g.line)?'yes':'no');continue;}used.p.add(m.id);f('linked','yes');row.reader=m.id;
   f('evidence',m.evidence===g.evidence||(m.evidence==='experience_in_use'&&g.evidence==='observed_in_test')?'correct':'wrong');f('polarity',m.polarity===g.polarity?'correct':'wrong');f('product',prodOk(g.product,m.product,subject));}}
 if(pf){inc('reader_functions',fnItems.length);inc('reader_functions_not_in_reference',fnItems.filter(x=>!used.f.has(x.id)).length);
  inc('reader_components',compItems.length);inc('reader_components_not_in_reference',compItems.filter(x=>!used.c.has(x.id)).length);
  inc('reader_performance',perfItems.length);inc('reader_performance_not_in_reference',perfItems.filter(x=>!used.p.has(x.id)).length);
  // a stated equivalence the reference does not hold is a false equivalence
  const geq=gold.items.filter(g=>g.type==='mode'&&g.statedEquivalence);
  for(const e of pf.equivalences){inc('reader_equivalences');if(!geq.some(g=>(modeMatch(g.name,e.a)&&modeMatch(g.statedEquivalence.to,e.b))||(modeMatch(g.name,e.b)&&modeMatch(g.statedEquivalence.to,e.a))))inc('false_equivalences');}
  inc('reclassified_qualitative',pf.reclassifiedQualitative.length);inc('qualitative_about_function',pf.qualitativeAboutFunction.length);
  inc('derived_presence',pf.derived.presence.length);inc('derived_effectiveness_unassessed',pf.derived.effectivenessUnassessed.length);inc('derived_effectiveness_evidence',pf.derived.effectivenessEvidence.length);inc('derived_may_support',pf.derived.mayHave.length);
  inc('derived_different_state_pairs',pf.derived.differentState.length);inc('derived_same_state_pairs',pf.derived.sameState.length);}}
if(PF){const rs=JSON.parse(readFileSync(join(resolve(process.env.PEE_FC_BUILD??'.'),'resources/quantity-knowledge/product-rules.v1.json'),'utf8'));
 C.rules_deriving_effectiveness_without_evidence=rs.programs[0].rules.filter(r=>{const [h,b='']=r.rule.split(':-');if(!/effectiveness|performance/.test(h))return false;if(/unassessed/.test(h))return !/not has_effectiveness_evidence|\beffectiveness_unassessed\(/.test(b);return !/(?<!not )\b(?:performs|performs_via|result|effectiveness_evidence)\(/.test(b);}).length;}
const meta={protocol:'evaluation/function-fc/protocol.json',arm,label,build:process.env.PEE_FC_BUILD_COMMIT??'working tree',readingIdentity:ident,generatedAt:new Date().toISOString(),tier:'development pages (function content not inspected by the developer); first run unless labelled tuned'};
mkdirSync('evaluation/function-fc',{recursive:true});mkdirSync(join(REPO,'private-eval/function-fc'),{recursive:true});
writeFileSync(PUB,JSON.stringify({...meta,counts:C},null,1)+'\n');writeFileSync(PRIV,JSON.stringify({...meta,counts:C,rows},null,1)+'\n');console.log(JSON.stringify(C));console.log('wrote',PUB);
