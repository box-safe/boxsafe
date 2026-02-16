import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_BOXSAFE_CONFIG } from '@core/config/defaults';

// Local types to maintain core independence
export interface BoxSafeConfig {
  project?: {
    workspace?: string;
    testDir?: string;
    versionControl?: {
      before?: boolean;
      after?: boolean;
      autoPush?: boolean;
      generateNotes?: boolean;
    };
  };
  model?: {
    primary?: {
      provider?: string;
      name?: string;
    };
    fallback?: any[];
    endpoint?: any;
    parameters?: Record<string, any>;
  };
  smartRotation?: {
    enabled?: boolean;
    simple?: any[];
    complex?: any[];
  };
  limits?: {
    tokens?: number;
    loops?: number;
    timeout?: {
      enabled?: boolean;
      duration?: string;
      notify?: boolean;
    };
  };
  sandbox?: {
    enabled?: boolean;
    engine?: string;
    memory?: string;
    cpu?: number;
    network?: string;
  };
  commands?: {
    setup?: string;
    run?: string;
    test?: string | null;
    timeoutMs?: number;
  };
  interface?: {
    channel?: string;
    prompt?: string;
    notifications?: {
      whatsapp?: boolean;
      telegram?: boolean;
      slack?: boolean;
      email?: boolean;
    };
  };
  paths?: {
    generatedMarkdown?: string;
    artifactOutput?: string;
  };
  teach?: {
    urls?: string[];
    files?: string[];
  };
}

export type NormalizedBoxSafeConfig = Omit<BoxSafeConfig, 'limits'> & {
  limits?: Omit<NonNullable<BoxSafeConfig['limits']>, 'loops'> & {
    loops?: number;
  };
};

type LoadConfigResult = {
  config: NormalizedBoxSafeConfig;
  source: { path: string; loaded: boolean };
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return (override ?? base) as T;

  const out: Record<string, unknown> = { ...(base as any) };
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

  let rawConfig: unknown = null;
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
    config: merged as NormalizedBoxSafeConfig,
    source: { path: p, loaded: Boolean(rawConfig) },
  };
}
