import assert from 'node:assert/strict';
import { test } from './runAllTests';
import { parseToolCallsFromMarkdown } from '@/core/loop/toolCalls';

test('parseToolCallsFromMarkdown: parses valid json-tool write operation', async () => {
  const md = '```json-tool\n{"tool": "navigate", "params": {"op": "write", "path": "test.ts", "content": "console.log(\\"hello\\");"}}\n```';
  const result = parseToolCallsFromMarkdown(md);
  
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 1);
  assert.equal(result.errors.length, 0);
  
  const call = result.calls[0];
  if (!call) throw new Error('Call should be defined');
  assert.equal(call.tool, 'navigate');
  assert.equal(call.params.op, 'write');
  assert.equal(call.params.path, 'test.ts');
  assert.equal(call.params.content, 'console.log("hello");');
});

test('parseToolCallsFromMarkdown: handles incomplete json-tool write operation', async () => {
  const md = '```json-tool\n{"tool": "navigate", "params": {"op": "write", "path": "test.ts"}}\n```';
  const result = parseToolCallsFromMarkdown(md);
  
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 0);
  assert.equal(result.errors.length, 1);
  
  const error = result.errors[0];
  if (!error) throw new Error('Error should be defined');
  assert.equal(error.ok, false);
  assert.match(error.error, /navigate\.op=write requires params\.content/);
});

test('parseToolCallsFromMarkdown: parses multiple json-tool blocks', async () => {
  const md = `
    \`\`\`json-tool
    {"tool": "navigate", "params": {"op": "read", "path": "file.ts"}}
    \`\`\`
    
    Some text here
    
    \`\`\`json-tool
    {"tool": "navigate", "params": {"op": "write", "path": "out.ts", "content": "export const x = 1;"}}
    \`\`\`
  `;
  
  const result = parseToolCallsFromMarkdown(md);
  
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 2);
  assert.equal(result.errors.length, 0);
  
  const call1 = result.calls[0];
  const call2 = result.calls[1];
  if (!call1 || !call2) throw new Error('Calls should be defined');
  
  assert.equal(call1.params.op, 'read');
  assert.equal(call2.params.op, 'write');
});

test('parseToolCallsFromMarkdown: ignores regular json blocks', async () => {
  const md = `
    \`\`\`json
    {"tool": "navigate", "params": {"op": "write", "path": "test.ts", "content": "hello"}}
    \`\`\`
    
    \`\`\`json-tool
    {"tool": "navigate", "params": {"op": "read", "path": "file.ts"}}
    \`\`\`
  `;
  
  const result = parseToolCallsFromMarkdown(md);
  
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 1);
  const call = result.calls[0];
  if (!call) throw new Error('Call should be defined');
  assert.equal(call.params.op, 'read');
});

test('parseToolCallsFromMarkdown: handles invalid JSON', async () => {
  const md = '```json-tool\n{"tool": "navigate", "params": {"op": "write", "path": "test.ts", "content": }\n```';
  const result = parseToolCallsFromMarkdown(md);
  
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 0);
  assert.equal(result.errors.length, 1);
  
  const error = result.errors[0];
  if (!error) throw new Error('Error should be defined');
  assert.equal(error.ok, false);
  assert.match(error.error, /invalid JSON/);
});

test('parseToolCallsFromMarkdown: handles empty markdown', async () => {
  const md = '';
  const result = parseToolCallsFromMarkdown(md);
  
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 0);
  assert.equal(result.errors.length, 0);
});

test('parseToolCallsFromMarkdown: handles markdown without json-tool blocks', async () => {
  const md = `
    # Some markdown
    
    \`\`\`ts
    console.log("hello");
    \`\`\`
    
    Some text here
  `;
  
  const result = parseToolCallsFromMarkdown(md);
  
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 0);
  assert.equal(result.errors.length, 0);
});

test('parseToolCallsFromMarkdown: handles versionControl tool', async () => {
  const md = '```json-tool\n{"tool": "versionControl", "params": {"autoPush": true}}\n```';
  const result = parseToolCallsFromMarkdown(md);
  
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 1);
  assert.equal(result.errors.length, 0);
  
  const call = result.calls[0];
  if (!call) throw new Error('Call should be defined');
  assert.equal(call.tool, 'versionControl');
  assert.equal((call.params as any).autoPush, true);
});

test('parseToolCallsFromMarkdown: handles malformed json-tool block', async () => {
  const md = '```json-tool\nnot a json\n```';
  const result = parseToolCallsFromMarkdown(md);
  
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 0);
  assert.equal(result.errors.length, 1);
  
  const error = result.errors[0];
  if (!error) throw new Error('Error should be defined');
  assert.equal(error.ok, false);
  assert.match(error.error, /invalid JSON/);
});
