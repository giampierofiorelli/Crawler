/** Phase209: rights-scoped, byte-attested original audiovisual intake.
 * Public source pages, author descriptions and CC licence labels are NOT human review,
 * product tests, independent validation, or authorization to show site trust signals.
 * Bytes are ephemeral and never returned. Existing Phase206–208 evaluation is reused.
 */
import {createHash} from 'node:crypto';
import {canonicalYouTubeVideo203} from './phase203_video_evidence_search.js';

const fail=(name:string):never=>{throw new Error(`phase209_${name}`);};
const id=(v:unknown):v is string=>typeof v==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(v)&&!['__proto__','constructor','prototype'].includes(v);
const sha=(v:Uint8Array)=>createHash('sha256').update(v).digest('hex');
const digest=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const exact=(o:unknown,keys:readonly string[])=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&
 Object.keys(o).length===keys.length&&Object.keys(o).every(k=>keys.includes(k));
const safeText=(s:unknown,max=200):s is string=>typeof s==='string'&&s.length>0&&s.length<=max&&s===s.trim()&&!/[\u0000-\u001f\u007f]/.test(s);

/** Stable, narrowly allowlisted source identity. No arbitrary URL origin equivalence.
 * A Commons FILE PAGE is not a verified copy of the original media byte stream.
 */
