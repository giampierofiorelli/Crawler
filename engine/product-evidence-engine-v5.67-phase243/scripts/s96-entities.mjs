#!/usr/bin/env node
/** S96 (evaluation/s96/preregistration.json): typed scientific entities acquired from the owner teaching tables and the
 * explicit quantity knowledge, reused by the EXISTING readers, measured on later documents.
 *   census                      typed entity census (counts; public evaluation/s96/entity-census.json with --out)
 *   dev LABEL                   attribution arms on the spent S94 wave items (development key private-eval/s96/dev-key.json)
 *   items | input               check items and blind annotator input (private-eval/s96/wave)
 *   run LABEL | score LABEL     check run (private rows) and score against the sealed reference (public counts)
 * Arms: E0 pd.5 unchanged; E1 + typed candidates (rows and QK metrics); E1r rows only; E1m metrics only; E2 E1 restricted to
 * candidates supported by earlier documents; E3 E1 + PPMI choice among unit-kind candidates (hybrid). Public output: counts. */
import {readFileSync,writeFileSync,existsSync,mkdirSync,readdirSync,statSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const SE=await import(D+'scientific_entities.js');const KT=await import(D+'knowledge_translation.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const DE=await import(D+'document_evidence.js');
const qk=QK.loadQuantityKnowledge();const defs0=PD.loadPropertyDefinitions(qk);const pub=f=>new URL('../evaluation/s96/'+f,import.meta.url).pathname;
const [cmd,LABEL]=process.argv.slice(2);const noOverwrite=f=>{if(existsSync(f))throw Error(f+' exists: never overwritten');return f;};
// ---- the teaching tables (owner packages; private) and the typed entities
const walk=d=>readdirSync(d).flatMap(f=>{const p=join(d,f);return statSync(p).isDirectory()?(f==='archive'||f.startsWith('ORIGINAL')?[]:walk(p)):/\.md$/i.test(f)?[p]:[];});
const PK=join(PE,'r1v/packages');const pkFiles=walk(PK).sort();const docs=pkFiles.map(p=>({source:p.slice(PK.length+1),md:readFileSync(p,'utf8')}));
const rows=SE.acquireEntities(qk,docs,defs0);const metrics=SE.metricEntities(qk,defs0);const entities=[...rows,...metrics];
const teaching={files:pkFiles.length,digest:sha(pkFiles.map(f=>sha(readFileSync(f))).join(''))};
// ---- earlier documents (E2 validation): every retained page of the spent waves S89-S94, never a check page of S96
const earlierPages=()=>{const out=[];for(const S of ['s89','s90','s91','s92','s93','s94/wave','s94/wave2']){const R=join(PE,S);if(!existsSync(join(R,'wave.json')))continue;
 for(const p of JSON.parse(readFileSync(join(R,'wave.json'),'utf8')).pages.filter(p=>p.outcome==='fetched')){const f=join(R,'raw',p.tag+'.html');if(!existsSync(f))continue;
  out.push({id:S+':'+p.tag,host:new URL(p.url).hostname,blocks:textBlocks225(readFileSync(f,'utf8'),{maxBlocks:3000}).blocks});}}return out;};
let supportCache=null;const support=()=>supportCache??=SE.documentSupport(qk,entities,earlierPages());
// ---- arms
const model=(()=>{const paras=pkFiles.flatMap(f=>readFileSync(f,'utf8').split(/\n\s*\n/)).filter(p=>p.trim().length>20);return KT.trainDistributional(paras,{window:5,minCount:3});})();
let armDefs=null;const arms=()=>armDefs??=(()=>{const sup=support();const validated=new Set([...sup.entries()].filter(([,ds])=>ds.length>=1).map(([id])=>id));
 const E1=SE.withAcquiredDefinitions(qk,defs0.pack,entities,{rows:true,metrics:true});
 return {E0:{defs:defs0},E0p:{defs:defs0},E1:{defs:E1.defs,added:E1.added},E1r:{defs:SE.withAcquiredDefinitions(qk,defs0.pack,entities,{rows:true,metrics:false}).defs},
  E1m:{defs:SE.withAcquiredDefinitions(qk,defs0.pack,entities,{rows:false,metrics:true}).defs},E2:{defs:SE.withAcquiredDefinitions(qk,defs0.pack,entities,{only:validated}).defs,validated:[...validated]},E3:{defs:E1.defs,hybrid:true}};})();
// E3 (fixed before any run): when E1 abstains for want of a term among unit-kind candidates, the candidate whose label and
// terms are most similar (PPMI) to the value's own words, if it leads the next by 0.1 and scores at least 0.2
const ownWords=o=>String(o.label??'').slice(Math.max(0,(o.valueAt??0)-60),o.valueAt??0);
// it1 (S96 dev reformulation 1): the own-term object rule (attributeProperty ownTermObject) in every arm except E0;
// E0p applies it with pd.5 alone, to separate the reader change from the acquired knowledge
const RULES=process.env.S96_IT==='0'?{}:{ownTermObject:true};
function attribute(arm,o){const a=arms()[arm];const r=I.attributeProperty(a.defs,qk,o,arm==='E0'?{}:RULES);
 if(a.hybrid&&!r.value&&r.rule==='unit_kind_without_supporting_term'&&r.alternatives.length){const w=ownWords(o);
  const sc=r.alternatives.map(id=>{const d=a.defs.properties.get(id);return {id,s:KT.phraseSimilarity(model,w,[d.label,...d.surface.map(x=>x[0])].join(' '))};}).sort((x,y)=>y.s-x.s);
  if(sc[0].s>=0.2&&(sc.length===1||sc[0].s-sc[1].s>=0.1))return {value:sc[0].id,rule:'hybrid_ppmi'};}
 return {value:r.value,rule:r.rule};}
const ARMS=['E0','E0p','E1','E1r','E1m','E2','E3'];
const accepts=(acc,id)=>acc.some(a=>a===id||id&&a.startsWith('acq_')&&id.startsWith(a+'_'));
const isAcquired=id=>/^(acq|qkm)_/.test(id??'');
function score(rs,arm){const pos=rs.filter(r=>!r.accept.includes('none')),neg=rs.filter(r=>r.accept.includes('none'));const p=r=>r.pred[arm];
 return {items:rs.length,refPositive:pos.length,correct:pos.filter(r=>accepts(r.accept,p(r))).length,wrong:pos.filter(r=>p(r)&&!accepts(r.accept,p(r))).length,abstained:pos.filter(r=>!p(r)).length,
  refNone:neg.length,falseAttribution:neg.filter(r=>p(r)).length,correctNone:neg.filter(r=>!p(r)).length,
  onlyAcquiredReachable:pos.filter(r=>r.accept.every(isAcquired)).length,correctOnlyAcquiredReachable:pos.filter(r=>r.accept.every(isAcquired)&&accepts(r.accept,p(r))).length,
  pd5Regressions:rs.filter(r=>accepts(r.accept,r.pred.E0)&&!accepts(r.accept,p(r))&&!(r.accept.includes('none')&&!p(r))).length};}
const obsOf=x=>({value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt,surface:x.surface,pageSubject:x.pageSubject??null});
function runItems(items,acceptOf){const t0=process.hrtime.bigint();const out=items.map(x=>{const o=obsOf(x);const pred={},rule={};for(const a of ARMS){const r=attribute(a,o);pred[a]=r.value;rule[a]=r.rule;}return {id:x.id,category:x.category,accept:acceptOf(x),pred,rule};});
 return {rows:out,ms:Number(process.hrtime.bigint()-t0)/1e6};}
const pack=rs=>Object.fromEntries(ARMS.map(a=>[a,score(rs,a)]));
const byCat=rs=>Object.fromEntries([...new Set(rs.map(r=>r.category))].sort().map(c=>[c,pack(rs.filter(r=>r.category===c))]));
const armInfo=()=>({E1added:arms().E1.added.length,E2validated:arms().E2.validated.length,definitions:Object.fromEntries(ARMS.map(a=>[a,arms()[a].defs.identity]))});

if(cmd==='census'){const c=SE.entityCensus(entities);const E1=SE.withAcquiredDefinitions(qk,defs0.pack,entities);const A=SE.withAcquiredAspects(qk,entities);
 const out={schema:'pee.s96.entity-census.v1',teaching,quantityKnowledge:qk.identity,definitions:defs0.identity,census:c,
  overlay:{candidateDefinitions:E1.added.length,fromRows:E1.added.filter(x=>x.startsWith('acq_')).length,fromMetrics:E1.added.filter(x=>x.startsWith('qkm_')).length,reusedExisting:E1.reused.length,candidateAspects:A.added.length},
  existingQualitative:{judgementProperties:[...defs0.properties.values()].filter(p=>p.form==='judgement').length,qkAspects:(qk.pack.aspects??[]).length},
  relationsStated:Object.fromEntries(['not_equivalent_to','derived_from','defined_by'].map(t=>[t,entities.reduce((n,e)=>n+e.relations.filter(r=>r.type===t).length,0)]))};
 console.log(JSON.stringify(out,null,1));if(process.argv.includes('--out'))writeFileSync(noOverwrite(pub('entity-census.json')),JSON.stringify(out,null,1)+'\n');}

if(cmd==='dev'){if(!LABEL)throw Error('LABEL');const W=join(PE,'s94/wave');const key=JSON.parse(readFileSync(join(PE,'s96/dev-key.json'),'utf8')).accept;
 const ref=JSON.parse(readFileSync(join(W,'annotation/annotations.json'),'utf8')).items;const items=JSON.parse(readFileSync(join(W,'check-items.json'),'utf8'));
 const acceptOf=x=>{const r=ref[x.id];const k=String(r.concept??'').toLowerCase();return key[k]??[r.property??'none'];};
 const {rows:rs,ms}=runItems(items,acceptOf);const out={schema:'pee.s96.dev.v1',label:LABEL,material:'S94 wave (spent): monitors and SSDs',teaching,...armInfo(),overall:pack(rs),byCategory:byCat(rs),msPerItemAllArms:+(ms/rs.length).toFixed(2)};
 writeFileSync(noOverwrite(join(PE,'s96',`dev-${LABEL}-detail.json`)),JSON.stringify({validatedEntities:arms().E2.validated,rows:rs},null,1));writeFileSync(noOverwrite(pub(`dev-${LABEL}.json`)),JSON.stringify(out,null,1)+'\n');
 for(const a of ARMS)console.log(a.padEnd(4),JSON.stringify(out.overall[a]));console.log('validated',arms().E2.validated.length,'ms/item',out.msPerItemAllArms);}

// ---- qualitative arms (Q0 QK aspects; Q1 + candidate aspects from attribute entities)
let qArms=null;const qualArms=()=>qArms??=(()=>{const A=SE.withAcquiredAspects(qk,entities);return {Q0:qk,Q1:A.qk,added:A.added};})();
/** the qualitative items of a page: sentences of the reader's segments with a word of the evaluative lexicon */
function qualItems(html,url,maxPerPage=15){const ev=qk.pack.language.en.evaluation;const words=[...ev.positive,...ev.negative];
 const r=DE.readDocumentEvidence(html,qk,{sourceType:'publisher'});const all=[];
 for(const s of r.segments){if(s.region==='boilerplate'||s.duplicateOf||s.role==='embedded_pair')continue;
  for(const u of DE.sentences(s.text)){if(u.text.length<20||u.text.length>600)continue;if(words.some(w=>QK.hasPhrase(QK.normText(u.text),QK.normText(w))))all.push({segment:s.id,start:u.start,text:u.text});}}
 const k=Math.ceil(all.length/maxPerPage)||1;return all.filter((_,i)=>i%k===0);}
function qualPredict(html,items){const out={};for(const a of ['Q0','Q1']){const r=DE.readDocumentEvidence(html,qualArms()[a],{sourceType:'publisher'});
  out[a]=items.map(it=>[...new Set(r.qualitativeEvidence.filter(q=>q.segment===it.segment&&q.sentence.start===it.start).map(q=>q.property.aspect))]);}return out;}
if(cmd==='qual-dev'){const W=join(PE,'s94/wave');const wave=JSON.parse(readFileSync(join(W,'wave.json'),'utf8'));let n=0,q0=0,q1=0;const added=[];
 console.log('candidate aspects',qualArms().added.length);
 for(const p of wave.pages.filter(p=>p.outcome==='fetched')){const html=readFileSync(join(W,'raw',p.tag+'.html'),'utf8');const its=qualItems(html,p.url,1000);const pr=qualPredict(html,its);
  its.forEach((it,i)=>{n++;if(pr.Q0[i].length)q0++;if(pr.Q1[i].length)q1++;const nw=pr.Q1[i].filter(x=>!pr.Q0[i].includes(x));if(nw.length)added.push(nw.join(',')+' | '+it.text.slice(0,140));});}
 console.log('sentences',n,'with aspect Q0',q0,'Q1',q1);for(const a of added)console.log(a);}

// ---- independent check (added after the freeze; arms unchanged)
const ROOT=join(PE,'s96/wave');const waveOf=()=>JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));
const pagesOf=()=>waveOf().pages.filter(p=>p.outcome==='fetched'&&p.role==='heldout_eval');
const htmlOf=p=>{const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);return b.toString('utf8');};
// amendment 1 (evaluation/s96/amendment-1.json, before any annotation or run): a page's text lines come from whichever existing
// reader finds more quantities, the regex block reader (S89-S94 rule) or the DOM segment reader (unclosed <p> paragraphs)
const nQ=bs=>bs.reduce((n,b)=>n+QK.findQuantities(qk,b).filter(q=>q.value!==null||q.low!==undefined).length,0);
function blocksOf(html){const a=textBlocks225(html,{maxBlocks:3000}).blocks;const r=DE.readDocumentEvidence(html,qk,{});const b=r.segments.filter(s=>s.region!=='boilerplate'&&!s.duplicateOf).map(s=>s.text);
 return nQ(b)>nQ(a)?{reader:'dom_segments',blocks:b}:{reader:'blocks225',blocks:a};}
