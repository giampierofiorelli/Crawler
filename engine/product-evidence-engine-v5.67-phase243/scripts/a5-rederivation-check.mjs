#!/usr/bin/env node
/** A5 (first increment, census and verification only): which category knowledge of the store can be re-derived from the
 * teaching held in code, on an empty in-memory store, compared by content-derived ids with a read-only store copy.
 * Nothing is written to the store copy. Usage: node scripts/a5-rederivation-check.mjs STORE_COPY [OUT_PUBLIC] */

import {DatabaseSync} from 'node:sqlite';
const D=new URL('../dist/src/',import.meta.url).href;
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {seedCategoryHypotheses246}=await import(D+'phase246_category_seeds.js');
const {seedRelations247}=await import(D+'phase247_relation_seeds.js');const {CONCEPT_VOCABULARY248}=await import(D+'phase248_concept_vocabulary.js');
const {applyTeaching252,registerTeachingSources252}=await import(D+'phase252_category_teaching.js');
const P269=await import(D+'phase269_research_teaching.js');const P270=await import(D+'phase270_teaching.js');const P271=await import(D+'phase271_category_teaching.js');const P272=await import(D+'phase272_category_teaching.js');
let L250=null;try{L250=await import(D+'phase250_category_lessons.js');}catch{}
const snap=new DatabaseSync(process.argv[2],{readOnly:true});
const cats=snap.prepare(`SELECT DISTINCT category_id FROM category_items`).all().map(r=>r.category_id);
const s=new KnowledgeStore246(':memory:');
registerTeachingSources252([...P269.RESEARCH_SOURCES269,...P269.COFFEE_SOURCES269,...P270.SOURCES270,...P271.SOURCES271,...P272.SOURCES272]);
const log=[];const tryRun=(n,f)=>{try{f();log.push([n,'ok']);}catch(e){log.push([n,String(e.message).slice(0,80)]);}};
for(const c of cats)tryRun('seed '+c,()=>seedCategoryHypotheses246(s,c));
tryRun('vocabulary',()=>{for(const [c,m] of Object.entries(CONCEPT_VOCABULARY248))for(const [id,al] of Object.entries(m))s.addConceptAliases246(c,id,al);});
for(const c of cats)tryRun('relations '+c,()=>seedRelations247(s,c));
if(L250?.applyLessons250&&L250?.ADOPTED_LESSONS250)tryRun('lessons',()=>L250.applyLessons250(s,L250.ADOPTED_LESSONS250));
for(const [n,t] of [['af269',P269.AIR_FRYER_TEACHING269],['coffee269',P269.COFFEE_TEACHING269],['af270',P270.AIR_FRYER_TEACHING270],['coffee270',P270.COFFEE_TEACHING270],['dehum270',P270.DEHUMIDIFIER_TEACHING270],
 ['dw271',P271.DISHWASHER_TEACHING271],['ap271',P271.AIR_PURIFIER_TEACHING271],['dehum271',P271.DEHUMIDIFIER_TEACHING271],['tv272',P272.TELEVISION_TEACHING272]])if(t)tryRun(n,()=>applyTeaching252(s,[t]));
const q=(db,sql)=>db.prepare(sql).all();
const cmp=(name,sql,key)=>{const a=new Set(q(snap,sql).map(key)),b=new Set(q(s.db,sql).map(key));return {table:name,snapshot:a.size,rebuilt:b.size,inBoth:[...a].filter(x=>b.has(x)).length,onlySnapshot:[...a].filter(x=>!b.has(x)).length,onlyRebuilt:[...b].filter(x=>!a.has(x)).length};};
const out=[cmp('category_items (id)',`SELECT item_id FROM category_items`,r=>r.item_id),
 cmp('category_items (id+state+aliases)',`SELECT item_id,state,aliases_json,superseded_by FROM category_items`,r=>JSON.stringify(r)),
 cmp('category_relations (id)',`SELECT relation_id FROM category_relations`,r=>r.relation_id),
 cmp('category_relations (id+qualification+support)',`SELECT relation_id,support,qualification,kind FROM category_relations`,r=>JSON.stringify(r)),
 cmp('relation_assessments',`SELECT relation_id,value FROM relation_assessments`,r=>JSON.stringify(r)),
 cmp('category_versions',`SELECT category_id,version FROM category_versions`,r=>JSON.stringify(r))];
const res={schema:"pee.a5.rederivation-check.v1",stepsNotApplicable:log.filter(x=>x[1]!=="ok").map(x=>x.join(": ")),results:out};if(process.argv[3]){const fs=await import("node:fs");if(fs.existsSync(process.argv[3]))throw Error("exists");fs.writeFileSync(process.argv[3],JSON.stringify(res,null,1)+"\n");}console.log(JSON.stringify(res.results));
