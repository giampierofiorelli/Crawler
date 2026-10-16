#!/usr/bin/env node
/** Phase253 T3 control (protocol.json): QueryNER test split, 993 human-labelled product search queries (bltlab/queryner,
 * CC BY 4.0; rows kept outside Git). A search query rarely states a limit, so every constraint recorded as
 * stated_in_request in a query without an explicit bound word is a false stated constraint. Also reports how the
 * queries labelled with a quantity and a unit (B-quantity/B-UoM) are treated: stated, candidate, unmapped or ignored.
 * Usage: node scripts/phase253-queryner-control.mjs --rows DIR [--dist DIST_DIR] [--out FILE]
 */
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';import {resolve,join} from 'node:path';import {pathToFileURL} from 'node:url';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const dist=resolve(F.dist??new URL('../dist',import.meta.url).pathname);
const {extractConstraints253}=await import(pathToFileURL(join(dist,'src','phase253_request_constraints.js')).href);
const BOUND=/\b(?:at least|at most|minimum|maximum|min|max|no more than|no less than|less than|more than|under|over|below|above|up to|between|within|smaller than|bigger than|larger than|wider than|narrower than|lighter than|heavier than|or less|or more)\b|\+/i;
const rows=[];for(const f of readdirSync(resolve(F.rows)).sort())for(const r of JSON.parse(readFileSync(join(resolve(F.rows),f),'utf8')).rows)rows.push(r);
let stated=0,falseStated=[],labelled={n:0,stated:0,candidate:0,unmapped:0,ignored:0};
for(const r of rows){const text=r.row.tokens.join(' ');const t=r.row.ner_tags;const x=extractConstraints253(text);
 const st=x.constraints.filter(c=>c.status==='stated_in_request');stated+=st.length;
 if(st.length&&!BOUND.test(text))falseStated.push({idx:r.row_idx,text,constraints:st.map(c=>[c.criterion,c.value,c.unit,c.span])});
 if(t.some(v=>v===29||v===30)&&t.some(v=>v===1||v===2)){labelled.n++;
  if(st.length)labelled.stated++;else if(x.constraints.length)labelled.candidate++;else if(x.unmapped.length)labelled.unmapped++;else labelled.ignored++;}}
const out={schema:'pee253.queryner-control.v1',source:'bltlab/queryner test split (CC BY 4.0)',dist,queries:rows.length,statedConstraints:stated,
 falseStated:falseStated.length,falseStatedQueries:falseStated,quantityAndUnitLabelled:labelled};
const txt=JSON.stringify(out,null,1)+'\n';if(F.out)writeFileSync(resolve(F.out),txt);
console.log(JSON.stringify({queries:out.queries,statedConstraints:stated,falseStated:out.falseStated,quantityAndUnitLabelled:labelled}));
