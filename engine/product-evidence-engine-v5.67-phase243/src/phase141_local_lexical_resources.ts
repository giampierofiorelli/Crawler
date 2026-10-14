/** Phase141: source-licensed lexical DATA, not a semantic entailment model.
 * This independent TypeScript adapter reads a compact, reproducible offline
 * projection of WordNet, VerbNet and VADER, with no foreign runtime code.
 * All lexical matches are unverified hypotheses, never product facts.
 */
import {readFileSync} from 'node:fs';
import {readUnmarkedEnglish139, type ReaderInput139} from './phase139_unmarked_english_candidate_reader.js';
import {readBoundedEnglishRecall140, type RecallProposal140, type Structure140, type ProposalState140} from './phase140_bounded_english_recall.js';
import type {Span131} from './phase131_local_relation_learning.js';

interface LexicalCue141 {lemma:string;construction:'direct_object'|'with_complement';kind:Structure140;wordnetSynset:string;verbnetClasses:{class:string;roles:string[]}[]}
interface Bundle141 {schema:string;provenance:Record<string,{sha256:string;license:string;source:string}>;
 reviewedLexicalCues:LexicalCue141[];verbnetLemmaIndex:Record<string,{class:string;roles:string[]}[]>;
 vaderRawValence:Record<string,number>;warnings:string[]}
