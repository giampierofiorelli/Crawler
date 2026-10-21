/** N1 (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-n1-authorisation-2026-10-21.md; preregistration evaluation/n1/preregistration.json): the relations of teaching
 * tables recovered as ROW CLAIMS, a compatible extension of the phase247 relations in the same store.
 *
 * Why a claim per row (D1, first increment): the translator turned a table row into binary statements anchored on one
 * subject cell, so a row "situation | goal | attribute | measurement | caveat" lost most of its relations (266 of 2,481
 * documented relations survived). Here the row keeps every participant with its column role, the links its table chain
 * asserts, and each condition or caveat attached to the link it qualifies (an n-ary relation, W3C N-ary pattern 1).
 *
 * What a claim is NOT: it carries relevance only (relevant_to, addressed_by, assessed_by, qualified_by, alternative_of);
 * never a cause, a demonstrated result, a ranking input or an exclusion. It is machine-derived and unreviewed until a
 * verified review receipt exists; a review records that the row was read correctly, never that the relation is
 * established (I-8: the request decides what the user wants; reviewed knowledge decides how a function contributes).
 * The schema enforces claim_type='teaching_relevance' and ranking_input=0.
 *
 * Durability (A5): a claim is derived only from immutable inputs (the document bytes, by SHA-256, and the mapping version
 * = vocabulary version + digest), so it can be rebuilt exactly; reviews are journaled with their full receipt and replayed.
 * Projection to phase247 edges (claimEdges247N1) is offered only where both ends are taught items; it writes nothing. */
import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import type {KnowledgeStore246,ReviewReceipt246} from './phase246_knowledge_store.js';
import {parseTeachingDocument,stem} from './knowledge_translation.js';

const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
export const N1_CLAIM_TYPE='teaching_relevance' as const;
export const N1_EPISTEMIC='machine_derived_unreviewed' as const;
export type ColumnRoleN1='situation'|'need'|'function'|'property'|'method'|'evidence'|'condition'|'caveat'|'alternative'|'identifier'|'value'|'other';
export type LinkKindN1='relevant_to'|'addressed_by'|'assessed_by'|'qualified_by'|'alternative_of';
export interface RelationRolesN1 {schema:string;version:string;caveatNegation:string[];cues:Record<string,string[]>;rolePriority:string[];
 identifierHeaders:string[];identifierValue:string;levels:Record<string,number>;linkKinds:Record<string,LinkKindN1>;qualifierRoles:string[];genericHeads?:string[];propertyModifiers?:string[]}
const ROLES_URL=new URL('../../resources/knowledge-translation/relation-roles.v1.json',import.meta.url);
let cached:{lex:RelationRolesN1;mapping:string}|null=null;
export function loadRelationRolesN1(){if(!cached){const src=readFileSync(ROLES_URL,'utf8');const lex=JSON.parse(src) as RelationRolesN1;cached={lex,mapping:`${lex.version}:${sha(src).slice(0,12)}`};}return cached;}

// ---- tables of a teaching document (the translator's own parser: same cleaning, same headings, fenced code skipped)
export interface TeachingTableN1 {headerLine:number;headings:string[];header:string[];rows:{line:number;cells:string[]}[]}
export function teachingTablesN1(md:string):TeachingTableN1[]{
 const out:TeachingTableN1[]=[];let cur:TeachingTableN1|null=null;let last=-1;
 for(const b of parseTeachingDocument(md)){if(b.kind!=='table_row'||!b.cells){cur=null;continue;}
  const header=b.cells.map(c=>c.header);
  if(!cur||b.line!==last+1||JSON.stringify(cur.header)!==JSON.stringify(header)){cur={headerLine:b.line-2,headings:b.headings.filter(Boolean),header,rows:[]};out.push(cur);}
  cur.rows.push({line:b.line,cells:b.cells.map(c=>c.text)});last=b.line;}
 return out;
}

