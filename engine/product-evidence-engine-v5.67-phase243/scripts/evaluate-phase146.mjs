import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readCompoundConditions146} from '../dist/src/phase146_compound_conditions.js';
const h=x=>createHash('sha256').update(x).digest('hex');
function evaluate({id,category,product,text,publisher,url},kind){
 const source={id,originalDocumentId:id,url:url??'https://example.org/constructed-fixture',title:kind,role:'original_product_test'};
 const input={document:{text,sha256:h(text),source},pageIdentity:{reviewedProductId:id,reviewedVariantId:id,reviewedAliases:[product]}};
 const out=readCompoundConditions146(input);
 return {id,category,publisher:publisher??null,url:url??null,kind,sha256:h(text),
  prior145Measurements:out.baseline145.measurements.length,phase146Compounds:out.compounds.map(c=>({literal:c.evidence.literal,kind:c.kind,parts:c.components.map(p=>({literal:p.evidence.literal,kind:p.kind,canonicalValue:p.canonicalValue,canonicalUnit:p.canonicalUnit})),role:c.role,authorized:c.canonicalWriteAuthorized})),
  displayConditions:out.displayConditions.map(d=>({mode:d.mode,metric:d.metric,windowPercent:d.windowPercent,ambiguous:d.ambiguous,protocolVerified:d.protocolVerified})),
  temperaturePairs:out.temperaturePairs.map(t=>({setpoint:t.setpoint.literal,reading:t.reading.literal,verified:t.samePhysicalDeviceProven,linkType:t.linkType})),
  covered:!out.coverageTruncated,canonicalWriteAuthorized:out.canonicalWriteAuthorized,rankingAuthorized:out.rankingAuthorized};
}
const sources=JSON.parse(readFileSync('research/phase145_cross_domain_postcode_challenge.json','utf8'));
const originals=sources.items.map(x=>evaluate(x,'previously_exposed_publisher_excerpt'));
const constructed=[
 {id:'constructed_cd',category:'cd_player',product:'Aster',text:'The player supports 24-bit/192kHz files.'},
 {id:'constructed_speaker',category:'loudspeakers',product:'Aster',text:'The speaker sensitivity is listed as 88 dB/W/m.'},
 {id:'constructed_tv',category:'television',product:'Aster',text:'In HDR peak 10% window the Aster TV reached 1,362 cd/m².'},
 {id:'constructed_oven',category:'oven',product:'Aster',text:'The Aster oven was set to 180°C. The Aster oven reached 165°C.'},
 {id:'constructed_ambiguous',category:'television',product:'Aster',text:'Across HDR and SDR modes at 2% and 10% window, the TV reached 920 nits.'}
].map(x=>evaluate(x,'developer_authored_not_gold'));
const report={phase:146,version:'4.70-phase146',originalProfessionalReviewExcerpts:originals.length,
 publisherExcerptsPreviouslyExposed:true,constructedFixtures:constructed.length,blind:false,
 independentGoldAnnotations:0,accuracy:null,sourceRightsForFullTextRedistributionEstablished:false,
 interpretation:'surface extraction and condition preservation, not claims of scientific product performance',
 originalExcerpts:originals,developerConstructed:constructed};
writeFileSync('PHASE146-COMPOUND-CONTEXT-DIAGNOSTIC.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({priorReviewed:originals.map(r=>({category:r.category,compoundCount:r.phase146Compounds.length,measurementCount:r.prior145Measurements})),constructed:constructed.map(r=>({category:r.category,compounds:r.phase146Compounds.length,display:r.displayConditions.length,pairs:r.temperaturePairs.length}))},null,2));
