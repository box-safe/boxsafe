import type { Navigator } from '@core/navigate';
import { parseToolCallsFromMarkdown } from './toolCalls';
import type { ToolCall } from './toolCalls';
import type { TraceCtx } from './traceLogger';

type Log = {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug?: (...args: any[]) => void;
};

type AnsiLike = { Cyan: string; Yellow: string; Red: string; Reset: string };

type AttemptVersionControl = (opts: any) => Promise<any>;

type TraceEmit = (event: string, ctx?: TraceCtx, data?: Record<string, unknown>) => Promise<void>;

type DispatchArgs = {
  markdown: string;
  navigator: Navigator | null;
  boxConfig: any;
  log: Log;
  ANSI: AnsiLike;
  attemptVersionControl: AttemptVersionControl;
  vcAutoPushConfig: boolean;
  traceEmit?: TraceEmit;
  traceCtx?: TraceCtx;
};

export async function dispatchToolCalls({
  markdown,
  navigator,
  boxConfig,
  log,
  ANSI,
  attemptVersionControl,
  vcAutoPushConfig,
  traceEmit,
  traceCtx,
}: DispatchArgs): Promise<void> {
  try {
    const parsed = parseToolCallsFromMarkdown(markdown);
    await traceEmit?.('toolcalls.parsed', traceCtx, {
      calls: parsed.calls.length,
      errors: parsed.errors.length,
    });
    for (const e of parsed.errors) {
      log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} invalid tool call: ${e.error}`);
      await traceEmit?.('toolcall.invalid', traceCtx, { error: e.error });
    }

    for (const call of parsed.calls) {
      await executeOneToolCall(call);
    }
  } catch (toolErr: any) {
    log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} tool parsing failed: ${toolErr?.message ?? toolErr}`);
    await traceEmit?.('toolcalls.failed', traceCtx, { error: toolErr?.message ?? String(toolErr) });
  }

  async function executeOneToolCall(call: ToolCall): Promise<void> {
    log.info(`${ANSI.Cyan}[Tool]${ANSI.Reset} detected tool call: ${call.tool}`);
    await traceEmit?.('toolcall.detected', traceCtx, { tool: call.tool });

    if (call.tool === 'navigate') {
      if (!navigator) {
        log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} navigate requested but navigator is not initialized`);
        await traceEmit?.('toolcall.navigate.skipped', traceCtx, { reason: 'navigator_not_initialized' });
        return;
      }

      const { op } = call.params;
      let toolRes: any = null;
      try {
        if (op === 'write') {
          toolRes = await navigator.writeFile(call.params.path!, call.params.content!, call.params.writeOptions);
        } else if (op === 'mkdir') {
          toolRes = await navigator.createDirectory(call.params.path!, call.params.mkdirOptions);
        } else if (op === 'delete') {
          toolRes = await navigator.delete(call.params.path!, call.params.deleteOptions);
        } else if (op === 'read') {
          toolRes = await navigator.readFile(call.params.path!);
        } else if (op === 'list') {
          toolRes = await navigator.listDirectory(call.params.path ?? '.');
        } else if (op === 'stat') {
          toolRes = await navigator.getMetadata(call.params.path!);
        } else {
          log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} unknown navigate op: ${String(op)}`);
          await traceEmit?.('toolcall.navigate.unknown_op', traceCtx, { op: String(op) });
        }
      } catch (innerErr: any) {
        log.error(`${ANSI.Red}[Tool]${ANSI.Reset} navigate execution error: ${innerErr?.message ?? innerErr}`);
        await traceEmit?.('toolcall.navigate.error', traceCtx, { error: innerErr?.message ?? String(innerErr) });
      }

      log.info(`${ANSI.Cyan}[Tool]${ANSI.Reset} navigate result: ${JSON.stringify(toolRes ?? { ok: false })}`);
      await traceEmit?.('toolcall.navigate.result', traceCtx, {
        op,
        ok: Boolean(toolRes?.ok),
      });
      return;
    }

    if (call.tool === 'versionControl') {
      const allowed = Boolean(boxConfig.project?.versionControl?.before) || Boolean(boxConfig.project?.versionControl?.after);
      if (!allowed) {
        log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} versionControl requested but not authorized in config`);
        await traceEmit?.('toolcall.versionControl.skipped', traceCtx, { reason: 'not_authorized' });
        return;
      }

      try {
        const params: any = { ...(call.params ?? {}) };
        if (params.autoPush === undefined) params.autoPush = vcAutoPushConfig;
        const vcRes = await attemptVersionControl(params);
        log.info(`${ANSI.Cyan}[Tool]${ANSI.Reset} versionControl result: ${JSON.stringify(vcRes ?? { ok: true })}`);
        await traceEmit?.('toolcall.versionControl.result', traceCtx, { ok: true });
      } catch (vcErr: any) {
        log.error(`${ANSI.Red}[Tool]${ANSI.Reset} versionControl error: ${vcErr?.message ?? vcErr}`);
        await traceEmit?.('toolcall.versionControl.error', traceCtx, { error: vcErr?.message ?? String(vcErr) });
      }
      return;
    }

    log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} unhandled tool: ${String((call as any).tool)}`);
  }
}
