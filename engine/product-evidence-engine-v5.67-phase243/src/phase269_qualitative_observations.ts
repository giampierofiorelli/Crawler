/** Phase269 pilot — structured, attributable QUALITATIVE observations from a tester's own cooking tests (Decision 4).
 *
 * What it produces: PEE-authored codes only (dish, outcome, direction, strength, whether the tester changed the setting,
 * comparative or not) plus the hash of the source block. No sentence, adjective or passage of the review is kept, and no
 * number is invented: "mostly crisp skin" stays a hedged positive crispness observation, never a score.
 *
 * What it is not: a laboratory measurement, an independent finding, or ranking input. Under pee249-factual-observations-v1
 * an independent_original_test source retains measurement kinds only, so these codes are NOT retained in the operational
 * store; the pilot keeps them in the private evaluation directory and the Phase269 report proposes the amendment needed.
 * Method descriptions ("I note how crispy ...") are what a tester looks at, not what they found, and are skipped.
 */
import {createHash} from 'node:crypto';
import {textBlocks225} from './phase225_transient_test_probe.js';

export type QualOutcome269='crispness'|'browning'|'evenness'|'doneness'|'moisture';
export interface QualitativeObservation269 {
 dish:string;outcome:QualOutcome269;direction:'positive'|'negative'|'mixed';strength:'explicit'|'hedged';
 settingAdjusted:boolean;comparative:boolean;basis:'first_person_cooking_test';blockSha256:string;blockIndex:number;
 independentFinding:false;laboratoryMeasurement:false;rankingInput:false;
}
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const DISH:readonly [string,RegExp][]=[['hash_browns',/\bhash ?browns?\b/],['chips',/\b(?:chips|fries)\b/],['chicken',/\b(?:chicken|drumsticks?|wings?)\b/],
 ['apple_pie',/\bpies?\b/],['pizza',/\bpizzas?\b/],['vegetables',/\bvegetables?\b/],['potatoes',/\bpotato(?:es)?\b/]];
// Outcome terms: [outcome, positive pattern, negative pattern]. Negation flips ("not soggy", "not as pale").
const TERMS:readonly [QualOutcome269,RegExp,RegExp][]=[
 ['crispness',/\bcrisp(?:y|ier|iest|ness)?\b|\bcrunch(?:y)?\b/,/\bsoggy\b|\bsoft (?:outside|exterior)\b/],
 ['browning',/\bgolden\b|\bbrown(?:ed|ing)?\b/,/\bpale\b|\bburn(?:t|ed|ing)?\b|\bcharred\b/],
 ['evenness',/\bevenly\b|\beven (?:browning|colour|color|cooking)\b|\bconsistently\b/,/\buneven(?:ly)?\b/],
 ['doneness',/\bcooked through\b|\bclear juices\b|\bno pink\b|\bperfectly cooked\b/,/\bundercooked\b|\bstill raw\b|\bpink (?:inside|in the middle)\b/],
 ['moisture',/\bjuicy\b|\bmoist\b|\bfluffy inside\b/,/\bdried out\b|\bdry\b/]];
const HEDGE=/\b(?:mostly|most (?:\w+ ){0,3}not all|light|lightly|small amounts? of|slightly|a little|only just|not all)\b/;
const MIXING=/\b(?:most (?:\w+ ){0,3}not all|light|lightly|small amounts? of|only just|not all)\b/;
const METHOD=/\b(?:I (?:note|will|'ll)|I’ll|first thing I do|my go-to|go-to setting|is ideal|I always|usually)\b/i;
const ADJUST=/\b(?:added (?:on )?another|raised|lowered|extended|an extra|another \d+ minutes)\b/;
const COMPARE=/\b(?:better|worse) (?:\w+ ){0,3}than\b|\bthe (?:oven|air fryer) (?:\w+ )?had\b|\bmore (?:even|crisp)/;

/** Observations in one transient page; the page must state its own cooking tests in the first person. */
export function qualitativeObservations269(html:string):{observations:QualitativeObservation269[];blocksRead:number}{
 const {blocks}=textBlocks225(html);const out:QualitativeObservation269[]=[];const seen=new Set<string>();
 const firstPerson=blocks.some(b=>/\b(?:I|we) (?:cooked|made|tested|started by|tried)\b/i.test(b));
 if(!firstPerson)return {observations:[],blocksRead:blocks.length};
 blocks.forEach((block,bi)=>{
  if(block.length<60||METHOD.test(block)||!/\b(?:I|we|my)\b/i.test(block)&&!/\b(?:came out|emerged|turned out|were|was)\b/.test(block))return;
  let dish:string|null=null;let adjusted=false;
  for(const sent0 of block.split(/(?<=[.!?])\s+/)){
   const sent=sent0.toLowerCase();
   for(const [d,re] of DISH)if(re.test(sent)){dish=d;break;}
   if(ADJUST.test(sent))adjusted=true;
   if(!dish)continue;
   for(const [outcome,pos,neg] of TERMS){
    const p=pos.exec(sent),n=neg.exec(sent);if(!p&&!n)continue;
    const negated=(m:RegExpExecArray|null)=>!!m&&/\bnot (?:as |too |very )?$/.test(sent.slice(Math.max(0,m.index-12),m.index));
    let direction:'positive'|'negative'|'mixed';
    const posHit=(p&&!negated(p))||(n&&negated(n)),negHit=(n&&!negated(n))||(p&&negated(p));
    if(posHit&&negHit)direction='mixed';else if(posHit)direction='positive';else direction='negative';
    // Phase269 (after the pilot's first run): a hedge qualifies the term it precedes within its clause ("crisp and not
    // soggy, while most but not all had golden corners" hedges the browning, not the crispness).
    const at=(p&&!negated(p)?p:n??p)!.index;const clause=sent.slice(0,at).split(/,|;| while | but | whereas /).pop()!+sent.slice(at,at+12);
    const hedged=HEDGE.test(clause);if(direction==='positive'&&MIXING.test(clause))direction='mixed';
    const key=[dish,outcome,direction,adjusted].join('|');if(seen.has(key))continue;seen.add(key);
    out.push({dish,outcome,direction,strength:hedged?'hedged':'explicit',settingAdjusted:adjusted,comparative:COMPARE.test(sent),basis:'first_person_cooking_test',
     blockSha256:sha(block),blockIndex:bi,independentFinding:false,laboratoryMeasurement:false,rankingInput:false});
   }
  }
 });
 return {observations:out,blocksRead:blocks.length};
}
