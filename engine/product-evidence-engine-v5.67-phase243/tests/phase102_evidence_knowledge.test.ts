import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {InterpretationMemory101,type SourcePointer,type StoredClaim} from '../src/phase101_interpretation_memory.js';
import {reasonOverEvidenceFrame102} from '../src/phase102_evidence_knowledge.js';
const base={categoryId:'vacuum',criterionId:'noise',frameId:'hard_floor_normal_mode'};
const source=(originalTestId:string):SourcePointer=>({sourceUrl:'https://independent.example.org/reviews/noise',
 originalTestId,sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),
 sourceLocator:'#method',methodologyReference:'independently documented sound measurement',
 assessmentReference:'independent human analytical review ticket',assessorId:'analyst_1',
 assessedAt:'2026-10-11T00:00:00Z',originalTestLineageReviewed:true,
 exactVariantReviewed:true,contextReviewed:true});
const setup=()=>{const db=new InterpretationMemory101();for(const id of ['a','b','c','d'])
 db.registerProduct({categoryId:'vacuum',variantId:id,displayName:'Vacuum '+id});return db;};
const pair=(id:string,first:string,second:string,relation:'better'|'worse'|'roughly_equal'='better',testId='lab_1'):StoredClaim=>
 ({...base,id,variantId:first,kind:'pairwise',comparedVariantId:second,relation,
 comparisonBasis:'same_original_test',source:source(testId)});
const run=(db:InterpretationMemory101,input=base)=>reasonOverEvidenceFrame102(db.snapshotReviewedFrame(input));
const compare=(r:ReturnType<typeof reasonOverEvidenceFrame102>,a:string,b:string)=>
 r.comparisons.find(x=>x.firstVariantId===a&&x.secondVariantId===b)!;

