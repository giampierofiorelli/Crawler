/** R3 cycle 2: blind applicability judgement of the proxy limits attached to read values (protocol
 * $PEE_PRIVATE_EVAL_DIR/r3/limits/prompt.md, hash checked).
 *   node scripts/r3-limits-judge.mjs input LABEL...   -> private r3/limits/<first LABEL>/in.json from link runs LABEL...
 *   node scripts/r3-limits-judge.mjs score LABEL...   -> evaluation/r3/limits-<first LABEL>.json (counts only) */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'));
const PROMPT='ca1b1901c58e91df42a9695ed906ce9ae794c46d88843125c20ad636153dd809';
const [mode,...labels]=process.argv.slice(2);if(!['input','score'].includes(mode)||!labels.length)throw Error('usage: input|score LABEL...');
if(createHash('sha256').update(readFileSync(join(PE,'r3/limits/prompt.md'))).digest('hex')!==PROMPT)throw Error('prompt changed');
const dir=join(PE,'r3/limits',labels[0]);const pairs=[];
for(const l of labels){const run=JSON.parse(readFileSync(join(PE,'r2',`link-${l}.json`),'utf8'));
 for(const r of run.detail)for(const [i,x] of (r.limits??[]).entries())pairs.push({pair:`${l}:${r.id}:${i}`,set:l,cat:r.cat,basis:x.basis,
  value:{label:r.text,metric:r.C8?.evidence?undefined:undefined,conditions:r.conds},limit:{type:x.type,quote:x.quote,object:x.object,scope:x.scope}});}
if(mode==='input'){mkdirSync(dir,{recursive:true});const f=join(dir,'in.json');if(existsSync(f))throw Error('exists');
 writeFileSync(f,JSON.stringify({pairs:pairs.map(({set,cat,basis,...p})=>p)},null,1)+'\n');console.log('pairs',pairs.length,f);}
else{const j=new Map(JSON.parse(readFileSync(join(dir,'out.json'),'utf8')).pairs.map(x=>[x.pair,x]));const C={};const inc=(o,k)=>o[k]=(o[k]??0)+1;let miss=0;
 for(const p of pairs){const x=j.get(p.pair);if(!x){miss++;continue;}C[p.set]??={};inc(C[p.set],x.verdict);inc(C[p.set],'basis_'+p.basis+':'+x.verdict);}
 const f=`evaluation/r3/limits-${labels[0]}.json`;if(existsSync(f))throw Error('exists');
 writeFileSync(f,JSON.stringify({schema:'pee.r3.limits.v1',labels,generatedAt:new Date().toISOString(),judges:'fresh-context agent of the developer model family, blind to the mechanism; not independent validation',pairs:pairs.length,missing:miss,counts:C},null,1)+'\n');console.log(JSON.stringify(C),miss);}
