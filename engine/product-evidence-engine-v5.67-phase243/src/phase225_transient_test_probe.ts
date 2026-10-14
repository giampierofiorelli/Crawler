/** Phase225: bounded, research-only ORIGINAL-TEST lead extraction from already
 * retrieved HTML. No second network request; no article body, sentence or quote
 * is persisted. Source claims, even first-person methodology, are NOT an
 * authenticated independent test. English-first. */
import {createHash} from 'node:crypto';
import {analyzeEnglishReview155} from './phase155_review_orchestrator.js';
import {safeMetadataUrl75} from './phase75_source_discovery.js';
import {probeTransientTestTables226} from './phase226_transient_test_tables.js';
const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const safeText=(s:string,n:number)=>s.length>0&&s.length<=n&&!/[<>\x00-\x1f]/.test(s);
const decode=(s:string)=>s.replace(/&#(x[0-9a-f]+|\d+);|&(amp|lt|gt|quot|apos|nbsp);/gi,(_a,num:string|undefined,named:string|undefined)=>{
 const known:{[key:string]:string}={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
 if(named)return known[named.toLowerCase()]??' ';
 const value=num!.toLowerCase().startsWith('x')?parseInt(num!.slice(1),16):parseInt(num!,10);
 return value>31&&value<=0x10ffff?String.fromCodePoint(value):' ';
});
const fragment=(v:string)=>decode(v.replace(/<[^>]{0,1800}>/g,' ').replace(/\s+/g,' ').trim());
const urlOk=(v:string)=>{try{const u=new URL(v);return safeMetadataUrl75(v,u.hostname);}catch{return false;}};
const candidateNumeric=/\b(\d{1,7}(?:\.\d{1,3})?)\s*(mm|cm|kg|g|litres?|liters?|l|db(?:a)?|%|minutes?|hours?|seconds?|ms|watts?|w|kwh|mah|°c)\b/gi;
const negated= /\b(?:did not test|was not tested|have not tested|not measured|no measurements|not yet tested|planned to test|we will test|didn't test)\b/i;
const secondary=/\b(?:manufacturer (?:claims|states|reports|says)|advertised|marketing (?:material|claims)|press release|according to the manufacturer|specification sheet|quoted by|other reviewers measured|competitor|rather than the tested)\b/i;
const claimedMethod=/\b(?:we (?:tested|measured|recorded|timed|weighed)|our (?:test|tests|measurements|testing)|during (?:our )?testing|in (?:our|the) (?:lab|test)|test (?:method|protocol|procedure|results)|measured (?:using|with)|was (?:tested|measured) (?:with|using))\b/i;
const numericReported=/\b(?:we (?:measured|recorded|timed|weighed|found)|our (?:test|tests|measurements) (?:recorded|showed|found|gave|yielded)|during (?:our )?testing|in (?:our|the) test)\b/i;
const instrumentRe=/\b(?:using|with) (?:a|an|the|our)\s+((?:(?:calibrated|digital|handheld|laboratory|electronic|precision|sound|laser)\s+){0,3}(?:scale|meter|gauge|sensor|thermometer|timer|stopwatch|caliper|rig))\b/i;
const conditionRe=/\b(?:at|under)\s+(\d{1,5}(?:\.\d{1,2})?\s*(?:°c|%|kg|g|mm|cm|hours?|minutes?|w))\b/i;
const headingCue=/\b(?:test(?:ing)? (?:method|procedure|results|protocol)|methodology|how we tested|our tests|lab results)\b/i;
export interface TestCandidate225 {
 id:string;sourceUrl:string;documentSha256:string|null;
 /** Hash of the small source block, not a stored quote or article excerpt. */
 blockSha256:string;blockIndex:number;valueOffset:number;
 value:number;unit:string;instrument:string|null;condition:string|null;
 /** Table-header interpretation only; not an independently verified measurand. */
 publisherDeclaredDimension?:'mass'|'volume'|'noise'|'duration'|'length'|'power'|'energy'|'other';
 publisherDeclaredTargetScope?:'compartment_unspecified'|'whole_product_unspecified';
 methodCue:'first_person_test_statement'|'test_section_with_method_cue'|'bounded_table_result_with_local_method';
 subject:{name:string;model:string|null;sku:string|null}|null;
 subjectAssignment:'page_context_unverified'|'multiple_models_unresolved'|'not_identified'|'table_row_declared_model_unverified';
 classification:'publisher_reported_measurement_lead_only';
 methodReviewed:false;originalWorkReviewed:false;reviewerIndependent:false;
 exactVariantVerified:false;market:'unknown';scientificEvidenceAdmitted:false;rankingAuthorized:false;
 }
export interface TestProbe225 {
 schema:'pee225.transient-test-probe.v1';sourceUrl:string;
 candidates:readonly TestCandidate225[];
 methodBlocks:number;instrumentBlocks:number;existingPhase155MeasurementLeads:number;
 tableResults226:number;ambiguousTablesSkipped226:number;
 blockingReasons:readonly string[];truncated:boolean;
 sourceBodyRetained:false;sourcePassagesRetained:false;
 independenceAuthenticated:false;protocolAuthenticated:false;rankingAuthorized:false;
 }
export function probeTransientTestContent225(html:string,sourceUrl:string,opts:{
  documentSha256?:string|null;
  productLeads?:readonly {name:string;model:string|null;sku:string|null}[];
}={}):TestProbe225 {
 const empty=():TestProbe225=>({schema:'pee225.transient-test-probe.v1',sourceUrl,candidates:[],
  methodBlocks:0,instrumentBlocks:0,existingPhase155MeasurementLeads:0,
  tableResults226:0,ambiguousTablesSkipped226:0,
  blockingReasons:['no_authenticated_original_professional_test'],truncated:false,
  sourceBodyRetained:false,sourcePassagesRetained:false,independenceAuthenticated:false,
  protocolAuthenticated:false,rankingAuthorized:false});
 const out=empty();
 if(!urlOk(sourceUrl)||typeof html!=='string'||html.length>850000||!/<html\b/i.test(html)||
   (opts.documentSha256!==undefined&&opts.documentSha256!==null&&!/^[a-f0-9]{64}$/.test(opts.documentSha256)))return out;
 // Intentionally restrict to semantic paragraphs/list cells and headings.
 // This is NOT a general HTML or JavaScript renderer.
 const stripped=html.replace(/<!--([\s\S]*?)-->/g,'').replace(/<(script|style|svg|template|noscript|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 const raw=[...stripped.matchAll(/<(p|li|td|h[1-6])\b[^>]{0,1200}>([\s\S]{0,4000}?)<\/\1\s*>/gi)];
 const all=raw.slice(0,380).map(m=>fragment(m[2])).filter(x=>x.length>0&&x.length<=1400);
 out.truncated=raw.length>380;
 const leads=opts.productLeads??[];
 const distinct=[...new Map(leads.filter(p=>safeText(p.name,180)).map(p=>[JSON.stringify([p.name,p.model,p.sku]),p])).values()];
 const subject=distinct.length===1?{name:distinct[0].name,model:distinct[0].model,sku:distinct[0].sku}:null;
 const scope:TestCandidate225['subjectAssignment']=distinct.length>1?'multiple_models_unresolved':subject?'page_context_unverified':'not_identified';
 let previousHeading='';let methodBlocks=0,instrumentBlocks=0;
 const records:TestCandidate225[]=[];const seen=new Set<string>();
 for(let i=0;i<all.length;i++){
  const line=all[i];if(line.length>900)continue;
  if(headingCue.test(line)&&line.length<90)previousHeading=line;
  if(negated.test(line)||secondary.test(line))continue;
  const method=claimedMethod.test(line);if(method)methodBlocks++;
  const instrument=instrumentRe.exec(line)?.[1]?.toLowerCase()??null;
  if(instrument)instrumentBlocks++;
  const explicitNumeric=numericReported.test(line);
  // A heading alone or a measurement figure without first-person method evidence
  // cannot be promoted into an original test lead.
  if(!method||!explicitNumeric)continue;
  const condition=conditionRe.exec(line)?.[1]?.toLowerCase()??null;
  const blockHash=sha(line);let count=0;
  for(const m of line.matchAll(candidateNumeric)){
   if(++count>8){out.truncated=true;break;}
   const value=Number(m[1]);if(!Number.isFinite(value)||value<0||value>1e7)continue;
   // Ambient temperatures explicitly introduced as test conditions are not outcome measures.
   if(m[2].toLowerCase()==='°c'&&/\b(?:at|under)\s*$/i.test(line.slice(Math.max(0,m.index!-12),m.index!)))continue;
   const unit=m[2].toLowerCase();
   const id=sha(JSON.stringify([sourceUrl,blockHash,m.index,value,unit,subject]));
   if(seen.has(id))continue;seen.add(id);
   records.push({id,sourceUrl,documentSha256:opts.documentSha256??null,blockSha256:blockHash,blockIndex:i,
    valueOffset:m.index??0,value,unit,instrument,condition,methodCue:headingCue.test(previousHeading)?'test_section_with_method_cue':'first_person_test_statement',
    subject,subjectAssignment:scope,classification:'publisher_reported_measurement_lead_only',
    methodReviewed:false,originalWorkReviewed:false,reviewerIndependent:false,
    exactVariantVerified:false,market:'unknown',scientificEvidenceAdmitted:false,rankingAuthorized:false});
   if(records.length>=20){out.truncated=true;break;}
  }
  if(records.length>=20)break;
 }
 // Reuse the established Phase155 English reader as a *separate diagnostic*.
 // Its domain-specific inventory is incomplete and must never be promoted.
 let oldCount=0;
 const limited=all.join('\n\n').slice(0,14000);
 if(limited.trim()){
  try{
   const analyzed=analyzeEnglishReview155({document:{text:limited,sha256:sha(limited),
    source:{id:'phase225_probe',originalDocumentId:'phase225_transient',url:sourceUrl,
     title:subject?.name??'Unverified product review',role:'original_product_test'}}});
   oldCount=analyzed.measurements.length;
  }catch{/* diagnostic failure cannot manufacture findings or block source acquisition */}
 }
 const table=probeTransientTestTables226(html,sourceUrl,opts);
 for(const c of table.candidates){if(records.length>=20){out.truncated=true;break;}
  if(!seen.has(c.id)){seen.add(c.id);records.push(c);}}
 out.truncated ||= table.truncated;
 const reasons=['no_authenticated_original_professional_test','method_and_test_origin_need_review',
  'product_variant_market_and_protocol_not_verified'];
 if(!records.length)reasons.push('no_conservative_explicit_test_measurement_candidates');
 if(scope!=='page_context_unverified')reasons.push('test_subject_ambiguous_or_missing');
 if(out.truncated)reasons.push('bounded_test_content_coverage_incomplete');
 return {...out,candidates:records.sort((a,b)=>a.id.localeCompare(b.id)),methodBlocks,instrumentBlocks,
  existingPhase155MeasurementLeads:oldCount,tableResults226:table.candidates.length,
  ambiguousTablesSkipped226:table.skippedAmbiguousTables,blockingReasons:reasons};
}
