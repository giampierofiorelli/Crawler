#!/usr/bin/env node
/** Continuous-learning Step 1D-A2: bounded proof of publisher/template structural lessons on already-acquired pages (no
 * network). For each page: a STRUCTURAL signature from the semantic-document contract (page type, structured-data shape,
 * test-table shapes and the heading words that introduce them, where the gold values sit) — no text, no CSS selectors.
 * Leave-one-page-out per publisher host: the other pages of the same host predict the held-out page's signature features;
 * agreement is reported per feature, and a disagreement is a detected layout change (the generic reader is the fallback).
 * Results are provisional hypotheses (development pages), never operational lessons.
 * Usage: node scripts/step1d-a2-template-signatures.mjs LABEL. Private -> pee-knowledge/private-eval/experience/; value-free
 * -> evaluation/experience/step1d-a2-templates-LABEL.json. Never overwrites. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
const label=process.argv[2];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL');
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';const OUT=process.env.STEP1D_A2_OUT_DIR;
const PRIV=OUT?join(OUT,`templates-private-${label}.json`):join(REPO,`private-eval/experience/step1d-a2-templates-${label}.json`);
const PUB=OUT?join(OUT,`templates-public-${label}.json`):`evaluation/experience/step1d-a2-templates-${label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: never overwritten');
const SEM=await import(resolve('dist/src/document_semantics.js'));const P=await import(resolve('dist/src/phase225_transient_test_probe.js'));
const E=join(homedir(),'.local/share/product-evidence-engine/private-eval');
const gold={step1c:JSON.parse(readFileSync(join(E,'step1c/gold.json'),'utf8')).values,
 phase272:[...JSON.parse(readFileSync(join(E,'phase272/gold-untouched.json'),'utf8')).quantitative,...JSON.parse(readFileSync(join(E,'phase272/gold-dev.json'),'utf8')).quantitative]};
const headCue=h=>!h?'none':/test data/i.test(h)?'test_data':/test results?/i.test(h)?'test_results':/\b(?:our|in) test/i.test(h)||/test room/i.test(h)?'our_test':/specs?|specifications?/i.test(h)?'specifications':'other';
const numRe=v=>new RegExp('(?<![\\d.,])(?:'+[String(v),...(Math.abs(v)>=1000?[Number(v).toLocaleString('en-US')]:[])].map(x=>x.replace(/\./g,'\\.')).join('|')+')(?![\\d])');
const pages=[];
for(const ev of ['step1c','phase272']){const W=JSON.parse(readFileSync(join(E,ev,'wave.json'),'utf8'));
 for(const p of W.pages){if(p.outcome!=='fetched')continue;const f=join(E,ev,'raw',p.tag+'.html');if(!existsSync(f))continue;const html=readFileSync(f,'utf8');const url=p.finalUrl??p.url;
  const sem=SEM.readDocumentSemantics1D2(html,url);const blocks=P.textBlocks225(html,{maxBlocks:1500}).blocks;
  const g=gold[ev].filter(x=>x.doc===p.tag);const loc={test_table:0,other_table:0,prose_test_section:0,prose_other:0,not_in_blocks:0};
  for(const v of g){const re=numRe(v.value);const bi=blocks.findIndex(b=>re.test(b));if(bi<0){loc.not_in_blocks++;continue;}const b=sem.blocks[bi];
   if(b.cell)loc[sem.tables[b.cell.table]?.context==='test'?'test_table':'other_table']++;else loc[b.sectionRole==='test_results'?'prose_test_section':'prose_other']++;}
  const testTables=sem.tables.filter(t=>t.context==='test'&&!t.hardExcluded);
  const sig={pageType:sem.pageType.kind,
   structuredProduct:sem.names.some(n=>n.source==='json_ld_item_reviewed')?'item_reviewed':sem.names.some(n=>n.source==='json_ld_product')?'top_level':sem.principal.conflicts.includes('structured_name_is_headline')?'headline_in_name':'none',
   reviewSuffixInName:sem.principal.conflicts.includes('structured_name_review_suffix_removed'),
   testTableShape:testTables.length?[...new Set(testTables.map(t=>t.phase245Mode+(t.cols===2?':2col':':multi')))].sort().join('+'):'none',
   testTableHeading:testTables.length?[...new Set(testTables.map(t=>headCue(t.heading)))].sort().join('+'):'none',
   articleMarkedNonMain:sem.blocks.some(b=>b.region==='excluded'&&/^non_main_marker/.test(b.regionReason??'')&&b.sectionRole==='test_results'),
   goldMostlyIn:g.length?Object.entries(loc).sort((a,b)=>b[1]-a[1])[0][0]:'no_gold'};
  pages.push({tag:p.tag,host:new URL(url).host,evaluation:ev,gold:g.length,signature:sig,goldLocations:loc,tables:sem.tables.length,ms:sem.stats.milliseconds});}}
const FEATURES=['pageType','structuredProduct','reviewSuffixInName','testTableShape','testTableHeading','articleMarkedNonMain','goldMostlyIn'];
const mode=xs=>{const c={};for(const x of xs)c[x]=(c[x]??0)+1;const e=Object.entries(c).sort((a,b)=>b[1]-a[1]);return e.length&&(e.length===1||e[0][1]>e[1][1])?e[0][0]:null;};
// Groups: the publisher host alone, and the host with the page type (a publisher uses several templates).
const group=(keyOf,feats)=>[...new Set(pages.map(keyOf))].map(h=>{const ps=pages.filter(p=>keyOf(p)===h);const FEATURES=feats;
 const loo=ps.length<2?[]:ps.map(p=>{const rest=ps.filter(q=>q!==p);const pred=Object.fromEntries(FEATURES.map(f=>[f,mode(rest.map(q=>String(q.signature[f])))]));
  const agree=Object.fromEntries(FEATURES.map(f=>[f,pred[f]===null?'no_majority':pred[f]===String(p.signature[f])?'agree':'layout_change_or_other_template']));return {tag:p.tag,agree};});
 const perFeature=Object.fromEntries(FEATURES.map(f=>[f,{agree:loo.filter(x=>x.agree[f]==='agree').length,disagree:loo.filter(x=>x.agree[f]==='layout_change_or_other_template').length,noMajority:loo.filter(x=>x.agree[f]==='no_majority').length}]));
 return {group:h,pages:ps.length,pageTypes:[...new Set(ps.map(p=>p.signature.pageType))],categories:[...new Set(ps.map(p=>p.tag.split('_')[1]))],leaveOneOut:loo,perFeature};});
const hosts=group(p=>p.host,FEATURES);const templates=group(p=>p.host+' | '+p.signature.pageType,FEATURES.filter(f=>f!=='pageType'));
const templatesByCategory=group(p=>p.host+' | '+p.signature.pageType+' | '+p.tag.split('_')[1],FEATURES.filter(f=>f!=='pageType'));
// Cross-host control: does another host's majority predict this page as well as its own host does?
const cross=Object.fromEntries(FEATURES.map(f=>{let own=0,other=0,n=0;for(const p of pages){const same=pages.filter(q=>q.host===p.host&&q!==p),diff=pages.filter(q=>q.host!==p.host);if(same.length<1)continue;n++;
 if(mode(same.map(q=>String(q.signature[f])))===String(p.signature[f]))own++;if(mode(diff.map(q=>String(q.signature[f])))===String(p.signature[f]))other++;}return [f,{pages:n,ownHostMajorityAgrees:own,otherHostsMajorityAgrees:other}];}));
const out={schema:'pee.step1d-a2.template-signatures.v1',label,at:new Date().toISOString(),tier:'development (acquired pages; structural signatures only, no text)',
 status:'provisional hypotheses; not operational (no held-out support)',pages:pages.length,hosts,templates,templatesByCategory,crossHostControl:cross};
writeFileSync(PRIV,JSON.stringify({...out,pageSignatures:pages},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({...out,pageSignatures:pages.map(p=>({tag:p.tag,host:p.host,signature:p.signature,goldLocations:p.goldLocations}))},null,1)+'\n');
const tot=gs=>{const o={};for(const g of gs)for(const [f,v] of Object.entries(g.perFeature)){o[f]??={agree:0,disagree:0,noMajority:0};for(const k of ['agree','disagree','noMajority'])o[f][k]+=v[k];}return o;};
console.log(JSON.stringify({pages:pages.length,byHost:tot(hosts),byHostAndPageType:tot(templates),byHostPageTypeAndCategory:tot(templatesByCategory),crossHostControl:cross,
 groups:templatesByCategory.map(g=>g.group+' ('+g.pages+')')},null,1));
