#!/usr/bin/env node
/** R1: how each decision of the full reading is justified (its own recorded provenance). Counts only; spent pages.
 *   node scripts/r1-provenance-census.mjs LABEL   writes evaluation/r1/provenance-census-LABEL.json */
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const label=process.argv[2];const OUT=`evaluation/r1/provenance-census-${label}.json`;if(!label||existsSync(OUT))throw Error('usage: LABEL (new)');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const W=await import(D+'document_evidence.js');const PF=await import(D+'product_facts.js');
const qk=QK.loadQuantityKnowledge();const ROOT=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const C={};const inc=(k,n=1)=>C[k]=(C[k]??0)+n;const seen=new Set();let pages=0;
for(const ev of readdirSync(ROOT).sort()){const rd=join(ROOT,ev,'raw');if(!existsSync(rd))continue;for(const f of readdirSync(rd).filter(f=>f.endsWith('.html')).sort()){const b=readFileSync(join(rd,f));const h=createHash('sha256').update(b).digest('hex');if(seen.has(h))continue;seen.add(h);pages++;
 const doc=W.readDocumentEvidence(b.toString('utf8'),qk,{sourceType:'independent_review'});
 const qs=[...doc.quantities.filter(q=>!q.identifierPart&&q.quantity).map(q=>({q:q.quantity,src:'segment'})),...doc.tables.tables.flatMap(t=>t.observations.filter(o=>o.quantity).map(o=>({q:o.quantity,src:'table'})))];
 for(const {q} of qs){const j=q.kind.justification;inc('kind_justification.'+(q.kind.id?j.type:'open'));if(q.kind.id&&j.type!=='unit')inc('kind_justification_from.'+(j.from??'none'));
  const rules=j.rules??[];if(rules.length)inc('kind_with_kr_derivation');
  inc('metric.'+(q.metric.id?'named':'none'));for(const c of q.conditions)inc('condition_from.'+c.from);}
 for(const q of doc.quantities){if(q.identifierPart){inc('identifier_by_code');continue;}if(!q.quantity)continue;inc('product_basis.'+q.productBasis);inc('evidence_class.'+q.evidenceClass);}
 const pf=PF.readProductFacts(qk,doc);inc('kr_product_facts_input',Object.values(pf.facts).reduce((s,r)=>s+r.length,0));
 for(const p of ['presence','presence_not_verified','may_support','effectiveness_evidence','effectiveness_unassessed','same_state_results','different_state_results','same_named_setting'])inc('kr_product_derived.'+p,pf.model.all(p).length);
 for(const f of pf.functions)inc('function_by.'+(f.function.startsWith('named:')?'code_pattern':'vocabulary'));}}
writeFileSync(OUT,JSON.stringify({schema:'pee.r1.provenance-census.v1',label,pages,generatedAt:new Date().toISOString(),counts:C},null,1)+'\n');console.log(pages,JSON.stringify(C));
