import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import {compareRoomAcSpecifications186,type TieredEvidenceCatalog186,type Observation186,type SignedEvidenceCatalog186,type Goal186} from '../src/phase186_tiered_specification_suitability.js';
const keys=generateKeyPairSync('ed25519');
const authority={market:'us',asOf:'2026-10-12T21:00:00Z',publicKeys:{reviewer:keys.publicKey.export({format:'pem',type:'spki'}).toString()}};
const sha='a'.repeat(64);
const link='https://www.energystar.gov/productfinder/product/certified-room-air-conditioners/results';
const cap=(variantId:string,value:number,tier:Observation186['sourceTier']='certification_register',method='doe_room_ac'):
 Observation186=>({id:`${variantId}_cap`,variantId,dimension:'rated_cooling_capacity',value,unit:'btu_per_hour',
  sourceTier:tier,sourceUrl:link,documentHash:sha,protocolId:method,protocolVersion:'v1',originalReference:'fixture_document'});
const ceer=(variantId:string,value:number,method='doe_ceer'):
 Observation186=>({id:`${variantId}_ceer`,variantId,dimension:'certified_ceer',value,unit:'btu_per_watt_hour',
  sourceTier:'certification_register',sourceUrl:link,documentHash:sha,protocolId:method,protocolVersion:'v1',originalReference:'fixture_document'});
function catalog():TieredEvidenceCatalog186{return {phase:186,schema:'186.1',market:'us',category:'window_room_air_conditioner',
 knowledgeVersion:'knowledge_v1',policyVersion:'policy_v1',reviewReference:'technical_board_review',
 reviewedAt:'2026-10-12T20:00:00Z',expiresAt:'2026-11-12T20:00:00Z',
 sourceRightsReference:'documented_source_reuse_review',identityReviewReference:'exact_variant_review',
 capacityProtocolId:'doe_room_ac',capacityProtocolVersion:'v1',
 coverageStatement:'Illustrative partial US window-AC fixture, not a list of real tested products.',
 sizingBands:[{minSquareFeet:300,maxSquareFeet:350,minCapacityBtuPerHour:8000,maxCapacityBtuPerHour:8000}],
 variants:[
 {id:'fictional_a',name:'Fictional Air Conditioner A',observations:[cap('fictional_a',8000),ceer('fictional_a',15)]},
 {id:'fictional_b',name:'Fictional Air Conditioner B',observations:[cap('fictional_b',8000),ceer('fictional_b',14)]},
 {id:'fictional_c',name:'Fictional Air Conditioner C',observations:[cap('fictional_c',6000),ceer('fictional_c',17)]},
 {id:'fictional_d',name:'Fictional Air Conditioner D',observations:[cap('fictional_d',8000,'manufacturer_technical_spec')]},
 {id:'fictional_e',name:'Fictional Air Conditioner E',observations:[cap('fictional_e',10000),ceer('fictional_e',19)]},
 {id:'fictional_f',name:'Fictional Air Conditioner F',observations:[]}]};}
const goal=(comparison:Goal186['comparison']='suitability_only'):Goal186=>({market:'us',category:'window_room_air_conditioner',
 confirmation:'user_confirmed_web',squareFeet:320,ceilingFeet:8,exposure:'typical',additionalHeatLoad:'no_known_extra',comparison});
