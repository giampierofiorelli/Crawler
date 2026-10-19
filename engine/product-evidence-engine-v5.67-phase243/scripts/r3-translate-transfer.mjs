/** R3 cycle 3 (S76): translate the transfer packages (televisions, household dishwashers, dehumidifiers), never used
 * to build or tune alignment, for a fresh blind alignment reference. Private run r3/runs/translate-transfer.json; counts. */
import {readFileSync,writeFileSync,existsSync,readdirSync,statSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const D=new URL('../dist/src/',import.meta.url).href;const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const OUT=join(PE,'r3/runs/translate-transfer.json');if(existsSync(OUT))throw Error('exists');
const QK=await import(D+'quantity_knowledge.js');const KT=await import(D+'knowledge_translation.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const qk=QK.loadQuantityKnowledge();const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const PKGD=join(PE,'r1v/packages');const PKG={televisions:'PEE-CATEGORY-RESEARCH-07-TELEVISIONS-COMPLETE-v1.0.0',dishwashers:'PEE-CATEGORY-RESEARCH-06-HOUSEHOLD-DISHWASHERS-COMPLETE-v2.0.0',dehumidifiers:'PEE-DEHUMIDIFIERS-RESTORED-SOURCES-R01-R39'};
const walk=x=>readdirSync(x).flatMap(f=>{const q=join(x,f);return statSync(q).isDirectory()?(/archive/.test(f)?[]:walk(q)):f.endsWith('.md')?[q]:[]});
const detail={};const C={};
for(const [cat,dir] of Object.entries(PKG)){const files=walk(join(PKGD,dir));if(cat==='dehumidifiers')files.push(...readdirSync(join(PKGD,'PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES')).filter(f=>/DEHUMID/.test(f)&&f.endsWith('.md')).map(f=>join(PKGD,'PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES',f)));
 const concepts=store.categoryItems246(cat).filter(i=>i.concept).map(i=>({id:i.concept.id,statement:i.statement,aliases:i.concept.aliases}));
 detail[cat]={statements:files.flatMap(f=>KT.translateDocument(qk,readFileSync(f,'utf8'),{source:f.slice(PKGD.length+1),concepts}).statements)};C[cat]=detail[cat].statements.length;}
store.close();mkdirSync(join(PE,'r3/runs'),{recursive:true});writeFileSync(OUT,JSON.stringify({side:'transfer',detail},null,1)+'\n');console.log(C);
