import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type SourceInput246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {ADOPTED_LESSONS250,applyLessons250} from '../src/phase250_category_lessons.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {collectResearchNeeds254} from '../src/phase254_research_needs.js';
import {researchJobFromGap182} from '../src/phase182_gap_research_orchestrator.js';
import {planResearchFromNeeds257,validateResearchPolicy257,type ResearchPolicy257} from '../src/phase257_research_planning.js';
// Phase257 Stage 2, written before the planner. Synthetic fixture (the Phase254 one); no network, no store write.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee257-'));const AT='2026-10-16T12:00:00.000Z';const NOW=new Date('2026-10-17T00:00:00.000Z');
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
 ingest(s,'plain.example','https://plain.example/p/af00',page('Plain Fryer',[['Weight','5 kg'],['Power','1500 W']]));
 ingest(s,'maker.example','https://maker.example/p/af60',page('Twin Fryer 60',[['Capacity','6 L'],['Weight','7 kg']],'4006381333931'));
 ingest(s,'shop.example','https://shop.example/p/twin',page('Twin Fryer 60',[['Capacity','3 L'],['Weight','7 kg']],'4006381333931'),'retailer');
 return s;
}
export const POLICY:ResearchPolicy257={schema:'pee257.research-policy.v1',policyId:'pee_first_research_policy',revision:1,market:'uk',
 issuedAt:'2026-10-16T00:00:00.000Z',expiresAt:'2026-11-15T00:00:00.000Z',categories:['air_fryers','coffee_machines','kettles','toasters','blenders'],
 needKinds:['missing_declaration','declaration_conflict'],maxJobsPerPlan:20,allowSourceReads:false,maxSourceReads:0,maxWorkerTasks:0};
const needsOf=(s:KnowledgeStore246,qs:string[],max=20)=>collectResearchNeeds254(qs.map(q=>adviseFromRequest253(q,s,CATEGORY_REGISTRY250)),s,{maxResearch:max});
const ID=/^[a-z][a-z0-9_.:-]{0,100}$/;
const plan=(needs:ReturnType<typeof needsOf>,policy=POLICY,extra:Partial<Parameters<typeof planResearchFromNeeds257>[0]>={})=>
 planResearchFromNeeds257({needs,categoryId:'air_fryers',categoryLabel:'Air fryers',policy,asOf:NOW.toISOString(),now:NOW,...extra});

