/**
 * @fileoverview
 * Handler for file system navigation operations.
 * Integrates with the sgmnt (segmentation) system for unified LLM command routing.
 *
 * @module core/navigate/handler
 */

import type { NavigatorResult } from './types';
import { createNavigator, Navigator } from './navigator';

/**
 * Parameters for navigator operations.
 */
export interface NavigatorOperationParams {
  /** Operation type: 'list', 'read', 'write', 'mkdir', 'delete', 'stat' */
  op: 'list' | 'read' | 'write' | 'mkdir' | 'delete' | 'stat';

  /** File or directory path (required for all except 'list' with default) */
  path?: string;

  /** Content to write (required for 'write') */
  content?: string;

  /** Write options */
  writeOptions?: {
    append?: boolean;
    createDirs?: boolean;
  };

  /** Directory creation options */
  mkdirOptions?: {
    recursive?: boolean;
  };

  /** Delete options */
  deleteOptions?: {
    recursive?: boolean;
  };
}

/**
 * Handler for all navigation operations.
 * Provides a unified interface for LLM-driven file system access.
 */
export class NavigatorHandler {
  private navigator: Navigator;

  /**
   * Creates a handler instance.
   *
   * @param workspace - Workspace root path for all operations
   */
  constructor(workspace: string) {
    this.navigator = createNavigator({
      workspace,
      followSymlinks: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });
  }

  /**
   * Executes a navigation operation.
   *
   * @param params - Operation parameters
   * @returns Promise resolving to operation result
   */
  async execute(params: NavigatorOperationParams): Promise<NavigatorResult> {
    switch (params.op) {
      case 'list':
        return this.navigator.listDirectory(params.path || '.');

      case 'read':
        if (!params.path) {
          return {
            ok: false,
            operation: 'read',
            error: 'path is required for read operation',
          };
        }
        return this.navigator.readFile(params.path);

      case 'write':
        if (!params.path) {
          return {
            ok: false,
            operation: 'write',
            error: 'path is required for write operation',
          };
        }
        if (params.content === undefined) {
          return {
            ok: false,
            operation: 'write',
            error: 'content is required for write operation',
          };
        }
        return this.navigator.writeFile(params.path, params.content, params.writeOptions);

      case 'mkdir':
        if (!params.path) {
          return {
            ok: false,
            operation: 'mkdir',
            error: 'path is required for mkdir operation',
          };
        }
        return this.navigator.createDirectory(params.path, params.mkdirOptions);

      case 'delete':
        if (!params.path) {
          return {
            ok: false,
            operation: 'delete',
            error: 'path is required for delete operation',
          };
        }
        return this.navigator.delete(params.path, params.deleteOptions);

      case 'stat':
        if (!params.path) {
          return {
            ok: false,
            operation: 'stat',
            error: 'path is required for stat operation',
          };
        }
        return this.navigator.getMetadata(params.path);

      default:
        return {
          ok: false,
          operation: 'unknown',
          error: `unknown operation: ${(params as any).op}`,
        };
    }
  }
}

/**
 * Creates a handler instance bound to a workspace.
 *
 * @param workspace - Workspace root path
 * @returns NavigatorHandler instance
 */
export function createNavigatorHandler(workspace: string): NavigatorHandler {
  return new NavigatorHandler(workspace);
}
