import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

export class TasksManager {
  todoPath: string;
  baseDir: string;
  tasksDir: string;
  statePath: string;
  tasks: string[] = [];
  state: { current: number; done: boolean[] } = { current: 0, done: [] };

  constructor(todoPath: string, baseDir?: string) {
    this.todoPath = path.resolve(todoPath);
    this.baseDir = baseDir ? path.resolve(baseDir) : path.join(process.cwd(), 'memo', 'state', 'tasks');
    this.tasksDir = path.join(this.baseDir, 'tasks');
    this.statePath = path.join(this.baseDir, 'state.json');
  }

  async init() {
    // ensure directories
    await fs.mkdir(this.tasksDir, { recursive: true });

    // load or create tasks
    if (fsSync.existsSync(this.statePath)) {
      try {
        const raw = await fs.readFile(this.statePath, 'utf-8');
        this.state = JSON.parse(raw);
        // load tasks files if present
        const files = await fs.readdir(this.tasksDir);
        this.tasks = [];
        for (const f of files.sort()) {
          const content = await fs.readFile(path.join(this.tasksDir, f), 'utf-8');
          this.tasks.push(content);
        }
      } catch (e) {
        // fallback to re-scan todo
        await this._prepareFromTodo();
      }
    } else {
      await this._prepareFromTodo();
    }
  }

  private async _prepareFromTodo() {
    this.tasks = [];
    this.state = { current: 0, done: [] };
    if (!fsSync.existsSync(this.todoPath)) return;
    const raw = await fs.readFile(this.todoPath, 'utf-8');
    // parse simple list format: lines starting with '-' or split by double-newline
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let items: string[] = [];
    const dashItems = lines.filter((l) => l.startsWith('- ')).map((l) => l.replace(/^-\s+/, ''));
    if (dashItems.length > 0) items = dashItems;
    else items = raw.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);

    // write tasks files
    for (let i = 0; i < items.length; i++) {
      const filename = `task_${String(i+1).padStart(3,'0')}.md`;
      await fs.writeFile(path.join(this.tasksDir, filename), items[i], 'utf-8');
      this.tasks.push(items[i]);
      this.state.done.push(false);
    }

    await this._saveState();
  }

  private async _saveState() {
    await fs.writeFile(this.statePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  getCurrentTask(): string | null {
    if (this.state.current >= this.tasks.length) return null;
    return this.tasks[this.state.current] ?? null;
  }

  async markCurrentDone() {
    if (this.state.current >= this.tasks.length) return;
    this.state.done[this.state.current] = true;
    // advance to next not-done
    let idx = this.state.current + 1;
    while (idx < this.tasks.length && this.state.done[idx]) idx++;
    this.state.current = idx;
    await this._saveState();
  }

  isFinished(): boolean {
    return this.state.current >= this.tasks.length;
  }

  total(): number { return this.tasks.length; }
}

export default TasksManager;
