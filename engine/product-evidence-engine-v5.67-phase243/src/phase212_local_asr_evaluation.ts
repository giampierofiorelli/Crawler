/** Phase212: local-ASR, text-ephemeral evaluation. Independent gold remains Phase207.
 * Text enters only transiently; no text, audio, phrase hashes or private reference
 * transcripts are returned. Language detection is NOT expertise or evidence of truth.
 */
const bad=(reason:string):never=>{throw Error('phase212_'+reason);};
const obj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const hex=(x:unknown):x is string=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const safeN=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const lang=(x:unknown):x is string=>typeof x==='string'&&/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(x);
const sid=(x:unknown):x is string=>typeof x==='string'&&/^[a-zA-Z0-9_.:-]{1,70}$/.test(x);
const round=(v:number)=>Math.round(v*10000)/10000;
export interface AsrWord212{startSecond:number;endSecond:number;text:string;}
export interface AsrSegment212{id:string;startSecond:number;endSecond:number;text:string;language:string|null;
 languageBasis:'window_inference'|'global_only'|'unknown';words:AsrWord212[];}
export interface AsrRuntime212{engine:'faster_whisper_local'|'whispercpp_local';engineVersion:string;modelSha256:string;modelLabel:string;
 inferenceMode:'local_cpu_int8'|'local_cpu';languageStrategy:'multilingual_windows'|'global_language';
 noRemoteInference:true;inputShaVerified:boolean;engineRan:boolean;}
export interface Transcript212{schema:'pee212.local-asr.v1';uploadSha256:string;durationSeconds:number;
 runtime:AsrRuntime212;segments:AsrSegment212[];}
export interface ProvisionalReference212{status:'analyst_transcription_unverified';
 segments:{id:string;startSecond:number;endSecond:number;text:string;language:string|null;}[];}
