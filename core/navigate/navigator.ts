/**
 * @fileoverview
 * Main file system navigator class for LLM-driven file operations.
 * Provides safe, validated methods for directory and file manipulation.
 *
 * @description
 * The Navigator class enforces workspace boundaries, validates operations,
 * and returns structured results suitable for LLM consumption and iteration.
 *
 * All paths are automatically validated and normalized.
 * Operations respect file size limits to prevent memory issues.
 *
 * @module core/navigate/navigator
 */

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import type {
  NavigatorConfig,
  NavigatorResult,
  DirectoryListing,
  FileReadResult,
  FileWriteResult,
  DirectoryCreateResult,
  DeleteResult,
  MetadataResult,
  OperationError,
  FileSystemEntry,
} from '@core/navigate/types';
import { Logger } from '@core/util/logger';
import {
  isWithinWorkspace,
  resolvePath,
  isReadable,
  isWritable,
  checkFileSize,
  sanitizeFilename,
  formatPathDisplay,
} from '@core/navigate/utils';

/**
 * File system navigator for safe LLM-driven file operations.
 * Enforces workspace boundaries and validates all operations.
 */
export class Navigator {
  private workspace: string;
  private followSymlinks: boolean;
  private maxFileSize: number;

  /**
   * Creates a new Navigator instance.
   *
   * @param config - Configuration options
   * @throws Error if workspace doesn't exist or is invalid
   */
  constructor(config: NavigatorConfig) {
    // Validate workspace directory exists
    const stats = fsSync.statSync(config.workspace);
    if (!stats.isDirectory()) {
      throw new Error(`Workspace path is not a directory: ${config.workspace}`);
    }

    this.workspace = path.resolve(config.workspace); // -- absolute path -- 
    this.followSymlinks = config.followSymlinks ?? false;
    this.maxFileSize = config.maxFileSize ?? 10 * 1024 * 1024; // 10MB default
    
    // Create logger directly
    const logger = Logger.createModuleLogger('Navigator');
    logger.debug(`Initialized with workspace: ${this.workspace}`);
  }

  /**
   * Lists the contents of a directory.
   *
   * @param dirPath - Path to the directory (absolute or relative to workspace)
   * @returns Structured result with directory contents or error
   */
  async listDirectory(dirPath: string = '.'): Promise<NavigatorResult> {
    try {
      // Resolve and validate path
      const pathResult = resolvePath(dirPath, this.workspace);
      if (!pathResult.ok) {
        return this.error('listDirectory', pathResult.error);
      }

      const targetPath = pathResult.path;

      // Verify it's a directory
      const stats = await fs.stat(targetPath);
      if (!stats.isDirectory()) {
        return this.error('listDirectory', 'Path is not a directory');
      }

      // Read directory contents
      const entries = await fs.readdir(targetPath, { withFileTypes: true });

      // Build file system entries with metadata
      const result: FileSystemEntry[] = [];
      for (const entry of entries) {
        try {
          const fullPath = path.join(targetPath, entry.name);
          const entryStats = await fs.stat(fullPath);

          const fsEntry: FileSystemEntry = {
            path: fullPath,
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            mtime: entryStats.mtimeMs,
            readable: isReadable(fullPath),
            writable: isWritable(fullPath),
          };

          // Only add size for files, not directories
          if (!entry.isDirectory()) {
            fsEntry.size = entryStats.size;
          }

          result.push(fsEntry);
        } catch (err: any) {
          Logger.createModuleLogger('Navigator').warn(`Failed to stat entry ${entry.name}: ${err?.message}`);
        }
      }

      // Sort: directories first, then alphabetically
      result.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return {
        ok: true,
        path: formatPathDisplay(targetPath, this.workspace),
        entries: result,
        total: result.length,
      } as DirectoryListing;
    } catch (err: any) {
      return this.error(
        'listDirectory',
        `Failed to list directory: ${err?.message ?? 'unknown error'}`
      );
    }
  }

