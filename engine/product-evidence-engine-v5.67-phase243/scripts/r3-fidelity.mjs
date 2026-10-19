/** R3 fidelity, both directions (protocol: $PEE_PRIVATE_EVAL_DIR/r3/fidelity/prompt.md, hash in evaluation/r3/translator-freeze.json).
 *   node scripts/r3-fidelity.mjs input LABEL   -> private judge inputs r3/fidelity/LABEL/in-<cat>.json from run translate-LABEL
 *   node scripts/r3-fidelity.mjs score LABEL   -> evaluation/r3/fidelity-LABEL.json (counts only) from the judges' out-<cat>.json
 * The judges are fresh-context agents of the developer's model family: blind to the translator, not independent human validation. */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'r3');
const [mode,label]=process.argv.slice(2);if(!['input','score'].includes(mode)||!label)throw Error('usage: input|score LABEL');
const run=JSON.parse(readFileSync(join(PE,'runs',`translate-${label}.json`),'utf8'));const dir=join(PE,'fidelity',label);
const sha=b=>createHash('sha256').update(b).digest('hex');
const fz=JSON.parse(readFileSync('evaluation/r3/translator-freeze.json','utf8'));
if(sha(readFileSync(join(PE,'fidelity/prompt.md')))!==fz.fidelityPrompt)throw Error('fidelity prompt changed after the freeze');
const span=u=>{const m=/(\d+)\s*-\s*(\d+)/.exec(String(u.lines));return m?[+m[1],+m[2]]:[+u.lines,+u.lines];};
if(mode==='input'){mkdirSync(dir,{recursive:true});
 for(const [cat,d] of Object.entries(run.detail)){const units=JSON.parse(readFileSync(join(PE,'inventory',`${cat}-${run.side}.json`),'utf8')).units;
  const st=d.statements.map(s=>({id:s.id,type:s.type,quote:s.quote,rendered:s.rendered,status:s.status,refs:s.refs}));
  const us=units.map(u=>{const [a,b]=span(u);return {unit:{id:u.id,quote:u.quote,type:u.type,subject:u.subject,relation:u.relation,object:u.object,conditions:u.conditions},
   statements:d.statements.filter(s=>s.provenance.line>=a&&s.provenance.line<=b).map(s=>({type:s.type,rendered:s.rendered}))};});
  const f=join(dir,`in-${cat}.json`);if(existsSync(f))throw Error('exists: '+f);writeFileSync(f,JSON.stringify({statements:st,units:us},null,1)+'\n');
  console.log(cat,'statements',st.length,'units',us.length,f);}}
else{const out={schema:'pee.r3.fidelity.v1',label,side:run.side,generatedAt:new Date().toISOString(),
 judges:'fresh-context agents of the developer model family, one per category, blind to the translator and its results; not independent human validation',categories:{}};
 for(const cat of Object.keys(run.detail)){const inp=JSON.parse(readFileSync(join(dir,`in-${cat}.json`),'utf8')),j=JSON.parse(readFileSync(join(dir,`out-${cat}.json`),'utf8'));
  const c={statements:inp.statements.length,units:inp.units.length,verdict:{},statusNotOk:0,byType:{},coverage:{},coverageHigh:{},missingJudgements:0};
  const units=JSON.parse(readFileSync(join(PE,'inventory',`${cat}-${run.side}.json`),'utf8')).units;const imp=new Map(units.map(u=>[u.id,u.importance]));
  const typeOf=new Map(inp.statements.map(s=>[s.id,s.type]));const inc=(o,k)=>o[k]=(o[k]??0)+1;
  const sj=new Map(j.statements.map(x=>[x.id,x]));for(const s of inp.statements){const x=sj.get(s.id);if(!x){c.missingJudgements++;continue;}inc(c.verdict,x.verdict);if(x.status_ok===false)c.statusNotOk++;c.byType[s.type]??={};inc(c.byType[s.type],x.verdict);}
  const uj=new Map(j.units.map(x=>[x.unit,x]));for(const u of inp.units){const x=uj.get(u.unit.id);if(!x){c.missingJudgements++;continue;}inc(c.coverage,x.coverage);if(imp.get(u.unit.id)==='high')inc(c.coverageHigh,x.coverage);}
  out.categories[cat]=c;console.log(cat,JSON.stringify({v:c.verdict,statusNotOk:c.statusNotOk,cov:c.coverage,high:c.coverageHigh,miss:c.missingJudgements}));}
 const f=`evaluation/r3/fidelity-${label}.json`;if(existsSync(f))throw Error('exists: '+f);writeFileSync(f,JSON.stringify(out,null,1)+'\n');}
