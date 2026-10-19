#!/usr/bin/env node
/** S86: the shared typing of the observations already in the store (read only; legacy unit keys from earlier readers are
 * typed as they are, nothing is rewritten). Public output: counts per unit key, kind, metric and status, no values.
 *   node scripts/s86-stored-typing.mjs --out FILE */
import {writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const store=new KnowledgeStore246(join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite'));
const qk=QK.loadQuantityKnowledge();const T={};const inc=k=>T[k]=(T[k]??0)+1;
for(const r of store.testMeasurements265()){const t=QK.typeObservedValue(qk,{value:r.value,unit:r.unit,labels:[r.condition,r.instrument].filter(Boolean)});
 inc(`test_rows|${r.unit}->${t.unit}|${t.kind??'-'}|${t.metric??'-'}|${t.status}`);}
for(const r of store.comparativeResults271({})){const t=QK.typeObservedValue(qk,{value:r.value,unit:r.unit});
 inc(`comparative_rows|${r.measurand}|${r.unit}->${t.unit}|${t.kind??'-'}|${t.status}`);}
store.close();const out={schema:'pee.s86.stored-typing.v1',totals:Object.fromEntries(Object.entries(T).sort())};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out.totals,null,1));
