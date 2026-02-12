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
  
  logger.info(`Initializing navigator with workspace: ${effectiveWorkspace}`);
  logger.debug(`Workspace sources - Arg: ${workspaceArg}, Config: ${configWorkspace}, CWD: ${process.cwd()}`);
  
  if (injectedNavigator) {
    logger.info('Using injected navigator');
    return { effectiveWorkspace, navigator: injectedNavigator };
  }
  
  if (!effectiveWorkspace) {
    logger.error('No workspace available for navigator');
    return { effectiveWorkspace: process.cwd(), navigator: null };
  }
  
  try {
    const navigator = createNavigator({ 
      workspace: effectiveWorkspace,
      logger: Logger.createModuleLogger('Navigator')
    });
    
    logger.info(`Navigator created successfully for workspace: ${effectiveWorkspace}`);
    return { effectiveWorkspace, navigator };
  } catch (error) {
    logger.error(`Failed to create navigator: ${error}`);
    return { effectiveWorkspace: process.cwd(), navigator: null };
  }
}
