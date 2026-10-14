import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {manifestDigest136,screenCase136,evaluateCorpus136,type BenchmarkCase136} from '../src/phase136_independent_signal_benchmark.js';
import type {RelationDocument131,CandidateRelation131,Span131} from '../src/phase131_local_relation_learning.js';
import type {MentionInput135,ReferenceReview135} from '../src/phase135_document_mention_graph.js';
const sha=(text:string)=>createHash('sha256').update(text).digest('hex');
const doc=(text:string,source='source_one',id='doc1'):RelationDocument131=>({text,sha256:sha(text),
 source:{id,originalDocumentId:source,url:`https://${source}.example.org/original`,title:'Constructed unit fixture',role:'original_product_test'}});
const at=(text:string,s:string,n=0):Span131=>{
 let idx=-1,pos=0;for(let i=0;i<=n;i++){idx=text.indexOf(s,pos);assert.ok(idx>=0,s);pos=idx+s.length;}
 return {start:idx,end:idx+s.length};
};
const named=(d:RelationDocument131,id:string,value:string,n=0,entityId='aster',variantId='x2'):MentionInput135=>
 ({id,kind:'explicit_name',entityType:'product',span:at(d.text,value,n),entityId,variantId});
const outcome=(d:RelationDocument131,id:string,value:string):MentionInput135=>
 ({id,kind:'explicit_name',entityType:'outcome',span:at(d.text,value),entityId:id});
const pronoun=(d:RelationDocument131,id:string,value:string):MentionInput135=>
 ({id,kind:'anaphor',entityType:'product',span:at(d.text,value)});
function sample(id='a',split:'development'|'frozen_holdout'='frozen_holdout',text='Aster X2 was examined. Aster X2 improved soil removal.'):BenchmarkCase136 {
 const d=doc(text,'doc_'+id,'source_'+id);
 const s=text.lastIndexOf('Aster X2'),object=at(text,'soil removal');
 const subject={start:s,end:s+'Aster X2'.length};
 const evidenceSpan={start:text.indexOf('.',0)+2,end:text.length};
 const proposal:CandidateRelation131={subject:'Aster X2',object:'soil removal',label:'contributes_to',
  subjectSpan:subject,objectSpan:object,evidenceSpan,sourceId:d.source.id,
  originalDocumentId:d.source.originalDocumentId,sourceContentSha256:d.sha256,
  evidenceSha256:sha(text.slice(evidenceSpan.start,evidenceSpan.end)),margin:2,
  rankingAuthorized:false,status:'hypothesis_requires_scientific_review'};
 return {id,split,document:d,proposal,mentions:[named(d,'a','Aster X2'),named(d,'b','Aster X2',1),outcome(d,'o','soil removal')],
  subjectMentionId:'b',objectMentionId:'o',metadata:{sourceGroupId:'publisher_'+id,
  productFamilyId:'family_'+id,categoryId:'robot_vacuum',origin:'constructed',
  permission:'not_established',phenomena:['other']},signals:[]};
}
const refCase=(id='pr'):BenchmarkCase136=>{
 const c=sample(id);const d=doc('Aster X2 was examined. It improved soil removal.','doc_'+id,'source_'+id);
 const p=pronoun(d,'b','It'),o=outcome(d,'o','soil removal');
 const evidenceSpan={start:d.text.indexOf('.')+2,end:d.text.length};
 return {...c,document:d,mentions:[named(d,'a','Aster X2'),p,o],
  proposal:{...c.proposal,subject:'It',subjectSpan:p.span,objectSpan:o.span,
   evidenceSpan,sourceContentSha256:d.sha256,
   evidenceSha256:sha(d.text.slice(evidenceSpan.start,evidenceSpan.end))}};
};
const receipt=(c:BenchmarkCase136):ReferenceReview135=>{
 const d=c.document;
 return {id:'receipt',fromMentionId:'b',toMentionId:'a',sourceId:d.source.id,
  originalDocumentId:d.source.originalDocumentId,documentSha256:d.sha256,
  contextSha256:sha(d.text),reviewerId:'reviewer',method:'human_coreference_adjudication'};
};
const gold=(label:'supported_by_passage'|'contradicted_by_passage'|'indeterminate_from_passage')=>
 [{annotatorId:'blind_r1',label},{annotatorId:'blind_r2',label}];
