import {routeCategory,planCategoryCapabilities,planPreventiveCategoryWork} from '../dist/src/category_cognitive_mesh.js';
const catalog=[{categoryId:'headphones',label:'Headphones',aliases:['over ear headphones'],status:'reviewed',registryVersion:2}];
const time='2026-10-10T19:00:00Z';
const cold=planCategoryCapabilities({label:'Dehumidifiers',catalog,asOf:time});
const after=planCategoryCapabilities({label:'Dehumidifiers',catalog,asOf:time,completionReceipts:[{categoryId:'provisional_dehumidifiers',capability:'category_identity',verifiedBy:'analyst',auditReference:'review_001',verifiedAt:time}]});
const known=planCategoryCapabilities({label:'Headphones',catalog,asOf:time});
const preventive=planPreventiveCategoryWork({catalog,asOf:'2026-10-10T19:00:00Z',maxTasks:2,gaps:[
 {categoryId:'headphones',criterion:'staleness',observedGap:true,observedAt:'2026-10-09T19:00:00Z',referenceId:'coverage_ticket_1'}]});
console.log(JSON.stringify({phase:73,status:'offline_research_planner_only',
 coldStart:routeCategory('Dehumidifiers',catalog),coldTasks:cold.tasks,
 nextReadyAfterExternalCategoryIdentityReview:after.tasks.filter(t=>t.status==='ready_for_research'),
 knownCategoryTasks:known.tasks,preventiveTasks:preventive,
 networkRequests:0,aiModelCalls:0,databaseTransactions:0,
 existingProductionRankingChanged:false},null,2));
