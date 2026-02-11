import type { Navigator } from '@core/navigate';
import { parseToolCallsFromMarkdown } from './toolCalls';
import type { ToolCall } from './toolCalls';

type Log = {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug?: (...args: any[]) => void;
};

type AnsiLike = { Cyan: string; Yellow: string; Red: string; Reset: string };

type AttemptVersionControl = (opts: any) => Promise<any>;

type DispatchArgs = {
  markdown: string;
  navigator: Navigator | null;
  boxConfig: any;
  log: Log;
  ANSI: AnsiLike;
  attemptVersionControl: AttemptVersionControl;
  vcAutoPushConfig: boolean;
};

export async function dispatchToolCalls({
  markdown,
  navigator,
  boxConfig,
  log,
  ANSI,
  attemptVersionControl,
  vcAutoPushConfig,
}: DispatchArgs): Promise<void> {
  try {
    const parsed = parseToolCallsFromMarkdown(markdown);
    for (const e of parsed.errors) {
      log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} invalid tool call: ${e.error}`);
    }

    for (const call of parsed.calls) {
      await executeOneToolCall(call);
    }
  } catch (toolErr: any) {
    log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} tool parsing failed: ${toolErr?.message ?? toolErr}`);
  }

  async function executeOneToolCall(call: ToolCall): Promise<void> {
    log.info(`${ANSI.Cyan}[Tool]${ANSI.Reset} detected tool call: ${call.tool}`);

    if (call.tool === 'navigate') {
      if (!navigator) {
        log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} navigate requested but navigator is not initialized`);
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
        }
      } catch (innerErr: any) {
        log.error(`${ANSI.Red}[Tool]${ANSI.Reset} navigate execution error: ${innerErr?.message ?? innerErr}`);
      }

      log.info(`${ANSI.Cyan}[Tool]${ANSI.Reset} navigate result: ${JSON.stringify(toolRes ?? { ok: false })}`);
      return;
    }

    if (call.tool === 'versionControl') {
      const allowed = Boolean(boxConfig.project?.versionControl?.before) || Boolean(boxConfig.project?.versionControl?.after);
      if (!allowed) {
        log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} versionControl requested but not authorized in config`);
        return;
      }

      try {
        const params: any = { ...(call.params ?? {}) };
        if (params.autoPush === undefined) params.autoPush = vcAutoPushConfig;
        const vcRes = await attemptVersionControl(params);
        log.info(`${ANSI.Cyan}[Tool]${ANSI.Reset} versionControl result: ${JSON.stringify(vcRes ?? { ok: true })}`);
      } catch (vcErr: any) {
        log.error(`${ANSI.Red}[Tool]${ANSI.Reset} versionControl error: ${vcErr?.message ?? vcErr}`);
      }
      return;
    }

    log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} unhandled tool: ${String((call as any).tool)}`);
  }
}
