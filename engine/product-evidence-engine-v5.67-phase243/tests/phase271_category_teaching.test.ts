import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';

// Phase271 §8-§10: the DEVELOPMENT requests of evaluation/phase271/cross-eval-set.json only; the untouched requests are
// measured by scripts/phase269-teaching-eval.mjs. This test also records which taught aliases occur in untouched requests.
const SET=JSON.parse(readFileSync(new URL('../../evaluation/phase271/cross-eval-set.json',import.meta.url),'utf8'));
function store(){const s=new KnowledgeStore246(':memory:');registerTeachingSources252(SOURCES271);applyTeaching252(s,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');return s;}

test('development requests: category, outcome, taught measurement, proxy and condition, and the decision',()=>{
 const s=store();
 for(const r of SET.development){
  const a=adviseFromRequest253(r.text,s,CATEGORY_REGISTRY250);
  assert.equal(a.category,r.category,r.id);for(const o of r.outcomes)assert.ok(a.needs.includes(o),r.id+' '+o);
  assert.equal(a.goalAssessment!.decision,r.decision,r.id);
  for(const [need,ms] of Object.entries(r.measures as Record<string,string[]>)){const o=a.goalAssessment!.outcomes.find(x=>x.need===need)!;
   for(const m of ms)assert.ok(o.relevantMeasures.includes(m),`${r.id} ${need} ${m}`);
   for(const p of (r.proxies as Record<string,string[]>)[need]??[])assert.ok(o.rejectedProxies.includes(p),`${r.id} proxy ${p}`);
   assert.equal(o.coverage,'unassessed',`${r.id}: no authentic evidence is held for ${need}`);}
  assert.notEqual(a.response,'ranked_recommendation');
 }
 s.close();
});

test('every lesson keeps its package status and reference ids; overlaps with untouched requests are listed, not chosen',()=>{
 for(const t of [DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271])for(const n of t.needs)if(n.outcome)assert.match(n.outcome.text,/Package 0[46] \([a-z ]+; [^)]+\)\./,n.id);
 const aliases=[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271].flatMap(t=>t.needs.flatMap(n=>n.aliases.map(a=>[n.id,a])));
 const overlap=SET.untouched.flatMap((r:{id:string;text:string})=>aliases.filter(([,a])=>r.text.toLowerCase().includes(a)).map(([n,a])=>`${r.id}:${n}:${a}`));
 // Recorded in the Phase271 report: these package phrases also occur in untouched requests.
 assert.deepEqual(overlap,['PU1:fine_particle_reduction:wildfire smoke','PU2:room_coverage_distribution:square metres']);
});