  /**
   * Reads the content of a file.
   *
   * @param filePath - Path to the file (absolute or relative to workspace)
   * @returns Structured result with file content or error
   */
  async readFile(filePath: string): Promise<NavigatorResult> {
    try {
      // Resolve and validate path
      const pathResult = resolvePath(filePath, this.workspace);
      if (!pathResult.ok) {
        return this.error('readFile', pathResult.error);
      }

      const targetPath = pathResult.path;

      // Verify it's a file
      const stats = await fs.stat(targetPath);
      if (stats.isDirectory()) {
        return this.error('readFile', 'Path is a directory, not a file');
      }

      if (!isReadable(targetPath)) {
        return this.error('readFile', 'File is not readable (permission denied)');
      }

      // Check file size
      const sizeCheck = checkFileSize(targetPath, this.maxFileSize);
      if (!sizeCheck.ok) {
        return this.error('readFile', sizeCheck.error);
      }

      // Read file content
      const content = await fs.readFile(targetPath, 'utf-8');

      return {
        ok: true,
        path: formatPathDisplay(targetPath, this.workspace),
        content,
        size: sizeCheck.size,
        encoding: 'utf-8',
      } as FileReadResult;
    } catch (err: any) {
      return this.error(
        'readFile',
        `Failed to read file: ${err?.message ?? 'unknown error'}`
      );
    }
  }

  /**
   * Writes content to a file.
   * Creates the file if it doesn't exist, overwrites if it does.
   *
   * @param filePath - Path to the file (absolute or relative to workspace)
   * @param content - Content to write
   * @param options - Write options
   * @returns Structured result with operation details or error
   */
  async writeFile(
    filePath: string,
    content: string,
    options?: { append?: boolean; createDirs?: boolean }
  ): Promise<NavigatorResult> {
    try {
      // Resolve and validate path
      const pathResult = resolvePath(filePath, this.workspace);
      if (!pathResult.ok) {
        return this.error('writeFile', pathResult.error);
      }

      const targetPath = pathResult.path;

      // Check if file exists and is writable
      const fileExists = fsSync.existsSync(targetPath);
      if (fileExists) {
        const stats = fsSync.statSync(targetPath);
        if (stats.isDirectory()) {
          return this.error('writeFile', 'Path is a directory, not a file');
        }

        if (!isWritable(targetPath)) {
          return this.error(
            'writeFile',
            'File exists but is not writable (permission denied)'
          );
        }
      } else if (!options?.createDirs && !fsSync.existsSync(path.dirname(targetPath))) {
        return this.error(
          'writeFile',
          'Parent directory does not exist (use createDirs: true option)'
        );
      } else {
        const dirPath = path.dirname(targetPath);
        if (!fsSync.existsSync(dirPath)) {
          await fs.mkdir(dirPath, { recursive: true });
        }
      }

      // Write file
      if (options?.append && fileExists) {
        await fs.appendFile(targetPath, content, 'utf-8');
      } else {
        await fs.writeFile(targetPath, content, 'utf-8');
      }

      // Get final size
      const finalStats = await fs.stat(targetPath);

      return {
        ok: true,
        path: formatPathDisplay(targetPath, this.workspace),
        size: finalStats.size,
        created: !fileExists,
      } as FileWriteResult;
    } catch (err: any) {
      return this.error(
        'writeFile',
        `Failed to write file: ${err?.message ?? 'unknown error'}`
      );
    }
  }

