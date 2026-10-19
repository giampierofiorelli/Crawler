/** R3 cycle 2 (owner S74): can PEE derive, from its own translation of the owner packages, which taught measurements only
 * inform an outcome? Compared with the R1+ V1 blind source verification (sufficiency of measured_by relations), which was
 * made before R3 without the translator. Freeze: evaluation/r3/sufficiency-freeze.json must match before a run.
 *   node scripts/r3-sufficiency.mjs LABEL   -> evaluation/r3/sufficiency-LABEL.json (counts); private detail with quotes */
import {readFileSync,writeFileSync,existsSync,readdirSync,statSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const label=process.argv[2];const OUT=`evaluation/r3/sufficiency-${label}.json`;if(!label||existsSync(OUT))throw Error('usage: LABEL (new)');
const sha=b=>createHash('sha256').update(b).digest('hex');
const fz=existsSync('evaluation/r3/sufficiency-freeze.json')?JSON.parse(readFileSync('evaluation/r3/sufficiency-freeze.json','utf8')):null;
if(fz&&!label.includes('dev'))for(const f of fz.files)if(sha(readFileSync(f.file))!==f.sha256)throw Error('changed after the freeze: '+f.file);
const D=new URL('../dist/src/',import.meta.url).href;const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const QK=await import(D+'quantity_knowledge.js');const KT=await import(D+'knowledge_translation.js');const KL=await import(D+'knowledge_link.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const qk=QK.loadQuantityKnowledge();const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const V1=JSON.parse(readFileSync(process.env.PEE_FORCE_OVERLAY??'/home/user/pee-knowledge/knowledge-overlays/r2-relation-force.v1.json','utf8'));
const PKGD=join(PE,'r1v/packages');const PKG={air_purifiers:'PEE-CATEGORY-RESEARCH-04-AIR-PURIFIERS-COMPLETE-v1.2.0',televisions:'PEE-CATEGORY-RESEARCH-07-TELEVISIONS-COMPLETE-v1.0.0',air_fryers:'PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES/af',
 coffee_machines:'PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES',dishwashers:'PEE-CATEGORY-RESEARCH-06-HOUSEHOLD-DISHWASHERS-COMPLETE-v2.0.0',dehumidifiers:'PEE-DEHUMIDIFIERS-RESTORED-SOURCES-R01-R39'};
const pkgDocs0=dir=>readdirSync(join(PKGD,dir)).filter(f=>f.endsWith('.md')).map(f=>({source:dir+'/'+f,md:readFileSync(join(PKGD,dir,f),'utf8')}));
const pkgDocs=cat=>{const out=[];const w=x=>{if(!existsSync(x))return;for(const f of readdirSync(x)){const q=join(x,f);if(statSync(q).isDirectory()){if(!/archive/.test(f))w(q);}else if(f.endsWith('.md'))out.push({source:q.slice(PKGD.length+1),md:readFileSync(q,'utf8')});}};
 w(join(PKGD,PKG[cat]));return cat==='coffee_machines'?out.filter(x=>/COFFEE/.test(x.source)):cat==='dehumidifiers'?out.concat(pkgDocs0('PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES').filter(x=>/DEHUMID/.test(x.source))):out;};
const C={};const inc=(k,n=1)=>C[k]=(C[k]??0)+n;const detail={};
const CATS=(process.env.R3_CATS??Object.keys(PKG).join(',')).split(',');
for(const cat of CATS){const view=KL.teachingView(store,cat);
 const concepts=store.categoryItems246(cat).filter(i=>i.concept).map(i=>({id:i.concept.id,statement:i.statement,aliases:i.concept.aliases}));
 const statements=pkgDocs(cat).flatMap(d=>KT.translateDocument(qk,d.md,{source:d.source,concepts}).statements);
 const outcomeConcepts=store.categoryItems246(cat).filter(i=>i.concept?.kind==='outcome').map(i=>({id:i.concept.id,statement:i.statement,aliases:i.concept.aliases}));
 const derived=KT.deriveSufficiency(statements,view,outcomeConcepts);const byRel=new Map(derived.map(d=>[d.relation,d]));
 inc(cat+':statements',statements.length);inc(cat+':not_sufficient',statements.filter(s=>s.type==='not_sufficient'&&!s.selfCheck.length).length);
 const rels=view.measurements.flatMap(m=>m.outcomes.map(o=>({...o,measurement:m.concept.id})));detail[cat]={derived,rels:[]};
 for(const r of rels){const ref=V1.relations[r.relation]?.sufficiency??'no_reference';const got=byRel.has(r.relation)?'informs_only':'unresolved';
  inc(`ref_${ref}->${got}`);inc(`${cat}:ref_${ref}->${got}`);detail[cat].rels.push({...r,ref,got});}}
store.close();
const pub={schema:'pee.r3.sufficiency.v1',label,generatedAt:new Date().toISOString(),
 reference:'R1+ V1 blind source verification (made before R3, without the translator; same model family; not independent validation)',
 tier:label.includes('dev')?'development (inspected)':'first run against the reference (mechanism frozen first)',counts:C};
writeFileSync(OUT,JSON.stringify(pub,null,1)+'\n');mkdirSync(join(PE,'r3/runs'),{recursive:true});writeFileSync(join(PE,'r3/runs',`sufficiency-${label}.json`),JSON.stringify({...pub,detail},null,1)+'\n');
console.log(Object.entries(C).filter(([k])=>k.startsWith('ref_')).map(([k,v])=>k+'='+v).join(' '));
