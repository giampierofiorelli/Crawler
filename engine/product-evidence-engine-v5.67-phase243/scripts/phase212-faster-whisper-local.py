#!/usr/bin/env python3
"""Explicitly opt-in offline faster-whisper runner; raw transcript goes to caller's
stdout pipe ONLY, never a file. No weights/downloads installed by this script.
This is a controlled optional integration, not part of the server requirements.
"""
import argparse, hashlib, json, pathlib, shutil, subprocess, sys
from importlib.metadata import version as package_version

def fail(message):
    raise RuntimeError('phase212_' + message)

def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--media',required=True)
    p.add_argument('--expected-sha256',required=True)
    p.add_argument('--model-dir',required=True)
    p.add_argument('--window-seconds',type=int,default=15)
    p.add_argument('--duration-seconds',type=float,required=True)
    p.add_argument('--strategy',choices=['multilingual_windows','global_language'],default='multilingual_windows')
    args=p.parse_args()
    media=pathlib.Path(args.media).resolve(strict=True)
    model=pathlib.Path(args.model_dir).resolve(strict=True)
    if not media.is_file() or not model.is_dir() or not (model/'model.bin').is_file(): fail('missing_local_model_or_media')
    if media.stat().st_size>120_000_000 or not (0<args.duration_seconds<=1200): fail('limits')
    if len(args.expected_sha256)!=64 or sha(media)!=args.expected_sha256: fail('source_hash_mismatch')
    if not (8<=args.window_seconds<=30): fail('window')
    if not shutil.which('ffmpeg'): fail('ffmpeg_unavailable')
    try:
        import numpy as np
        from faster_whisper import WhisperModel
    except ImportError as e: fail('optional_local_dependencies_not_installed:'+str(e.name))
    # The resolved directory and local_files_only=True explicitly forbid a hub download.
    m=WhisperModel(str(model),device='cpu',compute_type='int8',local_files_only=True,num_workers=1,cpu_threads=3)
    decoded=subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(media),'-vn','-ac','1','-ar','16000','-f','f32le','-'],
        capture_output=True,timeout=90,check=True)
    sound=np.frombuffer(decoded.stdout,dtype='<f4').copy()
    if len(sound)/16000>args.duration_seconds+0.1 or not len(sound): fail('audio_duration_mismatch')
    output=[]
    windows=[]
    if args.strategy=='multilingual_windows':
        for start in range(0,len(sound),args.window_seconds*16000):
            part=sound[start:start+args.window_seconds*16000]
            windows.append((start/16000,part))
    else: windows=[(0,sound)]
    for offset,part in windows:
        segments,info=m.transcribe(part,language=None,task='transcribe',multilingual=True,
                word_timestamps=True,vad_filter=False,condition_on_previous_text=False,
                beam_size=5,temperature=0)
        inferred=info.language if args.strategy=='multilingual_windows' else None
        for segment in segments:
            a=offset+float(segment.start);b=offset+float(segment.end)
            if not (a>=0 and b>a and b<=args.duration_seconds+0.2): fail('asr_out_of_bounds')
            # Inference is window-scoped; intra-window switches cannot be certified.
            w=[]
            for word in (segment.words or []):
                wa=offset+float(word.start);wb=offset+float(word.end)
                if not (a-0.02<=wa<wb<=b+0.02): continue
                w.append({'startSecond':round(wa,3),'endSecond':round(wb,3),'text':word.word})
            output.append({'id':'s'+str(len(output)),'startSecond':round(a,3),
              'endSecond':round(b,3),'text':segment.text,
              'language':inferred if inferred and len(inferred) in (2,3) else None,
              'languageBasis':'window_inference' if inferred else 'unknown','words':w})
    # Temporary stdout payload is consumed in memory by node and NOT persisted.
    payload={'schema':'pee212.local-asr.v1','uploadSha256':args.expected_sha256,
      'durationSeconds':args.duration_seconds,
      'runtime':{'engine':'faster_whisper_local','engineVersion':package_version('faster-whisper'),
       'modelSha256':sha(model/'model.bin'),
       'modelLabel':model.name[:100],'inferenceMode':'local_cpu_int8',
       'languageStrategy':args.strategy,'noRemoteInference':True,
       'inputShaVerified':True,'engineRan':True},'segments':output}
    sys.stdout.write(json.dumps(payload,ensure_ascii=False,separators=(',',':')))
if __name__=='__main__':
    try: main()
    except (OSError,RuntimeError,ValueError,subprocess.CalledProcessError,subprocess.TimeoutExpired) as e:
        print('Phase212 offline ASR unavailable/error: '+str(e),file=sys.stderr)
        sys.exit(2)
