import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';
import {compileRuleSet,evaluate,decide,claimRules,TIERS,type RuleSet} from '../src/knowledge_rules.js';
import {observationSemanticsRules,observationClaimRules,decideSemantics,CUE_READERS,clauseCues,clauseOf,calculationEvidenceCues,tableCellCues,headerProvenanceCues,documentCues,type Cue} from '../src/observation_semantics.js';
import {readPage98,scientificContext98} from '../src/scientific_reading98.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {testLeadsFromHtml265} from '../src/phase265_test_measurements.js';
import {compareReadings98} from '../src/scientific_evidence98.js';
import {findQuantities} from '../src/quantity_knowledge.js';

// S100 (owner review of S99, 2026-10-20): "Add automated tests covering overlapping rules, conflicts, exception scope,
// inheritance and scientific invariants. Use property-based or metamorphic tests where appropriate." and "Ensure later
// changes cannot silently introduce contradictory rules or bypass the operational scientific interpreter."
// Every page text below is invented for the test.
const ROOT=new URL('../../',import.meta.url).pathname;
const RULES=JSON.parse(readFileSync(ROOT+'resources/scientific-reading/observation-semantics.v1.json','utf8')) as RuleSet&{cueKinds:string[]};
const clone=()=>JSON.parse(JSON.stringify(RULES)) as RuleSet&{cueKinds:string[]};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');

// ---------------------------------------------------------------------------------------------------------------------
// Governance at load time
test('the observation-semantics program loads and every claim rule states field, value, tier and a declared scope', ()=>{
 const {program,version}=observationSemanticsRules();assert.match(version,/^os\.\d+$/);
 const rs=observationClaimRules();assert.ok(rs.length>=80);
 const d=program.decision!;for(const r of rs){assert.ok((TIERS as readonly string[]).includes(r.tier),r.rule);assert.ok(d.fields[r.field].includes(r.value),r.rule);assert.ok(r.scope&&d.scopes.includes(r.scope),r.rule);assert.ok(r.statement.length>10,r.rule);}});

// S103: the program now requires an admission record for every new rule; these tests give one so that they still test
// what they were written for (contradiction, vocabulary, duplicates)
const ADM={meaning:'test rule',scope:'test',prerequisites:['test'],exceptions:['test'],counterexamples:[{case:'test',expected:'test',test:'test'}],
 provenance:{origin:'convention' as const,ref:'test'},consumers:['test'],classification:{class:'policy' as const,justification:'test rule'},evidence:['test'],admitted:'2026-10-20'};
test('a new rule that silently contradicts existing ones fails to load', ()=>{
 const rs=clone();rs.programs[0].rules.push({admission:ADM,id:'BAD1',rule:'claim(O,role,norm,inherited,source) :- cue(O,source_maker,source).',statement:'a maker page states norms',source:'test'});
 assert.throws(()=>compileRuleSet(rs),/can contradict at tier inherited/);});

test('a rule outside the declared vocabulary of the decision fails to load (field, value, scope, tier)', ()=>{
 for(const [rule,re] of [['claim(O,role,opinion,explicit,clause) :- cue(O,episodic,clause).',/not admissible/],['claim(O,colour,red,explicit,clause) :- cue(O,episodic,clause).',/undeclared field/],
  ['claim(O,role,result,explicit,paragraph) :- cue(O,episodic,clause).',/undeclared scope/],['claim(O,role,result,strong,clause) :- cue(O,episodic,clause).',/unknown tier/],
  ['claim(O,role,R,explicit,clause) :- cue(O,R,clause).',/constant field, value and tier/]] as const){
  const rs=clone();rs.programs[0].rules.push({admission:ADM,id:'BAD2',rule,statement:'test rule',source:'test'});assert.throws(()=>compileRuleSet(rs),re,rule);}});

test('duplicate rules are rejected', ()=>{
 const rs=clone();const r0=rs.programs[0].rules[2];rs.programs[0].rules.push({...r0,id:'DUP',admission:ADM});assert.throws(()=>compileRuleSet(rs),/duplicates/);});

