// First increment A2 helper (not a test file): runs the request -> advice entry point on a synthetic store with one
// option configuration, so that tests/i1_reachability.test.ts can record, through Node's V8 coverage, which modules the
// request path actually executes. Usage: node dist/tests/request_path_probe.js <default|quantity|needInterpretation|scientific98>
import {createHash} from 'node:crypto';import {takeCoverage} from 'node:v8';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {translateDocument} from '../src/knowledge_translation.js';
import {recordTranslation} from '../src/knowledge_statements.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';

export const PROBE_CONFIGS=['default','quantity','needInterpretation','scientific98'] as const;
export const PROBE_REQUESTS=['I want an air purifier; we keep it running overnight beside the bed.','A dishwasher under 45 cm wide and under £400, quiet please.',
 'I need an air purifier for the bedroom, noise doesn\'t bother me.','Which TV should I buy?'];

export function runProbe(config:typeof PROBE_CONFIGS[number]):number{
 process.env.PEE_ALLOW_TMP_STORE='1';
 const qk=loadQuantityKnowledge();const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
 const DOC='# Context\n\n“We keep it running overnight beside the bed” bears on: quiet operation during sleep.\n';
 const s=new KnowledgeStore246(':memory:');registerTeachingSources252(SOURCES271);
 applyTeaching252(s,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');
 recordTranslation(s,{categoryId:'air_purifiers',sourceDocument:'probe.md',sourceSha256:sha(DOC),translator:'t-probe',statements:translateDocument(qk,DOC,{source:'air_purifiers'}).statements},{at:'2026-10-21T00:00:00Z'});
 // the setup above executes teaching, translation and store code; the coverage written so far is set aside and the
 // counters restart, so the last coverage file holds the advice calls only
 if(process.env.NODE_V8_COVERAGE)takeCoverage();
 let n=0;
 for(const t of PROBE_REQUESTS){
  const a=config==='default'?adviseFromRequest253(t,s,CATEGORY_REGISTRY250):
   config==='quantity'?adviseFromRequest253(t,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'}):
   config==='needInterpretation'?adviseFromRequest253(t,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21',needInterpretation:{knowledgeGuided:true}}):
   adviseFromRequest253(t,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21',scientific98:true});
  n+=a.response?1:0;}
 return n;
}
const arg=process.argv[2];
if(arg&&process.argv[1]?.endsWith('request_path_probe.js')){
 if(!(PROBE_CONFIGS as readonly string[]).includes(arg))throw Error('unknown config '+arg);
 runProbe(arg as typeof PROBE_CONFIGS[number]);
}
