import test from 'node:test';
import assert from 'node:assert/strict';
import {separateTechnicalAndIndependentEvidence,type ReviewedCriterion,type AdmissibleFact,type TechnicalSpecification,type IndependentMeasurement,type IndependentEditorialAssessment} from '../src/technical_vs_independent.js';
const hash='a'.repeat(64);
const provenance=(variant:string)=>({sourceUrl:'https://example.org/technical-document',documentId:'techsheetone',documentSha256:hash,
  publisherName:'Illustrative source',capturedAt:'2026-10-01T00:00:00Z',rightsMode:'research_only' as const,
  approval:{reviewerId:'reviewerone',documentSha256:hash,exactVariantId:variant,reviewedAt:'2026-10-02T00:00:00Z',status:'approved' as const,evidenceReference:'review-001'}});
const rule:ReviewedCriterion={criterionId:'battery',specFieldKey:'battery_runtime_nominal',testFieldKey:'battery_runtime_measured',specNature:'nominal_technical_performance',unit:'hours',context:{anc:'on',codec:'aac'},reviewedBy:'editorone',reviewReference:'mapping-001'};
const ruleWeight:ReviewedCriterion={criterionId:'weight',specFieldKey:'mass',testFieldKey:'mass_measured',specNature:'physical_or_functional_attribute',unit:'grams',context:{configuration:'standard'},reviewedBy:'editorone',reviewReference:'mapping-002'};
const spec=(id:string,exactVariantId:string,value:number,override:Partial<TechnicalSpecification>={}):TechnicalSpecification=>({id,exactVariantId,criterionId:'battery',value,unit:'hours',context:{anc:'on',codec:'aac'},origin:'TECHNICAL_SPECIFICATION',sourceType:'manufacturer_technical_document',documentSection:'technical_specifications',specFieldKey:'battery_runtime_nominal',nature:'nominal_technical_performance',provenance:provenance(exactVariantId),...override});
const measured=(id:string,exactVariantId:string,value:number,override:Partial<IndependentMeasurement>={}):IndependentMeasurement=>({id,exactVariantId,criterionId:'battery',value,unit:'hours',context:{anc:'on',codec:'aac'},origin:'INDEPENDENT_EVIDENCE',kind:'laboratory_measurement',sourceType:'independent_laboratory',testFieldKey:'battery_runtime_measured',protocolId:'battery_test',protocolVersion:'v_one',provenance:provenance(exactVariantId),...override});
const run=(evidence:AdmissibleFact[],rules=[rule])=>separateTechnicalAndIndependentEvidence({exactVariantIds:['headphone_a','headphone_b'],rules,evidence});
test('nominal technical specification remains visibly different from independent test',()=>{
 const v=run([spec('sa','headphone_a',30),measured('ma','headphone_a',23),spec('sb','headphone_b',35),measured('mb','headphone_b',26)]);
 assert.equal(v.criteria[0].comparison,'direct_independent_measurement_comparison_possible');
 assert.equal(v.criteria[0].byVariant[0].technicalSpecification?.value,30);
 assert.equal(v.criteria[0].byVariant[0].technicalSpecification?.verifiedByThirdParty,false);
 assert.equal(v.criteria[0].byVariant[0].independentMeasurement?.value,23);
 assert.equal(v.criteria[0].evidenceContributionPerCriterionMax,1);
 assert.equal(v.winnerId,null);assert.equal(v.rankingEligible,false);
});
test('without independent tests, nominal performance never becomes a tested comparison',()=>{
 const v=run([spec('sa','headphone_a',30),spec('sb','headphone_b',40)]);
 assert.equal(v.criteria[0].comparison,'technical_specification_comparison_only');
 assert.equal(v.criteria[0].byVariant[0].status,'specification_only');
 assert.match(v.criteria[0].explanation,/never an independent performance ranking/);
});
test('missing evidence is not negative evidence',()=>{
 const v=run([measured('ma','headphone_a',20)]);
 assert.equal(v.criteria[0].byVariant[1].status,'missing');
 assert.equal(v.criteria[0].comparison,'no_supported_comparison');
 assert.equal(v.criteria[0].missingIsNotNegative,true);
});
test('mixed tested and specified values are not compared directly',()=>{
 const v=run([measured('ma','headphone_a',20),spec('sb','headphone_b',40)]);
 assert.equal(v.criteria[0].comparison,'no_supported_comparison');
});
test('incompatible lab methods cannot be compared even when numeric fields match',()=>{
 const v=run([measured('ma','headphone_a',20),measured('mb','headphone_b',19,{protocolVersion:'v_two'})]);
 assert.equal(v.criteria[0].comparison,'no_supported_comparison');
});
test('duplicate observations are not silently averaged or counted twice',()=>{
 const v=run([measured('ma','headphone_a',20),measured('mz','headphone_a',21),measured('mb','headphone_b',19)]);
 assert.equal(v.criteria[0].byVariant[0].status,'needs_editorial_review');
 assert.equal(v.criteria[0].comparison,'no_supported_comparison');
});
test('document from a promotional page is not a technical specification',()=>{
 assert.throws(()=>run([spec('sa','headphone_a',30,{documentSection:'marketing' as never})]),/Marketing/);
 assert.throws(()=>run([spec('sa','headphone_a',30,{provenance:{...provenance('headphone_a'),sourceUrl:'https://example.org/marketing/battery'}})]),/source approval/);
});
test('reject broad manufacturer claims at the API boundary',()=>{
 const bogus={...spec('sa','headphone_a',30),origin:'MANUFACTURER_CLAIM'};
 assert.throws(()=>run([bogus as unknown as AdmissibleFact]),/promotional/);
 const bogus2={...spec('sa','headphone_a',30),specFieldKey:'amazing_sound'};
 assert.throws(()=>run([bogus2]),/Marketing/);
});
test('reject self asserted or mismatched approval fingerprint',()=>{
 const p=provenance('headphone_a');p.approval.documentSha256='b'.repeat(64);
 assert.throws(()=>run([spec('sa','headphone_a',30,{provenance:p})]),/source approval/);
});
test('reject approval assigned to a different product variant',()=>{
 assert.throws(()=>run([spec('sa','headphone_a',30,{provenance:provenance('headphone_b')})]),/source approval/);
});
test('marketing source text cannot be laundered as numeric value',()=>{
 assert.throws(()=>run([spec('sa','headphone_a',30,{value:'revolutionary' as never})]),/Marketing/);
});
test('independent editorial assessment is not masqueraded as a measurement',()=>{
 const base=measured('reviewone','headphone_a',20);
 const e:IndependentEditorialAssessment={id:base.id,exactVariantId:base.exactVariantId,criterionId:base.criterionId,context:base.context,
 origin:'INDEPENDENT_EVIDENCE',kind:'independent_editorial_assessment',sourceType:'independent_professional_reviewer',testFieldKey:'battery_runtime_measured',finding:'mixed',methodologyReference:'https://example.org/testmethod',provenance:base.provenance};
 const v=run([e]);
 assert.equal(v.criteria[0].byVariant[0].independentEditorial?.finding,'mixed');
 assert.equal(v.criteria[0].byVariant[0].independentMeasurement,null);
 assert.equal(v.criteria[0].comparison,'no_supported_comparison');
});
test('technical physical attributes may be compared but are still only declared specs',()=>{
 const a=spec('sa','headphone_a',200,{criterionId:'weight',unit:'grams',context:{configuration:'standard'},specFieldKey:'mass',nature:'physical_or_functional_attribute'});
 const b=spec('sb','headphone_b',250,{criterionId:'weight',unit:'grams',context:{configuration:'standard'},specFieldKey:'mass',nature:'physical_or_functional_attribute'});
 const v=run([a,b],[ruleWeight]);
 assert.equal(v.criteria[0].comparison,'technical_specification_comparison_only');
 assert.equal(v.criteria[0].byVariant[1].technicalSpecification?.value,250);
});
test('Amazon, affiliate, marketing, prices and unapproved fields cannot enter review mapping',()=>{
 assert.throws(()=>run([], [{...rule,criterionId:'amazon_price'}]),/reviewed/);
 assert.throws(()=>run([], [{...rule,specFieldKey:'marketing_claim'}]),/reviewed/);
 assert.throws(()=>run([measured('amz','headphone_a',22,{provenance:{...provenance('headphone_a'),sourceUrl:'https://amazon.co.uk/x'}})]),/source approval/);
});
test('rights and source assertions never make a consumer recommendation publication ready',()=>{
 const p=provenance('headphone_a');
 const v=run([spec('sa','headphone_a',24,{provenance:{...p,rightsMode:'documented_commercial_rights',rightsReference:'contract-001'}})]);
 assert.equal(v.publicationReady,false);assert.equal(v.combinedScore,null);assert.equal(v.rankingEligible,false);
});
