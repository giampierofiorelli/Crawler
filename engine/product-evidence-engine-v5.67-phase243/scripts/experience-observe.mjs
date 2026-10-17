/** Continuous-learning Step 1A: observe one experience case with one extractor build (no network, no store writes).
 * Document cases: the page bytes from the private evaluation directory, verified against the wave receipt; the reading arm
 * is the Phase272 arm B (the category plan compiled by THAT build from the live store, digest checked against the frozen
 * digests); matching follows scripts/phase272-ab-extraction.mjs (value + canonical unit; same-subject lead preferred;
 * subject rule: core-token Jaccard >= 0.6 or a shared model-code token). Request cases: the build's request path.
 * Returns {observation, meta} or {unobservable: reason}. Used by experience-pilot-build.mjs and experience-replay.mjs. */
import {readFileSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const PRIV=join(homedir(),'.local/share/product-evidence-engine/private-eval');
const LIVE=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const GENERIC=new Set(['the','a','and','with','review','in','1','smart','oled','tv','tvs','air','fryer','fryers','purifier','purifiers','dishwasher','dishwashers','tumble','dryer','dryers','television','series','dual','basket','integrated','heat','pump']);
const core=s=>new Set(String(s??'').toLowerCase().replace(/[^a-z0-9.\- ]+/g,' ').split(/\s+/).filter(t=>t&&!GENERIC.has(t)));
export const sameProduct=(a,b)=>{const x=core(a),y=core(b);if(!x.size||!y.size)return false;let i=0;for(const t of x)if(y.has(t))i++;return i/(x.size+y.size-i)>=0.6||[...x].some(t=>/\d/.test(t)&&y.has(t));};
const UE={db:['db','dba','db(a)'],nits:['nits','cd/m2','cd/m²'],minutes:['minutes','mins','min'],seconds:['seconds','s','secs'],hours:['hours','hrs','h'],'%':['%','percent'],l:['l','litres','liters'],w:['w','watts'],kwh:['kwh'],ms:['ms'],cfm:['cfm']};
const builds=new Map();
async function load(dist){const d=resolve(dist)+'/';if(builds.has(d))return builds.get(d);
 if(!existsSync(d+'phase265_test_measurements.js'))return null;
 const m={spec:await import(d+'phase245_spec_extraction.js'),tl:await import(d+'phase265_test_measurements.js'),q:await import(d+'phase269_qualitative_observations.js'),
  plan:existsSync(d+'phase272_extraction_plan.js')?await import(d+'phase272_extraction_plan.js'):null,store:await import(d+'phase246_knowledge_store.js'),
  reg:await import(d+'phase248_category_registry.js'),advice:await import(d+'phase253_request_advice.js'),blocks:await import(d+'phase225_transient_test_probe.js')};
 builds.set(d,m);return m;}
const canonUnit=(M,u)=>{const l=String(u).toLowerCase();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return M.plan?.canonicalUnit272?.(l)??l;};
const frozenDigests=()=>{try{return JSON.parse(readFileSync(resolve('evaluation/phase272/plans-frozen-known.json'),'utf8'));}catch{return {};}};
/** Observe case `c` with the build at `dist`. */
export async function observeCase(c,dist){
 const M=await load(dist);if(!M)return {unobservable:'build not available: '+dist};
 if(c.kind==='request'){
  const s=new M.store.KnowledgeStore246(LIVE);try{const a=M.advice.adviseFromRequest253(c.item.text,s,M.reg.CATEGORY_REGISTRY250);
   return {observation:{status:'responded',response:a.response,category:a.category??null},meta:{}};}finally{s.close();}}
 const dir=join(PRIV,c.source.evaluation);const wave=join(dir,'wave.json');const raw=join(dir,'raw',c.source.docTag+'.html');
 if(!existsSync(wave)||!existsSync(raw))return {unobservable:'page bytes or wave receipt missing'};
 const W=JSON.parse(readFileSync(wave,'utf8'));const p=W.pages.find(x=>x.tag===c.source.docTag);const b=readFileSync(raw);
 if(!p||sha(b)!==p.sha256||p.sha256!==c.source.docSha256)return {unobservable:'page bytes do not match the receipt'};
 if(!M.plan)return {unobservable:'build has no extraction plan (arm B not defined for it)'};
 const html=b.toString('utf8'),url=p.finalUrl??p.url;
 const s=new M.store.KnowledgeStore246(LIVE);let plan;try{plan=M.plan.compileExtractionPlan272(s,c.category,M.reg.CATEGORY_REGISTRY250.find(e=>e.id===c.category)?.aliases??[],TAUGHT.filter(t=>t!==c.category));}finally{s.close();}
 const planDigest=plan.compiledFrom.digest;const meta={planDigest,planFrozen:frozenDigests()[c.category]===planDigest};
 const x=M.tl.testDocumentSubject268(M.spec.extractSpecifications245(html,url),p.sourceType);const page=x?.mainProduct?.name??null;
 if(c.kind==='quantitative_value'){
  const tl=M.tl.testLeadsFromHtml265(html,url,p.sha256,x,{category:c.category,plan});
  const leads=tl.probe.candidates.map(l=>({value:l.value,unit:canonUnit(M,l.unit),subject:l.subject?.name??null,blockIndex:l.blockIndex,blockSha256:l.blockSha256}));
  const near=l=>Math.abs(l.value-c.item.value)<=1e-9*Math.max(1,Math.abs(c.item.value))&&l.unit===canonUnit(M,c.item.unit);
  const hit=leads.find(l=>near(l)&&sameProduct(c.item.goldSubject,l.subject))??leads.find(near);
  if(!hit)return {observation:{status:'absent'},meta};
  return {observation:{status:'found',subject:hit.subject,subjectOutcome:!hit.subject?'unresolved':sameProduct(c.item.goldSubject,hit.subject)?'correct':'incorrect_match',blockSha256:hit.blockSha256,blockIndex:hit.blockIndex},meta};
 }
 const mentions=M.tl.documentMentions272?M.tl.documentMentions272(html):[];
 const page0=x?.mainProduct?.name&&!x.mainProduct.ambiguous?{name:x.mainProduct.name,model:null}:null;
 const pageSubj=M.tl.planPageSubject272?M.tl.planPageSubject272(page0,mentions):page0;
 const map=JSON.parse(readFileSync(resolve('evaluation/phase272/protocol-addendum.json'),'utf8')).codeToOutcomeMap[c.category]??{};
 const obs=M.q.qualitativeObservations269(html,{plan,mentions,page:pageSubj}).observations.map(o=>({dimension:o.outcome==='taught_dimension'?o.dimension272:(map[o.outcome]??'code:'+o.outcome),
  direction:o.direction,subject:o.subject?.name??(o.appliance&&o.appliance!=='air_fryer'?null:page),blockIndex:o.blockIndex,blockSha256:o.blockSha256}));
 const same=o=>o.dimension===c.item.dimension&&o.direction===c.item.direction;
 // A false positive is still emitted when the same finding comes from the same source block, whatever subject it is now
 // bound to (re-attribution does not correct it), or when it is emitted again for the same subject.
 if(c.kind==='false_positive_finding'){const hit=obs.find(o=>same(o)&&((c.historical.blockSha256&&o.blockSha256===c.historical.blockSha256)||o.subject===c.item.subject||sameProduct(o.subject,c.item.subject)));
  return {observation:hit?{status:'emitted',subject:hit.subject,blockSha256:hit.blockSha256,blockIndex:hit.blockIndex}:{status:'not_emitted'},meta};}
 const hit=obs.find(o=>same(o)&&sameProduct(c.item.goldSubject,o.subject))??obs.find(same);
 if(!hit)return {observation:{status:'absent'},meta};
 return {observation:{status:'found',subject:hit.subject,subjectOutcome:!hit.subject?'unresolved':sameProduct(c.item.goldSubject,hit.subject)?'correct':'incorrect_match',blockSha256:hit.blockSha256,blockIndex:hit.blockIndex},meta};
}
