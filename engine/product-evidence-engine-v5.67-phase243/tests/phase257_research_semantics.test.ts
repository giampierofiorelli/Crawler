import test from 'node:test';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {researchJobFromGap182,researchQuestion182} from '../src/phase182_gap_research_orchestrator.js';
import type {ResearchGap181} from '../src/phase181_dynamic_knowledge_ranking.js';
// Phase257 Stage 1, written before the change: specification research is not independent testing.
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
test('missing_declaration and declaration_conflict are their own gap kinds; missing_test ids are unchanged',()=>{
 const t=researchJobFromGap182('air_fryers',{kind:'missing_test',reference:'prd_x:crisp_texture',action:'a'});
 // Identity of an existing missing_test job: the same formula as before Phase257.
 assert.equal(t.jobId,`research_${sha(JSON.stringify(['air_fryers','exact_variant_source_research','missing_test','prd_x:crisp_texture','prd_x','crisp_texture'])).slice(0,32)}`);
 const d=researchJobFromGap182('air_fryers',{kind:'missing_declaration',reference:'prd_x:capacity_min',action:'a'} as ResearchGap181);
 const c=researchJobFromGap182('air_fryers',{kind:'declaration_conflict',reference:'prd_x:capacity_min',action:'a'} as ResearchGap181);
 assert.equal(d.gapKind,'missing_declaration');assert.equal(c.gapKind,'declaration_conflict');
 assert.equal(d.exactVariantId,'prd_x');assert.equal(d.criterionId,'capacity_min');
 assert.notEqual(d.jobId,c.jobId);assert.notEqual(d.jobId,researchJobFromGap182('air_fryers',{kind:'missing_test',reference:'prd_x:capacity_min',action:'a'}).jobId);
 assert.throws(()=>researchJobFromGap182('air_fryers',{kind:'missing_declaration',reference:'prd_x',action:'a'} as ResearchGap181),/phase182_bad_variant_or_criterion/);
});
test('execution words specification research as a declaration search, never as independent testing',()=>{
 for(const k of ['missing_declaration','declaration_conflict'] as const){const q=researchQuestion182(k);
  assert.match(q,/declared specification|declarations/i);assert.doesNotMatch(q,/independent|empirical|test/i);}
 assert.equal(researchQuestion182('missing_test'),'Independent empirical research on this exact product and use case','unchanged for independent tests');
});
