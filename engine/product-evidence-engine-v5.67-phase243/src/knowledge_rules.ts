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
export interface RuleDef {id:string;rule:string;statement:string;source:string;explain?:string}
export interface PredicateDef {name:string;args:string[];meaning:string;role:'input'|'derived'|'constant'}
export interface ProgramDef {id:string;statement:string;rules:RuleDef[];constants?:string[]}
export interface RuleSet {schema:string;version:string;statement:string;vocabulary:PredicateDef[];programs:ProgramDef[]}
interface Rule {id:string;head:Atom;body:Literal[];def:RuleDef}
export interface CompiledProgram {id:string;rules:Rule[];strata:Rule[][];constants:Atom[];vocab:Map<string,PredicateDef>}

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
  const rules:Rule[]=pd.rules.map(def=>{if(ids.has(def.id))fail('duplicate rule '+def.id);ids.add(def.id);if(!def.statement)fail('rule without statement '+def.id);
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
  out.set(pd.id,{id:pd.id,rules,strata,constants,vocab});}
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
