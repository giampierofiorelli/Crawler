/** Fictional engineering sanity demonstration, NOT product recommendations. */
import {generateKeyPairSync,sign} from 'node:crypto';
import {canonicalJson180} from '../dist/src/phase180_reviewed_first_answer.js';
import {compareFieldEvidence187} from '../dist/src/phase187_field_evidence_bridge.js';
const {privateKey,publicKey}=generateKeyPairSync('ed25519');
const authority={market:'us',asOf:'2026-10-12T12:00:00Z',publicKeys:{reviewer187:publicKey.export({format:'pem',type:'spki'}).toString()}};
const profiles=[
 ['air_cleaner','smoke_cadr','cfm','ac1','2024','air_cleaner_room_a','numeric_minimum',150,null,null,'no_order'],
 ['water_filter','lead_reduction','claim','nsf53','2024','lead_need','exact_certified_claim',null,null,'lead_reduction','no_order'],
 ['window_room_air_conditioner','cooling_capacity','btu_per_hour','doe','2024','room_load_a','numeric_minimum',8000,8000,null,'no_order']
];
const sample=[];
for(const [category,dimension,unit,protocolId,protocolVersion,profileId,kind,threshold,thresholdMax,claim,comparison] of profiles){
 const value=kind==='exact_certified_claim'?'lead_reduction':category==='air_cleaner'?180:8000;
 const record=(variantId,sourceClass,v)=>({id:`o_${variantId}`,variantId,dimension,value:v,unit,protocolId,protocolVersion,
  sourceClass,sourceUrl:'https://example.org/fictional',originalSha256:'b'.repeat(64),originalLocator:'row.1',
  sourceRightsReference:'fictional_rights',identityReviewReference:'fictional_identity',derivedFrom:null});
 const catalog={phase:187,schema:'187.1',market:'us',category,revision:'fictional_a',reviewedAt:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',
  externalReviewer:'fictional_review',rightsAuditReference:'fictional_rights',coverageStatement:'Fictional samples, not real market data.',marketCoverageComplete:false,
  policies:[{id:'field_a',kind,dimension,unit,protocolId,protocolVersion,threshold,thresholdMax,claim,profileId,comparison,
   acceptedForFit:['certified_or_verified_register'],reviewReference:'fictional_policy',reviewedApplicability:'Fictional usage profile with scope bound.'}],
  variants:[{id:'model_a',name:'Fictional Model A',observations:[record('model_a','certified_or_verified_register',value)]},
   {id:'model_b',name:'Fictional Model B',observations:[record('model_b','manufacturer_specification',value)]},
   {id:'model_c',name:'Fictional Model C',observations:[]}]
 };
 const envelope={catalog,keyId:'reviewer187',signatureBase64:sign(null,Buffer.from(canonicalJson180(catalog)),privateKey).toString('base64')};
 const d=compareFieldEvidence187({goal:{market:'us',category,profileId,confirmedByUser:true},catalog:envelope,authority});
 sample.push({category,status:d.status,compatible:d.compatible.map(r=>r.variantId),provisional:d.provisional.map(r=>r.variantId),
  held:d.held.map(r=>r.variantId),ordered:d.ordered.map(r=>r.variantId),notGeneralRanking:d.noGeneralProductRanking});
}
console.log(JSON.stringify({phase:187,fictionalData:true,independentProductTestsPerformed:false,result:sample},null,2));
