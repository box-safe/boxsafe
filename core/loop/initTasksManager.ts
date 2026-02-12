import fs from 'node:fs';
import path from 'node:path';
import TasksManager from './tasks';
import { TASKS_STATE_DIR } from '@core/paths/paths';
import { Logger } from '@core/util/logger';

const logger = Logger.createModuleLogger('InitTasksManager');

export async function initTasksManager(boxConfig: any): Promise<TasksManager | null> {
  let tasksManager: TasksManager | null = null;
  try {
    const disableTasks = String(process.env.BOXSAFE_DISABLE_TASKS ?? '').toLowerCase();
    if (disableTasks === 'true' || disableTasks === '1' || disableTasks === 'yes') {
      logger.info(`tasks manager disabled by BOXSAFE_DISABLE_TASKS`);
      return null;
    }

    const todoCfg = boxConfig.project?.todo ? String(boxConfig.project?.todo).trim() : '';
    if (todoCfg) {
      const todoPath = path.resolve(todoCfg);
      if (fs.existsSync(todoPath) && fs.statSync(todoPath).isFile()) {
        tasksManager = new TasksManager(todoPath, TASKS_STATE_DIR);
        await tasksManager.init();
        logger.info(`loaded ${tasksManager.total()} tasks`);
      } else {
        logger.info(`todo path not found or not a file: ${todoCfg}`);
      }
    }
  } catch (error) {
    logger.warn(`failed to init tasks: ${error}`);
    tasksManager = null;
  }

  return tasksManager;
}
