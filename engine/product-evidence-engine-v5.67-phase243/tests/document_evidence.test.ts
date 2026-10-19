import test from 'node:test';
import assert from 'node:assert/strict';
import {loadQuantityKnowledge,findQuantities,typeQuantity,compareQuantities} from '../src/quantity_knowledge.js';
import {readDocumentEvidence,windows,headingProduct} from '../src/document_evidence.js';
import {interpretWithKnowledge1G} from '../src/table_interpreter1g_knowledge.js';

// WD (2026-10-18): whole-document reading with the shared knowledge and rules. Synthetic pages only.
const qk=loadQuantityKnowledge();
const page=(body:string,head='')=>`<html><head>${head}</head><body><main>${body}</main></body></html>`;
const read=(body:string,head='',sourceType:string|null=null)=>readDocumentEvidence(page(body,head),qk,{sourceType});
const at=(r:ReturnType<typeof read>,surface:string,n=0)=>{const q=r.quantities.filter(q=>q.surface===surface)[n];assert.ok(q,'no value '+surface+' among '+r.quantities.map(x=>x.surface).join(', '));return q;};

test('WD prose: a sentence value gets its kind, metric and product from the same knowledge; a rival product named next to it leaves it open', ()=>{
 const r=read('<h1>Acme DH20 review</h1><h2>Acme DH20</h2><p>In our tests the Acme DH20 extracted 12 litres per day, more than the 9 litres per day of the Brandx QX9 Pro.</p>');
 const a=at(r,'12 litres per day');assert.equal(a.quantity!.kind.id,'periodic_volume');assert.equal(a.quantity!.metric.id,'dehumidifier_capacity');
 assert.equal(a.product,'Acme DH20');assert.equal(a.evidenceClass,'publisher_measured');
 assert.equal(at(r,'9 litres per day').product,null,'the value belongs to a product the page does not list: not attributed to the reviewed one');
});
test('WD pairs: definition lists and two-part grid rows are key-value records; the section heading names their product', ()=>{
 const r=read('<h2>2. Acme DH20</h2><dl><dt>Extraction rate</dt><dd>20L</dd><dt>Water tank capacity</dt><dd>4.8L</dd></dl><div class="spec"><div>Noise</div><div>42 dB</div></div>');
 const e=at(r,'20L');assert.equal(e.quantity!.kind.id,'periodic_volume','the metric is reported per day by its stated convention');assert.equal(e.quantity!.metric.id,'dehumidifier_capacity');
 assert.equal(at(r,'4.8L').quantity!.metric.id,'tank_capacity');assert.equal(at(r,'42 dB').product,'Acme DH20');assert.equal(at(r,'42 dB').productBasis,'pair_section');
});
test('WD P3: a number inside a product or model name is part of an identifier, not a measurement', ()=>{
 const r=read('<h2>Meaco Arete 12L</h2><p>The Meaco Arete 12L holds 2.2 litres of water.</p>');
 assert.ok(r.quantities.filter(q=>q.surface==='12L').every(q=>q.identifierPart&&q.quantity===null));
 assert.equal(at(r,'2.2 litres').quantity!.kind.id,'volume');assert.equal(at(r,'2.2 litres').identifierPart,false);
});
test('WD P1 in a sentence: the rating point is a condition of the record, for every result of it', ()=>{
 const r=read('<h2>Acme DH20</h2><p>At 30°C and 80% RH it extracted 20 litres per day while drawing 300 W.</p>');
 const x=at(r,'20 litres per day');const c=x.quantity!.conditions.find(c=>c.axis==='inlet_air_state')!;
 assert.equal(c.from,'record');assert.match(c.value,/30 ?°c; 80 ?% ?rh/);assert.equal(x.recordRole,'result');
 assert.ok(at(r,'300 W').quantity!.conditions.some(c=>c.axis==='inlet_air_state'),'the wattage is at the same rating point');
 assert.equal(at(r,'30°C').recordRole,'condition');assert.equal(at(r,'80% RH').quantity!.kind.id,'relative_humidity');
});
test('WD P1 counterexamples: an operating range and a value with a metric of its own are not test conditions', ()=>{
 const r=read('<h2>Acme DH20</h2><p>It extracts 20 litres per day and works from 5°C to 35°C.</p><p>Its tank capacity is 3 litres and it extracts 12 litres per day.</p>');
 assert.ok(!at(r,'20 litres per day').quantity!.conditions.some(c=>c.from==='record'),'"from 5°C" is a bound, not a set point');
 assert.equal(at(r,'3 litres').recordRole,null);assert.ok(!at(r,'12 litres per day').quantity!.conditions.some(c=>c.from==='record'));
});
test('WD P1 in a table: each row of a property-column grid is one record; different rating points do not compare', ()=>{
 const h=page('<h1>Acme DH20</h1><table><tr><th>Room conditions</th><th>Humidity</th><th>Maximum water extraction</th><th>Wattage</th></tr><tr><td>10°C</td><td>60%RH</td><td>1.6 litres</td><td>138 watts</td></tr><tr><td>30°C</td><td>80%RH</td><td>7.6 litres</td><td>175 watts</td></tr></table>');
 const o=interpretWithKnowledge1G(h,qk).tables.flatMap(t=>t.observations);const w=o.filter(x=>x.quantity?.kind.id==='power');
 assert.equal(w.length,2,'the grid was read: '+o.map(x=>x.surface).join(', '));
 assert.ok(w.every(x=>x.quantity!.conditions.some(c=>c.axis==='inlet_air_state'&&c.from==='record')));
 assert.equal(compareQuantities(qk,w[0].quantity!,w[1].quantity!).verdict,'not_comparable','different rating points');
});
test('WD knowledge: a percentage is relative humidity only when its words say so (specialisation, no new ambiguity)', ()=>{
 const t=(s:string)=>{const f=findQuantities(qk,s)[0];return typeQuantity(qk,f,{labels:[s]}).kind.id;};
 assert.equal(t('60% humidity'),'relative_humidity');assert.equal(t('60 %RH'),'relative_humidity');assert.equal(t('60% efficiency'),'ratio');assert.equal(t('60%'),'ratio');
});
test('WD windows: words between two values are split at a clause boundary; coordinated values share their words', ()=>{
 const s='a 2.2 litre water tank, with the ability to extract up to 12 litres a day';const f=findQuantities(qk,s);
 assert.match(windows(s,f,0).right,/water tank/);assert.doesNotMatch(windows(s,f,1).left,/water tank/);
 const s2='humidity fell from 61% to 47%';const f2=findQuantities(qk,s2);assert.match(windows(s2,f2,1).left,/humidity/);
});
test('WD embedded data: JSON-LD properties, Next.js data and flight payloads are read; an embedded copy of visible text is not read twice', ()=>{
 const ld=`<script type="application/ld+json">{"@type":"Product","name":"Acme DH20","additionalProperty":[{"@type":"PropertyValue","name":"Noise level","value":"39","unitText":"dB(A) re 1 pW"}],"review":{"@type":"Review","reviewBody":"In our tests the Acme DH20 extracted 12 litres per day."}}</script>`;
 const nd=`<script id="__NEXT_DATA__" type="application/json">{"props":{"specs":[{"label":"Weight","value":"11.5","unit":"kg"}]}}</script>`;
 const fl=`<script>self.__next_f.push([1,${JSON.stringify('3:{"features":[{"name":"Capacity","value":"13 place settings"}],"x":{"name":"Height","value":"81.5 cm"}}\n')}])</script>`;
 const r=readDocumentEvidence(`<html><head>${ld}</head><body><main><h1>Acme DH20</h1><p>In our tests the Acme DH20 extracted 12 litres per day.</p></main>${nd}${fl}</body></html>`,qk);
 assert.equal(at(r,'39 dB(A) re 1 pW').quantity!.kind.id,'sound_power_level');assert.equal(at(r,'39 dB(A) re 1 pW').product,'Acme DH20');
 assert.equal(at(r,'11.5 kg').quantity!.kind.id,'mass');assert.equal(at(r,'81.5 cm').quantity!.kind.id,'length');
 assert.equal(r.quantities.filter(q=>q.surface==='12 litres per day').length,1,'the review body repeats the visible sentence');
});
test('WD R-1: boilerplate is read and marked, never dropped; a wrapper class on the body does not make the page boilerplate', ()=>{
 const h=`<html><body class="has-sidebar nav-open"><main><h1>Acme DH20</h1><p>It weighs 11 kg and holds 3 litres.</p></main><footer><p>Free delivery within 3 days.</p></footer></body></html>`;
 const r=readDocumentEvidence(h,qk);assert.equal(r.quantities.find(q=>q.surface==='11 kg')!.product,'Acme DH20');
 const f=r.quantities.find(q=>q.surface==='3 days');assert.ok(f,'the footer value is still read');assert.equal(f!.product,null);
});
test('WD qualitative: a judgement is recorded as codes with its product, conditions and basis; negation flips; no product, no observation', ()=>{
 const r=read('<h1>Acme Fan X200 review</h1><p>We noticed an annoying vibration at the highest speed.</p><p>The Acme Fan X200 is not noisy in sleep mode.</p>');
 const v=r.qualitative.find(o=>o.aspect==='vibration')!;assert.ok(v,'vibration observed');assert.equal(v.polarity,'negative');assert.deepEqual(v.conditions,[{axis:'fan_setting',value:'top'}]);
 assert.equal(v.basis,'tested_experience');assert.equal(v.product,'Acme Fan X200');assert.equal(v.rankingInput,false);
 const n=r.qualitative.find(o=>o.aspect==='noise')!;assert.equal(n.polarity,'positive','"not noisy"');assert.deepEqual(n.conditions,[{axis:'fan_setting',value:'sleep'}],'a named setting is its own value (QE: sleep is not "lowest")');
 const g=readDocumentEvidence(page('<p>Fans can be great and quiet in summer.</p>'),qk);assert.equal(g.qualitative.length,0,'a judgement about no identifiable product is not product evidence');
});
test('WD headings: an ordinal and a tagline are removed; a heading names a product only with a model token or a known name', ()=>{
 assert.equal(headingProduct('3. Dreame X50 Ultra – best for pets'),'Dreame X50 Ultra');assert.equal(headingProduct('Key Features'),null);assert.equal(headingProduct('Best overall'),null);
 assert.equal(headingProduct('Roborock Qrevo Curv',['Roborock Qrevo Curv']),'Roborock Qrevo Curv');
});

