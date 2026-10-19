/**
 * R2 (owner S68, 2026-10-19): the typed, reversible link between the newer reader's values and the category teaching.
 *
 * Why this module. R1 (docs/plans/r1-conformity.md §7) showed two links, both inadequate:
 * - the inherited lexical link (`linkToMeasure272`) attaches a value to a taught measurement when one dimension word is
 *   shared, so it links values where no taught measurement applies;
 * - the R1 typed seam selected candidates from the same dimension words, so values with a known metric found no
 *   candidate (gamut coverage), and values of different measurands met as rivals (CADR vs air changes).
 * No existing module owns the alignment of taught measurements with typed measurands: the extraction plan
 * (`phase272_extraction_plan.ts`) is the older reader's guide and its identity must not change, and the quantity
 * knowledge (`quantity_knowledge.ts`) knows metrics, kinds and condition axes but not the teaching.
 *
 * What it does. Two steps, both reversible views (nothing is written to the store):
 * 1. **Translation with provenance.** Each taught measurement is read with the quantity knowledge's own vocabulary
 *    (metric terms, kind terms, unit forms, condition values), giving a typed descriptor: the measurands it measures
 *    (named in the concept's head, or only mentioned in its statement), the condition values it fixes, and the
 *    condition axes its requirements name. Every element records the words it came from.
 * 2. **Inference with proofs.** The link and its evidential force are derived by the KR programs `link` and
 *    `evidence` (`resources/quantity-knowledge/link-rules.v1.json`), so every link, abstention and force carries its
 *    derivation.
 *
 * What it does not do. It adds no recogniser and no category-specific rule. Taught words the quantity knowledge does not
 * type (e.g. "SDR" as a signal mode) are reported as untyped: a gap in the knowledge, never guessed. Shadow only: no
 * conclusion reaches the store, the ranking or the advice.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {compileRuleSet,evaluate,type CompiledProgram,type Fact,type Model,type RuleSet} from './knowledge_rules.js';
import {namedPhrases,normText,parseUnit,type QuantityKnowledge,type TypedQuantity} from './quantity_knowledge.js';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {relations247} from './phase247_category_relations.js';

/** lk.3 (owner review S70); link-rules.v1.json (lk.1) and v2 (lk.2, S69) stay loadable to reproduce earlier runs. */
export const LINK_RULES_FILE='link-rules.v3.json';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');

/** A teaching concept as the store holds it: its id (the concept's name), its statement and aliases. */
export interface TaughtConcept {id:string;statement:string;aliases?:readonly string[]}
/** The evidential force of a measured_by relation, from the source verification (R1 §7.1): direct = the measurement
 * establishes the outcome; partial = it contributes to assessing it; unverified = no verdict. */
export type RelationForce='direct'|'partial'|'unverified';
export interface TeachingMeasurement {concept:TaughtConcept;
 /** measured_by relations: the outcome and the force the verification gives the relation */
 outcomes:{outcome:string;force:RelationForce;relation:string}[];
 /** not_sufficient_for relations: outcomes for which the teaching says this measurement is an indirect indicator only */
 indirectFor:string[];
 /** requires_condition targets */
 conditions:TaughtConcept[]}
export interface TeachingView {category:string;measurements:TeachingMeasurement[];
 /** what the view was built from, so a reading that used it is reproducible */
 basis:{items:number;relations:number;forceOverlay:string|null}}
/** Source-verification verdicts by relation id (`support`, `sufficiency`), as `pee-knowledge/knowledge-overlays/`. */
export interface ForceOverlay {id:string;relations:Record<string,{support:string;sufficiency?:string}>}

/** Build the teaching view of a category from the store (read only). Taught measurements that are themselves the target
 * of a requires_condition relation are conditions, not measurements (as in the extraction plan). A relation the
 * verification found not supported, or not found in the source, is left out; its force otherwise follows the verdict. */
