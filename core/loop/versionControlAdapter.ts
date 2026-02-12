import { runVersionControl } from '@core/loop/git';
import { Logger } from '@core/util/logger';

const logger = Logger.createModuleLogger('VersionControlAdapter');

type AttemptOptions = {
  repoPath: string;
  commitMessage: string;
  autoPush: boolean;
  generateNotes: boolean;
};

export function createVersionControlAttemptRunner() {
  return async function attemptVersionControl(opts: AttemptOptions) {
    const maxAttempts = 3;
    let attempt = 0;
    let lastErr: any = null;
    logger.info(`attempting runVersionControl with opts=${JSON.stringify(opts)}`);
    while (attempt < maxAttempts) {
      attempt++;
      try {
        logger.debug(`attempt ${attempt}`);
        const res = await runVersionControl(opts);
        logger.info(`result (attempt ${attempt}): ${JSON.stringify(res)}`);
        return res;
      } catch (err: any) {
        lastErr = err;
        logger.warn(`attempt ${attempt} failed: ${err?.message ?? err}`);
        const backoff = 300 * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
    logger.error(`all ${maxAttempts} attempts failed: ${lastErr?.message ?? lastErr}`);
    throw lastErr;
  };
}
