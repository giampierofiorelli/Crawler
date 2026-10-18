#!/usr/bin/env node
/** R1 knowledge-isolation experiment: the K9 blind acoustic adjudication (120 values, sealed; spent pages, development
 * evidence) scored with the full quantity knowledge and with its scientific parts removed, one at a time.
 *   node scripts/r1-ac-ablation.mjs LABEL   writes evaluation/r1/ac-ablation-LABEL.json (counts only)
 * Same classification as scripts/acoustic-ac-eval.mjs. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const label=process.argv[2];const OUT=`evaluation/r1/ac-ablation-${label}.json`;if(!label||existsSync(OUT))throw Error('usage: LABEL (new)');
const sha=b=>createHash('sha256').update(b).digest('hex');const D=new URL('../dist/src/',import.meta.url).href;
const Q=await import(D+'quantity_knowledge.js');const K=await import(D+'table_interpreter1g_knowledge.js');
const FREEZE=JSON.parse(readFileSync('evaluation/acoustic-ac/freeze.json','utf8'));const annB=readFileSync(join(homedir(),'.local/share/product-evidence-engine/private-eval/acoustic-ac/annotations.json'));
if(sha(annB)!==FREEZE.annotationSha256)throw Error('annotation differs from the sealed hash');const ann=JSON.parse(annB.toString('utf8'));
const PACK=JSON.parse(readFileSync('resources/quantity-knowledge/quantity-knowledge.v2.json','utf8'));const clone=x=>JSON.parse(JSON.stringify(x));
const ARMS={full:p=>p,
 no_scientific_methods:p=>{p.kindEvidence=[];p.methods=[];p.relations=[];p.scales=[];return p;},
 no_kind_words:p=>{for(const k of p.kinds){k.terms=[];delete k.discriminators;delete k.comparatives;}p.kindEvidence=[];return p;},
 no_level_units_references:p=>{for(const u of p.levelUnits){u.reference=null;}return p;},
 units_and_dimensions_only:p=>{p.kindEvidence=[];p.methods=[];p.relations=[];p.scales=[];for(const k of p.kinds){k.terms=[];delete k.discriminators;delete k.comparatives;}for(const u of p.levelUnits)u.reference=null;return p;}};
const notAcoustic=v=>/fan.?speed|not (an? )?acoustic|not a noise/i.test(v.note??'');const out={};
for(const [arm,f] of Object.entries(ARMS)){let qk;try{qk=Q.loadQuantityKnowledge(f(clone(PACK)));}catch(e){out[arm]={error:String(e.message)};continue;}const C={};const inc=k=>C[k]=(C[k]??0)+1;
 for(const [page,pa] of Object.entries(ann.pages)){const [ev,tag]=page.split('/');const html=readFileSync(join(homedir(),'.local/share/product-evidence-engine/private-eval',ev,'raw',tag+'.html'),'utf8');
  const r=K.interpretWithKnowledge1G(html,qk);const obs=new Map(r.tables.flatMap(t=>t.observations).map(o=>[o.id,o]));
  for(const g of pa.values){const o=obs.get(g.id);const q=o?.quantity??null;const level=!!q?.unit.level;const kind=level?q.kind.id:null;const gold=notAcoustic(g)?'not_acoustic':g.kind;let cls;
   if(gold==='not_acoustic')cls=level?'unjustified_interpretation_not_acoustic':'correct_not_read_as_level';else if(!level)cls='value_not_read_as_level';
   else if(kind===null)cls=gold==='ambiguous'?'correct_abstention':'unjustified_abstention';else cls=gold===kind?'correct_interpretation':(gold==='ambiguous'?'unjustified_interpretation':'wrong_interpretation');
   inc(cls);if(kind)inc('justification_'+(q.kind.justification?.type??'none'));}}
 out[arm]=C;console.log(arm,JSON.stringify(C));}
writeFileSync(OUT,JSON.stringify({schema:'pee.r1.ac-ablation.v1',label,generatedAt:new Date().toISOString(),reference:'evaluation/acoustic-ac/freeze.json (K9 blind adjudication, 120 values, spent pages: development evidence)',arms:out},null,1)+'\n');
