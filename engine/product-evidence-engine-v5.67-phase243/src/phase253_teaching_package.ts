/**
 * Phase253 Stage 7 — the interface for scientific teaching packages prepared by the owner outside PEE (for example in
 * ChatGPT projects for air fryers, dehumidifiers, coffee machines and coffee grinders).
 *
 * A package is UNVERIFIED RESEARCH INPUT. It is validated strictly, compiled into the existing Phase252 teaching format
 * (CategoryTeaching252) and applied only through applyTeaching252, so every statement enters the store as a technical
 * hypothesis, unreviewed. A package can never:
 *  - assert independent support (no package claim becomes 'independently_supported_relation');
 *  - carry product rankings, scores or recommended models;
 *  - teach a reserved category (kept untaught so generalisation can still be measured);
 *  - exceed the Phase252 teaching budget (needs, phrases, counterexamples).
 * A statement citing at least one listed source is a source_backed_observation (what the source says, not that it is
 * true); without a source it is an instructor_hypothesis. No package files existed when this interface was written.
 */
import {createHash} from 'node:crypto';
import {TEACHING_BUDGET252,phraseCount252,type CategoryTeaching252,type Taught252,type TeachingSource252} from './phase252_category_teaching.js';
import {SPEC_CRITERIA249} from './phase249_decision.js';

/** Categories no package may teach in Phase253: registry categories kept untaught as generalisation controls. */
export const RESERVED_UNTAUGHT253=['rice_cookers','pressure_cookers','food_processors','steam_cookers'] as const;
const KINDS=['task','environment','outcome','capability','meaning','mechanism','failure'] as const;

export interface PackageClaim253 {text:string;sources?:string[]}
export interface TeachingPackage253 {
 schema:'pee253.teaching-package.v1';categoryId:string;title:string;
 /** Who prepared it and with what (e.g. "owner, ChatGPT project"); recorded, never trusted as review. */
 preparedBy:string;preparedAt:string;status:'unverified_research_input';
 sources:{id:string;url:string;publisher:string;role:TeachingSource252['role'];accessed:string}[];
 names:{aliases:string[];partPhrases?:string[]};
 needs:{id:string;kind:typeof KINDS[number];statement:string;aliases:string[];counterexamples?:string[];
  checkableCriteria?:string[];question?:string;outcome?:PackageClaim253;
  proxies?:{attribute:string;kind:'not_sufficient_for'|'may_support';note:PackageClaim253}[]}[];
 subtypes?:PackageClaim253[];mechanisms?:PackageClaim253[];interpretation?:PackageClaim253[];applicability?:PackageClaim253[];gaps?:PackageClaim253[];
}
const ID=/^[a-z][a-z0-9_]{2,40}$/;
const RANKING=/\b(?:best|top[- ]?\d+|winner|rank(?:ed|ing)?|scored?|rated \d|number one|must[- ]buy)\b/i;