// ---- column roles: the head cue of the header's first cued segment; a negation in that segment makes a caveat
const words=(t:string)=>t.toLowerCase().replace(/[’']/g,"'").match(/[a-z0-9#][a-z0-9'#-]*/g)??[];
function headerRole(h:string,lex:RelationRolesN1):ColumnRoleN1|null{
 // a slash between spaces separates phrases; a slash inside a word pair ("physical/evaluable") joins alternatives of one phrase
 const segments=h.split(/\s\/\s?|\s?\/\s|[,;()–—]|\s+(?:or|and|vs\.?|versus)\s+/i).map(s=>s.trim()).filter(Boolean);
 const generic=new Set(lex.genericHeads??[]);
 // a header coordinating a caveat with another role is a caveat: mixed content qualifies, it asserts no link of its own
 if(segments.length>1&&segments.some(seg=>{const ws=words(seg.replace(/\//g,' '));const st=ws.map(stem);
  return ws.some(w=>lex.caveatNegation.includes(w)||/n't$/.test(w))||lex.cues.caveat.some(c=>{const q=words(c).map(stem);return st.some((_,i)=>q.every((x,k)=>st[i+k]===x));});}))return 'caveat';
 const cueStems=Object.entries(lex.cues).map(([role,ws])=>({role,seqs:ws.map(w=>words(w).map(stem))}));
 for(const seg of segments){const ws=words(seg.replace(/\//g,' '));if(!ws.length)continue;
  if(ws.some(w=>lex.caveatNegation.includes(w)||/n't$/.test(w)))return 'caveat';
  const st=ws.map(stem);let best:{pos:number;prio:number;role:string;at:number}|null=null;
  for(const {role,seqs} of cueStems)for(const seq of seqs)for(let i=0;i+seq.length<=st.length;i++){
   if(!seq.every((x,k)=>st[i+k]===x))continue;
   // a generic head ("Test requirement", "Evidence needed") yields to an earlier cue of the same segment
   const pos=seq.length===1&&generic.has(ws[i])?-1:i+seq.length-1,prio=lex.rolePriority.indexOf(role);
   // the head of an English noun phrase is its last noun: the last cue wins; on the same word, the role priority
   if(!best||pos>best.pos||(pos===best.pos&&prio<best.prio))best={pos,prio,role,at:i+seq.length-1};}
  // a need or a generic head modified by a technical word is a criterion ("technical requirements", "physical/evaluable needs")
  if(best&&(best.role==='need'||generic.has(ws[best.at]))&&ws.slice(0,best.at).some(w=>(lex.propertyModifiers??[]).includes(w)))return 'property';
  if(best)return best.role as ColumnRoleN1;}
 return null;
}
export function columnRolesN1(t:TeachingTableN1,lex=loadRelationRolesN1().lex):ColumnRoleN1[]{
 const code=new RegExp(lex.identifierValue);
 return t.header.map((h,j)=>{
  const vals=t.rows.map(r=>(r.cells[j]??'').trim()).filter(Boolean);
  const codeShare=vals.length?vals.filter(v=>code.test(v)).length/vals.length:0;
  if(codeShare>=0.8||(lex.identifierHeaders.includes(words(h).join(' '))&&vals.every(v=>v.length<=12)))return 'identifier';
  if(vals.length&&vals.every(v=>/^[~≈<>≤≥]?\s*\d[\d.,]*\s*(?:%|[a-zµ°]{0,5})?$/i.test(v)))return 'value';
  return headerRole(h,lex)??'other';});
}

// ---- row claims
export interface ParticipantN1 {col:number;header:string;role:ColumnRoleN1;text:string;textSha256:string}
export interface LinkN1 {from:number;to:number;kind:LinkKindN1;qualifiers:number[]}
export interface RowClaimN1 {claimId:string;categoryId:string;claimType:typeof N1_CLAIM_TYPE;epistemic:'machine_derived_unreviewed'|'reviewed_relevance';
 support:'hypothesis'|'reviewed';mapping:string;
 source:{document:string;sha256:string;headerLine:number;line:number;headings:string[]};
 participants:ParticipantN1[];identifierColumns:number[];links:LinkN1[];review?:ReviewReceipt246|null}
export interface ClaimSourceN1 {categoryId:string;document:string;sha256:string}

/** The links one row asserts: each participant links to the participants of the next level its table has (situation ->
 * need -> function/property -> method/evidence); a condition or caveat qualifies the link whose target is the nearest
 * column to its left (or the link that spans it). Empty cells take no part. */
export function rowLinksN1(roles:readonly ColumnRoleN1[],cells:readonly string[],lex=loadRelationRolesN1().lex):{links:LinkN1[];identifierColumns:number[]}{
 const part=roles.map((r,j)=>({j,r,lv:lex.levels[r]})).filter(x=>x.lv!==undefined&&(cells[x.j]??'').trim());
 // a need interprets the situation of its row: the situation stays a participant and the links start at the need
 const hasNeed=part.some(p=>p.r==='need');
 const levels=[...new Set(part.filter(p=>!(hasNeed&&p.r==='situation')).map(p=>p.lv))].sort((a,b)=>a-b);const links:LinkN1[]=[];
 for(let i=0;i+1<levels.length;i++)for(const x of part.filter(p=>p.lv===levels[i]))for(const y of part.filter(p=>p.lv===levels[i+1]))
  links.push({from:x.j,to:y.j,kind:lex.linkKinds[y.r],qualifiers:[]});
 if(links.length)for(let q=0;q<roles.length;q++){if(!lex.qualifierRoles.includes(roles[q])||!(cells[q]??'').trim())continue;
  // the link that spans the qualifier column, else the row's first (principal) link
  const span=links.find(l=>Math.min(l.from,l.to)<q&&q<Math.max(l.from,l.to));(span??links[0]).qualifiers.push(q);}
 const lowest=part.sort((a,b)=>a.lv-b.lv||a.j-b.j)[0];
 return {links,identifierColumns:links.length&&lowest?[lowest.j]:[]};
}
/** A table states relations when it has a situation or need column and a column of a later level. */
export const relationTableN1=(roles:readonly ColumnRoleN1[])=>roles.some(r=>r==='situation'||r==='need')&&roles.some(r=>['function','property','alternative','method','evidence'].includes(r));

export function deriveClaimsN1(md:string,src:ClaimSourceN1):RowClaimN1[]{
 const {lex,mapping}=loadRelationRolesN1();const out:RowClaimN1[]=[];
 for(const t of teachingTablesN1(md)){const roles=columnRolesN1(t,lex);if(!relationTableN1(roles))continue;
  for(const r of t.rows){const {links,identifierColumns}=rowLinksN1(roles,r.cells,lex);if(!links.length)continue;
   const used=new Set([...identifierColumns,...links.flatMap(l=>[l.from,l.to,...l.qualifiers])]);
   const participants=[...used].sort((a,b)=>a-b).map(j=>{const text=(r.cells[j]??'').trim().slice(0,600);return {col:j,header:t.header[j]??'',role:roles[j],text,textSha256:sha(text)};});
   out.push({claimId:'clm_'+sha([src.categoryId,src.sha256,r.line,mapping].join('|')).slice(0,24),categoryId:src.categoryId,claimType:N1_CLAIM_TYPE,epistemic:N1_EPISTEMIC,
    support:'hypothesis',mapping,source:{document:src.document,sha256:src.sha256,headerLine:t.headerLine,line:r.line,headings:t.headings.slice(-2)},
    participants,identifierColumns,links});}}
 return out;
}

// ---- store (table relation_claims_n1, store v14)
// the journal keeps payloads with sorted keys, so a receipt is compared key-order independent
const sorted=(v:unknown):unknown=>Array.isArray(v)?v.map(sorted):v&&typeof v==='object'?Object.fromEntries(Object.keys(v as object).sort().map(k=>[k,sorted((v as Record<string,unknown>)[k])])):v;
const canon=(c:RowClaimN1)=>JSON.stringify([c.claimId,c.categoryId,c.claimType,c.epistemic,c.support,c.mapping,c.source,c.participants,c.identifierColumns,c.links,sorted(c.review??null)]);
export function recordClaimsN1(store:KnowledgeStore246,t:ClaimSourceN1&{claims:readonly RowClaimN1[]},o:{at?:string}={}):{recorded:number;superseded:number}{
 if(!/^[a-z][a-z0-9_]{0,79}$/.test(t.categoryId)||!/^[0-9a-f]{64}$/.test(t.sha256))throw Error('n1_invalid_input');
 const {mapping}=loadRelationRolesN1();const at=o.at??new Date().toISOString();
 for(const c of t.claims)if(c.categoryId!==t.categoryId||c.source.sha256!==t.sha256||c.mapping!==mapping||c.claimType!==N1_CLAIM_TYPE)throw Error('n1_claim_does_not_match_source');
 store.db.exec('BEGIN IMMEDIATE');
 try{
  const superseded=Number(store.db.prepare("UPDATE relation_claims_n1 SET state='superseded' WHERE category_id=? AND source_document=? AND (mapping<>? OR source_sha256<>?) AND state='current'")
   .run(t.categoryId,t.document,mapping,t.sha256).changes);
  const ins=store.db.prepare(`INSERT OR IGNORE INTO relation_claims_n1(claim_id,category_id,source_document,source_sha256,header_line,line,headings_json,participants_json,
   identifier_columns_json,links_json,mapping,claim_type,support,epistemic,state,recorded_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'hypothesis','machine_derived_unreviewed','current',?)`);
  let recorded=0;
  for(const c of t.claims)recorded+=Number(ins.run(c.claimId,c.categoryId,t.document,t.sha256,c.source.headerLine,c.source.line,JSON.stringify(c.source.headings),
   JSON.stringify(c.participants),JSON.stringify(c.identifierColumns),JSON.stringify(c.links),mapping,N1_CLAIM_TYPE,at).changes);
  const digest=sha(t.claims.map(canon).sort().join('\n'));
  store.event('relation_claims_recorded',{categoryId:t.categoryId,sourceDocument:t.document,sourceSha256:t.sha256,mapping,claims:t.claims.length,recorded,superseded,digest},at);
  store.invalidate(['category:'+t.categoryId],'relation_claims_recorded');
  store.db.exec('COMMIT');return {recorded,superseded};
 }catch(e){store.db.exec('ROLLBACK');throw e;}
}
const parse=(r:Record<string,unknown>):RowClaimN1=>({claimId:String(r.claim_id),categoryId:String(r.category_id),claimType:N1_CLAIM_TYPE,
 epistemic:r.epistemic as RowClaimN1['epistemic'],support:r.support as RowClaimN1['support'],mapping:String(r.mapping),
 source:{document:String(r.source_document),sha256:String(r.source_sha256),headerLine:Number(r.header_line),line:Number(r.line),headings:JSON.parse(String(r.headings_json))},
 participants:JSON.parse(String(r.participants_json)),identifierColumns:JSON.parse(String(r.identifier_columns_json)),links:JSON.parse(String(r.links_json)),
 review:r.review_json?JSON.parse(String(r.review_json)):null});
/** Current claims of a category (or of every category). */
export function claimsOfN1(store:KnowledgeStore246,categoryId:string|null=null):RowClaimN1[]{
 if(store.schemaVersion()<14)return [];
 const rows=(categoryId?store.db.prepare("SELECT * FROM relation_claims_n1 WHERE category_id=? AND state='current' ORDER BY source_document,line,claim_id").all(categoryId)
  :store.db.prepare("SELECT * FROM relation_claims_n1 WHERE state='current' ORDER BY category_id,source_document,line,claim_id").all()) as Record<string,unknown>[];
 return rows.map(parse);
}
/** A verified review says the row was read correctly; it never makes relevance a result. The journal keeps the receipt. */
export function reviewClaimN1(store:KnowledgeStore246,claimId:string,receipt:ReviewReceipt246,verify:(r:ReviewReceipt246)=>boolean):void{
 const row=store.db.prepare("SELECT category_id FROM relation_claims_n1 WHERE claim_id=? AND state='current'").get(claimId) as {category_id:string}|undefined;
 if(!row)throw Error('n1_unknown_claim');if(!verify||!verify(receipt))throw Error('246_review_not_verified');
 store.db.exec('BEGIN IMMEDIATE');
 try{store.db.prepare("UPDATE relation_claims_n1 SET support='reviewed',epistemic='reviewed_relevance',review_json=? WHERE claim_id=?").run(JSON.stringify(receipt),claimId);
  store.event('relation_claim_reviewed',{claimId,receipt},receipt.reviewedAt);store.invalidate(['category:'+row.category_id],'relation_claim_reviewed');store.db.exec('COMMIT');
 }catch(e){store.db.exec('ROLLBACK');throw e;}
}
/** A5: rebuild the claims of the given documents from their bytes and the current mapping, replay the journaled reviews,
 * and compare with the stored current claims of those documents (canonical equality). Writes nothing. */
export function rebuildCheckN1(store:KnowledgeStore246,docs:readonly (ClaimSourceN1&{md:string})[]){
 const reviews=new Map<string,ReviewReceipt246>();
 for(const e of store.db.prepare("SELECT payload_json FROM events WHERE kind='relation_claim_reviewed' ORDER BY seq").all() as {payload_json:string}[]){const p=JSON.parse(e.payload_json);reviews.set(p.claimId,p.receipt);}
 const shaMismatch=docs.filter(d=>sha(d.md)!==d.sha256).map(d=>d.document);
 const rebuilt=new Map<string,string>();let reviewsReplayed=0;
 for(const d of docs)for(const c of deriveClaimsN1(d.md,{categoryId:d.categoryId,document:d.document,sha256:sha(d.md)})){
  const r=reviews.get(c.claimId);const x=r?{...c,support:'reviewed' as const,epistemic:'reviewed_relevance' as const,review:r}:{...c,review:null};if(r)reviewsReplayed++;
  rebuilt.set(c.claimId,canon(x));}
 const stored=new Map<string,string>();
 for(const d of docs)for(const c of claimsOfN1(store,d.categoryId).filter(c=>c.source.document===d.document))stored.set(c.claimId,canon(c));
 const missing=[...stored.keys()].filter(k=>!rebuilt.has(k)),extra=[...rebuilt.keys()].filter(k=>!stored.has(k)),changed=[...stored.keys()].filter(k=>rebuilt.has(k)&&rebuilt.get(k)!==stored.get(k));
 return {equal:!shaMismatch.length&&!missing.length&&!extra.length&&!changed.length,stored:stored.size,rebuilt:rebuilt.size,missing,extra,changed,shaMismatch,reviewsReplayed};
}

/** Projection to phase247 edges where both ends align to taught items (alignment supplied by the caller): assessed_by ->
 * measured_by (measurement -> what it measures), addressed_by -> may_support (function -> need). relevant_to,
 * qualified_by and alternative_of have no phase247 slot. Always 'hypothesis': a claim review is not a relation review. */
export function claimEdges247N1(c:RowClaimN1,align:(text:string)=>string|null){
 const text=(j:number)=>c.participants.find(p=>p.col===j)?.text??'';const out:{from:string;to:string;kind:'measured_by'|'may_support';support:'hypothesis';qualifierColumns:number[]}[]=[];
 for(const l of c.links){const kind=l.kind==='assessed_by'?'measured_by':l.kind==='addressed_by'?'may_support':null;if(!kind)continue;
  const a=align(text(l.to)),b=align(text(l.from));if(a&&b&&a!==b)out.push({from:a,to:b,kind,support:'hypothesis',qualifierColumns:[...l.qualifiers]});}
 return out;
}
