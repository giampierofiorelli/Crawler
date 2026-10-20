import test from 'node:test';import assert from 'node:assert/strict';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {loadPropertyDefinitions} from '../src/property_definitions.js';
import {documentModel1G,interpretDocumentTables1G} from '../src/table_interpreter1g.js';
import {activeInterpreterLessons1G} from '../src/table_interpreter1g_lessons.js';
import {evidenceLinksOf,roleFromLinks,situationTypeOf,interpretWithDefinitions,type RoleEvidence} from '../src/definition_interpreter.js';
import {fitLabelModel,predictLabel} from '../src/evidence_combination.js';
import {learnFromDocuments} from '../src/definition_learning.js';

// S92: document-level relations, the label model and the R3 learning switches. Every text is invented for this test.
const qk=loadQuantityKnowledge();const defs=loadPropertyDefinitions(qk);
const noEv:RoleEvidence={measured:[],declared:[],quoted:false,condition:false};

test('S92 co-occurrence: a method statement in the next sentence links a bare value as measured, with its pointer',()=>{
 const html='<html><body><h2>Noise</h2><p>The fan is quiet at 41 dB on the lowest setting. We measured every setting with our sound meter at one metre.</p></body></html>';
 const block='The fan is quiet at 41 dB on the lowest setting. We measured every setting with our sound meter at one metre.';
 const links=evidenceLinksOf({model:documentModel1G(html)},block,block.indexOf('41 dB'),'41 dB',41,'prose');
 assert.ok(links.some(l=>l.relation==='co_occurrence'&&l.role==='measured'&&/sentence 1/.test(l.pointer)),JSON.stringify(links));
 assert.equal(roleFromLinks(noEv,links).value,'measured_result');
});

test('S92 bridge: a declaration statement elsewhere in the section that names the same quantity links as declared; opposite roles at the same distance abstain',()=>{
 const html='<html><body><h2>Specs</h2><p>The manufacturer claims a noise level of 30 dB.</p><p>It runs at 38 dB on high.</p></body></html>';
 const block='It runs at 38 dB on high.';
 const links=evidenceLinksOf({model:documentModel1G(html)},block,block.indexOf('38 dB'),'38 dB',38,'prose');
 assert.ok(links.some(l=>l.relation==='bridge'&&l.scope==='same_section'&&l.role==='declared'),JSON.stringify(links));
 const tie=roleFromLinks(noEv,[{role:'measured',relation:'bridge',scope:'same_section',rank:3,pointer:'a'},{role:'declared',relation:'bridge',scope:'same_section',rank:3,pointer:'b'}]);
 assert.equal(tie.value,'unresolved');assert.match(String(tie.reason),/conflicting/);
 assert.equal(roleFromLinks(noEv,[]).reason,'no_positive_evidence');
});

test('S92 situation type from grammar: attributive measure phrases and episodic predicates',()=>{
 const at=(t:string,v:string)=>situationTypeOf(t,t.indexOf(v),t.indexOf(v)+v.length);
 assert.equal(at('It comes with a 3L dust bag that lasts weeks','3L'),'attributive');
 assert.equal(at('At full power it lasted for 13 minutes','13 minutes'),'episodic');
 assert.equal(at('It was rated at 45 dB','45 dB'),null,'a passive rating is neither');
 assert.equal(at('The battery is claimed to give 90 minutes','90 minutes'),null);
 const r=interpretWithDefinitions(defs,qk,{value:13,unit:'minutes',label:'At full power it lasted for 13 minutes',valueAt:28,surface:'13 minutes',structure:{container:'prose',label:null,section:null,sectionRole:null,tableContext:null,links:[]}},{roleModel:'links',situation:true});
 assert.equal(r.role.value,'measured_result');assert.match(String(r.role.reason),/situation_episodic|observation_verb|measuring_verb/);
});

