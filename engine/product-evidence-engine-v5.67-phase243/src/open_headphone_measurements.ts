/** Phase 69: small, attributed, licensed measurement extract. No automatic sound-quality ranking. */
export interface FrequencyResponseSample {
 product:'Sennheiser HD600';
 channel:'left';
 instrument:'MiniDSP EARS';
 compensation:'cEAR30 (stock screws; compensation 3.02)';
 sourceUrl:string;
 sourceLicence:'CC BY 4.0';
 sourceAttribution:string;
 points:{frequencyHz:number;responseDb:number}[];
 coverage:'partial_excerpt_not_complete_curve';
 suitableForVerdict:false;
}
export function parseAttributableSbafHd600Excerpt(raw:string):FrequencyResponseSample {
 if(typeof raw!=='string'||raw.length>35000)throw Error('Invalid data size');
 const lines=raw.trim().split(/\r?\n/).map(x=>x.trim());
 if(lines.length<4||lines.length>696)throw Error('Not a supported partial dataset');
 const points=lines.map(line=>{
  if(!/^\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?$/.test(line))throw Error('Unexpected measurement row');
  const [frequencyHz,responseDb]=line.split(/\s+/).map(Number);
  if(!Number.isFinite(frequencyHz)||frequencyHz<10||frequencyHz>25000||
    !Number.isFinite(responseDb)||responseDb< -100||responseDb>100)throw Error('Invalid measurement range');
  return {frequencyHz,responseDb};
 });
 if(points.some((p,i)=>i>0&&p.frequencyHz<=points[i-1].frequencyHz))throw Error('Frequency order violation');
 return {product:'Sennheiser HD600',channel:'left',instrument:'MiniDSP EARS',
  compensation:'cEAR30 (stock screws; compensation 3.02)',
  sourceUrl:'https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/blob/master/cEAR30-Sennheiser-HD600-L.txt',
  sourceLicence:'CC BY 4.0',sourceAttribution:'SBAF / Super Best Audio Friends — HPDB headphone measurements, CC BY 4.0',
  points,coverage:'partial_excerpt_not_complete_curve',suitableForVerdict:false};
}
