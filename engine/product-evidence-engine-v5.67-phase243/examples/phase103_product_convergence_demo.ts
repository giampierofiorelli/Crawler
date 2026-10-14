/** Entirely constructed demonstration data. No real lab finding or publisher claim. */
import {InterpretationMemory101,type SourcePointer,type CalibratedLevelClaim} from '../src/phase101_interpretation_memory.js';
import {buildProductEvidenceProfile103} from '../src/phase103_evidence_consensus.js';
const categoryId='vacuum',variantId='vacuum_demo';
const src=(originalTestId:string):SourcePointer=>({sourceUrl:'https://original.example.org/imaginary-test',originalTestId,
 sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),sourceLocator:'#synthetic',
 methodologyReference:'illustrative independently reviewed original test',
 assessmentReference:'illustrative qualified test method reviewed',assessorId:'illustrative_reviewer',
 assessedAt:'2026-10-11T00:00:00Z',originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
const db=new InterpretationMemory101();db.registerProduct({categoryId,variantId,displayName:'Imaginary Vacuum'});
let n=0;
function add(criterionId:string,frameId:string,levelId:string,test:string){
 const c:CalibratedLevelClaim={id:'illustrative_claim_'+(++n),categoryId,variantId,criterionId,frameId,
 kind:'calibrated_level',levelId,scaleReference:'synthetic independently qualified scale',source:src(test)};
 db.recordApprovedClaim(c);
}
for(const t of ['test_1','test_2','test_3'])add('cleaning','carpet_normal','strong',t);
add('noise','hard_floor_normal','moderate', 'test_1');
add('noise','hard_floor_normal','high', 'test_2');
add('comfort','long_session','comfortable','test_3');
const requestedFrames=[['cleaning','carpet_normal'],['noise','hard_floor_normal'],['comfort','long_session'],['durability','long_term']].map(
 ([criterionId,frameId])=>db.snapshotReviewedFrame({categoryId,criterionId,frameId}));
const result=buildProductEvidenceProfile103({categoryId,variantId,requestedFrames});
console.log(JSON.stringify({notice:'Synthetic data — illustrative product, scales, reviewers and tests; NOT observed product performance',result},null,2));
db.close();
