#!/usr/bin/env node
/** S90: the definition interpreter with and without the document's structure (Step 1D-A2 semantics reused), on a wave whose
 * items and blind reference already exist. Rebuilds each item's reader block (same item rule as S88 E4 / S89) and verifies
 * it item by item, then scores property, role and subject.
 *   node scripts/s90-structure-eval.mjs --root PRIVATE_WAVE_DIR --items FILE --ref FILE [--role heldout_eval] [--out PUBLIC] [--learned LAYER]
 * Development material only unless the protocol of a later wave says otherwise. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const sha=b=>createHash('sha256').update(b).digest('hex');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const L=await import(D+'definition_learning.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');
const qk=QK.loadQuantityKnowledge();let defs=PD.loadPropertyDefinitions(qk);if(arg('learned'))defs=L.withLearned(qk,defs.pack,JSON.parse(readFileSync(arg('learned'),'utf8')));
const ROOT=arg('root');const wave=JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));const role=arg('role')??'heldout_eval';
const items=JSON.parse(readFileSync(arg('items'),'utf8'));const ref=JSON.parse(readFileSync(arg('ref'),'utf8')).items;
// rebuild block indices with the item rule, then attach structure
export const withStructure=(pages)=>{const out=new Map();
 for(const p of pages){const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);const html=b.toString('utf8');
  const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const sem=SEM.readDocumentSemantics1D2(html,p.url);
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});
  const k=Math.ceil(uniq.length/40)||1;
  uniq.filter((_,i)=>i%k===0).forEach((a,j)=>{const id=`${p.tag}-${j}`;out.set(id,{surface:a.surface,structure:a.bi<sem.blocks.length?I.structuralContextOf(defs,sem,blocks,a.bi,a.start):null});});}
 return out;};
const pages=wave.pages.filter(p=>p.outcome==='fetched'&&p.role===role);const st=withStructure(pages);
let mismatch=0;for(const x of items){const s=st.get(x.id);if(!s||s.surface!==x.surface)mismatch++;}if(mismatch)throw Error(mismatch+' items do not realign');
const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};
const ROLE={measured_result:'measured_by_publisher',declared_spec:'declared_spec',certified_or_quoted:'quoted_other_source',test_condition:'test_condition',programme_preset:'test_condition',derived:'other',unresolved:'other'};
const run=(useStructure)=>items.map(x=>{const o={value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt??locate(x),surface:x.surface,pageSubject:x.pageSubject??null,structure:useStructure?st.get(x.id).structure:null};
 const r=I.interpretWithDefinitions(defs,qk,o);return {id:x.id,host:x.host,category:x.category,property:r.property.value,role:r.role.value,roleReason:r.role.reason,container:o.structure?.container??null,sectionRole:o.structure?.sectionRole??null};});
const S=rows=>{const s={items:0,refPositive:0,correct:0,wrong:0,abstained:0,refNone:0,falseAttribution:0,correctNone:0,role:{annotated:0,correct:0,trivial:0}};
 for(const r of rows){const a=ref[r.id];if(!a)continue;s.items++;const ok=x=>x&&(x===a.property||x===a.alsoAcceptable);
  if(a.property==='none'){s.refNone++;if(r.property&&r.property!==a.alsoAcceptable)s.falseAttribution++;else s.correctNone++;}else{s.refPositive++;if(!r.property)s.abstained++;else if(ok(r.property))s.correct++;else s.wrong++;}
  if(a.role&&a.property!=='none'){s.role.annotated++;if(r.role&&ROLE[r.role]===a.role)s.role.correct++;if(a.role==='measured_by_publisher')s.role.trivial++;}}
 return s;};
const res={without:run(false),with:run(true)};const by=(rows,f)=>Object.fromEntries([...new Set(rows.map(f))].sort().map(k=>[k,S(rows.filter(r=>f(r)===k))]));
const out={schema:'pee.s90.structure-eval.v1',definitions:defs.identity,items:items.length,without:S(res.without),with:S(res.with),byGroupWith:by(res.with,r=>r.category+' @ '+r.host),
 containers:Object.fromEntries(['table_cell','label_value','prose'].map(c=>[c,res.with.filter(r=>r.container===c).length]))};
if(arg('out')){if(existsSync(arg('out')))throw Error('exists');writeFileSync(arg('out'),JSON.stringify(out,null,1)+'\n');}
if(arg('detail'))writeFileSync(arg('detail'),JSON.stringify(res,null,1));
console.log('without',JSON.stringify(out.without));console.log('with   ',JSON.stringify(out.with));console.log('containers',JSON.stringify(out.containers));
for(const [g,v] of Object.entries(out.byGroupWith))console.log(' ',g.padEnd(44),JSON.stringify({c:v.correct,w:v.wrong,a:v.abstained,fa:v.falseAttribution,pos:v.refPositive,role:v.role}));
