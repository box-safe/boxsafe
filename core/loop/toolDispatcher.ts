import type { Navigator } from '@core/navigate';

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
    const jsonFenceRe = /```(?:json|json-tool)?\s*({[\s\S]*?})\s*```/g;
    let m: any;

    while ((m = jsonFenceRe.exec(markdown)) !== null) {
      try {
        const obj = JSON.parse(m[1]);
        if (obj && typeof obj === 'object' && obj.tool) {
          log.info(`${ANSI.Cyan}[Tool]${ANSI.Reset} detected tool call: ${obj.tool}`);
          if (obj.tool === 'navigate') {
            if (!navigator) {
              log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} navigate requested but navigator is not initialized`);
            } else {
              const params = obj.params ?? {};
              const op = params.op;
              let toolRes: any = null;
              try {
                if (op === 'write') {
                  toolRes = await navigator.writeFile(params.path, params.content ?? '', params.writeOptions);
                } else if (op === 'mkdir') {
                  toolRes = await navigator.createDirectory(params.path, params.mkdirOptions);
                } else if (op === 'delete') {
                  toolRes = await navigator.delete(params.path, params.deleteOptions);
                } else if (op === 'read') {
                  toolRes = await navigator.readFile(params.path);
                } else if (op === 'list') {
                  toolRes = await navigator.listDirectory(params.path ?? '.');
                } else if (op === 'stat') {
                  toolRes = await navigator.getMetadata(params.path);
                } else {
                  log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} unknown navigate op: ${op}`);
                }
              } catch (innerErr: any) {
                log.error(`${ANSI.Red}[Tool]${ANSI.Reset} navigate execution error: ${innerErr?.message ?? innerErr}`);
              }

              log.info(`${ANSI.Cyan}[Tool]${ANSI.Reset} navigate result: ${JSON.stringify(toolRes ?? { ok: false })}`);
            }
          } else if (obj.tool === 'versionControl') {
            const allowed = Boolean(boxConfig.project?.versionControl?.before) || Boolean(boxConfig.project?.versionControl?.after);
            if (!allowed) {
              log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} versionControl requested but not authorized in config`);
            } else {
              try {
                const params = obj.params ?? {};
                if (params.autoPush === undefined) params.autoPush = vcAutoPushConfig;
                const vcRes = await attemptVersionControl(params);
                log.info(`${ANSI.Cyan}[Tool]${ANSI.Reset} versionControl result: ${JSON.stringify(vcRes ?? { ok: true })}`);
              } catch (vcErr: any) {
                log.error(`${ANSI.Red}[Tool]${ANSI.Reset} versionControl error: ${vcErr?.message ?? vcErr}`);
              }
            }
          } else {
            log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} unhandled tool: ${String(obj.tool)}`);
          }
        }
      } catch {
        // ignore
      }
    }
  } catch (toolErr: any) {
    log.warn(`${ANSI.Yellow}[Tool]${ANSI.Reset} tool parsing failed: ${toolErr?.message ?? toolErr}`);
  }
}
