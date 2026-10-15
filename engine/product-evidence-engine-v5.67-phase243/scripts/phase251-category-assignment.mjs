#!/usr/bin/env node
/** Phase251: proposes (and with --apply 1, writes) identity-safe category assignments for uncategorised products, and
 * scores proposals against evaluation/phase251/category-assignment-gold.json when it covers them.
 * Usage: node scripts/phase251-category-assignment.mjs --db STORE [--apply 1] [--out FILE] */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {resolve} from 'node:path';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {proposeCategories251,applyCategoryAssignments251} from '../dist/src/phase251_category_assignment.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const store=new KnowledgeStore246(resolve(F.db));
const props=proposeCategories251(store);
const goldF=new URL('../evaluation/phase251/category-assignment-gold.json',import.meta.url);
const gold=existsSync(goldF)?JSON.parse(readFileSync(goldF,'utf8')).products:{};
const decl=id=>store.db.prepare('SELECT count(*) n FROM declarations WHERE product_id=?').get(id).n;
const NOCAT=new Set(['accessory','not_a_product','bundle','unknown']);
const s={products:props.length,assigned:0,correct:0,incorrect:0,unresolvedJustified:0,unresolvedMissed:0,declarationsCorrectlyCategorised:0,declarationsWronglyCategorised:0,declarationsUnresolved:0,variantsCovered:0,byOutcome:{},errors:[]};
for(const p of props){s.byOutcome[p.outcome]=(s.byOutcome[p.outcome]??0)+1;const g=gold[p.productId]?.truth;const d=decl(p.productId);
 if(p.outcome==='assigned'){s.assigned++;if(g===p.categoryId){s.correct++;s.declarationsCorrectlyCategorised+=d;s.variantsCovered+=store.db.prepare('SELECT count(*) n FROM variants WHERE product_id=?').get(p.productId).n;}
  else{s.incorrect++;s.declarationsWronglyCategorised+=d;s.errors.push(`${p.name} -> ${p.categoryId} (gold ${g}; ${p.detail})`);}}
 else{s.declarationsUnresolved+=d;if(NOCAT.has(g))s.unresolvedJustified++;else{s.unresolvedMissed++;}}}
const applied=F.apply?applyCategoryAssignments251(store,props,'2026-10-15T18:00:00.000Z'):0;
store.close();
if(F.out)writeFileSync(resolve(F.out),JSON.stringify({schema:'pee251.category-assignment.v1',summary:s,applied,proposals:props},null,1)+'\n');
console.log(JSON.stringify({...s,applied}));
