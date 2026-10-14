import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,existsSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {KnowledgeStore246,validGtin246,productKey246,retentionFor246,DEFAULT_STORAGE_POLICY246,
 type ObservationInput246,type SourceInput246,type ReviewReceipt246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {planBudgetedCategoryWave243,type WaveContext243} from '../src/phase243_budgeted_category_search.js';
import {seedCategoryHypotheses246,CATEGORY_SEEDS246,CATEGORY_ALIASES246} from '../src/phase246_category_seeds.js';
import {emptyLedger193} from '../src/phase193_screening_memory.js';
import type {WebSourcePolicy} from '../src/web_evidence_acquisition.js';

// Test stores live in an OS temp dir; production refuses /tmp unless this opt-in is set (see test 10b).
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee246-'));
let n=0;const dbPath=()=>join(dir,`store${++n}.sqlite`);
const AT='2026-10-14T12:00:00.000Z';const later=(h:number)=>new Date(Date.parse(AT)+h*3600000).toISOString();
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
/** Builds a valid GTIN-13 from a 12-digit stem. */
const gtin=(stem:string)=>{const d=stem.split('').map(Number);const s=d.reverse().reduce((a,x,i)=>a+x*(i%2===0?3:1),0);return stem+((10-s%10)%10);};
const G1=gtin('501234567890'),G2=gtin('501234567891'),G3=gtin('501234567892');
const approved=(host:string,robotsCheckedAt='2026-10-14T06:00:00Z'):WebSourcePolicy=>({sourceId:'pol_'+host.replace(/\W/g,'_'),host,basis:'written_permission',
 rightsDocumentId:'rights_'+host,rightsDocumentUrl:'https://rights.pee-tests.org/'+host,reviewedBy:'rights_reviewer',reviewedAt:'2026-10-01T00:00:00Z',
 validUntil:'2027-10-01T00:00:00Z',permittedOperations:['metadata_discovery','page_retrieval','local_analysis','fact_storage'],
 robots:'allowed',robotsCheckedAt,websiteTerms:'reviewed_permitted',termsCheckedAt:'2026-10-10T00:00:00Z',commercialUseReviewed:true});
const src=(host:string,type:SourceInput246['sourceType'],policy:WebSourcePolicy|null=approved(host)):SourceInput246=>
 ({sourceId:'src_'+host.replace(/\W/g,'_'),host,sourceType:type,sourceTypeBasis:'operator_asserted',policy:policy??undefined});
const ld=(o:unknown)=>`<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const productPage=(o:{name:string;brand:string;gtin?:string;mpn?:string;watts:number;litres:number})=>
 `<!doctype html><html><head>${ld({'@context':'https://schema.org','@type':'Product',name:o.name,brand:{'@type':'Brand',name:o.brand},
  ...(o.gtin?{gtin13:o.gtin}:{}),...(o.mpn?{mpn:o.mpn}:{}),
  additionalProperty:[{'@type':'PropertyValue',name:'Power',value:o.watts,unitText:'W'},{'@type':'PropertyValue',name:'Capacity',value:o.litres,unitText:'l'}]})}
 </head><body><main><h1>${o.name}</h1><p>Marketing prose: the crispiest results ever, tested by our chefs.</p></main></body></html>`;
const observe=(store:KnowledgeStore246,url:string,html:string,source:SourceInput246,at=AT,cats=['air_fryers'],extra:Partial<ObservationInput246>={})=>
 store.ingestObservation246({source,url,sha256:sha(html),bytes:html.length,httpStatus:200,fetchedAt:at,runId:'run_'+at.slice(0,13).replace(/\D/g,''),
  extractorVersion:'phase245@ee2336f',extraction:extractSpecifications245(html,url),categoryHypotheses:cats,...extra});
const receipt=(revs:string[],id='review_1'):ReviewReceipt246=>({reviewId:id,reviewerId:'category_reviewer',reviewedAt:later(2),sourceRevisionIds:revs,note:'checked against cited revisions'});
const trusted=(r:ReviewReceipt246)=>r.reviewerId==='category_reviewer';
const MAKER='maker.example',SHOP='shop.example',LAB='lab.example';

test('1. live observation becomes a classified persistent candidate (identity, retention, role, no page body)',()=>{
 const s=new KnowledgeStore246(dbPath());
 const html=productPage({name:'Vortex 5.5L Air Fryer',brand:'Vortex',gtin:G1,watts:1700,litres:5.5});
 const r=observe(s,'https://maker.example/p/vortex55',html,src(MAKER,'manufacturer'));
 assert.equal(r.newRevision,true);assert.equal(r.retention,'facts_retained');assert.equal(r.productIds.length,1);
 const p=s.product246(r.productIds[0])!;
 assert.equal(p.keyBasis,'gtin');assert.equal(p.identityState,'extracted_unverified');assert.deepEqual(p.categoryHypotheses,['air_fryers']);
 assert.equal(p.rankingAuthorized,false);assert.equal(p.independentTestEvidence,false);
 const d=s.declarations246(p.productId);
 assert.deepEqual(d.map(x=>x.propertyKey).sort(),['capacity','power']);
 assert.ok(d.every(x=>x.state==='extracted_unverified'&&x.evidenceRole==='manufacturer_declaration'&&x.retention==='facts_retained'));
 const rev=s.db.prepare('SELECT * FROM revisions').get() as Record<string,unknown>;
 assert.equal(rev.raw_body_stored,0);assert.equal(rev.sha256,sha(html));
 // No page text is stored anywhere: the marketing sentence must not appear in any table.
 assert.ok(!JSON.stringify(s.export246({includePendingRights:true})).includes('crispiest'));
 assert.ok(s.verifyJournal().ok);s.close();
});

test('2+3. a later run retrieves knowledge without the page; identical bytes are a sighting, not a duplicate',()=>{
 const path=dbPath();
 const html=productPage({name:'Vortex 5.5L Air Fryer',brand:'Vortex',gtin:G1,watts:1700,litres:5.5});
 const a=new KnowledgeStore246(path);const r1=observe(a,'https://maker.example/p/vortex55',html,src(MAKER,'manufacturer'));a.close();
 const b=new KnowledgeStore246(path); // new store instance, no HTML available
 const p=b.product246(r1.productIds[0])!;assert.equal(p.name,'Vortex 5.5L Air Fryer');
 assert.equal(b.declarations246(p.productId).find(x=>x.propertyKey==='power')!.value!.kind,'quantity');
 const before=b.stats246();
 const r2=observe(b,'https://maker.example/p/vortex55',html,src(MAKER,'manufacturer'),later(24));
 assert.equal(r2.newRevision,false);assert.equal(r2.revisionId,r1.revisionId);
 const after=b.stats246();
 assert.equal(after.products,before.products);assert.equal(after.declarations,before.declarations);assert.equal(after.revisions,before.revisions);
 assert.equal(after.sightings,before.sightings+1);
 // Same GTIN on another host = same product, separate source; similar name with another GTIN = another product.
 const r3=observe(b,'https://shop.example/vortex',productPage({name:'VORTEX 5.5 L airfryer (black)',brand:'Vortex',gtin:G1,watts:1700,litres:5.5}),src(SHOP,'retailer'));
 assert.deepEqual(r3.productIds,r1.productIds);
 assert.equal(b.product246(r1.productIds[0])!.sources.length,2);
 const r4=observe(b,'https://shop.example/vortex-xl',productPage({name:'Vortex 5.5L Air Fryer',brand:'Vortex',gtin:G2,watts:1700,litres:5.5}),src(SHOP,'retailer'));
 assert.notDeepEqual(r4.productIds,r1.productIds,'identical name, different GTIN must not merge');
 // Name-only identities never merge across hosts.
 const k1=productKey246({host:'a.example',name:'Toaster 2'}),k2=productKey246({host:'b.example',name:'Toaster 2'});
 assert.notEqual(k1.key,k2.key);
 assert.equal(validGtin246(G1),'0'+G1);assert.equal(validGtin246(G1.slice(0,12)+((Number(G1[12])+1)%10)),null);
 b.close();
});

test('4. variants stay distinct and keep their own declarations',()=>{
 const s=new KnowledgeStore246(dbPath());
 const html=`<!doctype html><html><head>${ld({'@context':'https://schema.org','@type':'ProductGroup',name:'Kettle K',productGroupID:'KK',variesBy:['https://schema.org/size'],
  hasVariant:[{'@type':'Product',name:'Kettle K 1.2 l',sku:'KK12',size:'1.2 l',additionalProperty:[{'@type':'PropertyValue',name:'Capacity',value:1.2,unitText:'l'}]},
   {'@type':'Product',name:'Kettle K 1.7 l',sku:'KK17',size:'1.7 l',additionalProperty:[{'@type':'PropertyValue',name:'Capacity',value:1.7,unitText:'l'}]}]})}</head><body><main><h1>Kettle K</h1></main></body></html>`;
 const r=observe(s,'https://maker.example/kettle-k',html,src(MAKER,'manufacturer'),AT,['kettles']);
 assert.equal(r.variantIds.length,2);assert.equal(new Set(r.variantIds).size,2);
 const p=s.product246(r.productIds[0])!;assert.equal(p.keyBasis,'host_group');
 assert.deepEqual(p.variants.map(v=>v.name),['Kettle K 1.2 l','Kettle K 1.7 l']);
 const cap=s.declarations246(p.productId).filter(d=>d.propertyKey==='capacity');
 assert.equal(cap.length,2);assert.equal(new Set(cap.map(c=>c.variantId)).size,2);
 assert.equal(s.conflicts246(p.productId).length,0,'different variants are not a conflict');
 s.close();
});

test('5. observations contribute category hypotheses as observed patterns, never as importance',()=>{
 const s=new KnowledgeStore246(dbPath());
 observe(s,'https://maker.example/a',productPage({name:'Fryer A',brand:'Acme',gtin:G1,watts:1500,litres:4}),src(MAKER,'manufacturer'));
 observe(s,'https://maker.example/b',productPage({name:'Fryer B',brand:'Acme',gtin:G2,watts:2000,litres:6}),src(MAKER,'manufacturer'));
 const ids=s.deriveObservedPatterns246('air_fryers');
 assert.equal(ids.length,2);
 const items=s.categoryItems246('air_fryers');
 const power=items.find(i=>/"Power"/.test(i.statement))!;
 assert.equal(power.knowledgeClass,'observed_pattern');assert.equal(power.state,'proposed_unverified');
 assert.match(power.statement,/2 of 2 observed products; declared values 1500–2000 W/);
 assert.match(power.statement,/Frequency of declaration is not evidence of importance or performance/);
 assert.throws(()=>s.addCategoryItem246({categoryId:'air_fryers',section:'technical_characteristics',statement:'Most fryers declare power',
  knowledgeClass:'observed_pattern',provenance:'assistant_authored_unreviewed'}),/246_pattern_requires_aggregate_provenance/);
 assert.throws(()=>s.addCategoryItem246({categoryId:'air_fryers',section:'mechanisms',statement:'Fans circulate hot air',
  knowledgeClass:'reviewed_general_knowledge',provenance:'assistant_authored_unreviewed'}),/246_reviewed_classes_require_review_promotion/);
 // A new observation in the category makes the derived pattern nodes stale.
 const r=observe(s,'https://maker.example/c',productPage({name:'Fryer C',brand:'Acme',gtin:G3,watts:1800,litres:5}),src(MAKER,'manufacturer'));
 assert.ok(r.staleNodes.includes('pattern:air_fryers:power'));
 s.close();
});

test('6. a reviewed category change propagates through dependent artifacts only',()=>{
 const s=new KnowledgeStore246(dbPath());
 const lab=observe(s,'https://lab.example/method/air-fryer-test','<!doctype html><html><body><main><h1>How we test air fryers</h1></main></body></html>',src(LAB,'independent_original_test'));
 const hyp=s.addCategoryItem246({categoryId:'air_fryers',section:'quality_measurements',statement:'Cooking evenness can be measured by browning uniformity across a full basket of chips.',
  knowledgeClass:'technical_hypothesis',provenance:'professional_method_reference',sourceRevisionIds:[lab.revisionId],studyStream:'original_test_methods',
  concept:{kind:'outcome',id:'browning_uniformity',aliases:['browning uniformity','even browning']}});
 s.addCategoryItem246({categoryId:'toasters',section:'user_goals',statement:'Toast both sides evenly.',knowledgeClass:'technical_hypothesis',
  provenance:'assistant_authored_unreviewed',concept:{kind:'outcome',id:'even_toast',aliases:['even toast']}});
 const c1=s.compileCategory246('air_fryers',['air fryer','airfryer']);s.compileCategory246('toasters',['toaster']);
 s.registerDerived246('dialogue:air_fryers','dialogue_schema',['node:compiled128:air_fryers'],'f'.repeat(64));
 assert.equal(s.derivedNode246('compiled128:air_fryers')!.state,'fresh');
 const brain0=s.categoryBrain246('air_fryers',['air fryer']);
 assert.equal(brain0.concepts[0].state,'proposed_unverified');
 const v1=s.commitCategoryVersion246('air_fryers','initial hypotheses');
 s.reviewCategoryItem246(hyp,'reviewed_general_knowledge',receipt([lab.revisionId]),trusted);
 assert.equal(s.derivedNode246('compiled128:air_fryers')!.state,'stale');
 assert.equal(s.derivedNode246('dialogue:air_fryers')!.state,'stale','transitive dependant invalidated');
 assert.equal(s.derivedNode246('compiled128:toasters')!.state,'fresh','unrelated category untouched');
 const c2=s.compileCategory246('air_fryers',['air fryer','airfryer']);
 assert.notEqual(c2.ontologySnapshot,c1.ontologySnapshot);
 const brain=s.categoryBrain246('air_fryers',['air fryer']);
 assert.equal(brain.concepts[0].state,'reviewed_definition');assert.equal(brain.sources[0].role,'original_expert_method');
 const v2=s.commitCategoryVersion246('air_fryers','reviewed measurement concept');
 assert.equal(v2.version,v1.version+1);assert.equal(v2.changed,true);
 assert.equal(s.commitCategoryVersion246('air_fryers','no change').changed,false);
 assert.throws(()=>s.reviewCategoryItem246(hyp,'reviewed_general_knowledge',receipt([lab.revisionId]),()=>false),/246_review_not_verified/);
 s.close();
});

test('7. updated or conflicting sources trigger revision and conflict records',()=>{
 const s=new KnowledgeStore246(dbPath());
 const url='https://maker.example/p/fryer';
 const r1=observe(s,url,productPage({name:'Fryer A',brand:'Acme',gtin:G1,watts:1500,litres:4}),src(MAKER,'manufacturer'));
 const pid=r1.productIds[0];
 const powerDecl=s.declarations246(pid).find(d=>d.propertyKey==='power')!;
 s.registerDerived246('summary:'+pid,'product_summary',['decl:'+powerDecl.declarationId],'a'.repeat(64));
 const r2=observe(s,url,productPage({name:'Fryer A',brand:'Acme',gtin:G1,watts:1600,litres:4}),src(MAKER,'manufacturer',approved(MAKER,later(47))),later(48));
 assert.equal(r2.newRevision,true);assert.deepEqual(r2.supersededRevisionIds,[r1.revisionId]);
 assert.ok(r2.staleNodes.includes('summary:'+pid));
 const cur=s.declarations246(pid);
 assert.equal(cur.find(d=>d.propertyKey==='power')!.value!.kind==='quantity'&&(cur.find(d=>d.propertyKey==='power')!.value as {number:number}).number,1600);
 assert.ok(s.declarations246(pid,{includeSuperseded:true}).some(d=>d.state==='superseded_by_revision'));
 assert.equal(s.conflicts246(pid).length,0,'superseded values are history, not conflict');
 // Another source disagrees: kept side by side as a conflict, not resolved by vote or recency.
 observe(s,'https://shop.example/fryer-a',productPage({name:'Acme Fryer A',brand:'Acme',gtin:G1,watts:1400,litres:4}),src(SHOP,'retailer'));
 const c=s.conflicts246(pid);assert.equal(c.length,1);assert.equal(c[0].values.length,2);
 s.close();
});

test('8. unknown rights keep metadata only; pending cache is local, expiring, never promoted or exported by default',()=>{
 const s=new KnowledgeStore246(dbPath());
 const html=productPage({name:'Fryer U',brand:'Unknown Rights',gtin:G1,watts:1500,litres:4});
 const r=observe(s,'https://unknown.example/u',html,src('unknown.example','retailer',null));
 assert.equal(r.retention,'metadata_only');assert.equal(r.declarationsSeen>0,true);assert.equal(r.declarationsRetained,0);
 assert.equal(s.declarations246(r.productIds[0]).length,0);
 assert.equal(s.product246(r.productIds[0])!.name,'Fryer U','identity metadata is kept');
 assert.ok(s.gaps246({refId:r.productIds[0]}).some(g=>g.kind==='declarations_not_retained_rights'));
 // Blocked sources store nothing beyond the refusal event.
 const blocked=observe(s,'https://blocked.example/b',html,src('blocked.example','retailer',{...approved('blocked.example'),robots:'disallowed'}));
 assert.equal(blocked.retention,'blocked');assert.equal(blocked.productIds.length,0);
 // Robots allowance alone (no fact_storage, unknown basis) is not permission to retain.
 assert.equal(retentionFor246({...approved('x.example'),basis:'unknown'},DEFAULT_STORAGE_POLICY246,AT),'metadata_only');
 assert.equal(retentionFor246({...approved('x.example'),permittedOperations:['metadata_discovery','page_retrieval']},DEFAULT_STORAGE_POLICY246,AT),'metadata_only');
 s.close();
 const pending:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'test-pending',localPendingRightsCache:{enabled:true,expiresAfterDays:1}};
 const t=new KnowledgeStore246(dbPath(),pending);
 const rp=observe(t,'https://unknown.example/u',html,src('unknown.example','retailer',null));
 assert.equal(rp.retention,'local_pending_rights_review');assert.ok(rp.declarationsRetained>0);
 const d=t.declarations246(rp.productIds[0]);
 assert.throws(()=>t.verifyDeclarationForPurpose246(d[0].declarationId,'spec_comparison',receipt([rp.revisionId]),trusted),/246_rights_insufficient_for_promotion/);
 assert.equal((t.export246().tables.declarations as unknown[]).length,0,'pending declarations not exported by default');
 assert.ok((t.export246({includePendingRights:true}).tables.declarations as unknown[]).length>0);
 assert.equal(t.purgeExpired246(later(25)),d.length);
 assert.equal(t.declarations246(rp.productIds[0]).length,0);
 assert.equal(t.stats246().declarationsPendingRights,0);
 t.close();
});

test('9. a manufacturer declaration is never independent test evidence or a ranking input',()=>{
 const s=new KnowledgeStore246(dbPath());
 const r=observe(s,'https://maker.example/a',productPage({name:'Fryer A',brand:'Acme',gtin:G1,watts:1500,litres:4}),src(MAKER,'manufacturer'));
 const d=s.declarations246(r.productIds[0])[0];
 assert.equal(d.evidenceRole,'manufacturer_declaration');assert.equal(d.independentTestEvidence,false);assert.equal(d.rankingAuthorized,false);
 assert.throws(()=>s.db.prepare('UPDATE declarations SET independent_test_evidence=1').run(),/CHECK constraint failed/);
 assert.throws(()=>s.db.prepare('UPDATE declarations SET ranking_authorized=1').run(),/CHECK constraint failed/);
 s.verifyDeclarationForPurpose246(d.declarationId,'spec_comparison',receipt([r.revisionId]),trusted);
 const v=s.declarations246(r.productIds[0]).find(x=>x.declarationId===d.declarationId)!;
 assert.equal(v.state,'verified_for_purpose');assert.equal(v.evidenceRole,'manufacturer_declaration');assert.equal(v.independentTestEvidence,false);
 const item=s.addCategoryItem246({categoryId:'air_fryers',section:'performance_outcomes',statement:'Higher wattage gives crispier chips.',
  knowledgeClass:'technical_hypothesis',provenance:'assistant_authored_unreviewed'});
 assert.throws(()=>s.reviewCategoryItem246(item,'evidence_supported_finding',receipt([r.revisionId]),trusted),/246_finding_requires_independent_original_test/);
 const wave=planBudgetedCategoryWave243(waveCtx(),s.candidates243('air_fryers','uk'));
 assert.equal(wave.rankingAuthorized,false);assert.equal(s.product246(r.productIds[0])!.rankingAuthorized,false);
 assert.equal(s.categoryProfile246('air_fryers').performanceEstablished,false);
 s.close();
});

test('10. a clean new process reloads from durable storage, export/import and backup',()=>{
 const path=dbPath();const s=new KnowledgeStore246(path);
 const r=observe(s,'https://maker.example/a',productPage({name:'Fryer A',brand:'Acme',gtin:G1,watts:1500,litres:4}),src(MAKER,'manufacturer'));
 s.addCategoryItem246({categoryId:'air_fryers',section:'user_questions',statement:'How much food fits for a family of four?',
  knowledgeClass:'technical_hypothesis',provenance:'assistant_authored_unreviewed',studyStream:'user_outcomes'});
 s.commitCategoryVersion246('air_fryers','seed');
 const exp=join(dir,'export'+n+'.json');const digest=s.writeExport246(exp);
 const bak=join(dir,'backup'+n+'.sqlite');s.backup246(bak);
 assert.throws(()=>s.backup246(bak),/246_backup_target_exists/);
 s.close();
 const mod=new URL('../src/phase246_knowledge_store.js',import.meta.url).href;
 const child=(p:string)=>{const o=spawnSync(process.execPath,['--input-type=module','-e',
  `import {KnowledgeStore246} from ${JSON.stringify(mod)};const s=new KnowledgeStore246(${JSON.stringify(p)});
   const p0=s.products246({category:'air_fryers'});console.log(JSON.stringify({stats:s.stats246(),journal:s.verifyJournal(),
   name:s.product246(p0[0]).name,decl:s.declarations246(p0[0]).length,versions:s.categoryVersions246('air_fryers').length}));s.close();`],
  {encoding:'utf8',env:{...process.env,PEE_ALLOW_TMP_STORE:'1'}});
  assert.equal(o.status,0,o.stderr);return JSON.parse(o.stdout.trim().split('\n').pop()!);};
 for(const p of [path,bak]){const c=child(p);
  assert.equal(c.name,'Fryer A');assert.equal(c.decl,2);assert.equal(c.versions,1);assert.ok(c.journal.ok);assert.equal(c.stats.schemaVersion,1);}
 const imported=join(dir,'imported'+n+'.sqlite');
 const t=KnowledgeStore246.import246(exp,imported);
 assert.equal(t.product246(r.productIds[0])!.name,'Fryer A');assert.equal(t.declarations246(r.productIds[0]).length,2);
 assert.ok(t.verifyJournal().ok);t.close();
 assert.equal(child(imported).decl,2);
 assert.throws(()=>KnowledgeStore246.import246(exp,imported),/246_import_target_exists/);
 const tampered=JSON.parse(readFileSync(exp,'utf8'));tampered.tables.products[0].name='Edited';
 writeFileSync(exp+'.bad',JSON.stringify(tampered));
 assert.throws(()=>KnowledgeStore246.import246(exp+'.bad',join(dir,'x'+n+'.sqlite')),/246_export_integrity_failed/);
 assert.match(digest,/^[0-9a-f]{64}$/);
});

test('10b. safe schema handling: refuses ephemeral /tmp by default and stores newer than the software',()=>{
 const prev=process.env.PEE_ALLOW_TMP_STORE;delete process.env.PEE_ALLOW_TMP_STORE;
 try{assert.throws(()=>new KnowledgeStore246('/tmp/pee246-should-not-exist.sqlite'),/246_refusing_ephemeral_tmp_store/);}
 finally{process.env.PEE_ALLOW_TMP_STORE=prev;}
 assert.ok(!existsSync('/tmp/pee246-should-not-exist.sqlite'));
 const path=dbPath();const s=new KnowledgeStore246(path);assert.equal(s.schemaVersion(),1);
 s.db.exec('PRAGMA user_version=99');s.close();
 assert.throws(()=>new KnowledgeStore246(path),/246_store_newer_than_software/);
 const j=new KnowledgeStore246(dbPath());j.recordAccess246('robots.example','robots_disallowed');
 assert.throws(()=>j.db.prepare("DELETE FROM events").run(),/append_only_events/);j.close();
});

const waveCtx=():WaveContext243=>({categoryId:'air_fryers',market:'uk',scopeKey:'air_fryers_uk_general',
 asOf:'2026-10-14T13:00:00Z',waveOrdinal:1,explicitUserNeedProductIds:[],changedSourceRevisionProductIds:[],recoveryMode:'normal',
 population:{categoryId:'air_fryers',market:'uk',enrichmentBudget:0,independentDiscoveryPasses:0,
  discoveredNewPlausibleInRecentPasses:0,reviewedFamilyIds:['unreviewed_family'],demandMode:'general_launch_seed'},
 policy:{version:'pilot_a',mode:'lean_bootstrap',effortBudget:3,unitCost:{identity:1,cheap_screen:1,deep_review:4,revisit:2},
  minimumCredibleCandidateCount:2,reservedTailActionPercent:20,auditSuspendedMaxPerWave:1,auditEveryNWaves:5}});

test('11. Phase243 budget, Phase193 screening and host suspension decisions still work with store candidates',()=>{
 const s=new KnowledgeStore246(dbPath());
 for(const [i,g] of [G1,G2,G3].entries())observe(s,`https://maker.example/p${i}`,productPage({name:'Fryer '+i,brand:'Acme',gtin:g,watts:1500+i,litres:4}),src(MAKER,'manufacturer'));
 // A metadata-only discovery stub from an unknown-rights source joins the population as a stub.
 observe(s,'https://unknown.example/stub',productPage({name:'Stub Fryer',brand:'Small Brand',watts:1200,litres:3}),src('unknown.example','retailer',null));
 const cands=s.candidates243('air_fryers','uk');assert.equal(cands.length,4);
 assert.equal(cands.filter(c=>c.product.stage==='discovery_stub').length,1);
 const w=planBudgetedCategoryWave243(waveCtx(),cands);
 assert.ok(w.spentEffortUnits<=3);assert.equal(w.marketCoverageCertified,false);assert.equal(w.discoveryMustContinue,true);
 // Host suspension: two restrictions suspend (reversible), robots refusal suspends at once; no bypass path exists.
 assert.equal(s.recordAccess246('shop.example','forbidden',AT).suspended,false);
 assert.equal(s.recordAccess246('shop.example','rate_limited',AT).suspended,true);
 assert.equal(s.hostSuspended246('shop.example',later(1)),true);assert.equal(s.hostSuspended246('shop.example',later(24*31)),false);
 assert.equal(s.recordAccess246('robots.example','robots_disallowed',AT).suspended,true);
 s.liftSuspension246('shop.example','operator_review');assert.equal(s.hostSuspended246('shop.example',later(1)),false);
 // Phase193: an unscreened revision is reported as needing screening, never silently reused.
 const r=observe(s,'https://maker.example/screened',productPage({name:'Fryer S',brand:'Acme',watts:1500,litres:4}),src(MAKER,'manufacturer'),AT,['air_fryers'],
  {screening:{ledger:emptyLedger193(),market:'uk',policyVersion:'p1'}});
 assert.equal(r.screeningVerdict,'screen_required_new_document');
 assert.ok(s.gaps246().some(g=>g.kind==='screening_required'));
 s.close();
});

