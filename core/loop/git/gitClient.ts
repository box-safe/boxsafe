import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'node:path';
import {
  GIT_STATUS,
  GIT_ADD_ALL,
  GIT_GET_BRANCH,
  GIT_REMOTE_GET_URL,
  GIT_SHOW_COMMIT,
  gitCommitCmd,
  gitPushOriginCmd,
  gitPushSetUpstreamCmd,
  gitPushToUrlCmd,
} from './commands';

const execAsync = promisify(exec);

export async function runCommand(cmd: string, cwd?: string) {
  try {
    const res = await execAsync(cmd, { cwd, env: process.env });
    return { stdout: res.stdout?.toString() ?? '', stderr: res.stderr?.toString() ?? '', code: 0 };
  } catch (err: any) {
    return { stdout: err.stdout?.toString() ?? '', stderr: err.stderr?.toString() ?? err.message, code: err.code ?? 1 };
  }
}

export async function hasUnstagedChanges(repoPath: string) {
  const r = await runCommand(GIT_STATUS, repoPath);
  return (r.stdout || r.stderr).trim().length > 0;
}

export async function stageAll(repoPath: string) {
  return runCommand(GIT_ADD_ALL, repoPath);
}

export async function commitAll(repoPath: string, message = 'chore: alterações automáticas do agente') {
  const status = await hasUnstagedChanges(repoPath);
  if (!status) return { ok: false, reason: 'no-changes' };
  const r = await runCommand(gitCommitCmd(message), repoPath);
  return { ok: r.code === 0, out: r.stdout, err: r.stderr };
}

export async function getRemoteUrl(repoPath: string) {
  const r = await runCommand(GIT_REMOTE_GET_URL, repoPath);
  if (r.code !== 0) return null;
  return (r.stdout || '').trim();
}

export function injectTokenInHttpsUrl(remoteUrl: string, token: string) {
  if (!remoteUrl.startsWith('https://')) return null;
  // https://github.com/owner/repo.git -> https://{token}@github.com/owner/repo.git
  const withoutProto = remoteUrl.replace('https://', '');
  return `https://${encodeURIComponent(token)}@${withoutProto}`;
}

export async function pushOrigin(repoPath: string) {
  // prefer explicit branch push to allow clearer error handling upstream
  const branchRes = await runCommand(GIT_GET_BRANCH, repoPath);
  const branch = (branchRes.stdout || '').trim() || 'HEAD';
  return runCommand(gitPushOriginCmd(branch), repoPath);
}

export async function pushWithToken(remoteUrl: string, repoPath: string, token: string) {
  const injected = injectTokenInHttpsUrl(remoteUrl, token);
  if (!injected) return { code: 1, stderr: 'remote-not-https' };
  // get current branch
  const branchRes = await runCommand(GIT_GET_BRANCH, repoPath);
  const branch = (branchRes.stdout || '').trim();
  if (!branch) return { code: 1, stderr: 'could-not-detect-branch' };
  const cmd = gitPushToUrlCmd(injected, branch);
  return runCommand(cmd, repoPath);
}

export async function getCommitSummary(repoPath: string) {
  const r = await runCommand(GIT_SHOW_COMMIT, repoPath);
  if (r.code !== 0) return null;
  return r.stdout.trim();
}
