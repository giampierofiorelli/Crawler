import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {auditSourceInventory137,makeBlindPacket137,blindCorpusDigest137,
 adjudicateBlindVotes137,inspectCrossSplitNearDuplicates137,evaluateBlindAnnotatedCorpus137,
 type BlindVote137,type SourceCandidate137} from '../src/phase137_original_source_annotation.js';
import type {BenchmarkCase136} from '../src/phase136_independent_signal_benchmark.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const span=(t:string,lit:string,idx=0)=>{let i=-1,pos=0;for(let n=0;n<=idx;n++){i=t.indexOf(lit,pos);assert.ok(i>=0);pos=i+lit.length;}return {start:i,end:i+lit.length};};
function fixture(id='casea',split:'development'|'frozen_holdout'='frozen_holdout',
 text='Aster X2 was examined. Aster X2 improved soil removal in the trial.'):BenchmarkCase136 {
 const d={text,sha256:sha(text),source:{id:'source_'+id,originalDocumentId:'original_'+id,
  url:`https://publisher-${id}.test/review`,title:'FAKE fixture: not an original review',role:'original_product_test' as const}};
 const sub=span(text,'Aster X2',1),obj=span(text,'soil removal');
 const evid={start:text.indexOf('.')+2,end:text.length};
 return {id,split,document:d,metadata:{sourceGroupId:'group_'+id,productFamilyId:'family_'+id,
  categoryId:'vacuum',origin:'constructed',permission:'not_established',phenomena:['other']},
  mentions:[{id:'s1',kind:'explicit_name',entityType:'product',span:span(text,'Aster X2'),entityId:'aster',variantId:'x2'},
   {id:'s2',kind:'explicit_name',entityType:'product',span:sub,entityId:'aster',variantId:'x2'},
   {id:'o',kind:'explicit_name',entityType:'outcome',span:obj,entityId:'soil'}],
  proposal:{subject:'Aster X2',object:'soil removal',label:'contributes_to',subjectSpan:sub,
   objectSpan:obj,evidenceSpan:evid,sourceId:d.source.id,originalDocumentId:d.source.originalDocumentId,
   sourceContentSha256:d.sha256,evidenceSha256:sha(text.slice(evid.start)),margin:2,
   rankingAuthorized:false,status:'hypothesis_requires_scientific_review'},
  subjectMentionId:'s2',objectMentionId:'o',signals:[{id:'extract1',family:'rules',version:'1',vote:'supports_candidate'}]};
}
const votes=(p:ReturnType<typeof makeBlindPacket137>,support='supported_by_passage' as const,
 reference='same_entity' as const):BlindVote137[]=>[
 {packetId:p.id,packetDigest:p.blindPacketDigest,annotatorId:'reviewer_a',textSupport:support,reference},
 {packetId:p.id,packetDigest:p.blindPacketDigest,annotatorId:'reviewer_b',textSupport:support,reference}];
const source=(id='a'):SourceCandidate137=>({id,url:`https://${id}.publisher.test/review`,
 publisherHost:`${id}.publisher.test`,publisherGroupId:'publisher'+id,categoryId:'vacuums',
 productFamilyId:'family'+id,reviewedProduct:'Aster X2',
 originalSourceStatus:'not_yet_verified',rightsStatus:'not_established',
 snapshotStatus:'not_collected',stage:'url_discovered_only'});

