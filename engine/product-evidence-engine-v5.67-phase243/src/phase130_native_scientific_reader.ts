/** Phase 130: local evidence-grounded, category-neutral candidate reader.
 * Engineering pilot inspired by pattern bootstrapping, weak-supervision labelers,
 * selective prediction and provenance graphs. It is NOT an LLM, learned semantic
 * model, general scientific reasoner, or source truth verifier.
 * All findings remain unverified and must pass Phase129 independent review.
 */
import {createHash} from 'node:crypto';
import type {SourceRef128} from './phase128_category_cognition_dialogue_bridge.js';
import type {LocalCategoryExtractor129, ConceptSuggestion129} from './phase129_category_growth_cycle.js';

export type Signal130='acronym_definition'|'label_definition'|'measured_property'|'measurement_instrument';
export interface Candidate130 {
 name:string; kind:'outcome'; abbreviation?:string;start:number;end:number;literal:string;
 signals:Signal130[]; sourceId:string; originalDocumentId:string;
 status:'hypothesis_requires_review'; rankingAuthorized:false;
}
export interface ReviewPriority130 {
 name:string;sourceCount:number;distinctHostCount:number;
 sources:string[];priority:'multiple_hosts'|'single_host';
 status:'human_scientific_review_required';
}
const METRIC=/\b(?:measure|measures|measured|measurement|metric|factor|capacity|efficiency|rating|rate|index|score|test|criterion|energy|removed|kilowatt|pints|minutes|time)\b/i;
const DEFIN=/\b(?:measure|measures|measured|measurement|metric|factor|capacity|efficiency|rating|rate|index|score|test|criterion|expressed|recorded|defined)\b/i;
const INVALID=/\b(?:no independent test|no test (?:procedure|method)|no (?:valid|verified) test|not (?:measured|tested|validated)|does not measure|unverified|fictional|invented|marketing only|purely promotional)\b/i;
const normalize=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const slug=(s:string)=>normalize(s).replace(/ /g,'_').slice(0,65);
const hash=(s:string)=>createHash('sha256').update(s).digest('hex').slice(0,10);
const strip=(s:string)=>s.replace(/^(?:the|a|an|its|their|current|modern|historical|old|new)\s+/i,'').trim();
const isNonName=(s:string)=>!s||normalize(s).split(' ').length>6||/^(?:the|a|an|some|it|this|that|they|we|our|its)\b/i.test(s)||!METRIC.test(s);
function contextualRejection(segment:string,begin:number,name:string){
 // Scope is deliberately the local sentence, not arbitrary pages and sections.
 if(INVALID.test(segment))return true;
 const remainder=segment.slice(begin);
 if(/\b(?:was|were|has been)\s+replaced\s+by\b/i.test(remainder))return true;
 if(/\b(?:formerly|historically)\b/i.test(segment.slice(Math.max(0,begin-20),begin)) &&
    /replaced by/i.test(segment))return true;
 if(/\b(?:not a measure|does not mean|not a direct measure)\b/i.test(remainder.slice(0,75)))return true;
 if(/^\s*(?:superior|amazing|best|ultimate|magical)\b/i.test(name))return true;
 return false;
}
/** Offset-preserving sentence windows; never invent or paraphrase a source span. */
function windows(text:string):{sentence:string;offset:number}[]{
 const out:{sentence:string;offset:number}[]=[];
 const boundary=/(?:[.!?](?=\s|$)|\n)+/g;let start=0;let m:RegExpExecArray|null;
 while((m=boundary.exec(text))){
  const s=text.slice(start,m.index),lead=s.length-s.trimStart().length;
  if(s.trim())out.push({sentence:s.trim(),offset:start+lead});
  start=m.index+m[0].length;
 }
 if(start<text.length){const s=text.slice(start),lead=s.length-s.trimStart().length;
  if(s.trim())out.push({sentence:s.trim(),offset:start+lead});}
 return out;
}
export function discoverCandidates130(args:{text:string;source:SourceRef128;maxCandidates?:number}):Candidate130[]{
 const {text,source}=args;
 const limit=args.maxCandidates??15;
 if(typeof text!=='string'||text.length>250000||!source?.id||!source.originalDocumentId||
   !Number.isInteger(limit)||limit<1||limit>20)throw Error('invalid_native_reader_input');
 type Internal=Candidate130;
 const found=new Map<string,Internal>();
 for(const {sentence,offset} of windows(text)){
  if(INVALID.test(sentence))continue;
  const add=(name0:string,at:number,length:number,signal:Signal130,abbr?:string)=>{
   const name=strip(name0);const delta=name0.indexOf(name);
   if(delta<0||isNonName(name)||contextualRejection(sentence,at+delta,name))return;
   const start=offset+at+delta,end=offset+at+length;
   if(start<0||end<=start||end>text.length)return;
   const literal=text.slice(start,end),key=normalize(name);
   if(!key)return;
   const old=found.get(key);
   if(old){if(!old.signals.includes(signal))old.signals.push(signal);return;}
   if(found.size>=limit)return;
   found.set(key,{name,kind:'outcome',abbreviation:abbr,start,end,literal,
    signals:[signal],sourceId:source.id,originalDocumentId:source.originalDocumentId,
    status:'hypothesis_requires_review',rankingAuthorized:false});
  };
  // Label-style expert definitions (not arbitrary page headings).
  const label=/^([A-Za-z][A-Za-z-]*(?:\s+[A-Za-z][A-Za-z-]*){0,5}):\s*(.+)$/i.exec(sentence);
  if(label&&DEFIN.test(label[2]))add(label[1],0,label[1].length,'label_definition');
  // A named parameter with an abbreviation; require meaningful measuring context.
  const acronym=/\b([A-Za-z][A-Za-z-]*(?:\s+[A-Za-z][A-Za-z-]*){1,5})\s*\(([A-Z][A-Z0-9-]{1,7})\)/g;
  for(const m of sentence.matchAll(acronym)){
   let phrase=m[1];const words=phrase.split(/\s+/);
   while(words.length>2&&/^(?:the|this|its|an|a|historical|old|modern|current|new|by|as|through|for|of|in|on|with|was|is|replaced|formerly)$/i.test(words[0]))words.shift();
   phrase=words.join(' ');
   const i=m.index!+m[0].indexOf(phrase);
   if(METRIC.test(phrase)&&DEFIN.test(sentence))add(phrase,i,(m.index!+m[0].length)-i,'acronym_definition',m[2]);
  }
  // Grammatical definition: X is measured in/by ..., not category-specific words.
  const measured=/\b([A-Za-z][A-Za-z-]*(?:\s+[A-Za-z][A-Za-z-]*){0,4})\s+is\s+(?:measured|reported|expressed)\s+(?:in|by|as)\b/gi;
  for(const m of sentence.matchAll(measured)){
   const name0=m[1];let name=name0;
   const punct=Math.max(name0.lastIndexOf(';'),name0.lastIndexOf(','));
   if(punct>=0)name=name0.slice(punct+1).trim();
   const i=m.index!+m[0].indexOf(name);
   add(name,i,name.length,'measured_property');
  }
  // Metrological relation from explicit measurement to named outcome.
  const measureBy=/\bmeasured\s+by\s+((?:[A-Za-z]+\s+){0,4}(?:factor|capacity|efficiency|rate|index|ratio|score|time))\b/gi;
  for(const m of sentence.matchAll(measureBy)){
   const n=m[1];const i=m.index!+m[0].indexOf(n);add(n,i,n.length,'measurement_instrument');
  }
 }
 return [...found.values()].sort((a,b)=>a.start-b.start||a.name.localeCompare(b.name));
}
/** Source-span preserving adapter to the Phase129 quarantine transaction. */
export function nativeScientificExtractor130():LocalCategoryExtractor129{
 return {execution:'local_only',async propose({source,text}):Promise<ConceptSuggestion129[]>{
  return discoverCandidates130({source,text}).map(c=>({
   sourceId:c.sourceId,originalDocumentId:c.originalDocumentId,
   start:c.start,end:c.end,literal:c.literal,
   concept:{id:slug(c.name)||`concept_${hash(c.literal)}`,label:c.name,kind:'outcome',
    aliases:[c.name,...(c.abbreviation?[c.abbreviation]:[])],
    evidenceKeys:[slug(c.name)||`concept_${hash(c.literal)}`]}
  }));
 }};
}
/** Human-review scheduling only. Different hostnames are NOT proof of independent evidence or accuracy. */
export function planConceptReviews130(items:readonly Candidate130[],sourceUrls:Readonly<Record<string,string>>):ReviewPriority130[]{
 const map=new Map<string,{name:string;sources:Set<string>;hosts:Set<string>}>();
 for(const c of items){
  if(c.status!=='hypothesis_requires_review'||c.rankingAuthorized!==false)throw Error('unverified_only');
  const url=sourceUrls[c.sourceId];if(!url)throw Error('missing_source');
  let host:string;try{const u=new URL(url);if(u.protocol!=='https:')throw Error('invalid_protocol');host=u.hostname;}
  catch{throw Error('invalid_source_url');}
  const key=normalize(c.name);const v=map.get(key)??{name:c.name,sources:new Set(),hosts:new Set()};
  v.sources.add(c.sourceId);v.hosts.add(host);map.set(key,v);
 }
 return [...map.values()].map(v=>({name:v.name,sourceCount:v.sources.size,
  distinctHostCount:v.hosts.size,sources:[...v.sources].sort(),
  priority:v.hosts.size>1?'multiple_hosts' as const:'single_host' as const,
  status:'human_scientific_review_required' as const}))
  .sort((a,b)=>b.distinctHostCount-a.distinctHostCount||a.name.localeCompare(b.name));
}
/** Learning agenda for each UNVERIFIED scientific name. Questions are deliberately
 * epistemic checks, not assertions or invented thresholds. The goal/measurement
 * relationship must be established before a quality criterion can be reviewed. */
export interface ResearchObligation130 {
 conceptName:string;
 checks:readonly {code:'definition'|'protocol_version'|'measurement_context'|'user_goal_relevance'|'comparison_evidence';question:string}[];
 productRankingBlocked:true;
}
export function planScientificFollowups130(candidates:readonly Candidate130[]):ResearchObligation130[]{
 const names=[...new Set(candidates.map(c=>{
  if(c.status!=='hypothesis_requires_review'||c.rankingAuthorized!==false)throw Error('only_unverified_candidates');
  return c.name.trim();
 }))].sort((a,b)=>a.localeCompare(b));
 return names.map(name=>({conceptName:name,checks:[
  {code:'definition',question:`What exactly is ${name}, and is its definition stated in an original authoritative source?`},
  {code:'protocol_version',question:`Which original test procedure and revision defines ${name}, if any?`},
  {code:'measurement_context',question:`Which units, measurement setup, environmental conditions and uncertainty apply to ${name}?`},
  {code:'user_goal_relevance',question:`Which consumer goal does ${name} actually predict, and where does the measure fail to represent that goal?`},
  {code:'comparison_evidence',question:`Are comparable original product measurements of ${name} available for the same conditions and protocol?`}
 ] as const,productRankingBlocked:true as const}));
}
