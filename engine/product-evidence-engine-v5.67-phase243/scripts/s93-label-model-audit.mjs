#!/usr/bin/env node
/** S93 (owner review of S92 §3): audit of the S92 label model. For each signal: the reliability FlyingSquid estimates
 * without gold, against the reliability measured on the blind references (S89-S91 development detail, S92 check first run),
 * and the dependence between signals given the true class (phi of their votes among items of one reference class, and
 * the excess agreement E[vi vj] - ai aj implied by the measured accuracies). Binary task: measured (+1) vs declared (-1),
 * items whose reference role is one of the two. Public output: counts and rates only.
 *   node scripts/s93-label-model-audit.mjs --out evaluation/s93/label-model-audit.json */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const P=join(homedir(),'.local/share/product-evidence-engine/private-eval');const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const EC=await import(new URL('../dist/src/evidence_combination.js',import.meta.url).href);
const vote=r=>r==='measured_by_publisher'||r==='measured'||r==='derived'?1:r==='declared_spec'||r==='declared'?-1:0;
const nearest=(links,rel)=>{const ls=links.filter(l=>rel.includes(l.relation)).sort((a,b)=>a.rank-b.rank);if(!ls.length)return 0;const top=ls.filter(l=>l.rank===ls[0].rank);const v=new Set(top.map(l=>vote(l.role)));return v.size===1?[...v][0]:0;};
const N=['A0_with_reason','A1_local_evidence','table_links','co_occurrence','bridge','situation','wd_class','A0_default'];
const sig=r=>{const L=r.links;return [r.A0reason==='no_other_role'?0:vote(r.A0),vote(r.A1),nearest(L,['table_link','table_structure','parallel_table']),nearest(L,['co_occurrence']),nearest(L,['bridge']),
 r.situation==='episodic'?1:r.situation==='attributive'?-1:0,r.wd==='publisher_measured'?1:r.wd==='manufacturer_declared'||r.wd==='nominal_certified'?-1:0,r.A0reason==='no_other_role'?vote(r.A0):0];};
// development detail (S89-S91): links as "relation:scope:role:rank"
const dev=JSON.parse(readFileSync(join(P,'s92/dev-role-it2-detail.json'),'utf8')).map(r=>({set:r.set,y:vote(r.refRole),A0:r.arms.A0.role,A0reason:r.arms.A0.reason,A1:r.arms.A1.role,
 links:r.links.map(s=>{const [relation,scope,role,rank]=s.split(':');return {relation,scope,role,rank:+rank};}),wd:r.wd,situation:r.situation}));
const run=JSON.parse(readFileSync(join(P,'s92/run-firstrun.json'),'utf8'));const ref=JSON.parse(readFileSync(join(P,'s92/annotation/annotations.json'),'utf8')).items;
const chk=run.rows.map(r=>({set:'s92',y:ref[r.id]&&ref[r.id].property!=='none'?vote(ref[r.id].role):0,A0:r.arms.A0.role,A0reason:r.arms.A0.reason,A1:r.arms.A1.role,links:r.linkObjs,wd:r.wd,situation:r.situation}));
const audit=(rows,label)=>{const R=rows.filter(r=>r.y!==0);const V=R.map(sig);const fitted=EC.fitLabelModel(N,rows.map(sig),{margin:0.5});
 const sigs=N.map((n,i)=>{const on=R.filter((_,k)=>V[k][i]!==0);const ok=on.filter((r,k)=>V[R.indexOf(r)][i]===r.y).length;
  return {signal:n,votes:on.length,coverage:+(on.length/Math.max(1,R.length)).toFixed(3),measuredAccuracy:on.length?+(ok/on.length).toFixed(3):null,estimatedAccuracy:fitted.accuracy[i],
   votesMeasured:on.filter((r,k)=>V[R.indexOf(r)][i]===1).length,votesDeclared:on.filter((r,k)=>V[R.indexOf(r)][i]===-1).length};});
 // dependence given the class: phi of two signals' votes among items of one class where both vote; excess E[vivj] - ai*aj
 const acc=sigs.map(s=>s.measuredAccuracy??0.5);const a=sigs.map((s,i)=>s.coverage*(2*acc[i]-1));
 const pairs=[];for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const both=R.map((r,k)=>[V[k][i],V[k][j],r.y]).filter(([x,z])=>x!==0&&z!==0);
  const cond={};for(const y of [1,-1]){const b=both.filter(t=>t[2]===y);if(b.length<5){cond[y>0?'measured':'declared']=null;continue;}
   const n11=b.filter(t=>t[0]===1&&t[1]===1).length,n00=b.filter(t=>t[0]===-1&&t[1]===-1).length,n10=b.filter(t=>t[0]===1&&t[1]===-1).length,n01=b.filter(t=>t[0]===-1&&t[1]===1).length;
   const d=Math.sqrt((n11+n10)*(n01+n00)*(n11+n01)*(n10+n00));cond[y>0?'measured':'declared']={n:b.length,agree:+((n11+n00)/b.length).toFixed(3),phi:d?+((n11*n00-n10*n01)/d).toFixed(3):null};}
  const Eij=V.reduce((s,v)=>s+v[i]*v[j],0)/R.length;pairs.push({a:N[i],b:N[j],bothVote:both.length,observedAgreementProduct:+Eij.toFixed(3),impliedByAccuracies:+(a[i]*a[j]).toFixed(3),excess:+(Eij-a[i]*a[j]).toFixed(3),givenClass:cond});}
 return {set:label,items:R.length,measured:R.filter(r=>r.y===1).length,declared:R.filter(r=>r.y===-1).length,signals:sigs,pairs:pairs.filter(p=>p.bothVote>=10).sort((x,y)=>Math.abs(y.excess)-Math.abs(x.excess)),fittedNotes:fitted.notes};};
const out={schema:'pee.s93.label-model-audit.v1',note:'estimatedAccuracy: FlyingSquid on the same items without gold; measuredAccuracy: against the blind reference where the signal votes. Development (S89-S91) is spent material; S92 is the spent first-run check',
 development:audit(dev,'S89-S91 (spent)'),check:audit(chk,'S92 check (spent after its first run)')};
if(arg('out')){if(existsSync(arg('out')))throw Error('exists');writeFileSync(arg('out'),JSON.stringify(out,null,1)+'\n');}
for(const k of ['development','check']){const o=out[k];console.log('==',o.set,'items',o.items,'measured',o.measured,'declared',o.declared);
 for(const s of o.signals)console.log('  ',s.signal.padEnd(18),'votes',String(s.votes).padStart(3),'(M',s.votesMeasured,'D',s.votesDeclared+')','estimated',s.estimatedAccuracy,'measured',s.measuredAccuracy);
 for(const p of o.pairs.slice(0,6))console.log('   pair',p.a,'x',p.b,'both',p.bothVote,'excess',p.excess,JSON.stringify(p.givenClass));}
