#!/usr/bin/env node
/** S78: translate the owner's research packages with PEE's translator and record the statements in the knowledge store
 * (knowledge_statements, v10). Whole documents; the dev/held-out split is an evaluation device, not a storage boundary.
 * The translator id is the cue version plus a hash of the translator source, so a corrected translator supersedes.
 *   node scripts/s78-record-statements.mjs [--dry-run]   (counts only) */
import {readFileSync,readdirSync,statSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const dry=process.argv.includes('--dry-run');const sha=b=>createHash('sha256').update(b).digest('hex');
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');const PKGD=join(PE,'r1v/packages');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const KT=await import(D+'knowledge_translation.js');
const KS=await import(D+'knowledge_statements.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const qk=QK.loadQuantityKnowledge();const translator=KT.loadTranslationCues().cues.version+'+'+sha(readFileSync(new URL('../src/knowledge_translation.ts',import.meta.url))).slice(0,12);
const split=JSON.parse(readFileSync(join(PE,'r3/section-split.json'),'utf8'));
const docs=Object.entries(split.docs).map(([cat,d])=>[cat,join(PKGD,d.file)]);
const walk=x=>readdirSync(x).flatMap(f=>{const q=join(x,f);return statSync(q).isDirectory()?(/archive/.test(f)?[]:walk(q)):f.endsWith('.md')?[q]:[]});
for(const [cat,dir] of Object.entries({televisions:'PEE-CATEGORY-RESEARCH-07-TELEVISIONS-COMPLETE-v1.0.0',dishwashers:'PEE-CATEGORY-RESEARCH-06-HOUSEHOLD-DISHWASHERS-COMPLETE-v2.0.0'}))
 for(const f of walk(join(PKGD,dir)))docs.push([cat,f]);
for(const f of readdirSync(join(PKGD,'PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES')).filter(f=>/DEHUMID/.test(f)&&f.endsWith('.md')))docs.push(['dehumidifiers',join(PKGD,'PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES',f)]);
const store=new KnowledgeStore246(join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite'));
const T={};const inc=(k,n)=>T[k]=(T[k]??0)+n;
for(const [cat,file] of docs){const b=readFileSync(file);const md=b.toString('utf8');
 const concepts=store.categoryItems246(cat).filter(i=>i.concept).map(i=>({id:i.concept.id,statement:i.statement,aliases:i.concept.aliases}));
 const r=KT.translateDocument(qk,md,{source:cat,concepts});
 const doc=file.slice(PKGD.length+1);inc('documents',1);inc('statements',r.statements.length);
 if(dry){inc('selfcheck_failed',r.statements.filter(s=>s.selfCheck.length).length);continue;}
 const res=KS.recordTranslation(store,{categoryId:cat,sourceDocument:doc,sourceSha256:sha(b),translator,statements:r.statements});
 for(const [k,v] of Object.entries(res))inc(k,v);}
const rel={};for(const r of store.db.prepare("SELECT reliability,count(*) n FROM knowledge_statements WHERE state='current' GROUP BY 1").all())rel[r.reliability]=r.n;
store.close();console.log(dry?'DRY RUN':'recorded',translator,JSON.stringify(T),JSON.stringify(rel));