// QE (2026-10-18): structured qualitative evidence. Synthetic pages only.
import {readQualitativeNeed,relevantObservations} from '../src/qualitative_needs.js';
const qe=(body:string,st:string|null='independent_review')=>readDocumentEvidence(page(body),qk,{sourceType:st}).qualitativeEvidence;
test('QE: an observation is told apart from a judgement; conditions by kind; the test is the activity', ()=>{
 const e=qe('<h1>Acme Fan X200 review</h1><h2>How we test</h2><p>In our noise test the Acme Fan X200 produced a high-pitched whine at the highest speed.</p><p>The Acme Fan X200 looks great.</p>');
 const w=e.find(x=>x.property.phenomenon==='tonal_noise')!;assert.ok(w,'the whine is observed');
 assert.equal(w.statementType,'observation');assert.equal(w.evidenceType,'observed_in_test');assert.equal(w.property.facet,'tonal_character');
 assert.ok(w.conditions.some(c=>c.kind==='setting'&&c.value==='top'));assert.ok(w.conditions.some(c=>c.kind==='test_procedure'));assert.ok(w.provenance.activity);
 const j=e.find(x=>x.property.aspect==='design_aesthetics');assert.equal(j?.statementType,'judgement');
});
test('QE: evidence types: a maker claim, a report of others and an inference are not test observations', ()=>{
 const e=qe('<h1>Acme Fan X200 review</h1><p>The brand says the Acme Fan X200 is whisper-quiet.</p><p>Some users report that the Acme Fan X200 is noisy.</p><p>Its quiet fan means it should suit a bedroom.</p>');
 const t=e.map(x=>x.evidenceType);assert.ok(t.includes('manufacturer_claim'));assert.ok(t.includes('reported_by_others'));assert.ok(t.includes('inference'));
 assert.ok(e.every(x=>x.evidenceType!=='observed_in_test'));
 assert.equal(e.find(x=>x.evidenceType==='inference')!.useContext,'night_bedroom');
});
test('QE: a cause is documented only when the statement rests on a test or a number; a comparison names the other product', ()=>{
 const e=qe('<h1>Acme AF5 review</h1><h2>Acme AF5</h2><p>In our tests the chips came out crispy because the fan is powerful.</p><p>The chips were probably soggy due to the small basket.</p><p>It makes crispier chips than the Brandx Z9 Pro.</p>');
 const d=e.find(x=>x.cause&&!x.hedged)!;assert.equal(d.cause!.status,'documented');
 assert.equal(e.find(x=>x.hedged&&x.cause)!.cause!.status,'supposed');
 const c=e.find(x=>x.comparison)!;assert.match(c.comparison!.other!,/Brandx Z9/);assert.equal(c.comparison!.better,'this');
});
test('QE: the measurement on the same property is linked; a product name says nothing about the product', ()=>{
 const e=qe('<h1>Acme Compact C5 review</h1><p>The Acme Compact C5 is noisy, peaking at 62 dBA.</p>');
 const n=e.find(x=>x.property.aspect==='noise')!;assert.equal(n.relatedMeasurement?.surface,'62 dBA');
 assert.ok(!e.some(x=>x.property.aspect==='size_footprint'),'"Compact" in the name is not a size judgement');
});
test('QE facets (cross-category hypothesis): a need for an even result finds uneven observations in any category; "even though" is not one', ()=>{
 const fryer=qe('<h1>Acme AF5 review</h1><p>In our test the Acme AF5 browned the chips unevenly, with pale patches.</p>');
 const robot=qe('<h1>Acme R2 review</h1><p>During testing the Acme R2 left missed spots in the corners of the kitchen floor, a disappointing cleaning result.</p>');
 const need=readQualitativeNeed(qk,'I want something that cooks evenly');assert.deepEqual(need.facets,['spatial_uniformity']);
 assert.ok(relevantObservations(need,fryer).length>0&&relevantObservations(need,robot).length>0,'the same facet in two categories');
 const neg=qe('<h1>Acme AF5 review</h1><p>The Acme AF5 is great even though it is large.</p>');
 assert.equal(relevantObservations(need,neg).filter(r=>r.reasons.some(x=>x.includes('spatial'))).length,0);
 const night=readQualitativeNeed(qk,'quiet enough for a bedroom at night');assert.ok(night.aspects.includes('noise')&&night.useContexts.includes('night_bedroom'));
});
test('audit S77 (A1-16): a review that declares its own test covers its narrative values; a maker claim and a page without a test do not', ()=>{
 const body='<h1>Acme AF5 review</h1><h2>How we test</h2><p>We cook chips, wings and a cake in every air fryer.</p><h2>Performance</h2><p>The chips were crisp after 15 minutes at 200°C.</p><p>The maker claims it heats to 200°C in 3 minutes.</p>';
 const r=read(body,'','independent_original_test');
 assert.equal(at(r,'15 minutes').evidenceClass,'publisher_measured');
 assert.equal(at(r,'3 minutes').evidenceClass,'manufacturer_declared','a declaration cue keeps its own class');
 const plain=read('<h1>Acme AF5 review</h1><h2>Performance</h2><p>The chips were crisp after 15 minutes at 200°C.</p>','','independent_original_test');
 assert.equal(at(plain,'15 minutes').evidenceClass,'unknown','no declared test on the page: the narrative alone does not say who measured');
 assert.equal(at(read(body,'','retailer'),'15 minutes').evidenceClass,'manufacturer_declared','a retailer page is never a test');
});
