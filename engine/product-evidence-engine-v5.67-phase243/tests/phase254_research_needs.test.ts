import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type SourceInput246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {ADOPTED_LESSONS250,applyLessons250} from '../src/phase250_category_lessons.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {researchJobFromGap182,planResearchGaps182} from '../src/phase182_gap_research_orchestrator.js';
import {researchNeedsFromAdvice254,collectResearchNeeds254} from '../src/phase254_research_needs.js';
// Phase254 T1 tests, written before the bridge. Pages and products are synthetic fixtures (the Phase253 fixture).
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee254-'));const AT='2026-10-16T12:00:00.000Z';
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class',classPolicy:FACTUAL_CLASS_POLICY249};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const src=(host:string,t:SourceInput246['sourceType']='manufacturer'):SourceInput246=>({sourceId:'src_'+host.replace(/\W/g,'_'),host,sourceType:t,sourceTypeBasis:'operator_asserted'});
const page=(name:string,rows:[string,string][],gtin?:string)=>`<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({'@type':'Product',name,...(gtin?{gtin13:gtin}:{})})}</script></head>
 <body><main><h1>${name}</h1><p>Specifications for this product, as declared on this page.</p><table>${rows.map(([k,v])=>`<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table></main></body></html>`;
const ingest=(s:KnowledgeStore246,host:string,url:string,html:string,t:SourceInput246['sourceType']='manufacturer')=>s.ingestObservation246({source:src(host,t),url,sha256:sha(html),bytes:html.length,httpStatus:200,
 fetchedAt:AT,runId:'r1',extractorVersion:'spec-extractor-7',extraction:extractSpecifications245(html,url),categoryHypotheses:['air_fryers']});
function fixture(){
 const s=new KnowledgeStore246(join(dir,'s'+Math.random().toString(36).slice(2)+'.sqlite'),CLASS);
 seedCategoryHypotheses246(s,'air_fryers',AT);applyLessons250(s,ADOPTED_LESSONS250,AT);
 ingest(s,'big.example','https://big.example/p/af55',page('Big Fryer 55',[['Capacity','5.5 L'],['Weight','6 kg'],['Price','£99']]));
 ingest(s,'small.example','https://small.example/p/af40',page('Small Fryer 40',[['Capacity','4 L'],['Weight','4 kg'],['Price','£59']]));
 ingest(s,'plain.example','https://plain.example/p/af00',page('Plain Fryer',[['Weight','5 kg'],['Power','1500 W']]));
 ingest(s,'maker.example','https://maker.example/p/af60',page('Twin Fryer 60',[['Capacity','6 L'],['Weight','7 kg']],'4006381333931'));
 ingest(s,'shop.example','https://shop.example/p/twin',page('Twin Fryer 60',[['Capacity','3 L'],['Weight','7 kg']],'4006381333931'),'retailer');
 return s;
}
const pid=(s:KnowledgeStore246,name:string)=>s.products246({category:'air_fryers'}).find(p=>s.product246(p)!.name===name)!;
const A=(s:KnowledgeStore246,q:string)=>adviseFromRequest253(q,s,CATEGORY_REGISTRY250);
const key=(n:{kind:string;productId:string|null;criterion:string|null})=>`${n.kind}|${n.productId}|${n.criterion}`;

test('missing and conflicting declarations become research needs attributed to the exact product and criterion',()=>{
 const s=fixture();const needs=researchNeedsFromAdvice254(A(s,'I am looking for an air fryer of at least 5 litres'),s);
 const research=needs.filter(n=>n.destination==='research');
 assert.deepEqual(research.map(key).sort(),[`conflicting_declarations|${pid(s,'Twin Fryer 60')}|capacity_min`,`missing_declaration|${pid(s,'Plain Fryer')}|capacity_min`].sort());
 assert.ok(!needs.some(n=>n.productId===pid(s,'Big Fryer 55')||n.productId===pid(s,'Small Fryer 40')),'checked products need no research');
 assert.ok(!needs.some(n=>n.destination==='user_clarification'),'the stated capacity is not asked again');
 for(const n of research){assert.equal(n.categoryId,'air_fryers');assert.equal(n.status,'pending_authorization');
  assert.equal(n.phase182.eligible,false);assert.match(n.phase182.reason,/signed Phase181 decision/);
  assert.equal(n.phase182.jobPreview?.exactVariantId,n.productId);assert.equal(n.phase182.jobPreview?.criterionId,n.criterion);
  assert.deepEqual(n.phase182.jobPreview,researchJobFromGap182('air_fryers',n.gap181!),'the preview is exactly the Phase182 job');
  assert.equal(n.identity?.productId,n.productId);}
 s.close();
});
// G1 (owner authorisation 2026-10-21, verbatim owner-g1-authorisation-2026-10-21.md: "Prepara il collegamento fra lacune di
// conoscenza e richieste di ricerca tipizzate, anche in assenza di una categoria") supersedes "a request with no category
// creates nothing": such a request now raises only typed knowledge-gap needs, pending authorisation, which Phase257 never plans.
test('requests needing the user are clarifications, never research; a request with no category raises only typed knowledge gaps',()=>{
 const s=fixture();
 const vague=researchNeedsFromAdvice254(A(s,'a good air fryer'),s);
 assert.ok(vague.length===0||vague.every(n=>n.destination==='user_clarification'));
 const neg=researchNeedsFromAdvice254(A(s,'I need an air fryer, it does not need to be 5 litres'),s);
 assert.deepEqual(neg.map(n=>[n.kind,n.criterion,n.destination]),[['clarify_requirement','capacity_min','user_clarification']]);
 const fam=researchNeedsFromAdvice254(A(s,'A good air fryer for a family of four'),s);
 assert.ok(fam.some(n=>n.kind==='clarify_requirement'&&n.criterion==='batch_capacity'&&n.destination==='user_clarification'));
 assert.ok(fam.every(n=>n.destination!=='research'));
 const tray=researchNeedsFromAdvice254(A(s,'What kind of tray can I use to put my air fryer on?'),s);
 assert.ok(tray.every(n=>['missing_category_knowledge','missing_need_knowledge'].includes(n.kind)&&n.status==='pending_authorization'&&n.categoryId==='unscoped'));
 s.close();
});
test('a performance need asks for independent tests of the shortlisted products only, never from declarations',()=>{
 const s=fixture();const a=A(s,'I want an air fryer of at least 5 litres that makes crispy chips');
 const t=researchNeedsFromAdvice254(a,s).filter(n=>n.kind==='missing_independent_test');
 assert.deepEqual(t.map(n=>[n.productId,n.criterion]),[[pid(s,'Big Fryer 55'),'crisp_texture']]);
 assert.equal(t[0].destination,'research');assert.equal(t[0].gap181?.kind,'missing_test');
 s.close();
});
test('across requests, duplicates are merged, the budget is applied, and nothing grants authority or changes advice',()=>{
 const s=fixture();
 const qs=['I am looking for an air fryer of at least 5 litres','an air fryer of at least 5 litres under £120','I need an air fryer of at least 4 litres','a good air fryer'];
 const advices=qs.map(q=>A(s,q));const before=JSON.stringify(advices);
 const all=collectResearchNeeds254(advices,s,{maxResearch:2});
 assert.ok(all.summary.duplicatesMerged>=2);
 const conflict=all.needs.find(n=>n.kind==='conflicting_declarations')!;assert.equal(conflict.requests.length,3);
 assert.equal(all.needs.filter(n=>n.status==='pending_authorization').length,2);
 assert.ok(all.summary.omittedByBudget>=1&&all.needs.some(n=>n.status==='omitted_by_budget'));
 assert.equal(all.needs.filter(n=>n.destination==='research').map(key).length,new Set(all.needs.filter(n=>n.destination==='research').map(key)).size);
 assert.equal(all.planningOnly,true);assert.equal(all.rankingAuthorized,false);assert.equal(all.evidenceAdmitted,false);assert.equal(all.sourcePermissionsGranted,false);
 assert.equal(JSON.stringify(advices),before,'advice is not changed');
 // The trust boundary stays: a Phase182 plan still needs a Phase181 decision; the bridge offers none.
 assert.throws(()=>planResearchGaps182({decision:{phase:181} as never,categoryId:'air_fryers',categoryLabel:'Air fryers',market:'uk',asOf:AT}),/phase182_bad_plan_input/);
 assert.ok(!('decision' in all));
 // A machine-readable consumer contract for a later research-execution phase.
 assert.equal(all.schema,'pee254.research-needs.v1');
 for(const n of all.needs.filter(x=>x.destination==='research'))assert.ok(n.needId&&n.gap181&&n.phase182.jobPreview&&n.priority>=0);
 s.close();
});
