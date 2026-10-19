/** S87e — reconstruction of observation-contract slots from the original document context and general knowledge (SHADOW).
 *
 * The stored tables leave slots unknown (contract v0.3 census). This module fills them only as INFERRED, each with the
 * technique, the rule and the context field that supplied it, or leaves them undetermined. Three techniques, compared in
 * the pre-registered S87e experiment:
 *  A: the value and its own label, typed with the shared quantity knowledge (QK) and the S87b structural classifier;
 *  B: A plus document roles (row and column headers, table header row, caption), following the document-level evidence
 *     rules studied in S87c (same element, header bridge);
 *  C: B with every slot decided by the agreement of independent signals; disagreement abstains (majority vote with
 *     abstention, the weak-supervision baseline).
 * No product, publisher or category vocabulary: units, kinds, scales and standards come from the QK pack; the remaining
 * cue words are generic English (per, at, in ... mode, number of) and document structure. */
import {parseUnit,typeQuantity,hasPhrase,type QuantityKnowledge} from './quantity_knowledge.js';
import {classifyCondition87,measurandBasis87} from './observation_model.js';

export type Technique='A'|'B'|'C';
export interface DeclarationContext {label:string;rawValue:string;valueJson:Record<string,unknown>|null;unit?:string|null;rowHeader?:string|null;colHeader?:string|null;
 tableHeader?:string|null;tableCaption?:string|null;section?:string|null;headings?:string[];window?:string|null;pageTitle?:string|null;structured?:boolean}
export interface Reconstructed<T> {value:T|null;state:'inferred'|'undetermined';rule:string|null;from:string|null}
export interface DeclarationReconstruction {
 technique:Technique;form:'quantity'|'categorical';
 quantityKind:Reconstructed<string>;basis:Reconstructed<string>;constraints:{dimension:string;value:string;from:string}[];
 objectOfInterest:Reconstructed<string>;procedure:Reconstructed<string>;categoricalScale:Reconstructed<'nominal'|'ordinal'|'boolean'>;
}
const und=<T>():Reconstructed<T>=>({value:null,state:'undetermined',rule:null,from:null});
const inf=<T>(value:T,rule:string,from:string):Reconstructed<T>=>({value,state:'inferred',rule,from});
const NUMERIC=new Set(['quantity','price','number','range','dimensions','options']);
// coarse kinds (the reference's vocabulary) from QK kinds
const COARSE:Record<string,string>={sound_pressure_level:'sound_level',sound_power_level:'sound_level',luminance:'luminance',illuminance:'luminance',volumetric_flow_rate:'flow_rate',
 ratio:'ratio_or_percentage',amount_fraction:'ratio_or_percentage',relative_humidity:'ratio_or_percentage',duration:'duration',energy:'energy',energy_per_event:'energy',
 periodic_energy_consumption:'energy',power:'power',volume:'volume',volume_per_event:'volume',periodic_volume:'volume',length:'length',area:'area',mass:'mass',
 temperature:'temperature',voltage:'voltage',electric_current:'electric_current',frequency:'frequency',pressure:'pressure',rotational_speed:'speed',electric_charge:'other',
 colour_difference:'other',air_change_rate:'other',mass_concentration:'other',signal_to_noise_ratio:'other',electrical_resistance:'other',volume_per_energy:'other'};
const coarse=(ks:string[])=>{const c=[...new Set(ks.map(k=>COARSE[k]??'other'))];return c.length===1?c[0]!:null;};
const STANDARD=/\b(?:ISO|IEC|EN|BS|DIN|ANSI|AHAM|ASTM|IEEE|UL|CSA|JIS)(?:\s*\/\s*[A-Z]+)?[\s-]*[A-Z]{0,3}[\s-]?\d{2,5}(?:[-.:]\d+)*\b/;
// a unit stated next to a label: "Weight (kg)", "Capacity in litres", "[mm]"
const unitInText=(qk:QuantityKnowledge,t:string|null|undefined):string|null=>{if(!t)return null;
 for(const m of t.matchAll(/[([]\s*([^()[\]]{1,12}?)\s*[)\]]|\bin\s+([a-zA-Zµ°³²/]{1,10})\b/g)){const u=(m[1]??m[2]??'').trim();if(u&&parseUnit(qk,u))return u;}return null;};
