import { loadBoxSafeConfig } from '@core/config/loadConfig';
import type { NormalizedBoxSafeConfig } from '@core/config/loadConfig';

export function loadBoxConfig(configPath?: string): NormalizedBoxSafeConfig {
  return loadBoxSafeConfig(configPath).config;
}

export function getVersionControlFlags(boxConfig: NormalizedBoxSafeConfig): {
  vcBefore: boolean;
  vcAfter: boolean;
  vcGenerateNotes: boolean;
  vcAutoPushConfig: boolean;
} {
  return {
    vcBefore: Boolean(boxConfig.project?.versionControl?.before ?? false),
    vcAfter: Boolean(boxConfig.project?.versionControl?.after ?? false),
    vcGenerateNotes: Boolean(boxConfig.project?.versionControl?.generateNotes ?? false),
    vcAutoPushConfig: Boolean(boxConfig.project?.versionControl?.autoPush ?? false),
  };
}
