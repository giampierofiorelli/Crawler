import test from 'node:test';import assert from 'node:assert/strict';
import {validateWavePolicy257,waveBudgetWithinPolicy257,waveRequestGate257} from '../src/phase257_research_planning.js';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';

// S85 step 2 (owner: before any further live acquisition the policy must really be enforced). Fictional policies.
const POL={policyId:'s85_test_policy',revision:1,expiresAt:'2026-10-24',budget:{maxHosts:2,maxRequests:5,maxPerHost:2,politenessMs:5000,maxSeconds:600,maxBytes:1000000}};
const at=new Date('2026-10-20T10:00:00Z');
test('S85 wave policy: validated, never exceeded, expiry inclusive of its day',()=>{
 const p=validateWavePolicy257(POL,at);assert.equal(p.policyId,'s85_test_policy');
 assert.throws(()=>validateWavePolicy257(POL,new Date('2026-10-25T00:00:01Z')),/wave_policy_expired/);
 assert.doesNotThrow(()=>validateWavePolicy257(POL,new Date('2026-10-24T23:00:00Z')),'a date-only expiry covers its whole day');
 assert.throws(()=>validateWavePolicy257({...POL,budget:{...POL.budget,maxRequests:-1}},at),/budget.maxRequests/);
 assert.throws(()=>validateWavePolicy257({...POL,policyId:''},at),/policyId/);
 assert.deepEqual(waveBudgetWithinPolicy257({maxRequests:6,maxPerHost:2,maxSeconds:600,maxBytes:1000000},p),['maxRequests']);
 assert.deepEqual(waveBudgetWithinPolicy257({maxRequests:5,maxPerHost:2,maxSeconds:600,maxBytes:1000000},p),[],'maxHosts may come from the policy');
 assert.deepEqual(waveBudgetWithinPolicy257({maxRequests:5,maxPerHost:2,maxSeconds:600,maxBytes:1000000,maxHosts:3},p),['maxHosts']);
});
test('S85 wave request gate: no policy, missing, changed, expired, total (with earlier waves), per host and host count all stop before a request',()=>{
 const p=validateWavePolicy257(POL,at);const base={policy:p,policyDigestAtInit:'d1',policyDigestNow:'d1',priorSpent:0,requests:[] as {host:string}[],host:'a.test',now:at};
 assert.equal(waveRequestGate257(base),null);
 assert.equal(waveRequestGate257({...base,policy:null}),'no_owner_policy');
 assert.equal(waveRequestGate257({...base,policyDigestNow:null}),'owner_policy_missing');
 assert.equal(waveRequestGate257({...base,policyDigestNow:'d2'}),'owner_policy_changed');
 assert.equal(waveRequestGate257({...base,now:new Date('2026-10-25T01:00:00Z')}),'owner_policy_expired');
 assert.equal(waveRequestGate257({...base,priorSpent:4,requests:[{host:'b.test'}]}),'owner_policy_request_budget_exhausted','earlier waves under the same policy count');
 assert.equal(waveRequestGate257({...base,policy:{...p,spent:5}}),'owner_policy_request_budget_exhausted','an owner-recorded spend counts too');
 assert.equal(waveRequestGate257({...base,requests:[{host:'a.test'},{host:'a.test'}]}),'owner_policy_per_host_budget_exhausted');
 assert.equal(waveRequestGate257({...base,requests:[{host:'b.test'},{host:'c.test'}]}),'owner_policy_host_budget_exhausted');
});
test('S85 access status: an unreadable robots file is not a refusal and does not suspend on its own; a robots refusal does',()=>{
 process.env.PEE_ALLOW_TMP_STORE='1';const s=new KnowledgeStore246(':memory:');
 assert.equal(s.recordAccess246('u.test','robots_unknown','2026-10-20T10:00:00Z').suspended,false);
 assert.equal(s.recordAccess246('u.test','robots_unknown','2026-10-20T10:01:00Z').suspended,false);
 assert.equal((s.db.prepare("SELECT last_status FROM host_access WHERE host='u.test'").get() as {last_status:string}).last_status,'robots_unknown');
 assert.equal(s.recordAccess246('d.test','robots_disallowed','2026-10-20T10:00:00Z').suspended,true);
 assert.equal(s.recordAccess246('f.test','forbidden','2026-10-20T10:00:00Z').suspended,false);
 assert.equal(s.recordAccess246('f.test','forbidden','2026-10-20T10:01:00Z').suspended,true,'two explicit refusals suspend (unchanged)');
 s.close();
});

