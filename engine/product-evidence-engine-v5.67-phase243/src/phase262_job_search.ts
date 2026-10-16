/**
 * Phase262 — typed research-job → general-search connection (capability B: candidate publishers and documents that
 * PEE did not know), on the EXISTING Phase223 adapter:
 *   genuine job → Phase261 discovery target → bounded deterministic queries (this file) → searchWithPlan223 (Phase223:
 *   robots check, provider JSON, URL safety, de-duplication) → candidate URLs → classification against the store.
 *
 * Four states are kept apart and reported: the adapter exists; a provider is configured AND its use permitted; a real
 * search found previously unknown sources; those sources gave verified, useful evidence. Today only the first holds.
 *
 * Queries contain only retained product identity (exact identifiers, brand, product name when no identifier exists),
 * the category and the criterion, never user text. Query words are English; identifiers are language-neutral. The
 * provider's result-language filter is a Phase223 configuration, distinct from source language, publisher country,
 * product market and specialist competence; nothing here claims to understand a non-English document.
 * A candidate is a lead: unknown identity stays unknown (Phase261 exact-identifier rule), no source is registered,
 * nothing is retrieved, retained, admitted or ranked, and no source is trusted because a search returned it.
 */
import {searchWithPlan223,type SearchConfig223,type PlannedSearch223} from './phase223_search_discovery.js';
import type {SourceTransport} from './approved_web_reader.js';
import {attributeUrl261,type DiscoveryTarget261,type Attribution261} from './phase261_discovery_bridge.js';
import type {ResearchPolicy257} from './phase257_research_planning.js';
import type {SourceRole258} from './phase258_source_contributions.js';
import {SPEC_CRITERIA249} from './phase249_decision.js';
import {normalizeDiscoveryUrl192} from './phase192_lineage_marketplace_screen.js';
import {SPEC_EXTRACTOR_VERSION} from './phase245_spec_extraction.js';
import {IDENTITY_RULES246,VALUE_RETAINING246,type KnowledgeStore246,type RetentionClass246} from './phase246_knowledge_store.js';

const fail=(m:string):never=>{throw Error('phase262_'+m);};
// Same normalisation as Phase223 query text.
const norm=(s:string)=>s.normalize('NFKD').toLowerCase().replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');

/** What a query looks for; only the distinctions existing job kinds justify. */
export type QueryPurpose262='declared_specification'|'manufacturer_documentation'|'performance_measurement'|'practical_test'|'test_method'|'expert_evaluation';
const DIMENSION_WORDS:Record<string,string>={volume:'capacity',length:'dimensions',mass:'weight',power:'power watts',price:'price',duration:'battery life'};
const criterionWords=(c:string|null)=>!c?'':SPEC_CRITERIA249[c]?DIMENSION_WORDS[SPEC_CRITERIA249[c].dimension]??c.replace(/_(?:min|max)$/,'').replace(/_/g,' '):c.replace(/_/g,' ');

export interface JobSearchPlan262 {
 schema:'pee262.job-search-plan.v1';targetId:string;jobId:string;
 queries:{query:string;purpose:QueryPurpose262;usesExactIdentifier:boolean}[];
 /** Handed unchanged to Phase223's searchWithPlan223. */
 plan:PlannedSearch223;
 queryWordsLanguage:'en';languageNeutralTerms:string[];userTextSent:false;
 /** Purposes later research may need that no current job field can drive. */
 notYetExpressible:readonly string[];
}
/** Deterministic, bounded queries from a genuine target. The product name is used only when no exact identifier
 * exists, and then the identity of whatever is found stays unresolved. */
