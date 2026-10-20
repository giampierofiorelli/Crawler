#!/usr/bin/env node
/** S91: evidence role per class (owner review of S90): for each reference role, precision, coverage and abstention, beside the
 * trivial baselines (all measured, all declared), on waves whose items and blind references exist. Property attribution is
 * scored too. A predicted 'unresolved' is an abstention, never counted as an error of a class.
 *   node scripts/s91-role-eval.mjs --sets ROOT:ROLE:ITEMS:REF,... [--out PUBLIC] [--detail PRIVATE] [--learned LAYER] */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const sha=b=>createHash('sha256').update(b).digest('hex');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const L=await import(D+'definition_learning.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');
const qk=QK.loadQuantityKnowledge();let defs=PD.loadPropertyDefinitions(qk);if(arg('learned'))defs=L.withLearned(qk,defs.pack,JSON.parse(readFileSync(arg('learned'),'utf8')));
const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};
function contexts(ROOT,role){const wave=JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));const out=new Map();
 for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role===role)){const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);const html=b.toString('utf8');
  const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const sem=SEM.readDocumentSemantics1D2(html,p.url);
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});
  const k=Math.ceil(uniq.length/40)||1;uniq.filter((_,i)=>i%k===0).forEach((a,j)=>out.set(`${p.tag}-${j}`,{surface:a.surface,
   structure:a.bi<sem.blocks.length?I.documentContextOf(defs,sem,blocks,a.bi,a.start):null}));}
 return out;}
const ROLE={measured_result:'measured_by_publisher',declared_spec:'declared_spec',certified_or_quoted:'quoted_other_source',test_condition:'test_condition',programme_preset:'test_condition',derived:'other'};
const rows=[];
for(const s of (arg('sets')??'').split(',').filter(Boolean)){const [ROOT,role,itemsF,refF]=s.split(':');const ctx=contexts(ROOT,role);const items=JSON.parse(readFileSync(itemsF,'utf8'));const ref=JSON.parse(readFileSync(refF,'utf8')).items;
 for(const x of items){const c=ctx.get(x.id);if(!c||c.surface!==x.surface)throw Error('item does not realign '+x.id);const a=ref[x.id];
  const o={value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt??locate(x),surface:x.surface,pageSubject:x.pageSubject??null,structure:c.structure};
  const r=I.interpretWithDefinitions(defs,qk,o);
  rows.push({set:ROOT.split('/').pop(),id:x.id,host:x.host,refProperty:a.property,also:a.alsoAcceptable??null,refRole:a.role??null,property:r.property.value,role:r.role.value?ROLE[r.role.value]??'unresolved':'unresolved',roleReason:r.role.reason});}}
const CLASSES=['measured_by_publisher','declared_spec','quoted_other_source','test_condition','other'];
const roleScore=rs=>{const ann=rs.filter(r=>r.refProperty!=='none'&&r.refRole);const out={annotated:ann.length,abstained:ann.filter(r=>r.role==='unresolved').length,correct:ann.filter(r=>r.role===r.refRole).length,
 baselineAllMeasured:ann.filter(r=>r.refRole==='measured_by_publisher').length,baselineAllDeclared:ann.filter(r=>r.refRole==='declared_spec').length,perClass:{}};
 for(const c of CLASSES){const gold=ann.filter(r=>r.refRole===c),pred=ann.filter(r=>r.role===c);
  out.perClass[c]={reference:gold.length,predicted:pred.length,correct:pred.filter(r=>r.refRole===c).length,precision:pred.length?+(pred.filter(r=>r.refRole===c).length/pred.length).toFixed(3):null,
   coverage:gold.length?+(gold.filter(r=>r.role!=='unresolved').length/gold.length).toFixed(3):null,recall:gold.length?+(gold.filter(r=>r.role===c).length/gold.length).toFixed(3):null,abstained:gold.filter(r=>r.role==='unresolved').length};}
 return out;};
const propScore=rs=>{const s={refPositive:0,correct:0,wrong:0,abstained:0,refNone:0,falseAttribution:0};for(const r of rs){if(r.refProperty==='none'){s.refNone++;if(r.property&&r.property!==r.also)s.falseAttribution++;}
 else{s.refPositive++;if(!r.property)s.abstained++;else if(r.property===r.refProperty||r.property===r.also)s.correct++;else s.wrong++;}}return s;};
const sets=[...new Set(rows.map(r=>r.set))];
const out={schema:'pee.s91.role-eval.v1',definitions:defs.identity,overall:{role:roleScore(rows),property:propScore(rows)},bySet:Object.fromEntries(sets.map(s=>[s,{role:roleScore(rows.filter(r=>r.set===s)),property:propScore(rows.filter(r=>r.set===s))}]))};
if(arg('out')){if(existsSync(arg('out')))throw Error('exists');writeFileSync(arg('out'),JSON.stringify(out,null,1)+'\n');}if(arg('detail'))writeFileSync(arg('detail'),JSON.stringify(rows,null,1));
for(const [s,v] of Object.entries(out.bySet)){console.log(s,'property',JSON.stringify(v.property));const r=v.role;console.log('  role correct',r.correct+'/'+r.annotated,'abstained',r.abstained,'| all-measured',r.baselineAllMeasured,'all-declared',r.baselineAllDeclared);
 for(const [c,p] of Object.entries(r.perClass))if(p.reference||p.predicted)console.log('   ',c.padEnd(22),JSON.stringify(p));}
