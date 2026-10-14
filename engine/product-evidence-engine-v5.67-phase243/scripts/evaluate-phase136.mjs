import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {manifestDigest136,evaluateCorpus136} from '../dist/src/phase136_independent_signal_benchmark.js';
const hash=t=>createHash('sha256').update(t).digest('hex');
const make=(id,text,subjectText='Aster X2',ref=false)=>{
 const d={text,sha256:hash(text),source:{id:'illustrative_'+id,originalDocumentId:'illustrative_'+id,
  url:`https://${id}.example.org/NOT-A-REVIEW`,title:'Developer-authored example',role:'original_product_test'}};
 const first=text.indexOf('Aster X2'),second=ref?text.indexOf('It',text.indexOf('.')+1):text.indexOf('Aster X2',first+1),
  object=text.indexOf('soil removal'),start=text.indexOf('.')+2;
 const subjectSpan={start:second,end:second+subjectText.length},objectSpan={start:object,end:object+'soil removal'.length};
 const proposal={subject:subjectText,object:'soil removal',subjectSpan,objectSpan,label:'contributes_to',
  evidenceSpan:{start,end:text.length},sourceId:d.source.id,originalDocumentId:d.source.originalDocumentId,
  sourceContentSha256:d.sha256,evidenceSha256:hash(text.slice(start)),margin:2,
  rankingAuthorized:false,status:'hypothesis_requires_scientific_review'};
 const mentions=[{id:'first',kind:'explicit_name',entityType:'product',entityId:'aster',variantId:'x2',span:{start:first,end:first+8}},
  {id:'second',kind:ref?'anaphor':'explicit_name',entityType:'product',
   ...(!ref?{entityId:'aster',variantId:'x2'}:{}),span:subjectSpan},
  {id:'outcome',kind:'explicit_name',entityType:'outcome',entityId:'soil',span:objectSpan}];
 return {id,split:'frozen_holdout',metadata:{sourceGroupId:'illustrative_'+id,productFamilyId:'illustrative_family_'+id,
  categoryId:'robot_vacuum',origin:'constructed',permission:'not_established',phenomena:[ref?'pronoun':'other']},
  document:d,mentions,proposal,subjectMentionId:'second',objectMentionId:'outcome'};
};
const a=make('explicit','Aster X2 was tested. Aster X2 improved soil removal.');
const b=make('pronoun','Aster X2 was tested. It improved soil removal.','It',true);
const c=make('conflict','Aster X2 was tested. Aster X2 improved soil removal.');
c.signals=[{id:'rule_a',family:'scope',vote:'supports_candidate',version:'1'},
 {id:'rule_b',family:'alternate',vote:'opposes_candidate',version:'1'}];
const data=[a,b,c],digest=manifestDigest136(data);
const result=evaluateCorpus136({cases:data,expectedManifestDigest:digest});
const report={...result,dataset:'3 developer-authored constructed scenarios',independentOriginalReviews:0,
 independentAccuracyBenchmarksCompleted:false};
writeFileSync('PHASE136-CONSTRUCTED-TRACE.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({examples:report.cases.map(x=>({id:x.id,screen:x.screen,baseline:x.phase134Baseline,
  goldExclusion:x.goldExclusionReason})),eligibleOriginalHoldout:report.counts.descriptivelyScorableHoldout},null,2));
