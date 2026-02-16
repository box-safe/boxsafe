# Improved Prompt Example - BoxSafe

## Current Prompt (PROBLEMATIC):
```typescript
const promptToSend = `${feedback}\n\nYou may optionally emit tool calls as JSON fenced blocks (\`\`\`json-tool ...\`\`\`) BEFORE the final code block. If you do, set tool=\"navigate\" and params.op=\"write\" to create files. Then, ALWAYS end your response with exactly ONE code block in the language: ${lang}`;
```

## Improved Prompt (COMPLETE):

```typescript
const promptToSend = `${feedback}\n\nYou may optionally emit tool calls as JSON fenced blocks (\`\`\`json-tool ...\`\`\`) BEFORE the final code block.

## Tool Calls Available:

### File Operations (tool="navigate"):
- **Read file**: \`{"tool": "navigate", "params": {"op": "read", "path": "path/to/file"}}\`
- **Write file**: \`{"tool": "navigate", "params": {"op": "write", "path": "path/to/file", "content": "file content here"}}\`
- **Create directory**: \`{"tool": "navigate", "params": {"op": "mkdir", "path": "path/to/dir"}}\`
- **Delete**: \`{"tool": "navigate", "params": {"op": "delete", "path": "path/to/file"}}\`
- **List directory**: \`{"tool": "navigate", "params": {"op": "list", "path": "path/to/dir"}}\`

### Version Control (tool="versionControl"):
- \`{"tool": "versionControl", "params": {"autoPush": true}}\`

## Complete Example:
\`\`\`json-tool
{"tool": "navigate", "params": {"op": "write", "path": "example.ts", "content": "console.log('Hello World');"}}
\`\`\`

\`\`\`ts
// Regular code block continues here
export const x = 1;
\`\`\`

IMPORTANT: Always end your response with exactly ONE code block in the language: ${lang}`;
```

## Key Differences:

1. ✅ **Complete Example**: Shows all parameters including `content`
2. ✅ **Documentation**: Lists all available operations
3. ✅ **Context**: Explains what each parameter does
4. ✅ **Example**: Demonstrates real usage format
5. ✅ **Structure**: Organized and easy to understand

## Expected Result:
With this improved prompt, the agent would generate:
```json
{"tool": "navigate", "params": {"op": "write", "path": "lv_test.ts", "content": "console.log('hello world');"}}
```

Instead of the current (incomplete):
```json
{"tool": "navigate", "params": {"op": "write", "path": "lv_test.ts"}}
```