// ---- S85 step 3: intervention A on the request path (one quantity semantics) and the owner's boundary checks ----------
import {extractConstraints253} from '../src/phase253_request_constraints.js';
import {loadQuantityKnowledge,findQuantities,readQuantityRequirements} from '../src/quantity_knowledge.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {CONCEPT_VOCABULARY248} from '../src/phase248_concept_vocabulary.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {COFFEE_TEACHING269,COFFEE_SOURCES269} from '../src/phase269_research_teaching.js';
import {applyLessons250,ADOPTED_LESSONS250} from '../src/phase250_category_lessons.js';
const qk=loadQuantityKnowledge();
function world(){process.env.PEE_ALLOW_TMP_STORE='1';const s=new KnowledgeStore246(':memory:');
 for(const c of ['coffee_machines','air_fryers'])seedCategoryHypotheses246(s,c);
 // categories with no seed get one fictional observed pattern, so PEE holds some knowledge for them (test fixture)
 for(const c of ['dishwashers','dehumidifiers','televisions'])s.addCategoryItem246({categoryId:c,section:'technical_characteristics',knowledgeClass:'observed_pattern',
  provenance:'source_declaration_aggregate',studyStream:'product_variant_observations',statement:'Fictional fixture pattern for '+c+' (test only).'},'2026-10-16T08:00:00.000Z');
 for(const [id,al] of Object.entries(CONCEPT_VOCABULARY248.coffee_machines??{}))s.addConceptAliases246('coffee_machines',id,al as string[]);
 applyLessons250(s,ADOPTED_LESSONS250,'2026-10-16T08:00:00.000Z');registerTeachingSources252(COFFEE_SOURCES269);applyTeaching252(s,[COFFEE_TEACHING269],'2026-10-16T08:30:00.000Z');return s;}
const ask=(s:KnowledgeStore246,t:string,on=true)=>adviseFromRequest253(t,s,CATEGORY_REGISTRY250,{quantityKnowledge:on?qk:null,date:'2026-10-19'});

