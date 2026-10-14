/* Synthetic engineering diagnostic only. No web retrieval or verified review. */
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {advanceUserRequest164,newRequestSession164} from '../dist/src/phase164_user_request_journey.js';
import {previewOriginalReviewMeasures167} from '../dist/src/phase167_source_variant_quantity_adapter.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const question='Best coffee machine width under 35 cm and tank capacity at least 0.7 L';
const brain={categoryId:'coffee_machine',schemaVersion:1,aliases:['coffee machine','espresso machine'],sources:[],concepts:[],quality:[],distinctions:[]};
const request=advanceUserRequest164(newRequestSession164('phase167_demo'),{turnId:'turn_1',question,language:'en',brains:[brain]});
const cases=[
 {productId:'aster',variantId:'aster_v1',text:'The Aster coffee machine measured 31 cm in width. The Aster coffee machine measured 750 mL tank capacity.',alias:'Aster coffee machine',role:'original_product_test'},
 {productId:'bex',variantId:'bex_v2',text:'The Bex coffee machine measured 38 cm in width. The manufacturer claims a 900 mL tank capacity.',alias:'Bex coffee machine',role:'original_product_test'},
 {productId:'cora',variantId:'cora_v3',text:'The Cora coffee machine measured 30 cm in width. It holds 800 mL of water.',alias:'Cora coffee machine',role:'manufacturer_specification'}
];
const sources=cases.map((c,i)=>{
 const originalDocumentId=`synthetic_doc_${i+1}`,sourceId=`synthetic_source_${i+1}`,documentSha256=sha(c.text);
 return {reader:{document:{text:c.text,sha256:documentSha256,source:{id:sourceId,originalDocumentId,url:`https://example.org/constructed/${i+1}`,title:'Constructed fixture',role:c.role}},pageIdentity:{reviewedProductId:c.productId,reviewedVariantId:c.variantId,reviewedAliases:[c.alias]}},
 binding:{productId:c.productId,variantId:c.variantId,sourceId,originalDocumentId,documentSha256,reviewedAliases:[c.alias],identityIndependentlyAuthenticated:false,sourceIndependentlyAuthenticated:false}};
});
const preview=previewOriginalReviewMeasures167({question,request,products:cases.map(x=>x.productId),sources});
const output={caseStatus:'constructed_not_independent',executedModel:'native_phase145_phase166_phase167_no_neural',
 sourceAuthenticity:'unverified_fixture',quantityInterpretationConfirmed:false,results:{
 documents:sources.length,measurements:preview.totalMeasurements,
 dispositions:preview.candidateMeasures.map(x=>({id:x.id,disposition:x.disposition,metric:x.metric,value:x.canonicalValue,unit:x.canonicalUnit,subject:x.subjectSpan?.literal??null})),
 matches:preview.potentialMatches,phase166Screens:preview.unpromotedPhase166.screens,
 rankingAuthorized:preview.productRankingAuthorized,publicationAuthorized:preview.publicationAuthorized,
 obligations:preview.researchObligations}};
writeFileSync('evaluation/phase167/PHASE167-CONSTRUCTED-SOURCE-BRIDGE.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({docs:output.results.documents,measurements:output.results.measurements,matches:output.results.matches.length,dispositions:output.results.dispositions.map(x=>x.disposition),rankingAuthorized:preview.productRankingAuthorized}));
