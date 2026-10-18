import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {readDocumentEvidence} from '../src/document_evidence.js';
import {readProductFacts,functionNeeds,loadProductFunctions,modeId} from '../src/product_facts.js';
import {compileRuleSet,type RuleSet} from '../src/knowledge_rules.js';

// FC (2026-10-18): functions, components, modes, conditions, results and how well a function works. Synthetic pages only.
const qk=loadQuantityKnowledge();
const page=(body:string)=>`<html><head></head><body><main>${body}</main></body></html>`;
const facts=(body:string)=>readProductFacts(qk,readDocumentEvidence(page(body),qk,{sourceType:'independent_review'}));
const presence=(pf:ReturnType<typeof facts>,p:string,f:string)=>pf.derived.presence.find(x=>x[0]===p&&x[1]===f)?.[2]??null;

test('FC presence is categorical and comes with who states it; a negation (curly apostrophe too) makes it not available', ()=>{
 const pf=facts('<h1>Acme AP5 review</h1><h2>Acme AP5</h2><p>The Acme AP5 has an auto mode and a child lock. It doesn’t have Wi-Fi or an app.</p>');
 assert.equal(presence(pf,'Acme AP5','auto_mode'),'available');assert.equal(presence(pf,'Acme AP5','child_lock'),'available');
 assert.equal(presence(pf,'Acme AP5','app_control'),'not_available');
 assert.ok(pf.functions.every(f=>f.statedBy==='reviewer_mention'));
});
test('FC a function not mentioned is not verified, never absent: missing evidence is not absence', ()=>{
 const pf=facts('<h2>Acme AP5</h2><p>The Acme AP5 has an auto mode.</p>');
 assert.equal(presence(pf,'Acme AP5','timer'),null);assert.ok(pf.model.has('presence_not_verified',['Acme AP5','timer']));
});
test('FC presence is never evidence of effectiveness; a statement of how the function works is, with its own evidence type', ()=>{
 const a=facts('<h2>Acme AP5</h2><p>The Acme AP5 has an auto mode.</p>');
 assert.deepEqual(a.derived.effectivenessUnassessed,[['Acme AP5','auto_mode']]);assert.equal(a.derived.effectivenessEvidence.length,0);
 const b=facts('<h2>Acme AP5</h2><p>The Acme AP5 has an auto mode. In testing, the auto mode was slow to react when I burned toast.</p>');
 const p=b.functionPerformance.find(x=>x.function==='auto_mode')!;assert.ok(p.what.includes('response_time'));assert.equal(p.evidence,'observed_in_test');
 assert.equal(b.derived.effectivenessUnassessed.length,0);
});
test('FC rules: no rule derives effectiveness or performance from presence alone (checked over the rule set)', ()=>{
 const rs=JSON.parse(readFileSync(new URL('../../resources/quantity-knowledge/product-rules.v1.json',import.meta.url),'utf8')) as RuleSet;
 const evidenceOf=['performs','result','effectiveness_evidence','has_effectiveness_evidence'];
 for(const r of rs.programs[0].rules){const head=r.rule.split(':-')[0];if(!/effectiveness_evidence|performance/.test(head))continue;
  const body=r.rule.split(':-')[1]??'';assert.ok(evidenceOf.some(p=>new RegExp('(?<!not )\\b'+p+'\\(').test(body)),`rule ${r.id} derives effectiveness without a statement or result about it`);}
 // the one rule that uses presence with effectiveness concludes its ABSENCE (unassessed), never its presence
 const uses=rs.programs[0].rules.filter(r=>/function_available/.test(r.rule.split(':-')[1]??'')&&/effectiveness/.test(r.rule.split(':-')[0]));
 assert.deepEqual(uses.map(r=>r.id),['E4']);assert.match(uses[0].rule,/not has_effectiveness_evidence/);
 assert.ok(compileRuleSet(rs).get('product'));
});
test('FC speed 1, sleep and lowest are three operating states; results under them are not the same state', ()=>{
 const pf=facts('<h2>Acme AP5</h2><p>The Acme AP5 measured 22 dBA in sleep mode. At speed 1 it measured 31 dBA. At its lowest speed it measured 30 dBA.</p>');
 const ms=new Set(pf.modes.map(m=>m.mode));for(const m of ['sleep','speed 1','lowest'])assert.ok(ms.has(m),'mode '+m+' among '+[...ms].join(', '));
 assert.equal(pf.equivalences.length,0);assert.equal(pf.derived.sameState.length,0);assert.ok(pf.derived.differentState.length>=6);
 assert.equal(modeId(loadProductFunctions().pack,'Speed 3').position?.rank,3);assert.equal(pf.modes.find(m=>m.mode==='lowest')!.position?.extreme,'lowest');
 assert.equal(pf.modes.find(m=>m.mode==='sleep')!.scale,'nominal');
});
test('FC a stated equivalence makes two names one state, for that product only', ()=>{
 const pf=facts('<h2>Acme AP5</h2><p>The Acme AP5 sleep mode (speed 1) measured 22 dBA, and at speed 1 it measured 22 dBA in a second run.</p><h2>Brandx Q7</h2><p>The Brandx Q7 measured 25 dBA in sleep mode and 33 dBA at speed 1.</p>');
 assert.deepEqual(pf.equivalences.map(e=>[e.product,e.a,e.b]),[['Acme AP5','sleep','speed 1']]);
 assert.ok(pf.model.has('same_state',['Acme AP5','sleep','speed 1']));assert.ok(!pf.model.has('same_state',['Brandx Q7','sleep','speed 1']));
});
test('FC a component that can enable a function is a research lead, never the function; a stated link is recorded', ()=>{
 const pf=facts('<h2>Acme AP5</h2><p>The Acme AP5 has a PM2.5 sensor.</p>');
 assert.deepEqual(pf.derived.mayHave.filter(x=>x[2]==='auto_mode'),[['Acme AP5','particle_sensor','auto_mode']]);assert.equal(presence(pf,'Acme AP5','auto_mode'),null);
 const b=facts('<h2>Acme AP5</h2><p>The Acme AP5 has a laser sensor that informs its auto mode.</p>');
 assert.ok(b.components.find(c=>c.component==='particle_sensor')!.enables.some(e=>e.function==='auto_mode'&&e.basis==='stated'));
 assert.ok(b.model.has('enabled_by',['Acme AP5','auto_mode','particle_sensor']));
});
test('FC the tester\'s instrument is part of the procedure, not a component of the product', ()=>{
 const pf=facts('<h2>Acme AP5</h2><p>Our PurpleAir sensor showed that the Acme AP5 cleared the room in 20 minutes at top speed.</p>');
 assert.equal(pf.components.length,0);const r=pf.results.find(x=>x.surface==='20 minutes')!;assert.deepEqual(r.modes,['top']);
});
test('FC a sibling model named in the statement owns it: not the page subject', ()=>{
 const pf=facts('<h1>AirDoctor 3000 review</h1><h2>AirDoctor 3000</h2><p>There is no app support. The AirDoctor 3000i adds WiFi and app support for $200 more.</p>');
 assert.equal(presence(pf,'AirDoctor 3000','app_control'),'not_available');assert.ok(pf.functions.some(f=>f.product===null&&f.presence==='available'));
});
test('FC key-value specifications and yes/no tables state presence; programme lists are programme modes', ()=>{
 const pf=facts('<h2>Acme DW9</h2><dl><dt>Delay start</dt><dd>Yes</dd><dt>Child lock</dt><dd>No</dd></dl><p>The Acme DW9 offers six programmes (Eco, Quick, Intensive, Glass, Auto and Rinse).</p>'+
  '<table><tr><th></th><th>Acme DW9</th></tr><tr><td>Auto-dose</td><td>Yes</td></tr></table>');
 assert.equal(presence(pf,'Acme DW9','delay_start'),'available');assert.equal(presence(pf,'Acme DW9','child_lock'),'not_available');
 assert.ok(pf.functions.every(f=>f.statedBy==='spec_or_maker'));
 assert.deepEqual(pf.modes.filter(m=>m.scale==='programme').map(m=>m.mode).sort(),['auto','eco','glass','intensive','quick','rinse']);
});
test('FC a qualitative item that only names a function, with no statement of how it works, is availability, not an opinion', ()=>{
 const doc=readDocumentEvidence(page('<h2>Acme AP5</h2><p>I found that the Acme AP5 has an app.</p>'),qk,{sourceType:'independent_review'});
 const pf=readProductFacts(qk,doc);const qe=doc.qualitativeEvidence;// 'app' is a word of two aspects (connectivity, ease of use)
 assert.ok(qe.length>=1,'the qualitative reading itself still sees it');assert.deepEqual(pf.reclassifiedQualitative.map(x=>x.function),qe.map(()=>'app_control'));
});
test('FC needs: a function need is met by presence, unverified without a statement, and its effectiveness stays a separate question', ()=>{
 const pf=facts('<h2>Acme AP5</h2><p>The Acme AP5 has an auto mode.</p><h2>Brandx Q7</h2><p>The Brandx Q7 measured 30 dBA at speed 1.</p>');
 const n=functionNeeds(pf,[{need:'n1',function:'auto_mode'}]);
 assert.deepEqual(n.met,[['n1','Acme AP5']]);assert.deepEqual(n.unverified,[['n1','Brandx Q7']]);assert.deepEqual(n.effectivenessUnassessed,[['n1','Acme AP5']]);
});
test('FC the vocabulary is validated: a component enabling an unknown function is refused', ()=>{
 const p=JSON.parse(JSON.stringify(loadProductFunctions().pack));p.components[0].enables=['no_such_function'];
 assert.throws(()=>loadProductFunctions(p),/enables unknown/);
});
