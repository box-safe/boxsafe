import fs from 'node:fs';
import path from 'node:path';
import type { BoxSafeConfig } from '@/types';
import { DEFAULT_BOXSAFE_CONFIG } from './defaults';

type LoadConfigResult = {
  config: BoxSafeConfig;
  source: { path: string; loaded: boolean };
};

function isPlainObject(v: unknown): v is Record<string, any> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: any): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return (override ?? base) as T;

  const out: Record<string, any> = { ...(base as any) };
  for (const [k, v] of Object.entries(override)) {
    const bv = (base as any)[k];
    if (isPlainObject(bv) && isPlainObject(v)) out[k] = deepMerge(bv, v);
    else out[k] = v;
  }
  return out as T;
}

function normalizeLoops(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const trimmed = v.trim().toLowerCase();
    if (trimmed === 'infinity') return Number.MAX_SAFE_INTEGER;
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function loadBoxSafeConfig(configPath?: string): LoadConfigResult {
  const p = configPath ?? path.resolve(process.cwd(), 'boxsafe.config.json');

  let rawConfig: any = null;
  try {
    if (fs.existsSync(p)) {
      rawConfig = JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch {
    rawConfig = null;
  }

  const merged = deepMerge(DEFAULT_BOXSAFE_CONFIG, rawConfig ?? {});

  const loopsFallback = typeof DEFAULT_BOXSAFE_CONFIG.limits?.loops === 'number' ? DEFAULT_BOXSAFE_CONFIG.limits.loops : 2;
  if (!merged.limits) merged.limits = {} as any;
  (merged.limits as any).loops = normalizeLoops((merged.limits as any).loops, loopsFallback);

  return {
    config: merged as BoxSafeConfig,
    source: { path: p, loaded: Boolean(rawConfig) },
  };
}
