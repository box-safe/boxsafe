// Centralized git command templates for easy maintenance
export const GIT_STATUS = 'git status --porcelain';
export const GIT_ADD_ALL = 'git add -A';
export const GIT_GET_BRANCH = 'git rev-parse --abbrev-ref HEAD';
export const GIT_REMOTE_GET_URL = 'git remote get-url origin';
export const GIT_SHOW_COMMIT = 'git show --name-only --pretty=format:"%B" HEAD';

export const gitCommitCmd = (message: string) => `git commit -m "${String(message).replace(/"/g, '\\"')}"`;
export const gitPushOriginCmd = (branch?: string) => branch ? `git push origin ${branch}` : 'git push origin HEAD';
export const gitPushSetUpstreamCmd = (branch: string) => `git push --set-upstream origin ${branch}`;
export const gitPushToUrlCmd = (remoteUrl: string, branch: string) => `git push "${remoteUrl}" HEAD:refs/heads/${branch}`;
