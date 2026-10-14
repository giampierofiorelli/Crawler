import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {previewOriginalReviewMeasures167,type DeclaredSourceIdentity167}
 from '../src/phase167_source_variant_quantity_adapter.js';
import {advanceUserRequest164,newRequestSession164} from '../src/phase164_user_request_journey.js';
import type {ReaderInput139} from '../src/phase139_unmarked_english_candidate_reader.js';
import type {CategoryBrain128} from '../src/phase128_category_cognition_dialogue_bridge.js';
const sha=(t:string)=>createHash('sha256').update(t).digest('hex');
const brain:CategoryBrain128={categoryId:'coffee_machine',schemaVersion:1,
 aliases:['coffee machine','espresso machine'],sources:[],concepts:[],quality:[],distinctions:[]};
const question='Best coffee machine width under 35 cm, tank capacity at least 0.7 L and noise no more than 45 dBA';
const request=(q=question)=>advanceUserRequest164(newRequestSession164('phase167_session'),{
 turnId:'turn_1',question:q,language:'en',brains:[brain]});
const reader=(text:string,variant='variant_a'):ReaderInput139=>({document:{text,sha256:sha(text),
 source:{id:'source_a',originalDocumentId:'doc_a',url:'https://example.org/real-looking-but-synthetic',
 title:'Synthetic source',role:'original_product_test'}},pageIdentity:{reviewedProductId:'machine_a',
 reviewedVariantId:variant,reviewedAliases:['Aster coffee machine']}});
const binding=(r:ReaderInput139,overrides:Partial<DeclaredSourceIdentity167>={}):DeclaredSourceIdentity167=>({
 productId:'machine_a',variantId:'variant_a',sourceId:'source_a',originalDocumentId:'doc_a',
 documentSha256:r.document.sha256,reviewedAliases:['Aster coffee machine'],
 identityIndependentlyAuthenticated:false,sourceIndependentlyAuthenticated:false,...overrides});
const run=(text:string,q=question,overrides:Partial<DeclaredSourceIdentity167>={})=>{
 const r=reader(text);return previewOriginalReviewMeasures167({request:request(q),question:q,
 products:['machine_a'],sources:[{reader:r,binding:binding(r,overrides)}]});
};

