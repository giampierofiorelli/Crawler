import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
import {Phase77ProgressLedger} from '../src/phase77_progress_ledger.js';
import {createPhase77HttpApi} from '../src/phase77_http.js';
import type {StructuredDemand} from '../src/phase77_decision_research.js';
const demand:StructuredDemand={mode:'functional_discovery',outcomeIds:['mattress_dust_removal'],
 mustHaveIds:['low_moisture'],exclusionIds:[],regionId:'uk',productId:null,confirmedBy:'user'};
test('loopback research HTTP requires permitted intake, preserves private progress and rejects raw text',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'pee77-http-'));
 const server=createPhase77HttpApi({ledger:new Phase77ProgressLedger(path.join(dir,'progress.json')),
  authorizeIntake:async r=>r.headers['x-trusted-intake']==='unit_test_only'});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const bound=server.address();if(!bound||typeof bound==='string')throw Error('missing listener');
  const base=`http://127.0.0.1:${bound.port}`;
  const send=(data:object,allowed=true)=>fetch(base+'/v2/decision-research',{
   method:'POST',headers:{'Content-Type':'application/json',
   ...(allowed?{'x-trusted-intake':'unit_test_only'}:{})},body:JSON.stringify(data)});
  assert.equal((await send(demand,false)).status,403);
  assert.equal((await send({query:'What cleans a mattress?'})).status,422);
  const res=await send(demand);assert.equal(res.status,202);
  const result=await res.json() as {accessToken:string;checkUrl:string;view:{requestId:string;status:string}};
  assert.equal(result.view.status,'queued');
  assert.equal((await fetch(base+result.checkUrl)).status,404);
  const status=await fetch(base+result.checkUrl,{headers:{Authorization:'Bearer '+result.accessToken}});
  assert.equal(status.status,200);assert.equal(status.headers.get('cache-control'),'no-store');
  const body=await status.json() as {estimatedCompletionAt:null;automaticNotificationAvailable:boolean;steps:unknown[]};
  assert.equal(body.estimatedCompletionAt,null);assert.equal(body.automaticNotificationAvailable,false);
  assert.equal(body.steps.length,7);
 }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  await rm(dir,{recursive:true,force:true});}
});
