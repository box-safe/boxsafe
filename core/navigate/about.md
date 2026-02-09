# Navigate Module

File system navigation system with safety boundaries for LLM-driven operations.

## Purpose

Provides a robust, type-safe interface for an LLM to:
- List directory contents
- Read file contents
- Write/create files
- Create directories
- Delete files and directories
- Get file/directory metadata

All operations are confined to a workspace boundary and validated.

## Architecture

```
navigator.ts (main class)
├─ listDirectory()
├─ readFile()
├─ writeFile()
├─ createDirectory()
├─ delete()
└─ getMetadata()

handler.ts (sgmnt integration)
└─ NavigatorHandler.execute(params)

utils.ts (security & validation)
├─ isWithinWorkspace()
├─ resolvePath()
├─ checkFileSize()
└─ isReadable/isWritable()

types.ts (exported interfaces)
├─ NavigatorConfig
├─ NavigatorResult
└─ FileSystemEntry
```

## Quick Start

```typescript
import { createNavigator } from '@core/navigate';

const nav = createNavigator({ workspace: '/app' });

// List files
const dir = await nav.listDirectory('src');
if (dir.ok) {
  console.log(dir.entries);
}

// Read file
const file = await nav.readFile('src/main.ts');
if (file.ok) {
  console.log(file.content);
}

// Write file
const write = await nav.writeFile('src/out.ts', 'export const x = 1;', {
  createDirs: true,
});

// Create directory
const mkdir = await nav.createDirectory('src/utils');

// Get metadata
const stat = await nav.getMetadata('src/main.ts');

// Delete
const del = await nav.delete('src/temp', { recursive: true });
```

## Integration with sgmnt

Can be integrated into the segmentation map for unified command routing:

```typescript
const handler = createNavigatorHandler(workspace);

await handler.execute({
  op: 'write',
  path: 'src/file.ts',
  content: '...',
  writeOptions: { createDirs: true }
});
```

## Safety Features

1. **Workspace Boundary** - All paths validated to stay within workspace
2. **Size Limits** - File reads limited to 10MB default (configurable)
3. **Permission Checks** - Validates read/write permissions before operations
4. **Path Validation** - Prevents directory traversal attacks
5. **Structured Errors** - Clear, machine-readable error results

## Error Handling

All operations return `NavigatorResult` - either success or error:

```typescript
type NavigatorResult = 
  | DirectoryListing 
  | FileReadResult 
  | FileWriteResult 
  | DirectoryCreateResult 
  | DeleteResult 
  | MetadataResult
  | OperationError;

if (result.ok) {
  // Success - type is narrowed to specific result type
} else {
  // Error
  console.error(result.error);
}
```

## Performance Notes

- No blocking operations
- Async/await throughout
- Efficient directory sorting (dirs first, then alphabetical)
- Metadata included with directory listings for smart filtering
- File read limited by configurable size limit
