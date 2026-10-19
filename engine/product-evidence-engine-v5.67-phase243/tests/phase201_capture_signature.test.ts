import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,type KeyObject} from 'node:crypto';
import {signedByControlledCapture,type CaptureSigner201} from '../src/phase201_approved_origin_capture_bridge.js';
import {captureMessage200,type CaptureClaim200,type Signed200,type Anchor200} from '../src/phase200_signed_source_publication_gate.js';

const day='2026-10-10';
const claim:CaptureClaim200={schema:'pee200.capture.v1',evidenceId:'ev_one',kind:'publisher_original_document',
 sourceUrl:'https://lab.example.org/report',documentVersionId:'v1',variantId:'variant_one',
 sha256FullDocument:'a'.repeat(64),capturedAt:day,originCheck:'tls_origin_checked_by_controlled_fetcher',
 sourceContentType:'text/html'};
const ed=generateKeyPairSync('ed25519');const other=generateKeyPairSync('ed25519');
const pem=(k:KeyObject)=>k.export({type:'spki',format:'pem'}).toString();
const anchor=(o:Partial<Anchor200>={}):Anchor200=>({keyId:'capture_key',principalId:'capture_service',role:'controlled_capture',
 publicKeyPem:pem(ed.publicKey),activeFrom:'2026-01-01',activeThrough:'2026-12-31',...o});
const signer=(anchors:Anchor200[]):CaptureSigner201=>({sign:async()=>{throw Error('not used');},
 protectedPolicy:{policyId:'p',anchors,maximumCaptureAgeDays:30,maximumStatusAgeDays:30}});
const signed=(payload:CaptureClaim200,key=ed.privateKey,keyId='capture_key'):Signed200<CaptureClaim200>=>({payload,keyId,
 signatureBase64Url:sign(null,Buffer.from(captureMessage200(payload)),key).toString('base64url')});

test('201 capture signature: valid ed25519 signature by an active controlled_capture anchor verifies',()=>{
 assert.equal(signedByControlledCapture(signed(claim),signer([anchor()]),day),true);
});
test('201 capture signature: a tampered payload fails',()=>{
 const s=signed(claim);s.payload={...claim,sha256FullDocument:'b'.repeat(64)};
 assert.equal(signedByControlledCapture(s,signer([anchor()]),day),false);
});
test('201 capture signature: a signature by a different key fails',()=>{
 assert.equal(signedByControlledCapture(signed(claim,other.privateKey),signer([anchor()]),day),false);
});
test('201 capture signature: anchors with another role cannot authorise a capture',()=>{
 assert.equal(signedByControlledCapture(signed(claim),signer([anchor({role:'source_custody_reviewer'})]),day),false);
});
test('201 capture signature: the anchor must be active on the capture day (both bounds inclusive)',()=>{
 assert.equal(signedByControlledCapture(signed(claim),signer([anchor({activeFrom:'2026-10-11'})]),day),false);
 assert.equal(signedByControlledCapture(signed(claim),signer([anchor({activeThrough:'2026-10-09'})]),day),false);
 assert.equal(signedByControlledCapture(signed(claim),signer([anchor({activeFrom:day,activeThrough:day})]),day),true);
});
test('201 capture signature: unknown key id fails',()=>{
 assert.equal(signedByControlledCapture(signed(claim,ed.privateKey,'other_key'),signer([anchor()]),day),false);
});
test('201 capture signature: malformed signature or key id fails before verification',()=>{
 const s=signed(claim);
 assert.equal(signedByControlledCapture({...s,signatureBase64Url:s.signatureBase64Url.slice(1)},signer([anchor()]),day),false);
 assert.equal(signedByControlledCapture({...s,signatureBase64Url:s.signatureBase64Url.slice(0,85)+'+'},signer([anchor()]),day),false);
 assert.equal(signedByControlledCapture({...s,keyId:'Bad Key'},signer([anchor({keyId:'Bad Key'})]),day),false);
});
test('201 capture signature: non-ed25519 keys and unparsable PEM fail closed',()=>{
 const rsa=generateKeyPairSync('rsa',{modulusLength:2048});
 assert.equal(signedByControlledCapture(signed(claim),signer([anchor({publicKeyPem:pem(rsa.publicKey)})]),day),false);
 assert.equal(signedByControlledCapture(signed(claim),signer([anchor({publicKeyPem:'not a key'})]),day),false);
});
test('201 capture signature: missing or malformed policy fails closed',()=>{
 const s=signed(claim);
 assert.equal(signedByControlledCapture(s,{sign:async()=>{throw Error('x');},protectedPolicy:undefined as never},day),false);
 assert.equal(signedByControlledCapture(s,{sign:async()=>{throw Error('x');},
  protectedPolicy:{policyId:'p',anchors:'nope' as never,maximumCaptureAgeDays:1,maximumStatusAgeDays:1}},day),false);
 assert.equal(signedByControlledCapture(s,signer([anchor({publicKeyPem:undefined as never})]),day),false);
});
