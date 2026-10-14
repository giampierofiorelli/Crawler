import {test} from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {screenCrossDomainSubjects143} from '../src/phase143_cross_domain_subject_guard.js';
const source=(text:string,aliases:string[]=['Maytag MVW7232HW'])=>({
 document:{text,sha256:createHash('sha256').update(text).digest('hex'),source:{id:'test_143',originalDocumentId:'doc_143',url:'https://example.org/test',title:'Research sample',role:'original_product_test' as const}},
 pageIdentity:{reviewedProductId:'maytag',reviewedVariantId:'mvw7232hw',reviewedAliases:aliases}
});
test('program name is a typography guess, not model identity',()=>{
 const r=screenCrossDomainSubjects143(source('The Heavy Duty cycle removed 79.8% of stains across the board.'));
 assert.equal(r.baselinePairCount,1);assert.equal(r.unverifiedSurfaceNames,1);
 assert.equal(r.identityScreens[0].surfaceSubject,'Heavy Duty');
 assert.equal(r.identityScreens[0].identityDisposition,'unverified_surface_name_abstain');
});
test('explicit caller alias is candidate only, not authenticated identity',()=>{
 const r=screenCrossDomainSubjects143(source('Maytag MVW7232HW removed 79.8% of stains across the board.'));
 assert.equal(r.pageAliasCandidates,1);
 assert.equal(r.identityScreens[0].identityDisposition,'page_alias_candidate_only');
 assert.equal(r.identityScreens[0].productIdentityVerified,false);
});
test('same numeric score must not authorize canonical writes',()=>{
 const r=screenCrossDomainSubjects143(source('The Heavy Duty cycle removed 79.8% of stains across the board.'));
 assert.equal(r.canonicalWriteAuthorized,false);assert.equal(r.rankingAuthorized,false);
 assert.ok(r.identityScreens.every(s=>!s.canonicalWriteAuthorized&&!s.rankingAuthorized));
});
test('works across categories without specific category dictionary',()=>{
 for(const name of ['Turbo Speed','Quiet Mode','High Performance']){
  const r=screenCrossDomainSubjects143(source(`The ${name} removed 79.8% of stains across the board.`,['Some Other Model']));
  assert.ok(r.identityScreens.every(s=>s.identityDisposition!=='page_alias_candidate_only'));
 }
});
test('no fabricated subject if there is no pair',()=>{
 const r=screenCrossDomainSubjects143(source('The washer was quiet during testing.'));
 assert.equal(r.baselinePairCount,0);assert.deepEqual(r.identityScreens,[]);
});
test('digest tampering is inherited from Phase139',()=>{
 const i=source('Maytag MVW7232HW removed 79.8% of stains across the board.');
 i.document.sha256='0'.repeat(64);assert.throws(()=>screenCrossDomainSubjects143(i));
});
test('input order not used for any category-specific inference',()=>{
 const t='The Heavy Duty cycle removed 79.8% of stains across the board.';
 const a=screenCrossDomainSubjects143(source(t,['Maytag MVW7232HW','Maytag X9']));
 const b=screenCrossDomainSubjects143(source(t,['Maytag X9','Maytag MVW7232HW']));
 assert.deepEqual(a,b);
});
