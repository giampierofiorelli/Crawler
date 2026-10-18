#!/usr/bin/env node
/** R1 competency questions (roadmap R1.3): questions the software must answer by itself, with its derivations.
 * Synthetic records only (no page text). Each answer is the program's conclusion and its proof (KR `why`).
 *   node scripts/r1-competency.mjs LABEL   writes evaluation/r1/competency-LABEL.json */
import {writeFileSync,existsSync} from 'node:fs';
const label=process.argv[2];const OUT=`evaluation/r1/competency-${label}.json`;if(!label||existsSync(OUT))throw Error('usage: LABEL (new)');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const W=await import(D+'document_evidence.js');const PF=await import(D+'product_facts.js');
const qk=QK.loadQuantityKnowledge();const page=b=>`<html><body><main>${b}</main></body></html>`;
const facts=(b,fn)=>PF.readProductFacts(qk,W.readDocumentEvidence(page(b),qk,{sourceType:'independent_review'}),fn?{functions:fn}:{});
const why=(pf,pred,pat)=>{const f=pf.model.match(pred,pat)[0];return f?pf.model.why(f):null;};
const t=(s,l)=>QK.typeQuantity(qk,QK.findQuantities(qk,s)[0],{labels:l});
const Q=[];const ask=(id,question,answer,derivation,status='answered by the software')=>{Q.push({id,question,status,answer,derivation});console.log(id,status,'|',JSON.stringify(answer).slice(0,200));};
{const pf=facts('<h2>Acme AP5</h2><p>The Acme AP5 has a child lock. When I used the auto mode for a week it worked well.</p>');
 ask('CQ1','Does PEE distinguish a function stated present from one verified in use?',{declaredOnly:pf.model.all('presence_declared_only').map(f=>f.args[1]),verifiedInUse:pf.model.all('presence_verified_in_use').map(f=>f.args[1])},why(pf,'presence_declared_only',['Acme AP5','child_lock']));}
{const c=QK.compareQuantities(qk,t('250 m³/h',['CADR','Sleep mode']),t('300 m³/h',['CADR','Speed 1']));const d=QK.compareQuantities(qk,t('250 m³/h',['CADR','Speed 1']),t('300 m³/h',['CADR','Speed 3']));
 ask('CQ2','Can PEE explain why two measurements are not directly comparable?',{sleepVsSpeed1:{verdict:c.verdict,reasons:c.reasons},speed1VsSpeed3:{verdict:d.verdict,reasons:d.reasons}},c.derivation.slice(0,14));}
{const pf=facts('<h2>Acme AP5</h2><p>The Acme AP5 has an auto mode. The Acme AP5 drew 8 W in auto mode.</p>');
 ask('CQ3','Does PEE see that a result in auto mode is relevant to consumption but insufficient for the quality of the control?',{measuredAspects:[...new Set(pf.derived.measures.map(x=>x[1]+':'+x[3]))],unassessedAspects:pf.model.all('aspect_unassessed').map(f=>f.args[1]+':'+f.args[2]),supports:pf.derived.supports.length},
  [...(why(pf,'measures_aspect',[null,'auto_mode',null,'energy'])??[]),...(why(pf,'aspect_unassessed',['Acme AP5','auto_mode','response_time'])??[])]);}
{const base=PF.loadProductFunctions();const pack=JSON.parse(JSON.stringify(base.pack));pack.functions.push({id:'frost_protection',label:'frost protection',terms:['frost protection','anti-frost'],sensorBased:true,effectiveness:[{what:'low_temperature_operation',cues:['cold','below 5']}],source:'pee'});
 const fn=PF.loadProductFunctions(pack);const pf=facts('<h2>Zeta DH3</h2><p>In testing, the Zeta DH3 frost protection kept working well in a cold garage.</p>',fn);
 ask('CQ4','Can a new scientific relation, added as knowledge (not code), be used on a product never seen before?',{presence:pf.derived.presence,supports:pf.derived.supports.map(x=>[x[0],x[1],x[3]])},why(pf,'supports',['Zeta DH3','frost_protection',null,'low_temperature_operation',null]),'answered by the software; the relation was added by Claude as data, not learned by PEE');}
{const one='<h2>Acme AP5</h2><p>The Acme AP5 has an auto mode. In testing, the auto mode reacted quickly and well when I burned toast.</p>';const two=one+'<p>In testing, the Acme AP5 auto mode was slow to react and disappointing when I fried fish.</p>';
 const a=facts(one),b=facts(two),c=facts('<h2>Acme AP5</h2><p>The Acme AP5 has an auto mode.</p>');
 ask('CQ5','Does PEE recognise that an earlier conclusion is no longer justified once a contradicting result arrives (and when its only support is removed)?',{withOneTest:{supported:a.derived.supports.map(x=>x[3]),controversial:a.model.all('aspect_controversial').length},withContradiction:{controversial:b.model.all('aspect_controversial').map(f=>f.args[2])},withoutSupport:{unassessed:c.derived.effectivenessUnassessed.map(x=>x[1])}},why(b,'aspect_controversial',['Acme AP5','auto_mode','response_time']));}
{const pf=facts('<h2>Acme AP5</h2><p>The Acme AP5 measured 22 dBA in sleep mode. At speed 1 it measured 31 dBA. At speed 3 it measured 45 dBA.</p>');const mode=r=>pf.results.find(x=>x.id===r).modes[0];
 const u=pf.model.all('state_relation_unknown').map(f=>[mode(f.args[0]),mode(f.args[1])].join(' vs '));const d=pf.model.all('different_state_results').map(f=>[mode(f.args[0]),mode(f.args[1])].join(' vs '));
 ask('CQ6','Does PEE tell an unknown relation between settings from a documented difference?',{unknown:[...new Set(u)],different:[...new Set(d)]},why(pf,'state_relation_unknown',[pf.results.find(r=>r.modes[0]==='sleep').id,pf.results.find(r=>r.modes[0]==='speed 1').id]));}
ask('CQ7','Can PEE acquire a new rule or relation by itself from examples and counterexamples?',{answer:'no',reason:'no mechanism of the software proposes, tests or promotes rules; every rule and relation in the knowledge was written by Claude (or taught from owner packages by Claude); experience cases and table lessons are stored and replayed, not induced'},null,'not possible today (roadmap R5)');
writeFileSync(OUT,JSON.stringify({schema:'pee.r1.competency.v1',label,generatedAt:new Date().toISOString(),note:'synthetic records; answers and proofs produced by the software',questions:Q},null,1)+'\n');
