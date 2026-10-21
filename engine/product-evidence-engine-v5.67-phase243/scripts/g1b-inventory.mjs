#!/usr/bin/env node
/** G1b inventory (owner authorisation 2026-10-21, verbatim owner-g1b-authorisation-2026-10-21.md): what situation-, need-,
 * strategy-, condition- and mechanism-side knowledge PEE already holds for its TAUGHT categories, read-only.
 * Sources: the owner packages of taught categories (N1 row roles on the markdown tables; the structured consumer-need files),
 * and the knowledge store (concept kinds, alternatives, concepts shared by several categories and their per-category
 * measurements). Untaught packages (robot cleaners, soundbars, speakers) are excluded (owner: no new categories).
 * Public counts: evaluation/g1b/inventory.json. Private rows (package cell text): $PEE_PRIVATE_EVAL_DIR/g1b/knowledge-rows.json.
 * Usage: node scripts/g1b-inventory.mjs --packages DIR --store STORE_COPY */
import {readFileSync,writeFileSync,readdirSync,statSync,existsSync,mkdirSync} from 'node:fs';import {join,relative} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const PK=arg('packages'),ST=arg('store');if(!PK||!ST)throw Error('usage: --packages DIR --store COPY');
const {deriveClaimsN1}=await import('../dist/src/relation_claims_n1.js');const {DatabaseSync}=await import('node:sqlite');
const TAUGHT={air_fryers:['air-fryers'],coffee_machines:['PEE-COFFEE-COMPLETE-CUMULATIVE-KNOWLEDGE-PACKAGE.md'],dehumidifiers:['PEE-DEHUMIDIFIERS-CONSOLIDATED-RESEARCH-2026-10-15.md','PEE-CATEGORY-RESEARCH-02-DEHUMIDIFIERS-ORIGINAL.md'],
 dishwashers:['PEE-CATEGORY-RESEARCH-06-HOUSEHOLD-DISHWASHERS','PEE-CATEGORY-RESEARCH-06-COUNTERTOP-DISHWASHERS'],air_purifiers:['PEE-CATEGORY-RESEARCH-04-AIR-PURIFIERS'],televisions:['PEE-CATEGORY-RESEARCH-07-TELEVISIONS']};
const walk=p=>statSync(p).isDirectory()?readdirSync(p).flatMap(n=>walk(join(p,n))):[p];
const sha=b=>createHash('sha256').update(b).digest('hex');
const rows=[];const counts={};const bump=(c,k,n=1)=>{counts[c]??={};counts[c][k]=(counts[c][k]??0)+n;};
for(const [cat,parts] of Object.entries(TAUGHT))for(const part of parts){const base=join(PK,part);if(!existsSync(base))continue;
 for(const f of walk(base)){const rel=relative(PK,f);
  if(f.endsWith('.md')){const md=readFileSync(f,'utf8');const src={categoryId:cat,document:rel,sha256:sha(md)};let claims=[];try{claims=deriveClaimsN1(md,src);}catch{continue;}
   bump(cat,'documents');
   for(const c of claims){const by=r=>c.participants.filter(p=>p.role===r).map(p=>p.text);
    const sit=by('situation'),need=by('need'),alt=by('alternative'),cond=by('condition'),cav=by('caveat'),fn=by('function'),prop=by('property'),meth=by('method'),ev=by('evidence');
    if(!sit.length&&!need.length)continue;
    bump(cat,'rows_situation_or_need');if(sit.length)bump(cat,'rows_with_situation');if(need.length)bump(cat,'rows_with_need');if(alt.length)bump(cat,'rows_with_alternative');
    if(cond.length||cav.length)bump(cat,'rows_with_condition_or_caveat');if(fn.length||prop.length)bump(cat,'rows_with_function_or_property');if(meth.length||ev.length)bump(cat,'rows_with_method_or_evidence');
    rows.push({source:'package_table',category:cat,document:rel,docSha256:src.sha256,line:c.source.line,situation:sit,need,alternative:alt,condition:cond,caveat:cav,function:fn,property:prop,method:meth,evidence:ev});}}
  else if(f.endsWith('CONSUMER-NEEDS-STRUCTURED.json')){const raw=readFileSync(f,'utf8');const d=JSON.parse(raw);const list=d.cases??d.needs??d.scenarios??[];
   for(const x of list){const utt=x.consumer_utterance??x.synthetic_utterance??x.utterance;if(!utt)continue;
    bump(cat,'structured_cases');rows.push({source:'structured_needs',category:cat,document:rel,docSha256:sha(raw),line:null,caseId:x.id,situation:[utt],
     need:[x.goal??x.requirement??x.technical_requirement_or_evidence].filter(Boolean),alternative:[x.candidate_or_alternative].filter(Boolean),
     condition:[x.conditional_evidence_or_rejection].filter(Boolean),caveat:[x.forbidden_inference??x.incorrect_inference_to_avoid].filter(Boolean),
     evidence:[x.required_evidence??x.evidence_to_seek].filter(Boolean).flat()});}}}}
// store side
const db=new DatabaseSync(ST,{readOnly:true});
const items=db.prepare("SELECT category_id c,concept_id id,concept_kind k,section s FROM category_items WHERE concept_id IS NOT NULL AND category_id<>'pee_write_test'").all();
const byKind={};for(const i of items){byKind[i.k??'none']=(byKind[i.k??'none']??0)+1;}
const cats=new Map();for(const i of items)(cats.get(i.id)??cats.set(i.id,new Set()).get(i.id)).add(i.c);
const shared=[...cats].filter(([,s])=>s.size>1).map(([id,s])=>({conceptId:id,categories:[...s].sort()}));
const rel=db.prepare("SELECT category_id c,kind,from_ref f,to_ref t FROM category_relations").all();
const itemCat=new Map(db.prepare("SELECT item_id,category_id,concept_id FROM category_items").all().map(r=>['item:'+r.item_id,r]));
const realisations=shared.map(x=>({conceptId:x.conceptId,categories:x.categories,measuredIn:x.categories.filter(c=>rel.some(r=>r.c===c&&r.kind==='measured_by'&&itemCat.get(r.f)?.concept_id===x.conceptId))}));
const alternatives=items.filter(i=>/_(?:alternative|constraint)$/.test(i.id)).length;
mkdirSync(join(homedir(),'.local/share/product-evidence-engine/private-eval/g1b'),{recursive:true});
writeFileSync(join(homedir(),'.local/share/product-evidence-engine/private-eval/g1b/knowledge-rows.json'),JSON.stringify(rows,null,1));
const out={schema:'pee.g1b.inventory.v1',date:'2026-10-21',taughtCategoriesWithPackages:Object.keys(TAUGHT),excluded:'untaught packages 05 robot cleaners, 08 soundbars, 09 speakers',
 packageRows:counts,packageRowsTotal:rows.length,store:{conceptItems:items.length,byKind,alternativesOrConstraints:alternatives,conceptsSharedByCategories:shared.length,
 sharedWithPerCategoryMeasurement:realisations.filter(r=>r.measuredIn.length).length,shared:realisations}};
writeFileSync(new URL('../evaluation/g1b/inventory.json',import.meta.url),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({packageRows:counts,total:rows.length,store:{...out.store,shared:undefined}},null,1));
