#!/usr/bin/env node
/** S78 shadow comparison of ranking authorisation ra.1 (outcomeAuthorised270) and ra.2 (outcomeAuthorisedRa2) on the live
 * store: for every taught outcome and every measurement linked to it by measured_by, the decision each rule would take
 * for a SCORED catalog dimension of that measurement, (a) with every condition the measurement itself requires met and
 * (b) with the conditions of the other measurements of the same need also required (ra.1's pooling). Counts only.
 *   node scripts/s78-authorisation-census.mjs LABEL  -> evaluation/s78/authorisation-census-LABEL.json */
import {writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const label=process.argv[2];const OUT=`evaluation/s78/authorisation-census-${label}.json`;if(!label||existsSync(OUT))throw Error('usage: LABEL (new)');
const D=new URL('../dist/src/',import.meta.url).href;const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const A=await import(D+'phase253_request_advice.js');
const store=new KnowledgeStore246(join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite'));
const cats=store.db.prepare("SELECT DISTINCT category_id FROM category_relations WHERE kind='measured_by' ORDER BY 1").all().map(r=>r.category_id);
const out={schema:'pee.s78.authorisation-census.v1',label,generatedAt:new Date().toISOString(),rules:{ra1:'outcomeAuthorised270',ra2:'outcomeAuthorisedRa2 '+A.RANKING_AUTHORISATION_VERSION,release:'outcomeAuthorisedRelease (S79: ra.2 restrict-only)'},
 note:'hypothetical scored dimension per (need, measurement); no product, no catalog; shows what each rule would accept',categories:{},totals:{}};
const T=out.totals;const inc=(o,k)=>o[k]=(o[k]??0)+1;
for(const c of cats){const items=store.categoryItems246(c);const needs=[...new Set(items.filter(i=>i.concept&&i.concept.kind!=='measurement').map(i=>i.concept.id))];
 const C={pairs:0,ra1_own:{},ra2_own:{},ra1_pooledOnly:0,disagree:0};
 for(const k of A.needKnowledge269(store,c,needs)){for(const [m,info] of k.byMeasure){C.pairs++;inc(T,'pairs');
  const own={key:k.need,label:k.need,value:{kind:'boolean',value:true},methodId:'census',protocolVersion:'v',measureId:m,conditionsMet:[...info.conditions],weightUnits:{hard:1,high:1,normal:1,low:1}};
  const a1=A.outcomeAuthorised270(k,own,m),a2=A.outcomeAuthorisedRa2(k,own,m);
  const a3=A.outcomeAuthorisedRelease?A.outcomeAuthorisedRelease(k,own,m):a2;const r3=a3.ok?'authorised':a3.reason;C.release??={};inc(C.release,r3);inc(T,'release:'+r3);
  const r1=a1.ok?'authorised':a1.reason,r2=a2.ok?'authorised':a2.reason;inc(C.ra1_own,r1);inc(C.ra2_own,r2);inc(T,'ra1:'+r1);inc(T,'ra2:'+r2);
  if(r1!==r2){C.disagree++;inc(T,'changed:'+r1+'->'+r2);}
  // pooled: ra.1 asks for every condition of every measurement of the need; with only this measurement's met, it refuses
  if(a1.ok===false&&(a1.reason==='conditions_not_met'||a1.reason==='conditions_not_verified')){C.ra1_pooledOnly++;inc(T,'ra1_refused_by_other_measurements_conditions');}}}
 out.categories[c]=C;}
store.close();mkdirSync('evaluation/s78',{recursive:true});writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out.totals));
