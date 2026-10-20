import test from 'node:test';import assert from 'node:assert/strict';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {loadPropertyDefinitions} from '../src/property_definitions.js';
import {documentModel1G} from '../src/table_interpreter1g.js';
import {evidenceLinksOf,interpretWithDefinitions,attributeProperty} from '../src/definition_interpreter.js';
import {learnFromDocuments,proposeDefinitions,withLearnedDefinitions} from '../src/definition_learning.js';

// S93 (owner review of S92): provenance apart from nature, verifiable statements, object of the value, learning cycle.
// Every text is invented for this test.
const qk=loadQuantityKnowledge();const defs=loadPropertyDefinitions(qk);
const prose={container:'prose' as const,label:null,section:null,sectionRole:null,tableContext:null};
const read=(html:string,label:string,v:number,u:string,s:string)=>{const model=documentModel1G(html);
 const links=evidenceLinksOf({model},label,label.indexOf(s),s,v,'prose',{tables:true,prose:true,selection:'argument'});
 return interpretWithDefinitions(defs,qk,{value:v,unit:u,label,valueAt:label.indexOf(s),surface:s,structure:{...prose,links}},{roleModel:'links',situation:true,provenance:true,relations:{model}});};

test('S93 a measured input stays measured; the cost computed from it is calculated, same provenance, assumptions kept',()=>{
 const html='<html><body><h2>Running costs</h2><p>We measured the power draw with our power meter: 17.8 W on high.</p><p>Based on 8 hours a day and 28p per kWh, we calculated it costs £14.50 a year to run.</p></body></html>';
 const w=read(html,'We measured the power draw with our power meter: 17.8 W on high.',17.8,'W','17.8 W');
 assert.equal(w.evidence?.nature,'measured');assert.equal(w.evidence?.provenance,'publisher');
 const c=read(html,'Based on 8 hours a day and 28p per kWh, we calculated it costs £14.50 a year to run.',14.5,'GBP','£14.50');
 assert.equal(c.evidence?.nature,'calculated');assert.equal(c.evidence?.provenance,'publisher');
 assert.deepEqual(c.evidence?.calculation?.assumptions.map(a=>a.kind).sort(),['tariff','usage'],'the output\'s own period (a year) is not an assumption');
});

test('S93 statistics over a set and a ratio derived from two readings are calculations',()=>{
 const h='<html><body><p>x</p></body></html>';
 assert.equal(read(h,'Across all models we tested, the average power consumption: 39.1W overall.',39.1,'W','39.1W').evidence?.nature,'calculated');
 assert.equal(read(h,'In our test it reduced PM2.5 from 104.8 to 8.3 µg/m³, resulting in a 92% improvement.',92,'%','92%').evidence?.nature,'calculated');
});

test('S93 a link to another sentence names the originating statement, verifiable on the page',()=>{
 const html='<html><body><h2>Noise</h2><p>The fan is quiet at 41 dB on the lowest setting. We measured every setting with our sound meter at one metre.</p></body></html>';
 const r=read(html,'The fan is quiet at 41 dB on the lowest setting. We measured every setting with our sound meter at one metre.',41,'dB','41 dB');
 assert.equal(r.evidence?.nature,'measured');assert.ok(r.evidence?.statements.some(s=>s.sentence===1&&s.locator!=='own_sentence'),JSON.stringify(r.evidence));
});

test('S93 the object of the value decides between properties of one kind (runtime of a cordless device)',()=>{
 const o={value:40,unit:'minutes',label:'The 40-minute runtime is enough to clean a flat',valueAt:4,surface:'40-minute',frame:'The best cordless vacuums, tested'};
 assert.equal(attributeProperty(defs,qk,o).value,'run_duration','without object resolution the generic term wins');
 const r=attributeProperty(defs,qk,o,{objectResolution:true});assert.equal(r.value,'battery_runtime');assert.equal(r.rule,'object_of_the_value');
 assert.equal(attributeProperty(defs,qk,{...o,frame:'Dishwasher review'},{objectResolution:true}).value,'run_duration','no object named: unchanged');
});

test('S93 learning cycle: a concept weakly explained by a generic term is proposed, verified and becomes a narrower candidate definition',()=>{
 const doc=(i:number,pub:string,v:number,label:string)=>({docId:'d'+i,publisher:pub,category:'stick_vacuums',value:v,unit:'hours',label,valueAt:label.indexOf(String(v)),surface:v+' hours'});
 const obs=[doc(1,'a.com',3,'the charging time is 3 hours from empty'),doc(2,'b.com',4,'the charging time is 4 hours from empty'),doc(3,'c.com',5,'its charging time is 5 hours')];
 const layer=learnFromDocuments(defs,qk,obs,undefined,{relations:true,strongSeeds:true});const props=proposeDefinitions(defs,layer);
 const p=props.find(x=>x.terms.includes('charging time'));assert.ok(p,JSON.stringify(layer.proposals.map(x=>x.term)));
 assert.deepEqual(p!.verification.failed,[]);assert.ok(p!.relations.some(r=>r.relation==='narrower_than'&&r.property==='run_duration'));
 const learned=withLearnedDefinitions(qk,defs.pack,props);const def=learned.properties.get(p!.id)!;assert.equal(def.state,'candidate');
 assert.equal(attributeProperty(learned,qk,{value:6,unit:'hours',label:'the charging time is 6 hours',valueAt:24,surface:'6 hours'}).value,p!.id,'the new definition reaches later readings');
 assert.ok(learnFromDocuments(defs,qk,obs,undefined,{relations:true}).proposals.every(x=>!x.term.includes('charging time')),'without strong seeds the generic term blocks the concept');
});
