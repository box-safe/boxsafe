import { createNavigator } from '@core/navigate';
import type { Navigator } from '@core/navigate';

type InitNavigatorArgs = {
  workspaceArg?: string;
  configWorkspace?: string;
  injectedNavigator?: Navigator;
};

export function initNavigator({ workspaceArg, configWorkspace, injectedNavigator }: InitNavigatorArgs): {
  effectiveWorkspace: string;
  navigator: Navigator | null;
} {
  const effectiveWorkspace = workspaceArg ?? configWorkspace ?? process.cwd();
  const navigator = injectedNavigator ?? (effectiveWorkspace ? createNavigator({ workspace: effectiveWorkspace }) : null);
  return { effectiveWorkspace, navigator };
}
