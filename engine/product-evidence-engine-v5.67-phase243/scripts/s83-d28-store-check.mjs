#!/usr/bin/env node
/** S83 D28 on the real catalog: Phase268 validates the stored test rows and compiles the catalog it would sign; for each
 * catalog dimension, the conditions derived from its original-test records (per observation, S83: the dimension as
 * compiled, and the largest comparable group of complete tests of two or more products) are set beside the catalog's
 * own declaration and beside the same derivation without the reader-condition axes (ablation). Also asked of every taught measurement of
 * the category that requires conditions, so a record that does not show them is seen not to supply them. SHADOW: no
 * catalog is signed, no authorisation changes. Public output: counts and identifiers of conditions only, no values.
 * Usage: node scripts/s83-d28-store-check.mjs --out FILE */
import {writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;
const QK=await import(D+'quantity_knowledge.js');const KL=await import(D+'knowledge_link.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const V=await import(D+'phase268_evidence_validation.js');const A=await import(D+'phase253_request_advice.js');
const store=new KnowledgeStore246(join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite'));
const product=id=>{const p=store.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id);return p?{name:p.name,declaredModel:p.declared_model}:null;};
const rows=store.testMeasurements265();const v=V.validateTestMeasurements268(rows,product,V.VALIDATION_POLICY268);
const category='air_fryers';
const discovered=store.db.prepare('SELECT product_id FROM products WHERE category_hypotheses_json LIKE ?').all(`%"${category}"%`).map(x=>x.product_id);
const cat=V.compileCatalog268(v,V.SCORING_POLICY268,{categoryId:category,market:'uk',discoveredVariantIds:discovered,reviewedAt:'2026-10-19T00:00:00Z',expiresAt:'2026-11-19T00:00:00Z',validationPolicy:V.VALIDATION_POLICY268});
const qk0=QK.loadQuantityKnowledge();const k0=KL.categoryKnowledge(store,category,{qk:qk0});
const noReaders=(measurement,ids)=>{const want=new Set(ids);const tests=rows.filter(r=>want.has(r.measurementId)).map(r=>{const f=QK.findQuantities(qk0,`${r.value} ${r.unit==='kwh'?'kWh':r.unit}`)[0];
 return {id:r.measurementId,product:r.productId,quantity:f?QK.typeQuantity(qk0,{surface:f.surface,value:f.value,unit:f.unit},{}):null,measurement,source:null};});
 return KL.conditionsMetFromRecords(qk0,k0,measurement,tests,null);};
const summary=(r)=>({observations:r.observations.length,usable:r.observations.filter(o=>o.usable).length,groups:r.groups.map(g=>g.length),incompatiblePairs:r.incompatible.length,
 required:r.required,derived:r.derived,subset:r.subset&&{covered:r.subset.covered.length,setAside:r.subset.setAside.length,derived:r.subset.derived},
 perCondition:Object.fromEntries(r.required.map(c=>[c,Object.fromEntries(['verified','not_verifiable'].map(s=>[s,r.observations.filter(o=>o.conditions.some(x=>x.condition===c&&x.state===s)).length]))]))});
const needs=[...new Set(store.categoryItems246(category).filter(i=>i.concept&&i.concept.kind!=='measurement').map(i=>i.concept.id))];
const nk=A.needKnowledge269(store,category,needs);
const dims=[];
for(const d of cat.dimensions){const ids=cat.originalTests.filter(t=>t.dimensionKey===d.key).map(t=>t.originalTestId);
 const ms=d.measureId??d.key;const r=KL.conditionsMetFromStoreRecords(store,category,ms,ids,d.conditionsMet??[]);
 const asked=[...new Set(nk.flatMap(k=>[...k.byMeasure].filter(([,i])=>i.conditions.length).map(([m])=>m)))].sort();
 dims.push({dimension:d.key,measure:ms,catalogDeclared:d.conditionsMet??[],asCatalogMeasure:{...summary(r),unsupported:r.unsupported,notDeclared:r.notDeclared},
  withoutReaderAxes:summary(noReaders(ms,ids)),
  askedAsOtherMeasurements:Object.fromEntries(asked.map(m=>[m,summary(KL.conditionsMetFromStoreRecords(store,category,m,ids,null))]))});}
const out={schema:'pee.s83.d28-store-check.v1',category,rows:rows.length,validated:v.validated.length,catalogTests:cat.originalTests.length,dimensions:dims};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out,null,1));
