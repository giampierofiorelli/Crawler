/** Constructed explanatory example, NOT observations about real vacuums. */
import {InterpretationMemory101,type SourcePointer} from '../src/phase101_interpretation_memory.js';
const sha='f'.repeat(64);
const source=(test:string):SourcePointer=>({sourceUrl:'https://example.org/research/'+test,
 originalTestId:test,sourceRevisionSha256:sha,sourceSpanSha256:sha,
 sourceLocator:'#findings',methodologyReference:'controlled synthetic comparative test',
 assessmentReference:'reviewer confirmed the comparison from original test',
 assessorId:'trained_analyst',assessedAt:'2026-10-11T08:00:00Z',
 originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
const db=new InterpretationMemory101(':memory:');
const common={categoryId:'vacuum',criterionId:'noise',frameId:'normal_mode_hard_floor'};
for(const v of ['alpha','beta','gamma','delta','epsilon'])db.registerProduct({categoryId:'vacuum',variantId:v,displayName:'Constructed Vacuum '+v});
db.recordApprovedClaim({id:'noisy_alpha',...common,variantId:'alpha',kind:'descriptor',
 descriptor:'somewhat_noisy',qualifier:'reviewer_relative',source:source('test_one')});
db.recordApprovedClaim({id:'comparison_alpha_beta',...common,variantId:'alpha',comparedVariantId:'beta',
 kind:'pairwise',relation:'better',comparisonBasis:'same_original_test',source:source('test_one')});
db.recordApprovedClaim({id:'comparison_beta_gamma',...common,variantId:'beta',comparedVariantId:'gamma',
 kind:'pairwise',relation:'better',comparisonBasis:'same_original_test',source:source('test_two')});
db.recordApprovedClaim({id:'quiet_epsilon',...common,variantId:'epsilon',kind:'descriptor',
 descriptor:'very_quiet',qualifier:'reviewer_relative',source:source('test_three')});
console.log(JSON.stringify(db.findLessNoisy(common),null,2));
db.close();