export function planJobSearch262(target:DiscoveryTarget261,ctx:{store?:KnowledgeStore246|null;maxQueries?:number}={}):JobSearchPlan262{
 if(target?.schema!=='pee261.discovery-target.v1')fail('invalid_target');
 const max=ctx.maxQueries??2;if(!Number.isInteger(max)||max<1||max>3)fail('invalid_budget');
 const j=target.job;const cat=norm(j.categoryId.replace(/_/g,' '));const crit=norm(criterionWords(j.criterion));
 let brand='',name='';
 if(j.productId&&ctx.store){const p=ctx.store.db.prepare('SELECT brand,name FROM products WHERE product_id=?').get(j.productId) as {brand:string|null;name:string|null}|undefined;
  brand=norm(p?.brand??'');name=norm(p?.name??'').split(' ').slice(0,8).join(' ');}
 // Identifiers are compared in canonical form (a GTIN padded to 14 digits) but searched in declared form: a padded
 // GTIN-14 is written without its padding zeros (keeping at least 12 digits), as pages and indexes carry it.
 const raw=target.subject.knownIdentifiers[0]??null;
 const id=raw&&/^\d{14}$/.test(raw)?raw.replace(/^0+/,'').padStart(12,'0'):raw;
 const exact=!!id;
 const subject=norm(exact?`${brand} ${id}`:(name?(name.startsWith(brand)?name:`${brand} ${name}`):`${brand} ${cat}`));
 const q:{query:string;purpose:QueryPurpose262;usesExactIdentifier:boolean}[]=[];
 const add=(text:string,purpose:QueryPurpose262,usesId:boolean)=>{const t=norm(text).slice(0,200).trim();if(t&&!q.some(x=>x.query===t))q.push({query:t,purpose,usesExactIdentifier:usesId});};
 const kind=j.gapKind;
 if(kind==='missing_declaration'||kind==='declaration_conflict'||kind==='missing_product'||kind==='need_review'){
  add(`${subject} ${crit} specifications`,'declared_specification',exact);add(`${subject} user manual`,'manufacturer_documentation',exact);
 }else if(kind==='missing_test'){
  add(`${subject} ${crit} measured test`,'performance_measurement',exact);add(`${subject} hands on review tested`,'practical_test',exact);
 }else if(kind==='missing_criterion'){
  add(`${cat} ${crit} test method`,'test_method',false);add(`${cat} ${crit} expert evaluation`,'expert_evaluation',false);
 }else fail('unsupported_gap_kind');
 const queries=q.slice(0,max);
 return {schema:'pee262.job-search-plan.v1',targetId:target.targetId,jobId:j.jobId,queries,
  plan:{key:target.targetId,status:'typed_research_job',queries:queries.map(x=>x.query)},
  queryWordsLanguage:'en',languageNeutralTerms:target.subject.knownIdentifiers,userTextSent:false,
  notYetExpressible:['evidence_challenging_an_existing_conclusion','test_conditions','assessor_expertise','cultural_tradition','non_english_query_terms']};
}

/** Phase263: the publisher (host) and the document are different things. A familiar host says nothing about what a new
 * document on it is: the document's evidentiary role stays unknown until the document itself is reviewed, and the
 * publisher's canonical type is reported only as context, with its basis. */
export interface SearchCandidate262 {
 url:string;host:string;jobId:string;purpose:QueryPurpose262|null;
 publisher:{recognition:'recognised_publisher'|'unrecognised_domain';canonicalSourceId:string|null;
  /** Context only, never the document's role; 'heuristic_unverified' types were inferred (Phase253). */
  canonicalSourceType:string|null;sourceTypeBasis:string|null};
 documentRole:Extract<SourceRole258,'role_unknown'>;attribution:Attribution261;origin:'synthetic_fixture'|'live';genuineDiscovery:false;
 /** Everything a later step needs to judge, verify or reuse this lead. */
 lead:{channel:'general_search';provider:string;query:string|null;queryIndex:number|null;
  requirement:{jobId:string;gapKind:string;criterion:string|null};
  access:{pageRetrieval:'not_authorised';rights:'unreviewed';robots:'unknown'};
  originality:'unknown';duplication:'none_detected_by_url';revision:{revisionId:null;contentSha256:null};
  verificationRequired:readonly ('product_identity'|'document_role'|'originality'|'access_rights'|'method')[]};
 stages:{candidateUrlDiscovered:true;publisherRecognised:boolean;documentRegistered:false;metadataDiscoveryAllowed:false;pageRetrievalPermitted:false;
  factualInformationRetained:false;independentEvidenceVerified:false;recommendationAuthorized:false};
}
export interface JobSearch262 {
 schema:'pee262.job-search.v1';jobId:string;targetId:string;mode:'synthetic_fixture'|'live';provider:string;
 status:'candidates_found'|'nothing_found'|'blocked_live_reads_disabled'|'provider_not_usable';
 queries:JobSearchPlan262['queries'];reasonCodes:readonly string[];
 candidates:SearchCandidate262[];rejected:{url:string;reason:'already_observed'|'host_restricted'|'url_names_other_model'}[];
 cost:{requests:number;searchRequests:number;robotsRequests:number;liveNetworkCalls:0};
 capabilityStates:{adapterExists:true;providerConfiguredAndPermitted:false;realDiscoveryDemonstrated:false;verifiedUsefulEvidence:false};
 rankingAuthorized:false;evidenceAdmitted:false;sourcePermissionsGranted:false;
}
/** Phase263: the search provider is a parameter. Any provider returns leads for a provider-neutral plan; Phase223's
 * SearXNG adapter (robots check, JSON parsing, URL safety) is the default. */
export type SearchProvider262=(a:{plan:PlannedSearch223;mode:'synthetic_fixture';fixtureTransport:SourceTransport})=>
 Promise<{candidates:readonly {url:string;queryIndex?:number}[];networkRequests:readonly string[];reasonCodes:readonly string[]}>;
