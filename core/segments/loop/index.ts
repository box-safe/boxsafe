import type { NormalizedBoxSafeConfig } from '@core/config/loadConfig';

export function createLoopSegment(BSConfig: NormalizedBoxSafeConfig) {
  return {
    handler: async (opts?: any) => {
      const mod = await import('@core/loop/execLoop');
      return mod.loop(opts);
    },
    meta: {
      description: 'Iterative LLM -> code -> exec loop',
      implemented: true,
      config: {
        defaultLang: 'ts',
        pathOutput: process.env.AGENT_OUTPUT_PATH ?? BSConfig.paths?.artifactOutput ?? './out.ts',
      },
    },
  };
}
