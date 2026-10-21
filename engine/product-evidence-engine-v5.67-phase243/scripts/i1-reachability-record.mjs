#!/usr/bin/env node
/** First increment A2: re-measures the request path and rewrites only the measured fields of the vertical contract
 * (reachability.requestPathImports, reachability.executed, scientificCapabilities.modules[].requestPath). Run after
 * reviewing a change that tests/i1_reachability.test.ts reports; the review, not this script, decides whether the
 * change is acceptable. Needs a build (dist/). Usage: node scripts/i1-reachability-record.mjs [--check] */
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawnSync} from 'node:child_process';
const F='docs/architecture/vertical-contract.json';const c=JSON.parse(fs.readFileSync(F,'utf8'));
const re=/(?:^|[;\n])\s*(?:import|export)\s[^;]*?from\s*['"](\.\/[^'"]+)['"]|import\(\s*['"](\.\/[^'"]+)['"]\s*\)/g;
const deps=m=>{const t=fs.readFileSync('dist/src/'+m+'.js','utf8');return [...new Set([...t.matchAll(re)].map(x=>(x[1]||x[2]).replace(/^\.\//,'').replace(/\.js$/,'')))];};
const closure=e=>{const seen=new Set([e]);const st=[e];while(st.length)for(const d of deps(st.pop()))if(!seen.has(d)){seen.add(d);st.push(d);}return seen;};
const entry=c.reachability.entry.split('.')[0];const imp=closure(entry);const executed={};
for(const cfg of Object.keys(c.reachability.executed)){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pee-i1-cov-'));
 const r=spawnSync(process.execPath,['dist/tests/request_path_probe.js',cfg],{env:{...process.env,NODE_V8_COVERAGE:dir,NODE_NO_WARNINGS:'1'}});if(r.status)throw Error(String(r.stderr));
 const files=fs.readdirSync(dir).map(f=>[f,fs.statSync(path.join(dir,f)).mtimeMs]).sort((a,b)=>a[1]-b[1]);const j=JSON.parse(fs.readFileSync(path.join(dir,files.at(-1)[0]),'utf8'));
 const e=new Set();for(const s of j.result){const m=/\/dist\/src\/([^/]+)\.js$/.exec(s.url);if(m&&s.functions.some(fn=>fn.functionName!==''&&fn.ranges[0].count>0))e.add(m[1]);}
 fs.rmSync(dir,{recursive:true});executed[cfg]=[...e].sort();}
const cls=m=>{const id=m.replace(/\.ts$/,'');if(executed.default.includes(id))return 'executed_by_default';
 const opt=['quantity','needInterpretation','scientific98'].filter(k=>executed[k].includes(id));if(opt.length)return 'executed_with_opt_in:'+opt.join('+');
 return imp.has(id)?'imported_not_executed':'not_imported';};
const before=JSON.stringify([c.reachability.requestPathImports,c.reachability.executed,c.scientificCapabilities.modules.map(m=>m.requestPath)]);
c.reachability.requestPathImports=[...imp].sort();c.reachability.executed=executed;for(const m of c.scientificCapabilities.modules)m.requestPath=cls(m.module);
const after=JSON.stringify([c.reachability.requestPathImports,c.reachability.executed,c.scientificCapabilities.modules.map(m=>m.requestPath)]);
if(process.argv.includes('--check')){console.log(before===after?'unchanged':'changed');process.exit(before===after?0:1);}
fs.writeFileSync(F,JSON.stringify(c,null,1)+'\n');console.log(before===after?'unchanged':'updated');