const kindOfUnit=(qk:QuantityKnowledge,unit:string,words:string)=>{const p=parseUnit(qk,unit);if(!p)return null;const t=typeQuantity(qk,{surface:`1 ${unit}`,value:1,unit:p},{labels:[words]});
 return t.kind.id?[t.kind.id]:t.kind.candidates;};
// label qualifiers: parentheses that are not a unit, "at ...", "in ... mode"
const qualifiers=(qk:QuantityKnowledge,label:string):string[]=>{const out:string[]=[];
 for(const m of label.matchAll(/\(([^()]{1,40})\)/g)){const x=m[1]!.trim();if(!parseUnit(qk,x))out.push(x);}
 for(const m of label.matchAll(/\b(?:at|@)\s+([^,;()]{1,30})/gi))out.push(m[1]!.trim());
 for(const m of label.matchAll(/\bin\s+([^,;()]{1,25}?\s+(?:mode|setting|programme|program|cycle))\b/gi))out.push(m[1]!.trim());
 return out;};
// "<object> <kind word>": the words before a quantity-kind term name the part the value is about ("battery capacity")
const objectOf=(qk:QuantityKnowledge,label:string):string|null=>{const words=qk.pack.kinds.flatMap(k=>[...(k.terms??[]),...(k.discriminators??[])]).filter(w=>w.length>3);
 const l=label.replace(/\([^)]*\)/g,' ').replace(/[:*]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
 for(const w of words.sort((a,b)=>b.length-a.length)){const i=l.indexOf(' '+w);if(i>0&&new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`).test(l)){const head=l.slice(0,i).trim();
  if(head&&head.split(' ').length<=3&&!/^(?:max(?:imum)?|min(?:imum)?|rated|total|net|gross|typical|nominal|average|overall|peak|approx\.?|product|item)$/.test(head))return head;}}
 return null;};

function signalsKind(qk:QuantityKnowledge,c:DeclarationContext,t:Technique):{kind:string|null;rule:string;from:string}[]{
 const v=c.valueJson??{};const vk=String(v.kind??'');const out:{kind:string|null;rule:string;from:string}[]=[];
 if(vk==='price'){out.push({kind:'price',rule:'value is a price (currency)',from:'value'});return out;}
 const unit=typeof v.unit==='string'?v.unit:c.unit??null;
 if(unit){const ks=kindOfUnit(qk,unit,c.label);if(ks?.length)out.push({kind:coarse(ks),rule:`QK unit ${unit}`,from:'value'});}
 if(!unit&&/\bnumber of\b|^(?:no\.?|count|qty) of\b/i.test(c.label))out.push({kind:'count',rule:'label counts items ("number of")',from:'label'});
 if(t!=='A'&&!unit){for(const [f,txt] of [['label',c.label],['colHeader',c.colHeader],['rowHeader',c.rowHeader],['tableHeader',c.tableHeader]] as const){const u=unitInText(qk,txt);
  if(u){const ks=kindOfUnit(qk,u,c.label);if(ks?.length){out.push({kind:coarse(ks),rule:`QK unit ${u} stated in the ${f}`,from:f});break;}}}}
 if(t==='C'){// the label's kind words (QK kind terms) as an independent signal
  const hits=qk.pack.kinds.filter(k=>[...(k.discriminators??[]),...(k.terms??[])].some(w=>w.length>3&&hasPhrase(c.label,w)));if(hits.length)out.push({kind:coarse(hits.map(h=>h.id)),rule:'QK kind terms in the label',from:'label'});}
 return out;
}
export function reconstructDeclaration(qk:QuantityKnowledge,c:DeclarationContext,t:Technique):DeclarationReconstruction{
 const v=c.valueJson??{};const vk=String(v.kind??'');const form=NUMERIC.has(vk)?'quantity':'categorical';
 const r:DeclarationReconstruction={technique:t,form,quantityKind:und(),basis:und(),constraints:[],objectOfInterest:und(),procedure:und(),categoricalScale:und()};
 const texts:[string,string|null|undefined][]=t==='A'?[['label',c.label]]:[['label',c.label],['colHeader',c.colHeader],['rowHeader',c.rowHeader],['tableHeader',c.tableHeader],['tableCaption',c.tableCaption]];
 // quantity kind
 if(form==='quantity'){const sig=signalsKind(qk,c,t).filter(s=>s.kind);
  if(t==='C'){const kinds=[...new Set(sig.map(s=>s.kind))];if(kinds.length===1)r.quantityKind=inf(kinds[0]!,sig.map(s=>s.rule).join(' + '),sig[0]!.from);}
  else if(sig[0])r.quantityKind=inf(sig[0].kind!,sig[0].rule,sig[0].from);}
 // basis
 const unit=typeof v.unit==='string'?v.unit:'';
 const bases=texts.map(([f,x])=>x?{f,b:measurandBasis87(x,f==='label'?unit:'')}:null).filter((x):x is {f:string;b:ReturnType<typeof measurandBasis87>}=>!!x&&x.b.basis!=='none');
 if(form==='quantity'){const uniq=[...new Set(bases.map(x=>x.b.basis))];
  if(bases.length&&(t!=='C'||uniq.length===1)){const x=bases[0]!;const per=x.b.basis==='per_time_period'?(/h(?:our|r)?\b/.test(x.b.cue??'')?'per_hour':'per_year'):x.b.basis==='per_task_or_cycle'?'per_cycle_or_use':x.b.basis==='per_portion_or_unit'?'per_unit_or_portion':x.b.basis;
   r.basis=inf(per,`basis cue "${x.b.cue}"`,x.f);}}
 // constraints: qualifiers of the label (A), plus header and caption qualifiers (B, C), typed by structure (S87b)
 const qs:[string,string][]=qualifiers(qk,c.label).map(q=>['label',q]);
 if(t!=='A')for(const [f,x] of texts.slice(1))if(x)for(const q of qualifiers(qk,x))qs.push([f,q]);
 for(const [f,q] of qs){const k=classifyCondition87(qk,q,null);if(k.class==='unclassified'||k.class==='identity'||k.class==='comparison_or_basis')continue;
  if(t==='C'&&k.class==='quantity'&&!k.kind)continue;
  r.constraints.push({dimension:k.class==='quantity'?`quantity:${k.kind}`:k.class,value:q,from:f});}
 // object of interest
 const obj=objectOf(qk,c.label);if(obj)r.objectOfInterest=inf(obj,'words before a QK kind term in the label','label');
 // named procedure: a standard designation in the label (A) or headers/caption (B, C)
 for(const [f,x] of texts){const m=x?STANDARD.exec(x):null;if(m){r.procedure=inf(m[0],'standard designation pattern',f);break;}}
 if(r.procedure.state==='undetermined')for(const m of qk.pack.methods??[])if(m.terms.some(w=>w.length>4&&texts.some(([,x])=>x&&hasPhrase(x,w)))){r.procedure=inf(m.id,'QK method terms','label');break;}
 // categorical scale
 if(form==='categorical'){const val=String((v as {text?:unknown}).text??c.rawValue??'').trim();
  if(vk==='boolean'||/^(?:yes|no|true|false|✓|✗|✔|✘|n\/a)$/i.test(val))r.categoricalScale=inf('boolean','yes/no value','value');
  else{const sc=(qk.pack.scales??[]).find(s=>s.terms.some(w=>hasPhrase(c.label,w))&&s.values.some(x=>new RegExp(`^${x.replace(/[+]/g,'\\+')}\\+*$`,'i').test(val)));
   if(sc)r.categoricalScale=inf('ordinal',`QK scale ${sc.id}`,'label');
   else if(t==='C'&&/^[A-G]\+{0,3}$/.test(val)&&/\b(?:class|rating|grade)\b/i.test(c.label))r.categoricalScale=inf('ordinal','a graded class value','value');
   else r.categoricalScale=inf('nominal','non-graded text value','value');}}
 return r;
}
