import type { Navigator } from '@core/navigate';
import { parseToolCallsFromMarkdown } from './toolCalls';
import type { ToolCall } from './toolCalls';
import type { TraceCtx } from './traceLogger';
import { Logger } from '@core/util/logger';

const logger = Logger.createModuleLogger('ToolDispatcher');

type AnsiLike = { Cyan: string; Yellow: string; Red: string; Reset: string };

type AttemptVersionControl = (opts: any) => Promise<any>;

type TraceEmit = (event: string, ctx?: TraceCtx, data?: Record<string, unknown>) => Promise<void>;

type DispatchArgs = {
  markdown: string;
  navigator: Navigator | null;
  boxConfig: any;
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
  ANSI,
  attemptVersionControl,
  vcAutoPushConfig,
  traceEmit,
  traceCtx,
}: DispatchArgs): Promise<void> {
  try {
    logger.debug(`Dispatching tool calls from markdown (${markdown.length} chars)`);
    logger.debug(`Navigator available: ${!!navigator}`);

    const parsed = parseToolCallsFromMarkdown(markdown);
    await traceEmit?.('toolcalls.parsed', traceCtx, {
      calls: parsed.calls.length,
      errors: parsed.errors.length,
    });

    logger.info(`Tool calls parsed: ${parsed.calls.length} valid, ${parsed.errors.length} errors`);
    
    for (const e of parsed.errors) {
      logger.warn(`Invalid tool call: ${e.error}`);
      await traceEmit?.('toolcall.invalid', traceCtx, { error: e.error });
    }

    if (parsed.calls.length === 0) {
      logger.debug('No valid tool calls to execute');
      return;
    }

    logger.info(`Executing ${parsed.calls.length} tool calls...`);
    for (const call of parsed.calls) {
      await executeOneToolCall(call);
    }
  } catch (toolErr: any) {
    logger.error(`Tool parsing failed: ${toolErr?.message ?? toolErr}`);
    await traceEmit?.('toolcalls.failed', traceCtx, { error: toolErr?.message ?? String(toolErr) });
  }

  async function executeOneToolCall(call: ToolCall): Promise<void> {
    logger.debug(`Executing tool call: ${JSON.stringify(call)}`);
    logger.info(`detected tool call: ${call.tool}`);
    await traceEmit?.('toolcall.detected', traceCtx, { tool: call.tool });

    if (call.tool === 'navigate') {
      logger.debug(`Processing navigate tool call with op: ${call.params.op}`);
      
      if (!navigator) {
        logger.warn(`navigate requested but navigator is not initialized`);
        await traceEmit?.('toolcall.navigate.skipped', traceCtx, { reason: 'navigator_not_initialized' });
        return;
      }

      const { op } = call.params;
      let toolRes: any = null;
      
      try {
        if (op === 'write') {
          logger.debug(`Writing file: ${call.params.path}`);
          toolRes = await navigator.writeFile(call.params.path!, call.params.content!, call.params.writeOptions);
        } else if (op === 'mkdir') {
          logger.debug(`Creating directory: ${call.params.path}`);
          toolRes = await navigator.createDirectory(call.params.path!, call.params.mkdirOptions);
        } else if (op === 'delete') {
          logger.debug(`Deleting: ${call.params.path}`);
          toolRes = await navigator.delete(call.params.path!, call.params.deleteOptions);
        } else if (op === 'read') {
          logger.debug(`Reading file: ${call.params.path}`);
          toolRes = await navigator.readFile(call.params.path!);
        } else if (op === 'list') {
          logger.debug(`Listing directory: ${call.params.path ?? '.'}`);
          toolRes = await navigator.listDirectory(call.params.path ?? '.');
        } else if (op === 'stat') {
          logger.debug(`Getting metadata: ${call.params.path}`);
          toolRes = await navigator.getMetadata(call.params.path!);
        } else {
          logger.warn(`unknown navigate op: ${String(op)}`);
          await traceEmit?.('toolcall.navigate.unknown_op', traceCtx, { op: String(op) });
        }
        
        logger.info(`Navigate operation ${op} completed successfully`);
      } catch (innerErr: any) {
        logger.error(`navigate execution error: ${innerErr?.message ?? innerErr}`);
        await traceEmit?.('toolcall.navigate.error', traceCtx, { error: innerErr?.message ?? String(innerErr) });
      }

      logger.debug(`Navigate result: ${JSON.stringify(toolRes ?? { ok: false })}`);
      logger.info(`navigate result: ${JSON.stringify(toolRes ?? { ok: false })}`);
      await traceEmit?.('toolcall.navigate.result', traceCtx, {
        op,
        ok: Boolean(toolRes?.ok),
      });
      return;
    }

    if (call.tool === 'versionControl') {
      const allowed = Boolean(boxConfig.project?.versionControl?.before) || Boolean(boxConfig.project?.versionControl?.after);
      if (!allowed) {
        logger.warn(`versionControl requested but not authorized in config`);
        await traceEmit?.('toolcall.versionControl.skipped', traceCtx, { reason: 'not_authorized' });
        return;
      }

      try {
        const params: any = { ...(call.params ?? {}) };
        if (params.autoPush === undefined) params.autoPush = vcAutoPushConfig;
        const vcRes = await attemptVersionControl(params);
        logger.info(`versionControl result: ${JSON.stringify(vcRes ?? { ok: true })}`);
        await traceEmit?.('toolcall.versionControl.result', traceCtx, { ok: true });
      } catch (vcErr: any) {
        logger.error(`versionControl error: ${vcErr?.message ?? vcErr}`);
        await traceEmit?.('toolcall.versionControl.error', traceCtx, { error: vcErr?.message ?? String(vcErr) });
      }
      return;
    }

    logger.warn(`unhandled tool: ${String((call as any).tool)}`);
  }
}
