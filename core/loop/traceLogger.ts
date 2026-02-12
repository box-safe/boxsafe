import path from 'node:path';
import { mkdir, appendFile, readdir, stat, unlink } from 'node:fs/promises';
import { STATES_LOGS_DIR } from '@core/paths/paths';
import { Logger } from '@core/util/logger';

export type TraceCtx = {
  runId: string;
  iter?: number;
};

export type TraceEvent = {
  ts: string;
  runId: string;
  iter?: number;
  event: string;
  data?: Record<string, unknown>;
};

type TraceOptions = {
  runId: string;
  retain?: number;
};

function safeJsonStringify(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return JSON.stringify({ error: 'unstringifiable' });
  }
}

function makeRunId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${Date.now().toString(36)}-${rand}`;
}

async function applyRetention(retain: number): Promise<void> {
  const entries = await readdir(STATES_LOGS_DIR, { withFileTypes: true }).catch(() => []);
  const files = entries
    .filter((e) => e.isFile() && e.name.startsWith('trace-') && e.name.endsWith('.jsonl'))
    .map((e) => e.name);

  const withTimes = await Promise.all(
    files.map(async (name) => {
      const p = path.join(STATES_LOGS_DIR, name);
      const s = await stat(p).catch(() => null);
      return { name, mtimeMs: s?.mtimeMs ?? 0 };
    })
  );

  withTimes.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const toDelete = withTimes.slice(retain);
  await Promise.all(toDelete.map((f) => unlink(path.join(STATES_LOGS_DIR, f.name)).catch(() => null)));
}

export function createTraceLogger(opts?: Partial<TraceOptions>) {
  const runId = opts?.runId ?? process.env.BOXSAFE_RUN_ID ?? makeRunId();
  const retain = typeof opts?.retain === 'number' ? opts.retain : Number(process.env.BOXSAFE_TRACE_RETAIN ?? 20);
  const filePath = path.join(STATES_LOGS_DIR, `trace-${runId}.jsonl`);

  let initialized = false;

  async function ensureInit() {
    if (initialized) return;
    await mkdir(STATES_LOGS_DIR, { recursive: true });
    if (Number.isFinite(retain) && retain > 0) {
      await applyRetention(retain);
    }
    initialized = true;
  }

  async function emit(event: string, ctx?: TraceCtx, data?: Record<string, unknown>) {
    await ensureInit();
    const entry: TraceEvent = {
      ts: new Date().toISOString(),
      runId,
      ...(typeof ctx?.iter === 'number' ? { iter: ctx.iter } : {}),
      event,
      ...(data ? { data } : {}),
    };
    await appendFile(filePath, `${safeJsonStringify(entry)}\n`, 'utf8');
  }

  function prefix(ctx?: TraceCtx): string {
    const parts = [`run=${runId}`];
    if (typeof ctx?.iter === 'number') parts.push(`iter=${ctx.iter}`);
    return `[${parts.join('][')}]`;
  }

  function wrapLogger(ctx?: TraceCtx) {
    const logger = Logger.createModuleLogger('Trace');
    const p = prefix(ctx);
    return {
      info: (...a: any[]) => logger.info(`${p} ${a.join(' ')}`),
      warn: (...a: any[]) => logger.warn(`${p} ${a.join(' ')}`),
      error: (...a: any[]) => logger.error(`${p} ${a.join(' ')}`),
    };
  }

  return {
    runId,
    filePath,
    emit,
    wrapLogger,
  };
}