let cache141:Bundle141|undefined;
function bundle141():Bundle141{
 if(!cache141){
  const raw=readFileSync(new URL('../../resources/phase141/english_lexical_bundle.json',import.meta.url),'utf8');
  const b:unknown=JSON.parse(raw);
  if(!b||typeof b!=='object'||(b as Bundle141).schema!=='pee-lexicon-141-v1')throw Error('invalid_phase141_lexicon_bundle');
  cache141=b as Bundle141;
 }
 return cache141;
}
export function lexicalLookup141(lemma:string){
 const b=bundle141();const key=lemma.toLowerCase().trim();
 return {lemma:key, wordnetReviewedCues:b.reviewedLexicalCues.filter(x=>x.lemma===key).map(x=>({kind:x.kind,synset:x.wordnetSynset,construction:x.construction})),
  possibleVerbnetClasses:(b.verbnetLemmaIndex[key]??[]).map(x=>({class:x.class,roles:[...x.roles]})),
  rawVaderValence:typeof b.vaderRawValence[key]==='number'?b.vaderRawValence[key]:null,
  disambiguated:false,scientificEvidence:false,rankingAuthorized:false};
}
function escaped141(s:string){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function inflections141(lemma:string):string[]{
 const forms=new Set([lemma]);
 if(lemma.endsWith('y')&&!/[aeiou]y$/.test(lemma)){
  forms.add(lemma.slice(0,-1)+'ies');forms.add(lemma.slice(0,-1)+'ied');
 }else if(lemma.endsWith('e')){
  forms.add(lemma+'s');forms.add(lemma+'d');
 }else{
  forms.add(lemma+(/(?:s|sh|ch|x|z)$/.test(lemma)?'es':'s'));
  forms.add(lemma+'ed');
 }
 // Inflected -ing excluded: without a finite predicate we cannot safely attach subject.
 return [...forms];
}
interface Match141{start:number;end:number;cue:LexicalCue141}
function candidates141(text:string):Match141[]{
 const hits:Match141[]=[];
 for(const cue of bundle141().reviewedLexicalCues){
  for(const form of inflections141(cue.lemma)){
   const phrase=escaped141(form)+(cue.construction==='with_complement'?'\\s+with':'');
   for(const m of text.matchAll(new RegExp('\\b'+phrase+'\\b','gi'))){
    hits.push({start:m.index!,end:m.index!+m[0].length,cue});
   }
  }
 }
 return hits.sort((a,b)=>a.start-b.start||b.end-a.end||a.cue.lemma.localeCompare(b.cue.lemma));
}
const boundaries141=/\b(?:but|however|although|whereas|though)\b|[;.!?]|\n/gi;
function sentences141(text:string):Span131[]{
 const ans:Span131[]=[];let p=0;
 for(const m of text.matchAll(/(?:[.!?](?=\s|$)|\n\s*\n)/g)){
  if(p<m.index!+m[0].length)ans.push({start:p,end:m.index!+m[0].length});p=m.index!+m[0].length;
 }
 if(p<text.length)ans.push({start:p,end:text.length});return ans;
}
function span141(text:string,from:number,end:number):Span131|null{
 const after=text.slice(from,end),stop=boundaries141.exec(after);boundaries141.lastIndex=0;
 let a=from,b=stop?from+stop.index:end;
 while(a<b&&/[\s,]/.test(text[a]))a++;while(a<b&&/[\s,]/.test(text[b-1]))b--;
 return b>a&&b-a<=180?{start:a,end:b}:null;
}
export interface LexicalProposal141 extends RecallProposal140{
 lexicalSource:'Open English WordNet';wordnetSynset:string;lexicalLemma:string;
 possibleVerbnetClasses:string[];ambiguousSense:true;
}
export interface LexicalResult141 {
 phase:141;sourceId:string;documentSha256:string;baseline140Proposals:number;
 lexicalMatches:number;lexicalProposals:LexicalProposal141[];
 coverageTruncated:boolean;truncationReasons:string[];independentHoldoutCases:0;
 accuracy:null;canonicallyReviewed:false;canonicalWriteAuthorized:false;rankingAuthorized:false;
}
/** One additional, never-promoting candidate pathway. No automatic sense resolution. */
export function readLexicalEnglish141(input:ReaderInput139,maxProposals=80):LexicalResult141{
 if(!Number.isSafeInteger(maxProposals)||maxProposals<1||maxProposals>200)throw Error('invalid_phase141_cap');
 const baseline=readBoundedEnglishRecall140(input), mentions=readUnmarkedEnglish139(input).mentions;
 const text=input.document.text,sentences=sentences141(text),matches=candidates141(text);
 const proposals:LexicalProposal141[]=[];let truncated=false;
 for(const hit of matches){
  if(proposals.length>=maxProposals){truncated=true;continue;}
  const sentence=sentences.find(s=>s.start<=hit.start&&s.end>=hit.end);
  if(!sentence){truncated=true;continue;}
  const before=text.slice(sentence.start,hit.start);
  const delimiters=[...before.matchAll(/\b(?:but|however|although|whereas|though)\b|;/gi)];
  const previous=delimiters.length?sentence.start+delimiters[delimiters.length-1].index!+delimiters[delimiters.length-1][0].length:sentence.start;
  const names=mentions.filter(x=>x.type==='product_name'&&x.span.start>=previous&&x.span.end<=hit.start);
  const subject=names.length===1?names[0]:null;
  const object=span141(text,hit.end,sentence.end);
  const reasons=['lexical_sense_is_not_contextual_entailment'];
  let status:ProposalState140='quarantined_surface_hypothesis';
  if(names.length>1){status='ambiguous_subject';reasons.push('multiple_product_names_before_lexical_cue');}
  else if(!subject){status='unresolved_reference';reasons.push('no_unique_explicit_subject');}
  else if(subject.identityClaim==='different_or_unverified_variant'){
   status='different_variant';reasons.push('variant_identity_not_verified');
  }else if(!object){status='insufficient_target';reasons.push('missing_direct_complement');}
  else if(hit.cue.kind==='limitation'||hit.cue.kind==='feature_absence'){
   status='quarantined_negative_statement';reasons.push('negative_connotation_requires_context');
  }
  const between=subject?text.slice(subject.span.end,hit.start):before;
  if(/\b(?:no\s+evidence|not\s+only|not|never|may|might|could|allegedly|reportedly|isn't|doesn't|cannot|can't|failed\s+to|fails\s+to|unable\s+to)\b/i.test(between)
   &&['quarantined_surface_hypothesis','quarantined_negative_statement'].includes(status)){
   status='unsupported_scope';reasons.push('negation_or_hedge_requires_scope_analysis');
  }
  if(/\b(?:manufacturer|brand|company)\s+(?:claims?|says?|promises?)\b/i.test(before)
   &&['quarantined_surface_hypothesis','quarantined_negative_statement'].includes(status)){
   status='attributed_claim';reasons.push('manufacturer_claim_not_test_observation');
  }
  if(hit.cue.kind==='comparison'&&object){
   const other=mentions.filter(x=>x.type==='product_name'&&x.span.start>=object.start&&x.span.end<=object.end);
   if(other.length!==1 || (subject && other[0].literal.toLowerCase().replace(/\s+/g,' ')===subject.literal.toLowerCase().replace(/\s+/g,' '))){
    status='unsupported_scope';reasons.push('no_unambiguous_comparator_entity');
   }else reasons.push('relative_claim_not_absolute_product_performance');
  }
  proposals.push({id:`p141_${hit.start}_${hit.cue.lemma}`,structure:hit.cue.kind,status,
   subjectMentionId:subject?.id??null,subjectSpan:subject?.span??null,
   predicateSpan:{start:hit.start,end:hit.end},objectSpan:object,evidenceSpan:sentence,
   conditionSpans:[],reasons,sourceVerified:false,scientificallyValidated:false,
   canonicalWriteAuthorized:false,rankingAuthorized:false,
   lexicalSource:'Open English WordNet',wordnetSynset:hit.cue.wordnetSynset,
   lexicalLemma:hit.cue.lemma,possibleVerbnetClasses:hit.cue.verbnetClasses.map(x=>x.class),ambiguousSense:true});
 }
 return {phase:141,sourceId:baseline.sourceId,documentSha256:baseline.documentSha256,
  baseline140Proposals:baseline.proposals.length,lexicalMatches:matches.length,lexicalProposals:proposals,
  coverageTruncated:truncated||baseline.coverageTruncated,truncationReasons:[...(truncated?['phase141_proposal_cap']:[]),...baseline.truncationReasons],
  independentHoldoutCases:0,accuracy:null,canonicallyReviewed:false,canonicalWriteAuthorized:false,rankingAuthorized:false};
}
