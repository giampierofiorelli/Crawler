#!/usr/bin/env node
/** S97 causal audit (owner review 2026-10-20, verbatim in owner-review-s96-causal-audit-2026-10-20.md): counterfactual
 * restoration of the links the S97 trace found broken, measured on SPENT material only (post hoc diagnosis, never held-out):
 *   S0  the S96 E1 configuration (QK-metric and teaching-row candidates, ownTermObject)
 *   C1  S0 + conditions carried into the candidates (QK `requires` -> defining dimensions; derived dimensions for QK axes)
 *   C2  C1 + the conditions the quantity knowledge already reads around each value passed to the interpreter
 *   C3  S0 + the object of interest stated for the display metrics (pd knownObjects 'display') + object licence
 *   C13 C1 and C3 together
 * Capabilities: attribution (S96 check, S94 dev), regressions on the S89-S93 sealed references (pd ids), conditions read,
 * comparability verdicts. Public output: counts only.   node scripts/s97-audit.mjs LABEL */
import {readFileSync,writeFileSync,existsSync,mkdirSync,readdirSync,statSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');const LABEL=process.argv[2];if(!LABEL)throw Error('LABEL');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');const SE=await import(D+'scientific_entities.js');
const qk=QK.loadQuantityKnowledge();const defs0=PD.loadPropertyDefinitions(qk);
const walk=d=>readdirSync(d).flatMap(f=>{const p=join(d,f);return statSync(p).isDirectory()?(f==='archive'||f.startsWith('ORIGINAL')?[]:walk(p)):/\.md$/i.test(f)?[p]:[];});
const PK=join(PE,'r1v/packages');const entities=[...SE.acquireEntities(qk,walk(PK).sort().map(p=>({source:p.slice(PK.length+1),md:readFileSync(p,'utf8')})),defs0),...SE.metricEntities(qk,defs0)];
const DISPLAY=['peak_luminance','display_refresh_rate','input_lag','colour_gamut_coverage','display_colour_error'];
const overlay=o=>SE.withAcquiredDefinitions(qk,defs0.pack,entities,o).defs;
const CFG={E0:{defs:defs0,opts:{}},S0:{defs:overlay({}),opts:{ownTermObject:true}},C1:{defs:overlay({transferConditions:true}),opts:{ownTermObject:true}},
 C3:{defs:overlay({objectOwners:{display:DISPLAY}}),opts:{ownTermObject:true,objectLicence:true}},C13:{defs:overlay({transferConditions:true,objectOwners:{display:DISPLAY}}),opts:{ownTermObject:true,objectLicence:true}}};
const obsOf=x=>({value:x.value,unit:String(x.unit??''),label:x.label??x.window,context:x.context,category:x.category,valueAt:x.valueAt,surface:x.surface,pageSubject:x.pageSubject??null});
// C2: the conditions the quantity knowledge reads around the value (its own words and window), as condition texts
const qkConditions=x=>{const u=QK.parseUnit(qk,String(x.unit??'').trim());if(!u)return [];const own=String(x.label??'').slice(0,(x.valueAt??0)+String(x.surface??'').length+40);
 return [...new Set(QK.typeQuantity(qk,{surface:x.surface??'',value:x.value,unit:u},{labels:[own],context:[x.window??'']}).conditions.map(c=>c.raw).filter(Boolean))];};
const accepts=(acc,id)=>acc.some(a=>a===id||id&&a.startsWith('acq_')&&id.startsWith(a+'_'));
const score=(rows,c)=>{const pos=rows.filter(r=>!r.accept.includes('none')),neg=rows.filter(r=>r.accept.includes('none'));const p=r=>r.pred[c];
 return {items:rows.length,correct:pos.filter(r=>accepts(r.accept,p(r))).length,wrong:pos.filter(r=>p(r)&&!accepts(r.accept,p(r))).length,falseAttribution:neg.filter(r=>p(r)).length,refPositive:pos.length};};
const sets=[];
// S96 check (sealed reference; spent since its first run) and S94 dev (development key)
{const W=join(PE,'s96/wave');const ref=JSON.parse(readFileSync(join(W,'annotation/annotations.json'),'utf8')).values;
 sets.push({name:'s96_check_tv_monitors',items:JSON.parse(readFileSync(join(W,'check-items.json'),'utf8')),accept:x=>{const r=ref[x.id];return [r.property,...(r.alsoAcceptable&&r.property!=='none'?[r.alsoAcceptable]:[])];}});}
{const W=join(PE,'s94/wave');const ref=JSON.parse(readFileSync(join(W,'annotation/annotations.json'),'utf8')).items;const key=JSON.parse(readFileSync(join(PE,'s96/dev-key.json'),'utf8')).accept;
 sets.push({name:'s94_dev_monitors_ssds',items:JSON.parse(readFileSync(join(W,'check-items.json'),'utf8')),accept:x=>{const r=ref[x.id];return key[String(r.concept??'').toLowerCase()]??[r.property??'none'];}});}
