import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { runVersionControl } from '@core/loop/git';
import { Logger } from '@core/util/logger';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const logger = Logger.createModuleLogger('VersionControlRunner');

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(__dirname, '../../../');

  const configPath = path.join(repoRoot, 'boxsafe.config.json');
  let bsConfig: any = {};
  if (fs.existsSync(configPath)) {
    try {
      bsConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (err) {
      bsConfig = {};
    }
  }

  const autoPush = bsConfig.project?.versionControl?.after ?? (process.env.BOXSAFE_AUTO_PUSH === '1');
  const generateNotes = bsConfig.project?.versionControl?.generateNotes ?? (process.env.BOXSAFE_GENERATE_NOTES === '1');

  const res = await runVersionControl({ repoPath: repoRoot, autoPush, generateNotes, commitMessage: 'chore: add git versioning module (boxsafe agent)' });
  logger.info(`Version control result: ${JSON.stringify(res)}`);
}

main().catch((e) => { logger.error(`Runner error: ${e}`); process.exit(1); });
