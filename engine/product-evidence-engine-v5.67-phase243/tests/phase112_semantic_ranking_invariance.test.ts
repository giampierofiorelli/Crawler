import test from 'node:test';
import assert from 'node:assert/strict';
import {boundedNoiseRequest112,canonicalIntent112,compareEquivalentRequests112,
  rankSameIntent112,type VerifiedIntent112,type EvidenceSnapshot112,type Measurement112}
  from '../src/phase112_semantic_ranking_invariance.js';

const source=[
  {id:'tineco_s11',name:'Tineco PURE ONE S11',bare:67.8,carpet:64.1,url:'https://www.rtings.com/vacuum/reviews/tineco/pure-one-s11'},
  {id:'dyson_v11',name:'Dyson V11',bare:70.2,carpet:71.4,url:'https://www.rtings.com/vacuum/reviews/dyson/v11'},
  {id:'dyson_v15',name:'Dyson V15 Detect',bare:70.5,carpet:71.0,url:'https://www.rtings.com/vacuum/reviews/dyson/v15-detect'},
  {id:'shark_stratos_iz682h',name:'Shark Stratos tested IZ682H',bare:74.2,carpet:75.7,url:'https://www.rtings.com/vacuum/reviews/shark/stratos-cordless'}
];
const makeSnapshot=():EvidenceSnapshot112=>({snapshotId:'rtings_noise_reference_pilot',categoryId:'vacuum_cleaner',
  methodId:'rtings_vacuum_method_v1_4',evidenceRevision:'manual_web_validation_20261011',
  variantIds:source.map(x=>x.id),measurements:source.flatMap(p=>[
    {variantId:p.id,productName:p.name,criterionId:'noise_dba',contextId:'bare_floor',value:p.bare,
      unit:'dBA',methodId:'rtings_vacuum_method_v1_4',sourceUrl:p.url,
      originalTestId:'rtings_'+p.id,provenanceStatus:'independent_measured'},
    {variantId:p.id,productName:p.name,criterionId:'noise_dba',contextId:'low_pile_carpet',value:p.carpet,
      unit:'dBA',methodId:'rtings_vacuum_method_v1_4',sourceUrl:p.url,
      originalTestId:'rtings_'+p.id,provenanceStatus:'independent_measured'}
  ] as Measurement112[])});
const makeIntent=(contextId:VerifiedIntent112['contextId']='bare_floor'):VerifiedIntent112=>({
  categoryId:'vacuum_cleaner',criterionId:'noise_dba',contextId,direction:'lower_is_better',
  hardRequirements:[],profileReference:'no_additional_user_constraints_confirmed',
  verification:'explicitly_verified_semantic_frame'});
const parsed=(text:string)=>{
  const p=boundedNoiseRequest112(text,'no_additional_user_constraints_confirmed');
  assert.equal(p.status,'verified_bounded_grammar',text);
  if(p.status!=='verified_bounded_grammar')throw Error('unexpected_parser_abstention');
  return p.intent;
};
const seq=(r:ReturnType<typeof rankSameIntent112>)=>r.ordered.map(x=>x.variantId);