test('profile: category profile keeps classes and sections apart and reports no ranking or performance claims',()=>{
 const s=new KnowledgeStore246(dbPath());
 s.addCategoryItem246({categoryId:'coffee_machines',section:'mechanisms',statement:'Pump pressure is one input to espresso extraction; stated bar ratings are not extraction quality.',
  knowledgeClass:'technical_hypothesis',provenance:'assistant_authored_unreviewed',studyStream:'technical_mechanisms'});
 const p=s.categoryProfile246('coffee_machines');
 assert.equal(Object.keys(p.sections).length,12);
 assert.equal(p.sections.mechanisms.technicalHypotheses.length,1);
 assert.equal(p.sections.mechanisms.reviewedGeneralKnowledge.length,0);
 assert.equal(p.rankingAuthorized,false);assert.equal(p.performanceEstablished,false);
 s.close();
});

test.after(()=>{rmSync(dir,{recursive:true,force:true});});

test('robots re-check freshness: a stale robots check downgrades retention instead of reusing old permission',()=>{
 const s=new KnowledgeStore246(dbPath());
 const r=observe(s,'https://maker.example/a',productPage({name:'Fryer A',brand:'Acme',gtin:G1,watts:1500,litres:4}),src(MAKER,'manufacturer'),later(48));
 assert.equal(r.retention,'metadata_only');assert.equal(r.declarationsRetained,0);
 s.close();
});

