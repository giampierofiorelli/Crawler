/** Phase118: category-specific real-source audit over a query-neutral capability graph.
 * Capabilities here are explicit physical operations, NOT product star scores.
 * Reviewed, dated source pointers are hand-transcribed from original publications.
 * Proof at a controlled exhibition is NOT a home validation or independent lab test.
 */
import {createHash} from 'node:crypto';
export type Capability118 = 'single_threshold'|'two_part_threshold'|'multiple_stair_ascent'|'multiple_stair_descent'|'vacuum_stair_treads'|'autonomous_in_home_floor_transfer'|'retail_sale'|'quantified_tread_cleaning';
export type SourceClass118 = 'independent_firsthand_exhibition'|'independent_original_test'|'independent_editorial'|'manufacturer_publication'|'original_campaign_record';
export type Disposition118 = 'observed_yes'|'independently_tested_yes'|'manufacturer_claim_yes'|'original_seller_yes'|'explicit_no';
export type EvidenceStatus118='demonstrated_at_exhibition'|'independently_tested_in_lab'|'declared_by_manufacturer'|'documented_retail'|'explicitly_not_supported'|'conflicting'|'not_verified';
export type Mobility118='integrated_wheeled_legs'|'tracked_carrier'|'elevator_carrier'|'square_integrated_concept'|'lifting_threshold_chassis';
export interface Source118 {id:string;url:string;published:string|null;publisher:string;kind:SourceClass118;scope:string;}
export interface Robot118 {id:string;name:string; mobility:Mobility118; systemRole:'integrated_vacuum'|'carrier_plus_compatible_vacuum'; compatibleVacuum?:string;}
export interface ThresholdGeometry118 {kind:'single'|'two_part'; maxSingleCm?:number;firstCm?:number;secondCm?:number;totalCm?:number;interstepGapMinCm?:number;interstepGapMaxCm?:number;}
export interface Observation118 {productId:string;capability:Capability118; disposition:Disposition118;sourceId:string; setting:'exhibition_demo'|'independent_test'|'manufacturer_lab'|'product_page'|'campaign_status'|'editorial_description'; scopeNote:string;measurementProtocol?:string;geometry?:ThresholdGeometry118;}
export interface StairEvidence118 {revision:string;asOf:string;sources:readonly Source118[];products:readonly Robot118[];observations:readonly Observation118[];}
export interface VerifiedNeed118 {verification:'externally_verified_semantic_intent';capabilities:readonly Capability118[];requireRetail?:boolean;requireExhibitionDemonstration?:boolean;}
const CLIMB_CAPS:readonly Capability118[]=['multiple_stair_ascent','multiple_stair_descent','vacuum_stair_treads','autonomous_in_home_floor_transfer','quantified_tread_cleaning'];
function sortedUnique(xs:readonly string[]){return [...new Set(xs)].sort();}
function sha(value:unknown){return createHash('sha256').update(JSON.stringify(value)).digest('hex');}
function checkGeo(o:Observation118){
 const g=o.geometry; if(!g)return;
 if(!['single_threshold','two_part_threshold'].includes(o.capability))throw Error('threshold_geometry_for_non_threshold');
 if(o.disposition==='explicit_no')throw Error('geometry_on_negative_claim');
 if(g.kind==='single'){
  if(o.capability!=='single_threshold'||g.firstCm!==undefined||g.secondCm!==undefined||g.totalCm!==undefined||g.maxSingleCm===undefined||!Number.isFinite(g.maxSingleCm)||g.maxSingleCm<=0)throw Error('invalid_single_threshold_geometry');
 }else{
  if(o.capability!=='two_part_threshold'||g.maxSingleCm!==undefined||g.totalCm===undefined||!Number.isFinite(g.totalCm)||g.totalCm<=0||(g.firstCm===undefined)!==(g.secondCm===undefined))throw Error('invalid_two_part_geometry');
  if(g.firstCm!==undefined&&(!Number.isFinite(g.firstCm)||g.firstCm<=0||!Number.isFinite(g.secondCm)||g.secondCm!<=0||Math.abs((g.firstCm+g.secondCm!)-g.totalCm)>1e-8))throw Error('invalid_two_part_geometry');
  if((g.interstepGapMinCm===undefined)!==(g.interstepGapMaxCm===undefined))throw Error('partial_gap_bounds');
  if(g.interstepGapMinCm!==undefined&&(!Number.isFinite(g.interstepGapMinCm)||g.interstepGapMinCm<0||!Number.isFinite(g.interstepGapMaxCm)||g.interstepGapMaxCm!<g.interstepGapMinCm))throw Error('invalid_gap_bounds');
 }
}
export function validateStairEvidence118(e:StairEvidence118){
 if(!e.revision||!/^\d{4}-\d{2}-\d{2}$/.test(e.asOf))throw Error('invalid_revision_date');
 const ids=(xs:readonly {id:string}[])=>{const m=new Set(xs.map(x=>x.id));if(m.size!==xs.length||xs.some(x=>!x.id))throw Error('duplicate_or_empty_id');return m;};
 const si=ids(e.sources),pi=ids(e.products);
 for(const s of e.sources){if(!/^https:\/\/[^\s]+$/.test(s.url)||(s.published!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(s.published))||!s.publisher||!s.scope||(s.published!==null&&s.published>e.asOf))throw Error('invalid_source');}
 for(const p of e.products)if(!p.name||(p.systemRole==='carrier_plus_compatible_vacuum'&&!p.compatibleVacuum&&p.mobility==='tracked_carrier'&&p.id==='eufy-marswalker'))throw Error('invalid_product_role');
 for(const o of e.observations){
  if(!pi.has(o.productId)||!si.has(o.sourceId)||!o.scopeNote)throw Error('unknown_source_product_or_context');
  const s=e.sources.find(x=>x.id===o.sourceId)!;
  if(o.disposition==='observed_yes'&&(s.kind!=='independent_firsthand_exhibition'||o.setting!=='exhibition_demo'))throw Error('false_independent_observation');
  if(o.disposition==='independently_tested_yes'&&(s.kind!=='independent_original_test'||o.setting!=='independent_test'||!o.measurementProtocol||!o.geometry||!['single_threshold','two_part_threshold'].includes(o.capability)))throw Error('invalid_independent_measurement');
  if(o.disposition==='manufacturer_claim_yes'&&s.kind!=='manufacturer_publication'&&s.kind!=='original_campaign_record')throw Error('false_manufacturer_attribution');
  if(o.disposition==='original_seller_yes'&&(s.kind!=='manufacturer_publication'||o.capability!=='retail_sale'||o.setting!=='product_page'))throw Error('false_sale_claim');
  if(o.disposition==='explicit_no'&&s.kind!=='manufacturer_publication'&&s.kind!=='original_campaign_record')throw Error('negative_assertion_without_primary_source');
  if(o.setting==='exhibition_demo'&&o.disposition!=='observed_yes')throw Error('claim_promoted_to_exhibition_observation');
  if(o.capability==='autonomous_in_home_floor_transfer'&&o.disposition==='observed_yes'&&o.setting==='exhibition_demo')throw Error('home_transfer_not_demonstrated_in_home');
  if(o.capability==='quantified_tread_cleaning'&&o.disposition==='observed_yes')throw Error('exhibition_demo_not_lab_cleaning_measurement');
  checkGeo(o);
 }
}
export function inspectStairEvidence118(e:StairEvidence118,need:VerifiedNeed118){
 validateStairEvidence118(e);
 if(need.verification!=='externally_verified_semantic_intent'||need.capabilities.length===0||need.capabilities.some(x=>!['single_threshold','two_part_threshold',...CLIMB_CAPS,'retail_sale'].includes(x)))throw Error('unverified_or_unknown_intent');
 const requested=sortedUnique([...need.capabilities,...(need.requireRetail?['retail_sale']:[])]);
 const facts=e.products.map(p=>{
  const caps=Object.fromEntries([...new Set([...requested,'multiple_stair_ascent','vacuum_stair_treads','retail_sale'])].sort().map(cap=>{
   const rec=e.observations.filter(x=>x.productId===p.id&&x.capability===cap);
   const yes=rec.filter(x=>x.disposition!=='explicit_no'), no=rec.filter(x=>x.disposition==='explicit_no');
   const demonstrated=yes.some(x=>x.disposition==='observed_yes');
   const labTested=yes.some(x=>x.disposition==='independently_tested_yes');
   const seller=yes.some(x=>x.disposition==='original_seller_yes');
   const manufacturer=yes.some(x=>x.disposition==='manufacturer_claim_yes');
   let status:EvidenceStatus118=labTested?'independently_tested_in_lab':demonstrated?'demonstrated_at_exhibition':seller?'documented_retail':manufacturer?'declared_by_manufacturer':'not_verified';
   if(no.length&&yes.length)status='conflicting';else if(no.length)status='explicitly_not_supported';
   return [cap,{status,sourceIds:sortedUnique(rec.map(x=>x.sourceId)),contexts:sortedUnique(rec.map(x=>x.scopeNote)),measurementProtocols:sortedUnique(rec.flatMap(x=>x.measurementProtocol?[x.measurementProtocol]:[])),geometry:rec.map(x=>x.geometry).filter(Boolean)}];
  }));
  const c=caps as Record<string,{status:EvidenceStatus118;sourceIds:string[];contexts:string[];measurementProtocols:string[];geometry:ThresholdGeometry118[]}>;
  const reasons:string[]=[];
  for(const capability of requested){
   const status=c[capability].status;
   const sufficient=capability==='retail_sale' ? status==='documented_retail' : need.requireExhibitionDemonstration?status==='demonstrated_at_exhibition':status==='demonstrated_at_exhibition'||status==='independently_tested_in_lab'||status==='declared_by_manufacturer'||status==='documented_retail';
   if(!sufficient)reasons.push(`${capability}:${status}`);
  }
  return {productId:p.id,name:p.name,mobility:p.mobility,systemRole:p.systemRole,compatibleVacuum:p.compatibleVacuum??null,qualifies:reasons.length===0,reasons,caps};
 }).sort((a,b)=>a.productId.localeCompare(b.productId));
 const canonicalSources=[...e.sources].sort((a,b)=>a.id.localeCompare(b.id));
 const canonicalObs=[...e.observations].map(o=>({...o})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 const fingerprint=sha({revision:e.revision,asOf:e.asOf,sources:canonicalSources,products:[...e.products].sort((a,b)=>a.id.localeCompare(b.id)),observations:canonicalObs});
 return {asOf:e.asOf,evidenceRevision:e.revision,sourceFingerprint:fingerprint,requestedCapabilities:requested,matched: facts.filter(f=>f.qualifies),notVerifiedOrExcluded:facts.filter(f=>!f.qualifies),allProducts:facts,marketExhaustivenessNotEstablished:true,performanceRanking:null,householdReliabilityValidated:false,unitTestsAreNotIndependentProductReviews:true,warning:'Exhibition demonstrations are not unsupervised home trials; threshold geometry is not stair traversal; lack of evidence is not negative performance; no market-wide ranking.'};
}
