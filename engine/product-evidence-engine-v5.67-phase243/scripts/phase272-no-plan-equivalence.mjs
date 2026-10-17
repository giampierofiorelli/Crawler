#!/usr/bin/env node
/** Phase272: without a plan, the extractor must behave exactly as at commit 09526c4 (arm A). Runs both builds on every
 * retained authentic page (private-eval/phase268-272 raw/) and compares test leads, comparative results and qualitative
 * observations byte for byte. Prints counts only. Usage: node scripts/phase272-no-plan-equivalence.mjs [ARM_A_DIST] */
import {readFileSync,readdirSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const A=resolve(process.argv[2]??'/home/user/p272-armA/engine/product-evidence-engine-v5.67-phase243/dist/src')+'/',B=resolve('dist/src')+'/';
const load=async r=>({s:await import(r+'phase245_spec_extraction.js'),t:await import(r+'phase265_test_measurements.js'),q:await import(r+'phase269_qualitative_observations.js')});
const MA=await load(A),MB=await load(B);const root=join(homedir(),'.local/share/product-evidence-engine/private-eval');
let pages=0,diff=[];
for(const ph of ['phase268','phase270','phase271','phase272']){const dir=join(root,ph,'raw');if(!existsSync(dir))continue;
 for(const f of readdirSync(dir).filter(x=>x.endsWith('.html')).sort()){const html=readFileSync(join(dir,f),'utf8');const url='https://example.test/'+f;const h=createHash('sha256').update(html).digest('hex');
  const run=M=>{const x=M.t.testDocumentSubject268(M.s.extractSpecifications245(html,url),'independent_original_test');
   return JSON.stringify([M.t.testLeadsFromHtml265(html,url,h,x,{category:'air_fryers'}),M.q.qualitativeObservations269(html)]);};
  pages++;if(run(MA)!==run(MB))diff.push(ph+'/'+f);}}
console.log(JSON.stringify({pages,identical:pages-diff.length,different:diff}));process.exitCode=diff.length?1:0;
