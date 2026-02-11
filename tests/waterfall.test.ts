import assert from 'node:assert/strict';
import { test } from './runAllTests';
import { waterfall } from '@core/loop/waterfall';
import fs from 'node:fs';
import path from 'node:path';

test('waterfall: fails critical on non-zero exit code', async () => {
  const res = await waterfall({
    exec: { exitCode: 1, stdout: '', stderr: '' },
    artifacts: {},
  });
  assert.equal(res.ok, false);
  assert.equal((res as any).layer, 'exit-code');
});

test('waterfall: passes with exitCode=0 and empty stderr (contracts disabled)', async () => {
  const prev = process.env.SUCCESS_CONTRACTS;
  process.env.SUCCESS_CONTRACTS = '';
  try {
    const res = await waterfall({
      exec: { exitCode: 0, stdout: '', stderr: '' },
      artifacts: {},
    });
    assert.equal(res.ok, true);
    assert.ok(res.score >= 70);
  } finally {
    if (prev === undefined) delete process.env.SUCCESS_CONTRACTS;
    else process.env.SUCCESS_CONTRACTS = prev;
  }
});

test('waterfall: artifacts check fails when outputFile is empty', async () => {
  const tmpDir = fs.mkdtempSync(path.join('/tmp', 'wf-'));
  const out = path.join(tmpDir, 'out.txt');
  fs.writeFileSync(out, '');

  const prev = process.env.SUCCESS_CONTRACTS;
  process.env.SUCCESS_CONTRACTS = '';
  try {
    const res = await waterfall({
      exec: { exitCode: 0, stdout: '', stderr: '' },
      artifacts: { outputFile: out },
    });
    // Artifacts layer is non-critical; score should still be computed.
    assert.equal(res.ok, true);
    assert.equal(res.breakdown.artifacts.passed, false);
  } finally {
    if (prev === undefined) delete process.env.SUCCESS_CONTRACTS;
    else process.env.SUCCESS_CONTRACTS = prev;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
