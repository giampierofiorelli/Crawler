/** Phase225: bounded, research-only ORIGINAL-TEST lead extraction from already
 * retrieved HTML. No second network request; no article body, sentence or quote
 * is persisted. Source claims, even first-person methodology, are NOT an
 * authenticated independent test. English-first. */
import {PAGE_MAX_BYTES} from './approved_web_reader.js';
import {createHash} from 'node:crypto';
import {analyzeEnglishReview155} from './phase155_review_orchestrator.js';
import {safeMetadataUrl75} from './phase75_source_discovery.js';
import {probeTransientTestTables226} from './phase226_transient_test_tables.js';
import {unitAlternation272,canonicalUnit272,dimensionOfUnit272,DIMENSION_WORDS272,DECLARATION_CUE272,TEST_CONTEXT272,rangeOrBound272,
 planWords272,EXPLORATORY_UNITS272,conditionTerms272,stem272,type ExtractionPlan272} from './phase272_extraction_plan.js';
const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const safeText=(s:string,n:number)=>s.length>0&&s.length<=n&&!/[<>\x00-\x1f]/.test(s);
// Phase268: "200&deg;C" decoded to "200 C" and lost every temperature; the common typographic entities are read.
const decode=(s:string)=>s.replace(/&#(x[0-9a-f]+|\d+);|&(amp|lt|gt|quot|apos|nbsp|deg|ordm|rsquo|lsquo|rdquo|ldquo|ndash|mdash|pound|euro|frac12|times);/gi,(_a,num:string|undefined,named:string|undefined)=>{
 const known:{[key:string]:string}={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',deg:'°',ordm:'°',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',
  ndash:'–',mdash:'—',pound:'£',euro:'€',frac12:'½',times:'×'};
 if(named)return known[named.toLowerCase()]??' ';
 const value=num!.toLowerCase().startsWith('x')?parseInt(num!.slice(1),16):parseInt(num!,10);
 return value>31&&value<=0x10ffff?String.fromCodePoint(value):' ';
});
// Phase268: the masculine ordinal (º) is a common typing of the degree sign ("200ºC").
const fragment=(v:string)=>decode(v.replace(/<[^>]{0,1800}>/g,' ').replace(/\s+/g,' ').trim()).replace(/º/g,'°');
const urlOk=(v:string)=>{try{const u=new URL(v);return safeMetadataUrl75(v,u.hostname);}catch{return false;}};
// Phase265: the unit ends at a non-alphanumeric character, not at a word boundary: "80 %" followed by a space has no
// word boundary after '%' and was never matched.
// Phase268: a number never starts inside another number ("2,000W" was read as 0 W); thousands separators are read.
const candidateNumeric=/(?<![\d.,])(\d{1,3}(?:,\d{3})+(?:\.\d{1,3})?|\d{1,7}(?:\.\d{1,3})?)\s*(mm|cm|kg|g|litres?|liters?|l|db(?:a)?|%|minutes?|hours?|seconds?|ms|watts?|w|kwh|mah|°c)(?![a-z0-9])/gi;
const negated= /\b(?:did not test|was not tested|have not tested|not measured|no measurements|not yet tested|planned to test|we will test|didn't test)\b/i;
const secondary=/\b(?:manufacturer (?:claims|states|reports|says)|advertised|marketing (?:material|claims)|press release|according to the manufacturer|specification sheet|quoted by|other reviewers measured|competitor|rather than the tested)\b/i;
// Phase268: single named testers write in the first person singular ("I measured", "in my tests", "in tests").
const claimedMethod=/\b(?:(?:we|I) (?:tested|measured|recorded|timed|weighed)|(?:our|my) (?:[a-z]+ ){0,2}(?:test|tests|measurements|testing)|in tests\b|during (?:our )?testing|in (?:our|the) (?:lab|test)|test (?:method|protocol|procedure|results)|measured (?:using|with)|was (?:tested|measured) (?:with|using))\b/i;
const numericReported=/\b(?:(?:we|I) (?:measured|recorded|timed|weighed|found)|(?:our|my) (?:test|tests|measurements) (?:recorded|showed|found|gave|yielded)|during (?:our )?testing|in (?:(?:our|the|my) (?:[a-z]+ ){0,2})?tests?)\b/i;
const instrumentRe=/\b(?:using|with) (?:a|an|the|our)\s+((?:(?:calibrated|digital|handheld|laboratory|electronic|precision|sound|laser)\s+){0,3}(?:scale|meter|gauge|sensor|thermometer|timer|stopwatch|caliper|rig))\b/i;
const conditionRe=/\b(?:at|under)\s+(\d{1,5}(?:\.\d{1,2})?\s*(?:°c|%|kg|g|mm|cm|hours?|minutes?|w))\b/i;
const headingCue=/\b(?:test(?:ing)? (?:method|procedure|results|protocol)|methodology|how (?:we|I) tested|our tests|lab results)\b/i;
/** Phase268: a document-level first-person ENERGY protocol (who measures, with what, how). A kWh result sentence elsewhere
 * in the same document ("one hour's usage at 200°C consumed N kWh") is linked to it only when it states a result verb. */
const energyProtocol=/\b(?:I|we)\b[^.]{0,120}\b(?:power|energy|plug-in)\s+(?:meter|monitor)\b/i;
const energyResult=/\b(?:consumed|used|drew|showed a consumption)\b/i;
/** PEE-authored condition codes (never source text): what a result was measured under. */
export type ConditionCode225='setpoint_c'|'duration_1h'|'load_empty'|'from_cold'|'all_compartments'|'single_compartment'|'includes_preheat'|'power_meter'|
 'conditions_from_block';
const ALL_C=/\bboth (?:drawers|baskets|pans|zones|compartments)\b/i,ONE_C=/\b(?:a single (?:basket|drawer|pan|zone)|single (?:basket|drawer|pan|zone)|(?:the |one )(?:small|smaller|larger|large) (?:pan|basket|drawer)|one (?:basket|drawer|zone))\b/i;
const HOUR=/\b(?:one|1|an|a full|full) hour(?:'s|’s)?\b|\bfor (?:an|one|1) hour\b/i;
function codesOf(text:string,segment:string):{codes:ConditionCode225[];setpointC:number|null}{
 const c=new Set<ConditionCode225>();const sp=/\bat (\d{2,3})\s*°c\b/i.exec(text);
 if(sp)c.add('setpoint_c');if(HOUR.test(text))c.add('duration_1h');if(/\bempty\b/i.test(text))c.add('load_empty');
 if(/\bfrom cold\b/i.test(text))c.add('from_cold');if(/\bpreheat/i.test(text))c.add('includes_preheat');
 if(/\b(?:power|energy|plug-in)\s+(?:meter|monitor)\b/i.test(text))c.add('power_meter');
 const segAll=ALL_C.test(segment),segOne=ONE_C.test(segment);
 if(segAll!==segOne){c.add(segAll?'all_compartments':'single_compartment');}
 return {codes:[...c].sort(),setpointC:sp?Number(sp[1]):null};
}
/** The clause of a sentence that belongs to one value when the sentence reports several ("A with both baskets and B
 * with a single basket"): from the delimiter after the previous value's clause to the delimiter after this value. */
function segmentFor(sentence:string,at:number,all:readonly number[]):string{
 const prev=all.filter(x=>x<at).pop();const next=all.find(x=>x>at);
 if(prev===undefined&&next===undefined)return sentence;
 const delim=/,\s| and /g;const after=(from:number)=>{delim.lastIndex=from;const m=delim.exec(sentence);return m?m.index:sentence.length;};
 const start=prev===undefined?0:Math.min(after(prev),at);const end=after(at);
 return sentence.slice(start,Math.max(end,at+1));
}
/** The bounded semantic text blocks (paragraphs, list items, cells, headings) the probe reads; shared with the Phase269
 * qualitative-observation pilot so both read exactly the same text. Transient: nothing here is retained. */
export function textBlocks225(html:string,opts:{splitLineBreaks?:boolean;withTags?:boolean;maxBlocks?:number}={}):{blocks:string[];truncated:boolean;tags?:string[]}{
 const stripped=html.replace(/<!--([\s\S]*?)-->/g,'').replace(/<(script|style|svg|template|noscript|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 const raw=[...stripped.matchAll(/<(p|li|td|th|h[1-6])\b[^>]{0,1200}>([\s\S]{0,4000}?)<\/\1\s*>/gi)].filter(m=>opts.splitLineBreaks||opts.withTags||m[1].toLowerCase()!=='th');
 // Phase270 (opt-in): lines separated by <br> inside one paragraph ("Oven – 36min, 31 cents<br>Air fryer – …") are
 // separate blocks; the tag of each block is reported so a reader can use headings as context.
 const cap=opts.maxBlocks??380;
 const parts=raw.slice(0,cap).flatMap(m=>(opts.splitLineBreaks?m[2].split(/<br\s*\/?>/i):[m[2]]).map(x=>({t:m[1].toLowerCase(),x:fragment(x)}))).filter(b=>b.x.length>0&&b.x.length<=1400);
 return {blocks:parts.map(b=>b.x),truncated:raw.length>cap,...(opts.withTags||opts.splitLineBreaks?{tags:parts.map(b=>b.t)}:{})};
}
export interface TestCandidate225 {
 /** Phase268: PEE-authored codes for the stated conditions of this value, the setpoint in °C, and the document's own
  * first-person protocol codes (when the document states one). Codes only; no text. */
 conditionCodes?:readonly ConditionCode225[];setpointC?:number|null;documentProtocolCodes?:readonly ConditionCode225[];
 /** Phase272 (plan only): taught condition ids whose distinctive terms the value's own sentence uses. A CUE that the condition
  * is stated, never proof that it is met; not retained by the store. */
 planConditionIds272?:readonly string[];
 id:string;sourceUrl:string;documentSha256:string|null;
 /** Hash of the small source block, not a stored quote or article excerpt. */
 blockSha256:string;blockIndex:number;valueOffset:number;
 value:number;unit:string;instrument:string|null;condition:string|null;
 /** Table-header interpretation only; not an independently verified measurand. */
 publisherDeclaredDimension?:'mass'|'volume'|'noise'|'duration'|'length'|'power'|'energy'|'other';
 publisherDeclaredTargetScope?:'compartment_unspecified'|'whole_product_unspecified';
 methodCue:'first_person_test_statement'|'test_section_with_method_cue'|'bounded_table_result_with_local_method'|'energy_result_with_document_protocol'|
  /** Phase272: accepted because the category's extraction plan names this unit's dimension and a taught term in the value's
   * own sentence (or its table label), in a document that reports first-hand testing. A plan is a reading prior, not evidence. */
  'plan_guided_measurement_term'|
  /** Step 1D-A2 (plan + document semantics only): a test-table cell read through the Phase245 grid, its unit and taught
   * term taken from the cell and its own row/column labels (src/document_semantics.ts). Not produced by default. */
  'structured_table_measurement_term';
 subject:{name:string;model:string|null;sku:string|null}|null;
 subjectAssignment:'page_context_unverified'|'multiple_models_unresolved'|'not_identified'|'table_row_declared_model_unverified'|
  /** Phase272 (plan only): the value's own clause names one of the document's products. */
  'clause_named_model_unverified';
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
 /** Phase272: digest of the extraction plan supplied before reading (absent: no plan). */
 planDigest272?:string;
 /** Phase272 exploratory pass: numbers with a generic unit and a generic reporting cue that no accepted candidate covers.
  * RESEARCH LEADS ONLY: never candidates, never stored as measurements, never ranking input. */
 exploratoryLeads272?:readonly {value:number;unit:string;blockIndex:number;blockSha256:string;subject:{name:string;model:string|null;sku:string|null}|null;status:'exploratory_research_lead'}[];
 }
/** Phase272: a product the document names (brand + model code from its headline or headings); per-value attribution only. */
export interface ProductMention272 {name:string;model:string}
const HYPOTHETICAL272=/\b(?:would|if you|could|might|per year|a year|annual(?:ly)?|each year|over (?:a|the) year)\b/i;
const REPORT_CUE272=/\b(?:measured|recorded|reached|peaked|clocked|took|needed|registered|used|consumed|pulls?|draws?|generates?|hit|ran at|came in at|our tests?|(?:we|i) found)\b/i;
export function probeTransientTestContent225(html:string,sourceUrl:string,opts:{
  documentSha256?:string|null;
  productLeads?:readonly {name:string;model:string|null;sku:string|null}[];
  /** Phase272: the category's extraction plan, supplied BEFORE reading (guided candidates); absent: the Phase268 reader. */
  plan?:ExtractionPlan272;
  /** Phase272: also run the generic exploratory pass (research leads for what no rule anticipated). */
  exploratory?:boolean;
  /** Phase272 (plan only): products the document names; a value whose own clause names one is attributed to it. */
  mentions?:readonly ProductMention272[];
}={}):TestProbe225 {
 const empty=():TestProbe225=>({schema:'pee225.transient-test-probe.v1',sourceUrl,candidates:[],
  methodBlocks:0,instrumentBlocks:0,existingPhase155MeasurementLeads:0,
  tableResults226:0,ambiguousTablesSkipped226:0,
  blockingReasons:['no_authenticated_original_professional_test'],truncated:false,
  sourceBodyRetained:false,sourcePassagesRetained:false,independenceAuthenticated:false,
  protocolAuthenticated:false,rankingAuthorized:false});
 const out=empty();
 if(!urlOk(sourceUrl)||typeof html!=='string'||html.length>PAGE_MAX_BYTES||!/<html\b/i.test(html)||
   (opts.documentSha256!==undefined&&opts.documentSha256!==null&&!/^[a-f0-9]{64}$/.test(opts.documentSha256)))return out;
 // Intentionally restrict to semantic paragraphs/list cells and headings.
 // This is NOT a general HTML or JavaScript renderer.
 const tb=textBlocks225(html);const all=tb.blocks;out.truncated=tb.truncated;
 const leads=opts.productLeads??[];
 const distinct=[...new Map(leads.filter(p=>safeText(p.name,180)).map(p=>[JSON.stringify([p.name,p.model,p.sku]),p])).values()];
 const subject=distinct.length===1?{name:distinct[0].name,model:distinct[0].model,sku:distinct[0].sku}:null;
 const scope:TestCandidate225['subjectAssignment']=distinct.length>1?'multiple_models_unresolved':subject?'page_context_unverified':'not_identified';
 let previousHeading='';let methodBlocks=0,instrumentBlocks=0;
 const protocolBlock=all.find(l=>l.length<=900&&energyProtocol.test(l)&&!negated.test(l));
 const protocolCodes:ConditionCode225[]|null=protocolBlock?codesOf(protocolBlock,protocolBlock).codes.filter(c=>c!=='all_compartments'&&c!=='single_compartment'):null;
 // "If the air fryer has two drawers, I will run both": the protocol runs every compartment.
 if(protocolCodes&&protocolBlock&&/\b(?:run|running) both\b/i.test(protocolBlock))protocolCodes.push('all_compartments');
 const records:TestCandidate225[]=[];const seen=new Set<string>();
 // Phase272: the plan widens the units read and admits a value whose sentence uses a taught term of that unit's dimension.
 const plan=opts.plan;
 // Both Phase272 passes read past the first 380 blocks (navigation-heavy pages put results after block 1000); the first 380
 // blocks are the same list, so block indices stay comparable with the Phase268 reader's.
 const deep=plan||opts.exploratory?textBlocks225(html,{maxBlocks:1500}).blocks:all;
 const docTest=!!plan&&deep.some(b=>TEST_CONTEXT272.test(b)||claimedMethod.test(b));
 const planRe=plan?new RegExp('(?<![\\d.,])(\\d{1,3}(?:,\\d{3})+(?:\\.\\d{1,3})?|\\d{1,7}(?:\\.\\d{1,3})?)\\s*('+unitAlternation272(plan.units)+')(?![a-z0-9])','gi'):null;
 const planTaught=(dim:string)=>new Set(plan?.measurements.filter(m=>m.dimensions.includes(dim)).flatMap(m=>m.terms)??[]);
 const clauseSubject=(sent:string,at:number)=>{const ms=opts.mentions??[];if(ms.length<2)return null;let best:{m:ProductMention272;i:number}|null=null;
  for(const m of ms){const re=new RegExp('\\b'+m.model.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','g');for(const x of sent.slice(0,at).matchAll(re))if(!best||x.index!>best.i)best={m,i:x.index!};}
  return best?{name:best.m.name,model:best.m.model,sku:null}:null;};
 const guided=(line:string,i:number,prevLabel:string)=>{
  if(!planRe||!docTest||negated.test(line)||secondary.test(line))return;
  const sentences=line.split(/(?<=[.!?])\s+(?=[A-Z£])/);let off=0;
  for(const sent of sentences){const base=off;off+=sent.length+1;
   for(const m of sent.matchAll(planRe)){
    const unit=canonicalUnit272(m[2]);if(!unit||!plan!.units.includes(unit))continue;const dim=dimensionOfUnit272(unit)!;
    // The value's own sentence (or its table label) must use a taught term of this dimension, or a generic dimension word with
    // a reporting verb; a hypothetical projection, a threshold, a duration of a condition or a declaration is not a result.
    const ctx=planWords272(sent+' '+prevLabel);const taught=planTaught(dim);
    if(!(ctx.some(w=>taught.has(w))||(ctx.some(w=>(DIMENSION_WORDS272[dim]??[]).includes(w))&&REPORT_CUE272.test(sent))))continue;
    if(DECLARATION_CUE272.test(sent)||rangeOrBound272(sent,m.index!,m.index!+m[0].length))continue;
    if(HYPOTHETICAL272.test(sent)||/^[\s-]*(?:limit|threshold|cap|target|mark)\b/i.test(sent.slice(m.index!+m[0].length).replace(/^-?\w*\s/,' '))&&/\b(?:below|above|under|our|the)\s*$/i.test(sent.slice(0,m.index!)))continue;
    if(dim==='duration'&&/\b(?:for|after|left|over|every|each|within)\s*$/i.test(sent.slice(Math.max(0,m.index!-10),m.index!)))continue;
    const planConds=plan!.measurements.filter(x=>x.dimensions.includes(dim)).flatMap(x=>x.conditions).filter(c=>c.terms.some(t=>ctx.includes(t))).map(c=>c.id);
    const value=Number(m[1].replace(/,/g,''));if(!Number.isFinite(value)||value<0||value>1e7)continue;
    if(/^(?:g|kg)$/.test(unit)&&/^\s*of\b/i.test(sent.slice(m.index!+m[0].length)))continue;
    const subj=clauseSubject(sent,m.index!)??subject;const blockHash=sha(line);
    const id=sha(JSON.stringify([sourceUrl,blockHash,base+m.index!,value,unit,subj]));
    if(seen.has(id)||records.some(r=>r.blockIndex===i&&r.value===value&&canonicalUnit272(r.unit)===unit))continue;seen.add(id);
    const cc=codesOf(sent,sent);
    records.push({id,sourceUrl,documentSha256:opts.documentSha256??null,blockSha256:blockHash,blockIndex:i,valueOffset:base+m.index!,value,unit,
     ...(planConds.length?{planConditionIds272:[...new Set(planConds)].sort()}:{}),
     instrument:instrumentRe.exec(sent)?.[1]?.toLowerCase()??null,condition:conditionRe.exec(sent)?.[1]?.toLowerCase()??null,methodCue:'plan_guided_measurement_term',
     conditionCodes:cc.codes,setpointC:cc.setpointC,documentProtocolCodes:[],subject:subj,
     subjectAssignment:subj&&subj!==subject?'clause_named_model_unverified':scope,classification:'publisher_reported_measurement_lead_only',
     methodReviewed:false,originalWorkReviewed:false,reviewerIndependent:false,exactVariantVerified:false,market:'unknown',scientificEvidenceAdmitted:false,rankingAuthorized:false});
   }}
 };
 for(let i=0;i<all.length;i++){
  const line=all[i];if(line.length>900)continue;
  if(headingCue.test(line)&&line.length<90)previousHeading=line;
  if(negated.test(line)||secondary.test(line))continue;
  const method=claimedMethod.test(line);if(method)methodBlocks++;
  const instrument=instrumentRe.exec(line)?.[1]?.toLowerCase()??null;
  if(instrument)instrumentBlocks++;
  const explicitNumeric=numericReported.test(line);
  // A heading alone or a measurement figure without first-person method evidence
  // cannot be promoted into an original test lead. Phase268: a kWh result sentence is linked to the document's own
  // first-person energy protocol, and then only its kWh values are leads.
  const protocolLinked=!(method&&explicitNumeric)&&!!protocolCodes&&energyResult.test(line)&&/\d\s*kwh\b/i.test(line);
  if(!(method&&explicitNumeric)&&!protocolLinked)continue;
  const condition=conditionRe.exec(line)?.[1]?.toLowerCase()??null;
  const blockHash=sha(line);let count=0;
  const sentences=line.split(/(?<=[.!?])\s+(?=[A-Z£])/);
  for(const m of line.matchAll(candidateNumeric)){
   if(++count>8){out.truncated=true;break;}
   if(protocolLinked&&m[2].toLowerCase()!=='kwh')continue;
   const value=Number(m[1].replace(/,/g,''));if(!Number.isFinite(value)||value<0||value>1e7)continue;
   // Phase268: a rated power introducing the sentence ("At 2,000W, ...", "offers up to 2,000W of power") is a declaration.
   if(/^(?:w|watts?)$/i.test(m[2])&&(/\b(?:at|up to|of|rated)\s*$/i.test(line.slice(Math.max(0,m.index!-12),m.index!))||/^\s*of power\b/i.test(line.slice(m.index!+m[0].length))))continue;
   // Phase268 (after the held-out run): a quantity "of <food>" ("500g of raw potato") is the test load, not a result.
   if(/^(?:g|kg)$/i.test(m[2])&&/^\s*of\b/i.test(line.slice(m.index!+m[0].length)))continue;
   // Ambient temperatures explicitly introduced as test conditions are not outcome measures.
   if(m[2].toLowerCase()==='°c'&&/\b(?:at|under)\s*$/i.test(line.slice(Math.max(0,m.index!-12),m.index!)))continue;
   const unit=m[2].toLowerCase();
   // Codes come from the value's own sentence; the compartment from its own clause when the sentence has several values.
   let off=0;const sent=sentences.find(x=>{const hit=m.index!>=off&&m.index!<off+x.length+1;if(!hit)off+=x.length+1;return hit;})??line;
   // Clauses are split between values of the same unit only (a setpoint or a rated power is not a second result).
   const local=[...sent.matchAll(candidateNumeric)].filter(x=>x[2].toLowerCase()===m[2].toLowerCase()).map(x=>x.index!);const at=m.index!-off;
   // Phase268: in a block of several sentences, only a sentence that itself reports the test (or, linked to the document
   // protocol, a kWh result) yields leads; comparisons with other products in neighbouring sentences do not.
   if(sentences.length>1&&!((claimedMethod.test(sent)&&numericReported.test(sent))||(numericReported.test(sent)&&method)||
     (energyResult.test(sent)&&/\d\s*kwh\b/i.test(sent)&&(protocolLinked||method))))continue;
   const cc=codesOf(sent,segmentFor(sent,at,local));
   // Setpoint and duration not stated in the sentence may be stated by the rest of the same block; the code says so.
   if(sentences.length>1&&(!cc.codes.includes('setpoint_c')||!cc.codes.includes('duration_1h'))){const b=codesOf(line,'');let used=false;
    if(!cc.codes.includes('setpoint_c')&&b.setpointC!==null){cc.codes.push('setpoint_c');cc.setpointC=b.setpointC;used=true;}
    if(!cc.codes.includes('duration_1h')&&b.codes.includes('duration_1h')){cc.codes.push('duration_1h');used=true;}
    if(used)cc.codes.push('conditions_from_block');cc.codes.sort();}
   const id=sha(JSON.stringify([sourceUrl,blockHash,m.index,value,unit,subject]));
   if(seen.has(id))continue;seen.add(id);
   records.push({id,sourceUrl,documentSha256:opts.documentSha256??null,blockSha256:blockHash,blockIndex:i,
    valueOffset:m.index??0,value,unit,instrument,condition,
    methodCue:protocolLinked?'energy_result_with_document_protocol':headingCue.test(previousHeading)?'test_section_with_method_cue':'first_person_test_statement',
    conditionCodes:cc.codes,setpointC:cc.setpointC,documentProtocolCodes:protocolCodes?[...new Set(protocolCodes)].sort():[],
    subject,subjectAssignment:scope,classification:'publisher_reported_measurement_lead_only',
    methodReviewed:false,originalWorkReviewed:false,reviewerIndependent:false,
    exactVariantVerified:false,market:'unknown',scientificEvidenceAdmitted:false,rankingAuthorized:false});
   if(records.length>=20){out.truncated=true;break;}
  }
  if(records.length>=20)break;
 }
 // Phase272: guided pass over the same bounded blocks (the plan widens units and admits taught-term sentences; table cells
 // are read with the block before them as their label).
 if(plan)for(let i=0;i<deep.length&&records.length<40;i++){if(deep[i].length<=900)guided(deep[i],i,i>0&&deep[i-1].length<120?deep[i-1]:'');}
 // Phase272 (plan only): a value printed directly before a taught condition term ("10% window") is a condition parameter,
 // not a result; the plan removes such candidates whichever reader proposed them.
 if(plan){const ct=conditionTerms272(plan);for(let k=records.length-1;k>=0;k--){const r=records[k];const line=deep[r.blockIndex]??'';
  const rest=line.slice(r.valueOffset).replace(/^[\d.,]+\s*\S*?(?=\s|$)/,'').trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g,'')??'';
  if(rest&&ct.has(stem272(rest)))records.splice(k,1);}}
 // Phase272 exploratory pass: any generic unit with a generic reporting cue, not covered by an accepted candidate.
 const exploratory:NonNullable<TestProbe225['exploratoryLeads272']>[number][]=[];
 if(opts.exploratory){const exRe=new RegExp('(?<![\\d.,])(\\d{1,3}(?:,\\d{3})+(?:\\.\\d{1,3})?|\\d{1,7}(?:\\.\\d{1,3})?)\\s*('+unitAlternation272(EXPLORATORY_UNITS272)+')(?![a-z0-9])','gi');
  const anyTest=deep.some(b=>TEST_CONTEXT272.test(b)||claimedMethod.test(b));
  for(let i=0;i<deep.length&&exploratory.length<40;i++){const line=deep[i];if(line.length>900||negated.test(line)||secondary.test(line))continue;
   for(const sent of line.split(/(?<=[.!?])\s+(?=[A-Z£])/)){if(!anyTest||!(REPORT_CUE272.test(sent)||(line.length<120&&/\d/.test(line)))||DECLARATION_CUE272.test(sent))continue;
    for(const m of sent.matchAll(exRe)){const unit=canonicalUnit272(m[2]);if(!unit||rangeOrBound272(sent,m.index!,m.index!+m[0].length))continue;
     const value=Number(m[1].replace(/,/g,''));if(!Number.isFinite(value))continue;
     if(records.some(r=>r.blockIndex===i&&r.value===value&&(canonicalUnit272(r.unit)??r.unit)===unit)||exploratory.some(e=>e.blockIndex===i&&e.value===value&&e.unit===unit))continue;
     exploratory.push({value,unit,blockIndex:i,blockSha256:sha(line),subject:(plan?clauseSubject(sent,m.index!):null)??subject,status:'exploratory_research_lead'});}}}}
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
  ...(plan?{planDigest272:plan.compiledFrom.digest}:{}),...(opts.exploratory?{exploratoryLeads272:exploratory}:{}),
  existingPhase155MeasurementLeads:oldCount,tableResults226:table.candidates.length,
  ambiguousTablesSkipped226:table.skippedAmbiguousTables,blockingReasons:reasons};
}
