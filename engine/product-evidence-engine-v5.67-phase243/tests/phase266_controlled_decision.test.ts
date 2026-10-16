import test from 'node:test';import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {createDecision177,applyDecisionAction177,type DecisionSnapshot177} from '../src/phase177_decision_snapshot.js';
import {canonicalJson180,type ReviewedRelease180} from '../src/phase180_reviewed_first_answer.js';
import {dynamicKnowledgeAnswer181,type ProductKnowledgeCatalog181} from '../src/phase181_dynamic_knowledge_ranking.js';
import {decideAdvice249} from '../src/phase249_decision.js';

// Reality check 2026-10-16 — CONTROLLED DECISION TEST. SYNTHETIC: fictional espresso machines, hypothetical reviewer
// scores (valuePoints) and a key generated here. It never touches a knowledge store and is NOT authentic validation. It
// asks one question: given sufficient, contract-compliant reviewed evidence, does the existing decision path (Phase177
// snapshot → Phase181 on-demand ranking, and Phase180 through decideAdvice249) give the correct, deterministic answer?
const keys=generateKeyPairSync('ed25519');
const authority={publicKeys:{synthetic_reviewer:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-16T12:00:00Z',market:'uk'};
const TRUE={kind:'boolean' as const,value:true};
function snapshot(priorities:{taste:'high'|'normal';stability:'high'|'normal'}={taste:'high',stability:'normal'}):DecisionSnapshot177{
 let s=createDecision177('controlled');
 s=applyDecisionAction177(s,{type:'set_scope',source:'user_explicit_confirmation',scope:{task:'product_selection',category:'coffee_machines'}}).snapshot;
 s=applyDecisionAction177(s,{type:'set_criterion',source:'user_explicit_confirmation',key:'fits_under_cupboard',label:'Fits under my cupboards',value:TRUE,priority:'hard'}).snapshot;
 s=applyDecisionAction177(s,{type:'set_criterion',source:'user_explicit_confirmation',key:'espresso_taste',label:'Traditional espresso taste',value:TRUE,priority:priorities.taste}).snapshot;
 s=applyDecisionAction177(s,{type:'set_criterion',source:'user_explicit_confirmation',key:'temperature_stability',label:'Brew temperature stability',value:TRUE,priority:priorities.stability}).snapshot;
 return s;
}
const dim=(key:string,label:string)=>({key,label,value:TRUE,methodId:'synthetic_protocol',protocolVersion:'v1',
 weightUnits:{hard:8000,high:4000,normal:2000,low:500},weightingReviewReference:'synthetic_weights',normalizationReviewReference:'synthetic_normalisation'});
type Obs={k:string;p:number;o:'pass'|'fail'|'unknown'};
const P=(id:string,obs:Obs[])=>({variantId:id,name:`Fictional ${id}`,observations:obs.map(o=>({dimensionKey:o.k,valuePoints:o.p,hardOutcome:o.o,evidenceId:`${id}_${o.k}`}))});
const fits=(o:'pass'|'fail'|'unknown'='pass'):Obs=>({k:'fits_under_cupboard',p:o==='pass'?10000:0,o});
const t=(p:number):Obs=>({k:'espresso_taste',p,o:'pass'}),st=(p:number):Obs=>({k:'temperature_stability',p,o:'pass'});
function catalog(products=[
 P('machine_a',[fits(),t(9000),st(5000)]),   // strong taste, weak stability
 P('machine_b',[fits(),t(7000),st(9000)]),   // weaker taste, strong stability: offsets exactly under the default weights
 P('machine_c',[fits('fail'),t(9500),st(9500)]), // best measurements, fails the essential constraint
 P('machine_d',[fits(),t(6000)]),            // stability not measured
 P('machine_e',[fits('unknown'),t(8000),st(4000)]), // fit not comparable / not established
 P('machine_f',[fits(),t(5000),st(6000)])]):ProductKnowledgeCatalog181{
 const ids=[...products.map(p=>p.variantId),'machine_g'];
 return {phase:181,schema:'181.1',market:'uk',categoryId:'coffee_machines',knowledgeRevision:'synthetic_v1',policyRevision:'synthetic_policy_v1',
  reviewedAt:'2026-10-15T00:00:00Z',expiresAt:'2026-11-15T00:00:00Z',discoveredVariantIds:ids,marketCoverageComplete:false,
  coverageStatement:'Synthetic controlled set of fictional machines; not market data.',
  dimensions:[dim('fits_under_cupboard','Fits under my cupboards'),dim('espresso_taste','Traditional espresso taste'),dim('temperature_stability','Brew temperature stability')],
  originalTests:products.flatMap(p=>p.observations.map(o=>({id:o.evidenceId,variantId:p.variantId,dimensionKey:o.dimensionKey,originalTestId:`orig_${o.evidenceId}`,
   methodId:'synthetic_protocol',protocolVersion:'v1',sourceUrl:`https://synthetic.pee266-fixture.test/${o.evidenceId}`,observedAt:'2026-10-14T00:00:00Z',scope:'exact_variant_original_professional_test' as const}))),
  products,externalReviewReference:'synthetic_review'};
}
const signed=(c:ProductKnowledgeCatalog181)=>({catalog:c,keyId:'synthetic_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),keys.privateKey).toString('base64')});
const run=(s=snapshot(),c=catalog())=>dynamicKnowledgeAnswer181({snapshot:s,catalog:signed(c),authority});

test('controlled: a justified, deterministic ranking with exclusion, missing and incomparable evidence, and a legitimate tie',()=>{
 const r=run();
 assert.equal(r.status,'ranking_ready');
 // (9000·4000 + 5000·2000 + 10000·8000)/14000 = 9000 for A; (7000·4000 + 9000·2000 + 80e6)/14000 = 9000 for B; F = 8000.
 assert.deepEqual(r.ranked.map(x=>[x.variantId,x.rank,x.scorePoints]),[['machine_a',1,9000],['machine_b',1,9000],['machine_f',3,8000]]);
 const held=Object.fromEntries(r.held.map(h=>[h.variantId,h.reason]));
 assert.match(held.machine_c,/failure of essential criterion: fits_under_cupboard/,'the best-measured machine is excluded by the essential constraint');
 assert.match(held.machine_d,/missing: temperature_stability/,'missing value: held, not scored as zero');
 assert.match(held.machine_e,/missing: fits_under_cupboard/,'an unestablished essential outcome is not treated as a pass');
 assert.match(held.machine_g,/no independently reviewed/,'discovered but unreviewed');
 assert.ok(r.researchGaps.some(g=>g.kind==='missing_test'&&g.reference==='machine_d:temperature_stability'));
});

test('controlled: positive and negative contributions move the order when priorities change; order is deterministic',()=>{
 const r=run(snapshot({taste:'normal',stability:'high'}));
 // A: (9000·2000+5000·4000+80e6)/14000 = 8429; B: (7000·2000+9000·4000+80e6)/14000 = 9286.
 assert.deepEqual(r.ranked.map(x=>[x.variantId,x.scorePoints]).slice(0,2),[['machine_b',9286],['machine_a',8429]]);
 const c=catalog();const shuffled={...c,products:[...c.products].reverse()};
 assert.deepEqual(run(snapshot(),shuffled).ranked,run().ranked,'catalog order does not change the answer');
 assert.deepEqual(run().ranked,run().ranked,'same request, criteria and evidence: same answer');
});

test('controlled: justified abstention when no product has sufficient evidence; a conflict fails closed for the whole catalog',()=>{
 const none=run(snapshot(),catalog([P('machine_d',[fits(),t(6000)]),P('machine_e',[fits('unknown'),t(8000),st(4000)])]));
 assert.equal(none.status,'research_required');assert.equal(none.ranked.length,0);
 // Two reviewed observations of one dimension for one product (a documented conflict) cannot be represented: the
 // catalog is refused as a whole and nothing is ranked (finding: no per-product conflict handling in Phase181).
 const base=catalog();const conflict={...base,products:[{...base.products[0],observations:[...base.products[0].observations,
  {dimensionKey:'espresso_taste',valuePoints:4000,hardOutcome:'pass' as const,evidenceId:'machine_a_espresso_taste'}]},...base.products.slice(1)]};
 const r=run(snapshot(),conflict);
 assert.equal(r.status,'research_required');assert.ok(r.researchGaps.some(g=>g.kind==='need_review'));
});

test('controlled: the existing decideAdvice249 route ranks only with a signed Phase180 release bound to these exact criteria',()=>{
 const s=snapshot();
 const crit=s.criteria.filter(c=>c.status==='confirmed');
 const ev=(id:string,v:string)=>({id,variantId:v,originalTestId:`orig_${id}`,methodId:'synthetic_protocol',protocolVersion:'v1',sourceUrl:`https://synthetic.pee266-fixture.test/${id}`,
  observedAt:'2026-10-14T00:00:00Z',scope:'exact_variant_original_professional_test' as const});
 const release:ReviewedRelease180={phase:180,schema:'180.1',market:'uk',categoryId:'coffee_machines',rankInputFingerprint:s.rankInputFingerprint,evidenceRevision:'synthetic_v1',
  policyRevision:'synthetic_policy_v1',reviewedAt:'2026-10-15T00:00:00Z',expiresAt:'2026-11-15T00:00:00Z',discoveredVariantIds:['machine_a','machine_b'],
  coverageStatement:'Synthetic controlled set of fictional machines.',marketCoverageComplete:false,
  criteriaWeights:[{key:'fits_under_cupboard',weightUnits:5000,elicitationReference:'synthetic_weights',methodId:'synthetic_protocol',protocolVersion:'v1'},
   {key:'espresso_taste',weightUnits:3000,elicitationReference:'synthetic_weights',methodId:'synthetic_protocol',protocolVersion:'v1'},
   {key:'temperature_stability',weightUnits:2000,elicitationReference:'synthetic_weights',methodId:'synthetic_protocol',protocolVersion:'v1'}],
  reviewedCriteria:crit.map(c=>({key:c.key,label:c.label,value:c.value,priority:c.priority})),
  evidence:[ev('ea1','machine_a'),ev('ea2','machine_a'),ev('eb1','machine_b'),ev('eb2','machine_b')],
  variants:[{id:'machine_a',name:'Fictional machine_a',criteria:[{key:'fits_under_cupboard',valuePoints:10000,evidenceIds:['ea1']},{key:'espresso_taste',valuePoints:9000,evidenceIds:['ea1']},{key:'temperature_stability',valuePoints:5000,evidenceIds:['ea2']}],
    hardAssessments:[{key:'fits_under_cupboard',outcome:'pass',evidenceIds:['ea1']}]},
   {id:'machine_b',name:'Fictional machine_b',criteria:[{key:'fits_under_cupboard',valuePoints:10000,evidenceIds:['eb1']},{key:'espresso_taste',valuePoints:7000,evidenceIds:['eb1']},{key:'temperature_stability',valuePoints:9000,evidenceIds:['eb2']}],
    hardAssessments:[{key:'fits_under_cupboard',outcome:'pass',evidenceIds:['eb1']}]}],
  externalReviewReference:'synthetic_review'};
 const signedRelease={release,keyId:'synthetic_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(release)),keys.privateKey).toString('base64')};
 const a=decideAdvice249({snapshot:s,candidates:[],signedRelease,authority});
 assert.equal(a.decision,'ranked_recommendation');assert.equal(a.rankingAuthorized,true);
 // A = (10000·5000 + 9000·3000 + 5000·2000)/10000 = 8700; B = (10000·5000 + 7000·3000 + 9000·2000)/10000 = 8900.
 assert.deepEqual(a.ranked.map(x=>[x.variantId,x.rank,x.scorePoints]),[['machine_b',1,8900],['machine_a',2,8700]]);
 // Without the release (as adviseFromRequest253 always calls it), the same snapshot cannot rank.
 const b=decideAdvice249({snapshot:s,candidates:[]});assert.notEqual(b.decision,'ranked_recommendation');assert.equal(b.rankingAuthorized,false);
});
