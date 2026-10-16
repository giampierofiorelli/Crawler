#!/usr/bin/env node
/** Phase253 Stage 7 — validates owner teaching packages (pee253.teaching-package.v1) and, with --apply 1 --db FILE,
 * applies them through applyTeaching252 (every statement a technical hypothesis, unreviewed). Without --apply it only
 * validates and reports what would be taught. Packages are unverified research input: apply them to an evaluation copy
 * first, and adopt into the operational store only after a pre-registered first run shows they do not make advice worse.
 * Usage: node scripts/phase253-import-package.mjs --packages FILE[,FILE...] [--apply 1 --db FILE]
 */
import {readFileSync} from 'node:fs';import {resolve} from 'node:path';
import {validateTeachingPackage253,compileTeachingPackage253} from '../dist/src/phase253_teaching_package.js';
import {applyTeaching252,phraseCount252,lessonOf252} from '../dist/src/phase252_category_teaching.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
if(!F.packages)throw Error('usage: --packages FILE[,FILE...] [--apply 1 --db FILE]');
const teachings=[];
for(const f of F.packages.split(',')){
 try{const t=compileTeachingPackage253(validateTeachingPackage253(JSON.parse(readFileSync(resolve(f),'utf8'))));teachings.push(t);
  console.log(JSON.stringify({file:f,categoryId:t.categoryId,version:t.version,needs:t.needs.length,phrases:phraseCount252(lessonOf252(t)),valid:true}));}
 catch(e){console.error(`${f}: ${e.message}`);process.exitCode=2;}
}
if(F.apply==='1'&&!process.exitCode){if(!F.db)throw Error('--apply needs an explicit --db (use an evaluation copy first)');
 const {KnowledgeStore246}=await import('../dist/src/phase246_knowledge_store.js');const s=new KnowledgeStore246(resolve(F.db));
 console.log(JSON.stringify({applied:applyTeaching252(s,teachings)}));s.close();}
