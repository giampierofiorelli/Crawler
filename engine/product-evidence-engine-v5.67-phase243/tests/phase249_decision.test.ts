import test from 'node:test';import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {createDecision177,applyDecisionAction177,type DecisionSnapshot177,type CriterionValue177,type CriterionPriority177} from '../src/phase177_decision_snapshot.js';
import {canonicalJson180,type ReviewedRelease180} from '../src/phase180_reviewed_first_answer.js';
import {decideAdvice249,comparable249,capacityFromName249,type Candidate249} from '../src/phase249_decision.js';
// Synthetic, isolated functional fixtures: these products, declarations and test results are invented for the test
// and are never real-world evidence.
const snap=(criteria:[string,string,CriterionValue177,CriterionPriority177][],category='air_fryers')=>{
 let s:DecisionSnapshot177=applyDecisionAction177(createDecision177('t'),{type:'set_scope',source:'user_web_control',scope:{category,task:'product_selection'}}).snapshot;
 for(const [key,label,value,priority] of criteria)s=applyDecisionAction177(s,{type:'set_criterion',source:'user_web_control',key,label,value,priority}).snapshot;
 return s;};
const decl=(id:string,property:string,value:unknown,raw:string,url='https://maker.example/p')=>({declarationId:id,property,value:value as never,rawValue:raw,evidenceRole:'manufacturer_declaration',sourceUrl:url,variantId:null});
const q=(n:number,unit:string)=>({kind:'quantity',number:n,unit,approximate:false});
const C:Candidate249[]=[
 {productId:'p_big',name:'Synthetic Big Fryer',declarations:[decl('d1','Capacity',q(6.2,'l'),'6.2 L'),decl('d2','Price',{kind:'price',amount:129,currency:'GBP'},'£129')]},
 {productId:'p_small',name:'Synthetic Small Fryer',declarations:[decl('d3','Capacity',q(2,'l'),'2 L'),decl('d4','Price',{kind:'price',amount:59,currency:'GBP'},'£59')]},
 {productId:'p_quart',name:'Synthetic US Fryer',declarations:[decl('d5','Capacity',q(6.8,'qt'),'6.8 qt'),decl('d6','Price',{kind:'price',amount:139,currency:'USD'},'$139')]},
 {productId:'p_none',name:'Synthetic Unspecified Fryer',declarations:[decl('d7','Colour',{kind:'text',text:'Black'},'Black')]},
 {productId:'p_conf',name:'Synthetic Conflicted Fryer',declarations:[decl('d8','Capacity',q(5.5,'l'),'5.5 L','https://a.example/x'),decl('d9','Capacity',q(4,'l'),'4 L','https://b.example/y')]},
];
test('nothing confirmed: clarify; performance-only needs: withhold with a research plan',()=>{
 assert.equal(decideAdvice249({snapshot:snap([]),candidates:C}).decision,'clarify');
 const a=decideAdvice249({snapshot:snap([['crisp_texture','Crisp chips without oil',{kind:'boolean',value:true},'high']]),candidates:C});
 assert.equal(a.decision,'withhold_insufficient_evidence');assert.equal(a.rankingAuthorized,false);assert.ok(a.researchPlan[0].includes('independent measurements'));
});
test('factual constraints with cited declarations give an unordered shortlist; unknown and conflicting products are listed, not dropped',()=>{
 const a=decideAdvice249({snapshot:snap([['capacity_min','Room for a family meal',{kind:'quantity',value:5,unit:'l'},'hard']]),candidates:C});
 assert.equal(a.decision,'requirements_shortlist');assert.equal(a.ordered,false);assert.equal(a.rankingAuthorized,false);
 assert.deepEqual(a.shortlist.map(s=>s.productId),['p_big','p_quart']); // 6.8 US qt = 6.4 l
 assert.ok(a.shortlist[0].evidence[0].sourceUrl?.startsWith('https://'));
 assert.equal(a.checks.find(c=>c.productId==='p_small')!.outcome,'fails');
 assert.equal(a.checks.find(c=>c.productId==='p_none')!.outcome,'unknown');
 assert.match(a.checks.find(c=>c.productId==='p_conf')!.checks[0].reason,/sources disagree/);
 assert.ok(a.cautions.some(c=>/not independent performance tests/.test(c)));
});
test('a budget is compared only in its currency; a performance need on top keeps the shortlist but marks it unverified',()=>{
 const a=decideAdvice249({snapshot:snap([['capacity_min','Family size',{kind:'quantity',value:5,unit:'l'},'hard'],['budget_max','Under £150',{kind:'quantity',value:150,unit:'gbp'},'hard'],
  ['even_cooking','Cooks evenly',{kind:'boolean',value:true},'high']]),candidates:C});
 assert.equal(a.decision,'requirements_shortlist_performance_unverified');assert.deepEqual(a.shortlist.map(s=>s.productId),['p_big']);
 assert.equal(a.checks.find(c=>c.productId==='p_quart')!.outcome,'unknown'); // USD price cannot be checked against GBP
 assert.deepEqual(a.unverifiedNeeds,['Cooks evenly']);
});
test('a justified negative answer when every known candidate fails a hard requirement',()=>{
 const two=C.filter(c=>c.productId==='p_big'||c.productId==='p_small');
 assert.equal(decideAdvice249({snapshot:snap([['capacity_min','Very large',{kind:'quantity',value:10,unit:'l'},'hard']]),candidates:two}).decision,'no_candidate_meets_requirements');
});
test('a signed reviewed release with original test results produces an ordered recommendation; a forged one does not',()=>{
 const s=snap([['even_cooking','Cooks evenly',{kind:'boolean',value:true},'high']]);
 const keys=generateKeyPairSync('ed25519');const authority={publicKeys:{board:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-15T00:00:00Z',market:'uk'};
 const ev=(id:string,v:string)=>({id,variantId:v,originalTestId:'t_'+id,methodId:'even_cooking_protocol',protocolVersion:'v1',sourceUrl:`https://lab.example/${id}`,observedAt:'2026-10-01T00:00:00Z',scope:'exact_variant_original_professional_test' as const});
 const release:ReviewedRelease180={phase:180,schema:'180.1',market:'uk',categoryId:'air_fryers',rankInputFingerprint:s.rankInputFingerprint,evidenceRevision:'ev_1',policyRevision:'pol_1',
  reviewedAt:'2026-10-10T00:00:00Z',expiresAt:'2026-11-10T00:00:00Z',discoveredVariantIds:['p_big','p_small'],coverageStatement:'Synthetic two-product test population.',marketCoverageComplete:false,
  criteriaWeights:[{key:'even_cooking',weightUnits:10000,elicitationReference:'policy_receipt',methodId:'even_cooking_protocol',protocolVersion:'v1'}],
  reviewedCriteria:s.criteria.map(c=>({key:c.key,label:c.label,value:c.value,priority:c.priority})),evidence:[ev('e1','p_big'),ev('e2','p_small')],
  variants:[{id:'p_big',name:'Synthetic Big Fryer',criteria:[{key:'even_cooking',valuePoints:8000,evidenceIds:['e1']}],hardAssessments:[]},
   {id:'p_small',name:'Synthetic Small Fryer',criteria:[{key:'even_cooking',valuePoints:6000,evidenceIds:['e2']}],hardAssessments:[]}],externalReviewReference:'synthetic_review'};
 const signed={release,keyId:'board',signatureBase64:sign(null,Buffer.from(canonicalJson180(release)),keys.privateKey).toString('base64')};
 const a=decideAdvice249({snapshot:s,candidates:C,signedRelease:signed,authority});
 assert.equal(a.decision,'ranked_recommendation');assert.equal(a.rankingAuthorized,true);assert.deepEqual(a.ranked.map(r=>r.variantId),['p_big','p_small']);
 const forged={...signed,release:{...release,variants:[...release.variants].reverse()}};
 const b=decideAdvice249({snapshot:s,candidates:C,signedRelease:forged,authority});
 assert.notEqual(b.decision,'ranked_recommendation');assert.equal(b.rankingAuthorized,false);
});
test('unit conversion only within one family; approximate and bounded values are not used as facts',()=>{
 assert.equal(Math.round(comparable249({kind:'quantity',number:6.8,unit:'qt',approximate:false},'volume','l')!*10)/10,6.4);
 assert.equal(comparable249({kind:'quantity',number:5,unit:'kg',approximate:false},'volume','l'),null);
 assert.equal(comparable249({kind:'quantity',number:5,unit:'l',approximate:true},'volume','l'),null);
 assert.equal(comparable249({kind:'quantity',number:5,unit:'l',approximate:false,bound:'max'},'volume','l'),null);
});
test('a single capacity token in a product name is a declaration; ambiguous names give none',()=>{
 assert.deepEqual(capacityFromName249('Ninja Foodi AF300UK 7.6L Dual Zone Air Fryer'),{kind:'quantity',number:7.6,unit:'l',approximate:false});
 assert.deepEqual(capacityFromName249('Pro LE 5.0-Quart Air Fryer'),{kind:'quantity',number:5,unit:'qt',approximate:false});
 assert.equal(capacityFromName249('Dual 4L + 4L basket fryer'),null);assert.equal(capacityFromName249('Air Fryer'),null);
 assert.equal(capacityFromName249('Model L200 fryer'),null);
});
