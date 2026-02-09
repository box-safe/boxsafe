/**
 * @fileoverview
 * Utility functions for path validation and security checks.
 *
 * @module core/navigate/utils
 */

import path from 'node:path';
import fs from 'node:fs';
import { accessSync, constants } from 'node:fs';

/**
 * Validates that a given path is within the workspace boundary.
 * Prevents directory traversal attacks and unauthorized access.
 *
 * @param targetPath - The path to validate
 * @param workspace - The workspace root path
 * @returns true if path is within workspace, false otherwise
 */
export function isWithinWorkspace(targetPath: string, workspace: string): boolean {
  try {
    const absTarget = path.resolve(targetPath);
    const absWorkspace = path.resolve(workspace);
    const relative = path.relative(absWorkspace, absTarget);

    // If relative path starts with '..', it's outside workspace
    return !relative.startsWith('..');
  } catch {
    return false;
  }
}

/**
 * Normalizes and resolves a path relative to workspace.
 * Handles both absolute and relative paths.
 *
 * @param inputPath - The path to normalize
 * @param workspace - The workspace root path
 * @returns Absolute resolved path, or error message
 */
export function resolvePath(inputPath: string, workspace: string): { ok: true; path: string } | { ok: false; error: string } {
  try {
    const resolved = path.isAbsolute(inputPath)
      ? path.resolve(inputPath)
      : path.resolve(workspace, inputPath);

    if (!isWithinWorkspace(resolved, workspace)) {
      return {
        ok: false,
        error: `Access denied: path outside workspace boundary (${resolved})`,
      };
    }

    return { ok: true, path: resolved };
  } catch (err: any) {
    return {
      ok: false,
      error: `Failed to resolve path: ${err?.message ?? 'unknown error'}`,
    };
  }
}

/**
 * Checks if a path is readable.
 * Safely handles permission errors.
 *
 * @param filePath - The path to check
 * @returns true if readable, false otherwise
 */
export function isReadable(filePath: string): boolean {
  try {
    accessSync(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a path is writable.
 * Safely handles permission errors.
 *
 * @param filePath - The path to check
 * @returns true if writable, false otherwise
 */
export function isWritable(filePath: string): boolean {
  try {
    accessSync(filePath, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a file size exceeds the maximum allowed.
 *
 * @param filePath - The path to check
 * @param maxSize - Maximum allowed size in bytes
 * @returns { ok: true; size: number } or { ok: false; error: string }
 */
export function checkFileSize(
  filePath: string,
  maxSize: number
): { ok: true; size: number } | { ok: false; error: string } {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > maxSize) {
      return {
        ok: false,
        error: `File size exceeds limit: ${stats.size} bytes > ${maxSize} bytes`,
      };
    }
    return { ok: true, size: stats.size };
  } catch (err: any) {
    return {
      ok: false,
      error: `Failed to check file size: ${err?.message ?? 'unknown'}`,
    };
  }
}

/**
 * Sanitizes a filename to prevent directory traversal in filenames.
 *
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\]/g, '_') // Remove path separators
    .replace(/^\.|\.$/g, '') // Remove leading/trailing dots
    .replace(/^-/, '_'); // Remove leading dash
}

/**
 * Formats a path for display (makes it relative to workspace).
 *
 * @param absolutePath - The absolute path
 * @param workspace - The workspace root
 * @returns Display-friendly path
 */
export function formatPathDisplay(absolutePath: string, workspace: string): string {
  const relative = path.relative(workspace, absolutePath);
  return relative || '.';
}
