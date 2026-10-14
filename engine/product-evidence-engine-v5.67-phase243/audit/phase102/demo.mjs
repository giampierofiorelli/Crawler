import {writeFileSync} from 'node:fs';
import {InterpretationMemory101} from '../../dist/src/phase101_interpretation_memory.js';
import {reasonOverEvidenceFrame102} from '../../dist/src/phase102_evidence_knowledge.js';
const db=new InterpretationMemory101();
const base={categoryId:'vacuum',criterionId:'noise',frameId:'hard_floor_normal_mode'};
for(const id of ['a','b','c','d','e'])db.registerProduct({categoryId:'vacuum',variantId:id,displayName:'Illustrative Vacuum '+id.toUpperCase()});
const source=(testId)=>({sourceUrl:'https://example.org/not-a-real-professional-test', originalTestId:testId,
 sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),sourceLocator:'#illustrative',
 methodologyReference:'fictional laboratory scenario documented for software tests',
 assessmentReference:'fictional human assessment scenario for software tests',
 assessorId:'fictional_assessor',assessedAt:'2026-10-11T00:00:00Z',
 originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
function p(id,variantId,comparedVariantId,testId){db.recordApprovedClaim({...base,id,variantId,
 kind:'pairwise',comparedVariantId,relation:'better',comparisonBasis:'same_original_test',source:source(testId)});}
p('claim_one','a','b','original_test_one');
p('claim_copy','a','b','original_test_one');
p('claim_two','c','d','original_test_two');
p('claim_three','b','a','original_test_three');
db.recordApprovedClaim({...base,id:'claim_word',variantId:'e',kind:'descriptor',
 descriptor:'relatively_quiet',qualifier:'reviewer_relative',source:source('original_test_four')});
const r=reasonOverEvidenceFrame102(db.snapshotReviewedFrame(base));
writeFileSync('audit/phase102/constructed-knowledge-query.json',JSON.stringify({
 scenario:'FICTIONAL; constructed software fixture; no publisher or actual consumer product evidence',
 result:r},null,2));
db.close();
