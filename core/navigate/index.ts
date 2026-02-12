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

export { Navigator, createNavigator } from '@core/navigate/navigator';
export { NavigatorHandler, createNavigatorHandler } from '@core/navigate/handler';
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
} from '@core/navigate/types';
export type { NavigatorOperationParams } from '@core/navigate/handler';
