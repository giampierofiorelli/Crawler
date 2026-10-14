import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {InterpretationMemory101,type StoredClaim,type SourcePointer} from '../src/phase101_interpretation_memory.js';
const H='a'.repeat(64),I='b'.repeat(64);
const source=(testId='lab_a'):SourcePointer=>({sourceUrl:'https://reviews.example.org/vacuum/test',
  originalTestId:testId,sourceRevisionSha256:H,sourceSpanSha256:I,sourceLocator:'#noise',
  methodologyReference:'original controlled home noise testing method',
  assessmentReference:'documented independent mapping audit 2026',
  assessorId:'reviewer_abc',assessedAt:'2026-10-10T10:00:00Z',
  originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
const base={categoryId:'vacuum',criterionId:'noise',frameId:'hard_floor_normal_mode'};
const reg=(db:InterpretationMemory101)=>{
 for(const v of ['a','b','c','d'])db.registerProduct({categoryId:'vacuum',variantId:v,displayName:'Vacuum '+v});
};
const pair=(id:string,variantId:string,comparedVariantId:string,rel:'better'|'worse'|'roughly_equal'='better'):StoredClaim=>({id,...base,variantId,comparedVariantId,kind:'pairwise',relation:rel,comparisonBasis:'same_original_test',source:source()});
const descriptor=(id:string,variantId:string,text:'somewhat_noisy'|'very_quiet'='somewhat_noisy'):StoredClaim=>({id,...base,variantId,kind:'descriptor',descriptor:text,qualifier:'reviewer_relative',source:source()});
const measure=(id:string,variantId:string,value:number,unit:'db_a_sound_power'|'db_a_sound_pressure'='db_a_sound_power',protocolId='iec_normal'):StoredClaim=>({id,...base,variantId,kind:'measurement',value,unit,protocolId,metricId:'airborne_noise',uncertainty:1,source:source()});
const query={...base,minimumMeaningfulMeasuredDifference:2,thresholdReviewReference:'reviewed category practical noise difference threshold'};
test('reuse of stored relative expertise ranks many products without page text or model calls',()=>{
 const dir=mkdtempSync(join(tmpdir(),'pee-101-')); const file=join(dir,'evidence.db');
 try{
  let db=new InterpretationMemory101(file);reg(db);
  db.recordApprovedClaim(descriptor('claim_1','a'));
  db.recordApprovedClaim(pair('claim_2','a','b'));
  db.recordApprovedClaim(pair('claim_3','b','c'));
  const r=db.findLessNoisy(base);
  assert.deepEqual(r.tiers.map(t=>t.variantIds),[['a'],['b'],['c']]);
  assert.equal(r.sourceTextRequired,false);assert.equal(r.llmCalls,0);
  assert.equal(r.rankingEligible,false);assert.equal(r.publicationReady,false);
  assert.equal(r.cases.find(c=>c.variantId==='a')?.descriptors[0],'somewhat_noisy');
  assert.deepEqual(r.unassessedVariantIds,['d']);
  assert.equal(r.edgeEvidence.length,2);
  db.close();db=new InterpretationMemory101(file);
  assert.deepEqual(db.findLessNoisy(base).tiers,r.tiers);
  db.close();
  assert.equal(readFileSync(file).includes(Buffer.from('The reviewer says')) ,false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('standalone phrases do not become a cardinal noise score or exclusion',()=>{
 const db=new InterpretationMemory101();reg(db);db.recordApprovedClaim(descriptor('claim_1','a','somewhat_noisy'));
 const r=db.findLessNoisy(base);
 assert.deepEqual(r.tiers,[]);assert.equal(r.cases.find(c=>c.variantId==='a')?.status,'qualitatively_described');
 assert.equal(r.cases.length,4);db.close();
});
test('numeric noise comparisons require same metric/protocol plus reviewed threshold and uncertainty',()=>{
 const db=new InterpretationMemory101();reg(db);db.recordApprovedClaim(measure('claim_1','a',65));db.recordApprovedClaim(measure('claim_2','b',75));
 assert.deepEqual(db.findLessNoisy(base).tiers,[]);
 const r=db.findLessNoisy(query);assert.deepEqual(r.tiers.map(x=>x.variantIds),[['a'],['b']]);db.close();
});
test('non comparable sound pressure and sound power are not combined',()=>{
 const db=new InterpretationMemory101();reg(db);db.recordApprovedClaim(measure('claim_1','a',65));db.recordApprovedClaim(measure('claim_2','b',75,'db_a_sound_pressure'));
 const r=db.findLessNoisy(query);assert.deepEqual(r.tiers,[]);assert.ok(r.blockedComparisons.some(x=>x.includes('multiple_incompatible_numeric_protocols')));db.close();
});
test('even identical unit but different protocols is not enough',()=>{
 const db=new InterpretationMemory101();reg(db);db.recordApprovedClaim(measure('claim_1','a',65));db.recordApprovedClaim(measure('claim_2','b',75,'db_a_sound_power','other_test'));
 assert.deepEqual(db.findLessNoisy(query).tiers,[]);db.close();
});
test('overlapping bounds cannot be converted into observed superiority',()=>{
 const db=new InterpretationMemory101();reg(db);db.recordApprovedClaim(measure('claim_1','a',68));db.recordApprovedClaim(measure('claim_2','b',69));
 assert.deepEqual(db.findLessNoisy(query).tiers,[]);db.close();
});
test('unreported measurement uncertainty prevents ranking instead of zero-filled assumptions',()=>{
 const db=new InterpretationMemory101();reg(db);const a=measure('claim_1','a',61);delete (a as {uncertainty?:number}).uncertainty;
 db.recordApprovedClaim(a);db.recordApprovedClaim(measure('claim_2','b',75));
 assert.deepEqual(db.findLessNoisy(query).tiers,[]);db.close();
});
test('contradictory pairs do not silently resolve into an average',()=>{
 const db=new InterpretationMemory101();reg(db);db.recordApprovedClaim(pair('claim_1','a','b'));db.recordApprovedClaim(pair('claim_2','b','a'));
 const r=db.findLessNoisy(base);assert.deepEqual(r.tiers,[]);assert.deepEqual(r.uncertainVariantIds,['a','b']);db.close();
});
test('per-source and per-context frames stay separate',()=>{
 const db=new InterpretationMemory101();reg(db);db.recordApprovedClaim(pair('claim_1','a','b'));
 const r=db.findLessNoisy({...base,frameId:'carpet_turbo_mode'});assert.deepEqual(r.tiers,[]);db.close();
});
test('independently calibrated bridges require a calibration reference',()=>{
 const db=new InterpretationMemory101();reg(db);
 const c={...pair('claim_1','a','b'),comparisonBasis:'independently_calibrated_bridge' as const};
 assert.throws(()=>db.recordApprovedClaim(c),/unsupported_relative_comparison/);db.close();
});
test('retiring a stored interpretation preserves audit history but removes ranking assertion',()=>{
 const db=new InterpretationMemory101();reg(db);db.recordApprovedClaim(pair('claim_1','a','b'));
 db.withdrawClaim('claim_1','second analyst invalidated this finding','2026-10-11T12:00:00Z');
 assert.deepEqual(db.findLessNoisy(base).tiers,[]);assert.throws(()=>db.withdrawClaim('claim_1','second analyst invalidated this finding','2026-10-11T12:00:00Z'),/already_withdrawn/);db.close();
});
test('immutable review id cannot silently change its meaning',()=>{
 const db=new InterpretationMemory101();reg(db);db.recordApprovedClaim(pair('claim_1','a','b'));db.recordApprovedClaim(pair('claim_1','a','b'));
 assert.throws(()=>db.recordApprovedClaim(pair('claim_1','b','a')),/immutable_interpretation_conflict/);db.close();
});
test('reject raw source body and unsolicited scored sentiment',()=>{
 const db=new InterpretationMemory101();reg(db);
 const c={...descriptor('claim_1','a'),rawReviewText:'The reviewer says this is loud.'};
 assert.throws(()=>db.recordApprovedClaim(c),/unexpected_raw_or_unreviewed_payload/);
 const c2={...descriptor('claim_2','a'),sentimentScore:0.77};
 assert.throws(()=>db.recordApprovedClaim(c2),/unexpected_raw_or_unreviewed_payload/);db.close();
});
test('reject unsupported variant identity and missing independent review receipts',()=>{
 const db=new InterpretationMemory101();reg(db);
 assert.throws(()=>db.recordApprovedClaim(pair('claim_1','a','z')),/unregistered_or_mismatched_variant/);
 assert.throws(()=>db.recordApprovedClaim({...pair('claim_2','a','b'),source:{...source(),assessmentReference:'none'}}),/invalid_reviewed_interpretation/);db.close();
});
test('different categories never share products or assessed contexts',()=>{
 const db=new InterpretationMemory101();reg(db);db.registerProduct({categoryId:'headphone',variantId:'a',displayName:'Headphone A'});
 db.recordApprovedClaim(pair('claim_1','a','b'));
 assert.equal(db.findLessNoisy({...base,categoryId:'headphone'}).cases.length,1);
 assert.equal(db.findLessNoisy({...base,categoryId:'headphone'}).tiers.length,0);db.close();
});
test('calibrated qualitative interpretation can be reused by existing Phase98 ranking without re-reading review',()=>{
 const db=new InterpretationMemory101();reg(db);
 db.recordApprovedClaim({id:'claim_11',...base,variantId:'a',kind:'calibrated_level',
    levelId:'moderate_noise',plausibleLevelIds:['low_noise','high_noise'],
    scaleReference:'independently calibrated noise value scale version 2',source:source()});
 const r=db.getCalibratedPerformance({...base,scaleReference:'independently calibrated noise value scale version 2'});
 assert.equal(r.performance[0].levelId,'moderate_noise');
 assert.equal(r.performance[0].originalTestId,'lab_a');
 assert.equal(r.performance[0].evidenceOrigin,'original_professional_qualitative_test');
 assert.equal(r.performance[0].sourceUrl,'https://reviews.example.org/vacuum/test');
 assert.deepEqual(db.getCalibratedPerformance({...base,scaleReference:'another reviewed scale applied elsewhere'}).performance,[]);
 db.close();
});
test('competing calibrated performance records are kept unresolved and can be withdrawn',()=>{
 const db=new InterpretationMemory101();reg(db);
 const item=(id:string,levelId:string)=>({id,...base,variantId:'a',kind:'calibrated_level' as const,
   levelId,scaleReference:'independently calibrated noise value scale version 2',source:source()});
 db.recordApprovedClaim(item('claim_11','moderate_noise'));db.recordApprovedClaim(item('claim_12','high_noise'));
 const q={...base,scaleReference:'independently calibrated noise value scale version 2'};
 assert.deepEqual(db.getCalibratedPerformance(q).performance,[]);
 assert.deepEqual(db.getCalibratedPerformance(q).unresolvedVariantIds,['a']);
 db.withdrawClaim('claim_12','adjudicator rejected this duplicate claim','2026-10-11T10:00:00Z');
 assert.equal(db.getCalibratedPerformance(q).performance.length,1);db.close();
});
test('relative-tie and strict preference disagreement suspends comparison',()=>{
 const db=new InterpretationMemory101();reg(db);
 db.recordApprovedClaim(pair('claim_1','a','b'));
 db.recordApprovedClaim(pair('claim_2','a','b','roughly_equal'));
 const r=db.findLessNoisy(base);
 assert.deepEqual(r.tiers,[]);assert.deepEqual(r.uncertainVariantIds,['a','b']);db.close();
});
test('calibrated level assignment never follows automatically from an adjective',()=>{
 const db=new InterpretationMemory101();reg(db);
 db.recordApprovedClaim(descriptor('claim_1','a','somewhat_noisy'));
 const q={...base,scaleReference:'independently calibrated noise value scale version 2'};
 assert.deepEqual(db.getCalibratedPerformance(q).performance,[]);db.close();
});
test('numeric practical-difference thresholds require a documented independent review',()=>{
 const db=new InterpretationMemory101();reg(db);
 assert.throws(()=>db.findLessNoisy({...base,minimumMeaningfulMeasuredDifference:3}),/invalid_context_or_unreviewed_threshold/);
 assert.throws(()=>db.findLessNoisy({...base,thresholdReviewReference:'floating audit without measurement threshold'}),/orphaned_threshold_review_reference/);
 db.close();
});