function itemsFor(){const out=[];
 for(const p of pagesOf()){const html=htmlOf(p);const {blocks,reader}=blocksOf(html);const title=(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').replace(/\s+/g,' ').trim().slice(0,140);
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface,value:q.value??q.low,unit:q.unitSurface});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});
  const k=Math.ceil(uniq.length/40)||1;
  uniq.filter((_,i)=>i%k===0).forEach((a,j)=>{const bl=blocks[a.bi];const ls=Math.max(0,a.start-80);
   out.push({id:`${p.tag}-${j}`,reader,bi:a.bi,start:a.start,page:p.tag,host:new URL(p.url).hostname,category:p.category,title,pageSubject:title.split(/[|:–-]/)[0].replace(/\b(review|tested|test bench|best)\b.*$/i,'').trim()||null,
    value:a.value,unit:a.unit,surface:a.surface,window:bl.slice(Math.max(0,a.start-160),a.end+160),label:bl.slice(ls,a.end+30),valueAt:a.start-ls,context:bl.slice(0,600)});});}
 return out;}
if(cmd==='items'){const it=itemsFor();writeFileSync(noOverwrite(join(ROOT,'check-items.json')),JSON.stringify(it,null,1));
 const q=pagesOf().flatMap(p=>qualItems(htmlOf(p),p.url).map((x,j)=>({id:`${p.tag}-q${j}`,page:p.tag,category:p.category,...x})));writeFileSync(noOverwrite(join(ROOT,'check-qual-items.json')),JSON.stringify(q,null,1));
 console.log(it.length,'values',q.length,'sentences',JSON.stringify(Object.fromEntries([...new Set(it.map(x=>x.category+' @ '+x.host))].map(g=>[g,it.filter(x=>x.category+' @ '+x.host===g).length]))));}
