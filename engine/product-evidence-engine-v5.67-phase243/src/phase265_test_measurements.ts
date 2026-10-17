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
import type {TestCandidate225,TestProbe225,ConditionCode225} from './phase225_transient_test_probe.js';
import {comparativeResults270,type ComparativeResult270,type ApplianceClass270} from './phase270_comparative_results.js';
import {probeTransientTestContent225,textBlocks225,type ProductMention272} from './phase225_transient_test_probe.js';
import {createHash} from 'node:crypto';
import {TEST_CONTEXT272,planContentDigest272,type ExtractionPlan272} from './phase272_extraction_plan.js';
import {structuredTableLeads1D2,type DocumentSemantics1D2} from './document_semantics.js';
import type {SpecExtraction245} from './phase245_spec_extraction.js';

/** Version of the lead extraction the store records per measurement (Phase225 prose + Phase226 tables + Phase227
 * explicit header links). A change re-derives the measurements of a revision whose bytes are offered again. */
export const TEST_LEAD_EXTRACTOR265='pee225-probe.v2+pee226-tables.v1+pee227-headers';
/** Original roadmap Step 3 — versioned scientific reading. The code versions of the readers that run only with a plan:
 * the Phase272 guided pass of the Phase225 probe with the plan's condition-term filter and the comparison-cell
 * re-attribution (comparisonCells272), and the Step 1D-A2 semantic-document contract with its structured table reader.
 * A change to either reader's behaviour must change its constant. */
export const GUIDED_READER272_VERSION='pee225-guided272.v1+pee265-cells272.v1';
export const SEMANTIC_TABLES1D2_VERSION='pee.document-semantics.v1d2+tables1d2.v1';
/** The complete configuration that determines which test leads a plan-guided reading produces. It names knowledge by
 * digest only (no plan text, no page content), so it may be journaled and published. */
export interface ReadingConfiguration265 {schema:'pee.reading-configuration.v1';baseReader:string;guidedReader:string;
 /** The plan by content: `contentDigest` is recomputed from what the plan contains; `compiledDigest` is the label the plan
  * carries; `digestVerified` says whether they agree (a compiled, unedited plan). */
 plan:{schema:string;categoryId:string;contentDigest:string;compiledDigest:string;digestVerified:boolean};
 semanticReading:string|null}
const canonical=(x:unknown):string=>x===null||typeof x!=='object'?JSON.stringify(x):Array.isArray(x)?'['+x.map(canonical).join(',')+']':
 '{'+Object.keys(x as object).sort().map(k=>JSON.stringify(k)+':'+canonical((x as Record<string,unknown>)[k])).join(',')+'}';
/** The reading configuration of one call, or null when no plan is used (the historical, unversioned path). */
// Not part of the identity, because neither changes which candidates are produced: the exploratory pass (research leads,
// never candidates, never persisted) and the page category (used only by the comparative reader, versioned separately).
export function readingConfiguration265(opts:{plan?:ExtractionPlan272;semantics?:unknown}):ReadingConfiguration265|null{
 if(!opts.plan)return null;const contentDigest=planContentDigest272(opts.plan);
 return {schema:'pee.reading-configuration.v1',baseReader:TEST_LEAD_EXTRACTOR265,guidedReader:GUIDED_READER272_VERSION,
  plan:{schema:String(opts.plan.schema),categoryId:String(opts.plan.categoryId),contentDigest,compiledDigest:String(opts.plan.compiledFrom?.digest??''),digestVerified:opts.plan.compiledFrom?.digest===contentDigest},
  semanticReading:opts.semantics?SEMANTIC_TABLES1D2_VERSION:null};
}
/** The extractor version of a plan-guided reading: the base version plus a 96-bit digest of the canonical EFFECTIVE
 * configuration (75 characters, within the store's 80): reader versions, the plan's schema, category and content digest,
 * and the semantic reading. Identical effective inputs give identical versions; any material difference gives a different
 * one. The plan's own label (`compiledDigest`, `digestVerified`) is provenance, not an input, and is not hashed. The
 * configuration is journaled with the ingest, so the version is recoverable and checkable. */
