import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectStairEvidence118,validateStairEvidence118,type StairEvidence118,type VerifiedNeed118} from '../src/phase118_real_stair_capability_audit.js';
import {ORIGINAL_STAIR_CASE_118} from '../src/phase118_stair_reviewed_source_case.js';
const e=ORIGINAL_STAIR_CASE_118;
const q=(capabilities:VerifiedNeed118['capabilities'],extra:Partial<VerifiedNeed118>={}):VerifiedNeed118=>({verification:'externally_verified_semantic_intent',capabilities,...extra});
const inspect=(caps:VerifiedNeed118['capabilities'],extra:Partial<VerifiedNeed118>={})=>inspectStairEvidence118(e,q(caps,extra));
const get=(r:ReturnType<typeof inspectStairEvidence118>,id:string)=>r.allProducts.find(x=>x.productId===id)!;
test('reviewed original URLs are well formed and observations have source provenance',()=>assert.doesNotThrow(()=>validateStairEvidence118(e)));
test('a verified stair-ascent intention has four booth-demonstrated candidates, not a commercial ranking',()=>{
 const r=inspect(['multiple_stair_ascent'],{requireExhibitionDemonstration:true});
 assert.deepEqual(r.matched.map(x=>x.productId),['dreame-cyber-x','eufy-marswalker','mova-zeus-60','roborock-saros-rover']);
 assert.equal(r.performanceRanking,null);
 assert.equal(r.householdReliabilityValidated,false);
});
test('when stair tread vacuuming is requested, only Rover has independently witnessed demonstration',()=>{
 const r=inspect(['multiple_stair_ascent','vacuum_stair_treads'],{requireExhibitionDemonstration:true});
 assert.deepEqual(r.matched.map(x=>x.productId),['roborock-saros-rover']);
 assert.equal(get(r,'roborock-saros-rover').caps.vacuum_stair_treads.status,'demonstrated_at_exhibition');
});
test('MarsWalker explicitly does not clean the stair treads',()=>{
 const r=inspect(['vacuum_stair_treads']);
 assert.equal(get(r,'eufy-marswalker').caps.vacuum_stair_treads.status,'explicitly_not_supported');
 assert.equal(get(r,'eufy-marswalker').qualifies,false);
});
test('Dreame and MOVA exhibit transport but no verified tread-vacuuming',()=>{
 const r=inspect(['vacuum_stair_treads']);
 for(const name of ['dreame-cyber-x','mova-zeus-60'])assert.equal(get(r,name).caps.vacuum_stair_treads.status,'not_verified');
});
test('MIGO manufacturer marketing is not independently demonstrated',()=>{
 const r=inspect(['multiple_stair_ascent','vacuum_stair_treads']);
 assert.equal(get(r,'migo-ascender').qualifies,true);
 assert.equal(get(r,'migo-ascender').caps.vacuum_stair_treads.status,'declared_by_manufacturer');
 assert.equal(get(inspect(['vacuum_stair_treads'],{requireExhibitionDemonstration:true}),'migo-ascender').qualifies,false);
});
test('MIGO refunded campaign cannot be treated as available retail product',()=>{
 const r=inspect(['retail_sale']);
 assert.equal(get(r,'migo-ascender').caps.retail_sale.status,'explicitly_not_supported');
});
test('retail only plus real staircase yields no VERIFIED current match',()=>{
 const r=inspect(['multiple_stair_ascent'],{requireRetail:true,requireExhibitionDemonstration:true});
 assert.equal(r.matched.length,0);
 assert.equal(r.marketExhaustivenessNotEstablished,true);
});
test('Saros 20 actual retail listing does not imply full stairs',()=>{
 const r=inspect(['multiple_stair_ascent'],{requireRetail:true});
 const s=get(r,'roborock-saros-20');
 assert.equal(s.caps.retail_sale.status,'documented_retail');
 assert.equal(s.caps.multiple_stair_ascent.status,'not_verified');
 assert.equal(s.qualifies,false);
});
test('8.8cm is two-part geometry, not a single 8.8cm step',()=>{
 const r=inspect(['two_part_threshold','single_threshold']);
 const s=get(r,'roborock-saros-20');
 assert.equal(s.caps.two_part_threshold.geometry[0]!.totalCm,8.8);
 assert.equal(s.caps.single_threshold.geometry[0]!.maxSingleCm,4.5);
});
test('known two-part maximum has bounds, not independent field result',()=>{
 const r=inspect(['two_part_threshold']);
 const g=get(r,'roborock-saros-20').caps.two_part_threshold.geometry[0]!;
 assert.deepEqual([g.firstCm,g.secondCm,g.interstepGapMinCm,g.interstepGapMaxCm],[4.5,4.3,12,14]);
 assert.equal(get(r,'roborock-saros-20').caps.two_part_threshold.status,'declared_by_manufacturer');
});
test('demo source does not make domestic reliability valid',()=>assert.equal(inspect(['multiple_stair_ascent']).householdReliabilityValidated,false));
test('no original quantified stair tread cleaning exists in these sources',()=>assert.equal(inspect(['quantified_tread_cleaning']).matched.length,0));
test('no independent in-home autonomous transfer is established',()=>assert.equal(inspect(['autonomous_in_home_floor_transfer']).matched.length,0));
test('stair descent is separately proven for Rover, Eufy, Dreame but not MOVA from this source set',()=>{
 const r=inspect(['multiple_stair_descent'],{requireExhibitionDemonstration:true});
 assert.deepEqual(r.matched.map(x=>x.productId),['dreame-cyber-x','eufy-marswalker','roborock-saros-rover']);
});
test('even asking only for threshold does not confer staircase capability',()=>{
 const r=inspect(['two_part_threshold'],{requireRetail:true});
 assert.deepEqual(r.matched.map(x=>x.productId),['dreame-x50-ultra','mova-z60-ultra','roborock-saros-20']);
 for(const x of r.matched)assert.equal(x.caps.multiple_stair_ascent.status,'not_verified');
});
test('source fingerprint is unchanged by query lens',()=>{
 const r1=inspect(['multiple_stair_ascent']);const r2=inspect(['vacuum_stair_treads'],{requireRetail:true});
 assert.equal(r1.sourceFingerprint,r2.sourceFingerprint);
});
test('source fingerprint and output invariant to input ordering',()=>{
 const a=inspect(['multiple_stair_ascent','vacuum_stair_treads']);
 const rev={...e,sources:[...e.sources].reverse(),products:[...e.products].reverse(),observations:[...e.observations].reverse()};
 const b=inspectStairEvidence118(rev,q(['vacuum_stair_treads','multiple_stair_ascent']));
 assert.deepEqual(a,b);
});
test('duplicated observations do not make a product stronger',()=>{
 const dup={...e,observations:[...e.observations,...e.observations]};
 const r=inspectStairEvidence118(dup,q(['multiple_stair_ascent']));
 assert.deepEqual(r.matched.map(x=>x.productId),inspect(['multiple_stair_ascent']).matched.map(x=>x.productId));
 assert.equal(r.performanceRanking,null);
});
test('cannot impersonate independent review with manufacturer source',()=>{
 const forged={...e,observations:[...e.observations,{...e.observations[0],sourceId:'eufy-2026-08-11'}]};
 assert.throws(()=>validateStairEvidence118(forged),/false_independent_observation/);
});
test('publisher interview prediction cannot masquerade as manufacturer source',()=>{
 const forged={...e,observations:[...e.observations,{...e.observations[0],disposition:'manufacturer_claim_yes' as const}]};
 assert.throws(()=>validateStairEvidence118(forged),/false_manufacturer_attribution/);
});
test('a source citing an unavailable robot does not support retail sale',()=>{
 const forged={...e,observations:[...e.observations,{...e.observations[0],capability:'retail_sale' as const,disposition:'original_seller_yes' as const}]};
 assert.throws(()=>validateStairEvidence118(forged),/false_sale_claim/);
});
test('cannot relabel combined threshold as single threshold',()=>{
 const o=e.observations.find(x=>x.productId==='roborock-saros-20'&&x.capability==='two_part_threshold')!;
 const forged={...e,observations:[...e.observations,{...o,capability:'single_threshold' as const}]};
 assert.throws(()=>validateStairEvidence118(forged),/invalid_two_part_geometry/);
});
test('a fabricated geometry total gets rejected',()=>{
 const o=e.observations.find(x=>x.productId==='roborock-saros-20'&&x.capability==='two_part_threshold')!;
 const forged={...e,observations:[...e.observations,{...o,geometry:{...o.geometry!,totalCm:13}}]};
 assert.throws(()=>validateStairEvidence118(forged),/invalid_two_part_geometry/);
});
test('unsupported manufacturer inferred finding must not be marked independent lab measurement',()=>{
 const forged={...e,observations:[...e.observations,{...e.observations[0],capability:'quantified_tread_cleaning' as const}]};
 assert.throws(()=>validateStairEvidence118(forged),/exhibition_demo_not_lab_cleaning_measurement/);
});
test('a trade-show setup cannot be misrepresented as demonstrated autonomous household transfer',()=>{
 const forged={...e,observations:[...e.observations,{...e.observations[0],capability:'autonomous_in_home_floor_transfer' as const}]};
 assert.throws(()=>validateStairEvidence118(forged),/home_transfer_not_demonstrated_in_home/);
});
test('unknown sources and duplicate product identities rejected',()=>{
 assert.throws(()=>validateStairEvidence118({...e,observations:[...e.observations,{...e.observations[0],sourceId:'missing'}]}),/unknown_source_product_or_context/);
 assert.throws(()=>validateStairEvidence118({...e,products:[...e.products,e.products[0]]}),/duplicate_or_empty_id/);
});
test('unreviewed query string cannot be given human verified status by this comparison',()=>{
 assert.throws(()=>inspectStairEvidence118(e,{verification:'automatic_guess' as never,capabilities:['multiple_stair_ascent']}),/unverified_or_unknown_intent/);
});
test('conflicting source claims create a conflict instead of a win',()=>{
 const conflict={...e,observations:[...e.observations,{...e.observations[0],disposition:'explicit_no' as const,sourceId:'eufy-2026-08-11',setting:'editorial_description' as const}]};
 const r=inspectStairEvidence118(conflict,q(['multiple_stair_ascent']));
 assert.equal(get(r,'roborock-saros-rover').caps.multiple_stair_ascent.status,'conflicting');
 assert.equal(get(r,'roborock-saros-rover').qualifies,false);
});
test('real independent Saros 20 result is preserved as 57 mm one-step test, not manufacturer 8.8 cm two-part claim',()=>{
 const r=inspect(['single_threshold','two_part_threshold']);
 const saros=get(r,'roborock-saros-20');
 assert.equal(saros.caps.single_threshold.status,'independently_tested_in_lab');
 assert.deepEqual(saros.caps.single_threshold.geometry.map(x=>x!.maxSingleCm).sort(),[4.5,5.7]);
 assert.equal(saros.caps.two_part_threshold.status,'declared_by_manufacturer');
 assert.equal(r.performanceRanking,null);
});
test('a purported independent measured record without a source-declared protocol must fail',()=>{
 const entry=e.observations.find(x=>x.disposition==='independently_tested_yes')!;
 const forged={...e,observations:[...e.observations,{...entry,measurementProtocol:undefined}]};
 assert.throws(()=>validateStairEvidence118(forged),/invalid_independent_measurement/);
});
test('a manufacturer specification cannot be relabelled as independent result',()=>{
 const entry=e.observations.find(x=>x.productId==='roborock-saros-20'&&x.disposition==='manufacturer_claim_yes')!;
 const forged={...e,observations:[...e.observations,{...entry,disposition:'independently_tested_yes' as const}]};
 assert.throws(()=>validateStairEvidence118(forged),/invalid_independent_measurement/);
});
test('purchased Dreame X50 Ultra independent original 36mm success does not become 60mm single step',()=>{
 const r=inspect(['single_threshold','two_part_threshold']);
 const x=get(r,'dreame-x50-ultra');
 assert.deepEqual(x.caps.single_threshold.geometry.map(g=>g!.maxSingleCm).sort(),[3.6,4.2]);
 assert.deepEqual(x.caps.two_part_threshold.geometry.map(g=>g!.totalCm),[6]);
 assert.equal(x.caps.two_part_threshold.geometry[0]!.firstCm,undefined);
 assert.equal(x.caps.single_threshold.status,'independently_tested_in_lab');
});
test('MOVA 8cm claim retains two-part 4.5+3.5 geometry at a 7cm test gap',()=>{
 const r=inspect(['single_threshold','two_part_threshold']);
 const mova=get(r,'mova-z60-ultra');
 assert.equal(mova.caps.single_threshold.geometry[0]!.maxSingleCm,4.8);
 assert.deepEqual(mova.caps.two_part_threshold.geometry[0],{kind:'two_part',firstCm:4.5,secondCm:3.5,totalCm:8,interstepGapMinCm:7,interstepGapMaxCm:7});
 assert.equal(mova.caps.multiple_stair_ascent.status,'not_verified');
});
test('two-part composite source without published parts retains unknown component heights',()=>{
 const r=inspect(['two_part_threshold']);
 assert.deepEqual(get(r,'dreame-x50-ultra').caps.two_part_threshold.geometry[0],{kind:'two_part',totalCm:6});
});
