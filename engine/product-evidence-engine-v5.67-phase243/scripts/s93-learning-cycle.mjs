#!/usr/bin/env node
/** S93 learning cycle (owner review of S92): learn from earlier documents, verify induced concepts without gold, promote
 * them to candidate definitions, and measure whether the reading of LATER documents improves. Also the object-resolution
 * principle (a property is its quantity and its object). Sources (earlier) and targets (later): ROOT:ROLE:ITEMS[:REF[:REFKIND]]
 * REFKIND 'concept' = a reference with concept names for values outside the definitions (S92 protocol).
 *   node scripts/s93-learning-cycle.mjs --sources S,... --targets T,... [--transductive] [--out PUBLIC] [--layer PRIVATE]
 * Public output: counts; learned definitions by id, label, kind and verification (terms are short phrases, no values). */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const sha=b=>createHash('sha256').update(b).digest('hex');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const L=await import(D+'definition_learning.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);
export const LEARN_OPTIONS={typeGate:true,distributional:{minSimilarity:0.3,margin:0.05,window:5,minCount:3},relations:true,strongSeeds:true};
const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};
function load(spec){const [ROOT,role,itemsFile,refFile]=spec.split(':');const wave=JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));const pos=new Map();
 for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role===role)){const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);const html=b.toString('utf8');
  const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const sem=SEM.readDocumentSemantics1D2(html,p.url);const title=(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').trim();
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface});}});
  const seen=new Set();const u=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});const k=Math.ceil(u.length/40)||1;
  u.filter((_,i)=>i%k===0).forEach((a,j)=>pos.set(`${p.tag}-${j}`,{surface:a.surface,structure:a.bi<sem.blocks.length?I.structuralContextOf(defs,sem,blocks,a.bi,a.start):null,title}));}
 const items=JSON.parse(readFileSync(itemsFile,'utf8'));
 return {ROOT,ref:refFile?JSON.parse(readFileSync(refFile,'utf8')).items:null,obs:items.map(x=>{const z=pos.get(x.id);if(!z||z.surface!==x.surface)throw Error('realign '+x.id);
  return {id:x.id,docId:x.page+'@'+ROOT,publisher:x.host.replace(/^www\./,''),category:x.category,value:x.value,unit:x.unit,label:x.label,context:x.context,valueAt:x.valueAt??locate(x),surface:x.surface,pageSubject:x.pageSubject??x.title??null,structure:z.structure,frame:z.title};})};}
const sources=(arg('sources')??'').split(',').filter(Boolean).map(load);const targets=(arg('targets')??'').split(',').filter(Boolean).map(load);
const learnObs=[...sources.flatMap(s=>s.obs),...(process.argv.includes('--transductive')?targets.flatMap(t=>t.obs):[])];
const layer=L.learnFromDocuments(defs,qk,learnObs,L.DEFAULT_THRESHOLDS,LEARN_OPTIONS);const proposals=L.proposeDefinitions(defs,layer);
const learned=L.withLearnedDefinitions(qk,defs.pack,proposals);const promoted=proposals.filter(p=>!p.verification.failed.length);
if(arg('layer'))writeFileSync(arg('layer'),JSON.stringify({layer,proposals},null,1));
const nm=s=>String(s??'').toLowerCase();
const score=(d,opts,t)=>{const s={refPositive:0,correct:0,wrong:0,abstained:0,refNone:0,falseAttribution:0,toLearned:0,learnedMatchesReferenceConcept:0,learnedOnDefinedValue:0};
 for(const o of t.obs){const a=t.ref?.[o.id];if(!a)continue;const v=I.attributeProperty(d,qk,o,opts).value;const isL=!!v&&v.startsWith('learned_');if(isL)s.toLearned++;
  if(a.property==='none'){s.refNone++;if(isL){const p=promoted.find(x=>x.id===v);if(p&&a.concept&&p.objectNouns.some(n=>nm(a.concept).includes(n)))s.learnedMatchesReferenceConcept++;else s.falseAttribution++;}
   else if(v&&v!==a.alsoAcceptable)s.falseAttribution++;}
  else{s.refPositive++;if(isL)s.learnedOnDefinedValue++;if(!v)s.abstained++;else if(v===a.property||v===a.alsoAcceptable)s.correct++;else s.wrong++;}}return s;};
const arms={base:[defs,{}],object:[defs,{objectResolution:true}],learned:[learned,{}],learned_object:[learned,{objectResolution:true}]};
const out={schema:'pee.s93.learning-cycle.v1',learnedFrom:layer.learnedFrom,transductive:process.argv.includes('--transductive'),options:LEARN_OPTIONS,thresholds:L.PROMOTION_THRESHOLDS,
 proposals:proposals.length,promoted:promoted.map(p=>({id:p.id,label:p.label,kind:p.kind,terms:p.terms,relations:p.relations.length,verification:p.verification})),
 rejected:proposals.filter(p=>p.verification.failed.length).reduce((m,p)=>{for(const f of p.verification.failed)m[f]=(m[f]??0)+1;return m;},{}),
 attribution:Object.fromEntries(targets.map(t=>[t.ROOT.split('/').pop(),Object.fromEntries(Object.entries(arms).map(([k,[d,o]])=>[k,score(d,o,t)]))]))};
if(arg('out')){if(existsSync(arg('out')))throw Error('exists');writeFileSync(arg('out'),JSON.stringify(out,null,1)+'\n');}
console.log('proposals',out.proposals,'promoted',promoted.length,'rejected by',JSON.stringify(out.rejected));for(const p of out.promoted)console.log('  +',p.id,JSON.stringify(p.terms).slice(0,80),JSON.stringify(p.verification));
for(const [t,v] of Object.entries(out.attribution))for(const [k,s] of Object.entries(v))console.log(t,k.padEnd(15),JSON.stringify(s));