export function readingIdentity265(c:ReadingConfiguration265):string{
 const effective={schema:c.schema,baseReader:c.baseReader,guidedReader:c.guidedReader,plan:{schema:c.plan.schema,categoryId:c.plan.categoryId,contentDigest:c.plan.contentDigest},semanticReading:c.semanticReading};
 return c.baseReader+'+r1:'+createHash('sha256').update(canonical(effective)).digest('hex').slice(0,24);}
export interface TestLeadsInput265 {extractorVersion:string;probe:TestProbe225;
 /** Step 3: present only for a plan-guided reading. `extractorVersion` is then readingIdentity265(readingConfiguration). */
 readingConfiguration?:ReadingConfiguration265;
 /** Step 3: the comparative reader does not use the plan; its rows keep the base reader's version. */
 comparativeReaderVersion?:string;
 /** Phase270: comparative results (several appliances per task). Extraction leads only: the store does not retain them
  * (an appliance-class result is not a product measurement; see the Phase270 report). */
 comparative270?:readonly ComparativeResult270[]}
export type SourceKind265='manufacturer'|'retailer'|'independent_original_test'|'editorial'|'community'|
 'promotional_announcement'|'reference_encyclopedia'|'unknown';

/** The page's own main product as a Phase225 product lead (exactly the identity the store records), or null when the
 * page names no single product. Builders pass it to the probe; the store re-checks every lead against it. */
export function pageProductLead265(x:SpecExtraction245|null):{name:string;model:string|null;sku:string|null}|null{
 if(!x||!x.mainProduct.name||x.mainProduct.ambiguous)return null;
 const ids=x.mainProduct.identifiers??{};
 return {name:x.mainProduct.name,model:ids.model??ids.mpn??null,sku:ids.sku??null};
}
/** Phase268: the tested product of a single-product test document. Test publishers mark up the review headline as the
 * product name ("Typhur Dome 2 AF03 Air Fryer review: A design-led ..."); taken as is, the store would record the
 * headline as a product identity. For an article page of a test publisher, the English convention "<product> review:
 * <tagline>" names the subject; a single model-code token in it becomes the declared model. Nothing else changes, and a
 * page that does not follow the convention keeps its extraction unchanged. */
const MODEL_TOKEN=/^(?=[A-Z0-9/-]{4,16}$)[A-Z]{1,5}[A-Z0-9]*\d[A-Z0-9]*(?:\/[0-9A-Z]{1,4})?$/;
export function testDocumentSubject268(x:SpecExtraction245|null,sourceType:SourceKind265|string):SpecExtraction245|null{
 if(!x||sourceType!=='independent_original_test'||!x.mainProduct.name||x.mainProduct.ambiguous||x.mainProduct.pageSignals?.ogType!=='article')return x;
 const m=/^(.{3,140}?)\s+review\s*(?:[:|–—-]\s|$)/i.exec(x.mainProduct.name.replace(/\u00a0/g,' '));
 // Phase271: a comparison, guide, method or question article ("Air fryer vs oven: …", "How we test …", "Do air fryers use
 // a lot of electricity?") is not a product; its headline never becomes a product identity.
 if(!m&&/\b(?:vs\.?|versus|compared|how we test|best\b.*\b(?:for|of|20\d\d)|buying guide)\b|\?\s*$|^(?:the )?best\b/i.test(x.mainProduct.name))
  return {...x,mainProduct:{...x.mainProduct,ambiguous:true}};
 if(!m)return x;
 const name=m[1].replace(/\s+/g,' ').trim();
 const tokens=name.split(/[\s()]+/).filter(t=>MODEL_TOKEN.test(t));
 const ids={...x.mainProduct.identifiers};if(tokens.length===1&&!ids.model)ids.model=tokens[0];
 return {...x,mainProduct:{...x.mainProduct,name,identifiers:ids}};
}
/** Phase272: the products a document names in its headline and headings ("LG C6", "Samsung S85F", "AirDoctor 3000"): a
 * capitalised brand word followed by a model code containing a digit (years excluded). Used only by plan-guided reading,
 * to attribute a value to the product its own clause names; never to merge products. */
