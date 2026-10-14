import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readBidirectionalDocument149} from '../src/phase149_bidirectional_discourse_candidates.js';
import {evaluateDocumentReferences150,referenceManifest150,validateReferenceCorpus150,
 type ReferenceCase150,type SpanLabel150,type ReferenceTruth150} from '../src/phase150_document_reference_benchmark.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const locate=(text:string,fragment:string,occurrence=0):SpanLabel150=>{
 let start=-1,position=0;for(let n=0;n<=occurrence;n++){start=text.indexOf(fragment,position);if(start<0)throw Error('span_not_found');position=start+fragment.length;}
 return {start,end:start+fragment.length,literal:fragment};
};
function fixture(text:string,mention:string,truth:ReferenceTruth150,target?:string,opts:{
 id?:string;split?:ReferenceCase150['split'];origin?:ReferenceCase150['origin'];permission?:ReferenceCase150['permission'];
 host?:string;sourceGroupId?:string;productFamilyId?:string;categoryId?:string;
 reviewers?:number;aliases?:string[];phenomenon?:ReferenceCase150['annotations'][number]['phenomenon'];
 }={}):ReferenceCase150{
 const id=opts.id??'washing_1';const targetSpan=target?locate(text,target):undefined;
 const votes=Array.from({length:opts.reviewers??1},(_,i)=>({reviewerId:`reviewer${i}`,
  truth,...(targetSpan?{targetSpan}:{})}));
 return {id,split:opts.split??'development',origin:opts.origin??'constructed',permission:opts.permission??'unestablished',
 sourceGroupId:opts.sourceGroupId??'sourceA',productFamilyId:opts.productFamilyId??'productA',categoryId:opts.categoryId??'washing_machine',
 input:{document:{text,sha256:sha(text),source:{id,originalDocumentId:id,url:`https://${opts.host??'author.example'}/review`,title:'Developer constructed long sample',role:'original_product_test'}},
 ...(opts.aliases?{pageIdentity:{reviewedProductId:'unverified',reviewedVariantId:'unverified',reviewedAliases:opts.aliases}}:{})},
 annotations:[{id:'ann1',mention:locate(text,mention),votes,phenomenon:opts.phenomenon??'backward'}]};
}
const long='Aster X100 completed the first washing test. The cotton programme ran for 110 minutes. Its filter was checked at the end.\n\nThis model was also tested on synthetic clothing. The reviewer recorded a different level of moisture. No comparison with another product was made.';
const base=()=>fixture(long,'This model','same_textual_referent','Aster X100', {phenomenon:'cross_paragraph'});
test('long paragraph case is auditable, no canonical writes',()=>{
 const rep=evaluateDocumentReferences150([base()]);assert.equal(rep.phase,150);assert.equal(rep.canonicalWriteAuthorized,false);
 assert.equal(rep.rows.length,1);assert.equal(rep.rows[0].sourceAuthenticated,false);
 assert.equal(rep.holdoutAttested.withGold,0);assert.equal(rep.developmentDescriptive.withGold,1);
});
test('unseen text without label is not a negative result',()=>{
 const c=base();c.annotations[0].votes=[];const r=evaluateDocumentReferences150([c]);
 assert.equal(r.rows[0].gold,null);assert.equal(r.developmentDescriptive.withGold,0);
 assert.equal(r.noCandidateMeaning,'unseen_or_unlinked_reference_is_not_absence_of_product_evidence');
});
test('manifest independent of input case ordering',()=>{
 const a=base();const b=fixture('This player is stable. TEAC VRDS-701 includes a DAC.','This player','same_textual_referent','TEAC VRDS-701',
 {id:'cd_1',sourceGroupId:'srcB',productFamilyId:'cdA',categoryId:'cd_player',phenomenon:'forward'});
 assert.equal(referenceManifest150([a,b]),referenceManifest150([b,a]));
});
test('reference vote order does not change manifest',()=>{
 const x=base();x.annotations[0].votes=[{reviewerId:'a',truth:'same_textual_referent',targetSpan:locate(long,'Aster X100')},
 {reviewerId:'b',truth:'same_textual_referent',targetSpan:locate(long,'Aster X100')}];
 const y=structuredClone(x);y.annotations[0].votes=[...y.annotations[0].votes].reverse();
 assert.equal(referenceManifest150([x]),referenceManifest150([y]));
});
test('frozen manifest mismatch caught before comparison',()=>assert.throws(()=>evaluateDocumentReferences150([base()],'bad'),/frozen_manifest_mismatch/));
test('test fragment absent in source rejected',()=>{
 const x=base();x.annotations[0].mention.literal='Something else';assert.throws(()=>evaluateDocumentReferences150([x]),/invalid_annotation/);
});
test('off by one source offsets rejected',()=>{
 const x=base();x.annotations[0].mention.start++;assert.throws(()=>evaluateDocumentReferences150([x]),/invalid_annotation/);
});
test('model predicts no verified identity even with linked target',()=>{
 const rep=evaluateDocumentReferences150([fixture('This player sounded balanced. TEAC VRDS-701 includes a DAC.',
  'This player','same_textual_referent','TEAC VRDS-701',{phenomenon:'forward'})]);
 assert.equal(rep.rows[0].predicted,'proposed_unverified');assert.equal(rep.rows[0].correctTentativeLink,true);
 assert.equal(rep.rows[0].identityAuthenticated,false);
});
test('blocked competitor is not counted as linked',()=>{
 const text='This TV has a similar processor to the Sony BRAVIA 9 II. The display was tested at different levels.';
 const rep=evaluateDocumentReferences150([fixture(text,'This TV','different_referent',undefined,{phenomenon:'comparison'})]);
 assert.equal(rep.rows[0].predicted,'blocked_or_abstained');assert.equal(rep.rows[0].falseTentativeLink,false);
});
test('raw pronoun before product cannot be treated as safe forward link',()=>{
 const rep=evaluateDocumentReferences150([fixture('It was clearer. TEAC VRDS-701 has a DAC.', 'It',
 'unresolved_from_passage',undefined,{phenomenon:'forward'})]);
 assert.equal(rep.rows[0].predicted,'blocked_or_abstained');
});
test('direct named products do not fabricate reference',()=>{
 const rep=evaluateDocumentReferences150([fixture('TEAC VRDS-701 provides digital outputs.', 'TEAC VRDS-701',
 'same_textual_referent','TEAC VRDS-701')]);
 assert.equal(rep.rows[0].predicted,'not_detected');
});
test('copy of text into holdout is leakage',()=>{
 const dev=base();const hold=structuredClone(dev);hold.id='hold';hold.split='frozen_holdout';
 hold.sourceGroupId='different';hold.productFamilyId='different';hold.input.document.source.url='https://another-source.example/review';
 assert.throws(()=>validateReferenceCorpus150([dev,hold]),/duplicate_text_between_splits/);
});
test('source hostname reused under different source ids is leakage',()=>{
 const dev=base();const hold=fixture('It played. TEAC VRDS-701 sounded better.','It','unresolved_from_passage',undefined,
 {id:'held',split:'frozen_holdout',sourceGroupId:'other',productFamilyId:'other',host:'author.example'});
 assert.throws(()=>validateReferenceCorpus150([dev,hold]),/development_holdout_leakage/);
});
test('same product family across sources in dev and holdout rejected',()=>{
 const dev=base();const hold=fixture('It played. TEAC VRDS-701 sounded better.','It','unresolved_from_passage',undefined,
 {id:'held',split:'frozen_holdout',sourceGroupId:'other',productFamilyId:'productA',host:'another.example'});
 assert.throws(()=>validateReferenceCorpus150([dev,hold]),/development_holdout_leakage/);
});
test('same declared source group across hosts in dev and holdout rejected',()=>{
 const dev=base();const hold=fixture('It played. TEAC VRDS-701 sounded better.','It','unresolved_from_passage',undefined,
 {id:'held',split:'frozen_holdout',sourceGroupId:'sourceA',productFamilyId:'other',host:'another.example'});
 assert.throws(()=>validateReferenceCorpus150([dev,hold]),/development_holdout_leakage/);
});
test('unverified permission excludes holdout even with two unanimous votes',()=>{
 const c=fixture('This player sounded balanced. TEAC VRDS-701 includes a DAC.', 'This player',
  'same_textual_referent','TEAC VRDS-701',{id:'h',split:'frozen_holdout',origin:'original_professional',
   permission:'unestablished',reviewers:2});
 const r=evaluateDocumentReferences150([c]);assert.equal(r.holdoutAttested.withGold,0);
 assert.equal(r.rows[0].goldExclusion,'rights_not_established');
});
test('constructed holdout with two agreeing votes excluded',()=>{
 const c=fixture('This player sounded balanced. TEAC VRDS-701 includes a DAC.', 'This player',
 'same_textual_referent','TEAC VRDS-701',{id:'h',split:'frozen_holdout',origin:'constructed',permission:'evaluation_authorized',reviewers:2});
 const r=evaluateDocumentReferences150([c]);assert.equal(r.holdoutAttested.withGold,0);
 assert.equal(r.rows[0].goldExclusion,'constructed_not_original');
});
test('one reviewer on original document not enough for independent scoring',()=>{
 const c=fixture('This player sounded balanced. TEAC VRDS-701 includes a DAC.', 'This player',
 'same_textual_referent','TEAC VRDS-701',{id:'h',split:'frozen_holdout',origin:'original_professional',permission:'evaluation_authorized'});
 const r=evaluateDocumentReferences150([c]);assert.equal(r.holdoutAttested.withGold,0);
 assert.equal(r.rows[0].goldExclusion,'fewer_than_two_votes');
});
test('two purported independent agreeing original votes are tabulated but authentication remains false',()=>{
 const c=fixture('This player sounded balanced. TEAC VRDS-701 includes a DAC.', 'This player',
 'same_textual_referent','TEAC VRDS-701',{id:'h',split:'frozen_holdout',origin:'original_professional',permission:'evaluation_authorized',reviewers:2});
 const r=evaluateDocumentReferences150([c]);assert.equal(r.holdoutAttested.correctTentative,1);
 assert.equal(r.reviewerIndependenceVerified,false);assert.equal(r.scientificAccuracyAuthorized,false);
});
test('disagreeing reviewers never generate numeric accuracy',()=>{
 const c=fixture('This player sounded balanced. TEAC VRDS-701 includes a DAC.', 'This player',
 'same_textual_referent','TEAC VRDS-701',{id:'h',split:'frozen_holdout',origin:'original_professional',permission:'evaluation_authorized',reviewers:2});
 c.annotations[0].votes=[c.annotations[0].votes[0],{reviewerId:'reviewer1',truth:'different_referent'}];
 const r=evaluateDocumentReferences150([c]);assert.equal(r.holdoutAttested.withGold,0);
 assert.equal(r.rows[0].goldExclusion,'reviewer_label_disagreement');
});
test('different target between reviewers is excluded',()=>{
 const t='This player sounded balanced. TEAC VRDS-701 and Marantz CD6007 were compared.';
 const c=fixture(t,'This player','same_textual_referent','TEAC VRDS-701',
  {id:'h',split:'frozen_holdout',origin:'original_professional',permission:'evaluation_authorized',reviewers:2});
 c.annotations[0].votes=[c.annotations[0].votes[0],{reviewerId:'reviewer1',truth:'same_textual_referent',targetSpan:locate(t,'Marantz CD6007')}];
 const r=evaluateDocumentReferences150([c]);assert.equal(r.holdoutAttested.withGold,0);
 assert.equal(r.rows[0].goldExclusion,'reviewer_target_disagreement');
});
test('false candidate detected when gold says different referent',()=>{
 const r=evaluateDocumentReferences150([fixture('This player played well. TEAC VRDS-701 includes a DAC.',
 'This player','different_referent',undefined,{phenomenon:'forward'})]);
 assert.equal(r.developmentDescriptive.falseTentative,1);assert.equal(r.developmentDescriptive.correctTentative,0);
});
test('proposed link to wrong target is false even if gold says some other target',()=>{
 const t='This player sounded balanced. TEAC VRDS-701 includes a DAC. Marantz CD6007 was mentioned.';
 const r=evaluateDocumentReferences150([fixture(t,'This player','same_textual_referent','Marantz CD6007',{phenomenon:'forward'})]);
 assert.equal(r.developmentDescriptive.falseTentative,0); // baseline blocks multiple products
 assert.equal(r.developmentDescriptive.missedLink,1);
});
test('invalid source content hash blocked by unchanged Phase149 provenance gate',()=>{
 const c=base();c.input.document.sha256='e'.repeat(64);assert.throws(()=>evaluateDocumentReferences150([c]),/invalid_case/);
});
test('invalid target span blocked',()=>{
 const c=base();c.annotations[0].votes[0].targetSpan!.literal='not correct';
 assert.throws(()=>evaluateDocumentReferences150([c]),/invalid_annotation_vote/);
});
test('duplicate reviewer votes are not two independent reviewers',()=>{
 const c=base();c.annotations[0].votes=[c.annotations[0].votes[0],structuredClone(c.annotations[0].votes[0])];
 assert.throws(()=>evaluateDocumentReferences150([c]),/invalid_annotation_vote/);
});
test('no source URL with http or non-URL',()=>{
 const c=base();c.input.document.source.url='http://untrusted.example/a';assert.throws(()=>evaluateDocumentReferences150([c]),/invalid_source_url/);
});
test('zero denominator metrics explicitly null',()=>{
 const c=base();c.annotations=[];const r=evaluateDocumentReferences150([c]);
 assert.equal(r.developmentDescriptive.precisionAmongProposals,null);
 assert.equal(r.holdoutAttested.coverage,null);
});
