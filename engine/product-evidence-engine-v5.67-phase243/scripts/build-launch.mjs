import { rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
await rm('dist-launch', {recursive:true,force:true});
execFileSync('tsc',['-p','tsconfig.launch.json'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/verify-launch.mjs'],{stdio:'inherit'});