test('discovered sources are never mistaken for original review snapshots or licensed content',()=>{
 const a=auditSourceInventory137([source('a'),source('b')]);
 assert.equal(a.sourceCount,2);assert.equal(a.originalSnapshots,0);
 assert.equal(a.rightsVerified,0);assert.equal(a.releaseEligible,false);
 assert.equal(a.independentlyAnnotatedCases,0);
});
test('inventory rejects duplicate IDs, urls, forged hosts, insecure protocols, auth user info',()=>{
 assert.throws(()=>auditSourceInventory137([source(),source()]),/duplicate/);
 assert.throws(()=>auditSourceInventory137([{...source(),publisherHost:'wrong.test'}]),/invalid_source/);
 assert.throws(()=>auditSourceInventory137([{...source(),url:'http://a.publisher.test/review'}]),/invalid_source/);
 assert.throws(()=>auditSourceInventory137([{...source(),url:'https://bob:secret@a.publisher.test/review'}]),/invalid_source/);
});
test('inventory is insensitive to order and cannot accept a claimed license',()=>{
 const a=auditSourceInventory137([source('b'),source('a')]);
 const b=auditSourceInventory137([source('a'),source('b')]);
 assert.deepEqual(a,b);
 assert.throws(()=>auditSourceInventory137([{...source(),rightsStatus:'evaluation_authorized' as never}]),/invalid_source/);
});
test('blind packet contains exact spans, source text and candidate label, not model outputs or votes',()=>{
 const p=makeBlindPacket137(fixture());
 assert.equal(p.subject.literal,'Aster X2');assert.equal(p.object.literal,'soil removal');
 assert.equal(p.sourceSha256,sha(p.documentText));
 assert.equal(p.rankingAuthorized,false);
 const serialized=JSON.stringify(p);
 for(const term of ['margin','signals','phase134Baseline','phase135Status','goldVotes','modelScore'])
  assert.equal(serialized.includes(term),false,term);
});
test('blind packet fails on tampered source text or offsets',()=>{
 const c=fixture();c.document={...c.document,text:c.document.text+'!'};
 assert.throws(()=>makeBlindPacket137(c),/invalid_blind/);
 const b=fixture();b.proposal={...b.proposal,subjectSpan:{start:0,end:3}};
 assert.throws(()=>makeBlindPacket137(b),/unanchored/);
});
test('blind corpus digest order-invariant, protects span, identity and document bytes',()=>{
 const a=fixture('a','development');const b=fixture('b','frozen_holdout',
  'Aster X2 was examined. Aster X2 improved soil removal after eight trial passes.');
 assert.equal(blindCorpusDigest137([a,b]),blindCorpusDigest137([b,a]));
 b.document={...b.document,text:b.document.text+' '};
 assert.throws(()=>blindCorpusDigest137([a,b]),/invalid_blind/);
});
test('blind consensus needs separate annotator IDs and agreement in both claim and identity',()=>{
 const p=makeBlindPacket137(fixture()),v=votes(p);
 const a=adjudicateBlindVotes137(p,v);assert.equal(a.status,'consensus');
 assert.equal(a.reference,'same_entity');assert.equal(a.gold,'supported_by_passage');
 assert.equal(a.independenceExternallyVerified,false);
 const different=[v[0],{...v[1],reference:'different_entity' as const}];
 assert.equal(adjudicateBlindVotes137(p,different).status,'disagreement_needs_external_adjudication');
 const opposite=[v[0],{...v[1],textSupport:'contradicted_by_passage' as const}];
 assert.equal(adjudicateBlindVotes137(p,opposite).status,'disagreement_needs_external_adjudication');
});
test('duplicate annotator, wrong packet, wrong digest, invalid label and fake extra votes rejected',()=>{
 const p=makeBlindPacket137(fixture()),v=votes(p);
 assert.throws(()=>adjudicateBlindVotes137(p,[v[0],v[0]]),/duplicate/);
 assert.throws(()=>adjudicateBlindVotes137(p,[{...v[0],packetDigest:'bad'}]),/invalid_or_duplicate/);
 assert.throws(()=>adjudicateBlindVotes137(p,[{...v[0],packetId:'bad'}]),/invalid_or_duplicate/);
 assert.throws(()=>adjudicateBlindVotes137(p,[{...v[0],reference:'maybe' as never}]),/invalid_or_duplicate/);
 assert.equal(adjudicateBlindVotes137(p,[v[0]]).status,'insufficient_votes');
});
test('substring/whitespace-normalized near-duplicate cannot move into holdout',()=>{
 const a=fixture('training','development');
 const b=fixture('testing','frozen_holdout',
  'Aster X2 was examined. Aster X2  improved soil removal in the trial.');
 const flags=inspectCrossSplitNearDuplicates137([a,b]);
 assert.equal(flags.length,1);assert.equal(flags[0].reason,'normalized_duplicate');
});
test('distinct vocabulary across splits is allowed by near-duplicate detector',()=>{
 const a=fixture('training','development');
 const b=fixture('testing','frozen_holdout',
  'Aster X2 was examined. Aster X2 improved soil removal after many trials on a carefully prepared surface.');
 assert.equal(inspectCrossSplitNearDuplicates137([a,b]).length,0);
});
test('cross-split leakage quarantines evaluation before any use of gold',()=>{
 const a=fixture('training','development'),b=fixture('testing','frozen_holdout',
  'Aster X2 was examined. Aster X2  improved soil removal in the trial.');
 const cs=[a,b];
 assert.throws(()=>evaluateBlindAnnotatedCorpus137({cases:cs,votes:{},expectedBlindCorpusDigest:blindCorpusDigest137(cs)}),/near_duplicate/);
});
test('constructed examples never become real holdout metrics despite unanimous blind votes',()=>{
 const c=fixture();const p=makeBlindPacket137(c);
 const r=evaluateBlindAnnotatedCorpus137({cases:[c],votes:{[c.id]:votes(p)},
  expectedBlindCorpusDigest:blindCorpusDigest137([c])});
 assert.equal(r.consensusCases,1);assert.equal(r.fullyScorableOriginalHoldoutCases,0);
 assert.equal(r.phase136.holdout.total,0);assert.equal(r.phase136.holdout.textualSupportPrecisionAmongScreened,null);
 assert.equal(r.scientificAccuracyClaimAuthorized,false);
});
test('case with unresolved antecedent cannot be promoted even with two agreeing votes',()=>{
 const c=fixture(),p=makeBlindPacket137(c);
 const v=votes(p).map(x=>({...x,reference:'unresolved' as const}));
 const r=evaluateBlindAnnotatedCorpus137({cases:[c],votes:{[c.id]:v},expectedBlindCorpusDigest:blindCorpusDigest137([c])});
 assert.equal(r.consensusCases,1);assert.equal(r.fullyScorableOriginalHoldoutCases,0);
});
test('synthetic fixture masquerading as original and authorized is scored only descriptively with warnings',()=>{
 const c=fixture();c.metadata={...c.metadata,origin:'original_professional',permission:'evaluation_authorized'};
 const p=makeBlindPacket137(c),r=evaluateBlindAnnotatedCorpus137({cases:[c],votes:{[c.id]:votes(p)},
  expectedBlindCorpusDigest:blindCorpusDigest137([c])});
 assert.equal(r.fullyScorableOriginalHoldoutCases,1);
 assert.equal(r.rightsAuthenticated,false);assert.equal(r.annotatorIndependenceVerified,false);
 assert.equal(r.scientificAccuracyClaimAuthorized,false);
 assert.ok(r.warnings.some(w=>w.includes('ATTESTATIONS')));
});
test('claimed gold is forbidden before blind annotation; changes after seal rejected',()=>{
 const c=fixture(),p=makeBlindPacket137(c),digest=blindCorpusDigest137([c]);
 c.goldVotes=[{annotatorId:'a',label:'supported_by_passage'}];
 assert.throws(()=>evaluateBlindAnnotatedCorpus137({cases:[c],votes:{[c.id]:votes(p)},expectedBlindCorpusDigest:digest}),/gold_already_visible/);
 c.goldVotes=[];
 c.document={...c.document,url:'bad'} as never;
 assert.throws(()=>evaluateBlindAnnotatedCorpus137({cases:[c],votes:{},expectedBlindCorpusDigest:'a'.repeat(64)}),/unfrozen/);
});
test('unknown vote case and disagreement cannot be silently accepted',()=>{
 const c=fixture(),p=makeBlindPacket137(c),v=votes(p);
 assert.throws(()=>evaluateBlindAnnotatedCorpus137({cases:[c],votes:{other:v},
  expectedBlindCorpusDigest:blindCorpusDigest137([c])}),/unknown/);
 const x=evaluateBlindAnnotatedCorpus137({cases:[c],votes:{[c.id]:[v[0],{...v[1],reference:'different_entity'}]},
  expectedBlindCorpusDigest:blindCorpusDigest137([c])});
 assert.equal(x.disagreementCases,1);assert.equal(x.fullyScorableOriginalHoldoutCases,0);
});
test('source-hostname leakage from Phase136 is still enforced in combined pipeline',()=>{
 const a=fixture('training','development');
 const b=fixture('testing','frozen_holdout',
  'Aster X2 was examined. Aster X2 improved soil removal after many trials on a carefully prepared surface.');
 b.document={...b.document,source:{...b.document.source,url:a.document.source.url}};
 assert.throws(()=>evaluateBlindAnnotatedCorpus137({cases:[a,b],votes:{},
  expectedBlindCorpusDigest:blindCorpusDigest137([a,b])}),/source_hostname_leakage/);
});
test('presentational ordering of human votes cannot affect adjudication',()=>{
 const c=fixture(),p=makeBlindPacket137(c),v=votes(p);
 assert.deepEqual(adjudicateBlindVotes137(p,v),adjudicateBlindVotes137(p,[...v].reverse()));
});
test('unlicensed original documents cannot be inserted into blind annotation',()=>{
 const c=fixture();c.metadata={...c.metadata,origin:'original_professional'};
 assert.throws(()=>makeBlindPacket137(c),/invalid_blind_source/);
});
test('blind vote intake verifies packet integrity before reading labels',()=>{
 const p=makeBlindPacket137(fixture()),v=votes(p);const altered={...p,relationLabel:'unrelated_relation'};
 assert.throws(()=>adjudicateBlindVotes137(altered,v),/modified_blind_packet/);
});

test('blind packet refuses a candidate whose cited text digest or source identity is wrong',()=>{
 const c=fixture();c.proposal={...c.proposal,evidenceSha256:'0'.repeat(64)};
 assert.throws(()=>makeBlindPacket137(c),/invalid_blind_source/);
 const d=fixture();d.proposal={...d.proposal,sourceId:'foreign_source'};
 assert.throws(()=>makeBlindPacket137(d),/invalid_blind_source/);
});
