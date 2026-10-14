import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {watchLedgerCall} from '../phase89/watch_client.ts';
import type {WatchInput,WatchResult} from '../phase89/watch_client.ts';
import {intakeWithStrategyWatch,IntakeFailureWithWatch} from '../phase89/monitored_html_intake.ts';
import {phase87Call} from '../phase87/phase87_client.ts';

const sha='a'.repeat(64);
const model='Maker One';
const url='https://maker.example/products/maker-one';
function watchInput(path:string,product='Maker One',type:WatchInput['record']['event_type']='structural_missing',time='2026-10-10T18:00:00Z'):WatchInput{
  return {db_path:path,record:{source_host:'maker.example',path_prefix:'/products/',
    category:'headphones',recipe_id:sha,
    url:`https://maker.example/products/${product.toLowerCase().replaceAll(' ','-')}`,
    model:product,observed_at:time,event_type:type,
    receipt_id:'synthetic-observed-error-hash'}};
}
test('real Python SQLite monitoring bridge queues distinct-model drift without an LLM',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'phase89-watch-'));
  try{
    const db=join(dir,'watch.sqlite3');
    const a=await watchLedgerCall<WatchResult>('record',watchInput(db));
    assert.equal(a.action,'observe_more_models');
    const b=await watchLedgerCall<WatchResult>('record',watchInput(db,'Maker Two','structural_missing','2026-10-10T18:01:00Z'));
    assert.equal(b.action,'human_requalification_required');
    assert.equal(b.automatic_llm_calls,0);
    assert.equal(b.automatic_approval,false);
    const pending=await watchLedgerCall<any[]>('pending',{db_path:db});
    assert.equal(pending.length,1);
    const replay=await watchLedgerCall<WatchResult>('record',watchInput(db,'Maker Two','structural_missing','2026-10-10T18:01:00Z'));
    assert.equal(replay.idempotent_replay,true);
    const close=await watchLedgerCall<any>('close_case',{db_path:db,source_key:b.source_key,
      recipe_id:sha,disposition_receipt:'independent-researcher-ack-001'});
    assert.equal(close.automatic_approval,false);
    assert.equal((await watchLedgerCall<any[]>('pending',{db_path:db})).length,0);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
function s(modelName:string,hours:number,htmlOverride?:string){
  return {url:`https://maker.example/products/${modelName.toLowerCase().replaceAll(' ','-')}`,
    model:modelName,html:htmlOverride??`<h1>${modelName}</h1><table><tr><td>Battery life</td><td>${hours} h</td></tr></table>`,
    labelled_by:'separate_assessor_001',expected:{battery_hours:{value:hours,unit:'h'}}};
}
async function reviewedRecipe(db_path:string){
  const examples=[s('Maker One',20),s('Maker Two',24)];
  examples[1].labelled_by='separate_assessor_002';
  const fields=[{key:'battery_hours',unit:'h',review_id:'validated-battery-field'}];
  const inv=await phase87Call<any>('inventory',{samples:examples,host:'maker.example',prefix:'/products/',fields});
  const candidateId=inv.candidates[0].id;
  const qualified=await phase87Call<any>('qualify',{samples:examples,host:'maker.example',prefix:'/products/',
    category:'headphones',fields,proposal:[{fieldKey:'battery_hours',candidateId}]});
  const reviewed=await phase87Call<any>('review',{recipe:qualified,
    reviewer:'independent_reviewer_009',review_receipt:'synthetic-review-2026'});
  return phase87Call<string>('install',{db_path,recipe:reviewed});
}
function deps(page:string,counts:{read:number;quarantine:number},forUrl:string){
  return {
    resolveReviewedFieldRegistry:async (category:string)=>({state:'reviewed_field_registry' as const,
      category,registryReviewId:'independent-registry-001',fieldKeys:['battery_hours']}),
    readApprovedSource:async()=>{counts.read++;return {
      state:'approved_source_read' as const,requestedUrl:forUrl,finalUrl:forUrl,
      body:page,contentType:'text/html',sourcePolicyId:'source-policy-abc',
      acquisitionPlanId:'approved-plan-001',rightsReviewId:'reviewed-rights-001',
      robots:'allowed' as const,websiteTerms:'allowed' as const,extractionRights:'allowed' as const,
      operation:'manufacturer_specifications' as const,
    };},
    quarantineManufacturerClaims:async (claims:readonly unknown[])=>{
      counts.quarantine++;
      return {state:'quarantined' as const,acceptedCount:claims.length,
        receiptId:'quarantine-receipt-abc',evidenceRole:'manufacturer_declared' as const};
    },
  };
}
test('phase89 wraps actual phase88/87/SQLite success; no network, no LLM, quarantine only',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'phase89-e2e-'));
  try{
    const recipesDb=join(dir,'recipes.sqlite3');
    const watchDb=join(dir,'watch.sqlite3');
    const recipeId=await reviewedRecipe(recipesDb);
    const sample=s('Maker Three',30);
    const counts={read:0,quarantine:0};
    const outcome=await intakeWithStrategyWatch({url:sample.url,model:sample.model,category:'headphones',
      asOf:'2026-10-10T18:00:00Z',recipeId,dbPath:recipesDb,
      allowedFieldKeys:['battery_hours'],sourceHost:'maker.example',pathPrefix:'/products/',
      watchDbPath:watchDb},deps(sample.html,counts,sample.url));
    assert.equal(outcome.result.acceptedCount,1);
    assert.equal(outcome.result.rankingApproved,false);
    assert.equal(outcome.result.modelCalls,0);
    assert.equal(outcome.automaticLlmCalls,0);
    assert.equal(outcome.monitoring,'recorded');
    assert.equal(outcome.advisoryAction,'reuse_when_authorized');
    assert.deepEqual(counts,{read:1,quarantine:1});
    assert.deepEqual(await watchLedgerCall<any[]>('pending',{db_path:watchDb}),[]);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('two distinct models with changed layout raise human review, never quarantine bad values',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'phase89-layout-'));
  try{
    const recipesDb=join(dir,'recipes.sqlite3');
    const watchDb=join(dir,'watch.sqlite3');
    const recipeId=await reviewedRecipe(recipesDb);
    const counts={read:0,quarantine:0};
    for(const [product,at] of [['Maker Three','2026-10-10T18:00:00Z'],['Maker Four','2026-10-10T18:01:00Z']]){
      const target=s(product,30,`<h1>${product}</h1><table><tr><td>Battery time</td><td>30 h</td></tr></table>`);
      await assert.rejects(()=>intakeWithStrategyWatch({url:target.url,model:target.model,
        category:'headphones',asOf:at,recipeId,dbPath:recipesDb,
        allowedFieldKeys:['battery_hours'],sourceHost:'maker.example',pathPrefix:'/products/',
        watchDbPath:watchDb},deps(target.html,counts,target.url)),(err:any)=>{
          assert.ok(err instanceof IntakeFailureWithWatch);
          assert.equal(err.watchRecorded,true);
          assert.match(err.message,/phase87_recipe_missing_or_ambiguous_field/);
          return true;
        });
    }
    assert.equal(counts.quarantine,0);
    assert.equal((await watchLedgerCall<any[]>('pending',{db_path:watchDb})).length,1);
    assert.equal((await phase87Call<any>('status',{db_path:recipesDb,recipe_id:recipeId})).active,false);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('rights denial blocks extraction and records access review, not strategy drift',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'phase89-denial-'));
  try{
    const db_path=join(dir,'watch.sqlite3');
    let read=0,quarantine=0;
    await assert.rejects(()=>intakeWithStrategyWatch({url,model,category:'headphones',
      asOf:'2026-10-10T18:00:00Z',recipeId:sha,dbPath:join(dir,'recipes.sqlite3'),
      allowedFieldKeys:['battery_hours'],sourceHost:'maker.example',pathPrefix:'/products/',
      watchDbPath:db_path},{
      resolveReviewedFieldRegistry:async()=>({state:'reviewed_field_registry',category:'headphones',
        registryReviewId:'reviewed-registry-abc',fieldKeys:['battery_hours']}),
      readApprovedSource:async()=>{read++;return {state:'approved_source_read',requestedUrl:url,finalUrl:url,
        body:'<h1>Maker One</h1>',contentType:'text/html',sourcePolicyId:'policy-record-abc',
        acquisitionPlanId:'source-plan-abc',rightsReviewId:'not-approved-rights',
        robots:'allowed',websiteTerms:'denied' as any,extractionRights:'allowed',
        operation:'manufacturer_specifications'};},
      quarantineManufacturerClaims:async()=>{quarantine++;throw Error('must_not_execute')},
    }), (err:any)=>{
      assert.equal(err.watchRecorded,true);
      assert.equal(err.advisoryAction,'access_review_required_no_ai');
      return true;
    });
    assert.equal(read,1);
    assert.equal(quarantine,0);
    assert.deepEqual(await watchLedgerCall<any[]>('pending',{db_path}),[]);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('monitoring failure after completed quarantine explicitly reports partial monitoring',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'phase89-monitor-failure-'));
  try{
    const recipesDb=join(dir,'recipes.sqlite3'), recipeId=await reviewedRecipe(recipesDb);
    const target=s('Maker Three',26);
    const counts={read:0,quarantine:0};
    const result=await intakeWithStrategyWatch({url:target.url,model:target.model,
      category:'headphones',asOf:'2026-10-10T18:00:00Z',recipeId,dbPath:recipesDb,
      allowedFieldKeys:['battery_hours'],sourceHost:'maker.example',pathPrefix:'/products/',
      watchDbPath:join(dir,'watch.sqlite3')},{...deps(target.html,counts,target.url),
      recordWatch:async()=>{throw Error('offline-watch-db')}});
    assert.equal(result.monitoring,'unavailable_after_quarantine');
    assert.equal(result.result.acceptedCount,1);
    assert.equal(result.monitoringError,'offline-watch-db');
    assert.equal(counts.quarantine,1);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
