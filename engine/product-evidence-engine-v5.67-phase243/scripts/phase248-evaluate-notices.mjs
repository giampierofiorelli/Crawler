#!/usr/bin/env node
/** Phase248: score the safety-notice parser against hand annotations.
 * Usage: node scripts/phase248-evaluate-notices.mjs --raw DIR --gold FILE [--out FILE] */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';
import {parseSafetyNotice248,identifierKey248,SAFETY_NOTICE_PARSER248} from '../dist/src/phase248_safety_notices.js';
import {CATEGORY_REGISTRY248} from '../dist/src/phase248_category_registry.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const gold=JSON.parse(readFileSync(resolve(F.gold),'utf8')).notices;
const eq=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const rows=[];
for(const [tag,g] of Object.entries(gold)){
 const d=JSON.parse(readFileSync(`${F.raw}/${tag}.json`,'utf8'));
 const n=parseSafetyNotice248(d,'https://www.gov.uk'+d.base_path,'eval',CATEGORY_REGISTRY248);
 const got=new Set(n.product.identifiers.map(i=>i.key));
 const req=g.required.map(identifierKey248),opt=new Set(g.optional.map(identifierKey248)),forb=g.forbidden.map(identifierKey248);
 rows.push({tag,type:n.noticeType===g.type,category:g.categoryAmbiguous?null:eq(n.product.categoryIds,g.categories),gotCategories:n.product.categoryIds,
  brand:g.brandAmbiguous?null:(n.product.brand??null)===g.brand,gotBrand:n.product.brand,
  idRequired:req.length,idFound:req.filter(k=>got.has(k)).length,missedIds:g.required.filter(c=>!got.has(identifierKey248(c))),
  spuriousIds:n.product.identifiers.filter(i=>!req.includes(i.key)&&!opt.has(i.key)).map(i=>i.code),forbiddenIds:forb.filter(k=>got.has(k)),
  hazardExact:eq(n.hazard.classes,g.hazards),gotHazards:n.hazard.classes,hazardTP:n.hazard.classes.filter(c=>g.hazards.includes(c)).length,hazardGot:n.hazard.classes.length,hazardGold:g.hazards.length});
}
const s=k=>rows.reduce((a,r)=>a+(r[k]??0),0);const acc=k=>{const xs=rows.filter(r=>r[k]!==null);return +(xs.filter(r=>r[k]).length/xs.length).toFixed(3)+` (${xs.filter(r=>r[k]).length}/${xs.length})`;};
const spurious=rows.reduce((a,r)=>a+r.spuriousIds.length,0);
const totals={parser:SAFETY_NOTICE_PARSER248,notices:rows.length,typeAccuracy:acc('type'),categoryAccuracy:acc('category'),brandAccuracy:acc('brand'),
 identifierRecall:+(s('idFound')/s('idRequired')).toFixed(3),identifiersFound:s('idFound'),identifiersRequired:s('idRequired'),
 identifierPrecision:+(s('idFound')/(s('idFound')+spurious)).toFixed(3),spuriousIdentifiers:spurious,forbiddenIdentifierViolations:rows.reduce((a,r)=>a+r.forbiddenIds.length,0),
 hazardExactAccuracy:acc('hazardExact'),hazardPrecision:+(s('hazardTP')/s('hazardGot')).toFixed(3),hazardRecall:+(s('hazardTP')/s('hazardGold')).toFixed(3)};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify({schema:'pee248.safety-notice-eval.v1',totals,notices:rows},null,1)+'\n');
console.log(JSON.stringify(totals,null,1));
for(const r of rows){const p=[];if(!r.type)p.push('TYPE');if(r.category===false)p.push('CAT '+r.gotCategories);if(r.brand===false)p.push('BRAND '+r.gotBrand);
 if(r.missedIds.length)p.push('MISSED '+r.missedIds);if(r.spuriousIds.length)p.push('SPURIOUS '+r.spuriousIds);if(r.forbiddenIds.length)p.push('FORBIDDEN '+r.forbiddenIds);
 if(!r.hazardExact)p.push('HAZ '+r.gotHazards);if(p.length)console.log(r.tag,p.join(' | '));}
