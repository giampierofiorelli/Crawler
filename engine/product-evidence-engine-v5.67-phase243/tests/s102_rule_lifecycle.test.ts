import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {compileRuleSet,evaluate,decide,type RuleSet} from '../src/knowledge_rules.js';
import {observationSemanticsRules} from '../src/observation_semantics.js';
import {readPage98,scientificContext98,SCIENTIFIC_READER98} from '../src/scientific_reading98.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {testLeadsFromHtml265} from '../src/phase265_test_measurements.js';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type ObservationInput246} from '../src/phase246_knowledge_store.js';
import {extractConstraints253,requestSemanticsRules} from '../src/phase253_request_constraints.js';
import type {WebSourcePolicy} from '../src/web_evidence_acquisition.js';

// S102 (owner review of S100, 2026-10-20): "Existing rules must be revisable, not historically authoritative"; "Changes to
// rules or scientific definitions must also account for stored interpretations that may require rederivation"; "Include
// interpretation of the user's original request"; "Do not abandon D31, especially the unresolved connection between
// table-introducing statements and table evidence". Every page and request text below is invented for the test.
const ROOT=new URL('../../',import.meta.url).pathname;
const sha=(s:string):string=>createHash('sha256').update(s).digest('hex');
const toy=(rules:RuleSet['programs'][0]['rules']):RuleSet=>({schema:'t',version:'t1',statement:'toy',
 vocabulary:[{name:'e',args:['o','k'],meaning:'evidence',role:'input'},{name:'claim',args:['o','f','v','t','s'],meaning:'claim',role:'derived'}],
 programs:[{id:'toy',statement:'toy',rules,decision:{predicate:'claim',scopes:['narrow','wide'],fields:{colour:['red','blue']},contested:[]}}]});
const R=(id:string,rule:string,extra:Record<string,unknown>={})=>({id,rule,statement:'rule '+id,source:'test',...extra});
const L=(state:string,extra:Record<string,unknown>={})=>({lifecycle:{state,since:'2026-10-20',reason:'test reason',evidence:['tests/s102_rule_lifecycle.test.ts'],...extra}});

// ---------------------------------------------------------------------------------------------------------------------
// Rule lifecycle
test('superseded and retired rules stay in the file but are never executed; under-review rules run', ()=>{
 const p=compileRuleSet(toy([R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',L('retired')),
  R('B','claim(O,colour,blue,explicit,narrow) :- e(O,b).',L('superseded',{supersededBy:'C'})),
  R('C','claim(O,colour,blue,explicit,narrow) :- e(O,c).'),
  R('D','claim(O,colour,red,explicit,wide) :- e(O,d).',L('under_review'))] as never)).get('toy')!;
 assert.deepEqual(p.rules.map(r=>r.id),['C','D']);
 assert.deepEqual(p.lifecycle.map(l=>l.state),['retired','superseded','active','under_review']);
 const v=(k:string)=>decide(evaluate(p,{e:[['o',k]]}))[0]?.value??null;
 assert.equal(v('a'),null,'a retired rule concludes nothing');assert.equal(v('b'),null,'a superseded rule concludes nothing');
 assert.equal(v('c'),'blue');assert.equal(v('d'),'red','an under-review rule still runs');});

