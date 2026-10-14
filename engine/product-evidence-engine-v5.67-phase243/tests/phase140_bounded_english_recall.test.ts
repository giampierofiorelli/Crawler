import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readBoundedEnglishRecall140} from '../src/phase140_bounded_english_recall.js';
import type {ReaderInput139} from '../src/phase139_unmarked_english_candidate_reader.js';
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
function args(text:string,aliases=['Aster X2']):ReaderInput139{return {
 document:{text,sha256:digest(text),source:{id:'src140',originalDocumentId:'doc140',url:'https://expert.example/aster-x2',title:'Artificial technical test',role:'original_product_test'}},
 pageIdentity:{reviewedProductId:'aster',reviewedVariantId:'x2',reviewedAliases:aliases}};}
const run=(t:string,aliases=['Aster X2'])=>readBoundedEnglishRecall140(args(t,aliases));
function offsets(t:string,d:ReturnType<typeof run>){for(const p of d.proposals){
 assert.ok(t.slice(p.evidenceSpan.start,p.evidenceSpan.end).includes(t.slice(p.predicateSpan.start,p.predicateSpan.end)));
 if(p.subjectSpan)assert.ok(t.slice(p.evidenceSpan.start,p.evidenceSpan.end).includes(t.slice(p.subjectSpan.start,p.subjectSpan.end)));
 if(p.objectSpan)assert.ok(t.slice(p.evidenceSpan.start,p.evidenceSpan.end).includes(t.slice(p.objectSpan.start,p.objectSpan.end)));
 for(const s of p.conditionSpans)assert.ok(t.slice(p.objectSpan!.start,p.objectSpan!.end).includes(t.slice(s.start,s.end)));
 }}
test('new limitation predicate is recalled when Phase139 has no pairs',()=>{const t='The Aster X2 struggles with pet hair on carpets.';const d=run(t);
 assert.equal(d.baseline139Pairs,0);assert.equal(d.proposals.length,1);
 assert.equal(d.proposals[0].status,'quarantined_negative_statement');assert.equal(d.proposals[0].structure,'limitation');offsets(t,d);
});
test('descriptive copula is an explicitly negative judgement only',()=>{
 const d=run('The Aster X2 is poor at lifting hair on carpeted surfaces.');
 assert.equal(d.proposals[0].status,'quarantined_negative_statement');
 assert.ok(d.proposals[0].conditionSpans.length>0);
});
test('additional negative verb inflection is captured',()=>assert.equal(run('The Aster X2 failed to detect shoes.').proposals[0].structure,'limitation'));
test('feature presence candidates are not scientific facts',()=>{
 const d=run('The Aster X2 uses a heated dock.');
 assert.equal(d.baseline139Pairs,0);assert.equal(d.proposals[0].status,'quarantined_surface_hypothesis');
 assert.equal(d.proposals[0].scientificallyValidated,false);
});
test('has-equipment construction is recognized',()=>assert.equal(run('The Aster X2 is equipped with a camera.').proposals[0].structure,'feature_presence'));
test('comes-with construction is recognized',()=>assert.equal(run('The Aster X2 comes with a filter.').proposals[0].structure,'feature_presence'));
test('lack of feature is not scientific proof of absence',()=>{
 const p=run('The Aster X2 lacks an obstacle camera.').proposals[0];
 assert.equal(p.structure,'feature_absence');assert.equal(p.status,'quarantined_negative_statement');
});
test('positive assessment does not authorize ranking',()=>{
 const p=run('The Aster X2 is good at collecting dust.').proposals[0];
 assert.equal(p.structure,'positive_assessment');assert.equal(p.rankingAuthorized,false);
});
test('outperforms is a relative claim with comparator marker',()=>{
 const p=run('The Aster X2 outperforms B4 Pro on carpets.').proposals[0];
 assert.equal(p.structure,'comparison');assert.ok(p.reasons.includes('other_model_mentioned_in_target_no_absolute_inference'));
});
test('capitalized app name in object is not assumed to be a second robot',()=>{
 const p=run('The Roomba Max 775 Combo uses the Roomba Home app.',['Roomba Max 775 Combo']).proposals[0];
 assert.ok(p.reasons.includes('named_app_or_component_is_not_a_verified_product'));
 assert.ok(!p.reasons.includes('other_model_mentioned_in_target_no_absolute_inference'));
});
test('two preceding products are ambiguous',()=>assert.equal(
 run('The Aster X2 and B4 Pro struggle with long hair.').proposals[0].status,'ambiguous_subject'));
