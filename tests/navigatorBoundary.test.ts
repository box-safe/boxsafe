import assert from 'node:assert/strict';
import { test } from './runAllTests';
import path from 'node:path';
import fs from 'node:fs';
import { createNavigator } from '@core/navigate';

test('Navigator: blocks directory traversal outside workspace', async () => {
  const tempDir = fs.mkdtempSync(path.join('/tmp', 'nav-boundary-'));
  try {
    const nav = createNavigator({ workspace: tempDir });
    const res = await nav.readFile('../../../etc/passwd');
    assert.equal(res.ok, false);
    assert.ok(String((res as any).error).includes('outside workspace'));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
