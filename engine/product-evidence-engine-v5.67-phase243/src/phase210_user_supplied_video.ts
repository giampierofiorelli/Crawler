/** Phase210: bounded receipt for an actual user-uploaded screen recording.
 * A correct upload SHA-256 proves only identity of the received upload, NOT
 * authenticity of the reviewed source, product, speaker, expert, or test.
 * Frames and media remain transient; no video, audio, quotes or transcript is
 * returned by this module. Visual observations are analyst annotations only.
 */
import {createHash} from 'node:crypto';
const deny=(message:string):never=>{throw new Error(`phase210_${message}`);};
const plain=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x:unknown,keys:string[]):x is Record<string,unknown>=>plain(x)&&Object.keys(x).length===keys.length&&Object.keys(x).every(k=>keys.includes(k));
const identifier=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_.:-]{0,99}$/.test(x)&&!['__proto__','prototype','constructor'].includes(x);
const text=(x:unknown,max=250):x is string=>typeof x==='string'&&x.length>0&&x.length<=max&&x===x.trim()&&!/[\u0000-\u001f\u007f]/.test(x);
const sha=(x:Uint8Array)=>createHash('sha256').update(x).digest('hex');
const hex=(x:unknown):x is string=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export type VisualKind210='visible_text_claim'|'visually_demonstrated_action'|'numeric_overlay'|'edited_comparison'|'analyst_inference';
export interface AnalystNote210 {atSecond:number;kind:VisualKind210;description:string;method:'frame_inspection';independentlyCorroborated:false;}
export interface UserUploadInput210 {
 schema:'pee210.upload-input.v1';caseId:string;receivedFileName:string;
 bytes:Uint8Array;durationSeconds:number;hasAudio:boolean;
 /** Absence of an externally authenticated original video URL is not an error. */
 originalPublisherUrl:string|null;
 notes:readonly AnalystNote210[];
}
export interface UserUploadReceipt210 {
 schema:'pee210.user-upload-receipt.v1';caseId:string;
 observedUploadSha256:string;uploadByteLength:number;container:'mp4';
 durationSeconds:number;hasAudio:boolean;receivedFileName:string;
 originalPublisherUrl:string|null;captureKind:'user_supplied_screen_recording';
 observations:readonly AnalystNote210[];
 sourceOriginalAuthenticated:false;publisherIdentityVerified:false;
 exactProductVariantVerified:false;creatorExpertiseVerified:false;
 measurementsScientificallyVerified:false;visualAnnotationsIndependentlyVerified:false;
 transcriptAvailable:false;independentGoldLabels:0;
 rankingAuthorized:false;publicTrustSignalsAuthorized:false;
 fullAudioRetained:false;fullVideoRetained:false;framesRetained:false;
 missingChecks:readonly string[];
}
export function inspectUserSuppliedVideo210(input:UserUploadInput210):UserUploadReceipt210 {
 if(!exact(input,['schema','caseId','receivedFileName','bytes','durationSeconds','hasAudio','originalPublisherUrl','notes'])||
 input.schema!=='pee210.upload-input.v1'||!identifier(input.caseId)||
 !text(input.receivedFileName,140)||!/\.mp4$/i.test(input.receivedFileName)||
 input.originalPublisherUrl!==null||typeof input.hasAudio!=='boolean'||
 typeof input.durationSeconds!=='number'||!Number.isFinite(input.durationSeconds)||
 input.durationSeconds<=0||input.durationSeconds>1800||
 !(input.bytes instanceof Uint8Array)||input.bytes.byteLength<32||input.bytes.byteLength>120_000_000||
 ![...input.bytes.slice(4,8)].every((b,i)=>b===[102,116,121,112][i])||
 !Array.isArray(input.notes)||input.notes.length>80)deny('input');
 let last=-1;
 const clean:AnalystNote210[]=[];
 for(const raw of input.notes){
  if(!exact(raw,['atSecond','kind','description','method','independentlyCorroborated'])||
   typeof raw.atSecond!=='number'||!Number.isFinite(raw.atSecond)||raw.atSecond<0||
   raw.atSecond>input.durationSeconds||raw.atSecond<=last||
   !['visible_text_claim','visually_demonstrated_action','numeric_overlay','edited_comparison','analyst_inference'].includes(String(raw.kind))||
   !text(raw.description,250)||raw.method!=='frame_inspection'||raw.independentlyCorroborated!==false)deny('notes');
  last=raw.atSecond;
  clean.push({atSecond:raw.atSecond,kind:raw.kind as VisualKind210,
   description:raw.description as string,method:'frame_inspection',independentlyCorroborated:false});
 }
 return {schema:'pee210.user-upload-receipt.v1',caseId:input.caseId,
  observedUploadSha256:sha(input.bytes),uploadByteLength:input.bytes.byteLength,
  container:'mp4',durationSeconds:input.durationSeconds,hasAudio:input.hasAudio,
  receivedFileName:input.receivedFileName,originalPublisherUrl:null,
  captureKind:'user_supplied_screen_recording',observations:clean,
  sourceOriginalAuthenticated:false,publisherIdentityVerified:false,exactProductVariantVerified:false,
  creatorExpertiseVerified:false,measurementsScientificallyVerified:false,
  visualAnnotationsIndependentlyVerified:false,transcriptAvailable:false,independentGoldLabels:0,
  rankingAuthorized:false,publicTrustSignalsAuthorized:false,
  fullAudioRetained:false,fullVideoRetained:false,framesRetained:false,
  missingChecks:['original_publisher_page_and_media_identity','complete_source_or_edit_history',
  'spoken_audio_transcript_not_yet_verified','measuring_instrument_and_protocol',
  'exact_product_variant_independently_verified','competence_and_conflicts',
  'independent_qualified_case_annotations']};
}