export function canonicalReviewableVideo209(raw:string):{kind:'youtube'|'wikimedia_commons_file';url:string}{
 if(typeof raw!=='string'||raw.length>2048)fail('source_url');
 const u=(()=>{try{return new URL(raw);}catch{
   canonicalYouTubeVideo203(raw);throw new Error('phase209_source_url');}})();
 // Preserve Phase203's exact YouTube validation and error contract.
 if(u.hostname!=='commons.wikimedia.org'){
  const v=canonicalYouTubeVideo203(raw);return {kind:'youtube',url:v.url};
 }
 if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)fail('source_url');
 if(u.search)fail('source_url');
 const m=/^\/wiki\/File:(.+\.webm)$/i.exec(u.pathname);
 if(!m||m[1].length>320||m[1].includes('/'))throw new Error('phase209_commons_page');
 const filename=(()=>{try{return decodeURIComponent(m[1]).replace(/ /g,'_');}catch{throw new Error('phase209_commons_encoding');}})();
 if(!/^[^\u0000-\u001f\u007f?#/]{1,300}\.webm$/i.test(filename)||filename.includes('..'))fail('commons_filename');
 return {kind:'wikimedia_commons_file',url:`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename).replace(/%2F/gi,'/')}`};
}
export type MediaLicense209='CC-BY-2.0'|'CC-BY-4.0'|'CC-BY-SA-4.0'|'CC0-1.0';
export interface LicensedSource209{
 schema:'pee209.source.v1';caseId:string;sourcePageUrl:string;sourceMediaUrl:string;
 licence:MediaLicense209;licensePageUrl:string;creator:string;title:string;
 categoryId:string;criterionId:string;disciplineId:string;exactVariantId:string|null;
 sourceRightsCheckedBy:string;sourcePageReviewedAt:string;
 /** Source page and licence statements are manually checked, not independently audited. */
 sourceRightsBasis:'publisher_page_stated_license';
}
export interface EphemeralCapture209{
 source:LicensedSource209;bytes:Uint8Array;
 acquisition:'operator_offline'|'approved_https_reader'|'synthetic_fixture';
 /** Optional out-of-band, separately authenticated complete original-media SHA-256. */
 independentOriginalDigest:string|null;
}
export interface LicensedMediaReceipt209{
 schema:'pee209.media-receipt.v1';state:'research_only';caseId:string;
 canonicalPageUrl:string;sourceMediaUrl:string;sourceMediaSha256:string;sourceByteLength:number;
 licence:MediaLicense209;creator:string;rightsReviewerId:string;
 categoryId:string;criterionId:string;disciplineId:string;exactVariantId:string|null;
 acquisition:EphemeralCapture209['acquisition'];mediaContainer:'webm';
 independentlyMatchedOriginalDigest:boolean;publisherBytesAuthenticated:boolean;
 uploaderCompetenceVerified:false;productVariantVisuallyVerified:false;
 videoReviewedBySpecialists:false;sourceAssertionsValidated:false;
 independentTestEventAdmitted:false;scientificBenchmarkGoldAllowed:false;
 productRankingAuthorized:false;publicTrustBadgeAuthorized:false;
 fullVideoStoredInReceipt:false;transcriptStored:false;
 /** Subject to availability of rights-cleared media and separate human review. */
 missingChecks:readonly string[];
}
function validIso(x:unknown):boolean{return typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(x)&&
 !Number.isNaN(Date.parse(x))&&new Date(x).toISOString().replace('.000Z','Z')===x;}
function safeUploadSource209(raw:string):string{
 const u=(()=>{try{return new URL(raw);}catch{throw new Error('phase209_media_url');}})();
 if(u.protocol!=='https:'||u.hostname!=='upload.wikimedia.org'||u.port||u.username||u.password||
  u.search||u.hash||!/^\/wikipedia\/commons\/[0-9a-f]\/[0-9a-f]{2}\/.+\.webm$/i.test(u.pathname)||
  u.pathname.length>850)fail('media_url');
 return u.href;
}
function looksWebM(x:Uint8Array):boolean{return x.length>=16&&x[0]===0x1a&&x[1]===0x45&&x[2]===0xdf&&x[3]===0xa3;}
export function inspectEphemeralLicensedMedia209(input:EphemeralCapture209):LicensedMediaReceipt209{
 const s=input?.source;
 if(!exact(input,['source','bytes','acquisition','independentOriginalDigest'])||
  !exact(s,['schema','caseId','sourcePageUrl','sourceMediaUrl','licence','licensePageUrl','creator',
   'title','categoryId','criterionId','disciplineId','exactVariantId','sourceRightsCheckedBy',
   'sourcePageReviewedAt','sourceRightsBasis'])||s.schema!=='pee209.source.v1'||
  ![s.caseId,s.categoryId,s.criterionId,s.disciplineId,s.sourceRightsCheckedBy].every(id)||
  (s.exactVariantId!==null&&!id(s.exactVariantId))||!safeText(s.creator)||!safeText(s.title,350)||
  !validIso(s.sourcePageReviewedAt)||s.sourceRightsBasis!=='publisher_page_stated_license')fail('source_metadata');
 const canonical=canonicalReviewableVideo209(s.sourcePageUrl);
 if(canonical.kind!=='wikimedia_commons_file')fail('source_origin');
 const mediaUrl=safeUploadSource209(s.sourceMediaUrl);
 if(decodeURIComponent(new URL(mediaUrl).pathname.split('/').at(-1)!)!==
   decodeURIComponent(new URL(canonical.url).pathname.split('File:').at(-1)!))fail('media_page_mismatch');
 const expectedLicenseUrl:{[key in MediaLicense209]:string}={
  'CC-BY-2.0':'https://creativecommons.org/licenses/by/2.0/',
  'CC-BY-4.0':'https://creativecommons.org/licenses/by/4.0/',
  'CC-BY-SA-4.0':'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC0-1.0':'https://creativecommons.org/publicdomain/zero/1.0/'};
 if(!Object.hasOwn(expectedLicenseUrl,s.licence)||s.licensePageUrl!==expectedLicenseUrl[s.licence])fail('license');
 if(!['operator_offline','approved_https_reader','synthetic_fixture'].includes(input.acquisition))fail('acquisition');
 if(!(input.bytes instanceof Uint8Array)||input.bytes.length<16||input.bytes.length>120_000_000||
  !looksWebM(input.bytes))fail('media_bytes');
 if(input.independentOriginalDigest!==null&&!digest(input.independentOriginalDigest))fail('original_digest');
 const hash=sha(input.bytes);
 if(input.independentOriginalDigest!==null&&input.independentOriginalDigest!==hash)fail('original_digest_mismatch');
 const independentlyMatchedOriginalDigest=input.independentOriginalDigest!==null;
 return {schema:'pee209.media-receipt.v1',state:'research_only',caseId:s.caseId,
  canonicalPageUrl:canonical.url,sourceMediaUrl:mediaUrl,sourceMediaSha256:hash,
  sourceByteLength:input.bytes.length,licence:s.licence,creator:s.creator,
  rightsReviewerId:s.sourceRightsCheckedBy,categoryId:s.categoryId,criterionId:s.criterionId,
  disciplineId:s.disciplineId,exactVariantId:s.exactVariantId,acquisition:input.acquisition,
  mediaContainer:'webm',independentlyMatchedOriginalDigest,
  publisherBytesAuthenticated:false,
  uploaderCompetenceVerified:false,productVariantVisuallyVerified:false,
  videoReviewedBySpecialists:false,sourceAssertionsValidated:false,
  independentTestEventAdmitted:false,scientificBenchmarkGoldAllowed:false,
  productRankingAuthorized:false,publicTrustBadgeAuthorized:false,
  fullVideoStoredInReceipt:false,transcriptStored:false,
  missingChecks:['qualified_independent_review','frame_level_criterion_observations',
   'actual_product_variant','actual_event_originality',
   ...(input.acquisition!=='approved_https_reader'?['authenticated_source_transport']:[]),
   ...(!independentlyMatchedOriginalDigest?['independent_original_file_hash']:[])]};
}
