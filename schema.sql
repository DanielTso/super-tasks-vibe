-- Super-Task Vibe: Tasks table schema (Turso / LibSQL)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date TEXT,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  tags TEXT DEFAULT '[]',
  archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_user ON tasks (project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks (tags);
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks (archived);

-- Task dependencies table (prerequisites)
CREATE TABLE IF NOT EXISTS task_dependencies (
  task_id TEXT NOT NULL,
  depends_on_task_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (task_id, depends_on_task_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_deps_task ON task_dependencies (task_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_depends_on ON task_dependencies (depends_on_task_id);
