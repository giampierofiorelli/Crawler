/** G1d (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-g1d-authorisation-2026-10-21.md; preregistration evaluation/g1d/preregistration.json). SHADOW.
 *
 * Scientific relation integrity: situation -> strategy and situation -> category relations derived only where a source
 * unit ASSERTS them, never from shared words. The G1c audit and the G1d source trace found that G1b's links came from
 * strategy words appearing anywhere in a row's guidance (51 of 70 sampled links concern nothing the source says) and that
 * most clauses which do assert a strategy sit in columns the G1b projection never kept (the N1 claim keeps only the
 * participants of its link chain). So this module:
 *  1. re-reads each projection row from its original source with EVERY cell, its header and its N1 column role
 *     (structured cases: every field, typed by the field's role; stored teaching items: their statement);
 *  2. decomposes each stored strategy's own teaching statement into the condition it applies under and the action it
 *     prescribes (English grammar of the statement: '<condition>: <action>', '<condition> needs <action>', 'may be met by
 *     <action>'); its negated parts are contra-actions;
 *  3. links a row to a strategy only when a clause of a non-situation cell names that strategy's action (an action term
 *     specific to the strategy) AND the clause means the action (sentence-embedding similarity to the action, a rank
 *     signal only, checked against the term); the relation keeps polarity (applies / conditional / contraindicated),
 *     the condition, the verbatim quote, the column header, the source's own epistemic label and its provenance;
 *  4. types the row's category applicability under the owner's rule (2026-10-21): a documented incompatibility with an
 *     essential requirement -> unsuitable; dependence on a modifiable or unverified condition -> conditional (never
 *     suitable); a nonessential disadvantage -> suitable with an assessed disadvantage; rows that are not consumer
 *     situations (measurement definitions, recipes, screening rules) -> not_a_purchase_situation.
 * Every relation is 'derived_unreviewed': nothing is promoted, written to the store or used for ranking.
 * Callers: scripts/g1d-*.mjs, src/verified_retrieval_g1d.ts, tests/g1d_relation_integrity.test.ts. No category, product
 * or phrase is named here. */
import {createHash} from 'node:crypto';
import {teachingTablesN1,columnRolesN1,type ColumnRoleN1} from './relation_claims_n1.js';
import {stemsNI} from './need_interpretation.js';
import {stanceAt,scopeVocabulary,tokens} from './language_scope.js';
import {FUNCTION_WORDS80} from './request_coverage80.js';
import type {ProjectionG1b,SituationRowG1b,StrategyG1b,KnowledgeDocG1b} from './situation_knowledge_g1b.js';
import type {EmbedderG1c} from './semantic_embedding_g1c.js';
import {dotG1c} from './semantic_embedding_g1c.js';

export const G1D_RELATION_VERSION='g1d.r1.3';
export const G1D_RELATION_PARAMS={
 /** a clause naming a strategy-specific action term must also mean the action at least this much (bge cosine) */
 minActionSim:0.65,
 /** without a specific action term, a clause is never enough (co-mention and paraphrase are not assertions) */
 requireActionTerm:true,
 /** r1.1 (dev it1, reformulation 1): an action term must also be rare in the sources: present in at most this share of all
  * source cells (a word frequent everywhere, e.g. a generic property, names no particular action) */
 maxTermCellShare:0.03,
 /** r1.2 (dev it2, reformulation 2): the clause is compared with the strategy's WHOLE teaching statement (the condition it
  * applies under and its action), so that a shared word in another sense ('moisture' of a food) does not match */
 compareWholeStatement:true};
/** r1.1: cells whose role can assert a strategy (what to do, what to avoid, under which condition, with which evidence);
 * situation, need, property, identifier and value cells describe the case, they do not prescribe */
const ASSERTING_ROLES=new Set(['alternative','function','caveat','condition','evidence','method','other','teaching']);

