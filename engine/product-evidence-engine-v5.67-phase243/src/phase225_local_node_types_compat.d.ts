/** Local dev-only compatibility for generic Node25 `generateKeyPairSync` return
 * widening compared with Node22 typings used in the canonical repository.
 * Doesn't alter code or runtime behavior. */
import type { KeyObject } from 'node:crypto';
declare module 'node:crypto' {
  function generateKeyPairSync(type:'ed25519'): { publicKey:KeyObject;privateKey:KeyObject; };
}
