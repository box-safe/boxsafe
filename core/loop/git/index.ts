/**
 * GitHub versioning helper
 * - stages and commits changes
 * - optionally generates notes
 * - attempts push; falls back to keyring token when available
 *
 * Design goals: minimal, robust, descriptive names and clear behavior.
 */
import fs from 'node:fs';
import path from 'node:path';
import { runCommand, stageAll, commitAll, getRemoteUrl, pushOrigin, pushWithToken, getCommitSummary } from './gitClient';
import { getCredLinux } from '@core/auth/dasktop/cred/credLinux';

async function findRepoRoot(start = process.cwd()) {
  let cur = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(cur, '.git'))) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return start; // fallback
}

export interface VersionControlOptions {
  repoPath?: string;
  commitMessage?: string;
  autoPush?: boolean;
  generateNotes?: boolean;
}

export async function runVersionControl(opts: VersionControlOptions = {}) {
  const repoRoot = opts.repoPath ? path.resolve(opts.repoPath) : await findRepoRoot();
  const message = opts.commitMessage ?? 'chore: alterações automáticas do agente';

  // ensure git user config exists (if not, use EMAIL_GIT env var)
  const emailCheck = await runCommand('git config user.email', repoRoot);
  if (!emailCheck.stdout?.trim() && process.env.EMAIL_GIT) {
    await runCommand(`git config user.email "${process.env.EMAIL_GIT}"`, repoRoot);
  }

  // Stage and commit
  await stageAll(repoRoot);
  const commitResult = await commitAll(repoRoot, message);
  if (!commitResult.ok && commitResult.reason === 'no-changes') {
    return { committed: false, reason: 'no-changes' };
  }

  // Optionally generate notes
  if (opts.generateNotes || process.env.BOXSAFE_GENERATE_NOTES === '1') {
    const summary = (await getCommitSummary(repoRoot)) ?? '';
    const notesPath = path.join(repoRoot, 'BOXSAFE_VERSION_NOTES.md');
    const notes = `# BOXSAFE Versioning Notes\n\nCommit message:\n\n${message}\n\nSummary:\n\n${summary}\n`;
    try {
      fs.writeFileSync(notesPath, notes, { encoding: 'utf-8' });
      await runCommand(`git add "${notesPath}"`, repoRoot);
      await runCommand(`git commit -m "chore: add versioning notes by boxsafe agent"`, repoRoot);
    } catch (err) {
      // ignore note failures
    }
  }

  // Attempt push if requested
  if (opts.autoPush) {
    const remote = await getRemoteUrl(repoRoot);
    if (!remote) return { committed: true, pushed: false, reason: 'no-remote' };

    // try to push normally first
    const pushResp = await pushOrigin(repoRoot);
    if (pushResp.code === 0) return { committed: true, pushed: true };

    // If push failed, attempt to detect branch/upstream issues and retry with set-upstream
    const branchRes = await runCommand('git rev-parse --abbrev-ref HEAD', repoRoot);
    const branch = (branchRes.stdout || '').trim();
    const stderr = String(pushResp.stderr || '').toLowerCase();

    const needsSetUpstream = /no upstream|set upstream|no tracking information|failed to push some refs/.test(stderr) && branch;
    if (needsSetUpstream) {
      try {
        const setRes = await runCommand(`git push --set-upstream origin ${branch}`, repoRoot);
        if (setRes.code === 0) return { committed: true, pushed: true, note: 'set-upstream' };
      } catch (e) {
        // swallow and fall through to token fallback
      }
    }

    // If push failed (likely auth), try token from keyring or env
    const token = (await getCredLinux({ account: 'gh-token' })) ?? process.env.PASSWORD_GIT ?? process.env.GITHUB_TOKEN;
    if (!token) return { committed: true, pushed: false, reason: 'auth-needed', pushStdErr: pushResp.stderr };

    const tryPushWithToken = await pushWithToken(remote, repoRoot, token);
    if (tryPushWithToken.code === 0) return { committed: true, pushed: true, note: 'pushed-with-token' };
    return { committed: true, pushed: false, reason: 'push-failed', pushStdErr: String(tryPushWithToken.stderr || tryPushWithToken.stderr) };
  }

  return { committed: true, pushed: false };
}

export default { runVersionControl };
