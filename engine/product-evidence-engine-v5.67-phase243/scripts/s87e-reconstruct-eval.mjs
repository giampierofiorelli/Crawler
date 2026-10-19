#!/usr/bin/env node
/** S87e: score the reconstruction techniques (src/observation_reconstruction.ts) on the declaration sample against the sealed
 * blind annotation. Per technique and slot: produced, correct, wrong (an error introduced where the adapter had nothing),
 * undetermined; per host; worst host. Scope dev|check follows evaluation/s87e/preregistration.json.
 *   node scripts/s87e-reconstruct-eval.mjs --dir PRIVATE_S87E --scope dev|check [--out PUBLIC] [--private DETAIL] */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const R=await import(D+'observation_reconstruction.js');
const qk=QK.loadQuantityKnowledge();const dir=arg('dir');const J=f=>JSON.parse(readFileSync(join(dir,f),'utf8'));
const pre=JSON.parse(readFileSync(new URL('../evaluation/s87e/preregistration.json',import.meta.url),'utf8'));const DEV=new Set(pre.declarationSplit.developmentHosts);
const ctx=new Map(J('declaration-context.json').map(c=>[c.id,c]));const key=J('annotation-key.json');const ann=J('annotations-blind.json').items;
const scope=arg('scope')??'dev';const reproduce=process.argv.includes('--reproduce-first-run');
// one-to-one matching (S87e review): each annotated condition can be credited to at most one produced condition
const match1to1=(prod,ann)=>{const adj=prod.map(x=>ann.map((y,j)=>overlap(x.value,`${y.value}`)?j:-1).filter(j=>j>=0));const own=new Array(ann.length).fill(-1);
 const tryk=(i,seen)=>{for(const j of adj[i]){if(seen.has(j))continue;seen.add(j);if(own[j]<0||tryk(own[j],seen)){own[j]=i;return true;}}return false;};
 let n=0;for(let i=0;i<prod.length;i++)if(tryk(i,new Set()))n++;return n;};
const toks=s=>new Set(String(s??'').toLowerCase().replace(/[^a-z0-9.%°]+/g,' ').split(' ').filter(w=>w.length>1));
const overlap=(a,b)=>{const A=toks(a),B=toks(b);if(!A.size||!B.size)return false;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.min(A.size,B.size)>=0.5;};
const rows=[];
for(const k of key){const isDev=DEV.has(k.host);if(scope==='dev'&&!isDev||scope==='check'&&isDev)continue;const c=ctx.get(k.ref);const a=ann[k.id];if(!c||!a)continue;
 for(const t of ['A','B','C']){const r=R.reconstructDeclaration(qk,c,t,{rejectedObjectRule:reproduce});rows.push({id:k.id,host:k.host,t,a,r});}}
const S=(rs)=>{const s={items:rs.length,form:{correct:0,wrong:0,notAProperty:0},
 quantityKind:{annotated:0,produced:0,correct:0,wrong:0},basis:{annotated:0,produced:0,correct:0,wrong:0,falsePositive:0},
 constraints:{annotatedItems:0,annotated:0,produced:0,correct:0,matchedAnnotated:0},objectOfInterest:{annotated:0,produced:0,correct:0,wrong:0},
 procedure:{annotated:0,produced:0,falsePositive:0},categoricalScale:{annotated:0,produced:0,correct:0,wrong:0}};
 for(const {a,r} of rs){
  if(a.form==='not_a_property'){s.form.notAProperty++;continue;}
  if(a.form===r.form)s.form.correct++;else s.form.wrong++;
  if(a.form==='quantity'&&r.form==='quantity'&&a.quantityKind&&a.quantityKind!=='unclear'){s.quantityKind.annotated++;if(r.quantityKind.value){s.quantityKind.produced++;if(r.quantityKind.value===a.quantityKind)s.quantityKind.correct++;else s.quantityKind.wrong++;}}
  if(a.form==='quantity'){const ab=['none','unclear'].includes(a.basis)?null:a.basis;if(ab)s.basis.annotated++;
   if(r.basis.value){s.basis.produced++;if(!ab)s.basis.falsePositive++;else if(r.basis.value===ab)s.basis.correct++;else s.basis.wrong++;}}
  const ac=a.constraints??[];if(ac.length)s.constraints.annotatedItems++;s.constraints.annotated+=ac.length;s.constraints.produced+=r.constraints.length;
  const m=match1to1(r.constraints,ac);s.constraints.correct+=m;s.constraints.matchedAnnotated+=m;
  if(a.objectOfInterest)s.objectOfInterest.annotated++;
  if(r.objectOfInterest.value){s.objectOfInterest.produced++;if(a.objectOfInterest&&overlap(r.objectOfInterest.value,a.objectOfInterest))s.objectOfInterest.correct++;else s.objectOfInterest.wrong++;}
  if(a.procedureNamed)s.procedure.annotated++;if(r.procedure.value){s.procedure.produced++;if(!a.procedureNamed)s.procedure.falsePositive++;}
  if(a.form==='categorical'&&r.form==='categorical'&&a.categoricalScale){s.categoricalScale.annotated++;if(r.categoricalScale.value){s.categoricalScale.produced++;if(r.categoricalScale.value===a.categoricalScale)s.categoricalScale.correct++;else s.categoricalScale.wrong++;}}}
 return s;};
const out={schema:'pee.s87e.reconstruct-eval.v2',scope,reproduceFirstRun:reproduce,note:'declarations; blind Claude-agent reference; strict scoring; v2: one-to-one condition matching (correct = matched pairs)',techniques:{}};
for(const t of ['A','B','C']){const rs=rows.filter(r=>r.t===t);const hosts=[...new Set(rs.map(r=>r.host))];
 const byHost=Object.fromEntries(hosts.map(h=>[h,S(rs.filter(r=>r.host===h))]));
 const kindAcc=Object.entries(byHost).filter(([,v])=>v.quantityKind.annotated>=3).map(([h,v])=>[h,+(v.quantityKind.correct/v.quantityKind.annotated).toFixed(2)]).sort((x,y)=>x[1]-y[1]);
 out.techniques[t]={all:S(rs),worstHostQuantityKind:kindAcc[0]??null,hosts:hosts.length};}
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
if(arg('private'))writeFileSync(arg('private'),JSON.stringify(rows.map(({id,host,t,a,r})=>({id,host,t,a,r})),null,1));
for(const [t,v] of Object.entries(out.techniques)){const s=v.all;console.log(t,'items',s.items,'| form',s.form.correct+'/'+(s.form.correct+s.form.wrong),'notProp',s.form.notAProperty,
 '| kind',`${s.quantityKind.correct}/${s.quantityKind.annotated} prod ${s.quantityKind.produced} wrong ${s.quantityKind.wrong}`,
 '| basis',`${s.basis.correct}/${s.basis.annotated} prod ${s.basis.produced} fp ${s.basis.falsePositive} wrong ${s.basis.wrong}`,
 '| constr',`items ${s.constraints.annotatedItems} ann ${s.constraints.annotated} prod ${s.constraints.produced} correct ${s.constraints.correct} recall ${s.constraints.matchedAnnotated}`,
 '| object',`${s.objectOfInterest.correct}/${s.objectOfInterest.annotated} prod ${s.objectOfInterest.produced} wrong ${s.objectOfInterest.wrong}`,
 '| proc fp',s.procedure.falsePositive,'| scale',`${s.categoricalScale.correct}/${s.categoricalScale.annotated} wrong ${s.categoricalScale.wrong}`,'| worst',JSON.stringify(v.worstHostQuantityKind));}