if(cmd==='input'){const it=JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8'));const q=JSON.parse(readFileSync(join(ROOT,'check-qual-items.json'),'utf8'));const dir=join(ROOT,'annotation');mkdirSync(join(dir,'pages'),{recursive:true});
 for(const p of pagesOf()){const {blocks}=blocksOf(htmlOf(p));writeFileSync(noOverwrite(join(dir,'pages',p.tag+'.txt')),blocks.map((b,i)=>`L${i}: ${b.replace(/\s+/g,' ')}`).join('\n'));}
 // the union label set with each label's stated meaning; the order mixes existing and candidate labels (sorted by id) so that the source of a label is not signalled
 const E1=SE.withAcquiredDefinitions(qk,defs0.pack,entities);const ent=new Map([...E1.byEntity].map(([e,p])=>[p,entities.find(x=>x.id===e)]));
 const meaning=p=>{const e=ent.get(p.id);const m=p.quantity?.metric?qk.metrics.get(p.quantity.metric):null;
  return `${p.label} (${p.form}${p.quantity?.kinds?.length?'; kind: '+p.quantity.kinds.join('/'):''}${p.object&&p.object!=='unstated'?'; about: '+p.object:''})`+(e?.definition.value?' - '+e.definition.value:m?.note?' - '+m.note:'')+(p.surface.length?' [also called: '+p.surface.map(s=>s[0]).slice(0,6).join(', ')+']':'');};
 const A=qualArms();const aspects=(A.Q1.pack.aspects??[]).map(a=>{const e=entities.find(x=>a.id.endsWith(x.id.slice(-6))&&a.id.startsWith('acq_'));return {id:a.id,meaning:a.terms.slice(0,8).join(', ')+(e?.definition.value?' - '+e.definition.value:'')};}).sort((x,y)=>x.id.localeCompare(y.id));
 const f=noOverwrite(join(dir,'items.json'));
 writeFileSync(f,JSON.stringify({labels:{properties:[...E1.defs.properties.values()].sort((a,b)=>a.id.localeCompare(b.id)).map(p=>({id:p.id,meaning:meaning(p)})),aspects},
  items:it.map(x=>({id:x.id,page:x.page,category:x.category,pageTitle:x.title,line:x.bi,value:x.value,unit:x.unit,surface:x.surface,text:x.window})),
  sentences:q.map(x=>({id:x.id,page:x.page,category:x.category,text:x.text}))},null,1));console.log(it.length,'values',q.length,'sentences',sha(readFileSync(f)));}
