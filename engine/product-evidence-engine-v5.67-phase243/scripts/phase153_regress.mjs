import {readdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const dir=resolve('dist/tests');
const excluded=['phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js'];
const files=readdirSync(dir).filter(n=>n.endsWith('.test.js')&&!excluded.includes(n)).sort();
const groups=[];let passing=0;
for(let i=0;i<files.length;i+=8){
 const names=files.slice(i,i+8);
 const r=spawnSync(process.execPath,['--test','--test-concurrency=2',...names.map(n=>resolve(dir,n))],{
  encoding:'utf8',timeout:90000,maxBuffer:12*1024*1024});
 const passed=Number([...((r.stdout??'').matchAll(/^# pass (\d+)$/gm))].at(-1)?.[1]??0);
 const failed=Number([...((r.stdout??'').matchAll(/^# fail (\d+)$/gm))].at(-1)?.[1]??-1);
 const status=r.status===0&&failed===0&&passed>0?'pass':'failed';
 groups.push({group:groups.length+1,files:names,pass:passed,failed,status,...(status==='failed'?{output:((r.stdout??'')+'\n'+(r.stderr??'')).slice(-2000)}:{})});
 passing+=passed;console.log(`Group ${groups.length}: ${passed} passing, ${failed} failures, ${status}`);
}
const result={phase:153,version:'4.77-phase153',typescript:{status:groups.every(x=>x.status==='pass')?'pass':'failure',passing,
 eligibleFiles:files.length,excludedLegacy:excluded,groups}};
writeFileSync('PHASE153-REGRESSION-GROUPS.json',JSON.stringify(result,null,2)+'\n');
if(result.typescript.status!=='pass')process.exitCode=1;