/** Throws, naming every problem, instead of applying a doubtful package. */
export function validateTeachingPackage253(p0:unknown):TeachingPackage253{
 const p=p0 as Partial<TeachingPackage253>&Record<string,unknown>;const problems:string[]=[];const P=(m:string)=>problems.push(m);
 if(p?.schema!=='pee253.teaching-package.v1')P('schema must be pee253.teaching-package.v1');
 if(typeof p?.categoryId!=='string'||!ID.test(p.categoryId))P('categoryId invalid');
 else if((RESERVED_UNTAUGHT253 as readonly string[]).includes(p.categoryId))P(`category ${p.categoryId} is reserved and untaught in this phase`);
 if(p?.status!=='unverified_research_input')P('status must be unverified_research_input');
 for(const f of ['title','preparedBy','preparedAt'] as const)if(typeof p?.[f]!=='string'||!(p[f] as string).trim())P(`${f} missing`);
 for(const f of ['ranking','rankings','scores','recommendedModels','winner'])if(p&&f in p)P(`field ${f} is not allowed: a package teaches understanding, never product rankings`);
 const srcIds=new Set<string>();
 if(!Array.isArray(p?.sources))P('sources must be an array (it may be empty)');
 else for(const s of p.sources){if(!s||!ID.test(s.id)||srcIds.has(s.id))P(`source id ${s?.id} invalid or duplicate`);else srcIds.add(s.id);
  try{const u=new URL(s.url);if(!/^https?:$/.test(u.protocol)||u.username||u.password)P(`source ${s.id}: url must be http(s) without credentials`);}catch{P(`source ${s?.id}: url invalid`);}}
 const claim=(c:PackageClaim253|undefined,at:string)=>{if(!c)return;
  if(typeof c.text!=='string'||c.text.length<5||c.text.length>300)P(`${at}: text must be 5-300 characters`);
  else if(RANKING.test(c.text))P(`${at}: ranking language is not allowed ("${c.text.slice(0,60)}")`);
  for(const s of c.sources??[])if(!srcIds.has(s))P(`${at}: unknown source ${s}`);};
 if(!Array.isArray(p?.names?.aliases)||!p.names.aliases.length)P('names.aliases required');
 if(!Array.isArray(p?.needs))P('needs must be an array');
 else{const ids=new Set<string>();
  p.needs.forEach((n,i)=>{const at=`need ${n?.id??'#'+i}`;
   if(!n||!ID.test(n.id)||ids.has(n.id))P(`${at}: id invalid or duplicate`);else ids.add(n.id);
   if(!KINDS.includes(n?.kind))P(`${at}: kind invalid`);
   claim({text:n?.statement},`${at} statement`);
   if(!Array.isArray(n?.aliases)||!n.aliases.length)P(`${at}: aliases required`);
   for(const k of n?.checkableCriteria??[])if(!SPEC_CRITERIA249[k])P(`${at}: unknown checkable criterion ${k}`);
   claim(n?.outcome,`${at} outcome`);for(const x of n?.proxies??[])claim(x.note,`${at} proxy ${x.attribute}`);});
  if(p.needs.length>TEACHING_BUDGET252.needs)P(`more than ${TEACHING_BUDGET252.needs} needs`);
  const cx=p.needs.reduce((a,n)=>a+(n?.counterexamples?.length??0),0);if(cx>TEACHING_BUDGET252.counterexamples)P(`more than ${TEACHING_BUDGET252.counterexamples} counterexamples`);
  if(Array.isArray(p?.names?.aliases)&&phraseCount252({registry:{aliases:p.names.aliases},needs:p.needs.map(n=>({aliases:n?.aliases??[]}))})>TEACHING_BUDGET252.phrases)P(`more than ${TEACHING_BUDGET252.phrases} phrases`);}
 for(const f of ['subtypes','mechanisms','interpretation','applicability','gaps'] as const)(p?.[f]??[]).forEach((c,i)=>claim(c,`${f}[${i}]`));
 if(problems.length)throw Error(`invalid teaching package (${problems.length} problem(s)):\n`+problems.slice(0,40).join('\n'));
 return p as TeachingPackage253;
}
/** Compiles a validated package into the Phase252 teaching format. Sources are cited by URL. */
export function compileTeachingPackage253(pkg:TeachingPackage253):CategoryTeaching252{
 const url=new Map(pkg.sources.map(s=>[s.id,s.url]));
 const T=(c:PackageClaim253):Taught252=>{const s=(c.sources??[]).map(id=>url.get(id)!);return {text:c.text,basis:s.length?'source_backed_observation':'instructor_hypothesis',sources:s};};
 const digest=createHash('sha256').update(JSON.stringify(pkg)).digest('hex').slice(0,12);
 return {categoryId:pkg.categoryId,version:`package:${digest}`,written:pkg.preparedAt,
  registry:{aliases:[...pkg.names.aliases],partPhrases:[...(pkg.names.partPhrases??[])]},
  subtypes:(pkg.subtypes??[]).map(T),mechanisms:(pkg.mechanisms??[]).map(T),
  needs:pkg.needs.map(n=>({id:n.id,kind:n.kind,statement:n.statement,aliases:[...n.aliases],...(n.counterexamples?{counterexamples:[...n.counterexamples]}:{}),
   ...(n.checkableCriteria?.length?{requirement:{criteria:[...n.checkableCriteria],why:{text:`checkable through declared ${n.checkableCriteria.join(', ')} (package claim, unreviewed)`,basis:'instructor_hypothesis' as const,sources:[]}}}:{}),
   ...(n.outcome?{outcome:T(n.outcome)}:{}),...(n.proxies?{proxies:n.proxies.map(x=>({attribute:x.attribute,kind:x.kind,note:T(x.note)}))}:{}),
   ...(n.question?{question:n.question}:{})})),
  sourceRoutes:[],interpretation:(pkg.interpretation??[]).map(T),applicability:(pkg.applicability??[]).map(T),gaps:(pkg.gaps??[]).map(T)};
}
