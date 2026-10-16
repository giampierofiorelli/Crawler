import test from 'node:test';import assert from 'node:assert/strict';
import {buildPublicationIndex,scanAddedLines,addedLinesFromDiff,privateArtifactFindings} from '../src/publication_guard.js';

// Principle 9 fitness check. Every product and value here is FICTIONAL; the store rows stand in for retained
// declarations. The guard must catch a retained value bound to its product and pass ordinary public information.
const idx=buildPublicationIndex([
 {productId:'prd_zephyr',productName:'Zephyrline Brewmaster 9 Espresso Machine',rawValue:'1.8 L'},
 {productId:'prd_zephyr',productName:'Zephyrline Brewmaster 9 Espresso Machine',rawValue:'449.95 GBP'},
 {productId:'prd_zephyr',productName:'Zephyrline Brewmaster 9 Espresso Machine',rawValue:'1350 W'},
 {productId:'prd_generic',productName:'Espresso Coffee Machine',rawValue:'1.3L'},
 {productId:'prd_named',productName:'Kettlo 2 Litre Kettle',rawValue:'2200W'},
 {productId:'prd_fryer',productName:'Glimmerfry Duo 5 Air Fryer',rawValue:'0.837 kwh'},
]);
const scan=(...texts:string[])=>scanAddedLines(texts.map((text,i)=>({file:'evaluation/x/gold.json',line:10+i,text,commit:'c0ffee1'})),idx);

test('a retained value bound to its product is caught (unit, currency, two-decimal price, generic exact name, nearby line)',()=>{
 assert.equal(scan('"include Zephyrline Brewmaster (price 449.95)",').length,1);
 assert.equal(scan('"Zephyrline Brewmaster 9 has a 1.8 L tank"').length,1);
 assert.equal(scan('"Zephyrline Brewmaster 9","Power = 1350 W"').length,1);
 assert.equal(scan('"Espresso Coffee Machine (1.3 L)",').length,1,'a name made only of generic words is matched exactly');
 assert.equal(scan('{"product":"Zephyrline Brewmaster 9",','  "tank":"1.8L"}').length,1,'within the nearby-line window');
 assert.equal(scan('"Glimmerfry Duo 5 used 0.837kWh in an hour"').length,1,'a retained test measurement (Phase268) is private too');
 const f=scan('"include Zephyrline Brewmaster (price 449.95)",')[0];
 assert.deepEqual([f.productId,f.rule,f.line],['prd_zephyr','product_bound_declared_value',10]);
 assert.ok(!JSON.stringify(f).includes('449.95'),'the finding never repeats the value');
});

test('ordinary public information passes: names, unbound values, user limits, values in the name itself, URLs, other products',()=>{
 for(const t of ['"Zephyrline Brewmaster 9 Espresso Machine is listed"','"a water tank of at least 1.8 litres"','"budget under £449.95"',
  '"Kettlo 2 Litre Kettle, 2 L"','"https://shop.example/zephyrline-brewmaster-9-1-8-l-449-95"','"Zephyrline Brewmaster 9: 2200W"',
  '"Zephyrline Brewmaster 9 (version 9.14, 25 tests, 2026)"','"Zephyrline Brewmaster 9 (price 449.95)" // pee-publication: allow'])
  assert.deepEqual(scan(t),[],t);
 assert.deepEqual(scan('"Zephyrline Brewmaster 9"','','','','','"tank 1.8 L"'),[],'beyond the window');
});

test('commit diffs are read as added lines per commit and file; private artefacts are refused by path',()=>{
 const diff=['commit 1111111','diff --git a/evaluation/x/gold.json b/evaluation/x/gold.json','+++ b/evaluation/x/gold.json','@@ -0,0 +5,2 @@',
  '+"Zephyrline Brewmaster 9 (1.8 L)"','+ok','commit 2222222','+++ b/evaluation/private-eval/run-full.json','@@ -1 +1 @@','+{}'].join('\n');
 const {lines,files}=addedLinesFromDiff(diff);
 assert.deepEqual(lines.map(l=>[l.commit,l.file,l.line]),[['1111111','evaluation/x/gold.json',5],['1111111','evaluation/x/gold.json',6],['2222222','evaluation/private-eval/run-full.json',1]]);
 assert.equal(scanAddedLines(lines,idx).length,1);
 assert.deepEqual(privateArtifactFindings(files).map(f=>f.file),['evaluation/private-eval/run-full.json']);
 assert.deepEqual(privateArtifactFindings([{file:'snapshot/pee246.sqlite'},{file:'docs/report.md'}]).map(f=>f.file),['snapshot/pee246.sqlite']);
});
