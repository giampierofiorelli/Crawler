// S103 — rule admission and static rule analysis (owner authorisation 2026-10-20, verbatim in
// .claude/skills/pee-guided-learning/references/owner-rule-admission-authorisation-2026-10-20.md): "Implement a general
// admission process … An arbitrary technical heuristic must not become a protected invariant." and "Extend the existing
// knowledge_rules engine to detect semantic overlap, conflicting conclusions, redundant or subsumed rules and meaningful
// gaps … State exactly which rule classes the analyser covers; never claim completeness outside that scope."
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import fc from 'fast-check';
import {compileRuleSet,evaluate,decide,analyseProgram,ANALYSIS_COVERAGE,type RuleSet,type RuleDef,type RuleAdmission} from '../src/knowledge_rules.js';
import {observationSemanticsRules} from '../src/observation_semantics.js';
import {requestSemanticsRules} from '../src/phase253_request_constraints.js';

const ROOT=new URL('../../',import.meta.url).pathname;
const REPO=new URL('../../../../',import.meta.url).pathname;
const OS=()=>JSON.parse(readFileSync(ROOT+'resources/scientific-reading/observation-semantics.v1.json','utf8')) as RuleSet&{cueKinds:string[]};
const RQ=()=>JSON.parse(readFileSync(ROOT+'resources/request-semantics/request-semantics.v1.json','utf8')) as RuleSet;
/** Fixed seeds: a failure is reported with its seed and path and replays exactly (evaluation/s103/property-seeds.json). */
const SEEDS=JSON.parse(readFileSync(ROOT+'evaluation/s103/property-seeds.json','utf8')) as {seeds:Record<string,number>};
const seed=(name:string)=>{const s=SEEDS.seeds[name];assert.ok(Number.isInteger(s),'seed recorded for '+name);return s;};

const ADM=(over:Partial<RuleAdmission>={}):RuleAdmission=>({meaning:'a toy meaning',scope:'toy',prerequisites:['toy'],exceptions:['toy'],
 counterexamples:[{case:'toy',expected:'toy',test:'toy'}],provenance:{origin:'convention',ref:'toy'},consumers:['toy'],
 classification:{class:'policy',justification:'toy'},evidence:['toy'],admitted:'2026-10-20',...over});
const toy=(rules:RuleDef[],extra:Record<string,unknown>={},vocab:RuleSet['vocabulary']=[]):RuleSet=>({schema:'t',version:'t1',statement:'toy',
 vocabulary:[{name:'e',args:['o','k'],meaning:'evidence',role:'input'},{name:'g',args:['o'],meaning:'a blocking fact',role:'input'},
  {name:'n',args:['o','v'],meaning:'a number',role:'input'},{name:'claim',args:['o','f','v','t','s'],meaning:'claim',role:'derived'},...vocab],
 programs:[{id:'toy',statement:'toy',rules,decision:{predicate:'claim',scopes:['narrow','wide'],fields:{colour:['red','blue']},contested:[]},...extra}]});
const R=(id:string,rule:string,more:Partial<RuleDef>={}):RuleDef=>({id,rule,statement:'toy rule',source:'test',...more});

