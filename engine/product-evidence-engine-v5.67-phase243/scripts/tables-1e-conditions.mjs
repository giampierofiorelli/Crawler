/** Table understanding, Stage D: condition carrying on the value-level gold sets that record conditions (Step 1C, Step 1D-B;
 * both SPENT, development evidence). For each gold value with a stated condition: does a lead with the same value and the same
 * exact subject exist, does it carry a condition, and does that condition agree with the gold's? Arms: frozen C, all shadow
 * lessons E, E without TL5, and the promoted (default shadow) set P. Counts only (no values) to evaluation/tables-1e/conditions-LABEL.json. No network.
 * Usage: node scripts/tables-1e-conditions.mjs LABEL */
import {writeFileSync,existsSync} from 'node:fs';
const label=process.argv[2];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL');
const OUT='evaluation/tables-1e/conditions-'+label+'.json';if(existsSync(OUT))throw Error(OUT+' exists (first runs are never overwritten)');
import {resolve,join} from 'node:path';import {readFileSync} from 'node:fs';import {homedir} from 'node:os';
const O=await import(resolve('scripts/experience-observe.mjs'));const D=resolve('dist/src');const LS=await import(D+'/table_lessons1e.js');
const E0=join(homedir(),'.local/share/product-evidence-engine/private-eval');
const sets=[['step1d-b',JSON.parse(readFileSync(join(E0,'step1d-b/gold.json'),'utf8')),'doc'],['step1c',JSON.parse(readFileSync(join(E0,'step1c/gold.json'),'utf8')),'tag']];
const SH=LS.TABLE_LESSONS1E.filter(l=>l.appliedIn==='shadow_table_reader').map(l=>l.id);
const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const ARMS=[['C','candidate_1c_semantics_tables',null],['E',"candidate_1e_tables",SH],['E-TL5','candidate_1e_tables',SH.filter(x=>x!=='TL5_setting_axis_conditions')],['P','candidate_1e_tables',LS.activeTableLessons1E()]];
const out={};
for(const [ev,g,key] of sets)for(const d of g.documents){const tag=d[key];const vals=g.values.filter(v=>v.doc===tag&&(v.conditions??[]).length);if(!vals.length)continue;
 for(const [k,pol,les] of ARMS){const r=await O.documentLeads(D,{evaluation:ev,docTag:tag,category:d.category},{policy:pol,details:true,...(les?{lessons:les}:{})});
  const o=out[k]??={withCondValues:0,matchedLead:0,leadHasCondition:0,conditionAgrees:0,conditionDisagrees:0};
  for(const v of vals){o.withCondValues++;const ls=r.leads.filter(l=>Math.abs(l.value-v.value)<1e-9&&l.subject&&norm(l.subject)===norm(v.subject));if(!ls.length)continue;o.matchedLead++;
   const c=ls.find(l=>l.condition);if(!c)continue;o.leadHasCondition++;
   if(v.conditions.some(x=>norm(x)===norm(c.condition)||norm(x).includes(norm(c.condition))||norm(c.condition).includes(norm(x))))o.conditionAgrees++;else o.conditionDisagrees++;}}}
const res={schema:'pee.tables1e.conditions.v1',label,at:new Date().toISOString(),build:O.buildIdentity(D),tier:'development (spent gold sets)',
 matching:'same value, exact subject (normalised); condition agrees when one contains the other after normalisation',arms:out};
writeFileSync(OUT,JSON.stringify(res,null,1)+'\n');console.log(JSON.stringify(out));
