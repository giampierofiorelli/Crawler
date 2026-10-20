#!/usr/bin/env node
/** S93: blind annotation input for provenance, nature of the result and evidence lines on spent sets (development).
 *   node scripts/s93-nature-input.mjs OUTDIR SET:ROLE ...   (items with a reference property only; page text by reader line) */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const P=join(homedir(),'.local/share/product-evidence-engine/private-eval');const D=new URL('../dist/src/',import.meta.url).href;
const QK=await import(D+'quantity_knowledge.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const qk=QK.loadQuantityKnowledge();
const [OUT,...sets]=process.argv.slice(2);mkdirSync(join(OUT,'pages'),{recursive:true});const items=[];
for(const s of sets){const [S,role]=s.split(':');const R=join(P,S);const wave=JSON.parse(readFileSync(join(R,'wave.json'),'utf8'));const ref=JSON.parse(readFileSync(join(R,'annotations.json'),'utf8')).items;
 const its=new Map(JSON.parse(readFileSync(join(R,'check-items.json'),'utf8')).map(x=>[x.id,x]));
 for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role===role)){const html=readFileSync(join(R,'raw',p.tag+'.html'),'utf8');const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface});}});
  const seen=new Set();const u=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});const k=Math.ceil(u.length/40)||1;
  const pid=S+'-'+p.tag;let used=false;
  u.filter((_,i)=>i%k===0).forEach((a,j)=>{const id=`${p.tag}-${j}`;const x=its.get(id);if(!x||x.surface!==a.surface)throw Error('realign '+id);if(!ref[id]||ref[id].property==='none')return;used=true;
   items.push({id:S+':'+id,page:pid,line:a.bi,value:x.value,unit:x.unit,surface:x.surface,text:x.window});});
  if(used&&!existsSync(join(OUT,'pages',pid+'.txt')))writeFileSync(join(OUT,'pages',pid+'.txt'),blocks.map((b,i)=>`L${i}: ${b.replace(/\s+/g,' ')}`).join('\n'));}}
const f=join(OUT,'items.json');if(existsSync(f))throw Error('exists');writeFileSync(f,JSON.stringify({items},null,1));
console.log(items.length,'items',createHash('sha256').update(readFileSync(f)).digest('hex'));
