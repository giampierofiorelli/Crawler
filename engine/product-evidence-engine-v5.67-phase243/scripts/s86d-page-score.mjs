#!/usr/bin/env node
/** S86d scorer v2.1: the S86c scorer v2 (scripts/s86c-page-score.mjs, unchanged) with a reference directory argument
 * (--reference DIR holding annotations/ and worksheets/; default the S86b reference), per-page totals (for per-publisher
 * and per-category breakdowns) and page-bootstrap 95% intervals of the headline rates (seeded, 2000 resamples).
 * Matching and counting are identical to v2. Corrections, from the S86c audit:
 *  - the unit is the annotators' FIRST MENTION (dup_of null or own line), as in the sealed freeze record (123 measured);
 *    v1 keyed on role|line|value, so a repeat printed with a rounded value counted as a new result and two mentions of the
 *    same value on one line were merged;
 *  - a repeat maps to its first mention (same role at the dup_of line, nearest value);
 *  - matching is one-to-one: a candidate is anchored when the annotated surface occurs in its block AROUND the candidate's
 *    own value offset; otherwise it may match by line similarity (>= 0.5) with the value present (flagged 'similar');
 *  - stages: candidate, admitted by the screen, ACTUALLY PERSISTED (re-ingested into a store copy), product association.
 *   node scripts/s86c-page-score.mjs --runs NAME=RUN ... --out PUBLIC [--audit PRIVATE]
 * Public output: counts only. */
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const PE=arg('reference')??join(homedir(),'.local/share/product-evidence-engine/private-eval/s86b');
const runs=[];{const i=process.argv.indexOf('--runs');for(let k=i+1;k<process.argv.length&&!process.argv[k].startsWith('--');k++){const j=process.argv[k].indexOf('=');runs.push([process.argv[k].slice(0,j),JSON.parse(readFileSync(process.argv[k].slice(j+1),'utf8'))]);}}
const norm=s=>String(s).toLowerCase().replace(/[‐-―]/g,'-').replace(/[^a-z0-9.%°/³²-]+/g,' ').replace(/\s+/g,' ').trim();
const toks=s=>new Set(norm(s).split(' ').filter(w=>w.length>2&&!/^\d/.test(w)));
const sim=(a,b)=>{const A=toks(a),B=toks(b);if(!A.size||!B.size)return 0;let n=0;for(const w of A)if(B.has(w))n++;return n/Math.min(A.size,B.size);};
const KIND={sound_level:['sound_pressure_level','sound_power_level'],energy_per_cycle:['energy_per_event','energy'],ratio:['ratio','amount_fraction'],count:[],other:[]};
// reference: units (first mentions) and mentions (every annotation, mapped to its unit)
const ref={};
for(const f of readdirSync(join(PE,'annotations')).sort()){const page=f.replace('.json','')+'.html';
 const lines=readFileSync(join(PE,'worksheets',f.replace('.json','.full.txt')),'utf8').split('\n');const text=n=>(lines[n-1]??'').replace(/^L\d+: /,'');
 const A=JSON.parse(readFileSync(join(PE,'annotations',f),'utf8')).map((x,i)=>({...x,i,lineText:text(x.line)}));
 const first=x=>x.dup_of==null||x.dup_of===x.line;
 for(const x of A){if(first(x)){x.unit=x.i;continue;}
  const at=A.filter(y=>y.line===x.dup_of&&first(y));const same=at.filter(y=>y.role===x.role);const pool=same.length?same:at;
  const num=v=>typeof v==='number'?v:NaN;pool.sort((a,b)=>Math.abs(num(a.value)-num(x.value))-Math.abs(num(b.value)-num(x.value)));x.unit=pool[0]?.i??x.i;}
 ref[page]=A;}