const signed=(c:BenchmarkCase136,label:'supported_by_passage'|'contradicted_by_passage'|'indeterminate_from_passage'='supported_by_passage'):BenchmarkCase136=>
 ({...c,metadata:{...c.metadata,origin:'original_professional',permission:'evaluation_authorized'},goldVotes:gold(label)});
const run=(cs:BenchmarkCase136[])=>evaluateCorpus136({cases:cs,expectedManifestDigest:manifestDigest136(cs)});

test('direct repeat is screened into quarantine, never canonical evidence or ranking',()=>{
 const r=screenCase136(sample());assert.equal(r.screen,'candidate_quarantined');
 assert.equal(r.phase134Baseline,'candidate_quarantined');
 assert.equal(r.rankingAuthorized,false);assert.equal(r.canonicalWriteAuthorized,false);
});
test('unreviewed pronoun abstains even when Phase134 lexical screen would pass',()=>{
 const r=screenCase136(refCase());assert.equal(r.screen,'abstain');
 assert.equal(r.phase135Status,'reference_unresolved');assert.equal(r.phase134Baseline,'candidate_quarantined');
});
test('review receipt allows local reference but never scientific promotion',()=>{
 const c=refCase();c.reviewedLinks=[receipt(c)];
 const r=screenCase136(c);assert.equal(r.screen,'candidate_quarantined');
 assert.equal(r.rankingAuthorized,false);
});
test('fake receipt context SHA is rejected rather than accepted',()=>{
 const c=refCase();c.reviewedLinks=[{...receipt(c),contextSha256:'not-the-hash'}];
 assert.throws(()=>screenCase136(c),/context_hash/);
});
test('opposing weak signals produce abstention, never a popularity vote',()=>{
 const c=sample();c.signals=[{id:'a',family:'extractor',version:'1',vote:'supports_candidate'},
  {id:'b',family:'rule',version:'1',vote:'opposes_candidate'}];
 const r=screenCase136(c);assert.equal(r.signalStatus,'conflicting_signals');assert.equal(r.screen,'abstain');
});
test('same-family repeated votes are not counted as verified independent proof',()=>{
 const c=sample();c.signals=[{id:'a',family:'regex',version:'1',vote:'supports_candidate'},
  {id:'b',family:'regex',version:'1',vote:'supports_candidate'}];
 const r=screenCase136(c);assert.equal(r.signalStatus,'insufficient_independent_signals');
 assert.deepEqual(r.signalFamilies,['regex']);
});
test('duplicate signal ID rejected',()=>{
 const c=sample();c.signals=[{id:'a',family:'x',version:'1',vote:'supports_candidate'},
  {id:'a',family:'y',version:'1',vote:'abstains'}];
 assert.throws(()=>screenCase136(c),/duplicate_signal/);
});
test('source digest change fails closed and never gets a valid metric',()=>{
 const c=sample();c.document={...c.document,text:c.document.text+' extra'};
 assert.throws(()=>screenCase136(c),/invalid_benchmark_case/);
});
test('candidate evidence digest tampering yields invalid rather than accepted',()=>{
 const c=sample();c.proposal={...c.proposal,evidenceSha256:'bad'};
 const r=screenCase136(c);assert.equal(r.screen,'invalid');
});
test('constructed holdout has no scientific accuracy denominator even with two votes',()=>{
 const c=sample();c.goldVotes=gold('supported_by_passage');
 const r=run([c]);assert.equal(r.counts.descriptivelyScorableHoldout,0);
 assert.equal(r.holdout.total,0);assert.equal(r.holdout.coverage,null);
 assert.ok(r.warnings.includes('NO_INDEPENDENT_ORIGINAL_HOLDOUT_SCORABLE'));
});
test('nonapproved original source cannot participate in scoring',()=>{
 const c=sample();c.metadata={...c.metadata,origin:'original_professional'};
 c.goldVotes=gold('supported_by_passage');
 const r=run([c]);assert.equal(r.cases[0].goldExclusionReason,'source_rights_not_established');
});
test('single gold annotator cannot claim independent annotation',()=>{
 const c=signed(sample());c.goldVotes=[gold('supported_by_passage')[0]];
 assert.equal(run([c]).cases[0].goldExclusionReason,'two_independent_votes_missing');
});
test('disagreeing annotators make gold unscorable',()=>{
 const c=signed(sample());c.goldVotes=[gold('supported_by_passage')[0],gold('contradicted_by_passage')[1]];
 assert.equal(run([c]).cases[0].goldExclusionReason,'gold_annotator_disagreement');
});
test('duplicate annotator identity fails closed',()=>{
 const c=signed(sample());c.goldVotes=[gold('supported_by_passage')[0],gold('supported_by_passage')[0]];
 assert.throws(()=>run([c]),/invalid_gold_votes/);
});
test('attested original concordant gold supports descriptive scoring only',()=>{
 const c=signed(sample());
 const r=run([c]);assert.equal(r.counts.descriptivelyScorableHoldout,1);
 assert.equal(r.holdout.textualSupportPrecisionAmongScreened,1);
 assert.equal(r.scientificAccuracyClaimAuthorized,false);
 assert.equal(r.annotationIdentityVerified,false);assert.equal(r.preregistrationIndependentlyVerified,false);
});
test('unsupported accepted proposal increments a textual false accept count',()=>{
 const c=signed(sample(),'contradicted_by_passage');
 const r=run([c]);assert.equal(r.holdout.falseAcceptCount,1);
 assert.equal(r.holdout.falseAcceptRateAmongScreened,1);
});
test('indeterminate gold accepted also counts as unsafe acceptance',()=>{
 const c=signed(sample(),'indeterminate_from_passage');
 assert.equal(run([c]).holdout.falseAcceptCount,1);
});
test('unresolved pronoun is an abstention and not a false accept',()=>{
 const c=signed(refCase(),'indeterminate_from_passage');
 const r=run([c]);assert.equal(r.holdout.abstained,1);
 assert.equal(r.holdout.falseAcceptCount,0);
 assert.equal(r.holdout.abstentionRate,1);
});
test('distinct source families may share category without split contamination',()=>{
 const a=sample('train','development'),b=signed(sample('test','frozen_holdout','Aster X2 was examined. Aster X2 improved soil removal on rugs.'));
 const r=run([a,b]);assert.equal(r.counts.development,1);assert.equal(r.counts.holdout,1);
});
test('source group leakage between development and holdout forbidden',()=>{
 const a=sample('train','development'),b=sample('test','frozen_holdout','Aster X2 was examined. Aster X2 improved soil removal on rugs.');
 b.metadata={...b.metadata,sourceGroupId:a.metadata.sourceGroupId};
 assert.throws(()=>manifestDigest136([a,b]),/source_group_leakage/);
});
test('same original URL host cannot be misdeclared as different source groups',()=>{
 const a=sample('train','development'),b=sample('test','frozen_holdout','Aster X2 was examined. Aster X2 improved soil removal on rugs.');
 b.document={...b.document,source:{...b.document.source,url:a.document.source.url}};
 assert.throws(()=>manifestDigest136([a,b]),/source_hostname_leakage/);
});
test('product family leakage between development and holdout forbidden',()=>{
 const a=sample('train','development'),b=sample('test','frozen_holdout','Aster X2 was examined. Aster X2 improved soil removal on rugs.');
 b.metadata={...b.metadata,productFamilyId:a.metadata.productFamilyId};
 assert.throws(()=>manifestDigest136([a,b]),/product_group_leakage/);
});
test('same text in different splits forbidden even with different document IDs',()=>{
 const a=sample('train','development'),b=sample('test');
 assert.throws(()=>manifestDigest136([a,b]),/duplicate_document_leakage/);
});
test('different source/document but same text in same split remains explicitly visible',()=>{
 const a=sample('one'),b=sample('two');
 assert.equal(run([a,b]).counts.holdout,2);
});
test('reusing a case ID is forbidden',()=>{
 const a=sample('x');assert.throws(()=>run([a,a]),/duplicate_case/);
});
test('manifest stable when cases, signals and mention order change',()=>{
 const a=sample('a'),b=sample('b');
 a.signals=[{id:'b',family:'x',version:'1',vote:'abstains'},
  {id:'a',family:'y',version:'1',vote:'supports_candidate'}];
 const a2={...a,mentions:[...a.mentions].reverse(),signals:[...a.signals].reverse()};
 assert.equal(manifestDigest136([a,b]),manifestDigest136([b,a2]));
 assert.deepEqual(run([a,b]).cases.map(x=>x.id),run([b,a2]).cases.map(x=>x.id));
});
test('changing any gold label breaks expected manifest',()=>{
 const a=signed(sample()),digest=manifestDigest136([a]);
 const changed={...a,goldVotes:gold('contradicted_by_passage')};
 assert.throws(()=>evaluateCorpus136({cases:[changed],expectedManifestDigest:digest}),/manifest_mismatch/);
});
test('changing source text breaks manifest and/or document integrity',()=>{
 const a=sample(),digest=manifestDigest136([a]);
 a.metadata={...a.metadata,categoryId:'new_category'};
 assert.throws(()=>evaluateCorpus136({cases:[a],expectedManifestDigest:digest}),/manifest_mismatch/);
});
test('unapproved reference digest cannot score results',()=>{
 const a=sample();assert.throws(()=>evaluateCorpus136({cases:[a],expectedManifestDigest:'0'.repeat(64)}),/manifest_mismatch/);
});
test('signals report coverage, overlaps, conflict and per-family votes',()=>{
 const a=sample('a'),b=sample('b');
 a.signals=[{id:'a',family:'regex',version:'1',vote:'supports_candidate'},
  {id:'b',family:'model',version:'1',vote:'opposes_candidate'}];
 b.signals=[{id:'c',family:'regex',version:'1',vote:'abstains'}];
 const s=run([a,b]).signals;assert.equal(s.signalCoverage,0.5);
 assert.equal(s.overlapCases,1);assert.equal(s.conflictCases,1);
 assert.equal(s.familyCounts.find(x=>x.family==='regex')?.cases,2);
});
test('slice breakdown uses only attested concordant original labels',()=>{
 const a=signed(sample('one')),b=signed(sample('two'));
 a.metadata={...a.metadata,phenomena:['pronoun','other']};
 b.metadata={...b.metadata,phenomena:['other'],categoryId:'air_cleaner'};
 const r=run([a,b]);assert.equal(r.byPhenomenon.pronoun.total,1);
 assert.equal(r.byPhenomenon.other.total,2);
 assert.equal(r.byCategory.robot_vacuum.total,1);assert.equal(r.byCategory.air_cleaner.total,1);
});
test('empty corpus returns null metrics, not invented zero percent precision',()=>{
 const r=run([]);assert.equal(r.holdout.coverage,null);
 assert.equal(r.holdout.textualSupportPrecisionAmongScreened,null);
});
test('bounded corpus limit protects review resources',()=>{
 assert.throws(()=>manifestDigest136(Array(501).fill(sample())),/unbounded_corpus/);
});
test('duplicate phenomena collapsed deterministically in case output',()=>{
 const c=sample();c.metadata={...c.metadata,phenomena:['other','other']};
 assert.deepEqual(screenCase136(c).phenomena,['other']);
});

