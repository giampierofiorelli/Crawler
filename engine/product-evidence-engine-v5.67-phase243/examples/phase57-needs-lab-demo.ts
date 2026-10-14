/** Demonstration uses COMPLETELY INVENTED measurements and example.org URLs. */
import {bridgeNeedsToOriginalLab, type QuarantinedLabExport, type NeedToTestRule} from '../src/lab_needs_bridge.js';
import {headphonesNeedsPrototype} from '../src/needs_discovery.js';
const original:QuarantinedLabExport={
  source_kind:'original_independent_lab_measurements',review_only:true,
  ranking_input_approved:false,rights_status:'human_attested_not_cryptographically_verified',
  publisher_domain:'lab.example.org',input_sha256:'f'.repeat(64),
  measurements:[
    {record_id:'r1',original_test_id:'test_a',test_url:'https://lab.example.org/reviews/a',
      tested_variant:'headphone_a',criterion:'battery_runtime',measurement:20,unit:'hours',
      protocol_id:'battery_loop',protocol_version:'1',conditions:{codec:'aac',anc:'enabled'},
      tested_at:'2026-01-01T00:00:00Z'},
    {record_id:'r2',original_test_id:'test_b',test_url:'https://lab.example.org/reviews/b',
      tested_variant:'headphone_b',criterion:'battery_runtime',measurement:15,unit:'hours',
      protocol_id:'battery_loop',protocol_version:'1',conditions:{codec:'aac',anc:'enabled'},
      tested_at:'2026-01-01T00:00:00Z'},
  ],
};
const rule:NeedToTestRule={categoryId:'headphones',needId:'battery',measurementCriterion:'battery_runtime',
 unit:'hours',favourableDirection:'higher',protocolId:'battery_loop',protocolVersion:'1',
 conditions:{codec:'aac',anc:'enabled'},reviewReference:'illustrative_mapping_only'};
const result=bridgeNeedsToOriginalLab({category:headphonesNeedsPrototype,
  answers:{choices:{usage:'commute'},confirmInterpretation:true},
  exactVariantIds:['headphone_a','headphone_b'],export:original,mappingRules:[rule]});
console.log(JSON.stringify({notice:'SYNTHETIC RESEARCH ONLY: NO REAL PRODUCT RESULTS',...result},null,2));