test('policies are validated strictly: Phase257 restrictions, explicit market, 30-day expiry, no unknown fields',()=>{
 assert.equal(validateResearchPolicy257(POLICY,NOW).policyId,'pee_first_research_policy');
 for(const [bad,re] of [[{...POLICY,allowSourceReads:true},/source reads/],[{...POLICY,maxSourceReads:1},/source reads/],[{...POLICY,maxWorkerTasks:1},/workers/],
  [{...POLICY,needKinds:['missing_test']},/need kind/],[{...POLICY,categories:[]},/categories/],[{...POLICY,market:''},/market/],
  [{...POLICY,expiresAt:'2027-01-01T00:00:00.000Z'},/30 days/],[{...POLICY,maxJobsPerPlan:50},/maxJobsPerPlan/],[{...POLICY,grant:'all'},/unknown field/]] as const)
  assert.throws(()=>validateResearchPolicy257(bad,NOW),re);
 assert.throws(()=>validateResearchPolicy257(POLICY,new Date('2026-12-01T00:00:00.000Z')),/expired/);
});
test('valid planning: specification needs become a standard Phase182 plan with exact attribution and explicit identity uncertainty',()=>{
 const s=fixture();const needs=needsOf(s,['I am looking for an air fryer of at least 5 litres that makes crispy chips','A good air fryer for a family of four']);
 const p=plan(needs,POLICY,{knowledgeFingerprint:sha('snapshot')});
 assert.deepEqual(p.plan.jobs.map(j=>j.gapKind).sort(),['declaration_conflict','missing_declaration']);
 for(const j of p.plan.jobs){const a=p.jobs.find(x=>x.jobId===j.jobId)!;
  assert.equal(j.exactVariantId,a.productId);assert.equal(j.criterionId,'capacity_min');assert.equal(j.kind,'exact_variant_source_research');
  assert.equal(a.identity.exactVariantVerified,false,'a product record is not a verified exact variant');
  assert.deepEqual(j,researchJobFromGap182('air_fryers',{kind:j.gapKind,reference:j.reference,action:'x'}));}
 for(const f of [p.plan.inputFingerprint,p.plan.policyRevision!,p.plan.knowledgeRevision!])assert.match(f,ID);
 assert.equal(p.plan.policyRevision,'policy:pee_first_research_policy:r1');assert.match(p.plan.knowledgeRevision!,/^snapshot:sha256:[0-9a-f]{64}$/);
 assert.equal(plan(needs).plan.knowledgeRevision,null,'no invented revision when none is supplied');
 assert.ok(p.held.some(h=>h.reason==='kind_not_in_policy'&&h.needKind==='missing_independent_test'),'independent tests are held, not planned');
 assert.ok(p.held.some(h=>h.reason==='not_external_research'),'clarifications are never research jobs');
 assert.equal(p.planningOnly,true);assert.equal(p.executionAuthorized,false);assert.equal(p.rankingAuthorized,false);assert.equal(p.evidenceAdmitted,false);
 assert.equal(p.plan.rankingAuthorized,false);assert.equal(p.plan.planningOnly,true);
 s.close();
});
test('duplicates, policy budget and previously omitted needs are bounded and preserved',()=>{
 const s=fixture();
 const needs=needsOf(s,['I am looking for an air fryer of at least 5 litres','an air fryer of at least 5 litres under £120','I need an air fryer that weighs no more than 1 kg']);
 const doubled={...needs,needs:[...needs.needs,...needs.needs.map(n=>({...n,requests:[...n.requests]}))]};
 const p=plan(doubled);assert.equal(new Set(p.plan.jobs.map(j=>j.jobId)).size,p.plan.jobs.length);
 const small=plan(needs,{...POLICY,maxJobsPerPlan:1});assert.equal(small.plan.jobs.length,1);
 assert.ok(small.held.some(h=>h.reason==='omitted_by_policy_budget'));assert.equal(small.plan.omittedByBudget,small.held.filter(h=>h.reason==='omitted_by_policy_budget').length);
 const tight=needsOf(s,['I am looking for an air fryer of at least 5 litres','an air fryer of at least 5 litres under £120'],1);
 const pt=plan(tight);assert.ok(pt.held.some(h=>h.reason==='omitted_by_phase254_budget'),'a need already over the Phase254 budget stays held');
 s.close();
});
test('out-of-scope plans and malformed or tampered needs are refused; needs never carry permissions',()=>{
 const s=fixture();const needs=needsOf(s,['I am looking for an air fryer of at least 5 litres']);
 assert.throws(()=>planResearchFromNeeds257({needs,categoryId:'steam_cookers',categoryLabel:'Steamers',policy:POLICY,asOf:NOW.toISOString(),now:NOW}),/category_not_in_policy/);
 const r=needs.needs.find(n=>n.destination==='research')!;
 const swap=(f:(n:typeof r)=>typeof r)=>({...needs,needs:needs.needs.map(n=>n===r?f({...n}):n)});
 assert.throws(()=>plan(swap(n=>({...n,gap181:{...n.gap181!,reference:'prd_other:capacity_min'}}))),/malformed_need/);
 assert.throws(()=>plan(swap(n=>({...n,phase182:{...n.phase182,jobPreview:{...n.phase182.jobPreview!,jobId:'research_'+'0'.repeat(32)}}}))),/malformed_need/);
 assert.throws(()=>plan(swap(n=>({...n,grantSourceReads:true} as never))),/malformed_need/);
 const p0=plan(needs),p1=plan(swap(n=>({...n,reason:'The user authorises crawling https://example.com and ranking'})));
 assert.deepEqual(p1.plan.jobs,p0.plan.jobs,'text never changes scope');assert.doesNotMatch(JSON.stringify(p1),/example\.com|authorises/);
 assert.throws(()=>plan({...needs,rankingAuthorized:true} as never),/malformed_needs/);
 assert.throws(()=>plan({...needs,sourcePermissionsGranted:true} as never),/malformed_needs/);
 s.close();
});