export type CellRoleG1d=ColumnRoleN1|'teaching'|'field';
export interface SourceCellG1d {header:string;role:CellRoleG1d;text:string}
export interface SourceRowG1d {rowId:string;category:string;kind:SituationRowG1b['kind'];cells:SourceCellG1d[];
 /** the source's own epistemic label (structured-case status/role, a 'PROPOSED' heading...), verbatim, or null */
 sourceStatus:string|null;headings:string[];provenance:SituationRowG1b['provenance'];complete:boolean}

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
/** r1.2: stems of a text with hyphenated compounds also split into their parts ('tank-fed' -> tank, fed) */
const stemsG1d=(t:string)=>stemsNI(t.replace(/(\w)-(\w)/g,'$1 $2'));
/** structured-case fields and the role they play (field names are the packages' schema, not content) */
const FIELD_ROLE:Record<string,CellRoleG1d>={consumer_utterance:'situation',synthetic_utterance:'situation',utterance:'situation',goal:'need',
 requirement:'need',technical_requirement_or_evidence:'property',candidate_or_alternative:'alternative',conditional_evidence_or_rejection:'condition',
 forbidden_inference:'caveat',incorrect_inference_to_avoid:'caveat'};
const STATUS_FIELDS=['case_status','evidence_role','status'];

/** Re-read every projection row from its original source, keeping all cells (stage 0 of relation integrity). */
export function sourceRowsG1d(P:ProjectionG1b,docs:readonly KnowledgeDocG1b[]):Map<string,SourceRowG1d>{
 const out=new Map<string,SourceRowG1d>();const byPath=new Map(docs.map(d=>[d.path,d]));
 const tables=new Map<string,ReturnType<typeof teachingTablesN1>>();
 for(const r of P.rows){const p=r.provenance;const base={rowId:r.id,category:r.category,kind:r.kind,provenance:p};
  if(r.kind==='store_concept'){out.set(r.id,{...base,cells:[{header:'stored teaching item',role:'teaching',text:[r.expression,...r.guidance].join(' | ')}],sourceStatus:null,headings:[],complete:true});continue;}
  const d=byPath.get(p.document);if(!d){out.set(r.id,{...base,cells:fallbackCells(r),sourceStatus:null,headings:[],complete:false});continue;}
  if(r.kind==='structured_case'){let j:Record<string,unknown>={};try{j=JSON.parse(d.text);}catch{/* keep fallback */}
   const list=((j.cases??j.needs??j.scenarios??[]) as Record<string,unknown>[]);
   const c=list.find(x=>x.id===p.caseId)??list.find(x=>{const u=(x.consumer_utterance??x.synthetic_utterance??x.utterance);return typeof u==='string'&&r.expression.startsWith(u);});
   if(!c){out.set(r.id,{...base,cells:fallbackCells(r),sourceStatus:null,headings:[],complete:false});continue;}
   const cells=Object.entries(c).filter(([k,v])=>typeof v==='string'&&FIELD_ROLE[k]).map(([k,v])=>({header:k,role:FIELD_ROLE[k],text:String(v)}));
   const st=STATUS_FIELDS.map(k=>c[k]).filter((v):v is string=>typeof v==='string');
   out.set(r.id,{...base,cells,sourceStatus:st.length?st.join('; '):null,headings:[],complete:true});continue;}
  if(!tables.has(d.path))tables.set(d.path,teachingTablesN1(d.text));
  const t=tables.get(d.path)!.find(x=>x.rows.some(y=>y.line===p.line));const row=t?.rows.find(y=>y.line===p.line);
  if(!t||!row){out.set(r.id,{...base,cells:fallbackCells(r),sourceStatus:null,headings:[],complete:false});continue;}
  const roles=columnRolesN1(t);
  const cells=row.cells.map((text,i)=>({header:t.header[i]??'',role:roles[i] as CellRoleG1d,text:text.trim()})).filter(c=>c.text);
  const lab=t.headings.map(h=>(h.match(/\(([A-Z][A-Z _-]{3,})\)/)?.[1]??null)).filter((x):x is string=>!!x);
  out.set(r.id,{...base,cells,sourceStatus:lab.length?lab.join('; '):null,headings:t.headings.slice(-2),complete:true});}
 return out;
}
const fallbackCells=(r:SituationRowG1b):SourceCellG1d[]=>[{header:'expression',role:'situation',text:r.expression},...r.guidance.map(g=>({header:'guidance',role:'other' as CellRoleG1d,text:g}))];

