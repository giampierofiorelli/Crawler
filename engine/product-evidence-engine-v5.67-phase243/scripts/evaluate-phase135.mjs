import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {buildDocumentMentionGraph135,inspectDocumentBridge135} from '../dist/src/phase135_document_mention_graph.js';
const hash=t=>createHash('sha256').update(t).digest('hex');
const document=t=>({text:t,sha256:hash(t),source:{id:'illustrative_author_written',originalDocumentId:'illustrative_phase135',url:'https://example.org/not-a-real-review',title:'Developer-authored illustration — NOT professional evidence',role:'original_product_test'}});
const sp=(t,x,n=0)=>{let pos=-1,i=0;for(let k=0;k<=n;k++){pos=t.indexOf(x,i);if(pos<0)throw Error(x);i=pos+x.length;}return {start:pos,end:i};};
const model=(d,id,n=0)=>({id,span:sp(d.text,'Aster X2',n),kind:'explicit_name',entityType:'product',entityId:'aster',variantId:'X2'});
const pron=(d,id)=>({id,span:sp(d.text,'It'),kind:'anaphor',entityType:'product'});
const outcome=(d,id,x)=>({id,span:sp(d.text,x),kind:'explicit_name',entityType:'outcome',entityId:id});
const receipt=(d,id,antecedent)=>({id:'illustrative_review_receipt',fromMentionId:id,toMentionId:antecedent,
 sourceId:d.source.id,originalDocumentId:d.source.originalDocumentId,documentSha256:d.sha256,
 contextSha256:hash(d.text),reviewerId:'illustrative_human_assertion',method:'human_coreference_adjudication'});
const project=g=>({sourceId:g.sourceId,documentSha256:g.documentSha256,links:g.links,rankingAuthorized:g.rankingAuthorized,
 canonicalWriteAuthorized:g.canonicalWriteAuthorized,reviewReceiptsIndependentlyAuthenticated:g.reviewReceiptsIndependentlyAuthenticated});
const rows=[];
{
 const d=document('Aster X2 was tested. Aster X2 improved soil removal.');
 const g=buildDocumentMentionGraph135({document:d,mentions:[model(d,'first'),model(d,'second',1),outcome(d,'soil','soil removal')]});
 rows.push({case:'explicit_model_repeat',graph:project(g)});
}
{
 const d=document('Aster X2 was tested. It improved soil removal.');
 const p=pron(d,'ref'),o=outcome(d,'soil','soil removal');
 const g=buildDocumentMentionGraph135({document:d,mentions:[model(d,'original'),p,o]});
 rows.push({case:'unreviewed_pronoun',graph:project(g)});
}
{
 const d=document('Aster X2 was tested. It improved soil removal.');
 const p=pron(d,'ref'),o=outcome(d,'soil','soil removal');
 const g=buildDocumentMentionGraph135({document:d,mentions:[model(d,'original'),p,o],reviewedLinks:[receipt(d,'ref','original')]});
 const s=d.text.indexOf(' It')+1;
 const proposal={subject:'It',object:'soil removal',label:'contributes_to',subjectSpan:p.span,objectSpan:o.span,
 evidenceSpan:{start:s,end:d.text.length},sourceId:d.source.id,originalDocumentId:d.source.originalDocumentId,
 sourceContentSha256:d.sha256,evidenceSha256:hash(d.text.slice(s)),margin:1,rankingAuthorized:false,status:'hypothesis_requires_scientific_review'};
 rows.push({case:'reviewed_reference_then_atomic_screen',graph:project(g),
  bridge:inspectDocumentBridge135({document:d,graph:g,proposal,subjectMentionId:'ref',objectMentionId:'soil'})});
}
{
 const d=document('Aster X2 has a heated dock. It improved soil removal.');
 const p=pron(d,'ref'),o=outcome(d,'soil','soil removal');
 const g=buildDocumentMentionGraph135({document:d,mentions:[model(d,'original'),
  {id:'dock',span:sp(d.text,'heated dock'),kind:'explicit_name',entityType:'component',entityId:'dock'},p,o]});
 rows.push({case:'product_or_dock_ambiguity',graph:project(g)});
}
const out={phase:135,version:'4.59-phase135',dataset:'developer-authored-examples-not-original_reviews',realIndependentEvaluation:false,
 rankedProducts:0,canonicalWrites:0,rows};
writeFileSync('PHASE135-CONSTRUCTED-TRACE.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({rows:rows.length,statuses:rows.map(r=>[r.case,r.bridge?.status??r.graph.links.find(link=>link.mentionId==='ref')?.status??r.graph.links.find(link=>link.mentionId==='second')?.status])},null,2));
