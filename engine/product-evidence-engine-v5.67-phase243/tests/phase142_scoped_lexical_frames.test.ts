import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readScopedLexicalFrames142} from '../src/phase142_scoped_lexical_frames.js';
import {readLexicalEnglish141} from '../src/phase141_local_lexical_resources.js';
import type {ReaderInput139} from '../src/phase139_unmarked_english_candidate_reader.js';
function input(text:string):ReaderInput139{return {document:{text,
 sha256:createHash('sha256').update(text).digest('hex'),source:{id:'scenario142',originalDocumentId:'doc142',
 url:'https://review.example.org/sample',title:'Developer-authored example',role:'original_product_test'}},
 pageIdentity:{reviewedProductId:'aster',reviewedVariantId:'x2',reviewedAliases:['Aster X2']}};}
const run=(s:string)=>readScopedLexicalFrames142(input(s));
const one=(s:string)=>{const r=run(s);assert.equal(r.frames.length,1,s);return r.frames[0];};
test('affirmative direct-object cue remains unverified hypothesis',()=>{
 const f=one('The Aster X2 utilizes a filter.');assert.equal(f.issue,'scope_preserved');
 assert.equal(f.status,'quarantined_surface_hypothesis');assert.equal(f.voice,'active_surface');});
test('target no filter cannot be interpreted as feature presence',()=>{
 const f=one('The Aster X2 utilizes no filter.');assert.equal(f.issue,'negated_target');
 assert.equal(f.status,'unsupported_scope');assert.equal(f.reasons.includes('negated_or_absent_complement_not_feature_presence'),true);});
test('without complement is explicitly unsafe',()=>assert.equal(one('The Aster X2 utilizes without a filter.').issue,'negated_target'));
test('negative predicate blocks affirmative use',()=>{
 const f=one('The Aster X2 does not utilize its camera.');assert.equal(f.issue,'negated_predicate');
 assert.equal(f.status,'unsupported_scope');});
test('contracted negative is not a positive outcome',()=>assert.equal(one("The Aster X2 doesn't utilize a camera.").issue,'negated_predicate'));
test('passive comparison is not reversed automatically',()=>{
 const f=one('The Aster X2 is outmatched by B4 Pro on carpet.');
 assert.equal(f.issue,'passive_voice');assert.equal(f.voice,'passive_surface');
 assert.equal(f.status,'unsupported_scope');});
test('past passive use does not assert ownership',()=>assert.equal(one('The Aster X2 was utilized in a test.').issue,'passive_voice'));
test('active comparison requires explicit direct comparison object',()=>{
 const f=one('The Aster X2 outmatches B4 Pro on carpets.');
 assert.equal(f.issue,'scope_preserved');assert.equal(f.status,'quarantined_surface_hypothesis');});
test('incidental named model does not count as a comparator',()=>{
 const f=one('The Aster X2 outmatches the competitors including B4 Pro.');
 assert.equal(f.issue,'comparator_not_direct_object');assert.equal(f.status,'unsupported_scope');});
test('unspecified comparison remains unresolved',()=>assert.equal(one('The Aster X2 outstrips the competition.').status,'unsupported_scope'));
test('conditional proposition is not measurement',()=>{
 const f=one('If the Aster X2 utilizes a filter, maintenance improves.');
 assert.equal(f.issue,'conditional_or_modal');assert.equal(f.status,'unsupported_scope');});
test('modal future does not become observation',()=>assert.equal(one('The Aster X2 will utilize a new tool.').issue,'conditional_or_modal'));
test('might never becomes proof',()=>assert.equal(one('The Aster X2 might utilize AI.').status,'unsupported_scope'));
test('quotation cannot automatically become reviewer finding',()=>{
 const f=one('The reviewer quoted “Aster X2 supplies perfect cleaning” without independent testing.');
 assert.equal(f.issue,'quoted_claim');assert.equal(f.status,'unsupported_scope');});
test('relative subordinate clause excluded from object span',()=>{
 const s='The Aster X2 utilizes a sensor, which the company advertises as accurate.';
 const f=one(s);assert.equal(s.slice(f.objectSpan!.start,f.objectSpan!.end),'a sensor');
 assert.equal(f.issue,'coordinated_predicate');});
