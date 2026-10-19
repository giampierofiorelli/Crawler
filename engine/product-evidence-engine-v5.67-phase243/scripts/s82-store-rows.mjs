#!/usr/bin/env node
/** S82 (D27/D28) on the store's operational rows (test_measurements265): what the knowledge concludes from each row's
 * own record (value, unit, the reader's condition codes), next to Phase268's coded validation. Shadow; counts only in the
 * public output. Usage: node scripts/s82-store-rows.mjs [--build DIR] --out FILE */
import {writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=join(arg('build')??process.cwd(),'dist/src/');
const QK=await import(D+'quantity_knowledge.js');const KL=await import(D+'knowledge_link.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const V268=await import(D+'phase268_evidence_validation.js');
const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const qk0=QK.loadQuantityKnowledge();const qk=KL.withReaderConditions?KL.withReaderConditions(qk0):qk0;
const rows=store.testMeasurements265();
const product=id=>{const p=store.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id);return p?{name:p.name,declaredModel:p.declared_model}:null;};
const v268=V268.validateTestMeasurements268(rows,product,V268.VALIDATION_POLICY268);const ok268=new Set(v268.validated.map(v=>v.measurementId));
const T={};const inc=k=>T[k]=(T[k]??0)+1;const k=KL.categoryKnowledge(store,'air_fryers',{qk});
for(const r of rows){const f=QK.findQuantities(qk,`${r.value} ${r.unit==='kwh'?'kWh':r.unit}`)[0];if(!f){inc('unparsed');continue;}
 const codes=[...new Set([...(r.conditionCodes??[]),...(r.protocolCodes??[])])];
 const ax=KL.readerConditionAxes?KL.readerConditionAxes(codes).axes:[];
 const q=QK.typeQuantity(qk,{surface:f.surface,value:f.value,unit:f.unit},{});const q2={...q,conditions:[...q.conditions,...ax.map(([axis,value])=>({axis,value,raw:value,from:'labels'}))]};
 const l=KL.linkUnderKnowledge(qk,k,{id:r.measurementId,product:r.productId,quantity:q2});
 const ev=KL.evidenceUnderKnowledge(qk,k,[{id:r.measurementId,product:r.productId,quantity:q2,measurement:null}]);
 const forces=[...new Set(ev.results.map(x=>x.outcome+':'+x.force))].sort().join(',')||'none';
 inc(`${r.unit}|link:${l.link}|268:${ok268.has(r.measurementId)?'validated':'rejected'}|${forces}`);}
const out={schema:'pee.s82.store-rows.v1',build:arg('build')??'current',rows:rows.length,totals:Object.fromEntries(Object.entries(T).sort())};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out.totals,null,1));