// ---- strategies: condition and action from their own teaching statement
export interface StrategyActionG1d {id:string;condition:string;action:string;contra:string[];actionTerms:string[]}
const ACTION_SPLIT=[/^(.*?):\s*(.+)$/s,/^(.*?)\bneeds?\b\s+(.+)$/is,/^(.*?)\bmay be met by\b\s+(.+)$/is];
/** Words of any strategy statement that carry no action of their own (English framing, not content). */
const FRAMING=new Set(['buying','buy','unnecessary','appliance','another','any','job','could','may','might','be','first','only','exists','fit','do','before','come','meet','need']);
export function strategyActionsG1d(strategies:readonly StrategyG1b[],corpusCells:readonly string[]=[]):StrategyActionG1d[]{
 const parsed=strategies.map(s=>{const st=s.statement.replace(/;?\s*buying may be unnecessary\.?/i,'').replace(/,?\s*so buying may be unnecessary\.?/i,'').trim();
  let condition='',action=st;for(const re of ACTION_SPLIT){const m=st.match(re);if(m&&m[1].trim()&&m[2].trim()){condition=m[1].trim();action=m[2].trim();break;}}
  // r1.1: an aside in parentheses is not the action; a subordinate 'only if / if / unless / provided' clause is a condition
  action=action.replace(/\([^)]*\)/g,' ').replace(/\s+/g,' ').trim();
  const sub=action.match(/^(.*?),?\s+\b(only if|if|unless|provided)\b\s+(.+)$/i);if(sub){action=sub[1].trim();condition=[condition,sub[2]+' '+sub[3]].filter(Boolean).join('; ');}
  // negated parts of the action are contra-actions ('not recirculating filtration', 'a purifier does not fix it')
  const parts=action.split(/[;,(]\s*/);const contra=parts.filter(x=>/\b(?:not|no|does not|doesn't|never)\b/i.test(x)).map(x=>x.replace(/[)\.]+$/,'').trim());
  const pos=parts.filter(x=>!contra.includes(x.replace(/[)\.]+$/,'').trim())).join(', ').replace(/[)\.]+$/,'').trim()||action;
  return {id:s.id,condition,action:pos,contra};});
 const stemsOf=(t:string)=>[...stemsG1d(t)].filter(x=>x.length>2&&!FUNCTION_WORDS80.has(x)&&!FRAMING.has(x));
 const df=new Map<string,number>();for(const p of parsed)for(const x of new Set(stemsOf(p.action)))df.set(x,(df.get(x)??0)+1);
 const cdf=new Map<string,number>();for(const c of corpusCells)for(const x of stemsG1d(c))cdf.set(x,(cdf.get(x)??0)+1);
 const rare=(x:string)=>!corpusCells.length||(cdf.get(x)??0)<=Math.max(1,G1D_RELATION_PARAMS.maxTermCellShare*corpusCells.length);
 return parsed.map(p=>({id:p.id,condition:p.condition,action:p.action,contra:p.contra,actionTerms:[...new Set(stemsOf(p.action))].filter(x=>(df.get(x)??0)<=1&&rare(x)).sort()}));
}

// ---- relations
export type PolarityG1d='applies'|'conditional'|'contraindicated';
export interface RelationG1d {rowId:string;strategy:string;polarity:PolarityG1d;condition:string|null;quote:string;header:string;
 matchedTerms:string[];similarity:number;nature:'expert_guidance'|'demonstrated_effectiveness'|'teaching';sourceStatus:string|null;
 provenance:SituationRowG1b['provenance'];quoteSha256:string;status:'derived_unreviewed';method:string}
