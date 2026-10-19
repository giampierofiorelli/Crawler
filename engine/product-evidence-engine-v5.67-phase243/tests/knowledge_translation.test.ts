import test from 'node:test';
import assert from 'node:assert/strict';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {describeMeasurement} from '../src/knowledge_link.js';
import {translateDocument,parseTeachingDocument,distinctionQuestions,acquireConditionAxes,withAcquiredAxes,renderSelfCheck,loadTranslationCues} from '../src/knowledge_translation.js';

// R3 (owner S73): PEE's translator of teaching documents and its question-driven acquisition of condition axes.
// Synthetic text written for these tests (T1: wiring, not evidence about the owner documents).
const qk=loadQuantityKnowledge();
const concept=(id:string)=>({id,statement:'Measured as stated.',aliases:[]});
const DOC=['# Method','','## Energy','',
 'Empty-run energy does not by itself establish energy per cooked meal [R12].',
 '- Running cost is calculated from electricity use, filter replacements and consumables.',
 '- Measured power depends on the fan setting.',
 '','| Measure | Method | Limitation |','|---|---|---|','| Noise | sound level meter at 1 m | not comparable across rooms |',
 '','Proposed method: weigh the basket before and after cooking.',
 'The appliance drew 1450 W during the run.'].join('\n');

test('R3 translation: each statement keeps its quote, provenance, status and references, and renders back into a sentence', ()=>{
 const r=translateDocument(qk,DOC,{source:'doc'});
 const ns=r.statements.find(s=>s.type==='not_sufficient')!;
 assert.ok(ns,'a not_sufficient statement');assert.match(ns.rendered,/does not by itself establish/);
 assert.ok(ns.quote.startsWith('Empty-run energy'));assert.equal(ns.provenance.line,5);assert.deepEqual(ns.provenance.headings,['Method','Energy']);
 assert.deepEqual(ns.refs,['R12']);
 const comp=r.statements.find(s=>s.type==='composed_of')!;assert.ok(comp.parts.length>=3,'the parts of a compound quantity');
 assert.ok(r.statements.some(s=>s.type==='depends_on'));
 // a table row: the column header gives the role of the cell
 const lim=r.statements.find(s=>s.provenance.block==='table_row'&&s.type==='limitation');assert.ok(lim);assert.equal(lim!.provenance.header,'Limitation');
 // the document's own status marker is carried, never upgraded
 assert.ok(r.statements.some(s=>s.status.includes('proposed_method')));
 // a value with a unit the quantity knowledge reads
 assert.ok(r.statements.some(s=>s.type==='quantitative_finding'));
 // what is not recognised is counted, not hidden
 assert.equal(typeof r.unrecognised,'number');
});

test('R3 translation: a line range limits the reading to those lines (held-out sections stay unread)', ()=>{
 const blocks=parseTeachingDocument(DOC,[{start:1,end:5}]);
 assert.ok(blocks.every(b=>b.line<=5));
 const r=translateDocument(qk,DOC,{source:'doc',range:[{start:6,end:7}]});
 assert.ok(r.statements.length>0&&r.statements.every(s=>s.provenance.line>=6&&s.provenance.line<=7));
});

test('R3 translation: negation is preserved (metamorphic: removing "not" changes the statement type)', ()=>{
 const neg=translateDocument(qk,'Label energy does not establish real-use energy.',{source:'d'}).statements;
 const pos=translateDocument(qk,'Label energy establishes real-use energy.',{source:'d'}).statements;
 assert.ok(neg.some(s=>s.type==='not_sufficient'));assert.ok(!pos.some(s=>s.type==='not_sufficient'));
});

test('R3 acquisition: a question of the teaching is answered by a document structure; the axis is a reversible overlay', ()=>{
 const ds=['sustained_sdr_luminance','hdr_luminance_by_window'].map(id=>describeMeasurement(qk,concept(id)));
 const qs=distinctionQuestions(ds);
 assert.ok(qs.some(q=>q.wordsA.includes('sdr')&&q.wordsB.includes('hdr')),'the question: what distinguishes sdr from hdr');
 const docs=[{source:'tv',md:'Measure peak luminance in each SDR/HDR mode after warm-up.'}];
 const ps=acquireConditionAxes(qk,docs,qs);
 assert.equal(ps.length,1);assert.deepEqual(Object.keys(ps[0].values).sort(),['hdr','sdr']);
 assert.equal(ps[0].evidence[0].structure,'slash');assert.equal(ps[0].evidence[0].line,1);
 const qk2=withAcquiredAxes(qk,ps,p=>loadQuantityKnowledge(p));
 assert.ok(qk2.axes.has(ps[0].axis));assert.ok(!qk.axes.has(ps[0].axis),'the base knowledge is unchanged');
 // with the axis, the measurements fix its values: the distinction is now typed
 const d2=describeMeasurement(qk2,concept('sustained_sdr_luminance'));
 assert.ok(d2.fixed.some(f=>f.axis===ps[0].axis&&f.value==='sdr'));assert.ok(!d2.untyped.includes('sdr'));
 // no proposals: the knowledge is returned as it is
 assert.equal(withAcquiredAxes(qk,[],p=>loadQuantityKnowledge(p)),qk);
});