test('seeded category profiles cover all 12 sections, stay unreviewed and compile through Phase128',()=>{
 const s=new KnowledgeStore246(dbPath());
 for(const c of Object.keys(CATEGORY_SEEDS246)){
  const ids=seedCategoryHypotheses246(s,c,AT);assert.deepEqual(seedCategoryHypotheses246(s,c,AT),ids,'idempotent');
  const p=s.categoryProfile246(c);
  assert.ok(Object.values(p.sections).every(x=>x.technicalHypotheses.length>0),c+' covers every section');
  assert.equal(p.counts.reviewed,0);
  const compiled=s.compileCategory246(c,CATEGORY_ALIASES246[c]);
  const brain=s.categoryBrain246(c,CATEGORY_ALIASES246[c]);
  assert.ok(brain.concepts.length>=4&&brain.concepts.every(x=>x.state==='proposed_unverified'));
  assert.match(compiled.ontologySnapshot,/^[0-9a-f]{64}$/);
 }
 s.close();
});

test('an ambiguous main product records a gap instead of guessing an identity',()=>{
 const s=new KnowledgeStore246(dbPath());
 const prod=(n:string)=>({'@context':'https://schema.org','@type':'Product',name:n,additionalProperty:[{'@type':'PropertyValue',name:'Power',value:1700,unitText:'W'}]});
 const html=`<!doctype html><html><head>${ld(prod('Air Fryer - Black'))}${ld(prod('Air Fryer'))}</head><body><main><h1>Air Fryer</h1><ul><li>Power: 1700W</li></ul></main></body></html>`;
 const r=observe(s,'https://maker.example/af',html,src(MAKER,'manufacturer'));
 assert.equal(r.productIds.length,0,'similar names are not merged into one identity');
 assert.ok(s.gaps246({scope:'source',refId:r.revisionId}).some(g=>g.kind==='main_product_ambiguous'));
 s.close();
});