export function teachingView(store:KnowledgeStore246,category:string,overlay?:ForceOverlay|null):TeachingView{
 const items=store.categoryItems246(category);const rels=relations247(store,category);
 const byItem=new Map(items.map(i=>[i.itemId,i]));const ref=(r:string)=>r.startsWith('item:')?byItem.get(r.slice(5)):undefined;
 const concept=(i:NonNullable<ReturnType<typeof ref>>):TaughtConcept=>({id:i.concept!.id,statement:i.statement,aliases:i.concept!.aliases});
 const condIds=new Set(rels.filter(r=>r.kind==='requires_condition').map(r=>ref(r.to)?.concept?.id).filter(Boolean));
 const verdict=(rid:string)=>overlay?.relations[rid];
 const usable=(rid:string)=>{const v=verdict(rid);return !v||v.support==='supported'||v.support==='partially_supported';};
 const force=(rid:string):RelationForce=>{const s=verdict(rid)?.sufficiency;return s==='establishes'?'direct':s==='informs_only'?'partial':'unverified';};
 const ms=items.filter(i=>i.concept?.kind==='measurement'&&!condIds.has(i.concept.id));
 const seen=new Set<string>();const measurements:TeachingMeasurement[]=[];
 for(const m of ms){if(seen.has(m.concept!.id))continue;seen.add(m.concept!.id);
  const mine=rels.filter(r=>ref(r.from)?.concept?.id===m.concept!.id&&usable(r.relationId));
  const to=(r:typeof rels[number])=>ref(r.to);
  measurements.push({concept:concept(m),
   outcomes:mine.filter(r=>r.kind==='measured_by'&&to(r)?.concept).map(r=>({outcome:to(r)!.concept!.id,force:force(r.relationId),relation:r.relationId})),
   indirectFor:[...new Set(mine.filter(r=>r.kind==='not_sufficient_for'&&to(r)?.concept).map(r=>to(r)!.concept!.id))],
   conditions:mine.filter(r=>r.kind==='requires_condition'&&to(r)?.concept).map(r=>concept(to(r)!))});}
 measurements.sort((a,b)=>a.concept.id.localeCompare(b.concept.id));
 return {category,measurements,basis:{items:items.length,relations:rels.length,forceOverlay:overlay?.id??null}};
}

export interface Measurand {kind:string;metric:string|null;level:'head'|'body';from:string}
export interface MeasurementDescriptor {id:string;measurands:Measurand[];fixed:{axis:string;value:string;from:string}[];
 axes:{axis:string;from:string}[];
 /** words of the concept's name that the quantity knowledge does not type: what the teaching says and PEE cannot read */
 untyped:string[]}

