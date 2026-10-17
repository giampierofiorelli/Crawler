#!/usr/bin/env node
/** Phase272 A/B/C/E extraction experiment (evaluation/phase272/protocol.json; owner brief 2026-10-17 §5).
 *  A  the extractor exactly as at commit 09526c4 (separate build: --arm-a-dist, default /home/user/p272-armA/...);
 *  B  the current extractor with the category's extraction plan supplied before reading;
 *  C  B plus the generic exploratory pass (research leads, scored apart);
 *  E  the current extractor without a plan, plus the exploratory pass (ablation).
 * The same after-reading interpretation (linkToMeasure272 with the category plan) is applied to every arm's output for the
 * "decision-usable" metric, so A/B differ only in knowledge supplied BEFORE reading.
 *
 * Usage: node scripts/phase272-ab-extraction.mjs --gold GOLD.json --dir PRIVATE_DIR --label LABEL [--plans PLANS.json]
 *   GOLD: {documents:[{tag,category}],quantitative:[{id,doc,value,unit,subject,kind,conditions}],qualitative:[{id,doc,subject,dimension,direction}]}
 *   PRIVATE_DIR holds wave.json and raw/; outputs: PRIVATE_DIR/ab-LABEL.json (full) and evaluation/phase272/ab-LABEL.json (value-free).
 *   --plans: frozen plan digests (checked against a fresh compile; a mismatch refuses the run). Runs are never overwritten.
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
const F={};{const a=process.argv.slice(2);for(let i=0;i<a.length;i++)if(a[i].startsWith('--'))F[a[i].slice(2)]=a[i+1]&&!a[i+1].startsWith('--')?a[++i]:true;}
for(const k of ['gold','dir','label'])if(!F[k])throw Error('--'+k+' required');
if(!/^[a-z0-9-]{3,40}$/.test(F.label))throw Error('bad label');
const DIR=resolve(F.dir);const OUT=resolve(F.out??F.dir);const PRIV=join(OUT,`ab-${F.label}.json`);
// Development iterations (labels dev-*) are tuning runs: their public summary stays in the private directory.
const PUB=F.label.startsWith('dev-')?join(OUT,`ab-${F.label}.public.json`):`evaluation/phase272/ab-${F.label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: runs are never overwritten');
const A=resolve(F['arm-a-dist']??'/home/user/p272-armA/engine/product-evidence-engine-v5.67-phase243/dist/src')+'/';const B=resolve('dist/src')+'/';
const imp=async(root)=>({spec:await import(root+'phase245_spec_extraction.js'),tl:await import(root+'phase265_test_measurements.js'),q:await import(root+'phase269_qualitative_observations.js')});
const MA=await imp(A),MB=await imp(B);
const {compileExtractionPlan272,linkToMeasure272,canonicalUnit272}=await import(B+'phase272_extraction_plan.js');
const {textBlocks225}=await import(B+'phase225_transient_test_probe.js');
const {KnowledgeStore246}=await import(B+'phase246_knowledge_store.js');const {CATEGORY_REGISTRY250}=await import(B+'phase248_category_registry.js');
const {screenTestLead265}=await import(B+'phase265_test_measurements.js');
const sha=b=>createHash('sha256').update(b).digest('hex');
const protocol=readFileSync('evaluation/phase272/protocol.json');const P=JSON.parse(protocol);
const addendum=existsSync('evaluation/phase272/protocol-addendum.json')?JSON.parse(readFileSync('evaluation/phase272/protocol-addendum.json','utf8')):{};
const goldBytes=readFileSync(resolve(F.gold));const G=JSON.parse(goldBytes);const W=JSON.parse(readFileSync(join(DIR,'wave.json'),'utf8'));
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const store=new KnowledgeStore246(process.env.PEE_KNOWLEDGE_DIR?join(process.env.PEE_KNOWLEDGE_DIR,'pee246.sqlite'):join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const plans={};for(const c of new Set(G.documents.map(d=>d.category))){const nouns=CATEGORY_REGISTRY250.find(e=>e.id===c)?.aliases??[];plans[c]=compileExtractionPlan272(store,c,nouns,TAUGHT.filter(t=>t!==c));}
store.close();
if(F.plans){const fz=JSON.parse(readFileSync(resolve(F.plans),'utf8'));for(const [c,p] of Object.entries(plans))if(fz[c]!==p.compiledFrom.digest)throw Error('plan digest mismatch for '+c+': knowledge changed since the freeze');}
// Frozen scoring vocabulary (protocol.scoring.unitEquivalence; printed units canonicalised the same way for every arm).
const UE=P.scoring.unitEquivalence;const canon=u=>{const l=String(u).toLowerCase();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return canonicalUnit272(l)??l;};
const GENERIC=new Set(['the','a','and','with','review','in','1','smart','oled','tv','tvs','air','fryer','fryers','purifier','purifiers','dishwasher','dishwashers','tumble','dryer','dryers','television','series','dual','basket','integrated','heat','pump']);
const core=s=>new Set(String(s??'').toLowerCase().replace(/[^a-z0-9.\- ]+/g,' ').split(/\s+/).filter(t=>t&&!GENERIC.has(t)));
// Same product: core-token Jaccard >= 0.6 (Phase271 rule), or a shared model-code token (a token with a digit) on both sides.
const sameProduct=(a,b)=>{const x=core(a),y=core(b);if(!x.size||!y.size)return false;let i=0;for(const t of x)if(y.has(t))i++;
 return i/(x.size+y.size-i)>=0.6||[...x].some(t=>/\d/.test(t)&&y.has(t));};
const subjectOutcome=(gold,s)=>!s?'unresolved':sameProduct(gold,s)?'correct':'incorrect_match';
// A's Phase269 cooking codes in taught-outcome terms (protocol addendum, frozen before the untouched run).
const CODE_MAP=addendum.codeToOutcomeMap??{};
const arms=['A','B','C','E'];const docsOut=[];const T=Object.fromEntries(arms.map(a=>[a,{q:{gold:0,leads:0,matched:0,correct:0,incorrect:0,unresolved:0,usable:0,condGold:0,condHit:0},
 o:{gold:0,findings:0,matched:0,correct:0,incorrect:0,unresolved:0,usable:0,untaughtGold:0,untaughtMatched:0},xq:{leads:0,matched:0},xo:{leads:0,matched:0}}]));
const lost={q:[],o:[]};
const near=(l,g)=>Math.abs(l.value-g.value)<=1e-9*Math.max(1,Math.abs(g.value))&&l.unit===canon(g.unit);
for(const d of G.documents){
 const p=W.pages.find(x=>x.tag===d.tag);if(!p||p.outcome!=='fetched')throw Error('not fetched: '+d.tag);
 const b=readFileSync(join(DIR,'raw',d.tag+'.html'));if(sha(b)!==p.sha256)throw Error('receipt mismatch '+d.tag);
 const html=b.toString('utf8'),url=p.finalUrl??p.url;const plan=plans[d.category];
 const {blocks}=textBlocks225(html,{maxBlocks:1500});
 const gq=G.quantitative.filter(g=>g.doc===d.tag),go=G.qualitative.filter(g=>g.doc===d.tag);
 const per={};
 for(const arm of arms){
  const M=arm==='A'?MA:MB;const withPlan=arm==='B'||arm==='C',explore=arm==='C'||arm==='E';
  const opts={category:d.category,...(withPlan?{plan}:{}),...(explore?{exploratory:true}:{})};
  const x=M.tl.testDocumentSubject268(M.spec.extractSpecifications245(html,url),p.sourceType);
  const tl=M.tl.testLeadsFromHtml265(html,url,p.sha256,x,opts);const page=x?.mainProduct?.name??null;
  const mentions=withPlan?MB.tl.documentMentions272(html):[];
  const leads0=[...tl.probe.candidates.map(c=>({value:c.value,unit:canon(c.unit),subject:c.subject?.name??null,block:c.blockIndex,codes:[...(c.conditionCodes??[]),...(c.planConditionIds272??[])],raw:c})),
   ...(tl.comparative270??[]).map(c=>({value:c.value,unit:canon(c.unit),subject:c.subject?.name??null,block:-1,codes:c.conditions??[],raw:null}))];
  // Addendum: identical (value, unit, subject) leads in one document count once.
  const leads=leads0.filter((l,k)=>leads0.findIndex(m=>m.value===l.value&&m.unit===l.unit&&(m.subject===l.subject||sameProduct(m.subject,l.subject)))===k);
  const xl=(tl.probe.exploratoryLeads272??[]).map(e=>({value:e.value,unit:canon(e.unit),subject:e.subject?.name??null,block:e.blockIndex}));
  const page0=x?.mainProduct?.name&&!x.mainProduct.ambiguous?{name:x.mainProduct.name,model:null}:null;
  const pageSubj=withPlan?MB.tl.planPageSubject272(page0,mentions):page0;
  const qr=arm==='A'?M.q.qualitativeObservations269(html):M.q.qualitativeObservations269(html,{...(withPlan?{plan,mentions,page:pageSubj}:{}),...(explore?{exploratory:true,page:pageSubj}:{})});
  const obs0=qr.observations.map(o=>({dimension:o.outcome==='taught_dimension'?o.dimension272:(CODE_MAP[d.category]?.[o.outcome]??'code:'+o.outcome),direction:o.direction,
   subject:o.subject?.name??(o.appliance&&o.appliance!=='air_fryer'?null:page),block:o.blockIndex}));
  const obs=obs0.filter((o,k)=>obs0.findIndex(m=>m.dimension===o.dimension&&m.direction===o.direction&&(m.subject===o.subject||sameProduct(m.subject,o.subject)))===k);
  const ql=(qr.leads272??[]).map(l=>({term:l.term,direction:l.direction,subject:l.subject?.name??page}));
  // Quantitative matching (one lead per gold item; same-subject lead preferred).
  const used=new Set(),qm=[];
  for(const g of gq){let i=leads.findIndex((l,k)=>!used.has(k)&&near(l,g)&&sameProduct(g.subject,l.subject));if(i<0)i=leads.findIndex((l,k)=>!used.has(k)&&near(l,g));if(i<0)continue;used.add(i);
   const l=leads[i];const subj=subjectOutcome(g.subject,l.subject);const text=l.block>=0?blocks[l.block]??'':'';
   const link=linkToMeasure272(plan,text,l.unit);const screen=l.raw?screenTestLead265(l.raw,{url,sha256:p.sha256}):{ok:false};
   const condCodes=new Set(l.codes.map(c=>P.scoring.codeToConditionMap[c]??c));const gc=(g.conditions??[]).filter(c=>!String(c).startsWith('untaught:'));
   qm.push({g:g.id,subject:subj,usable:subj==='correct'&&screen.ok&&!!link,condGold:gc.length,condHit:gc.filter(c=>condCodes.has(c)).length});}
  const xused=new Set(),xm=[];
  if(explore)for(const g of gq){if(qm.some(m=>m.g===g.id))continue;const i=xl.findIndex((l,k)=>!xused.has(k)&&near(l,g));if(i>=0){xused.add(i);xm.push(g.id);}}
  // Qualitative matching.
  const ou=new Set(),om=[];
  for(const g of go){const ok=o=>o.direction===g.direction&&o.dimension===g.dimension;
   let i=obs.findIndex((o,k)=>!ou.has(k)&&ok(o)&&sameProduct(g.subject,o.subject));if(i<0)i=obs.findIndex((o,k)=>!ou.has(k)&&ok(o));if(i<0)continue;ou.add(i);
   const subj=subjectOutcome(g.subject,obs[i].subject);const untaught=String(g.dimension).startsWith('untaught:');
   om.push({g:g.id,subject:subj,usable:subj==='correct'&&!untaught,untaught});}
  const xom=[];const xou=new Set();
  if(explore)for(const g of go){if(om.some(m=>m.g===g.id))continue;const lab=String(g.dimension).replace(/^untaught:/,'').replace(/_/g,' ').toLowerCase();
   const i=ql.findIndex((l,k)=>!xou.has(k)&&l.direction===g.direction&&l.term.split(' ').some(t=>t.length>2&&lab.includes(t)));if(i>=0){xou.add(i);xom.push(g.id);}}
  const t=T[arm];t.q.gold+=gq.length;t.q.leads+=leads.length;t.q.matched+=qm.length;for(const m of qm){t.q[m.subject==='correct'?'correct':m.subject==='unresolved'?'unresolved':'incorrect']++;if(m.usable)t.q.usable++;t.q.condGold+=m.condGold;t.q.condHit+=m.condHit;}
  t.o.gold+=go.length;t.o.findings+=obs.length;t.o.matched+=om.length;for(const m of om){t.o[m.subject==='correct'?'correct':m.subject==='unresolved'?'unresolved':'incorrect']++;if(m.usable)t.o.usable++;if(m.untaught)t.o.untaughtMatched++;}
  t.o.untaughtGold+=go.filter(g=>String(g.dimension).startsWith('untaught:')).length;
  t.xq.leads+=xl.length;t.xq.matched+=xm.length;t.xo.leads+=ql.length;t.xo.matched+=xom.length;
  per[arm]={quantitative:{leads:leads.length,matched:qm,extra:leads.filter((l,k)=>!used.has(k)).map(l=>({value:l.value,unit:l.unit,subject:l.subject}))},exploratoryQuant:{leads:xl.length,matchedGold:xm},
   qualitative:{findings:obs.length,matched:om,extra:obs.filter((o,k)=>!ou.has(k)).map(o=>({dimension:o.dimension,direction:o.direction,subject:o.subject}))},exploratoryQual:{leads:ql.length,matchedGold:xom}};
 }
 // Lost by guidance: matched (or led to) by A or E, by neither B nor C.
 const hit=(arm,id,kind)=>per[arm][kind].matched.some(m=>m.g===id)||(kind==='quantitative'?per[arm].exploratoryQuant.matchedGold:per[arm].exploratoryQual.matchedGold).includes(id);
 for(const [kind,list,out] of [['quantitative',gq,lost.q],['qualitative',go,lost.o]])
  for(const g of list)if((hit('A',g.id,kind)||hit('E',g.id,kind))&&!hit('B',g.id,kind)&&!hit('C',g.id,kind))out.push(d.tag+'#'+g.id);
 docsOut.push({tag:d.tag,category:d.category,gold:{quantitative:gq.length,qualitative:go.length},arms:per});
}
const r=(a,b)=>b?Math.round(1000*a/b)/1000:null;
const summary=Object.fromEntries(arms.map(a=>{const t=T[a];return [a,{
 quantitative:{gold:t.q.gold,leads:t.q.leads,matched:t.q.matched,precision:r(t.q.matched,t.q.leads),recall:r(t.q.matched,t.q.gold),subjects:{correct:t.q.correct,incorrect:t.q.incorrect,unresolved:t.q.unresolved},
  conditions:{goldLabels:t.q.condGold,recognised:t.q.condHit},decisionUsable:t.q.usable,falsePositives:t.q.leads-t.q.matched},
 qualitative:{gold:t.o.gold,findings:t.o.findings,matched:t.o.matched,precision:r(t.o.matched,t.o.findings),recall:r(t.o.matched,t.o.gold),subjects:{correct:t.o.correct,incorrect:t.o.incorrect,unresolved:t.o.unresolved},
  untaught:{gold:t.o.untaughtGold,matched:t.o.untaughtMatched},decisionUsable:t.o.usable,falsePositives:t.o.findings-t.o.matched},
 exploratoryLeads:{quantitative:t.xq,qualitative:t.xo}}];}));
const meta={label:F.label,at:new Date().toISOString(),protocolSha256:sha(protocol),goldSha256:sha(goldBytes),armADist:A,
 plans:Object.fromEntries(Object.entries(plans).map(([c,p])=>[c,p.compiledFrom.digest])),lostByGuidance:{quantitative:lost.q.length,qualitative:lost.o.length}};
writeFileSync(PRIV,JSON.stringify({schema:'pee272.ab-run.v1',...meta,summary,lost,documents:docsOut},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({schema:'pee272.ab-run-public.v1',...meta,summary,documents:docsOut.map(d=>({tag:d.tag,category:d.category,gold:d.gold,
 arms:Object.fromEntries(arms.map(a=>[a,{quantitative:{leads:d.arms[a].quantitative.leads,matched:d.arms[a].quantitative.matched.length,subjects:d.arms[a].quantitative.matched.map(m=>m.subject)},
  qualitative:{findings:d.arms[a].qualitative.findings,matched:d.arms[a].qualitative.matched.length,subjects:d.arms[a].qualitative.matched.map(m=>m.subject),
   falsePositives:d.arms[a].qualitative.extra.map(e=>({dimension:e.dimension,direction:e.direction}))},exploratory:{quantitative:d.arms[a].exploratoryQuant.leads,qualitative:d.arms[a].exploratoryQual.leads}}]))}))},null,1)+'\n');
console.log(JSON.stringify({...meta,summary},null,1));
