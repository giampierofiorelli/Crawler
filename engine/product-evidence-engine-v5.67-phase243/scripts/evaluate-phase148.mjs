import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readDocumentReferences148} from '../dist/src/phase148_document_reference_hypotheses.js';
const sha=t=>createHash('sha256').update(t).digest('hex');
const original=JSON.parse(readFileSync('research/phase148_fresh_published_excerpts.json','utf8'));
const constructed=[
 {id:'one_antecedent',category:'oven',text:'Aster X100 measured 180°C. It reached 165°C.'},
 {id:'two_antecedents',category:'washing_machine',text:'Aster X100 was compared with Birch B200. It completed the cycle.'},
 {id:'competing_part',category:'robot',text:'Aster X100 has a heated dock. It measured 165°C.'},
 {id:'cross_paragraph',category:'television',text:'Orion V500 reached 900 nits.\n\nIt stayed bright.'},
 {id:'different_reporting',category:'audio',text:'Orion V500 advertises 60 hours. It measured 54 hours.'},
 {id:'different_modes',category:'television',text:'Orion V500 measured 950 nits in HDR mode. It measured 400 nits in SDR mode.'},
 ];
function evaluate(x,kind){
 const text=x.excerpt??x.text;
 const doc={text,sha256:sha(text),source:{id:x.id,originalDocumentId:x.id,
  url:x.url??'https://example.org/devfixture',title:x.id,role:'original_product_test'}};
 const z=readDocumentReferences148({document:doc});
 return {id:x.id,category:x.category,publisher:x.publisher??null,url:x.url??null,
  origin:kind,sha256:sha(text),sentenceCount:z.sentences.length,
  explicitNameCandidates:z.anchors.length,baseline147AttachmentCount:z.baseline147.attachments.length,
  referenceDecisions:z.references.map(r=>({mention:r.mention.literal,decision:r.decision,
   candidates:r.candidateAnchorIds.length,linkedAttachments:r.linkedAttachmentIds.length,
   identityAuthenticated:r.identityAuthenticated,rankingAuthorized:r.rankingAuthorized})),
  truncated:z.coverageTruncated};
}
const diag={phase:148,version:'4.72-phase148',date:'2026-10-11',
 publishedExcerpts:original.excerpts.map(e=>evaluate(e,'published_short_excerpt_postimplementation')),
 developerFixtures:constructed.map(e=>evaluate(e,'developer_authored_not_gold')),
 publisherExcerptsCount:original.excerpts.length,blind:false,independentGoldAnnotations:0,
 precision:null,recall:null, falseMergeRate:null,canonicalWrites:0,
 note:'No original multi-paragraph gold annotation or independent quality benchmark. All links are candidate hypotheses.'};
writeFileSync('PHASE148-DOCUMENT-REFERENCE-DIAGNOSTIC.json',JSON.stringify(diag,null,2)+'\n');
console.log(JSON.stringify({published:diag.publishedExcerpts.map(x=>({id:x.id,refs:x.referenceDecisions.map(y=>y.decision)})),
 dev:diag.developerFixtures.map(x=>({id:x.id,refs:x.referenceDecisions.map(y=>y.decision)}))},null,2));