export function documentMentions272(html:string):ProductMention272[]{
 const {blocks,tags=[]}=textBlocks225(html,{withTags:true,maxBlocks:1500});const out=new Map<string,ProductMention272>();
 const NOT_BRAND=/^(?:The|A|An|I|We|My|Our|Best|Review|Tested|Vs|And|With|Top|New|Why|How|What|This|Is|It|In|On|For|Of|To|Series)$/;
 // Phase272 (after the untouched first run; tuned): products a review compares in its body or table headers ("the B5
 // reached …", "LG B5 | LG C6") are document products too, when their brand + code recurs (two or more blocks).
 const body=new Map<string,{m:ProductMention272;n:number}>();
 blocks.forEach((b,i)=>{if(/^h[1-3]$/.test(tags[i]??''))return;
  for(const m of b.matchAll(/\b([A-Z][A-Za-z]+)\s+((?=[A-Z0-9-]*\d)[A-Z0-9][A-Z0-9-]{1,15})\b/g)){
   if(/^(?:The|A|An|I|We|My|Our|Best|Review|Tested|Vs|And|With|Top|New|Why|How|What|This|Is|It|In|On|For|Of|To|Series|Speed|Mode|Level|Step|Setting|Version|Model|Page|Rated|Rec|Delta|HDR|SDR|Dolby|HDMI|Wi|USB)$/.test(m[1])||/^(?:19|20)\d\d$/.test(m[2]))continue;
   const e=body.get(m[2])??{m:{name:m[1]+' '+m[2],model:m[2]},n:0};e.n++;body.set(m[2],e);}});
 blocks.forEach((b,i)=>{if(!/^h[1-3]$/.test(tags[i]??''))return;
  for(const m of b.matchAll(/\b([A-Z][A-Za-z]+)\s+((?=[A-Z0-9-]*\d)[A-Z0-9][A-Z0-9-]{1,15})\b/g)){
   if(NOT_BRAND.test(m[1])||/^(?:19|20)\d\d$/.test(m[2]))continue;const k=m[2];if(!out.has(k))out.set(k,{name:m[1]+' '+m[2],model:m[2]});}});
 // A code printed once (a heading typo, a passing comparison) does not make a second product of the document.
 for(const [k,e] of body)if(!out.has(k)&&e.n>=2)out.set(k,e.m);
 const all=blocks.join('\n');
 return [...out.values()].filter(m=>(all.match(new RegExp('\\b'+m.model.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','g'))??[]).length>=2);
}
/** Phase272 (after the untouched first run; tuned): comparison tables. A table whose header row names two or more products
 * ("LG B6 | LG B5 | LG C6") reports each column's values for that column's product; a value read from such a cell is
 * attributed to its column, and a cell text found in several columns stays unresolved. Never the page product by default. */
export function comparisonCells272(html:string):Map<string,{name:string}|null>{
 const out=new Map<string,{name:string}|null>();const strip=(x:string)=>textBlocks225(`<p>${x}</p>`).blocks.join(' ').trim();
 for(const t of html.matchAll(/<table\b[\s\S]{0,60000}?<\/table>/gi)){
  const rows=[...t[0].matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map(r=>[...r[0].matchAll(/<(t[hd])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(c=>strip(c[2])));
  if(rows.length<2)continue;const head=rows[0];
  const prod=head.map(h=>/^[A-Z][A-Za-z+&-]*(?:\s+[A-Za-z0-9+&.-]+){1,5}$/.test(h)&&/\d|[A-Z]{2}/.test(h.split(/\s+/).slice(1).join(' '))?h:null);
  if(prod.filter(Boolean).length<2)continue;
  for(const r of rows.slice(1))r.forEach((cell,j)=>{if(!cell||j>=prod.length||!prod[j])return;const prev=out.get(cell);
   out.set(cell,prev===undefined||prev?.name===prod[j]?{name:prod[j]!}:null);});
 }
 return out;
}
/** Phase272 (plan only): the page subject when the headline is a sentence: the one product it names, none when it names
 * several (each value then binds to its own clause), unchanged otherwise. */
export function planPageSubject272<T extends {name:string;model:string|null}>(lead:T|null,mentions:readonly ProductMention272[]):T|{name:string;model:string;sku:null}|null{
 if(!lead||!(/^['‘“"]|\b(?:I|we)\b|:/.test(lead.name)||lead.name.split(/\s+/).length>9)||!mentions.length)return lead;
 const inName=mentions.filter(m=>new RegExp('\\b'+m.model+'\\b').test(lead.name));
 return inName.length===1?{name:inName[0].name,model:inName[0].model,sku:null}:inName.length>1?null:lead;
}
/** Run the existing Phase225 probe (which runs Phase226/227) on transient bytes. Nothing of the body is returned.
 * Phase272: `plan` (the category's extraction plan, compiled from the store before reading) and `exploratory` are passed
 * to the same readers; without them the behaviour is exactly the Phase271 one. */
export function testLeadsFromHtml265(html:string,url:string,sha256:string,x:SpecExtraction245|null,opts:{category?:string|null;plan?:ExtractionPlan272;exploratory?:boolean;
 /** Step 1D-A2 (with a plan only; evaluation or shadow): the page's semantic-document contract. Its test-table cells are
  * read through the Phase245 grid with their own labels. Such leads carry methodCue 'structured_table_measurement_term',
  * which the persistence screen (screenTestLead265) does not admit, so nothing they find reaches the store. */
 semantics?:DocumentSemantics1D2}={}):TestLeadsInput265{
 let lead=pageProductLead265(x);
 const mentions=opts.plan?documentMentions272(html):[];
 // Phase272 (plan only): a headline that is a sentence ("I tested the LG C6 and LG C5 side-by-side") is not a product name:
 // one named product becomes the page subject, several leave each value to its own clause.
 if(opts.plan)lead=planPageSubject272(lead,mentions) as typeof lead;
 const tested=({air_fryers:'air_fryer',ovens:'oven',microwaves:'microwave',slow_cookers:'slow_cooker',halogen_ovens:'halogen_oven'} as Record<string,ApplianceClass270>)[opts.category??''];
 const comparative=comparativeResults270(html,{testedClass:tested}).results;
 const probe=probeTransientTestContent225(html,url,{documentSha256:sha256,productLeads:lead?[lead]:[],
  ...(opts.plan?{plan:opts.plan,mentions}:{}),...(opts.exploratory?{exploratory:true}:{})});
 if(opts.plan){const cells=comparisonCells272(html);if(cells.size){const deep=textBlocks225(html,{maxBlocks:1500}).blocks;
  probe.candidates=probe.candidates.map(c=>{const cell=cells.get((deep[c.blockIndex]??'').trim());if(cell===undefined)return c;
   return cell?{...c,subject:{name:cell.name,model:null,sku:null},subjectAssignment:'clause_named_model_unverified' as const}:{...c,subject:null,subjectAssignment:'multiple_models_unresolved' as const};});}}
 if(opts.plan&&opts.semantics){const deep=textBlocks225(html,{maxBlocks:1500}).blocks;
  const extra=structuredTableLeads1D2(opts.semantics,opts.plan,{sourceUrl:url,documentSha256:sha256,blocks:deep,documentReportsTesting:deep.some(b=>TEST_CONTEXT272.test(b))});
  const seen=(c:TestCandidate225)=>probe.candidates.some(o=>o.blockIndex===c.blockIndex&&o.value===c.value&&o.unit.toLowerCase()===c.unit);
  probe.candidates=[...probe.candidates,...extra.filter(c=>!seen(c))];}
 // Step 3: a plan-guided reading is versioned by its configuration; the no-plan output is unchanged.
 const cfg=readingConfiguration265({plan:opts.plan,semantics:opts.semantics});
 return {extractorVersion:cfg?readingIdentity265(cfg):TEST_LEAD_EXTRACTOR265,probe,...(comparative.length?{comparative270:comparative}:{}),
  ...(cfg?{readingConfiguration:cfg,comparativeReaderVersion:TEST_LEAD_EXTRACTOR265}:{})};
}

const UNITS:Readonly<Record<string,string>>={mm:'mm',cm:'cm',kg:'kg',g:'g',l:'l',litre:'l',litres:'l',liter:'l',liters:'l',db:'db',dba:'dba',
 '%':'%',minute:'minutes',minutes:'minutes',hour:'hours',hours:'hours',second:'seconds',seconds:'seconds',ms:'ms',w:'w',watt:'w',watts:'w',
 kwh:'kwh',mah:'mah','°c':'°c',
 // Phase272: units of the generic physical lexicon (src/phase272_extraction_plan.ts) that plan-guided reading may report.
 decibel:'db',decibels:'db','db(a)':'db',nits:'nits','cd/m2':'nits','cd/m²':'nits',cfm:'cfm','m3/h':'m3/h','m³/h':'m3/h',hz:'hz',wh:'wh',ml:'ml',mins:'minutes',min:'minutes',hrs:'hours'};
export const normalizeUnit265=(u:string):string|null=>UNITS[String(u).toLowerCase()]??null;
/** Units a publisher-declared dimension can be expressed in; anything else is a mismatch, never a conversion. */
const DIMENSION_UNITS:Readonly<Record<string,readonly string[]>>={mass:['g','kg'],volume:['l'],noise:['db','dba'],
 duration:['ms','seconds','minutes','hours'],length:['mm','cm'],power:['w'],energy:['kwh','wh'],
 luminance:['nits'],airflow:['cfm','m3/h'],frequency:['hz']};
const TOKEN=/^[a-z0-9 .°%]{1,40}$/;
const CODES:readonly ConditionCode225[]=['setpoint_c','duration_1h','load_empty','from_cold','all_compartments','single_compartment','includes_preheat','power_meter','conditions_from_block'];
const codesOk=(x:unknown)=>x===undefined||(Array.isArray(x)&&x.length<=CODES.length&&x.every(c=>CODES.includes(c)));
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
 /** Phase268: PEE-authored condition codes of the value and of the document's own protocol; setpoint in °C. */
 conditionCodes:readonly ConditionCode225[];protocolCodes:readonly ConditionCode225[];setpointC:number|null;
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
  c.value<0||c.value>1e7||!['first_person_test_statement','test_section_with_method_cue','bounded_table_result_with_local_method','energy_result_with_document_protocol','plan_guided_measurement_term'].includes(c.methodCue)||
  !codesOk(c.conditionCodes)||!codesOk(c.documentProtocolCodes)||(c.setpointC!==undefined&&c.setpointC!==null&&!(Number.isInteger(c.setpointC)&&c.setpointC>=20&&c.setpointC<=400))||
  !['page_context_unverified','multiple_models_unresolved','not_identified','table_row_declared_model_unverified','clause_named_model_unverified'].includes(c.subjectAssignment)||
  (c.condition!==null&&!TOKEN.test(String(c.condition)))||(c.instrument!==null&&!TOKEN.test(String(c.instrument))))return {ok:false,reason:'malformed_lead'};
 const unit=normalizeUnit265(c.unit);if(!unit)return {ok:false,reason:'unit_not_recognised'};
 const declared=c.publisherDeclaredDimension&&c.publisherDeclaredDimension!=='other'?c.publisherDeclaredDimension:null;
 if(declared&&!(DIMENSION_UNITS[declared]??[]).includes(unit))return {ok:false,reason:'unit_dimension_mismatch'};
 return {ok:true,lead:{leadId:c.id,blockSha256:c.blockSha256,blockIndex:c.blockIndex,valueOffset:c.valueOffset,value:c.value,unit,
  dimension:declared??'not_established',dimensionBasis:declared?'publisher_table_header':'not_established',
  targetScope:c.publisherDeclaredTargetScope??'not_established',condition:c.condition,instrument:c.instrument,methodCue:c.methodCue,
  subjectAssignment:c.subjectAssignment,subject:c.subject,conditionCodes:[...(c.conditionCodes??[])],protocolCodes:[...(c.documentProtocolCodes??[])],
  setpointC:c.setpointC??null}};
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