test('Italian and English paraphrases give the identical canonical intent fingerprint',()=>{
  const requests=[
    'Cercami gli aspirapolveri che fanno meno rumore sui pavimenti duri',
    'Dammi gli aspirapolveri più silenziosi sui pavimenti duri',
    'Which vacuums are quietest on bare floors',
    'Which vacuum cleaners make the least noise on hard floors'
  ];
  const signatures=requests.map(q=>canonicalIntent112(parsed(q)));
  assert.equal(new Set(signatures).size,1);
});
test('real source values from four original professional reviews sort consistently for bare floor',()=>{
  assert.deepEqual(seq(rankSameIntent112(makeIntent(),makeSnapshot())),
    ['tineco_s11','dyson_v11','dyson_v15','shark_stratos_iz682h']);
});
test('paraphrases of the same intent give identical rank, ties and provenance',()=>{
  const snap=makeSnapshot();
  const a=compareEquivalentRequests112({intent:parsed('Cercami gli aspirapolveri che fanno meno rumore sui pavimenti duri'),snapshot:snap},
    {intent:parsed('Which vacuum cleaners make the least noise on hard floors'),snapshot:snap});
  assert.equal(a.equivalent,true);assert.equal(a.sameRankAndEvidence,true);
  assert.deepEqual(a.discrepancies,[]);
});
test('same reviewed data, reordered candidate rows and evidence rows cannot change results or fingerprint',()=>{
  const a=makeSnapshot(),b=makeSnapshot();
  b.variantIds=[...b.variantIds].reverse(); b.measurements=[...b.measurements].reverse();
  const x=compareEquivalentRequests112({intent:makeIntent(),snapshot:a},
    {intent:makeIntent(),snapshot:b});
  assert.equal(x.sameRankAndEvidence,true);
});
test('carpet is a material context difference and inverts V11/V15 relative order',()=>{
  const bare=rankSameIntent112(makeIntent('bare_floor'),makeSnapshot());
  const carpet=rankSameIntent112(makeIntent('low_pile_carpet'),makeSnapshot());
  assert.deepEqual(seq(carpet),['tineco_s11','dyson_v15','dyson_v11','shark_stratos_iz682h']);
  assert.notDeepEqual(seq(carpet),seq(bare));
  const compared=compareEquivalentRequests112({intent:makeIntent('bare_floor'),snapshot:makeSnapshot()},
    {intent:makeIntent('low_pile_carpet'),snapshot:makeSnapshot()});
  assert.equal(compared.equivalent,false);
  assert.ok(compared.discrepancies.includes('material_intent_or_profile_difference'));
});
test('carpet paraphrases still remain invariant',()=>{
  const a=parsed('Dammi gli aspirapolveri meno rumorosi sulla moquette');
  const b=parsed('Which vacuums make the least noise on low pile carpet');
  assert.equal(a.contextId,'low_pile_carpet');assert.equal(canonicalIntent112(a),canonicalIntent112(b));
});
test('query lacking test surface abstains rather than silently choosing bare floor',()=>{
  assert.deepEqual(boundedNoiseRequest112('Dammi gli aspirapolveri più silenziosi',
    'no_additional_user_constraints_confirmed'),
    {status:'needs_semantic_review',reason:'test_surface_ambiguous'});
});
test('query with conflicting surfaces abstains',()=>{
  assert.equal(boundedNoiseRequest112('Dammi gli aspirapolveri meno rumorosi su pavimenti e moquette',
    'no_additional_user_constraints_confirmed').status,'needs_semantic_review');
});
test('unknown additional constraint cannot silently disappear from the request',()=>{
  const x=boundedNoiseRequest112('Quali aspirapolveri cordless sono più silenziosi sui pavimenti duri',
    'no_additional_user_constraints_confirmed');
  assert.deepEqual(x,{status:'needs_semantic_review',reason:'unrecognized_constraint_or_language'});
});
test('potentially absolute silence is not parsed as an ordinary relative preference',()=>{
  assert.equal(boundedNoiseRequest112('Which vacuum cleaners are completely quiet on bare floors',
    'no_additional_user_constraints_confirmed').status,'needs_semantic_review');
});
test('no arbitrary category is inferred from a generic quiet request',()=>{
  assert.equal(boundedNoiseRequest112('Which machines are quietest on bare floors',
    'no_additional_user_constraints_confirmed').status,'needs_semantic_review');
});
test('unverified frame cannot be used, even if everything else is valid',()=>{
  assert.throws(()=>rankSameIntent112({...makeIntent(),verification:'model_guessed' as VerifiedIntent112['verification']},makeSnapshot()),
    /unverified_or_unsupported_semantic_frame/);
});
test('personal profiles are part of meaning even when measurements are identical',()=>{
  const a=makeIntent(),b={...makeIntent(),profileReference:'another_explicit_preference_configuration'};
  const x=compareEquivalentRequests112({intent:a,snapshot:makeSnapshot()},{intent:b,snapshot:makeSnapshot()});
  assert.equal(x.equivalent,false);
});
test('hard requirements may never be silently treated as already passed',()=>{
  assert.throws(()=>rankSameIntent112({...makeIntent(),hardRequirements:['must_be_cordless']},makeSnapshot()),
    /hard_requirement_needs_independent_eligibility_gate/);
});
test('missing measurements stay visible as unranked, not auto-excluded',()=>{
  const s=makeSnapshot();s.variantIds=[...s.variantIds,'unmeasured_vacuum'];
  const r=rankSameIntent112(makeIntent(),s);
  assert.equal(r.notRanked[0].variantId,'unmeasured_vacuum');
  assert.equal(r.notRanked[0].status,'missing_evidence');
  assert.equal(r.rankingEligible,false);
});
test('multiple original tests without approved synthesis are not averaged',()=>{
  const s=makeSnapshot();s.measurements=[...s.measurements,{...s.measurements[0],
    originalTestId:'another_independent_lab',value:68.5,sourceUrl:'https://example.org/another-lab'}];
  const r=rankSameIntent112(makeIntent(),s);
  assert.equal(r.notRanked.find(x=>x.variantId==='tineco_s11')?.status,'conflicting_measurements');
});
test('published comparison re-reporting same original test does not increase weight',()=>{
  const s=makeSnapshot();s.measurements=[...s.measurements,{...s.measurements[0],
    sourceUrl:'https://www.rtings.com/vacuum/tools/compare/tineco-pure-one-s11-dyson-v15-detect/11904/23766'}];
  const r=rankSameIntent112(makeIntent(),s);
  assert.equal(r.ordered.find(x=>x.variantId==='tineco_s11')?.value,67.8);
  assert.equal(r.ordered.find(x=>x.variantId==='tineco_s11')?.originalTestIds.length,1);
});
test('conflicting values as same original test are rejected rather than double counted',()=>{
  const s=makeSnapshot();s.measurements=[...s.measurements,{...s.measurements[0],value:89}];
  assert.throws(()=>rankSameIntent112(makeIntent(),s),/same_original_test_conflicting_records/);
});
test('tie groups do not invent superiority through stable alphabetical order',()=>{
  const s=makeSnapshot();s.measurements=s.measurements.map(m=>m.variantId==='dyson_v11'&&m.contextId==='bare_floor'?{
    ...m,value:70.5}:m);
  const r=rankSameIntent112(makeIntent(),s);
  const a=r.ordered.find(x=>x.variantId==='dyson_v11')!,b=r.ordered.find(x=>x.variantId==='dyson_v15')!;
  assert.equal(a.rank,b.rank);
});
test('changed evidence snapshot is not treated as query instability',()=>{
  const s=makeSnapshot(),changed=makeSnapshot();changed.evidenceRevision='second_review_20261012';
  const x=compareEquivalentRequests112({intent:makeIntent(),snapshot:s},
    {intent:makeIntent(),snapshot:changed});
  assert.equal(x.equivalent,true);assert.equal(x.sameRankAndEvidence,false);
  assert.ok(x.discrepancies.includes('different_evidence_or_candidate_snapshot'));
});
test('numeric dBA values do not masquerade as overall product quality or public recommendation',()=>{
  const r=rankSameIntent112(makeIntent(),makeSnapshot());
  assert.equal(r.publicationReady,false);assert.equal(r.rankingEligible,false);
  assert.equal(r.llmCalls,0);assert.equal(r.sourceTextRequired,false);
  assert.ok(!JSON.stringify(r).includes('bare floors'));
});

test('cross-methodology readings fail closed; v1.3 cannot be treated as v1.4 automatically',()=>{
  const s=makeSnapshot();s.measurements=[...s.measurements,{...s.measurements[0],methodId:'rtings_vacuum_method_v1_3'}];
  assert.throws(()=>rankSameIntent112(makeIntent(),s),/invalid_or_uncomparable_measurement/);
});
