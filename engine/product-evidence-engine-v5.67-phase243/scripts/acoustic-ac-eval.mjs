#!/usr/bin/env node
/**
 * KN K9 acoustic adjudication scoring (2026-10-18). Scores a build's reading of every acoustic table value on the spent
 * development pages against the blind annotation sealed in evaluation/acoustic-ac/freeze.json, counting two errors
 * separately: unjustified interpretations (a kind the document does not establish, or a non-acoustic number read as a
 * level) and unjustified abstentions (no kind where the document establishes one).
 *
 *   node scripts/acoustic-ac-eval.mjs LABEL [ENGINE_ROOT]
 *
 * ENGINE_ROOT (default: this engine) selects the build to score, so a published commit can be scored from its worktree.
 * Public output (counts only, no values or labels) in evaluation/acoustic-ac; full rows in pee-knowledge private-eval.
 * Never overwrites. Development evidence on spent pages, never held-out.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [label,rootArg]=process.argv.slice(2);if(!/^[a-z0-9.-]{2,40}$/.test(label??''))throw Error('usage: LABEL [ENGINE_ROOT]');
const root=resolve(rootArg??'.');const sha=b=>createHash('sha256').update(b).digest('hex');
const PRIV_IN=join(homedir(),'.local/share/product-evidence-engine/private-eval/acoustic-ac');const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
const FREEZE=JSON.parse(readFileSync('evaluation/acoustic-ac/freeze.json','utf8'));
const annB=readFileSync(join(PRIV_IN,'annotations.json'));if(sha(annB)!==FREEZE.annotationSha256)throw Error('annotation differs from the sealed hash');
const PUB=join('evaluation/acoustic-ac',`score-${label}.json`),PRIV=join(REPO,'private-eval/acoustic-ac',`score-${label}.json`);
for(const f of [PUB,PRIV])if(existsSync(f))throw Error(f+' exists: never overwritten');mkdirSync(join(REPO,'private-eval/acoustic-ac'),{recursive:true});
const Q=await import(join(root,'dist/src/quantity_knowledge.js'));const K=await import(join(root,'dist/src/table_interpreter1g_knowledge.js'));
const qk=Q.loadQuantityKnowledge();const ann=JSON.parse(annB.toString('utf8'));
const notAcoustic=v=>/fan.?speed|not (an? )?acoustic|not a noise/i.test(v.note??'');
const C={};const inc=k=>C[k]=(C[k]??0)+1;const rows=[];
for(const [page,pa] of Object.entries(ann.pages)){const [ev,tag]=page.split('/');const html=readFileSync(join(homedir(),'.local/share/product-evidence-engine/private-eval',ev,'raw',tag+'.html'),'utf8');
 const r=K.interpretWithKnowledge1G(html,qk);const obs=new Map(r.tables.flatMap(t=>t.observations).map(o=>[o.id,o]));
 for(const g of pa.values){const o=obs.get(g.id);const q=o?.quantity??null;const level=!!q?.unit.level;const kind=level?q.kind.id:null;
  const gold=notAcoustic(g)?'not_acoustic':g.kind;let cls;
  if(gold==='not_acoustic')cls=level?'unjustified_interpretation_not_acoustic':'correct_not_read_as_level';
  else if(!level)cls='value_not_read_as_level';
  else if(kind===null)cls=gold==='ambiguous'?'correct_abstention':'unjustified_abstention';
  else cls=gold===kind?'correct_interpretation':(gold==='ambiguous'?'unjustified_interpretation':'wrong_interpretation');
  inc(cls);inc('gold_'+gold);if(kind)inc('justification_'+(q.kind.justification?.type??'not_reported'));
  if(cls==='correct_interpretation'&&q.kind.justification)inc(`justification_agrees_${q.kind.justification.type===g.justification}`);
  rows.push({page,id:g.id,gold,goldJustification:g.justification,reader:kind,readerJustification:q?.kind.justification??null,basis:q?.kind.basis??null,evidenceClass:o?.evidence.class??null,cls});}}
C.values=rows.length;
const meta={label,knowledge:qk.identity,engine:root,annotationSha256:FREEZE.annotationSha256,generatedAt:new Date().toISOString(),evidenceTier:'T2 development adjudication on SPENT pages (blind annotation sealed before this run; not held-out)'};
writeFileSync(PUB,JSON.stringify({...meta,counts:C},null,1)+'\n');writeFileSync(PRIV,JSON.stringify({...meta,counts:C,rows},null,1)+'\n');
console.log(JSON.stringify(C));
