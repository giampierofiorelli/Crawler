#!/usr/bin/env node
/**
 * R1 (roadmap, 2026-10-18): where PEE's knowledge lives. Static census, no page data.
 *   node scripts/r1-knowledge-map.mjs            writes evaluation/r1/knowledge-map.json (counts only)
 * Code: TypeScript syntax trees (typescript compiler API): regular-expression literals and the words in their
 * alternations, word lists written in code (array literals of three or more strings), string literals.
 * Data: string leaves and entries of the knowledge resources; rules of the KR programs; teaching rows in the store.
 * Learned: rules or relations whose provenance says the software produced them.
 */
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createRequire} from 'node:module';
const ts=createRequire(import.meta.url)('typescript');
const GROUPS={
 new_reading_stack:['document_evidence','table_interpreter1g','table_interpreter1g_knowledge','table_interpreter1g_lessons','quantity_knowledge','knowledge_rules','product_facts','qualitative_needs'],
 legacy_plan_guided_reading:['phase225_transient_test_probe','phase265_test_measurements','phase269_qualitative_observations','phase272_extraction_plan','phase245_spec_extraction','phase245_value_normalizer','document_semantics','table_ledger1e'],
 teaching_and_category_knowledge:['phase252_category_teaching','phase247_category_relations','phase247_relation_seeds','phase116_category_function_model','phase117_goal_outcome_comparison','phase128_category_cognition_dialogue_bridge','phase272_category_research'],
 advice:['phase253_request_advice','phase248_advisory_journey']};
function scan(file){const src=readFileSync(file,'utf8');const sf=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true);
 const c={lines:src.split('\n').length,regex:0,regexAlternatives:0,wordLists:0,wordListItems:0,strings:0};
 const visit=n=>{if(n.kind===ts.SyntaxKind.RegularExpressionLiteral){c.regex++;const body=n.text.slice(1,n.text.lastIndexOf('/'));
   // words in alternations: alternatives that contain a letter run of 2+ letters
   for(const g of body.split(/[()]/))if(g.includes('|'))for(const a of g.split('|'))if(/[A-Za-z]{2,}/.test(a.replace(/\\[a-zA-Z]/g,'')))c.regexAlternatives++;}
  if(n.kind===ts.SyntaxKind.StringLiteral||n.kind===ts.SyntaxKind.NoSubstitutionTemplateLiteral)c.strings++;
  if(n.kind===ts.SyntaxKind.ArrayLiteralExpression){const s=n.elements.filter(e=>e.kind===ts.SyntaxKind.StringLiteral&&/[A-Za-z]{2,}/.test(e.text));if(s.length>=3&&s.length>=n.elements.length*0.8){c.wordLists++;c.wordListItems+=s.length;}}
  ts.forEachChild(n,visit);};visit(sf);return c;}
const add=(a,b)=>{for(const k of Object.keys(b))a[k]=(a[k]??0)+b[k];return a;};
const files=readdirSync('src').filter(f=>f.endsWith('.ts'));const code={};const per={};
for(const f of files){const c=scan(join('src',f));per[f.replace(/\.ts$/,'')]=c;add(code.all??=({}),c);}
for(const [g,ms] of Object.entries(GROUPS)){code[g]={files:ms.length};for(const m of ms)if(per[m])add(code[g],per[m]);else code[g].missing=[...(code[g].missing??[]),m];}
code.new_reading_stack_by_file=Object.fromEntries(GROUPS.new_reading_stack.map(m=>[m,per[m]]));
// data
const leaves=o=>Array.isArray(o)?o.reduce((s,x)=>s+leaves(x),0):o&&typeof o==='object'?Object.values(o).reduce((s,x)=>s+leaves(x),0):typeof o==='string'?1:0;
const R='resources/quantity-knowledge/';const qk=JSON.parse(readFileSync(R+'quantity-knowledge.v2.json','utf8'));const fn=JSON.parse(readFileSync(R+'functions.v1.json','utf8'));
const data={quantity_knowledge:{version:qk.version,stringLeaves:leaves(qk),entries:Object.fromEntries(Object.entries(qk).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length])),languageTerms:leaves(qk.language),sources:qk.sources.length},
 functions:{version:fn.version,stringLeaves:leaves(fn),functions:fn.functions.length,components:fn.components.length,terms:fn.functions.reduce((s,f)=>s+f.terms.length,0)+fn.components.reduce((s,c)=>s+c.terms.length,0)},
 english_lexical_bundle_phase141:existsSync('resources/phase141/english_lexical_bundle.json')?{stringLeaves:leaves(JSON.parse(readFileSync('resources/phase141/english_lexical_bundle.json','utf8')))}:null};
const rules={};for(const f of ['rules.v2.json','product-rules.v1.json']){const r=JSON.parse(readFileSync(R+f,'utf8'));rules[f]={version:r.version,predicates:r.vocabulary.length,programs:Object.fromEntries(r.programs.map(p=>[p.id,p.rules.length])),
 negatedLiterals:r.programs.reduce((s,p)=>s+p.rules.reduce((t,x)=>t+((x.rule.split(':-')[1]??'').match(/\bnot\s+[a-z_]+\(/g)??[]).length,0),0)};}
// teaching in the store (counts by class and provenance)
let store=null;try{const {DatabaseSync}=createRequire(import.meta.url)('node:sqlite');const db=new DatabaseSync(join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite'),{readOnly:true});
 const q=s=>db.prepare(s).all();store={categoryItems:q('select concept_kind k,knowledge_class c,count(*) n from category_items group by 1,2'),itemsByProvenance:q('select provenance p,count(*) n from category_items group by 1'),
  relations:q('select kind k,count(*) n from category_relations group by 1'),categories:q('select category_id c,count(*) n from category_items group by 1')};}catch(e){store={error:String(e.message)};}
// learned by the software: provenance values that name a software process rather than an instructor or a source
const learned={note:'items whose provenance or class names a software learning process (not an instructor, a source or Claude)',storeItems:store?.itemsByProvenance?.filter(x=>/learn|induc|derived_by_pee|automatic/i.test(x.p??'')).reduce((s,x)=>s+x.n,0)??null,rules:0};
const out={schema:'pee.r1.knowledge-map.v1',generatedAt:new Date().toISOString(),method:'static census: typescript syntax trees; JSON string leaves; KR rules; store counts',code,data,rules,store,learned};
writeFileSync('evaluation/r1/knowledge-map.json',JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({all:code.all,new:code.new_reading_stack,legacy:code.legacy_plan_guided_reading,teach:code.teaching_and_category_knowledge,advice:code.advice,data:{qk:data.quantity_knowledge.stringLeaves,fn:data.functions.stringLeaves},rules,learned,storeProv:store?.itemsByProvenance,rel:store?.relations},null,0));
