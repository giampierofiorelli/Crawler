#!/usr/bin/env node
/** Offline-only synthetic fixture evaluation of the actual Phase228 observer. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {observeDiscoveredDocuments228} from '../dist/src/phase228_document_observer.js';
const now='2026-10-13T20:00:00Z';
const sources=[['footwear','manuals.football.example.org','football_footwear','football-boots-specs.pdf'],
 ['bins','specs.bins.example.org','recycling_bins','waste-sorting-bin-specs.docx']];
const blob={footwear:readFileSync('evaluation/phase228/SYNTHETIC-football-boot-specifications.pdf'),
 bins:readFileSync('evaluation/phase228/SYNTHETIC-segregation-bin-specifications.docx')};
const regs=sources.map(([id,host,categoryId])=>({watch:{id,host,categoryId,
 channel:'manufacturer_product_index',mechanism:'approved_index_delta',tier:'exploration',
 rightsClearedForMetadata:false,nextCheckAt:now,lastCheckAt:null,quietChecks:0,errors:0},
 sitemapPath:'/sitemap.xml',pathPrefix:'/files/'}));
const urls=sources.map(([id,host,,name])=>({sourceId:id,url:`https://${host}/files/${name}`,verification:'unverified_url_only'}));
const registry={schema:'pee220.registry.1',vocabulary:[],sources:regs,policies:[]};
const run={schema:'pee220.run.1',mode:'synthetic_fixture',requestSha256:'synthetic',
 intent:{status:'needs_category',categoryId:null,slotValues:{},clarification:null,key:null,confirmedByUser:false},
 localIntake:{suggestionCount:0,unresolvedIssues:0},decision:'candidate_discovery_attempted',
 networkRequests:[],plannedSourceIds:[],sourceOutcomes:[],candidates:urls,limitations:[],
 rankingAuthorized:false,independentEvidenceVerified:false,
 checkpoint:{schema:'pee220.checkpoint.1',observations:[],watchSources:[],evidenceReceipts:[],rankingAuthorized:false}};
const transport={async get(url){
 if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'};
 const first=url.includes('football.example.org');const data=first?blob.footwear:blob.bins;
 return {status:200,finalUrl:url,contentType:first?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  body:'',rawBytes:data};
}};
const out=await observeDiscoveredDocuments228({run,registry,observedAt:now,mode:'synthetic_fixture',fixtureTransport:transport});
const result={notice:'SYNTHETIC FICTIONAL SOURCE DOCUMENTS, NO INTERNET ACQUISITION, NOT SCIENTIFIC EVIDENCE',
 observation:out,fixturePdf:'SYNTHETIC-football-boot-specifications.pdf',
 fixtureWord:'SYNTHETIC-segregation-bin-specifications.docx'};
mkdirSync('docs/phase228',{recursive:true});
writeFileSync('docs/phase228/PHASE228-SYNTHETIC-REPLAY.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({mode:out.mode,documents:out.receipts.length,candidateSpecificationClaims:out.receipts.reduce((n,x)=>n+x.claims.length,0),
 rankingAuthorized:out.rankingAuthorized,onlineAcquisitions:0}));
