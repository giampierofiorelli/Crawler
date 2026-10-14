import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildDocumentMentionGraph135,inspectDocumentBridge135,type MentionInput135,type ReferenceReview135} from '../src/phase135_document_mention_graph.js';
import type {RelationDocument131,CandidateRelation131,Span131} from '../src/phase131_local_relation_learning.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const doc=(text:string,id='review_v1'):RelationDocument131=>({text,sha256:sha(text),source:{id:'expert_review',originalDocumentId:id,url:'https://example.org/review-original',title:'Constructed test',role:'original_product_test'}});
const span=(d:RelationDocument131,needle:string,occurrence=0):Span131=>{
 let i=-1,at=0;for(let j=0;j<=occurrence;j++){i=d.text.indexOf(needle,at);assert.ok(i>=0,`not found ${needle}`);at=i+needle.length;}
 return {start:i,end:i+needle.length};
};
const product=(d:RelationDocument131,id:string,needle:string,occurrence=0,entityId='model-aster',variantId='X2'):MentionInput135=>
 ({id,span:span(d,needle,occurrence),kind:'explicit_name',entityType:'product',entityId,variantId});
const other=(d:RelationDocument131,id:string,needle:string,kind:MentionInput135['entityType']='outcome',occurrence=0):MentionInput135=>
 ({id,span:span(d,needle,occurrence),kind:'explicit_name',entityType:kind,entityId:id});
const pronoun=(d:RelationDocument131,id:string,needle:string,occurrence=0):MentionInput135=>
 ({id,span:span(d,needle,occurrence),kind:'anaphor',entityType:'product'});
const receipt=(d:RelationDocument131,fromMentionId:string,toMentionId:string):ReferenceReview135=>{
 const end=d.text.indexOf('.',d.text.indexOf('.')+1)+1;
 return {id:'human-receipt-1',fromMentionId,toMentionId,sourceId:d.source.id,
  originalDocumentId:d.source.originalDocumentId,documentSha256:d.sha256,
  contextSha256:sha(d.text.slice(0,end)),reviewerId:'annotator-1',method:'human_coreference_adjudication'};
};
const proposal=(d:RelationDocument131,subject:Span131,object:Span131,label:CandidateRelation131['label']='contributes_to'):CandidateRelation131=>{
 // evidence covers the current (second) sentence only
 const dot=d.text.indexOf('.');const start=d.text.indexOf(' ',dot)+1;
 const evidenceSpan={start,end:d.text.length};
 return {subject:d.text.slice(subject.start,subject.end),object:d.text.slice(object.start,object.end),label,
  subjectSpan:subject,objectSpan:object,evidenceSpan,
  sourceId:d.source.id,originalDocumentId:d.source.originalDocumentId,
  sourceContentSha256:d.sha256,evidenceSha256:sha(d.text.slice(evidenceSpan.start,evidenceSpan.end)),
  margin:2,rankingAuthorized:false,status:'hypothesis_requires_scientific_review'};
};
const get=(g:ReturnType<typeof buildDocumentMentionGraph135>,id:string)=>g.links.find(x=>x.mentionId===id)!;