test('two predicates do not form one giant object',()=>{
 const s='The Aster X2 supplies a dock and furnishes a brush.';const r=run(s);
 assert.equal(r.frames.length,2);assert.equal(s.slice(r.frames[0].objectSpan!.start,r.frames[0].objectSpan!.end),'a dock');
 assert.equal(r.frames[0].issue,'coordinated_predicate');
 assert.equal(r.frames[1].status,'unsupported_scope');});
test('coordination of two objects is preserved if no second verb',()=>{
 const s='The Aster X2 supplies a dock and a brush.';const f=one(s);
 assert.equal(s.slice(f.objectSpan!.start,f.objectSpan!.end),'a dock and a brush');});
test('ambiguous two named products is never resolved by position',()=>{
 const f=one('The Aster X2 and B4 Pro utilize different tools.');assert.equal(f.status,'ambiguous_subject');});
test('variant identity is not inherited from lexical role',()=>assert.equal(one('The Aster X3 supplies a filter.').status,'different_variant'));
test('unknown subject does not get reviewer product ID',()=>assert.equal(one('It utilizes a filter.').status,'unresolved_reference'));
test('possible VerbNet class is not a verified semantic role',()=>{
 const f=one('The Aster X2 utilizes a camera.');assert.equal(f.roleAssignmentsVerified,false);
 assert.ok(f.verbnetRolesPossible.some(x=>x.class==='use-105.1'));});
test('source receipts are digest-consistent',()=>{
 const s='🔬 The Aster X2 utilizes a filter.';const f=one(s);
 const digest=(text:string)=>createHash('sha256').update(text).digest('hex');
 assert.equal(f.spanReceipts.predicateSha256,digest(s.slice(f.predicateSpan.start,f.predicateSpan.end)));
 assert.equal(f.spanReceipts.objectSha256,digest(s.slice(f.objectSpan!.start,f.objectSpan!.end)));
 assert.equal(f.spanReceipts.subjectSha256,digest(s.slice(f.subjectSpan!.start,f.subjectSpan!.end)));});
test('source SHA mismatch fails through 139 validation',()=>{
 const i=input('The Aster X2 supplies a dock.');i.document.text+=' unauthorized';
 assert.throws(()=>readScopedLexicalFrames142(i),/invalid_document_or_bounds_139/);});
test('cap and incompleteness preserved',()=>{
 const r=readScopedLexicalFrames142(input('The Aster X2 supplies a dock. The Aster X2 utilizes a camera.'),1);
 assert.equal(r.frames.length,1);assert.equal(r.coverageTruncated,true);});
test('never assigns evidence truth or canonical authorization',()=>{
 const r=run('The Aster X2 supplies a dock and outmatches B4 Pro.');
 assert.equal(r.accuracy,null);assert.equal(r.independentGoldCases,0);
 assert.equal(r.canonicalWriteAuthorized,false);assert.equal(r.rankingAuthorized,false);
 for(const f of r.frames){assert.equal(f.canonicalWriteAuthorized,false);assert.equal(f.scientificallyValidated,false);
 assert.equal(f.roleAssignmentsVerified,false);assert.equal(f.sourceVerified,false);}});
test('diagnostic count equals frames',()=>{
 const r=run('The Aster X2 utilizes no filter. The Aster X2 supplies a dock.');
 assert.equal(Object.values(r.issueCounts).reduce((a,b)=>a+b,0),r.frames.length);});
test('output is stable and does not rewrite Phase141',()=>{
 const s='The Aster X2 does not utilize a filter.';
 assert.deepEqual(run(s),run(s));assert.equal(readLexicalEnglish141(input(s)).lexicalProposals.length,1);});
test('invalid cap throws',()=>assert.throws(()=>readScopedLexicalFrames142(input('The Aster X2 utilizes a filter.'),0),/invalid_phase141_cap/));
test('contrast keeps the second clause separate from explicit negation',()=>{
 const s='The Aster X2 does not outmatch B4 Pro, but the Aster X2 supplies a dock.';
 const r=run(s);assert.equal(r.frames.length,2);
 assert.equal(r.frames[0].status,'unsupported_scope');
 assert.equal(r.frames[1].status,'quarantined_surface_hypothesis');
});
