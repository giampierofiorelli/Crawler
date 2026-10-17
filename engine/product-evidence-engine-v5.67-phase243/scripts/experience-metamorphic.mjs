#!/usr/bin/env node
/** Continuous-learning Step 1B: run the three metamorphic attribution relations (src/experience_metamorphic.ts) against one
 * extractor build, on FICTIONAL fixtures only (no network, no live store: the television plan is compiled from that build's
 * own teaching modules in a temporary store). Results are synthetic (tier T1) and are never independent evidence.
 * Usage: node scripts/experience-metamorphic.mjs LABEL [--build DIST] [--policy constrained_candidate_1c|candidate_1c_inventory]
 *   (default build: this checkout's dist/src; --policy applies the Step 1C evaluation-only attribution candidate)
 * Writes evaluation/experience/metamorphic-LABEL.json; never overwrites. */
import {writeFileSync,existsSync,mkdtempSync} from 'node:fs';import {join,resolve} from 'node:path';import {tmpdir} from 'node:os';import {createHash} from 'node:crypto';
import {buildIdentity,candidate1C} from './experience-observe.mjs';
const A=process.argv.slice(2);const label=A[0];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL [--build DIST]');
const i=A.indexOf('--build');const D=resolve(i>0?A[i+1]:'dist/src')+'/';const pi=A.indexOf('--policy');const POLICY=pi>0?A[pi+1]:null;
if(POLICY&&!['constrained_candidate_1c','candidate_1c_inventory'].includes(POLICY))throw Error('unknown policy '+POLICY);
const OUT=`evaluation/experience/metamorphic-${label}.json`;if(existsSync(OUT))throw Error(OUT+' exists: results are never overwritten');
const {runMetamorphic,MR_FIXTURES}=await import(resolve('dist/src/experience_metamorphic.js'));
const [st,ret,t252,t271,t272,pl,sp,tl,bk]=await Promise.all(['phase246_knowledge_store.js','phase249_retention_policy.js','phase252_category_teaching.js','phase271_category_teaching.js',
 'phase272_category_teaching.js','phase272_extraction_plan.js','phase245_spec_extraction.js','phase265_test_measurements.js','phase225_transient_test_probe.js'].map(f=>import(D+f)));
process.env.PEE_ALLOW_TMP_STORE='1';
const s=new st.KnowledgeStore246(join(mkdtempSync(join(tmpdir(),'pee-mr-')),'t.sqlite'),{...st.DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:ret.FACTUAL_CLASS_POLICY249});
t252.registerTeachingSources252([...t271.SOURCES271,...t272.SOURCES272]);
t252.applyTeaching252(s,[t272.TELEVISION_TEACHING272,t271.DISHWASHER_TEACHING271,t271.AIR_PURIFIER_TEACHING271],'2026-10-17T08:00:00.000Z');
const plan=pl.compileExtractionPlan272(s,'televisions',['tv','television'],['televisions','dishwashers','air_purifiers']);s.close();
const sha=x=>createHash('sha256').update(x).digest('hex');const url='https://www.lab.test/review';
// The harness is synchronous: with --policy, every fixture's leads are re-decided by the candidate first.
const {MR_FIXTURES:FX}=await import(resolve('dist/src/experience_metamorphic.js'));const pre=new Map();
for(const html of Object.values(FX)){const x=tl.testDocumentSubject268(sp.extractSpecifications245(html,url),'independent_original_test');
 let c=tl.testLeadsFromHtml265(html,url,sha(html),x,{category:'televisions',plan}).probe.candidates;if(POLICY)c=await candidate1C({tl,blocks:bk},html,x,c,POLICY==='candidate_1c_inventory'?{inventory:true,nouns:['tv','television'],host:'www.lab.test'}:{});
 pre.set(html,c.map(c=>({value:c.value,unit:String(c.unit).toLowerCase(),subject:c.subject?.name??null})));}
const extract=html=>{if(!pre.has(html))throw Error('fixture not prepared');return pre.get(html);};
const verdicts=runMetamorphic(extract);
const out={schema:'pee.experience-metamorphic.v1',label,at:new Date().toISOString(),tier:'T1_synthetic',build:buildIdentity(D),policy:POLICY,planDigest:plan.compiledFrom.digest,
 fixturesSha256:sha(JSON.stringify(MR_FIXTURES)),
 summary:Object.fromEntries(['holds','holds_unresolved','violated','precondition_not_met'].map(k=>[k,verdicts.filter(v=>v.status===k).length])),verdicts};
writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
for(const v of verdicts)console.log(v.status.padEnd(22),v.relation.padEnd(28),v.variant,'|',v.checked.map(c=>`${c.value}${c.unit}:${c.source}→${c.followUp}`).join('; '));
