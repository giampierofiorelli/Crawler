/**
 * Declarative knowledge rules (KR, 2026-10-18): a small stratified Datalog with provenance.
 *
 * Why this exists. PEE's interpretation decisions (which statement of a document covers which value, which kind a value
 * is and why, when two values compare) were spread over imperative code, where the scope of each rule and the priority
 * between rules stayed implicit; several recent errors were exactly scope and priority errors. Here those decisions are
 * rules over typed facts, with a declared vocabulary (every predicate has an arity and a meaning), so that every module
 * reading the same knowledge reads it with the same meaning, and every conclusion can show the rules and facts it rests
 * on.
 *
 * Semantics. Function-free Horn rules with stratified negation as failure, evaluated bottom-up to the perfect model.
 * Negation is closed-world over the FACTS GIVEN (the record), never over the world: `not documented(O,C)` says the
 * record does not state C, not that C does not hold. Built-ins: = != < > on constants (numbers compare numerically).
 * Every rule must be safe (each variable of the head, of a negated literal or of a built-in occurs in a positive body
 * atom) and the program must be stratifiable; both are checked when the rules are loaded. Programs always terminate.
 *
 * Syntax. `head(X,c) :- p(X,Y), not q(Y), X != Y.`  Variables start with an upper-case letter or `_` (each `_` is a
 * fresh variable); constants are lower-case identifiers, numbers or "quoted strings". Zero-arity atoms are written
 * without parentheses.
 */

export type Const=string;
interface Term {v?:string;c?:Const}
interface Atom {pred:string;args:Term[]}
type Literal={kind:'pos';atom:Atom}|{kind:'neg';atom:Atom}|{kind:'cmp';op:'='|'!='|'<'|'>';l:Term;r:Term};
/** S102 (owner review of S100, 2026-10-20: "A rule introduced or approved during an earlier phase is not automatically
 * still valid"): the lifecycle of a rule. A rule without one is active. Superseded and retired rules are kept in the file
 * (their history and evidence) but never executed; under_review rules run and are reported. A rule marked `invariant`
 * (safety, provenance, evidence integrity) cannot be superseded or retired by a lifecycle entry: that needs an owner
 * decision and a change of the invariant itself. */
export type RuleState='active'|'under_review'|'superseded'|'retired';
export interface RuleLifecycle {state:RuleState;since:string;reason:string;
 /** the rule that replaces it (superseded only) */ supersededBy?:string;
 /** consumers affected by the change */ consumers?:string[];
 /** regression evidence: tests, evaluation files or reports */ evidence?:string[]}
export interface RuleDef {id:string;rule:string;statement:string;source:string;explain?:string;lifecycle?:RuleLifecycle;invariant?:boolean}
export interface PredicateDef {name:string;args:string[];meaning:string;role:'input'|'derived'|'constant'}
export interface ProgramDef {id:string;statement:string;rules:RuleDef[];constants?:string[];
 /** S100: the program decides single-valued fields by defeasible claims (see DecisionDef). */
 decision?:DecisionDef}
/** S100 (owner review of S99, 2026-10-20: rule governance). A program that decides single-valued fields of an object (a
 * statement role, a nature, a provenance) does so through one CLAIM predicate claim(Object, Field, Value, Tier, Scope):
 * rules do not overwrite one another; each rule states what its evidence supports, with how much authority (Tier) and
 * about how much of the document (Scope). One precedence policy, written once here, decides (defeasible logic with a
 * superiority relation; a DMN priority hit policy with conflict detection):
 *  - tiers: constraint > explicit (evidence about this occurrence) > inherited (context: a heading, a caption, a section,
 *    the source) > default (a presumption);
 *  - a constraint is never defeated; two constraints that disagree are a conflict;
 *  - otherwise the highest tier with claims decides, and within it the NARROWEST scope with claims (the scopes are listed
 *    narrowest first); a statement about the occurrence outranks its context, a cell outranks its table heading;
 *  - claims that disagree at the deciding tier and scope are a CONFLICT: the field is undecided (abstention) and the
 *    conflict is reported, never settled by rule order;
 *  - a default never decides: it is reported as a presumption and the field stays undecided.
 * Governance at load time: every rule concluding a claim states a constant field, value and tier; fields and values are
 * declared; and a field whose rules can conclude different values at the same tier and scope must be declared CONTESTED
 * with those values and a reason, so a new rule that silently contradicts existing ones fails to load. */
