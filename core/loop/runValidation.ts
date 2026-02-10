import { waterfall } from '@core/loop/waterfall';

type Log = {
  error: (...args: any[]) => void;
};

type AnsiLike = { Red: string; Reset: string };

type RunValidationArgs = {
  execResult: any;
  pathOutput: string;
  signal?: AbortSignal;
  log: Log;
  ANSI: AnsiLike;
};

export async function runValidation({ execResult, pathOutput, signal, log, ANSI }: RunValidationArgs): Promise<any> {
  if (signal?.aborted) throw new Error('Aborted');
  try {
    return await waterfall({
      exec: execResult,
      artifacts: {
        outputFile: pathOutput,
      },
    });
  } catch (err: any) {
    log.error(`${ANSI.Red}[Waterfall]${ANSI.Reset}`, err?.message ?? err);
    throw err;
  }
}
