#!/usr/bin/env node
/** S91 independent check (evaluation/s91/preregistration.json): the S90 check script with the S91 arms (documentary context,
 * positive-evidence role) and per-role metrics (precision, coverage, abstention).
 * S90 header: S90 independent check (evaluation/s90/preregistration.json): the S89 check script with the S90 arms and structure.
 * Original header: S89 independent check (evaluation/s89/preregistration.json). Pages of the S89 wave (private-eval/s89/wave.json):
 * role 'regression' = learn set (vocabulary learning only), role 'heldout_eval' = check set (never-seen publishers).
 * Items: same rule as S88 E4 (every quantity with a QK unit in the text blocks, evenly sampled, at most 40 per page).
 *   items                  write learn and check items (private)
 *   learn                  learn a layer from the S88 E4 items + the learn items; write it (private) and its hash (public)
 *   input                  write the blind annotator's input for the check items
 *   run LABEL ARM          ARM = s88 (S88 code at 220fdff, pd.2, profile licence) | pd3 | pd3learned | unitkind ; once per LABEL
 *   score LABEL            score against the sealed reference (evaluation/s89/annotation-freeze.json)
 * Public output: counts only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');const P=join(homedir(),'.local/share/product-evidence-engine/private-eval');const ROOT=join(P,'s91');
const pub=f=>new URL('../evaluation/s91/'+f,import.meta.url);
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');const L=await import(D+'definition_learning.js');
const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');const qk=QK.loadQuantityKnowledge();
const [cmd,LABEL,ARM]=process.argv.slice(2);
const noOverwrite=f=>{if(existsSync(f))throw Error(f+' exists: never overwritten');return f;};
function itemsFor(role){const wave=JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));const out=[];
 for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role===role)){const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);const html=b.toString('utf8');
  const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const title=(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').replace(/\s+/g,' ').trim().slice(0,140);
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface,value:q.value??q.low,unit:q.unitSurface});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});
  const k=Math.ceil(uniq.length/40)||1;
  uniq.filter((_,i)=>i%k===0).forEach((a,j)=>{const bl=blocks[a.bi];const ls=Math.max(0,a.start-80);
   out.push({id:`${p.tag}-${j}`,bi:a.bi,start:a.start,page:p.tag,host:new URL(p.url).hostname,category:p.category,title,pageSubject:title.split(/[|:–-]/)[0].replace(/\b(review|tested|test bench|best)\b.*$/i,'').trim()||null,
    value:a.value,unit:a.unit,surface:a.surface,window:bl.slice(Math.max(0,a.start-160),a.end+160),label:bl.slice(ls,a.end+30),valueAt:a.start-ls,context:bl.slice(0,600)});});}
 return out;}
const obsOf=x=>({value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt,surface:x.surface,pageSubject:x.pageSubject});
const SEAL='annotation-freeze.json';
if(cmd==='items'){writeFileSync(noOverwrite(join(ROOT,'check-items.json')),JSON.stringify(itemsFor('heldout_eval'),null,1));
 for(const f of ['check-items.json']){const it=JSON.parse(readFileSync(join(ROOT,f),'utf8'));console.log(f,it.length,JSON.stringify(Object.fromEntries([...new Set(it.map(x=>x.category+' @ '+x.host))].map(g=>[g,it.filter(x=>x.category+' @ '+x.host===g).length]))));}}
if(cmd==='learn'){const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};
 const s88=JSON.parse(readFileSync(join(P,'s88/e4-items.json'),'utf8')).map(x=>({...x,valueAt:x.valueAt??locate(x)}));const learn=JSON.parse(readFileSync(join(ROOT,'learn-items.json'),'utf8'));
 const obs=[...s88,...learn].map(x=>({...obsOf(x),docId:x.page,publisher:x.host.replace(/^www\./,'')}));
 const layer=L.learnFromDocuments(PD.loadPropertyDefinitions(qk),qk,obs);const f=noOverwrite(join(ROOT,'learned-layer.json'));writeFileSync(f,JSON.stringify(layer,null,1));
 writeFileSync(noOverwrite(pub('learned-layer-freeze.json').pathname),JSON.stringify({schema:'pee.s89.learned-freeze.v1',sealedAt:new Date().toISOString(),layerSha256:sha(readFileSync(f)),learnedFrom:layer.learnedFrom,terms:layer.terms.length,
  termsByProperty:Object.fromEntries([...new Set(layer.terms.map(t=>t.property))].sort().map(p=>[p,layer.terms.filter(t=>t.property===p).length])),proposals:layer.proposals.length,note:'learned from S88 pages + S89 learn set only; frozen before the check reference exists'},null,1)+'\n');
 console.log('terms',layer.terms.length,'proposals',layer.proposals.length);for(const t of layer.terms)console.log(' T',t.property,JSON.stringify(t.term),t.evidence.seedPublishers,t.evidence.seedDocs,t.evidence.purity);for(const p of layer.proposals)console.log(' P',p.kind,JSON.stringify(p.term),JSON.stringify(p.evidence));}
if(cmd==='input'){const it=JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8'));const defs=PD.loadPropertyDefinitions(qk);const f=noOverwrite(join(ROOT,'annotation-input.json'));
 writeFileSync(f,JSON.stringify({labels:{properties:[...defs.properties.values()].map(p=>({id:p.id,meaning:`${p.label} (${p.form}; about: ${p.object})`})),dimensions:[...defs.dimensions.values()].map(d=>({id:d.id,meaning:d.label}))},
  items:it.map(x=>({id:x.id,category:x.category,pageTitle:x.title,value:x.value,unit:x.unit,surface:x.surface,text:x.window}))},null,1));console.log(it.length,'items',sha(readFileSync(f)));}
const structures=()=>{const wave=JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));const defs=PD.loadPropertyDefinitions(qk);const m=new Map();
 for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role==='heldout_eval')){const html=readFileSync(join(ROOT,'raw',p.tag+'.html'),'utf8');const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const sem=SEM.readDocumentSemantics1D2(html,p.url);m.set(p.tag,{blocks,sem});}
 return x=>{const d=m.get(x.page);return x.bi<d.sem.blocks.length?I.documentContextOf(defs,d.sem,d.blocks,x.bi,x.start):null;};};
if(cmd==='run'){const f=noOverwrite(join(ROOT,`run-${LABEL}.json`));const it=JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8'));let rows,identity;
 if(ARM==='s89'){const B='/home/user/s89-build/engine/product-evidence-engine-v5.67-phase243/dist/src/';const Q9=await import(B+'quantity_knowledge.js');const P9=await import(B+'property_definitions.js');const I9=await import(B+'definition_interpreter.js');
  const q9=Q9.loadQuantityKnowledge();const d9=P9.loadPropertyDefinitions(q9);identity=d9.identity;
  rows=it.map(x=>{const r=I9.interpretWithDefinitions(d9,q9,obsOf(x));return {id:x.id,property:r.property.value,role:r.role.value,roleReason:r.role.reason,subject:r.subject,basis:r.basis.value,conditions:r.conditions.filter(c=>c.dimension&&c.value).map(c=>({dimension:c.dimension}))};});}
 else{let defs=PD.loadPropertyDefinitions(qk);if(ARM==='s91learned'){const layer=JSON.parse(readFileSync(join(P,'s90','learned-layer.json'),'utf8'));defs=L.withLearned(qk,defs.pack,layer);}identity=defs.identity;
  const stOf=ARM!=='unitkind'?structures():null;const ropt=ARM==='s90role'?{roleModel:'s90'}:{};
  rows=it.map(x=>{const o={...obsOf(x),structure:stOf?stOf(x):null};if(ARM==='unitkind'){const r=I.attributeProperty(defs,qk,o);const c=r.value?[r.value,...r.alternatives]:r.alternatives;return {id:x.id,property:c.length===1?c[0]:null,role:null,subject:null,basis:null,conditions:[]};}
   const r=I.interpretWithDefinitions(defs,qk,o,ropt);return {id:x.id,property:r.property.value,propertyState:r.property.state,evidence:r.property.evidence,role:r.role.value,roleReason:r.role.reason,subject:r.subject,basis:r.basis.value,conditions:r.conditions.filter(c=>c.dimension&&c.value).map(c=>({dimension:c.dimension}))};});}
 writeFileSync(f,JSON.stringify({label:LABEL,arm:ARM,definitions:identity,at:new Date().toISOString(),rows},null,1));console.log(LABEL,ARM,identity,rows.filter(r=>r.property).length,'/',rows.length,'attributed');}
if(cmd==='score'){const fr=JSON.parse(readFileSync(pub('annotation-freeze.json'),'utf8'));const rb=readFileSync(join(ROOT,'annotations.json'));if(sha(rb)!==fr.annotationsSha256)throw Error('reference does not match its seal');
 const ref=JSON.parse(rb).items;const run=JSON.parse(readFileSync(join(ROOT,`run-${LABEL}.json`),'utf8'));const it=new Map(JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8')).map(x=>[x.id,x]));
 const ROLE={measured_result:'measured_by_publisher',declared_spec:'declared_spec',certified_or_quoted:'quoted_other_source',test_condition:'test_condition',programme_preset:'test_condition',derived:'other',derived:'other'};
 const S=rows=>{const s={items:0,refPositive:0,correct:0,wrong:0,abstained:0,refNone:0,falseAttribution:0,correctNone:0,conditions:{annotated:0,produced:0,matched:0},basis:{annotated:0,correct:0,wrong:0},
  role:{annotated:0,correct:0,trivialCorrect:0,trivialDeclared:0,abstained:0,perClass:{}},subject:{annotated:0,correct:0}};
  const CL=['measured_by_publisher','declared_spec','quoted_other_source','test_condition','other'];for(const c of CL)s.role.perClass[c]={reference:0,predicted:0,correct:0,abstained:0};
  for(const r of rows){const a=ref[r.id];if(!a)continue;s.items++;const ok=x=>x&&(x===a.property||x===a.alsoAcceptable);
   if(a.property==='none'){s.refNone++;if(r.property&&r.property!==a.alsoAcceptable)s.falseAttribution++;else s.correctNone++;}
   else{s.refPositive++;if(!r.property)s.abstained++;else if(ok(r.property))s.correct++;else s.wrong++;}
   const ac=(a.conditions??[]).map(c=>c.dimension);s.conditions.annotated+=ac.length;s.conditions.produced+=r.conditions.length;const pool=[...ac];for(const c of r.conditions){const i=pool.indexOf(c.dimension);if(i>=0){pool.splice(i,1);s.conditions.matched++;}}
   if(a.basis&&a.basis!=='unclear'&&a.property!=='none'){s.basis.annotated++;if((r.basis??null)===a.basis)s.basis.correct++;else if(r.basis&&r.basis!=='none')s.basis.wrong++;}
   if(a.role&&a.property!=='none'){s.role.annotated++;const pr=r.role&&r.role!=='unresolved'?ROLE[r.role]:null;if(pr===a.role)s.role.correct++;if(a.role==='measured_by_publisher')s.role.trivialCorrect++;if(a.role==='declared_spec')s.role.trivialDeclared++;
    if(!pr)s.role.abstained++;const g=s.role.perClass[a.role];if(g){g.reference++;if(!pr)g.abstained++;}const pc=pr&&s.role.perClass[pr];if(pc){pc.predicted++;if(pr===a.role)pc.correct++;}}
   if(a.subject&&a.property!=='none'){s.subject.annotated++;if(r.subject&&(r.subject==='page_product'?'reviewed_product':r.subject==='other_product'?'other_product':'unclear')===a.subject)s.subject.correct++;}}
  return s;};
 const rows=run.rows;const by=f=>Object.fromEntries([...new Set(rows.map(r=>f(it.get(r.id))))].sort().map(k=>[k,S(rows.filter(r=>f(it.get(r.id))===k))]));
 const out={schema:'pee.s89.check-score.v1',label:LABEL,arm:run.arm,definitions:run.definitions,reference:fr.annotationsSha256,overall:S(rows),byCategory:by(x=>x.category),byGroup:by(x=>x.category+' @ '+x.host)};
 writeFileSync(noOverwrite(pub(`check-${LABEL}.json`).pathname),JSON.stringify(out,null,1)+'\n');
 console.log(LABEL,JSON.stringify(out.overall));for(const [g,v] of Object.entries(out.byGroup))console.log(' ',g.padEnd(44),JSON.stringify({c:v.correct,w:v.wrong,a:v.abstained,fa:v.falseAttribution,pos:v.refPositive,none:v.refNone,role:v.role}));}
