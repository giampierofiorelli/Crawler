import {readdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const dir=resolve('dist/tests');
const excluded=['phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js'];
const tests=readdirSync(dir).filter(n=>n.endsWith('.test.js')&&!excluded.includes(n)).sort();
const groups=[];let passing=0;
for(let i=0;i<tests.length;i+=8){
 const files=tests.slice(i,i+8);
 const res=spawnSync(process.execPath,['--test','--test-concurrency=2',...files.map(f=>resolve(dir,f))],
  {encoding:'utf8',timeout:90000,maxBuffer:12*1024*1024});
 const pass=Number([...((res.stdout??'').matchAll(/^# pass (\d+)$/gm))].at(-1)?.[1]??0);
 const failed=Number([...((res.stdout??'').matchAll(/^# fail (\d+)$/gm))].at(-1)?.[1]??-1);
 const status=res.status===0&&failed===0&&pass>0?'pass':'failed';
 groups.push({group:groups.length+1,files,pass,failed,status,...(status==='failed'?{
  diagnostic:((res.stdout??'')+'\n'+(res.stderr??'')).slice(-2000),timeout:res.error?.code==='ETIMEDOUT'}:{})});
 passing+=pass;console.log(`Group ${groups.length}: ${pass} passing / ${failed} failures — ${status}`);
}
const result={phase:139,version:'4.63-phase139',typescript:{status:groups.every(x=>x.status==='pass')?'pass':'failure',
 passing,eligibleFiles:tests.length,excludedLegacy:excluded,groups}};
writeFileSync('PHASE139-REGRESSION-GROUPS.json',JSON.stringify(result,null,2)+'\n');
if(result.typescript.status!=='pass')process.exitCode=1;