/** "<measurand> by|at|per <conditions>": what precedes the first such word names what is measured. */
const HEAD_SPLIT=/\s(?:by|at|per|for|with|across|under|versus|vs|in|on|over)\s/;
const STOP=new Set(['and','or','the','a','an','of','to','vs','versus','by','at','per','for','with','in','on','over','under','across','plus']);
/** The first sentence of a teaching statement, without the "Condition:" prefix and the source tail. */
export function statementHead(s:string):string{return (s.replace(/^Condition:\s*/,'').split(/(?<=[.;])\s|\s\[|\sPackage\s/)[0]??s).trim();}
const words=(s:Set<string>)=>[...s].flatMap(h=>h.split(' '));

/** Step 1: translate a taught measurement into a typed descriptor with the quantity knowledge's vocabulary. */
export function describeMeasurement(qk:QuantityKnowledge,c:TaughtConcept,conditions:readonly TaughtConcept[]=[]):MeasurementDescriptor{
 const heads=[c.id.replace(/_/g,' '),...(c.aliases??[])];
 const head=heads.join(' ; ');
 // the split word must follow a first word ("in situ sound pressure" is all measurand)
 const measurandPart=heads.map(h=>h.split(HEAD_SPLIT)[0]).join(' ; ');
 const conditionPart=heads.map(h=>{const i=h.search(HEAD_SPLIT);return i<0?'':h.slice(i);}).join(' ; ');
 const body=statementHead(c.statement);
 const measurands:Measurand[]=[];const typed=new Set<string>();
 const add=(m:Measurand)=>{const same=measurands.find(x=>x.kind===m.kind&&x.metric===m.metric);if(!same)measurands.push(m);else if(same.level==='body'&&m.level==='head')Object.assign(same,m);};
 for(const [text,level] of [[measurandPart,'head'],[body,'body']] as const){
  for(const m of qk.metrics.values()){const hit=namedPhrases(text,m.terms);if(hit.size){add({kind:m.kind,metric:m.id,level,from:[...hit].join('/')});if(level==='head')for(const w of words(hit))typed.add(w);}}
  if(level==='body')continue; // kinds and units only from the name: a statement mentions many quantities it does not measure
  for(const k of qk.kinds.values()){const hit=namedPhrases(text,k.terms);if(hit.size){add({kind:k.id,metric:null,level,from:[...hit].join('/')});for(const w of words(hit))typed.add(w);}}
  for(const tok of normText(text).split(/[\s;]+/)){if(tok.length<2||/^\d+$/.test(tok)||STOP.has(tok))continue;const u=parseUnit(qk,tok);
   if(u&&u.kinds.length===1&&u.atoms.length){add({kind:u.kinds[0],metric:null,level,from:tok});typed.add(tok);}}}
 const fixed:{axis:string;value:string;from:string}[]=[];const axes:{axis:string;from:string}[]=[];
 const need=(axis:string,from:string)=>{if(qk.axes.has(axis)&&!axes.some(x=>x.axis===axis))axes.push({axis,from});};
 for(const a of qk.axes.values()){
  for(const [v,terms] of Object.entries(a.values??{})){const hit=namedPhrases(head,terms);if(hit.size){fixed.push({axis:a.id,value:v,from:[...hit].join('/')});for(const w of words(hit))typed.add(w);}}
  // the concept's name may name an axis by its name or a distinctive cue ("by window"); a requires_condition statement
  // must name the axis itself ("the same fan setting"): cues are too general for running text
  const inName=namedPhrases(conditionPart,[a.id.replace(/_/g,' '),...(a.cues??[]).filter(x=>x.length>=6)]);
  if(inName.size){need(a.id,`name (${[...inName].join('/')})`);for(const w of words(inName))typed.add(w);}
  for(const k of conditions){const hit=namedPhrases(k.id.replace(/_/g,' ')+' ; '+statementHead(k.statement),[a.id.replace(/_/g,' ')]);if(hit.size)need(a.id,`requires_condition:${k.id}`);}}
 // a metric's own required conditions belong to its values (TypedQuantity.missingConditions), not to the measurement:
 // a CADR needs its pollutant, the sound level measured in the same programme does not
 const untyped=[...new Set(normText(c.id.replace(/_/g,' ')).split(/\s+/))].filter(w=>w.length>1&&!STOP.has(w)&&!typed.has(w));
 return {id:c.id,measurands,fixed,axes,untyped};
}

// ---------------------------------------------------------------------------------------------------------------------
let cached:{rules:Map<string,CompiledProgram>;version:string;digest:string}|null=null;
/** Load (and validate) the link rules. Pass a rule set to evaluate another version. */
export function loadLinkRules(rs?:RuleSet):{rules:Map<string,CompiledProgram>;version:string;digest:string}{
 if(!rs&&cached)return cached;
 const src=rs?JSON.stringify(rs):readFileSync(new URL('../../resources/quantity-knowledge/'+LINK_RULES_FILE,import.meta.url),'utf8');
 const parsed=rs??JSON.parse(src) as RuleSet;const out={rules:compileRuleSet(parsed),version:parsed.version,digest:sha(src)};if(!rs)cached=out;return out;
}

/** A value the newer reader found, as the link needs it. */
export interface LinkValue {id:string;quantity:TypedQuantity;product:string|null;
 /** S70: the source document (and, when known, the test) the value comes from: an observation's provenance */
 source?:string|null}
export type LinkStatus='linked'|'linked_condition_not_shown'|'linked_equivalent'|'ambiguous'|'member_only'|'no_taught_measurement'|'not_linked';
export interface LinkResult {value:string;status:LinkStatus;measurements:string[];
 /** S69: the analytical sets the value is a member of (not exclusive, not evidence of the set's relationship) */
 memberships:string[];
 /** S69: the original observation the value reports (shared by repeated reports) */
 observation:string;
 /** what the value bears on: outcome, force (direct, partial, unverified, indirect, conditions_not_shown), measurement */
 evidence:{outcome:string;force:string;measurement:string}[];
 /** for an ambiguity: condition axes that would decide it and the value does not state; empty = nothing in the
  * knowledge tells the candidates apart */
 decidingAxes:string[];
 derivation:string[]}
export interface OutcomeAssessment {product:string;outcome:string;assessment:string;derivation:string[]}
export interface LinkReading {schema:'pee.r2.knowledge-link.v1';rules:string;view:TeachingView['basis'];descriptors:MeasurementDescriptor[];
 results:LinkResult[];outcomes:OutcomeAssessment[];
 /** S69: relationships of analytical sets supported by aligned observations (a point at one setting, or two or more points) */
 relationships:{product:string;measurement:string;kind:'aligned_point'|'relationship_at_points'|'compatibility_not_shown';axis:string|null;setting:string|null;
  /** S70: how compatibility is shown: same_document (one source's protocol) or stated_method */
  basis:string|null;derivation:string[]}[];
 /** S69: values that report the same observation */
 repeatedReports:[string,string][];
 /** shadow only: never stored, never a ranking input */
 rankingInput:false}

/** S69: the measurand groups of a descriptor (head measurands only). Measurands named by the same words, or of the same
 * kind, are one group ("noise" gives two sound kinds; a metric and its kind are one); a measurement of two or more
 * groups is an analytical set. */
export function measurandGroups(d:MeasurementDescriptor):{group:string;kinds:string[];metrics:string[]}[]{
 const gs:{group:string;kinds:Set<string>;metrics:Set<string>;from:Set<string>}[]=[];
 for(const m of d.measurands.filter(x=>x.level==='head')){
  const hit=gs.filter(g=>g.from.has(m.from)||g.kinds.has(m.kind));
  const g=hit[0]??{group:'',kinds:new Set<string>(),metrics:new Set<string>(),from:new Set<string>()};if(!hit.length)gs.push(g);
  for(const o of hit.slice(1)){o.kinds.forEach(k=>g.kinds.add(k));o.metrics.forEach(k=>g.metrics.add(k));o.from.forEach(k=>g.from.add(k));gs.splice(gs.indexOf(o),1);}
  g.kinds.add(m.kind);if(m.metric)g.metrics.add(m.metric);g.from.add(m.from);}
 return gs.map(g=>({group:[...g.from].sort().join('+'),kinds:[...g.kinds].sort(),metrics:[...g.metrics].sort()}));
}
/** S69/S70: the identity of an original observation is its provenance: the source document, product, measured
 * property, value and conditions. One figure printed twice in one document (a table and the prose) is one observation;
 * the same number from two sources is two observations. A value without a known source or product is its own. */
export function observationKey(v:LinkValue):string{const q=v.quantity;
 if(!v.source||!v.product)return 'unique:'+v.id;
 const prop=q.metric.id??q.kind.id??q.kind.candidates.join('|');const val=q.si?.value??q.value;
 return [v.source,v.product,prop,String(val),q.conditions.map(c=>c.axis+'='+c.value).sort().join(';')].join('\u0001');
}
/** The input facts of the `link` program for a set of values and descriptors (exported for tests and the census). */
export function linkFacts(view:TeachingView,descriptors:readonly MeasurementDescriptor[],values:readonly LinkValue[],qk?:QuantityKnowledge):Record<string,(string|number)[][]>{
 const I:Record<string,(string|number)[][]>={value:[],value_kind:[],value_metric:[],value_condition:[],value_missing:[],value_product:[],value_source:[],observation:[],incomplete:[],closed_axis:[],measurement:[],measures:[],measures_metric:[],group_kind:[],group_metric:[],fixes:[],requires_axis:[],leads_to:[],indirect_for:[]};
 for(const v of values){const q=v.quantity;I.value.push([v.id]);
  for(const k of q.kind.id?[q.kind.id]:q.kind.candidates)I.value_kind.push([v.id,k]);
  if(q.metric.id)I.value_metric.push([v.id,q.metric.id]);
  for(const c of q.conditions)I.value_condition.push([v.id,c.axis,c.value]);
  for(const a of q.missingConditions)I.value_missing.push([v.id,a]);
  if(v.product)I.value_product.push([v.id,v.product]);
  if(v.source)I.value_source.push([v.id,v.source]);
  I.observation.push([v.id,observationKey(v)]);}
 for(const d of descriptors){I.measurement.push([d.id]);if(d.untyped.length)I.incomplete.push([d.id]);
  for(const g of measurandGroups(d)){for(const k of g.kinds)I.group_kind.push([d.id,g.group,k]);for(const x of g.metrics)I.group_metric.push([d.id,g.group,x]);}
  for(const m of d.measurands){if(m.metric)I.measures_metric.push([d.id,m.metric,m.level]);
   if(!m.metric||m.level==='head')I.measures.push([d.id,m.kind,m.level]);}
  for(const f of d.fixed)I.fixes.push([d.id,f.axis,f.value]);for(const a of d.axes)I.requires_axis.push([d.id,a.axis]);}
 for(const m of view.measurements){for(const o of m.outcomes)I.leads_to.push([m.concept.id,o.outcome,o.force]);for(const o of m.indirectFor)I.indirect_for.push([m.concept.id,o]);}
 if(qk)for(const a of qk.axes.values())if(Object.keys(a.values??{}).length)I.closed_axis.push([a.id]);
 for(const k of Object.keys(I))I[k]=[...new Map(I[k].map(r=>[r.join('\u0001'),r])).values()];
 return I;
}

/** Step 2: link values to taught measurements and grade what they bear on, with the KR programs `link` and `evidence`. */
export function linkValues(qk:QuantityKnowledge,view:TeachingView,values:readonly LinkValue[],opts:{rules?:RuleSet;descriptors?:MeasurementDescriptor[]}={}):LinkReading{
 const R=loadLinkRules(opts.rules);const link=R.rules.get('link'),ev=R.rules.get('evidence');if(!link||!ev)throw Error('knowledge_link_rules_missing_program');
 const descriptors=opts.descriptors??view.measurements.map(m=>describeMeasurement(qk,m.concept,m.conditions));
 const I=linkFacts(view,descriptors,values,qk);
 // a rule version receives only the facts its vocabulary declares (lk.1 reproduces earlier runs)
 const only=(p:CompiledProgram,F:Record<string,(string|number)[][]>)=>Object.fromEntries(Object.entries(F).filter(([k])=>p.vocab.has(k)&&(p.vocab.get(k)!.role==='input'||!p.rules.some(r=>r.head.pred===k))));
 const ml=evaluate(link,only(link,I),{record:'the values and the teaching view'});
 const pass=(m:Model,pred:string)=>m.all(pred).map(f=>f.args);
 const me=evaluate(ev,only(ev,{...I,member:pass(ml,'member'),member_group:pass(ml,'member_group'),
  link_to:[...pass(ml,'linked').map(a=>[a[0],a[1]]),...pass(ml,'linked_equivalent')],assumes_condition:pass(ml,'linked').filter(a=>a[2]==='condition_not_shown').map(a=>[a[0],a[1]])}),
  {record:'the links and the teaching view'});
 const results:LinkResult[]=values.map(v=>{const linked=ml.match('linked',[v.id,null,null]),eq=ml.match('linked_equivalent',[v.id,null]),amb=ml.match('ambiguous',[v.id,null]);
  const none=ml.match('no_taught_measurement',[v.id]),mem=ml.match('member',[v.id,null]);
  const status:LinkStatus=linked.length?(linked[0].args[2]==='condition_not_shown'?'linked_condition_not_shown':'linked'):eq.length?'linked_equivalent':amb.length?'ambiguous':
   ml.has('member_only',[v.id])?'member_only':none.length?'no_taught_measurement':'not_linked';
  const measurements=[...new Set([...linked,...eq,...amb].map(f=>f.args[1]))].sort();
  const evidence=me.match('evidence_force',[v.id,null,null,null]).map(f=>({outcome:f.args[1],force:f.args[2],measurement:f.args[3]}));
  const decidingAxes=[...new Set(ml.match('deciding_axis',[v.id,null]).map(f=>f.args[1]))].sort();
  const shown:Fact[]=[...linked,...eq,...amb,...mem,...none].slice(0,3);
  return {value:v.id,status,measurements,memberships:mem.map(f=>f.args[1]).sort(),observation:observationKey(v),evidence,decidingAxes,derivation:shown.flatMap(f=>ml.why(f))};});
 const outcomes:OutcomeAssessment[]=me.all('outcome_assessment').map(f=>({product:f.args[0],outcome:f.args[1],assessment:f.args[2],derivation:me.why(f)}));
 const relationships=[...me.all('aligned_point').map(f=>({product:f.args[0],measurement:f.args[1],kind:'aligned_point' as const,axis:f.args[2],setting:f.args[3],basis:f.args[4]??null,derivation:me.why(f)})),
  ...me.all('compatibility_not_shown').map(f=>({product:f.args[0],measurement:f.args[1],kind:'compatibility_not_shown' as const,axis:f.args[2],setting:f.args[3],basis:null,derivation:me.why(f)})),
  ...me.all('relationship_at_points').map(f=>({product:f.args[0],measurement:f.args[1],kind:'relationship_at_points' as const,axis:null,setting:null,basis:null,derivation:me.why(f)}))];
 const repeatedReports=ml.all('repeated_report').map(f=>[f.args[0],f.args[1]] as [string,string]).filter(([a,b])=>a<b);
 return {schema:'pee.r2.knowledge-link.v1',rules:`${R.version}:${R.digest.slice(0,12)}`,view:view.basis,descriptors,results,outcomes,relationships,repeatedReports,rankingInput:false};
}
