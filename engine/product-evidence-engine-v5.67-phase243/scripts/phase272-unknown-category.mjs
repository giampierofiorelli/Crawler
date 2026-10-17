#!/usr/bin/env node
/** Phase272 unknown-category pilot (tumble dryers; owner brief §7). Runs PEE's research procedure on COPIES of the live store:
 *   stage T (transfer only): gap + transferable principles + provisional hypotheses from the authored requests;
 *   stage L (learned): T plus acquisition from the method pages the research step read (private-eval/phase272 raw, role
 *   method_reference); each stage's teaching is applied with applyTeaching252 and its extraction plan compiled.
 * Writes PRIVATE_DIR/unknown/LABEL/{stage-T,stage-L}.sqlite (store copies), research JSON, plans; public summary to
 * evaluation/phase272/unknown-category-LABEL.json. Never overwrites. Usage: node scripts/phase272-unknown-category.mjs LABEL
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const label=process.argv[2];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL');
const D=resolve('dist/src')+'/';
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const {researchUnknownCategory272,acquireFromMethodPage272,teachingFromResearch272}=await import(D+'phase272_category_research.js');
const {applyTeaching252,registerTeachingSources252,registryWithTeaching252}=await import(D+'phase252_category_teaching.js');
const {compileExtractionPlan272}=await import(D+'phase272_extraction_plan.js');
const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');
const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');
const P=join(homedir(),'.local/share/product-evidence-engine/private-eval/phase272');const U=join(P,'unknown',label);
const PUB=label.startsWith('dev-')?join(U,'public.json'):`evaluation/phase272/unknown-category-${label}.json`;for(const f of [U,...(label.startsWith('dev-')?[]:[PUB])])if(existsSync(f))throw Error(f+' exists: runs are never overwritten');mkdirSync(U,{recursive:true});
const LIVE=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const SET=JSON.parse(readFileSync('evaluation/phase272/unknown-category-requests.json','utf8'));
const W=JSON.parse(readFileSync(join(P,'wave.json'),'utf8'));const sha=b=>createHash('sha256').update(b).digest('hex');
const at='2026-10-17T12:00:00.000Z';
const pick=a=>({response:a.response,category:a.category,statements:a.statements.slice(0,4),unassessed:a.unassessedObjectives??[],
 needs:(a.needs??[]).map(n=>n.id??n),ranked:a.response==='ranked_recommendation',decision:a.goalAssessment?.decision??null});
// The gap, before any research: the request path on the live knowledge.
const live=new KnowledgeStore246(LIVE);const before=SET.research.map(t=>({text:t,...pick(adviseFromRequest253(t,live,CATEGORY_REGISTRY250))}));
const reuseBefore=pick(adviseFromRequest253(SET.reuse,live,CATEGORY_REGISTRY250));
let research=researchUnknownCategory272(live,SET.term,SET.research,TAUGHT);live.close();
function stage(name,r){
 const file=join(U,`stage-${name}.sqlite`);copyFileSync(LIVE,file);const s=new KnowledgeStore246(file);
 const teaching=teachingFromResearch272(r,'2026-10-17');registerTeachingSources252(r.sources);
 const applied=applyTeaching252(s,[teaching],at);
 const plan=compileExtractionPlan272(s,r.categoryId,teaching.registry.aliases,TAUGHT);
 const reg=registryWithTeaching252(CATEGORY_REGISTRY250,[teaching]);const reuse=pick(adviseFromRequest253(SET.reuse,s,reg));s.close();
 writeFileSync(join(U,`plan-${name}.json`),JSON.stringify(plan,null,1));writeFileSync(join(U,`teaching-${name}.json`),JSON.stringify(teaching,null,1));
 return {teaching,applied,plan,reuse};
}
const T=stage('T',research);
for(const p of W.pages.filter(p=>p.role==='method_reference'&&p.category==='tumble_dryers'&&p.outcome==='fetched')){
 const b=readFileSync(join(P,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('receipt '+p.tag);
 research=acquireFromMethodPage272(research,{url:p.finalUrl??p.url,publisher:new URL(p.finalUrl??p.url).host,html:b.toString('utf8'),consulted:p.fetchedAt.slice(0,10)});
}
const L=stage('L',research);
writeFileSync(join(U,'research.json'),JSON.stringify(research,null,1));
const view=x=>({outcomes:x.teaching.needs.map(n=>({id:n.id,basis:n.outcome?.basis,aliases:n.aliases})),gaps:x.teaching.gaps.length,applied:{items:x.applied.items,relations:x.applied.relations},
 plan:{digest:x.plan.compiledFrom.digest,units:x.plan.units,measurements:x.plan.measurements.map(m=>m.id),outcomes:x.plan.outcomes.map(o=>o.id)},reuse:x.reuse});
const out={schema:'pee272.unknown-category-run.v1',label,at:new Date().toISOString(),term:SET.term,requestsSha256:sha(readFileSync('evaluation/phase272/unknown-category-requests.json')),
 gapBefore:before,reuseBefore,principles:research.principles.map(p=>({dimension:p.dimension,categories:p.categories,measures:p.measures.length,conditions:p.conditions.length,proxies:p.proxyAttributes.length})),
 hypotheses:research.outcomes.map(o=>({id:o.id,status:o.status,transferredFrom:[...new Set(o.transferredFrom.map(t=>t.categoryId+':'+t.outcome))],requestPhrases:o.requestPhrases,confirmedBy:o.confirmedBy})),
 leads:research.leads,sources:research.sources.map(s=>({id:s.id,url:s.url})),stageT:view(T),stageL:view(L)};
writeFileSync(PUB,JSON.stringify(out,null,1)+'\n');writeFileSync(join(U,'summary.json'),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
