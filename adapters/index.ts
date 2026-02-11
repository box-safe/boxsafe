/**
 * @fileoverview
 * Hexagonal architecture adapters - Concrete implementations of ports
 * 
 * Each adapter connects BoxSafe core with a specific Secondary Actor.
 * 
 * @module adapters/index
 */

// Secondary Adapters
export { SystemConfigurationAdapter } from '@adapters/secondary/system/configuration';
export { FileSystemAdapter } from '@adapters/secondary/filesystem/node-filesystem';

// Primary Adapters  
export { CLIAdapter } from '@adapters/primary/cli-adapter';

// Factory functions
export { createSystemConfigurationAdapter } from '@adapters/secondary/system/configuration';
export { createFileSystemAdapter } from '@adapters/secondary/filesystem/node-filesystem';
export { createCLIAdapter } from '@adapters/primary/cli-adapter';

// Re-export ports for convenience
export type {
  ISystemConfigurationPort,
  IFileSystemPort,
  ISystemExecutionPort
} from '../core/ports';
