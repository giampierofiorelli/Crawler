import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,mkdirSync,symlinkSync,chmodSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {researchJobFromGap182,assembleResearchPlan182,type ResearchPlan182} from '../src/phase182_gap_research_orchestrator.js';
import {loadResearchPolicy257,executeUnderPolicy257,policyRevision257,type ResearchPolicy257} from '../src/phase257_research_planning.js';
// Phase257 Checkpoint B threat cases, written before the loader and the wrapper. No network: transports and workers
// are counting doubles that must never be called.
const NOW=new Date('2026-10-17T00:00:00.000Z');
const POLICY:ResearchPolicy257={schema:'pee257.research-policy.v1',policyId:'pee_first_research_policy',revision:1,market:'uk',
 issuedAt:'2026-10-16T00:00:00.000Z',expiresAt:'2026-11-15T00:00:00.000Z',categories:['air_fryers','coffee_machines','kettles','toasters','blenders'],
 needKinds:['missing_declaration','declaration_conflict'],maxJobsPerPlan:20,allowSourceReads:false,maxSourceReads:0,maxWorkerTasks:0};
const root=mkdtempSync(join(tmpdir(),'pee257p-'));
const write=(name:string,p:unknown,mode=0o600)=>{const d=join(root,Math.random().toString(36).slice(2));mkdirSync(d,{mode:0o700});const f=join(d,name);writeFileSync(f,JSON.stringify(p));chmodSync(f,mode);return f;};
const job=(kind:'missing_declaration'|'declaration_conflict'|'missing_test',ref:string,cat='air_fryers')=>researchJobFromGap182(cat,{kind,reference:ref,action:'x'});
const planOf=(jobs:ReturnType<typeof job>[],o:Partial<{categoryId:string;market:string;policyRevision:string|null}>={})=>assembleResearchPlan182({categoryId:o.categoryId??'air_fryers',categoryLabel:'Air fryers',
 market:o.market??'uk',asOf:'2026-10-16T12:00:00.000Z',inputFingerprint:'needs:sha256:'+'a'.repeat(64),knowledgeRevision:null,
 policyRevision:o.policyRevision===undefined?policyRevision257(POLICY):o.policyRevision,jobs,maxJobs:100});
const doubles=()=>{const calls={transport:0,worker:0};
 return {calls,transport:{get:async()=>{calls.transport++;throw Error('network must not be used');}},
  workers:[{capability:'any',run:async()=>{calls.worker++;throw Error('workers must not run');}}]};};
const run=(plan:ResearchPlan182,policyPath:string,now=NOW,extra:Record<string,unknown>={})=>{const d=doubles();
 return {d,p:executeUnderPolicy257({plan,policyPath,now:()=>now,operatorSources:[],sourcePolicies:[],transport:d.transport as never,workers:d.workers as never,...extra} as never)};};

