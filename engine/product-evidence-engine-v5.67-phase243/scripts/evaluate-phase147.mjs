import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLocalClaimAttachment147} from '../dist/src/phase147_local_claim_attachment.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const source=JSON.parse(readFileSync('research/phase147_new_source_excerpts.json','utf8'));
const constructed=[
 {id:'constructed_claim_contrast',category:'headphones',text:'The maker advertises 60 Wh, but the reviewer measured 54 Wh.'},
 {id:'constructed_hdr_sdr',category:'television',text:'In HDR it measured 900 nits, but in SDR it measured 350 nits.'},
 {id:'constructed_same_mode',category:'oven',text:'The Aster oven measured 180°C in Turbo mode. The Aster oven measured 165°C in Turbo mode.'},
 {id:'constructed_mode_change',category:'oven',text:'The Aster oven measured 180°C in Turbo mode. The Aster oven measured 165°C in Eco mode.'},
 {id:'constructed_pronoun',category:'oven',text:'The Aster oven measured 180°C. It reached 165°C.'},
 {id:'constructed_negative',category:'oven',text:'The Aster oven measured 180°C. The Aster oven did not measure 165°C.'},
];
const evaluate=(x,origin)=>{
 const text=x.text??x.excerpt,url=x.url??'https://example.org/developer-fixture';
 const document={text,sha256:sha(text),source:{id:x.id,originalDocumentId:x.id,url,title:x.pageTitle??'Constructed diagnostic',role:'original_product_test'}};
 const z=readLocalClaimAttachment147({document});
 const original146=z.baseline146;
 return {id:x.id,origin,category:x.category,publisher:x.publisher??null,url:x.url??null,
  excerptSha256:sha(text),baseline145MeasurementCount:original146.baseline145.measurements.length,
  baseline146DisplayConditions:original146.displayConditions.map(d=>({mode:d.mode,metric:d.metric,ambiguous:d.ambiguous})),
  phase147Attachments:z.attachments.map(a=>({quantity:a.quantity.literal,clause:a.clause.literal,
   attribution:a.attribution,conditionType:a.conditionType,surfaceMode:a.surfaceMode,
   subject:a.subject?.literal??null,status:a.status,numericRange:a.numericRange?.literal??null,protocolCues:a.protocolCues.map(p=>p.literal),rankingAuthorized:a.rankingAuthorized})),
  continuity:z.continuity.map(c=>({status:c.status,samePhysicalProductProven:c.samePhysicalProductProven})),
  coverageTruncated:z.coverageTruncated};
};
const result={phase:147,version:'4.71-phase147',date:'2026-10-11',
 sampleTypes:{publishedExcerpts:source.items.length,developerAuthored:constructed.length},
 newSourcesReviewedBeforeCodingComplete:true,independentGoldAnnotations:0,blind:false,precision:null,recall:null,
 realSourceAuthenticityVerifiedEndToEnd:false,allOutputsHypothesesOnly:true,
 publisherExcerpts:source.items.map(x=>evaluate(x,'short_published_excerpt_postselection')),
 constructed:constructed.map(x=>evaluate(x,'developer_authored_not_gold'))};
writeFileSync('PHASE147-CLAUSE-ATTRIBUTION-DIAGNOSTIC.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({published:result.publisherExcerpts.map(x=>({category:x.category,quantities:x.baseline145MeasurementCount,attachments:x.phase147Attachments.length})),
 constructed:result.constructed.map(x=>({id:x.id,attachments:x.phase147Attachments.length,links:x.continuity.map(y=>y.status)}))},null,2));
