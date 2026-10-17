#!/usr/bin/env node
/** Continuous-learning Step 1B: per-item attribution census of the Phase272 untouched gold values under three behaviours:
 * frozen arm B (c206c9a), current tuned build, and the current build with the EVALUATION-ONLY ambiguity-preserving
 * counterfactual (scripts/experience-observe.mjs). Each gold value is observed independently (not one-to-one), so a lead may
 * serve two gold items with the same value; those items are flagged. The set is SPENT (the tuned rule was written on it):
 * these counts describe behaviour on tuned data, never held-out accuracy. No network; the live store is only read.
 * Usage: node scripts/experience-attribution-census.mjs LABEL. Private rows -> pee-knowledge/private-eval/experience/,
 * value-free counts -> evaluation/experience/census-LABEL.json. Never overwrites. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {observeCase,buildIdentity,MATCHING_RULE_DIGEST} from './experience-observe.mjs';
const {attributionClass}=await import(resolve('dist/src/experience_cases.js'));
const label=process.argv[2];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL');
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
const PRIV=join(REPO,`private-eval/experience/census-${label}.json`),PUB=`evaluation/experience/census-${label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: never overwritten');
const E=join(homedir(),'.local/share/product-evidence-engine/private-eval/phase272');
const G=JSON.parse(readFileSync(join(E,'gold-untouched.json'),'utf8'));const W=JSON.parse(readFileSync(join(E,'wave.json'),'utf8'));
const CAT={tv:'televisions',ap:'air_purifiers',af:'air_fryers',dw:'dishwashers'};
const FROZEN='/home/user/p272-frozenB/engine/product-evidence-engine-v5.67-phase243/dist/src',CUR=resolve('dist/src');
const BEH=[['frozen',FROZEN,{}],['tuned',CUR,{}],['ambiguity_cf',CUR,{policy:'ambiguity_preserving'}]];
const rows=[];
for(const g of G.quantitative){const p=W.pages.find(x=>x.tag===g.doc);
 const c={kind:'quantitative_value',category:CAT[g.id.split('-')[0]],source:{evaluation:'phase272',docTag:g.doc,docSha256:p.sha256},item:{value:g.value,unit:g.unit,goldSubject:g.subject},
  historical:{status:'absent'},reference:{expected:'found_with_accepted_subject',acceptedSubjects:[g.subject],basis:'independent_gold',independence:'untouched gold (spent by the tuned rule)'}};
 const r={goldId:g.id,doc:g.doc,category:c.category,sameValueSiblings:G.quantitative.filter(x=>x.doc===g.doc&&x.id!==g.id&&x.value===g.value&&x.unit===g.unit).map(x=>x.id)};
 for(const [k,d,o] of BEH){const ob=await observeCase(c,d,o);r[k]=ob.observation?{class:attributionClass(c,ob.observation),subject:ob.observation.subject??null,planFrozen:ob.meta?.planFrozen??null}:{class:'unobservable',reason:ob.unobservable};}
 rows.push(r);}
const count=(f)=>{const o={};for(const r of rows.filter(f))for(const [k] of BEH){o[k]??={};o[k][r[k].class]=(o[k][r[k].class]??0)+1;}return o;};
const matrix=(a,b)=>{const m={};for(const r of rows){const key=r[a].class+'>'+r[b].class;if(r[a].class!==r[b].class)m[key]=(m[key]??0)+1;}return m;};
const out={schema:'pee.experience-attribution-census.v1',label,at:new Date().toISOString(),set:'phase272 untouched gold (SPENT: tuned on)',items:rows.length,
 builds:{frozen:buildIdentity(FROZEN),current:buildIdentity(CUR)},matchingRuleDigest:MATCHING_RULE_DIGEST,goldSha256:createHash('sha256').update(readFileSync(join(E,'gold-untouched.json'))).digest('hex'),
 planDigestsAllFrozen:rows.every(r=>BEH.every(([k])=>r[k].planFrozen!==false)),
 method:'per-item, non-exclusive observation (value + canonical unit; same-subject lead preferred); items with same-value siblings may share one lead',
 classes:{all:count(()=>true),...Object.fromEntries(Object.values(CAT).map(c=>[c,count(r=>r.category===c)])),withSameValueSiblings:count(r=>r.sameValueSiblings.length>0)},
 changes:{frozen_to_tuned:matrix('frozen','tuned'),tuned_to_ambiguity_cf:matrix('tuned','ambiguity_cf'),frozen_to_ambiguity_cf:matrix('frozen','ambiguity_cf')}};
writeFileSync(PRIV,JSON.stringify({...out,rows},null,1)+'\n');writeFileSync(PUB,JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({classes:out.classes.all,changes:out.changes,planDigestsAllFrozen:out.planDigestsAllFrozen},null,1));
