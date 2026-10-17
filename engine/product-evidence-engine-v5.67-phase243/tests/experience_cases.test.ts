import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {meetsReference,replayVerdict,summariseReplay,recurringPatterns,publicCase,attributionClass,type ExperienceCase,type ObservedState} from '../src/experience_cases.js';

// Step 1A: experience-case representation and replay verdicts. Every case below is FICTIONAL (the authentic pilot cases are
// private; their public index is checked at the end for leakage).
const base=(id:string,over:Partial<ExperienceCase>={}):ExperienceCase=>({schema:'pee.experience-case.v1',id,kind:'quantitative_value',family:'S_extraction_success',category:'kettles',
 source:{host:'lab-a.test',docTag:'d1',docSha256:'0'.repeat(64),evaluation:'fictional',run:'fictional',goldId:'g1',historicalArm:'B',historicalBuild:{commit:'abc1234',path:'/none'}},
 item:{value:1,unit:'kwh',goldSubject:'Zentra K1'},historical:{status:'found',subject:'Zentra K1',subjectOutcome:'correct'},
 reference:{expected:'found_with_accepted_subject',acceptedSubjects:['Zentra K1'],basis:'independent_gold',independence:'fictional'},
 features:[],cause:{candidate:'',status:'not_applicable',evidence:''},lesson:{hypothesis:'',status:'hypothesis',applicability:'',exceptions:[]},supports:[],counterexamples:[],
 maturity:'T2_untouched_first_run',...over});
const found=(subject:string|null,o:'correct'|'incorrect_match'|'unresolved'):ObservedState=>({status:'found',subject,subjectOutcome:o});

test('reference expectations: a wrong product never meets; an audited variant name does; unresolved only when allowed',()=>{
 const c=base('c1');assert.equal(meetsReference(c,found('Zentra K1','correct')),true);
 assert.equal(meetsReference(c,found('Zentra K2','incorrect_match')),false);
 assert.equal(meetsReference(c,found(null,'unresolved')),false);
 assert.equal(meetsReference(base('c2',{reference:{...c.reference,unresolvedAcceptable:true}}),found(null,'unresolved')),true);
 const v=base('c3',{reference:{...c.reference,acceptedSubjects:['Zentra K1','Zentra K1-80'],basis:'independent_gold_plus_developer_audit'}});
 assert.equal(meetsReference(v,found('Zentra K1-80','incorrect_match')),true,'an audited identity variant meets the reference even when the scorer rule says otherwise');
 const fp=base('c4',{kind:'false_positive_finding',reference:{expected:'absent',basis:'independent_gold',independence:'x'}});
 assert.equal(meetsReference(fp,{status:'emitted'}),false);assert.equal(meetsReference(fp,{status:'not_emitted'}),true);
 const rq=base('c5',{kind:'request',reference:{expected:'gap_stated',basis:'frozen_request_design',independence:'x'}});
 assert.equal(meetsReference(rq,{status:'responded',response:'out_of_scope',category:null}),true);
 assert.equal(meetsReference(rq,{status:'responded',response:'clarification',category:null}),false);
});

test('replay transitions keep historical, current and reference apart; a lost success is a regression',()=>{
 const ok=base('s1'),bad=base('f1',{family:'F1_identity_by_default',historical:found('Zentra K2','incorrect_match')});
 assert.equal(replayVerdict(ok,found('Zentra K1','correct'),null).transition,'preserved_success');
 assert.equal(replayVerdict(ok,{status:'absent'},null).transition,'lost_success');
 assert.equal(replayVerdict(bad,found('Zentra K1','correct'),null).transition,'corrected');
 assert.equal(replayVerdict(bad,found('Zentra K2','incorrect_match'),null).transition,'persistent_failure');
 const u=replayVerdict(ok,null,null,'page bytes missing');assert.deepEqual([u.transition,u.currentMeets,u.reason],['unreproducible',null,'page bytes missing']);
 // The frozen re-observation checks the committed history; a disagreement is reported, the history is not edited.
 const v=replayVerdict(bad,found('Zentra K2','incorrect_match'),{status:'absent'});assert.equal(v.historicalReproduced,false);assert.equal(bad.historical.status,'found');
 const s=summariseReplay([replayVerdict(ok,found('Zentra K1','correct'),null),replayVerdict(ok,{status:'absent'},null),u]);
 assert.deepEqual([s.preserved_success,s.lost_success,s.unreproducible,s.regression],[1,1,1,true]);
 assert.equal(summariseReplay([replayVerdict(ok,found('Zentra K1','correct'),null)]).regression,false);
});

