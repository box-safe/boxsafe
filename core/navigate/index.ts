/**
 * @fileoverview
 * File system navigation module - public API exports.
 * 
 * Provides LLM-safe file and directory operations with workspace boundary enforcement.
 *
 * @module core/navigate
 * @example
 * ```typescript
 * import { createNavigator } from '@core/navigate';
 *
 * const nav = createNavigator({ workspace: '/app' });
 * const result = await nav.listDirectory('src');
 * ```
 */

export { Navigator, createNavigator } from './navigator';
export { NavigatorHandler, createNavigatorHandler } from './handler';
export type {
  NavigatorConfig,
  NavigatorResult,
  OperationResult,
  OperationError,
  DirectoryListing,
  FileReadResult,
  FileWriteResult,
  DirectoryCreateResult,
  DeleteResult,
  MetadataResult,
  FileSystemEntry,
} from './types';
export type { NavigatorOperationParams } from './handler';
