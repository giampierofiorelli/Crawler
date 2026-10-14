#!/usr/bin/env node
/** Phase246: recovery inventory of Phase244-245 research WITHOUT re-fetching any page.
 * Inputs: committed artifacts (Phase245 page manifest, Phase244 live-run receipts, gold files) and,
 * optionally, a directory holding raw bytes that survived from the original session.
 * Raw bytes are used only when their SHA-256 equals the recorded hash; a URL + hash alone is never
 * treated as having the page. Gold annotations are listed as evaluation artifacts only.
 * Output contains no page text: URLs, hashes, counts, identities (names/identifiers) and reasons.
 * Usage: node scripts/phase246-recovery-inventory.mjs [--raw DIR[,DIR...]] [--out FILE]
 */
import {readFileSync,existsSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {extractSpecifications245} from '../dist/src/phase245_spec_extraction.js';
const args=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const root=resolve(new URL('..',import.meta.url).pathname);
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(readFileSync(join(root,'evaluation/phase245/pages-manifest.json'),'utf8'));
const rawDirs=(args.raw??'').split(',').filter(Boolean);
// Raw files are looked up by tag (<tag>.html) in every provided directory and accepted only on hash match.
const rawIndex=new Map();
for(const d of rawDirs)if(existsSync(d))for(const f of readdirSync(d))if(f.endsWith('.html')&&!f.includes('.rendered.')){
 const tag=f.slice(0,-5);const bytes=readFileSync(join(d,f));(rawIndex.get(tag)??rawIndex.set(tag,[]).get(tag)).push({path:join(d,f),sha:sha(bytes),bytes});}
const CATEGORY={ // operator-assigned category hypotheses for the pages (not page-derived truth)
 switchback_keen:'hiking_boots',switchback_oboz:'hiking_boots',prodirect_hypervenom:'football_footwear',brabantia_bo36:'waste_bins',
 brabantia_sortgo:'waste_bins',ikea_billy:'bookcases',lakeland_airfryer8l:'air_fryers',lakeland_kettle:'kettles',arduino_uno:'microcontroller_boards',
 psref_x1:'laptops',wiki_iphone15:'smartphones',wiki_raspberrypi:'single_board_computers',apple_airpodspro_specs:'earbuds',bosch_coolingset:'appliance_accessories',
 bosch_mum8meat:'appliance_accessories',pimoroni_pybadge:'microcontroller_boards',rtings_athanc70:'headphones',scan_kioxia1tb:'solid_state_drives',
 pololu_2135:'motor_drivers',pololu_2135_specs:'motor_drivers',wickes_dhr242:'power_drills',richer_audiolab9000a:'amplifiers',sparkfun_redboard:'microcontroller_boards',
 johnlewis_1:'coffee_machines'};
const pages=[];
for(const set of ['dev','unseen1','unseen2'])for(const p of manifest[set]){
 const candidates=rawIndex.get(p.tag)??[];const match=candidates.find(c=>c.sha===p.sha256);
 const row={set,role:set==='dev'?'development_page':'previously_used_holdout_now_diagnostic',tag:p.tag,url:p.url,host:p.url?new URL(p.url).host:null,
  fetchedAt:p.fetchedAt,recordedSha256:p.sha256,bytes:p.bytes,rawBytesRecovered:!!match,
  rawBytesStatus:match?'sha256_verified':candidates.length?'present_but_hash_mismatch':'not_available',
  categoryHypothesis:CATEGORY[p.tag]??null,categoryBasis:'operator_assigned_hypothesis'};
 if(match){
  const x=extractSpecifications245(match.bytes.toString('utf8'),p.url??'recovered:'+p.tag);
  row.reextraction={extractor:'phase245@ee2336f',mainProduct:x.mainProduct.name,mainProductSource:x.mainProduct.source,
   identifierKinds:Object.keys(x.mainProduct.identifiers),variants:x.variants.length,promotedDeclarations:x.facts.length,
   namedProducts:[...new Set(x.facts.filter(f=>f.product.ref==='named').map(f=>f.product.name))].length,
   heldBackAmbiguous:x.ambiguous.length,abstentionReasons:Object.keys(x.abstentions).length};
 }
 pages.push(row);
}
const live=[];
for(const f of readdirSync(join(root,'docs/phase244/live-runs'))){
 const r=JSON.parse(readFileSync(join(root,'docs/phase244/live-runs',f),'utf8'));
 for(const x of r.observations.receipts)live.push({file:f,url:x.url,observedAt:x.observedAt,responseSha256:x.responseSha256,byteExact:x.byteExact,
  status:x.status,productLeads:x.productLeads.length,recordedFacts241:x.productFacts241?.factCount??0,
  rawBytesRecovered:false,note:'receipt only: Phase244 receipts store hashes and derived facts, not page bytes'});
 for(const c of r.sourceDiscovery.candidates)live.push({file:f,url:c.url,discoveryOnly:true});
}
const gold=[];
for(const g of ['gold-dev/dev-gold.json','gold-unseen/unseen-gold.json','gold-unseen2/unseen2-gold.json']){
 const G=JSON.parse(readFileSync(join(root,'evaluation/phase245',g),'utf8'));
 for(const [tag,v] of Object.entries(G))gold.push({file:g,tag,expected:v.expected?.length??0,mustAbstain:v.mustAbstain?.length??0,
  classification:'evaluation_annotation_not_product_evidence'});
}
const recovered=pages.filter(p=>p.rawBytesRecovered);
const summary={
 manifestPages:pages.length,rawBytesVerified:recovered.length,rawBytesMissing:pages.length-recovered.length,
 distinctHosts:new Set(pages.map(p=>p.host)).size,
 recoveredMainProducts:recovered.filter(p=>p.reextraction?.mainProduct).length,
 recoveredDeclarations:recovered.reduce((a,p)=>a+p.reextraction.promotedDeclarations,0),
 recoveredNamedTableProducts:recovered.reduce((a,p)=>a+p.reextraction.namedProducts,0),
 phase244Receipts:live.filter(x=>!x.discoveryOnly).length,phase244DiscoveryLeads:live.filter(x=>x.discoveryOnly).length,
 phase244RecordedFacts:live.reduce((a,x)=>a+(x.recordedFacts241??0),0),
 goldFiles:gold.length,goldExpectedFacts:gold.reduce((a,g)=>a+g.expected,0),
 categoriesTouched:[...new Set(pages.map(p=>p.categoryHypothesis).filter(Boolean))].sort()};
const out={schema:'pee246.recovery-inventory.v1',generatedAt:new Date().toISOString(),
 rules:['no network access was used','raw bytes count only when SHA-256 equals the recorded hash','gold annotations are evaluation artifacts, never product evidence',
  're-extraction uses the current extractor version, not the version that ran originally','robots/terms status at original fetch time is not re-verified here'],
 summary,pages,phase244:live,gold};
if(args.out)writeFileSync(resolve(args.out),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(summary,null,1));
