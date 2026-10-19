/** R3 fidelity of a later (tuned) translator run, judged only where it differs from a judged run: statements whose
 * (quote, type, rendered) changed and units whose statements changed are judged blind again (same frozen protocol);
 * every other judgement carries over; removed statements leave the count. Counts only in public.
 *   node scripts/r3-fidelity-delta.mjs input BASE NEW   -> private r3/fidelity/NEW/in-<cat>.json (delta only)
 *   node scripts/r3-fidelity-delta.mjs score BASE NEW   -> evaluation/r3/fidelity-NEW.json */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'r3');
const [mode,base,nw]=process.argv.slice(2);if(!['input','score'].includes(mode)||!base||!nw)throw Error('usage: input|score BASE NEW');
const fz=JSON.parse(readFileSync('evaluation/r3/translator-freeze.json','utf8'));
if(createHash('sha256').update(readFileSync(join(PE,'fidelity/prompt.md'))).digest('hex')!==fz.fidelityPrompt)throw Error('fidelity prompt changed');
const run=l=>JSON.parse(readFileSync(join(PE,'runs',`translate-${l}.json`),'utf8'));const A=run(base),B=run(nw);
const span=u=>{const m=/(\d+)\s*-\s*(\d+)/.exec(String(u.lines));return m?[+m[1],+m[2]]:[+u.lines,+u.lines];};
const key=s=>s.quote+'\u0000'+s.type+'\u0000'+s.rendered;const dir=join(PE,'fidelity',nw);mkdirSync(dir,{recursive:true});
const out={schema:'pee.r3.fidelity.v1',label:nw,base,side:B.side,generatedAt:new Date().toISOString(),tuned:true,
 judges:'changed items: fresh-context agents of the developer model family, blind to the translator; unchanged items carry over the base judgements; not independent human validation',categories:{}};
for(const cat of Object.keys(B.detail)){const units=JSON.parse(readFileSync(join(PE,'inventory',`${cat}-${B.side}.json`),'utf8')).units;
 const bi=JSON.parse(readFileSync(join(PE,'fidelity',base,`in-${cat}.json`),'utf8')),bo=JSON.parse(readFileSync(join(PE,'fidelity',base,`out-${cat}.json`),'utf8'));
 const baseSt=new Map(A.detail[cat].statements.map(s=>[key(s),s.id]));const bj=new Map(bo.statements.map(x=>[x.id,x]));const bu=new Map(bo.units.map(x=>[x.unit,x]));
 const stmts=B.detail[cat].statements;const changed=stmts.filter(s=>!baseSt.has(key(s)));
 const at=(d,u)=>{const [a,b]=span(u);return d.statements.filter(s=>s.provenance.line>=a&&s.provenance.line<=b).map(s=>s.type+'|'+s.rendered).sort().join('\n');};
 const chU=units.filter(u=>at(A.detail[cat],u)!==at(B.detail[cat],u));
 if(mode==='input'){const f=join(dir,`in-${cat}.json`);if(existsSync(f))throw Error('exists '+f);
  writeFileSync(f,JSON.stringify({statements:changed.map(s=>({id:s.id,type:s.type,quote:s.quote,rendered:s.rendered,status:s.status,refs:s.refs})),
   units:chU.map(u=>{const [a,b]=span(u);return {unit:{id:u.id,quote:u.quote,type:u.type,subject:u.subject,relation:u.relation,object:u.object,conditions:u.conditions},
    statements:B.detail[cat].statements.filter(s=>s.provenance.line>=a&&s.provenance.line<=b).map(s=>({type:s.type,rendered:s.rendered}))};})},null,1)+'\n');
  console.log(cat,'changed statements',changed.length,'of',stmts.length,'changed units',chU.length);continue;}
 const nj=JSON.parse(readFileSync(join(dir,`out-${cat}.json`),'utf8'));const nsj=new Map(nj.statements.map(x=>[x.id,x])),nuj=new Map(nj.units.map(x=>[x.unit,x]));
 const inc=(o,k)=>o[k]=(o[k]??0)+1;const c={statements:stmts.length,rejudgedStatements:changed.length,units:units.length,rejudgedUnits:chU.length,verdict:{},selfCheckFlagged:{},coverage:{},coverageHigh:{},missing:0};
 const chIds=new Set(changed.map(s=>s.id)),chUnits=new Set(chU.map(u=>u.id));
 for(const s of stmts){const x=chIds.has(s.id)?nsj.get(s.id):bj.get(baseSt.get(key(s)));if(!x){c.missing++;continue;}inc(c.verdict,x.verdict);if(s.selfCheck?.length)inc(c.selfCheckFlagged,x.verdict);}
 for(const u of units){const x=chUnits.has(u.id)?nuj.get(u.id):bu.get(u.id);if(!x){c.missing++;continue;}inc(c.coverage,x.coverage);if(u.importance==='high')inc(c.coverageHigh,x.coverage);}
 out.categories[cat]=c;console.log(cat,JSON.stringify(c));}
if(mode==='score'){const f=`evaluation/r3/fidelity-${nw}.json`;if(existsSync(f))throw Error('exists '+f);writeFileSync(f,JSON.stringify(out,null,1)+'\n');}