test('independent comparison from reviewed memory without article or LLM',()=>{
 const db=setup();db.recordApprovedClaim(pair('clm_1','a','b'));
 const r=run(db);assert.equal(compare(r,'a','b').status,'supported_better');
 assert.equal(r.llmCalls,0);assert.equal(r.sourceTextRequired,false);
 assert.equal(r.publicationReady,false);assert.equal(r.rankingEligible,false);db.close();
});
test('retains all products and makes no unjustified cross-component ordering',()=>{
 const db=setup();db.recordApprovedClaim(pair('clm_1','a','b'));
 db.recordApprovedClaim(pair('clm_2','c','d','better','lab_2'));
 const r=run(db);assert.equal(r.products.length,4);
 assert.equal(compare(r,'a','c').status,'not_directly_comparable');
 assert.equal(compare(r,'b','d').status,'not_directly_comparable');db.close();
});
test('transitive ordering is not silently inferred from different reviewer tests',()=>{
 const db=setup();db.recordApprovedClaim(pair('clm_1','a','b'));
 db.recordApprovedClaim(pair('clm_2','b','c','better','lab_2'));
 assert.equal(compare(run(db),'a','c').status,'not_directly_comparable');db.close();
});
test('syndicated and duplicated reports of same original test count only once',()=>{
 const db=setup();db.recordApprovedClaim(pair('clm_1','a','b'));
 db.recordApprovedClaim(pair('clm_2','a','b'));
 const p=compare(run(db),'a','b');assert.deepEqual(p.supportOriginalTestIds,['lab_1']);
 assert.deepEqual(p.sourceClaimIds,['clm_1','clm_2']);db.close();
});
test('contradictory independent tests block claim of superiority',()=>{
 const db=setup();db.recordApprovedClaim(pair('clm_1','a','b'));
 db.recordApprovedClaim(pair('clm_2','b','a','better','lab_2'));
 const p=compare(run(db),'a','b');assert.equal(p.status,'contested');
 assert.deepEqual(p.supportOriginalTestIds,['lab_1']);assert.deepEqual(p.opposeOriginalTestIds,['lab_2']);db.close();
});
test('contradictory claims within same underlying test cannot be voted away',()=>{
 const db=setup();db.recordApprovedClaim(pair('clm_1','a','b'));
 db.recordApprovedClaim(pair('clm_2','b','a'));
 assert.equal(compare(run(db),'a','b').status,'contested');db.close();
});
test('ties cannot be collapsed with directional advantages',()=>{
 const db=setup();db.recordApprovedClaim(pair('clm_1','a','b','roughly_equal'));
 assert.equal(compare(run(db),'a','b').status,'reported_equivalent');
 db.recordApprovedClaim(pair('clm_2','a','b','better','lab_2'));
 assert.equal(compare(run(db),'a','b').status,'contested');db.close();
});
test('persisted database can be queried again without source files',()=>{
 const dir=mkdtempSync(join(tmpdir(),'phase102-'));
 const file=join(dir,'store.db');
 try{let db=new InterpretationMemory101(file);for(const id of ['a','b'])db.registerProduct({categoryId:'vacuum',variantId:id,displayName:'Vacuum '+id});
 db.recordApprovedClaim(pair('clm_1','a','b'));const before=run(db);db.close();
 db=new InterpretationMemory101(file);const after=run(db);assert.deepEqual(after,before);db.close();}
 finally{rmSync(dir,{recursive:true,force:true});}
});
test('withdrawing a claim leaves revision audit marker but not active preference',()=>{
 const db=setup();db.recordApprovedClaim(pair('clm_1','a','b'));
 const before=run(db);db.withdrawClaim('clm_1','documented correction reference','2026-10-11T11:00:00Z');
 const after=run(db);assert.notEqual(before.revisionSha256,after.revisionSha256);
 assert.deepEqual(after.withdrawnClaimIds,['clm_1']);
 assert.equal(compare(after,'a','b').status,'not_directly_comparable');db.close();
});
test('checksum detects silent in-memory snapshot changes',()=>{
 const db=setup();db.recordApprovedClaim(pair('clm_1','a','b'));
 const snapshot=db.snapshotReviewedFrame(base);snapshot.claims[0].variantId='c';
 assert.throws(()=>reasonOverEvidenceFrame102(snapshot),/integrity_failure/);db.close();
});
test('category and testing context are isolated',()=>{
 const db=setup();db.recordApprovedClaim(pair('clm_1','a','b'));
 assert.equal(run(db,{...base,frameId:'carpet_turbo_mode'}).comparisons.every(x=>x.status==='not_directly_comparable'),true);
 assert.equal(run(db,{...base,criterionId:'comfort'}).comparisons.every(x=>x.status==='not_directly_comparable'),true);db.close();
});
test('already calibrated levels retain scale meaning, ordinary adjectives do not become scores',()=>{
 const db=setup();db.recordApprovedClaim({...base,id:'clm_1',variantId:'a',kind:'descriptor',
 descriptor:'somewhat_noisy',qualifier:'reviewer_relative',source:source('lab_1')});
 db.recordApprovedClaim({...base,id:'clm_2',variantId:'a',kind:'calibrated_level',levelId:'noise_mid',
 scaleReference:'external category scale qualification reference',source:source('lab_2')});
 const r=run(db);assert.equal(r.descriptors.find(x=>x.variantId==='a')!.terms[0],'somewhat_noisy');
 assert.equal(r.calibratedLevels.find(x=>x.variantId==='a')!.levelId,'noise_mid');
 assert.equal(r.calibratedLevels.find(x=>x.variantId==='b')!.status,'no_calibrated_level');db.close();
});
test('conflicting levels across tests are unresolved, never averaged',()=>{
 const db=setup();for(const [id,level,testId] of [['clm_1','noise_low','lab_1'],['clm_2','noise_high','lab_2']])
 db.recordApprovedClaim({...base,id,variantId:'a',kind:'calibrated_level',levelId:level,
 scaleReference:'external category scale qualification reference',source:source(testId)});
 const r=run(db);assert.equal(r.calibratedLevels.find(x=>x.variantId==='a')!.status,'disputed_level');db.close();
});
test('reviewed ordinal ranges cannot be silently collapsed to a point',()=>{
 const db=setup();db.recordApprovedClaim({...base,id:'clm_1',variantId:'a',kind:'calibrated_level',levelId:'noise_mid',
 plausibleLevelIds:['noise_low','noise_high'],scaleReference:'external category scale qualification reference',source:source('lab_1')});
 assert.equal(run(db).calibratedLevels.find(x=>x.variantId==='a')!.status,'interval_level');db.close();
});
test('raw measurements are described with exact unit and protocol, not scores',()=>{
 const db=setup();db.recordApprovedClaim({...base,id:'clm_1',variantId:'a',kind:'measurement',
 value:68,unit:'db_a_sound_power',metricId:'noise_emission',protocolId:'dry_vacuum_hard_floor',source:source('lab_1')});
 const m=run(db).rawMeasurements;assert.equal(m.length,1);assert.equal(m[0].unit,'db_a_sound_power');
 assert.equal(compare(run(db),'a','b').status,'not_directly_comparable');db.close();
});
test('the source text never leaks into memory via extraneous fields',()=>{
 const db=setup();const c={...pair('clm_1','a','b'),articleText:'Lorem ipsum repeated review body'};
 assert.throws(()=>db.recordApprovedClaim(c),/unexpected_raw_or_unreviewed_payload/);db.close();
});
