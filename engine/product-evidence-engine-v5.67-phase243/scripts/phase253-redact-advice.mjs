#!/usr/bin/env node
/** Phase253 — public form of advice runs. Declared values retained under pee249-factual-observations-v1 may not be
 * published, so the committed run keeps per case the response, target, constraints (the user's own words), questions,
 * statements and limitations, and per product only its id, name, status, the reason type, source URLs and roles.
 * Declared values (cited raw values and the numbers inside check reasons) are removed; full runs stay private.
 * Scores computed by phase253-advice-score.mjs are identical on the full and the public form.
 * Usage: node scripts/phase253-redact-advice.mjs --in FULL_RUN --out PUBLIC_RUN
 */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
const reasonType=r=>/sources disagree/.test(r)?'sources_disagree':/up to/.test(r)?'declared_upper_bound_only':/not in a comparable unit/.test(r)?'not_comparable':
 /no declaration/.test(r)?'no_declaration':/identity/.test(r)?'identity_unreviewed':/product line|series/.test(r)?'product_line':/required/.test(r)?'declared_value_outside_limit':'other';
export function redactAdvice(a){
 if(!a.shortlist)return a;
 return {...a,
  shortlist:a.shortlist.map(s=>({productId:s.productId,name:s.name,cautions:s.cautions,
   evidence:s.evidence.map(e=>({declarationId:e.declarationId,productId:e.productId,sourceUrl:e.sourceUrl,sourceRole:e.sourceRole,variantId:e.variantId,observedAt:e.observedAt??null}))})),
  excluded:a.excluded.map(x=>({productId:x.productId,name:x.name,reasons:x.reasons.map(reasonType)})),
  unknown:a.unknown.map(x=>({productId:x.productId,name:x.name,reasons:x.reasons.map(r=>(r.match(/^(\w+): /)?.[1]?r.match(/^(\w+): /)[1]+': ':'')+reasonType(r))})),
  conflicts:a.conflicts.map(c=>({productId:c.productId,criterion:c.criterion,reason:'sources_disagree'})),
  researchPlan:a.researchPlan.map(r=>r.replace(/\d+(?:[.,]\d+)?/g,'#')),redacted:'pee253-public-v1'};
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
 const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
 const run=JSON.parse(readFileSync(resolve(F.in),'utf8'));
 run.advice=Object.fromEntries(Object.entries(run.advice).map(([k,a])=>[k,redactAdvice(a)]));run.redaction='declared values removed (pee249-factual-observations-v1); full run kept in private-eval';
 writeFileSync(resolve(F.out),JSON.stringify(run,null,1)+'\n');
}
