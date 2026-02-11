import type { NormalizedBoxSafeConfig } from '@core/config/loadConfig';

export function createVersionControlSegment(BSConfig: NormalizedBoxSafeConfig) {
  return {
    handler: async (params?: any) => {
      const mod = await import('@core/loop/git');
      return mod.runVersionControl(params ?? {});
    },
    meta: {
      description: 'Versioning helper: commit, notes and optional push to origin',
      implemented: true,
      config: {
        autoPushDefault: BSConfig.project?.versionControl?.after ?? false,
        createNotesDefault: BSConfig.project?.versionControl?.generateNotes ?? false,
      },
    },
  };
}
