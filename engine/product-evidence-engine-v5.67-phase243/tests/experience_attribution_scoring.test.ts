import test from 'node:test';import assert from 'node:assert/strict';
import {scoreItem1C,scoreLead1C,compareArms1C,identity1C,type GoldValue1C} from '../src/experience_attribution_scoring.js';

// Step 1C frozen scorer on FICTIONAL gold (brands Zentra, Korvo, Vexa).
const g=(id:string,value:number,subject:string|null,status:GoldValue1C['subjectStatus']='exact',extra:Partial<GoldValue1C>={}):GoldValue1C=>({id,doc:'d',value,unit:'nits',subjectStatus:status,subject,...extra});
const L=(value:number,subject:string|null,subjects:string[]|null=null)=>({value,unit:'nits',subject,subjects});

test('item classes: correct, variant, multi, false identity, unresolved, wrong, missing; the best lead wins for every arm alike',()=>{
 assert.equal(scoreItem1C(g('1',300,'Zentra Z10'),[L(300,'Zentra Z10')]),'correct');
 assert.equal(scoreItem1C(g('2',300,'Zentra Z10',"exact",{acceptedVariants:[{name:'Zentra QZ10X',evidence:'same page states the regional code'}]}),[L(300,'Zentra QZ10X')]),'correct');
 assert.equal(scoreItem1C(g('3',300,'Zentra Z10','shared',{group:'g1'}),[L(300,null,['Zentra Z10','Korvo K20'])]),'correct_multi');
 assert.equal(scoreItem1C(g('4',30,'Vexa Big+Quiet BP06'),[L(30,'Quiet BP06')]),'false_identity_match','a shared code with a contradicting brand word');
 assert.equal(scoreItem1C(g('5',300,'Zentra Z10'),[L(300,null)]),'unresolved');
 assert.equal(scoreItem1C(g('6',300,'Zentra Z10'),[L(300,'Korvo K20')]),'wrong_product');
 assert.equal(scoreItem1C(g('7',300,'Zentra Z10'),[L(301,'Zentra Z10')]),'missing');
 assert.equal(scoreItem1C(g('8',300,'Zentra Z10'),[L(300,'Korvo K20'),L(300,'Zentra Z10')]),'correct');
});
test('undetermined gold: unresolved is right, any assignment is unsupported; unresolved never counts as correct',()=>{
 assert.equal(scoreItem1C(g('u',606,null,'undetermined'),[L(606,null)]),'correctly_unresolved');
 assert.equal(scoreItem1C(g('u',606,null,'undetermined'),[L(606,'Zentra Z10')]),'unsupported_assignment');
 const c=compareArms1C({a:'correct',b:'missing',c:'unresolved'},{a:'unresolved',b:'wrong_product',c:'correct'});
 assert.deepEqual(c.correctLost,['a']);assert.deepEqual(c.newConfidentlyWrong,['b']);assert.deepEqual(c.correctGained,['c']);
});
test('lead classes expose a wrong assignment hidden behind a correct one; identity needs brand consistency',()=>{
 const gold=[g('1',300,'Zentra Z10'),g('2',400,'Korvo K20','shared',{group:'x'}),g('3',400,'Zentra Z10','shared',{group:'x'}),g('4',606,null,'undetermined')];
 assert.equal(scoreLead1C(L(300,'Korvo K20'),gold),'lead_wrong_product');
 assert.equal(scoreLead1C(L(400,null,['Korvo K20','Zentra Z10']),gold),'lead_multi_correct');
 assert.equal(scoreLead1C(L(300,null,['Korvo K20','Zentra Z10']),gold),'lead_multi_overreach');
 assert.equal(scoreLead1C(L(606,'Zentra Z10'),gold),'lead_unsupported');
 assert.equal(scoreLead1C(L(999,'Zentra Z10'),gold),'lead_not_gold_value');
 assert.equal(identity1C(g('x',1,'Zentra Z10'),'Zentra Z10 4K Smart TV (2026)'),'match');
 assert.equal(identity1C(g('x',1,'Zentra Z10'),'Z10'),'match','code-only names are not contradicted');
});
