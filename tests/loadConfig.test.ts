import assert from 'node:assert/strict';
import { test } from './runAllTests';
import path from 'node:path';
import fs from 'node:fs';
import { loadBoxSafeConfig } from '@core/config/loadConfig';

test('loadBoxSafeConfig: falls back to defaults when file does not exist', async () => {
  const res = loadBoxSafeConfig('/tmp/__boxsafe_config_does_not_exist__.json');
  assert.equal(res.source.loaded, false);
  assert.ok(res.config);
});

test('loadBoxSafeConfig: normalizes limits.loops from "infinity" to MAX_SAFE_INTEGER', async () => {
  const tmpDir = fs.mkdtempSync(path.join('/tmp', 'cfg-'));
  const cfgPath = path.join(tmpDir, 'boxsafe.config.json');
  fs.writeFileSync(cfgPath, JSON.stringify({ limits: { loops: 'infinity' } }), 'utf-8');

  try {
    const res = loadBoxSafeConfig(cfgPath);
    assert.equal(res.source.loaded, true);
    assert.equal(res.config.limits?.loops, Number.MAX_SAFE_INTEGER);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
