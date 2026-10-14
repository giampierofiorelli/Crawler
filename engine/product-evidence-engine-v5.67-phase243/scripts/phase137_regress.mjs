import {readdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const dir=resolve('dist/tests');
const excluded=['phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js'];
const tests=readdirSync(dir).filter(n=>n.endsWith('.test.js')&&!excluded.includes(n)).sort();
const chunks=[];for(let i=0;i<tests.length;i+=8)chunks.push(tests.slice(i,i+8));
let total=0;const groups=[];
for(let i=0;i<chunks.length;i++){
 const files=chunks[i];const r=spawnSync(process.execPath,['--test','--test-concurrency=2',...files.map(t=>resolve(dir,t))],
  {encoding:'utf8',timeout:90000,maxBuffer:12*1024*1024});
 const pass=Number([...((r.stdout??'').matchAll(/^# pass (\d+)$/gm))].at(-1)?.[1]??0);
 const fail=Number([...((r.stdout??'').matchAll(/^# fail (\d+)$/gm))].at(-1)?.[1]??-1);
 const status=r.status===0&&fail===0&&pass>0?'pass':'failed';
 groups.push({group:i+1,files,passed:pass,failed:fail,status,timeout:r.error?.code==='ETIMEDOUT',
  ...(status==='failed'?{diagnostic:((r.stdout??'')+'\n'+(r.stderr??'')).slice(-1200)}:{})});
 total+=pass;
 console.log(`group ${i+1}/${chunks.length}: ${pass} passed, ${fail} failed, status=${status}`);
}
const result={phase:137,version:'4.61-phase137',typescript:{status:groups.every(x=>x.status==='pass')?'pass':'partial_or_failed',
 passed:total,testFiles:tests.length,groupCount:groups.length,excludedLegacy:excluded,groups}};
writeFileSync('PHASE137-REGRESSION-GROUPS.json',JSON.stringify(result,null,2)+'\n');
if(result.typescript.status!=='pass')process.exitCode=1;
