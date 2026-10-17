import test from 'node:test';import assert from 'node:assert/strict';
import {buildInventory1D,attributionMentions1D,type Inventory1D} from '../src/experience_entity_inventory.js';
import {attributeLead1C} from '../src/experience_attribution_candidate.js';

// Step 1D-A: the document identity inventory on FICTIONAL documents (brands Zentra, Korvo, Vexa; invented codes).
const doc=(parts:[string,string][])=>({blocks:parts.map(p=>p[1]),tags:parts.map(p=>p[0]),title:null,categoryNouns:['air purifier','purifier','tv'],publisherHost:'www.labpub.test'});
const ent=(inv:Inventory1D,canonical:string)=>inv.entities.find(e=>e.canonical===canonical);
const linkOf=(inv:Inventory1D,surface:string)=>inv.mentions.filter(m=>m.surface===surface);

test('a documented short name links to its full name, with the supporting location; the observed name is kept',()=>{
 const inv=buildInventory1D(doc([['h1','Best small purifiers'],['h2','1. Best overall: Zentra Airwave 100'],['p','The Airwave 100 cleared the room in 21 minutes.'],['p','We liked the Zentra a lot.']]));
 const e=ent(inv,'Zentra Airwave 100')!;assert.equal(e.type,'product');assert.equal(e.brand,'Zentra');
 const a=linkOf(inv,'Airwave 100')[0];assert.deepEqual([a.state,a.entityId],['contextual_alias',e.id]);assert.equal(a.support?.blockIndex,1,'the alias points at the full mention');
 assert.equal(linkOf(inv,'Zentra')[0].state,'contextual_alias','a brand carried by one product only');
 assert.ok(attributionMentions1D(inv).every(m=>m.name==='Zentra Airwave 100'));
});
test('same brand, two products: codes are never merged and the bare brand stays ambiguous',()=>{
 const inv=buildInventory1D(doc([['h1','Zentra K10 vs Zentra K20'],['p','The Zentra K10 hit 300 nits while the Zentra K20 hit 410 nits.'],['p','The K10 is cheaper.'],['p','Overall the Zentra wins on price.']]));
 assert.ok(ent(inv,'Zentra K10')&&ent(inv,'Zentra K20'));assert.notEqual(ent(inv,'Zentra K10')!.id,ent(inv,'Zentra K20')!.id);
 assert.equal(linkOf(inv,'K10')[0].entityId,ent(inv,'Zentra K10')!.id);
 assert.equal(linkOf(inv,'Zentra').find(m=>m.at.blockIndex===3)?.state,'ambiguous');
});
test('products are told apart from standards, instruments and the publisher',()=>{
 const inv=buildInventory1D(doc([['h1','Vexa Pura 220 review'],['p','The Vexa Pura 220 uses a HEPA H13 filter and a MERV 13 pre-filter.'],
  ['p','We measured brightness with a Calman X2 colorimeter.'],['p','Labpub tested the Vexa Pura 220 for a month.']]));
 assert.equal(ent(inv,'Vexa Pura 220')?.type,'product');
 for(const s of ['HEPA H13','MERV 13'])assert.equal(ent(inv,s)?.type,'standard',s);
 assert.equal(ent(inv,'Calman X2')?.type,'instrument');
 assert.ok(!attributionMentions1D(inv).some(m=>/HEPA|MERV|Calman/.test(m.name)));
});
test('irrelevant extra products and site navigation do not change the identities of the tested products',()=>{
 const base:[string,string][]=[['h1','Zentra Airwave 100 review'],['p','The Airwave 100 needed 21 minutes.'],['p','The Zentra Airwave 100 is quiet.']];
 const a=buildInventory1D(doc(base));
 const b=buildInventory1D(doc([['li','Windows 10 End of Life'],['li','Korvo Phone 9 deals'],...base,['p','Elsewhere, the Korvo Speaker S5 launched.']]));
 const id=(inv:Inventory1D)=>linkOf(inv,'Airwave 100').map(m=>inv.entities.find(e=>e.id===m.entityId)?.canonical);
 assert.deepEqual(id(b),id(a));assert.ok(!b.entities.some(e=>/Windows|Phone 9/.test(e.canonical)),'navigation before the h1 is not read');
});
test('section rearrangement keeps each section bound to its own product through the heading hierarchy',()=>{
 const sec=(n:number,name:string,v:string):[string,string][]=>[['h2',`${n}. Pick: ${name}`],['h3','A compact choice'],['h4','What we like'],['p',`It cleared the room in ${v} minutes.`]];
 const one:[string,string][]=[['h1','Small purifiers'],...sec(1,'Zentra Airwave 100','21'),...sec(2,'Korvo Breeze K20','34')];
 const two:[string,string][]=[['h1','Small purifiers'],...sec(1,'Korvo Breeze K20','34'),...sec(2,'Zentra Airwave 100','21')];
 const bound=(parts:[string,string][])=>{const inv=buildInventory1D(doc(parts));const out:Record<string,string>={};
  parts.forEach((p,i)=>{const m=/(\d+) minutes/.exec(p[1]);if(m){const s=inv.section(i);out[m[1]]=inv.entities.find(e=>e.id===s.entityId)?.canonical??'none';}});return out;};
 assert.deepEqual(bound(one),{'21':'Zentra Airwave 100','34':'Korvo Breeze K20'});assert.deepEqual(bound(two),bound(one));
});
test('variant ambiguity: a word-prefix family name is not merged; a differing code is a different product',()=>{
 const inv=buildInventory1D(doc([['h1','Vexa purifiers'],['h3','Vexa PurePro Mini'],['h3','Vexa PurePro Mini 900 Series'],['p','The Vexa PurePro Mini 900 Series hit 40 dB.'],
  ['p','Both the Korvo A230 and the Korvo A231 were tested; the Korvo A230 was louder.']]));
 assert.ok(linkOf(inv,'Vexa PurePro Mini').length>0&&linkOf(inv,'Vexa PurePro Mini').every(m=>m.state==='ambiguous'),'family or variant not established');
 assert.notEqual(ent(inv,'Korvo A230')?.id,ent(inv,'Korvo A231')?.id);
});
test('with the inventory the Step 1C candidate binds a section value and a rival in parentheses to full product names',()=>{
 const parts:[string,string][]=[['h1','Small purifiers'],['h2','1. Best overall: Zentra Airwave 100'],['h4','What we like'],['p','It needed 21 minutes in our test.'],
  ['p','The Airwave 100 is quieter than the Korvo Breeze K20 (52 dB).'],['h2','2. Runner-up: Korvo Breeze K20'],['p','The Korvo Breeze K20 is loud.']];
 const inv=buildInventory1D(doc(parts));const mentions=attributionMentions1D(inv);
 const ctx={blocks:parts.map(p=>p[1]),tags:parts.map(p=>p[0]),mentions,page:null,cells:new Map(),
  section:(bi:number)=>{const r=inv.section(bi);return {subject:r.entityId?{name:inv.entities.find(e=>e.id===r.entityId)!.canonical}:null,competing:r.competing};}};
 assert.equal(attributeLead1C({value:21,unit:'minutes',blockIndex:3,valueOffset:null},ctx).subject,'Zentra Airwave 100');
 assert.equal(attributeLead1C({value:52,unit:'db',blockIndex:4,valueOffset:null},ctx).subject,'Korvo Breeze K20');
});