// ---- check run and score (reference sealed in evaluation/s96/annotation-freeze.json before any run)
const refOf=()=>{const fz=JSON.parse(readFileSync(pub('annotation-freeze.json'),'utf8'));const f=join(ROOT,'annotation','annotations.json');const b=readFileSync(f);
 if(sha(b)!==fz.annotationsSha256)throw Error('reference does not match its seal');return JSON.parse(b);};
if(cmd==='run'){if(!LABEL)throw Error('LABEL');const ref=refOf();const it=JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8'));
 const acceptOf=x=>{const r=ref.values[x.id];if(!r)throw Error('unannotated '+x.id);return [r.property,...(r.alsoAcceptable&&r.property!=='none'?[r.alsoAcceptable]:[])];};
 const {rows:rs,ms}=runItems(it,acceptOf);for(const r of rs){r.role=ref.values[r.id].role;r.concept=ref.values[r.id].concept;}
 const t0=process.hrtime.bigint();const qi=JSON.parse(readFileSync(join(ROOT,'check-qual-items.json'),'utf8'));const qrows=[];
 for(const p of pagesOf()){const its=qi.filter(x=>x.page===p.tag);if(!its.length)continue;const pr=qualPredict(htmlOf(p),its);its.forEach((x,i)=>{const r=ref.sentences[x.id];if(!r)throw Error('unannotated '+x.id);qrows.push({id:x.id,category:x.category,ref:r.aspect,also:r.alsoAcceptable??null,Q0:pr.Q0[i],Q1:pr.Q1[i]});});}
 const qms=Number(process.hrtime.bigint()-t0)/1e6;
 writeFileSync(noOverwrite(join(PE,'s96',`check-${LABEL}-detail.json`)),JSON.stringify({validatedEntities:arms().E2.validated,rows:rs,qrows,ms,qms},null,1));console.log('rows',rs.length,'sentences',qrows.length);}
