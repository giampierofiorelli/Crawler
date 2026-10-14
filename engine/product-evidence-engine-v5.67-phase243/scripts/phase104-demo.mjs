/** All values are synthetic, from the same approved-memory API used by tests. */
import {writeFileSync} from 'node:fs';
import {InterpretationMemory101} from '../dist/src/phase101_interpretation_memory.js';
import {EntityCognition104} from '../dist/src/phase104_entity_cognition.js';
const frame={categoryId:'vacuum',criterionId:'noise',frameId:'hard_floor_normal_mode'};
const time=(s)=>`2026-10-11T06:00:0${s}.000Z`;
const pointer=(test)=>({sourceUrl:'https://example.org/original-tests/'+test,originalTestId:test,
 sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),sourceLocator:'#controlled-test',
 methodologyReference:'original controlled lab testing described',
 assessmentReference:'fictional assessor example for demonstration only',assessorId:'demo_assessor',
 assessedAt:time(0),originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
const level=(id,test,levelId)=>({...frame,id,variantId:'vacuum_alpha',kind:'calibrated_level',levelId,
 scaleReference:'fictional external reviewed acoustic anchors',source:pointer(test)});
const memory=new InterpretationMemory101();
const cognition=new EntityCognition104();
memory.registerProduct({categoryId:'vacuum',variantId:'vacuum_alpha',displayName:'Demonstration vacuum A'});
const observations=[];
const step=(name,s)=>{const result=cognition.synchronize(memory.snapshotReviewedFrame(frame),'vacuum_alpha',time(s));observations.push({step:name,
 epistemicState:result.state.state,dependentClaims:result.state.activeClaimIds,
 distinctOriginalTests:result.state.originalTestIds,
 requestedReviewTasks:result.state.reviewTasks,transition:result.transition?.eventType??'unchanged',
 llmCalls:result.llmCalls,sourceTextRequired:result.sourceTextRequired});};
step('initial',0);
memory.recordApprovedClaim(level('claim_1','test_one','low'));
step('one original test',1);
memory.recordApprovedClaim(level('claim_2','test_two','low'));
step('two independent identical anchored levels',2);
memory.recordApprovedClaim(level('claim_3','test_three','high'));
step('new original test disagrees',3);
memory.withdrawClaim('claim_3','test was withdrawn after source review',time(4));
step('disputed source removed after review',5);
const result={researchOnly:true,fictional:true,sourceTextStored:false,fullyAutonomousAgent:false,
 scenario:'A product updates its derived evidence state without rereading sources',observations,
 productMind:cognition.productMind('vacuum','vacuum_alpha'),
 history:cognition.history('vacuum','vacuum_alpha'),
 journalIntegrity:cognition.verifyJournal(),consumerRecommendations:false};
writeFileSync('audit/phase104/constructed-entity-evolution.json',JSON.stringify(result,null,2)+'\n');
memory.close();cognition.close();