const out={schema:'pee.s86c.page-recovery-score.v2',unit:'first mention (as the sealed freeze record)',configs:{}};const audit={};
for(const [name,R] of runs){const T={};const PP={};let cur=null;const inc=(k,n=1)=>{T[k]=(T[k]??0)+n;if(cur)cur[k]=(cur[k]??0)+n;};const au=[];
 for(const [page,p] of Object.entries(R.pages)){cur=PP[page]={publisher:p.publisher??(p.url?new URL(p.url).hostname:null),category:p.category??null};const A=ref[page]??[];const units=A.filter(x=>x.unit===x.i);
  for(const u of units)inc(`${u.role}:present`);
  // candidate-mention pairs
  const pairs=[];
  p.candidates.forEach((c,ci)=>{for(const x of A){if(typeof x.value!=='number'||Math.abs(x.value-c.value)>1e-9)continue;
   const blk=norm(c.block),surf=norm(x.surface);let anchored=false;
   if(surf){const pre=norm(c.block.slice(0,c.valueOffset)).length;let k=blk.indexOf(surf);while(k>=0){if(pre>=k-1&&pre<=k+surf.length){anchored=true;break;}k=blk.indexOf(surf,k+1);}}
   const s=sim(x.lineText,c.block);if(!anchored&&s<0.5)continue;
   pairs.push({ci,x,score:(anchored?2:1)+s/10,anchored});}});
  const rank=c=>c.persisted?3:c.screened==='accepted'?2:1;
  pairs.sort((a,b)=>b.score-a.score||rank(p.candidates[b.ci])-rank(p.candidates[a.ci]));
  // one-to-one between candidates and MENTIONS (repeats included); a unit is found when any of its mentions is matched, and
  // its best candidate decides the stages; further candidates on the same unit are duplicate readings of one result
  const usedC=new Set(),usedM=new Set(),byUnit=new Map();
  for(const q of pairs){if(usedC.has(q.ci)||usedM.has(q.x.i))continue;usedC.add(q.ci);usedM.add(q.x.i);(byUnit.get(q.x.unit)??byUnit.set(q.x.unit,[]).get(q.x.unit)).push(q);}
  const best=new Map();for(const [u,qs] of byUnit){qs.sort((a,b)=>rank(p.candidates[b.ci])-rank(p.candidates[a.ci])||b.score-a.score);best.set(u,qs[0]);
   const dup=qs.slice(1).filter(q=>p.candidates[q.ci].persisted).length;if(dup)inc('persisted_duplicate_rows_of_one_result',dup);}
  for(const u of units){const q=best.get(u.i);const role=u.role;if(!q){if(role==='measured_by_publisher')au.push({page,miss:u.surface,what:u.what,subject:u.subject});continue;}
   const c=p.candidates[q.ci];inc(`${role}:candidate`);inc(`match:${q.anchored?'anchored':'similar'}`);
   au.push({page,unit:u.what,role,subject:u.subject,ref:u.surface,cand:`${c.value} ${c.unit}`,window:c.window,anchored:q.anchored,screened:c.screened,persisted:c.persisted,product:c.persistedProduct?'page':'none'});
   if(c.screened==='accepted')inc(`${role}:admitted`);else inc(`${role}:refused:${c.screened}`);
   if(c.persisted)inc(`${role}:persisted`);
   if(role!=='measured_by_publisher'){if(c.persisted)inc(`false_persisted:${role}`);continue;}
   if(c.screened==='accepted'){const want=KIND[u.kind]??[u.kind];inc(!c.kinds?`${role}:kind_untyped`:want.some(k=>c.kinds.includes(k))?`${role}:kind_correct`:`${role}:kind_wrong`);}
   if(c.persisted){if(u.subject==='reviewed_product')inc(c.persistedProduct?'measured:persisted_on_reviewed_product_correct':'measured:persisted_reviewed_left_unresolved');
    else inc(c.persistedProduct?'measured:persisted_other_product_ON_PAGE_PRODUCT_wrong':'measured:persisted_other_product_unresolved_correct');}}
  // persisted candidates matching no mention: value-only matches are listed for manual adjudication, never credited
  p.candidates.forEach((c,ci)=>{if(usedC.has(ci)||!c.persisted)return;const same=units.filter(u=>typeof u.value==='number'&&Math.abs(u.value-c.value)<1e-9);
   const roles=[...new Set(same.map(u=>u.role))];inc(same.length?`persisted_value_only:${roles.join('+')}`:'persisted_unannotated');
   au.push({page,unmatched:`${c.value} ${c.unit}`,valueOnly:same.map(u=>({role:u.role,what:u.what,subject:u.subject})),window:c.window});});
  // role classification of observations the S86c reader set aside (when present)
  for(const r of p.roles86c??[]){const x=A.find(y=>typeof y.value==='number'&&Math.abs(y.value-r.value)<1e-9&&sim(y.lineText,r.window??'')>=0.4);
   inc(`roles86c:${r.role}->${x?A[x.unit].role:'unannotated'}`);}}
 // page-bootstrap 95% intervals (pages resampled with replacement; seeded): stored-correct per page, and the shares of stored rows
 // that are non-results or another product's result on the reviewed product
 const pages=Object.values(PP);let seed=86;const rnd=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);
 const stat=ps=>{const g=k=>ps.reduce((a,p)=>a+(p[k]??0),0);const stored=g('measured_by_publisher:persisted')+Object.keys(T).filter(k=>k.startsWith('false_persisted')).reduce((a,k)=>a+ps.reduce((b,p)=>b+(p[k]??0),0),0);
  const fp=Object.keys(T).filter(k=>k.startsWith('false_persisted')).reduce((a,k)=>a+ps.reduce((b,p)=>b+(p[k]??0),0),0);
  return {correct:g('measured:persisted_on_reviewed_product_correct')+g('measured:persisted_other_product_unresolved_correct'),falseShare:stored?fp/stored:0,wrongProductShare:stored?g('measured:persisted_other_product_ON_PAGE_PRODUCT_wrong')/stored:0};};
 const boots=[];for(let b=0;b<2000&&pages.length;b++){const s=[];for(let i=0;i<pages.length;i++)s.push(pages[Math.floor(rnd()*pages.length)]);boots.push(stat(s));}
 const ci=k=>{const v=boots.map(x=>x[k]).sort((a,b)=>a-b);return v.length?[v[Math.floor(0.025*v.length)],v[Math.floor(0.975*v.length)]]:null;};
 out.configs[name]={build:R.build,config:R.config,off:R.off??[],totals:Object.fromEntries(Object.entries(T).sort()),point:stat(pages),bootstrap95:{correct:ci('correct'),falseShare:ci('falseShare'),wrongProductShare:ci('wrongProductShare')},perPage:PP};audit[name]=au;}
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');if(arg('audit'))writeFileSync(arg('audit'),JSON.stringify(audit,null,1)+'\n');
for(const [n,c] of Object.entries(out.configs)){const t=c.totals;console.log(n.padEnd(14),'present',t['measured_by_publisher:present'],'cand',t['measured_by_publisher:candidate']??0,'admit',t['measured_by_publisher:admitted']??0,'persist',t['measured_by_publisher:persisted']??0,
 'onReviewedOK',t['measured:persisted_on_reviewed_product_correct']??0,'otherOnPage',t['measured:persisted_other_product_ON_PAGE_PRODUCT_wrong']??0,'falsePersist',Object.entries(t).filter(([k])=>k.startsWith('false_persisted')).reduce((a,[,v])=>a+v,0),'dupRows',t.persisted_duplicate_rows_of_one_result??0,'valueOnly',Object.entries(t).filter(([k])=>k.startsWith('persisted_value_only')).reduce((a,[,v])=>a+v,0),'unannotated',t.persisted_unannotated??0,'similarOnly',t['match:similar']??0);}
