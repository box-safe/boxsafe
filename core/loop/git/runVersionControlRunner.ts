import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { runVersionControl } from './index';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(__dirname, '../../../');

  const configPath = path.join(repoRoot, 'BS.config.json');
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
  console.log('Version control result:', JSON.stringify(res));
}

main().catch((e) => { console.error('Runner error', e); process.exit(1); });
