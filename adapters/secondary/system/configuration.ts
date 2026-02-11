/**
 * @fileoverview
 * Adapter for ISystemConfigurationPort
 * Implementation based on existing loadConfig
 * 
 * @module adapters/secondary/system/configuration
 */

import fs from 'node:fs';
import path from 'node:path';
import type { 
  ISystemConfigurationPort, 
  ConfigurationResult, 
  ValidationResult,
  BoxSafeConfig 
} from '@core/ports';
import { DEFAULT_BOXSAFE_CONFIG } from '@core/config/defaults';

/**
 * System configuration adapter using JSON file and environment variables
 */
export class SystemConfigurationAdapter implements ISystemConfigurationPort {
  private defaultConfigPath: string;

  constructor(defaultConfigPath?: string) {
    this.defaultConfigPath = defaultConfigPath ?? path.resolve(process.cwd(), 'boxsafe.config.json');
  }

  /**
   * Load system configurations
   */
  async loadConfiguration(configPath?: string): Promise<ConfigurationResult> {
    const p = configPath ?? this.defaultConfigPath;

    let rawConfig: unknown = null;
    try {
      if (fs.existsSync(p)) {
        rawConfig = JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch {
      rawConfig = null;
    }

    const merged = this.deepMerge(DEFAULT_BOXSAFE_CONFIG, rawConfig ?? {});
    
    // Specific normalization for loops
    const loopsFallback = typeof DEFAULT_BOXSAFE_CONFIG.limits?.loops === 'number' 
      ? DEFAULT_BOXSAFE_CONFIG.limits.loops 
      : 2;
    
    if (!merged.limits) merged.limits = {} as any;
    (merged.limits as any).loops = this.normalizeLoops((merged.limits as any).loops, loopsFallback);

    return {
      config: merged as BoxSafeConfig,
      source: { path: p, loaded: Boolean(rawConfig) }
    };
  }

  /**
   * Validate system configurations
   */
  async validateConfiguration(config: BoxSafeConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Mandatory validations
    if (!config.project?.workspace) {
      errors.push('project.workspace is required');
    }

    if (!config.model?.primary?.provider) {
      errors.push('model.primary.provider is required');
    }

    if (!config.model?.primary?.name) {
      errors.push('model.primary.name is required');
    }

    // Optional validations with warnings
    if (!config.commands?.run) {
      warnings.push('commands.run not defined, using default value');
    }

    if (!config.interface?.prompt) {
      warnings.push('interface.prompt not defined, using default value');
    }

    // Limits validations
    if (config.limits?.loops !== undefined) {
      if (typeof config.limits.loops === 'number' && config.limits.loops <= 0) {
        errors.push('limits.loops must be a positive number');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Helper for deep merge of objects
   */
  private deepMerge<T>(base: T, override: unknown): T {
    const isPlainObject = (v: unknown): v is Record<string, unknown> => {
      return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
    };

    if (!isPlainObject(base) || !isPlainObject(override)) {
      return (override ?? base) as T;
    }

    const out: Record<string, unknown> = { ...(base as any) };
    for (const [k, v] of Object.entries(override)) {
      const bv = (base as any)[k];
      if (isPlainObject(bv) && isPlainObject(v)) {
        out[k] = this.deepMerge(bv, v);
      } else {
        out[k] = v;
      }
    }
    return out as T;
  }

  /**
   * Helper to normalize loops value
   */
  private normalizeLoops(v: unknown, fallback: number): number {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const trimmed = v.trim().toLowerCase();
      if (trimmed === 'infinity') return Number.MAX_SAFE_INTEGER;
      const n = Number(trimmed);
      if (Number.isFinite(n)) return n;
    }
    return fallback;
  }
}

/**
 * Factory function para criar o adapter
 */
export function createSystemConfigurationAdapter(configPath?: string): SystemConfigurationAdapter {
  return new SystemConfigurationAdapter(configPath);
}
