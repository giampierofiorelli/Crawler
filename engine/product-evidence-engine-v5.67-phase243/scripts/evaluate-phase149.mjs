import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {readDocumentReferences148} from '../dist/src/phase148_document_reference_hypotheses.js';
import {readBidirectionalDocument149} from '../dist/src/phase149_bidirectional_discourse_candidates.js';
const h=x=>createHash('sha256').update(x).digest('hex');
const make=(text,aliases=[],id='constructed')=>({document:{text,sha256:h(text),source:{id,originalDocumentId:id,url:'https://example.org/developer-experiment',title:'Illustrative diagnostic only',role:'original_product_test'}},
 ...(aliases.length?{pageIdentity:{reviewedProductId:'not-authenticated',reviewedVariantId:'not-authenticated',reviewedAliases:aliases}}:{})});
const crafted=[
 {id:'cataphora',text:'This player sounded balanced. TEAC VRDS-701 includes a DAC.',aliases:[]},
 {id:'cross_paragraph',text:'Aster X100 recorded 165°C.\n\nThis model stayed warm.',aliases:[]},
 {id:'variant_competition',text:'This model was compared. Aster X100 and Aster X100 Pro were tested.',aliases:['Aster X100','Aster X100 Pro']},
 {id:'claim_to_measurement',text:'Aster X100 advertises 60 hours.\n\nThis model measured 54 hours.',aliases:[]},
 {id:'pronoun_no_forward',text:'It improved. TEAC VRDS-701 uses a DAC.',aliases:[]},
 {id:'comparison_not_identity',text:'This TV features a very similar RGB Mini LED backlight system to the Sony BRAVIA 9 II.',aliases:['Sony BRAVIA 9 II']}
];
const editorial=JSON.parse(readFileSync('research/phase149_fresh_editorial_excerpts.json','utf8')).excerpts;
const assess=(entry,real)=>{
 const x=make(entry.text,entry.aliases,entry.id);if(real){x.document.source.url=entry.url;x.document.source.title=entry.publisher+' short source excerpt';}
 const a=readDocumentReferences148(x),b=readBidirectionalDocument149(x);
 return {id:entry.id,kind:real?'published_short_excerpt_seen_after_development':'developer_constructed',
 sourceUrl:real?entry.url:null,sourceSha256:h(entry.text),
 phase148:{references:a.references.map(v=>({text:v.mention.literal,decision:v.decision,candidateCount:v.candidateAnchorIds.length})),anchorCount:a.anchors.length},
 phase149:{proposals:b.proposals.map(v=>({text:v.mention.literal,status:v.status,direction:v.direction,candidateCount:v.candidateAnchorIds.length})),
 anchors:b.baseline148.anchors.length,variantWarnings:b.variantWarnings.length,coverageTruncated:b.coverageTruncated,
 canonicalWriteAuthorized:b.canonicalWriteAuthorized,rankingAuthorized:b.rankingAuthorized}};
};
const results={phase:149,version:'4.73-phase149',independentEvaluation:false,independentGoldAnnotations:0,
 precision:null,recall:null,scienceValidatedFacts:0,
 developerFixtures:crafted.map(c=>assess(c,false)),publishedExcerpts:editorial.map(e=>assess(e,true))};
writeFileSync('PHASE149-BIDIRECTIONAL-REFERENCE-DIAGNOSTIC.json',JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({crafted:results.developerFixtures.map(r=>({id:r.id,phase148:r.phase148.references.map(x=>x.decision),phase149:r.phase149.proposals.map(x=>x.status)})),
 editorial:results.publishedExcerpts.map(r=>({id:r.id,phase149:r.phase149.proposals.map(x=>x.status)}))},null,2));
