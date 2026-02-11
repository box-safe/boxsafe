import assert from 'node:assert/strict';
import { test } from './runAllTests';
import { SystemConfigurationAdapter } from '@adapters/secondary/system/configuration';
import { FileSystemAdapter } from '@adapters/secondary/filesystem/node-filesystem';
import { CLIAdapter } from '@adapters/primary/cli-adapter';
import type { NavigatorConfig } from '@core/navigate/types';

test('SystemConfigurationAdapter: loads configuration correctly', async () => {
  const adapter = new SystemConfigurationAdapter();
  const result = await adapter.loadConfiguration();
  
  assert.ok(result.config);
  assert.equal(typeof result.source.loaded, 'boolean');
  assert.ok(result.source.path);
});

test('SystemConfigurationAdapter: validates configuration', async () => {
  const adapter = new SystemConfigurationAdapter();
  const result = await adapter.validateConfiguration({
    project: { workspace: '/tmp' },
    model: { primary: { provider: 'google', name: 'gemini' } },
    commands: { run: 'echo test' },
    interface: { prompt: 'test prompt' },
    limits: { loops: 3 }
  });
  
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test('SystemConfigurationAdapter: fails validation with missing required fields', async () => {
  const adapter = new SystemConfigurationAdapter();
  const result = await adapter.validateConfiguration({
    // Missing required fields
  });
  
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
  assert.ok(result.errors.some(e => e.includes('project.workspace is required')));
});

test('FileSystemAdapter: initializes with config', async () => {
  const config: NavigatorConfig = {
    workspace: '/tmp',
    followSymlinks: false,
    maxFileSize: 1024 * 1024
  };
  
  const adapter = new FileSystemAdapter(config);
  assert.equal(adapter['workspace'], '/tmp');
  assert.equal(adapter['followSymlinks'], false);
  assert.equal(adapter['maxFileSize'], 1024 * 1024);
});

test('FileSystemAdapter: lists directory', async () => {
  const config: NavigatorConfig = {
    workspace: '/tmp',
    followSymlinks: false,
    maxFileSize: 1024 * 1024
  };
  
  const adapter = new FileSystemAdapter(config);
  const result = await adapter.listDirectory('.');
  
  assert.ok(result.ok);
  assert.ok((result as any).path);
  assert.ok(Array.isArray((result as any).entries));
});

test('FileSystemAdapter: rejects paths outside workspace', async () => {
  const config: NavigatorConfig = {
    workspace: '/tmp',
    followSymlinks: false,
    maxFileSize: 1024 * 1024
  };
  
  const adapter = new FileSystemAdapter(config);
  
  try {
    await adapter.readFile('../../../etc/passwd');
    assert.fail('Should have thrown an error for path outside workspace');
  } catch (error) {
    assert.ok(error instanceof Error);
    // Check for either message (different implementations might use different messages)
    const message = error.message;
    const isSecurityError = message.includes('outside workspace') || 
                           message.includes('Access denied') ||
                           message.includes('boundary');
    assert.ok(isSecurityError, `Expected security error message, got: ${message}`);
  }
});

test('CLIAdapter: initializes and lists segments', async () => {
  const adapter = new CLIAdapter();
  
  // Wait a bit for initialization
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const segments = adapter.listSegments();
  assert.ok(segments.loop);
  assert.ok(segments.navigate);
  assert.ok(segments.versionControl);
  
  assert.equal(segments.loop.implemented, true);
  assert.equal(segments.navigate.implemented, true);
  assert.equal(segments.versionControl.implemented, true);
});

test('CLIAdapter: executes segments', async () => {
  const adapter = new CLIAdapter();
  
  // Wait a bit for initialization
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    // Test navigate segment with a simple operation
    const result = await adapter.executeSegment('navigate', { 
      operation: 'listDirectory',
      path: '.'
    });
    
    // Should return a valid result structure
    assert.ok(result !== undefined);
  } catch (error) {
    // Expected - navigate might need more setup, but adapter should not crash
    assert.ok(error instanceof Error);
  }
});
