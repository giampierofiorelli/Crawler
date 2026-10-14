import {readdirSync,writeFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';import {resolve} from 'node:path';
const dir=resolve('dist/tests');
const tests=readdirSync(dir).filter(n=>n.endsWith('.test.js')&&!['phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js'].includes(n));
const groups=Array.from({length:6},()=>[]);tests.forEach((t,i)=>groups[i%groups.length].push(resolve(dir,t)));
let total=0,failures=[];const report=[];
for(let i=0;i<groups.length;i++){
 const r=spawnSync(process.execPath,['--test','--test-concurrency=2',...groups[i]],{encoding:'utf8',timeout:110000,maxBuffer:10*1024*1024});
 const matches=[...((r.stdout??'').matchAll(/^# pass (\d+)/gm))];
 const counts=matches.length?Number(matches.at(-1)[1]):0;
 const fails=[...((r.stdout??'').matchAll(/^# fail (\d+)/gm))];
 const nf=fails.length?Number(fails.at(-1)[1]):null;
 report.push({group:i+1,files:groups[i].length,passed:counts,failed:nf,status:r.status,timeout:r.error?.code==='ETIMEDOUT'});
 total+=counts;
 if(r.status!==0||!counts||nf!==0){failures.push(i+1);}
 console.log(`group ${i+1}: ${counts} passed / ${nf} failed; status=${r.status} ${r.error?.code||''}`);
}
const out={phase:133,testFiles:tests.length,completedGroups:groups.length-failures.length,
 passed:total,failedGroups:failures,complete:failures.length===0,groups:report,
 excludedLegacy:['phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js']};
writeFileSync('PHASE133-REGRESSION-GROUPS.json',JSON.stringify(out,null,2)+'\n');
if(failures.length)process.exitCode=1;
