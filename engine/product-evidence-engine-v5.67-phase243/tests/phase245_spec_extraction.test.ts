import test from 'node:test';import assert from 'node:assert/strict';
import {parseHtml245,walk245,textOf245} from '../src/phase245_html_dom.js';
import {buildTableGrid245,interpretTableGrid245} from '../src/phase245_table_grid.js';
import {normalizeValue245} from '../src/phase245_value_normalizer.js';
import {extractSpecifications245,toFacts241,type Fact245} from '../src/phase245_spec_extraction.js';

const page=(body:string,head='')=>`<!doctype html><html><head>${head}</head><body><main>${body}</main></body></html>`;
const ld=(o:unknown)=>`<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const run=(html:string)=>extractSpecifications245(html,'https://synthetic.example/p');
const fact=(fs:readonly Fact245[],prop:string,product?:string)=>fs.filter(f=>f.propertyKey===prop&&(product===undefined||f.product.name===product));
const firstTable=(html:string)=>[...walk245(parseHtml245(html).root)].find(n=>n.tag==='table')!;

test('DOM: implied end tags, raw text and entities',()=>{
 const {root}=parseHtml245('<ul><li>One<li>Two &amp; <b>three</b></ul><table><tr><td>a<td>b<tr><td>c</table><script>if(a<b){}</script>');
 const lis=[...walk245(root)].filter(n=>n.tag==='li');
 assert.deepEqual(lis.map(n=>textOf245(n)),['One','Two & three']);
 const trs=[...walk245(root)].filter(n=>n.tag==='tr');
 assert.equal(trs.length,2);assert.equal(trs[0].children.filter(c=>c.tag==='td').length,2);
 assert.equal([...walk245(root)].find(n=>n.tag==='script')!.text,'if(a<b){}');
});
test('grid: rowspan/colspan placement keeps original coordinates (HTML table model)',()=>{
 const g=buildTableGrid245(firstTable('<table><tr><td rowspan="2">A</td><td colspan="2">B</td></tr><tr><td>C</td><td>D</td></tr><tr><td>E</td><td>F</td><td>G</td></tr></table>'))!;
 assert.equal(g.rows,3);assert.equal(g.cols,3);
 const at=(r:number,c:number)=>g.cells[g.slot[r][c]].text;
 assert.deepEqual([at(0,0),at(0,1),at(0,2),at(1,0),at(1,1),at(1,2),at(2,0)],['A','B','B','A','C','D','E']);
 const b=g.cells.find(c=>c.text==='B')!;assert.deepEqual([b.row,b.col,b.rowspan,b.colspan],[0,1,1,2]);
});
test('grid: rowspan="0" spans to the end of its own section only',()=>{
 const g=buildTableGrid245(firstTable('<table><tbody><tr><td rowspan="0">X</td><td>1</td></tr><tr><td>2</td></tr></tbody><tbody><tr><td>Y</td><td>3</td></tr></tbody></table>'))!;
 assert.equal(g.cells.find(c=>c.text==='X')!.rowspan,2);
 assert.equal(g.cells[g.slot[2][0]].text,'Y');
});
test('table: products in columns with multilevel header -> product + variant, shared colspan value',()=>{
 const html=page(`<table><thead><tr><th></th><th colspan="2">Kettle K1</th><th>Kettle K2</th></tr>
  <tr><th></th><th>1.0 L</th><th>1.7 L</th><th>1.7 L</th></tr></thead>
  <tbody><tr><th>Power</th><td>2200 W</td><td>3000 W</td><td>3000 W</td></tr>
  <tr><th>Cord length</th><td colspan="3">75 cm</td></tr></tbody></table>`);
 const x=run(html);
 const power=fact(x.facts,'power');
 assert.deepEqual(power.map(f=>[f.product.name,f.variant,(f.value as {number:number}).number]),
  [['Kettle K1','1.0 L',2200],['Kettle K1','1.7 L',3000],['Kettle K2','1.7 L',3000]]);
 const cord=fact(x.facts,'cord length');
 assert.equal(cord.length,3);assert.ok(cord.every(f=>f.flags.includes('shared_cell:3')&&(f.value as {number:number}).number===75));
});
test('table: a value spanning several property rows is ambiguous and not promoted',()=>{
 const html=page(`<table><tr><th></th><th>A</th><th>B</th></tr><tr><th>Height</th><td rowspan="2">90 cm</td><td>80 cm</td></tr>
  <tr><th>Width</th><td>50 cm</td></tr></table>`);
 const x=run(html);
 assert.equal(fact(x.facts,'height','A').length,0);assert.equal(fact(x.facts,'width','A').length,0);
 assert.ok(x.ambiguous.some(f=>f.product.name==='A'&&f.flags.includes('value_spans_multiple_properties')));
 assert.equal(fact(x.facts,'width','B')[0].rawValue,'50 cm');
});
test('table: products in rows with a two-level key and rowspan-shared values',()=>{
 const html=page(`<table><tr><th>Series</th><th>Model</th><th>Memory</th><th>Price</th></tr>
  <tr><td rowspan="2">Board B</td><td>1</td><td>256 MB</td><td rowspan="2">$35</td></tr>
  <tr><td>1+</td><td>512 MB</td></tr><tr><td>Board A</td><td>1</td><td>256 MB</td><td>$25</td></tr></table>`);
 const x=run(html);
 const price=(p:string)=>fact(x.facts,'price',p)[0]?.value;
 assert.deepEqual(price('Board B › 1'),{kind:'price',amount:35,currency:'USD'});
 assert.deepEqual(price('Board B › 1+'),{kind:'price',amount:35,currency:'USD'});
 assert.deepEqual(price('Board A › 1'),{kind:'price',amount:25,currency:'USD'});
 assert.equal((fact(x.facts,'memory','Board B › 1+')[0].value as {number:number}).number,512);
 assert.equal(x.ambiguous.length,0,'"1" and "1+" are distinct products, not conflicting values');
});
test('table: key/value table with th section rows and label unit hints',()=>{
 const html=page(`<h1>Fan F9</h1><table><tr><th colspan="2">Electrical</th></tr><tr><th>Power (W)</th><td>45</td></tr>
  <tr><th colspan="2">Dimensions</th></tr><tr><th>Height</th><td>1.2 m</td></tr></table>`);
 const x=run(html);
 const p=fact(x.facts,'power w')[0];assert.deepEqual(p.value,{kind:'quantity',number:45,unit:'W',approximate:false});
 assert.equal(p.section,'Electrical');assert.equal(p.product.ref,'main');assert.equal(p.product.name,'Fan F9');
 assert.equal(fact(x.facts,'height')[0].section,'Dimensions');
});
test('table: multi-column table without any header is not interpreted',()=>{
 const g=buildTableGrid245(firstTable('<table><tr><td>a</td><td>b</td><td>c</td></tr><tr><td>d</td><td>e</td><td>f</td></tr></table>'))!;
 assert.equal(interpretTableGrid245(g).mode,'unsupported');
});
test('microdata Product: PropertyValue, QuantitativeValue, offers; related item microdata is excluded',()=>{
 const html=page(`<div itemscope itemtype="https://schema.org/Product"><h1 itemprop="name">Lamp L2</h1>
  <meta itemprop="sku" content="L2-01">
  <div itemprop="additionalProperty" itemscope itemtype="https://schema.org/PropertyValue"><span itemprop="name">Luminous flux</span>
   <span itemprop="value">800</span><meta itemprop="unitText" content="lm"></div>
  <div itemprop="weight" itemscope itemtype="https://schema.org/QuantitativeValue"><span itemprop="value">1.4</span><meta itemprop="unitCode" content="KGM"></div>
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer"><meta itemprop="price" content="49.90"><meta itemprop="priceCurrency" content="EUR"></div>
  <div itemprop="isRelatedTo" itemscope itemtype="https://schema.org/Product"><span itemprop="name">Bulb B1</span>
   <div itemprop="weight" itemscope itemtype="https://schema.org/QuantitativeValue"><span itemprop="value">0.05</span><meta itemprop="unitCode" content="KGM"></div></div>
 </div>`);
 const x=run(html);
 assert.equal(x.mainProduct.name,'Lamp L2');assert.equal(x.mainProduct.source,'microdata');assert.equal(x.mainProduct.identifiers.sku,'L2-01');
 assert.deepEqual(fact(x.facts,'luminous flux')[0].value,{kind:'quantity',number:800,unit:'lm',approximate:false});
 const w=fact(x.facts,'weight');assert.equal(w.length,1);assert.deepEqual(w[0].value,{kind:'quantity',number:1.4,unit:'kg',approximate:false});
 assert.deepEqual(fact(x.facts,'price')[0].value,{kind:'price',amount:49.9,currency:'EUR'});
 assert.ok(!x.facts.concat(x.ambiguous).some(f=>f.product.name==='Bulb B1'),'related product never attributed');
});
test('JSON-LD ProductGroup: variant-specific properties stay on their variant, price becomes a range',()=>{
 const html=page('<h1>Bin B</h1>',ld({'@context':'https://schema.org','@type':'ProductGroup',name:'Bin B',productGroupID:'BB',variesBy:['https://schema.org/size'],
  hasVariant:[{'@type':'Product',name:'Bin B 20 l',sku:'BB20',size:'20 l',additionalProperty:[{'@type':'PropertyValue',name:'Capacity',value:20,unitText:'l'}],offers:{'@type':'Offer',price:30,priceCurrency:'GBP'}},
   {'@type':'Product',name:'Bin B 40 l',sku:'BB40',size:'40 l',additionalProperty:[{'@type':'PropertyValue',name:'Capacity',value:40,unitText:'l'}],offers:{'@type':'Offer',price:45,priceCurrency:'GBP'}}]}));
 const x=run(html);
 assert.equal(x.variants.length,2);assert.deepEqual(x.variants.map(v=>v.properties.size),['20 l','40 l']);
 const cap=fact(x.facts,'capacity');
 assert.deepEqual(cap.map(f=>[f.variant,(f.value as {number:number}).number]),[['Bin B 20 l',20],['Bin B 40 l',40]]);
 assert.equal(x.ambiguous.length,0,'different variants are not conflicting values');
 assert.deepEqual(fact(x.facts,'price')[0].value,{kind:'price',amount:30,maxAmount:45,currency:'GBP'});
});
test('several declared products: main product is ambiguous and page facts are held back',()=>{
 const html=page('<h1>Two things</h1><dl><dt>Weight</dt><dd>3 kg</dd></dl>',ld([{'@type':'Product',name:'Thing One'},{'@type':'Product',name:'Thing Two'}]));
 const x=run(html);
 assert.equal(x.mainProduct.ambiguous,true);assert.equal(x.facts.length,0);
 assert.ok(x.ambiguous.some(f=>f.propertyKey==='weight'&&f.flags.includes('main_product_ambiguous')));
});
test('generic div/span label/value structures: wrapped pairs, alternating siblings, "Label: value" items',()=>{
 const html=page(`<h1>Desk D1</h1>
  <div class="x1"><div class="row"><span class="a">Width</span><span class="b">120 cm</span></div>
   <div class="row"><span class="a">Depth</span><span class="b">60 cm</span></div><div class="row"><span class="a">Max. load</span><span class="b">50 kg</span></div></div>
  <div class="x2"><span class="k">Material</span><span class="v">Oak veneer</span><span class="k">Finish</span><span class="v">Matt lacquer</span></div>
  <ul class="x3"><li>Colour: Natural</li><li>Assembly: Required</li><li>Warranty: 10 years</li></ul>`);
 const x=run(html);const v=(k:string)=>fact(x.facts,k)[0]?.value;
 assert.deepEqual(v('width'),{kind:'quantity',number:120,unit:'cm',approximate:false});
 assert.deepEqual(v('max load'),{kind:'quantity',number:50,unit:'kg',approximate:false});
 assert.deepEqual(v('material'),{kind:'text',text:'Oak veneer'});
 assert.deepEqual(v('finish'),{kind:'text',text:'Matt lacquer'});
 assert.deepEqual(v('colour'),{kind:'text',text:'Natural'});
 assert.ok(x.facts.every(f=>f.product.ref==='main'&&f.product.name==='Desk D1'));
});
test('label/value pairs in related products, listings, navigation and ads are not attributed to the main product',()=>{
 const card=(n:string,c:string)=>`<li class="card"><a href="/p/${n}"><img src="x.jpg"><span class="t">${n}</span></a><div class="s"><span>Capacity</span><span>${c}</span></div></li>`;
 const html=page(`<h1>Pedal Bin 36 l</h1>
  <section class="related-products"><div><div class="r"><span>Capacity</span><span>60 l</span></div><div class="r"><span>Height</span><span>70 cm</span></div></div></section>
  <ul class="grid">${card('A','30 l')}${card('B','40 l')}${card('C','50 l')}</ul>
  <nav><div class="r"><span>Delivery</span><span>2 days</span></div><div class="r"><span>Returns</span><span>30 days</span></div></nav>
  <div class="ad-slot"><div class="r"><span>Power</span><span>900 W</span></div><div class="r"><span>Speed</span><span>3</span></div></div>`);
 const x=run(html);
 assert.equal(x.facts.length,0);assert.equal(x.mainProduct.name,'Pedal Bin 36 l');
});
test('section context: product and package dimensions are both kept, never merged or conflicting',()=>{
 const html=page(`<h1>Shelf S</h1><h3>Measurements</h3><ul class="m"><li><span>Width</span><span>80 cm</span></li><li><span>Height</span><span>200 cm</span></li></ul>
  <h3>Package details</h3><ul class="p"><li><span>Width</span><span>30 cm</span></li><li><span>Height</span><span>13 cm</span></li></ul>`);
 const x=run(html);
 const w=fact(x.facts,'width');
 assert.deepEqual(w.map(f=>[f.section,(f.value as {number:number}).number,f.component]),[['Measurements',80,null],['Package details',30,'packaging']]);
 assert.equal(x.ambiguous.length,0);
});
test('conflicting values for one property in one section are kept as ambiguous, not promoted',()=>{
 const html=page(`<h1>Kettle K</h1><dl><dt>Capacity</dt><dd>1.7 l</dd><dt>Power</dt><dd>3000 W</dd></dl><dl><dt>Capacity</dt><dd>1.5 l</dd><dt>Colour</dt><dd>Red</dd></dl>`);
 const x=run(html);
 assert.equal(fact(x.facts,'capacity').length,0);
 assert.equal(fact(x.ambiguous,'capacity').length,2);assert.ok(fact(x.ambiguous,'capacity').every(f=>f.flags.includes('conflicting_values')));
 assert.equal(fact(x.facts,'power').length,1);
});
test('abstention: prose, per-variant cells, several quantities and feature cards are not facts',()=>{
 const html=page(`<h1>Phone P</h1><table><tr><th>Weight</th><td>P: 171 g P Plus: 201 g</td></tr><tr><th>Safety distance</th><td>600 mm sides / 900 mm back</td></tr>
  <tr><th>Display</th><td>6.1 in</td></tr></table>
  <div class="features"><div class="f"><div>EEPROM</div><p>The controller also features 1kb of EEPROM, a memory which is not erased when powered off.</p></div>
  <div class="f"><div>Clock</div><p>The board runs at a stable sixteen megahertz clock that keeps timing precise for most projects.</p></div></div>`);
 const x=run(html);
 assert.deepEqual(x.facts.map(f=>f.propertyKey),['display']);
 assert.ok(x.ambiguous.some(f=>f.propertyKey==='weight'&&f.flags.includes('value_per_variant')));
 assert.ok(x.ambiguous.some(f=>f.propertyKey==='safety distance'&&f.flags.includes('value_compound')));
 assert.equal(x.abstentions.title_and_prose_items_not_specifications,1);
});
test('value normalization keeps units, ranges, options, bounds, prices and dimensions',()=>{
 assert.deepEqual(normalizeValue245('2 lb. 12 oz.'),{kind:'quantity',number:1247,unit:'g',approximate:false});
 assert.deepEqual(normalizeValue245('W 40 x D 30 x H 65 cm'),{kind:'dimensions',numbers:[40,30,65],unit:'cm',axes:['W','D','H'],approximate:false});
 assert.deepEqual(normalizeValue245('80 x 28 x 202 cm'),{kind:'dimensions',numbers:[80,28,202],unit:'cm',axes:null,approximate:false});
 assert.deepEqual(normalizeValue245('128 GB, 256 GB or 512 GB'),{kind:'options',numbers:[128,256,512],unit:'GB'});
 assert.deepEqual(normalizeValue245('80°C to 200°C'),{kind:'range',min:80,max:200,unit:'°C',approximate:false});
 assert.deepEqual(normalizeValue245('Max. 30 kg'),{kind:'quantity',number:30,unit:'kg',approximate:false,bound:'max'});
 assert.deepEqual(normalizeValue245('89,99 €'),{kind:'price',amount:89.99,currency:'EUR'});
 assert.deepEqual(normalizeValue245('35–85','MSRP (US$)'),{kind:'price',amount:35,maxAmount:85,currency:'USD'});
 assert.deepEqual(normalizeValue245('147.6 mm (5.81 in)'),{kind:'quantity',number:147.6,unit:'mm',approximate:false,alternative:{number:5.81,unit:'in'}});
 assert.equal(normalizeValue245('Approx. 29 x 42 x 27.5cm H').kind,'text','axis letter only on the last number stays text');
 assert.equal(normalizeValue245('Jan 2021 W: Jun 2022').kind,'per_variant');
});
test('determinism, integrity flags and Phase241 contract mapping',()=>{
 const html=page(`<h1>Desk D1</h1><dl><dt>Width</dt><dd>120 cm</dd><dt>Colour</dt><dd>Oak</dd></dl>`);
 const a=run(html),b=run(html);
 assert.deepEqual({...a,stats:null},{...b,stats:null});
 assert.equal(a.rankingAuthorized,false);assert.equal(a.rawSourceStored,false);
 assert.ok(a.facts.every(f=>f.status==='unverified_source_declaration'&&!f.rankingAuthorized&&!f.scientificTestEvidence&&f.rawValue.length<=120));
 const f241=toFacts241(a,'src');
 assert.deepEqual(f241.map(f=>[f.propertyKey,f.value]),[['width',{type:'scalar',number:120,unit:'cm'}],['colour',{type:'text',value:'Oak'}]]);
 assert.ok(f241.every(f=>f.status==='unverified_source_declaration'&&f.rankingAuthorized===false&&f.provenance.method.startsWith('phase245_')));
});
test('a page with a main product and only a listing of other products yields no main-product facts',()=>{
 const items=['Touch Bin 60 litre','Touch Bin 30 litre','Drying Rack 30 metres'].map((n,i)=>`<li class="product-item"><a href="/i${i}"><img src="i.jpg"></a><a href="/i${i}">${n}</a><span>In stock</span><span>€${i+3}.10</span></li>`).join('');
 const html=page(`<h1>Pedal Bin, 36 litre</h1><div>25477 products</div><ol class="products">${items}</ol>`,
  ld({'@type':'ItemList',itemListElement:[{'@type':'ListItem',position:1,name:'Touch Bin 60 litre',description:'60 litre capacity'}]}));
 const x=run(html);
 assert.equal(x.facts.length,0);assert.equal(x.mainProduct.name,'Pedal Bin, 36 litre');
});
test('definition list with swapped dt/dd per wrapper: document order decides label and value',()=>{
 const html=page(`<h1>Coffee C1</h1><dl class="spec">${[['Power','1450.00W'],['Pressure','15.0bar'],['Cup warmer','No']].map(([l,v])=>`<div><dd>${l}</dd><dt>${v}</dt></div>`).join('')}</dl>`);
 const x=run(html);
 assert.deepEqual(fact(x.facts,'power')[0].value,{kind:'quantity',number:1450,unit:'W',approximate:false});
 assert.deepEqual(fact(x.facts,'pressure')[0].value,{kind:'quantity',number:15,unit:'bar',approximate:false});
 assert.deepEqual(fact(x.facts,'cup warmer')[0].value,{kind:'boolean',value:false,qualifier:null});
 assert.ok(fact(x.facts,'power')[0].flags.includes('dt_dd_order_swapped_by_source'));
});
test('specifications inside a dialog/drawer are page content; footnote markers are not part of values',()=>{
 const html=page(`<h1>Driver D</h1><dialog class="drawer"><table><tr><th>Continuous current:</th><td>1.2 A<sup><a href="#note2">2</a></sup></td></tr>
  <tr><th>Reverse voltage protection?:</th><td>Y</td></tr><tr><th>Weight:</th><td>0.5 g<sup><a href="#note1">1</a></sup></td></tr></table></dialog>`);
 const x=run(html);
 assert.deepEqual(fact(x.facts,'continuous current')[0].value,{kind:'quantity',number:1.2,unit:'A',approximate:false});
 assert.deepEqual(fact(x.facts,'reverse voltage protection')[0].value,{kind:'boolean',value:true,qualifier:null});
 assert.deepEqual(fact(x.facts,'weight')[0].value,{kind:'quantity',number:0.5,unit:'g',approximate:false});
});
test('a reusable label/value component repeated across sections is read even when each section holds one pair',()=>{
 const sec=(h:string,l:string,v:string)=>`<h5>${h}</h5><div class="section"><div class="pair"><span class="key">${l}</span><span class="val">${v}</span></div></div>`;
 const html=page(`<h1>Amp A9</h1>${sec('Overview','Colour','Silver')}${sec('Dimensions','Product Dimensions (mm):','W 444 mm x H 89 mm x D 342 mm')}${sec('Weight','Weight:','8.4 KG')}`);
 const x=run(html);
 assert.deepEqual(fact(x.facts,'weight')[0].value,{kind:'quantity',number:8.4,unit:'kg',approximate:false});
 assert.deepEqual(fact(x.facts,'product dimensions mm')[0].value,{kind:'dimensions',numbers:[444,89,342],unit:'mm',axes:['W','H','D'],approximate:false});
 assert.equal(fact(x.facts,'product dimensions mm')[0].section,'Dimensions');
 assert.equal(fact(x.facts,'weight')[0].section,null,'a heading equal to the property adds nothing');
 // The same component repeating one label is a widget template, not specifications.
 const widget=page(`<h1>Boot B</h1>${[1,2,3,4].map(()=>`<div class="tab"><div class="pair"><span class="key">Your selection</span><span class="val">Firm Ground</span></div></div>`).join('')}`);
 assert.equal(fact(run(widget).facts,'your selection').length,0);
});
test('mixed bullet lists: only explicit, measurable "Label: value" items are read; bold lead phrases are features',()=>{
 const html=page(`<h1>Ice pack</h1><ul class="feat"><li>Keeps food cold for longer during a power failure</li><li>Also suitable for a cool box</li>
  <li>Dimensions: 21.8 cm x 13.5 cm (length x height)</li><li>Note: hand wash only</li><li>Tested and approved accessory</li></ul>
  <ul class="feat2"><li><strong>5 x LEDs</strong> for status and fun</li><li><strong>Triple-axis accelerometer</strong> (motion sensor)</li><li><strong>Light sensor</strong>, front facing</li></ul>`);
 const x=run(html);
 assert.deepEqual(x.facts.map(f=>f.propertyKey),['dimensions']);
 assert.deepEqual(x.facts[0].value,{kind:'dimensions',numbers:[21.8,13.5],unit:'cm',axes:['L','H'],approximate:false});
});
test('unit conversions and conditions: "A / B", trailing axis notes, bracketed conditions, case-sensitive grams',()=>{
 assert.deepEqual(normalizeValue245('29.3g / 1.0oz'),{kind:'quantity',number:29.3,unit:'g',approximate:false,alternative:{number:1,unit:'oz'}});
 assert.deepEqual(normalizeValue245('22.15 x 2.38 x 80.15 mm (WxHxD)'),{kind:'dimensions',numbers:[22.15,2.38,80.15],unit:'mm',axes:['W','H','D'],approximate:false});
 assert.deepEqual(normalizeValue245('100 Watts (into 8 Ohms)'),{kind:'quantity',number:100,unit:'W',approximate:false,qualifier:'(into 8 Ohms)'});
 assert.equal(normalizeValue245('600 mm sides / 900 mm back').kind,'compound','same unit on both sides is not a conversion');
 assert.equal(normalizeValue245('20G').kind,'text','upper-case G is g-force, not grams');
 assert.deepEqual(normalizeValue245('10000 MB/s'),{kind:'quantity',number:10000,unit:'MB/s',approximate:false});
});
test('product codes across the header row mean products are columns even with a corner label',()=>{
 const html=page(`<h1>Laptop L12 models</h1><table><tr><th>Model</th><th>21KC00FKMZ</th><th>21KC00FFIX</th></tr>
  <tr><td>Storage</td><td>1TB SSD</td><td>512GB SSD</td></tr><tr><td>Weight</td><td>1.08 kg</td><td>1.10 kg</td></tr></table>`);
 const x=run(html);
 assert.deepEqual(fact(x.facts,'weight').map(f=>[f.product.name,(f.value as {number:number}).number]),[['21KC00FKMZ',1.08],['21KC00FFIX',1.1]]);
 assert.equal(fact(x.facts,'21kc00fkmz').length,0);
});
test('<main> holding almost no text (a search widget) does not hide the product content outside it',()=>{
 const html=`<html><body><main><form><input name="q"></form>Search</main><div class="product"><h1>Badge B</h1>
  <h2>Technical details</h2><ul><li>Product Weight: 29.3g / 1.0oz</li><li>Product Dimensions: 85.7mm x 54.6mm x 10.0mm</li></ul>
  <p>${'Long description text. '.repeat(120)}</p></div></body></html>`;
 const x=run(html);
 assert.deepEqual(fact(x.facts,'product weight')[0]?.value,{kind:'quantity',number:29.3,unit:'g',approximate:false,alternative:{number:1,unit:'oz'}});
 assert.equal(x.mainProduct.name,'Badge B');
});