test('conflicting families show both positive and negative sides',()=>{
 const c=sample('conflict_detail');c.signals=[{id:'s',family:'source',version:'1',vote:'supports_candidate'},
  {id:'o',family:'other',version:'1',vote:'opposes_candidate'}];
 const r=screenCase136(c);
 assert.deepEqual(r.signalConflictingFamilies,['other','source']);
});
test('paired baseline and new screen show a reduction in false accepts on an unresolved pronoun',()=>{
 const c=signed(refCase('paired'),'indeterminate_from_passage');
 const s=run([c]).holdout;
 assert.equal(s.baselineScreened,1);assert.equal(s.screened,0);
 assert.equal(s.baselineFalseAcceptCount,1);assert.equal(s.falseAcceptCount,0);
 assert.equal(s.baselineFalseAcceptRateAmongScreened,1);
 assert.equal(s.falseAcceptRateAmongScreened,null);
});
test('paired supported recall reports the cost of abstaining rather than claiming improvement',()=>{
 const c=signed(refCase('supported_reference'),'supported_by_passage');
 const s=run([c]).holdout;
 assert.equal(s.goldSupportedCases,1);
 assert.equal(s.baselineSupportedRecallAmongGoldSupported,1);
 assert.equal(s.supportedRecallAmongGoldSupported,0);
 assert.equal(s.falseRejectSupportedCount,0); // abstentions are counted separately from rejections
});
test('contradicted and indeterminate acceptances and per-source groups remain distinguishable',()=>{
 const c=signed(sample('contra'),'contradicted_by_passage');
 const d=signed(sample('indet'),'indeterminate_from_passage');
 const r=run([c,d]);
 assert.equal(r.holdout.acceptedContradictedCount,1);
 assert.equal(r.holdout.acceptedIndeterminateCount,1);
 assert.equal(Object.keys(r.bySourceGroup).length,2);
 assert.equal(r.bySourceGroup.publisher_contra.falseAcceptCount,1);
});
