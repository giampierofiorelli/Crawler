#!/usr/bin/env node
/** S92 arm family E (evaluation/s92/preregistration.json): learn layers with the R3 non-generative mechanisms switched on one
 * by one (E0 S90 learning; E1 + semantic-type gating; E2 + PPMI distributional proposals; E3 + document concepts with typed
 * relations) and measure property attribution on target sets with each layer. Sources and targets: ROOT:ROLE:ITEMS[:REF].
 *   node scripts/s92-learn-eval.mjs --sources S,... --targets T,... [--layers DIR] [--out PUBLIC] [--arms E0,E1,E2,E3]
 * Public output: counts only (terms per state and route, proposals, relations, attribution counts). */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const sha=b=>createHash('sha256').update(b).digest('hex');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const L=await import(D+'definition_learning.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);
export const E_OPTIONS={E0:{},E1:{typeGate:true},E2:{typeGate:true,distributional:{minSimilarity:0.3,margin:0.05,window:5,minCount:3}},E3:{typeGate:true,distributional:{minSimilarity:0.3,margin:0.05,window:5,minCount:3},relations:true}};
const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};
function structureMap(ROOT,role){const wave=JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));const out=new Map();
 for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role===role)){const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);const html=b.toString('utf8');
  const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const sem=SEM.readDocumentSemantics1D2(html,p.url);
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});
  const k=Math.ceil(uniq.length/40)||1;uniq.filter((_,i)=>i%k===0).forEach((a,j)=>out.set(`${p.tag}-${j}`,{surface:a.surface,structure:a.bi<sem.blocks.length?I.structuralContextOf(defs,sem,blocks,a.bi,a.start):null}));}
 return out;}
const load=spec=>{const [ROOT,role,itemsFile,refFile]=spec.split(':');const st=structureMap(ROOT,role);const items=JSON.parse(readFileSync(itemsFile,'utf8'));
 return {ROOT,ref:refFile?JSON.parse(readFileSync(refFile,'utf8')).items:null,obs:items.map(x=>{const s=st.get(x.id);if(!s||s.surface!==x.surface)throw Error('item does not realign: '+x.id);
  return {id:x.id,docId:x.page+'@'+ROOT,publisher:x.host.replace(/^www\./,''),category:x.category,value:x.value,unit:x.unit,label:x.label,context:x.context,valueAt:x.valueAt??locate(x),surface:x.surface,pageSubject:x.pageSubject??x.title??null,structure:s.structure};})};};
const sources=(arg('sources')??'').split(',').filter(Boolean).map(load);const targets=(arg('targets')??'').split(',').filter(Boolean).map(load);
const obs=sources.flatMap(s=>s.obs);const arms=(arg('arms')??'E0,E1,E2,E3').split(',');const out={schema:'pee.s92.learn-eval.v1',definitions:defs.identity,learnedFrom:{observations:obs.length,documents:new Set(obs.map(o=>o.docId)).size},arms:{}};
const score=(d,t)=>{const s={refPositive:0,correct:0,wrong:0,abstained:0,refNone:0,falseAttribution:0};for(const o of t.obs){const a=t.ref?.[o.id];if(!a)continue;const r=I.attributeProperty(d,qk,o).value;
 if(a.property==='none'){s.refNone++;if(r&&r!==a.alsoAcceptable)s.falseAttribution++;}else{s.refPositive++;if(!r)s.abstained++;else if(r===a.property||r===a.alsoAcceptable)s.correct++;else s.wrong++;}}return s;};
out.baseline=Object.fromEntries(targets.map(t=>[t.ROOT.split('/').pop(),score(defs,t)]));
for(const arm of arms){const layer=L.learnFromDocuments(defs,qk,obs,L.DEFAULT_THRESHOLDS,E_OPTIONS[arm]);
 if(arg('layers')){mkdirSync(arg('layers'),{recursive:true});const f=join(arg('layers'),`layer-${arm}.json`);writeFileSync(f,JSON.stringify(layer,null,1));}
 const learned=L.withLearned(qk,defs.pack,layer);
 const rel=layer.proposals.filter(p=>p.relations);
 out.arms[arm]={terms:{supported:layer.terms.filter(t=>t.state==='supported').length,candidate:layer.terms.filter(t=>t.state==='candidate').length,distributional:layer.terms.filter(t=>t.evidence.via==='distributional').length},
  proposals:layer.proposals.length,concepts:new Set(rel.map(p=>p.key)).size,relations:{contains_property_term:rel.reduce((s,p)=>s+p.relations.filter(r=>r.relation==='contains_property_term').length,0),same_kind:rel.reduce((s,p)=>s+p.relations.filter(r=>r.relation==='same_kind').length,0)},
  denotes:rel.reduce((m,p)=>(m[p.denotes]=(m[p.denotes]??0)+1,m),{}),attribution:Object.fromEntries(targets.map(t=>[t.ROOT.split('/').pop(),score(learned,t)]))};
 console.log(arm,JSON.stringify(out.arms[arm]));
 if(process.argv.includes('--show'))for(const t of layer.terms)console.log('  T',t.state,t.evidence.via??'seeds',t.property,JSON.stringify(t.term),t.evidence.similarity??'');}
console.log('baseline',JSON.stringify(out.baseline));
if(arg('out')){if(existsSync(arg('out')))throw Error('exists');writeFileSync(arg('out'),JSON.stringify(out,null,1)+'\n');}
