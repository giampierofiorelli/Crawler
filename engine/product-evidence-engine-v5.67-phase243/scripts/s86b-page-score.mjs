#!/usr/bin/env node
/** S86b: score page-recovery runs (scripts/s86b-page-recovery.mjs) against the sealed blind reference of the 12 retained S80
 * pages (private: s86b/annotations, hash in evaluation/s86b/page-reference-freeze.json). Public output: counts only.
 *   node scripts/s86b-page-score.mjs --runs NAME=PRIVATE_RUN [NAME=...] --out PUBLIC_FILE [--private PRIVATE_DETAIL]
 * Per configuration and evidential role: present (unique mentions, repeats folded), candidate (some candidate holds the
 * value in that line), interpreted (accepted by the persistence screen with the right kind; a build without typing gets
 * 'accepted_untyped'), rejected (with the screen's reason), stored_attributed (accepted and associated with the page product
 * when the reference says the reviewed product; left unresolved when it says another product). Also: accepted values whose
 * reference role is not a measurement (false results) and accepted values matching nothing in the reference. */
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval/s86b');
const runs=[];{const i=process.argv.indexOf('--runs');for(let k=i+1;k<process.argv.length&&!process.argv[k].startsWith('--');k++){const [n,f]=process.argv[k].split('=');runs.push([n,JSON.parse(readFileSync(f,'utf8'))]);}}
const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9.]+/g,' ').trim();const toks=s=>new Set(norm(s).split(' ').filter(w=>w.length>2&&!/^\d/.test(w)));
const sim=(a,b)=>{const A=toks(a),B=toks(b);if(!A.size||!B.size)return 0;let n=0;for(const w of A)if(B.has(w))n++;return n/Math.min(A.size,B.size);};
const KIND={sound_level:['sound_pressure_level','sound_power_level'],energy_per_cycle:['energy_per_event','energy'],ratio:['ratio','amount_fraction'],count:[],other:[]};
const ref={};for(const f of readdirSync(join(PE,'annotations')).sort()){const page=f.replace('.json','');const lines=readFileSync(join(PE,'worksheets',page+'.full.txt'),'utf8').split('\n');
 const text=n=>(lines[n-1]??'').replace(/^L\d+: /,'');const a=JSON.parse(readFileSync(join(PE,'annotations',f),'utf8'));
 ref[page+'.html']=a.map((x,i)=>({...x,i,lineText:text(x.line),orig:(x.dup_of==null||x.dup_of===x.line)?null:x.dup_of}));}
const detail={};const out={schema:'pee.s86b.page-recovery-score.v1',reference:'blind annotation (4 annotators, protocol ANNOTATION-PROTOCOL.md), sealed before any page run',configs:{}};
for(const [name,R] of runs){const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const det=[];
 for(const [page,p] of Object.entries(R.pages)){const A=ref[page]??[];const used=new Set();
  // fold repeats: a mention repeated elsewhere counts once (as the first mention); a candidate on any repeat counts for it
  const key=x=>`${x.role}|${x.orig??x.line}|${x.value}`;const uniq=new Map();for(const x of A)if(typeof x.value==='number'&&!uniq.has(key(x)))uniq.set(key(x),x);
  const match=c=>A.filter(x=>typeof x.value==='number'&&Math.abs(x.value-c.value)<1e-9&&(sim(x.lineText,c.block)>=0.5||norm(c.block).includes(norm(x.lineText).slice(0,40))||norm(x.lineText).includes(norm(c.block).slice(0,40))));
  const hits=new Map();for(const c of p.candidates){const m=match(c);if(!m.length){if(c.screened==='accepted'){inc('accepted_unmatched');det.push({page,unmatched:c.value+' '+c.unit,block:c.block.slice(0,160)});}continue;}
   for(const x of m){const k=key(x);(hits.get(k)??hits.set(k,[]).get(k)).push(c);}}
  for(const [k,x] of uniq){const role=x.role;inc(`${role}:present`);const cs=hits.get(k)??[];if(!cs.length){det.push({page,role,missed:x.surface,what:x.what});continue;}
   inc(`${role}:candidate`);const acc=cs.find(c=>c.screened==='accepted');
   if(!acc){for(const r of new Set(cs.map(c=>c.screened)))inc(`${role}:rejected:${r}`);continue;}
   inc(`${role}:accepted`);
   if(role!=='measured_by_publisher'){inc('false_result:'+role);det.push({page,role,acceptedAs:acc.value+' '+acc.unit,what:x.what});continue;}
   const want=KIND[x.kind]??[x.kind];
   if(!acc.kinds)inc(`${role}:accepted_untyped`);else if(want.some(k2=>acc.kinds.includes(k2)))inc(`${role}:interpreted_kind_correct`);else{inc(`${role}:interpreted_kind_wrong`);det.push({page,kindWrong:x.what,want:x.kind,got:acc.kinds});}
   const okAssoc=x.subject==='reviewed_product'?/^(?:page_main_product|table_row_model)/.test(acc.association??''):acc.association==='subject_unresolved';
   inc(okAssoc?`${role}:stored_attributed_correctly`:`${role}:stored_attribution_wrong_or_unresolved`);
   if(x.subject==='other_product'&&/^(?:page_main_product|table_row_model)/.test(acc.association??''))inc('misattributed_to_page_product');}}
 out.configs[name]={build:R.build,config:R.config,totals:Object.fromEntries(Object.entries(T).sort())};detail[name]=det;}
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');if(arg('private'))writeFileSync(arg('private'),JSON.stringify(detail,null,1)+'\n');
for(const [n,c] of Object.entries(out.configs))console.log(n,JSON.stringify(c.totals));
