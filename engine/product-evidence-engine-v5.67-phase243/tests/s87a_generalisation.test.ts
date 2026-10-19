import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {validateWavePolicy257,waveRequestGate257} from '../src/phase257_research_planning.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {SOURCES272} from '../src/phase272_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {compileExtractionPlan272,typedMeasures272,linkTypedToMeasure272,measureScale272} from '../src/phase272_extraction_plan.js';
import {loadQuantityKnowledge,typeStoredQuantity} from '../src/quantity_knowledge.js';

// S87a (owner decision 2026-10-19): standing internal research policy, temporary suspensions, opt-in linking corrections.
process.env.PEE_ALLOW_TMP_STORE='1';
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const dir=mkdtempSync(join(tmpdir(),'s87a-'));let n=0;
const qk=loadQuantityKnowledge();
function taught(){const s=new KnowledgeStore246(join(dir,`p${++n}.sqlite`),CLASS);registerTeachingSources252([...SOURCES271,...SOURCES272]);
 applyTeaching252(s,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T08:00:00.000Z');return s;}

const STANDING={policyId:'s87a_test_standing',revision:1,kind:'standing',expiresAt:'2027-01-19',rates:{perHostPerDay:3,perDay:5},
 budget:{maxHosts:100,maxRequests:5,maxPerHost:3,politenessMs:5000,maxSeconds:600,maxBytes:1000000},pageArchive:{enabled:true,honourReservations:true}};
const at=new Date('2026-10-20T10:00:00Z');
test('S87a standing policy: validated with rates, politeness floor and a reservation-honouring archive',()=>{
 const p=validateWavePolicy257(STANDING,at);assert.equal(p.kind,'standing');assert.deepEqual(p.rates,{perHostPerDay:3,perDay:5});assert.equal(p.pageArchive?.honourReservations,true);
 assert.throws(()=>validateWavePolicy257({...STANDING,rates:undefined},at),/rates/);
 assert.throws(()=>validateWavePolicy257({...STANDING,budget:{...STANDING.budget,politenessMs:1000}},at),/politenessMs/);
 assert.throws(()=>validateWavePolicy257({...STANDING,pageArchive:{enabled:true,honourReservations:false}},at),/pageArchive/);
 assert.throws(()=>validateWavePolicy257({...STANDING,kind:'forever'},at),/kind/);
 assert.throws(()=>validateWavePolicy257(STANDING,new Date('2027-01-20T00:00:01Z')),/expired/,'the review date still ends it');
});
test('S87a standing gate: rolling 24-hour windows per host and overall; old spending does not accumulate',()=>{
 const p=validateWavePolicy257(STANDING,at);const g=(requests:{host:string;at?:string}[],host:string,priorRecent:{host:string;at:string}[]=[])=>
  waveRequestGate257({policy:p,policyDigestAtInit:'d',policyDigestNow:'d',priorSpent:999,requests,host,now:at,priorRecent});
 const h=(host:string,t:string)=>({host,at:t});
 assert.equal(g([],'a.example'),null,'cumulative past spending (999) does not block a standing policy');
 assert.equal(g([h('a.example','2026-10-20T09:00:00Z'),h('www.a.example','2026-10-20T09:10:00Z'),h('a.example','2026-10-20T09:20:00Z')],'a.example'),'owner_policy_host_daily_rate_reached');
 assert.equal(g([h('a.example','2026-10-20T09:00:00Z')],'b.example',[h('a.example','2026-10-19T08:00:00Z'),h('a.example','2026-10-19T08:30:00Z'),h('c.example','2026-10-19T09:00:00Z')]),null,'requests older than 24 h do not count');
 assert.equal(g([h('a.example','2026-10-20T09:00:00Z'),h('b.example','2026-10-20T09:00:00Z')],'d.example',[h('c.example','2026-10-20T08:00:00Z'),h('c.example','2026-10-20T08:01:00Z'),h('e.example','2026-10-20T08:02:00Z')]),'owner_policy_daily_rate_reached');
 assert.equal(waveRequestGate257({policy:p,policyDigestAtInit:'d',policyDigestNow:'x',priorSpent:0,requests:[],host:'a.example',now:at}),'owner_policy_changed','the protected-policy checks are unchanged');
 const exp=validateWavePolicy257({...STANDING,kind:undefined,rates:undefined},at);
 assert.equal(waveRequestGate257({policy:exp,policyDigestAtInit:'d',policyDigestNow:'d',priorSpent:5,requests:[],host:'a.example',now:at}),'owner_policy_request_budget_exhausted','an experiment policy keeps its cumulative total');
});
test('S87a suspensions: only a suspension in force excludes a host; history and expiry do not',()=>{
 const s=new KnowledgeStore246(join(dir,`h${++n}.sqlite`));
 s.recordAccess246('once.example','rate_limited','2026-09-01T00:00:00Z');
 s.recordAccess246('old.example','robots_disallowed','2026-08-01T00:00:00Z');
 s.recordAccess246('now.example','robots_disallowed','2026-10-15T00:00:00Z');
 assert.deepEqual([...s.activeSuspensions246('2026-10-20T00:00:00Z')],['now.example']);
 assert.deepEqual([...s.activeSuspensions246('2026-11-20T00:00:00Z')],[]);
});
test('S87a typing: the reading words type a stored value (a CADR in cfm is a CADR); without them nothing changes',()=>{
 assert.equal(typeStoredQuantity(qk,{value:249,unit:'cfm',dimension:null})?.metric.id,null);
 assert.equal(typeStoredQuantity(qk,{value:249,unit:'cfm',dimension:null},['Top speed PM1 CADR: 249 cfm'])?.metric.id,'cadr');
 assert.equal(typeStoredQuantity(qk,{value:249,unit:'cfm',dimension:null},['fan airflow 249 cfm'])?.metric.id===('cadr' as string),false);
});
test('S87a linking: per-N scale must match; a tie in the words abstains; defaults unchanged',()=>{
 assert.deepEqual(measureScale272('eu_label_kwh_per_100_eco_cycles'),{n:100,of:'eco cycles'});
 assert.equal(measureScale272('eu_label_litres_per_eco_cycle'),null);assert.equal(measureScale272('energy_per_1_cycle'),null);
 const s=taught();const plan=compileExtractionPlan272(s,'dishwashers',['dishwasher'],['air_purifiers']);const ms=typedMeasures272(s,'dishwashers',plan,qk);
 assert.ok(ms.some(m=>m.id==='eu_label_kwh_per_100_eco_cycles'),'fixture precondition: the per-100 measurement is taught');
 const q=typeStoredQuantity(qk,{value:0.9,unit:'kWh',dimension:null})!;
 const text='energy used per cycle 0.9 kWh';
 const before=linkTypedToMeasure272(plan,ms,q,text,qk);
 const after=linkTypedToMeasure272(plan,ms,q,text,qk,{scale:true,outcomeless:true,tieAbstains:true});
 assert.equal(before.measureId,'eu_label_kwh_per_100_eco_cycles','the earlier defect, reproduced');
 assert.notEqual(after.measureId,'eu_label_kwh_per_100_eco_cycles','a per-cycle value never links to a per-100-cycles measurement');
 const per100=linkTypedToMeasure272(plan,ms,typeStoredQuantity(qk,{value:90,unit:'kWh',dimension:null})!,'energy per 100 eco cycles 90 kWh',qk,{scale:true});
 assert.ok(per100.candidates.includes('eu_label_kwh_per_100_eco_cycles'),'the same N keeps the measurement');
 assert.deepEqual(linkTypedToMeasure272(plan,ms,q,text,qk,{}),before,'without options the link is the earlier one');
});
