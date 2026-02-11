import assert from 'node:assert/strict';
import { test } from './runAllTests';
import { extractCode } from '@/util/extractCode';

test('extractCode: extracts explicit ts fenced block', async () => {
  const md = 'before\n\n```ts\nconsole.log("ok");\n```\n\nafter';
  const res = await extractCode(md, 'ts', { throwOnNotFound: true });
  assert.deepEqual(res, ['console.log("ok");']);
});

test('extractCode: uses alias typescript for ts fences', async () => {
  const md = '```typescript\nexport const x = 1;\n```';
  const res = await extractCode(md, 'ts', { throwOnNotFound: true });
  assert.deepEqual(res, ['export const x = 1;']);
});

test('extractCode: heuristic detects ts when fence has no language', async () => {
  const md = '```\ninterface A { x: number }\n```';
  const res = await extractCode(md, 'ts', { throwOnNotFound: true });
  assert.deepEqual(res, ['interface A { x: number }']);
});

test('extractCode: throwOnNotFound throws when no code present', async () => {
  const md = 'hello world';
  await assert.rejects(() => extractCode(md, 'ts', { throwOnNotFound: true }));
});
