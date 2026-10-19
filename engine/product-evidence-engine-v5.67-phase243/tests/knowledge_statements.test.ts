import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {translateDocument} from '../src/knowledge_translation.js';
import {recordTranslation,statementsOf,statementConflicts,reliabilityOf,loadTypeReliability,caveatsAbout} from '../src/knowledge_statements.js';

// S78: translated statements in the store (v10). Synthetic text (T1: wiring).
process.env.PEE_ALLOW_TMP_STORE='1';
const qk=loadQuantityKnowledge();const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const DOC=['# Energy','','Empty-run energy does not establish energy per cooked meal.','','Rated watts are an electrical specification, not food-delivered heat.','',
 'Higher airflow may increase crispness.','','Higher airflow does not increase crispness.'].join('\n');
const tr=()=>translateDocument(qk,DOC,{source:'air_fryers'}).statements;

test('S78 knowledge statements: recorded with polarity, hedge and provenance; idempotent; a newer translator supersedes',()=>{
 const s=new KnowledgeStore246(':memory:');const st=tr();
 const r=recordTranslation(s,{categoryId:'air_fryers',sourceDocument:'pkg.md',sourceSha256:sha(DOC),translator:'t1',statements:st},{at:'2026-10-19T00:00:00Z'});
 assert.equal(r.recorded,st.filter(x=>!x.selfCheck.length).length);
 assert.equal(recordTranslation(s,{categoryId:'air_fryers',sourceDocument:'pkg.md',sourceSha256:sha(DOC),translator:'t1',statements:st}).recorded,0,'idempotent');
 const rows=statementsOf(s,'air_fryers');
 assert.ok(rows.some(x=>x.type==='not_sufficient'&&x.reliability==='reliable_type'));
 assert.ok(rows.some(x=>x.type==='increases'&&x.hedge==='may'),'the hedge is kept');
 assert.ok(rows.every(x=>x.line>0&&x.headings[0]==='Energy'),'provenance: line and headings');
 assert.ok(!(s.db.prepare('SELECT * FROM knowledge_statements').all() as Record<string,unknown>[]).some(x=>String(x.rendered).length&&'quote' in x),'the quote itself is not stored');
 const r2=recordTranslation(s,{categoryId:'air_fryers',sourceDocument:'pkg.md',sourceSha256:sha(DOC),translator:'t2',statements:st});
 assert.equal(r2.superseded,rows.length);assert.equal(statementsOf(s,'air_fryers').length,rows.length,'only the newer translation is current');
 assert.throws(()=>s.db.prepare("UPDATE knowledge_statements SET ranking_input=1").run(),/CHECK/,'never a ranking input');
 assert.ok(s.verifyJournal().ok);
});
test('S78 knowledge statements: the same relation asserted and denied is a conflict, never resolved silently',()=>{
 const s=new KnowledgeStore246(':memory:');recordTranslation(s,{categoryId:'air_fryers',sourceDocument:'pkg.md',sourceSha256:sha(DOC),translator:'t1',statements:tr()});
 const c=statementConflicts(statementsOf(s,'air_fryers'));assert.equal(c.length,1);assert.deepEqual([c[0].a.polarity,c[0].b.polarity].sort(),['negative','positive']);
});
test('S78 knowledge statements: never in a public export; type reliability comes from the measured table',()=>{
 const s=new KnowledgeStore246(':memory:');recordTranslation(s,{categoryId:'air_fryers',sourceDocument:'pkg.md',sourceSha256:sha(DOC),translator:'t1',statements:tr()});
 const dir=mkdtempSync(join(tmpdir(),'ks-'));const pub=s.exportShards246(join(dir,'pub'),{audience:'public'});const priv=s.exportShards246(join(dir,'priv'));
 assert.equal(pub.files['knowledge_statements.ndjson'].rows,0);assert.ok(priv.files['knowledge_statements.ndjson'].rows>0);
 assert.equal(readFileSync(join(dir,'pub','knowledge_statements.ndjson'),'utf8'),'');
 const rel=loadTypeReliability();assert.equal(reliabilityOf(rel,'limitation'),'reliable_type');assert.equal(reliabilityOf(rel,'definition'),'unreliable_type');assert.equal(reliabilityOf(rel,'no_such'),'unmeasured_type');
});

test('S78 caveats: only reliable warning types with the concept as subject, the most faithful types first',()=>{
 const s=new KnowledgeStore246(':memory:');const doc=['# Crispness','','Crispness cannot be judged from one food alone.','','Crispness is a texture, not a colour.','',
  'A photo of golden chips does not establish crispness.','','Crispness depends on airflow.'].join('\n');
 const st=translateDocument(qk,doc,{source:'air_fryers',concepts:[{id:'crisp_texture',statement:'Crisp texture.',aliases:['crispness']}]}).statements;
 recordTranslation(s,{categoryId:'air_fryers',sourceDocument:'c.md',sourceSha256:sha(doc),translator:'t1',statements:st});
 const c=caveatsAbout(s,'air_fryers','crisp_texture',9);
 assert.ok(c.some(x=>x.type==='is_not'),c.map(x=>x.type+':'+x.rendered).join(' | '));assert.ok(c.every(x=>['limitation','not_sufficient','is_not'].includes(x.type)&&x.subject!.concepts.includes('crisp_texture')));
 assert.ok(!c.some(x=>/golden chips/.test(x.rendered)),'crispness is the object there, not the subject');
 const order=c.map(x=>x.type);assert.deepEqual(order,[...order].sort((a,b)=>(a==='not_sufficient'?0:a==='is_not'?1:2)-(b==='not_sufficient'?0:b==='is_not'?1:2)));
});
test('S79: research caveats never enter a consumer answer; they are available only to internal evaluation',async ()=>{
 const src=readFileSync(new URL('../../src/phase253_request_advice.ts',import.meta.url),'utf8');
 assert.ok(!/teachingCaveats\s*=/.test(src)&&!/From the category research/.test(src),'no answer field or text carries research caveats');
 const {teachingCaveatsShadow}=await import('../src/phase253_request_advice.js');assert.equal(typeof teachingCaveatsShadow,'function');
 const contract=readFileSync(new URL('../../src/phase253_advice_contract.ts',import.meta.url),'utf8');assert.ok(!/teachingCaveats/.test(contract),'the answer contract has no caveat field');
});
