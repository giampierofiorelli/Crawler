#!/usr/bin/env node
/** Phase246 adjudication of the held-out first run. Reads the STRICT first-run result (unchanged) and writes a
 * separate adjudicated view: (1) explicit reviewer decisions on individual strict false positives / gold omissions,
 * (2) values the extractor HELD BACK (not promoted) that would match gold, reported as safe-abstention recall loss.
 * Usage: node scripts/phase246-adjudicate.mjs --pages DIR --out FILE
 */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve,join} from 'node:path';
import {extractSpecifications245} from '../dist/src/phase245_spec_extraction.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const root=resolve(new URL('..',import.meta.url).pathname);
const gold=JSON.parse(readFileSync(join(root,'evaluation/phase246/gold-heldout/heldout-gold.json'),'utf8'));
const strict=JSON.parse(readFileSync(join(root,'evaluation/phase246/results/heldout-strict-firstrun.json'),'utf8'));
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const pkey=s=>norm(s).replace(/[:：]\s*$/,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
// Reviewer decisions, recorded with reasons; they never edit the strict file.
const decisions=[
 {tag:'ho_cm_origin_lelit',item:'Interface = Machine ready and/or warming-up LED',strict:'false_positive',adjudicated:'correct_gold_omission',
  reason:'the Interface card holds a single value; the gold wrongly grouped it with multi-line cards'},
 {tag:'ho_cm_origin_lelit',item:'Origin x Dor & Tan Coffee Cup = £25',strict:'false_positive',adjudicated:'false_association',reason:'related/upsell product price attributed to the main product'},
 {tag:'ho_cm_origin_lelit',item:'Home Brewing Guide = £2.95',strict:'false_positive',adjudicated:'false_association',reason:'related/upsell product price attributed to the main product'},
 {tag:'ho_cm_origin_lelit',item:'Voted Europes Best x 2 = ...',strict:'false_positive',adjudicated:'false_positive',reason:'retailer marketing badge, not a product specification'},
 {tag:'ho_af_lakeland_dual8',item:'Price = £59.99',strict:'false_positive',adjudicated:'false_positive_stale_structured_data',
  reason:'price exists only in structured data on a page whose visible content says Unavailable/Discontinued; must not be presented as a current price'}];
const valueClose=(a,b)=>JSON.stringify(a)===JSON.stringify(b)||(a.kind===b.kind&&a.kind==='quantity'&&Math.abs(a.number-b.number)<1e-6&&norm(a.unit)===norm(b.unit));
const heldBack=[];
for(const [tag,g] of Object.entries(gold)){
 const x=extractSpecifications245(readFileSync(join(F.pages,tag+'.html'),'utf8'),'eval:'+tag);
 for(const e of g.expected){const a=x.ambiguous.find(f=>f.propertyKey===pkey(e.property));
  if(a)heldBack.push({tag,property:e.property,heldBackValue:a.value,flags:a.flags,valueMatchesGold:valueClose(a.value,e.value)});}
}
const s=strict.totals.phase245;
const adj={correct:s.correct+1,falseAssociations:s.falseAssociations+2,falsePositives:s.falsePositives-1-2,expected:s.expected+1};
adj.precision=+(adj.correct/(adj.correct+adj.falseAssociations+adj.falsePositives)).toFixed(3);adj.recall=+(adj.correct/adj.expected).toFixed(3);
const out={schema:'pee246.heldout-adjudication.v1',strictSource:'heldout-strict-firstrun.json (unchanged)',strictTotals:s,decisions,adjudicatedTotals:adj,
 heldBackNotPromoted:{count:heldBack.length,matchingGoldValue:heldBack.filter(h=>h.valueMatchesGold).length,items:heldBack,
  note:'held-back values are NOT counted as correct in either view; they show recall lost to safe abstention (mostly duplicate JSON-LD Product blocks making the main product ambiguous)'}};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({strict:s,adjudicated:adj,heldBack:out.heldBackNotPromoted.count,heldBackMatching:out.heldBackNotPromoted.matchingGoldValue},null,1));