if(cmd==='score'){if(!LABEL)throw Error('LABEL');refOf();const d=JSON.parse(readFileSync(join(PE,'s96',`check-${LABEL}-detail.json`),'utf8'));const rs=d.rows;
 const HP={inputLag:/input lag|latency|delay/i,responseTime:/response time|pixel response|transition/i,brightness:/bright|luminance|nits/i,refresh:/refresh|hz/i};
 const hard=Object.fromEntries(Object.entries(HP).map(([k,re])=>[k,pack(rs.filter(r=>re.test(r.concept??'')))]));
 const results=pack(rs.filter(r=>r.role==='result'||r.role==='specification'));
 const qs=a=>{const pos=d.qrows.filter(r=>r.ref!=='not_assessment'&&!r.ref.startsWith('other:')),neg=d.qrows.filter(r=>r.ref==='not_assessment'||r.ref.startsWith('other:'));const hit=r=>r[a].includes(r.ref)||(r.also&&r[a].includes(r.also));
  return {sentences:d.qrows.length,refAspect:pos.length,found:pos.filter(hit).length,wrongOnly:pos.filter(r=>r[a].length&&!hit(r)).length,missed:pos.filter(r=>!r[a].length).length,refOtherOrNone:neg.length,falseAspect:neg.filter(r=>r[a].length).length,
   refAcquiredAspect:pos.filter(r=>r.ref.startsWith('acq_')).length,foundAcquired:pos.filter(r=>r.ref.startsWith('acq_')&&hit(r)).length};};
 const qByCat=Object.fromEntries([...new Set(d.qrows.map(r=>r.category))].map(c=>{const save=d.qrows;d.qrows=save.filter(r=>r.category===c);const o={Q0:qs('Q0'),Q1:qs('Q1')};d.qrows=save;return [c,o];}));
 const out={schema:'pee.s96.check-score.v1',label:LABEL,reference:JSON.parse(readFileSync(pub('annotation-freeze.json'),'utf8')).annotationsSha256,teaching,...armInfo(),
  overall:pack(rs),byCategory:byCat(rs),resultsAndSpecificationsOnly:results,hardPairs:hard,qualitative:{Q0:qs('Q0'),Q1:qs('Q1'),byCategory:qByCat},
  resources:{msPerValueAllArms:+(d.ms/rs.length).toFixed(2),msPerPageBothQualArms:+(d.qms/new Set(d.qrows.map(r=>r.id.split('-q')[0])).size).toFixed(1)}};
 writeFileSync(noOverwrite(pub(`check-${LABEL}.json`)),JSON.stringify(out,null,1)+'\n');
 for(const a of ARMS)console.log(a.padEnd(4),JSON.stringify(out.overall[a]));for(const [c,v] of Object.entries(out.byCategory))console.log(c,JSON.stringify(Object.fromEntries(ARMS.map(a=>[a,[v[a].correct,v[a].wrong,v[a].falseAttribution]]))));
 console.log('qual',JSON.stringify(out.qualitative.Q0),'\n    ',JSON.stringify(out.qualitative.Q1));}
