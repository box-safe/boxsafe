/**
 * @fileoverview
 * Adapter for IFileSystemPort
 * Implementation based on existing navigate module
 * 
 * @module adapters/secondary/filesystem/node-filesystem
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { 
  IFileSystemPort,
  NavigatorResult,
  DirectoryListing,
  FileReadResult,
  FileWriteResult,
  DirectoryCreateResult,
  DeleteResult,
  MetadataResult,
  OperationError
} from '@core/ports';
import type { 
  FileSystemEntry,
  NavigatorConfig 
} from '@core/navigate/types';

/**
 * File system adapter using Node.js fs module
 */
export class FileSystemAdapter implements IFileSystemPort {
  private workspace: string;
  private followSymlinks: boolean;
  private maxFileSize: number;

  constructor(config: NavigatorConfig) {
    this.workspace = config.workspace;
    this.followSymlinks = config.followSymlinks ?? false;
    this.maxFileSize = config.maxFileSize ?? 10 * 1024 * 1024; // 10MB
  }

  /**
   * Lista conteúdo de um diretório
   */
  async listDirectory(dirPath: string): Promise<NavigatorResult> {
    try {
      const resolvedPath = this.resolvePath(dirPath);
      const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
      
      const fileSystemEntries: FileSystemEntry[] = [];
      
      for (const entry of entries) {
        const fullPath = path.join(resolvedPath, entry.name);
        const relativePath = path.relative(this.workspace, fullPath);
        
        try {
          const stats = await fs.stat(fullPath);
          
          fileSystemEntries.push({
            path: relativePath,
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: entry.isFile() ? stats.size : undefined,
            mtime: stats.mtime.getTime(),
            readable: await this.isReadable(fullPath),
            writable: await this.isWritable(fullPath)
          } as FileSystemEntry);
        } catch {
          // If stat fails, add basic entry
          fileSystemEntries.push({
            path: relativePath,
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            readable: false,
            writable: false
          } as FileSystemEntry);
        }
      }

      // Sort: directories first, then files, both alphabetically
      fileSystemEntries.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      const result: DirectoryListing = {
        ok: true,
        path: dirPath,
        entries: fileSystemEntries,
        total: fileSystemEntries.length
      };

      return result;
    } catch (error) {
      return this.createOperationError('listDirectory', error as Error);
    }
  }

  /**
   * Lê conteúdo de um arquivo
   */
  async readFile(filePath: string): Promise<NavigatorResult> {
    try {
      const resolvedPath = this.resolvePath(filePath);
      
      // Verificar tamanho do arquivo
      const stats = await fs.stat(resolvedPath);
      if (stats.size > this.maxFileSize) {
        throw new Error(`File too large: ${stats.size} bytes (max: ${this.maxFileSize})`);
      }

      const content = await fs.readFile(resolvedPath, 'utf-8');

      const result: FileReadResult = {
        ok: true,
        path: filePath,
        content,
        size: stats.size,
        encoding: 'utf-8'
      };

      return result;
    } catch (error) {
      return this.createOperationError('readFile', error as Error);
    }
  }

  /**
   * Write content to a file
   */
  async writeFile(filePath: string, content: string, options?: { append?: boolean; createDirs?: boolean }): Promise<NavigatorResult> {
    try {
      const resolvedPath = this.resolvePath(filePath);
      const dir = path.dirname(resolvedPath);

      // Create directories if necessary
      if (options?.createDirs) {
        await fs.mkdir(dir, { recursive: true });
      }

      // Check if directory exists
      try {
        await fs.access(dir);
      } catch {
        throw new Error(`Directory does not exist: ${dir}`);
      }

      // Write file
      if (options?.append) {
        await fs.appendFile(resolvedPath, content, 'utf-8');
      } else {
        await fs.writeFile(resolvedPath, content, 'utf-8');
      }

      const stats = await fs.stat(resolvedPath);
      const created = !options?.append;

      const result: FileWriteResult = {
        ok: true,
        path: filePath,
        size: stats.size,
        created
      };

      return result;
    } catch (error) {
      return this.createOperationError('writeFile', error as Error);
    }
  }

  /**
   * Create a directory
   */
  async createDirectory(dirPath: string, options?: { recursive?: boolean }): Promise<NavigatorResult> {
    try {
      const resolvedPath = this.resolvePath(dirPath);
      
      await fs.mkdir(resolvedPath, { recursive: options?.recursive ?? false });

      const stats = await fs.stat(resolvedPath);
      const created = true; // mkdir always creates or throws error

      const result: DirectoryCreateResult = {
        ok: true,
        path: dirPath,
        created
      };

      return result;
    } catch (error) {
      return this.createOperationError('createDirectory', error as Error);
    }
  }

  /**
   * Remove arquivo ou diretório
   */
  async delete(targetPath: string, options?: { recursive?: boolean }): Promise<NavigatorResult> {
    try {
      const resolvedPath = this.resolvePath(targetPath);
      const stats = await fs.stat(resolvedPath);
      const type = stats.isDirectory() ? 'directory' : 'file';

      if (type === 'directory' && options?.recursive) {
        await fs.rm(resolvedPath, { recursive: true, force: true });
      } else if (type === 'directory') {
        await fs.rmdir(resolvedPath);
      } else {
        await fs.unlink(resolvedPath);
      }

      const result: DeleteResult = {
        ok: true,
        path: targetPath,
        type,
        deletedAt: Date.now()
      };

      return result;
    } catch (error) {
      return this.createOperationError('delete', error as Error);
    }
  }

  /**
   * Obtém metadados de um arquivo/diretório
   */
  async getMetadata(targetPath: string): Promise<NavigatorResult> {
    try {
      const resolvedPath = this.resolvePath(targetPath);
      const stats = await fs.stat(resolvedPath);

      const result: MetadataResult = {
        ok: true,
        path: targetPath,
        stat: {
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          mtime: stats.mtime.getTime(),
          isReadable: await this.isReadable(resolvedPath),
          isWritable: await this.isWritable(resolvedPath)
        }
      };

      return result;
    } catch (error) {
      return this.createOperationError('getMetadata', error as Error);
    }
  }

  /**
   * Helper to resolve path within workspace
   */
  private resolvePath(targetPath: string): string {
    const resolved = path.resolve(this.workspace, targetPath);
    
    // Check if inside workspace (security)
    if (!resolved.startsWith(path.resolve(this.workspace))) {
      throw new Error('Path outside workspace is not allowed');
    }

    return resolved;
  }

  /**
   * Helper to check if path is readable
   */
  private async isReadable(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper to check if path is writable
   */
  private async isWritable(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper to create OperationError
   */
  private createOperationError(operation: string, error: Error): OperationError {
    return {
      ok: false,
      operation,
      error: error.message
    };
  }
}

/**
 * Factory function para criar o adapter
 */
export function createFileSystemAdapter(config: NavigatorConfig): FileSystemAdapter {
  return new FileSystemAdapter(config);
}
