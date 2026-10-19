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