const searxng223=(config:SearchConfig223):SearchProvider262=>a=>searchWithPlan223({plan:a.plan,config,mode:a.mode,fixtureTransport:a.fixtureTransport});

/** Runs a typed job search. Live mode is refused while the operator research policy disables reads (Phase257 always);
 * a provider configuration or a valid job id is never permission by itself. */
export async function searchForTarget262(a:{target:DiscoveryTarget261;plan:JobSearchPlan262;config:SearchConfig223;researchPolicy:ResearchPolicy257;
 mode:'synthetic_fixture'|'live';fixtureTransport?:SourceTransport;store?:KnowledgeStore246|null;provider?:{id:string;run:SearchProvider262}}):Promise<JobSearch262>{
 const t=a.target;if(a.plan?.targetId!==t?.targetId)fail('plan_target_mismatch');
 if(a.researchPolicy?.market!==t.market)fail('market_mismatch');
 if(!a.researchPolicy.categories.includes(t.job.categoryId))fail('category_not_in_policy');
 const provider=a.provider??{id:'searxng_phase223',run:searxng223(a.config)};
 if(!/^[a-z][a-z0-9_]{1,60}$/.test(provider.id)||typeof provider.run!=='function')fail('invalid_provider');
 const base:JobSearch262={schema:'pee262.job-search.v1',jobId:t.job.jobId,targetId:t.targetId,mode:a.mode,provider:provider.id,status:'nothing_found',queries:a.plan.queries,reasonCodes:[],
  candidates:[],rejected:[],cost:{requests:0,searchRequests:0,robotsRequests:0,liveNetworkCalls:0},
  capabilityStates:{adapterExists:true,providerConfiguredAndPermitted:false,realDiscoveryDemonstrated:false,verifiedUsefulEvidence:false},
  rankingAuthorized:false,evidenceAdmitted:false,sourcePermissionsGranted:false};
 if(a.mode==='live'){
  if((a.researchPolicy as {allowSourceReads:boolean}).allowSourceReads!==true)return {...base,status:'blocked_live_reads_disabled',reasonCodes:['live_reads_disabled_by_research_policy']};
  fail('live_mode_not_implemented');
 }
 if(a.mode!=='synthetic_fixture'||!a.fixtureTransport)fail('fixture_transport_required');
 const run=await provider.run({plan:a.plan.plan,mode:'synthetic_fixture',fixtureTransport:a.fixtureTransport!});
 base.reasonCodes=[...run.reasonCodes];
 base.cost={requests:run.networkRequests.length,searchRequests:run.networkRequests.filter(u=>!u.endsWith('/robots.txt')).length,
  robotsRequests:run.networkRequests.filter(u=>u.endsWith('/robots.txt')).length,liveNetworkCalls:0};
 if(run.reasonCodes.some(r=>/^search_(?:provider_disabled|service_access_not_reviewed|robots)/.test(r)))base.status='provider_not_usable';
 const observed=new Set<string>(),publishers=new Map<string,{source_id:string;source_type:string;source_type_basis:string}>(),restricted=new Set<string>();
 if(a.store){
  for(const r of a.store.db.prepare('SELECT url FROM revisions').all() as {url:string}[]){try{observed.add(normalizeDiscoveryUrl192(r.url));}catch{observed.add(r.url);}}
  // A publisher is recognised only through a canonical source row for that host, not because a URL once mentioned it.
  for(const r of a.store.db.prepare('SELECT source_id,host,source_type,source_type_basis FROM sources ORDER BY source_id').all() as {source_id:string;host:string;source_type:string;source_type_basis:string}[])
   if(!publishers.has(r.host))publishers.set(r.host,r);
  for(const r of a.store.db.prepare('SELECT host FROM host_access WHERE restricted>0 OR suspended_until IS NOT NULL').all() as {host:string}[])restricted.add(r.host);
 }
 for(const lead of run.candidates){
  const url=lead.url;let host='';try{host=new URL(url).hostname;}catch{continue;}
  let key=url;try{key=normalizeDiscoveryUrl192(url);}catch{/* keep */}
  if(observed.has(key)){base.rejected.push({url,reason:'already_observed'});continue;}
  if(restricted.has(host)){base.rejected.push({url,reason:'host_restricted'});continue;}
  const at=attributeUrl261(url,t);if(at==='url_names_other_model'){base.rejected.push({url,reason:'url_names_other_model'});continue;}
  const pub=publishers.get(host)??null;const q=lead.queryIndex!==undefined?a.plan.queries[lead.queryIndex]:undefined;
  const verify:('product_identity'|'document_role'|'originality'|'access_rights'|'method')[]=['document_role','originality','access_rights'];
  if(at!=='url_token_matches_known_identifier')verify.unshift('product_identity');
  if(t.job.gapKind==='missing_test'||t.job.gapKind==='missing_criterion')verify.push('method');
  base.candidates.push({url,host,jobId:t.job.jobId,purpose:q?.purpose??null,
   publisher:{recognition:pub?'recognised_publisher':'unrecognised_domain',canonicalSourceId:pub?.source_id??null,canonicalSourceType:pub?.source_type??null,sourceTypeBasis:pub?.source_type_basis??null},
   documentRole:'role_unknown',attribution:at,origin:'synthetic_fixture',genuineDiscovery:false,
   lead:{channel:'general_search',provider:provider.id,query:q?.query??null,queryIndex:lead.queryIndex??null,
    requirement:{jobId:t.job.jobId,gapKind:t.job.gapKind,criterion:t.job.criterion},
    access:{pageRetrieval:'not_authorised',rights:'unreviewed',robots:'unknown'},originality:'unknown',duplication:'none_detected_by_url',
    revision:{revisionId:null,contentSha256:null},verificationRequired:verify},
   stages:{candidateUrlDiscovered:true,publisherRecognised:!!pub,documentRegistered:false,metadataDiscoveryAllowed:false,pageRetrievalPermitted:false,factualInformationRetained:false,
    independentEvidenceVerified:false,recommendationAuthorized:false}});
 }
 if(base.status!=='provider_not_usable')base.status=base.candidates.length?'candidates_found':'nothing_found';
 return base;
}

