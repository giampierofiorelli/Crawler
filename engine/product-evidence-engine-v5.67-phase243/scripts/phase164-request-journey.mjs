#!/usr/bin/env node
/** Run offline user-request interpretation over caller-supplied category brains.
 * No external search, external model, purchase links, or scientific publication.
 * --registry must be locally held JSON; the fixture registry is NOT reviewed.
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {newRequestSession164,advanceUserRequest164,resolveBudgetRevision164,
 registerUserCandidates164} from '../dist/src/phase164_user_request_journey.js';
const digest=s=>createHash('sha256').update(s).digest('hex');
function options(args){
 const allowed=new Set(['--registry','--turns','--out']);
 if(args.length!==6||args.some((x,i)=>i%2===0&&!allowed.has(x)))
  throw Error('usage: node scripts/phase164-request-journey.mjs --registry <file> --turns <file> --out <new-file>');
 const o={};for(let i=0;i<args.length;i+=2){if(o[args[i]])throw Error('duplicate_option');o[args[i]]=args[i+1];}
 if(Object.keys(o).length!==3)throw Error('missing_cli_arg');return o;
}
const args=options(process.argv.slice(2));
const registry=JSON.parse(readFileSync(resolve(args['--registry']),'utf8'));
const input=JSON.parse(readFileSync(resolve(args['--turns']),'utf8'));
if(!Array.isArray(registry.brains)||!Array.isArray(input.events)||input.events.length>1000||
  input.events.length===0)throw Error('invalid_registry_or_turns');
const output=resolve(args['--out']);if(existsSync(output))throw Error('output_exists_refusing_overwrite');
const sessions=new Map();const outcomes=[];let passed=0;
for(const e of input.events){
 const previous=sessions.get(e.sessionId)??newRequestSession164(e.sessionId);
 try{
  if(e.kind==='budget_reply'){
   const next=resolveBudgetRevision164(previous,{answerTurnId:e.turnId,requestTurnId:e.requestTurnId,
    removeLimit:e.removeLimit,userConfirmed:e.userConfirmed});
   sessions.set(e.sessionId,next);
   outcomes.push({sessionId:e.sessionId,turnId:e.turnId,kind:e.kind,
    action:e.removeLimit?'budget_revision_confirmed':'budget_revision_declined',
    activeCategoryId:next.activeCategoryId,rankingAuthorized:false});
  }else if(e.kind==='present_candidates'){
   const next=registerUserCandidates164(previous,{turnId:e.turnId,categoryId:e.categoryId,
    candidateIds:e.candidateIds,sourceSnapshotId:e.sourceSnapshotId,presentedToUser:true});
   sessions.set(e.sessionId,next);
   outcomes.push({sessionId:e.sessionId,turnId:e.turnId,kind:e.kind,action:'candidate_set_registered',
    activeCategoryId:next.activeCategoryId,rankingAuthorized:false});
  }else if(e.kind==='question'){
   const r=advanceUserRequest164(previous,{turnId:e.turnId,question:e.question,
    brains:registry.brains,language:e.language??'en',
    researchCatalog:registry.researchCatalog,catalogAsOf:registry.catalogAsOf});
   sessions.set(e.sessionId,r.session);
   outcomes.push({sessionId:e.sessionId,turnId:e.turnId,kind:e.kind,
    requestSha256:r.requestSha256,categoryId:r.categoryId,
    candidateResearchCategoryId:r.candidateResearchCategoryId,
    newCategoryTasks:r.research.newCategoryTasks,
    categoryProvenance:r.categoryProvenance,action:r.action,
    goals:r.extraction?.goals??[],aspects:r.extraction?.aspects??[],
    unhandledConstraintPhrases:r.unhandledConstraintPhrases,
    evidenceObligations:r.research.obligations,sourcePreference:r.sourcePreference,
    questionToUser:r.questionToUser,reasons:r.reasons,
    publicRecommendationAuthorized:r.publicRecommendationAuthorized});
  }else throw Error('unknown_event_kind');
  passed++;
 }catch(err){
  outcomes.push({sessionId:e.sessionId,turnId:e.turnId,kind:e.kind,
    error:String(err?.message??err),quarantined:true});
 }
}
const report={protocol:'pee.phase164.offline_journey.v1',
 fixtureOnly:registry.fixture_only===true||input.fixture_only===true,
 canonicalSourceFactsValidated:false,independentlyAdjudicatedLanguageBenchmark:false,
 modelExecutionPerformed:false,productRankingPerformed:false,
 registrySha256:digest(readFileSync(resolve(args['--registry']))),
 questionsSha256:digest(readFileSync(resolve(args['--turns']))),
 totals:{events:input.events.length,accepted:passed,quarantined:input.events.length-passed},
 outcomes};
writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
process.stdout.write(JSON.stringify({report:output,totals:report.totals})+'\n');
if(input.events.length!==passed)process.exitCode=1;
