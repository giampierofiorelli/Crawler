import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readCrossCategoryObservations144} from '../dist/src/phase144_cross_category_observation_graph.js';
const hash=x=>createHash('sha256').update(x).digest('hex');
const prior=JSON.parse(readFileSync('research/phase143_cross_category_sources.json','utf8'));
const newDocs=JSON.parse(readFileSync('research/phase144_postcode_challenge.json','utf8'));
const output=(row,track)=>{
 const request={document:{text:row.text,sha256:hash(row.text),source:{
  id:row.id,originalDocumentId:'excerpt_'+row.id,url:row.url,
  title:'Short attributable excerpt, not full article',role:'original_product_test'}},
  pageIdentity:{reviewedProductId:row.reviewedProductId,reviewedVariantId:row.reviewedVariantId,
  reviewedAliases:row.aliases}};
 const r=readCrossCategoryObservations144(request);
 return {id:row.id,track,category:row.category,publisher:row.publisher,url:row.url,
  sourceContentSha256:hash(row.text),prior139PairCount:r.baseline139Pairs,
  typedQuantityCandidates:r.observations.length,
  items:r.observations.map(o=>({literal:o.quantity.literal,role:o.quantity.role,
   qualifier:o.quantity.qualifier,reporting:o.reporting,sourceSubject:o.sourceSubject?.literal??null,
   subjectIdentity:o.subjectIdentity,modeOrSetting:o.modeOrSetting?.literal??null,
   condition:o.condition?.literal??null,outcomeEndpoint:o.outcomeEndpoint?.literal??null,
   assignment:o.assignment,status:o.status,evidenceSha256:o.evidence.sha256})),
  truncated:r.coverageTruncated,sourceAuthenticated:r.observations.every(x=>x.sourceAuthenticated),
  independentAnnotations:r.independentGoldAnnotations,scientificAccuracy:r.accuracy,
  canonicalWriteAuthorized:r.canonicalWriteAuthorized,rankingAuthorized:r.rankingAuthorized};
};
const known=prior.items.map(x=>output(x,'previously_developer_exposed_phase143'));
const newer=newDocs.items.map(x=>output(x,'selected_after_144_code_was_written_not_blinded'));
const out={phase:144,version:'4.68-phase144',evaluationStatus:'developer_selected_diagnostic_not_independent_gold',
 parentVersion:'4.67-phase143',sourceCounts:{previous:known.length,newlySelected:newer.length},
 observations:{previous:known.reduce((n,x)=>n+x.typedQuantityCandidates,0),
  newlySelected:newer.reduce((n,x)=>n+x.typedQuantityCandidates,0)},
 comparisonMethod:'same previous Phase143 short excerpts, with typed numeric extraction and no full-text quality claim',
 accuracy:null,independentGoldAnnotations:0,canonicalWriteAuthorized:false,rankingAuthorized:false,
 limitations:['Narrow numerical unit coverage','No multi-paragraph semantic understanding','Source page hints unverified',
 'Developer selected all snippets','No independent gold reference','Source snapshots and test-protocol comparability not authenticated'],
 rows:[...known,...newer]};
writeFileSync('PHASE144-CROSS-CATEGORY-OBSERVATION-DIAGNOSTIC.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({sourceCounts:out.sourceCounts,observations:out.observations,
 rows:out.rows.map(x=>({id:x.id,oldPairs:x.prior139PairCount,typed:x.typedQuantityCandidates,states:x.items.map(y=>y.status)}))},null,2));
