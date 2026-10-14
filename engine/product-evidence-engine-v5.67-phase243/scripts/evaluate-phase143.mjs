import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {readUnmarkedEnglish139} from '../dist/src/phase139_unmarked_english_candidate_reader.js';
import {readBoundedEnglishRecall140} from '../dist/src/phase140_bounded_english_recall.js';
import {readLexicalEnglish141} from '../dist/src/phase141_local_lexical_resources.js';
import {readScopedLexicalFrames142} from '../dist/src/phase142_scoped_lexical_frames.js';
import {screenCrossDomainSubjects143} from '../dist/src/phase143_cross_domain_subject_guard.js';
const src=JSON.parse(readFileSync('research/phase143_cross_category_sources.json','utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const sourceHostnames=new Set(src.items.map(x=>x.hostname));
if(src.items.length!==6||sourceHostnames.size!==5||src.items.some(x=>src.previousExcerptHostnames.includes(x.hostname)))throw Error('invalid_source_disjoint_set');
const rows=src.items.map(e=>{
 const input={document:{text:e.text,sha256:sha(e.text),source:{id:e.id,originalDocumentId:e.id+'_snapshot',url:e.url,title:e.id,role:'original_product_test'}},
  pageIdentity:{reviewedProductId:e.reviewedProductId,reviewedVariantId:e.reviewedVariantId,reviewedAliases:e.aliases}};
 const p139=readUnmarkedEnglish139(input),p140=readBoundedEnglishRecall140(input),p141=readLexicalEnglish141(input),p142=readScopedLexicalFrames142(input),p143=screenCrossDomainSubjects143(input);
 const safe=proposals=>proposals.every(x=>x.canonicalWriteAuthorized===false&&x.rankingAuthorized===false);
 if(!safe(p139.pairs)||!safe(p140.proposals)||!safe(p141.lexicalProposals)||!safe(p142.frames))throw Error('unauthorized_claim');
 return {id:e.id,category:e.category,publisher:e.publisher,url:e.url,hostname:e.hostname,
  sourceVerification:e.sourceVerification,excerptSha256:sha(e.text),excerptCharacterCount:e.text.length,
  topicTags:e.phenomena,sourceDisjointRelativeToListedPreviousExcerpts:true,
  pageIdentityMetadataSupplied:true,pageIdentityIndependentlyVerified:false,
  phase139:{mentions:p139.mentions.length,pairs:p139.pairs.length,statuses:p139.pairs.map(x=>x.status),truncated:p139.coverageTruncated},
  phase140:{cues:p140.structuralCueCount,proposals:p140.proposals.length,statuses:p140.proposals.map(x=>x.status),truncated:p140.coverageTruncated},
  phase141:{matches:p141.lexicalMatches,proposals:p141.lexicalProposals.length,statuses:p141.lexicalProposals.map(x=>x.status),truncated:p141.coverageTruncated},
  phase142:{frames:p142.frames.length,issues:p142.frames.map(x=>x.issue),statuses:p142.frames.map(x=>x.status),truncated:p142.coverageTruncated},
  phase143:{unverifiedNames:p143.unverifiedSurfaceNames,aliasCandidates:p143.pageAliasCandidates,subjectScreen:p143.identityScreens.map(x=>({surfaceSubject:x.surfaceSubject,status:x.identityDisposition}))},
  independentGoldAnnotations:0,accuracy:null,rankingAuthorized:false,canonicalWriteAuthorized:false};
});
const sum=k=>rows.reduce((n,r)=>n+r[k],0);
const out={phase:143,baseline:'unmodified_PEE_v4.66_phase142',date:'2026-10-11',purpose:'new_publisher_cross_category_diagnostic',
 status:'developer_selected_original_excerpt_pilot_not_independent_validation',
 selectionCount:src.items.length,sourceHostnames:[...sourceHostnames].sort(),categories:[...new Set(src.items.map(x=>x.category))].sort(),
 counts:{phase139Pairs:rows.reduce((n,x)=>n+x.phase139.pairs,0),phase140Proposals:rows.reduce((n,x)=>n+x.phase140.proposals,0),phase141Proposals:rows.reduce((n,x)=>n+x.phase141.proposals,0),phase142Frames:rows.reduce((n,x)=>n+x.phase142.frames,0),phase143UnverifiedNames:rows.reduce((n,x)=>n+x.phase143.unverifiedNames,0),
  snippetsWithout139Pairs:rows.filter(x=>x.phase139.pairs===0).length,snippetsWithout141Proposals:rows.filter(x=>x.phase141.proposals===0).length},
 comparisonInvalidForAccuracy:true,reason:'No independently labelled gold set; short selected excerpts deliberately drop context; publisher pages not stored as authorized full snapshots.',
 unchangedProductionRuntime:true,independentGoldAnnotations:0,rankingAuthorized:false,canonicalWriteAuthorized:false,rows};
writeFileSync('PHASE143-CROSS-CATEGORY-BASELINE-DIAGNOSTIC.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({categories:out.categories,count:out.selectionCount,counts:out.counts,rows:rows.map(x=>({id:x.id,p139:x.phase139.pairs,p140:x.phase140.proposals,p141:x.phase141.proposals,p142:x.phase142.frames,p143Unverified:x.phase143.unverifiedNames}))},null,2));