test('recurring patterns are proposals: two or more failing cases across hosts or categories, with counterexamples listed',()=>{
 const f=(id:string,host:string,cat:string)=>base(id,{family:'F1_identity_by_default',category:cat,features:['document_names_several_products'],source:{...base('x').source,host}});
 const one=recurringPatterns([f('a','h1','kettles')]);assert.equal(one.length,0,'one case is an anecdote');
 const sameHost=recurringPatterns([f('a','h1','kettles'),f('b','h1','kettles')]);assert.equal(sameHost.length,0,'one host and one category is not a general pattern');
 const p=recurringPatterns([f('a','h1','kettles'),f('b','h2','kettles'),base('s',{features:['document_names_several_products']})]);
 assert.equal(p.length,1);assert.deepEqual([p[0].cases,p[0].counterexamples,p[0].status],[['a','b'],['s'],'candidate_lesson_hypothesis']);
});

test('the public view carries no values, names or source text; the committed pilot index does not either',()=>{
 const pub=JSON.stringify(publicCase(base('c1')));
 assert.ok(!pub.includes('Zentra')&&!pub.includes('"item"')&&!pub.includes('"value"'),pub);
 const idx=JSON.parse(readFileSync(new URL('../../evaluation/experience/pilot-index.json',import.meta.url),'utf8'));
 assert.ok(idx.cases.length>=12&&idx.cases.length<=18);
 const text=JSON.stringify(idx);
 for(const k of ['"item"','"goldSubject"','"subject"','"value"','"acceptedSubjects"','"text"'])assert.ok(!text.includes(k),'public index must not contain '+k);
 assert.ok(new Set(idx.cases.map((c:{category:string})=>c.category)).size>=3,'at least three categories');
 assert.ok(idx.cases.some((c:{family:string})=>c.family.startsWith('S_'))&&idx.cases.some((c:{family:string})=>c.family.startsWith('F')),'failures and successes');
});

test('Step 1B: attribution classes keep wrong, unresolved, variant and missing apart; a changed knowledge state is incomparable',()=>{
 const c=base('a1',{reference:{expected:'found_with_accepted_subject',acceptedSubjects:['Zentra K1','Zentra K1-80'],basis:'independent_gold_plus_developer_audit',independence:'x'}});
 assert.equal(attributionClass(c,found('Zentra K1','correct')),'correct');
 assert.equal(attributionClass(c,found('Zentra K1-80','incorrect_match')),'accepted_variant');
 assert.equal(attributionClass(c,found('Korvo K2','incorrect_match')),'wrong_product');
 assert.equal(attributionClass(c,found(null,'unresolved')),'unresolved_preserved');
 assert.equal(attributionClass(c,{status:'absent'}),'missing');
 // An unresolved subject is safer than a wrong one but does not meet a found-with-subject reference.
 const ok=base('a2');const v=replayVerdict(ok,found(null,'unresolved'),null);assert.deepEqual([v.transition,v.currentClass],['lost_success','unresolved_preserved']);
 const i=replayVerdict(ok,{status:'absent'},null,null,{comparable:false,why:'plan digest differs'});
 assert.deepEqual([i.transition,i.historicalClass,i.currentClass],['incomparable_state','correct','missing']);assert.match(i.reason!,/plan digest/);
 const s=summariseReplay([i,v]);assert.deepEqual([s.incomparable_state,s.lost_success,s.regression],[1,1,true]);
 assert.equal(summariseReplay([i]).regression,false,'an incomparable case is never counted as a regression');
});

test('Step 1B: the committed extension index and replays carry no values, names or source text',()=>{
 const rd=(f:string)=>readFileSync(new URL('../../evaluation/experience/'+f,import.meta.url),'utf8');
 const idx=JSON.parse(rd('step1b-index.json'));assert.equal(idx.cases.length,6);
 assert.ok(idx.cases.every((c:{id:string})=>/^EX-(19|2[0-4])$/.test(c.id)));
 for(const f of ['step1b-index.json','replay-s1a-tuned-fc7a040.json','replay-s1b-tuned-fc7a040.json','replay-s1b-ambiguity-cf.json','replay-s1a-changed-knowledge-demo.json']){const t=rd(f);
  for(const k of ['"item"','"goldSubject"','"subject"','"value"','"acceptedSubjects"','"text"'])assert.ok(!t.includes(k),f+' must not contain '+k);}
 const cf=JSON.parse(rd('replay-s1b-ambiguity-cf.json'));assert.equal(cf.mode,'counterfactual');assert.equal(cf.policy,'ambiguity_preserving');
 const demo=JSON.parse(rd('replay-s1a-changed-knowledge-demo.json'));assert.ok(demo.summary.incomparable_state>0&&demo.summary.regression===false);
});
