import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {applyTeaching252,registerTeachingSources252,registryWithTeaching252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {TELEVISION_TEACHING272,SOURCES272} from '../src/phase272_category_teaching.js';
import {researchUnknownCategory272,acquireFromMethodPage272,teachingFromResearch272,transferablePrinciples272} from '../src/phase272_category_research.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';

// Phase272 unknown-category procedure. Every page is FICTIONAL. (A first draft used "garment steamer": the request path
// routed it to steam_cookers through the shared head word "steamer" - a similar-name category confusion reported in Phase272.)
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee272r-'));let n=0;
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const TAUGHT=['dishwashers','air_purifiers','televisions'];
function taught(){const s=new KnowledgeStore246(join(dir,`r${++n}.sqlite`),CLASS);registerTeachingSources252([...SOURCES271,...SOURCES272]);
 applyTeaching252(s,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,TELEVISION_TEACHING272],'2026-10-17T08:00:00.000Z');return s;}
const REQ=['Which electric blanket is quiet and does not push up my electricity bills?'];

test('the gap is stated, not filled from known categories; principles recur across categories; hypotheses stay hypotheses',()=>{
 const s=taught();
 const before=adviseFromRequest253(REQ[0],s,CATEGORY_REGISTRY250);
 assert.equal(before.category,null);assert.notEqual(before.response,'ranked_recommendation');
 const p=transferablePrinciples272(s,TAUGHT);assert.ok(p.length>0&&p.every(x=>x.categories.length>=2&&x.status==='transferable_method_hypothesis'));
 const r=researchUnknownCategory272(s,'electric blanket',REQ,TAUGHT);
 assert.equal(r.gap.registryKnows,false);assert.equal(r.gap.storeItems,0);
 assert.ok(r.outcomes.some(o=>o.dimension==='sound')&&r.outcomes.some(o=>o.dimension==='energy'),JSON.stringify(r.outcomes.map(o=>o.id)));
 assert.ok(r.outcomes.every(o=>o.status==='instructor_hypothesis'&&!o.confirmedBy.length),'nothing is confirmed before a source is read');
 s.close();
});

test('a method page confirms only what it states with words AND units; anything else it measures is a lead, never a measurement',()=>{
 const s=taught();let r=researchUnknownCategory272(s,'electric blanket',REQ,TAUGHT);s.close();
 const html='<html><body><h1>How we test electric blankets</h1><p>We measure noise in decibels with a sound meter at one metre: typical results are 55 dB.</p>'+
  '<p>record the surface temperature and heat spread in °C, often 38 °C, with a thermal camera.</p></body></html>';
 r=acquireFromMethodPage272(r,{url:'https://lab.test/how-we-test-steamers',publisher:'lab.test',html,consulted:'2026-10-17'});
 assert.equal(r.outcomes.find(o=>o.dimension==='sound')!.status,'method_reference');
 assert.equal(r.outcomes.find(o=>o.dimension==='energy')!.status,'instructor_hypothesis','the page names no energy measurement: still a hypothesis');
 assert.ok(r.leads.every(l=>l.status==='exploratory_research_lead'));assert.ok(r.leads.some(l=>l.dimension==='temperature'));
 const t=teachingFromResearch272(r,'2026-10-17');
 assert.equal(t.needs.find(x=>x.id==='sound_outcome')!.outcome!.basis,'method_reference');
 assert.equal(t.needs.find(x=>x.id==='energy_outcome')!.outcome!.basis,'instructor_hypothesis');
});

test('reuse: a later request finds the learned category, names its outcomes as unassessed, ranks nothing',()=>{
 const s=taught();const r=researchUnknownCategory272(s,'electric blanket',REQ,TAUGHT);const t=teachingFromResearch272(r,'2026-10-17');
 applyTeaching252(s,[t],'2026-10-17T09:00:00.000Z');
 assert.ok(s.categoryItems246('electric_blankets').every(i=>i.knowledgeClass==='technical_hypothesis'&&i.provenance==='assistant_authored_unreviewed'));
 const a=adviseFromRequest253('Which electric blanket is quiet and uses the least electricity?',s,registryWithTeaching252(CATEGORY_REGISTRY250,[t]));
 assert.equal(a.category,'electric_blankets');assert.notEqual(a.response,'ranked_recommendation');
 assert.ok(a.unassessedObjectives.length>=1,JSON.stringify(a.unassessedObjectives));
 s.close();
});
