#!/usr/bin/env node
/** S86d: what happens DOWNSTREAM to the test rows an experiment persisted into a store copy (PEE_KNOWLEDGE_DIR): Phase268
 * validation (the gate to the Phase181 catalog and ranking) with its refusal reasons, and the shared quantity typing, for
 * rows whose revision URL is in the manifest. Public output: counts only.
 *   PEE_KNOWLEDGE_DIR=DIR node scripts/s86d-downstream.mjs --manifest FILE --out FILE */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const V=await import(D+'phase268_evidence_validation.js');
const QK=await import(D+'quantity_knowledge.js');const qk=QK.loadQuantityKnowledge();
const dir=process.env.PEE_KNOWLEDGE_DIR;if(!dir)throw Error('PEE_KNOWLEDGE_DIR (a store copy) is required');
const store=new KnowledgeStore246(join(dir,'pee246.sqlite'));const urls=new Set(JSON.parse(readFileSync(arg('manifest'),'utf8')).map(p=>p.url));
const product=id=>{const p=store.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id);return p?{name:p.name,declaredModel:p.declared_model}:null;};
const rows=store.testMeasurements265().filter(r=>urls.has(r.source.url)&&r.state==='current');const v=V.validateTestMeasurements268(rows,product,V.VALIDATION_POLICY268);
const T={};const inc=k=>T[k]=(T[k]??0)+1;
for(const r of rows){inc('rows');inc(r.productId?'rows:on_page_product':'rows:subject_unresolved');const t=QK.typeStoredQuantity(qk,r);inc('typed_kind:'+(t?.unit?.kinds?.[0]??t?.kind??'untyped'));}
for(const x of v.rejected)for(const why of x.reasons)inc('refused:'+why);inc('validated',0);T.validated=v.validated.length;
const pol=V.VALIDATION_POLICY268;const out={schema:'pee.s86d.downstream.v1',store:'store copy',policy:{id:pol.policyId,protocols:pol.protocols.map(p=>({id:p.id,measurand:p.measurand,unit:p.unit})),qualifiedPublishers:pol.qualifiedPublishers.map(p=>({host:p.host,qualifiedFor:p.qualifiedFor}))},
 totals:Object.fromEntries(Object.entries(T).sort())};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out,null,1));
