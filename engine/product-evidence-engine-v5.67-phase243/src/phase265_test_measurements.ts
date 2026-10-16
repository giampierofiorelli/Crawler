/** Phase265 — the missing connection between Phase225/226/227 test-result leads and persistent knowledge.
 *
 * Where the leads were lost (Phase265 trace): the operational observation builders (scripts/phase246-live-wave.mjs
 * `observations`, scripts/phase246-knowledge.mjs `ingest-recovered`) ran only the Phase245 specification extractor;
 * Phase225/226 ran only inside the transient Phase222 observer and evaluation scripts, and ObservationInput246 had no
 * field to carry a lead. Nothing was ever persisted.
 *
 * Why not Phase246 `declarations`: product_id is NOT NULL (an unresolved test subject would have to be forced onto a
 * product, i.e. an identity fabricated), and it has no place for a test condition, an instrument, the basis of the
 * measured dimension or the subject assignment. Phase265 therefore adds one staging table, test_measurements265, in the
 * same store, written in the same ingest transaction, journaled, and under the same Phase249 retention decision.
 *
 * What a persisted row is: an UNREVIEWED measurement REPORTED by a publisher (or a manufacturer), with provenance. It
 * is never independent-test evidence, never scientifically admitted and never ranking input; the publisher's type is
 * operator-asserted context, and a claim of independence establishes nothing. No page text is kept: only the lead id,
 * the hash of the source block, offsets, the number, the unit, short regex-bounded condition/instrument tokens and
 * cue codes.
 */
import type {TestCandidate225,TestProbe225} from './phase225_transient_test_probe.js';
import {probeTransientTestContent225} from './phase225_transient_test_probe.js';
import type {SpecExtraction245} from './phase245_spec_extraction.js';

/** Version of the lead extraction the store records per measurement (Phase225 prose + Phase226 tables + Phase227
 * explicit header links). A change re-derives the measurements of a revision whose bytes are offered again. */
export const TEST_LEAD_EXTRACTOR265='pee225-probe.v1+pee226-tables.v1+pee227-headers';
export interface TestLeadsInput265 {extractorVersion:string;probe:TestProbe225}
export type SourceKind265='manufacturer'|'retailer'|'independent_original_test'|'editorial'|'community'|
 'promotional_announcement'|'reference_encyclopedia'|'unknown';

/** The page's own main product as a Phase225 product lead (exactly the identity the store records), or null when the
 * page names no single product. Builders pass it to the probe; the store re-checks every lead against it. */
export function pageProductLead265(x:SpecExtraction245|null):{name:string;model:string|null;sku:string|null}|null{
 if(!x||!x.mainProduct.name||x.mainProduct.ambiguous)return null;
 const ids=x.mainProduct.identifiers??{};
 return {name:x.mainProduct.name,model:ids.model??ids.mpn??null,sku:ids.sku??null};
}
/** Run the existing Phase225 probe (which runs Phase226/227) on transient bytes. Nothing of the body is returned. */
export function testLeadsFromHtml265(html:string,url:string,sha256:string,x:SpecExtraction245|null):TestLeadsInput265{
 const lead=pageProductLead265(x);
 return {extractorVersion:TEST_LEAD_EXTRACTOR265,probe:probeTransientTestContent225(html,url,{documentSha256:sha256,productLeads:lead?[lead]:[]})};
}

const UNITS:Readonly<Record<string,string>>={mm:'mm',cm:'cm',kg:'kg',g:'g',l:'l',litre:'l',litres:'l',liter:'l',liters:'l',db:'db',dba:'dba',
 '%':'%',minute:'minutes',minutes:'minutes',hour:'hours',hours:'hours',second:'seconds',seconds:'seconds',ms:'ms',w:'w',watt:'w',watts:'w',
 kwh:'kwh',mah:'mah','°c':'°c'};
export const normalizeUnit265=(u:string):string|null=>UNITS[String(u).toLowerCase()]??null;
/** Units a publisher-declared dimension can be expressed in; anything else is a mismatch, never a conversion. */
const DIMENSION_UNITS:Readonly<Record<string,readonly string[]>>={mass:['g','kg'],volume:['l'],noise:['db','dba'],
 duration:['ms','seconds','minutes','hours'],length:['mm','cm'],power:['w'],energy:['kwh']};
const TOKEN=/^[a-z0-9 .°%]{1,40}$/;
const hex64=(s:unknown)=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);

/** Who reports the result. A manufacturer's result stays manufacturer-reported; a test publisher's type is an operator
 * assertion about the publisher, not an established independence of this result. */
