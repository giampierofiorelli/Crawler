import test from 'node:test';
import assert from 'node:assert/strict';
import {createBlindAnnotationTemplate,evaluateSelectiveGate,type EvaluationCase,type BlindAnnotation} from '../src/selective_evaluation.js';
import type {UnresolvedQuestion,ReviewSourceGrant} from '../src/selective_user_evidence.js';
const q:UnresolvedQuestion={id:'comfort_case',productVariantId:'headphone_a',criterionId:'long_comfort',
 question:'Can these headphones be used comfortably with glasses for eight hours?',context:'Home office eight hours wearing glasses',
 gapType:'ergonomic_experience',professionalCoverage:'partial',materialityBasis:'user_explicit',materialityReference:'case-study request 6'};
const grant:ReviewSourceGrant={sourceId:'source_licensed',host:'examples.org',approvedDocumentUrl:'https://examples.org/rights',
 licenceValidUntil:'2028-01-01',approvalRecorded:true,automatedAcquisitionAllowed:true,commercialAnalysisAllowed:true,
 aiExtractionAllowed:true,remoteModelTransferAllowed:false,derivedObservationPublicationAllowed:false};
const c:EvaluationCase={caseId:'sample_one',category:'headphones',question:q,grants:[grant],asOf:'2026-10-10',
 origin:'constructed_scenario',sourceReference:'synthetic scenario test only',split:'held_out'};
const annotate=(caseId:string,assessorId:string,label:BlindAnnotation['label']):BlindAnnotation=>({caseId,assessorId,label,
 rationale:'Written assessment with documented reasoning',sourceReferences:['synthetic scenario'],assessmentDate:'2026-10-10',blindedToAlgorithm:true});
test('no human annotation yields no accuracy or assumed gold truth',()=>{
 const out=evaluateSelectiveGate({cases:[c]}); assert.equal(out.metrics,null);assert.equal(out.evaluatedCaseCount,0);
 assert.equal(out.rows[0].referenceStatus,'not_annotated'); assert.equal(out.humanValidationVerifiedBySoftware,false);
});
test('blind template excludes predictions and internal grants',()=>{
 const [tpl]=createBlindAnnotationTemplate([c]);assert.equal(Object.hasOwn(tpl,'predicted'),false);
 assert.equal(Object.hasOwn(tpl,'grants'),false);assert.equal(tpl.caseId,c.caseId);
});
test('single assessor not gold standard',()=>{
 const out=evaluateSelectiveGate({cases:[c],annotations:[annotate(c.caseId,'expert_one','candidate_research_only')]});
 assert.equal(out.metrics,null);assert.equal(out.rows[0].referenceStatus,'single_annotation');
});
test('two concordant reported labels produce descriptive metrics, not validation',()=>{
 const out=evaluateSelectiveGate({cases:[c],annotations:[annotate(c.caseId,'expert_one','candidate_research_only'),annotate(c.caseId,'expert_two','candidate_research_only')]});
 assert.equal(out.metrics?.accuracy,1);assert.equal(out.metrics?.sampleSize,1);
 assert.equal(out.publicationReady,false); assert.equal(out.humanValidationVerifiedBySoftware,false);
});
test('disagreement leaves metrics null',()=>{
 const out=evaluateSelectiveGate({cases:[c],annotations:[annotate(c.caseId,'expert_one','candidate_research_only'),annotate(c.caseId,'expert_two','rights_blocked')]});
 assert.equal(out.metrics,null);assert.equal(out.rows[0].referenceStatus,'disagreement_requires_adjudication');
});
test('third-person adjudication records disagreement and metric',()=>{
 const ann=[annotate(c.caseId,'expert_one','candidate_research_only'),annotate(c.caseId,'expert_two','rights_blocked')];
 const out=evaluateSelectiveGate({cases:[c],annotations:ann,adjudications:[{caseId:c.caseId,adjudicatorId:'expert_three',label:'rights_blocked',
 rationale:'After review the permission evidence was missing',adjudicatedAt:'2026-10-10',sourceReferences:['synthetic scenario']}]});
 assert.equal(out.metrics?.accuracy,0);assert.equal(out.rows[0].referenceStatus,'adjudicated');
 assert.equal(out.metrics?.perDecision.find(x=>x.decision==='rights_blocked')?.recall,0);
});
test('adjudicator cannot be a previous assessor',()=>{
 const ann=[annotate(c.caseId,'expert_one','candidate_research_only'),annotate(c.caseId,'expert_two','rights_blocked')];
 assert.throws(()=>evaluateSelectiveGate({cases:[c],annotations:ann,adjudications:[{caseId:c.caseId,adjudicatorId:'expert_two',
 label:'rights_blocked',rationale:'Clear and inspectable explanation',adjudicatedAt:'2026-10-10',sourceReferences:['synthetic scenario']}]}),/Invalid/);
});
test('identical case ID or question ID is rejected',()=>assert.throws(()=>evaluateSelectiveGate({cases:[c,{...c}]}),/duplicate/));
test('unknown case in annotation is rejected',()=>assert.throws(()=>evaluateSelectiveGate({cases:[c],annotations:[annotate('other_case','expert_one','rights_blocked')]}),/Invalid/));
test('nonblinded annotation is not accepted',()=>assert.throws(()=>evaluateSelectiveGate({cases:[c],annotations:[{...annotate(c.caseId,'expert_one','rights_blocked'),blindedToAlgorithm:false}]}),/non-blinded/));
test('a contradictory variant changes none of the evaluation input outside the case',()=>{
 const original=evaluateSelectiveGate({cases:[c]});
 const changed=evaluateSelectiveGate({cases:[{...c,question:{...q,professionalCoverage:'sufficient_for_question'}}]});
 assert.equal(original.rows[0].predicted,'candidate_research_only');
 assert.equal(changed.rows[0].predicted,'no_search_sufficient_professional_evidence');
 assert.equal(changed.metrics,null);
});
test('constructed no-rights case is marked rights blocked but not publication-approved',()=>{
 const out=evaluateSelectiveGate({cases:[{...c,grants:[]}]});
 assert.equal(out.rows[0].predicted,'rights_blocked');assert.equal(out.publicationReady,false);
});
