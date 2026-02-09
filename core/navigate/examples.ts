/**
 * @fileoverview
 * Practical examples of using the Navigator module.
 * These examples show common use cases for LLM-driven file operations.
 *
 * @module core/navigate/examples
 */

import { createNavigator, createNavigatorHandler } from '@core/navigate';
import type { DirectoryListing, FileReadResult, FileWriteResult, MetadataResult } from '@core/navigate';

// Type guards for proper narrowing
const isDirectory = (result: any): result is DirectoryListing => result.ok && 'entries' in result;
const isFileRead = (result: any): result is FileReadResult => result.ok && 'content' in result;
const isFileWrite = (result: any): result is FileWriteResult => result.ok && 'created' in result;
const isMetadata = (result: any): result is MetadataResult => result.ok && 'stat' in result;
const isError = (result: any): result is { ok: false; error: string } => !result.ok;

// ============================================================================
// Example 1: Basic Setup and Directory Listing
// ============================================================================

async function example1_BasicListingAndExploration() {
  const nav = createNavigator({
    workspace: '/home/inky/Development/boxsafe',
  });

  // List root workspace
  const root = await nav.listDirectory('.');
  if (isDirectory(root)) {
    console.log(`Workspace has ${root.total} items:`);
    root.entries.forEach((entry) => {
      const icon = entry.type === 'directory' ? '📁' : '📄';
      const size = entry.size ? ` (${entry.size} bytes)` : '';
      console.log(`  ${icon} ${entry.name}${size}`);
    });
  }

  // Navigate to specific directory
  const srcDir = await nav.listDirectory('src');
  if (isDirectory(srcDir)) {
    console.log(`\nFound ${srcDir.total} items in src/`);
  }
}

// ============================================================================
// Example 2: Reading Multiple Files for Analysis
// ============================================================================

async function example2_ReadMultipleFilesForLLMAnalysis() {
  const nav = createNavigator({
    workspace: '/home/inky/Development/boxsafe',
  });

  // Read several related files
  const files = ['main.ts', 'types.d.ts', 'package.json'];
  const contents: Record<string, string> = {};

  for (const file of files) {
    const result = await nav.readFile(file);
    if (isFileRead(result)) {
      contents[file] = result.content;
      console.log(`Loaded ${file} (${result.size} bytes)`);
    } else if (!result.ok) {
      console.error(`Failed to read ${file}: ${result.error}`);
    }
  }

  // Now LLM can analyze all files together
  console.log('All files loaded for analysis');
  return contents;
}

// ============================================================================
// Example 3: Creating Project Structure
// ============================================================================

async function example3_CreateProjectStructure() {
  const nav = createNavigator({
    workspace: '/home/inky/Development/boxsafe',
  });

  // Create directory structure
  const dirs = [
    'output',
    'output/generated',
    'output/reports',
    'output/logs',
  ];

  for (const dir of dirs) {
    const result = await nav.createDirectory(dir, { recursive: true });
    if (isError(result)) {
      console.error(`Failed: ${result.error}`);
    } else {
      console.log(`Created: ${result.path}`);
    }
  }
}

// ============================================================================
// Example 4: Generate Multiple Code Files
// ============================================================================

async function example4_GenerateCodeFiles() {
  const nav = createNavigator({
    workspace: '/home/inky/Development/boxsafe',
  });

  const files = [
    {
      path: 'generated/types.ts',
      content: `export interface User { id: string; name: string; }`,
    },
    {
      path: 'generated/utils.ts',
      content: `export function formatName(name: string): string { return name.trim(); }`,
    },
    {
      path: 'generated/index.ts',
      content: `export * from './types';\nexport * from './utils';`,
    },
  ];

  for (const file of files) {
    const result = await nav.writeFile(file.path, file.content, {
      createDirs: true,
    });

    if (isError(result)) {
      console.error(`✗ Failed: ${result.error}`);
    } else {
      console.log(`✓ Created ${result.path}`);
    }
  }
}

// ============================================================================
// Example 5: Iterate and Update Files
// ============================================================================

async function example5_IterativeFileUpdates() {
  const nav = createNavigator({
    workspace: '/home/inky/Development/boxsafe',
  });

  // Read existing file
  const result = await nav.readFile('src/main.ts');
  if (!isFileRead(result)) {
    console.error(`Cannot read: ${isError(result) ? result.error : 'unknown'}`);
    return;
  }
  let content = result.content;
  const hasExport = content.includes('export');
  if (!hasExport) {
    // Add export if missing
    content = `export ${content}`;
  }

  // Write back with updated content
  const writeResult = await nav.writeFile('src/main.ts', content);
  if (isFileWrite(writeResult)) {
    console.log(`Updated ${writeResult.path} (${writeResult.size} bytes)`);
  } else if (isError(writeResult)) {
    console.error(`Write failed: ${writeResult.error}`);
  }
}

// ============================================================================
// Example 6: Check File Metadata Before Operations
// ============================================================================