test('R3 acquisition: no answer without a question, and a one-sided answer is refused', ()=>{
 const ds=['sustained_sdr_luminance','hdr_luminance_by_window'].map(id=>describeMeasurement(qk,concept(id)));
 const qs=distinctionQuestions(ds);
 // a structure whose values answer no question of the teaching
 assert.equal(acquireConditionAxes(qk,[{source:'d',md:'Use slow/fast mode for grinding.'}],qs).length,0);
 // an answer to one side only ("aged" against a measurement that names no filter state) would make PEE assume the other
 const one=['aged_filter_cadr','particle_cadr'].map(id=>describeMeasurement(qk,concept(id)));
 const q1=distinctionQuestions(one);
 assert.ok(q1.length>0);
 assert.equal(acquireConditionAxes(qk,[{source:'d',md:'Compare new versus aged filters.'}],q1).length,0);
 // the same contrast answers both sides when both measurements name a filter state (metamorphic)
 const two=['aged_filter_cadr','new_filter_cadr'].map(id=>describeMeasurement(qk,concept(id)));
 const ps=acquireConditionAxes(qk,[{source:'d',md:'Compare new versus aged filters.'}],distinctionQuestions(two));
 assert.equal(ps.length,1);assert.equal(ps[0].evidence[0].structure,'contrast');
});

test('R3 acquisition: an enumerated field states the values of one condition', ()=>{
 const two=['aged_filter_cadr','new_filter_cadr'].map(id=>describeMeasurement(qk,concept(id)));
 const ps=acquireConditionAxes(qk,[{source:'d',md:'- filter_condition: new | aged | replaced | unknown'}],distinctionQuestions(two));
 assert.equal(ps.length,1);assert.equal(ps[0].axis,'acq_filter_condition');
 assert.deepEqual(Object.keys(ps[0].values).sort(),['aged','new','replaced','unknown']);
});

test('R3 kt-cues.2 a negated or prohibited statement renders with its negation (held-out fidelity review)', ()=>{
 const tr=(t:string)=>translateDocument(qk,t,{source:'d'}).statements[0];
 const a=tr('A purifier cannot ventilate a room.');assert.equal(a.type,'limitation');assert.match(a.rendered,/cannot ventilate/);assert.deepEqual(a.selfCheck,[]);
 const b=tr('Fan speed is not airflow at the outlet.');assert.match(b.rendered,/is not airflow/);
 const c=tr('Do not reject a filter on its label alone.');assert.match(c.rendered,/^Limitation: Do not reject/);assert.ok(!c.rendered.includes('unspecified'));
 const m=tr('Weigh the basket before and after cooking.');assert.match(m.rendered,/^Method step: Weigh the basket/);
 // the kt-cues.1 rendering dropped the word and inverted the meaning; the self-check catches that kind of loss
 assert.deepEqual(renderSelfCheck('A purifier cannot ventilate a room.','Limitation: A purifier ventilate a room.'),['negation_lost']);
 assert.deepEqual(renderSelfCheck('No device is made good by its fan alone.','Limitation: device is made good by its fan alone.'),['negation_lost']);
 assert.equal(loadTranslationCues().cues.version,'kt-cues.2');
});

test('R3 kt-cues.2 questions and document metadata are not knowledge claims', ()=>{
 const st=translateDocument(qk,['Source file: MASTER-RESEARCH.md','Release: 1.2.0 (documentary consolidation)','What do you want to drink most often?','2) "Do you already own a grinder?" when that changes the parts',
  'Particle CADR: the clean air delivery rate for particles.'].join('\n\n'),{source:'d'}).statements;
 assert.equal(st.length,1);assert.equal(st[0].type,'definition');assert.match(st[0].quote,/^Particle CADR/);
});