const signed=(c=catalog()):SignedEvidenceCatalog186=>({catalog:c,keyId:'reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),keys.privateKey).toString('base64')});
const run=(g=goal(),c:SignedEvidenceCatalog186|null=signed(),a=authority)=>compareRoomAcSpecifications186({goal:g,reviewedCatalog:c,authority:a});
const copy=<T>(obj:T):T=>JSON.parse(JSON.stringify(obj));

test('certified capacity in a reviewed sizing band gives a CONDITIONAL suitability screen',()=>{
 const r=run();assert.equal(r.status,'conditional_specification_comparison');assert.deepEqual(r.ordered.map(x=>x.variantId),['fictional_a','fictional_b']);
 assert.deepEqual(r.ordered.map(x=>x.rank),[1,1]);assert.equal(r.notAGeneralBestProductRanking,true);
 assert.equal(r.noIndependentConsumerCoolingReviewAssumed,true);assert.equal(r.researchAccessPerformed,false);
});
test('certified CEER may order energy efficiency only, not cooling speed or overall best',()=>{
 const r=run(goal('certified_efficiency'));assert.deepEqual(r.ordered.map(x=>x.variantId),['fictional_a','fictional_b']);
 assert.deepEqual(r.ordered.map(x=>x.comparisonBasis),['certified_ceer_only','certified_ceer_only']);
 assert.ok(r.cautions.some(x=>x.includes('not cooling')&&x.includes('noise')));
});
test('a product with higher efficiency but inadequate nominal capacity is NOT falsely ranked',()=>{
 const r=run(goal('certified_efficiency'));assert.ok(r.held.some(x=>x.variantId==='fictional_c'&&x.outcome==='capacity_below_guidance'));
 assert.equal(r.ordered.some(x=>x.variantId==='fictional_c'),false);
});
test('larger BTU unit does not automatically win: flag oversize for investigation',()=>{
 const r=run(goal('certified_efficiency'));assert.ok(r.held.some(x=>x.variantId==='fictional_e'&&x.outcome==='capacity_above_guidance'));
});
test('manufacturer-only claim is visibly tentative, not a certified capacity',()=>{
 const r=run();const row=r.provisional.find(x=>x.variantId==='fictional_d');assert.equal(row?.outcome,'manufacturer_indicated_only');
 assert.equal(row?.capacityTier,'manufacturer_technical_spec');assert.equal(r.ordered.some(x=>x.variantId==='fictional_d'),false);
});
test('missing information stays visible and never becomes a zero-quality observation',()=>{
 const r=run();assert.equal(r.held.find(x=>x.variantId==='fictional_f')?.outcome,'missing_capacity');
 assert.ok(r.researchGaps.some(x=>x.startsWith('fictional_f:')));
});
test('unsigned catalog cannot pass evidence gate',()=>{assert.equal(run(goal(),null).status,'research_required');});
test('catalog alteration invalidates signature',()=>{const s=signed();s.catalog.variants[0].observations[0].value=9000;assert.equal(run(goal(),s).status,'research_required');});
test('user-supplied key cannot become the external authority',()=>{
 const s=signed();s.keyId='shopper';assert.equal(run(goal(),s).status,'research_required');
});
test('sizing is not inferred for unknown solar exposure, atypical ceilings or extra heat gain',()=>{
 for(const g of [{...goal(),exposure:'unknown' as const},{...goal(),ceilingFeet:10},{...goal(),additionalHeatLoad:'present' as const}]){
  const r=run(g);assert.equal(r.status,'research_required');assert.deepEqual(r.ordered,[]);
 }
});
test('sizing table does not silently extrapolate beyond reviewed room area',()=>{
 assert.equal(run({...goal(),squareFeet:800}).status,'research_required');
});
test('portable/ASHRAE capacity measurement cannot be silently mixed with window-AC rating',()=>{
 const c=catalog();c.variants[0].observations[0].protocolId='ashrae_portable';
 const r=run(goal(),signed(c));assert.equal(r.held.find(x=>x.variantId==='fictional_a')?.outcome,'conflicting_evidence');
});
test('incompatible CEER test protocols cannot generate a comparative energy efficiency rank',()=>{
 const c=catalog();c.variants[1].observations[1].protocolVersion='v2';
 const r=run(goal('certified_efficiency'),signed(c));assert.equal(r.status,'research_required');assert.equal(r.ordered.length,0);
 assert.ok(r.researchGaps.some(x=>x.includes('incompatible methods')));
});
test('same certified efficiency metric with identical values produces an explicit tie',()=>{
 const c=catalog();c.variants[1].observations[1].value=15;
 const r=run(goal('certified_efficiency'),signed(c));assert.deepEqual(r.ordered.map(x=>x.rank),[1,1]);
});
test('missing CEER does not mean poor energy efficiency and candidate may be held from CEER order',()=>{
 const c=catalog();c.variants[1].observations=[cap('fictional_b',8000)];
 const r=run(goal('certified_efficiency'),signed(c));assert.equal(r.ordered.length,1);
 assert.ok(r.researchGaps.some(x=>x.includes('fictional_b: missing comparable certified CEER')));
});
test('duplicated or conflicting registered capacity requires review',()=>{
 const c=catalog();(c.variants[0].observations as Observation186[]).push({...cap('fictional_a',8200),id:'second_capacity'});
 const r=run(goal(),signed(c));assert.equal(r.held.find(x=>x.variantId==='fictional_a')?.outcome,'conflicting_evidence');
});
test('same-publisher registration and independent consumer test never double counted',()=>{
 const c=catalog();(c.variants[0].observations as Observation186[]).push({id:'cooling_test',variantId:'fictional_a',dimension:'tested_cooling_effectiveness',
  value:8,unit:'degrees_f_per_hour',sourceTier:'independent_lab_test',sourceUrl:'https://example.org/test',documentHash:sha,
  protocolId:'climate_lab',protocolVersion:'v1',originalReference:'fixture_test'});
 const r=run(goal('certified_efficiency'),signed(c));assert.deepEqual(r.ordered.map(x=>x.ceer),[15,14]);
 assert.equal(r.noIndependentConsumerCoolingReviewAssumed,true); // no inference of applicability to other models/variants
});
test('exact variant identity binding and units cannot be forged',()=>{
 const c=catalog();c.variants[0].observations[0].variantId='fictional_b';assert.equal(run(goal(),signed(c)).status,'research_required');
 const d=catalog();d.variants[0].observations[0].unit='btu_per_watt_hour';assert.equal(run(goal(),signed(d)).status,'research_required');
});
test('stale material must be refreshed',()=>{
 const r=run(goal(),signed(),{...authority,asOf:'2027-01-01T00:00:00Z'});assert.equal(r.status,'research_required');
});
test('overlapping sizing bands are not valid reviewed category knowledge',()=>{
 const c=catalog();c.sizingBands=[...c.sizingBands,{minSquareFeet:310,maxSquareFeet:400,minCapacityBtuPerHour:9000,maxCapacityBtuPerHour:9000}];
 assert.equal(run(goal(),signed(c)).status,'research_required');
});
test('any post-hoc edit to policy versions without reviewer re-signing invalidates the result',()=>{
 const s=signed();s.catalog.policyVersion='policy_changed';assert.equal(run(goal(),s).status,'research_required');
});
test('identical signed source and identical goals always yield same conditional comparison',()=>{
 const s=signed();assert.deepEqual(run(goal('certified_efficiency'),s),run(goal('certified_efficiency'),s));
});

test('unconfirmed language hypothesis cannot authorize sizing suitability',()=>{
 const g:any={...goal(),confirmation:'nlp_proposal'};assert.throws(()=>run(g),/bad186_goal/);
});
test('generic website masquerading as a certification register is rejected',()=>{
 const c=catalog();c.variants[0].observations[0].sourceUrl='https://shop.example.com/certified';
 assert.equal(run(goal(),signed(c)).status,'research_required');
});

test('manufacturer documentation for a capacity-fit product remains in a visible provisional tier',()=>{
 const r=run(goal('certified_efficiency'));
 assert.deepEqual(r.provisional.map(x=>x.variantId),['fictional_d']);
 assert.ok(r.cautions.some(x=>x.includes('separate provisional group')));
 assert.equal(r.held.some(x=>x.variantId==='fictional_d'),false);
});
