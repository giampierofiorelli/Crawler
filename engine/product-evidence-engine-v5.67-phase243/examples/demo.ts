import { rank } from '../src/engine.js';
import { variants,evidence } from './fixture.js';
const result = rank(variants,evidence,{
  market:'UK',currency:'GBP',maxPrice:300,
  weights:{carpet:15,pet_hair:70,ease:15},requiredSpecifications:{cordless:true}
});
console.log(JSON.stringify(result,null,2));
