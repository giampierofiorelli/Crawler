/** Phase184 — real operator-supplied EPA ENERGY STAR V3.0 CSV pilot.
 * All data remain in a registry-claim quarantine. Model number != independently
 * authenticated retail SKU; no per-product comparative test or ranking is created.
 */
import {createHash} from 'node:crypto';
import {inspectTechnicalCsv183,stageTechnicalTable183,verifyStagedSpan183,
 type SourceCustody183,type ColumnMeasure183,type StagedObservation183} from './phase183_source_measurement_intake.js';
const sha=(b:string|Uint8Array)=>createHash('sha256').update(b).digest('hex');
const dataUrl='https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6';
const epaLicense='https://edg.epa.gov/EPA_Data_License.html';
const normalize=(v:string)=>v.trim().replace(/\s+/g,' ').toLocaleLowerCase('en');
const measures:readonly ColumnMeasure183[]=[
 {column:'Room Size (sq.ft.)',dimensionKey:'epa_derived_room_area',unit:'sq_ft',min:1,max:5000},
 {column:'Dust-Free Clean Air Delivery Rate (cfm)',dimensionKey:'dust_cadr',unit:'cfm',min:0,max:5000},
 {column:'Smoke-Free Clean Air Delivery Rate (cfm)',dimensionKey:'smoke_cadr',unit:'cfm',min:0,max:5000},
 {column:'Pollen-Free Clean Air Delivery Rate (cfm)',dimensionKey:'pollen_cadr',unit:'cfm',min:0,max:5000},
 {column:'Dust-Free Clean Air Delivery Rate per Watt (cfm/Watt)',dimensionKey:'dust_cadr_per_watt',unit:'cfm_per_watt',min:0,max:1000,decimalSeparator:','},
 {column:'Smoke-Free Clean Air Delivery Rate per Watt (cfm/Watt)',dimensionKey:'smoke_cadr_per_watt',unit:'cfm_per_watt',min:0,max:1000,decimalSeparator:','},
 {column:'Pollen-Free Clean Air Delivery Rate per Watt (cfm/Watt)',dimensionKey:'pollen_cadr_per_watt',unit:'cfm_per_watt',min:0,max:1000,decimalSeparator:','},
 {column:'PM2.5-Free Clean Air Delivery Rate (cfm)',dimensionKey:'pm25_cadr',unit:'cfm',min:0,max:5000,decimalSeparator:','},
 {column:'Integrated Energy Factor (cfm/Watt)',dimensionKey:'integrated_energy_factor',unit:'cfm_per_watt',min:0,max:1000,decimalSeparator:','},
 {column:'Annual Energy Use (kWh/yr)',dimensionKey:'annual_energy_use',unit:'kwh_per_year',min:0,max:20000,decimalSeparator:','},
 {column:'Ozone Emissions (ppb)',dimensionKey:'ozone_emissions',unit:'ppb',min:0,max:5000,decimalSeparator:','}
];
export interface EpaHeld184 {esuid:string;brand:string;modelNumber:string;reason:'model_pattern_or_group'|'duplicate_brand_model'|'out_of_market'|'invalid_source_identity'|'measurement_not_stageable';}
export interface EpaCandidate184 {
 esuid:string;brand:string;modelNumber:string;modelName:string;markets:string;
 registryEntryId:string;sourceRow:number;rowSha256:string;
 observations:readonly StagedObservation183[];
 exactCommercialVariantAuthenticated:false;independentPerformanceTest:false;
 rankingAuthorized:false;
}
export interface EpaPilot184 {
 phase:184;schema:'184.epa.1';sourceUrl:string;licenseUrl:string;
 acquisition:'user_supplied_original_csv';sourceRole:'certification_registry_manufacturer_reported';
 market:'us'|'ca';documentSha256:string;bytes:number;rows:number;columns:number;
 sourceRevision:string;protocolVersion:'v3_0';candidates:readonly EpaCandidate184[];
 held:readonly EpaHeld184[];independentScientificReviewComplete:false;
 promotedToProductCatalog:false;rankingAuthorized:false;auditHash:string;
}
export function stageEpaRegistry184(args:{csvBytes:Uint8Array;expectedSha256:string;market:'us'|'ca';
 obtainedAt:string;reviewedAt:string;asOf:string;rightsReviewReference:string;
 sourceRevision:string;}):EpaPilot184{
 const {csvBytes,market}=args;
 const inspected=inspectTechnicalCsv183(csvBytes);
 if(inspected.documentSha256!==args.expectedSha256)throw Error('phase184_snapshot_hash_mismatch');
 const header=inspected.headers;
 const must=['ENERGY STAR Unique ID','Brand Name','Model Name','Model Number','Markets',...measures.map(m=>m.column)];
 if(must.some(x=>!header.includes(x)))throw Error('phase184_source_columns_missing');
 const i=new Map(header.map((h,n)=>[h,n]));
 const get=(cells:readonly string[],key:string)=>cells[i.get(key)!].trim();
 const rows=inspected.rows.map(r=>({r,esuid:get(r.cells,'ENERGY STAR Unique ID'),brand:get(r.cells,'Brand Name'),
  model:get(r.cells,'Model Number'),modelName:get(r.cells,'Model Name'),marketValue:get(r.cells,'Markets')}));
 const seenEsuid=new Set<string>();
 for(const row of rows){if(!/^\d{7}$/.test(row.esuid)||seenEsuid.has(row.esuid))throw Error('phase184_invalid_or_duplicate_registry_id');seenEsuid.add(row.esuid);}
 const counts=new Map<string,number>();
 for(const r of rows){const k=normalize(r.brand)+'\u0000'+normalize(r.model);counts.set(k,(counts.get(k)??0)+1);}
 const custody:SourceCustody183={sourceId:'epa_air_cleaners_v3',sourceUrl:dataUrl,licenseUrl:epaLicense,
  rightsReviewReference:args.rightsReviewReference,permissionStatus:'operator_reviewed_local_fact_storage',
  sourceRole:'certification_registry_manufacturer_reported',sourceRevision:args.sourceRevision,
  protocolId:'energystar_room_air_cleaners',protocolVersion:'v3_0',market,
  obtainedAt:args.obtainedAt,rightsReviewedAt:args.reviewedAt,acquisition:'operator_supplied_offline_copy'};
 const candidates:EpaCandidate184[]=[];const held:EpaHeld184[]=[];
 for(const row of rows){
  const base={esuid:row.esuid,brand:row.brand,modelNumber:row.model};
  let reason:EpaHeld184['reason']|null=null;
  const acceptedMarket=market==='us'?'United States':'Canada';
  if(!row.marketValue.split(',').map(x=>x.trim()).includes(acceptedMarket))reason='out_of_market';
  else if(!row.brand||!row.model||row.brand.length>150||row.model.length>150)reason='invalid_source_identity';
  else if(/[*#?;]/.test(row.model)||row.model.includes(' / '))reason='model_pattern_or_group';
  else if((counts.get(normalize(row.brand)+'\u0000'+normalize(row.model))??0)>1)reason='duplicate_brand_model';
  if(reason){held.push({...base,reason});continue;}
  const variantId='esuid_'+row.esuid;
  const intake=stageTechnicalTable183({csvBytes,custody,asOf:args.asOf,
   scope:{variantId,brand:row.brand,modelNumber:row.model,categoryId:'air_purifier'},
   schema:{brandColumn:'Brand Name',modelColumn:'Model Number',measurements:measures}});
  if(intake.status!=='staged_unreviewed'||intake.observations.length!==measures.length||
   !verifyStagedSpan183(intake,csvBytes)||intake.observations.some(o=>o.sourceRow!==row.r.rowNumber||o.rowSha256!==row.r.rowSha256)){
   held.push({...base,reason:'measurement_not_stageable'});continue;
  }
  candidates.push({...base,modelName:row.modelName,markets:row.marketValue,registryEntryId:variantId,
   sourceRow:row.r.rowNumber,rowSha256:row.r.rowSha256,observations:intake.observations,
   exactCommercialVariantAuthenticated:false,independentPerformanceTest:false,rankingAuthorized:false});
 }
 const base={phase:184 as const,schema:'184.epa.1' as const,sourceUrl:dataUrl,licenseUrl:epaLicense,
  acquisition:'user_supplied_original_csv' as const,sourceRole:'certification_registry_manufacturer_reported' as const,
  market,documentSha256:inspected.documentSha256,bytes:csvBytes.length,rows:rows.length,columns:header.length,
  sourceRevision:args.sourceRevision,protocolVersion:'v3_0' as const,candidates,held,
  independentScientificReviewComplete:false as const,promotedToProductCatalog:false as const,rankingAuthorized:false as const};
 return {...base,auditHash:sha(JSON.stringify(base))};
}
export function verifyEpaPilot184(result:EpaPilot184,csvBytes:Uint8Array):boolean{
 if(!result||result.phase!==184||result.schema!=='184.epa.1'||result.acquisition!=='user_supplied_original_csv'||
  result.sourceRole!=='certification_registry_manufacturer_reported'||result.independentScientificReviewComplete!==false||
  result.promotedToProductCatalog!==false||result.rankingAuthorized!==false||result.documentSha256!==sha(csvBytes))return false;
 const {auditHash,...base}=result;
 if(sha(JSON.stringify(base))!==auditHash)return false;
 return result.candidates.every(c=>c.rankingAuthorized===false&&c.exactCommercialVariantAuthenticated===false&&
  c.independentPerformanceTest===false&&c.observations.every(o=>o.rankingAuthorized===false&&
   o.documentSha256===result.documentSha256&&o.rowSha256===c.rowSha256&&o.sourceRow===c.sourceRow&&
   sha(csvBytes.subarray(o.rowByteStart,o.rowByteEnd))===o.rowSha256));
}
