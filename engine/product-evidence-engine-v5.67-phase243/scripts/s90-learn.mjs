#!/usr/bin/env node
/** S90: learn a definitions layer from one or more waves' items WITH their document structure (structural labels seed and
 * feed learning). Each source: ROOT:ROLE:ITEMS (wave dir, page role, items file).
 *   node scripts/s90-learn.mjs --out PRIVATE_LAYER --sources ROOT:ROLE:ITEMS,... [--public PUBLIC_COUNTS] */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const sha=b=>createHash('sha256').update(b).digest('hex');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const L=await import(D+'definition_learning.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);
const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};
export function structureMap(ROOT,role){const wave=JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));const out=new Map();
 for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role===role)){const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);const html=b.toString('utf8');
  const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const sem=SEM.readDocumentSemantics1D2(html,p.url);
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});
  const k=Math.ceil(uniq.length/40)||1;uniq.filter((_,i)=>i%k===0).forEach((a,j)=>out.set(`${p.tag}-${j}`,{surface:a.surface,structure:a.bi<sem.blocks.length?I.structuralContextOf(defs,sem,blocks,a.bi,a.start):null}));}
 return out;}
const obs=[];
for(const src of (arg('sources')??'').split(',').filter(Boolean)){const [ROOT,role,itemsFile]=src.split(':');const st=structureMap(ROOT,role);const items=JSON.parse(readFileSync(itemsFile,'utf8'));
 for(const x of items){const s=st.get(x.id);if(!s||s.surface!==x.surface)throw Error('item does not realign: '+x.id);
  obs.push({docId:x.page+'@'+ROOT,publisher:x.host.replace(/^www\./,''),category:x.category,value:x.value,unit:x.unit,label:x.label,context:x.context,valueAt:x.valueAt??locate(x),surface:x.surface,pageSubject:x.pageSubject??x.title??null,structure:s.structure});}}
const layer=L.learnFromDocuments(defs,qk,obs);
for(const f of [arg('out'),arg('public')])if(f&&existsSync(f))throw Error(f+' exists');
writeFileSync(arg('out'),JSON.stringify(layer,null,1));
if(arg('public'))writeFileSync(arg('public'),JSON.stringify({schema:'pee.s90.learned-freeze.v1',sealedAt:new Date().toISOString(),layerSha256:sha(readFileSync(arg('out'))),learnedFrom:layer.learnedFrom,
 terms:{supported:layer.terms.filter(t=>t.state==='supported').length,candidate:layer.terms.filter(t=>t.state==='candidate').length},termsByProperty:Object.fromEntries([...new Set(layer.terms.map(t=>t.property))].sort().map(p=>[p,layer.terms.filter(t=>t.property===p).length])),proposals:layer.proposals.length},null,1)+'\n');
console.log('observations',obs.length,'terms',layer.terms.length,'proposals',layer.proposals.length);
for(const t of layer.terms)console.log(' T',t.state.padEnd(9),t.property.padEnd(18),JSON.stringify(t.term),'pubs',t.evidence.seedPublishers,'docs',t.evidence.seedDocs,'purity',t.evidence.purity);
for(const p of layer.proposals.slice(0,15))console.log(' P',p.kind,JSON.stringify(p.term),JSON.stringify(p.evidence));