test('S92 1G lessons GL11 and GL12 (provisional, only on request): calculation inputs keep the method; a twin table inherits links',()=>{
 const html=`<html><body><h2>Power and running cost</h2><p>We measured the power draw at each speed with our power meter.</p><p>We calculated the running cost per year from the power draw.</p>
 <table><tr><th>Speed</th><th>Power</th></tr><tr><td>Low</td><td>2.5 W</td></tr><tr><td>High</td><td>17.8 W</td></tr></table>
 <h2>Particles</h2><h3>Run 1</h3><p>We measured particle concentration with our particle counter.</p><table><tr><th>Minute</th><th>PM2.5</th></tr><tr><td>0</td><td>104.8 µg/m³</td></tr><tr><td>10</td><td>8.3 µg/m³</td></tr></table>
 <h3>Run 2</h3><table><tr><th>Minute</th><th>PM2.5</th></tr><tr><td>0</td><td>105.2 µg/m³</td></tr><tr><td>10</td><td>10.5 µg/m³</td></tr></table></body></html>`;
 const cls=(lessons:string[])=>interpretDocumentTables1G(html,{lessons:[...activeInterpreterLessons1G(),...lessons] as never}).tables.map(t=>t.observations.filter(o=>o.unit).map(o=>o.evidence.class+'@'+o.evidence.level));
 const base=cls([]),extra=cls(['GL11_calculation_inputs_keep_method','GL12_parallel_tables_inherit_links']);
 assert.ok(base[0].every(c=>c.startsWith('derived_or_estimated')),'default: inputs beside a calculation are derived '+JSON.stringify(base[0]));
 assert.ok(extra[0].every(c=>c.startsWith('publisher_measured')),'GL11: the measured power draw keeps the method '+JSON.stringify(extra[0]));
 assert.ok(base[2].every(c=>c.startsWith('unknown')),'default: the second run inherits nothing '+JSON.stringify(base[2]));
 assert.ok(extra[2].every(c=>c==='publisher_measured@linked_parallel_table'),'GL12: twin table inherits '+JSON.stringify(extra[2]));
});

test('S92 label model: recovers which signal is more reliable without gold; abstains on a weak margin; two signals are not identifiable',()=>{
 // truth alternates; signal a is right 90% of the time, b 75%, c 60% (deterministic pattern)
 const votes:number[][]=[];for(let i=0;i<200;i++){const y=i%2?1:-1;votes.push([i%10===0?-y:y,i%4===0?-y:y,i%5<2?-y:y]);}
 const m=fitLabelModel(['a','b','c'],votes);
 assert.ok(m.accuracy[0]>m.accuracy[1]&&m.accuracy[1]>m.accuracy[2],JSON.stringify(m.accuracy));
 assert.equal(predictLabel({...m,margin:100},[1,-1,1]).label,0,'below the margin it abstains');
 assert.equal(predictLabel(m,[0,0,0]).label,0,'no voter: abstains');
 const two=fitLabelModel(['a','b'],votes.map(v=>v.slice(0,2)));assert.ok(two.notes.length===2,'accuracies of two signals are not identifiable');
});

test('S92 learning switches: E3 consolidates proposals with typed relations; without the switch none are added',()=>{
 const doc=(i:number,pub:string,label:string,v:number,u:string,s:string)=>({docId:'d'+i,publisher:pub,category:'robot_floor_cleaners',value:v,unit:u,label,valueAt:label.indexOf(s),surface:s});
 const obs=[doc(1,'a.com','the docking hum reached 48 dB',48,'dB','48 dB'),doc(2,'b.com','the docking hum reached 52 dB',52,'dB','52 dB'),doc(3,'c.com','its docking hum is 50 dB',50,'dB','50 dB')];
 const plain=learnFromDocuments(defs,qk,obs);const rel=learnFromDocuments(defs,qk,obs,undefined,{relations:true});
 assert.ok(rel.proposals.every(p=>p.relations&&p.key),JSON.stringify(rel.proposals));
 assert.ok(plain.proposals.every(p=>!p.relations));
 const p=rel.proposals.find(x=>x.term.includes('hum'));if(p)assert.ok(p.relations!.some(r=>r.property==='sound_level'),'a sound-level concept relates to sound_level by kind');
});