  /**
   * Creates a new directory.
   *
   * @param dirPath - Path to the directory to create (absolute or relative to workspace)
   * @param options - Creation options
   * @returns Structured result with operation details or error
   */
  async createDirectory(
    dirPath: string,
    options?: { recursive?: boolean }
  ): Promise<NavigatorResult> {
    try {
      // Resolve and validate path
      const pathResult = resolvePath(dirPath, this.workspace);
      if (!pathResult.ok) {
        return this.error('createDirectory', pathResult.error);
      }

      const targetPath = pathResult.path;

      // Check if directory already exists
      if (fsSync.existsSync(targetPath)) {
        const stats = fsSync.statSync(targetPath);
        if (!stats.isDirectory()) {
          return this.error('createDirectory', 'Path exists but is not a directory');
        }

        return {
          ok: true,
          path: formatPathDisplay(targetPath, this.workspace),
          created: false,
        } as DirectoryCreateResult;
      }

      // Create directory
      await fs.mkdir(targetPath, { recursive: options?.recursive ?? true });

      return {
        ok: true,
        path: formatPathDisplay(targetPath, this.workspace),
        created: true,
      } as DirectoryCreateResult;
    } catch (err: any) {
      return this.error(
        'createDirectory',
        `Failed to create directory: ${err?.message ?? 'unknown error'}`
      );
    }
  }

  /**
   * Deletes a file or directory.
   *
   * @param targetPath - Path to delete (absolute or relative to workspace)
   * @param options - Deletion options
   * @returns Structured result with operation details or error
   */
  async delete(
    targetPath: string,
    options?: { recursive?: boolean }
  ): Promise<NavigatorResult> {
    try {
      // Resolve and validate path
      const pathResult = resolvePath(targetPath, this.workspace);
      if (!pathResult.ok) {
        return this.error('delete', pathResult.error);
      }

      const resolvedPath = pathResult.path;

      // Check if path exists
      if (!fsSync.existsSync(resolvedPath)) {
        return this.error('delete', 'Path does not exist');
      }

      const stats = fsSync.statSync(resolvedPath);
      const isDirectory = stats.isDirectory();

      // Delete based on type
      if (isDirectory) {
        if (options?.recursive ?? true) {
          await fs.rm(resolvedPath, { recursive: true, force: true });
        } else {
          await fs.rmdir(resolvedPath);
        }
      } else {
        await fs.unlink(resolvedPath);
      }

      return {
        ok: true,
        path: formatPathDisplay(resolvedPath, this.workspace),
        type: isDirectory ? 'directory' : 'file',
        deletedAt: Date.now(),
      } as DeleteResult;
    } catch (err: any) {
      return this.error(
        'delete',
        `Failed to delete: ${err?.message ?? 'unknown error'}`
      );
    }
  }

  /**
   * Gets metadata about a file or directory.
   *
   * @param targetPath - Path to get metadata for (absolute or relative to workspace)
   * @returns Structured result with metadata or error
   */
  async getMetadata(targetPath: string): Promise<NavigatorResult> {
    try {
      // Resolve and validate path
      const pathResult = resolvePath(targetPath, this.workspace);
      if (!pathResult.ok) {
        return this.error('getMetadata', pathResult.error);
      }

      const resolvedPath = pathResult.path;

      // Check if path exists
      if (!fsSync.existsSync(resolvedPath)) {
        return this.error('getMetadata', 'Path does not exist');
      }

      const stats = await fs.stat(resolvedPath);

      return {
        ok: true,
        path: formatPathDisplay(resolvedPath, this.workspace),
        stat: {
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          mtime: stats.mtimeMs,
          isReadable: isReadable(resolvedPath),
          isWritable: isWritable(resolvedPath),
        },
      } as MetadataResult;
    } catch (err: any) {
      return this.error(
        'getMetadata',
        `Failed to get metadata: ${err?.message ?? 'unknown error'}`
      );
    }
  }

  /**
   * Helper method to create error results.
   * @private
   */
  private error(operation: string, error: string): OperationError {
    Logger.createModuleLogger('Navigator').debug(`${operation} failed: ${error}`);
    return {
      ok: false,
      operation,
      error,
    };
  }
}

/**
 * Creates a new Navigator instance with the given configuration.
 *
 * @param config - Configuration options
 * @returns Navigator instance
 */
export function createNavigator(config: NavigatorConfig): Navigator {
  return new Navigator(config);
}
