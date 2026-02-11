/**
 * @fileoverview
 * Ports da arquitetura hexagonal - Interfaces que definem contratos entre o core e o mundo externo
 * 
 * Baseado na estrutura existente do módulo sgmnt, adaptada para arquitetura hexagonal formal.
 * 
 * @module core/ports/index
 */

import type { BoxSafeConfig, CommandRun } from '@/types';
import type { LService, LModel } from '@ai/label';

// Re-export BoxSafeConfig for convenience
export type { BoxSafeConfig, CommandRun } from '@/types';

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
// PRIMARY PORTS - Interfaces para atores primários (CLI, Web, IDE, etc.)
// ============================================================================

/**
 * Port principal para execução do sistema - ponto de entrada para atores primários
 * Baseado no segment system existente
 */
export interface ISystemExecutionPort {
  /**
   * Executa um segmento específico do sistema
   * @param segmentName Nome do segmento a ser executado
   * @param args Argumentos para o segmento
   * @returns Resultado da execução
   */
  executeSegment(segmentName: string, args?: any): Promise<any>;
  
  /**
   * Lista todos os segmentos disponíveis
   * @returns Mapa de segmentos disponíveis
   */
  listSegments(): Record<string, SegmentInfo>;
}

/**
 * Informações sobre um segmento
 */
export interface SegmentInfo {
  description: string;
  implemented: boolean;
  config?: any;
}

/**
 * Port para configuração do sistema
 * Baseado no loadConfig existente
 */
export interface ISystemConfigurationPort {
  /**
   * Carrega configurações do sistema
   * @param configPath Caminho opcional para arquivo de configuração
   * @returns Configurações carregadas
   */
  loadConfiguration(configPath?: string): Promise<ConfigurationResult>;
  
  /**
   * Valida configurações do sistema
   * @param config Configurações a serem validadas
   * @returns Resultado da validação
   */
  validateConfiguration(config: BoxSafeConfig): Promise<ValidationResult>;
}

/**
 * Resultado do carregamento de configuração
 */
export interface ConfigurationResult {
  config: BoxSafeConfig;
  source: { path: string; loaded: boolean };
}

/**
 * Resultado da validação de configuração
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// SECONDARY PORTS - Interfaces para atores secundários (FileSystem, AI, Git, etc.)
// ============================================================================

/**
 * Port para navegação no sistema de arquivos
 * Baseado no módulo navigate existente
 */
export interface IFileSystemPort {
  /**
   * Lista conteúdo de um diretório
   */
  listDirectory(path: string): Promise<any>;
  
  /**
   * Lê conteúdo de um arquivo
   */
  readFile(path: string): Promise<any>;
  
  /**
   * Escreve conteúdo em um arquivo
   */
  writeFile(path: string, content: string, options?: any): Promise<any>;
  
  /**
   * Cria um diretório
   */
  createDirectory(path: string, options?: any): Promise<any>;
  
  /**
   * Remove arquivo ou diretório
   */
  delete(path: string, options?: any): Promise<any>;
  
  /**
   * Obtém metadados de um arquivo/diretório
   */
  getMetadata(path: string): Promise<any>;
}

/**
 * Port para interação com modelos de IA
 * Baseado na configuração de model existente
 */
export interface IAIModelPort {
  /**
   * Envia prompt para o modelo
   */
  sendPrompt(prompt: string, options?: any): Promise<any>;
  
  /**
   * Configura modelo a ser utilizado
   */
  configureModel(config: {
    provider: LService;
    name: LModel;
    parameters?: Record<string, unknown>;
  }): Promise<void>;
}

/**
 * Port para controle de versão (Git)
 * Baseado no módulo versionControl existente
 */
export interface IVersionControlPort {
  /**
   * Executa comando git
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
