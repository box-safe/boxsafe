import { spawnSync } from 'node:child_process';
import path from 'node:path';
const target = path.join(path.dirname(new URL(import.meta.url).pathname), 'love_test.cjs');
const res = spawnSync('node', [target], { stdio: 'inherit' });
if (res.error) throw res.error;
process.exit(res.status ?? 0);
