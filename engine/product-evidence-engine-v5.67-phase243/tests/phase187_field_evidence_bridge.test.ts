import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import {compareFieldEvidence187,projectEvidenceLanes187,
 type FieldCatalog187,type SignedFieldCatalog187,type FieldGoal187,type FieldObservation187} from '../src/phase187_field_evidence_bridge.js';

// ALL records and reviewer identities here are invented test fixtures.
const keys=generateKeyPairSync('ed25519');
const publicKey=keys.publicKey.export({type:'spki',format:'pem'}).toString();
const authority={market:'us',asOf:'2026-10-12T12:00:00Z',publicKeys:{reviewer187:publicKey}};
const sha='a'.repeat(64);
const common={sourceUrl:'https://example.org/protocol-record',originalSha256:sha,originalLocator:'row.11',
 sourceRightsReference:'rights_a',identityReviewReference:'identity_a',derivedFrom:null};
const obs=(id:string,variantId:string,value:number|string,sourceClass:FieldObservation187['sourceClass']='certified_or_verified_register'):
 FieldObservation187=>({id,variantId,dimension:'smoke_cadr',value,unit:'cfm',protocolId:'ac1',protocolVersion:'v1',sourceClass,...common});
const policy={id:'smoke',kind:'numeric_minimum' as const,dimension:'smoke_cadr',unit:'cfm',protocolId:'ac1',protocolVersion:'v1',
 threshold:150,thresholdMax:null,claim:null,profileId:'air_cleaner_room_a',comparison:'no_order' as const,
 acceptedForFit:['certified_or_verified_register','independent_professional_test'] as const,
 reviewReference:'domain_review_a',reviewedApplicability:'A fictional room-size profile for testing only.'};
