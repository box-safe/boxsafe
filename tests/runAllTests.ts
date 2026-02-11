import assert from 'node:assert/strict';

type TestFn = () => void | Promise<void>;

const tests: Array<{ name: string; fn: TestFn }> = [];

export function test(name: string, fn: TestFn) {
  tests.push({ name, fn });
}

async function run() {
  let passed = 0;
  let failed = 0;

  const files = [
    './tests/extractCode.test.ts',
    './tests/navigatorBoundary.test.ts',
    './tests/waterfall.test.ts',
    './tests/loadConfig.test.ts',
  ];

  for (const f of files) {
    await import(new URL(f, `file://${process.cwd()}/`).toString());
  }

  for (const t of tests) {
    try {
      await t.fn();
      passed++;
      console.log(`✓ ${t.name}`);
    } catch (err: any) {
      failed++;
      console.error(`✗ ${t.name}`);
      console.error(String(err?.stack ?? err));
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  assert.equal(failed, 0);
}

run();