test('exact local reviewed alias + observed width supports only quarantined numeric proposal',()=>{
 const x=run('The Aster coffee machine measured 31 cm in width.');
 assert.equal(x.candidateMeasures.length,1);
 const c=x.candidateMeasures[0];
 assert.equal(c.disposition,'candidate_pending_scientific_review');
 assert.deepEqual([c.metric,c.canonicalValue,c.canonicalUnit],['width',31,'cm']);
 assert.deepEqual([c.productId,c.variantId],['machine_a','variant_a']);
 assert.equal(c.quantitySpan.literal,'31 cm');
 assert.equal(c.quantitySpan.sha256,sha('31 cm'));
 assert.equal(x.potentialMatches[0].potentialNumericFit,true);
 assert.equal(x.unpromotedPhase166.screens[0].status,'insufficient_evidence');
 assert.equal(x.candidateMeasures[0].observations166Created,0);
 assert.equal(x.scientificApprovals,0);
 assert.equal(x.productRankingAuthorized,false);
});
test('depth is not confused with width',()=>{
 const x=run('The Aster coffee machine measured 40 cm in depth.');
 assert.equal(x.candidateMeasures[0].metric,'depth');
 assert.equal(x.potentialMatches.length,0);
});
test('two dimensions in one sentence stay separate when bounded to local clauses',()=>{
 const x=run('The Aster coffee machine measured 31 cm in width and 40 cm in depth.');
 assert.deepEqual(x.candidateMeasures.map(c=>c.metric),['width','depth']);
 assert.equal(x.potentialMatches.length,1);
});
test('quantity above a user limit is a potential failure, never an exclusion',()=>{
 const x=run('The Aster coffee machine measured 38 cm in width.');
 assert.equal(x.potentialMatches[0].potentialNumericFit,false);
 assert.equal(x.potentialMatches[0].eligibleForExclusion,false);
 assert.equal(x.unpromotedPhase166.productRankingAuthorized,false);
});
test('length conversion follows source mm -> user cm',()=>{
 const x=run('The Aster coffee machine measured 340 mm in width.');
 assert.equal(x.candidateMeasures[0].canonicalValue,34);
 assert.equal(x.potentialMatches[0].potentialNumericFit,true);
});
test('tank capacity conversion follows source mL -> user L',()=>{
 const x=run('The Aster coffee machine measured 750 mL tank capacity.');
 assert.equal(x.candidateMeasures[0].canonicalValue,0.75);
 assert.equal(x.candidateMeasures[0].metric,'capacity');
 assert.equal(x.potentialMatches[0].potentialNumericFit,true);
});
test('water used by machine is not inferred to be tank capacity',()=>{
 const x=run('The Aster coffee machine consumed 750 mL of water.');
 assert.equal(x.candidateMeasures[0].metric,null);
 assert.equal(x.potentialMatches.length,0);
});
test('noise requires A weighting and matching noise context',()=>{
 const x=run('The Aster coffee machine measured 43 dBA of noise.');
 assert.equal(x.candidateMeasures[0].metric,'noise');
 assert.equal(x.potentialMatches[0].potentialNumericFit,true);
 const y=run('The Aster coffee machine measured 43 dB of noise.');
 assert.equal(y.candidateMeasures[0].metric,null);
 assert.equal(y.potentialMatches.length,0);
});
test('ambiguous sound output context does not become an appliance noise result',()=>{
 const x=run('The Aster coffee machine measured 40 dBA.');
 assert.equal(x.candidateMeasures[0].metric,null);
});
test('manufacturer-claim role not promoted even with matched model',()=>{
 const x=run('The maker claims the Aster coffee machine is 32 cm wide.');
 assert.equal(x.candidateMeasures[0].disposition,'not_observed_candidate');
 assert.equal(x.potentialMatches.length,0);
});
test('missing local subject cannot inherit identity from page header',()=>{
 const x=run('It measured 31 cm in width.');
 assert.equal(x.candidateMeasures[0].disposition,'identity_unbound');
 assert.equal(x.potentialMatches.length,0);
});
test('other named product in same review is never silently linked',()=>{
 const x=run('The Bex coffee machine measured 31 cm in width.');
 assert.equal(x.candidateMeasures[0].disposition,'wrong_or_unreviewed_variant_surface');
 assert.equal(x.potentialMatches.length,0);
});
test('binding to unreviewed variant fails closed',()=>{
 const x=run('The Aster coffee machine measured 31 cm in width.',question,{variantId:'variant_b'});
 assert.equal(x.candidateMeasures[0].disposition,'source_scope_not_bound');
 assert.equal(x.potentialMatches.length,0);
});
test('source document mismatch fails binding closed',()=>{
 const x=run('The Aster coffee machine measured 31 cm in width.',question,{originalDocumentId:'doc_wrong'});
 assert.equal(x.candidateMeasures[0].disposition,'source_scope_not_bound');
});
test('invalid untrusted binding cannot assert authenticated source',()=>{
 const r=reader('The Aster coffee machine measured 31 cm in width.');
 const bad={...binding(r),sourceIndependentlyAuthenticated:true};
 assert.throws(()=>previewOriginalReviewMeasures167({request:request(),question,products:['machine_a'],
 sources:[{reader:r,binding:bad as DeclaredSourceIdentity167}]}),/invalid_phase167_declared_identity/);
});
test('original-source hash tampering is rejected by Phase139-145 validators',()=>{
 const r=reader('The Aster coffee machine measured 31 cm in width.');
 r.document.sha256=sha('tampered text');
 assert.throws(()=>previewOriginalReviewMeasures167({request:request(),question,products:['machine_a'],
 sources:[{reader:r,binding:binding(r)}]}));
});
test('question/request mismatch cannot borrow another intent',()=>{
 const r=reader('The Aster coffee machine measured 31 cm in width.');
 assert.throws(()=>previewOriginalReviewMeasures167({request:request('Best air fryer'),question,
 products:['machine_a'],sources:[{reader:r,binding:binding(r)}]}),/invalid_phase167_preview_request/);
});
test('duplicate document inputs fail rather than double-count evidence',()=>{
 const r=reader('The Aster coffee machine measured 31 cm in width.');
 assert.throws(()=>previewOriginalReviewMeasures167({request:request(),question,
 products:['machine_a'],sources:[{reader:r,binding:binding(r)},{reader:r,binding:binding(r)}]}),/duplicate_phase167_source_document/);
});
test('source references cannot bind to an invented product outside selected universe',()=>{
 const r=reader('The Aster coffee machine measured 31 cm in width.');
 assert.throws(()=>previewOriginalReviewMeasures167({request:request(),question,products:['another'],
 sources:[{reader:r,binding:binding(r)}]}),/binding_product_not_in_universe/);
});
test('no source is not negative proof of any product feature',()=>{
 const x=previewOriginalReviewMeasures167({request:request(),question,products:['machine_a'],sources:[]});
 assert.equal(x.candidateMeasures.length,0);
 assert.equal(x.unpromotedPhase166.screens[0].status,'insufficient_evidence');
 assert.equal(x.productRankingAuthorized,false);
});
test('unsupported dimension cannot manufacture verified metric',()=>{
 const x=run('The Aster coffee machine measured 120 watts.',question);
 assert.equal(x.potentialMatches.length,0);
});
test('source roles can look legitimate but original independent testing is not authenticated',()=>{
 const x=run('The Aster coffee machine measured 31 cm in width.');
 assert.ok(x.researchObligations.some(o=>o.includes('authenticate_original_document')));
 assert.ok(x.researchObligations.some(o=>o.includes('qualify_original_test_protocol')));
 assert.equal(x.unpromotedPhase166.independentReviewAuthenticated,false);
});
test('no evidence completeness is inferred from truncated source extraction',()=>{
 const r=reader('The Aster coffee machine measured 31 cm in width and 32 cm in depth.');
 const x=previewOriginalReviewMeasures167({request:request(),question,products:['machine_a'],
 sources:[{reader:{...r,maxMentions:1},binding:binding(r)}]});
 assert.equal(x.publicationAuthorized,false);
});

test('manufacturer-specification page may contain measured cue but is not original-test candidate',()=>{
 const r=reader('The Aster coffee machine measured 31 cm in width.');
 r.document.source.role='manufacturer_specification';
 const x=previewOriginalReviewMeasures167({request:request(),question,products:['machine_a'],
 sources:[{reader:r,binding:binding(r)}]});
 assert.equal(x.candidateMeasures[0].disposition,'source_scope_not_bound');
 assert.equal(x.potentialMatches.length,0);
});
test('duplicate source text under a different source identity cannot multiply candidate evidence',()=>{
 const r=reader('The Aster coffee machine measured 31 cm in width.');
 const fake=structuredClone(r);fake.document.source.id='another_source';
 assert.throws(()=>previewOriginalReviewMeasures167({request:request(),question,products:['machine_a'],
 sources:[{reader:r,binding:binding(r)},{reader:fake,binding:null}]}),/duplicate_phase167_source_document/);
});
