#!/usr/bin/env node
/** S88 E2: property attribution and condition dimensions of the definition-driven interpreter against the sealed blind
 * reference (evaluation/s88/attribution-annotation-freeze.json), per category and group, dev and check separately.
 * Baseline: unit kind only (a property is chosen when exactly one applicable definition admits the unit's kind).
 *   node scripts/s88-e2-eval.mjs --dir PRIVATE_S87B --ref PRIVATE_S88 --scope dev|check|all [--out PUBLIC] [--private DETAIL] */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;
const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);
const pre=JSON.parse(readFileSync(new URL('../evaluation/s88/preregistration.json',import.meta.url),'utf8'));const DEV=new Set(pre.groups.development);
const freeze=JSON.parse(readFileSync(new URL('../evaluation/s88/attribution-annotation-freeze.json',import.meta.url),'utf8'));
const refFile=join(arg('ref'),'attribution-annotations.json');const refBytes=readFileSync(refFile);
if(createHash('sha256').update(refBytes).digest('hex')!==freeze.annotationsSha256)throw Error('reference does not match its seal');
const ref=JSON.parse(refBytes).items;const corpus=JSON.parse(readFileSync(join(arg('dir'),'corpus.json'),'utf8'));const scope=arg('scope')??'dev';
const unitOnly=(o)=>{const r=I.attributeProperty(defs,qk,o);const c=r.value?[r.value,...r.alternatives]:r.alternatives;return c.length===1?c[0]:null;};
const rows=[];
corpus.forEach((o,i)=>{const g=o.category+' @ '+o.host;const isDev=DEV.has(g);if(scope==='dev'&&!isDev||scope==='check'&&isDev)return;
 const words=[o.note,(o.measurand??'').replace(/_/g,' ')].filter(Boolean).join('; ');const inp={value:o.value,unit:String(o.unit??''),label:words,conditions:o.conditions??[],category:o.category};
 const di=I.interpretWithDefinitions(defs,qk,inp);const a=ref['o'+i];
 rows.push({type:'prop',id:'o'+i,group:g,category:o.category,dev:isDev,ref:a.property,also:a.alsoAcceptable??null,defs:di.property.value,state:di.property.state,base:unitOnly(inp),refBasis:a.basis,defsBasis:di.basis.value,missingDefining:di.missingDefining.length});
 (o.conditions??[]).forEach((c,j)=>{const ra=a.conditions['o'+i+'c'+j];const r=I.classifyConditionWithDefinitions(defs,qk,c,di.property.kind,di.property.value,o.category);
  rows.push({type:'dim',id:'o'+i+'c'+j,group:g,category:o.category,dev:isDev,ref:ra.dimension,also:ra.alsoAcceptable??null,defs:r.dimension?.id??null,relational:r.relational,text:String(c)});});});
const hit=(r,x)=>x!==null&&(x===r.ref||x===r.also);
const sc=(rs,f)=>{const pos=rs.filter(r=>r.ref!=='none'),neg=rs.filter(r=>r.ref==='none');
 return {items:rs.length,refPositive:pos.length,correct:pos.filter(r=>hit(r,r[f])).length,wrong:pos.filter(r=>r[f]!==null&&!hit(r,r[f])).length,abstained:pos.filter(r=>r[f]===null).length,
  refNone:neg.length,falseAttribution:neg.filter(r=>r[f]!==null&&r[f]!==r.also).length,correctNone:neg.filter(r=>r[f]===null).length};};
const four=(rs,a,b)=>{const R=(r,f)=>r.ref==='none'?r[f]===null:hit(r,r[f]);return {bothRight:rs.filter(r=>R(r,a)&&R(r,b)).length,fixed:rs.filter(r=>!R(r,a)&&R(r,b)).length,broken:rs.filter(r=>R(r,a)&&!R(r,b)).length,bothWrong:rs.filter(r=>!R(r,a)&&!R(r,b)).length};};
const BASIS=(b)=>b==null?'unclear':b;
const pack=(rs)=>{const P=rs.filter(r=>r.type==='prop'),Dm=rs.filter(r=>r.type==='dim');
 return {property:{defs:sc(P,'defs'),unitKindOnly:sc(P,'base'),fourSetsVsUnitKind:four(P,'base','defs')},
  basis:{items:P.length,agree:P.filter(r=>BASIS(r.defsBasis)===r.refBasis).length,wrong:P.filter(r=>r.defsBasis&&r.defsBasis!=='none'&&r.defsBasis!==r.refBasis).length},
  dimension:sc(Dm,'defs')};};
const keys=f=>[...new Set(rows.map(f))].sort();
const out={schema:'pee.s88.e2-eval.v1',scope,definitions:defs.identity,reference:freeze.annotationsSha256,overall:pack(rows),
 byCategory:Object.fromEntries(keys(r=>r.category).map(c=>[c,pack(rows.filter(r=>r.category===c))])),byGroup:Object.fromEntries(keys(r=>r.group).map(g=>[g,pack(rows.filter(r=>r.group===g))]))};
const acc=v=>{const p=v.property.defs;return (p.correct+p.correctNone)/(p.items||1);};
out.worstGroupProperty=Object.entries(out.byGroup).filter(([,v])=>v.property.defs.items>=5).map(([g,v])=>[g,+acc(v).toFixed(3)]).sort((a,b)=>a[1]-b[1])[0]??null;
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');if(arg('private'))writeFileSync(arg('private'),JSON.stringify(rows,null,1)+'\n');
console.log(JSON.stringify(out.overall),'\nworst',JSON.stringify(out.worstGroupProperty));
for(const [c,v] of Object.entries(out.byCategory))console.log(c.padEnd(15),'prop',JSON.stringify(v.property.defs),'| base',JSON.stringify(v.property.unitKindOnly),'| dim',JSON.stringify(v.dimension));
