#!/usr/bin/env node
/** Phase252 — evaluates the deployed Phase110 runtime (with the Phase252 faithfulness checks) on the 24 contrast cases
 * of evaluation/phase252/review-semantics-cases.json (T1, developer-written before the checks). For each case a
 * scripted provider (NOT a model) proposes the correct and then the wrong interpretation; the runtime accepts or rejects.
 * Reports correct interpretations wrongly rejected and wrong interpretations rejected, per phenomenon.
 * Usage: node scripts/phase252-review-semantics-eval.mjs [--out FILE]
 */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';
import {extractReview110} from '../dist/src/phase110_local_semantic_extractor.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const C=JSON.parse(readFileSync(new URL('../evaluation/phase252/review-semantics-cases.json',import.meta.url),'utf8'));
// Phase110 requires variant ids to be keys (a letter first): '1_7_litre' becomes 'variant_1_7_litre'.
const vid=v=>/^[a-z]/.test(v)?v:'variant_'+v;
async function run(text,span,over0,variants0){
 const variants=variants0.map(vid);const over={...over0,...(over0.variantId?{variantId:vid(over0.variantId)}:{})};
 const s=text.indexOf(span);if(s<0)throw Error('span');
 const cand={...C.defaults.atom,...(variants[0]!==C.defaults.variants[0]?{variantId:variants[0]}:{}),...over,evidenceStart:s,evidenceEnd:s+span.length};
 const model={name:'scripted_provider_not_a_model',async extract({mode}){return mode==='initial'?{claims:[{segmentId:'s1',candidate:cand}],emptySegments:[]}:{claims:[],emptySegments:[]};}};
 const p=await extractReview110({reportId:'eval_252',originalTestId:'eval_252',sourceUrl:'https://example.org/synthetic',categoryId:'diagnostic',
  inventoryReviewerId:'synthetic_fixture',inventoryReviewReference:'synthetic contrast statement (T1)',variants,
  blocks:[{segmentId:'s1',locator:'#s1',surface:'paragraph',accessible:true,representation:'complete',content:text}]},model);
 return {accepted:p.proposed.length===1,reason:p.problems[0]??null};
}
const rows=[];
for(const c of C.cases){const v=c.variants??C.defaults.variants;
 const g=await run(c.text,c.span,c.good,v),b=await run(c.text,c.badSpan??c.span,c.bad,v);
 rows.push({id:c.id,phenomenon:c.phenomenon,correctAccepted:g.accepted,correctRejectionReason:g.accepted?null:g.reason,wrongRejected:!b.accepted,rejectionReason:b.accepted?null:b.reason});}
const totals={cases:rows.length,correctAccepted:rows.filter(r=>r.correctAccepted).length,correctWronglyRejected:rows.filter(r=>!r.correctAccepted).length,wrongRejected:rows.filter(r=>r.wrongRejected).length,wrongAccepted:rows.filter(r=>!r.wrongRejected).length};
const out={schema:'pee252.review-semantics-eval.v1',tier:'T1 synthetic, developer-written before the checks; scripted provider, not a model; first run',scope:'faithfulness of an encoding to its span; not entailment, not truth',totals,cases:rows};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(totals));for(const r of rows)console.log(r.wrongRejected?'caught ':'MISSED ',r.id,r.phenomenon,'|',r.rejectionReason??'',r.correctAccepted?'':'| CORRECT REJECTED '+r.correctRejectionReason);
