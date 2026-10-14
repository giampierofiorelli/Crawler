import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {createDecision177,applyDecisionAction177,type DecisionSnapshot177} from '../src/phase177_decision_snapshot.js';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import {dynamicKnowledgeAnswer181,type ProductKnowledgeCatalog181,type SignedCatalog181} from '../src/phase181_dynamic_knowledge_ranking.js';
const keys=generateKeyPairSync('ed25519');
const authority={publicKeys:{independent_reviewer:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-12T19:00:00Z',market:'uk'};
const hash=(x:string)=>createHash('sha256').update(x).digest('hex');
function state({id='example',carpetPriority='high',stairsPriority='normal',category='vacuum'}:{id?:string;carpetPriority?:'high'|'low'|'hard'|'normal';stairsPriority?:'high'|'low'|'hard'|'normal';category?:string}={}):DecisionSnapshot177{
 let s=createDecision177(id);
 s=applyDecisionAction177(s,{type:'set_scope',source:'user_web_control',scope:{task:'product_selection',category}}).snapshot;
 s=applyDecisionAction177(s,{type:'set_criterion',source:'user_web_control',key:'carpet_pickup',label:'Carpet pickup',value:{kind:'boolean',value:true},priority:carpetPriority}).snapshot;
 s=applyDecisionAction177(s,{type:'set_criterion',source:'user_web_control',key:'stair_handling',label:'Easy handling on stairs',value:{kind:'boolean',value:true},priority:stairsPriority}).snapshot;
 return s;
}
const dim=(key:string,label:string)=>({key,label,value:{kind:'boolean' as const,value:true},methodId:'independent_protocol',protocolVersion:'v1',
 weightUnits:{hard:8000,high:4000,normal:2000,low:500},weightingReviewReference:'reviewed_preferences',normalizationReviewReference:'reviewed_normalization'});
const testRef=(id:string,variantId:string,dimensionKey:string)=>({id,variantId,dimensionKey,originalTestId:`original_${id}`,methodId:'independent_protocol',protocolVersion:'v1',sourceUrl:`https://original.example/tests/${id}`,observedAt:'2026-10-10T00:00:00Z',scope:'exact_variant_original_professional_test' as const});
function catalog():ProductKnowledgeCatalog181{
 return {phase:181,schema:'181.1',market:'uk',categoryId:'vacuum',knowledgeRevision:'observations_v1',policyRevision:'reviewed_policy_v1',reviewedAt:'2026-10-11T00:00:00Z',expiresAt:'2026-10-31T00:00:00Z',
  discoveredVariantIds:['model_a','model_b','model_c','model_d'],marketCoverageComplete:false,coverageStatement:'This is a deliberately bounded selection of fictional test models.',
  dimensions:[dim('carpet_pickup','Carpet pickup'),dim('stair_handling','Easy handling on stairs')],
  originalTests:[testRef('a1','model_a','carpet_pickup'),testRef('a2','model_a','stair_handling'),testRef('b1','model_b','carpet_pickup'),testRef('b2','model_b','stair_handling'),testRef('c1','model_c','carpet_pickup')],
  products:[
   {variantId:'model_a',name:'Fictional Model A',observations:[{dimensionKey:'carpet_pickup',valuePoints:9000,hardOutcome:'pass',evidenceId:'a1'},{dimensionKey:'stair_handling',valuePoints:4000,hardOutcome:'pass',evidenceId:'a2'}]},
   {variantId:'model_b',name:'Fictional Model B',observations:[{dimensionKey:'carpet_pickup',valuePoints:6000,hardOutcome:'pass',evidenceId:'b1'},{dimensionKey:'stair_handling',valuePoints:9500,hardOutcome:'pass',evidenceId:'b2'}]},
   {variantId:'model_c',name:'Fictional Model C',observations:[{dimensionKey:'carpet_pickup',valuePoints:8000,hardOutcome:'pass',evidenceId:'c1'}]}],
  externalReviewReference:'independent_board_review_1'};
}
function signed(c=catalog()):SignedCatalog181 {return {catalog:c,keyId:'independent_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),keys.privateKey).toString('base64')};}
function run(s=state(),c:SignedCatalog181|null=signed(),extra:Record<string,unknown>={}){return dynamicKnowledgeAnswer181({snapshot:s,catalog:c,authority,...extra});}
const clone=<T>(x:T):T=>JSON.parse(JSON.stringify(x));
test('ranking computed at request time, catalog has no ranking or fingerprint',()=>{
 const c:any=catalog();assert.equal('ranked' in c,false);assert.equal('rankInputFingerprint' in c,false);
 const r=run(state(),signed(c));assert.equal(r.status,'ranking_ready');assert.equal(r.rankingsPrecomputed,false);
 assert.deepEqual(r.ranked.map(x=>x.variantId),['model_a','model_b']);
});
test('the same product knowledge is reranked when legitimate priorities change',()=>{
 const base=run(),revised=run(state({carpetPriority:'low',stairsPriority:'high'}));
 assert.equal(base.ranked[0].variantId,'model_a');assert.equal(revised.ranked[0].variantId,'model_b');
 assert.equal(base.knowledgeRevision,revised.knowledgeRevision);
 assert.notEqual(base.rankInputFingerprint,revised.rankInputFingerprint);
});
test('same canonical criteria, different users and edit histories imply same ordering',()=>{
 const one=run(state({id:'user_one'}));const two=run(state({id:'user_two'}));
 assert.equal(one.rankInputFingerprint,two.rankInputFingerprint);assert.deepEqual(one.ranked,two.ranked);
});
test('missing one test keeps exact variant visible, not scored',()=>{
 const r=run();assert.equal(r.coverage.discovered,4);assert.equal(r.coverage.reviewed,3);
 assert.ok(r.held.some(x=>x.variantId==='model_c'&&x.reason.includes('stair_handling')));
 assert.ok(r.researchGaps.some(x=>x.kind==='missing_test'&&x.reference==='model_c:stair_handling'));
});
test('discovered but not measured product remains in research queue',()=>{
 const r=run();assert.ok(r.held.some(x=>x.variantId==='model_d'));
 assert.ok(r.researchGaps.some(x=>x.kind==='missing_product'&&x.reference==='model_d'));
});
test('explicitly requested unknown product triggers targeted research',()=>{
 const r=run(state(),signed(),{requestedVariantId:'new_vacuum'});
 assert.ok(r.researchGaps.some(x=>x.kind==='missing_product'&&x.reference==='new_vacuum'));
 assert.equal(r.researchAccessPerformed,false);
});
test('an unreviewed new category triggers discovery, not a random-category ranking',()=>{
 const r=run(state({category:'air_purifier'}));assert.equal(r.status,'research_required');
 assert.deepEqual(r.ranked,[]);assert.ok(r.researchGaps.some(x=>x.kind==='new_category'));
});
test('no catalog triggers acquisition, not fabricated product recommendations',()=>{
 const r=run(state(),null);assert.equal(r.status,'research_required');
 assert.ok(r.researchGaps.some(x=>x.kind==='no_catalog'));assert.equal(r.ranked.length,0);
});
test('an extra user criterion absent from catalog blocks incomplete answers',()=>{
 const s=applyDecisionAction177(state(),{type:'set_criterion',source:'user_web_control',key:'allergy_filtration',label:'Allergy filtration',value:{kind:'boolean',value:true},priority:'hard'}).snapshot;
 const r=run(s);assert.equal(r.status,'research_required');assert.deepEqual(r.ranked,[]);
 assert.ok(r.researchGaps.some(x=>x.kind==='missing_criterion'&&x.reference==='allergy_filtration'));
});
test('label-only meaning drift cannot reuse old knowledge',()=>{
 const s=applyDecisionAction177(state(),{type:'set_criterion',source:'user_web_control',key:'carpet_pickup',label:'Water filtration instead',value:{kind:'boolean',value:true},priority:'high'}).snapshot;
 assert.equal(s.rankInputFingerprint,state().rankInputFingerprint);
 assert.equal(run(s).status,'research_required');
});
test('value-only meaning change cannot reuse knowledge',()=>{
 const s=applyDecisionAction177(state(),{type:'set_criterion',source:'user_web_control',key:'carpet_pickup',label:'Carpet pickup',value:{kind:'boolean',value:false},priority:'high'}).snapshot;
 assert.equal(run(s).status,'research_required');
});
test('candidate NLP proposal is not an approved requirement',()=>{
 const s=applyDecisionAction177(state(),{type:'propose_candidate',source:'english_intake_candidate',key:'pet_hair',label:'Pet hair pickup',value:{kind:'boolean',value:true},referenceHash:hash('I have pets')}).snapshot;
 const r=run(s);assert.equal(r.status,'ranking_ready');assert.equal(r.ranked.length,2);
 assert.equal(s.criteria.some(x=>x.key==='pet_hair'&&x.status==='confirmed'),false);
});
test('no confirmed requirements prohibits arbitrary rankings',()=>{
 let s=createDecision177('fresh');s=applyDecisionAction177(s,{type:'set_scope',source:'user_web_control',scope:{category:'vacuum',task:'product_selection'}}).snapshot;
 const r=run(s);assert.equal(r.status,'research_required');assert.ok(r.researchGaps.some(x=>x.kind==='unconfirmed_need'));
});
test('unknown hard gate holds a product even if numeric score is high',()=>{
 const c:any=catalog();c.products[0].observations[1].hardOutcome='unknown';c.products[0].observations[1].valuePoints=0;
 const r=run(state({stairsPriority:'hard'}),signed(c));assert.ok(r.held.some(x=>x.variantId==='model_a'));
 assert.equal(r.ranked.some(x=>x.variantId==='model_a'),false);
});
test('failed hard gate always vetoes high score',()=>{
 const c:any=catalog();c.products[0].observations[1].hardOutcome='fail';
 const r=run(state({stairsPriority:'hard'}),signed(c));assert.ok(r.held.some(x=>x.variantId==='model_a'&&x.reason.includes('failure')));
});
test('hard gate with passing evidence can rank',()=>{
 const r=run(state({stairsPriority:'hard'}));assert.equal(r.status,'ranking_ready');assert.equal(r.ranked.length,2);
});
test('new independently approved product knowledge can change ranks without publishing a new pre-ranked list',()=>{
 const c:any=catalog();c.knowledgeRevision='observations_v2';c.originalTests.push(testRef('d1','model_d','carpet_pickup'),testRef('d2','model_d','stair_handling'));
 c.products.push({variantId:'model_d',name:'Fictional Model D',observations:[{dimensionKey:'carpet_pickup',valuePoints:9900,hardOutcome:'pass',evidenceId:'d1'},{dimensionKey:'stair_handling',valuePoints:9900,hardOutcome:'pass',evidenceId:'d2'}]});
 const r=run(state(),signed(c));assert.equal(r.ranked[0].variantId,'model_d');assert.equal(r.knowledgeRevision,'observations_v2');
});
test('product evidence is tied to exact variant: cross variant source fails closed',()=>{
 const c:any=catalog();c.products[0].observations[0].evidenceId='b1';assert.equal(run(state(),signed(c)).status,'research_required');
});
test('wrong protocol version cannot be silently compared',()=>{
 const c:any=catalog();c.originalTests[0].protocolVersion='v2';assert.equal(run(state(),signed(c)).status,'research_required');
});
test('tampered catalog loses signature and is not ranked',()=>{
 const env=signed();env.catalog.products[0].observations[0].valuePoints=10000;
 assert.equal(run(state(),env).status,'research_required');
});
test('unrecognized signature issuer is rejected',()=>{
 const env=signed();env.keyId='shopper';assert.equal(run(state(),env).status,'research_required');
});
test('changing server market invalidates catalog',()=>{
 const r=dynamicKnowledgeAnswer181({snapshot:state(),catalog:signed(),authority:{...authority,market:'us'}});
 assert.equal(r.status,'research_required');
});
test('expired catalog queues targeted refresh',()=>{
 const r=dynamicKnowledgeAnswer181({snapshot:state(),catalog:signed(),authority:{...authority,asOf:'2027-01-01T00:00:00Z'}});
 assert.equal(r.status,'research_required');assert.ok(r.researchGaps.some(x=>x.kind==='stale_knowledge'));
});
test('declaring exhaustive market coverage is rejected even if signed',()=>{
 const c:any=catalog();(c as any).marketCoverageComplete=true;
 assert.equal(run(state(),signed(c)).status,'research_required');
});
test('policy changes affect dynamic decision only when signed and reviewed',()=>{
 const c:any=catalog();c.dimensions[0].weightUnits.high=500;c.dimensions[1].weightUnits.normal=5000;c.policyRevision='reviewed_policy_v2';
 const r=run(state(),signed(c));assert.equal(r.ranked[0].variantId,'model_b');assert.equal(r.policyRevision,'reviewed_policy_v2');
});
test('unsigned policy edits cannot change ranking',()=>{
 const env=signed();(env.catalog as any).dimensions[0].weightUnits.high=1;
 const r=run(state(),env);assert.equal(r.status,'research_required');
});
test('clear distinctions: request-time ranking does not mean request-time internet access or independently valid science',()=>{
 const r=run();assert.equal(r.rankingsPrecomputed,false);assert.equal(r.researchAccessPerformed,false);
 assert.equal(r.scientificValidityNotEstablishedBySignature,true);
});
test('repeated evaluation against unchanged data is deterministic',()=>{
 const env=signed();assert.deepEqual(run(state(),env),run(state(),env));
});

test('even non-hard requirements cannot be scored from an explicitly unknown observation',()=>{
 const c:any=catalog();c.products[0].observations[1].hardOutcome='unknown';c.products[0].observations[1].valuePoints=0;
 const r=run(state(),signed(c));assert.equal(r.ranked.some(x=>x.variantId==='model_a'),false);
 assert.ok(r.researchGaps.some(x=>x.reference==='model_a:stair_handling'));
});