test('every cue kind is declared, produced by a registered reader, and used by a rule', ()=>{
 const declared=new Set(RULES.cueKinds);const produced=new Set(CUE_READERS.flatMap(r=>r.kinds));
 // S102: superseded and retired rules are history, not execution
 const used=new Set(RULES.programs[0].rules.filter(r=>!['superseded','retired'].includes(r.lifecycle?.state??'active')).flatMap(r=>[...r.rule.matchAll(/cue\(O,([a-z_]+),/g)].map(m=>m[1])));
 for(const k of declared)assert.ok(produced.has(k),`cue ${k} is declared but no registered reader produces it`);
 for(const k of produced)assert.ok(declared.has(k),`reader cue ${k} is not declared`);
 for(const k of used)assert.ok(declared.has(k),`rule uses undeclared cue ${k}`);
 for(const k of declared)assert.ok(used.has(k),`cue ${k} is read but no rule uses it`);
 assert.throws(()=>decideSemantics([{kind:'invented_cue',scope:'clause',why:'x'}]),/undeclared cue kind/);});

test('the reader does not bypass the shared interpreter: no role, nature or provenance is assigned outside the decision', ()=>{
 const src=readFileSync(ROOT+'src/scientific_reading98.ts','utf8');
 // the qualitative reader (a judgement, never a quantity) and type declarations are the only places allowed to name values
 const body=src.replace(/export function readQualitative98[\s\S]*?\n}\n/,'');
 // a literal followed by '|' is a type union, not an assignment
 const meaning=/\b(?:role|nature|provenance)\s*[:=]\s*'(?:result|specification|threshold|norm|target|condition|measured|declared|calculated|publisher|manufacturer|third_party)'(?!\s*\|)/g;
 assert.deepEqual([...body.matchAll(meaning)].map(m=>m[0]),[],'meaning literals outside the decision');
 assert.ok((src.match(/decideSemantics\(/g)??[]).length>=3,'all three quantity readers call the shared decision');
 for(const gone of ['statementRole99','NATURE_OF'])assert.ok(!src.includes(gone),gone+' (pre-S100 imperative decision) is gone');});

test('the contract registers the policy, the declarative program and every remaining imperative rule with tests; residual conflicts are debt', ()=>{
 const C=JSON.parse(readFileSync(ROOT+'docs/architecture/vertical-contract.json','utf8'));const IR=C.interpretationRules;
 assert.equal(IR.policy.module,'src/knowledge_rules.ts');assert.ok(existsSync(ROOT+IR.policy.module));
 for(const p of IR.programs){assert.ok(existsSync(ROOT+p.file),p.file);assert.equal(JSON.parse(readFileSync(ROOT+p.file,'utf8')).version,p.version,'registered version matches the file');for(const t of p.tests)assert.ok(existsSync(ROOT+t),t);}
 const ids=new Set<string>();
 for(const r of IR.imperative){assert.ok(!ids.has(r.id));ids.add(r.id);for(const k of ['file','function','decides','scope','tier'])assert.ok(r[k],`${r.id} names ${k}`);
  assert.ok((TIERS as readonly string[]).includes(r.tier),r.id);assert.ok(existsSync(ROOT+r.file),r.file);
  assert.ok(new RegExp('function '+r.function+'\\b|\\b'+r.function+'\\(').test(readFileSync(ROOT+r.file,'utf8')),`${r.id}: ${r.function} exists in ${r.file}`);
  assert.ok(r.tests.length>0);for(const t of r.tests)assert.ok(existsSync(ROOT+t),`${r.id}: ${t}`);}
 const d31=C.openDebt.find((d:{id:string})=>d.id==='D31');assert.ok(d31,'rule-governance residuals are open debt');
 for(const c of d31.conflicts){assert.ok(c.consumers.length>0,c.id);assert.ok(c.verification.length>10,c.id);}});

// ---------------------------------------------------------------------------------------------------------------------
// The precedence policy: property-based tests on random cue sets (seeded)
const rng=(seed:number)=>()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const ALL:Cue[]=CUE_READERS.flatMap(r=>r.kinds.map(k=>({kind:k,scope:'',why:'random'})))
 .filter((c,i,a)=>a.findIndex(d=>d.kind===c.kind)===i).map(c=>({...c,scope:scopeOf(c.kind)}));
function scopeOf(kind:string):string{const m=RULES.programs[0].rules.map(r=>new RegExp('cue\\(O,'+kind+',([a-z]+)\\)').exec(r.rule)).find(Boolean);return m?m[1]:'value';}
const pick=(r:()=>number,n:number)=>{const out:Cue[]=[];while(out.length<n){const c=ALL[Math.floor(r()*ALL.length)];if(!out.includes(c))out.push(c);}return out;};
const tierOfCue=(c:Cue)=>{const ds=decideSemantics([c]).decisions;return ds.map(d=>d.tier??(d.presumption?'default':null)).find(Boolean)??null;};
const DEFAULTS=ALL.filter(c=>['page_tests_default','extractor_specification_row','extractor_test_lead'].includes(c.kind));
const INHERITED=ALL.filter(c=>tierOfCue(c)==='inherited');const EXPLICIT=ALL.filter(c=>tierOfCue(c)==='explicit');

test('property: defaults never decide; they are reported as presumptions', ()=>{
 const r=rng(7);for(let i=0;i<200;i++){const cs=DEFAULTS.filter(()=>r()<0.6);const s=decideSemantics(cs);
  assert.equal(s.role,'unresolved');assert.equal(s.nature,'unresolved');assert.equal(s.provenance,'unresolved');}
 const s=decideSemantics([DEFAULTS.find(c=>c.kind==='extractor_specification_row')!]);assert.equal(s.decisions.find(d=>d.field==='role')!.presumption,'specification');});

test('property: the decision does not depend on the order of the evidence', ()=>{
 const r=rng(11);for(let i=0;i<300;i++){const cs=pick(r,1+Math.floor(r()*5));const a=decideSemantics(cs),b=decideSemantics([...cs].reverse());
  assert.deepEqual([a.role,a.nature,a.provenance],[b.role,b.nature,b.provenance],cs.map(c=>c.kind).join(','));}});

test('property: adding context or defaults never overrides an explicit statement about the occurrence', ()=>{
 const r=rng(13);let n=0;
 for(let i=0;i<300;i++){const ex=EXPLICIT[Math.floor(r()*EXPLICIT.length)];const base=decideSemantics([ex]);if(base.role==='unresolved')continue;
  const ctx=[...INHERITED,...DEFAULTS].filter(()=>r()<0.4);const s=decideSemantics([ex,...ctx]);
  // every field the explicit statement decided keeps its value; context may only fill a field the clause leaves open
  for(const f of ['role','nature','provenance'] as const)if(base[f]!=='unresolved')assert.equal(s[f],base[f],`${f}: ${ex.kind} + ${ctx.map(c=>c.kind).join(',')}`);n++;}
 assert.ok(n>100);});

test('property: disagreement at the deciding tier and scope abstains and is reported; agreement decides', ()=>{
 const r=rng(17);let conflicts=0;
 for(let i=0;i<400;i++){const cs=pick(r,2);const s=decideSemantics(cs);
  for(const d of s.decisions){if(d.conflict){conflicts++;assert.equal(d.value,null);assert.ok(d.conflict.length>=2);assert.equal((s as unknown as Record<string,string>)[d.field],'unresolved');}
   if(d.value)assert.ok(d.by.length>0&&!d.conflict);}}
 assert.ok(conflicts>0,'random pairs do produce conflicts');
 const agree=decideSemantics([{kind:'measuring_verb',scope:'clause',why:''},{kind:'first_person_test',scope:'clause',why:''}]);assert.equal(agree.role,'result');assert.equal(agree.provenance,'publisher');});

test('inheritance: the narrowest inherited scope decides when nothing explicit is stated', ()=>{
 const s=decideSemantics([{kind:'section_test_term',scope:'section',why:''},{kind:'source_maker',scope:'source',why:''}]);
 assert.equal(s.role,'result');assert.equal(s.provenance,'publisher');assert.ok(s.decisions.find(d=>d.field==='role')!.scope==='section');
 const t=decideSemantics([{kind:'table_declaration_term',scope:'table',why:''},{kind:'section_test_term',scope:'section',why:''}]);
 assert.equal(t.role,'specification','a table caption is narrower than its section heading');});

test('exception scope: a condition setting yields to the value\'s own stated property (guarded rule)', ()=>{
 assert.equal(decideSemantics([{kind:'condition_setting',scope:'clause',why:''}]).role,'condition');
 const s=decideSemantics([{kind:'condition_setting',scope:'clause',why:''},{kind:'own_property_stated',scope:'value',why:''}]);
 assert.notEqual(s.role,'condition');
 const r=decideSemantics([{kind:'record_condition',scope:'row',why:''},{kind:'own_property_stated',scope:'value',why:''},{kind:'section_test_term',scope:'section',why:''}]);
 assert.equal(r.role,'result','the record rule does not apply; the section context decides');});

test('a cell outranks a header, a header outranks the table, but a clause and a cell at equal tier and different scopes: the narrowest decides', ()=>{
 assert.equal(decideSemantics([{kind:'cell_test_term',scope:'cell',why:''},{kind:'header_declaration_term',scope:'header',why:''}]).role,'result');
 assert.equal(decideSemantics([{kind:'header_test_term',scope:'header',why:''},{kind:'table_declaration_term',scope:'table',why:''}]).role,'result');
 assert.equal(decideSemantics([{kind:'value_threshold_reference',scope:'value',why:''},{kind:'measuring_verb',scope:'clause',why:''}]).role,'threshold');});

// ---------------------------------------------------------------------------------------------------------------------
// Scientific examples from the owner's review and S99's residual causes
const ctx=scientificContext98();
const role=(t:string,v:string,unit:string)=>{const a=t.indexOf(v);return decideSemantics(clauseCues(ctx.qk,ctx.defs,t,a,a+v.length,unit,{dim:'',propertyStated:false}));};
test('owner examples: "standard" as a norm, a mode or an adjective; a mark is a threshold', ()=>{
 assert.equal(role('It runs at 48 dB, four decibels above the 44 dB that is standard for quiet machines.','44 dB','dB').role,'norm');
 assert.equal(role('The 44 dB standard applies to dishwashers.','44 dB','dB').role,'norm');
 assert.notEqual(role('In standard mode it measured 56 dB.','56 dB','dB').role,'norm');
 assert.equal(role('In standard mode it measured 56 dB.','56 dB','dB').role,'result');
 assert.equal(role('At top speed it breaches the 80-decibel mark.','80','dB').role,'threshold');
 assert.equal(role('Anything under 45 dB is quiet enough for a bedroom.','45 dB','dB').role,'threshold');});

test('one sentence with a claim and a result: each value takes the role of its own clause, or abstains, never the sentence\'s', ()=>{
 const t='It exceeded the maker\'s claimed 40 minutes, but in our test it ran for 48 minutes.';
 const claim=role(t,'40 minutes','minutes'),result=role(t,'48 minutes','minutes');
 assert.notEqual(claim.role,'result');assert.equal(result.role,'result');assert.equal(result.provenance,'publisher');});

test('compound durations are one quantity: "29:30 mins" is 29.5 minutes, a clock time is not a quantity', ()=>{
 const q=findQuantities(ctx.qk,'Auto mode: 29:30 mins of cleaning.');const d=q.filter(x=>x.value!==null);assert.equal(d.length,1);assert.ok(Math.abs(d[0].value!-29.5)<1e-9);
 assert.equal(findQuantities(ctx.qk,'It starts at 19:30 each day.').filter(x=>x.value!==null).length,0);});

// ---------------------------------------------------------------------------------------------------------------------
// Metamorphic page tests: the extractor that found a value does not decide its meaning
const PAGE_URL='https://lab.example/review/acme-p2';
const page=(heading:string,extra='',header='Noise')=>`<!doctype html><html><head><title>Acme P2 purifier review</title></head><body><main><h1>Acme P2 purifier review</h1>
<h2>${heading}</h2><table><tr><th>Fan setting</th><th>${header}</th></tr><tr><td>Low</td><td>38 dB</td></tr><tr><td>High</td><td>61 dB</td></tr></table>${extra}
</main></body></html>`;
const read=(h:string)=>{const x=extractSpecifications245(h,PAGE_URL);const leads=testLeadsFromHtml265(h,PAGE_URL,sha(h),x,{category:'air_purifiers'});return readPage98(h,PAGE_URL,sha(h),x,leads,[],'air_purifiers','independent_original_test');};
const tableReadings=(h:string)=>{const s=read(h);return [...s.declarations.map(d=>d.reading),...s.leads.map(l=>l.reading)].filter(r=>r.source?.locator&&!/^block:/.test(r.source.locator)||r.source?.reader==='phase245');};
const signature=(h:string)=>tableReadings(h).map(r=>[r.source!.reader,r.statement.role,r.nature,r.provenance].join('/')).sort();

test('metamorphic: a table under a test heading is a result, the same table under a specification heading a specification', ()=>{
 const lab=tableReadings(page('Our laboratory measurements')),spec=tableReadings(page('Manufacturer specifications'));
 assert.ok(lab.length>0&&spec.length>0,'the table is read in both pages');
 for(const r of lab)assert.notEqual(r.statement.role,'specification',`a measured table is not a specification (${r.statement.basis})`);
 assert.ok(lab.some(r=>r.statement.role==='result'&&r.nature==='measured'),'the measured table yields results');
 assert.ok(spec.every(r=>r.statement.role!=='result'),'a specification table yields no results');});

test('metamorphic: an unrelated paragraph does not change the reading of the table', ()=>{
 const a=signature(page('Our laboratory measurements')),b=signature(page('Our laboratory measurements','<p>Shipping was quick and the box was well padded.</p>'));
 assert.deepEqual(a,b);});

test('metamorphic: a cell header that names a measurement overrides a specification section; "Claimed"/"Measured" headers are not products', ()=>{
 const h=page('Specifications','','Measured noise');const rs=tableReadings(h);
 assert.ok(rs.length>0);
 const claimed=`<!doctype html><html><body><main><h1>Acme P2 purifier review</h1><h2>Noise</h2><table><tr><th>Setting</th><th>Claimed</th><th>Measured</th></tr><tr><td>High</td><td>55 dB</td><td>61 dB</td></tr></table></main></body></html>`;
 for(const r of tableReadings(claimed)){assert.notEqual(r.subject.value,'named_product',`a provenance header is not a product (${r.subject.name})`);}
 const roles=tableReadings(claimed).map(r=>r.statement.role);
 if(roles.length>=2){assert.ok(roles.includes('specification')||roles.includes('unresolved'));assert.ok(roles.includes('result')||roles.includes('unresolved'));}});

test('metamorphic: a bare specification row with no evidence abstains instead of defaulting to specification', ()=>{
 const h=`<!doctype html><html><body><main><h1>Acme P2</h1><table><tr><th>Noise</th><td>38 dB</td></tr></table></main></body></html>`;
 for(const r of tableReadings(h))assert.equal(r.statement.role,'unresolved',r.statement.basis);});

test('table cell evidence and header provenance map to the scope of their level', ()=>{
 assert.deepEqual(tableCellCues({class:'publisher_measured',level:'table_heading_caption',support:['test or measurement heading']}).map(c=>c.kind+'@'+c.scope),['table_test_term@table']);
 assert.deepEqual(tableCellCues({class:'manufacturer_declared',level:'cell',support:['declaration']}).map(c=>c.kind+'@'+c.scope),['cell_declaration_term@cell']);
 assert.deepEqual(headerProvenanceCues('Claimed').map(c=>c.kind),['header_declaration_term']);
 assert.deepEqual(headerProvenanceCues('Measured').map(c=>c.kind),['header_test_term']);
 assert.deepEqual(headerProvenanceCues('Acme P2'),[]);
 assert.deepEqual(documentCues({sourceType:'manufacturer',extractor:'phase245'}).map(c=>c.kind).sort(),['extractor_specification_row','source_maker']);});

// ---------------------------------------------------------------------------------------------------------------------
// Comparability: positive and negative cases
test('comparability: different sources compare under a stated common method; unresolved or one-sided fields do not', ()=>{
 const base={nature:'measured',kind:'loudness',statement_role:'result',bound:null,result_basis:null,object:null,definitions_identity:'pd.8:x',conditions:[{id:'fan_setting',value:'high',state:'explicit'}],missing:[],conflicts:[],
  method:{codes:['iso_3744'],cue:'first_person_test_statement',instrumentStated:true}};
 const row=(o:Record<string,unknown>)=>({...base,...o}) as never;
 const v=compareReadings98(row({product_id:'a',source_id:'s1'}),row({product_id:'b',source_id:'s2'}));
 assert.equal(v.verdict,'comparable',v.reason);
 assert.equal(compareReadings98(row({statement_role:'unresolved'}),row({})).verdict,'conditions_unestablished');
 assert.equal(compareReadings98(row({nature:'unresolved'}),row({})).verdict,'conditions_unestablished');
 assert.equal(compareReadings98(row({object:'fan'}),row({})).verdict,'conditions_unestablished','an object stated on one side only is not agreement');});

// ---------------------------------------------------------------------------------------------------------------------
// The policy itself on a toy program (independent of the observation rules)
test('decide: constraint beats explicit, explicit beats inherited, and the narrowest scope decides within a tier', ()=>{
 const rs:RuleSet={schema:'t',version:'t1',statement:'toy',vocabulary:[{name:'e',args:['o','k'],meaning:'evidence',role:'input'},{name:'claim',args:['o','f','v','t','s'],meaning:'claim',role:'derived'}],
  programs:[{id:'toy',statement:'toy',rules:[
   {id:'T1',rule:'claim(O,colour,red,inherited,wide) :- e(O,wide_red).',statement:'wide red',source:'t'},
   {id:'T2',rule:'claim(O,colour,blue,inherited,narrow) :- e(O,narrow_blue).',statement:'narrow blue',source:'t'},
   {id:'T3',rule:'claim(O,colour,green,explicit,wide) :- e(O,stated_green).',statement:'stated green',source:'t'},
   {id:'T4',rule:'claim(O,colour,black,constraint,wide) :- e(O,must_black).',statement:'constraint',source:'t'},
   {id:'T5',rule:'claim(O,colour,red,default,wide) :- e(O,usually_red).',statement:'default',source:'t'}],
   decision:{predicate:'claim',scopes:['narrow','wide'],fields:{colour:['red','blue','green','black']},contested:[]}}]};
 const p=compileRuleSet(rs).get('toy')!;assert.equal(claimRules(p).length,5);
 const run=(...ks:string[])=>decide(evaluate(p,{e:ks.map(k=>['o',k])}))[0];
 assert.equal(run('wide_red','narrow_blue').value,'blue');
 assert.equal(run('wide_red','narrow_blue','stated_green').value,'green');
 assert.equal(run('stated_green','must_black').value,'black');
 const d=run('usually_red');assert.equal(d.value,null);assert.equal(d.presumption,'red');
 assert.ok(run('wide_red','narrow_blue').defeated.some(x=>x.rule==='T1'));});

test('a qualifier that names the property is not a calculation; a statistic or a calculation verb is', ()=>{
 const ev={nature:'calculated',reason:'calculation_output:nearest:specification_label_value'};
 assert.deepEqual(calculationEvidenceCues(ev,'Total power output: '),[]);
 assert.deepEqual(calculationEvidenceCues(ev,'this bot has '),[]);
 assert.deepEqual(calculationEvidenceCues(ev,'Maximum power: '),[]);
 assert.equal(calculationEvidenceCues(ev,'across five runs it averaged ').length,1);
 assert.equal(calculationEvidenceCues(ev,'which works out to ').length,1);
 assert.equal(calculationEvidenceCues({nature:'calculated',reason:'calculation_output:table_derivation:x'},'').length,1);
 assert.deepEqual(calculationEvidenceCues({nature:'measured',reason:'x'},'average of '),[]);});

test('metamorphic: the page title is not a section heading; a section heading is', ()=>{
 const body=(h2:string)=>`<!doctype html><html><head><title>Acme R1 review</title></head><body><main><h1>Acme R1 review: tested for a month</h1>${h2}<ul><li>Suction 2700 Pa on the carpet setting</li></ul></main></body></html>`;
 const role=(h:string)=>{const s=readPage98(h,PAGE_URL,sha(h),extractSpecifications245(h,PAGE_URL),null,[],'robot_floor_cleaners','independent_original_test');return s.document.find(d=>d.value===2700)?.reading.statement.role;};
 assert.equal(role(body('')),'unresolved','a page title saying "tested" does not make every value a test result');
 assert.equal(role(body('<h2>Specifications</h2>')),'specification');
 assert.equal(role(body('<h2>How we tested</h2>')),'result');});

test('a value restated in parentheses keeps the clause it qualifies; a parenthetical statement is its own clause', ()=>{
 assert.equal(clauseOf('The robot is equipped with a 5,000mAh battery (72Wh), which lasts.',47,51).head.includes('equipped with'),true);
 assert.equal(role('The robot is equipped with a 5,000mAh battery (72Wh), which lasts.','72Wh','Wh').role,'specification');
 assert.equal(role('The maker claims 40 minutes (we measured 32 minutes) of runtime.','32 minutes','minutes').role,'result');});
