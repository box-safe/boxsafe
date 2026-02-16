/**
 * @fileoverview
 * Ports da arquitetura hexagonal - Interfaces que definem contratos entre o core e o mundo externo
 * 
 * Baseado na estrutura existente do módulo sgmnt, adaptada para arquitetura hexagonal formal.
 * 
 * @module core/ports/index
 */

import type { BoxSafeConfig, CommandRun } from '../../types';
import type { LService, LModel } from '@ai/label';

// Re-export BoxSafeConfig for convenience
export type { BoxSafeConfig, CommandRun } from '../../types';

// Re-export navigate types for convenience
export type { 
  FileSystemEntry,
  NavigatorConfig,
  NavigatorResult,
  OperationResult,
  DirectoryListing,
  FileReadResult,
  FileWriteResult,
  DirectoryCreateResult,
  DeleteResult,
  MetadataResult,
  OperationError
} from '@core/navigate/types';

// ============================================================================
// PRIMARY PORTS - Interfaces for primary actors (CLI, Web, IDE, etc.)
// ============================================================================

/**
 * Main port for system execution - entry point for primary actors
 * Based on existing segment system
 */
export interface ISystemExecutionPort {
  /**
   * Executes a specific system segment
   * @param segmentName Name of the segment to be executed
   * @param args Arguments for the segment
   * @returns Execution result
   */
  executeSegment(segmentName: string, args?: any): Promise<any>;
  
  /**
   * Lists all available segments
   * @returns Map of available segments
   */
  listSegments(): Record<string, SegmentInfo>;
}

/**
 * Information about a segment
 */
export interface SegmentInfo {
  description: string;
  implemented: boolean;
  config?: any;
}

/**
 * Port for system configuration
 * Based on existing loadConfig
 */
export interface ISystemConfigurationPort {
  /**
   * Loads system configurations
   * @param configPath Optional path to configuration file
   * @returns Loaded configurations
   */
  loadConfiguration(configPath?: string): Promise<ConfigurationResult>;
  
  /**
   * Validates system configurations
   * @param config Configurations to be validated
   * @returns Validation result
   */
  validateConfiguration(config: BoxSafeConfig): Promise<ValidationResult>;
}

/**
 * Configuration loading result
 */
export interface ConfigurationResult {
  config: BoxSafeConfig;
  source: { path: string; loaded: boolean };
}

/**
 * Configuration validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// SECONDARY PORTS - Interfaces for secondary actors (FileSystem, AI, Git, etc.)
// ============================================================================

/**
 * Port for file system navigation
 * Based on existing navigate module
 */
export interface IFileSystemPort {
  /**
   * Lists directory contents
  listDirectory(path: string): Promise<any>;
  
  /**
   * Reads file contents
   */
  readFile(path: string): Promise<any>;
  
  /**
   * Writes content to a file
   */
  writeFile(path: string, content: string, options?: any): Promise<any>;
  
  /**
   * Creates a directory
   */
  createDirectory(path: string, options?: any): Promise<any>;
  
  /**
   * Removes file or directory
   */
  delete(path: string, options?: any): Promise<any>;
  
  /**
   * Gets metadata of a file/directory
   */
  getMetadata(path: string): Promise<any>;
}

/**
 * Port for AI model interaction
 * Based on existing model configuration
 */
export interface IAIModelPort {
  /**
   * Sends prompt to the model
   */
  sendPrompt(prompt: string, options?: any): Promise<any>;
  
  /**
   * Configures model to be used
   */
  configureModel(config: {
    provider: LService;
    name: LModel;
    parameters?: Record<string, unknown>;
  }): Promise<void>;
}

/**
 * Port for version control (Git)
 */
export interface IVersionControlPort {
  /**
   * Executes Git command
   */
  executeGitCommand(command: string, args?: string[]): Promise<any>;
  
  /**
   * Verifica status do repositório
   */
  getStatus(): Promise<any>;
  
  /**
   * Cria commit
   */
  commit(message: string, files?: string[]): Promise<any>;
  
  /**
   * Push para remoto
   */
  push(remote?: string, branch?: string): Promise<any>;
}

/**
 * Port para execução de comandos
 * Baseado na configuração commands existente
 */
export interface ICommandExecutionPort {
  /**
   * Executa comando do sistema
   */
  executeCommand(command: CommandRun, options?: CommandOptions): Promise<CommandResult>;
}

/**
 * Opções para execução de comando
 */
export interface CommandOptions {
  timeout?: number;
  cwd?: string;
  env?: Record<string, string>;
}

/**
 * Resultado da execução de comando
 */
export interface CommandResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration?: number;
}

// ============================================================================
// DOMAIN PORTS - Interfaces específicas do domínio BoxSafe
// ============================================================================

/**
 * Port para o loop principal do BoxSafe
 * Baseado no módulo loop existente
 */
export interface IBoxSafeLoopPort {
  /**
   * Executa o loop iterativo principal
   */
  executeLoop(options: LoopOptions): Promise<LoopResult>;
}

/**
 * Opções para o loop principal
 */
export interface LoopOptions {
  service: LService;
  model: LModel;
  initialPrompt: string;
  cmd: CommandRun;
  lang: string;
  pathOutput: string;
  workspace?: string;
  maxIterations?: number;
  limit?: number;
  signal?: AbortSignal;
  pathGeneratedMarkdown?: string;
  logger?: any;
}

/**
 * Resultado do loop principal
 */
export interface LoopResult {
  ok: boolean;
  iterations: number;
  verdict?: unknown;
  artifacts?: { outputFile?: string };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Logger interface para uso em todos os ports
 */
export interface LoggerPort {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug?: (...args: any[]) => void;
}
