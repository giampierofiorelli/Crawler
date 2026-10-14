/** Phase214: research-only, byte-bound local model preflight.
 * A matching analyst pin proves integrity relative to a pinned digest, NOT
 * upstream authenticity, trained-weight completeness or ASR accuracy.
 */
const fail=(reason:string):never=>{throw Error('phase214_'+reason)};
const object=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const digest=(x:unknown):x is string=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export interface ModelManifest214 {
 schema:'pee214.local-model-pin.v1';modelId:string;expectedSha256:string;
 modelFormat:'whisper-ggml';multilingualRequired:true;
 provenance:'analyst_supplied_pin';sourceUrl:string;licenseUrl:string;
}
export interface ModelObservation214 {observedSha256:string;byteLength:number;magicHex:string;vocabSize:number;}
export interface ModelQualification214 {
 schema:'pee214.model-qualification.v1';modelId:string;observedSha256:string;byteLength:number;
 pinMatched:true;ggmlHeaderConsistent:true;multilingualHeaderConsistent:true;
 upstreamAuthenticated:false;trainedWeightsValidated:false;asrInferenceExecuted:false;
 approval:'local_research_only';publicRankingAuthorized:false;
}
const validLink=(s:unknown)=>typeof s==='string'&&s.length<600&&/^https:\/\/[^\s/?#]+(?:[^\s]*)$/.test(s);
export function qualifyLocalWhisperModel214(m:ModelManifest214,o:ModelObservation214):ModelQualification214 {
 if(!object(m)||m.schema!=='pee214.local-model-pin.v1'||
  typeof m.modelId!=='string'||!/^ggml-(?:tiny|base|small|medium|large(?:-v[1-3])?)(?:-q(?:5_1|8_0))?\.bin$/.test(m.modelId)||
  !digest(m.expectedSha256)||m.modelFormat!=='whisper-ggml'||m.multilingualRequired!==true||
  m.provenance!=='analyst_supplied_pin'||!validLink(m.sourceUrl)||!validLink(m.licenseUrl))fail('manifest');
 if(!object(o)||!digest(o.observedSha256)||!Number.isSafeInteger(o.byteLength)||o.byteLength<25_000_000||o.byteLength>5_000_000_000||
  o.magicHex!=='6c6d6767'||!Number.isInteger(o.vocabSize)||o.vocabSize<51865||o.vocabSize>51866)fail('header_or_size');
 if(o.observedSha256!==m.expectedSha256)fail('pin_mismatch');
 return {schema:'pee214.model-qualification.v1',modelId:m.modelId,observedSha256:o.observedSha256,
  byteLength:o.byteLength,pinMatched:true,ggmlHeaderConsistent:true,multilingualHeaderConsistent:true,
  upstreamAuthenticated:false,trainedWeightsValidated:false,asrInferenceExecuted:false,
  approval:'local_research_only',publicRankingAuthorized:false};
}
