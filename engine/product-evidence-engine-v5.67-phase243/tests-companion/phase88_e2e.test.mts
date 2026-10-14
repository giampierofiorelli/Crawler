import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { phase87Call } from '../phase87/phase87_client.ts';
import { intakeApprovedHTML } from '../phase88/approved_html_intake.ts';

function sample(model:string, hours:number, labelled_by:string) {
  const url=`https://maker.example/products/${model.toLowerCase().replaceAll(' ','-')}`;
  const html=`<h1>${model}</h1><table><tr><th>Battery life</th><td>${hours} h</td></tr></table>`;
  return {url,model,html,labelled_by,expected:{battery_hours:{value:hours,unit:'h'}}};
}

test('actual Python SQLite recipe, TypeScript bridge, authorisation seam and quarantine seam', async () => {
  const dir=mkdtempSync(join(tmpdir(),'phase88-e2e-'));
  try {
    const db_path=join(dir,'recipes.sqlite3');
    const examples=[sample('Maker One',20,'assessor_alpha'),sample('Maker Two',30,'assessor_beta')];
    const fields=[{key:'battery_hours',unit:'h',review_id:'reviewed-field-001'}];
    const inventory = await phase87Call<any>('inventory',{
      samples:examples,host:'maker.example',prefix:'/products/',fields,
    });
    assert.equal(inventory.candidates.length,1);
    const proposal=[{fieldKey:'battery_hours',candidateId:inventory.candidates[0].id}];
    const qualified=await phase87Call<any>('qualify',{
      samples:examples,host:'maker.example',prefix:'/products/',
      category:'headphones',fields,proposal,
    });
    assert.equal(qualified.status,'ready_for_human_review');
    // Human-review receipt here is synthetic; this is NOT authenticated production approval.
    const reviewed=await phase87Call<any>('review',{
      recipe:qualified,reviewer:'reviewer_gamma',review_receipt:'synthetic-review-receipt-001',
    });
    const recipeId=await phase87Call<string>('install',{db_path,recipe:reviewed});
    let reads=0,quarantines=0;
    const target=sample('Maker Three',27,'assessor_delta');
    const output=await intakeApprovedHTML({
      url:target.url,model:target.model,category:'headphones',
      asOf:'2026-10-10T18:00:00Z',dbPath:db_path,recipeId,
      allowedFieldKeys:['battery_hours'],
    },{
      resolveReviewedFieldRegistry: async category => ({
        state:'reviewed_field_registry',category,registryReviewId:'category-registry-synthetic',
        fieldKeys:['battery_hours'],
      }),
      readApprovedSource:async req=>{
        reads++;
        assert.equal(req.url,target.url);
        return {
          state:'approved_source_read',requestedUrl:target.url,finalUrl:target.url,
          body:target.html,contentType:'text/html',sourcePolicyId:'phase69-authorization-synthetic',
          acquisitionPlanId:'phase68-plan-synthetic',rightsReviewId:'rights-check-synthetic',
          robots:'allowed',websiteTerms:'allowed',extractionRights:'allowed',
          operation:'manufacturer_specifications',
        };
      },
      quarantineManufacturerClaims:async claims=>{
        quarantines++;
        assert.equal(claims.length,1);
        assert.equal(claims[0].fieldKey,'battery_hours');
        assert.equal(claims[0].value,27);
        assert.equal(claims[0].unit,'h');
        assert.equal(claims[0].origin,'manufacturer_declared');
        return {state:'quarantined',acceptedCount:1,receiptId:'synthetic-quarantine-receipt',
          evidenceRole:'manufacturer_declared'};
      },
    });
    assert.equal(output.modelCalls,0);
    assert.equal(output.acceptedCount,1);
    assert.equal(output.rankingApproved,false);
    assert.equal(reads,1);
    assert.equal(quarantines,1);
    const status=await phase87Call<any>('status',{db_path,recipe_id:recipeId});
    assert.equal(status.active,true);
    assert.equal(status.consecutive_structural_failures,0);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
