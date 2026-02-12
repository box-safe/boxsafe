import { createNavigator } from '@core/navigate';
import type { Navigator } from '@core/navigate';
import { Logger } from '@core/util/logger';

const logger = Logger.createModuleLogger('InitNavigator');

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
  
  logger.debug(`Creating navigator with workspace: ${effectiveWorkspace}`);
  
  const navigator = injectedNavigator ?? (effectiveWorkspace ? createNavigator({ 
    workspace: effectiveWorkspace,
    logger: Logger.createModuleLogger('Navigator')
  }) : null);
  
  return { effectiveWorkspace, navigator };
}