// ---------------------------------------------------------------------------------------------------------------------
// Admission
test('admission: a program that requires it refuses a rule without a record, and every record field is checked', ()=>{
 const base=[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',{admission:ADM()})];
 assert.doesNotThrow(()=>compileRuleSet(toy(base,{admission:{required:true}})));
 assert.throws(()=>compileRuleSet(toy([...base,R('B','claim(O,colour,red,explicit,narrow) :- e(O,b).')],{admission:{required:true}})),/requires an admission record/);
 for(const [over,re] of [[{meaning:''},/admission.meaning/],[{counterexamples:[]},/counterexample/],[{evidence:[]},/without test evidence/],[{consumers:[]},/no consumer/],
  [{classification:{class:'logical',justification:'x'},prerequisites:[]},/prerequisites/],[{classification:{class:'convention',justification:'x'},exceptions:[]},/defeasible/],
  [{provenance:{origin:'guess',ref:'x'}},/provenance/],[{admitted:'today'},/must be a date/]] as [Partial<RuleAdmission>,RegExp][])
  assert.throws(()=>compileRuleSet(toy([R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',{admission:ADM(over)})])),re,JSON.stringify(over));});

test('admission: an invariant needs a record with its kind and a justification as a general property', ()=>{
 const inv=(a?:RuleAdmission)=>toy([R('I','claim(O,colour,red,constraint,narrow) :- e(O,a).',{invariant:true,...(a?{admission:a}:{})})]);
 assert.throws(()=>compileRuleSet(inv()),/marked invariant without an admission record/);
 assert.throws(()=>compileRuleSet(inv(ADM({classification:{class:'invariant',justification:'safety'}}))),/names its kind/);
 assert.throws(()=>compileRuleSet(inv(ADM({classification:{class:'invariant',invariantKind:'semantic',justification:'needed'}}))),/general property, not a label/);
 assert.throws(()=>compileRuleSet(inv(ADM({classification:{class:'policy',justification:'x'}}))),/disagrees with invariant=true/);
 const just='A red signal of kind a always means red for every object, every source and every reading, because ...';
 assert.doesNotThrow(()=>compileRuleSet(inv(ADM({classification:{class:'invariant',invariantKind:'semantic',justification:just}}))));});

test('admission: leaving the invariant class needs an owner decision; RQ08 records the owner decision that reclassified it', ()=>{
 const h=(ownerDecision?:string)=>toy([R('X','claim(O,colour,red,explicit,narrow) :- e(O,a).',{admission:ADM({history:[{date:'2026-10-20',change:'reclassified from invariant to policy',reason:'not general',...(ownerDecision?{ownerDecision}:{})}]})})]);
 assert.throws(()=>compileRuleSet(h()),/needs an owner decision/);assert.doesNotThrow(()=>compileRuleSet(h('owner file')));
 const rq08=RQ().programs[0].rules.find(r=>r.id==='RQ08')!;
 assert.equal(rq08.invariant,false);assert.equal(rq08.lifecycle!.state,'superseded');assert.equal(rq08.lifecycle!.supersededBy,'request_combination/RC05');
 const od=rq08.admission!.history![0].ownerDecision!;assert.ok(existsSync(REPO+od),od);});

test('admission: experimental rules run only in shadow and never decide; rejected rules never run', ()=>{
 const rs=toy([R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',{admission:ADM()}),
  R('X','claim(O,colour,blue,explicit,narrow) :- e(O,a).',{admission:ADM(),lifecycle:{state:'experimental',since:'2026-10-20',reason:'under evaluation'}}),
  R('Z','claim(O,colour,blue,explicit,wide) :- e(O,z).',{lifecycle:{state:'rejected',since:'2026-10-20',reason:'wrong',evidence:['toy']}})]);
 const p=compileRuleSet(rs).get('toy')!;
 assert.deepEqual(p.rules.map(r=>r.id),['A']);assert.deepEqual(p.experimental.map(r=>r.id),['X']);
 const op=decide(evaluate(p,{e:[['o','a'],['o','z']]}))[0];assert.equal(op.value,'red');assert.equal(op.shadow,undefined);
 const sh=decide(evaluate(p,{e:[['o','a'],['o','z']]},{shadow:true}))[0];assert.equal(sh.value,'red','an experimental claim never decides, even when it would conflict');
 assert.deepEqual(sh.shadow!.map(s=>s.rule),['X']);
 assert.throws(()=>compileRuleSet(toy([R('X','claim(O,colour,blue,explicit,narrow) :- e(O,a).',{lifecycle:{state:'experimental',since:'2026-10-20',reason:'x'}})])),/experimental rule needs an admission record/);
 assert.throws(()=>compileRuleSet(toy([R('Z','claim(O,colour,blue,explicit,wide) :- e(O,z).',{lifecycle:{state:'rejected',since:'2026-10-20',reason:'x'}})])),/without regression evidence/);});

test('admission: the observation program lists its 86 rules admitted before S103, and that list may only shrink', ()=>{
 const os=OS();const p=os.programs[0];assert.equal(p.admission!.required,true);
 const legacy=p.admission!.legacyUnreviewed!;assert.ok(legacy.length<=86,'the legacy list grew');
 assert.ok(p.admission!.legacyReason!.length>40);
 for(const r of p.rules)if(!legacy.includes(r.id)&&['active','under_review',undefined].includes(r.lifecycle?.state))assert.ok(r.admission,`${r.id} runs without admission`);
 for(const prog of RQ().programs){assert.equal(prog.admission?.required,true);assert.ok(!(prog.admission?.legacyUnreviewed?.length),'request rules are all reviewed');}});

test('admission: every test an admission record cites exists, by file and test name', ()=>{
 const cited=[...OS().programs,...RQ().programs].flatMap(p=>p.rules.flatMap(r=>r.admission?[...r.admission.evidence,...r.admission.counterexamples.map(c=>c.test)]:[]));
 assert.ok(cited.length>30);
 for(const c of cited){const [file,name]=c.split('#');const path=existsSync(ROOT+file)?ROOT+file:REPO+file;assert.ok(existsSync(path),c);
  if(name){const src=readFileSync(path,'utf8');assert.ok(src.includes(`test('${name.replace(/'/g,"\\'")}'`)||src.includes(`test('${name}'`),`test not found: ${c}`);}}});

test('fast-check is a test-only dependency (owner: "Deve rimanere nei test, con versione bloccata")', ()=>{
 const pkg=JSON.parse(readFileSync(ROOT+'package.json','utf8'));
 assert.equal(pkg.devDependencies['fast-check'],'4.10.2','exact version');assert.equal(pkg.dependencies?.['fast-check'],undefined);
 const lock=JSON.parse(readFileSync(ROOT+'package-lock.json','utf8'));assert.equal(lock.packages['node_modules/fast-check'].version,'4.10.2');assert.equal(lock.packages['node_modules/fast-check'].dev,true);
 const walk=(d:string):string[]=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);
 for(const f of walk(ROOT+'src'))assert.ok(!/from\s+['"]fast-check['"]/.test(readFileSync(f,'utf8')),f+' imports fast-check');});

// ---------------------------------------------------------------------------------------------------------------------
// Static analysis
test('analysis: a conflict is proved with a witness that the evaluator confirms; contests must name the rules', ()=>{
 const rules=[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',{admission:ADM()}),R('B','claim(O,colour,blue,explicit,narrow) :- e(O,b).',{admission:ADM()})];
 assert.throws(()=>compileRuleSet(toy(rules)),/can contradict at tier explicit, scope narrow \(witness: e\(⟨w1⟩, a\); e\(⟨w1⟩, b\)\)/);
 const named={id:'C1',field:'colour',tier:'explicit' as const,between:[['A'],['B']] as [string[],string[]],why:'a and b can be read together and disagree'};
 const rs=toy(rules);rs.programs[0].decision!.contested=[named];const p=compileRuleSet(rs).get('toy')!;
 const a=analyseProgram(p);assert.equal(a.conflicts.length,1);assert.equal(a.conflicts[0].verdict,'overlap');assert.equal(a.conflicts[0].contest,'C1');
 assert.match(a.conflicts[0].witness!,/e\(⟨w1⟩, a\); e\(⟨w1⟩, b\)/);
 // the witness, evaluated, makes the conflict real
 assert.deepEqual(decide(evaluate(p,{e:[['x','a'],['x','b']]}))[0].conflict!.rules,['A','B']);
 const blanket=toy(rules);(blanket.programs[0].decision!.contested as unknown[])=[{field:'colour',tier:'explicit',scopes:['narrow'],values:['red','blue'],why:'old blanket contest form'}];
 assert.throws(()=>compileRuleSet(blanket),/blanket contests by value and scope are no longer admitted/);});

test('analysis: a contest naming rules that can never fire together is refused (no vacuous declarations)', ()=>{
 const rules=[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a), not g(O).',{admission:ADM()}),R('B','claim(O,colour,blue,explicit,narrow) :- e(O,b), g(O).',{admission:ADM()})];
 const p=compileRuleSet(toy(rules)).get('toy')!;// disjoint: no contest needed
 const c=analyseProgram(p).conflicts[0];assert.equal(c.verdict,'disjoint');assert.match(c.why,/not g\(⟨w1⟩\)/);
 const rs=toy(rules);rs.programs[0].decision!.contested=[{id:'V',field:'colour',tier:'explicit',between:[['A'],['B']],why:'declared although impossible'}];
 assert.throws(()=>compileRuleSet(rs),/can never fire together/);});

test('analysis: declared keys (single-valued inputs) are domain semantics; without them an overlap is assumed', ()=>{
 const voc=[{name:'r',args:['o','reader','b'],meaning:'one bound per reader',role:'input' as const,key:[0,1]}];
 const rules=[R('A','claim(O,colour,red,explicit,narrow) :- r(O,x,lo).',{admission:ADM()}),R('B','claim(O,colour,blue,explicit,narrow) :- r(O,x,hi).',{admission:ADM()})];
 const c=analyseProgram(compileRuleSet(toy(rules,{},voc)).get('toy')!).conflicts[0];assert.equal(c.verdict,'disjoint');assert.match(c.why,/one b per o and reader/);
 const open=[{...voc[0],key:undefined}];assert.throws(()=>compileRuleSet(toy(rules,{},open)),/can contradict/);});

test('analysis: numeric comparisons are solved exactly; an impossible order is disjoint', ()=>{
 const rules=[R('A','claim(O,colour,red,explicit,narrow) :- n(O,V), V > 10.',{admission:ADM()}),R('B','claim(O,colour,blue,explicit,narrow) :- n(O,W), W < 5.',{admission:ADM()})];
 // two different n facts can coexist, so the rules overlap (the declared contest is accepted)
 const rs=toy(rules);rs.programs[0].decision!.contested=[{id:'N',field:'colour',tier:'explicit',between:[['A'],['B']],why:'two numbers of one object can be on both sides'}];
 assert.equal(analyseProgram(compileRuleSet(rs).get('toy')!).conflicts[0].verdict,'overlap');
 const voc=[{name:'n1',args:['o','v'],meaning:'one number',role:'input' as const,key:[0]}];
 const one=[R('A','claim(O,colour,red,explicit,narrow) :- n1(O,V), V > 10.',{admission:ADM()}),R('B','claim(O,colour,blue,explicit,narrow) :- n1(O,W), W < 5.',{admission:ADM()})];
 const b=analyseProgram(compileRuleSet(toy(one,{},voc)).get('toy')!).conflicts[0];assert.equal(b.verdict,'disjoint');assert.match(b.why,/no value|cycle|false/);});

test('analysis: outside the complete class the analyser says "incomplete", never "no conflict"', ()=>{
 const voc=[{name:'d',args:['o'],meaning:'derived with negation',role:'derived' as const},{name:'h',args:['o'],meaning:'input',role:'input' as const}];
 const rules=[R('D','d(O) :- e(O,x), not h(O).',{admission:ADM()}),
  R('A','claim(O,colour,red,explicit,narrow) :- e(O,a), not d(O).',{admission:ADM()}),R('B','claim(O,colour,blue,explicit,narrow) :- e(O,b), e(O,x).',{admission:ADM()})];
 assert.throws(()=>compileRuleSet(toy(rules,{},voc)),/analysis incomplete/);
 const rs=toy(rules,{},voc);rs.programs[0].decision!.contested=[{id:'U',field:'colour',tier:'explicit',between:[['A'],['B']],why:'kept although undecided by the analysis'}];
 assert.throws(()=>compileRuleSet(rs),/say why the contest is kept \(unverified\)/);
 rs.programs[0].decision!.contested[0].unverified='A can fire with x present when h is also present';
 const p=compileRuleSet(rs).get('toy')!;const a=analyseProgram(p);
 assert.equal(a.conflicts[0].verdict,'incomplete');assert.equal(a.rules.find(r=>r.rule==='A')!.complete,false);
 assert.match(a.rules.find(r=>r.rule==='A')!.limits[0],/negates d, which is defined with negation/);
 // and it is right to be cautious: with h present both fire
 assert.ok(decide(evaluate(p,{e:[['o','a'],['o','b'],['o','x']],h:[['o']]}))[0].conflict);
 assert.match(ANALYSIS_COVERAGE,/COMPLETE class/);assert.match(ANALYSIS_COVERAGE,/PARTIAL class/);});

test('analysis: redundant rules, rules that never fire, and gaps over declared input values', ()=>{
 const rules=[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',{admission:ADM()}),R('A2','claim(O,colour,red,explicit,narrow) :- e(O,a), e(O,c).',{admission:ADM()}),
  R('N','claim(O,colour,red,explicit,wide) :- e(O,a), O != O.',{admission:ADM()})];
 const p=compileRuleSet(toy(rules,{domains:[{predicate:'e',arg:1,values:['a','c','d','q'],abstains:{q:'deliberately not read'}}]})).get('toy')!;
 const a=analyseProgram(p);
 assert.deepEqual(a.redundant.map(r=>[r.rule,r.by,r.exact]),[['A2',['A'],true]]);
 assert.deepEqual(a.neverFires.map(r=>r.rule),['N']);
 const g=Object.fromEntries(a.gaps.map(x=>[x.value,x.state]));
 assert.deepEqual(g,{a:'interpreted',c:'interpreted',d:'uninterpreted',q:'abstains'});});

test('analysis: declared exclusions are proved when the program loads', ()=>{
 const voc=[{name:'p1',args:['o'],meaning:'p1',role:'derived' as const},{name:'p2',args:['o'],meaning:'p2',role:'derived' as const}];
 const ok=toy([R('P','p1(O) :- e(O,a).',{admission:ADM()}),R('Q','p2(O) :- e(O,b), not p1(O).',{admission:ADM()})],{exclusive:[{preds:['p1','p2'],why:'p2 only where p1 does not hold'}]},voc);
 assert.doesNotThrow(()=>compileRuleSet(ok));
 const bad=toy([R('P','p1(O) :- e(O,a).',{admission:ADM()}),R('Q','p2(O) :- e(O,b).',{admission:ADM()})],{exclusive:[{preds:['p1','p2'],why:'claimed to be exclusive'}]},voc);
 assert.throws(()=>compileRuleSet(bad),/can both hold for the same arguments.*witness: e\(⟨w1⟩, a\); e\(⟨w1⟩, b\)/);});

// ---------------------------------------------------------------------------------------------------------------------
// The real programs
test('os.4: every conflict is a named, verified overlap; no contest is vacuous; no gap but the declared abstention', ()=>{
 const {program}=observationSemanticsRules();const a=analyseProgram(program);
 assert.equal(a.conflicts.length,129);assert.ok(a.conflicts.every(c=>c.verdict==='overlap'&&c.contest),'every conflicting pair is witnessed and named');
 assert.ok(a.rules.every(r=>r.complete),'os rules are all in the complete class');
 assert.deepEqual(a.redundant,[]);assert.deepEqual(a.neverFires,[]);
 assert.deepEqual(a.gaps.filter(g=>g.state!=='interpreted').map(g=>[g.value,g.state]),[['own_property_stated','abstains']]);
 assert.equal(program.decision!.contested.length,30);});

test('os.4: contests are governance only: decisions are identical with or without them (generated cue sets)', ()=>{
 const {program,kinds}=observationSemanticsRules();
 const rs=OS();rs.programs[0].decision!.contested=[];const bare=compileRuleSet(rs,{analysisOnly:true}).get('observation_semantics')!;
 const scopes=program.decision!.scopes;
 fc.assert(fc.property(fc.uniqueArray(fc.tuple(fc.constantFrom(...kinds),fc.constantFrom(...scopes)),{minLength:1,maxLength:6}),cues=>{
  const f={cue:cues.map(([k,s])=>['o',k,s])};
  assert.deepEqual(decide(evaluate(program,f)),decide(evaluate(bare,f)));}),{seed:seed('os-contests-governance-only'),numRuns:400});});

test('rq.2: the request programs are fully analysed: one bound reader (no contest left), four exclusions proved', ()=>{
 const {program,combination}=requestSemanticsRules();
 // RQ01/RQ02 (the local reader) are superseded: the shared reader's min and max cannot fire together (one bound per reader)
 const a=analyseProgram(program);assert.deepEqual(a.conflicts.map(c=>[c.a,c.b,c.verdict,c.contest]),[['RQ03','RQ04','disjoint',null]]);
 assert.equal(program.decision!.contested.length,0);
 const b=analyseProgram(combination);assert.equal(b.exclusive.length,5);assert.ok(b.exclusive.every(e=>e.verdict==='disjoint'),JSON.stringify(b.exclusive));
 assert.ok([...a.rules,...b.rules].every(r=>r.complete));
 assert.deepEqual(b.gaps.filter(g=>g.state!=='interpreted').map(g=>[g.value,g.state]),[['inclusive','abstains']]);});

test('analysis runs on every rule program of the repository and reports its partial class honestly', ()=>{
 for(const f of ['quantity-knowledge/link-rules.v9.json','quantity-knowledge/rules.v4.json','quantity-knowledge/product-rules.v1.json']){
  for(const [id,p] of compileRuleSet(JSON.parse(readFileSync(ROOT+'resources/'+f,'utf8')))){const a=analyseProgram(p);
   for(const r of a.rules)assert.equal(r.complete,r.limits.length===0,`${id} ${r.rule}`);
   assert.deepEqual(a.neverFires,[],id+': a rule that can never fire');}}});