test('direct repeat of model + identical upstream variant has a local graph link',()=>{
 const d=doc('The Aster X2 was tested. The Aster X2 removed more soil.');
 const mentions=[product(d,'a','Aster X2'),product(d,'b','Aster X2',1),other(d,'soil','soil')];
 const g=buildDocumentMentionGraph135({document:d,mentions});
 assert.equal(get(g,'a').status,'anchor');assert.equal(get(g,'b').status,'resolved_explicit_repeat');
 assert.equal(get(g,'b').antecedentId,'a');assert.equal(g.sentences.length,2);
 assert.equal(g.rankingAuthorized,false);assert.equal(g.canonicalWriteAuthorized,false);
 assert.deepEqual(g,buildDocumentMentionGraph135({document:d,mentions:[mentions[2],mentions[1],mentions[0]]}));
});
test('exact repeated name with alternate case resolves only with same verified annotation IDs',()=>{
 const d=doc('Aster X2 was tested. ASTER X2 performed better.');
 const g=buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),product(d,'b','ASTER X2')]});
 assert.equal(get(g,'b').status,'resolved_explicit_repeat');
});
test('a unique pronoun antecedent becomes a candidate, never automatically a link',()=>{
 const d=doc('The Aster X2 was tested. It removed more soil.');
 const g=buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),pronoun(d,'p','It'),other(d,'o','soil')]});
 assert.equal(get(g,'p').status,'unresolved');assert.equal(get(g,'p').reason,'requires_coreference_review');
 assert.deepEqual(get(g,'p').candidateAntecedentIds,['a']);
});
test('two models make it ambiguous, with both alternatives shown',()=>{
 const d=doc('The Aster X2 and Vega M1 were compared. It performed better.');
 const g=buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),product(d,'v','Vega M1',0,'vega','M1'),pronoun(d,'p','It')]});
 assert.equal(get(g,'p').reason,'multiple_candidate_referents');
 assert.deepEqual(get(g,'p').candidateAntecedentIds,['a','v']);
});
test('component competitor remains a possible referent, so robot and dock are not conflated',()=>{
 const d=doc('The Aster X2 has a heated dock. It removes more soil.');
 const g=buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),other(d,'dock','heated dock','component'),pronoun(d,'p','It')]});
 assert.equal(get(g,'p').status,'unresolved');assert.equal(get(g,'p').reason,'multiple_candidate_referents');
 assert.deepEqual(get(g,'p').candidateAntecedentIds,['a','dock']);
});
test('two-source identity with same product ID is NEVER merged across original documents',()=>{
 const one=doc('The Aster X2 was tested. It improved suction.','source_one');
 const two=doc('It improved suction.','source_two');
 const first=buildDocumentMentionGraph135({document:one,mentions:[product(one,'a','Aster X2'),pronoun(one,'p','It')]});
 const second=buildDocumentMentionGraph135({document:two,mentions:[pronoun(two,'p','It')]});
 assert.equal(first.links.length,2);assert.equal(get(second,'p').reason,'no_adjacent_antecedent');
 assert.notEqual(first.documentSha256,second.documentSha256);
});
test('paragraph breaks prevent nearest-pronoun linking',()=>{
 const d=doc('The Aster X2 was tested.\n\nIt improved suction.');
 const g=buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),pronoun(d,'p','It')]});
 assert.equal(get(g,'p').reason,'paragraph_boundary');
});
test('no immediately preceding named product produces no antecedent',()=>{
 const d=doc('The Aster X2 was tested. The surface was wet. It performed well.');
 const g=buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),other(d,'s','surface','surface'),pronoun(d,'p','It')]});
 assert.equal(get(g,'p').reason,'no_adjacent_antecedent');
});
test('variant mismatch is never same-product identity',()=>{
 const d=doc('The Aster X2 was tested. The Aster X2 improved.');
 const g=buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),product(d,'b','Aster X2',1,'model-aster','X3')]});
 assert.equal(get(g,'a').status,'unresolved');assert.equal(get(g,'b').reason,'identity_collision');
});
test('different annotated product IDs for same surface collide independent of input order',()=>{
 const d=doc('The Aster X2 worked. The Aster X2 did not.');
 const a=product(d,'a','Aster X2'),b=product(d,'b','Aster X2',1,'different-model','X2');
 const g=buildDocumentMentionGraph135({document:d,mentions:[a,b]});
 assert.deepEqual(g,buildDocumentMentionGraph135({document:d,mentions:[b,a]}));
 assert.equal(get(g,'b').reason,'identity_collision');assert.equal(get(g,'a').status,'unresolved');
});
test('generic repeated nouns are not treated as verified product identity',()=>{
 const d=doc('The robot was tested. The robot improved.');
 const g=buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','robot'),product(d,'b','robot',1)]});
 assert.equal(get(g,'b').reason,'generic_descriptor_not_identity');
});
test('review receipt tied to original sentence context permits a LOCAL reviewed reference',()=>{
 const d=doc('The Aster X2 was tested. It removed more soil.');
 const a=product(d,'a','Aster X2'),p=pronoun(d,'p','It');
 const g=buildDocumentMentionGraph135({document:d,mentions:[a,p,other(d,'soil','soil')],reviewedLinks:[receipt(d,'p','a')]});
 assert.equal(get(g,'p').status,'resolved_reviewed_reference');
 assert.equal(get(g,'p').antecedentId,'a');assert.equal(g.reviewReceiptsIndependentlyAuthenticated,false);
});
test('human receipt with false context hash does not resolve',()=>{
 const d=doc('The Aster X2 was tested. It removed more soil.');
 assert.throws(()=>buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),pronoun(d,'p','It')],
  reviewedLinks:[{...receipt(d,'p','a'),contextSha256:'fake'}]}),/context_hash/);
});
test('human receipt from a different document identity is rejected',()=>{
 const d=doc('The Aster X2 was tested. It removed more soil.');
 assert.throws(()=>buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),pronoun(d,'p','It')],
  reviewedLinks:[{...receipt(d,'p','a'),sourceId:'other'}]}),/reference_receipt/);
});
test('review cannot connect nonadjacent sentence or across paragraph',()=>{
 const d=doc('The Aster X2 was tested. The temperature changed. It improved.');
 assert.throws(()=>buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),pronoun(d,'p','It')],
  reviewedLinks:[{...receipt(d,'p','a'),contextSha256:sha(d.text)}]}),/reference_endpoints/);
});
test('review cannot grant identity to mismatched typed entities',()=>{
 const d=doc('The Aster X2 was tested. It improved.');
 const p=pronoun(d,'p','It');
 assert.throws(()=>buildDocumentMentionGraph135({document:d,mentions:[other(d,'a','Aster X2','component'),p],
  reviewedLinks:[receipt(d,'p','a')]}),/reference_endpoints/);
});
test('an unreviewed pronoun blocks Phase131+134 scientific evidence bridge',()=>{
 const d=doc('The Aster X2 was tested. It removed more soil.');
 const a=product(d,'a','Aster X2'),p=pronoun(d,'p','It'),o=other(d,'o','soil');
 const g=buildDocumentMentionGraph135({document:d,mentions:[a,p,o]});
 const decision=inspectDocumentBridge135({document:d,graph:g,proposal:proposal(d,p.span,o.span),subjectMentionId:'p',objectMentionId:'o'});
 assert.equal(decision.status,'reference_unresolved');assert.equal(decision.atomicDecision,null);
});
test('a reviewed reference is screened by Phase131, Phase132 AND Phase134, still never truth',()=>{
 const d=doc('The Aster X2 was tested. It improved soil removal.');
 const a=product(d,'a','Aster X2'),p=pronoun(d,'p','It'),o=other(d,'o','soil removal');
 const g=buildDocumentMentionGraph135({document:d,mentions:[a,p,o],reviewedLinks:[receipt(d,'p','a')]});
 const result=inspectDocumentBridge135({document:d,graph:g,proposal:proposal(d,p.span,o.span),subjectMentionId:'p',objectMentionId:'o'});
 assert.equal(result.status,'quarantined_cross_sentence_hypothesis');
 assert.equal(result.referenceStatus,'resolved_reviewed_reference');
 assert.equal(result.atomicDecision?.status,'quarantined_candidate');
 assert.equal(result.rankingAuthorized,false);assert.equal(result.canonicalWriteAuthorized,false);
});
test('same model repeated by name can bridge without a pronoun adjudication',()=>{
 const d=doc('The Aster X2 was tested. The Aster X2 improved soil removal.');
 const a=product(d,'a','Aster X2'),b=product(d,'b','Aster X2',1),o=other(d,'o','soil removal');
 const g=buildDocumentMentionGraph135({document:d,mentions:[a,b,o]});
 const result=inspectDocumentBridge135({document:d,graph:g,proposal:proposal(d,b.span,o.span),subjectMentionId:'b',objectMentionId:'o'});
 assert.equal(result.status,'quarantined_cross_sentence_hypothesis');assert.equal(result.antecedentMentionId,'a');
});
test('a negated second-sentence relation never gets through Phase132 or Phase134',()=>{
 const d=doc('The Aster X2 was tested. It did not improve soil removal.');
 const a=product(d,'a','Aster X2'),p=pronoun(d,'p','It'),o=other(d,'o','soil removal');
 const g=buildDocumentMentionGraph135({document:d,mentions:[a,p,o],reviewedLinks:[receipt(d,'p','a')]});
 const result=inspectDocumentBridge135({document:d,graph:g,proposal:proposal(d,p.span,o.span),subjectMentionId:'p',objectMentionId:'o'});
 assert.equal(result.status,'invalid_proposal');assert.equal(result.atomicDecision,null);
});
test('mutated graph status and forged review record cannot bypass reconstruction gate',()=>{
 const d=doc('The Aster X2 was tested. It improved soil removal.');
 const a=product(d,'a','Aster X2'),p=pronoun(d,'p','It'),o=other(d,'o','soil removal');
 const g=buildDocumentMentionGraph135({document:d,mentions:[a,p,o]});
 get(g,'p').status='resolved_reviewed_reference';get(g,'p').antecedentId='a';
 const result=inspectDocumentBridge135({document:d,graph:g,proposal:proposal(d,p.span,o.span),subjectMentionId:'p',objectMentionId:'o'});
 assert.equal(result.status,'invalid_proposal');
});
test('tampered Phase131 evidence digest is never accepted via graph',()=>{
 const d=doc('The Aster X2 was tested. The Aster X2 improved soil removal.');
 const a=product(d,'a','Aster X2'),b=product(d,'b','Aster X2',1),o=other(d,'o','soil removal');
 const g=buildDocumentMentionGraph135({document:d,mentions:[a,b,o]});
 const c={...proposal(d,b.span,o.span),evidenceSha256:'fake'};
 assert.equal(inspectDocumentBridge135({document:d,graph:g,proposal:c,subjectMentionId:'b',objectMentionId:'o'}).status,'invalid_proposal');
});
test('forged source document hash fails closed',()=>{
 const d=doc('The Aster X2 was tested. It improved.');
 assert.throws(()=>buildDocumentMentionGraph135({document:{...d,text:d.text+' tampering'},mentions:[product(d,'a','Aster X2')]}),/document_provenance/);
});
test('invalid overlapping or invented mentions are rejected',()=>{
 const d=doc('The Aster X2 was tested. It improved.');
 assert.throws(()=>buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),product(d,'b','Aster X2')]}),/overlapping/);
 assert.throws(()=>buildDocumentMentionGraph135({document:d,mentions:[{id:'p',span:span(d,'tested'),kind:'anaphor',entityType:'product'}]}),/anaphor/);
});
test('missing variant or duplicate IDs fail closed',()=>{
 const d=doc('The Aster X2 was tested. It improved.');
 assert.throws(()=>buildDocumentMentionGraph135({document:d,mentions:[{...product(d,'a','Aster X2'),variantId:undefined}]}),/unproven/);
 assert.throws(()=>buildDocumentMentionGraph135({document:d,mentions:[product(d,'a','Aster X2'),{...pronoun(d,'a','It')}]}),/invalid_mention/);
});
test('maximum annotation bounds prevent unbounded document pair expansion',()=>{
 const d=doc('It performed well.');
 assert.throws(()=>buildDocumentMentionGraph135({document:d,mentions:Array.from({length:301},(_,i)=>({...pronoun(d,'p','It'),id:`x${i}`}))}),/unbounded/);
});
test('duplicate human review receipt IDs cannot be recycled for two pronouns',()=>{
 const d=doc('The Aster X2 was tested. It improved while its motor ran.');
 const a=product(d,'a','Aster X2'),p=pronoun(d,'p','It'),q=pronoun(d,'q','its');
 const r=receipt(d,'p','a');
 assert.throws(()=>buildDocumentMentionGraph135({document:d,mentions:[a,p,q],
  reviewedLinks:[r,{...r,fromMentionId:'q'}]}),/reference_receipt/);
});
test('no spurious resolution with model name collision despite reviewed referent receipt',()=>{
 const d=doc('The Aster X2 was tested. The Aster X2 improved. It improved again.');
 const a=product(d,'a','Aster X2'),b=product(d,'b','Aster X2',1,'other','X2'),p=pronoun(d,'p','It');
 const g=buildDocumentMentionGraph135({document:d,mentions:[a,b,p]});
 assert.equal(get(g,'a').reason,'identity_collision');assert.equal(get(g,'b').reason,'identity_collision');
 assert.equal(get(g,'p').reason,'no_adjacent_antecedent');
});
test('scoped document sentences retain exact UTF-16 offsets with non-ASCII products',()=>{
 const d=doc('The Mødel X2 was tested. The Mødel X2 improved soil removal.');
 const a=product(d,'a','Mødel X2'),b=product(d,'b','Mødel X2',1);
 const g=buildDocumentMentionGraph135({document:d,mentions:[a,b,other(d,'o','soil removal')]});
 assert.equal(get(g,'b').status,'resolved_explicit_repeat');
 assert.equal(d.text.slice(g.mentions[0].span.start,g.mentions[0].span.end),'Mødel X2');
});
