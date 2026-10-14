import test from 'node:test';import assert from 'node:assert/strict';
import {extractSpecifications245,type Fact245} from '../src/phase245_spec_extraction.js';
import {normalizeValue245} from '../src/phase245_value_normalizer.js';

const ld=(o:unknown)=>`<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const page=(head:string,body:string)=>`<!doctype html><html><head>${head}</head><body><main>${body}</main></body></html>`;
const run=(html:string,url='https://shop.example/products/af')=>extractSpecifications245(html,url);
const get=(fs:readonly Fact245[],k:string)=>fs.filter(f=>f.propertyKey===k);
const product=(o:Record<string,unknown>)=>({'@context':'https://schema.org','@type':'Product',...o});

test('entity resolution: duplicate structured-data blocks for one product (shared SKU) form one entity',()=>{
 const html=page(ld(product({name:'Air Fryer - Black',sku:'89230',url:'https://shop.example/products/af',offers:{'@type':'Offer',price:'129.99',priceCurrency:'GBP'}}))+
  ld(product({name:'Air Fryer',sku:'89230',offers:{'@type':'Offer',price:'129.99',priceCurrency:'GBP'}})),
  '<h1>Air Fryer</h1><h2>Specifications</h2><ul><li>Power: 1700W</li><li>Weight: 5.1kg</li><li>Material: ABS</li></ul>');
 const x=run(html);
 assert.equal(x.mainProduct.ambiguous,false);assert.equal(x.mainProduct.name,'Air Fryer','name matching the page heading');
 assert.deepEqual(get(x.facts,'price').map(f=>f.value),[{kind:'price',amount:129.99,currency:'GBP'}]);
 assert.equal(get(x.facts,'power').length,1);assert.equal(get(x.facts,'material').length,1);
});
test('entity resolution: the entity bound to the canonical URL is the subject; other entities are not merged',()=>{
 const html=page('<link rel="canonical" href="https://shop.example/products/kettle-a">'+
  ld(product({name:'Kettle A',url:'https://shop.example/products/kettle-a',offers:{'@type':'Offer',price:'40',priceCurrency:'GBP'}}))+
  ld(product({name:'Kettle B',url:'https://shop.example/products/kettle-b',offers:{'@type':'Offer',price:'55',priceCurrency:'GBP'}})),'<h1>Kettle A 1.7L</h1>');
 const x=run(html,'https://shop.example/products/kettle-a?ref=x');
 assert.equal(x.mainProduct.name,'Kettle A');assert.equal(x.mainProduct.ambiguous,false);
 assert.deepEqual(get(x.facts,'price').map(f=>(f.value as {amount:number}).amount),[40]);
 assert.ok(x.abstentions.json_ld_other_entities_not_main);
});
test('entity resolution: two unrelated entities with no page binding stay ambiguous',()=>{
 const html=page(ld(product({name:'Fryer 4L',offers:{'@type':'Offer',price:'40',priceCurrency:'GBP'}}))+ld(product({name:'Fryer 6L'})),'<h1>Air fryers</h1>');
 const x=run(html);assert.equal(x.mainProduct.ambiguous,true);assert.equal(x.facts.length,0);
});
test('a price labelled by another item name (upsell card) is not a price of the page product',()=>{
 const html=page(ld(product({name:'Machine X',offers:{'@type':'Offer',price:'509.95',priceCurrency:'GBP'}})),
  '<h1>Machine X</h1><div class="grid"><div class="c"><h3>Coffee Cup</h3><p>£25.00</p></div><div class="c"><h3>Brewing Guide</h3><p>£2.95</p></div><div class="c"><h3>Price</h3><p>£509.95</p></div></div>');
 const x=run(html);
 assert.deepEqual([...new Set([...x.facts,...x.ambiguous].filter(f=>f.value.kind==='price').map(f=>f.property))],['Price']);
 assert.ok(x.abstentions.price_labelled_by_other_item>=2);
});
test('a listing that states the product is discontinued does not promote its declared price',()=>{
 const html=page(ld(product({name:'Fryer D',offers:{'@type':'Offer',price:59.99,priceCurrency:'GBP',availability:'https://schema.org/InStock'}})),
  '<h1>Fryer D</h1><p>Unavailable</p><p>Discontinued</p>');
 const x=run(html);
 assert.equal(get(x.facts,'price').length,0);
 assert.ok(get(x.ambiguous,'price')[0].flags.includes('listing_states_discontinued'));
});
test('short text cards without any attribute value or specification context are held back; the same under a spec heading are read',()=>{
 const cards='<div class="g"><div class="c"><h3>Voted best roaster</h3><p>Two years running</p></div><div class="c"><h3>Certified</h3><p>B Corp</p></div><div class="c"><h3>Reviews</h3><p>Loved by customers</p></div></div>';
 const a=run(page(ld(product({name:'P'})),'<h1>P</h1><h2>Why shop with us</h2>'+cards));
 assert.equal(a.facts.filter(f=>f.method!=='json_ld').length,0);
 assert.ok(a.ambiguous.every(f=>f.flags.includes('text_group_without_spec_context')));
 const specs='<div class="g"><div class="c"><h3>Materials</h3><p>Stainless steel</p></div><div class="c"><h3>Brewing system</h3><p>Single boiler</p></div><div class="c"><h3>Colour</h3><p>Steel</p></div></div>';
 const b=run(page(ld(product({name:'P'})),'<h1>P</h1><h2>Product Specifications</h2>'+specs));
 assert.deepEqual(b.facts.map(f=>f.propertyKey).sort(),['brewing system','colour','materials']);
});
test('a card whose list items are each "attribute value" is read item by item; a plain list stays one held-back value',()=>{
 const html=page(ld(product({name:'M'})),'<h1>M</h1><h2>Specifications</h2><div class="g">'+
  '<div class="c"><h3>Capacity</h3><ul><li>Boiler capacity 250 cc</li><li>Water tank capacity 2.7 L</li></ul></div>'+
  '<div class="c"><h3>Control</h3><ul><li>PID display</li><li>Lever switches</li></ul></div>'+
  '<div class="c"><h3>Dimensions</h3><p>230 x 380 x 340 mm</p></div></div>');
 const x=run(html);
 const boiler=get(x.facts,'boiler capacity')[0];
 assert.deepEqual([boiler.value,boiler.section],[{kind:'quantity',number:250,unit:'cm³',approximate:false},'Capacity']);
 assert.equal(get(x.facts,'water tank capacity').length,1);
 assert.ok(get(x.ambiguous,'control')[0].flags.includes('multiple_values_for_one_label'));
});
test('normalizer: per-number axis marks, trailing notes and counted items',()=>{
 assert.deepEqual(normalizeValue245('32.6(D) x 37.9(W) x 31.4(H) cm'),{kind:'dimensions',numbers:[32.6,37.9,31.4],unit:'cm',axes:['D','W','H'],approximate:false});
 assert.deepEqual(normalizeValue245('(H)43cm x (W)32cm x (D)25cm'),{kind:'dimensions',numbers:[43,32,25],unit:'cm',axes:['H','W','D'],approximate:false});
 assert.deepEqual(normalizeValue245('28(W) x 140(H) x 120(L) mm (front to back)'),
  {kind:'dimensions',numbers:[28,140,120],unit:'mm',axes:['W','H','L'],approximate:false,qualifier:'(front to back)'});
 assert.equal(normalizeValue245('10(W) x 20(W) cm').kind!=='dimensions'||false,true,'repeated axis is not one object');
 assert.deepEqual(normalizeValue245('6 Slices'),{kind:'quantity',number:6,unit:'slices',approximate:false});
 assert.equal(normalizeValue245('Series 9').kind,'text');
});
