import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {screenRelationContext132,type Label132} from '../src/phase132_contextual_relation_guard.js';
import {inspectLocalCandidate132} from '../src/phase132_local_extractor_adapter.js';
import {trainRelations131,calibrateMargin131,parseMarked131,proposeRelation131,type RelationDocument131} from '../src/phase131_local_relation_learning.js';
const spans=(text:string,s:string,o:string)=>{
 const a=text.indexOf(s),b=text.indexOf(o);assert.ok(a>=0&&b>=0);
 return {text,subject:{start:a,end:a+s.length},object:{start:b,end:b+o.length}};
};
const check=(text:string,s:string,o:string,label:Label132)=>screenRelationContext132({...spans(text,s,o),label});
test('hard negation blocks affirmative measures in a complete clause',()=>{
 const d=check('No published result establishes that CADR measures gas removal.','CADR','gas removal','measures');
 assert.equal(d.allowHypothesis,false);assert.ok(d.reasons.includes('negation_of_positive_relation'));
});
test('same negation can support a negative HYPOTHESIS, never truth',()=>{
 const d=check('No published result establishes that CADR measures gas removal.','CADR','gas removal','not_evidence_of');
 assert.equal(d.allowHypothesis,true);
});
test('absence of negation blocks negative assertion predicted by a weak model',()=>{
 assert.ok(check('CADR measures particulate removal.','CADR','particulate removal','not_evidence_of').reasons.includes('negative_relation_without_local_cue'));
});
test('double negation and lexical ambiguities fail closed',()=>{
 assert.ok(check('It is not necessarily the case that CADR measures gas cleaning.','CADR','gas cleaning','not_evidence_of').reasons.includes('ambiguous_double_negation'));
});
test('clauses with opposing assertions are not merged',()=>{
 const t='The roller helps stain removal, but the heated dock does not prove sterile floors.';
 assert.equal(check(t,'roller','stain removal','contributes_to').allowHypothesis,true);
 assert.equal(check(t,'heated dock','sterile floors','not_evidence_of').allowHypothesis,true);
 assert.ok(check(t,'roller','sterile floors','contributes_to').reasons.includes('cross_clause_relation'));
});
test('unrelated negation in another clause should not poison the positive claim',()=>{
 assert.equal(check('No claim of sterilization was made; CADR measures particle delivery.','CADR','particle delivery','measures').allowHypothesis,true);
});
test('uncertainty is recorded, not rebranded as fact or full evidence',()=>{
 const d=check('Roller pressure might improve stain removal.','Roller pressure','stain removal','contributes_to');
 assert.equal(d.allowHypothesis,true);assert.deepEqual(d.qualifiers,['uncertain']);
});
test('unobserved counterfactual should not be a measured test condition',()=>{
 const d=check('If humidity is high, the airflow result applies only to this trial.','airflow result','humidity','conditioned_on');
 assert.equal(d.allowHypothesis,false);assert.ok(d.reasons.includes('conditional_context_requires_review'));
});
test('span mismatch and oversized contexts are rejected',()=>{
 assert.throws(()=>screenRelationContext132({text:'short',subject:{start:0,end:999},object:{start:1,end:2},label:'measures'}));
});
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const source=(text:string)=>({sourceId:'s-one',originalDocumentId:'doc-one',text,sha256:sha(text)});
const approved=[{modelId:'local-experiment',modelDigest:'a'.repeat(64),licenseReviewed:'Apache-2.0',localOnly:true as const}];
const candidate=(text:string)=>({modelId:'local-experiment',modelDigest:'a'.repeat(64),
 sourceId:'s-one',originalDocumentId:'doc-one',documentSha256:sha(text),
 subject:{start:text.indexOf('CADR'),end:text.indexOf('CADR')+4},
 object:{start:text.indexOf('particle removal'),end:text.indexOf('particle removal')+16},
 evidence:{start:0,end:text.length},predictedRelation:'measures' as Label132});
test('offline model candidate remains review-only even with exact spans and digest',()=>{
 const t='CADR measures particle removal.';const r=inspectLocalCandidate132(candidate(t),source(t),approved);
 assert.equal(r.status,'requires_human_review');assert.equal(r.knowledgeWriteAuthorized,false);assert.equal(r.rankingAuthorized,false);
});
test('offline model claims are rejected when source identity or digest is forged',()=>{
 const t='CADR measures particle removal.';
 assert.equal(inspectLocalCandidate132(candidate(t),{...source(t),originalDocumentId:'wrong'},approved).status,'rejected');
 assert.equal(inspectLocalCandidate132(candidate(t),{...source(t),text:t+'changed'},approved).status,'rejected');
});
test('offline inference cannot bypass missing license review or negative scope',()=>{
 const t='CADR does not measure particle removal.';
 assert.equal(inspectLocalCandidate132(candidate(t),source(t),[]).status,'rejected');
 const r=inspectLocalCandidate132(candidate(t),source(t),approved);assert.equal(r.status,'rejected');
});
test('out-of-evidence entity offsets are rejected',()=>{
 const t='CADR measures particle removal.';const x=candidate(t);x.evidence={start:5,end:t.length};
 assert.deepEqual(inspectLocalCandidate132(x,source(t),approved).reasons,['entity_not_in_evidence']);
});
test('existing phase131 proposal and anchoring now fail closed for negation',()=>{
 const records=[
 ['<S>CADR</S> measures <O>particle removal</O>.','measures'],
 ['<S>Score</S> quantifies <O>pickup</O>.','measures'],
 ['<S>Airflow</S> gauges <O>clean delivery</O>.','measures'],
 ['<S>Pressure</S> improves <O>pickup</O>.','contributes_to'],
 ['<S>Brush</S> boosts <O>stain removal</O>.','contributes_to'],
 ['<S>Rinse</S> affects <O>smears</O>.','contributes_to'],
 ['<S>Score</S> applies under <O>dry testing</O>.','conditioned_on'],
 ['<S>Pickup</S> was measured at <O>low power</O>.','conditioned_on'],
 ['<S>Battery</S> applies after <O>four cycles</O>.','conditioned_on'],
 ['<S>Heat</S> does not prove <O>sterilization</O>.','not_evidence_of'],
 ['<S>Water temperature</S> cannot establish <O>disinfection</O>.','not_evidence_of'],
 ['No data show <S>dock heat</S> guarantees <O>clean floors</O>.','not_evidence_of'],
 ['<S>Colour</S> and <O>pickup</O> appear on different pages.','unrelated'],
 ['<S>Battery</S> and <O>room size</O> are different topics.','unrelated'],
 ['<S>Screen</S> is listed alongside <O>dust</O>.','unrelated']
 ] as const;
 const model=trainRelations131(records.map(([r,l])=>parseMarked131(r,l)));
 const t='CADR does not measure particle removal.'; const d:RelationDocument131={text:t,sha256:sha(t),source:{id:'s-one',originalDocumentId:'doc-one',url:'https://example.org/test',title:'test',role:'original_expert_method'}};
 const proposal=proposeRelation131({document:d,subject:{start:0,end:4},object:{start:22,end:38},model,calibration:{...calibrateMargin131(model,records.slice(0,10).map(([r,l])=>parseMarked131(r,l)),0.5),margin:0}});
 // Exact model decision may vary, but ANY accepted candidate must respect its predicted label's scope.
 if(proposal)assert.equal(proposal.label,'not_evidence_of');
});
