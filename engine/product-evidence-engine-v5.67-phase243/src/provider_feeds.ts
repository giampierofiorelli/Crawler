/** Phase 35: offline, untrusted merchant feed parsing. No live APIs, scraping or rights inference. */
export type Provider = 'awin' | 'ebay';
export interface UnverifiedOfferCandidate {
  provider: Provider;
  sourceRecordId: string;
  merchantId: string;
  merchantSku: string | null;
  gtin: string | null;
  title: string;
  market: string;
  currency: string;
  itemPrice: number;
  shippingPrice: number | null;
  taxesIncluded: boolean | null;
  condition: 'new' | 'used' | 'refurbished' | 'unknown';
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
  productUrl: string;
  sourceObservedAt: string | null;
  identityVerified: false;
  rightsVerified: false;
  status: 'needs_human_review';
}
const numeric = (s: unknown): number | null => {
  if (s === null || s === undefined || String(s).trim() === '') return null;
  const n = Number(s); return Number.isFinite(n) && n >= 0 ? n : null;
};
const clean = (s: unknown): string => typeof s === 'string' ? s.trim() : '';
const safeUrl = (s: string): boolean => {
  try { const u = new URL(s); return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password; }
  catch { return false; }
};
/** Strict CSV reader: RFC4180-style quoted commas and escaped quotes; no silent partial parsing. */
export function readCsv(text: string): Record<string,string>[] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  for (let i=0; i<text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c==='"' && text[i+1]==='"') { cell+='"'; i++; }
      else if (c==='"') quoted=false;
      else cell+=c;
    } else if (c==='"') { if(cell!=='') throw new Error('Invalid CSV quoting'); quoted=true; }
    else if (c===',') { row.push(cell); cell=''; }
    else if (c==='\n' || c==='\r') { if(c==='\r'&&text[i+1]==='\n')i++; row.push(cell); rows.push(row); row=[]; cell=''; }
    else cell+=c;
  }
  if(quoted) throw new Error('Unterminated CSV quote');
  if(cell!==''||row.length){row.push(cell);rows.push(row);}
  if(!rows.length) return [];
  const header=rows.shift()!.map(h=>h.replace(/^\uFEFF/,'').trim());
  if(new Set(header).size!==header.length||header.some(h=>!h)) throw new Error('Invalid CSV headers');
  return rows.filter(r=>r.some(c=>c.trim())).map(r=>{
    if(r.length!==header.length) throw new Error('CSV row width mismatch');
    return Object.fromEntries(header.map((h,i)=>[h,r[i]]));
  });
}
export interface ParseResult { candidates: UnverifiedOfferCandidate[]; rejected: {index:number;reason:string}[] }
export function parseAwinCsv(text:string, market:string, currency:string, sourceTimestamp:string|null=null):ParseResult {
  const candidates:UnverifiedOfferCandidate[]=[];const rejected:ParseResult['rejected']=[];
  readCsv(text).forEach((r,index)=>{
    const merchantId=clean(r.merchant_id);const id=clean(r.aw_product_id)||clean(r.merchant_product_id);
    const price=numeric(r.search_price);const shipping=numeric(r.delivery_cost);
    const url=clean(r.aw_deep_link)||clean(r.merchant_deep_link);
    const condition=clean(r.condition).toLowerCase();
    if(!merchantId||!id||!clean(r.product_name)||price===null||!safeUrl(url)||clean(r.currency)!==currency){rejected.push({index,reason:'missing_or_invalid_required_fields'});return;}
    candidates.push({provider:'awin',sourceRecordId:id,merchantId,merchantSku:clean(r.merchant_product_id)||null,
      gtin:clean(r.product_GTIN)||clean(r.ean)||null,title:clean(r.product_name),market,currency,
      itemPrice:price,shippingPrice:shipping,taxesIncluded:null,
      condition:condition==='new'?'new':condition==='used'?'used':condition==='refurbished'?'refurbished':'unknown',
      availability:clean(r.in_stock).toLowerCase()==='1'||clean(r.in_stock).toLowerCase()==='true'?'in_stock':
        clean(r.in_stock).toLowerCase()==='0'||clean(r.in_stock).toLowerCase()==='false'?'out_of_stock':'unknown',
      productUrl:url,sourceObservedAt:sourceTimestamp,identityVerified:false,rightsVerified:false,status:'needs_human_review'});
  });
  return {candidates,rejected};
}
export function parseEbayItems(items:unknown, market:string, currency:string):ParseResult {
  if(!Array.isArray(items)) throw new Error('Expected eBay item array');
  const candidates:UnverifiedOfferCandidate[]=[];const rejected:ParseResult['rejected']=[];
  items.forEach((raw,index)=>{
    if(typeof raw!=='object'||raw===null){rejected.push({index,reason:'invalid_item'});return;}
    const r=raw as Record<string,unknown>;const priceObj=r.price as Record<string,unknown>|undefined;
    const itemPrice=numeric(priceObj?.value);const itemCurrency=clean(priceObj?.currency);
    const id=clean(r.itemId), title=clean(r.title), url=clean(r.itemWebUrl);
    const seller=(r.seller??{}) as Record<string,unknown>;const merchantId=clean(seller.username);
    if(!id||!title||!merchantId||itemPrice===null||itemCurrency!==currency||!safeUrl(url)){
      rejected.push({index,reason:'missing_or_invalid_required_fields'});return;
    }
    // eBay shipping and taxes are often location-dependent. Never infer them.
    const condition=clean(r.condition).toLowerCase();
    candidates.push({provider:'ebay',sourceRecordId:id,merchantId,merchantSku:null,gtin:null,title,market,currency,
      itemPrice,shippingPrice:null,taxesIncluded:null,
      condition:condition==='new'?'new':condition.includes('refurbished')?'refurbished':condition==='used'?'used':'unknown',
      availability:'unknown',productUrl:url,sourceObservedAt:null,identityVerified:false,rightsVerified:false,status:'needs_human_review'});
  });
  return {candidates,rejected};
}
