import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readLexicalEnglish141,lexicalLookup141} from '../src/phase141_local_lexical_resources.js';
import type {ReaderInput139} from '../src/phase139_unmarked_english_candidate_reader.js';
function input(text:string,aliases=['Aster X2']):ReaderInput139{
 return {document:{text,sha256:createHash('sha256').update(text).digest('hex'),
  source:{id:'test141',originalDocumentId:'doc141',url:'https://expert.invalid/doc',title:'Constructed example',role:'original_product_test'}},
  pageIdentity:{reviewedProductId:'aster',reviewedVariantId:'x2',reviewedAliases:aliases}};
}
const run=(s:string)=>readLexicalEnglish141(input(s));
function first(s:string){const r=run(s);assert.equal(r.lexicalProposals.length,1);return r.lexicalProposals[0];}
test('WordNet sense supports UK English inflection as unvalidated cue',()=>{
 const p=first('The Aster X2 utilises a heated dock.');assert.equal(p.lexicalLemma,'utilise');assert.equal(p.wordnetSynset,'01161188-v');assert.equal(p.status,'quarantined_surface_hypothesis');
});
test('US English inflection selected',()=>assert.equal(first('The Aster X2 utilizes a filter.').lexicalLemma,'utilize'));
test('past tense inflection detected',()=>assert.equal(first('The Aster X2 utilized a filter.').lexicalLemma,'utilize'));
test('verb with -y inflection supported',()=>assert.equal(first('The Aster X2 supplies a tool.').lexicalLemma,'supply'));
test('verb with -sh inflection supported',()=>assert.equal(first('The Aster X2 furnishes a brush.').lexicalLemma,'furnish'));
test('separate meaning of feature as verb',()=>assert.equal(first('The Aster X2 features a filter.').lexicalLemma,'feature'));
test('comparative new verb requires different named model',()=>{
 const p=first('The Aster X2 outmatches B4 Pro on carpets.');assert.equal(p.structure,'comparison');
 assert.equal(p.status,'quarantined_surface_hypothesis');assert.ok(p.reasons.includes('relative_claim_not_absolute_product_performance'));
});
test('comparator to unspecified competition is unresolved',()=>assert.equal(first('The Aster X2 outstrips the competition.').status,'unsupported_scope'));
test('comparison with itself is unresolved',()=>assert.equal(first('The Aster X2 outmatches the Aster X2.').status,'unsupported_scope'));
test('positive assessment from grappling is not asserted',()=>{
 const p=first('The Aster X2 grapples with long hair.');assert.equal(p.structure,'limitation');assert.equal(p.status,'quarantined_negative_statement');
});
test('negated lexical cue never becomes positive feature evidence',()=>assert.equal(first('The Aster X2 does not utilize a filter.').status,'unsupported_scope'));
test('modal lexical claim stays uncertain',()=>assert.equal(first('The Aster X2 might utilize the sensor.').status,'unsupported_scope'));
test('manufacturer attribution is not independent testing',()=>assert.equal(first('The manufacturer claims the Aster X2 utilizes AI.').status,'attributed_claim'));
test('pronoun cannot borrow title/product identity',()=>assert.equal(first('It utilizes a heated dock.').status,'unresolved_reference'));
test('unverified variant cannot inherit evidence',()=>assert.equal(first('The Aster X3 utilizes a filter.').status,'different_variant'));
test('multiple explicit subject products remain ambiguous',()=>assert.equal(first('The Aster X2 and B4 Pro utilize heated docks.').status,'ambiguous_subject'));
test('no unsafe WordNet synonym expansion miss -> lack',()=>{
 const r=run('The Aster X2 misses dust on carpets.');assert.equal(r.lexicalProposals.length,0);
});
test('employ ambiguous across VerbNet use and hire classes, not promoted automatically',()=>{
 const q=lexicalLookup141('employ');assert.equal(q.wordnetReviewedCues.length,0);assert.ok(q.possibleVerbnetClasses.length>=2);
});
test('raw VADER valence only, not quality score',()=>{
 const q=lexicalLookup141('poor');assert.ok(q.rawVaderValence!==null&&q.rawVaderValence<0);
 assert.equal(q.scientificEvidence,false);assert.equal(q.rankingAuthorized,false);
});
test('missing VADER lemma yields null, not neutral or scientific rating',()=>assert.equal(lexicalLookup141('xyznonlexeme').rawVaderValence,null));
test('WordNet candidate has linked VerbNet class without parser-level role assignment',()=>{
 const q=lexicalLookup141('utilize');assert.equal(q.wordnetReviewedCues[0].synset,'01161188-v');
 assert.ok(q.possibleVerbnetClasses.some(x=>x.class==='use-105.1'));assert.equal(q.disambiguated,false);
});
test('uncalibrated valence cannot change whole result on reference text',()=>{
 const r=run('The Aster X2 is excellent.');assert.equal(r.lexicalProposals.length,0);assert.equal(r.accuracy,null);
});
test('cues remain distinct from older regex patterns',()=>{
 const r=run('The Aster X2 uses a filter.');assert.equal(r.baseline140Proposals,1);assert.equal(r.lexicalProposals.length,0);
});
test('limit marks incomplete extraction',()=>{
 const r=readLexicalEnglish141(input('The Aster X2 utilizes a dock. The Aster X2 supplies a brush.'),1);
 assert.equal(r.lexicalProposals.length,1);assert.equal(r.coverageTruncated,true);
 assert.ok(r.truncationReasons.includes('phase141_proposal_cap'));
});
test('tampered source hash rejected upstream',()=>{
 const i=input('The Aster X2 utilizes a dock.');i.document.text+=' tampered';
 assert.throws(()=>readLexicalEnglish141(i),/invalid_document_or_bounds_139/);
});
test('all proposals carry exact source spans with offsets',()=>{
 const text='🔬 The Aster X2 utilises a filter on carpets.';const p=first(text);
 assert.equal(text.slice(p.predicateSpan.start,p.predicateSpan.end),'utilises');
 assert.equal(text.slice(p.subjectSpan!.start,p.subjectSpan!.end),'Aster X2');
 assert.equal(text.slice(p.objectSpan!.start,p.objectSpan!.end),'a filter on carpets');
});
test('never authorizes ranking or canonical writes',()=>{
 const r=run('The Aster X2 utilizes a camera and outmatches B4 Pro.');
 assert.equal(r.rankingAuthorized,false);assert.equal(r.canonicalWriteAuthorized,false);
 for(const p of r.lexicalProposals){assert.equal(p.rankingAuthorized,false);assert.equal(p.canonicalWriteAuthorized,false);assert.equal(p.sourceVerified,false);assert.equal(p.ambiguousSense,true);}
});
test('stable output ordering',()=>{
 const s='The Aster X2 supplies a dock and furnishes a brush.';assert.deepEqual(run(s),run(s));
});
test('invalid cap rejected',()=>assert.throws(()=>readLexicalEnglish141(input('The Aster X2 utilizes AI.'),0),/invalid_phase141_cap/));
test('source data reports selected sense not general synonym equivalence',()=>{
 assert.deepEqual(lexicalLookup141('miss').wordnetReviewedCues,[]);
 assert.equal(lexicalLookup141('grapple').wordnetReviewedCues[0].kind,'limitation');
});

test('failed-to complement cannot become positive hypothesis',()=>assert.equal(first('The Aster X2 failed to utilize its sensor.').status,'unsupported_scope'));
