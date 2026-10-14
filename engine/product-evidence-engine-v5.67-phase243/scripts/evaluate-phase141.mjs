import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {readLexicalEnglish141} from '../dist/src/phase141_local_lexical_resources.js';
const examples=[
 ['utilises','The Aster X2 utilises a heated dock.'],
 ['supplies','The Aster X2 supplies a crevice tool.'],
 ['outmatches','The Aster X2 outmatches B4 Pro on carpet.'],
 ['grapples','The Aster X2 grapples with long hair.'],
 ['negated','The Aster X2 does not utilize a filter.'],
 ['unresolved','It utilizes the filter.'],
 ['unsafe_synonym','The Aster X2 misses dust on carpets.']
];
const args=(text,id)=>({document:{text,sha256:createHash('sha256').update(text).digest('hex'),source:{id:'authored141_'+id,originalDocumentId:'constructed_'+id,url:'https://example.invalid/constructed',title:'Constructed authored test',role:'original_product_test'}},pageIdentity:{reviewedProductId:'aster',reviewedVariantId:'x2',reviewedAliases:['Aster X2']}});
const rows=examples.map(([id,text])=>{const r=readLexicalEnglish141(args(text,id));return {id,text,baseline140Proposals:r.baseline140Proposals,lexicalProposals:r.lexicalProposals.map(x=>({lemma:x.lexicalLemma,sense:x.wordnetSynset,structure:x.structure,status:x.status,reasons:x.reasons})),coverageTruncated:r.coverageTruncated};});
const existing=JSON.parse(readFileSync('research/phase140_original_excerpt_diagnostic/PHASE140-NEW-PUBLISHER-EXCERPTS.json','utf8'));
const previous=existing.examples.map((e,i)=>{
 const input={document:{text:e.text,sha256:createHash('sha256').update(e.text).digest('hex'),source:{id:e.id,originalDocumentId:e.id+'_short_excerpt',url:e.url,title:'Excerpt previously selected for Phase140',role:'original_product_test'}},pageIdentity:{reviewedProductId:e.reviewedProductId,reviewedVariantId:e.reviewedVariantId,reviewedAliases:e.reviewedAliases}};
 const r=readLexicalEnglish141(input);return {id:e.id,publisher:e.publisher,baseline140Proposals:r.baseline140Proposals,addedLexicalProposals:r.lexicalProposals.length};
});
const bundle=JSON.parse(readFileSync('resources/phase141/english_lexical_bundle.json','utf8'));
const out={phase:141,kind:'developer-authored lexical recall smoke test + previously selected real text diagnostic',independentEvaluation:false,realHoldoutAccuracy:null,sourceAuthentication:false,rightsForOriginalReviewsNotInferred:true,resourceCounts:{vaderEntries:bundle.provenance.vader.entries,verbnetLemmas:bundle.provenance.verbnet.lemmaCount,reviewedWordnetSynsets:bundle.provenance.wordnet.selectedSynsets,reviewedCues:bundle.reviewedLexicalCues.length},constructedCases:rows,previousOriginalExcerpts:previous};
writeFileSync('PHASE141-LEXICAL-RECALL-DIAGNOSTIC.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({constructed:rows.length,proposed:rows.reduce((n,x)=>n+x.lexicalProposals.length,0),previousOriginal:previous},null,2));
