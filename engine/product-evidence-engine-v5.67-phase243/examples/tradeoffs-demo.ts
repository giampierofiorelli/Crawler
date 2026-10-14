import {discoverTradeoffs} from '../src/tradeoffs.js';
import {variants,evidence} from './fixture.js';
const request={market:'UK' as const,currency:'GBP',maxPrice:200,
 weights:{carpet:15,pet_hair:70,ease:15},requiredSpecifications:{cordless:true}};
const result=discoverTradeoffs(variants,evidence,request,{
 enabled:true,budgetIsHard:false,maxExtraPriceAbsolute:60,maxExtraPricePercent:30,minScoreGain:0.5
});
console.log(JSON.stringify({primary:result.primary,suggestions:result.suggestions,warnings:result.warnings},null,2));
