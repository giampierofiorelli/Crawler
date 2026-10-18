#!/usr/bin/env node
/** GK: how the unit vocabularies already in PEE read the same printed units, next to the quantity knowledge. Read only;
 * output evaluation/quantity-knowledge/lexicon-audit.json (never overwritten). Documents the generalisation debt: each
 * stage has its own closed list, and they disagree. */
import {writeFileSync,existsSync} from 'node:fs';import {resolve} from 'node:path';
const D=resolve('dist/src');const OUT='evaluation/quantity-knowledge/lexicon-audit.json';if(existsSync(OUT))throw Error(OUT+' exists');
const Q=await import(D+'/quantity_knowledge.js');const P265=await import(D+'/phase265_test_measurements.js');const P272=await import(D+'/phase272_extraction_plan.js');
const P245=await import(D+'/phase245_value_normalizer.js');const G=await import(D+'/table_interpreter1g.js');const C253=await import(D+'/phase253_request_constraints.js');
const qk=Q.loadQuantityKnowledge();
const SPELLINGS=['dB','dBA','dB(A)','dB (A)','decibels','dB(A) re 1 pW','CFM','cfm','m³/h','m3/h','cubic feet per minute','nits','cd/m²','lux','Hz','rpm','kWh','kWh/annum','kWh/100 cycles','W','L/day','pints per day','sq ft','m²','°C','°F','µg/m³','ppm','%','mAh','bar','ACH','inches','lb'];
const rows=SPELLINGS.map(s=>{const q=Q.parseUnit(qk,s);const el=G.cellElements1G('12 '+s).find(e=>e.kind==='quantity'||e.kind==='number');
 const req=C253.extractConstraints253('it must be at least 12 '+s+' wide').constraints[0]??C253.extractConstraints253('at least 12 '+s).constraints[0];
 return {printed:s,knowledge:q?{expression:q.expression,kinds:q.kinds,weighting:q.level?.weighting??null}:null,
  phase265:P265.normalizeUnit265(s),phase272:P272.canonicalUnit272(s),phase245:P245.canonicalUnit245?P245.canonicalUnit245(s)??null:'n/a',
  table1g:el?.unit?{unit:el.unit,dimension:el.dimension}:null,request253:req?req.unit:null};});
const disagree=rows.filter(r=>{const v=[r.phase265,r.phase272,r.table1g?.unit??null];return new Set(v.map(x=>x===null?'∅':x)).size>1;}).map(r=>r.printed);
const weightingLost=rows.filter(r=>r.knowledge?.weighting==='A'&&[r.phase265,r.phase272,r.table1g?.unit].some(u=>u==='db')).map(r=>r.printed);
writeFileSync(OUT,JSON.stringify({schema:'pee.qk-lexicon-audit.v1',knowledge:qk.identity,note:'Same printed unit, read by each existing vocabulary. phase145/phase166 lexicons are internal (not exported) and are listed in the report from their source.',
 rows,legacyDisagree:disagree,aWeightingCollapsedSomewhere:weightingLost},null,1)+'\n');console.log('wrote',OUT,disagree.length,'disagree;',weightingLost);
