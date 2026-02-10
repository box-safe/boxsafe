**Tasks module for BoxSafe — core/loop/tasks**

Overview
- The `TasksManager` provides a minimal, predictable mechanism to load a TODO file,
  split it into small tasks, persist task artifacts and a lightweight runtime state
  under `memo/state/tasks`.

Design goals
- Keep implementation tiny and synchronous-friendly (async IO only).
- Avoid complex formats: accept either `- item` lines or paragraphs separated by
  blank lines in the TODO file.
- Persist each task as `memo/state/tasks/tasks/task_###.md` and keep state in
  `memo/state/tasks/state.json` with `current` and `done[]` fields.

How it is used
- The `execLoop` integrates `TasksManager` when `boxsafe.config.json` contains
  `project.todo` pointing to a TODO file. The loop will use the current task as
  the agent prompt, and when the agent completes a task it marks it done and
  moves to the next. Only when all tasks complete does the loop perform the
  normal after-success flow (versioning, notes, etc.).

Files
- `index.ts` — exports `TasksManager` class.

Behavior summary
- `TasksManager.init()` creates `memo/state/tasks` and writes individual task
  files and `state.json` when needed.
- `getCurrentTask()` returns the current task prompt or `null` when finished.
- `markCurrentDone()` marks current task as done and advances to the next.
- `isFinished()` signals completion of all tasks.

Notes
- The module intentionally keeps parsing and behavior simple to be robust and
  easy to audit. If you want more advanced scheduling, priorities or parallel
  execution, we can extend it, but this initial version focuses on correctness
  and minimal surface area.