/** Metadata-only check of whether the store's history explains a missing declaration before calling it a discovery
 * need (Phase255 distinctions). Nothing is refetched, promoted or reclassified. */
export type HistoricalClass262='identity_prevents_attribution'|'retained_but_not_usable'|'label_seen_value_withheld_by_rights'|
 'label_seen_value_not_extracted'|'older_extractor_may_have_missed'|'absent_from_known_sources';
export function historicalAssessment262(store:KnowledgeStore246,job:{productId:string|null;criterion:string|null}){
 if(!job.productId||!job.criterion)return {class:'absent_from_known_sources' as HistoricalClass262,reinspectionOpportunity:false,newDiscoveryNeeded:true,evidence:null};
 const c=SPEC_CRITERIA249[job.criterion];
 const p=store.db.prepare('SELECT identity_state FROM products WHERE product_id=?').get(job.productId) as {identity_state:string}|undefined;
 const revs=store.db.prepare(`SELECT ps.role,r.revision_id,r.retention,r.extractor_version FROM product_sources ps
  JOIN revisions r USING(revision_id) WHERE ps.product_id=?`).all(job.productId) as {role:string;revision_id:string;retention:string;extractor_version:string}[];
 const matches=(label:string)=>!!c&&c.property.test(label)&&!c.exclude?.test(label);
 const decls=(store.db.prepare('SELECT property FROM declarations WHERE product_id=?').all(job.productId) as {property:string}[]).filter(d=>matches(d.property)).length;
 const labelRevs=revs.filter(r=>(store.db.prepare('SELECT property_label FROM revision_properties WHERE revision_id=? AND product_id=?').all(r.revision_id,job.productId) as {property_label:string}[])
  .some(x=>matches(x.property_label)));
 const current=SPEC_EXTRACTOR_VERSION+'+'+IDENTITY_RULES246;
 const keeps=(r:{retention:string})=>VALUE_RETAINING246.includes(r.retention as RetentionClass246);
 const evidence={identityState:p?.identity_state??null,revisions:revs.length,ownPageRevisions:revs.filter(r=>r.role==='main_product').length,
  currentExtractorRevisions:revs.filter(r=>r.extractor_version===current).length,valueRetainingRevisions:revs.filter(keeps).length,
  criterionDeclarations:decls,criterionLabelRevisions:labelRevs.length};
 let cls:HistoricalClass262;
 if(!p||['discovered','unsupported_after_rederivation'].includes(p.identity_state)||!evidence.ownPageRevisions)cls='identity_prevents_attribution';
 else if(decls>0)cls='retained_but_not_usable';
 else if(labelRevs.some(r=>!keeps(r)))cls='label_seen_value_withheld_by_rights';
 else if(labelRevs.length)cls='label_seen_value_not_extracted';
 else if(revs.some(r=>keeps(r)&&r.extractor_version!==current))cls='older_extractor_may_have_missed';
 else cls='absent_from_known_sources';
 return {class:cls,
  // Re-reading the same permitted page could settle these (Phase255 source_reinspection), not a new search.
  reinspectionOpportunity:cls==='label_seen_value_not_extracted'||cls==='older_extractor_may_have_missed',
  newDiscoveryNeeded:cls==='absent_from_known_sources'||cls==='identity_prevents_attribution',evidence};
}
