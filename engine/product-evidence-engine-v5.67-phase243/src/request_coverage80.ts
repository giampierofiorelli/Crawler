/** S80 (owner R3 consolidation; principle 8, "no silent loss of user intent"). The S80 end-to-end first run on new
 * requests (evaluation/s80, set D) found the earliest failure in understanding the request: stated requirements
 * ("on a short programme", "without using a lot of water", "quiet enough to sleep with", "25 square metre") matched no
 * taught need, constraint or quantity, left no trace, and the answer then said no checkable requirement was stated.
 *
 * Request coverage: which parts of the request PEE related to something it recognised. A part is a clause (split at
 * punctuation and at the conjunctions and prepositions that open a new requirement); it is COVERED when one of its
 * content words was used by a recognised element (category, need, constraint, quantity, class or stated objective) or
 * lies inside a recognised span. An uncovered clause with content words, or a number no constraint consumed, is
 * reported as NOT INTERPRETED. This recognises nothing new and never infers a need: it only makes the loss explicit.
 * General by construction: no category, product or phrase list; only English function words. */
export interface Uninterpreted80 {span:string;reason:'not_interpreted'|'quantity_not_checked'}
export const REQUEST_COVERAGE_VERSION='rc80.4';
/** Function words and request framing ("I want", "which", "best"): never content on their own. */
const FUNCTION=new Set(('a an the to of for and or but nor with without in on at by from into onto over under about than as so that this these '+
 'those it its is are was were be been being am do does did have has had will would could should can may might must shall i me my mine we us our '+
 'you your he she they them their his her which what who whom whose when where why how if then there here also too very really just quite '+
 'want wants wanted need needs needed looking look buy buying get gets got recommend recommendation please help best good great one ones '+
 'something anything some any all each every much many more most less least enough well properly actually '+
 "i'm i've i'd i'll we're we've you're it's that's there's don't doesn't didn't can't won't isn't aren't wasn't haven't hasn't im ive dont cant "+
 // rc80.3: light verbs and particles carry no requirement of their own ("come out properly crispy")
 'come comes came out make makes made go goes take takes put give gives keep keeps seem seems think know mean wonder wondered try tried').split(' '));
/** Words that open a new requirement clause (conjunctions, and the prepositions that introduce a stated condition).
 * rc80.2: not 'in', 'with', 'at', 'to': splitting there cut constraints and phrases in two on the spent request sets. */
const BOUNDARY=/^(?:and|or|but|that|which|who|while|whilst|without|than|because|although|though|so|whereas|unless|except|on|for)$/i;
const stem=(w:string)=>w.toLowerCase().replace(/'s$/,'').replace(/(?:iest|ier)$/,'y').replace(/(?:ness|ingly|edly|ing|ed|est|er|ly|y|es|s)$/,'')||w.toLowerCase();
export interface CoverageInput80 {
 /** Strings recognised elements were matched on (need 'matched' values, aliases, constraint spans...). Matched strings
  * of description-overlap inference ('~a+b+c', stemmed words) are accepted as they come from the journey. */
 matched:readonly string[];
 /** Exact substrings of the request already consumed (constraint, unmapped, quantity and class spans; objectives). */
 spans:readonly string[];
 /** Values of recognised constraints and quantities: a number equal to one of them is consumed. */
 values?:readonly number[];
}
export function requestCoverage80(text:string,input:CoverageInput80):Uninterpreted80[]{
 const words:{w:string;start:number;end:number}[]=[];
 for(const m of text.matchAll(/[\p{L}\p{N}][\p{L}\p{N}'’.\/:-]*/gu)){const w=m[0].replace(/[.:-]+$/,'');
  if(/\/|^https?$|^www\./i.test(w))continue; // URLs are references, not requirements
  words.push({w,start:m.index!,end:m.index!+w.length});}
 const isNum=(w:string)=>/^\d/.test(w); // rc80.3: 'C3240', 'AF400UK' are identifiers, not quantities
 const lower=text.toLowerCase();
 const ranges=input.spans.map(s=>{const i=lower.indexOf(s.toLowerCase());return i<0?null:{a:i,b:i+s.length};}).filter((x):x is {a:number;b:number}=>!!x);
 const inSpan=(x:{start:number;end:number})=>ranges.some(r=>x.start<r.b&&x.end>r.a);
 const usedStems=new Set(input.matched.flatMap(m=>m.replace(/^~/,'').split(/[+\s/,-]+/)).filter(Boolean).map(stem));
 const usedStem=(w:string)=>{const s=stem(w);if(usedStems.has(s))return true;
  // journey overlap tokens are stems ('wat' for water): a prefix match of 3+ letters counts
  for(const u of usedStems)if(Math.min(u.length,s.length)>=3&&(s.startsWith(u)||u.startsWith(s)))return true;return false;};
 const num=(w:string)=>Number(w.replace(/[^\d.]/g,''));
 const consumedNumber=(x:{w:string;start:number;end:number})=>inSpan(x)||(input.values??[]).some(v=>Math.abs(v-num(x.w))<1e-9);
 // sentences, then clauses: a boundary word or punctuation opens a new clause
 const sentences:(typeof words)[]=[];let sent:typeof words=[];
 for(let i=0;i<words.length;i++){const x=words[i];const gap=i?text.slice(words[i-1].end,x.start):'';
  if(sent.length&&/[.?!\n]/.test(gap)){sentences.push(sent);sent=[];}sent.push(x);}
 if(sent.length)sentences.push(sent);
 // the (up to two) words after a consumed number are its unit ("12 square metre"): part of that quantity
 const unitOfConsumed=new Set<number>();
 words.forEach((x,i)=>{if(isNum(x.w)&&consumedNumber(x))for(let k=i+1;k<=i+2&&k<words.length;k++)unitOfConsumed.add(words[k].start);});
 const used=(x:{w:string;start:number;end:number})=>inSpan(x)||unitOfConsumed.has(x.start)||(!isNum(x.w)&&usedStem(x.w));
 const identifier=(w:string)=>/^\p{L}+\d/u.test(w); // 'C3240', 'AF400UK': product names, not content to interpret
 // rc80.2: in a longer request only the sentences that carry the request (a recognised word or a number) are checked;
 // background sentences are context, not stated requirements.
 const ask=sentences.length<=1?sentences:sentences.filter(z=>z.some(x=>used(x)||isNum(x.w)));
 const out:Uninterpreted80[]=[];
 for(const z of ask){
  const clauses:(typeof words)[]=[];let cur:typeof words=[];
  for(let i=0;i<z.length;i++){const x=z[i];const gap=i?text.slice(z[i-1].end,x.start):'';
   if(cur.length&&(/[,;:()]/.test(gap)||BOUNDARY.test(x.w))){clauses.push(cur);cur=[];}cur.push(x);}
  if(cur.length)clauses.push(cur);
  for(const c of clauses){
   const content=c.filter(x=>isNum(x.w)||!FUNCTION.has(x.w.toLowerCase()));
   const span=text.slice(c[0].start,c.at(-1)!.end);
   const freeNumber=c.some(x=>isNum(x.w)&&!consumedNumber(x));
   if(freeNumber){out.push({span,reason:'quantity_not_checked'});continue;}
   const words2=content.filter(x=>!isNum(x.w)&&!identifier(x.w));
   // at least two content words; covered when at least half of them were used by a recognised element
   if(words2.length<2)continue;
   if(words2.filter(used).length*2<words2.length)out.push({span,reason:'not_interpreted'});
  }
 }
 return out;
}