test('lifecycle entries are checked: successor, evidence, date and reason, invariants, unknown states, duplicate ids', ()=>{
 const bad:[unknown[],RegExp][]=[
  [[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',L('superseded'))],/without a successor/],
  [[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',L('superseded',{supersededBy:'Z'}))],/does not exist/],
  [[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',L('superseded',{supersededBy:'B'})),R('B','claim(O,colour,red,explicit,narrow) :- e(O,b).',L('retired'))],/is itself retired/],
  [[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',{lifecycle:{state:'retired',since:'2026-10-20',reason:'x'}})],/without regression evidence/],
  [[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',{lifecycle:{state:'under_review',since:'',reason:''}})],/needs a date and a reason/],
  [[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',{...L('retired'),invariant:true})],/is an invariant/],
  [[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',L('deprecated'))],/unknown lifecycle state/],
  [[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).',L('retired')),R('A','claim(O,colour,blue,explicit,narrow) :- e(O,b).')],/duplicate rule A/]];
 for(const [rules,re] of bad)assert.throws(()=>compileRuleSet(toy(rules as never)),re);});

test('a retired rule no longer counts as a contradiction: retiring one side of a contest is a valid change', ()=>{
 const two=[R('A','claim(O,colour,red,explicit,narrow) :- e(O,a).'),R('B','claim(O,colour,blue,explicit,narrow) :- e(O,b).')];
 assert.throws(()=>compileRuleSet(toy(two as never)),/can contradict/);
 assert.doesNotThrow(()=>compileRuleSet(toy([two[0],{...two[1],...L('retired')}] as never)));});

test('the observation-semantics program keeps its retired rules with reason and evidence (history, not execution)', ()=>{
 const {program,version}=observationSemanticsRules();assert.match(version,/^os\.\d+$/);
 const retired=program.lifecycle.filter(l=>l.state==='retired');assert.ok(retired.some(l=>l.rule==='OS11')&&retired.some(l=>l.rule==='OS12'));
 for(const l of retired){assert.ok(l.lifecycle!.reason.length>20);for(const e of l.lifecycle!.evidence!)assert.ok(existsSync(ROOT+e),e);}
 assert.ok(!program.rules.some(r=>r.id==='OS11'||r.id==='OS12'));});

test('the contract gives every imperative rule, request decision and historical guard a class and a lifecycle with evidence', ()=>{
 const C=JSON.parse(readFileSync(ROOT+'docs/architecture/vertical-contract.json','utf8'));const IR=C.interpretationRules;
 const states=IR.lifecycle.states as string[];
 for(const e of IR.imperative){assert.ok(e.class&&(e.class.algorithmic||e.class.policy||e.class.invariant),e.id);assert.ok(states.includes(e.lifecycle.state),e.id);}
 for(const g of IR.historicalGuards){assert.ok(states.includes(g.state),g.id);assert.ok(g.reason&&g.origin&&g.file,g.id);
  if(g.state==='superseded'||g.state==='retired')assert.ok(g.evidence.length>0&&g.evidence.every((e:string)=>existsSync(ROOT+e)),g.id);
  if(g.state==='superseded')assert.ok(g.supersededBy,g.id);}
 for(const e of IR.requestPath.imperative){assert.ok(e.class,e.id);assert.ok(states.includes(e.lifecycle.state),e.id);for(const t of e.tests)assert.ok(existsSync(ROOT+t),e.id+': '+t);
  if(/invariant/.test(e.class))assert.ok(e.tests.length>0,e.id+' is an invariant: it needs tests');}
 for(const p of IR.requestPath.programs){assert.ok(existsSync(ROOT+p.file));}});

// ---------------------------------------------------------------------------------------------------------------------
// Rederivation and the product link of leads (store)
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee102-'));let n=0;const db=()=>join(dir,`s${++n}.sqlite`);
const HOST='lab.example';const URL0='https://lab.example/review/acme-p1';const AT='2026-10-20T10:00:00.000Z';
const approved:WebSourcePolicy={sourceId:'pol_lab',host:HOST,basis:'written_permission',rightsDocumentId:'rights_lab',rightsDocumentUrl:'https://rights.pee-tests.org/lab',
 reviewedBy:'rights_reviewer',reviewedAt:'2026-10-01T00:00:00Z',validUntil:'2027-10-01T00:00:00Z',permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage'],
 robots:'allowed',robotsCheckedAt:'2026-10-20T06:00:00Z',websiteTerms:'reviewed_permitted',termsCheckedAt:'2026-10-10T00:00:00Z',commercialUseReviewed:true};
const HTML_PAGE=`<!doctype html><html><head><title>Acme P1 monitor review</title><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:'Acme P1',brand:{'@type':'Brand',name:'Acme'}})}</script></head>
<body><main><h1>Acme P1 monitor review</h1><h2>Specifications</h2><table><tr><th>Peak brightness</th><td>412 nits</td></tr></table>
<h2>Brightness</h2><p>In our tests the Acme P1 reached a peak brightness of 412 nits on a 10% window.</p><p>We measured an input lag of 9.8 ms.</p></main></body></html>`;
const LEAD_URL='https://lab.pee102-test.test/r/kt5';
// a page with a Phase265 test lead (an identified product, a method section and a measured value)
const LEAD_PAGE=`<html><head><title>Fixture</title><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:'Kettle Co KT5 Kettle',brand:'Kettle Co',model:'KT5',mpn:'KT5'})}</script></head><body><article><h2>How we tested</h2><p>We tested the KT5 for a week.</p><p>We measured the noise of the KT5 as 61 dB under 20 °C using a sound meter.</p></article></body></html>`;
const observation=(mut?:(o:ObservationInput246)=>void,html:string=HTML_PAGE,url:string=URL0):ObservationInput246=>{const x=extractSpecifications245(html,url);const host=new URL(url).host;
 const leads=html===HTML_PAGE?testLeadsFromHtml265(html,url,sha(html),x,{category:'monitors'}):testLeadsFromHtml265(html,url,sha(html),x);
 const o:ObservationInput246={source:{sourceId:'src_'+host.replace(/\W/g,'_'),host,sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted',policy:{...approved,host}},url,sha256:sha(html),bytes:html.length,httpStatus:200,fetchedAt:AT,
  runId:'run_s102',extractorVersion:'phase245@s102test',extraction:x,categoryHypotheses:['monitors'],testLeads:leads,scientific98:readPage98(html,url,sha(html),x,leads,[],'monitors','independent_original_test')};
 mut?.(o);return o;};
const current=(s:KnowledgeStore246)=>s.db.prepare("SELECT reading_id,interpreter_version,definitions_identity,subject_table,product_id,statement_role FROM scientific_readings98 WHERE state='current'").all() as Record<string,string|null>[];

test('the interpreter identity names the reader, its rule program and the document reader', ()=>{
 const id=scientificContext98().identity;assert.ok(id.reader.startsWith(SCIENTIFIC_READER98+'+'+observationSemanticsRules().version+'+'));});

test('the same bytes are re-derived when the definitions change, and only then', ()=>{
 const s=new KnowledgeStore246(db(),{...DEFAULT_STORAGE_POLICY246,scientificReadings98:true});
 s.ingestObservation246(observation());const first=current(s);assert.ok(first.length>0);
 s.ingestObservation246(observation());assert.deepEqual(current(s).map(r=>r.reading_id).sort(),first.map(r=>r.reading_id).sort(),'same bytes, same knowledge: nothing re-derived');
 s.ingestObservation246(observation(o=>{o.scientific98={...o.scientific98!,interpreter:{...o.scientific98!.interpreter,definitions:'pd.test-changed'}};}));
 const after=current(s);assert.ok(after.length>0&&after.every(r=>r.definitions_identity==='pd.test-changed'),'readings under the new definitions are current');
 const superseded=s.db.prepare("SELECT COUNT(*) AS n FROM scientific_readings98 WHERE state='superseded_by_interpreter'").get() as {n:number};
 assert.ok(superseded.n>=first.length,'the old readings are superseded, not deleted');s.close();});

test('a lead whose reading has no product subject is stored without a product link (IR7)', ()=>{
 const s=new KnowledgeStore246(db(),{...DEFAULT_STORAGE_POLICY246,scientificReadings98:true});
 const o=observation(o=>{for(const l of o.scientific98!.leads)l.reading.subject={value:'none',name:null,basis:'statement_role:threshold'};},LEAD_PAGE,LEAD_URL);
 const control=new KnowledgeStore246(db(),{...DEFAULT_STORAGE_POLICY246,scientificReadings98:true});control.ingestObservation246(observation(undefined,LEAD_PAGE,LEAD_URL));
 assert.ok(current(control).some(r=>r.subject_table==='test_measurements265'&&r.product_id),'control: the same lead with a product subject is linked');control.close();
 assert.ok(o.scientific98!.leads.length>0,'the fixture has test leads');s.ingestObservation246(o);
 const leads=current(s).filter(r=>r.subject_table==='test_measurements265');assert.ok(leads.length>0);
 for(const r of leads)assert.equal(r.product_id,null,'no product for a value that is not a product value');s.close();});

// ---------------------------------------------------------------------------------------------------------------------
// The user request: requirement states under the shared decision policy (never product facts)
const C=(t:string)=>extractConstraints253(t).constraints.map(c=>`${c.criterion}=${c.value}:${c.status}`);
test('request: an agreed bound stays a stated requirement; two different limits for one criterion are asked, never applied', ()=>{
 assert.deepEqual(C('A kettle of at least 1.5 litres'),['capacity_min=1.5:stated_in_request']);
 assert.deepEqual(C('An air fryer of at least 4 litres, or at least 6 litres for a family'),['capacity_min=4:candidate','capacity_min=6:candidate'],'the last limit no longer wins silently');
 assert.deepEqual(C('A kettle of at least 1.5 litres and a toaster of at least 1.5 litres'),['capacity_min=1.5:stated_in_request','capacity_min=1.5:stated_in_request'],'the same limit twice is not a conflict');
 assert.deepEqual(C('A 2000-2400W kettle'),['power_min=2000:candidate'],'a bare range presumes a bound: asked, never applied');
 assert.deepEqual(C('a dehumidifier between 3 and 5 litres'),['capacity_min=3:stated_in_request'],'"between" states the range');
 assert.deepEqual(C('I do not need at least 5 litres'),['capacity_min=5:candidate'],'a negated requirement is never stated');
 assert.deepEqual(C('something nice for the kitchen'),[],'an unknown request states no requirement');});

test('request: two readers that disagree about a bound leave the requirement undecided (conflict, abstention)', ()=>{
 const p=requestSemanticsRules().program;const d=(r:string[][])=>decide(evaluate(p,{reading:r})).find(x=>x.field==='bound')!;
 assert.equal(d([['q','local','min'],['q','shared','min']]).value,'min');
 const c=d([['q','local','min'],['q','shared','max']]);assert.equal(c.value,null);assert.deepEqual(c.conflict!.values,['max','min']);
 assert.equal(d([['q','shared','max']]).value,'max','the shared reading alone decides');
 const pres=decide(evaluate(p,{range_inferred:[['q','min']]})).find(x=>x.field==='bound')!;assert.equal(pres.value,null);assert.equal(pres.presumption,'min');
 assert.equal(decide(evaluate(p,{reading:[['q','local','min']],space:[['q']]})).find(x=>x.field==='bound')!.value,'min','an explicit bound outranks the space convention');});

test('request: the request program concludes requirement states only, never product facts', ()=>{
 const raw=JSON.parse(readFileSync(ROOT+'resources/request-semantics/request-semantics.v1.json','utf8'));
 const heads=raw.programs[0].rules.map((r:{rule:string})=>r.rule.split(':-')[0]);
 for(const h of heads)assert.match(h,/^\s*(?:claim\(C,bound,|limit_conflict\()/,'only bounds and limit conflicts: '+h);
 assert.ok(raw.programs[0].rules.find((r:{id:string;invariant?:boolean})=>r.id==='RQ08')?.invariant,'conflicting limits are an invariant');});

// ---------------------------------------------------------------------------------------------------------------------
// Introducing statements (D31/TCX) and lead-in clauses
const page=(intro:string)=>`<!doctype html><html><head><title>Acme R1 review</title></head><body><main><h1>Acme R1 review</h1><h2>Noise</h2><p>Some words about the design.</p>${intro}<table><tr><th>Setting</th><th>Noise</th></tr><tr><td>Low</td><td>38 dB</td></tr><tr><td>High</td><td>61 dB</td></tr></table></main></body></html>`;
const roles=(h:string)=>readPage98(h,'https://lab.example/r1',sha(h),extractSpecifications245(h,'https://lab.example/r1'),null,[],'air_purifiers','independent_original_test').declarations.map(d=>d.reading.statement.role);
test('the statement that introduces a table is evidence about its rows, whatever words it uses', ()=>{
 assert.deepEqual(roles(page('<p>We measured the noise at one metre in our lab:</p>')),['result','result']);
 assert.deepEqual(roles(page('<p>The manufacturer lists these noise figures:</p>')),['specification','specification']);
 assert.deepEqual(roles(page('<p>Shipping was quick and the box was well padded.</p>')),['unresolved','unresolved'],'an unrelated introduction decides nothing');
 assert.deepEqual(roles(page('')),['unresolved','unresolved']);});

test('a clause before a colon introduces the value; a closed parenthetical is an aside, not a boundary', ()=>{
 const h=`<!doctype html><html><body><main><h1>Acme R1 review</h1><p>When measuring its noise level (from a distance of 1 m): around 60 dB in max mode.</p></main></body></html>`;
 const s=readPage98(h,'https://lab.example/r1',sha(h),extractSpecifications245(h,'https://lab.example/r1'),null,[],'robot_floor_cleaners','independent_original_test');
 assert.equal(s.document.find(d=>d.value===60)?.reading.statement.role,'result');});

test('a specification heading written as "Spec:" or "Data sheet <product>" is recognised (vocabulary, not a page rule)', ()=>{
 for(const h2 of ['Spec:','Data sheet Acme R1']){const h=`<!doctype html><html><body><main><h1>Acme R1 review</h1><h2>${h2}</h2><ul><li>Bin capacity: 0.6 l</li></ul></main></body></html>`;
  const s=readPage98(h,'https://lab.example/r1',sha(h),extractSpecifications245(h,'https://lab.example/r1'),null,[],'robot_floor_cleaners','independent_original_test');
  assert.ok([...s.declarations,...s.document].some(d=>d.reading.statement.role==='specification'),h2);}});