for(const [S,f] of [['s89','annotations.json'],['s90','annotations.json'],['s91','annotations.json'],['s92','annotation/annotations.json'],['s93','annotation/annotations.json']]){
 const j=JSON.parse(readFileSync(join(PE,S,f),'utf8'));const ref=j.items??j;const it=JSON.parse(readFileSync(join(PE,S,'check-items.json'),'utf8'));
 sets.push({name:S+'_regression',items:(Array.isArray(it)?it:it.items).filter(x=>ref[x.id]),accept:x=>{const r=ref[x.id];return [r.property??'none',...(r.alsoAcceptable&&r.property!=='none'?[r.alsoAcceptable]:[])];}});}
const out={schema:'pee.s97.audit.v1',label:LABEL,note:'post hoc diagnosis on spent material; counts only',configs:Object.fromEntries(Object.entries(CFG).map(([k,v])=>[k,v.defs.identity])),attribution:{},conditions:{},comparability:{}};const priv={};
for(const s of sets){const rows=s.items.map(x=>{const o=obsOf(x);const pred={};for(const [c,v] of Object.entries(CFG))pred[c]=I.attributeProperty(v.defs,qk,o,v.opts).value;return {id:x.id,accept:s.accept(x),pred,x};});
 out.attribution[s.name]=Object.fromEntries(Object.keys(CFG).map(c=>[c,score(rows,c)]));
 // changes against S0, so a gain elsewhere cannot hide a loss
 const ok=(r,c)=>accepts(r.accept,r.pred[c])||(r.accept.includes('none')&&!r.pred[c]);
 out.attribution[s.name].changesC13vsS0={fixed:rows.filter(r=>!ok(r,'S0')&&ok(r,'C13')).length,broken:rows.filter(r=>ok(r,'S0')&&!ok(r,'C13')).length};
 // conditions and comparability for the values each configuration attributes to a candidate
 if(s.name.startsWith('s96')||s.name.startsWith('s94')){const C={};const V={};
  for(const c of ['S0','C1','C13']){const v=CFG[c];let attributed=0,withDefining=0,conditionRead=0,missingReported=0;const interp=[];
   for(const r of rows){const p=r.pred[c];if(!p||!/^(qkm|acq)_/.test(p))continue;attributed++;const d=v.defs.properties.get(p);if(d.conditions.length)withDefining++;
    const conds=c==='S0'?[]:qkConditions(r.x);const di=I.interpretWithDefinitions(v.defs,qk,{...obsOf(r.x),conditions:conds},{...v.opts});
    if(di.conditions.some(z=>z.dimension&&z.value!==null))conditionRead++;missingReported+=di.missingDefining.length;interp.push({p,di});}
   C[c]={attributed,candidateWithDefiningConditions:withDefining,valuesWithAConditionRead:conditionRead,missingDefiningReported:missingReported};
   // comparability of every pair of values of one property: verdicts
   const vd={};for(let i=0;i<interp.length;i++)for(let j=i+1;j<interp.length;j++){if(interp[i].p!==interp[j].p)continue;const k=I.compareByDefinition(v.defs,interp[i].di,interp[j].di).verdict;vd[k]=(vd[k]??0)+1;}
   V[c+(c==='S0'?'':'+C2')]=vd;}
  out.conditions[s.name]=C;out.comparability[s.name]=V;}
 priv[s.name]=rows.map(r=>({id:r.id,accept:r.accept,pred:r.pred}));}
const pub=new URL('../evaluation/s97/',import.meta.url).pathname;mkdirSync(pub,{recursive:true});mkdirSync(join(PE,'s97'),{recursive:true});
const f=join(pub,`audit-${LABEL}.json`);if(existsSync(f))throw Error(f+' exists');writeFileSync(f,JSON.stringify(out,null,1)+'\n');writeFileSync(join(PE,'s97',`audit-${LABEL}-detail.json`),JSON.stringify(priv));
for(const [s,v] of Object.entries(out.attribution))console.log(s.padEnd(24),Object.entries(v).map(([c,x])=>c+':'+(x.correct!==undefined?`${x.correct}/${x.wrong}/${x.falseAttribution}`:JSON.stringify(x))).join('  '));
console.log(JSON.stringify(out.conditions));console.log(JSON.stringify(out.comparability));
