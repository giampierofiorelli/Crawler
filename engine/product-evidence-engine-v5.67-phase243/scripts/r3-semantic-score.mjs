/** R3 cycle 3 (S76): decisions and scores for the semantic-model validators (scores from scripts/r3-semantic/validate.py).
 * A candidate is an identity when the rule says so; a mention is aligned only to a unique identity candidate,
 * otherwise unresolved. Optional semantic-type gate (denotationOf). Counts only.
 *   node scripts/r3-semantic-score.mjs METHOD SIDE TAU [gate] [--out LABEL]   (METHOD nli|llm|llm05) */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const a=process.argv.slice(2);const [method,side,tauS]=a;const gate=a.includes('gate');const outL=a.includes('--out')?a[a.indexOf('--out')+1]:null;const tau=+tauS;
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'r3');
if(side==='transfer'){const fz=JSON.parse(readFileSync('evaluation/r3/align-freeze.json','utf8'));const h=createHash('sha256').update(readFileSync(join(PE,'align/transfer/out.json'))).digest('hex');
 if(!fz.transfer||fz.transfer.annotation!==h)throw Error('transfer reference not sealed or changed');}
if(side==='s94'){const fz=JSON.parse(readFileSync('evaluation/s94/align-freeze.json','utf8'));const h=createHash('sha256').update(readFileSync(join(PE,'align/s94/out.json'))).digest('hex');if(fz.annotation!==h)throw Error('s94 reference changed');}
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const KT=await import(D+'knowledge_translation.js');const qk=QK.loadQuantityKnowledge();
const sc=JSON.parse(readFileSync(join(PE,'semantic',`${method}-${side}.json`),'utf8'));
const inp=JSON.parse(readFileSync(join(PE,'align',side,'in.json'),'utf8')).mentions,ref=new Map(JSON.parse(readFileSync(join(PE,'align',side,'out.json'),'utf8')).mentions.map(x=>[x.mention,x]));
const ok=KT.loadDenotationCues().compatibleKinds;const S=new Map(sc.rows.map(r=>[r.mention+'|'+r.concept,r]));
const cls=g=>g==='exact'||g==='close'?'identity':g==='broader'||g==='narrower'?'hierarchical':g==='related'?'associative':'none';
const RULE=process.env.NLI_RULE??'both';
const pred=r=>{if(method.startsWith('nli')&&RULE==='c2m'){return r.e_c2m>=tau?'identity':'associative_or_none';}
 if(method.startsWith('nli')){const hi=Math.min(r.e_m2c,r.e_c2m),lo=Math.max(r.e_m2c,r.e_c2m);return hi>=tau?'identity':lo>=tau?'hierarchical':'associative_or_none';}
 const pi=(r.p.exact??0)+(r.p.close??0),ph=(r.p.broader??0)+(r.p.narrower??0);return pi>=tau&&pi>=ph&&pi>=(r.p.related??0)&&pi>=(r.p.none??0)?'identity':ph>=tau&&ph>=(r.p.related??0)?'hierarchical':'associative_or_none';};
const C={};const inc=k=>C[k]=(C[k]??0)+1;
for(const m of inp){const g=ref.get(m.mention);const dn=KT.denotationOf(qk,m.text);const ids=[];
 for(const c of m.candidates){const r=S.get(m.mention+'|'+c.concept);let p=pred(r);if(p==='identity'&&gate&&!(ok[dn]??[]).includes(c.kind))p='associative_or_none';
  const gc=cls(g.matches[c.concept]);inc(`cand_${gc}->${p}`);if(p==='identity')ids.push(c.concept);}
 const gold=Object.entries(g.matches).filter(([,v])=>v==='exact'||v==='close').map(([k])=>k);if(gold.length)inc('reference_identities');
 if(ids.length===1){inc('aligned');if(gold.includes(ids[0]))inc('aligned_correct');else inc('aligned_wrong_'+cls(g.matches[ids[0]]));}
 else{inc(ids.length?'unresolved_several':'unresolved_none');}
 if(gold.length&&!(ids.length===1&&gold.includes(ids[0])))inc('identity_missed');}
const P=C.aligned?C.aligned_correct??0:0;const res={method,side,tau,gate,rule:RULE,precision:C.aligned?+((P)/C.aligned).toFixed(3):null,recall:C.reference_identities?+((P)/C.reference_identities).toFixed(3):null,cost:sc.cost,counts:C};
if(outL){const f=`evaluation/r3/semantic-${outL}.json`;if(existsSync(f))throw Error('exists');writeFileSync(f,JSON.stringify({schema:'pee.r3.semantic-score.v1',generatedAt:new Date().toISOString(),...res},null,1)+'\n');}
console.log(JSON.stringify({m:method,s:side,tau,gate,P:res.precision,R:res.recall,aligned:C.aligned??0,correct:P,wrongRel:C.aligned_wrong_associative??0,wrongNone:C.aligned_wrong_none??0,wrongHier:C.aligned_wrong_hierarchical??0,several:C.unresolved_several??0}));