test('pronoun does not borrow page identity',()=>{
 const p=run('It struggles with pet hair.').proposals[0];assert.equal(p.subjectMentionId,null);
 assert.equal(p.status,'unresolved_reference');
});
test('generic product noun does not borrow page identity',()=>assert.equal(
 run('The robot itself uses cameras.').proposals[0].status,'unresolved_reference'));
test('model variant change blocks a false identity match',()=>assert.equal(
 run('The Aster X3 uses a camera.').proposals[0].status,'different_variant'));
test('manufacturer claim remains attributed',()=>assert.equal(
 run('The manufacturer claims the Aster X2 uses advanced AI.').proposals[0].status,'attributed_claim'));
test('evidence absence is not a negative product test result',()=>assert.equal(
 run('There is no evidence that the Aster X2 uses heated water.').proposals[0].status,'unsupported_scope'));
test('hedged claim is not accepted as observed',()=>assert.equal(
 run('The Aster X2 may use a camera.').proposals[0].status,'unsupported_scope'));
test('negated limitation is not flipped into success',()=>assert.equal(
 run('The Aster X2 does not struggle with pet hair.').proposals[0].status,'unsupported_scope'));
test('negative object requires manual scope check',()=>assert.equal(
 run('The Aster X2 uses no water.').proposals[0].status,'unsupported_scope'));
test('subject is scoped separately after semicolon',()=>{
 const d=run('The Aster X2 uses a camera; the B4 Pro lacks one.');
 assert.equal(d.proposals.length,2);assert.equal(d.proposals[0].status,'quarantined_surface_hypothesis');
 assert.equal(d.proposals[1].status,'quarantined_negative_statement');
});
test('different sentence pronoun still unresolved',()=>{
 const d=run('The Aster X2 uses a camera. It lacks a filter.');
 assert.equal(d.proposals.length,2);assert.equal(d.proposals[1].status,'unresolved_reference');
});
test('uncovered vocabulary is not misreported as complete parsing',()=>{
 const d=run('The Aster X2 provides good results.');assert.equal(d.proposals.length,0);
 assert.equal(d.unscannedSentenceCount,1);assert.equal(d.estimatedRecall,null);
});
test('offsets remain correct after UTF-16 surrogate pairs',()=>{
 const t='🔬 The Aster X2 struggles with dust on rugs.';offsets(t,run(t));
});
test('candidate cap marks incomplete traversal without guessing other relations',()=>{
 const d=readBoundedEnglishRecall140(args('The Aster X2 uses a camera. The Aster X2 lacks a camera.'),1);
 assert.equal(d.proposals.length,1);assert.equal(d.coverageTruncated,true);
 assert.ok(d.truncationReasons.includes('phase140_proposal_limit'));
});
test('invalid cap rejects request',()=>assert.throws(()=>readBoundedEnglishRecall140(args('The Aster X2 uses AI.'),0),/invalid_phase140_cap/));
test('tampered digest rejected by 139 before a proposal',()=>{
 const a=args('The Aster X2 uses AI.');a.document.text+=' altered';
 assert.throws(()=>readBoundedEnglishRecall140(a),/invalid_document_or_bounds_139/);
});
test('id and output stable across repeated runs',()=>{
 const t='The Aster X2 uses a camera and struggles with hair on carpets.';
 assert.deepEqual(run(t),run(t));
});
test('all resulting hypotheses forbid canonical writes and ranking',()=>{
 const d=run('The Aster X2 is poor at picking up hair. The Aster X2 uses LIDAR.');
 assert.equal(d.canonicalWriteAuthorized,false);assert.equal(d.rankingAuthorized,false);
 assert.ok(d.proposals.every(p=>!p.canonicalWriteAuthorized&&!p.rankingAuthorized&&!p.scientificallyValidated));
});
