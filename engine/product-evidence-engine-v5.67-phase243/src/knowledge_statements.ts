/** S78: translated teaching statements in the knowledge store (table knowledge_statements, store v10).
 *
 * What the relational category graph cannot hold (applicability and scope, the document's status labels, hedges,
 * negation, causal and method statements, typed subjects and objects) is kept per statement with provenance (document
 * hash and line, never the quote), the translator version and the measured reliability of its statement type
 * (resources/knowledge-translation/statement-type-reliability.json). Rows are machine translated and unreviewed: the
 * schema forbids them as ranking inputs. Consumers read them as labelled caveats; conflicts (the same relation asserted
 * and denied) are derived on reading, never resolved silently. */
import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import type {TranslatedStatement,TypedSpan} from './knowledge_translation.js';

const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
export interface TypeReliability {version:string;types:Record<string,{n:number;bad:number;class:'reliable_type'|'unreliable_type'}>}
export function loadTypeReliability(r?:TypeReliability):TypeReliability{
 return r??JSON.parse(readFileSync(new URL('../../resources/knowledge-translation/statement-type-reliability.json',import.meta.url),'utf8')) as TypeReliability;}
export const reliabilityOf=(rel:TypeReliability,type:string)=>rel.types[type]?.class??'unmeasured_type';

export interface StoredStatement {statementId:string;categoryId:string;sourceDocument:string;line:number;headings:string[];type:string;
 polarity:'positive'|'negative';hedge:string|null;status:string[];scope:string[];subject:TypedSpan|null;object:TypedSpan|null;parts:TypedSpan[];
 rendered:string;selfCheck:string[];translator:string;reliability:'reliable_type'|'unreliable_type'|'unmeasured_type'}

/** Records one document's translation (idempotent). Rows of the same document from another translator are superseded,
 * so re-translating with a corrected translator replaces, never duplicates. Statements whose render-back self-check
 * failed are not recorded (the rendering lost something the quote says). Returns counts. */
export function recordTranslation(store:KnowledgeStore246,t:{categoryId:string;sourceDocument:string;sourceSha256:string;translator:string;
 statements:readonly TranslatedStatement[];scopes?:ReadonlyMap<string,string[]>},opts:{reliability?:TypeReliability;at?:string}={}):{recorded:number;superseded:number;skippedSelfCheck:number}{
 if(!/^[a-z][a-z0-9_]{0,79}$/.test(t.categoryId)||!/^[0-9a-f]{64}$/.test(t.sourceSha256)||!t.translator)throw Error('ks_invalid_input');
 const rel=loadTypeReliability(opts.reliability);const at=opts.at??new Date().toISOString();let recorded=0,skipped=0;
 store.db.exec('BEGIN IMMEDIATE');
 try{
  const superseded=Number(store.db.prepare("UPDATE knowledge_statements SET state='superseded_by_translator' WHERE category_id=? AND source_document=? AND translator<>? AND state='current'")
   .run(t.categoryId,t.sourceDocument,t.translator).changes);
  const ins=store.db.prepare(`INSERT OR IGNORE INTO knowledge_statements(statement_id,category_id,source_document,source_sha256,line,headings_json,type,polarity,hedge,
   status_json,scope_json,subject_json,object_json,parts_json,rendered,quote_sha256,self_check_json,translator,reliability,state,recorded_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'current',?)`);
  for(const s of t.statements){if(s.selfCheck.length){skipped++;continue;}
   const id='kst_'+sha([t.categoryId,t.sourceSha256,s.provenance.line,s.type,s.polarity,s.rendered,t.translator].join('|')).slice(0,24);
   const r=ins.run(id,t.categoryId,t.sourceDocument,t.sourceSha256,s.provenance.line,JSON.stringify(s.provenance.headings),s.type,s.polarity,s.hedge,
    JSON.stringify(s.status),JSON.stringify(t.scopes?.get(s.id)??[]),s.subject?JSON.stringify(s.subject):null,s.object?JSON.stringify(s.object):null,JSON.stringify(s.parts),
    s.rendered.slice(0,600),sha(s.quote),JSON.stringify(s.selfCheck),t.translator,reliabilityOf(rel,s.type),at);
   recorded+=Number(r.changes);}
  store.event('knowledge_statements_recorded',{categoryId:t.categoryId,sourceDocument:t.sourceDocument,sourceSha256:t.sourceSha256,translator:t.translator,recorded,superseded,skippedSelfCheck:skipped},at);
  store.invalidate(['category:'+t.categoryId],'knowledge_statements_recorded');
  store.db.exec('COMMIT');
  return {recorded,superseded,skippedSelfCheck:skipped};
 }catch(e){store.db.exec('ROLLBACK');throw e;}
}