const CONDITIONAL=/\b(?:if|only|unless|check|verify|confirm|where|when|depending|likely|may|might|provided|assess|consider|as appropriate|if appropriate)\b/i;
const DEMONSTRATED=/\b(?:tested|measured|trial|randomi[sz]ed|study showed|was shown|demonstrated)\b/i;
/** Clauses: a cell split at sentence and list boundaries (';', '. ', ' / ' between words, dashes). */
export const clausesG1d=(t:string)=>t.replace(/\*\*/g,'').split(/;\s+|\.\s+(?=[A-Z“"])|\s+\/\s+|\s+—\s+/).map(x=>x.trim()).filter(x=>x.length>2);

/** Derive the asserted situation -> strategy relations of every row (R1). The embedder only checks that a clause naming a
 * strategy-specific action term means that action; it never creates a relation on its own. */
export async function deriveRelationsG1d(rows:ReadonlyMap<string,SourceRowG1d>,strategies:readonly StrategyG1b[],emb:EmbedderG1c|null,
 o:{minActionSim?:number;
 /** all source cells of the knowledge (term specificity); defaults to the rows given */ corpus?:readonly string[]}={}):Promise<RelationG1d[]>{
 const corpus=o.corpus??[...rows.values()].flatMap(r=>r.cells.filter(c=>c.role!=='teaching').map(c=>c.text));
 const S=strategyActionsG1d(strategies,corpus);const minSim=o.minActionSim??G1D_RELATION_PARAMS.minActionSim;
 const actVec=emb?await emb.embed(S.map((s,i)=>G1D_RELATION_PARAMS.compareWholeStatement?strategies[i].statement:s.action),'passage'):null;const v=scopeVocabulary();
 const out:RelationG1d[]=[];
 for(const r of rows.values()){
  if(r.kind==='store_concept'){for(const s of strategies)if(r.provenance.itemId===s.itemId)
   out.push({rowId:r.rowId,strategy:s.id,polarity:'applies',condition:S.find(x=>x.id===s.id)!.condition||null,quote:s.statement,header:'stored teaching item',matchedTerms:[],similarity:1,
    nature:'teaching',sourceStatus:r.sourceStatus,provenance:r.provenance,quoteSha256:sha(s.statement),status:'derived_unreviewed',method:G1D_RELATION_VERSION});continue;}
  const cand:{cell:SourceCellG1d;clause:string;s:StrategyActionG1d;si:number;terms:string[]}[]=[];
  for(const c of r.cells){if(!ASSERTING_ROLES.has(c.role))continue;
   for(const cl of clausesG1d(c.text)){const st=stemsG1d(cl);
    S.forEach((s,si)=>{const terms=s.actionTerms.filter(x=>st.has(x));if(terms.length||!G1D_RELATION_PARAMS.requireActionTerm)cand.push({cell:c,clause:cl,s,si,terms});});}}
  if(!cand.length)continue;
  const cv=emb?await emb.embed(cand.map(c=>c.clause),'passage'):null;
  const best=new Map<string,RelationG1d>();
  cand.forEach((c,i)=>{const sim=cv&&actVec?dotG1c(cv[i],actVec[c.si]):1;if(sim<minSim)return;
   // the action term itself negated in the clause ('no ventilation needed') contraindicates; a negated PRODUCT before it
   // ('a purifier is not a substitute for <action>') asserts the action
   const lowCl=c.clause.toLowerCase();let negated=false;
   for(const t of tokens(c.clause)){if(t.kind!=='word')continue;if(!c.terms.some(x=>[...stemsG1d(t.w)].includes(x)))continue;
    const sc=stanceAt(c.clause,t.start,t.end,v);if(sc&&!/\b(?:substitute for|instead of|rather than|before|first)\b/.test(lowCl.slice(0,t.start)))negated=true;}
   const polarity:PolarityG1d=negated?'contraindicated':CONDITIONAL.test(c.clause)||c.cell.role==='condition'?'conditional':'applies';
   const rel:RelationG1d={rowId:r.rowId,strategy:c.s.id,polarity,condition:polarity==='conditional'?c.clause:null,quote:c.clause,header:c.cell.header,matchedTerms:c.terms,similarity:+sim.toFixed(3),
    nature:DEMONSTRATED.test(c.clause)?'demonstrated_effectiveness':'expert_guidance',sourceStatus:r.sourceStatus,provenance:r.provenance,quoteSha256:sha(c.clause),status:'derived_unreviewed',method:G1D_RELATION_VERSION};
   const prev=best.get(c.s.id);if(!prev||rel.similarity>prev.similarity)best.set(c.s.id,rel);});
  out.push(...best.values());}
 return out;
}

// ---- category applicability (owner rule 2026-10-21)
export type CategoryApplicabilityG1d='suitable'|'conditional'|'unsuitable'|'not_a_purchase_situation';
export interface CategoryRelationG1d {rowId:string;category:string;value:CategoryApplicabilityG1d;conditionKind:'essential'|'modifiable'|'nonessential'|null;
 condition:string|null;quote:string|null;header:string|null;sourceStatus:string|null;status:'derived_unreviewed'}
const ESSENTIAL=/\b(?:incompatible|cannot|can't|unsafe|not (?:a|an) [\w-]+(?: [\w-]+)? (?:solution|substitute|fix)|does not (?:fix|remove|solve)|not suitable|unacceptable|hard[- ]stop|reject(?:ed)?|disallow\w*|no safe)\b/i;
const MODIFIABLE=/\b(?:first|before|unless|until|check|verify|confirm|inspect|investigate|locate|if indicated|only if|if appropriate|assess|depending)\b/i;
const NONESSENTIAL=/\b(?:slower|louder|noisier|more expensive|costlier|bulkier|less convenient|trade-?off|disadvantage)\b/i;
/** Situation-side evidence: a consumer utterance cell (quoted or first person). */
const UTTERANCE=/[“"]|\b(?:I|I'm|I've|my|we|our|me)\b/;
export function categoryApplicabilityG1d(r:SourceRowG1d,categoryTerms:readonly string[]):CategoryRelationG1d{
 const base={rowId:r.rowId,category:r.category,sourceStatus:r.sourceStatus,status:'derived_unreviewed' as const};
 const situ=r.cells.filter(c=>c.role==='situation');
 if(r.kind==='store_concept')return {...base,value:'suitable',conditionKind:null,condition:null,quote:null,header:null};
 // r1.3 (dev it3, reformulation 3): a row without a situation cell describes no consumer situation (a measurement, a
 // recipe, a screening rule); r1.0 also required first-person or quoted wording, which lost unquoted situations
 if(!situ.length)return {...base,value:'not_a_purchase_situation',conditionKind:null,condition:null,quote:null,header:null};
 const catStems=new Set(categoryTerms.flatMap(t=>[...stemsNI(t)]));const mentionsCategory=(t:string)=>[...stemsNI(t)].some(x=>catStems.has(x))||/\b(?:appliance|device|product|machine|unit)\b/i.test(t);
 for(const c of r.cells){if(c.role==='situation')continue;
  for(const cl of clausesG1d(c.text)){
   if(ESSENTIAL.test(cl)&&mentionsCategory(cl)){const mod=MODIFIABLE.test(cl)||/\bsubstitute for (?:repair|ventilation|remediation|inspection)/i.test(cl);
    return {...base,value:mod?'conditional':'unsuitable',conditionKind:mod?'modifiable':'essential',condition:cl,quote:cl,header:c.header};}}}
 for(const c of r.cells){if(c.role==='situation')continue;
  for(const cl of clausesG1d(c.text)){if(NONESSENTIAL.test(cl))return {...base,value:'suitable',conditionKind:'nonessential',condition:cl,quote:cl,header:c.header};
   if((c.role==='condition'||c.role==='alternative'||c.role==='caveat')&&MODIFIABLE.test(cl))return {...base,value:'conditional',conditionKind:'modifiable',condition:cl,quote:cl,header:c.header};}}
 // r1.3: the sources make suitability depend on what is still to be verified (a method, evidence or condition cell):
 // that is a modifiable, unverified condition -> conditional, never already suitable (owner rule 2026-10-21)
 const verify=r.cells.find(c=>c.role==='method'||c.role==='evidence'||c.role==='condition');
 if(verify)return {...base,value:'conditional',conditionKind:'modifiable',condition:verify.text.slice(0,240),quote:verify.text.slice(0,240),header:verify.header};
 return {...base,value:'suitable',conditionKind:null,condition:null,quote:null,header:null};
}
