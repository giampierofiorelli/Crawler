/** Phase 87 companion bridge, for the TypeScript Product Evidence Engine.
 *  IMPORTANT: pass HTML ONLY AFTER Phase 69 readApprovedSource authorizes the
 *  exact URL, terms, rights, robots and operation. This adapter does not fetch.
 *  It does not depend on a paid API or a crawling framework.
 *  Kept separate until the unavailable v4.14 source tree can be integrated.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export type Phase87Action = 'inventory'|'suggest'|'qualify'|'review'|'extract'|
                            'install'|'extract_stored'|'status';
export interface Phase87Response<T> {ok: true; result: T}
export interface Phase87Failure {ok: false; error: string}

export async function phase87Call<T>(action: Phase87Action, payload: Record<string, unknown>,
    options: { python?: string; timeoutMs?: number } = {}): Promise<T> {
  const encoded = JSON.stringify(payload);
  if (Buffer.byteLength(encoded, 'utf8') > 8 * 750_000) throw new Error('phase87_payload_too_large');
  const timeoutMs = options.timeoutMs ?? (action === 'suggest' ? 20_000 : 10_000);
  if (timeoutMs < 1000 || timeoutMs > 70_000) throw new Error('phase87_invalid_timeout');
  const python = options.python ?? 'python3';
  return await new Promise<T>((resolvePromise, reject) => {
    const child = spawn(python, ['-m', 'phase87.cli', action], {
      cwd: ROOT, stdio: ['pipe','pipe','pipe'], shell: false,
      env: {...process.env, PYTHONPATH: ROOT}
    });
    let stdout = '', stderr = '', ended = false;
    const timer = setTimeout(() => { child.kill(); finish(new Error('phase87_timeout')); }, timeoutMs);
    function finish(error?: Error, value?: T) {
      if (ended) return;
      ended = true;
      clearTimeout(timer);
      if (error) reject(error); else resolvePromise(value as T);
    }
    child.on('error', err => finish(err));
    child.stdout.on('data', (buf: Buffer) => {
      stdout += buf.toString('utf8');
      if (stdout.length > 200_000) {child.kill();finish(new Error('phase87_response_too_large'));}
    });
    child.stderr.on('data', (buf: Buffer) => {
      stderr += buf.toString('utf8');
      if (stderr.length > 2000) stderr = stderr.slice(0,2000);
    });
    child.on('close', code => {
      try {
        const result = JSON.parse(stdout) as Phase87Response<T>|Phase87Failure;
        if (code !== 0 || !result.ok) {
          finish(new Error(!result.ok ? `phase87_${result.error}` : 'phase87_process_failed'));
        } else finish(undefined, result.result);
      } catch {finish(new Error('phase87_invalid_bridge_output'));}
    });
    child.stdin.on('error', () => {});
    child.stdin.end(encoded);
  });
}
