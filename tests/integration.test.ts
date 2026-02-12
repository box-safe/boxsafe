import assert from 'node:assert/strict';
import { test } from './runAllTests';
import { parseToolCallsFromMarkdown } from '@/core/loop/toolCalls';

test('integration: end-to-end json-tool parsing validation', async () => {
  // Test the exact scenario from the real problem
  const realWorldMarkdown = '```json-tool\n{"tool": "navigate", "params": {"op": "write", "path": "lv_test.ts"}}\n```\n```ts\nconsole.log("hello world");\n```';
  
  const result = parseToolCallsFromMarkdown(realWorldMarkdown);
  
  // Should detect the json-tool but report error due to missing content
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 0, 'Should have no valid calls due to missing content');
  assert.equal(result.errors.length, 1, 'Should have one error for incomplete json-tool');
  
  const error = result.errors[0];
  if (!error) throw new Error('Error should be defined');
  assert.equal(error.ok, false);
  assert.match(error.error, /navigate\.op=write requires params\.content/);
  assert.match(error.fence, /lv_test\.ts/);
});

test('integration: complete valid json-tool workflow', async () => {
  // Test with a complete, valid json-tool
  const validMarkdown = '```json-tool\n{"tool": "navigate", "params": {"op": "write", "path": "test.ts", "content": "console.log(\\"hello\\");"}}\n```\n```ts\nconsole.log("regular code");\n```';
  
  const result = parseToolCallsFromMarkdown(validMarkdown);
  
  // Should successfully parse the valid json-tool
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 1, 'Should have one valid call');
  assert.equal(result.errors.length, 0, 'Should have no errors');
  
  const call = result.calls[0];
  if (!call) throw new Error('Call should be defined');
  assert.equal(call.tool, 'navigate');
  assert.equal(call.params.op, 'write');
  assert.equal(call.params.path, 'test.ts');
  assert.equal(call.params.content, 'console.log("hello");');
});

test('integration: multiple mixed tool calls', async () => {
  // Test with multiple tool calls including different operations
  const complexMarkdown = `
    \`\`\`json-tool
    {"tool": "navigate", "params": {"op": "read", "path": "config.json"}}
    \`\`\`
    
    Some documentation text
    
    \`\`\`json-tool
    {"tool": "navigate", "params": {"op": "write", "path": "output.ts", "content": "export const x = 1;"}}
    \`\`\`
    
    \`\`\`json-tool
    {"tool": "versionControl", "params": {"autoPush": false}}
    \`\`\`
    
    \`\`\`ts
    // Regular code block
    const y = 2;
    \`\`\`
  `;
  
  const result = parseToolCallsFromMarkdown(complexMarkdown);
  
  // Should parse all valid tool calls
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 3, 'Should have three valid calls');
  assert.equal(result.errors.length, 0, 'Should have no errors');
  
  // Verify each call
  const readCall = result.calls.find(c => c.params.op === 'read');
  const writeCall = result.calls.find(c => c.params.op === 'write');
  const vcCall = result.calls.find(c => c.tool === 'versionControl');
  
  if (!readCall || !writeCall || !vcCall) throw new Error('All calls should be defined');
  
  assert.equal(readCall.params.path, 'config.json');
  assert.equal(writeCall.params.path, 'output.ts');
  assert.equal(writeCall.params.content, 'export const x = 1;');
  assert.equal((vcCall.params as any).autoPush, false);
});
