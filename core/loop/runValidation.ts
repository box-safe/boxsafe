import { waterfall } from '@core/loop/waterfall';
import { Logger } from '@core/util/logger';

const logger = Logger.createModuleLogger('RunValidation');

type RunValidationArgs = {
  execResult: any;
  pathOutput: string;
  signal?: AbortSignal;
};

export async function runValidation({ execResult, pathOutput, signal }: RunValidationArgs): Promise<any> {
  if (signal?.aborted) throw new Error('Aborted');
  try {
    return await waterfall({
      exec: execResult,
      artifacts: {
        outputFile: pathOutput,
      },
    });
  } catch (err: any) {
    logger.error(`Waterfall error: ${err?.message ?? err}`);
    throw err;
  }
}
