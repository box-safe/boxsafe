import type { NormalizedBoxSafeConfig } from '@core/config/loadConfig';

export function createNavigateSegment(BSConfig: NormalizedBoxSafeConfig) {
  return {
    handler: async (params?: any) => {
      const mod = await import('@core/navigate');
      const workspace = BSConfig.project?.workspace ?? './';
      const handler = mod.createNavigatorHandler(workspace);
      return handler.execute(params);
    },
    meta: {
      description: 'File system navigation with workspace boundary enforcement',
      implemented: true,
      config: {
        workspace: BSConfig.project?.workspace ?? './',
        maxFileSize: 10 * 1024 * 1024,
      },
    },
  };
}
