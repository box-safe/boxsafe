import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'node:path';

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
  const r = await runCommand('git status --porcelain', repoPath);
  return (r.stdout || r.stderr).trim().length > 0;
}

export async function stageAll(repoPath: string) {
  return runCommand('git add -A', repoPath);
}

export async function commitAll(repoPath: string, message = 'chore: alterações automáticas do agente') {
  const status = await hasUnstagedChanges(repoPath);
  if (!status) return { ok: false, reason: 'no-changes' };
  const r = await runCommand(`git commit -m "${message.replace(/"/g, '\\"')}"`, repoPath);
  return { ok: r.code === 0, out: r.stdout, err: r.stderr };
}

export async function getRemoteUrl(repoPath: string) {
  const r = await runCommand('git remote get-url origin', repoPath);
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
  return runCommand('git push origin HEAD', repoPath);
}

export async function pushWithToken(remoteUrl: string, repoPath: string, token: string) {
  const injected = injectTokenInHttpsUrl(remoteUrl, token);
  if (!injected) return { code: 1, stderr: 'remote-not-https' };
  // Temporarily push using the URL with token (won't change remote config)
  return runCommand(`git push "${injected}" HEAD:refs/heads/$(git rev-parse --abbrev-ref HEAD)`, repoPath);
}

export async function getCommitSummary(repoPath: string) {
  const r = await runCommand('git show --name-only --pretty=format:"%B" HEAD', repoPath);
  if (r.code !== 0) return null;
  return r.stdout.trim();
}
