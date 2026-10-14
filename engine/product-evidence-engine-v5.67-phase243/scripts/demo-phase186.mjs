/** Fixture-only demonstration of Phase186; no real product recommendation. */
import {generateKeyPairSync,sign} from 'node:crypto';
import {compareRoomAcSpecifications186} from '../dist/src/phase186_tiered_specification_suitability.js';
import {canonicalJson180} from '../dist/src/phase180_reviewed_first_answer.js';
const {publicKey,privateKey}=generateKeyPairSync('ed25519');
const root='https://www.energystar.gov/productfinder/product/certified-room-air-conditioners/results';
const observation=(id,variantId,dimension,value,unit,sourceTier='certification_register')=>({id,variantId,dimension,value,unit,sourceTier,
 sourceUrl:root,documentHash:'f'.repeat(64),protocolId:dimension==='rated_cooling_capacity'?'doe_room_ac':'doe_ceer',
 protocolVersion:'v1',originalReference:'illustrative_fixture_not_original_source'});
const catalog={phase:186,schema:'186.1',market:'us',category:'window_room_air_conditioner',knowledgeVersion:'fixture_1',policyVersion:'fixture_1',
 reviewReference:'fixture_not_real_review',sourceRightsReference:'fixture_only',identityReviewReference:'fictional_identity',
 reviewedAt:'2026-10-12T18:00:00Z',expiresAt:'2026-10-31T18:00:00Z',capacityProtocolId:'doe_room_ac',capacityProtocolVersion:'v1',
 coverageStatement:'Fictional models, dummy signing key and illustrative sizing band: not current product evidence.',
 sizingBands:[{minSquareFeet:300,maxSquareFeet:350,minCapacityBtuPerHour:8000,maxCapacityBtuPerHour:8000}],
 variants:[
 {id:'fixture_a',name:'Fictional AC A',observations:[observation('a_capacity','fixture_a','rated_cooling_capacity',8000,'btu_per_hour'),observation('a_ceer','fixture_a','certified_ceer',15,'btu_per_watt_hour')]},
 {id:'fixture_b',name:'Fictional AC B',observations:[observation('b_capacity','fixture_b','rated_cooling_capacity',8000,'btu_per_hour'),observation('b_ceer','fixture_b','certified_ceer',14,'btu_per_watt_hour')]},
 {id:'fixture_c',name:'Fictional AC C',observations:[observation('c_capacity','fixture_c','rated_cooling_capacity',8000,'btu_per_hour','manufacturer_technical_spec')]}
 ]};
const signed={catalog,keyId:'fixture_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(catalog)),privateKey).toString('base64')};
const goal={market:'us',category:'window_room_air_conditioner',confirmation:'user_confirmed_web',squareFeet:320,ceilingFeet:8,
 exposure:'typical',additionalHeatLoad:'no_known_extra',comparison:'certified_efficiency'};
const authority={market:'us',asOf:'2026-10-12T21:00:00Z',publicKeys:{fixture_reviewer:publicKey.export({format:'pem',type:'spki'}).toString()}};
console.log(JSON.stringify({disclaimer:'FIXTURES ONLY: no real reviewed models, tests or source signatures',result:compareRoomAcSpecifications186({goal,reviewedCatalog:signed,authority})},null,2));