function catalog():FieldCatalog187{return {
 phase:187,schema:'187.1',market:'us',category:'air_cleaner',revision:'rev_a',reviewedAt:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',
 externalReviewer:'reviewer_a',rightsAuditReference:'rights_a',coverageStatement:'Fictional development sample, not market coverage.',marketCoverageComplete:false,
 policies:[policy], variants:[
 {id:'a',name:'Fictional A',observations:[obs('oa','a',180)]},
 {id:'b',name:'Fictional B',observations:[obs('ob','b',160)]},
 {id:'c',name:'Fictional C',observations:[obs('oc','c',190,'manufacturer_specification')]},
 {id:'d',name:'Fictional D',observations:[]},
 {id:'e',name:'Fictional E',observations:[obs('oe','e',120)]}]
};}
function signed(c:FieldCatalog187):SignedFieldCatalog187{
 return {catalog:c,keyId:'reviewer187',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),keys.privateKey).toString('base64')};
}
const goal:FieldGoal187={market:'us',category:'air_cleaner',profileId:'air_cleaner_room_a',confirmedByUser:true};
const run=(c=catalog(),g=goal,a=authority)=>compareFieldEvidence187({goal:g,catalog:signed(c),authority:a});
test('bounded, English-only result: two certified fits, a visible provisional and missing/unsuitable',()=>{
 const d=run();assert.equal(d.status,'bounded_field_comparison');assert.deepEqual(d.compatible.map(x=>x.variantId),['a','b']);
 assert.deepEqual(d.provisional.map(x=>x.variantId),['c']);assert.deepEqual(d.held.map(x=>x.variantId),['d','e']);
 assert.equal(d.ordered.length,0);assert.equal(d.noGeneralProductRanking,true);assert.equal(d.coverageNotProved,true);
 assert.ok(d.cautions.some(x=>x.includes('Missing evidence')));
});
test('a profile change with no reviewed policy abstains',()=>{
 const d=run(catalog(),{...goal,profileId:'different'});assert.equal(d.status,'research_required');assert.equal(d.compatible.length,0);
});
test('unconfirmed goal fails closed',()=>assert.throws(()=>run(catalog(),{...goal,confirmedByUser:false as true}),/bad187_request/));
test('unknown market is not silently assumed',()=>{
 const d=run(catalog(),{...goal,market:'uk'});assert.equal(d.status,'research_required');
});
test('different category is not a match',()=>assert.equal(run(catalog(),{...goal,category:'vacuum'}).status,'research_required'));
test('signed content cannot be tampered with',()=>{
 const e=signed(catalog());e.catalog.variants[0].name='Malicious edit';
 const d=compareFieldEvidence187({goal,catalog:e,authority});assert.equal(d.status,'research_required');
});
test('catalog cannot choose its own signing key',()=>{
 const e=signed(catalog());e.keyId='other';assert.equal(compareFieldEvidence187({goal,catalog:e,authority}).status,'research_required');
});
test('missing catalog abstains',()=>assert.equal(compareFieldEvidence187({goal,catalog:null,authority}).status,'research_required'));
test('stale catalog abstains',()=>assert.equal(run({...catalog(),expiresAt:'2026-10-10T00:00:00Z'}).status,'research_required'));
test('future catalog abstains',()=>assert.equal(run({...catalog(),reviewedAt:'2026-10-13T00:00:00Z'}).status,'research_required'));
test('duplicate variant id rejected',()=>{
 const c=catalog();c.variants=[...c.variants,c.variants[0]];
 assert.equal(run(c).status,'research_required');
});
test('duplicate observation id rejected',()=>{
 const c=catalog();c.variants[1].observations=[{...obs('oa','b',160)}];assert.equal(run(c).status,'research_required');
});
test('foreign variant reference rejected',()=>{
 const c=catalog();c.variants[0].observations=[{...obs('oa','other',180)}];assert.equal(run(c).status,'research_required');
});
test('wrong method does not pass',()=>{
 const c=catalog();c.variants[0].observations=[{...obs('oa','a',180),protocolVersion:'v2'}];
 assert.equal(run(c).held.find(x=>x.variantId==='a')?.disposition,'conflict_or_method_mismatch');
});
test('wrong dimension units do not pass',()=>{
 const c=catalog();c.variants[0].observations=[{...obs('oa','a',180),unit:'litres'}];
 assert.equal(run(c).held.find(x=>x.variantId==='a')?.disposition,'conflict_or_method_mismatch');
});
test('derived values cannot count as independent evidence',()=>{
 const c=catalog();c.variants[0].observations=[{...obs('oa','a',180),derivedFrom:'air_flow'}];
 assert.equal(run(c).held.find(x=>x.variantId==='a')?.disposition,'conflict_or_method_mismatch');
});
test('same value from independent and registered sources does not count twice',()=>{
 const c=catalog();c.variants[0].observations=[obs('oa','a',180),obs('oa2','a',180,'independent_professional_test')];
 assert.equal(run(c).compatible.find(x=>x.variantId==='a')?.sourceClass,'independent_professional_test');
});
test('conflicting source values are held, not cherry-picked',()=>{
 const c=catalog();c.variants[0].observations=[obs('oa','a',180),obs('oa2','a',100,'manufacturer_specification')];
 assert.equal(run(c).held.find(x=>x.variantId==='a')?.disposition,'conflict_or_method_mismatch');
});
test('manufacturer-only product never joins certified fit group',()=>{
 const c=catalog();c.variants=[{id:'c',name:'Fictional C',observations:[obs('oc','c',190,'manufacturer_specification')]}];
 const d=run(c);assert.equal(d.status,'research_required');assert.equal(d.provisional.length,1);
});
test('narrow numeric dimension comparison is deterministic and descending',()=>{
 const c=catalog();c.policies=[{...policy,comparison:'higher_certified_value'}];
 const d=run(c);assert.deepEqual(d.ordered.map(x=>[x.variantId,x.rank]),[['a',1],['b',2]]);
 assert.ok(d.cautions.some(x=>x.includes('ONLY')));
});
test('numeric direction can be reversed only by signed policy',()=>{
 const c=catalog();c.policies=[{...policy,comparison:'lower_certified_value'}];
 assert.deepEqual(run(c).ordered.map(x=>x.variantId),['b','a']);
});
test('ties have equal rank and deterministic id order',()=>{
 const c=catalog();c.policies=[{...policy,comparison:'higher_certified_value'}];c.variants[1].observations=[obs('ob','b',180)];
 assert.deepEqual(run(c).ordered.map(x=>[x.variantId,x.rank]),[['a',1],['b',1]]);
});
test('invalid negative/NaN thresholds fail closed',()=>{
 const c=catalog();c.policies=[{...policy,threshold:NaN}];assert.throws(()=>signed(c),/noncanonical/);
});
test('exact-claim policy requires a precise claim, never a generic standard',()=>{
 const c=catalog();c.category='water_filter';c.policies=[{...policy,kind:'exact_certified_claim',dimension:'contaminant_reduction',unit:'certified_claim',
 protocolId:'nsf53',protocolVersion:'2024',threshold:null,thresholdMax:null,claim:'lead_reduction',comparison:'no_order',profileId:'lead'}];
 c.variants=[{id:'wf_a',name:'Fictional Filter A',observations:[{...obs('wfa','wf_a','lead_reduction'),dimension:'contaminant_reduction',unit:'certified_claim',protocolId:'nsf53',protocolVersion:'2024'}]},
 {id:'wf_b',name:'Fictional Filter B',observations:[{...obs('wfb','wf_b','chlorine_reduction'),dimension:'contaminant_reduction',unit:'certified_claim',protocolId:'nsf53',protocolVersion:'2024'}]}];
 const d=run(c,{...goal,category:'water_filter',profileId:'lead'});
 assert.deepEqual(d.compatible.map(x=>x.variantId),['wf_a']);assert.deepEqual(d.held.map(x=>x.variantId),['wf_b']);assert.equal(d.ordered.length,0);
});
test('a vague standard token does not satisfy an exact contaminant claim',()=>{
 const c=catalog();c.policies=[{...policy,kind:'exact_certified_claim',dimension:'smoke_cadr',unit:'cfm',threshold:null,thresholdMax:null,claim:'lead_reduction',comparison:'no_order'}];
 c.variants=[{id:'x',name:'Fictional X',observations:[obs('o','x','nsf53')]}];
 assert.equal(run(c).compatible.length,0);
});
test('categorical claim cannot request numeric ordering',()=>{
 const c=catalog();c.policies=[{...policy,kind:'exact_certified_claim',threshold:null,thresholdMax:null,claim:'lead_reduction'}];
 assert.equal(run(c).status,'research_required');
});
test('invalid rights or product provenance shape cannot be used',()=>{
 const c=catalog();c.variants[0].observations=[{...obs('oa','a',180),sourceRightsReference:''}];
 assert.equal(run(c).status,'research_required');
});
test('comparability requires exactly matching registered protocol',()=>{
 const c=catalog();c.variants[0].observations=[{...obs('oa','a',180),protocolId:'different_method'}];
 assert.equal(run(c).compatible.some(x=>x.variantId==='a'),false);
});
test('source attribution URLs are returned for field evidence',()=>{
 const d=run();assert.equal(d.compatible[0].sourceUrl,'https://example.org/protocol-record');
});
test('cross-phase projected lanes never combine rankings',()=>{
 const a=projectEvidenceLanes187({fieldDecision:run(),attributedFacts:{phase:185,status:'source_attributed_facts_available',facts:[],reasons:['attributed only'],
  rankingAuthorized:false,catalog181PromotionAuthorized:false,reviewIsNotProofOfScience:true}});
 assert.equal(a.neverCombineRanksAutomatically,true);assert.equal(a.noEvidenceTierPromotion,true);
 assert.equal(a.independentOriginalTestRanking.length,0);
});

