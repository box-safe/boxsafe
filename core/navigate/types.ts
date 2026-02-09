/**
 * @fileoverview
 * Type definitions for the file system navigation module.
 * Provides structured interfaces for file operations and results.
 *
 * @module core/navigate/types
 */

/**
 * Represents a file system entry (file or directory).
 */
export interface FileSystemEntry {
  /** Absolute path to the entry */
  path: string;
  /** Name of the entry (filename or dirname) */
  name: string;
  /** Type of entry: 'file' or 'directory' */
  type: 'file' | 'directory';
  /** Size in bytes (files only) */
  size?: number;
  /** Unix timestamp of last modification */
  mtime?: number;
  /** Whether the path is readable */
  readable: boolean;
  /** Whether the path is writable */
  writable: boolean;
}

/**
 * Result of listing directory contents.
 */
export interface DirectoryListing {
  ok: true;
  path: string;
  entries: FileSystemEntry[];
  total: number;
}

/**
 * Result of reading a file.
 */
export interface FileReadResult {
  ok: true;
  path: string;
  content: string;
  size: number;
  encoding: 'utf-8';
}

/**
 * Result of writing a file.
 */
export interface FileWriteResult {
  ok: true;
  path: string;
  size: number;
  created: boolean;
}

/**
 * Result of creating a directory.
 */
export interface DirectoryCreateResult {
  ok: true;
  path: string;
  created: boolean;
}

/**
 * Result of deleting a file or directory.
 */
export interface DeleteResult {
  ok: true;
  path: string;
  type: 'file' | 'directory';
  deletedAt: number;
}

/**
 * Result of getting metadata.
 */
export interface MetadataResult {
  ok: true;
  path: string;
  stat: {
    type: 'file' | 'directory';
    size: number;
    mtime: number;
    isReadable: boolean;
    isWritable: boolean;
  };
}

/**
 * Unified error result for any operation failure.
 */
export interface OperationError {
  ok: false;
  operation: string;
  error: string;
}

/** Union of all possible successful operation results */
export type OperationResult =
  | DirectoryListing
  | FileReadResult
  | FileWriteResult
  | DirectoryCreateResult
  | DeleteResult
  | MetadataResult;

/** Union of all possible results (success or error) */
export type NavigatorResult = OperationResult | OperationError;

/**
 * Options for navigator initialization.
 */
export interface NavigatorConfig {
  /** Workspace root path - all operations must stay within this boundary */
  workspace: string;
  /** Whether to follow symbolic links (for security) */
  followSymlinks?: boolean;
  /** Maximum file size to read in bytes (prevents memory issues) */
  maxFileSize?: number;
  /** Logger instance for debugging */
  logger?: {
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
}