test('policy loading: missing, symlinked, Git-tracked, writable by others or malformed policies deny',()=>{
 const good=write('policy.json',POLICY);assert.equal(loadResearchPolicy257(good,NOW).revision,1);
 assert.throws(()=>loadResearchPolicy257(undefined,NOW),/policy_missing/);
 assert.throws(()=>loadResearchPolicy257(join(root,'nope.json'),NOW),/policy_missing/);
 const link=join(root,'link.json');symlinkSync(good,link);assert.throws(()=>loadResearchPolicy257(link,NOW),/symbolic link/);
 const linkedDir=join(root,'linkdir');symlinkSync(join(good,'..'),linkedDir);assert.throws(()=>loadResearchPolicy257(join(linkedDir,'policy.json'),NOW),/canonical/);
 const repo=join(root,'repo');mkdirSync(join(repo,'.git'),{recursive:true});writeFileSync(join(repo,'policy.json'),JSON.stringify(POLICY));chmodSync(join(repo,'policy.json'),0o600);
 assert.throws(()=>loadResearchPolicy257(join(repo,'policy.json'),NOW),/Git work tree/);
 assert.throws(()=>loadResearchPolicy257(write('policy.json',POLICY,0o666),NOW),/writable/);
 assert.throws(()=>loadResearchPolicy257(write('policy.json',{...POLICY,allowSourceReads:true}),NOW),/source reads/);
 assert.throws(()=>loadResearchPolicy257(join(good,'..'),NOW),/regular file/);
});
test('a legitimate plan executes as a dry run: no reads, no workers, no transport call, nothing admitted or ranked',async()=>{
 const path=write('policy.json',POLICY);
 const plan=planOf([job('missing_declaration','prd_a:capacity_min'),job('declaration_conflict','prd_b:capacity_min')]);
 const {d,p}=run(plan,path,NOW,{allowSourceReads:true,maxSourceReads:5,existingWorkerBudget:10});
 const r=await p;
 assert.deepEqual(r.run.outcomes.map(o=>o.status),['no_curated_sources','no_curated_sources']);
 assert.equal(r.run.sourceRetrievalAttempts,0);assert.equal(r.run.canonicalKnowledgeUpdated,false);assert.equal(r.run.rankingAuthorized,false);
 assert.deepEqual(d.calls,{transport:0,worker:0},'injected transport and workers are never used');
 assert.equal(r.dryRunOnly,true);assert.equal(r.policyRevision,'policy:pee_first_research_policy:r1');
 // Curated candidates do not change that: with reads disabled nothing is retrieved.
 // Even a curated candidate with a fully approved source policy (rights, robots, terms) is not read in Phase257.
 const asOf='2026-10-16T12:00:00.000Z';
 const cand={variantId:'prd_a',sourceRegistry:'operator_curated_unverified',existing:[],candidates:[{id:'maker_1',sourceId:'maker_org',url:'https://maker.example/p/a',exactVariantId:'prd_a',
  originalTestId:null,lineageAttestationReference:null,kind:'original_professional_test',publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'}]};
 const approved={sourceId:'maker_org',host:'maker.example',basis:'written_permission',rightsDocumentId:'operator_review_1',rightsDocumentUrl:'https://maker.example/permissions',
  reviewedBy:'legal_reviewer',reviewedAt:'2026-10-12T19:00:00Z',validUntil:'2026-11-12T00:00:00Z',permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation'],
  robots:'allowed',robotsCheckedAt:asOf,websiteTerms:'reviewed_permitted',termsCheckedAt:asOf,commercialUseReviewed:true};
 const r2b=run(plan,path,NOW,{operatorSources:[cand],sourcePolicies:[approved]});const r2=await r2b.p;
 assert.equal(r2.run.sourceRetrievalAttempts,0);assert.deepEqual(r2b.d.calls,{transport:0,worker:0});
 assert.ok(r2.run.outcomes.every(o=>o.discoveryRecords.every(x=>x.contentSha256===null)),'nothing was retrieved');
});
test('policy is the current file, checked with a trusted clock: expiry, revision change and scope deny the plan',async()=>{
 const path=write('policy.json',POLICY);const plan=planOf([job('missing_declaration','prd_a:capacity_min')]);
 await assert.rejects(run(plan,path,new Date('2026-12-01T00:00:00.000Z')).p,/expired/,'the trusted clock, not plan.asOf');
 writeFileSync(path,JSON.stringify({...POLICY,revision:2}));
 await assert.rejects(run(plan,path).p,/policy_revision_mismatch/,'a revision bump revokes earlier plans');
 const p2=write('policy.json',POLICY);
 await assert.rejects(run(planOf([job('missing_declaration','prd_a:capacity_min','steam_cookers')],{categoryId:'steam_cookers'}),p2).p,/category_not_in_policy/);
 await assert.rejects(run(planOf([job('missing_declaration','prd_a:capacity_min')],{market:'us'}),p2).p,/market_mismatch/);
 await assert.rejects(run(planOf([job('missing_test','prd_a:crisp_texture')]),p2).p,/kind_not_in_policy/,'independent testing is not in this policy');
 await assert.rejects(run(planOf([job('missing_declaration','prd_a:capacity_min')],{policyRevision:null}),p2).p,/policy_revision_mismatch/);
});
test('manipulated plans: a recomputed hash is not permission; excessive jobs, flags and forged jobs are refused',async()=>{
 const path=write('policy.json',POLICY);
 const many=planOf(Array.from({length:21},(_,i)=>job('missing_declaration',`prd_${i}:capacity_min`)));
 await assert.rejects(run(many,path).p,/too_many_jobs/);
 const legit=planOf([job('missing_declaration','prd_a:capacity_min')]);
 const {planHash,...rest}=legit;
 const ranked={...rest,rankingAuthorized:true} as never as ResearchPlan182;
 await assert.rejects(run(ranked,path).p,/phase182_invalid_execution|phase257_plan_flags/);
 const forged={...legit,jobs:[{...legit.jobs[0],kind:'category_research'}]} as ResearchPlan182;
 await assert.rejects(run(forged,path).p,/phase257_job_not_phase182|tampered/);
 const edited={...legit,jobs:[{...legit.jobs[0],reference:'prd_z:capacity_min'}]} as ResearchPlan182;
 await assert.rejects(run(edited,path).p,/phase257_job_not_phase182|tampered/);
 assert.ok(planHash);
});