test('unsigned source-tier changes cannot upgrade a provisional to certified result',()=>{
 const e=signed(catalog());e.catalog.variants[2].observations=[{...obs('oc','c',190),'sourceClass':'certified_or_verified_register'}];
 assert.equal(compareFieldEvidence187({goal,catalog:e,authority}).status,'research_required');
});
test('signed field policy can prohibit a source class, even if it uses same protocol',()=>{
 const c=catalog();c.policies=[{...policy,acceptedForFit:['independent_professional_test']}];
 assert.equal(run(c).held.find(x=>x.variantId==='a')?.disposition,'conflict_or_method_mismatch');
});
test('manufacturer-only below-threshold value does not establish definitive exclusion',()=>{
 const c=catalog();c.variants=[{id:'m',name:'Fictional M',observations:[obs('om','m',100,'manufacturer_specification')]}];
 const d=run(c);assert.equal(d.held[0].disposition,'manufacturer_indicated_below_requirement');
 assert.match(d.held[0].explanation,/verify before excluding/);
});
test('field policy cannot authorize manufacturer evidence as confirmed fit',()=>{
 const c=catalog();c.policies=[{...policy,acceptedForFit:['manufacturer_specification' as any]}];
 assert.equal(run(c).status,'research_required');
});
test('one registry statement must not be used for an independent-lab-only field',()=>{
 const c=catalog();c.policies=[{...policy,acceptedForFit:['independent_professional_test']}];
 const d=run(c);assert.deepEqual(d.compatible,[]);assert.equal(d.noIndependentReviewInferred,true);
});

