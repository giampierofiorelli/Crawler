import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseAttributableSbafHd600Excerpt} from '../src/open_headphone_measurements.js';
const raw=readFileSync(new URL('../../fixtures/phase69_open_measures/sbaf_hd600_first_twenty_points.txt',import.meta.url),'utf8');
test('real attributed open-licensed measurement excerpt has no ranking route',()=>{
 const r=parseAttributableSbafHd600Excerpt(raw);
 assert.equal(r.points.length,20);assert.equal(r.points[0].frequencyHz,20);
 assert.equal(r.points[0].responseDb,-8.94);assert.equal(r.points.at(-1)!.frequencyHz,24.16);
 assert.equal(r.suitableForVerdict,false);assert.equal(r.coverage,'partial_excerpt_not_complete_curve');
 assert.ok(r.sourceUrl.includes('cEAR30-Sennheiser-HD600-L.txt'));
});
test('unrecognized values and disorder fail closed',()=>{
 assert.throws(()=>parseAttributableSbafHd600Excerpt(raw.replace('20.20 -08.83','20.00 -08.83')));
 assert.throws(()=>parseAttributableSbafHd600Excerpt(raw.replace('20.20 -08.83','20.20 -999')));
 assert.throws(()=>parseAttributableSbafHd600Excerpt(raw.replace('20.20 -08.83','20.20 evil')));
});
