import test from 'node:test';import assert from 'node:assert/strict';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';

// S80: column headers that are settings of one product or property labels never become product identities.
// Found in the S80 first run (a fan-speed noise table and a filter table created products "SPEED 1".."SPEED 5" and
// "Minimum lifespan"). Synthetic pages (T1); the products-in-columns comparison still works.
const page=(table:string)=>`<html><head><title>Fictional Purifier P1 review</title></head><body><h1>Fictional Purifier P1 review</h1>${table}</body></html>`;
const products=(html:string)=>[...new Set(extractSpecifications245(html,'https://example.test/r').facts.map(f=>f.product?.ref==='named'?(f.product.name??'(unnamed)'):'(page product)'))];

test('S80 table identity: fan-speed columns are settings, not products',()=>{
 const html=page(`<table><tr><td></td><td>SPEED 1</td><td>SPEED 2</td><td>SPEED 3</td></tr>
  <tr><td>Noise level (from 3ft away)</td><td>35.2 dBA</td><td>37.2 dBA</td><td>41.5 dBA</td></tr>
  <tr><td>Power</td><td>2.4 watts</td><td>4.3 watts</td><td>7.1 watts</td></tr></table>`);
 assert.ok(!products(html).some(p=>/speed/i.test(p)),JSON.stringify(products(html)));
});
test('S80 table identity: named levels (Low, Sleep, Turbo) are settings too',()=>{
 const html=page(`<table><tr><td></td><td>Sleep</td><td>Low</td><td>Turbo</td></tr><tr><td>Noise</td><td>22 dB</td><td>30 dB</td><td>52 dB</td></tr></table>`);
 assert.ok(!products(html).some(p=>/^(sleep|low|turbo)$/i.test(p)));
});
test('S80 table identity: sentence-case property headers across the columns are not products',()=>{
 const html=page(`<table><tr><td></td><td>Price per 2-pack</td><td>Minimum lifespan</td><td>Estimated yearly cost</td></tr>
  <tr><td>HEPA filters</td><td>£57.99</td><td>8 months</td><td>£86.99</td></tr><tr><td>Carbon filters</td><td>£48.99</td><td>6 months</td><td>£97.98</td></tr></table>`);
 assert.ok(!products(html).some(p=>/lifespan|price|cost/i.test(p)),JSON.stringify(products(html)));
});
test('S80 table identity (control): a real comparison of named products across the columns is still read',()=>{
 const html=page(`<table><tr><td></td><td>Fictional Purifier P1</td><td>Imaginary Air AX200</td></tr>
  <tr><td>Weight</td><td>4.2 kg</td><td>7 kg</td></tr><tr><td>Noise</td><td>35 dB</td><td>41 dB</td></tr></table>`);
 const p=products(html);assert.ok(p.includes('Imaginary Air AX200'),JSON.stringify(p));
});