export function reportedBy265(t:SourceKind265):'manufacturer'|'test_publisher_operator_asserted'|'other_publisher'{
 return t==='manufacturer'?'manufacturer':t==='independent_original_test'?'test_publisher_operator_asserted':'other_publisher';
}
export interface ScreenedLead265 {
 leadId:string;blockSha256:string;blockIndex:number;valueOffset:number;value:number;unit:string;
 dimension:string;dimensionBasis:'publisher_table_header'|'not_established';
 targetScope:'compartment_unspecified'|'whole_product_unspecified'|'not_established';
 condition:string|null;instrument:string|null;methodCue:TestCandidate225['methodCue'];
 subjectAssignment:TestCandidate225['subjectAssignment'];subject:TestCandidate225['subject'];
}
export type LeadRejection265='lead_not_from_this_revision'|'lead_claims_review_or_admission'|'malformed_lead'|'unit_not_recognised'|'unit_dimension_mismatch';
/** Validate one Phase225 candidate for this revision. Every safety flag must still say "not reviewed / not admitted";
 * a lead that claims otherwise is refused, never stored with the claim. */
export function screenTestLead265(c:TestCandidate225,rev:{url:string;sha256:string}):{ok:true;lead:ScreenedLead265}|{ok:false;reason:LeadRejection265}{
 if(!c||typeof c!=='object')return {ok:false,reason:'malformed_lead'};
 if(c.sourceUrl!==rev.url||(c.documentSha256!==null&&c.documentSha256!==undefined&&c.documentSha256!==rev.sha256))return {ok:false,reason:'lead_not_from_this_revision'};
 if(c.classification!=='publisher_reported_measurement_lead_only'||c.methodReviewed!==false||c.originalWorkReviewed!==false||c.reviewerIndependent!==false||
  c.exactVariantVerified!==false||c.market!=='unknown'||c.scientificEvidenceAdmitted!==false||c.rankingAuthorized!==false)return {ok:false,reason:'lead_claims_review_or_admission'};
 if(!hex64(c.id)||!hex64(c.blockSha256)||!Number.isInteger(c.blockIndex)||!Number.isInteger(c.valueOffset)||typeof c.value!=='number'||!Number.isFinite(c.value)||
  c.value<0||c.value>1e7||!['first_person_test_statement','test_section_with_method_cue','bounded_table_result_with_local_method'].includes(c.methodCue)||
  !['page_context_unverified','multiple_models_unresolved','not_identified','table_row_declared_model_unverified'].includes(c.subjectAssignment)||
  (c.condition!==null&&!TOKEN.test(String(c.condition)))||(c.instrument!==null&&!TOKEN.test(String(c.instrument))))return {ok:false,reason:'malformed_lead'};
 const unit=normalizeUnit265(c.unit);if(!unit)return {ok:false,reason:'unit_not_recognised'};
 const declared=c.publisherDeclaredDimension&&c.publisherDeclaredDimension!=='other'?c.publisherDeclaredDimension:null;
 if(declared&&!(DIMENSION_UNITS[declared]??[]).includes(unit))return {ok:false,reason:'unit_dimension_mismatch'};
 return {ok:true,lead:{leadId:c.id,blockSha256:c.blockSha256,blockIndex:c.blockIndex,valueOffset:c.valueOffset,value:c.value,unit,
  dimension:declared??'not_established',dimensionBasis:declared?'publisher_table_header':'not_established',
  targetScope:c.publisherDeclaredTargetScope??'not_established',condition:c.condition,instrument:c.instrument,methodCue:c.methodCue,
  subjectAssignment:c.subjectAssignment,subject:c.subject}};
}
/** A lead is associated with the page's main product only when its subject IS that product's recorded identity and the
 * probe assigned it from the page context or from a table row naming that model. Anything else stays unresolved. */
export function subjectAssociation265(l:ScreenedLead265,page:{name:string;model:string|null;sku:string|null}|null):
 'page_main_product_unverified'|'table_row_model_matches_page_product_unverified'|'subject_unresolved'{
 if(!page||!l.subject)return 'subject_unresolved';
 const same=l.subject.name===page.name&&(l.subject.model??null)===(page.model??null)&&(l.subject.sku??null)===(page.sku??null);
 if(!same)return 'subject_unresolved';
 return l.subjectAssignment==='page_context_unverified'?'page_main_product_unverified':
  l.subjectAssignment==='table_row_declared_model_unverified'?'table_row_model_matches_page_product_unverified':'subject_unresolved';
}