async function example6_ValidateBeforeOperation() {
  const nav = createNavigator({
    workspace: '/home/inky/Development/boxsafe',
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
  });

  const filePath = 'src/large.json';

  // Check metadata first
  const stat = await nav.getMetadata(filePath);
  if (!isMetadata(stat)) {
    console.error(`File not found: ${isError(stat) ? stat.error : 'unknown'}`);
    return;
  }
  if (stat.stat.size > 1024 * 1024) {
    console.log(`File is ${stat.stat.size} bytes - may be too large`);
  }
  if (!stat.stat.isReadable) {
    console.error('File is not readable');
    return;
  }

  // Now safe to read
  const content = await nav.readFile(filePath);
  if (isFileRead(content)) {
    console.log('File content loaded:', content.content.slice(0, 100));
  }
}

// ============================================================================
// Example 7: LLM-Friendly Handler Integration
// ============================================================================

async function example7_HandlerIntegration() {
  const handler = createNavigatorHandler('/home/inky/Development/boxsafe');

  // Simple operations through handler
  const list = await handler.execute({
    op: 'list',
    path: 'src',
  });
  console.log(list);

  // Write with structured params
  const write = await handler.execute({
    op: 'write',
    path: 'output/result.ts',
    content: 'export const result = "success";',
    writeOptions: { createDirs: true },
  });
  console.log(write);

  // Read with error handling
  const read = await handler.execute({
    op: 'read',
    path: 'output/result.ts',
  });
  if (isError(read)) {
    console.log('Read error:', read.error);
  } else if (isFileRead(read)) {
    console.log('Content:', read.content);
  }

  // Delete operation
  const del = await handler.execute({
    op: 'delete',
    path: 'output/temp',
    deleteOptions: { recursive: true },
  });
  console.log(del);
}

// ============================================================================
// Example 8: Batch Operations with Error Recovery
// ============================================================================

async function example8_BatchOperationsWithRecovery() {
  const nav = createNavigator({
    workspace: '/home/inky/Development/boxsafe',
  });

  const operations = [
    { type: 'mkdir' as const, path: 'batch/level1' },
    { type: 'mkdir' as const, path: 'batch/level1/level2' },
    { type: 'write' as const, path: 'batch/file1.txt', content: 'content1' },
    { type: 'write' as const, path: 'batch/level1/file2.txt', content: 'content2' },
  ];

  const results = [];
  for (const op of operations) {
    try {
      let result;
      if (op.type === 'mkdir') {
        result = await nav.createDirectory(op.path, { recursive: true });
      } else if (op.type === 'write') {
        result = await nav.writeFile(op.path, op.content, { createDirs: true });
      }

      if (result?.ok) {
        results.push({ status: 'ok', op, result });
      } else if (isError(result)) {
        results.push({ status: 'error', op, error: result });
      }
    } catch (err) {
      results.push({ status: 'exception', op, error: err });
    }
  }

  console.log('Batch results:', results);
  return results;
}

// ============================================================================
// Example 9: Explore Directory Tree
// ============================================================================

async function example9_ExploreDirectoryTree() {
  const nav = createNavigator({
    workspace: '/home/inky/Development/boxsafe',
  });

  async function exploreTree(dirPath: string, depth: number = 0): Promise<void> {
    const indent = '  '.repeat(depth);

    const listing = await nav.listDirectory(dirPath);
    if (!isDirectory(listing)) {
      console.log(`${indent}ERROR: ${isError(listing) ? listing.error : 'unknown'}`);
      return;
    }

    for (const entry of listing.entries) {
      if (entry.type === 'directory') {
        console.log(`${indent}📁 ${entry.name}/`);
        if (depth < 2) await exploreTree(entry.path, depth + 1);
      } else {
        console.log(`${indent}📄 ${entry.name} (${entry.size ?? 0} bytes)`);
      }
    }
  }

  await exploreTree('.');
}

// ============================================================================
// Example 10: Validate Workspace Before Starting
// ============================================================================

async function example10_ValidateWorkspace() {
  const nav = createNavigator({
    workspace: '/home/inky/Development/boxsafe',
  });

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'types.d.ts',
  ];

  const required = [];
  for (const file of requiredFiles) {
    const stat = await nav.getMetadata(file);
    const exists = isMetadata(stat);
    const writable = exists ? stat.stat.isWritable : false;

    required.push({ file, exists, writable });
  }

  console.log('Workspace validation:', required);
  const allReady = required.every((r) => r.exists && r.writable);
  console.log(`Workspace ready: ${allReady}`);
  return allReady;
}

// ============================================================================
// Export all examples for testing
// ============================================================================

export const examples = {
  basicListing: example1_BasicListingAndExploration,
  readMultiple: example2_ReadMultipleFilesForLLMAnalysis,
  createStructure: example3_CreateProjectStructure,
  generateFiles: example4_GenerateCodeFiles,
  iterateUpdate: example5_IterativeFileUpdates,
  validateMetadata: example6_ValidateBeforeOperation,
  handlerIntegration: example7_HandlerIntegration,
  batchOperations: example8_BatchOperationsWithRecovery,
  exploreTree: example9_ExploreDirectoryTree,
  validateWorkspace: example10_ValidateWorkspace,
};
