import { runVersionControl } from '@core/loop/git';

type Log = {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug?: (...args: any[]) => void;
};

type AnsiLike = { Cyan: string; Yellow: string; Red: string; Reset: string };

type AttemptOptions = {
  repoPath: string;
  commitMessage: string;
  autoPush: boolean;
  generateNotes: boolean;
};

export function createVersionControlAttemptRunner(log: Log, ANSI: AnsiLike) {
  return async function attemptVersionControl(opts: AttemptOptions) {
    const maxAttempts = 3;
    let attempt = 0;
    let lastErr: any = null;
    log.info(`${ANSI.Cyan}[VersionControl]${ANSI.Reset} attempting runVersionControl with opts=${JSON.stringify(opts)}`);
    while (attempt < maxAttempts) {
      attempt++;
      try {
        log.debug && log.debug(`${ANSI.Cyan}[VersionControl]${ANSI.Reset} attempt ${attempt}`);
        const res = await runVersionControl(opts);
        log.info(`${ANSI.Cyan}[VersionControl]${ANSI.Reset} result (attempt ${attempt}): ${JSON.stringify(res)}`);
        return res;
      } catch (err: any) {
        lastErr = err;
        log.warn(`${ANSI.Yellow}[VersionControl]${ANSI.Reset} attempt ${attempt} failed: ${err?.message ?? err}`);
        const backoff = 300 * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
    log.error(`${ANSI.Red}[VersionControl]${ANSI.Reset} all ${maxAttempts} attempts failed: ${lastErr?.message ?? lastErr}`);
    throw lastErr;
  };
}
