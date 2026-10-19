/** Audit S77: score the evidence class the reader gives each value of the R2 link sets against the sealed blind
 * evidence-role reference (evaluation/r3/role-freeze.json). Counts only.  node scripts/r3-role-score.mjs LABEL_SUFFIX */
import {readFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const suf=process.argv[2];const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'));
const fz=JSON.parse(readFileSync('evaluation/r3/role-freeze.json','utf8'));if(createHash('sha256').update(readFileSync(join(PE,'r3/role/out.json'))).digest('hex')!==fz.annotation)throw Error('reference changed');
const ref=new Map(JSON.parse(readFileSync(join(PE,'r3/role/out.json'),'utf8')).values.map(x=>[x.value,x.role]));
const map=e=>e==='publisher_measured'?'publisher_measured':e==='manufacturer_declared'||e==='nominal_certified'?'manufacturer_declared':e==='derived_or_estimated'?'derived_or_estimated':'cannot_tell';
const C={};const inc=k=>C[k]=(C[k]??0)+1;
for(const s of ['p272','s1cd','af']){const r=JSON.parse(readFileSync(join(PE,'r2',`link-${s}-${suf}.json`),'utf8'));
 for(const x of r.detail){const g=ref.get(s+'|'+x.id);if(!g)continue;const p=map(x.ev);inc('values');
  if(p===g)inc(g==='cannot_tell'?'agree_cannot_tell':'agree_role');else if(p==='cannot_tell')inc('missed_'+g);else if(g==='cannot_tell')inc('asserted_'+p+'_where_text_does_not_say');else inc('wrong_'+g+'_as_'+p);}}
console.log(suf,JSON.stringify(C));
