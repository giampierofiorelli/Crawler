import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcileDeclaredWithTested,type CriterionEvidenceRule,type EvidenceFact} from '../src/spec_test_evidence.js';
import {interpretDecisionNeeds,headphonesNeedsPrototype} from '../src/needs_discovery.js';
const needs=interpretDecisionNeeds(headphonesNeedsPrototype,
 {choices:{usage:'commute'},priorities:{battery:'essential',anc:'essential'},confirmInterpretation:true},new Set());
const ctx={codec:'aac',anc:'on',volume:'85db'};
const rules:CriterionEvidenceRule[]=[{criterionId:'battery',nature:'testable_performance',unit:'hours',
 comparisonContext:ctx,criticalIfEssential:true,rationale:'Standardized battery runtime measured under ANC and fixed sound pressure'},
 {criterionId:'anc',nature:'testable_performance',unit:'db',comparisonContext:{noise:'subway',anc:'on'},
 criticalIfEssential:true,rationale:'Real-world standardized noise reduction'}];
const f=(id:string,variantId:string,criterionId:string,kind:EvidenceFact['kind'],value:number|string,
 extras:Partial<EvidenceFact>={}):EvidenceFact=>({id,variantId,criterionId,kind,value,unit:criterionId==='battery'?'hours':'db',
 context:criterionId==='battery'?ctx:{noise:'subway',anc:'on'},sourceUrl:`https://lab.example.org/data/${id}`,
 date:'2026-09-01',rightsStatus:'research_only_unverified',...(kind==='independent_test'?{protocol:'controlled_loop'}:{}),...extras});
