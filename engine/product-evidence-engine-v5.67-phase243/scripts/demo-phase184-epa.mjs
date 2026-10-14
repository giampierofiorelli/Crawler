import {readFileSync,writeFileSync} from 'node:fs';
import {stageEpaRegistry184,verifyEpaPilot184} from '../dist/src/phase184_real_epa_registry_pilot.js';
const filename='evaluation/phase184/source/ENERGY_STAR_Certified_Room_Air_Cleaners_V3.0_20261012.csv';
const bytes=readFileSync(filename);
const audit=stageEpaRegistry184({csvBytes:bytes,expectedSha256:'4d7d3203e95ef8c2553a55a51799438470d5f71f01c49c295ede8013d608be91',
 market:'us',obtainedAt:'2026-10-12T20:53:00Z',reviewedAt:'2026-10-12T20:54:00Z',asOf:'2026-10-12T22:00:00Z',
 rightsReviewReference:'epa_public_data_license_review',sourceRevision:'operator_export_2026_10_12'});
if(!verifyEpaPilot184(audit,bytes))throw Error('phase184_real_pilot_replay_failed');
writeFileSync('evaluation/phase184/epa_us_quarantined_audit.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify({rows:audit.rows,columns:audit.columns,stagedRegistryEntries:audit.candidates.length,
 quarantinedNumericClaims:audit.candidates.reduce((a,b)=>a+b.observations.length,0),held:audit.held.length,
 independentScienceReviewed:audit.independentScientificReviewComplete,rankingAuthorized:audit.rankingAuthorized},null,2));
