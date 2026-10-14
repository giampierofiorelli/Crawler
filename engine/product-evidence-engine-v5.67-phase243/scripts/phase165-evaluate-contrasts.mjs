/** Offline diagnostic, constructed by developers. NOT independent user-query gold. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {composeQuestion125} from '../dist/src/phase125_compositional_dialogue_frame.js';
import {auditRequestContext165} from '../dist/src/phase165_request_context_audit.js';
const fixture=JSON.parse(readFileSync('research/phase165/PHASE165-CONSTRUCTED-CONTRASTS.json','utf8'));
if(fixture.kind!=='developer_constructed_contrast_cases_not_independent_gold'||fixture.cases.length>200)
 throw Error('invalid_constructed_fixture');
const schema={id:'coffee_machine',aliases:['coffee machine','espresso machine'],
 schemaReviewId:'phase165_developer_fixture_only',aspects:[
 {id:'steam_wand',kind:'capability',aliases:['steam wand'],evidenceKeys:['test_steam_wand']},
 {id:'quiet_operation',kind:'capability',aliases:['quiet'],evidenceKeys:['test_quiet']},
 {id:'app_control',kind:'capability',aliases:['app control'],evidenceKeys:['test_app']} ]};
const reports=[];
for(const item of fixture.cases){
 const frame=composeQuestion125(item.question,[schema]);
 const audit=auditRequestContext165(item.question,schema,frame);
 const observed=item.expected.startsWith('issue=')?
   audit.issues.map(x=>'issue='+x.code):
   audit.occurrences.map(x=>x.aspectId+'='+x.proposedMeaning);
 reports.push({id:item.id,group:item.group,questionSha256:createHash('sha256').update(item.question).digest('hex'),
   expected:item.expected,observed,matched:observed.includes(item.expected),
   frameCandidateRoles:frame.aspects.map(x=>({aspectId:x.aspectId,role:x.role})),
   issues:audit.issues.map(x=>x.code),corrections:audit.candidateCorrections.map(x=>x.effect),
   requiresReview:audit.requiresReview});
}
const totals={tested:reports.length,matched:reports.filter(x=>x.matched).length,
 mismatched:reports.filter(x=>!x.matched).map(x=>x.id),candidateCorrectionCount:reports.reduce((n,x)=>n+x.corrections.length,0)};
const result={phase:165,kind:'constructed_developer_cases_no_blind_evaluation',
 externalPerformanceClaimAuthorized:false,independentGoldCount:0,modelInferencePerformed:false,
 terms:'A match is an expected rule behavior for developer-written cases, not measured user-language accuracy',totals,reports};
const out=process.argv[2]??'/tmp/PEE-PHASE165-CONSTRUCTED-EVALUATION.json';
if(existsSync(out))throw Error('refuses_to_overwrite_existing_evaluation');
writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(totals));