test('S85 A: the quantity knowledge reads rates, between-ranges and the inch mark (capabilities Phase253 had are kept)',()=>{
 const f=(t:string)=>findQuantities(qk,t).map(x=>[x.surface,x.unit.kinds.join(','),x.low??null,x.high??null]);
 assert.deepEqual(f('extracts 12 litres a day'),[['12 litres a day','periodic_volume',null,null]]);
 assert.deepEqual(f('uses 0.5 kWh daily'),[['0.5 kWh daily',findQuantities(qk,'0.5 kWh/day')[0].unit.kinds.join(','),null,null]]);
 assert.deepEqual(f('between 3 and 5 litres'),[['3 and 5 litres','volume',3,5]]);
 assert.deepEqual(f('a 10" bamboo steamer'),[['10"','length',null,null]]);
 assert.deepEqual(f('it is 5 in high'),[],'"in" before a word is still the preposition');
 assert.equal(f('3 and 5 litres').some(x=>x[2]===3),false);
});
test('S85 A: Phase253 takes unit and kind from the quantity knowledge and keeps bound, property, space and criterion',()=>{
 const c=(t:string)=>extractConstraints253(t).constraints.map(x=>`${x.criterion}=${x.value}${x.unit}:${x.status}:${x.describes}`);
 // S103 (owner: "between 3 and 5 litres is represented only partially"): both ends are limits
 assert.deepEqual(c('a dehumidifier between 3 and 5 litres'),['capacity_min=3l:stated_in_request:product','capacity_max=5l:stated_in_request:product']);
 assert.deepEqual(c('a dishwasher that fits a space 40cm wide'),['width_max=40cm:stated_in_request:available_space']);
 assert.deepEqual(c('A kettle of at least 1.5 litres, no wider than 20 cm, at least 2000 W.'),['capacity_min=1.5l:stated_in_request:product','width_max=20cm:stated_in_request:product','power_min=2000W:stated_in_request:product']);
 assert.deepEqual(c('headphones with battery life of at least 30 hours'),['battery_life_min=30h:stated_in_request:product']);
 assert.deepEqual(c('a dehumidifier that extracts 12 litres a day'),[],'a rate is never a capacity (was a "capacity at least 12 l" candidate)');
 assert.deepEqual(c('no more than 44 dB(A)'),[],'a sound level is not one of its kinds');
});
test('S85 A: the six S84 counterexamples on the request path; nothing recognised is silently discarded',()=>{
 const s=world();
 const a1=ask(s,'I want a dehumidifier that extracts 12 litres a day');
 assert.deepEqual(a1.quantityRequirements!.map(q=>[q.span,q.bound,q.metric]),[['12 litres a day','unstated','dehumidifier_capacity']]);
 assert.ok(a1.questions.some(q=>/at least or at most 12 litres a day/.test(q)));assert.ok(!a1.questions.some(q=>/capacity\)\?/.test(q)&&/12 l\b/.test(q)));
 assert.deepEqual(ask(s,'a dehumidifier between 3 and 5 litres').constraints.map(c=>c.criterion),['capacity_min','capacity_max'],'S103: both ends of the interval');
 assert.deepEqual(ask(s,'a dishwasher that fits a space 40cm wide').constraints.map(c=>c.criterion),['width_max']);
 assert.deepEqual(ask(s,'an air fryer with at least 2 kg capacity').quantityRequirements!.map(q=>[q.bound,q.kind]),[['min','mass']]);
 const tv=ask(s,'a tv at least 55 inches');assert.deepEqual(tv.quantityRequirements!.map(q=>[q.span,q.bound,q.kind]),[['at least 55 inches','min','length']]);
 assert.equal(tv.unmappedConstraints.length,0,'the typed reading replaces the "unclear property" note (one interpretation)');
 const db=ask(s,'a dishwasher no louder than 44 dB(A)');assert.deepEqual(db.quantityRequirements!.map(q=>q.bound),['max']);assert.ok(db.questions.some(q=>/sound pressure level/.test(q)));
 assert.ok(ask(s,'an espresso machine with 15 bar').uninterpreted?.some(u=>u.reason==='quantity_not_checked'),'a quantity with no bound or measurand stays visible');
 // no false requirement from a quantity that describes something else
 assert.equal(ask(s,'an air fryer big enough to roast a 2 kg chicken').quantityRequirements,undefined);
 assert.equal(extractConstraints253('a 2000-2400W kettle').constraints[0]?.status,'candidate','a bare range stays a candidate');
});
test('S85 A ablation: the request path without the quantity knowledge option keeps Phase253 checks; typed requirements need the knowledge',()=>{
 const s=world();
 const off=ask(s,'a tv at least 55 inches',false),on=ask(s,'a tv at least 55 inches');
 assert.equal(off.quantityRequirements,undefined);assert.equal(on.quantityRequirements!.length,1);
 assert.deepEqual(ask(s,'a dishwasher that fits a space 40cm wide',false).constraints.map(c=>c.criterion),['width_max']);
});
test('S85 boundary checks: quiet, most reliable and features',()=>{
 const s=world();
 const q=ask(s,'quiet dishwasher');assert.equal(q.category,'dishwashers');assert.ok(q.unassessedObjectives.includes('quiet (noise)'));
 assert.ok(ask(s,'a dishwasher that is quiet').unassessedObjectives.includes('quiet (noise)'));
 assert.ok(ask(s,'a dishwasher quiet enough for an open-plan flat').unassessedObjectives.includes('quiet (noise)'));
 const r=ask(s,'most reliable dishwasher');assert.equal(r.category,'dishwashers');assert.notEqual(r.response,'out_of_scope');assert.ok(r.unassessedObjectives.includes('most reliable dishwasher'));
 const w=ask(s,'espresso machine with a steam wand');assert.deepEqual(w.needs,[]);assert.deepEqual(w.featurePreferences!.map(f=>f.matched),['steam wand']);
 assert.ok(w.statements.some(x=>/Asked for as a feature: "steam wand"/.test(x)));
 const p=ask(s,'espresso machine with high brew pressure');assert.deepEqual(p.needs,[]);assert.equal(p.featurePreferences![0].kind,'mechanism');
 assert.deepEqual(ask(s,'I want to make lattes at home with an espresso machine').needs,['milk_drinks'],'a use stays a need');
 assert.equal(ask(s,'a mixer that struggles with some doughs').featurePreferences,undefined);
});
