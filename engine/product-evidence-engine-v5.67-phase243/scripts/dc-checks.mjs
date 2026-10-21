#!/usr/bin/env node
/** Design Charter (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-design-charter-authorisation-2026-10-21.md, §6): minimal executable inference checks on SYNTHETIC data, in
 * isolation, on the existing KR engine, to verify design claims about expressivity. Not a component of any engine; no
 * store, no legacy module other than the rule evaluator is used. Writes evaluation/dc/checks.json.
 * Usage: node scripts/dc-checks.mjs */
import {writeFileSync} from 'node:fs';
const KR=await import('../dist/src/knowledge_rules.js');
const V=(name,args,role)=>({name,args,role,meaning:name});
const run=(id,vocab,rules,input)=>{const rs={schema:'pee.knowledge-rules.v1',version:'dc-check',statement:id,vocabulary:vocab,
 programs:[{id:'p',statement:id,rules:rules.map((r,i)=>({id:'R'+i,rule:r,statement:r,source:'dc'}))}]};
 try{const p=KR.compileRuleSet(rs).get('p');const m=KR.evaluate(p,input);return {ok:true,facts:Object.fromEntries(vocab.filter(v=>v.role==='derived').map(v=>[v.name,m.all(v.name).map(f=>f.args.join('|'))]))};}
 catch(e){return {ok:false,error:String(e.message)};}};
const out=[];
// C1 vacuity guard (case 2): realised only with existential import on documented requirements
{const vocab=[V('strategy',['S'],'input'),V('artefact',['A'],'input'),V('req',['S','C'],'input'),V('has',['A','C'],'input'),
 V('documented',['S'],'derived'),V('fails',['A','S'],'derived'),V('realisesNaive',['A','S'],'derived'),V('realises',['A','S'],'derived')];
 const r=run('C1',vocab,['documented(S) :- req(S,_).','fails(A,S) :- req(S,C), artefact(A), not has(A,C).',
  'realisesNaive(A,S) :- strategy(S), artefact(A), not fails(A,S).','realises(A,S) :- documented(S), artefact(A), not fails(A,S).'],
  {strategy:[['buy_new'],['dehumidify']],artefact:[['w5'],['purifier'],['dehumidifier']],req:[['dehumidify','remove_vapour'],['dehumidify','move_air']],
   has:[['purifier','move_air'],['dehumidifier','move_air'],['dehumidifier','remove_vapour']]});
 out.push({id:'C1',claim:'no vacuous satisfaction needs existential import (documented guard); stratified Datalog suffices',result:r,
  pass:r.ok&&r.facts.realisesNaive.includes('w5|buy_new')&&!r.facts.realises.some(x=>x.endsWith('|buy_new'))&&r.facts.realises.join()==='dehumidifier|dehumidify'});}
// C2 conflict between two incomparable rebutting arguments (case 5): grounded semantics needs negation through recursion
{const vocab=[V('arg',['X'],'input'),V('attacks',['X','Y'],'input'),V('defeated',['X'],'derived'),V('accepted',['X'],'derived')];
 const r=run('C2',vocab,['defeated(X) :- attacks(Y,X), accepted(Y).','accepted(X) :- arg(X), not defeated(X).'],{arg:[['a1'],['a2']],attacks:[['a1','a2'],['a2','a1']]});
 out.push({id:'C2',claim:'grounded/WFS acceptance (undecided on mutual attack) is NOT expressible in the existing stratified engine: it rejects recursion through negation',result:r,pass:!r.ok&&/stratif/i.test(r.error)});}
// C3 reified meta-rule (case 23): undercut over a SORT of relation types, in a higher stratum
{const vocab=[V('associated',['X','Y'],'input'),V('relsort',['R','S'],'input'),V('identified',['X','Y'],'input'),
 V('candidate',['R','X','Y','K'],'derived'),V('undercut',['R','X','Y'],'derived'),V('concluded',['R','X','Y'],'derived'),V('reported',['X','Y','S'],'derived')];
 const r=run('C3',vocab,['candidate(causes,X,Y,assoc_to_cause) :- associated(X,Y).',
  'undercut(R,X,Y) :- candidate(R,X,Y,assoc_to_cause), relsort(R,causal), not identified(X,Y).',
  'concluded(R,X,Y) :- candidate(R,X,Y,_), not undercut(R,X,Y).','reported(X,Y,associated_causation_not_established) :- undercut(_,X,Y).'],
  {associated:[['low_rh','sore_throat'],['dose','effect']],relsort:[['causes','causal']],identified:[['dose','effect']]});
 out.push({id:'C3',claim:'meta-principle "association does not establish causation" as a typed meta-rule over reified relation types (first-order semantics, stratified) works on the existing engine; it undercuts without asserting not-cause',result:r,
  pass:r.ok&&!r.facts.concluded.includes('causes|low_rh|sore_throat')&&r.facts.concluded.includes('causes|dose|effect')&&r.facts.reported.length===1});}
// C4 quantifier scope (case 12): two requirements at the same operating point
{const vocab=[V('meas',['A','P','S','V'],'input'),V('okSame',['A'],'derived'),V('okNaive',['A'],'derived'),V('noiseOk',['A','S'],'derived'),V('cadrOk',['A','S'],'derived')];
 const r=run('C4',vocab,['noiseOk(A,S) :- meas(A,noise,S,V), V < 31.','cadrOk(A,S) :- meas(A,cadr,S,V), V > 199.',
  'okSame(A) :- noiseOk(A,S), cadrOk(A,S).','okNaive(A) :- noiseOk(A,S1), cadrOk(A,S2).'],
  {meas:[['p5','noise','low',24],['p5','cadr','low',40],['p5','noise','high',45],['p5','cadr','high',220],['p6','noise','night',28],['p6','cadr','night',210]]});
 out.push({id:'C4',claim:'requirements bound to one operating point need a shared setting variable (quantifier scope); the naive reading accepts the wrong product',result:r,
  pass:r.ok&&r.facts.okSame.join()==='p6'&&r.facts.okNaive.includes('p5')});}
writeFileSync(new URL('../evaluation/dc/checks.json',import.meta.url),JSON.stringify({schema:'pee.dc.checks.v1',date:'2026-10-21',data:'synthetic',engine:'existing KR evaluator (stratified Datalog), used in isolation',checks:out},null,1)+'\n');
for(const c of out)console.log(c.id,c.pass?'PASS':'FAIL',c.result.ok?'':c.result.error);