test('AC capacity is technical suitability, not a general winner',()=>{
 const c=catalog();c.category='window_room_air_conditioner';c.policies=[{...policy,dimension:'rated_capacity',unit:'btu_per_hour',protocolId:'doe_rac',
  protocolVersion:'2024',threshold:8000,thresholdMax:8000,profileId:'room_300_350',comparison:'no_order',reviewedApplicability:'Illustrative 8 foot ceiling and typical conditions only.'}];
 c.variants=[{id:'rac_a',name:'Fictional RAC A',observations:[{...obs('rac1','rac_a',8000),dimension:'rated_capacity',unit:'btu_per_hour',protocolId:'doe_rac',protocolVersion:'2024'}]},
 {id:'rac_b',name:'Fictional RAC B',observations:[{...obs('rac2','rac_b',6000,'manufacturer_specification'),dimension:'rated_capacity',unit:'btu_per_hour',protocolId:'doe_rac',protocolVersion:'2024'}]}];
 const d=run(c,{...goal,category:'window_room_air_conditioner',profileId:'room_300_350'});
 assert.equal(d.compatible[0].variantId,'rac_a');assert.equal(d.ordered.length,0);
 assert.equal(d.held[0].disposition,'manufacturer_indicated_below_requirement');
});
test('single-field comparison does not infer that more cooling capacity is better',()=>{
 const c=catalog();c.category='window_room_air_conditioner';c.policies=[{...policy,dimension:'rated_capacity',unit:'btu_per_hour',
 protocolId:'doe_rac',protocolVersion:'2024',threshold:8000,thresholdMax:8000,profileId:'room_300_350',comparison:'no_order'}];
 c.variants=[{id:'ac1',name:'Fictional AC One',observations:[{...obs('ac1_o','ac1',8000),dimension:'rated_capacity',unit:'btu_per_hour',protocolId:'doe_rac',protocolVersion:'2024'}]},
 {id:'ac2',name:'Fictional AC Two',observations:[{...obs('ac2_o','ac2',10000),dimension:'rated_capacity',unit:'btu_per_hour',protocolId:'doe_rac',protocolVersion:'2024'}]}];
 const d=run(c,{...goal,category:'window_room_air_conditioner',profileId:'room_300_350'});
 assert.equal(d.compatible.length,1);assert.equal(d.held[0].disposition,'inadequate_for_field');assert.equal(d.ordered.length,0);
 // The actual overcapacity policy remains Phase186: this generic lower-bound contract cannot decide oversizing.
 assert.equal(d.noGeneralProductRanking,true);
});
test('projection cannot authorize website publication or cross-category mixing',()=>{
 const projected=projectEvidenceLanes187({fieldDecision:run()});
 assert.equal(projected.notWebPublishableWithoutScopeBinding,true);
});

test('invalid numeric range cannot be reviewed and published',()=>{const c=catalog();c.policies=[{...policy,thresholdMax:100}];assert.equal(run(c).status,'research_required');});