export const TIERS=['constraint','explicit','inherited','default'] as const;export type Tier=typeof TIERS[number];
export interface DecisionDef {predicate:string;
 /** scope names, narrowest first */ scopes:string[];
 /** field -> admissible values */ fields:Record<string,string[]>;
 /** groups where different values meet at one tier and scope, resolved by abstention; values must be listed */
 contested:{field:string;tier:Tier;scopes:string[];values:string[];why:string}[]}
export interface RuleSet {schema:string;version:string;statement:string;vocabulary:PredicateDef[];programs:ProgramDef[]}
interface Rule {id:string;head:Atom;body:Literal[];def:RuleDef}
export interface CompiledProgram {id:string;rules:Rule[];strata:Rule[][];constants:Atom[];vocab:Map<string,PredicateDef>;decision?:DecisionDef|null;
 /** S102: every rule of the program with its lifecycle state (superseded and retired rules are listed, not executed) */
 lifecycle:{rule:string;state:RuleState;invariant:boolean;lifecycle:RuleLifecycle|null}[]}

const fail=(m:string):never=>{throw new Error('knowledge_rules_invalid: '+m);};

// ---------------------------------------------------------------------------------------------------------------------
// Parsing
function tokenize(src:string):string[]{
 const out:string[]=[];const re=/\s*("(?:[^"\\]|\\.)*"|:-|!=|[A-Za-z_][A-Za-z0-9_]*|-?\d+(?:\.\d+)?|[(),.=<>])/y;let i=0;
 while(i<src.length){if(/\s/.test(src[i])){i++;continue;}re.lastIndex=i;const m=re.exec(src);if(!m)fail(`unexpected character at ${i} in "${src}"`);out.push(m![1]);i=re.lastIndex;}
 return out;
}
let anon=0;
function parseRuleText(src:string):{head:Atom;body:Literal[]}{
 const t=tokenize(src);let i=0;const peek=()=>t[i],eat=(x?:string)=>{const y=t[i++];if(y===undefined)fail(`unexpected end in "${src}"`);if(x&&y!==x)fail(`expected ${x} in "${src}"`);return y;};
 const term=():Term=>{const x=eat();if(x.startsWith('"'))return {c:JSON.parse(x)};if(x==='_')return {v:'_'+(anon++)};if(/^[A-Z_]/.test(x))return {v:x};if(/^[a-z0-9-]/.test(x))return {c:x};return fail(`bad term ${x} in "${src}"`);};
 const atom=():Atom=>{const pred=eat();if(!/^[a-z][A-Za-z0-9_]*$/.test(pred))fail(`bad predicate ${pred} in "${src}"`);const args:Term[]=[];
  if(peek()==='('){eat('(');if(peek()!==')'){args.push(term());while(peek()===','){eat(',');args.push(term());}}eat(')');}return {pred,args};};
 const literal=():Literal=>{if(peek()==='not'){eat();return {kind:'neg',atom:atom()};}
  // a comparison starts with a term followed by an operator
  if(/^[A-Z_"0-9-]/.test(peek()!)&&['=','!=','<','>'].includes(t[i+1])){const l=term();const op=eat() as '='|'!='|'<'|'>';return {kind:'cmp',op,l,r:term()};}
  return {kind:'pos',atom:atom()};};
 const head=atom();const body:Literal[]=[];
 if(peek()===':-'){eat();body.push(literal());while(peek()===','){eat(',');body.push(literal());}}
 eat('.');if(i!==t.length)fail(`trailing tokens in "${src}"`);return {head,body};
}

// ---------------------------------------------------------------------------------------------------------------------
// Compilation: vocabulary, safety, stratification
const vars=(ts:Term[])=>ts.filter(x=>x.v).map(x=>x.v!);
export function compileRuleSet(rs:RuleSet):Map<string,CompiledProgram>{
 if(!rs||!Array.isArray(rs.vocabulary)||!Array.isArray(rs.programs))fail('rule set shape');
 const vocab=new Map<string,PredicateDef>();for(const p of rs.vocabulary){if(vocab.has(p.name))fail('duplicate predicate '+p.name);if(!p.meaning)fail('predicate without meaning '+p.name);vocab.set(p.name,p);}
 const out=new Map<string,CompiledProgram>();
 for(const pd of rs.programs){
  const ids=new Set<string>();
  const check=(a:Atom,where:string)=>{const d=vocab.get(a.pred);if(!d)fail(`undeclared predicate ${a.pred} in ${where}`);if(d!.args.length!==a.args.length)fail(`${a.pred} has arity ${d!.args.length}, used with ${a.args.length} in ${where}`);};
  // S102: lifecycle checks; only active and under_review rules are compiled for execution
  {const all=new Set<string>();for(const d of pd.rules){if(all.has(d.id))fail('duplicate rule '+d.id);all.add(d.id);}}
  const life=new Map(pd.rules.map(d=>[d.id,d.lifecycle?.state??'active']));
  for(const d of pd.rules){const l=d.lifecycle;if(!l)continue;
   if(!['active','under_review','superseded','retired'].includes(l.state))fail(`rule ${d.id}: unknown lifecycle state ${l.state}`);
   if(!/^\d{4}-\d{2}-\d{2}$/.test(l.since??'')||!l.reason)fail(`rule ${d.id}: a lifecycle entry needs a date and a reason`);
   if((l.state==='superseded'||l.state==='retired')&&!(l.evidence?.length))fail(`rule ${d.id}: ${l.state} without regression evidence`);
   if((l.state==='superseded'||l.state==='retired')&&d.invariant)fail(`rule ${d.id} is an invariant: it cannot be ${l.state} by a lifecycle entry (owner decision required)`);
   if(l.state==='superseded'){if(!l.supersededBy)fail(`rule ${d.id}: superseded without a successor`);
    const st=life.get(l.supersededBy!);if(!st)fail(`rule ${d.id}: successor ${l.supersededBy} does not exist`);
    if(st==='superseded'||st==='retired')fail(`rule ${d.id}: successor ${l.supersededBy} is itself ${st}`);}}
  const lifecycle=pd.rules.map(d=>({rule:d.id,state:(d.lifecycle?.state??'active') as RuleState,invariant:!!d.invariant,lifecycle:d.lifecycle??null}));
  const rules:Rule[]=pd.rules.filter(d=>{const st=d.lifecycle?.state??'active';return st==='active'||st==='under_review';}).map(def=>{if(ids.has(def.id))fail('duplicate rule '+def.id);ids.add(def.id);if(!def.statement)fail('rule without statement '+def.id);
   const {head,body}=parseRuleText(def.rule);check(head,def.id);for(const l of body)if(l.kind!=='cmp')check(l.atom,def.id);
   const hd=vocab.get(head.pred)!;if(hd.role!=='derived')fail(`rule ${def.id} derives ${head.pred}, which is not a derived predicate`);
   const bound=new Set(body.flatMap(l=>l.kind==='pos'?vars(l.atom.args):[]));
   // variables written `_` inside a negation are existential ("no fact with any value there")
   const need=[...vars(head.args),...body.flatMap(l=>l.kind==='neg'?vars(l.atom.args).filter(v=>!/^_\d+$/.test(v)):l.kind==='cmp'?vars([l.l,l.r]):[])];
   for(const v of need)if(!bound.has(v))fail(`rule ${def.id} is unsafe: ${v} is not bound by a positive literal`);
   return {id:def.id,head,body,def};});
  const constants=(pd.constants??[]).map(c=>{const {head,body}=parseRuleText(c);if(body.length||vars(head.args).length)fail('constant with variables: '+c);check(head,pd.id);
   if(vocab.get(head.pred)!.role!=='constant')fail(`${head.pred} is not a constant predicate`);return head;});
  // stratification: a predicate's stratum is at least that of every positive dependency and above every negative one
  const preds=new Set(rules.map(r=>r.head.pred));const st=new Map<string,number>();for(const p of preds)st.set(p,0);
  for(let pass=0,changed=true;changed;pass++){changed=false;if(pass>preds.size+1)fail(`program ${pd.id} is not stratifiable (recursion through negation)`);
   for(const r of rules)for(const l of r.body){if(l.kind==='cmp'||!preds.has(l.atom.pred))continue;const need=(st.get(l.atom.pred)!)+(l.kind==='neg'?1:0);
    if(need>st.get(r.head.pred)!){st.set(r.head.pred,need);changed=true;}}}
  const n=Math.max(0,...st.values());const strata:Rule[][]=Array.from({length:n+1},()=>[]);for(const r of rules)strata[st.get(r.head.pred)!].push(r);
  if(pd.decision)checkDecision(pd.id,pd.decision,rules,vocab);
  out.set(pd.id,{id:pd.id,rules,strata,constants,vocab,decision:pd.decision??null,lifecycle});}
 return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// Evaluation with provenance
/** A negated premise that held: no fact matching `pattern` existed in the record (closed over the record, not the
 * world). `inputPredicate`: the absence is of a given fact; otherwise nothing in the record derives one. */
export interface Absence {pred:string;pattern:(Const|null)[];inputPredicate:boolean;factsOfPredicate:number}
export interface Fact {pred:string;args:Const[];rule:string|null;bindings:Record<string,Const>|null;premises:Fact[];absences?:Absence[]}
const key=(p:string,a:readonly Const[])=>p+'('+a.join('\u0001')+')';
const num=(x:Const)=>/^-?\d+(?:\.\d+)?$/.test(x)?Number(x):null;
const cmp=(op:string,a:Const,b:Const)=>{if(op==='=')return a===b;if(op==='!=')return a!==b;const x=num(a),y=num(b);if(x===null||y===null){const c=String(a).localeCompare(String(b),'en',{numeric:true});return op==='<'?c<0:c>0;}// audit S77: "s10" > "s9" (was code-unit order)
 return op==='<'?x<y:x>y;};
export class Model {
 private byPred=new Map<string,Map<string,Fact>>();
 constructor(readonly program:CompiledProgram,readonly record:string='record'){}
 add(f:Fact):boolean{let m=this.byPred.get(f.pred);if(!m){m=new Map();this.byPred.set(f.pred,m);}const k=key(f.pred,f.args);if(m.has(k))return false;m.set(k,f);return true;}
 all(pred:string):Fact[]{return [...(this.byPred.get(pred)?.values()??[])];}
 /** Facts of a predicate whose arguments match a pattern (null = any). */
 match(pred:string,pattern:readonly (Const|null)[]):Fact[]{return this.all(pred).filter(f=>pattern.every((p,i)=>p===null||f.args[i]===p));}
 has(pred:string,args:readonly Const[]):boolean{return !!this.byPred.get(pred)?.has(key(pred,args));}
 /** The derivation of a fact: the rule, its statement and the premises, down to the input facts. */
 why(f:Fact,depth=0):string[]{const pad='  '.repeat(depth);const head=`${pad}${f.pred}(${f.args.join(', ')})`;
  if(!f.rule)return [head+'  [given]'];const r=this.program.rules.find(x=>x.id===f.rule)!;
  const abs=(f.absences??[]).map(a=>`${pad}  not ${a.pred}(${a.pattern.map(x=>x??'*').join(', ')})  [absent from ${this.record}: ${a.inputPredicate?`no such fact among ${a.factsOfPredicate} given ${a.pred} facts`:`nothing in it derives one (${a.factsOfPredicate} ${a.pred} facts derived)`}]`);
  return [`${head}  [${f.rule}: ${r.def.statement}]`,...f.premises.flatMap(p=>this.why(p,depth+1)),...abs];}
 /** The rules a fact rests on (its own and its premises'), in derivation order. */
 rulesOf(f:Fact):string[]{return [...new Set([...(f.rule?[f.rule]:[]),...f.premises.flatMap(p=>this.rulesOf(p))])];}
}
type Input=Record<string,ReadonlyArray<ReadonlyArray<string|number>>>;
/** Evaluate a compiled program over input facts. Every input predicate must be declared as an input. */
export function evaluate(p:CompiledProgram,input:Input,opts:{record?:string}={}):Model{
 const m=new Model(p,opts.record);
 // an input is an input predicate, or a predicate another program derives (kind_of is derived by `kind`, given to `compare`)
 for(const [pred,rows] of Object.entries(input)){const d=p.vocab.get(pred);if(!d||!(d.role==='input'||(d.role==='derived'&&!p.rules.some(r=>r.head.pred===pred))))fail(`${pred} is not an input of program ${p.id}`);
  for(const r of rows){if(r.length!==d!.args.length)fail(`${pred} needs ${d!.args.length} arguments`);m.add({pred,args:r.map(String),rule:null,bindings:null,premises:[]});}}
 for(const c of p.constants)m.add({pred:c.pred,args:c.args.map(t=>t.c!),rule:null,bindings:null,premises:[]});
 for(const stratum of p.strata){
  for(let changed=true;changed;){changed=false;
   for(const r of stratum){
    const pos=r.body.filter((l):l is {kind:'pos';atom:Atom}=>l.kind==='pos');const rest=r.body.filter(l=>l.kind!=='pos');
    const solve=(i:number,b:Record<string,Const>,prem:Fact[]):void=>{
     if(i<pos.length){const a=pos[i].atom;const pat=a.args.map(t=>t.c??(b[t.v!]??null));
      for(const f of m.match(a.pred,pat)){const nb={...b};let ok=true;a.args.forEach((t,j)=>{if(t.v){if(nb[t.v]!==undefined&&nb[t.v]!==f.args[j])ok=false;nb[t.v]=f.args[j];}});if(ok)solve(i+1,nb,[...prem,f]);}
      return;}
     const val=(t:Term)=>t.c??b[t.v!];const absences:Absence[]=[];
     for(const l of rest){if(l.kind==='cmp'){if(!cmp(l.op,val(l.l),val(l.r)))return;}
      else if(l.kind==='neg'){const pat=l.atom.args.map(t=>t.c??b[t.v!]??null);if(m.match(l.atom.pred,pat).length)return;
       // record what was checked: a negated premise is evidence of absence from this record only
       absences.push({pred:l.atom.pred,pattern:pat,inputPredicate:!p.rules.some(x=>x.head.pred===l.atom.pred),factsOfPredicate:m.all(l.atom.pred).length});}}
     if(m.add({pred:r.head.pred,args:r.head.args.map(val),rule:r.id,bindings:b,premises:prem,...(absences.length?{absences}:{})}))changed=true;};
    solve(0,{},[]);}}}
 return m;
}
/** Render a rule's explanation template: {X} is a binding; {@pred(a,X)} lists the last argument of matching facts. */
export function explain(m:Model,f:Fact):string{
 const r=m.program.rules.find(x=>x.id===f.rule);const tpl=r?.def.explain??r?.def.statement??`${f.pred}(${f.args.join(', ')})`;const b=f.bindings??{};
 return tpl.replace(/\{@([a-z_]+)\(([^)]*)\)\}/g,(_,pred:string,args:string)=>{const pat=args.split(',').map(s=>s.trim()).map(s=>s==='*'?null:/^[A-Z]/.test(s)?b[s]??null:s);
   return m.match(pred,pat).map(x=>x.args.at(-1)).join('/')||'unknown';})
  .replace(/\{([A-Z][A-Za-z0-9_]*)\}/g,(_,v:string)=>String(b[v]??v));
}

// ---------------------------------------------------------------------------------------------------------------------
// S100: defeasible decisions (see DecisionDef)
/** What one claim rule can conclude, from its head: the rule registry entry of a decision program. */
export interface ClaimRule {rule:string;field:string;value:string;tier:Tier;scope:string|null;statement:string;source:string}
function claimHead(r:Rule):{field:string;value:string;tier:Tier;scope:string|null}{
 const [,f,v,t,sc]=r.head.args;
 if(!f.c||!v.c||!t.c)fail(`claim rule ${r.id} must state a constant field, value and tier`);
 return {field:f.c!,value:v.c!,tier:t.c! as Tier,scope:sc.c??null};}
function checkDecision(id:string,d:DecisionDef,rules:Rule[],vocab:Map<string,PredicateDef>){
 const pd=vocab.get(d.predicate);if(!pd||pd.role!=='derived'||pd.args.length!==5)fail(`decision predicate ${d.predicate} of ${id} must be a derived predicate of arity 5 (object, field, value, tier, scope)`);
 if(!d.scopes?.length)fail(`decision of ${id} declares no scopes`);
 const claims=rules.filter(r=>r.head.pred===d.predicate).map(r=>({r,...claimHead(r)}));
 for(const c of claims){if(!(TIERS as readonly string[]).includes(c.tier))fail(`claim rule ${c.r.id}: unknown tier ${c.tier}`);
  if(!d.fields[c.field])fail(`claim rule ${c.r.id}: undeclared field ${c.field}`);if(!d.fields[c.field].includes(c.value))fail(`claim rule ${c.r.id}: value ${c.value} not admissible for ${c.field}`);
  if(c.scope!==null&&!d.scopes.includes(c.scope))fail(`claim rule ${c.r.id}: undeclared scope ${c.scope}`);}
 // duplicate rules (same head and body) are always an error
 const sig=(r:Rule)=>JSON.stringify([r.head,r.body]);const seen=new Map<string,string>();
 for(const r of rules){const k=sig(r);if(seen.has(k))fail(`rules ${seen.get(k)} and ${r.id} are duplicates`);seen.set(k,r.id);}
 // contradictions: different values of one field at one tier and a shared (or variable) scope must be declared contested
 for(const a of claims)for(const b of claims){if(a.r.id>=b.r.id||a.field!==b.field||a.tier!==b.tier||a.value===b.value)continue;
  if(a.scope!==null&&b.scope!==null&&a.scope!==b.scope)continue;
  const ok=d.contested.some(g=>g.field===a.field&&g.tier===a.tier&&g.values.includes(a.value)&&g.values.includes(b.value)&&
   (a.scope===null||g.scopes.includes(a.scope))&&(b.scope===null||g.scopes.includes(b.scope)));
  if(!ok)fail(`claim rules ${a.r.id} (${a.field}=${a.value}) and ${b.r.id} (${a.field}=${b.value}) can contradict at tier ${a.tier}, scope ${a.scope??b.scope??'any'}: declare the contest (values, scopes, reason) or change a rule`);}
}
/** The registry of a decision program: every claim rule with what it can conclude. */
export function claimRules(p:CompiledProgram):ClaimRule[]{
 if(!p.decision)return [];
 return p.rules.filter(r=>r.head.pred===p.decision!.predicate).map(r=>({rule:r.id,...claimHead(r),statement:r.def.statement,source:r.def.source}));}
export interface Decision {object:string;field:string;value:string|null;tier:Tier|null;scope:string|null;
 /** the claims that decided (same value) */ by:string[];
 /** disagreement at the deciding level: the field is undecided */ conflict:{values:string[];rules:string[]}|null;
 /** a default that would apply, reported, never decided */ presumption:string|null;
 /** claims outranked by the deciding level */ defeated:{rule:string;value:string;tier:Tier;scope:string}[]}
/** Decide every (object, field) from the claim facts of a model (the precedence policy of DecisionDef). */
export function decide(m:Model):Decision[]{
 const d=m.program.decision;if(!d)fail(`program ${m.program.id} declares no decision`);
 const rank=(s:string)=>{const i=d!.scopes.indexOf(s);if(i<0)fail(`claim with undeclared scope ${s}`);return i;};
 const groups=new Map<string,Fact[]>();for(const f of m.all(d!.predicate)){const k=f.args[0]+'\u0001'+f.args[1];(groups.get(k)??groups.set(k,[]).get(k)!).push(f);}
 const out:Decision[]=[];
 for(const fs of groups.values()){const [object,field]=fs[0].args;const tierOf=(f:Fact)=>f.args[3] as Tier;
  const base:Decision={object,field,value:null,tier:null,scope:null,by:[],conflict:null,presumption:null,defeated:[]};
  const defaults=fs.filter(f=>tierOf(f)==='default');const dv=[...new Set(defaults.map(f=>f.args[2]))];base.presumption=dv.length===1?dv[0]:null;
  const level=(['constraint','explicit','inherited'] as Tier[]).find(t=>fs.some(f=>tierOf(f)===t));
  if(!level){base.defeated=[];out.push(base);continue;}
  const atTier=fs.filter(f=>tierOf(f)===level);
  const narrow=level==='constraint'?null:Math.min(...atTier.map(f=>rank(f.args[4])));
  const deciding=narrow===null?atTier:atTier.filter(f=>rank(f.args[4])===narrow);
  const values=[...new Set(deciding.map(f=>f.args[2]))];
  const defeated=fs.filter(f=>!deciding.includes(f)&&tierOf(f)!=='default').map(f=>({rule:f.rule??'given',value:f.args[2],tier:tierOf(f),scope:f.args[4]}));
  if(values.length===1)out.push({...base,value:values[0],tier:level,scope:narrow===null?deciding[0].args[4]:d!.scopes[narrow],by:[...new Set(deciding.map(f=>f.rule??'given'))],defeated});
  else out.push({...base,tier:level,scope:narrow===null?null:d!.scopes[narrow],conflict:{values:values.sort(),rules:[...new Set(deciding.map(f=>f.rule??'given'))]},defeated});}
 return out;
}
