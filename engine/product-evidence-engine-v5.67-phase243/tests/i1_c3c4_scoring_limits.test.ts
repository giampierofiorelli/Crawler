// First increment A4 (owner authorisation 2026-10-21): while the decision path is blocked, C3/C4 score justified
// abstention and precise missing evidence, never a ranking that cannot exist. This test ties the registered scoring
// limits (evaluation/r3c/c3-c4-scoring-limits.json) to the contract's real stage statuses, so the record cannot go stale
// silently in either direction.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ROOT=new URL('../../',import.meta.url).pathname;
const C=JSON.parse(readFileSync(ROOT+'docs/architecture/vertical-contract.json','utf8'));
const L=JSON.parse(readFileSync(ROOT+'evaluation/r3c/c3-c4-scoring-limits.json','utf8'));

test('A4: the scoring limits apply exactly while a decision stage is blocked', ()=>{
 const status=new Map((C.stages as {id:string;status:string}[]).map(s=>[s.id,s.status]));
 for(const id of L.appliesWhile.stagesBlocked)assert.ok(status.has(id),`${id} is a contract stage`);
 const blocked=L.appliesWhile.stagesBlocked.filter((id:string)=>status.get(id)==='blocked'||status.get(id)==='not_implemented');
 assert.ok(blocked.length>0,'all decision stages are connected: supersede this record with a scoring that includes ranking');
});

test('A4: decision-stage scoring covers abstention and missing evidence, and excludes ranking quality', ()=>{
 const s=L.decisionStageScoring;
 assert.deepEqual(Object.keys(s.scored).sort(),['harmful_conclusion','justified_abstention','precise_missing_evidence','unjustified_abstention']);
 assert.ok('ranking_quality' in s.notScored);
 assert.ok(!Object.keys(s.scored).some(k=>/rank/.test(k)),'no ranking metric is scored while ranking is blocked');
 assert.match(L.consequence,/may not claim progress toward a correct ranking/);
});

test('A4: the roadmap R3-C records the limit next to C3/C4', ()=>{
 const rm=readFileSync(ROOT+'../../.claude/skills/pee-guided-learning/references/roadmap.md','utf8');
 assert.ok(rm.includes('evaluation/r3c/c3-c4-scoring-limits.json'),'roadmap cites the scoring limits');
});
