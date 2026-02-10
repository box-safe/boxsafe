import { loadBoxSafeConfig } from '@core/config/loadConfig';

export function loadBoxConfig(configPath?: string): any {
  return loadBoxSafeConfig(configPath).config;
}

export function getVersionControlFlags(boxConfig: any): {
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
