import test from 'node:test';import assert from 'node:assert/strict';
import {attributeLead1C,prepareMentions1C,pageIdentity1C,type Context1C,type Mention1C} from '../src/experience_attribution_candidate.js';

// Step 1C: the evaluation-only attribution candidate on FICTIONAL sentences (brands Zentra, Korvo, Brixel, Vexa).
const M:Mention1C[]=[{name:'Zentra Z10',model:'Z10'},{name:'Korvo K20',model:'K20'},{name:'Brixel B30',model:'B30'}];
const ctx=(blocks:string[],tags:string[]=blocks.map(()=>'p'),page:{name:string}|null={name:'Zentra Z10'},mentions=M):Context1C=>({blocks,tags,mentions,page,cells:new Map()});
const at=(sentence:string,value:number,c:Partial<Context1C>={})=>{const x={...ctx([sentence]),...c};return attributeLead1C({value,unit:'nits',blockIndex:x.blocks.length-1,valueOffset:null},x);};

test('structure first: a parenthetical value belongs to the product it follows, even after "both"',()=>{
 const d=at('The Zentra Z10 peaks at 690 nits and is beaten by both the Korvo K20 (1,240 nits) and Brixel B30 (2,100 nits).',1240);
 assert.deepEqual([d.subject,d.rule],['Korvo K20','R1b_parenthetical']);
 assert.equal(at('The Zentra Z10 peaks at 690 nits and is beaten by both the Korvo K20 (1,240 nits) and Brixel B30 (2,100 nits).',2100).subject,'Brixel B30');
 assert.equal(at('It is quicker than the Korvo (12.7ms) on paper.',12.7).subject,'Korvo K20','a standalone brand carried by one product only');
 assert.equal(at('Our panel measured 694 nits at 25% (K20: 775 nits).',775).subject,'Korvo K20','a labelled value inside the parenthesis');
 assert.equal(at('It is quieter than the Vexa Pura 220 (64.3 dBA).',64.3).subject,'Vexa Pura 220','a product named once, with a model code');
});
test('the grammatical subject wins over the nearest named product; objects of comparison never take the value',()=>{
 const d=at('From our results, you can see that the Zentra Z10 performs better than the Korvo K20 and Brixel B30 when it comes to SDR brightness at 253 nits.',253);
 assert.deepEqual([d.subject,d.rule],['Zentra Z10','R2_grammatical_subject']);
 const e=at('When it comes to gaming, the Zentra Z10 performs as well as the Korvo K20, and has even less input lag (8.9ms) than the Korvo K20 (9.1ms).',8.9);
 assert.deepEqual([e.subject,e.rule],['Zentra Z10','R2b_elided_subject']);
 assert.equal(at('The Zentra Z10 has less input lag (8.9ms) than the Korvo K20 (9.1ms).',9.1).subject,'Korvo K20');
 assert.equal(at('The Zentra Z10 reached 300 nits, but the Korvo K20 reached 520 nits.',520).subject,'Korvo K20','clause boundary');
});
test('possessives and pronouns: named owner, unnamed owner (unresolved), pronoun antecedent in the same block',()=>{
 assert.equal(at('The Zentra Z10’s max of 695 nits is fine.',695).subject,'Zentra Z10');
 const u=at('The Zentra Z10 is beaten by the Korvo K20, but still outperforms its predecessor’s 606 nits.',606);
 assert.deepEqual([u.status,u.rule],['unresolved','R1d_unnamed_referent']);assert.ok(u.neededEvidence&&u.reason);
 assert.equal(at('But it is outmatched when put against the Korvo K20 and its max brightness of 343 nits.',343).subject,'Korvo K20');
 const p=at('The Korvo K20 is the bright one. At 633 nits, it is twice as bright as the Zentra Z10 (241 nits).',633);
 assert.deepEqual([p.subject,p.rule],['Korvo K20','R3c_pronoun_antecedent']);
});
test('"both": two named products give a multi-subject statement; unnamed referents stay unresolved; foods are not products',()=>{
 const m=at('The Zentra Z10 and the Korvo K20 both reached 400 nits in our test.',400);
 assert.equal(m.status,'multi_subject');assert.deepEqual(m.subjects,['Zentra Z10','Korvo K20']);
 const u=at('Its quiet mode matches the pricier Vexa Elite (both with a CADR of 174 cfm).',174);
 assert.deepEqual([u.status,u.rule],['unresolved','R1e_multi_subject_unidentified']);assert.ok(u.candidates!.includes('Zentra Z10'));
 const f=at('The potatoes and the carrots both came out well in 15 minutes.',15);
 assert.equal(f.status,'attributed','"both" about two foods is not a product statement');
});
test('weakest rule only without competing evidence; a comparative heading never names the subject; headlines are not identities',()=>{
 const blocks=['Sound levels','In testing it is much quieter than the new Korvo K20 (62.5 dBA)','Running at speed 2, it needed 34 minutes.'];
 const d=attributeLead1C({value:34,unit:'minutes',blockIndex:2,valueOffset:null},ctx(blocks,['h2','h3','p']));
 assert.deepEqual([d.subject,d.rule],['Zentra Z10','R3a_document_main_product'],'a rival named as an object in the heading does not compete');
 const s=attributeLead1C({value:34,unit:'minutes',blockIndex:1,valueOffset:null},ctx(['Korvo K20 tested','It needed 34 minutes.'],['h3','p']));
 assert.deepEqual([s.subject,s.rule],['Korvo K20','R3b_section_heading']);
 const amb=attributeLead1C({value:34,unit:'minutes',blockIndex:1,valueOffset:null},ctx(['Korvo K20 and Brixel B30 in the lab','It needed 34 minutes.'],['h3','p']));
 assert.equal(amb.status,'unresolved','a heading with two subjects leaves the value unresolved');
 assert.equal(pageIdentity1C({name:'The Vexa Atem would look great in a museum but it is loud'},M),null);
 assert.deepEqual(pageIdentity1C({name:'Zentra Z10'},M),{name:'Zentra Z10'});
});
test('mention preparation drops standards and technical codes and restores a truncated name',()=>{
 const p=prepareMentions1C([{name:'HEPA 14',model:'14'},{name:'Bodnar 4K',model:'4K'},{name:'Quiet BP06',model:'BP06'},{name:'Zentra Z10',model:'Z10'}],
  'The Vexa Big+Quiet BP06 is quiet. The Vexa Big+Quiet BP06 again. A HEPA 14 filter. The Zentra Z10.');
 assert.deepEqual(p.map(m=>m.name),['Vexa Big+Quiet BP06','Zentra Z10']);
});
