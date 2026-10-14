import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  auditModelProposal113,parseModelProposal113,proposeLocalIntent113,
  surfaceSensitivity113,assessIntentBenchmark113,makeLocalOllamaIntentModel113,
  independentlyVerifiedComparison113,
  type IntentProposal113,type LocalIntentModel113,type ReferenceCase113,type ModelCaseResult113
} from '../src/phase113_local_intent_interpreter.js';
import {rankSameIntent112,type EvidenceSnapshot112,type VerifiedIntent112}
  from '../src/phase112_semantic_ranking_invariance.js';

const mk=(q:string,opts:Partial<IntentProposal113>={}):IntentProposal113=>{
  const spans=(slot:IntentProposal113['anchors'][number]['slot'],value:string,t:string)=>{
    const start=q.indexOf(t);if(start<0)throw Error('fixture_missing_anchor_'+t);
    return {slot,value,exactText:t,start,end:start+t.length};
  };
  const italian=q.toLowerCase().includes('aspirapolver');
  const categoryToken=italian?'aspirapolveri':'vacuum cleaners';
  const goalToken=italian?'silenziosi':'quietest';
  const floor=q.includes('pavimenti duri')?'pavimenti duri':'hard floors';
  return {schema:'phase113_intent_proposal_v1',category:'vacuum_cleaner',goal:'least_noise',
    surface:'bare_floor',requirements:[],hygieneTargets:[],ambiguous:false,unresolvedText:[],
    anchors:[spans('category','vacuum_cleaner',categoryToken),
      spans('goal','least_noise',goalToken),spans('surface','bare_floor',floor)],...opts};
};
const q='Dammi gli aspirapolveri più silenziosi sui pavimenti duri';
const english='Which vacuum cleaners are quietest on hard floors';
const model=(p:unknown):LocalIntentModel113=>({modelId:'controlled_mock_not_a_real_llm',
  async generate(_q){return JSON.stringify(p);}});
const snapshot=():EvidenceSnapshot112=>({snapshotId:'rtings_noise_reference_pilot',
  categoryId:'vacuum_cleaner',methodId:'rtings_vacuum_method_v1_4',
  evidenceRevision:'manual_web_validation_20261011',variantIds:['alpha_vac','beta_vac'],
  measurements:[...[
    ['alpha_vac','bare_floor',68],['alpha_vac','low_pile_carpet',76],
    ['beta_vac','bare_floor',70],['beta_vac','low_pile_carpet',67]
  ].map(([variantId,contextId,value])=>({variantId:variantId as string,
    productName:variantId as string,criterionId:'noise_dba' as const,
    contextId:contextId as VerifiedIntent112['contextId'],value:value as number,
    unit:'dBA' as const, methodId:'rtings_vacuum_method_v1_4',
    sourceUrl:'https://example.org/original-review',originalTestId:'lab_'+variantId,
    provenanceStatus:'independent_measured' as const}))]});
const frame=(surface:'bare_floor'|'low_pile_carpet'):VerifiedIntent112=>({
  categoryId:'vacuum_cleaner',criterionId:'noise_dba',contextId:surface,direction:'lower_is_better',
  hardRequirements:[],profileReference:'no_additional_user_constraints_confirmed',
  verification:'explicitly_verified_semantic_frame'});