export interface Evaluation212{
 schema:'pee212.asr-research-result.v1';uploadSha256:string;modelSha256:string;engine:'faster_whisper_local'|'whispercpp_local';
 engineRan:boolean;sourceBound:boolean;transcriptTextRetained:false;audioRetained:false;
 segmentCount:number;wordCount:number;languageCounts:Record<string,number>;
 detectedLanguageTransitions:number;languageScope:'window_inference'|'global_only'|'unknown';
 languageIdentityValidated:false;intraWindowCodeSwitchUnresolved:true;
 provisionalComparison:{wer:number|null;cer:number|null;boundaryMaeSeconds:number|null;
 matchedBoundarySegments:number;languageAgreement:number|null;referenceIsIndependentGold:false;status:'no_reference'|'analyst_diagnostic_only'};
 criticalMissing:string[];independentGoldLabels:0;rankingAuthorized:false;trustBadgeAuthorized:false;
}
const clean=(s:string)=>s.normalize('NFKC').toLocaleLowerCase('und').replace(/[\p{P}\p{S}]/gu,' ').replace(/\s+/gu,' ').trim();
const edit=(a:readonly string[],b:readonly string[]):number=>{
 let p=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  const q=[i];for(let j=1;j<=b.length;j++)q.push(Math.min(q[j-1]+1,p[j]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)));
  p=q;
 }return p[b.length];
};
const words=(t:string)=>{const c=clean(t);return c?c.split(' '):[];};
const chars=(t:string)=>Array.from(clean(t).replace(/ /g,''));
function validSegment(s:AsrSegment212,limit:number,seen:Set<string>,last:number){
 if(!obj(s)||!sid(s.id)||seen.has(s.id)||!safeN(s.startSecond)||!safeN(s.endSecond)||
 s.startSecond<last||s.endSecond<=s.startSecond||s.endSecond>limit+.02||
 typeof s.text!=='string'||s.text.length>4000||!['window_inference','global_only','unknown'].includes(s.languageBasis)||
 (s.language!==null&&!lang(s.language))||!Array.isArray(s.words)||s.words.length>700)bad('segment');
 seen.add(s.id);
 let prev=s.startSecond-.02;
 for(const w of s.words){
  if(!obj(w)||!safeN(w.startSecond)||!safeN(w.endSecond)||w.startSecond<prev-.02||
  w.startSecond<s.startSecond-.02||w.endSecond<=w.startSecond||w.endSecond>s.endSecond+.02||
  typeof w.text!=='string'||w.text.length>100)bad('word');
  prev=w.startSecond;
 }
}
export function evaluateLocalAsr212(t:Transcript212,ref:ProvisionalReference212|null=null):Evaluation212{
 if(!obj(t)||t.schema!=='pee212.local-asr.v1'||!hex(t.uploadSha256)||
 !safeN(t.durationSeconds)||t.durationSeconds<=0||t.durationSeconds>7200||!obj(t.runtime)||
 !['faster_whisper_local','whispercpp_local'].includes(t.runtime.engine)||typeof t.runtime.engineVersion!=='string'||!/^\d+(?:\.\d+){1,3}(?:[a-z0-9.-]{0,15})?$/.test(t.runtime.engineVersion)||!hex(t.runtime.modelSha256)||
 typeof t.runtime.modelLabel!=='string'||t.runtime.modelLabel.length>100||
 !((t.runtime.engine==='faster_whisper_local'&&t.runtime.inferenceMode==='local_cpu_int8')||
 (t.runtime.engine==='whispercpp_local'&&t.runtime.inferenceMode==='local_cpu'))||
 !['multilingual_windows','global_language'].includes(t.runtime.languageStrategy)||
 t.runtime.noRemoteInference!==true||t.runtime.inputShaVerified!==true||
 t.runtime.engineRan!==true||!Array.isArray(t.segments)||t.segments.length>2000)bad('input');
 const seen=new Set<string>();let last=0, wc=0, transitions=0, lastLang:string|null=null;
 const counts:Record<string,number>=Object.create(null);
 for(const s of t.segments){validSegment(s,t.durationSeconds,seen,last);last=s.startSecond;
  wc+=s.words.length;const key=s.language??'und';counts[key]=(counts[key]??0)+1;
  if(s.language!==null&&lastLang!==null&&s.language!==lastLang&&s.languageBasis==='window_inference')transitions++;
  if(s.language!==null)lastLang=s.language;
 }
 let wer:null|number=null,cer:null|number=null,mae:null|number=null,agreement:null|number=null,nMatch=0;
 if(ref!==null){
  if(!obj(ref)||ref.status!=='analyst_transcription_unverified'||!Array.isArray(ref.segments)||
  ref.segments.length>2000)bad('reference');
  const rseen=new Set<string>();let rlast=0;
  for(const r of ref.segments){
   if(!obj(r)||!sid(r.id)||rseen.has(r.id)||!safeN(r.startSecond)||!safeN(r.endSecond)||
    r.startSecond<rlast||r.endSecond<=r.startSecond||r.endSecond>t.durationSeconds+.02||
    typeof r.text!=='string'||r.text.length>4000||(r.language!==null&&!lang(r.language)))bad('reference_segment');
   rseen.add(r.id);rlast=r.startSecond;
  }
  const tw=t.segments.flatMap(s=>words(s.text)),rw=ref.segments.flatMap(s=>words(s.text));
  const tc=t.segments.flatMap(s=>chars(s.text)),rc=ref.segments.flatMap(s=>chars(s.text));
  wer=rw.length?round(edit(rw,tw)/rw.length):null;cer=rc.length?round(edit(rc,tc)/rc.length):null;
  const byId=new Map(ref.segments.map(s=>[s.id,s]));let distance=0,LangDen=0,LangHit=0;
  for(const s of t.segments){const r=byId.get(s.id);if(!r)continue;
   nMatch++;distance+=Math.abs(s.startSecond-r.startSecond)+Math.abs(s.endSecond-r.endSecond);
   if(r.language!==null&&s.language!==null){LangDen++;if(r.language===s.language)LangHit++;}
  }
  mae=nMatch?round(distance/(2*nMatch)):null;
  agreement=LangDen?round(LangHit/LangDen):null;
 }
 const scope=t.runtime.languageStrategy==='multilingual_windows'?'window_inference':'global_only';
 return {schema:'pee212.asr-research-result.v1',uploadSha256:t.uploadSha256,modelSha256:t.runtime.modelSha256,engine:t.runtime.engine,
  engineRan:true,sourceBound:true,transcriptTextRetained:false,audioRetained:false,
  segmentCount:t.segments.length,wordCount:wc,languageCounts:Object.fromEntries(Object.entries(counts).sort()),
  detectedLanguageTransitions:transitions,languageScope:scope,languageIdentityValidated:false,
  intraWindowCodeSwitchUnresolved:true,
  provisionalComparison:{wer,cer,boundaryMaeSeconds:mae,matchedBoundarySegments:nMatch,
   languageAgreement:agreement,referenceIsIndependentGold:false,status:ref?'analyst_diagnostic_only':'no_reference'},
  criticalMissing:[...(t.runtime.engine==='whispercpp_local'?['word_timing_not_validated_from_whispercpp_segment_output']:[]),
 'independent_bilingual_or_multilingual_human_reference','original_publisher_video_identity',
   'language_switch_validation','technical_claim_and_timestamp_review','separate_signed_phase207_gold_admission'],
  independentGoldLabels:0,rankingAuthorized:false,trustBadgeAuthorized:false};
}
