/**
 * @fileoverview
 * Unit tests for the Navigator module.
 * Validates all operations in isolation.
 *
 * Run with: npm test navigate.test.ts
 */

import { createNavigator, createNavigatorHandler } from '@core/navigate';
import type {
  DirectoryListing,
  FileReadResult,
  FileWriteResult,
  DirectoryCreateResult,
  DeleteResult,
  MetadataResult,
} from '@core/navigate';
import path from 'node:path';
import fs from 'node:fs';

// Type guards for proper narrowing
const isDirectory = (result: any): result is DirectoryListing => result.ok && 'entries' in result;
const isFileRead = (result: any): result is FileReadResult => result.ok && 'content' in result;
const isFileWrite = (result: any): result is FileWriteResult => result.ok && 'created' in result;
const isDirectoryCreate = (result: any): result is DirectoryCreateResult => result.ok && !('entries' in result) && !('content' in result) && !('stat' in result);
const isDelete = (result: any): result is DeleteResult => result.ok && 'type' in result && 'deletedAt' in result;
const isMetadata = (result: any): result is MetadataResult => result.ok && 'stat' in result;
const isError = (result: any): result is { ok: false; error: string } => !result.ok;

/**
 * Test suite for Navigator class
 */
export const navigatorTests = {
  /**
   * Test: Creating navigator with invalid workspace
   */
  async testInvalidWorkspace() {
    console.log('[TEST] Invalid workspace path');
    try {
      createNavigator({
        workspace: '/nonexistent/path/to/workspace',
      });
      console.log('❌ FAIL: Should throw for nonexistent workspace');
      return false;
    } catch (err) {
      console.log('✓ PASS: Correctly rejects invalid workspace');
      return true;
    }
  },

  /**
   * Test: List directory
   */
  async testListDirectory() {
    console.log('[TEST] List directory');
    const tempDir = fs.mkdtempSync(path.join('/tmp', 'nav-test-'));
    try {
      // Create test files
      fs.writeFileSync(path.join(tempDir, 'file1.txt'), 'content');
      fs.mkdirSync(path.join(tempDir, 'subdir'));

      const nav = createNavigator({ workspace: tempDir });
      const result = await nav.listDirectory('.');

      if (!isDirectory(result)) {
        console.log(`❌ FAIL: ${isError(result) ? result.error : 'unexpected result'}`);
        return false;
      }

      if (result.total !== 2) {
        console.log(`❌ FAIL: Expected 2 entries, got ${result.total}`);
        return false;
      }

      const hasFile = result.entries.some((e: any) => e.name === 'file1.txt' && e.type === 'file');
      const hasDir = result.entries.some((e: any) => e.name === 'subdir' && e.type === 'directory');

      if (!hasFile || !hasDir) {
        console.log('❌ FAIL: Did not find expected entries');
        return false;
      }

      console.log('✓ PASS: Directory listing works correctly');
      return true;
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },

  /**
   * Test: Read file
   */
  async testReadFile() {
    console.log('[TEST] Read file');
    const tempDir = fs.mkdtempSync(path.join('/tmp', 'nav-test-'));
    try {
      const filePath = path.join(tempDir, 'test.txt');
      const content = 'Hello, World!';
      fs.writeFileSync(filePath, content);

      const nav = createNavigator({ workspace: tempDir });
      const result = await nav.readFile('test.txt');

      if (!isFileRead(result)) {
        console.log(`❌ FAIL: ${isError(result) ? result.error : 'unexpected result'}`);
        return false;
      }

      if (result.content !== content) {
        console.log(`❌ FAIL: Content mismatch`);
        return false;
      }

      if (result.size !== content.length) {
        console.log(`❌ FAIL: Size mismatch`);
        return false;
      }

      console.log('✓ PASS: File reading works correctly');
      return true;
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },

  /**
   * Test: Write file (new)
   */
  async testWriteFileNew() {
    console.log('[TEST] Write file (new)');
    const tempDir = fs.mkdtempSync(path.join('/tmp', 'nav-test-'));
    try {
      const nav = createNavigator({ workspace: tempDir });
      const content = 'New file content';

      const result = await nav.writeFile('newfile.txt', content, { createDirs: true });

      if (!isFileWrite(result)) {
        console.log(`❌ FAIL: ${isError(result) ? result.error : 'unexpected result'}`);
        return false;
      }

      if (!result.created) {
        console.log('❌ FAIL: Should mark file as created');
        return false;
      }

      // Verify file exists
      const filePath = path.join(tempDir, 'newfile.txt');
      const exists = fs.existsSync(filePath);
      if (!exists) {
        console.log('❌ FAIL: File was not created');
        return false;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      if (fileContent !== content) {
        console.log('❌ FAIL: File content mismatch');
        return false;
      }

      console.log('✓ PASS: File writing (new) works correctly');
      return true;
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },

  /**
   * Test: Create directory
   */
  async testCreateDirectory() {
    console.log('[TEST] Create directory');
    const tempDir = fs.mkdtempSync(path.join('/tmp', 'nav-test-'));
    try {
      const nav = createNavigator({ workspace: tempDir });

      const result = await nav.createDirectory('level1/level2/level3', { recursive: true });

      if (!isDirectoryCreate(result)) {
        console.log(`❌ FAIL: ${isError(result) ? result.error : 'unexpected result'}`);
        return false;
      }

      // Verify directory exists
      const dirPath = path.join(tempDir, 'level1/level2/level3');
      if (!fs.existsSync(dirPath)) {
        console.log('❌ FAIL: Directory was not created');
        return false;
      }

      console.log('✓ PASS: Directory creation works correctly');
      return true;
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },

  /**
   * Test: Delete file
   */
  async testDeleteFile() {
    console.log('[TEST] Delete file');
    const tempDir = fs.mkdtempSync(path.join('/tmp', 'nav-test-'));
    try {
      const filePath = path.join(tempDir, 'todelete.txt');
      fs.writeFileSync(filePath, 'content');

      const nav = createNavigator({ workspace: tempDir });
      const result = await nav.delete('todelete.txt');

      if (!isDelete(result)) {
        console.log(`❌ FAIL: ${isError(result) ? result.error : 'unexpected result'}`);
        return false;
      }

      if (result.type !== 'file') {
        console.log('❌ FAIL: Type should be file');
        return false;
      }

      // Verify file is gone
      if (fs.existsSync(filePath)) {
        console.log('❌ FAIL: File still exists');
        return false;
      }

      console.log('✓ PASS: File deletion works correctly');
      return true;
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },

  /**
   * Test: Security - prevent directory traversal
   */
  async testSecurityBoundary() {
    console.log('[TEST] Security boundary (prevent traversal)');
    const tempDir = fs.mkdtempSync(path.join('/tmp', 'nav-test-'));
    try {
      const nav = createNavigator({ workspace: tempDir });

      // Try to escape workspace
      const result = await nav.readFile('../../../etc/passwd');

      if (!isError(result)) {
        console.log('❌ FAIL: Should not allow directory traversal');
        return false;
      }

      if (result.error.includes('outside workspace')) {
        console.log('✓ PASS: Correctly blocks directory traversal');
        return true;
      } else {
        console.log('❌ FAIL: Wrong error message:', result.error);
        return false;
      }
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },

  /**
   * Test: Get metadata
   */
  async testGetMetadata() {
    console.log('[TEST] Get metadata');
    const tempDir = fs.mkdtempSync(path.join('/tmp', 'nav-test-'));
    try {
      const filePath = path.join(tempDir, 'test.txt');
      const content = 'test content';
      fs.writeFileSync(filePath, content);

      const nav = createNavigator({ workspace: tempDir });
      const result = await nav.getMetadata('test.txt');

      if (!isMetadata(result)) {
        console.log(`❌ FAIL: ${isError(result) ? result.error : 'unexpected result'}`);
        return false;
      }

      if (result.stat.type !== 'file') {
        console.log('❌ FAIL: Type should be file');
        return false;
      }

      if (result.stat.size !== content.length) {
        console.log('❌ FAIL: Size mismatch');
        return false;
      }

      if (!result.stat.isReadable) {
        console.log('❌ FAIL: Should be readable');
        return false;
      }

      console.log('✓ PASS: Metadata retrieval works correctly');
      return true;
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },

  /**
   * Test: Handler integration
   */
  async testHandlerIntegration() {
    console.log('[TEST] Handler integration');
    const tempDir = fs.mkdtempSync(path.join('/tmp', 'nav-test-'));
    try {
      const handler = createNavigatorHandler(tempDir);

      // Test list operation
      const listResult = await handler.execute({
        op: 'list',
        path: '.',
      });

      if (!isDirectory(listResult)) {
        console.log(`❌ FAIL: ${isError(listResult) ? listResult.error : 'unexpected result'}`);
        return false;
      }

      // Test write operation
      const writeResult = await handler.execute({
        op: 'write',
        path: 'test.txt',
        content: 'handler test',
      });

      if (!isFileWrite(writeResult)) {
        console.log(`❌ FAIL: ${isError(writeResult) ? writeResult.error : 'unexpected result'}`);
        return false;
      }

      console.log('✓ PASS: Handler integration works correctly');
      return true;
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },
};

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🧪 Running Navigator Tests\n');

  const tests = Object.entries(navigatorTests);
  let passed = 0;
  let failed = 0;

  for (const [name, test] of tests) {
    try {
      const result = await test();
      if (result) passed++;
      else failed++;
    } catch (err: any) {
      console.log(`❌ EXCEPTION: ${err?.message ?? err}`);
      failed++;
    }
    console.log('');
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
  return failed === 0;
}