const parse=(r:Record<string,unknown>):StoredStatement=>({statementId:String(r.statement_id),categoryId:String(r.category_id),sourceDocument:String(r.source_document),line:Number(r.line),
 headings:JSON.parse(String(r.headings_json)),type:String(r.type),polarity:r.polarity as StoredStatement['polarity'],hedge:(r.hedge as string|null)??null,status:JSON.parse(String(r.status_json)),
 scope:JSON.parse(String(r.scope_json)),subject:r.subject_json?JSON.parse(String(r.subject_json)):null,object:r.object_json?JSON.parse(String(r.object_json)):null,
 parts:JSON.parse(String(r.parts_json)),rendered:String(r.rendered),selfCheck:JSON.parse(String(r.self_check_json)),translator:String(r.translator),reliability:r.reliability as StoredStatement['reliability']});

/** Current statements of a category, optionally of given types and only of reliable types. */
export function statementsOf(store:KnowledgeStore246,categoryId:string,o:{types?:readonly string[];reliableOnly?:boolean}={}):StoredStatement[]{
 const rows=store.db.prepare("SELECT * FROM knowledge_statements WHERE category_id=? AND state='current' ORDER BY source_document,line,statement_id").all(categoryId) as Record<string,unknown>[];
 return rows.map(parse).filter(s=>(!o.types||o.types.includes(s.type))&&(!o.reliableOnly||s.reliability==='reliable_type'));
}
/** Statements whose typed subject or object names a taught concept (by id, as typed at translation). */
export function statementsAbout(store:KnowledgeStore246,categoryId:string,conceptId:string,o:{types?:readonly string[];reliableOnly?:boolean;subjectOnly?:boolean}={}):StoredStatement[]{
 return statementsOf(store,categoryId,o).filter(s=>(o.subjectOnly?[s.subject]:[s.subject,s.object,...s.parts]).some(x=>x?.concepts.includes(conceptId)));
}
/** S78: caveats about a concept that may be shown to a consumer: reliable statement types that warn or delimit
 * (limitation, not_sufficient, is_not), with the concept as the statement's SUBJECT (blind relevance check of 40
 * concept-statement links: any position 30 applies / 2 misleading; subject only 12 of 16 apply, 0 misleading;
 * evaluation/s78/caveat-link.json), one per distinct rendering. */
export const CAVEAT_TYPES=['limitation','not_sufficient','is_not'] as const;
export function caveatsAbout(store:KnowledgeStore246,categoryId:string,conceptId:string,max=3):StoredStatement[]{
 // the most faithful types first (blind fidelity: not_sufficient 95%, is_not 100%, limitation 78%), then document order
 const order=(t:string)=>t==='not_sufficient'?0:t==='is_not'?1:2;
 const seen=new Set<string>();return statementsAbout(store,categoryId,conceptId,{types:CAVEAT_TYPES,reliableOnly:true,subjectOnly:true})
  .filter(s=>!seen.has(s.rendered)&&seen.add(s.rendered)).sort((a,b)=>order(a.type)-order(b.type)).slice(0,max);
}
const norm=(t:string|undefined)=>(t??'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
/** Conflicts: the same relation (type, subject, object) asserted in one statement and denied in another. */
export function statementConflicts(statements:readonly StoredStatement[]):{a:StoredStatement;b:StoredStatement}[]{
 const by=new Map<string,StoredStatement[]>();for(const s of statements){if(!s.subject||!s.object)continue;const k=[s.type,norm(s.subject.text),norm(s.object.text)].join('|');by.set(k,[...(by.get(k)??[]),s]);}
 const out:{a:StoredStatement;b:StoredStatement}[]=[];
 for(const g of by.values())for(const a of g)for(const b of g)if(a.statementId<b.statementId&&a.polarity!==b.polarity)out.push({a,b});
 return out;
}
