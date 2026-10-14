/** Phase213: translate whisper.cpp's *actual CLI JSON schema* to the existing
 * Phase212 transient evaluation input. This code does not obtain transcripts,
 * infer word boundaries, authenticate expertise or admit product evidence.
 * Raw transcription text must remain process-local and temporary.
 */
import type {Transcript212,AsrSegment212} from './phase212_local_asr_evaluation.js';
const fail=(x:string):never=>{throw Error('phase213_'+x)};
const object=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const sha=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{64}$/.test(v);
export interface CppContext213 {uploadSha256:string;modelSha256:string;modelLabel:string;
 durationSeconds:number;offsetSeconds:number;windowSeconds:number;engineVersion:string;}
export function normalizeWhisperCppWindow213(raw:unknown,c:CppContext213):Transcript212 {
 if(!object(c)||!sha(c.uploadSha256)||!sha(c.modelSha256)||typeof c.modelLabel!=='string'||c.modelLabel.length>100||
 !Number.isFinite(c.durationSeconds)||c.durationSeconds<=0||c.durationSeconds>1200||
 !Number.isFinite(c.offsetSeconds)||c.offsetSeconds<0||!Number.isFinite(c.windowSeconds)||c.windowSeconds<=0||c.windowSeconds>30||
 c.offsetSeconds>=c.durationSeconds||!/^\d+(?:\.\d+){1,3}(?:[a-z0-9.-]{0,15})?$/.test(c.engineVersion))fail('context');
 if(!object(raw)||!object(raw.params)||raw.params.translate!==false||raw.params.language!=='auto'||
 !object(raw.model)||raw.model.multilingual!==true||!object(raw.result)||
 !Array.isArray(raw.transcription)||raw.transcription.length>300)fail('cli_json');
 const json=raw as Record<string,unknown>;
 const language=(json.result as Record<string,unknown>).language;
 const inferred=typeof language==='string'&&/^[a-z]{2,3}$/.test(language)?language:null;
 const segments:AsrSegment212[]=[];
 const transcription=json.transcription as unknown[];
 for(const candidate of transcription){
  if(!object(candidate))fail('segment');
  const item=candidate as Record<string,unknown>;
  if(!object(item.offsets)||typeof item.text!=='string'||item.text.length>4000||
   !Number.isSafeInteger(item.offsets.from)||!Number.isSafeInteger(item.offsets.to))fail('segment');
  const offsets=item.offsets as Record<string,unknown>;
  const start=c.offsetSeconds+Number(offsets.from)/1000;
  const end=c.offsetSeconds+Number(offsets.to)/1000;
  if(start<c.offsetSeconds-.01||end<=start||end>Math.min(c.durationSeconds,c.offsetSeconds+c.windowSeconds)+.06)fail('timing');
  // The CLI exports token timing in JSON-full, not proven word alignment.
  // Deliberately leave words empty rather than misrepresent tokens as words.
  segments.push({id:'w'+Math.round(c.offsetSeconds*1000)+'s'+segments.length,
    startSecond:Math.round(start*1000)/1000,endSecond:Math.round(end*1000)/1000,
    text:item.text as string,language:inferred,languageBasis:inferred?'window_inference':'unknown',words:[]});
 }
 return {schema:'pee212.local-asr.v1',uploadSha256:c.uploadSha256,durationSeconds:c.durationSeconds,
  runtime:{engine:'whispercpp_local',engineVersion:c.engineVersion,modelSha256:c.modelSha256,
   modelLabel:c.modelLabel,inferenceMode:'local_cpu',languageStrategy:'multilingual_windows',
   noRemoteInference:true,inputShaVerified:true,engineRan:true},segments};
}