const run=(evidence:EvidenceFact[],rulesOverride=rules)=>reconcileDeclaredWithTested({needs,exactVariantIds:['hpa','hpb'],rules:rulesOverride,evidence});
const b=(r:ReturnType<typeof run>)=>r.criteria.find(x=>x.criterionId==='battery')!;
test('legacy manufacturer marketing performance claims fail closed after Phase 60',()=>{
 assert.throws(()=>run([f('a','hpa','battery','manufacturer_performance_claim',30)]),/prohibited/);
});
test('tests override manufacturer numbers as measured values but retain discrepancies and original source',()=>{
 const r=run([f('a','hpa','battery','manufacturer_attribute',30),f('b','hpb','battery','manufacturer_attribute',40),
 f('c','hpa','battery','independent_test',18),f('d','hpb','battery','independent_test',19)]);
 assert.equal(b(r).comparison,'tested_comparison_possible');assert.equal(b(r).byVariant[0].selectedValue,18);
 assert.equal(b(r).byVariant[0].declaredVsMeasured,'different_values_under_same_conditions');
 assert.deepEqual(b(r).byVariant[0].evidenceIds,['c','a']);assert.equal(r.rankingEligible,false);
});
test('missing test for one variant does not turn manufacturer data into measured comparison',()=>{
 const r=run([f('a','hpa','battery','independent_test',21),f('b','hpb','battery','manufacturer_attribute',35)]);
 assert.equal(b(r).comparison,'no_justified_comparison');assert.equal(b(r).byVariant[1].standing,'manufacturer_performance_unverified');
 assert.equal(b(r).requiresMoreEvidenceForConfidentChoice,true);
});
test('missing data is not treated as bad performance',()=>{
 const r=run([f('a','hpa','battery','independent_test',21)]);
 assert.equal(b(r).byVariant[1].standing,'missing');assert.equal(b(r).missingEvidenceIsNotBadPerformance,true);
});
test('different contexts prevent product claim from being called disproven',()=>{
 const r=run([f('a','hpa','battery','manufacturer_attribute',30),
 f('b','hpa','battery','independent_test',16,{context:{codec:'aac',anc:'off',volume:'85db'}})]);
 assert.equal(b(r).byVariant[0].standing,'incompatible_test_conditions');
 assert.equal(b(r).byVariant[0].declaredVsMeasured,undefined);
});
test('manufacturer physical attribute allowed only as provisional screening',()=>{
 const needCtx=interpretDecisionNeeds(headphonesNeedsPrototype,{choices:{usage:'commute'},priorities:{battery:'essential'},confirmInterpretation:true},new Set());
 const rule=[{criterionId:'battery',nature:'objective_attribute',unit:'grams',comparisonContext:{configuration:'standard'},
 criticalIfEssential:true,rationale:'Physical mass stated by manufacturer'}] satisfies CriterionEvidenceRule[];
 const r=reconcileDeclaredWithTested({needs:needCtx,exactVariantIds:['hpa','hpb'],rules:rule,evidence:[
 f('a','hpa','battery','manufacturer_attribute',200,{unit:'grams',context:{configuration:'standard'}}),
 f('b','hpb','battery','manufacturer_attribute',250,{unit:'grams',context:{configuration:'standard'}})]});
 assert.equal(r.criteria.find(x=>x.criterionId==='battery')!.comparison,'manufacturer_attribute_screening_only');
 assert.equal(r.criteria.find(x=>x.criterionId==='battery')!.requiresMoreEvidenceForConfidentChoice,true);
});
test('regulatory declared value is not treated as independent sample test',()=>{
 const r=run([f('a','hpa','battery','regulatory_declared_value',25)]);
 assert.equal(b(r).byVariant[0].standing,'regulatory_declared_not_independently_tested');
});
test('incompatible independent test contexts not silently compared',()=>{
 const r=run([f('a','hpa','battery','independent_test',20,{context:{codec:'aac',anc:'off',volume:'85db'}}),
 f('b','hpb','battery','independent_test',21)]);
 assert.equal(b(r).comparison,'no_justified_comparison');
});
test('repeated measurements or contradictory declarations are quarantined as ambiguous',()=>{
 const r=run([f('a','hpa','battery','independent_test',20),f('b','hpa','battery','independent_test',21),
 f('c','hpb','battery','independent_test',21)]);
 assert.equal(b(r).byVariant[0].standing,'ambiguous');assert.equal(b(r).comparison,'no_justified_comparison');
});
test('reject commercial fields and unsafe source provenance',()=>{
 assert.throws(()=>run([f('amazon_price','hpa','battery','independent_test',20)]),/evidence/);
 assert.throws(()=>run([f('a','hpa','battery','independent_test',20,{sourceUrl:'http://lab.example.org'})]),/Unsafe/);
});
test('reject falsely licensed facts without license documentation',()=>{
 assert.throws(()=>run([f('a','hpa','battery','independent_test',20,{rightsStatus:'documented_commercial_derivation'})]),/evidence/);
});
test('cannot score any consumer product or assert permission regardless of results',()=>{
 const r=run([f('a','hpa','battery','independent_test',20),f('b','hpb','battery','independent_test',21)]);
 assert.equal(r.purpose,'declared_vs_tested_research_only');assert.equal(r.rankingEligible,false);
 assert.equal(r.publicationReady,false);assert.equal(r.combinedEvidenceScore,null);
});

test('two independent measurements under different laboratory protocols are not directly comparable',()=>{
 const r=run([f('a','hpa','battery','independent_test',20,{protocol:'lab_method_one'}),
                 f('b','hpb','battery','independent_test',21,{protocol:'lab_method_two'})]);
 assert.equal(b(r).comparison,'no_justified_comparison');
 assert.equal(b(r).requiresMoreEvidenceForConfidentChoice,true);
});
test('manufacturer statement stays visible when unrelated lab conditions cannot verify it',()=>{
 const r=run([f('a','hpa','battery','manufacturer_attribute',30),
  f('b','hpa','battery','independent_test',16,{context:{codec:'aac',anc:'off',volume:'85db'}})]);
 assert.equal(b(r).byVariant[0].selectedValue,30);
 assert.match(b(r).byVariant[0].caveat,/cannot validate or refute/);
});

test('missing mapping for an essential need is itself a critical evidence gap',()=>{
 const r=run([]);
 assert.equal(r.criteria.some(x=>x.criterionId==='battery' && x.requiresMoreEvidenceForConfidentChoice),true);
 assert.equal(r.criticalGaps.includes('battery'),true);
});
