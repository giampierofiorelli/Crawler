/** FA-I1 (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-fa-i1-authorisation-2026-10-21.md). Experimental, evaluation only: validates encodings against the km.2 schema
 * hypothesis (evaluation/fa-i1/schema-v2.json) and runs the km.2 inference program (evaluation/fa-i1/inference-v2.json)
 * with the existing KR engine. No operational module imports this file; it writes nothing outside evaluation outputs. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const here=p=>new URL(p,import.meta.url).pathname;
export const SCHEMA=JSON.parse(readFileSync(here('../evaluation/fa-i1/schema-v2.json'),'utf8'));
export const RULES=JSON.parse(readFileSync(here('../evaluation/fa-i1/inference-v2.json'),'utf8'));
const enums=s=>s.split('|').map(x=>x.trim().split(' ')[0]).filter(Boolean);
const E={asserted:['affirmed','denied'],modality:['possible','typical','necessary','sufficient','necessary_and_sufficient'],effect:['increases','decreases','removes','prevents','no_effect'],
 force:['essential','modifiable','nonessential','unknown'],condKind:['applicability','prerequisite','exclusion','measurement_condition'],stance:['holds','does_not_hold'],logic:['all','any'],
 scope:['general','category','subtype','product','variant'],nature:SCHEMA.epistemicDimensions.claimNature.values,review:SCHEMA.epistemicDimensions.review.values,
 specificity:SCHEMA.epistemicDimensions.specificity.values,labelClass:enums(SCHEMA.epistemicDimensions.evidence.fields.labelClass),independence:['independent','not_independent','unknown'],
 sourceRole:enums(SCHEMA.entityTypes.source.fields.role),comparator:['=','<','<=','>','>=','range','approx']};
// enumerated entity fields (the others are ids, id lists, numbers or the human label)
const EF={need:{kind:['general','contextual'],direction:['increase','decrease','maintain','achieve','avoid']},situation:{kind:enums(SCHEMA.entityTypes.situation.fields.kind),valence:['undesired','neutral','desired']},
 cause:{kind:enums(SCHEMA.entityTypes.cause.fields.kind)},strategy:{kind:enums(SCHEMA.entityTypes.strategy.fields.kind)},property:{form:['quantity','judgement']},
 observation:{statistic:enums(SCHEMA.entityTypes.observation.fields.statistic),nature:['measured_result','qualitative_observation','declared']},source:{role:E.sourceRole,independence:E.independence},gap:{kind:enums(SCHEMA.entityTypes.gap.fields.kind)}};
const REQUIRED={need:['kind','dimension','direction'],situation:['kind'],cause:['kind'],strategy:['kind','action'],capability:['function'],observation:['about','property'],passage:['source'],source:['role'],property:['form']};
const FREE=new Set(['label','note','quote','text','locator','aliases']);
/** Validate one encoded item; returns {errors, warnings, counts}. */
export function validateEncoding(enc){
 const errors=[],warn=[];const ents=new Map();const T=SCHEMA.entityTypes,P=SCHEMA.predicates;
 for(const e of enc.entities??[]){if(!e.id||ents.has(e.id))errors.push(`entity id missing or duplicate: ${e.id}`);ents.set(e.id,e);
  if(!T[e.type]){errors.push(`${e.id}: unknown entity type ${e.type}`);continue;}
  for(const f of REQUIRED[e.type]??[])if(e[f]===undefined||e[f]===null||e[f]==='')errors.push(`${e.id}: ${e.type} needs ${f}`);
  for(const [f,vals] of Object.entries(EF[e.type]??{}))if(e[f]!=null&&!vals.includes(e[f]))errors.push(`${e.id}: ${f}=${e[f]} not in ${vals.join('|')}`);
  for(const f of Object.keys(e))if(!['id','type',...Object.keys(T[e.type].fields??{}),...FREE].includes(f))warn.push(`${e.id}: field ${f} not in the schema`);
  if(e.type==='need'&&e.kind==='contextual'&&(!e.generalNeed||!(e.contexts?.length)))errors.push(`${e.id}: contextual need needs generalNeed and contexts`);}
 const ref=(id,where)=>{if(typeof id!=='string'||!ents.has(id)){errors.push(`${where}: unknown entity ${JSON.stringify(id)}`);return null;}return ents.get(id);};
 const typeOk=(allowed,t,subjT)=>allowed.includes(t)||allowed.includes('any')||(allowed.includes('same type')&&t===subjT);
 const checkValue=(v,w)=>{if(!v||typeof v!=='object'){errors.push(`${w}: value object expected`);return;}if(!E.comparator.includes(v.comparator))errors.push(`${w}: comparator ${v.comparator}`);
  if(v.comparator==='range'?!(Array.isArray(v.number)&&v.number.length===2):typeof v.number!=='number')errors.push(`${w}: number`);};
 const checkCond=(c,w)=>{if(!E.condKind.includes(c.kind))errors.push(`${w}: condition kind ${c.kind}`);if(!E.force.includes(c.force))errors.push(`${w}: condition force ${c.force}`);
  if(c.stance&&!E.stance.includes(c.stance))errors.push(`${w}: stance ${c.stance}`);
  if(typeof c.ref==='string'){const r=ref(c.ref,w);if(r&&!['context','strategy','situation','need'].includes(r.type))errors.push(`${w}: condition on a ${r.type}`);}
  else if(c.ref&&typeof c.ref==='object'){ref(c.ref.property,w);checkValue(c.ref.value,w);}else errors.push(`${w}: condition ref`);};
 const ids=new Set();let nAssert=0;
 for(const a of enc.assertions??[]){nAssert++;const w=`assertion ${a.id}`;if(!a.id||ids.has(a.id))errors.push(`${w}: id missing or duplicate`);ids.add(a.id);
  const p=P[a.predicate];if(!p){errors.push(`${w}: unknown predicate ${a.predicate}`);continue;}
  const s=ref(a.subject,w),o=ref(a.object,w);if(s&&!typeOk(p.subject,s.type,null))errors.push(`${w}: ${a.predicate} subject cannot be ${s.type}`);
  if(o&&s&&!typeOk(p.object,o.type,s.type))errors.push(`${w}: ${a.predicate} object cannot be ${o.type}`);
  if(!E.asserted.includes(a.asserted))errors.push(`${w}: asserted ${a.asserted}`);
  for(const [f,q] of [['modality','modality'],['effect','effect'],['force','force'],['group','group'],['level','level']]){
   if(a[f]!=null&&!p.qualifiers.includes(q))errors.push(`${w}: ${a.predicate} does not take ${f}`);}
  if(a.modality!=null&&!E.modality.includes(a.modality))errors.push(`${w}: modality ${a.modality}`);if(a.effect!=null&&!E.effect.includes(a.effect))errors.push(`${w}: effect ${a.effect}`);
  if(a.force!=null&&!E.force.includes(a.force))errors.push(`${w}: force ${a.force}`);if(a.predicate==='contraindicated_for'&&a.force==null)errors.push(`${w}: contraindication without force`);
  if(a.level){ref(a.level.property,w);checkValue(a.level.value,w);}
  const cs=a.conditions??{logic:'all',items:[]};if(!E.logic.includes(cs.logic))errors.push(`${w}: logic ${cs.logic}`);(cs.items??[]).forEach((c,i)=>checkCond(c,`${w} condition ${i}`));
  const sc=a.scope??{};if(!E.scope.includes(sc.level))errors.push(`${w}: scope level ${sc.level}`);for(const r of [...(sc.refs??[]),...(sc.contexts??[])])ref(r,w);
  const ep=a.epistemic??{};if(!E.nature.includes(ep.claimNature))errors.push(`${w}: claimNature ${ep.claimNature}`);if(!E.review.includes(ep.review))errors.push(`${w}: review ${ep.review}`);
  if(ep.specificity&&!E.specificity.includes(ep.specificity))errors.push(`${w}: specificity ${ep.specificity}`);
  const ev=ep.evidence??{};if(!E.labelClass.includes(ev.labelClass))errors.push(`${w}: labelClass ${ev.labelClass}`);if(!E.sourceRole.includes(ev.sourceRole))errors.push(`${w}: sourceRole ${ev.sourceRole}`);
  if(!E.independence.includes(ev.independence))errors.push(`${w}: independence ${ev.independence}`);
  if(!(a.support?.length))errors.push(`${w}: no support`);for(const s2 of a.support??[]){const pe=ref(s2.passage,w);if(pe&&pe.type!=='passage')errors.push(`${w}: support is not a passage`);}}
 for(const e of ents.values())if(e.type==='observation'){ref(e.about,e.id);ref(e.property,e.id);if(e.value&&typeof e.value==='object'&&'comparator' in e.value)checkValue(e.value,e.id);
  for(const [i,c] of (e.conditions??[]).entries())checkCond(c,`${e.id} condition ${i}`);}
 return {errors,warnings:warn,counts:{entities:ents.size,assertions:nAssert,unrepresented:(enc.unrepresented??[]).length}};
}
export const sha=t=>createHash('sha256').update(String(t)).digest('hex');
/** every identifier and enumerated value as a KR constant (ids that are not plain lower-case words are rewritten) */
const c=x=>{const t=String(x).toLowerCase().replace(/[^a-z0-9_]+/g,'_');return /^[a-z]/.test(t)?t:'x'+t;};
/** Facts for the km.2 program from an encoding plus a request frame. */
export function factsOf(enc,frame){
 const F={};const add=(p,...a)=>(F[p]??=[]).push(a);
 const ents=new Map((enc.entities??[]).map(e=>[e.id,e]));
 for(const e of ents.values()){add('et',e.id,e.type);if(e.type==='strategy')add('skind',e.id,e.kind);if(e.type==='need'&&e.dimension)add('needdir',e.id,e.dimension,e.direction);
  if(e.type==='observation'){add('obs',e.id,e.about,e.property,e.statistic??'single');if(e.nature==='measured_result'||e.measured===true)add('obsmeasured',e.id);
   for(const c of e.conditions??[])if(typeof c.ref==='string')add('obscond',e.id,c.ref);}}
 const asr=enc.assertions??[];
 for(const a of asr){add('asr',a.id,a.subject,a.predicate,a.object,a.asserted,a.modality??'none',a.effect??'none');
  if(a.predicate==='requires_capability'&&a.asserted==='affirmed'){add('req',a.subject,a.object,a.group??('g_'+a.object));if(a.level)add('reqlevel',a.subject,a.object,a.level.property);}
  if(a.force)add('force',a.id,a.force);
  const ev=a.epistemic?.evidence??{};if(a.epistemic?.claimNature==='hypothesis'||['proposed_not_tested','synthetic','hypothesis'].includes(ev.labelClass)||a.epistemic?.review==='refuted')add('hyp',a.id);
  for(const c of a.conditions?.items??[])if(typeof c.ref==='string')add('cond',a.id,c.kind,c.ref,c.force,c.stance??'holds');
  if(a.predicate==='has_capability'||a.predicate==='addresses')for(const b of asr)if(b!==a&&b.subject===a.subject&&b.predicate===a.predicate&&b.object===a.object&&b.asserted!==a.asserted&&a.asserted==='affirmed'){
   const ca=new Map((a.conditions?.items??[]).map(c=>[JSON.stringify(c.ref),c.stance??'holds'])),cb=(b.conditions?.items??[]);
   if(!cb.some(c=>ca.has(JSON.stringify(c.ref))&&ca.get(JSON.stringify(c.ref))!==(c.stance??'holds'))&&!(ca.size&&!cb.length)&&!(cb.length&&!ca.size))add('contra',a.id,b.id);}}
 // a required level met by an observation about K in the same unit, unless a measurement condition does not hold
 for(const a of asr)if(a.predicate==='requires_capability'&&a.level)for(const o of ents.values())if(o.type==='observation'&&o.property===a.level.property&&o.value&&typeof o.value.number==='number'&&o.value.unit===a.level.value.unit){
  const v=o.value.number,t=a.level.value.number,c=a.level.value.comparator;const ok={'>=':v>=t,'>':v>t,'<=':v<=t,'<':v<t,'=':v===t,approx:Math.abs(v-t)<=0.05*Math.abs(t)}[c];
  const bad=(o.conditions??[]).some(cn=>typeof cn.ref==='string'&&(frame.ctx??[]).some(x=>x.ref===cn.ref&&x.state==='does_not_hold'));if(ok&&!bad)add('levelmet',a.subject,a.object,o.about);}
 for(const x of frame.qtarget??[])add('qtarget',x);for(const x of frame.qartefact??[])add('qartefact',x);for(const x of frame.excluded??[])add('excluded',x);for(const x of frame.confirms??[])add('confirms',x);
 for(const c of frame.ctx??[])add('ctx',c.ref,c.state);
 // every identifier as a KR constant
 const out={};for(const [p,rows] of Object.entries(F))out[p]=rows.map(r=>r.map(c));return out;
}
export async function infer(enc,frame){
 const KR=await import('../dist/src/knowledge_rules.js');const cp=KR.compileRuleSet(RULES).get('km2');const m=KR.evaluate(cp,factsOf(enc,frame));
 const OUT=['solution','candidate','conditional','notsuitable','partialonly','somemembers','nopurchase','hypsolution','relevant','deniedreport','conflictreport','exstrat','posscause','confirmedcause','mechrel','consult','serves','deniedfor','contractx','demo','measuredelsewhere','measuredincomp','capconflict','presenceonly','levelunv','disadvantage','capok'];
 return Object.fromEntries(OUT.map(p=>[p,m.all(p).map(f=>f.args.join(' | '))]).filter(([,v])=>v.length));
}
