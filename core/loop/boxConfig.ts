import fs from 'node:fs';
import path from 'node:path';

export function loadBoxConfig(configPath?: string): any {
  const p = configPath ?? path.resolve(process.cwd(), 'boxsafe.config.json');
  try {
    if (!fs.existsSync(p)) return {};
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
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
