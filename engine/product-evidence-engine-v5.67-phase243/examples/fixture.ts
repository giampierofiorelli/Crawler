import type { Variant, Evidence, Dimension } from '../src/types.js';
export const variants: Variant[] = [
  {id:'A-UK',familyId:'A',market:'UK',sku:'SYN-A-UK',price:199,currency:'GBP',specifications:{cordless:true}},
  {id:'B-UK',familyId:'B',market:'UK',sku:'SYN-B-UK',price:249,currency:'GBP',specifications:{cordless:true}},
  {id:'C-UK',familyId:'C',market:'UK',sku:'SYN-C-UK',price:149,currency:'GBP',specifications:{cordless:true}},
  {id:'A-US',familyId:'A',market:'US',sku:'SYN-A-US',price:210,currency:'USD',specifications:{cordless:true}}
];
const matrix: Record<string,Partial<Record<Dimension,number>>> = {
  'A-UK':{carpet:9,pet_hair:8,ease:4},
  'B-UK':{carpet:7,pet_hair:9,ease:8},
  'C-UK':{carpet:8,ease:9},
  'A-US':{carpet:10,pet_hair:10,ease:10}
};
export const evidence: Evidence[] = Object.entries(matrix).flatMap(([variant, scores]) =>
  Object.entries(scores).map(([dimension,value]) => ({
    id:`ev-${variant}-${dimension}`,originalTestId:`test-${variant}-${dimension}`,
    source:'SYNTHETIC TEST DATA',sourceUrl:'https://example.org/synthetic',
    testedVariantId:variant,applicableVariantIds:[variant],
    dimension:dimension as Dimension,value:value!,scale:'synthetic_0_10' as const,
    protocolId:'synthetic-protocol-v1',conditions:{mode:'synthetic'},
    status:'admitted' as const,rights:'authorized' as const
  })));
