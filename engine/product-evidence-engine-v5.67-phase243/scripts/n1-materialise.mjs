#!/usr/bin/env node
/** N1 L2 (preregistration evaluation/n1/preregistration.json): derives the row claims of every translated teaching document
 * (the documents whose statements the store holds, matched by SHA-256) onto a STORE COPY, and checks durability:
 *  - rebuild from the immutable document bytes equals the stored projection (canonical equality, reviews replayed);
 *  - idempotent re-run (nothing new) and duplicate input (the same document offered twice records it once);
 *  - partial failure: a write that fails validation leaves the store unchanged (transaction);
 *  - phase247 relations, relation assessments and translated statements unchanged; journal chain intact;
 *  - representation comparison: (1) phase247 edges only, (2) row claims, (3) claims + projections.
 * Never opens the live store for writing. Private output: per-claim detail. Public output: counts only.
 * Usage: node scripts/n1-materialise.mjs --packages DIR --base STORE_COPY --work NEW_STORE_COPY --private OUT --public OUT */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {deriveClaimsN1,recordClaimsN1,claimsOfN1,rebuildCheckN1,claimEdges247N1,loadRelationRolesN1} from '../dist/src/relation_claims_n1.js';
import {identifyConcept} from '../dist/src/knowledge_translation.js';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
for(const k of ['packages','base','work','private','public'])if(!arg(k))throw Error('missing --'+k);
for(const f of [arg('work'),arg('private'),arg('public')])if(fs.existsSync(f))throw Error(f+' exists: never overwritten');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(path.resolve(arg('work'))))throw Error('refusing to write the live store');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
fs.copyFileSync(arg('base'),arg('work'));
const files=[];(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.md'))files.push(p);}})(arg('packages'));
const bySha=new Map();for(const f of files.sort()){const md=fs.readFileSync(f,'utf8');const h=sha(md);if(!bySha.has(h))bySha.set(h,{md,file:path.relative(arg('packages'),f)});}
const s=new KnowledgeStore246(arg('work'));
const count=t=>Number(s.db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n);
const before={category_relations:count('category_relations'),relation_assessments:count('relation_assessments'),knowledge_statements:count('knowledge_statements'),category_items:count('category_items')};
const docs=s.db.prepare("SELECT DISTINCT category_id c,source_document d,source_sha256 h FROM knowledge_statements WHERE state='current' ORDER BY c,d").all();
const at='2026-10-21T12:00:00.000Z';const inputs=[];const perDoc=[];
for(const d of docs){const local=bySha.get(d.h);if(!local){perDoc.push({category:d.c,document:path.basename(d.d),local:false});continue;}
 const src={categoryId:d.c,document:d.d,sha256:d.h};const claims=deriveClaimsN1(local.md,src);
 const r=recordClaimsN1(s,{...src,claims},{at});inputs.push({...src,md:local.md});perDoc.push({category:d.c,document:path.basename(d.d),local:true,claims:claims.length,recorded:r.recorded});}
// idempotent re-run and duplicate input
let rerun=0;for(const i of inputs)rerun+=recordClaimsN1(s,{...i,claims:deriveClaimsN1(i.md,i)},{at}).recorded;
const dup=inputs[0]?recordClaimsN1(s,{...inputs[0],claims:[...deriveClaimsN1(inputs[0].md,inputs[0]),...deriveClaimsN1(inputs[0].md,inputs[0])]},{at}).recorded:0;
// partial failure: one claim that does not match its source aborts the whole write
const n0=count('relation_claims_n1');const e0=count('events');let refused=null;
if(inputs[0]){const cs=deriveClaimsN1(inputs[0].md,inputs[0]);const bad=[...cs.slice(0,3).map(c=>({...c,claimId:c.claimId+'x'})),{...cs[0],categoryId:'other_category'}];
 try{recordClaimsN1(s,{...inputs[0],claims:bad},{at});}catch(e){refused=String(e.message);}}
const partial={refused,rowsUnchanged:count('relation_claims_n1')===n0,eventsUnchanged:count('events')===e0};
const rebuild=rebuildCheckN1(s,inputs);
const after={category_relations:count('category_relations'),relation_assessments:count('relation_assessments'),knowledge_statements:count('knowledge_statements'),category_items:count('category_items')};
const journal=s.verifyJournal();
// representation comparison
const claims=claimsOfN1(s);const items=new Map();
const itemsOf=c=>{if(!items.has(c))items.set(c,s.categoryItems246(c).filter(i=>i.concept).map(i=>({id:'item:'+i.itemId,aliases:i.concept.aliases,statement:i.statement})));return items.get(c);};
const rep={rows:claims.length,links:0,linksByKind:{},qualifiersOnLinks:0,participants:0,
 edgesOnly:{linksWithAPhase247Kind:0,linksWithBothEndsTaughtItems:0,rowsFullyRepresentable:0,qualifiersRepresentable:0,qualifierAttachmentsLost:0},
 claimBundle:{rowsRoundTripExact:rebuild.equal?rebuild.rebuilt:rebuild.rebuilt-rebuild.changed.length-rebuild.missing.length,qualifiersLost:0},
 both:{projectedEdges:0}};
const detail=[];
for(const c of claims){const align=t=>identifyConcept(t,itemsOf(c.categoryId));const edges=claimEdges247N1(c,align);rep.both.projectedEdges+=edges.length;
 rep.links+=c.links.length;rep.participants+=c.participants.length;let full=true;
 for(const l of c.links){rep.linksByKind[l.kind]=(rep.linksByKind[l.kind]??0)+1;rep.qualifiersOnLinks+=l.qualifiers.length;
  const slot=l.kind==='assessed_by'||l.kind==='addressed_by';if(slot)rep.edgesOnly.linksWithAPhase247Kind++;
  const t=j=>c.participants.find(p=>p.col===j)?.text??'';const both=slot&&!!align(t(l.from))&&!!align(t(l.to));
  if(both){rep.edgesOnly.linksWithBothEndsTaughtItems++;rep.edgesOnly.qualifiersRepresentable+=l.qualifiers.length;}else{full=false;rep.edgesOnly.qualifierAttachmentsLost+=l.qualifiers.length;}}
 if(full)rep.edgesOnly.rowsFullyRepresentable++;
 detail.push({claimId:c.claimId,category:c.categoryId,document:c.source.document,line:c.source.line,links:c.links,roles:c.participants.map(p=>[p.col,p.role]),edges});}
const perCategory={};for(const c of claims){const o=perCategory[c.categoryId]??={claims:0,links:0};o.claims++;o.links+=c.links.length;}
fs.mkdirSync(path.dirname(arg('private')),{recursive:true});fs.writeFileSync(arg('private'),JSON.stringify({schema:'pee.n1.materialise-detail.v1',detail},null,0));
const pub={schema:'pee.n1.materialise.v1',mapping:loadRelationRolesN1().mapping,storeBaseSha256:sha(fs.readFileSync(arg('base'))),schemaVersion:s.schemaVersion(),documents:perDoc,perCategory,
 durability:{rebuild:{equal:rebuild.equal,stored:rebuild.stored,rebuilt:rebuild.rebuilt,missing:rebuild.missing.length,extra:rebuild.extra.length,changed:rebuild.changed.length,shaMismatch:rebuild.shaMismatch.length},
  rerunRecorded:rerun,duplicateInputRecorded:dup,partialFailure:partial,unchanged:Object.fromEntries(Object.keys(before).map(k=>[k,before[k]===after[k]])),journal},
 representation:rep};
fs.writeFileSync(arg('public'),JSON.stringify(pub,null,1)+'\n');console.log(JSON.stringify({perCategory,durability:pub.durability,representation:rep},null,1));
