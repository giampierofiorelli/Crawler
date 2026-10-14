import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {auditSourceInventory137,makeBlindPacket137,blindCorpusDigest137,evaluateBlindAnnotatedCorpus137}
 from '../dist/src/phase137_original_source_annotation.js';
const sha=t=>createHash('sha256').update(t).digest('hex');
const candidates=JSON.parse(readFileSync('research/phase137_source_candidates/PHASE137-ORIGINAL-SOURCE-CANDIDATES.json','utf8'));
const inventory=auditSourceInventory137(candidates);
const t='Aster X2 was tested. Aster X2 improved soil removal on level flooring.';
const i=t.indexOf('Aster X2',1),j=t.indexOf('soil removal'),start=t.indexOf('.')+2;
const doc={text:t,sha256:sha(t),source:{id:'fake_dev_source',originalDocumentId:'fake_dev_doc',
 url:'https://developer-fixture.test/sample',title:'CONSTRUCTED fixture',role:'original_product_test'}};
const c={id:'constructed_demo',split:'frozen_holdout',metadata:{sourceGroupId:'constructed_demo',
 productFamilyId:'constructed_demo',categoryId:'robot_vacuum',origin:'constructed',permission:'not_established',
 phenomena:['other']},document:doc,mentions:[
 {id:'first',kind:'explicit_name',entityType:'product',entityId:'aster',variantId:'x2',span:{start:0,end:8}},
 {id:'second',kind:'explicit_name',entityType:'product',entityId:'aster',variantId:'x2',span:{start:i,end:i+8}},
 {id:'target',kind:'explicit_name',entityType:'outcome',entityId:'soil',span:{start:j,end:j+12}}],
 proposal:{subject:'Aster X2',object:'soil removal',label:'contributes_to',subjectSpan:{start:i,end:i+8},
  objectSpan:{start:j,end:j+12},evidenceSpan:{start,end:t.length},sourceId:doc.source.id,
  originalDocumentId:doc.source.originalDocumentId,sourceContentSha256:doc.sha256,
  evidenceSha256:sha(t.slice(start)),margin:2,rankingAuthorized:false,status:'hypothesis_requires_scientific_review'},
 subjectMentionId:'second',objectMentionId:'target'};
const packet=makeBlindPacket137(c);
const votes=['illustrative_reviewer_1','illustrative_reviewer_2'].map(annotatorId=>({
 packetId:packet.id,packetDigest:packet.blindPacketDigest,annotatorId,
 textSupport:'supported_by_passage',reference:'same_entity'}));
const simulated=evaluateBlindAnnotatedCorpus137({cases:[c],votes:{[c.id]:votes},
 expectedBlindCorpusDigest:blindCorpusDigest137([c])});
const result={phase:137,version:'4.61-phase137',inventory,
 constructedDemonstration:{dataOrigin:'constructed',humanIndependentReviewActuallyPerformed:false,
  votes:'ILLUSTRATIVE IDENTIFIERS IN SCRIPT, NOT REAL ANNOTATORS',
  consensusCases:simulated.consensusCases,
  scorableOriginalHoldout:simulated.fullyScorableOriginalHoldoutCases,
  holdoutPrecision:simulated.phase136.holdout.textualSupportPrecisionAmongScreened,
  scientificAccuracyClaimAuthorized:simulated.scientificAccuracyClaimAuthorized},
 originals:{discoveredSourceURLs:inventory.sourceCount,rightsAuthenticated:0,originalSnapshots:0,
  realIndependentlyAnnotatedDocuments:0,sourceHoldoutEvaluated:0},
 blockingWarnings:['NO_SOURCE_RIGHTS_VERIFIED','NO_AUTHENTICATED_ORIGINAL_TEXT_SNAPSHOTS',
  'NO_BLIND_INDEPENDENT_ANNOTATORS','NO_EXTERNALLY_PREREGISTERED_HOLDOUT']};
writeFileSync('PHASE137-INTAKE-AND-BLIND-ANNOTATION-TRACE.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({candidateSourceURLs:inventory.sourceCount,
 constructedConsensusCases:simulated.consensusCases,actualScorableOriginalHoldout:0},null,2));
