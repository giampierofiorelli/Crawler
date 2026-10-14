import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {createDecision177,applyDecisionAction177,type DecisionSnapshot177} from '../src/phase177_decision_snapshot.js';
import {canonicalJson180,reviewedFirstAnswer180,type ReviewedRelease180,type SignedRelease180} from '../src/phase180_reviewed_first_answer.js';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const keys=generateKeyPairSync('ed25519');
const authority={publicKeys:{review_board:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-12T18:00:00Z',market:'uk'};
const base=createDecision177('sample_choice');
const scope=applyDecisionAction177(base,{type:'set_scope',source:'user_web_control',scope:{category:'water_filter',task:'product_selection'}}).snapshot;
const confirmed=applyDecisionAction177(scope,{type:'set_criterion',source:'user_web_control',key:'lead_reduction',label:'Reduce lead exposure',value:{kind:'boolean',value:true},priority:'hard'}).snapshot;
const ready=applyDecisionAction177(confirmed,{type:'set_criterion',source:'user_web_control',key:'ease_of_use',label:'Easy everyday use',value:{kind:'boolean',value:true},priority:'high'}).snapshot;
const source=(id:string,v:string)=>({id,variantId:v,originalTestId:`test_${id}`,methodId:'protocol_p',protocolVersion:'v1',sourceUrl:`https://example.org/original/${id}`,observedAt:'2026-10-10T00:00:00Z',scope:'exact_variant_original_professional_test' as const});
function release(state=ready):ReviewedRelease180{return {phase:180,schema:'180.1',market:'uk',categoryId:'water_filter',rankInputFingerprint:state.rankInputFingerprint,
 evidenceRevision:'revision_a',policyRevision:'policy_a',reviewedAt:'2026-10-12T00:00:00Z',expiresAt:'2026-10-20T00:00:00Z',
 discoveredVariantIds:['a','b','c','d','e'],coverageStatement:'Only a bounded, non-exhaustive tested candidate population was reviewed.',marketCoverageComplete:false,
 reviewedCriteria:state.criteria.filter(c=>c.status==='confirmed').map(c=>({key:c.key,label:c.label,value:c.value,priority:c.priority})),
 criteriaWeights:[{key:'lead_reduction',weightUnits:7000,elicitationReference:'reviewed_policy_receipt_a',methodId:'protocol_p',protocolVersion:'v1'},
  {key:'ease_of_use',weightUnits:3000,elicitationReference:'reviewed_policy_receipt_b',methodId:'protocol_p',protocolVersion:'v1'}],
 evidence:[source('e1','a'),source('e2','b'),source('e3','c'),source('e4','d')],
 variants:[
  {id:'a',name:'Fixture A',criteria:[{key:'lead_reduction',valuePoints:9000,evidenceIds:['e1']},{key:'ease_of_use',valuePoints:6000,evidenceIds:['e1']}],hardAssessments:[{key:'lead_reduction',outcome:'pass',evidenceIds:['e1']}]},
  {id:'b',name:'Fixture B',criteria:[{key:'lead_reduction',valuePoints:9000,evidenceIds:['e2']},{key:'ease_of_use',valuePoints:6000,evidenceIds:['e2']}],hardAssessments:[{key:'lead_reduction',outcome:'pass',evidenceIds:['e2']}]},
  {id:'c',name:'Fixture C',criteria:[{key:'lead_reduction',valuePoints:10000,evidenceIds:['e3']},{key:'ease_of_use',valuePoints:9000,evidenceIds:['e3']}],hardAssessments:[{key:'lead_reduction',outcome:'fail',evidenceIds:['e3']}]},
  {id:'d',name:'Fixture D',criteria:[{key:'lead_reduction',valuePoints:6000,evidenceIds:['e4']}],hardAssessments:[{key:'lead_reduction',outcome:'unknown',evidenceIds:[]}]}],
 externalReviewReference:'review_board_release_a'};}
function signed(r=release()):SignedRelease180{return {release:r,keyId:'review_board',signatureBase64:sign(null,Buffer.from(canonicalJson180(r)),keys.privateKey).toString('base64')};}
function result(s=ready,r:SignedRelease180|null=signed()){return reviewedFirstAnswer180(s,r,authority);}
function copy<T>(x:T):T{return JSON.parse(JSON.stringify(x)) as T;}
test('without a signed reviewed release, no product or rank is published',()=>{const r=result(ready,null);assert.equal(r.status,'not_ready');assert.deepEqual(r.ranked,[]);});
test('candidate needs never authenticate a ranking',()=>{const s=applyDecisionAction177(scope,{type:'propose_candidate',source:'english_intake_candidate',key:'lead_reduction',label:'Lead reduction requested',value:{kind:'boolean',value:true},referenceHash:hash('I need clean water')}).snapshot;assert.equal(result(s).status,'not_ready');});
test('user confirms task and category before any rank',()=>{assert.equal(result(base).status,'not_ready');assert.equal(result(scope).status,'not_ready');});
test('an offline signed release produces deterministic ties, exclusions, missing evidence and trace URLs',()=>{const r=result();assert.equal(r.status,'ranking_ready');assert.deepEqual(r.ranked.map(x=>[x.variantId,x.rank,x.scorePoints]),[['a',1,8100],['b',1,8100]]);assert.equal(r.held.length,3);assert.ok(r.held.some(x=>x.variantId==='c'&&x.reason.includes('failure')));assert.ok(r.held.some(x=>x.variantId==='d'&&x.reason.includes('Essential')));assert.ok(r.held.some(x=>x.variantId==='e'&&x.reason.includes('Discovered')));assert.equal(r.coverage.marketCoverageComplete,false);assert.ok(r.ranked[0].sourceUrls[0].startsWith('https://'));});
test('changing priority invalidates an otherwise authentic precomputed result',()=>{const s=applyDecisionAction177(ready,{type:'set_priority',source:'user_web_control',key:'ease_of_use',priority:'low'}).snapshot;assert.equal(result(s).status,'not_ready');assert.deepEqual(result(s).ranked,[]);});
test('changing category invalidates an otherwise authentic precomputed result',()=>{const s=applyDecisionAction177(ready,{type:'set_scope',source:'user_web_control',scope:{category:'kettle',task:'product_selection'}}).snapshot;assert.equal(result(s).status,'not_ready');});
test('different decision identities with same confirmed criteria have identical ranking',()=>{let s=createDecision177('different_person');s=applyDecisionAction177(s,{type:'set_scope',source:'user_web_control',scope:ready.scope}).snapshot;for(const c of [...ready.criteria].reverse())s=applyDecisionAction177(s,{type:'set_criterion',source:'user_web_control',key:c.key,label:c.label,value:c.value,priority:c.priority}).snapshot;assert.equal(s.rankInputFingerprint,ready.rankInputFingerprint);assert.deepEqual(result(s).ranked,result(ready).ranked);});
test('attacker swapping variant score after signature fails closed',()=>{const envelope=copy(signed());envelope.release.variants[0].criteria[0].valuePoints=10000;assert.equal(result(ready,envelope).status,'not_ready');});
test('attacker swapping evidence URLs after signature fails closed',()=>{const envelope=copy(signed());envelope.release.evidence[0].sourceUrl='https://malicious.example/original/test';assert.equal(result(ready,envelope).status,'not_ready');});
test('untrusted public key is not supplied by signed payload',()=>{const attacker=generateKeyPairSync('ed25519');const s=signed();s.signatureBase64=sign(null,Buffer.from(canonicalJson180(s.release)),attacker.privateKey).toString('base64');assert.equal(result(ready,s).status,'not_ready');});
test('unknown issuer cannot publish',()=>{const s=signed();s.keyId='attacker';assert.equal(result(ready,s).status,'not_ready');});
test('expired release is not shown',()=>{const s=signed();assert.equal(reviewedFirstAnswer180(ready,s,{...authority,asOf:'2026-10-21T00:00:00Z'}).status,'not_ready');});
test('future release is not shown',()=>{const s=signed();assert.equal(reviewedFirstAnswer180(ready,s,{...authority,asOf:'2026-10-11T00:00:00Z'}).status,'not_ready');});
test('even signed content cannot omit an essential criterion result',()=>{const r=release();r.variants[0].hardAssessments=[];assert.equal(result(ready,signed(r)).status,'ranking_ready');assert.ok(result(ready,signed(r)).held.some(x=>x.variantId==='a'));});
test('even signed content cannot borrow evidence from a different model',()=>{const r=release();r.variants[0].criteria[0].evidenceIds=['e2'];assert.equal(result(ready,signed(r)).status,'not_ready');});
test('even signed content cannot masquerade as exhaustive market coverage',()=>{const r=release();(r as any).marketCoverageComplete=true;assert.equal(result(ready,signed(r)).status,'not_ready');});
test('even signed content cannot invent unsupported score weights',()=>{const r=release();r.criteriaWeights[0].weightUnits=8000;assert.equal(result(ready,signed(r)).status,'not_ready');});
test('even signed content cannot use 0 original-test references for a hard pass',()=>{const r=release();r.variants[0].hardAssessments[0].evidenceIds=[];assert.equal(result(ready,signed(r)).status,'not_ready');});
test('signed entry with unavailable scoring evidence remains held, never a numeric rank',()=>{const r=release();(r.variants[0] as any).criteria.pop();const x=result(ready,signed(r));assert.equal(x.status,'ranking_ready');assert.deepEqual(x.ranked.map(p=>p.variantId),['b']);assert.ok(x.held.some(x=>x.variantId==='a'));});
test('unsigned review annotations are not interchangeable with expert validation',()=>{const r=release();r.externalReviewReference='self_approved';assert.equal(result(ready,{release:r,keyId:'review_board',signatureBase64:'a'.repeat(88)}).status,'not_ready');});
test('an unresolved shopping scope cannot be matched to an arbitrary release',()=>{const s=applyDecisionAction177(ready,{type:'set_scope',source:'user_web_control',scope:{category:null,task:'solution_comparison'}}).snapshot;assert.equal(result(s).status,'not_ready');});
test('moving to troubleshooting removes product ranking publication',()=>{const s=applyDecisionAction177(ready,{type:'set_scope',source:'user_web_control',scope:{category:'water_filter',task:'use_or_troubleshoot'}}).snapshot;assert.equal(result(s).status,'not_ready');});
test('same valid signed release remains reproducible across call order',()=>{const s=signed();const r1=result(ready,s);const r2=result(ready,s);assert.deepEqual(r1,r2);});

test('correct signature for a different retail market is not publicable',()=>{const s=signed();assert.equal(reviewedFirstAnswer180(ready,s,{...authority,market:'us'}).status,'not_ready');});
test('signed but cross-method quantitative values cannot be pooled',()=>{const r=release();r.evidence[0].methodId='different_method';assert.equal(result(ready,signed(r)).status,'not_ready');});
test('signed but protocol-version-mismatched measurements cannot be compared',()=>{const r=release();r.evidence[1].protocolVersion='v2';assert.equal(result(ready,signed(r)).status,'not_ready');});
test('even signed multi-original aggregation requires a separately validated synthesis method',()=>{const r=release();r.variants[0].criteria[0].evidenceIds=['e1','e1'];assert.equal(result(ready,signed(r)).status,'not_ready');});

test('label-only edits with same rank fingerprint cannot reuse a semantically stale release',()=>{const s=applyDecisionAction177(ready,{type:'set_criterion',source:'user_web_control',key:'lead_reduction',label:'Reduce chlorine instead of lead',value:{kind:'boolean',value:true},priority:'hard'}).snapshot;assert.equal(s.rankInputFingerprint,ready.rankInputFingerprint);assert.equal(result(s).status,'not_ready');});
test('signed manifest cannot contain a contradictory requirement label binding',()=>{const r=release();r.reviewedCriteria[0].label='A different goal';assert.equal(result(ready,signed(r)).status,'not_ready');});
