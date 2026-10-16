import test from 'node:test';import assert from 'node:assert/strict';
import {validateSourceDescriptor258,materialRoleFor196,descriptorFromRetained259} from '../src/phase258_source_contributions.js';
import {selectSourcesForJob258,emptySourceLedger258} from '../src/phase258_source_memory.js';
// Phase259 checkpoint B, written before the corrections. Rows imitate retained store metadata (no values).
const row=(o:Record<string,unknown>={})=>({productId:'prd_a',source_id:'src_www_maker_co_uk',url:'https://www.maker.co.uk/p/a',host:'www.maker.co.uk',source_type:'manufacturer',
 source_type_basis:'operator_asserted',attribution:'main_product',revision_id:'rev_1',sha256:'a'.repeat(64),fetched_at:'2026-10-14T10:00:00.000Z',state:'current',
 identity_state:'extracted_unverified',nd:3,declaredProperties:['Capacity','Price'],restricted:false,...o});

test('retained metadata becomes a descriptor without inventing anything; unknown roles stay unknown',()=>{
 const d=validateSourceDescriptor258(descriptorFromRetained259(row()));
 assert.deepEqual(d.roles,['manufacturer_specification']);
 assert.equal(d.publisherCountry,'unknown','a .co.uk host is not a country');assert.equal(d.language,'und');assert.equal(d.productMarket,'unknown');
 assert.deepEqual([d.access.rights,d.access.robots,d.originality],['unreviewed','unknown','unknown']);
 assert.deepEqual(d.retained,{revisionId:'rev_1',sha256:'a'.repeat(64),fetchedAt:'2026-10-14T10:00:00.000Z',revisionState:'current',sourceTypeRecorded:'manufacturer',
  roleBasis:'operator_asserted',attribution:'own_page',identityState:'extracted_unverified',criteriaDeclared:['budget_max','capacity_min'],hostAccess:'no_restriction_recorded'});
 for(const t of ['unknown','editorial','independent_original_test','reference_encyclopedia']){
  const u=validateSourceDescriptor258(descriptorFromRetained259(row({source_type:t})));
  assert.deepEqual(u.roles,['role_unknown'],t+' is not given a role by assumption');assert.equal(materialRoleFor196(u),'unclassified');}
 const h=validateSourceDescriptor258(descriptorFromRetained259(row({source_type_basis:'heuristic_unverified'})));assert.equal(h.retained?.roleBasis,'heuristic_unverified');
 const t=validateSourceDescriptor258(descriptorFromRetained259(row({attribution:'named_in_table',identity_state:'discovered'})));
 assert.equal(t.retained?.attribution,'table_column');assert.equal(t.retained?.identityState,'discovered');assert.equal(t.product.identityStatus,'unverified');
 const z=validateSourceDescriptor258(descriptorFromRetained259(row({nd:0,declaredProperties:[]})));assert.deepEqual(z.statementKinds,['not_retained']);
});
test('selection does not send research back to what is already read, to table attributions or to restricted hosts',()=>{
 const own=validateSourceDescriptor258(descriptorFromRetained259(row()));
 const shop=validateSourceDescriptor258(descriptorFromRetained259(row({source_id:'src_shop',url:'https://shop.example/a',host:'shop.example',source_type:'retailer',revision_id:'rev_2',declaredProperties:['Width']})));
 const table=validateSourceDescriptor258(descriptorFromRetained259(row({source_id:'src_table',url:'https://table.example/other-model',host:'table.example',source_type:'retailer',attribution:'named_in_table',revision_id:'rev_3',declaredProperties:[]})));
 const blocked=validateSourceDescriptor258(descriptorFromRetained259(row({source_id:'src_blocked',url:'https://blocked.example/a',host:'blocked.example',source_type:'retailer',revision_id:'rev_4',restricted:true,declaredProperties:[]})));
 const s=selectSourcesForJob258({job:{productId:'prd_a',criterion:'weight_max',gapKind:'missing_declaration'},descriptors:[own,shop,table,blocked],feedback:[],states:emptySourceLedger258(),maxSources:4});
 const why=(id:string)=>s.excluded.find(x=>x.sourceId===id)?.reason;
 assert.equal(why('src_www_maker_co_uk'),'already_read_without_criterion');assert.equal(why('src_shop'),'already_read_without_criterion');
 assert.equal(why('src_table'),'table_attribution_only');assert.equal(why('src_blocked'),'host_restricted');
 assert.equal(s.selected.length,0);assert.equal(s.noFreshCandidates,true,'say so instead of re-reading known pages');
 // A retained page that already declares the criterion is not a research target either: the value is already held.
 const w=selectSourcesForJob258({job:{productId:'prd_a',criterion:'width_max',gapKind:'declaration_conflict'},descriptors:[shop],feedback:[],states:emptySourceLedger258(),maxSources:2});
 assert.equal(w.excluded.find(x=>x.sourceId==='src_shop')?.reason,'already_retained_with_criterion');
});
test('descriptors without retained metadata keep working as in Phase258',()=>{
 const d=validateSourceDescriptor258({schema:'pee258.source-descriptor.v1',origin:'synthetic_fixture',descriptorId:'d_x',sourceId:'s_x',url:'https://x.example/p',
  roles:['manufacturer_specification'],statementKinds:['declared_specification'],publisherCountry:'GB',language:'en-GB',productMarket:'uk',product:{productId:'prd_a',identityStatus:'unverified'},
  testingConditions:{declared:false,conditionIds:[]},method:{described:false,referenceId:null},specialist:null,culturalTradition:null,sponsorship:'none_declared',originality:'original',
  derivedFrom:[],access:{rights:'unreviewed',robots:'unknown'},statement:null,limitations:[]});
 assert.equal(d.retained,undefined);
 const s=selectSourcesForJob258({job:{productId:'prd_a',criterion:'capacity_min',gapKind:'missing_declaration'},descriptors:[d],feedback:[],states:emptySourceLedger258(),maxSources:2});
 assert.equal(s.selected.length,1);assert.equal(s.noFreshCandidates,false);
});
test('a page shared by several products is scoped by product before URL de-duplication',()=>{
 const shared=(pid:string,attr:string)=>validateSourceDescriptor258(descriptorFromRetained259(row({productId:pid,source_id:'src_table',url:'https://table.example/model-x',host:'table.example',
  source_type:'retailer',attribution:attr,revision_id:'rev_9',declaredProperties:[]})));
 const s=selectSourcesForJob258({job:{productId:'prd_b',criterion:'power_min',gapKind:'missing_declaration'},descriptors:[shared('prd_x','main_product'),shared('prd_b','named_in_table')],
  feedback:[],states:emptySourceLedger258(),maxSources:2});
 assert.deepEqual(s.collapsed,[],'not folded into another product\'s record');
 assert.ok(s.excluded.some(x=>x.reason==='table_attribution_only'));assert.ok(s.excluded.some(x=>x.reason==='other_product'));
});
