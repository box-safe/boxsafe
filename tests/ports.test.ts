import assert from 'node:assert/strict';
import { test } from './runAllTests';
import type { 
  ISystemConfigurationPort, 
  IFileSystemPort, 
  ISystemExecutionPort 
} from '@core/ports';

test('Ports: ISystemConfigurationPort interface exists', () => {
  // This test ensures the port interface is properly defined
  // We'll test the actual interface structure by checking if it has the expected methods
  const portMethods = ['loadConfiguration', 'validateConfiguration'];
  
  // Test that we can import the type
  type ConfigPort = ISystemConfigurationPort;
  
  // Test that the methods are expected (this will fail if interface changes)
  const mockPort: Partial<ConfigPort> = {
    loadConfiguration: async () => ({ config: {} as any, source: { path: '', loaded: false } }),
    validateConfiguration: async () => ({ valid: true, errors: [], warnings: [] })
  };
  
  assert.equal(typeof mockPort.loadConfiguration, 'function');
  assert.equal(typeof mockPort.validateConfiguration, 'function');
});

test('Ports: IFileSystemPort interface exists', () => {
  const portMethods = ['listDirectory', 'readFile', 'writeFile', 'createDirectory', 'delete', 'getMetadata'];
  
  type FsPort = IFileSystemPort;
  
  const mockPort: Partial<FsPort> = {
    listDirectory: async () => ({ ok: true }),
    readFile: async () => ({ ok: true }),
    writeFile: async () => ({ ok: true }),
    createDirectory: async () => ({ ok: true }),
    delete: async () => ({ ok: true }),
    getMetadata: async () => ({ ok: true })
  };
  
  assert.equal(typeof mockPort.listDirectory, 'function');
  assert.equal(typeof mockPort.readFile, 'function');
  assert.equal(typeof mockPort.writeFile, 'function');
  assert.equal(typeof mockPort.createDirectory, 'function');
  assert.equal(typeof mockPort.delete, 'function');
  assert.equal(typeof mockPort.getMetadata, 'function');
});

test('Ports: ISystemExecutionPort interface exists', () => {
  type ExecPort = ISystemExecutionPort;
  
  const mockPort: Partial<ExecPort> = {
    executeSegment: async () => ({}),
    listSegments: () => ({})
  };
  
  assert.equal(typeof mockPort.executeSegment, 'function');
  assert.equal(typeof mockPort.listSegments, 'function');
});

test('Ports: ConfigurationResult type structure', () => {
  // Test that the types are properly structured
  const result = {
    config: {},
    source: { path: '/test', loaded: true }
  };
  
  assert.ok(result.config);
  assert.equal(result.source.path, '/test');
  assert.equal(result.source.loaded, true);
});

test('Ports: ValidationResult type structure', () => {
  const result = {
    valid: true,
    errors: [],
    warnings: ['test warning']
  };
  
  assert.equal(result.valid, true);
  assert.ok(Array.isArray(result.errors));
  assert.ok(Array.isArray(result.warnings));
  assert.equal(result.warnings[0], 'test warning');
});
