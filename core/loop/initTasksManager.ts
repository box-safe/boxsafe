import fs from 'node:fs';
import path from 'node:path';
import TasksManager from './tasks';
import { TASKS_STATE_DIR } from '@core/paths/paths';

type Log = {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug?: (...args: any[]) => void;
};

type AnsiLike = { Cyan: string; Yellow: string; Reset: string };

export async function initTasksManager(boxConfig: any, log: Log, ANSI: AnsiLike): Promise<TasksManager | null> {
  let tasksManager: TasksManager | null = null;
  try {
    const todoCfg = boxConfig.project?.todo ? String(boxConfig.project?.todo).trim() : '';
    if (todoCfg) {
      const todoPath = path.resolve(todoCfg);
      if (fs.existsSync(todoPath) && fs.statSync(todoPath).isFile()) {
        tasksManager = new TasksManager(todoPath, TASKS_STATE_DIR);
        await tasksManager.init();
        log.info(`${ANSI.Cyan}[Tasks]${ANSI.Reset} loaded ${tasksManager.total()} tasks`);
      } else {
        log.info(`${ANSI.Yellow}[Tasks]${ANSI.Reset} todo path not found or not a file: ${todoCfg}`);
      }
    }
  } catch (error) {
    log.warn(`${ANSI.Yellow}[Tasks]${ANSI.Reset} failed to init tasks: ${error}`);
    tasksManager = null;
  }

  return tasksManager;
}