test('a grounded proposal remains pending independent confirmation, never auto ranking',async()=>{
  const p=await proposeLocalIntent113(q,model(mk(q)));
  assert.equal(p.status,'proposal_pending_independent_confirmation');
  assert.equal(p.rankingEligible,false);assert.equal(p.publicationReady,false);
  assert.equal(p.canonicalEvidenceMutations,0);assert.equal(p.fullRequestStored,false);
  assert.equal(p.proposal?.surface,'bare_floor');
});
test('another language produces compatible proposed slots without proving general NLP',async()=>{
  const a=await proposeLocalIntent113(q,model(mk(q)));
  const b=await proposeLocalIntent113(english,model(mk(english)));
  assert.equal(a.proposal?.category,b.proposal?.category);
  assert.equal(a.proposal?.surface,b.proposal?.surface);
  assert.equal(a.proposal?.goal,b.proposal?.goal);
  assert.notEqual(a.querySha256,b.querySha256);
});
test('missing evidence anchor for a category cannot be auto accepted',()=>{
  const p=mk(q);p.anchors=p.anchors.filter(a=>a.slot!=='category');
  assert.equal(auditModelProposal113(q,p).status,'abstain');
  assert.ok(auditModelProposal113(q,p).problems.includes('category_anchor_missing'));
});
test('invented source quote fails exact anchor',()=>{
  const p=mk(q);p.anchors[0]={...p.anchors[0],exactText:'nonexistent'};
  assert.equal(auditModelProposal113(q,p).status,'abstain');
});
test('wrong character index fails even with a correct quote',()=>{
  const p=mk(q);p.anchors[0]={...p.anchors[0],start:0,end:12};
  assert.ok(auditModelProposal113(q,p).problems.includes('ungrounded_model_anchor'));
});
test('unexpected JSON keys fail closed',()=>{
  assert.throws(()=>parseModelProposal113({...mk(q),verification:'guaranteed'}),/schema/);
});
test('invalid numeric offsets fail closed',()=>{
  const p=mk(q);p.anchors[0].start=NaN;
  assert.throws(()=>parseModelProposal113(p),/invalid_anchor/);
});
test('oversized model response fails closed',()=>{
  assert.throws(()=>parseModelProposal113(' '.repeat(24001)),/too_large/);
});
test('invalid JSON produces an abstention, not automatic parsing',async()=>{
  const p=await proposeLocalIntent113(q,model('{not json'));
  assert.equal(p.status,'abstain');assert.equal(p.proposal,null);
});
test('local model timeout/transport error produces abstention',async()=>{
  const p=await proposeLocalIntent113(q,{modelId:'broken',async generate(){throw Error('offline');}});
  assert.equal(p.status,'abstain');assert.ok(p.problems.includes('local_model_failure_or_invalid_response'));
});
test('single category/goal but unknown surface asks instead of defaulting',()=>{
  const p=mk(q,{surface:'unspecified',ambiguous:true});
  p.anchors=p.anchors.filter(a=>a.slot!=='surface');
  const a=auditModelProposal113(q,p);
  assert.equal(a.status,'clarification_required');
  assert.match(a.suggestedQuestion??'',/moquette/);
});
test('conflicting surface stays unresolved even if model returns a plausible goal',()=>{
  const p=mk(q,{surface:'conflicting',ambiguous:true});
  p.anchors=p.anchors.filter(a=>a.slot!=='surface');
  assert.equal(auditModelProposal113(q,p).status,'clarification_required');
});
test('unexpected cordless requirement omitted by model triggers safety abstention',()=>{
  const s='Which vacuum cleaners are quietest on hard floors and cordless';
  const p=mk(s);
  assert.equal(auditModelProposal113(s,p).status,'abstain');
  assert.ok(auditModelProposal113(s,p).problems.includes('cordless_requirement_not_accounted_for'));
});
test('mentioned cordless captured but requires separate eligibility review',()=>{
  const s='Which vacuum cleaners are quietest on hard floors and cordless';
  const p=mk(s,{requirements:[{requirement:'cordless',strength:'mandatory'}]});
  const start=s.indexOf('cordless');p.anchors.push({slot:'requirement',value:'cordless',
    exactText:'cordless',start,end:start+8});
  const result=auditModelProposal113(s,p);
  assert.equal(result.status,'proposal_pending_independent_confirmation');
  assert.ok(result.problems.includes('requirements_need_separate_verified_eligibility'));
  assert.equal(result.rankingEligible,false);
});
test('numerical budget not silently erased',()=>{
  const s='Which vacuum cleaners are quietest on hard floors under 250 euro';
  const a=auditModelProposal113(s,mk(s));
  assert.equal(a.status,'abstain');assert.ok(a.problems.includes('price_constraint_not_accounted_for'));
});
test('negative constraints get scope review even with identical positive slots',()=>{
  const s='Which vacuum cleaners are quietest on hard floors without bag';
  const a=auditModelProposal113(s,mk(s));
  assert.ok(a.problems.includes('negation_requires_scope_adjudication'));
  assert.equal(a.rankingEligible,false);
});
test('absolute must condition cannot be mistaken for a soft preference',()=>{
  const s='Which vacuum cleaners must be quietest on hard floors';
  const a=auditModelProposal113(s,mk(s));
  assert.ok(a.problems.includes('possible_absolute_requirement_requires_adjudication'));
});
test('dishwasher bacteria and viruses are distinct goals and never noise-rankable',()=>{
  const s='Lavastoviglie che eliminano batteri e virus';
  const span=(slot:IntentProposal113['anchors'][number]['slot'],value:string,text:string)=>{
    const start=s.indexOf(text);return {slot,value,exactText:text,start,end:start+text.length};};
  const p:IntentProposal113={schema:'phase113_intent_proposal_v1',category:'dishwasher',
    goal:'hygiene_effectiveness',surface:'not_applicable',requirements:[],
    hygieneTargets:['bacteria','viruses'],ambiguous:false,unresolvedText:[],
    anchors:[span('category','dishwasher','Lavastoviglie'),span('goal','hygiene_effectiveness','eliminano'),
      span('hygiene_target','bacteria','batteri'),span('hygiene_target','viruses','virus')]};
  const a=auditModelProposal113(s,p);
  assert.equal(a.status,'unsupported_query');
  assert.equal(a.rankingEligible,false);
});
test('failure to mention virus when present is a critical omission',()=>{
  const s='Lavastoviglie che eliminano batteri e virus';
  const start=s.indexOf('Lavastoviglie'),g=s.indexOf('eliminano'),b=s.indexOf('batteri');
  const p:IntentProposal113={schema:'phase113_intent_proposal_v1',category:'dishwasher',
    goal:'hygiene_effectiveness',surface:'not_applicable',requirements:[],
    hygieneTargets:['bacteria'],ambiguous:false,unresolvedText:[],anchors:[
      {slot:'category',value:'dishwasher',exactText:'Lavastoviglie',start,end:start+12},
      {slot:'goal',value:'hygiene_effectiveness',exactText:'eliminano',start:g,end:g+8},
      {slot:'hygiene_target',value:'bacteria',exactText:'batteri',start:b,end:b+7}]};
  const a=auditModelProposal113(s,p);assert.equal(a.status,'abstain');
  assert.ok(a.problems.includes('viral_target_not_accounted_for'));
});
test('different contexts reverse evidence-based ranking, so clarification matters',()=>{
  const x=surfaceSensitivity113(snapshot(),'no_additional_user_constraints_confirmed');
  assert.equal(x.status,'clarify_material_surface_change');
  assert.notDeepEqual(x.bareFloorRanks,x.carpetRanks);
});
test('same order across contexts does not presume a user specified a surface',()=>{
  const s=snapshot();s.measurements=s.measurements.map(m=>m.variantId==='alpha_vac'&&
     m.contextId==='low_pile_carpet'?{...m,value:65}:m);
  const x=surfaceSensitivity113(s,'no_additional_user_constraints_confirmed');
  assert.equal(x.status,'same_order_under_both_test_contexts');
  assert.equal(x.candidateRankingNotPublished,true);
});
test('model output cannot be fed to rankSameIntent112 without verified frame',()=>{
  assert.throws(()=>rankSameIntent112({...frame('bare_floor'),
    verification:'model_guessed' as VerifiedIntent112['verification']},snapshot()),/unverified/);
});
test('independent frames produce identical rankings for same context and snapshot',()=>{
  const a=independentlyVerifiedComparison113(frame('bare_floor'),frame('bare_floor'),snapshot(),snapshot());
  assert.equal(a.rankingEquivalent,true);
});
test('independent frames do not merge different surface contexts',()=>{
  const a=independentlyVerifiedComparison113(frame('bare_floor'),frame('low_pile_carpet'),snapshot(),snapshot());
  assert.equal(a.rankingEquivalent,false);
  assert.ok(a.reasons.includes('different_verified_intent'));
});
test('evidence revision mismatch prevents declaring invariant ranking',()=>{
  const s=snapshot();const t={...snapshot(),evidenceRevision:'revised_20261011'};
  const x=independentlyVerifiedComparison113(frame('bare_floor'),frame('bare_floor'),s,t);
  assert.equal(x.rankingEquivalent,false);assert.ok(x.reasons.includes('different_snapshot'));
});
test('developer-authored benchmark cannot report empirical accuracy',()=>{
  const cases:ReferenceCase113[]=[
    {id:'q_1',family:'vacuum',goldIntentGroup:'hard_floor',goldLabel:'resolvable',goldProvenance:'constructed_by_developer',adjudicatorIds:[]},
    {id:'q_2',family:'vacuum',goldIntentGroup:'hard_floor',goldLabel:'resolvable',goldProvenance:'constructed_by_developer',adjudicatorIds:[]},
    {id:'q_3',family:'vacuum',goldIntentGroup:'carpet',goldLabel:'resolvable',goldProvenance:'constructed_by_developer',adjudicatorIds:[]},
    {id:'q_4',family:'vacuum',goldIntentGroup:'unspecified',goldLabel:'ambiguous',goldProvenance:'constructed_by_developer',adjudicatorIds:[]}
  ];
  const results:ModelCaseResult113[]=[
    {id:'q_1',status:'resolved',proposedIntentGroup:'hard_floor'},
    {id:'q_2',status:'resolved',proposedIntentGroup:'hard_floor'},
    {id:'q_3',status:'resolved',proposedIntentGroup:'hard_floor'},
    {id:'q_4',status:'resolved',proposedIntentGroup:'hard_floor'}];
  const x=assessIntentBenchmark113(cases,results);
  assert.equal(x.empiricalModelAccuracy,null);
  assert.equal(x.diagnostic.falseMergedDifferentIntents,2);
  assert.equal(x.diagnostic.ambiguityOrUnsupportedMisses,1);
});
test('a benchmark cannot pretend one adjudicator is two',()=>{
  const cases:ReferenceCase113[]=[{id:'q_1',family:'vacuum',goldIntentGroup:'bare',
    goldLabel:'resolvable',goldProvenance:'external_independent_adjudication',
    adjudicatorIds:['reviewer_a','reviewer_a']}];
  assert.throws(()=>assessIntentBenchmark113(cases,[{id:'q_1',status:'resolved',proposedIntentGroup:'bare'}]),/invalid_benchmark/);
});
test('externally labeled benchmark shows metrics only with two separate adjudicator IDs',()=>{
  const cases:ReferenceCase113[]=[
    {id:'q_1',family:'vacuum',goldIntentGroup:'bare',goldLabel:'resolvable',goldProvenance:'external_independent_adjudication',adjudicatorIds:['reviewer_a','reviewer_b']},
    {id:'q_2',family:'vacuum',goldIntentGroup:'bare',goldLabel:'resolvable',goldProvenance:'external_independent_adjudication',adjudicatorIds:['reviewer_a','reviewer_b']}];
  const x=assessIntentBenchmark113(cases,[{id:'q_1',status:'resolved',proposedIntentGroup:'bare'},
    {id:'q_2',status:'resolved',proposedIntentGroup:'bare'}]);
  assert.equal(x.empiricalModelAccuracy?.equivalenceConsistency,1);
  assert.match(x.referenceStatus,/not_cryptographically_verified/);
});
test('remote Ollama endpoint is always rejected',()=>{
  assert.throws(()=>makeLocalOllamaIntentModel113({modelId:'test-model',endpoint:'https://remote-llm.example/api/chat'}),/local/);
});
test('local Ollama adapter sends enforced JSON schema and temperature zero',async()=>{
  let request:Record<string,unknown>|null=null;
  const fake=async (_input:RequestInfo|URL,init?:RequestInit)=>{
    request=JSON.parse(init?.body as string) as Record<string,unknown>;
    return {ok:true,text:async()=>JSON.stringify({message:{content:JSON.stringify(mk(q))}})} as Response;
  };
  const m=makeLocalOllamaIntentModel113({modelId:'local-model',fetchImpl:fake as typeof fetch});
  const a=await proposeLocalIntent113(q,m);
  assert.equal(a.status,'proposal_pending_independent_confirmation');
  assert.equal((request! as {stream:boolean}).stream,false);
  assert.equal((request! as {options:{temperature:number}}).options.temperature,0);
  assert.equal((request! as {format:{type:string}}).format.type,'object');
});
test('Ollama HTTP failure abstains without cloud fallback',async()=>{
  const m=makeLocalOllamaIntentModel113({modelId:'local-model',fetchImpl:(async()=>({
    ok:false,status:503,text:async()=>''} as Response)) as typeof fetch});
  const a=await proposeLocalIntent113(q,m);assert.equal(a.status,'abstain');
});
