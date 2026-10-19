#!/usr/bin/env node
/** R3: what the store holds for a category, as plain text for the blind comparison (items, relations) plus what the
 * executable knowledge can express (relation kinds, QK axes with values). Private output. */
import {writeFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const D=new URL('../dist/src/',import.meta.url).href;const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {relations247}=await import(D+'phase247_category_relations.js');
const QK=await import(D+'quantity_knowledge.js');const qk=QK.loadQuantityKnowledge();
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const s=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
for(const cat of process.argv.slice(2)){const items=s.categoryItems246(cat);const rels=relations247(s,cat);const by=new Map(items.map(i=>[i.itemId,i]));
 const name=r=>r.startsWith('item:')?(by.get(r.slice(5))?.concept?.id??r):r;
 writeFileSync(join(PE,'r3/compare',`store-${cat}.json`),JSON.stringify({category:cat,
  items:items.map(i=>({id:i.itemId,section:i.section,class:i.knowledgeClass,concept:i.concept?{kind:i.concept.kind,id:i.concept.id}:null,statement:i.statement})),
  relations:rels.map(r=>({id:r.relationId,kind:r.kind,from:name(r.from),to:name(r.to),support:r.support,qualification:r.qualification})),
  executable:{relationKinds:['measured_by','requires_condition','not_sufficient_for','enables','may_support','may_risk'],conceptKinds:[...new Set(items.map(i=>i.concept?.kind).filter(Boolean))],
   quantityKinds:[...qk.kinds.keys()],metrics:[...qk.metrics.keys()],conditionAxes:[...qk.axes.values()].map(a=>({axis:a.id,values:Object.keys(a.values??{})}))}},null,1));
 console.log(cat,items.length,rels.length);}
s.close();
